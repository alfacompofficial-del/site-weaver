import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteData {
  raw_html: string;
  raw_css: string;
  raw_js: string;
  seo_title: string;
  seo_description: string;
  seo_favicon_url: string;
  is_blocked: boolean;
}

export default function SubdomainSite({ subdomain }: { subdomain: string }) {
  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchSite() {
      const { data, error } = await supabase
        .from('sites')
        .select('raw_html, raw_css, raw_js, seo_title, seo_description, seo_favicon_url, is_blocked')
        .eq('subdomain_name', subdomain)
        .eq('is_blocked', false)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setSite(data as SiteData);
        // Set SEO
        if (data.seo_title) document.title = data.seo_title;
        if (data.seo_description) {
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', data.seo_description);
        }
        if (data.seo_favicon_url) {
          let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.seo_favicon_url;
        }
      }
      setLoading(false);
    }
    fetchSite();
  }, [subdomain]);

  if (loading) {
    return (
      <div style={{ background: '#000', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui' }}>
        Загрузка...
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 700, margin: 0 }}>404</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Сайт не найден</p>
      </div>
    );
  }

  const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${site!.seo_title ? `<title>${site!.seo_title}</title>` : ''}
  ${site!.seo_description ? `<meta name="description" content="${site!.seo_description}">` : ''}
  <style>${site!.raw_css}</style>
</head>
<body>
  ${site!.raw_html}
  <script>${site!.raw_js}<\/script>
</body>
</html>`;

  return (
    <iframe
      srcDoc={fullHtml}
      style={{ width: '100vw', height: '100vh', border: 'none' }}
      sandbox="allow-scripts allow-same-origin"
      title={site!.seo_title || subdomain}
    />
  );
}
