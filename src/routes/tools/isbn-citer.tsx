import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import IsbnCiter from "@/components/verifai/tools/IsbnCiter";
export const Route = createFileRoute("/tools/isbn-citer")({
  component: () => (
    <ToolPage
      title="ISBN Book Citer"
      description="Look up book metadata and generate citations via OpenLibrary."
    >
      <IsbnCiter />
    </ToolPage>
  ),
});
