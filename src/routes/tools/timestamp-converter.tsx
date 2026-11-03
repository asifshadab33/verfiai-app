import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import TimestampConverter from "@/components/verifai/tools/TimestampConverter";
export const Route = createFileRoute("/tools/timestamp-converter")({
  component: () => (
    <ToolPage
      title="Timestamp Converter"
      description="Convert between Unix timestamps and human-readable dates."
    >
      <TimestampConverter />
    </ToolPage>
  ),
});
