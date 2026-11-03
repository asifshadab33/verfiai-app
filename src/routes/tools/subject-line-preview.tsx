import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import SubjectLinePreview from '@/components/verifai/tools/SubjectLinePreview';
export const Route = createFileRoute('/tools/subject-line-preview')({
  component: () => (<ToolPage title="Subject Line Preview" description="Preview how your email subject line looks and check inbox cutoff limits."><SubjectLinePreview /></ToolPage>),
});
