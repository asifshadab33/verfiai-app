import { Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { queryOptions, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { MessageSquare, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCommunityFeed, saveCommunityPost } from '@/lib/workspace.functions';
import { WorkspacePage, SourceLink, ItemDate } from './WorkspacePage';
import { PostEditor } from './PostEditor';
export const feedOptions = (owner: string, page: number, mine: boolean) => queryOptions({ queryKey: ['community-feed', owner, page, mine], queryFn: () => getCommunityFeed({ data: { page, mine } }), staleTime: 0, gcTime: 0 });
export function CommunityFeed({ owner, page, mine, changePage }: { owner: string; page: number; mine: boolean; changePage: (page: number) => void }) {
  const { data } = useSuspenseQuery(feedOptions(owner, page, mine)); const [compose, setCompose] = useState(false);
  const save = useServerFn(saveCommunityPost); const queryClient = useQueryClient(); const navigate = useNavigate();
  return <WorkspacePage title={mine ? 'My community posts' : 'Community feed'} intro={mine ? 'Your contributions to the conversation.' : 'Claims, sources and thoughtful discussion from the Verfiai community.'}>
    <div className="mb-6 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold">{mine ? 'Your posts' : 'Latest discussions'}</h2><Button onClick={() => setCompose(!compose)}><Plus className="size-4" />{compose ? 'Close' : 'New post'}</Button></div>
    {compose && <PostEditor submit={async values => { const result = await save({ data: values }); await queryClient.invalidateQueries({ queryKey: ['community-feed'] }); await navigate({ to: '/community/$postId', params: { postId: result.id } }); }} />}
    {data.posts.length === 0 && <div className="py-12"><MessageSquare className="mb-4 size-8 text-brand" /><h3 className="text-lg font-semibold">{mine ? 'No posts yet' : 'The conversation starts here'}</h3><p className="mt-2 text-muted-foreground">Share a claim and the sources behind it.</p></div>}
    <div className="divide-y divide-border">{data.posts.map(post => <article key={post.id} className="py-7"><div className="mb-2 flex flex-wrap gap-2 text-sm text-muted-foreground"><span>{post.author_name}{post.owned ? ' · You' : ''}</span><span>·</span><ItemDate date={post.created_at} /></div><h3 className="break-words font-display text-xl font-bold"><Link to="/community/$postId" params={{ postId: post.id }} className="hover:text-brand">{post.title}</Link></h3><p className="my-3 whitespace-pre-wrap break-words text-muted-foreground">{post.body.length > 320 ? `${post.body.slice(0, 320)}…` : post.body}</p><div className="flex flex-wrap items-center justify-between gap-4"><SourceLink url={post.source_url} /><Button asChild variant="ghost"><Link to="/community/$postId" params={{ postId: post.id }}><MessageSquare className="size-4" />{post.commentCount} comments</Link></Button></div></article>)}</div>
    <div className="mt-6 flex justify-between"><Button variant="outline" disabled={page === 0} onClick={() => changePage(page - 1)}><ArrowLeft />Previous</Button><Button variant="outline" disabled={!data.hasMore} onClick={() => changePage(page + 1)}>Next<ArrowRight /></Button></div>
  </WorkspacePage>;
}
