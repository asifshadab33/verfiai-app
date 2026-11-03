import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import CharacterCounter from "@/components/verifai/tools/CharacterCounter";
export const Route = createFileRoute("/tools/character-counter")({
  component: () => (
    <ToolPage
      title="Character Counter"
      description="Count characters, words, and lines with platform limits."
    >
      <CharacterCounter />
    </ToolPage>
  ),
});
