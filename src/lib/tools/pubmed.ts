export async function lookupPubmed(pmid: string) {
  const response = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`,
  );
  if (!response.ok) throw new Error("NCBI E-utilities request failed.");
  return response.json();
}
