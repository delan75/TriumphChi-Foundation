import { FilePlus2, RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { DashboardFormModal } from '../../components/staff/DashboardFormModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { cn } from '../../components/ui/cn';
import { readStoredAuthUser } from '../../lib/auth';
import type {
  BlogCategoryPayload,
  BlogPostListParams,
  BlogPostPayload,
  BlogTagPayload,
} from '../../lib/api';
import { isLocale } from '../../lib/i18n';
import { BlogDetailPanel } from './components/BlogDetailPanel';
import { BlogEditorPanel } from './components/BlogEditorPanel';
import { BlogFilters } from './components/BlogFilters';
import { BlogRecords } from './components/BlogRecords';
import { BlogSummaryCards } from './components/BlogSummaryCards';
import { TaxonomyRecords } from './components/TaxonomyRecords';
import { TaxonomyEditorPanel } from './components/TaxonomyEditorPanel';
import { ModerationQueue } from './components/ModerationQueue';
import { blogContent, type BlogCopy } from './blogContent';
import {
  useBlogOptions,
  useBlogPost,
  useBlogPosts,
  useCreateBlogPost,
  useTransitionBlogPostStatus,
  useUpdateBlogPost,
} from './useBlogPosts';
import {
  useCreateBlogCategory,
  useUpdateBlogCategory,
  useDeleteBlogCategory,
  useCreateBlogTag,
  useUpdateBlogTag,
  useDeleteBlogTag,
} from './useBlogTaxonomy';

export function BlogManagementPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = blogContent[activeLocale];
  const user = readStoredAuthUser();
  const canView = user?.permissions?.includes('blog_posts.view') ?? false;
  const canCreate = user?.permissions?.includes('blog_posts.create') ?? false;
  const canUpdate = user?.permissions?.includes('blog_posts.update') ?? false;
  const canPublish = user?.permissions?.includes('blog_posts.publish') ?? false;
  const canManageCategories = user?.permissions?.includes('blog_categories.manage') ?? false;
  const canManageTags = user?.permissions?.includes('blog_tags.manage') ?? false;

  const [activeTab, setActiveTab] = useState<'posts' | 'moderation' | 'categories' | 'tags'>(
    'posts',
  );

  const [filters, setFilters] = useState<BlogPostListParams>({
    page: 1,
    per_page: 12,
    sort: 'created_at',
    direction: 'desc',
  });

  const [selectedPostUuid, setSelectedPostUuid] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const [selectedTaxonomyUuid, setSelectedTaxonomyUuid] = useState<string | null>(null);
  const [taxonomyFormMode, setTaxonomyFormMode] = useState<'create' | 'edit' | null>(null);

  const postsQuery = useBlogPosts(filters, canView);
  const optionsQuery = useBlogOptions(canView);
  const postQuery = useBlogPost(selectedPostUuid, canView && Boolean(selectedPostUuid));

  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const transitionPost = useTransitionBlogPostStatus();

  const createCategory = useCreateBlogCategory();
  const updateCategory = useUpdateBlogCategory();
  const deleteCategory = useDeleteBlogCategory();

  const createTag = useCreateBlogTag();
  const updateTag = useUpdateBlogTag();
  const deleteTag = useDeleteBlogTag();

  const posts = postsQuery.data?.data ?? [];
  const pagination = postsQuery.data?.meta;
  const selectedPost = postQuery.data ?? null;
  const taxonomyItems =
    activeTab === 'categories'
      ? (optionsQuery.data?.categories ?? [])
      : (optionsQuery.data?.tags ?? []);
  const selectedTaxonomyItem =
    taxonomyItems.find((item) => item.uuid === selectedTaxonomyUuid) ?? null;
  const isWorking = createPost.isPending || updatePost.isPending || transitionPost.isPending;
  const isTaxonomyWorking =
    createCategory.isPending ||
    updateCategory.isPending ||
    deleteCategory.isPending ||
    createTag.isPending ||
    updateTag.isPending ||
    deleteTag.isPending;

  const pageLabel = useMemo(() => {
    if (!pagination) return '';
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
    if (!selectedPost) return;
    setMutationError(null);
    try {
      await updatePost.mutateAsync({ uuid: selectedPost.uuid, payload });
      setFormMode(null);
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save post.');
    }
  }

  async function handleCreateTaxonomy(payload: BlogCategoryPayload | BlogTagPayload) {
    setMutationError(null);
    try {
      if (activeTab === 'categories') {
        await createCategory.mutateAsync(payload);
      } else {
        await createTag.mutateAsync(payload);
      }
      setTaxonomyFormMode(null);
    } catch (error) {
      setMutationError(
        error instanceof Error
          ? error.message
          : `Unable to save ${activeTab === 'categories' ? 'category' : 'tag'}.`,
      );
    }
  }

  async function handleUpdateTaxonomy(payload: BlogCategoryPayload | BlogTagPayload) {
    if (!selectedTaxonomyUuid) return;
    setMutationError(null);
    try {
      if (activeTab === 'categories') {
        await updateCategory.mutateAsync({ uuid: selectedTaxonomyUuid, payload });
      } else {
        await updateTag.mutateAsync({ uuid: selectedTaxonomyUuid, payload });
      }
      setTaxonomyFormMode(null);
    } catch (error) {
      setMutationError(
        error instanceof Error
          ? error.message
          : `Unable to save ${activeTab === 'categories' ? 'category' : 'tag'}.`,
      );
    }
  }

  async function handleDeleteTaxonomy(uuid: string) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (activeTab === 'categories') {
        await deleteCategory.mutateAsync(uuid);
      } else {
        await deleteTag.mutateAsync(uuid);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete item.');
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
            {activeTab === 'posts' && canCreate && (
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
            )}
            {activeTab === 'categories' && canManageCategories && (
              <button
                type="button"
                onClick={() => {
                  setMutationError(null);
                  setSelectedTaxonomyUuid(null);
                  setTaxonomyFormMode('create');
                }}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900"
              >
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                Create Category
              </button>
            )}
            {activeTab === 'tags' && canManageTags && (
              <button
                type="button"
                onClick={() => {
                  setMutationError(null);
                  setSelectedTaxonomyUuid(null);
                  setTaxonomyFormMode('create');
                }}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900"
              >
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                Create Tag
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                postsQuery.refetch();
                optionsQuery.refetch();
              }}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              <RefreshCcw
                className={cn('h-4 w-4', postsQuery.isFetching ? 'animate-spin' : '')}
                aria-hidden="true"
              />
              {copy.refresh}
            </button>
          </div>
        }
      />

      <div className="flex space-x-1 rounded-xl bg-ink-100 p-1 lg:w-fit">
        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            'w-full rounded-lg px-6 py-2.5 text-sm font-medium leading-5',
            activeTab === 'posts'
              ? 'bg-white shadow-sm'
              : 'text-ink-700 hover:bg-white/12 hover:text-ink-900',
          )}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={cn(
            'w-full rounded-lg px-6 py-2.5 text-sm font-medium leading-5',
            activeTab === 'moderation'
              ? 'bg-white shadow-sm'
              : 'text-ink-700 hover:bg-white/12 hover:text-ink-900',
          )}
        >
          Moderation Queue
        </button>
        {canManageCategories && (
          <button
            onClick={() => setActiveTab('categories')}
            className={cn(
              'w-full rounded-lg px-6 py-2.5 text-sm font-medium leading-5',
              activeTab === 'categories'
                ? 'bg-white shadow-sm'
                : 'text-ink-700 hover:bg-white/12 hover:text-ink-900',
            )}
          >
            Categories
          </button>
        )}
        {canManageTags && (
          <button
            onClick={() => setActiveTab('tags')}
            className={cn(
              'w-full rounded-lg px-6 py-2.5 text-sm font-medium leading-5',
              activeTab === 'tags'
                ? 'bg-white shadow-sm'
                : 'text-ink-700 hover:bg-white/12 hover:text-ink-900',
            )}
          >
            Tags
          </button>
        )}
      </div>

      {activeTab === 'posts' && (
        <>
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
              action={
                pagination ? (
                  <PaginationControls
                    copy={copy}
                    pageLabel={pageLabel}
                    canPrevious={Boolean(postsQuery.data?.links.prev)}
                    canNext={Boolean(postsQuery.data?.links.next)}
                    onPrevious={() =>
                      setFilters((current) => ({
                        ...current,
                        page: Math.max((current.page ?? 1) - 1, 1),
                      }))
                    }
                    onNext={() =>
                      setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))
                    }
                  />
                ) : null
              }
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
                if (!selectedPost) return;
                setMutationError(null);
                try {
                  await transitionPost.mutateAsync({ uuid: selectedPost.uuid, status });
                } catch (error) {
                  setMutationError(
                    error instanceof Error ? error.message : 'Unable to update post status.',
                  );
                }
              }}
            />
          </div>
        </>
      )}

      {activeTab === 'moderation' && (
        <ModerationQueue
          locale={activeLocale}
          posts={posts}
          isLoading={postsQuery.isLoading}
          isWorking={isWorking}
          canPublish={canPublish}
          onOpen={(uuid) => {
            setActiveTab('posts');
            setSelectedPostUuid(uuid);
            setFormMode(null);
          }}
          onApprove={async (uuid) => {
            try {
              await transitionPost.mutateAsync({ uuid, status: 'published' });
            } catch (error) {
              alert(error instanceof Error ? error.message : 'Failed to publish post.');
            }
          }}
          onReject={async (uuid) => {
            try {
              await transitionPost.mutateAsync({ uuid, status: 'draft' });
            } catch (error) {
              alert(error instanceof Error ? error.message : 'Failed to reject post.');
            }
          }}
        />
      )}

      {(activeTab === 'categories' || activeTab === 'tags') && (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <DashboardPanel
            title={activeTab === 'categories' ? 'Categories' : 'Tags'}
            className="min-w-0"
            bodyClassName="p-4"
          >
            <TaxonomyRecords
              title={activeTab === 'categories' ? 'Category' : 'Tag'}
              items={
                activeTab === 'categories'
                  ? (optionsQuery.data?.categories ?? [])
                  : (optionsQuery.data?.tags ?? [])
              }
              selectedUuid={selectedTaxonomyUuid}
              canUpdate={activeTab === 'categories' ? canManageCategories : canManageTags}
              onEdit={(uuid) => {
                setMutationError(null);
                setSelectedTaxonomyUuid(uuid);
                setTaxonomyFormMode('edit');
              }}
              onDelete={handleDeleteTaxonomy}
            />
          </DashboardPanel>

          <DashboardPanel title="Details" className="min-w-0" bodyClassName="p-4">
            {selectedTaxonomyItem ? (
              <div className="space-y-3">
                <Info label="Name" value={selectedTaxonomyItem.label} />
                <Info label="English slug" value={selectedTaxonomyItem.slug.en || '-'} />
                <Info label="French slug" value={selectedTaxonomyItem.slug.fr || '-'} />
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-ink-200 bg-ink-50 p-4">
                <p className="text-sm font-black text-ink-900">No item selected</p>
                <p className="mt-2 text-sm leading-6 text-ink-500">
                  Use this area for quick category or tag details. Create and edit actions open in a
                  modal.
                </p>
              </div>
            )}
          </DashboardPanel>
        </div>
      )}

      <DashboardFormModal
        isOpen={Boolean(formMode)}
        title={formMode === 'create' ? copy.form.titleCreate : copy.form.titleEdit}
        description={copy.form.mediaHelp}
        size="xl"
        closeLabel={copy.cancel}
        onClose={() => setFormMode(null)}
      >
        {formMode === 'edit' && postQuery.isLoading ? (
          <p className="text-sm font-bold text-ink-500">{copy.detail.loading}</p>
        ) : (
          <BlogEditorPanel
            copy={copy}
            mode={formMode ?? 'create'}
            post={formMode === 'edit' ? selectedPost : null}
            options={optionsQuery.data}
            isWorking={isWorking}
            error={mutationError}
            canPublish={canPublish}
            surface="plain"
            onClose={() => setFormMode(null)}
            onSubmit={formMode === 'create' ? handleCreate : handleUpdate}
          />
        )}
      </DashboardFormModal>

      <DashboardFormModal
        isOpen={Boolean(taxonomyFormMode)}
        title={
          taxonomyFormMode === 'create'
            ? `Create ${activeTab === 'categories' ? 'Category' : 'Tag'}`
            : `Edit ${activeTab === 'categories' ? 'Category' : 'Tag'}`
        }
        size="md"
        closeLabel={copy.cancel}
        onClose={() => setTaxonomyFormMode(null)}
      >
        <TaxonomyEditorPanel
          title={activeTab === 'categories' ? 'Category' : 'Tag'}
          mode={taxonomyFormMode ?? 'create'}
          item={taxonomyFormMode === 'edit' ? selectedTaxonomyItem : null}
          isWorking={isTaxonomyWorking}
          error={mutationError}
          surface="plain"
          onClose={() => setTaxonomyFormMode(null)}
          onSubmit={taxonomyFormMode === 'create' ? handleCreateTaxonomy : handleUpdateTaxonomy}
        />
      </DashboardFormModal>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-3">
      <p className="text-xs font-black uppercase text-ink-400">{label}</p>
      <p className="mt-1 wrap-break-word text-sm font-black text-ink-900">{value}</p>
    </div>
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
      <span className="min-h-10 rounded-md bg-ink-50 px-3 py-2 text-sm font-bold text-ink-700">
        {pageLabel}
      </span>
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
