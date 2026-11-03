import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/lib/translations";
import { siteText } from "@/lib/site-i18n";
type TextKey = Parameters<typeof siteText>[1];

export function SampleReportDialog({ label, lang }: { label: string; lang: Lang }) {
  const tx = (key: TextKey) => siteText(lang, key);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="h-12">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{tx("sampleDialogTitle")}</DialogTitle>
          <DialogDescription>{tx("sampleDialogNote")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-6">
          <p className="text-xs font-bold uppercase text-brand">{tx("sampleQuestion")}</p>
          <div>
            <h3 className="font-semibold">{tx("execSummary")}</h3>
            <p className="text-muted-foreground">{tx("sampleSummaryText")}</p>
          </div>
          <div>
            <h3 className="font-semibold">{tx("sampleAssessments")}</h3>
            <ul className="mt-2 space-y-2">
              <li className="border-s-4 border-l-warning ps-3">
                <span className="text-xs font-bold">{tx("verdictMixed")}</span>
                <p>{tx("sampleMixed")}</p>
              </li>
              <li className="border-s-4 border-l-muted-foreground ps-3">
                <span className="text-xs font-bold">{tx("verdictInsufficient")}</span>
                <p>{tx("sampleInsufficient")}</p>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">{tx("limitations")}</h3>
            <p className="text-muted-foreground">{tx("sampleLimitText")}</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to="/sample-report">{tx("sampleOpen")}</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
