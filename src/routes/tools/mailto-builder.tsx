import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import MailtoBuilder from '@/components/verifai/tools/MailtoBuilder';
export const Route = createFileRoute('/tools/mailto-builder')({
  component: () => (<ToolPage title="Mailto Link Builder" description="Generate encoded mailto: links with pre-filled subjects and bodies."><MailtoBuilder /></ToolPage>),
});
