import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { siteText } from "@/lib/site-i18n";
import { isLang } from "@/lib/translations";
import { toolHead } from "@/lib/tools/tool-head";

type CuratedTool = { name: string; url: string; detail: string };

const categories: { key: string; tools: CuratedTool[] }[] = [
  {
    key: "executiveToolsEmail",
    tools: [
      { name: "Brevo", url: "https://www.brevo.com/", detail: "Campaign email, contact management and automation for small teams and operators coordinating customer outreach." },
      { name: "Mailchimp", url: "https://mailchimp.com/", detail: "Email campaign creation and audience management for marketing teams running newsletters and customer communications." },
      { name: "MailerLite", url: "https://www.mailerlite.com/", detail: "Newsletter and email campaign workflows for founders, creators and lean marketing teams." },
      { name: "HubSpot Marketing Hub", url: "https://www.hubspot.com/products/marketing", detail: "Email marketing connected with CRM records for teams coordinating campaigns and customer relationships." },
      { name: "Sender", url: "https://www.sender.net/", detail: "Email campaign and automation tools for small businesses managing subscriber communications." },
    ],
  },
  {
    key: "executiveToolsIntelligence",
    tools: [
      { name: "OpenCorporates", url: "https://opencorporates.com/", detail: "Search company registry records across jurisdictions; useful for analysts checking corporate identities and legal entities." },
      { name: "SEC EDGAR", url: "https://www.sec.gov/edgar/search/", detail: "Search US public-company filings, disclosures and financial reports; useful for investors, executives and due-diligence teams." },
      { name: "Companies House", url: "https://find-and-update.company-information.service.gov.uk/", detail: "Look up UK company filings, officers and accounts; useful for checking counterparties and researching UK businesses." },
      { name: "World Bank Data", url: "https://data.worldbank.org/", detail: "Explore country-level economic and development indicators for strategy teams comparing markets and operating environments." },
      { name: "OECD Data Explorer", url: "https://data-explorer.oecd.org/", detail: "Explore comparable economic, social and policy datasets for executives assessing countries, sectors and long-term trends." },
    ],
  },
  {
    key: "executiveToolsMedia",
    tools: [
      { name: "Google News", url: "https://news.google.com/", detail: "Monitor coverage across publishers by company, person, sector or topic; useful for quick situational awareness." },
      { name: "GDELT Project", url: "https://www.gdeltproject.org/", detail: "Explore global news coverage and event data for researchers and risk teams tracking narratives across countries." },
      { name: "Media Cloud", url: "https://mediacloud.org/", detail: "Study media coverage and compare how stories spread across outlets; useful for communications and public-interest research." },
      { name: "Talkwalker Alerts", url: "https://www.talkwalker.com/alerts", detail: "Set up alerts for mentions of brands, people and topics; useful for communications teams watching public coverage." },
      { name: "Feedly", url: "https://feedly.com/", detail: "Bring publisher feeds and industry sources into one reading workspace for leaders who follow many information sources." },
    ],
  },
  {
    key: "executiveToolsDocuments",
    tools: [
      { name: "Google Docs", url: "https://docs.google.com/", detail: "Create and collaborate on briefs, proposals and working documents; useful for distributed teams reviewing shared drafts." },
      { name: "LibreOffice", url: "https://www.libreoffice.org/", detail: "Work with office documents, spreadsheets and presentations in a desktop suite for teams preferring local files." },
      { name: "Canva", url: "https://www.canva.com/", detail: "Build presentations, one-page reports and visual documents for managers preparing stakeholder-ready materials." },
      { name: "PDF24 Tools", url: "https://tools.pdf24.org/", detail: "Handle common PDF tasks such as merging, splitting and converting documents; useful for operations and admin workflows." },
      { name: "Adobe Acrobat online", url: "https://www.adobe.com/acrobat/online.html", detail: "Access browser-based PDF tools for document conversion and routine PDF preparation." },
      { name: "Sejda PDF", url: "https://www.sejda.com/", detail: "Edit, organize and convert PDF documents for people handling contracts, forms and reports." },
    ],
  },
  {
    key: "executiveToolsData",
    tools: [
      { name: "Looker Studio", url: "https://lookerstudio.google.com/", detail: "Build shareable dashboards from connected data sources for managers who need recurring performance views." },
      { name: "Datawrapper", url: "https://www.datawrapper.de/", detail: "Create clear charts, maps and tables for analysts and communications teams publishing data stories." },
      { name: "Flourish", url: "https://flourish.studio/", detail: "Create interactive data visualizations and presentation graphics for teams explaining trends and outcomes." },
      { name: "Tableau Public", url: "https://public.tableau.com/", detail: "Explore and publish interactive visualizations for analysts learning or sharing public-facing data stories." },
      { name: "RAWGraphs", url: "https://www.rawgraphs.io/", detail: "Turn structured datasets into specialized visual charts for analysts exploring patterns and relationships." },
      { name: "Observable", url: "https://observablehq.com/", detail: "Explore notebooks and build data-driven visual explanations for technical analysts and data teams." },
    ],
  },
  {
    key: "executiveToolsMeetings",
    tools: [
      { name: "Calendly", url: "https://calendly.com/", detail: "Share booking availability and coordinate appointments for executives, sales teams and external stakeholders." },
      { name: "Doodle", url: "https://doodle.com/", detail: "Find a meeting time by polling participants; useful when coordinating groups across busy calendars." },
      { name: "Google Calendar", url: "https://calendar.google.com/", detail: "Schedule meetings, share calendars and coordinate availability for teams already using Google Workspace." },
      { name: "Jitsi Meet", url: "https://meet.jit.si/", detail: "Start browser-based video meetings for teams and partners who need a straightforward meeting room." },
      { name: "Whereby", url: "https://whereby.com/", detail: "Host video meetings through room links for client calls, interviews and distributed collaboration." },
      { name: "tl;dv", url: "https://tldv.io/", detail: "Record, transcribe and summarize supported online meetings for teams that need searchable discussion notes; review consent and privacy settings." },
    ],
  },
  {
    key: "executiveToolsFiles",
    tools: [
      { name: "SwissTransfer", url: "https://www.swisstransfer.com/", detail: "Send large files through a transfer link; useful for agencies and teams exchanging media or project deliverables." },
      { name: "WeTransfer", url: "https://wetransfer.com/", detail: "Share files with recipients through transfer links for creative, marketing and operations workflows." },
      { name: "Wormhole", url: "https://wormhole.app/", detail: "Transfer files using shareable links with an emphasis on encrypted transfers; useful for one-off file handoffs." },
      { name: "Filemail", url: "https://www.filemail.com/", detail: "Send large attachments when ordinary email is unsuitable; useful for teams exchanging design and video assets." },
      { name: "Google Drive", url: "https://drive.google.com/", detail: "Store and share documents with permission controls for teams collaborating on ongoing projects." },
      { name: "Dropbox", url: "https://www.dropbox.com/", detail: "Sync and share files across devices for teams coordinating documents and creative assets." },
    ],
  },
  {
    key: "executiveToolsWriting",
    tools: [
      { name: "LanguageTool", url: "https://languagetool.org/", detail: "Check grammar, spelling and style in multiple languages for professionals preparing clear business communications." },
      { name: "Grammarly", url: "https://www.grammarly.com/", detail: "Review grammar, tone and clarity in emails and documents for teams polishing professional writing." },
      { name: "Hemingway Editor", url: "https://hemingwayapp.com/", detail: "Spot dense sentences and hard-to-read passages for executives making reports and messages more direct." },
      { name: "DeepL Write", url: "https://www.deepl.com/write", detail: "Refine wording, tone and phrasing for professionals drafting or revising business communications." },
      { name: "QuillBot", url: "https://quillbot.com/", detail: "Rephrase and review text for writers who want alternative wording; check output carefully for meaning and accuracy." },
      { name: "Wordtune", url: "https://www.wordtune.com/", detail: "Suggest alternative phrasing and tone adjustments for professionals editing emails, briefs and documents." },
    ],
  },
];

export const Route = createFileRoute("/executive-tools")({
  head: () =>
    toolHead({
      path: "/executive-tools",
      name: "Executive Tools Directory",
      title: "Executive Tools Directory | Verfiai",
      description: "A curated directory of external services for executive research, communication, reporting and operations.",
    }),
  component: Page,
});

function Page() {
  const location = useLocation();
  const value = new URLSearchParams(location.searchStr).get("lang");
  const lang = isLang(value) ? value : "en";
  const tx = (key: string) => siteText(lang, key);
  return (
    <ContentPage title={tx("executiveToolsTitle")} intro={tx("executiveToolsIntro")}>
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6" role="note">
        <strong>{tx("executiveToolsNoticeTitle")}</strong>{" "}
        {tx("executiveToolsNotice")}
      </div>
      <div className="mt-8 space-y-8">
        {categories.map((category) => (
          <PageSection key={category.key} title={tx(category.key)}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {category.tools.map((tool) => (
                <li key={tool.url} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <a className="font-semibold text-brand underline" href={tool.url} target="_blank" rel="noopener noreferrer">
                      {tool.name}
                    </a>
                    <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                      {tx("executiveToolsExternal")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.detail}</p>
                </li>
              ))}
            </ul>
          </PageSection>
        ))}
      </div>
    </ContentPage>
  );
}
