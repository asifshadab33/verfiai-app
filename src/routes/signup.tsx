import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/verifai/AuthPage";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [
    { title: "Create an account | Verfiai" },
    { name: "description", content: "Create your Verfiai account with email, Microsoft or Lovable to save research and access your private dashboard." },
    { property: "og:title", content: "Create an account | Verfiai" },
    { property: "og:description", content: "Join Verfiai with email, Microsoft or Lovable." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex,nofollow" },
  ] }),
  component: SignUpPage,
});

function SignUpPage() {
  return <AuthPage initialMode="up" />;
}
