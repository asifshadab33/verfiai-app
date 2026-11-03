import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import FallacySpotter from '@/components/verifai/tools/FallacySpotter';
export const Route = createFileRoute('/tools/fallacy-spotter')({
  component: () => (<ToolPage title="Logical Fallacy Spotter" description="Identify common logical fallacies and weak argument patterns in text."><FallacySpotter /></ToolPage>),
});
