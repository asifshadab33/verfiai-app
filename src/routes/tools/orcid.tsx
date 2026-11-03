import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import OrcidLookup from '@/components/verifai/tools/OrcidLookup';
export const Route = createFileRoute('/tools/orcid')({ component: () => (<ToolPage title="ORCID Author Lookup" description="Find researcher names and profiles by ORCID ID. (Skipped if CORS-blocked)."><OrcidLookup /></ToolPage>), });
