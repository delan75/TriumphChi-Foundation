import { ArrowRight, Mail, Paperclip } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { ContactMessageRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import type { ContactMessagesCopy } from '../contactMessagesContent';
import { contactStatusTone, formatContactDate } from '../contactMessageUtils';

interface ContactMessageRecordsProps {
  copy: ContactMessagesCopy;
  locale: Locale;
  messages: ContactMessageRecord[];
  isLoading: boolean;
  onOpen: (uuid: string) => void;
}

export function ContactMessageRecords({ copy, locale, messages, isLoading, onOpen }: ContactMessageRecordsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-md border border-ink-100 bg-white" />
        ))}
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="rounded-md border border-dashed border-ink-200 bg-ink-50 p-6 text-center text-sm font-medium text-ink-500">
        {copy.empty}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {messages.map((message) => (
          <button
            key={message.uuid}
            type="button"
            onClick={() => onOpen(message.uuid)}
            className="focus-ring rounded-md border border-ink-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foundation-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-ink-900">{message.name}</p>
                <p className="mt-1 truncate text-sm text-ink-500">{message.subject || message.email}</p>
              </div>
              <StatusBadge label={message.status_label ?? copy.statuses[message.status] ?? message.status} tone={contactStatusTone(message.status)} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Compact label={copy.reason} value={message.reason_label ?? copy.reasons[message.reason] ?? message.reason} />
              <Compact label={copy.assignedTo} value={message.handler?.name ?? copy.unassigned} />
              <Compact label={copy.attachments} value={String(message.attachments_count ?? 0)} />
              <Compact label={copy.received} value={formatContactDate(message.created_at, locale)} />
            </div>
          </button>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-md border border-ink-100 bg-white md:block">
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              {[copy.contact, copy.reason, copy.assignedTo, copy.attachments, copy.received, copy.actions].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase text-ink-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {messages.map((message) => (
              <tr key={message.uuid} className="transition hover:bg-foundation-50/40">
                <td className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foundation-50 text-foundation-700">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-ink-900">{message.name}</p>
                      <p className="mt-1 text-xs text-ink-500">{message.email}</p>
                      {message.subject ? <p className="mt-1 max-w-sm truncate text-xs font-semibold text-ink-700">{message.subject}</p> : null}
                      <div className="mt-2">
                        <StatusBadge label={message.status_label ?? copy.statuses[message.status] ?? message.status} tone={contactStatusTone(message.status)} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-ink-600">{message.reason_label ?? copy.reasons[message.reason] ?? message.reason}</td>
                <td className="px-4 py-4 text-sm text-ink-600">{message.handler?.name ?? copy.unassigned}</td>
                <td className="px-4 py-4 text-sm text-ink-600">
                  <span className="inline-flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-ink-400" aria-hidden="true" />
                    {message.attachments_count ?? 0}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-ink-600">{formatContactDate(message.created_at, locale)}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onOpen(message.uuid)}
                    className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-foundation-700 transition hover:bg-foundation-50"
                  >
                    {copy.open}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Compact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-ink-400">{label}</p>
      <p className="mt-1 truncate font-bold text-ink-900">{value}</p>
    </div>
  );
}
