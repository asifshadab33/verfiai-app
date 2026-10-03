import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { paymentEnvironment } from './payments-env.server';

type PublicResource = { id: string; slug: string; title: string; summary: string; publisher: string; original_url: string; category: string; region: string; language: string; published_at: string | null; verified_at: string | null; licence_name: string; licence_url: string | null; reuse_conditions: string; rights_status: string; kind: string; access_level: string; preview_content: string; source_count: number; evidence_strength: string | null };
const fields = 'id,slug,title,summary,publisher,original_url,category,region,language,published_at,verified_at,licence_name,licence_url,reuse_conditions,rights_status,kind,access_level,preview_content,source_count,evidence_strength';
const searchInput = z.object({ query: z.string().max(160).default(''), category: z.string().max(50).default('all'), region: z.string().max(50).default('all'), kind: z.enum(['index', 'library']) });
export const searchResources = createServerFn({ method: 'GET' }).inputValidator((value) => searchInput.parse(value)).handler(async ({ data }) => {
  const { supabase } = await import('@/integrations/supabase/client');
  let request = supabase.from('knowledge_resources').select(fields).eq('kind', data.kind).eq('published', true).order('published_at', { ascending: false }).limit(40);
  if (data.category !== 'all') request = request.eq('category', data.category);
  if (data.region !== 'all') request = request.eq('region', data.region);
  const { data: rows, error } = await request;
  if (error) throw new Error('Resources are unavailable right now.');
  const resources = (rows ?? []) as unknown as PublicResource[];
  const q = data.query.toLocaleLowerCase();
  return q ? resources.filter(item => [item.title, item.summary, item.publisher].some(s => s.toLocaleLowerCase().includes(q))) : resources;
});

const crossrefInput = z.object({ query: z.string().trim().min(3).max(120) });
export const discoverOpenResearch = createServerFn({ method: 'GET' }).inputValidator((value) => crossrefInput.parse(value)).handler(async ({ data }) => {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(data.query)}&rows=12&select=DOI,title,publisher,URL,published,license,type`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Verfiai/1.0 (mailto:hello@verfiai.app)' }, signal: AbortSignal.timeout(9000) });
    if (!response.ok) return [];
    const payload = await response.json() as { message?: { items?: Array<{ DOI?: string; title?: string[]; publisher?: string; URL?: string; published?: { 'date-parts'?: number[][] }; license?: { URL?: string }[]; type?: string }> } };
    return (payload.message?.items ?? []).filter(item => item.DOI && item.title?.[0]).map(item => ({
      doi: item.DOI ?? '', title: item.title?.[0] ?? '', publisher: item.publisher ?? 'Publisher not provided',
      url: `https://doi.org/${encodeURIComponent(item.DOI ?? '')}`, year: item.published?.['date-parts']?.[0]?.[0] ?? null,
      type: item.type ?? 'Research publication', licenceUrl: item.license?.[0]?.URL ?? null,
      checkedAt: new Date().toISOString(),
    }));
  } catch { return []; }
});

export const getResource = createServerFn({ method: 'GET' }).inputValidator((value) => z.object({ slug: z.string().regex(/^[a-z0-9-]{1,100}$/) }).parse(value)).handler(async ({ data }) => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: item, error } = await supabase.from('knowledge_resources').select(fields).eq('slug', data.slug).eq('published', true).maybeSingle();
  if (error || !item) return null;
  const { data: sources } = await supabase.from('resource_sources').select('title,url,publisher,licence_name,reuse_conditions,retrieved_at').eq('resource_id', item.id).limit(50);
  return { item: item as unknown as PublicResource, sources: sources ?? [] };
});

export const getLibraryUsage = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: subs, error } = await context.supabase.from('subscriptions').select('id,current_period_start,current_period_end,status').eq('user_id', context.userId).eq('environment', paymentEnvironment()).eq('product_id', 'analyst_plan').in('status', ['active', 'trialing']).lte('current_period_start', new Date().toISOString()).gt('current_period_end', new Date().toISOString()).order('created_at', { ascending: false }).limit(1);
  if (error) throw new Error('Unable to check library allowance.');
  const sub = subs?.[0];
  if (!sub?.current_period_start || !sub.current_period_end) return { active: false, remaining: 0, total: 50, resetsAt: null, history: [] };
  const { data: downloads, error: historyError } = await context.supabase.from('resource_downloads').select('resource_id,downloaded_at,file_version').eq('user_id', context.userId).eq('subscription_id', sub.id).eq('period_start', sub.current_period_start).order('downloaded_at', { ascending: false });
  if (historyError) throw new Error('Unable to load download history.');
  return { active: true, remaining: Math.max(0, 50 - (downloads?.length ?? 0)), total: 50, resetsAt: sub.current_period_end, history: downloads ?? [] };
});

export const downloadLibraryResource = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((value) => z.object({ id: z.string().uuid() }).parse(value)).handler(async ({ data, context }) => {
  const { data: result, error } = await context.supabase.rpc('claim_library_download', { resource_uuid: data.id, check_env: paymentEnvironment() });
  if (error || !result?.[0]) throw new Error(error?.message ?? 'Download unavailable.');
  return result[0];
});

export const submitResourceIssue = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((value) => z.object({ id: z.string().uuid(), type: z.enum(['EVIDENCE_OUTDATED','SOURCE_BROKEN','COPYRIGHT_CONCERN','INACCURATE_CONTENT','OTHER']), message: z.string().trim().min(10).max(2000) }).parse(value)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('resource_issues').insert({ resource_id: data.id, user_id: context.userId, issue_type: data.type, message: data.message });
  if (error) throw new Error('Could not submit your report.');
  return { received: true };
});
