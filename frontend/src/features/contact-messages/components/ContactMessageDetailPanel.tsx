import { Download, Save, Send, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { DashboardPanel } from '../../../components/staff/DashboardPanel';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { ContactMessageAssignee, ContactMessageRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import type { ContactMessagesCopy } from '../contactMessagesContent';
import { contactStatusTone, formatContactDate, formatFileSize } from '../contactMessageUtils';

interface ContactMessageDetailPanelProps {
  copy: ContactMessagesCopy;
  locale: Locale;
  message: ContactMessageRecord | null;
  assignees: ContactMessageAssignee[];
  isLoading: boolean;
  isWorking: boolean;
  onAssign: (uuid: string, assignedTo: number | null) => Promise<void>;
  onUpdate: (uuid: string, status: string, staffNotes?: string | null) => Promise<void>;
  onForward: (uuid: string, toEmail: string, note?: string, markAsReplied?: boolean) => Promise<void>;
  onArchive: (uuid: string) => Promise<void>;
  onClose: () => void;
}

const statuses = ['new', 'reviewing', 'replied', 'archived', 'spam'];

export function ContactMessageDetailPanel({
  copy,
  locale,
  message,
  assignees,
  isLoading,
  isWorking,
  onAssign,
  onUpdate,
  onForward,
  onArchive,
  onClose,
}: ContactMessageDetailPanelProps) {
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('new');
  const [staffNotes, setStaffNotes] = useState('');
  const [forwardEmail, setForwardEmail] = useState('');
  const [forwardNote, setForwardNote] = useState('');
  const [markAsReplied, setMarkAsReplied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAssignedTo(message?.handler?.id ? String(message.handler.id) : '');
    setStatus(message?.status ?? 'new');
    setStaffNotes(message?.staff_notes ?? '');
    setForwardEmail('');
    setForwardNote('');
    setMarkAsReplied(false);
    setFeedback(null);
    setError(null);
  }, [message?.uuid]);

  const runAction = async (action: () => Promise<void>, success: string) => {
    setError(null);
    setFeedback(null);

    try {
      await action();
      setFeedback(success);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.failed);
    }
  };

  if (!message && !isLoading) {
    return (
      <aside className="rounded-md border border-dashed border-ink-200 bg-white p-6 text-sm font-medium leading-6 text-ink-500 shadow-sm xl:sticky xl:top-24">
        {copy.noSelection}
      </aside>
    );
  }

  return (
    <aside className="xl:sticky xl:top-24">
      <div className="flex max-h-none flex-col rounded-md border border-ink-100 bg-white shadow-sm xl:max-h-[calc(100vh-7rem)]">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-foundation-600">{copy.detailTitle}</p>
            <h2 className="mt-1 text-lg font-black text-ink-900">{message?.name ?? copy.loading}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
            aria-label={copy.close}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {isLoading ? (
          <div className="grid gap-3 overflow-y-auto p-5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-md bg-ink-100" />
            ))}
          </div>
        ) : message ? (
          <div className="grid gap-5 overflow-y-auto p-5">
            {(feedback || error) ? (
              <div
                className={`rounded-md border p-3 text-sm font-semibold ${
                  error ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'
                }`}
                role="status"
              >
                {error ?? feedback}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <DetailStat label={copy.status} value={<StatusBadge label={message.status_label ?? copy.statuses[message.status] ?? message.status} tone={contactStatusTone(message.status)} />} />
              <DetailStat label={copy.reason} value={message.reason_label ?? copy.reasons[message.reason] ?? message.reason} />
              <DetailStat label={copy.received} value={formatContactDate(message.created_at, locale, true)} />
              <DetailStat label={copy.assignedTo} value={message.handler?.name ?? copy.unassigned} />
            </div>

            <DashboardPanel title={copy.message} bodyClassName="p-4">
              <p className="whitespace-pre-line text-sm leading-7 text-ink-700">{message.message}</p>
            </DashboardPanel>

            <DashboardPanel title={copy.contactDetails} bodyClassName="p-4">
              <div className="grid gap-3 text-sm">
                <Line label="Email" value={message.email} />
                <Line label="Phone" value={message.phone ?? '-'} />
                <Line label="Subject" value={message.subject ?? '-'} />
                <Line label="Locale" value={message.locale.toUpperCase()} />
                <Line label="IP" value={message.ip_address ?? '-'} />
              </div>
            </DashboardPanel>

            <DashboardPanel title={copy.management} bodyClassName="p-4">
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-ink-500">{copy.assignment}</span>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <select
                      value={assignedTo}
                      onChange={(event) => setAssignedTo(event.target.value)}
                      className="focus-ring min-h-11 flex-1 rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
                    >
                      <option value="">{copy.unassigned}</option>
                      {assignees.map((assignee) => (
                        <option key={assignee.id} value={assignee.id}>
                          {assignee.name} ({assignee.email})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={isWorking}
                      onClick={() => runAction(() => onAssign(message.uuid, assignedTo ? Number(assignedTo) : null), copy.saved)}
                      className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-black text-white transition hover:bg-foundation-900 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" aria-hidden="true" />
                      {isWorking ? copy.working : copy.assign}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase text-ink-500">{copy.status}</span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
                  >
                    {statuses.map((option) => (
                      <option key={option} value={option}>
                        {copy.statuses[option] ?? option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase text-ink-500">{copy.notes}</span>
                  <textarea
                    value={staffNotes}
                    onChange={(event) => setStaffNotes(event.target.value)}
                    rows={4}
                    placeholder={copy.notesPlaceholder}
                    className="focus-ring mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-3 text-sm text-ink-900 placeholder:text-ink-400"
                  />
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={() => runAction(() => onUpdate(message.uuid, status, staffNotes || null), copy.saved)}
                    className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-ink-900 px-4 text-sm font-black text-white transition hover:bg-ink-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {isWorking ? copy.working : copy.saveStatus}
                  </button>
                  <button
                    type="button"
                    disabled={isWorking || !message.permissions.can_archive}
                    onClick={() => runAction(() => onArchive(message.uuid), copy.saved)}
                    className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-red-200 px-4 text-sm font-black text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copy.archive}
                  </button>
                </div>
              </div>
            </DashboardPanel>

            <DashboardPanel title={copy.forward} bodyClassName="p-4">
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-ink-500">{copy.forwardEmail}</span>
                  <input
                    type="email"
                    value={forwardEmail}
                    onChange={(event) => setForwardEmail(event.target.value)}
                    className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-900"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase text-ink-500">{copy.forwardNote}</span>
                  <textarea
                    value={forwardNote}
                    onChange={(event) => setForwardNote(event.target.value)}
                    rows={3}
                    placeholder={copy.forwardNotePlaceholder}
                    className="focus-ring mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-3 text-sm text-ink-900 placeholder:text-ink-400"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-md border border-ink-100 bg-ink-50 p-3 text-sm font-semibold text-ink-700">
                  <input
                    type="checkbox"
                    checked={markAsReplied}
                    onChange={(event) => setMarkAsReplied(event.target.checked)}
                    className="h-4 w-4 rounded border-ink-300 text-foundation-600"
                  />
                  {copy.markReplied}
                </label>
                <button
                  type="button"
                  disabled={isWorking || !forwardEmail}
                  onClick={() => runAction(() => onForward(message.uuid, forwardEmail, forwardNote || undefined, markAsReplied), copy.sent)}
                  className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-black text-white transition hover:bg-foundation-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {isWorking ? copy.working : copy.sendEntry}
                </button>
              </div>
            </DashboardPanel>

            <DashboardPanel title={copy.attachmentsTitle} bodyClassName="p-4">
              {message.attachments?.length ? (
                <div className="space-y-3">
                  {message.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.download_url ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring flex items-start justify-between gap-4 rounded-md border border-ink-100 p-3 transition hover:border-foundation-100 hover:bg-foundation-50/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-ink-900">{attachment.original_name}</p>
                        <p className="mt-1 text-xs text-ink-500">{attachment.mime_type} / {formatFileSize(attachment.size_bytes)}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-foundation-600 px-3 py-2 text-xs font-bold text-white">
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {copy.download}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-500">{copy.noAttachments}</p>
              )}
            </DashboardPanel>

            <DashboardPanel title={copy.activity} bodyClassName="p-4">
              <div className="grid gap-2 text-sm">
                <Line label="Reviewed" value={formatContactDate(message.reviewed_at, locale, true)} />
                <Line label="Responded" value={formatContactDate(message.responded_at, locale, true)} />
                <Line label="Archived" value={formatContactDate(message.archived_at, locale, true)} />
                <Line label="Updated" value={formatContactDate(message.updated_at, locale, true)} />
              </div>
            </DashboardPanel>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function DetailStat({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-3">
      <p className="text-xs font-bold uppercase text-ink-400">{label}</p>
      <div className="mt-1 break-words text-sm font-black text-ink-900">{value}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-ink-500">{label}</span>
      <span className="text-right font-bold text-ink-900">{value}</span>
    </div>
  );
}
