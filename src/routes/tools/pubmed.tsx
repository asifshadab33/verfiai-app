import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import PubmedLookup from '@/components/verifai/tools/PubmedLookup';
export const Route = createFileRoute('/tools/pubmed')({
  component: () => (<ToolPage title="PubMed Lookup" description="Search NCBI PubMed database by PMID for medical and life sciences research."><PubmedLookup /></ToolPage>),
});
