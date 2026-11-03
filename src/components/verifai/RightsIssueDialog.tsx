import { useId, useState } from "react";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const RIGHTS_EMAIL = "hello@verfiai.app";

/** Copyright / DMCA concern form. Composes an email in the user's own mail app; nothing is stored by Verfiai. */
export function RightsIssueDialog({
  reportTitle,
  reportUrl,
}: {
  reportTitle: string;
  reportUrl?: string | undefined;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", email: "", work: "", location: "", details: "" });
  const [goodFaith, setGoodFaith] = useState(false);
  const [accurate, setAccurate] = useState(false);
  const valid =
    f.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) &&
    f.work.trim() &&
    goodFaith &&
    accurate;
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((v) => ({ ...v, [k]: e.target.value }));
  function submit() {
    const body = [
      `Report: ${reportTitle}`,
      reportUrl ? `Report link: ${reportUrl}` : "",
      "",
      `Name: ${f.name}`,
      `Contact email: ${f.email}`,
      `Copyrighted work: ${f.work}`,
      `Where it appears in the report: ${f.location}`,
      "",
      f.details,
      "",
      "I have a good-faith belief that the use described is not authorised by the copyright owner, its agent, or the law.",
      "The information in this notice is accurate, and I am the owner or authorised to act on the owner's behalf.",
    ]
      .filter((l, i) => l || i > 1)
      .join("\n");
    window.location.href = `mailto:${RIGHTS_EMAIL}?subject=${encodeURIComponent("Verfiai rights issue (copyright/DMCA)")}&body=${encodeURIComponent(body)}`;
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="h-auto min-h-11 px-0 text-xs">
          <Scale className="size-3.5" />
          Report a rights issue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report a rights issue</DialogTitle>
          <DialogDescription>
            For copyright or DMCA concerns about material in this report. Sending opens your email
            app with a pre-filled message to {RIGHTS_EMAIL}; Verfiai does not store this form.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <label className="block font-medium" htmlFor={`${id}-n`}>
            Your full name
          </label>
          <Input id={`${id}-n`} value={f.name} onChange={set("name")} maxLength={120} dir="auto" />
          <label className="block font-medium" htmlFor={`${id}-e`}>
            Contact email
          </label>
          <Input
            id={`${id}-e`}
            type="email"
            value={f.email}
            onChange={set("email")}
            maxLength={254}
            dir="ltr"
          />
          <label className="block font-medium" htmlFor={`${id}-w`}>
            Copyrighted work (title or link to the original)
          </label>
          <Input id={`${id}-w`} value={f.work} onChange={set("work")} maxLength={300} dir="auto" />
          <label className="block font-medium" htmlFor={`${id}-l`}>
            Where it appears in this report
          </label>
          <Input
            id={`${id}-l`}
            value={f.location}
            onChange={set("location")}
            maxLength={300}
            placeholder="e.g. Sources, item 3 excerpt"
            dir="auto"
          />
          <label className="block font-medium" htmlFor={`${id}-d`}>
            Details (optional)
          </label>
          <Textarea
            id={`${id}-d`}
            value={f.details}
            onChange={set("details")}
            maxLength={2000}
            dir="auto"
          />
          <div className="flex items-start gap-3">
            <Checkbox
              id={`${id}-g`}
              checked={goodFaith}
              onCheckedChange={(v) => setGoodFaith(v === true)}
            />
            <label htmlFor={`${id}-g`} className="text-xs leading-5 text-muted-foreground">
              I have a good-faith belief this use is not authorised by the copyright owner, its
              agent, or the law.
            </label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id={`${id}-a`}
              checked={accurate}
              onCheckedChange={(v) => setAccurate(v === true)}
            />
            <label htmlFor={`${id}-a`} className="text-xs leading-5 text-muted-foreground">
              This information is accurate and I am the owner or authorised to act for the owner.
            </label>
          </div>
          <Button onClick={submit} disabled={!valid} className="w-full">
            Open email to send notice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
