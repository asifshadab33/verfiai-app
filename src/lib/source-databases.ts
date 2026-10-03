export type Profession = 'journalism' | 'legal' | 'equity' | 'compliance' | 'academic';
export type Reliability = 'High Verification Anchor' | 'Dynamic Coverage' | 'Volatile Log Matrix';
export interface SystemSourceNode {
  id: string;
  name: string;
  profession: Profession;
  region: string;
  accessMethod: string;
  coreUtility: string;
  reliabilityVerdict: Reliability;
  targetUrl: string;
  decadalEvolution: string;
}

// Supplied catalog descriptions and ratings; these are not live verification results.
export const SOURCE_DATABASES: SystemSourceNode[] = [
  { id: '1', name: 'ICIJ Offshore Leaks Database', profession: 'journalism', region: 'Global', accessMethod: 'Query Portal / CSV Data', coreUtility: 'Tracking cross-border shell corporations, hidden offshore tax shelters, and leaked political financial net-worth matrices.', reliabilityVerdict: 'High Verification Anchor', targetUrl: 'https://icij.org', decadalEvolution: 'Transitioned from plain unstructured string lookups to interactive graphic node entity maps via Neo4j pipelines.' },
  { id: '2', name: 'FOIA.gov Official Portal', profession: 'journalism', region: 'United States', accessMethod: 'REST API & Request Logs', coreUtility: 'Central logging, cross-agency discovery, and public data transparency tracking for investigative reports.', reliabilityVerdict: 'Dynamic Coverage', targetUrl: 'https://foia.gov', decadalEvolution: 'Unified distinct federal agencies under automated endpoints to help track massive system processing backlogs.' },
  { id: '3', name: 'OpenCorporates', profession: 'legal', region: 'Global', accessMethod: 'Public API / Web Engine', coreUtility: "The world's largest open database of legal corporate entity histories, officer records, and systemic corporate structural lines.", reliabilityVerdict: 'High Verification Anchor', targetUrl: 'https://opencorporates.com', decadalEvolution: 'Pivoted heavily to ultimate beneficial ownership (UBO) algorithmic matching models.' },
  { id: '4', name: 'PACER Court Records Lookup', profession: 'legal', region: 'United States', accessMethod: 'Dockets Matrix System', coreUtility: 'Retrieving federal court dockets, legal complaints, civil/criminal case histories, and official judicial opinions.', reliabilityVerdict: 'High Verification Anchor', targetUrl: 'https://uscourts.gov', decadalEvolution: 'Replaced archaic terminal screen-scraping logic scripts with modern, high-throughput developer API endpoints.' },
  { id: '5', name: 'SEC EDGAR System', profession: 'equity', region: 'Global / US', accessMethod: 'Structured XBRL API', coreUtility: 'Extracting live corporate financial disclosures (10-K, 10-Q, 8-K), balance sheets, and material events logs.', reliabilityVerdict: 'High Verification Anchor', targetUrl: 'https://sec.gov', decadalEvolution: 'Enforced full mandatory inline XBRL styling, rendering structural accounting elements machine-readable.' },
  { id: '6', name: 'FRED (St. Louis Fed)', profession: 'equity', region: 'Global / US', accessMethod: 'Developer API / Custom Widgets', coreUtility: 'Tracking multi-decade macroeconomic timelines, inflation indices, employment matrices, and global trade flows.', reliabilityVerdict: 'High Verification Anchor', targetUrl: 'https://stlouisfed.org', decadalEvolution: 'Expanded programmatic access parameters to deliver clean arrays straight into data science dataframes.' },
  { id: '7', name: 'OpenSanctions', profession: 'compliance', region: 'Global', accessMethod: 'Daily JSON / Bulk Streams', coreUtility: 'Cross-checking global Politically Exposed Persons (PEPs) records and consolidated multi-nation sanctions rosters.', reliabilityVerdict: 'High Verification Anchor', targetUrl: 'https://opensanctions.org', decadalEvolution: 'Emerged as the primary decentralized index to combat regional database fragmentation caused by fast-moving global trade restrictions.' },
  { id: '8', name: 'CORE Global Research', profession: 'academic', region: 'Global', accessMethod: 'OAI API / Bulk Text Array', coreUtility: 'Aggregating hundreds of millions of peer-reviewed open-access journal articles and scientific metadata frameworks.', reliabilityVerdict: 'Dynamic Coverage', targetUrl: 'https://core.ac.uk', decadalEvolution: 'Became a principal open-access textual training corpus for building specialized academic deep-reasoning engines.' },
];