import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { toolHead } from "@/lib/tools/tool-head";

const tools = [
  {
    name: "OpenAI Whisper demo on Hugging Face",
    url: "https://huggingface.co/spaces/openai/whisper",
    detail:
      "A hosted speech-recognition demo. It may have queues or usage limits; review its upload handling before sharing sensitive media.",
  },
  {
    name: "whisperai.dev local transcription",
    url: "https://whisperai.dev/youtube-to-text",
    detail:
      "Offers a local transcription workflow. Browser and device resources constrain processing; verify the current privacy and availability details.",
  },
  {
    name: "whisperweb.dev local mode",
    url: "https://whisperweb.dev/youtube-to-text",
    detail:
      "Provides a browser-based local mode. Large videos may be slow or exceed device memory.",
  },
  {
    name: "transcribe.panchamkhaitan.com",
    url: "https://transcribe.panchamkhaitan.com/",
    detail:
      "A third-party transcription interface. Check current file limits and processing practices before use.",
  },
  {
    name: "youtube-transcript.ai",
    url: "https://youtube-transcript.ai/",
    detail:
      "A transcript lookup service for supported YouTube videos. Availability and coverage depend on the video and the provider.",
  },
];

export const Route = createFileRoute("/video-research")({
  head: () =>
    toolHead({
      path: "/video-research",
      name: "Video Research",
      title: "Video Research Guide | Verfiai",
      description:
        "Practical steps and third-party tools for researching a video, checking its transcript, and finding its original source.",
    }),
  component: Page,
});

function Page() {
  return (
    <ContentPage
      title="Video Research"
      intro="Use a transcript as a starting point, not proof. Verify statements against the recording and trace the video back to its publisher and earliest available upload."
    >
      <PageSection title="A careful video-checking workflow">
        <ol className="list-inside list-decimal space-y-3">
          <li>Get a transcript, and note the timecodes for statements you may quote.</li>
          <li>
            Replay each quote in the original video. Check surrounding context, edits, and whether
            the speaker is clearly identified.
          </li>
          <li>
            Check who published the video and whether the account represents the person or
            organization it claims to represent.
          </li>
          <li>
            Search for the earliest upload or an original recording. Compare dates, captions, and
            edits across copies.
          </li>
          <li>
            Keep the original URL and timestamp with your notes; transcripts can contain recognition
            errors.
          </li>
        </ol>
      </PageSection>
      <PageSection title="Free external tools">
        <ul className="space-y-4">
          {tools.map((tool) => (
            <li key={tool.url} className="rounded-lg border p-4">
              <a
                className="font-semibold text-brand underline"
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tool.name}
              </a>
              <p className="mt-1 text-sm text-muted-foreground">{tool.detail}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                External tool — opens in a new tab, not affiliated with Verfiai
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          These are third-party sites; review their policies before uploading.
        </p>
      </PageSection>
      <p className="mt-6">
        Got a transcript?{" "}
        <Link className="text-brand underline" to="/tools/transcript-translator">
          Translate it with our free Transcript Translator
        </Link>
        .
      </p>
    </ContentPage>
  );
}
