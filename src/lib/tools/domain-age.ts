export async function checkDomainAge(domain: string) {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const response = await fetch(`https://rdap.db.ripe.net/domain/${cleanDomain}`);
  if (!response.ok) throw new Error('RDAP query failed or domain not found.');
  return response.json();
}
