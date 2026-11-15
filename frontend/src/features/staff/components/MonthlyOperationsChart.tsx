import { BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../../components/ui/cn';
import type { DashboardMonthlyActivityPoint } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import type { StaffDashboardText } from '../../../content/staffDashboard';

type MetricKey = 'funds' | 'applications' | 'gifts';

const metricStyles: Record<MetricKey, { bar: string; active: string }> = {
  funds: { bar: 'bg-foundation-600', active: 'bg-foundation-600 text-white' },
  applications: { bar: 'bg-blue-600', active: 'bg-blue-600 text-white' },
  gifts: { bar: 'bg-amber-500', active: 'bg-amber-500 text-white' },
};

export function MonthlyOperationsChart({
  copy,
  locale,
  data,
}: {
  copy: StaffDashboardText;
  locale: Locale;
  data: DashboardMonthlyActivityPoint[];
}) {
  const [metric, setMetric] = useState<MetricKey>('funds');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const displayCurrency = useMemo(() => strongestCurrency(data), [data]);
  const points = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        funds: Number(point.donations_amounts?.[displayCurrency] ?? 0),
        applications: point.applications_count,
        gifts: point.donations_count,
      })),
    [data, displayCurrency],
  );
  const maxValue = Math.max(...points.map((point) => point[metric]), 0);
  const total = points.reduce((sum, point) => sum + point[metric], 0);
  const peak = points.reduce<(typeof points)[number] | null>((current, point) => {
    if (!current || point[metric] > current[metric]) {
      return point;
    }

    return current;
  }, null);
  const activePoint = points.find((point) => point.key === activeKey) ?? peak;

  return (
    <section className="rounded-md border border-ink-100 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-foundation-50 text-foundation-700">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-black text-ink-950">{copy.analyticsSectionTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-ink-500">
                {copy.analyticsSectionDescription}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricButton
            active={metric === 'funds'}
            label={
              displayCurrency
                ? `${copy.chartLabels.fundsRaised} (${displayCurrency})`
                : copy.chartLabels.fundsRaised
            }
            onClick={() => setMetric('funds')}
            tone={metricStyles.funds.active}
          />
          <MetricButton
            active={metric === 'applications'}
            label={copy.chartLabels.applications}
            onClick={() => setMetric('applications')}
            tone={metricStyles.applications.active}
          />
          <MetricButton
            active={metric === 'gifts'}
            label={copy.chartLabels.gifts}
            onClick={() => setMetric('gifts')}
            tone={metricStyles.gifts.active}
          />
        </div>
      </div>

      {points.length && maxValue > 0 ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SummaryBox
              label={metricLabel(copy, metric, displayCurrency)}
              value={formatValue(total, metric, locale, displayCurrency)}
            />
            <SummaryBox
              label={copy.chartLabels.peakMonth}
              value={
                peak
                  ? `${peak.label} / ${formatValue(peak[metric], metric, locale, displayCurrency)}`
                  : '-'
              }
            />
          </div>
          {activePoint ? (
            <div className="mt-4 rounded-md border border-foundation-100 bg-foundation-50/70 p-4 shadow-xs transition duration-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-foundation-700">
                    {activePoint.label}
                  </p>
                  <p className="mt-1 text-2xl font-black text-ink-950">
                    {formatValue(activePoint[metric], metric, locale, displayCurrency)}
                  </p>
                </div>
                <dl className="grid gap-2 text-sm sm:min-w-72 sm:grid-cols-3">
                  <MiniStat
                    label={
                      displayCurrency
                        ? `${copy.chartLabels.fundsRaised} (${displayCurrency})`
                        : copy.chartLabels.fundsRaised
                    }
                    value={formatValue(activePoint.funds, 'funds', locale, displayCurrency)}
                  />
                  <MiniStat
                    label={copy.chartLabels.applications}
                    value={formatValue(
                      activePoint.applications,
                      'applications',
                      locale,
                      displayCurrency,
                    )}
                  />
                  <MiniStat
                    label={copy.chartLabels.gifts}
                    value={formatValue(activePoint.gifts, 'gifts', locale, displayCurrency)}
                  />
                </dl>
              </div>
            </div>
          ) : null}
          <div className="mt-6 overflow-x-auto pb-2">
            <div
              className="flex min-w-[720px] items-end gap-3"
              role="img"
              aria-label={copy.analyticsSectionTitle}
            >
              {points.map((point) => {
                const value = point[metric];
                const height = maxValue > 0 ? Math.max(8, (value / maxValue) * 180) : 8;
                const isActive = activePoint?.key === point.key;

                return (
                  <button
                    key={point.key}
                    type="button"
                    onMouseEnter={() => setActiveKey(point.key)}
                    onMouseLeave={() => setActiveKey(null)}
                    onFocus={() => setActiveKey(point.key)}
                    onBlur={() => setActiveKey(null)}
                    className="focus-ring group relative flex min-w-12 flex-1 cursor-pointer flex-col items-center gap-2 rounded-md p-1 transition duration-200 hover:-translate-y-1"
                    aria-label={`${point.label}: ${formatValue(value, metric, locale, displayCurrency)}`}
                  >
                    <div
                      className={cn(
                        'flex h-48 w-full items-end rounded-md px-1.5 transition duration-200',
                        isActive
                          ? 'bg-foundation-50 shadow-inner ring-1 ring-foundation-100'
                          : 'bg-ink-50 group-hover:bg-ink-100/70',
                      )}
                    >
                      <div
                        className={cn(
                          'w-full rounded-t-md shadow-xs transition-[height,filter,transform] duration-300 group-hover:brightness-110',
                          isActive && 'scale-x-105 brightness-110',
                          metricStyles[metric].bar,
                        )}
                        style={{ height: `${height}px` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'max-w-16 truncate text-center text-[11px] font-bold uppercase transition-colors',
                        isActive ? 'text-foundation-800' : 'text-ink-500 group-hover:text-ink-700',
                      )}
                    >
                      {shortMonth(point.label)}
                    </span>
                    <span className="pointer-events-none absolute -top-12 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-950 px-3 py-2 text-xs font-bold text-white shadow-lg group-hover:block group-focus:block">
                      {formatValue(value, metric, locale, displayCurrency)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-ink-200 bg-ink-50/40 p-5 text-sm text-ink-500">
          {copy.chartLabels.empty}
        </div>
      )}
    </section>
  );
}

function MetricButton({
  active,
  label,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'focus-ring inline-flex min-h-10 items-center rounded-md border px-3 text-xs font-black transition',
        active ? tone : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
      )}
    >
      {label}
    </button>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-ink-50/60 p-3">
      <p className="text-xs font-bold uppercase text-ink-500">{label}</p>
      <p className="mt-1 text-lg font-black text-ink-950">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase text-ink-500">{label}</dt>
      <dd className="mt-1 font-black text-ink-950">{value}</dd>
    </div>
  );
}

function formatValue(value: number, metric: MetricKey, locale: Locale, currency: string) {
  if (metric === 'funds') {
    if (currency) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value);
    }

    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat(locale).format(value);
}

function shortMonth(label: string) {
  return label.split(' ')[0] ?? label;
}

function strongestCurrency(data: DashboardMonthlyActivityPoint[]) {
  const totals = new Map<string, number>();

  data.forEach((point) => {
    Object.entries(point.donations_amounts ?? {}).forEach(([currency, amount]) => {
      totals.set(currency, (totals.get(currency) ?? 0) + Number(amount));
    });
  });

  return [...totals.entries()].sort(([, a], [, b]) => b - a)[0]?.[0] ?? '';
}

function metricLabel(copy: StaffDashboardText, metric: MetricKey, currency: string) {
  if (metric === 'funds') {
    return currency
      ? `${copy.chartLabels.fundsRaised} (${currency})`
      : copy.chartLabels.fundsRaised;
  }

  return metric === 'applications' ? copy.chartLabels.applications : copy.chartLabels.gifts;
}
