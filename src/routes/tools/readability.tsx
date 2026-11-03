import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import ReadabilityScorer from '@/components/verifai/tools/ReadabilityScorer';
export const Route = createFileRoute('/tools/readability')({
  component: () => (<ToolPage title="Readability Scorer" description="Calculate Flesch-Kincaid grade level and reading difficulty of your text."><ReadabilityScorer /></ToolPage>),
});
