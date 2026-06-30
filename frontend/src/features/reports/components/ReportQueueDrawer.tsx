import { Clock3, FileText, Loader2, X } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { cn } from '../../../components/ui/cn';
import type { ReportRequestRecord } from '../../../lib/api';
import type { ReportsCopy } from '../reportsContent';

const statusTone: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  queued: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'danger',
  expired: 'neutral',
};

export function ReportQueueDrawer({
  copy,
  isOpen,
  isLoading,
  queue,
  onClose,
}: {
  copy: ReportsCopy;
  isOpen: boolean;
  isLoading: boolean;
  queue: ReportRequestRecord[];
  onClose: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-labelledby="report-queue-title">
      <button
        type="button"
        aria-label={copy.actions.closeQueue}
        className="absolute inset-0 cursor-default bg-ink-950/35"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-ink-100 bg-white shadow-2xl sm:w-[30rem]">
        <header className="flex items-start justify-between gap-4 border-b border-ink-100 p-5">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-foundation-700">{copy.actions.openQueue}</p>
            <h2 id="report-queue-title" className="mt-1 text-xl font-black text-ink-950">
              {copy.sections.queue}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">{copy.sections.queueDescription}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
            aria-label={copy.actions.closeQueue}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed border-ink-200">
              <Loader2 className="h-6 w-6 animate-spin text-foundation-700" aria-label="Loading report queue" />
            </div>
          ) : queue.length ? (
            <div className="grid gap-3">
              {queue.map((request) => (
                <article key={request.uuid} className="rounded-md border border-ink-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-foundation-50 text-foundation-700">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <StatusBadge label={request.status_label ?? request.status} tone={statusTone[request.status] ?? 'neutral'} />
                  </div>
                  <div className="mt-4 min-w-0">
                    <h3 className="truncate text-sm font-black text-ink-950">{request.title}</h3>
                    <p className="mt-1 text-xs font-bold uppercase text-ink-400">
                      {request.format} · {request.category}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold text-ink-500">
                      <span>{request.status_label ?? request.status}</span>
                      <span>{request.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100" aria-hidden="true">
                      <div
                        className={cn(
                          'h-full rounded-full transition-[width] duration-500',
                          request.status === 'failed' ? 'bg-red-500' : request.status === 'completed' ? 'bg-emerald-500' : 'bg-foundation-600',
                        )}
                        style={{ width: `${Math.max(0, Math.min(100, request.progress))}%` }}
                      />
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-2 text-sm">
                    <Line label={copy.queue.queued} value={formatDateTime(request.queued_at)} />
                    <Line label={copy.queue.readyUntil} value={formatDateTime(request.expires_at)} />
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-ink-200 p-6 text-sm leading-6 text-ink-500">
              {copy.table.empty}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right font-bold text-ink-900">{value}</dd>
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}
