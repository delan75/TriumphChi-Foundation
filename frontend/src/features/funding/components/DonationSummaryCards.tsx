import { CheckCircle2, Clock3, CircleAlert, WalletCards } from 'lucide-react';
import type { DonationManagementSummary } from '../../../lib/api';
import { cn } from '../../../components/ui/cn';
import type { FundingCopy } from '../fundingContent';
import type { Locale } from '../../../lib/i18n';

interface DonationSummaryCardsProps {
  summary?: DonationManagementSummary;
  copy: FundingCopy;
  locale: Locale;
}

const cardStyles = [
  'bg-foundation-50 text-foundation-800 ring-foundation-100',
  'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'bg-amber-50 text-amber-800 ring-amber-100',
  'bg-red-50 text-red-700 ring-red-100',
];

const icons = [WalletCards, CheckCircle2, Clock3, CircleAlert];

export function DonationSummaryCards({ summary, copy, locale }: DonationSummaryCardsProps) {
  const cards = [
    { label: copy.summary.total, value: summary?.total_count ?? 0 },
    { label: copy.summary.confirmed, value: summary?.status_counts.confirmed ?? 0 },
    { label: copy.summary.pending, value: summary?.status_counts.pending ?? 0 },
    { label: copy.summary.failed, value: summary?.status_counts.failed ?? 0 },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = icons[index] ?? WalletCards;

        return (
          <article key={card.label} className="rounded-md border border-ink-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className={cn('grid h-10 w-10 place-items-center rounded-md ring-1', cardStyles[index] ?? cardStyles[0])}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-ink-900 tabular-nums">{new Intl.NumberFormat(locale).format(card.value)}</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-500">{card.label}</p>
          </article>
        );
      })}
    </section>
  );
}
