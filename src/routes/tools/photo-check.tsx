import { createFileRoute } from "@tanstack/react-router";
import { PhotoCheck } from "@/components/verifai/tools/PhotoCheck";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = { path: "/tools/photo-check", name: "Photo Check", title: "Photo Check: View Photo Metadata and Reverse Image Search | Verfiai", description: "See what metadata a photo file carries and open reverse image searches in Google Lens, Bing, Yandex and TinEye. Photos are read in your browser and never uploaded." };

export const Route = createFileRoute("/tools/photo-check")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return <ToolPage
    title="Photo Check"
    intro="See what metadata a photo file carries, and open reverse image searches to find where else a picture appears."
    privacy="Photos are read in your browser and are never uploaded. Reverse-search links open only when you click them, and send that search engine the image address you entered."
    notes={[
        { title: "Metadata is a clue, not proof", body: "Photo metadata can be edited, copied from another file or removed. Social networks and messaging apps usually strip it, so a missing date or location says nothing about a photo, and present metadata does not prove when or where a picture was taken." },
        { title: "Reverse image search", body: "Matches show where an image has appeared before, which can reveal an older original. No matches does not mean an image is new." },
        { title: "Privacy tip", body: "Phone photos often include GPS location. Use the metadata-free copy before sharing a photo publicly." },
    ]}
  >
    <PhotoCheck />
  </ToolPage>;
}
