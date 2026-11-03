import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import SimilarityChecker from '@/components/verifai/tools/SimilarityChecker';
export const Route = createFileRoute('/tools/similarity')({
  component: () => (<ToolPage title="Two-Text Similarity Checker" description="Calculate word overlap percentage between two texts (not a plagiarism checker)."><SimilarityChecker /></ToolPage>),
});
