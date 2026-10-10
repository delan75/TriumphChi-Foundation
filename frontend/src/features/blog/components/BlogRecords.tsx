import { Eye, Pencil } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { cn } from '../../../components/ui/cn';
import type { BlogPostRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import type { BlogCopy } from '../blogContent';

interface BlogRecordsProps {
  copy: BlogCopy;
  locale: Locale;
  posts: BlogPostRecord[];
  selectedUuid?: string | null;
  isLoading: boolean;
  canUpdate: boolean;
  onOpen: (uuid: string) => void;
  onEdit: (uuid: string) => void;
}

export function BlogRecords({ copy, locale, posts, selectedUuid, isLoading, canUpdate, onOpen, onEdit }: BlogRecordsProps) {
  if (isLoading) {
    return <div className="rounded-md border border-ink-100 bg-ink-50 p-4 text-sm font-bold text-ink-500">{copy.table.loading}</div>;
  }

  if (posts.length === 0) {
    return <div className="rounded-md border border-ink-100 bg-ink-50 p-4 text-sm font-bold text-ink-500">{copy.table.empty}</div>;
  }

  return (
    <div className="min-w-0">
      <div className="grid gap-3 md:hidden">
        {posts.map((post) => (
          <button
            key={post.uuid}
            type="button"
            onClick={() => onOpen(post.uuid)}
            className={cn(
              'focus-ring rounded-md border bg-white p-4 text-left shadow-xs transition hover:border-foundation-200 hover:bg-foundation-50',
              selectedUuid === post.uuid ? 'border-foundation-300 bg-foundation-50' : 'border-ink-100',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-ink-400">{post.reference}</p>
                <h3 className="mt-1 text-base font-black leading-tight text-ink-900">{post.current_title}</h3>
              </div>
              <StatusBadge label={copy.statuses[post.status] ?? post.status_label ?? post.status} tone={statusTone(post.status)} />
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-500">{post.current_excerpt ?? '-'}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-ink-500">
              <span>{post.category?.label ?? '-'}</span>
              <span>{formatDate(post.published_at, locale)}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[920px] w-full divide-y divide-ink-100">
          <thead>
            <tr className="text-left text-xs font-black uppercase text-ink-400">
              <th className="px-3 py-3">{copy.table.story}</th>
              <th className="px-3 py-3">{copy.table.status}</th>
              <th className="px-3 py-3">{copy.table.category}</th>
              <th className="px-3 py-3">{copy.table.author}</th>
              <th className="px-3 py-3">{copy.table.published}</th>
              <th className="px-3 py-3 text-right">{copy.table.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {posts.map((post) => (
              <tr
                key={post.uuid}
                className={cn('transition hover:bg-foundation-50/70', selectedUuid === post.uuid ? 'bg-foundation-50' : 'bg-white')}
              >
                <td className="px-3 py-4">
                  <p className="text-xs font-black uppercase text-ink-400">{post.reference}</p>
                  <p className="mt-1 max-w-sm text-sm font-black text-ink-900">{post.current_title}</p>
                  <p className="mt-1 max-w-sm truncate text-xs font-semibold text-ink-500">{post.current_excerpt ?? '-'}</p>
                </td>
                <td className="px-3 py-4">
                  <StatusBadge label={copy.statuses[post.status] ?? post.status_label ?? post.status} tone={statusTone(post.status)} />
                </td>
                <td className="px-3 py-4 text-sm font-bold text-ink-700">{post.category?.label ?? '-'}</td>
                <td className="px-3 py-4 text-sm font-bold text-ink-700">{post.author?.name ?? '-'}</td>
                <td className="px-3 py-4 text-sm font-bold text-ink-700">{formatDate(post.published_at, locale)}</td>
                <td className="px-3 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onOpen(post.uuid)}
                      className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-ink-200 px-3 text-xs font-black text-ink-700 transition hover:bg-white"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      {copy.table.open}
                    </button>
                    {canUpdate ? (
                      <button
                        type="button"
                        onClick={() => onEdit(post.uuid)}
                        className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-foundation-600 px-3 text-xs font-black text-white transition hover:bg-foundation-900"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        {copy.edit}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusTone(status: string): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (status === 'published') return 'success';
  if (status === 'review') return 'warning';
  if (status === 'archived') return 'neutral';
  return 'info';
}

function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
