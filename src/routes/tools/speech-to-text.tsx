import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import SpeechToText from '@/components/verifai/tools/SpeechToText';
export const Route = createFileRoute('/tools/speech-to-text')({
  component: () => (<ToolPage title="Speech-to-Text Dictation" description="Convert your voice to text directly in the browser using the Web Speech API."><SpeechToText /></ToolPage>),
});
