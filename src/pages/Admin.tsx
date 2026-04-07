import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ban, Trash2, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Profile {
  id: string;
  email: string;
  created_at: string;
  user_id: string;
}

interface AdminSite {
  id: string;
  subdomain_name: string;
  raw_html: string;
  raw_css: string;
  raw_js: string;
  seo_title: string;
  is_blocked: boolean;
  user_id: string;
  created_at: string;
}

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'sites'>('sites');
  const [viewingSite, setViewingSite] = useState<AdminSite | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [loading, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  async function fetchData() {
    const [usersRes, sitesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('sites').select('*').order('created_at', { ascending: false }),
    ]);
    if (usersRes.data) setUsers(usersRes.data as Profile[]);
    if (sitesRes.data) setSites(sitesRes.data as AdminSite[]);
  }

  async function toggleBlock(site: AdminSite) {
    const { error } = await supabase
      .from('sites')
      .update({ is_blocked: !site.is_blocked })
      .eq('id', site.id);
    if (error) toast.error(error.message);
    else {
      toast.success(site.is_blocked ? 'Сайт разблокирован' : 'Сайт заблокирован');
      fetchData();
    }
  }

  async function deleteSite(id: string) {
    const { error } = await supabase.from('sites').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Сайт удалён');
      fetchData();
    }
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Назад
          </Button>
          <h1 className="text-lg font-semibold">Админ-панель</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-0 border-b border-border mb-6">
          {(['sites', 'users'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'sites' ? `Сайты (${sites.length})` : `Пользователи (${users.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'sites' && (
          <div className="space-y-3">
            {sites.map((site) => (
              <div key={site.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-medium">
                    {site.subdomain_name}<span className="text-muted-foreground">.alfacomp.uz</span>
                    {site.is_blocked && <span className="ml-2 text-xs text-destructive font-sans">[BLOCKED]</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {site.seo_title || 'Без названия'} · {new Date(site.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setViewingSite(site)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleBlock(site)}>
                    <Ban className={`w-4 h-4 ${site.is_blocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteSite(site.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm font-medium">{u.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Регистрация: {new Date(u.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!viewingSite} onOpenChange={() => setViewingSite(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">{viewingSite?.subdomain_name}.alfacomp.uz</DialogTitle>
          </DialogHeader>
          {viewingSite && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">HTML</h4>
                <pre className="bg-secondary rounded-md p-3 text-xs font-mono overflow-auto max-h-40">{viewingSite.raw_html || '—'}</pre>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">CSS</h4>
                <pre className="bg-secondary rounded-md p-3 text-xs font-mono overflow-auto max-h-40">{viewingSite.raw_css || '—'}</pre>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">JS</h4>
                <pre className="bg-secondary rounded-md p-3 text-xs font-mono overflow-auto max-h-40">{viewingSite.raw_js || '—'}</pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
