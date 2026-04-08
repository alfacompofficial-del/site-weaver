import { useParams } from 'react-router-dom';
import SubdomainSite from './SubdomainSite';

export default function SubdomainSiteRoute() {
  const { subdomain } = useParams<{ subdomain: string }>();
  if (!subdomain) return null;
  return <SubdomainSite subdomain={subdomain} />;
}
