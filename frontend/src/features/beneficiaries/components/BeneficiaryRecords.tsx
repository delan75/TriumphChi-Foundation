import { ArrowRight, UserRound } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { BeneficiaryRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import type { BeneficiariesCopy } from '../beneficiariesContent';
import { formatDate, fundingStatusLabel, sponsorStatusLabel, statusTone } from '../beneficiaryUtils';

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
        {beneficiaries.map((beneficiary) => (
          <button
            key={beneficiary.uuid}
            type="button"
            onClick={() => onOpen(beneficiary.uuid)}
            className="focus-ring rounded-md border border-ink-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foundation-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink-900">{beneficiary.display_name}</p>
                <p className="mt-1 text-xs font-semibold text-ink-500">{beneficiary.internal_id}</p>
              </div>
              <StatusBadge label={beneficiary.status_label ?? beneficiary.status} tone={statusTone(beneficiary.status)} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Compact label={copy.table.application} value={beneficiary.application?.application_number ?? '-'} />
              <Compact label={copy.table.school} value={beneficiary.school?.name ?? '-'} />
              <Compact label={copy.table.classLevel} value={beneficiary.education_level ?? '-'} />
              <Compact
                label={copy.table.funding}
                value={fundingStatusLabel(beneficiary.funding_summary.has_funding_gap, copy.filters)}
              />
              <Compact
                label={copy.table.sponsor}
                value={sponsorStatusLabel(beneficiary.case_summary.sponsor_count, copy.filters)}
              />
            </div>
          </button>
        ))}
      </div>

      <div className="hidden rounded-md border border-ink-100 bg-white lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              {[
                copy.table.reference,
                copy.table.application,
                copy.table.name,
                copy.table.age,
                copy.table.school,
                copy.table.classLevel,
                copy.table.support,
                copy.table.funding,
                copy.table.sponsor,
                copy.table.updated,
                copy.table.actions,
              ].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase text-ink-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {beneficiaries.map((beneficiary) => (
              <tr
                key={beneficiary.uuid}
                className={selectedUuid === beneficiary.uuid ? 'bg-foundation-50/60' : 'transition hover:bg-foundation-50/40'}
              >
                <td className="px-4 py-4 text-sm font-bold text-ink-900">{beneficiary.internal_id}</td>
                <td className="px-4 py-4 text-sm font-semibold text-ink-600">{beneficiary.application?.application_number ?? '-'}</td>
                <td className="px-4 py-4">
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
                <td className="px-4 py-4 text-sm text-ink-600">{beneficiary.age ?? '-'}</td>
                <td className="px-4 py-4 text-sm text-ink-600">{beneficiary.school?.name ?? '-'}</td>
                <td className="px-4 py-4 text-sm text-ink-600">{beneficiary.education_level ?? '-'}</td>
                <td className="px-4 py-4">
                  <StatusBadge label={beneficiary.status_label ?? beneficiary.status} tone={statusTone(beneficiary.status)} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={fundingStatusLabel(beneficiary.funding_summary.has_funding_gap, copy.filters)}
                    tone={beneficiary.funding_summary.has_funding_gap ? 'warning' : 'success'}
                  />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={sponsorStatusLabel(beneficiary.case_summary.sponsor_count, copy.filters)}
                    tone={beneficiary.case_summary.sponsor_count > 0 ? 'success' : 'warning'}
                  />
                </td>
                <td className="px-4 py-4 text-sm text-ink-600">{formatDate(beneficiary.case_summary.latest_update_at ?? beneficiary.updated_at, locale)}</td>
                <td className="px-4 py-4">
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
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </>
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
