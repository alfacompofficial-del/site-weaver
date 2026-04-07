import { useMemo } from 'react';
import SubdomainSite from './SubdomainSite';
import Landing from './Landing';

export default function Index() {
  const hostname = window.location.hostname;

  const subdomain = useMemo(() => {
    // Check for subdomain pattern: xxx.alfacomp.uz
    // Also handle dev: xxx.localhost, xxx.*.lovable.app etc.
    const parts = hostname.split('.');

    // In production: test.alfacomp.uz → parts = ['test', 'alfacomp', 'uz']
    if (parts.length >= 3 && parts[parts.length - 2] === 'alfacomp' && parts[parts.length - 1] === 'uz') {
      return parts[0];
    }

    // In dev/preview on lovable: if query param ?subdomain=xxx
    const params = new URLSearchParams(window.location.search);
    return params.get('subdomain');
  }, [hostname]);

  if (subdomain) {
    return <SubdomainSite subdomain={subdomain} />;
  }

  return <Landing />;
}
