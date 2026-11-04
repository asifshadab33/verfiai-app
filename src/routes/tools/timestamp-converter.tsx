import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import TimestampConverter from "@/components/verifai/tools/TimestampConverter";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/timestamp-converter")({
  head: () => toolHeadForPath("/tools/timestamp-converter"),
  component: () => (
    <ToolPage
      title="Timestamp Converter"
      description="Convert between Unix timestamps and human-readable dates."
    >
      <TimestampConverter />
    </ToolPage>
  ),
});
