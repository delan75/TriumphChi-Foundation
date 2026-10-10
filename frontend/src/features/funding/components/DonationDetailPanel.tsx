import { RefreshCcw, X } from 'lucide-react';
import { DashboardPanel } from '../../../components/staff/DashboardPanel';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { DonationManagementRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import type { FundingCopy } from '../fundingContent';
import { formatDate, formatMoney, statusTone } from './DonationRecords';

interface DonationDetailPanelProps {
  copy: FundingCopy;
  locale: Locale;
  donation: DonationManagementRecord | null;
  isLoading: boolean;
  isRefreshingPaymentStatus: boolean;
  onRefreshPaymentStatus: (uuid: string) => void;
  onClose: () => void;
}

export function DonationDetailPanel({
  copy,
  locale,
  donation,
  isLoading,
  isRefreshingPaymentStatus,
  onRefreshPaymentStatus,
  onClose,
}: DonationDetailPanelProps) {
  if (!donation && !isLoading) {
    return null;
  }

  const canRefreshPaypalStatus = Boolean(
    donation
      && donation.provider === 'paypal'
      && donation.permissions.can_approve
      && ['pending', 'processing'].includes(donation.status),
  );

  return (
    /* 1. Made the parent element sticky */
    <aside className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col rounded-md border border-ink-100 bg-white shadow-xs">
      {/* 2. Kept the header non-scrollable at the top */}
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase text-foundation-600">{copy.detailTitle}</p>
          <h2 className="mt-1 text-lg font-bold text-ink-900">{donation?.reference_number ?? copy.loading}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
          aria-label={copy.close}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      {isLoading ? (
        <div className="grid gap-3 overflow-y-auto p-5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-md bg-ink-100" />
          ))}
        </div>
      ) : donation ? (
        <div className="grid gap-5 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <DetailStat label={copy.amount} value={formatMoney(donation.amount, donation.currency, locale)} />
            <DetailStat label={copy.donor} value={donation.donor?.name ?? '-'} />
            <DetailStat label={copy.fund} value={donation.fund?.name ?? '-'} />
            <DetailStat label={copy.providerReference} value={donation.provider_reference ?? '-'} />
            <DetailStat label={copy.receipt} value={donation.receipt_available ? copy.receiptAvailable : copy.receiptMissing} />
            <div className="rounded-md border border-ink-100 bg-ink-50 p-3">
              <p className="text-xs font-bold uppercase text-ink-400">{copy.status}</p>
              <div className="mt-2">
                <StatusBadge label={donation.status_label ?? donation.status} tone={statusTone(donation.status)} />
              </div>
            </div>
          </div>

          {canRefreshPaypalStatus && donation ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-amber-950">{copy.paymentReviewTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-amber-900">{copy.paymentReviewBody}</p>
                </div>
                <button
                  type="button"
                  disabled={isRefreshingPaymentStatus}
                  onClick={() => onRefreshPaymentStatus(donation.uuid)}
                  className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-amber-700 px-4 text-sm font-black text-white transition hover:bg-amber-900 disabled:cursor-wait disabled:opacity-70"
                >
                  <RefreshCcw className={`h-4 w-4 ${isRefreshingPaymentStatus ? 'animate-spin' : ''}`} aria-hidden="true" />
                  {isRefreshingPaymentStatus ? copy.refreshingPaymentStatus : copy.refreshPaymentStatus}
                </button>
              </div>
            </div>
          ) : null}

          <DashboardPanel title={copy.latestIntent} bodyClassName="p-4">
            {/* Add optional chaining here */}
            {donation.payment_summary?.latest_intent ? (
              <div className="grid gap-2 text-sm">
                {/* And add optional chaining here */}
                <Line label="Reference" value={donation.payment_summary.latest_intent.intent_reference} />
                <Line label={copy.provider} value={donation.payment_summary.latest_intent.provider ?? '-'} />
                <Line label={copy.status} value={donation.payment_summary.latest_intent.status} />
              </div>
            ) : (
              <p className="text-sm text-ink-500">{copy.noTransactions}</p>
            )}
          </DashboardPanel>

          <DashboardPanel title={copy.allocationTrace} bodyClassName="p-4">
            {donation.allocations?.length ? (
              <div className="space-y-3">
                {donation.allocations.map((allocation) => (
                  <div key={allocation.uuid} className="rounded-md border border-ink-100 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-ink-900">{allocation.educational_need?.title ?? allocation.allocation_reference}</p>
                        <p className="mt-1 text-xs text-ink-500">{allocation.allocation_reference}</p>
                      </div>
                      <StatusBadge label={allocation.status_label ?? allocation.status} tone={statusTone(allocation.status)} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-ink-900">{formatMoney(allocation.amount, allocation.currency, locale)}</p>
                    {allocation.educational_need?.beneficiary ? (
                      <p className="mt-1 text-xs text-ink-500">{allocation.educational_need.beneficiary.internal_id} / {allocation.educational_need.beneficiary.display_name}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">{copy.noAllocations}</p>
            )}
          </DashboardPanel>

          <DashboardPanel title={copy.documentTrace} bodyClassName="p-4">
            {donation.documents?.length ? (
              <div className="space-y-3">
                {donation.documents.map((document) => (
                  <a
                    key={document.uuid}
                    href={document.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring flex items-start justify-between gap-4 rounded-md border border-ink-100 p-3 transition hover:border-foundation-100 hover:bg-foundation-50/50"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink-900">{document.title}</p>
                      <p className="mt-1 text-xs text-ink-500">{document.document_number}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-foundation-600 px-3 py-2 text-xs font-bold text-white">
                      {copy.download}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">{copy.noDocuments}</p>
            )}
          </DashboardPanel>

          <DashboardPanel title={copy.transactionTrace} bodyClassName="p-4">
            {donation.transactions?.length ? (
              <div className="space-y-3">
                {donation.transactions.map((transaction) => (
                  <div key={transaction.uuid} className="rounded-md border border-ink-100 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-ink-900">{transaction.transaction_reference ?? transaction.type}</p>
                        <p className="mt-1 text-xs text-ink-500">{transaction.provider_transaction_id ?? '-'}</p>
                      </div>
                      <StatusBadge label={transaction.status} tone={statusTone(transaction.status)} />
                    </div>
                    <p className="mt-3 text-sm text-ink-600">{formatMoney(transaction.amount, transaction.currency, locale)} / {formatDate(transaction.processed_at, locale)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">{copy.noTransactions}</p>
            )}
          </DashboardPanel>
        </div>
      ) : null}
    </aside>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-3">
      <p className="text-xs font-bold uppercase text-ink-400">{label}</p>
      <p className="mt-1 wrap-break-word text-sm font-bold text-ink-900">{value}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-ink-500">{label}</span>
      <span className="text-right font-bold text-ink-900">{value}</span>
    </div>
  );
}
