import {
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  MapPinned,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import type { BeneficiarySummary } from '../../../lib/api';
import type { BeneficiariesCopy } from '../beneficiariesContent';

interface BeneficiarySummaryCardsProps {
  summary?: BeneficiarySummary;
  copy: BeneficiariesCopy;
}

export function BeneficiarySummaryCards({ summary, copy }: BeneficiarySummaryCardsProps) {
  const cards = [
    {
      label: copy.summary.total,
      value: summary?.total_count ?? 0,
      icon: UsersRound,
      tone: 'bg-foundation-50 text-foundation-800',
    },
    {
      label: copy.summary.active,
      value: summary?.active_support_count ?? 0,
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: copy.summary.awaiting,
      value: summary?.awaiting_sponsorship_count ?? 0,
      icon: WalletCards,
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      label: copy.summary.fundingGap,
      value: summary?.funding_gap_count ?? 0,
      icon: AlertTriangle,
      tone: 'bg-amber-50 text-amber-800',
    },
    {
      label: copy.summary.schoolChanges,
      value: summary?.school_changes_count ?? 0,
      icon: MapPinned,
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      label: copy.summary.graduated,
      value: summary?.graduated_count ?? 0,
      icon: GraduationCap,
      tone: 'bg-ink-100 text-ink-700',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-md border border-ink-100 bg-white p-4 shadow-xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-ink-400">{card.label}</p>
              <p className="mt-2 text-2xl font-black text-ink-900">{card.value.toLocaleString()}</p>
            </div>
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${card.tone}`}>
              <card.icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
