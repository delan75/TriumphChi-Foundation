import { FilePlus2, RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { PageHeader } from '../../components/ui/PageHeader';
import { cn } from '../../components/ui/cn';
import { readStoredAuthUser } from '../../lib/auth';
import type { BlogPostListParams, BlogPostPayload } from '../../lib/api';
import { isLocale } from '../../lib/i18n';
import { BlogDetailPanel } from './components/BlogDetailPanel';
import { BlogEditorPanel } from './components/BlogEditorPanel';
import { BlogFilters } from './components/BlogFilters';
import { BlogRecords } from './components/BlogRecords';
import { BlogSummaryCards } from './components/BlogSummaryCards';
import { blogContent, type BlogCopy } from './blogContent';
import {
  useBlogOptions,
  useBlogPost,
  useBlogPosts,
  useCreateBlogPost,
  useTransitionBlogPostStatus,
  useUpdateBlogPost,
} from './useBlogPosts';

export function BlogManagementPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = blogContent[activeLocale];
  const user = readStoredAuthUser();
  const canView = user?.permissions?.includes('blog_posts.view') ?? false;
  const canCreate = user?.permissions?.includes('blog_posts.create') ?? false;
  const canUpdate = user?.permissions?.includes('blog_posts.update') ?? false;
  const canPublish = user?.permissions?.includes('blog_posts.publish') ?? false;
  const [filters, setFilters] = useState<BlogPostListParams>({
    page: 1,
    per_page: 12,
    sort: 'created_at',
    direction: 'desc',
  });
  const [selectedPostUuid, setSelectedPostUuid] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const postsQuery = useBlogPosts(filters, canView);
  const optionsQuery = useBlogOptions(canView);
  const postQuery = useBlogPost(selectedPostUuid, canView && Boolean(selectedPostUuid));
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const transitionPost = useTransitionBlogPostStatus();

  const posts = postsQuery.data?.data ?? [];
  const pagination = postsQuery.data?.meta;
  const selectedPost = postQuery.data ?? null;
  const isWorking = createPost.isPending || updatePost.isPending || transitionPost.isPending;

  const pageLabel = useMemo(() => {
    if (!pagination) {
      return '';
    }

    return `${pagination.current_page} / ${pagination.last_page}`;
  }, [pagination]);

  async function handleCreate(payload: BlogPostPayload) {
    setMutationError(null);

    try {
      const created = await createPost.mutateAsync(payload);
      setSelectedPostUuid(created.uuid);
      setFormMode(null);
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save post.');
    }
  }

  async function handleUpdate(payload: BlogPostPayload) {
    if (!selectedPost) {
      return;
    }

    setMutationError(null);

    try {
      await updatePost.mutateAsync({ uuid: selectedPost.uuid, payload });
      setFormMode(null);
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save post.');
    }
  }

  if (!canView) {
    return (
      <section className="space-y-6">
        <PageHeader title={copy.title} description={copy.description} />
        <DashboardPanel title={copy.accessDeniedTitle}>
          <p className="text-sm leading-6 text-ink-500">{copy.accessDeniedBody}</p>
        </DashboardPanel>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
          <div className="flex flex-wrap gap-2">
            {canCreate ? (
              <button
                type="button"
                onClick={() => {
                  setMutationError(null);
                  setSelectedPostUuid(null);
                  setFormMode('create');
                }}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900"
              >
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                {copy.create}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => postsQuery.refetch()}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              <RefreshCcw className={cn('h-4 w-4', postsQuery.isFetching ? 'animate-spin' : '')} aria-hidden="true" />
              {copy.refresh}
            </button>
          </div>
        }
      />

      <BlogSummaryCards summary={postsQuery.data?.summary} copy={copy} />

      <BlogFilters
        copy={copy}
        filters={filters}
        options={optionsQuery.data}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setSelectedPostUuid(null);
          setFormMode(null);
        }}
      />

      <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.38fr)_minmax(420px,0.62fr)]">
        <DashboardPanel
          title={copy.table.title}
          description={copy.table.description}
          className="min-w-0"
          action={pagination ? (
            <PaginationControls
              copy={copy}
              pageLabel={pageLabel}
              canPrevious={Boolean(postsQuery.data?.links.prev)}
              canNext={Boolean(postsQuery.data?.links.next)}
              onPrevious={() => setFilters((current) => ({ ...current, page: Math.max((current.page ?? 1) - 1, 1) }))}
              onNext={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            />
          ) : null}
          bodyClassName="p-4"
        >
          {postsQuery.isError ? (
            <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {postsQuery.error instanceof Error ? postsQuery.error.message : copy.table.empty}
            </div>
          ) : (
            <BlogRecords
              copy={copy}
              locale={activeLocale}
              posts={posts}
              selectedUuid={selectedPostUuid}
              isLoading={postsQuery.isLoading}
              canUpdate={canUpdate}
              onOpen={(uuid) => {
                setFormMode(null);
                setMutationError(null);
                setSelectedPostUuid(uuid);
              }}
              onEdit={(uuid) => {
                setMutationError(null);
                setSelectedPostUuid(uuid);
                setFormMode('edit');
              }}
            />
          )}
        </DashboardPanel>

        {formMode ? (
          <BlogEditorPanel
            copy={copy}
            mode={formMode}
            post={formMode === 'edit' ? selectedPost : null}
            options={optionsQuery.data}
            isWorking={isWorking}
            error={mutationError}
            canPublish={canPublish}
            onClose={() => setFormMode(null)}
            onSubmit={formMode === 'create' ? handleCreate : handleUpdate}
          />
        ) : (
          <BlogDetailPanel
            copy={copy}
            locale={activeLocale}
            post={selectedPost}
            isLoading={postQuery.isLoading}
            isWorking={isWorking}
            canUpdate={canUpdate}
            canPublish={canPublish}
            onClose={() => setSelectedPostUuid(null)}
            onEdit={() => {
              setMutationError(null);
              setFormMode('edit');
            }}
            onTransition={async (status) => {
              if (!selectedPost) {
                return;
              }

              setMutationError(null);

              try {
                await transitionPost.mutateAsync({ uuid: selectedPost.uuid, status });
              } catch (error) {
                setMutationError(error instanceof Error ? error.message : 'Unable to update post status.');
              }
            }}
          />
        )}
      </div>
    </section>
  );
}

function PaginationControls({
  copy,
  pageLabel,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: {
  copy: BlogCopy;
  pageLabel: string;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={!canPrevious}
        onClick={onPrevious}
        className="focus-ring min-h-10 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copy.table.previous}
      </button>
      <span className="min-h-10 rounded-md bg-ink-50 px-3 py-2 text-sm font-bold text-ink-700">{pageLabel}</span>
      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        className="focus-ring min-h-10 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copy.table.next}
      </button>
    </div>
  );
}
