import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { factSchema, postSchema, commentSchema, idSchema, pageSchema, toolSchema } from './workspace';

function privateResponse() { setResponseHeader('Cache-Control', 'private, no-store'); }
function check(error: unknown) { if (error) throw new Error('We couldn’t save or load this item. Please try again.'); }
export const getMemberFacts = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  privateResponse();
  const { data, error } = await context.supabase.from('member_facts').select('id, claim, notes, source_url, created_at').eq('user_id', context.userId).order('created_at', { ascending: false });
  check(error); return data ?? [];
});
export const saveMemberFact = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(factSchema.extend({ id: z.string().uuid().optional() })).handler(async ({ context, data }) => {
  privateResponse(); const { id, ...values } = data;
  const request = id ? context.supabase.from('member_facts').update(values).eq('id', id).eq('user_id', context.userId) : context.supabase.from('member_facts').insert({ ...values, user_id: context.userId });
  const result = await request.select('id').single(); check(result.error); return result.data;
});
export const deleteMemberFact = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(idSchema).handler(async ({ context, data }) => {
  privateResponse(); const result = await context.supabase.from('member_facts').delete().eq('id', data.id).eq('user_id', context.userId).select('id').single(); check(result.error); return { ok: true };
});
export const getMemberTools = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  privateResponse(); const result = await context.supabase.from('member_tools').select('tool_key').eq('user_id', context.userId); check(result.error); return result.data?.map(row => row.tool_key) ?? [];
});
export const setMemberTool = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(toolSchema).handler(async ({ context, data }) => {
  privateResponse(); const result = data.saved ? await context.supabase.from('member_tools').upsert({ user_id: context.userId, tool_key: data.key }, { onConflict: 'user_id,tool_key', ignoreDuplicates: true }) : await context.supabase.from('member_tools').delete().eq('user_id', context.userId).eq('tool_key', data.key); check(result.error); return { ok: true };
});
export const getCommunityFeed = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).inputValidator(pageSchema).handler(async ({ context, data }) => {
  privateResponse(); let request = context.supabase.from('community_posts').select('id, user_id, title, body, author_name, source_url, created_at, community_comments(count)').order('created_at', { ascending: false }).order('id').range(data.page * 20, data.page * 20 + 20);
  if (data.mine) request = request.eq('user_id', context.userId);
  const result = await request; check(result.error);
  return { hasMore: (result.data?.length ?? 0) > 20, posts: (result.data ?? []).slice(0, 20).map(({ user_id, community_comments, ...post }) => ({ ...post, owned: user_id === context.userId, commentCount: community_comments[0]?.count ?? 0 })) };
});
export const getCommunityPost = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).inputValidator(idSchema).handler(async ({ context, data }) => {
  privateResponse(); const result = await context.supabase.from('community_posts').select('id, user_id, title, body, author_name, source_url, created_at').eq('id', data.id).maybeSingle(); check(result.error);
  if (!result.data) return null;
  const comments = await context.supabase.from('community_comments').select('id, user_id, body, author_name, created_at').eq('post_id', data.id).order('created_at').limit(500); check(comments.error);
  const { user_id, ...post } = result.data;
  return { ...post, owned: user_id === context.userId, comments: (comments.data ?? []).map(({ user_id: author, ...comment }) => ({ ...comment, owned: author === context.userId })) };
});
export const saveCommunityPost = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(postSchema.extend({ id: z.string().uuid().optional() })).handler(async ({ context, data }) => {
  privateResponse(); const { id, ...values } = data;
  const request = id ? context.supabase.from('community_posts').update(values).eq('id', id).eq('user_id', context.userId) : context.supabase.from('community_posts').insert({ ...values, user_id: context.userId });
  const result = await request.select('id').single(); check(result.error); if (!result.data) throw new Error('Post unavailable.'); return result.data;
});
export const deleteCommunityPost = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(idSchema).handler(async ({ context, data }) => {
  privateResponse(); const result = await context.supabase.from('community_posts').delete().eq('id', data.id).eq('user_id', context.userId).select('id').single(); check(result.error); return { ok: true };
});
export const saveCommunityComment = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(commentSchema.extend({ id: z.string().uuid().optional() })).handler(async ({ context, data }) => {
  privateResponse(); const { id, ...values } = data;
  const request = id ? context.supabase.from('community_comments').update({ body: values.body, author_name: values.author_name }).eq('id', id).eq('post_id', values.post_id).eq('user_id', context.userId) : context.supabase.from('community_comments').insert({ ...values, user_id: context.userId });
  const result = await request.select('id').single(); check(result.error); return result.data;
});
export const deleteCommunityComment = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(idSchema).handler(async ({ context, data }) => {
  privateResponse(); const result = await context.supabase.from('community_comments').delete().eq('id', data.id).eq('user_id', context.userId).select('id').single(); check(result.error); return { ok: true };
});
