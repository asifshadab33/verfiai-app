import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import Pomodoro from "@/components/verifai/tools/Pomodoro";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/pomodoro")({
  head: () => toolHeadForPath("/tools/pomodoro"),
  component: () => (
    <ToolPage
      title="Pomodoro Timer"
      description="Stay focused with a built-in 25/5 minute work-break timer."
    >
      <Pomodoro />
    </ToolPage>
  ),
});
