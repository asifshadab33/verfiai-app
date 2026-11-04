import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import QrCode from "@/components/verifai/tools/QrCode";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/qr-code")({
  head: () => toolHeadForPath("/tools/qr-code"),
  component: () => (
    <ToolPage
      title="QR Code Generator"
      description="Generate and download free QR codes for any URL or text instantly."
    >
      <QrCode />
    </ToolPage>
  ),
});
