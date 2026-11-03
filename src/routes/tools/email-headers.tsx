import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import EmailHeaders from '@/components/verifai/tools/EmailHeaders';
export const Route = createFileRoute('/tools/email-headers')({
  component: () => (<ToolPage title="Email Header Analyzer" description="Parse raw email headers to check SPF, DKIM, DMARC and trace the routing path."><EmailHeaders /></ToolPage>),
});
