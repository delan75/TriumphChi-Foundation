import { RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { PageHeader } from '../../components/ui/PageHeader';
import { cn } from '../../components/ui/cn';
import { readStoredAuthUser } from '../../lib/auth';
import type { DonationListParams } from '../../lib/api';
import { isLocale, type Locale } from '../../lib/i18n';
import { DonationDetailPanel } from './components/DonationDetailPanel';
import { DonationFilters } from './components/DonationFilters';
import { DonationRecords } from './components/DonationRecords';
import { DonationSummaryCards } from './components/DonationSummaryCards';
import { fundingContent, type FundingCopy } from './fundingContent';
import { useDonation, useDonations } from './useDonations';

export function FundingPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = fundingContent[activeLocale];
  const user = readStoredAuthUser();
  const canViewDonations = user?.permissions?.includes('donations.view') ?? false;
  const [filters, setFilters] = useState<DonationListParams>({
    page: 1,
    per_page: 12,
    sort: 'created_at',
    direction: 'desc',
  });
  const [selectedDonationUuid, setSelectedDonationUuid] = useState<string | null>(null);

  const donationsQuery = useDonations(filters, canViewDonations);
  const donationQuery = useDonation(selectedDonationUuid, canViewDonations && Boolean(selectedDonationUuid));

  const donations = donationsQuery.data?.data ?? [];
  const pagination = donationsQuery.data?.meta;
  const selectedDonation = donationQuery.data ?? null;

  const pageLabel = useMemo(() => {
    if (!pagination) {
      return '';
    }

    return `${pagination.current_page} / ${pagination.last_page}`;
  }, [pagination]);

  if (!canViewDonations) {
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
          <button
            type="button"
            onClick={() => donationsQuery.refetch()}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900"
          >
            <RefreshCcw className={cn('h-4 w-4', donationsQuery.isFetching ? 'animate-spin' : '')} aria-hidden="true" />
            {copy.refresh}
          </button>
        }
      />

      <DonationSummaryCards summary={donationsQuery.data?.summary} copy={copy} locale={activeLocale} />

      <DonationFilters
        copy={copy}
        filters={filters}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setSelectedDonationUuid(null);
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
        <DashboardPanel
          title={copy.tableTitle}
          description={copy.tableDescription}
          action={pagination ? (
            <PaginationControls
              copy={copy}
              pageLabel={pageLabel}
              canPrevious={Boolean(donationsQuery.data?.links.prev)}
              canNext={Boolean(donationsQuery.data?.links.next)}
              onPrevious={() => setFilters((current) => ({ ...current, page: Math.max((current.page ?? 1) - 1, 1) }))}
              onNext={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            />
          ) : null}
          bodyClassName="p-4"
        >
          {donationsQuery.isError ? (
            <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {donationsQuery.error instanceof Error ? donationsQuery.error.message : copy.empty}
            </div>
          ) : (
            <DonationRecords
              copy={copy}
              locale={activeLocale}
              donations={donations}
              isLoading={donationsQuery.isLoading}
              onOpen={setSelectedDonationUuid}
            />
          )}
        </DashboardPanel>

        <DonationDetailPanel
          copy={copy}
          locale={activeLocale}
          donation={selectedDonation}
          isLoading={donationQuery.isLoading}
          onClose={() => setSelectedDonationUuid(null)}
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
  copy: FundingCopy;
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
        {copy.previous}
      </button>
      <span className="min-h-10 rounded-md bg-ink-50 px-3 py-2 text-sm font-bold text-ink-700">{pageLabel}</span>
      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        className="focus-ring min-h-10 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copy.next}
      </button>
      <span className="sr-only">{copy.tableTitle}</span>
    </div>
  );
}
