import { PieChart } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../components/ui/cn';
import type { DonationManagementSummary } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import type { FundingCopy } from '../fundingContent';

const colors = ['#047857', '#0f766e', '#2563eb', '#d97706', '#7c3aed', '#dc2626'];

export function FundingSourceDistributionChart({
  copy,
  locale,
  summary,
  selectedCurrency,
}: {
  copy: FundingCopy;
  locale: Locale;
  summary?: DonationManagementSummary;
  selectedCurrency?: string;
}) {
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const currency = selectedCurrency || strongestCurrency(summary);
  const slices = (summary?.source_distribution ?? [])
    .filter((slice) => slice.currency === currency)
    .map((slice, index) => ({
      ...slice,
      amountValue: Number(slice.amount),
      color: colors[index % colors.length],
    }))
    .filter((slice) => slice.amountValue > 0);
  const total = slices.reduce((sum, slice) => sum + slice.amountValue, 0);
  const activeSlice = slices.find((slice) => slice.source === activeSource) ?? slices[0];

  return (
    <section className="rounded-md border border-ink-100 bg-white p-4 shadow-xs transition duration-200 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-foundation-50 text-foundation-700">
              <PieChart className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-black text-ink-950">{copy.sourceDistributionTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-ink-500">{copy.sourceDistributionDescription}</p>
            </div>
          </div>
        </div>
        {currency ? (
          <span className="inline-flex min-h-9 items-center rounded-md border border-ink-100 bg-ink-50 px-3 text-sm font-black text-ink-800">
            {currency}
          </span>
        ) : null}
      </div>

      {slices.length ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
          <div className="space-y-3">
            <DonutChart
              slices={slices}
              total={total}
              currency={currency}
              locale={locale}
              activeSource={activeSlice?.source}
              onActiveSourceChange={setActiveSource}
            />
            {activeSlice ? (
              <div className="rounded-md border border-foundation-100 bg-foundation-50/70 p-3 text-center shadow-xs">
                <p className="text-xs font-black uppercase text-foundation-700">{activeSlice.source_label || activeSlice.source}</p>
                <p className="mt-1 text-xl font-black text-ink-950">{formatMoney(activeSlice.amountValue, activeSlice.currency, locale)}</p>
                <p className="mt-1 text-xs font-bold text-ink-500">
                  {formatPercent(total > 0 ? (activeSlice.amountValue / total) * 100 : 0, locale)}
                </p>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {slices.map((slice) => {
              const percent = total > 0 ? (slice.amountValue / total) * 100 : 0;
              const isActive = activeSlice?.source === slice.source;

              return (
                <button
                  key={`${slice.source}-${slice.currency}`}
                  type="button"
                  onMouseEnter={() => setActiveSource(slice.source)}
                  onMouseLeave={() => setActiveSource(null)}
                  onFocus={() => setActiveSource(slice.source)}
                  onBlur={() => setActiveSource(null)}
                  className={cn(
                    'focus-ring rounded-md border p-3 text-left shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md',
                    isActive ? 'border-foundation-200 bg-foundation-50' : 'border-ink-100 bg-ink-50/60 hover:border-foundation-100',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('h-3 w-3 rounded-full transition-transform duration-200', isActive && 'scale-125')} style={{ backgroundColor: slice.color }} aria-hidden="true" />
                    <p className="truncate text-sm font-black text-ink-900">{slice.source_label || slice.source}</p>
                  </div>
                  <p className="mt-3 text-xl font-black tabular-nums text-ink-950">{formatMoney(slice.amountValue, slice.currency, locale)}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-ink-500">
                    {formatPercent(percent, locale)} / {slice.count} {slice.count === 1 ? copy.giftLabel : copy.giftsLabel}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-ink-200 bg-ink-50/40 p-5 text-sm text-ink-500">
          {copy.sourceDistributionEmpty}
        </div>
      )}
    </section>
  );
}

function DonutChart({
  slices,
  total,
  currency,
  locale,
  activeSource,
  onActiveSourceChange,
}: {
  slices: Array<{ amountValue: number; color: string; source_label: string; source: string }>;
  total: number;
  currency: string;
  locale: Locale;
  activeSource?: string;
  onActiveSourceChange: (source: string | null) => void;
}) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative mx-auto h-56 w-56" role="img" aria-label={`Funding source distribution for ${currency}`}>
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="22" />
        {slices.map((slice) => {
          const length = total > 0 ? (slice.amountValue / total) * circumference : 0;
          const dashOffset = offset;
          const isActive = activeSource === slice.source;
          offset += length;

          return (
            <circle
              key={slice.source}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={isActive ? 26 : 22}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-dashOffset}
              strokeLinecap="round"
              opacity={activeSource && !isActive ? 0.35 : 1}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => onActiveSourceChange(slice.source)}
              onMouseLeave={() => onActiveSourceChange(null)}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-xs font-bold uppercase text-ink-500">{currency}</p>
        <p className="mt-1 text-xl font-black text-ink-950">{formatCompact(total, locale)}</p>
      </div>
    </div>
  );
}

function strongestCurrency(summary?: DonationManagementSummary) {
  const totals = Object.entries(summary?.currency_totals ?? {});

  if (!totals.length) {
    return '';
  }

  return totals.sort(([, a], [, b]) => Number(b.amount) - Number(a.amount))[0][0];
}

function formatMoney(amount: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCompact(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

function formatPercent(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value / 100);
}
