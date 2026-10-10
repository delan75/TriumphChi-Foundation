import { Archive, ExternalLink, Send, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardPanel } from '../../../components/staff/DashboardPanel';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { BlogPostRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import type { BlogCopy } from '../blogContent';

interface BlogDetailPanelProps {
  copy: BlogCopy;
  locale: Locale;
  post: BlogPostRecord | null;
  isLoading: boolean;
  isWorking: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  onEdit: () => void;
  onTransition: (status: string) => Promise<void>;
  onClose: () => void;
}

export function BlogDetailPanel({ copy, locale, post, isLoading, isWorking, canUpdate, canPublish, onEdit, onTransition, onClose }: BlogDetailPanelProps) {
  return (
    <DashboardPanel
      title={copy.detail.title}
      action={
        post ? (
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            {copy.detail.close}
          </button>
        ) : null
      }
      className="min-w-0"
      bodyClassName="min-w-0"
    >
      {isLoading ? (
        <p className="text-sm font-bold text-ink-500">{copy.detail.loading}</p>
      ) : !post ? (
        <div className="rounded-md border border-dashed border-ink-200 bg-ink-50 p-5">
          <h3 className="text-base font-black text-ink-900">{copy.detail.emptyTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-500">{copy.detail.emptyBody}</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-md bg-foundation-950 p-5 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={copy.statuses[post.status] ?? post.status_label ?? post.status} tone={post.status === 'published' ? 'success' : post.status === 'review' ? 'warning' : 'info'} />
              {post.is_featured ? (
                <span className="inline-flex min-h-7 items-center gap-1 rounded-md bg-white/10 px-2.5 text-xs font-black uppercase text-white">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Featured
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-xs font-black uppercase text-white/50">{post.reference}</p>
            <h3 className="mt-2 text-2xl font-black leading-tight">{post.current_title}</h3>
            {post.current_excerpt ? <p className="mt-3 text-sm leading-7 text-white/75">{post.current_excerpt}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Info label={copy.table.category} value={post.category?.label ?? '-'} />
            <Info label={copy.table.author} value={post.author?.name ?? '-'} />
            <Info label="Reading" value={`${post.reading_minutes} min`} />
            <Info label={copy.table.published} value={formatDate(post.published_at, locale)} />
          </div>

          <section className="rounded-md border border-ink-100 bg-white p-4">
            <h4 className="text-sm font-black uppercase text-ink-500">{copy.detail.preview}</h4>
            <div className="mt-3 max-h-72 overflow-y-auto pr-2">
              {post.current_body.split(/\n{2,}/).filter(Boolean).slice(0, 5).map((paragraph, index) => (
                <p key={`${post.uuid}-preview-${index}`} className="mb-3 text-sm leading-7 text-ink-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-ink-100 bg-ink-50 p-4">
            <h4 className="text-sm font-black uppercase text-ink-500">{copy.detail.tags}</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags?.length ? post.tags.map((tag) => (
                <span key={tag.uuid} className="rounded-md bg-white px-3 py-1 text-xs font-bold text-ink-700 shadow-xs">
                  {tag.label}
                </span>
              )) : <span className="text-sm font-semibold text-ink-500">{copy.detail.noTags}</span>}
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            {post.status === 'published' ? (
              <Link
                to={`/${locale}/blog/${post.current_slug}`}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 px-4 text-sm font-black text-ink-700 transition hover:bg-ink-50"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Public page
              </Link>
            ) : null}
            {canUpdate ? (
              <button
                type="button"
                onClick={onEdit}
                className="focus-ring inline-flex min-h-11 items-center rounded-md border border-ink-200 px-4 text-sm font-black text-ink-700 transition hover:bg-ink-50"
              >
                {copy.edit}
              </button>
            ) : null}
            {canPublish && post.status !== 'published' ? (
              <button
                type="button"
                disabled={isWorking}
                onClick={() => onTransition('published')}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-black text-white transition hover:bg-foundation-900 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {copy.publish}
              </button>
            ) : null}
            {canPublish && post.status === 'draft' ? (
              <button
                type="button"
                disabled={isWorking}
                onClick={() => onTransition('review')}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-amber-500 px-4 text-sm font-black text-white transition hover:bg-amber-600 disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {copy.sendToReview}
              </button>
            ) : null}
            {canPublish && post.status !== 'archived' ? (
              <button
                type="button"
                disabled={isWorking}
                onClick={() => onTransition('archived')}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 px-4 text-sm font-black text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
              >
                <Archive className="h-4 w-4" aria-hidden="true" />
                {copy.archive}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </DashboardPanel>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-3">
      <p className="text-xs font-black uppercase text-ink-400">{label}</p>
      <p className="mt-1 text-sm font-black text-ink-900">{value}</p>
    </div>
  );
}

function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
