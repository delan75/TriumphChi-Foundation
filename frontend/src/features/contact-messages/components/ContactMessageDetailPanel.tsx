import { Download, Eye, Save, Send, X } from 'lucide-react';
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
  onForward: (
    uuid: string,
    toEmail: string,
    note?: string,
    markAsReplied?: boolean,
  ) => Promise<void>;
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
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setAssignedTo(message?.handler?.id ? String(message.handler.id) : '');
    setStatus(message?.status ?? 'new');
    setStaffNotes(message?.staff_notes ?? '');
    setForwardEmail('');
    setForwardNote('');
    setMarkAsReplied(false);
    setFeedback(null);
    setError(null);
    setPreviewOpen(false);
    // Initialize when opening another message; background refetches must not overwrite unsaved edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.uuid]);

  useEffect(() => {
    if (!previewOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [previewOpen]);

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
      <aside className="min-w-0 rounded-md border border-dashed border-ink-200 bg-white p-6 text-sm font-medium leading-6 text-ink-500 shadow-xs xl:sticky xl:top-24">
        {copy.noSelection}
      </aside>
    );
  }

  return (
    <>
      <aside className="min-w-0 xl:sticky xl:top-24">
        <div className="flex max-h-none min-w-0 flex-col rounded-md border border-ink-100 bg-white shadow-xs xl:max-h-[calc(100vh-7rem)]">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-foundation-600">{copy.detailTitle}</p>
              <h2 className="mt-1 truncate text-lg font-black text-ink-900">
                {message?.name ?? copy.loading}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {message ? (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-foundation-100 bg-foundation-50 px-3 text-sm font-black text-foundation-700 transition hover:bg-foundation-100"
                  aria-label={copy.preview}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{copy.preview}</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
                aria-label={copy.close}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          {isLoading ? (
            <div className="grid gap-3 overflow-y-auto p-5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-md bg-ink-100" />
              ))}
            </div>
          ) : message ? (
            <div className="grid gap-5 overflow-y-auto p-5">
              {feedback || error ? (
                <div
                  className={`rounded-md border p-3 text-sm font-semibold ${
                    error
                      ? 'border-red-100 bg-red-50 text-red-700'
                      : 'border-emerald-100 bg-emerald-50 text-emerald-700'
                  }`}
                  role="status"
                >
                  {error ?? feedback}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <DetailStat
                  label={copy.status}
                  value={
                    <StatusBadge
                      label={
                        message.status_label ?? copy.statuses[message.status] ?? message.status
                      }
                      tone={contactStatusTone(message.status)}
                    />
                  }
                />
                <DetailStat
                  label={copy.reason}
                  value={message.reason_label ?? copy.reasons[message.reason] ?? message.reason}
                />
                <DetailStat
                  label={copy.received}
                  value={formatContactDate(message.created_at, locale, true)}
                />
                <DetailStat
                  label={copy.assignedTo}
                  value={message.handler?.name ?? copy.unassigned}
                />
              </div>

              <DashboardPanel title={copy.message} bodyClassName="p-4">
                <p className="whitespace-pre-line text-sm leading-7 text-ink-700">
                  {message.message}
                </p>
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
                    <span className="text-xs font-bold uppercase text-ink-500">
                      {copy.assignment}
                    </span>
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
                        onClick={() =>
                          runAction(
                            () => onAssign(message.uuid, assignedTo ? Number(assignedTo) : null),
                            copy.saved,
                          )
                        }
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
                      onClick={() =>
                        runAction(
                          () => onUpdate(message.uuid, status, staffNotes || null),
                          copy.saved,
                        )
                      }
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
                    <span className="text-xs font-bold uppercase text-ink-500">
                      {copy.forwardEmail}
                    </span>
                    <input
                      type="email"
                      value={forwardEmail}
                      onChange={(event) => setForwardEmail(event.target.value)}
                      className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-900"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase text-ink-500">
                      {copy.forwardNote}
                    </span>
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
                      className="h-4 w-4 rounded-sm border-ink-300 text-foundation-600"
                    />
                    {copy.markReplied}
                  </label>
                  <button
                    type="button"
                    disabled={isWorking || !forwardEmail}
                    onClick={() =>
                      runAction(
                        () =>
                          onForward(
                            message.uuid,
                            forwardEmail,
                            forwardNote || undefined,
                            markAsReplied,
                          ),
                        copy.sent,
                      )
                    }
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
                          <p className="truncate text-sm font-black text-ink-900">
                            {attachment.original_name}
                          </p>
                          <p className="mt-1 text-xs text-ink-500">
                            {attachment.mime_type} / {formatFileSize(attachment.size_bytes)}
                          </p>
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
                  <Line
                    label="Reviewed"
                    value={formatContactDate(message.reviewed_at, locale, true)}
                  />
                  <Line
                    label="Responded"
                    value={formatContactDate(message.responded_at, locale, true)}
                  />
                  <Line
                    label="Archived"
                    value={formatContactDate(message.archived_at, locale, true)}
                  />
                  <Line
                    label="Updated"
                    value={formatContactDate(message.updated_at, locale, true)}
                  />
                </div>
              </DashboardPanel>
            </div>
          ) : null}
        </div>
      </aside>

      {message && previewOpen ? (
        <ContactInquiryPreviewModal
          copy={copy}
          locale={locale}
          message={message}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </>
  );
}

function DetailStat({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-3">
      <p className="text-xs font-bold uppercase text-ink-400">{label}</p>
      <div className="mt-1 wrap-break-word text-sm font-black text-ink-900">{value}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 gap-1 sm:grid-cols-[110px_minmax(0,1fr)]">
      <span className="text-ink-500">{label}</span>
      <span className="min-w-0 wrap-break-word font-bold text-ink-900 sm:text-right">{value}</span>
    </div>
  );
}

function ContactInquiryPreviewModal({
  copy,
  locale,
  message,
  onClose,
}: {
  copy: ContactMessagesCopy;
  locale: Locale;
  message: ContactMessageRecord;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink-950/60 p-0 backdrop-blur-xs sm:items-center sm:p-5"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-inquiry-preview-title"
        className="flex h-dvh w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-md"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ink-100 bg-ink-50 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-foundation-600">{copy.preview}</p>
            <h2 id="contact-inquiry-preview-title" className="mt-1 text-xl font-black text-ink-950">
              {copy.previewTitle}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-600">
              {copy.previewDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-ink-500 shadow-xs transition hover:text-ink-900"
            aria-label={copy.closePreview}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section className="min-w-0 rounded-md border border-ink-100 bg-white p-4 shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-ink-400">{copy.contact}</p>
                  <h3 className="mt-1 wrap-break-word text-2xl font-black text-ink-950">
                    {message.name}
                  </h3>
                  <p className="mt-2 wrap-break-word text-sm font-semibold text-ink-600">
                    {message.email}
                  </p>
                </div>
                <StatusBadge
                  label={message.status_label ?? copy.statuses[message.status] ?? message.status}
                  tone={contactStatusTone(message.status)}
                />
              </div>

              <div className="mt-5 grid gap-3 text-sm">
                <Line
                  label={copy.reason}
                  value={message.reason_label ?? copy.reasons[message.reason] ?? message.reason}
                />
                <Line
                  label={copy.received}
                  value={formatContactDate(message.created_at, locale, true)}
                />
                <Line label={copy.assignedTo} value={message.handler?.name ?? copy.unassigned} />
                <Line label="Phone" value={message.phone ?? '-'} />
                <Line label="Subject" value={message.subject ?? '-'} />
                <Line label="Locale" value={message.locale.toUpperCase()} />
              </div>
            </section>

            <section className="min-w-0 rounded-md border border-ink-100 bg-ink-50 p-4">
              <p className="text-xs font-bold uppercase text-ink-400">{copy.message}</p>
              <p className="mt-3 whitespace-pre-line wrap-break-word text-sm leading-7 text-ink-800">
                {message.message}
              </p>
            </section>

            <section className="min-w-0 rounded-md border border-ink-100 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold uppercase text-ink-400">{copy.contactDetails}</p>
              <div className="mt-3 grid gap-3 text-sm">
                <Line label="IP" value={message.ip_address ?? '-'} />
                <Line label="User agent" value={message.user_agent ?? '-'} />
                <Line label="Updated" value={formatContactDate(message.updated_at, locale, true)} />
              </div>
            </section>

            <section className="min-w-0 rounded-md border border-ink-100 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold uppercase text-ink-400">{copy.activity}</p>
              <div className="mt-3 grid gap-3 text-sm">
                <Line
                  label="Reviewed"
                  value={formatContactDate(message.reviewed_at, locale, true)}
                />
                <Line
                  label="Responded"
                  value={formatContactDate(message.responded_at, locale, true)}
                />
                <Line
                  label="Archived"
                  value={formatContactDate(message.archived_at, locale, true)}
                />
              </div>
            </section>

            <section className="min-w-0 rounded-md border border-ink-100 bg-white p-4 shadow-xs lg:col-span-2">
              <p className="text-xs font-bold uppercase text-ink-400">{copy.notes}</p>
              <p className="mt-3 whitespace-pre-line wrap-break-word text-sm leading-7 text-ink-700">
                {message.staff_notes || '-'}
              </p>
            </section>

            <section className="min-w-0 rounded-md border border-ink-100 bg-white p-4 shadow-xs lg:col-span-2">
              <p className="text-xs font-bold uppercase text-ink-400">{copy.attachmentsTitle}</p>
              {message.attachments?.length ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {message.attachments.map((attachment) => {
                    const content = (
                      <>
                        <div className="min-w-0">
                          <p className="wrap-break-word text-sm font-black text-ink-900">
                            {attachment.original_name}
                          </p>
                          <p className="mt-1 text-xs text-ink-500">
                            {attachment.mime_type} / {formatFileSize(attachment.size_bytes)}
                          </p>
                        </div>
                        <span className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-foundation-600 px-3 text-xs font-bold text-white">
                          <Download className="h-4 w-4" aria-hidden="true" />
                          {copy.download}
                        </span>
                      </>
                    );

                    return attachment.download_url ? (
                      <a
                        key={attachment.id}
                        href={attachment.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="focus-ring flex min-w-0 items-start justify-between gap-4 rounded-md border border-ink-100 p-3 transition hover:border-foundation-100 hover:bg-foundation-50/50"
                      >
                        {content}
                      </a>
                    ) : (
                      <div
                        key={attachment.id}
                        className="flex min-w-0 items-start justify-between gap-4 rounded-md border border-ink-100 p-3"
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-500">{copy.noAttachments}</p>
              )}
            </section>
          </div>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-ink-100 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-5 text-sm font-black text-white transition hover:bg-ink-700"
          >
            {copy.closePreview}
          </button>
        </footer>
      </div>
    </div>
  );
}
