import { ArrowRight, Info, UserRound } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { BeneficiaryRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import type { BeneficiariesCopy } from '../beneficiariesContent';
import { currentNeedDescription, currentNeedLabel, formatDate, fundingState, sponsorshipState, statusTone } from '../beneficiaryUtils';

interface BeneficiaryRecordsProps {
  copy: BeneficiariesCopy;
  locale: Locale;
  beneficiaries: BeneficiaryRecord[];
  isLoading: boolean;
  selectedUuid: string | null;
  onOpen: (uuid: string) => void;
}

export function BeneficiaryRecords({
  copy,
  locale,
  beneficiaries,
  isLoading,
  selectedUuid,
  onOpen,
}: BeneficiaryRecordsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-md border border-ink-100 bg-white" />
        ))}
      </div>
    );
  }

  if (!beneficiaries.length) {
    return (
      <div className="rounded-md border border-dashed border-ink-200 bg-ink-50 p-6 text-center text-sm font-medium text-ink-500">
        {copy.table.empty}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {beneficiaries.map((beneficiary) => {
          const funding = fundingState(beneficiary, copy, locale);
          const sponsorship = sponsorshipState(beneficiary, copy);

          return (
            <button
              key={beneficiary.uuid}
              type="button"
              onClick={() => onOpen(beneficiary.uuid)}
              className="focus-ring rounded-md border border-ink-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foundation-100"
              title={`${copy.table.support}: ${beneficiary.status_label ?? beneficiary.status}. ${copy.table.funding}: ${funding.label}. ${copy.table.sponsor}: ${sponsorship.label}.`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink-900">{beneficiary.display_name}</p>
                  <p className="mt-1 text-xs font-semibold text-ink-500">{beneficiary.internal_id}</p>
                </div>
                <StatusBadge label={beneficiary.status_label ?? beneficiary.status} tone={statusTone(beneficiary.status)} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Compact label={copy.table.school} value={beneficiary.school?.name ?? '-'} />
                <Compact label={copy.table.currentNeed} value={currentNeedLabel(beneficiary, copy)} />
                <Compact label={copy.table.funding} value={funding.label} />
                <Compact label={copy.table.sponsor} value={sponsorship.label} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="hidden rounded-md border border-ink-100 bg-white lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              {[
                copy.table.reference,
                copy.table.name,
                copy.table.school,
                copy.table.currentNeed,
              ].map((heading) => <TableHeading key={heading} label={heading} />)}
              <TableHeading label={copy.table.support} help={copy.tableHelp.case} />
              <TableHeading label={copy.table.funding} help={copy.tableHelp.funding} />
              <TableHeading label={copy.table.sponsor} help={copy.tableHelp.sponsorship} />
              {[copy.table.updated, copy.table.actions].map((heading) => <TableHeading key={heading} label={heading} />)}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {beneficiaries.map((beneficiary) => {
              const funding = fundingState(beneficiary, copy, locale);
              const sponsorship = sponsorshipState(beneficiary, copy);
              const currentNeed = currentNeedLabel(beneficiary, copy);
              const currentNeedHelp = currentNeedDescription(beneficiary, copy, locale);

              return (
                <tr
                  key={beneficiary.uuid}
                  className={selectedUuid === beneficiary.uuid ? 'bg-foundation-50/60' : 'transition hover:bg-foundation-50/40'}
                >
                  <td className="px-4 py-4 align-top text-sm font-bold text-ink-900">
                    <div>{beneficiary.internal_id}</div>
                    {beneficiary.application?.application_number ? (
                      <div className="mt-1 text-xs font-semibold text-ink-400">{beneficiary.application.application_number}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foundation-50 text-foundation-700">
                        <UserRound className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink-900">{beneficiary.display_name}</p>
                        <p className="mt-1 truncate text-xs text-ink-500">{beneficiary.guardian_name ?? '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-ink-600">
                    <div className="max-w-[220px]">
                      <p className="font-bold text-ink-900">{beneficiary.school?.name ?? '-'}</p>
                      <p className="mt-1 text-xs font-semibold text-ink-500">{beneficiary.education_level ?? '-'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex max-w-[220px] items-start gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink-900">{currentNeed}</p>
                        <p className="mt-1 text-xs font-semibold text-ink-500">{beneficiary.current_need?.status_label ?? beneficiary.current_need?.status ?? copy.tableHelp.noNeed}</p>
                      </div>
                      <InfoHint label={copy.tableHelp.currentNeed} description={currentNeedHelp} />
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusWithHint
                      label={beneficiary.status_label ?? beneficiary.status}
                      tone={statusTone(beneficiary.status)}
                      description={`${copy.tableHelp.case} ${beneficiary.status_label ?? beneficiary.status}.`}
                    />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusWithHint label={funding.label} tone={funding.tone} description={funding.description} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusWithHint label={sponsorship.label} tone={sponsorship.tone} description={sponsorship.description} />
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-ink-600">{formatDate(beneficiary.case_summary.latest_update_at ?? beneficiary.updated_at, locale)}</td>
                  <td className="px-4 py-4 align-top">
                    <button
                      type="button"
                      onClick={() => onOpen(beneficiary.uuid)}
                      className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-foundation-700 transition hover:bg-foundation-50"
                    >
                      {copy.table.open}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function TableHeading({ label, help }: { label: string; help?: string }) {
  return (
    <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase text-ink-500">
      <span className="inline-flex items-center gap-1.5">
        {label}
        {help ? <InfoHint label={label} description={help} compact /> : null}
      </span>
    </th>
  );
}

function StatusWithHint({ label, tone, description }: { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; description: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <StatusBadge label={label} tone={tone} />
      <InfoHint label={label} description={description} />
    </div>
  );
}

function InfoHint({ label, description, compact = false }: { label: string; description: string; compact?: boolean }) {
  return (
    <span className="group relative inline-flex shrink-0" title={description}>
      <span
        tabIndex={0}
        role="img"
        aria-label={`${label}: ${description}`}
        className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition hover:bg-foundation-50 hover:text-foundation-700 focus-visible:bg-foundation-50 focus-visible:text-foundation-700"
      >
        <Info className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
      </span>
      <span className="pointer-events-none absolute right-0 top-8 z-20 hidden w-72 rounded-md border border-ink-100 bg-white p-3 text-left text-xs font-semibold normal-case leading-5 text-ink-700 shadow-lg group-hover:block group-focus-within:block">
        {description}
      </span>
    </span>
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
