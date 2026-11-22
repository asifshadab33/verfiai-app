import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/verifai/AuthPage";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex,nofollow" },
      { title: "Sign in | Verfiai" },
      {
        name: "description",
        content:
          "Sign in to Verfiai with Google, Microsoft, Lovable or email to generate and save AI research reports.",
      },
      { property: "og:title", content: "Sign in | Verfiai" },
      { property: "og:description", content: "Sign in to generate and save AI research reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

