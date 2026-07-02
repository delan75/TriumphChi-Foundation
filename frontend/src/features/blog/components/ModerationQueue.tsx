import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { cn } from '../../../components/ui/cn';
import type { BlogPostRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';

interface ModerationQueueProps {
  locale: Locale;
  posts: BlogPostRecord[];
  isLoading: boolean;
  isWorking: boolean;
  canPublish: boolean;
  onOpen: (uuid: string) => void;
  onApprove: (uuid: string) => Promise<void>;
  onReject: (uuid: string) => Promise<void>;
}

export function ModerationQueue({ locale, posts, isLoading, isWorking, canPublish, onOpen, onApprove, onReject }: ModerationQueueProps) {
  const reviewPosts = posts.filter(post => post.status === 'review');

  if (isLoading) {
    return <div className="rounded-md border border-ink-100 bg-ink-50 p-4 text-sm font-bold text-ink-500">Loading moderation queue...</div>;
  }

  if (reviewPosts.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink-200 bg-ink-50 p-8 text-center">
        <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" aria-hidden="true" />
        <h3 className="mt-3 text-sm font-black text-ink-900">All Caught Up!</h3>
        <p className="mt-1 text-sm text-ink-500">There are no posts pending moderation review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviewPosts.map((post) => (
        <article key={post.uuid} className="rounded-md border border-ink-200 bg-white shadow-sm transition hover:border-foundation-200 hover:shadow-md">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-black text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    Needs Review
                  </span>
                  <span className="text-xs font-black uppercase text-ink-400">{post.reference}</span>
                </div>
                <h3 className="mt-2 text-lg font-black leading-tight text-ink-900">{post.current_title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600 line-clamp-2">{post.current_excerpt || 'No excerpt provided.'}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-ink-500">
                  <span>Author: {post.author?.name ?? 'Unknown'}</span>
                  <span>Category: {post.category?.label ?? '-'}</span>
                  {post.tags && post.tags.length > 0 ? (
                    <span>Tags: {post.tags.map(t => t.label).join(', ')}</span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                <button
                  type="button"
                  onClick={() => onOpen(post.uuid)}
                  className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-ink-200 bg-white px-3 text-xs font-black text-ink-700 transition hover:bg-ink-50"
                >
                  <Eye className="h-4 w-4 text-ink-400" aria-hidden="true" />
                  Review Content
                </button>
                
                {canPublish ? (
                  <>
                    <button
                      type="button"
                      disabled={isWorking}
                      onClick={() => onApprove(post.uuid)}
                      className="focus-ring inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      Approve & Publish
                    </button>
                    <button
                      type="button"
                      disabled={isWorking}
                      onClick={() => onReject(post.uuid)}
                      className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      Reject to Draft
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
