import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import RandomPicker from "@/components/verifai/tools/RandomPicker";
export const Route = createFileRoute("/tools/random-picker")({
  component: () => (
    <ToolPage
      title="Random Picker & Shuffler"
      description="Securely pick random items or shuffle a list using WebCrypto."
    >
      <RandomPicker />
    </ToolPage>
  ),
});
