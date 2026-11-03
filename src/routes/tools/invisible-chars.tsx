import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import InvisibleChars from '@/components/verifai/tools/InvisibleChars';
export const Route = createFileRoute('/tools/invisible-chars')({
  component: () => (<ToolPage title="Invisible Character Detector" description="Find zero-width spaces, homoglyphs, and hidden Unicode characters in text."><InvisibleChars /></ToolPage>),
});
