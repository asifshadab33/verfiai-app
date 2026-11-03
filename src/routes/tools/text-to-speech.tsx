import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import TextToSpeech from "@/components/verifai/tools/TextToSpeech";
export const Route = createFileRoute("/tools/text-to-speech")({
  component: () => (
    <ToolPage
      title="Text-to-Speech Reader"
      description="Listen to any text using your browser's built-in speech synthesis."
    >
      <TextToSpeech />
    </ToolPage>
  ),
});
