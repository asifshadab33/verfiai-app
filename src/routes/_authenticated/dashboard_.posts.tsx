import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { CommunityFeed, feedOptions } from '@/components/account/CommunityFeed';
import { WorkspaceError, WorkspaceMissing } from '@/components/account/WorkspacePage';
import { workspaceHead } from '@/lib/workspace';
export const Route = createFileRoute('/_authenticated/dashboard_/posts')({
  validateSearch: zodValidator(z.object({ page: z.coerce.number().int().min(0).max(10000).catch(0).default(0) })),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(feedOptions(context.accountOwner.id, deps.page, true)),
  head: () => workspaceHead('My community posts', 'Your own posts and discussions in the Verfiai member community.'),
  component: PostsPage, errorComponent: WorkspaceError, notFoundComponent: WorkspaceMissing,
});
function PostsPage() { const { accountOwner } = Route.useRouteContext(); const { page } = Route.useSearch(); const navigate = useNavigate(); return <CommunityFeed owner={accountOwner.id} page={page} mine changePage={next => { void navigate({ search: previous => ({ ...previous, page: next }) }); }} />; }
