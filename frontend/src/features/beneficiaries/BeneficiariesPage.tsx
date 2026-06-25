import { Download, RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { PageHeader } from '../../components/ui/PageHeader';
import { cn } from '../../components/ui/cn';
import { readStoredAuthUser } from '../../lib/auth';
import type { BeneficiaryListParams, BeneficiaryRecord } from '../../lib/api';
import { isLocale, type Locale } from '../../lib/i18n';
import { beneficiariesContent, type BeneficiariesCopy } from './beneficiariesContent';
import { BeneficiaryFilters } from './components/BeneficiaryFilters';
import { BeneficiaryProfilePanel } from './components/BeneficiaryProfilePanel';
import { BeneficiaryRecords } from './components/BeneficiaryRecords';
import { BeneficiarySummaryCards } from './components/BeneficiarySummaryCards';
import { useBeneficiaries, useBeneficiary } from './useBeneficiaries';

export function BeneficiariesPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = beneficiariesContent[activeLocale];
  const user = readStoredAuthUser();
  const canViewBeneficiaries = user?.permissions?.includes('beneficiaries.view') ?? false;
  const [filters, setFilters] = useState<BeneficiaryListParams>({
    page: 1,
    per_page: 12,
    sort: 'updated_at',
    direction: 'desc',
  });
  const [selectedBeneficiaryUuid, setSelectedBeneficiaryUuid] = useState<string | null>(null);

  const beneficiariesQuery = useBeneficiaries(filters, canViewBeneficiaries);
  const beneficiaryQuery = useBeneficiary(
    selectedBeneficiaryUuid,
    canViewBeneficiaries && Boolean(selectedBeneficiaryUuid),
  );
  const beneficiaries = beneficiariesQuery.data?.data ?? [];
  const pagination = beneficiariesQuery.data?.meta;
  const selectedBeneficiary = beneficiaryQuery.data ?? null;

  const pageLabel = useMemo(() => {
    if (!pagination) {
      return '';
    }

    return `${pagination.current_page} / ${pagination.last_page}`;
  }, [pagination]);

  if (!canViewBeneficiaries) {
    return (
      <section className="space-y-6">
        <PageHeader title={copy.title} description={copy.description} />
        <DashboardPanel title={copy.accessDeniedTitle}>
          <p className="text-sm leading-6 text-ink-500">{copy.accessDeniedBody}</p>
        </DashboardPanel>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportBeneficiaries(beneficiaries, activeLocale)}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {copy.export}
            </button>
            <button
              type="button"
              onClick={() => beneficiariesQuery.refetch()}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900"
            >
              <RefreshCcw className={cn('h-4 w-4', beneficiariesQuery.isFetching ? 'animate-spin' : '')} aria-hidden="true" />
              {copy.refresh}
            </button>
          </div>
        }
      />

      <BeneficiarySummaryCards summary={beneficiariesQuery.data?.summary} copy={copy} />

      <BeneficiaryFilters
        copy={copy}
        filters={filters}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setSelectedBeneficiaryUuid(null);
        }}
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.55fr)]">
        <DashboardPanel
          title={copy.table.title}
          description={copy.table.description}
          action={pagination ? (
            <PaginationControls
              copy={copy}
              pageLabel={pageLabel}
              canPrevious={Boolean(beneficiariesQuery.data?.links.prev)}
              canNext={Boolean(beneficiariesQuery.data?.links.next)}
              onPrevious={() => setFilters((current) => ({ ...current, page: Math.max((current.page ?? 1) - 1, 1) }))}
              onNext={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            />
          ) : null}
          bodyClassName="p-4"
        >
          {beneficiariesQuery.isError ? (
            <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {beneficiariesQuery.error instanceof Error ? beneficiariesQuery.error.message : copy.table.empty}
            </div>
          ) : (
            <BeneficiaryRecords
              copy={copy}
              locale={activeLocale}
              beneficiaries={beneficiaries}
              isLoading={beneficiariesQuery.isLoading}
              selectedUuid={selectedBeneficiaryUuid}
              onOpen={setSelectedBeneficiaryUuid}
            />
          )}
        </DashboardPanel>

        <BeneficiaryProfilePanel
          copy={copy}
          locale={activeLocale}
          beneficiary={selectedBeneficiary}
          isLoading={beneficiaryQuery.isLoading}
          onClose={() => setSelectedBeneficiaryUuid(null)}
        />
      </div>
    </section>
  );
}

function PaginationControls({
  copy,
  pageLabel,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: {
  copy: BeneficiariesCopy;
  pageLabel: string;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={!canPrevious}
        onClick={onPrevious}
        className="focus-ring min-h-10 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copy.table.previous}
      </button>
      <span className="min-h-10 rounded-md bg-ink-50 px-3 py-2 text-sm font-bold text-ink-700">{pageLabel}</span>
      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        className="focus-ring min-h-10 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copy.table.next}
      </button>
    </div>
  );
}

function exportBeneficiaries(beneficiaries: BeneficiaryRecord[], locale: Locale) {
  if (typeof window === 'undefined' || !beneficiaries.length) {
    return;
  }

  const rows = beneficiaries.map((beneficiary) => ({
    reference: beneficiary.internal_id,
    name: beneficiary.display_name,
    school: beneficiary.school?.name ?? '',
    region: beneficiary.region?.name ?? '',
    class: beneficiary.education_level ?? '',
    status: beneficiary.status_label ?? beneficiary.status,
    funding_gap: beneficiary.funding_summary.funding_gap,
    sponsor_count: beneficiary.case_summary.sponsor_count,
  }));
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvValue(row[header as keyof typeof row])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `beneficiaries-${locale}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}

function csvValue(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}
