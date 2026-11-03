import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import NumbersCheck from '@/components/verifai/tools/NumbersCheck';
export const Route = createFileRoute('/tools/numbers-check')({
  component: () => (<ToolPage title="Numbers-in-News Checker" description="Check for statistical anomalies like percentages not summing to 100 or missing base numbers."><NumbersCheck /></ToolPage>),
});
