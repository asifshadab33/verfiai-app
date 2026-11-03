import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import QuoteCard from "@/components/verifai/tools/QuoteCard";
export const Route = createFileRoute("/tools/quote-card")({
  component: () => (
    <ToolPage
      title="Quote Card Generator"
      description="Create and download shareable quote images using HTML Canvas."
    >
      <QuoteCard />
    </ToolPage>
  ),
});
