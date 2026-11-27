import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { CommunityFeed, feedOptions } from '@/components/account/CommunityFeed';
import { WorkspaceError, WorkspaceMissing } from '@/components/account/WorkspacePage';
import { workspaceHead } from '@/lib/workspace';
export const Route = createFileRoute('/_authenticated/community/')({
  validateSearch: z.object({ page: z.coerce.number().int().min(0).max(10000).catch(0).default(0) }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(feedOptions(context.accountOwner.id, deps.page, false)),
  head: () => workspaceHead('Community feed', 'Member-only discussions of claims and sources in the Verfiai community.'),
  component: FeedPage, errorComponent: WorkspaceError, notFoundComponent: WorkspaceMissing,
});
function FeedPage() { const { accountOwner } = Route.useRouteContext(); const { page } = Route.useSearch(); const navigate = useNavigate({ from: Route.fullPath }); return <CommunityFeed owner={accountOwner.id} page={page} mine={false} changePage={next => { void navigate({ search: previous => ({ ...previous, page: next }) }); }} />; }
