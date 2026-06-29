import { ShieldCheck, UserCheck, UserPlus, UserRoundX, LockKeyhole } from 'lucide-react';
import type { ManagedUserSummary } from '../../../lib/api';
import type { UsersCopy } from '../usersContent';

interface UserSummaryCardsProps {
  summary?: ManagedUserSummary;
  copy: UsersCopy;
}

export function UserSummaryCards({ summary, copy }: UserSummaryCardsProps) {
  const cards = [
    { label: copy.summary.total, value: summary?.total_count ?? 0, icon: ShieldCheck, tone: 'bg-foundation-50 text-foundation-700' },
    { label: copy.summary.active, value: summary?.active_count ?? 0, icon: UserCheck, tone: 'bg-emerald-50 text-emerald-700' },
    { label: copy.summary.invited, value: summary?.invited_count ?? 0, icon: UserPlus, tone: 'bg-blue-50 text-blue-700' },
    { label: copy.summary.suspended, value: summary?.suspended_count ?? 0, icon: UserRoundX, tone: 'bg-amber-50 text-amber-700' },
    { label: copy.summary.locked, value: summary?.locked_count ?? 0, icon: LockKeyhole, tone: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article key={card.label} className="rounded-md border border-ink-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-500">{card.label}</p>
              <p className="mt-2 text-2xl font-black tabular-nums text-ink-900">{card.value}</p>
            </div>
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${card.tone}`}>
              <card.icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
