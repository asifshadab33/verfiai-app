import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import DisposableEmail from '@/components/verifai/tools/DisposableEmail';
export const Route = createFileRoute('/tools/disposable-email')({
  component: () => (<ToolPage title="Disposable Email Checker" description="Check if an email address uses a known temporary or disposable domain."><DisposableEmail /></ToolPage>),
});
