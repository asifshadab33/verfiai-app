import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import SentenceRhythm from '@/components/verifai/tools/SentenceRhythm';
export const Route = createFileRoute('/tools/sentence-rhythm')({ component: () => (<ToolPage title="Sentence Rhythm Analyzer" description="Check sentence length variance and flag overly long sentences."><SentenceRhythm /></ToolPage>), });
