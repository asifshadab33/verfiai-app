export type ResourceAudience =
  "journalists" | "paralegals" | "equity-research" | "compliance" | "academics";
export type ResourceFormat = "PDF" | "XLSX" | "DOCX";
export type ResourceIcon = "FileText" | "Scale" | "TrendingUp" | "ShieldCheck" | "GraduationCap";

export interface ResourceItem {
  id: string;
  title: string;
  audience: ResourceAudience;
  audienceLabel: string;
  format: ResourceFormat;
  size: string;
  iconName: ResourceIcon;
  description: string;
  sampleContent: string[];
}

// All files generated from these rows contain synthetic, illustrative template data only.
// They are not real findings, citations, or verified examples (Master Prompt Section 5).
export const FREE_RESOURCES: ResourceItem[] = [
  {
    id: "fact-checking-checklist",
    title: "Fact-Checking & Source Verification Checklist",
    audience: "journalists",
    audienceLabel: "For Journalists",
    format: "PDF",
    size: "150 KB",
    iconName: "FileText",
    description:
      "A repeatable checklist for evaluating a claim, its original source, and counterevidence.",
    sampleContent: [
      "Claim to check: [Enter claim]",
      "Original source and publication date: [Add link and date]",
      "Primary evidence: [Add source link and relevant excerpt]",
      "Independent corroboration: [Add separate source]",
      "Conflicting evidence: [Add source and excerpt]",
      "Decision and limitations: [Document reasoning and unresolved gaps]",
    ],
  },
  {
    id: "evidence-tracker",
    title: "Evidence Tracker & Citation Validator Log",
    audience: "paralegals",
    audienceLabel: "For Paralegals",
    format: "XLSX",
    size: "185 KB",
    iconName: "Scale",
    description: "Track document references, citation status, provenance, and outstanding review.",
    sampleContent: [
      "Matter / reference",
      "Claim or proposition",
      "Source title",
      "Citation / identifier",
      "Source URL",
      "Date checked",
      "Relevant excerpt",
      "Verification status",
      "Reviewer notes",
    ],
  },
  {
    id: "competitor-claim-matrix",
    title: "Competitor Claim Verification Matrix",
    audience: "equity-research",
    audienceLabel: "For Equity Research",
    format: "XLSX",
    size: "210 KB",
    iconName: "TrendingUp",
    description:
      "Compare market claims with source links, reporting periods, and alternative explanations.",
    sampleContent: [
      "Company",
      "Claim",
      "Metric and period",
      "Primary source",
      "Source date",
      "Supporting evidence",
      "Conflicting evidence",
      "Confidence / gaps",
      "Next action",
    ],
  },
  {
    id: "regulatory-claim-log",
    title: "Regulatory Claim Audit & Traceability Log",
    audience: "compliance",
    audienceLabel: "For Compliance",
    format: "DOCX",
    size: "160 KB",
    iconName: "ShieldCheck",
    description: "Record the origin, scope, and review status of regulatory claims.",
    sampleContent: [
      "Claim or requirement: [Enter wording]",
      "Applicable jurisdiction and effective date: [Confirm with counsel]",
      "Primary regulation / registry URL: [Add link]",
      "Relevant section and excerpt: [Add reference]",
      "Owner and review date: [Assign reviewer]",
      "Exceptions, conflicts and next steps: [Document gaps]",
    ],
  },
  {
    id: "literature-review-guide",
    title: "Literature Review Citation Scanner Guide",
    audience: "academics",
    audienceLabel: "For Academics",
    format: "PDF",
    size: "175 KB",
    iconName: "GraduationCap",
    description:
      "A guide to checking bibliographic details, retractions, and whether cited works support a claim.",
    sampleContent: [
      "Collect references with full title, authors, year, journal and DOI.",
      "Check each identifier against the publisher or Crossref record.",
      "Check corrections and retraction notices at the source.",
      "Read the original work to confirm it supports the cited claim.",
      "Record any mismatch, missing record, or access limitation.",
      "Never treat a matching citation as proof of the claim.",
    ],
  },
];
