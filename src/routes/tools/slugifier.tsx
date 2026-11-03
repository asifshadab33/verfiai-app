import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import Slugifier from '@/components/verifai/tools/Slugifier';
export const Route = createFileRoute('/tools/slugifier')({
  component: () => (<ToolPage title="Slug & URL Encoder" description="Generate clean URL slugs and encode/decode URL strings."><Slugifier /></ToolPage>),
});
