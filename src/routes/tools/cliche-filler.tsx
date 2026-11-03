import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import ClicheFiller from '@/components/verifai/tools/ClicheFiller';
export const Route = createFileRoute('/tools/cliche-filler')({ component: () => (<ToolPage title="Cliché & Filler Detector" description="Identify weak filler words and clichés to strengthen your writing."><ClicheFiller /></ToolPage>), });
