import { Archive, FileText, Inbox, MessageCircleReply, UserCheck } from 'lucide-react';
import type { ContactMessageSummary } from '../../../lib/api';
import type { ContactMessagesCopy } from '../contactMessagesContent';

interface ContactMessageSummaryCardsProps {
  summary?: ContactMessageSummary;
  copy: ContactMessagesCopy;
}

export function ContactMessageSummaryCards({ summary, copy }: ContactMessageSummaryCardsProps) {
  const cards = [
    {
      label: copy.summary.total,
      value: summary?.total_count ?? 0,
      icon: Inbox,
      className: 'bg-foundation-50 text-foundation-800',
    },
    {
      label: copy.summary.new,
      value: summary?.status_counts.new ?? 0,
      icon: Archive,
      className: 'bg-amber-50 text-amber-800',
    },
    {
      label: copy.summary.reviewing,
      value: summary?.status_counts.reviewing ?? 0,
      icon: UserCheck,
      className: 'bg-blue-50 text-blue-800',
    },
    {
      label: copy.summary.replied,
      value: summary?.status_counts.replied ?? 0,
      icon: MessageCircleReply,
      className: 'bg-emerald-50 text-emerald-800',
    },
    {
      label: copy.summary.attachments,
      value: summary?.attachments_count ?? 0,
      icon: FileText,
      className: 'bg-ink-100 text-ink-700',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-md border border-ink-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-500">{card.label}</p>
              <p className="mt-2 text-2xl font-black text-ink-900">{card.value.toLocaleString()}</p>
            </div>
            <div
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${card.className}`}
            >
              <card.icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
