import { z } from 'zod';

const sourceUrl = z.string().trim().max(2000).refine(value => {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}, 'Use an HTTPS source link without login details.');
export const factSchema = z.object({ claim: z.string().trim().min(1).max(2000), notes: z.string().trim().max(10000), source_url: sourceUrl });
export const postSchema = z.object({ title: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(10000), author_name: z.string().trim().min(1).max(60), source_url: sourceUrl });
export const commentSchema = z.object({ post_id: z.string().uuid(), body: z.string().trim().min(1).max(4000), author_name: z.string().trim().min(1).max(60) });
export const idSchema = z.object({ id: z.string().uuid() });
export const pageSchema = z.object({ page: z.number().int().min(0).max(10000).default(0), mine: z.boolean().default(false) });
export const WORKSPACE_TOOLS = [
  { key: 'fact-checker', title: 'Fact checker', path: '/fact-checker', note: 'Research with linked evidence' },
  { key: 'citation-checker', title: 'Citation checker', path: '/tools/citation-checker', note: 'Checks public citation records' },
  { key: 'evidence-matrix', title: 'Evidence matrix', path: '/tools/evidence-matrix', note: 'Organize evidence in your browser' },
  { key: 'doi-checker', title: 'DOI & retraction checker', path: '/tools/doi-checker', note: 'Looks up public publication records' },
  { key: 'word-counter', title: 'Word counter', path: '/tools/word-counter', note: 'Runs in your browser' },
  { key: 'text-compare', title: 'Text compare', path: '/tools/text-compare', note: 'Runs in your browser' },
  { key: 'photo-check', title: 'Photo metadata', path: '/tools/photo-check', note: 'Metadata stays in your browser' },
  { key: 'source-checklist', title: 'Source checklist', path: '/tools/source-checklist', note: 'Review a source in your browser' },
] as const;
export const toolSchema = z.object({ key: z.string().refine(key => WORKSPACE_TOOLS.some(tool => tool.key === key), 'Choose a listed tool.'), saved: z.boolean() });
export function workspaceHead(title: string, description: string) {
  return { meta: [ { title: `${title} | Verfiai` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} | Verfiai` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex,nofollow' } ] };
}
