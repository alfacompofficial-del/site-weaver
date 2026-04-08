import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, LogOut, Shield } from 'lucide-react';
import FileUploadZone from '@/components/FileUploadZone';

interface Site {
  id: string;
  subdomain_name: string;
  raw_html: string;
  raw_css: string;
  raw_js: string;
  seo_title: string;
  seo_description: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [subdomain, setSubdomain] = useState('');
  const [files, setFiles] = useState({ html: '', css: '', js: '' });
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  async function fetchSites() {
    const { data } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) setSites(data as Site[]);
  }

  async function handlePublish() {
    if (!subdomain.match(/^[a-z0-9-]+$/)) {
      toast.error('Поддомен может содержать только строчные буквы, цифры и дефисы');
      return;
    }

    if (!files.html && !files.css && !files.js) {
      toast.error('Загрузите хотя бы один файл');
      return;
    }

    setLoading(true);

    const payload = {
      subdomain_name: subdomain,
      raw_html: files.html,
      raw_css: files.css,
      raw_js: files.js,
      seo_title: seoTitle,
      seo_description: seoDescription,
    };

    if (editingId) {
      const { error } = await supabase
        .from('sites')
        .update(payload)
        .eq('id', editingId);

      if (error) {
        toast.error(error.message.includes('unique') ? 'Этот поддомен уже занят' : error.message);
      } else {
        toast.success('Сайт обновлён!');
        resetForm();
        fetchSites();
      }
    } else {
      const { error } = await supabase.from('sites').insert({
        user_id: user!.id,
        ...payload,
      });

      if (error) {
        toast.error(error.message.includes('unique') ? 'Этот поддомен уже занят' : error.message);
      } else {
        toast.success(`Опубликовано на ${subdomain}.alfacomp.uz`);
        resetForm();
        fetchSites();
      }
    }
    setLoading(false);
  }

  function resetForm() {
    setSubdomain('');
    setFiles({ html: '', css: '', js: '' });
    setSeoTitle('');
    setSeoDescription('');
    setEditingId(null);
  }

  function editSite(site: Site) {
    setEditingId(site.id);
    setSubdomain(site.subdomain_name);
    setFiles({ html: site.raw_html, css: site.raw_css, js: site.raw_js });
    setSeoTitle(site.seo_title);
    setSeoDescription(site.seo_description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteSite(id: string) {
    const { error } = await supabase.from('sites').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Сайт удалён');
      fetchSites();
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            alfa<span className="text-primary">comp</span>.uz
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                <Shield className="w-4 h-4 mr-1" /> Админ
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Редактировать сайт' : 'Создать сайт'}
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Поддомен</label>
              <div className="flex items-center gap-2">
                <Input
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                  placeholder="my-site"
                  className="bg-secondary border-border font-mono"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.alfacomp.uz</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">SEO Title</label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Название страницы"
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">SEO Description</label>
                <Input
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Описание страницы"
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Файлы сайта</label>
              <FileUploadZone onFilesLoaded={setFiles} currentFiles={files} />
            </div>

            <div className="flex gap-3">
              <Button onClick={handlePublish} disabled={loading || !subdomain}>
                {loading ? 'Публикация...' : editingId ? 'Сохранить' : 'Опубликовать'}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Мои сайты</h2>
          {sites.length === 0 ? (
            <p className="text-muted-foreground text-sm">У вас пока нет сайтов</p>
          ) : (
            <div className="grid gap-3">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono text-sm font-medium">
                      {site.subdomain_name}<span className="text-muted-foreground">.alfacomp.uz</span>
                    </p>
                    {site.seo_title && (
                      <p className="text-xs text-muted-foreground mt-1">{site.seo_title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => window.open(`https://${site.subdomain_name}.alfacomp.uz`, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editSite(site)}>
                      Редактировать
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteSite(site.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
