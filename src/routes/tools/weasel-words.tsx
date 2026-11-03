import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import WeaselWords from '@/components/verifai/tools/WeaselWords';
export const Route = createFileRoute('/tools/weasel-words')({
  component: () => (<ToolPage title="Weasel Word Detector" description="Highlight vague phrases like 'studies show' or 'experts agree' safely in your browser."><WeaselWords /></ToolPage>),
});
