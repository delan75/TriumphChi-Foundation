import { BookOpen, FileText, History, School, ShieldCheck, UserRound, WalletCards, X, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DashboardPanel } from '../../../components/staff/DashboardPanel';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { cn } from '../../../components/ui/cn';
import type { BeneficiaryRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import type { BeneficiariesCopy } from '../beneficiariesContent';
import { formatDate, formatMoney, statusTone } from '../beneficiaryUtils';

interface BeneficiaryProfilePanelProps {
  copy: BeneficiariesCopy;
  locale: Locale;
  beneficiary: BeneficiaryRecord | null;
  isLoading: boolean;
  onClose: () => void;
}

type TabKey = 'overview' | 'education' | 'needs' | 'funding' | 'documents' | 'history' | 'mentorship' | 'audit';

export function BeneficiaryProfilePanel({ copy, locale, beneficiary, isLoading, onClose }: BeneficiaryProfilePanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const tabs = useMemo(() => {
    const base: Array<{ key: TabKey; label: string; icon: LucideIcon }> = [
      { key: 'overview', label: copy.profile.tabs.overview, icon: UserRound },
      { key: 'education', label: copy.profile.tabs.education, icon: School },
      { key: 'needs', label: copy.profile.tabs.needs, icon: BookOpen },
      { key: 'history', label: copy.profile.tabs.history, icon: History },
      { key: 'documents', label: copy.profile.tabs.documents, icon: FileText },
      { key: 'mentorship', label: copy.profile.tabs.mentorship, icon: ShieldCheck },
      { key: 'audit', label: copy.profile.tabs.audit, icon: History },
    ];

    if (beneficiary?.permissions.can_view_funding) {
      base.splice(3, 0, { key: 'funding', label: copy.profile.tabs.funding, icon: WalletCards });
    }

    return base;
  }, [beneficiary?.permissions.can_view_funding, copy]);

  if (!beneficiary && !isLoading) {
    return (
      <DashboardPanel title={copy.profile.title} bodyClassName="p-6">
        <div className="rounded-md border border-dashed border-ink-200 bg-ink-50 p-6 text-center text-sm font-medium text-ink-500">
          {copy.profile.empty}
        </div>
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel
      title={copy.profile.title}
      className="min-w-0"
      action={
        beneficiary ? (
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-200 text-ink-600 transition hover:bg-ink-50"
            aria-label={copy.profile.close}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null
      }
      bodyClassName="p-0"
    >
      {isLoading || !beneficiary ? (
        <div className="space-y-4 p-5">
          <div className="h-24 animate-pulse rounded-md bg-ink-100" />
          <div className="h-48 animate-pulse rounded-md bg-ink-100" />
        </div>
      ) : (
        <div>
          <header className="border-b border-ink-100 p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-foundation-50 text-foundation-700">
                <UserRound className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-ink-400">{beneficiary.internal_id}</p>
                <h3 className="mt-1 text-xl font-black text-ink-900">{beneficiary.display_name}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge label={beneficiary.status_label ?? beneficiary.status} tone={statusTone(beneficiary.status)} />
                  <StatusBadge
                    label={beneficiary.funding_summary.has_funding_gap ? copy.filters.fundingGap : copy.filters.funded}
                    tone={beneficiary.funding_summary.has_funding_gap ? 'warning' : 'success'}
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="border-b border-ink-100 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-bold transition',
                    activeTab === tab.key ? 'bg-foundation-600 text-white' : 'text-ink-600 hover:bg-ink-50',
                  )}
                >
                  <tab.icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {activeTab === 'overview' ? <OverviewTab beneficiary={beneficiary} copy={copy} locale={locale} /> : null}
            {activeTab === 'education' ? <EducationTab beneficiary={beneficiary} copy={copy} locale={locale} /> : null}
            {activeTab === 'needs' ? <NeedsTab beneficiary={beneficiary} copy={copy} locale={locale} /> : null}
            {activeTab === 'funding' && beneficiary.permissions.can_view_funding ? (
              <FundingTab beneficiary={beneficiary} copy={copy} locale={locale} />
            ) : null}
            {activeTab === 'history' ? <HistoryTab beneficiary={beneficiary} copy={copy} locale={locale} /> : null}
            {activeTab === 'documents' ? <EmptyPanel icon={FileText} text={copy.profile.documentsQueued} /> : null}
            {activeTab === 'mentorship' ? <EmptyPanel icon={ShieldCheck} text={copy.profile.mentorshipQueued} /> : null}
            {activeTab === 'audit' ? <EmptyPanel icon={History} text={copy.profile.auditQueued} /> : null}
          </div>
        </div>
      )}
    </DashboardPanel>
  );
}

function OverviewTab({ beneficiary, copy, locale }: { beneficiary: BeneficiaryRecord; copy: BeneficiariesCopy; locale: Locale }) {
  const workflow = [
    copy.profile.application,
    copy.profile.verification,
    copy.profile.review,
    copy.profile.accepted,
    copy.profile.active,
    copy.profile.graduated,
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label={copy.profile.currentNeed} value={beneficiary.needs?.[0]?.title ?? '-'} />
        <Metric
          label={copy.profile.fundingStatus}
          value={`${beneficiary.funding_summary.funding_percentage}%`}
          subValue={formatMoney(beneficiary.funding_summary.funding_gap, beneficiary.funding_summary.currency, locale)}
        />
        <Metric label={copy.profile.sponsorCount} value={String(beneficiary.case_summary.sponsor_count)} />
        <Metric label={copy.profile.schoolVisit} value={formatDate(beneficiary.case_summary.latest_update_at, locale)} />
      </div>

      <div className="rounded-md border border-ink-100 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Fact label={copy.profile.gender} value={displayValue(beneficiary.gender)} />
          <Fact label={copy.profile.sourceApplication} value={beneficiary.application?.application_number ?? '-'} />
          <Fact label={copy.profile.region} value={beneficiary.region?.name ?? '-'} />
          <Fact label={copy.profile.village} value={beneficiary.village?.name ?? '-'} />
          <Fact label={copy.profile.guardian} value={beneficiary.guardian_name ?? '-'} />
          <Fact label={copy.profile.phone} value={beneficiary.guardian_phone ?? '-'} />
          <Fact label={copy.profile.joined} value={formatDate(beneficiary.admission_date ?? beneficiary.created_at, locale)} />
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-ink-50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {workflow.map((step, index) => (
            <span
              key={step}
              className={cn(
                'rounded-md px-3 py-2 text-xs font-black uppercase',
                index < 4 ? 'bg-foundation-600 text-white' : 'bg-white text-ink-500',
              )}
            >
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EducationTab({ beneficiary, copy, locale }: { beneficiary: BeneficiaryRecord; copy: BeneficiariesCopy; locale: Locale }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Metric label={copy.profile.school} value={beneficiary.school?.name ?? '-'} />
      <Metric label={copy.profile.region} value={beneficiary.school?.region?.name ?? beneficiary.region?.name ?? '-'} />
      <Metric label={copy.table.classLevel} value={beneficiary.education_level ?? '-'} />
      <Metric label={copy.profile.joined} value={formatDate(beneficiary.admission_date, locale)} />
    </div>
  );
}

function NeedsTab({ beneficiary, copy, locale }: { beneficiary: BeneficiaryRecord; copy: BeneficiariesCopy; locale: Locale }) {
  const needs = beneficiary.needs ?? [];

  if (!needs.length) {
    return <EmptyPanel icon={BookOpen} text={copy.profile.noData} />;
  }

  return (
    <div className="space-y-3">
      {needs.map((need) => (
        <article key={need.uuid} className="rounded-md border border-ink-100 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black text-ink-900">{need.title}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-ink-400">{need.type}</p>
            </div>
            <StatusBadge label={need.status_label ?? need.status} tone={statusTone(need.status)} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Fact label={copy.profile.amountRequired} value={formatMoney(need.amount_required, beneficiary.funding_summary.currency, locale)} />
            <Fact label={copy.profile.amountFunded} value={formatMoney(need.amount_funded, beneficiary.funding_summary.currency, locale)} />
            <Fact label={copy.profile.fundingStatus} value={`${need.funding_percentage}%`} />
          </div>
        </article>
      ))}
    </div>
  );
}

function FundingTab({ beneficiary, copy, locale }: { beneficiary: BeneficiaryRecord; copy: BeneficiariesCopy; locale: Locale }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label={copy.profile.amountFunded}
          value={formatMoney(beneficiary.funding_summary.amount_funded, beneficiary.funding_summary.currency, locale)}
        />
        <Metric
          label={copy.profile.gap}
          value={formatMoney(beneficiary.funding_summary.funding_gap, beneficiary.funding_summary.currency, locale)}
        />
        <Metric
          label={copy.profile.payments}
          value={formatMoney(beneficiary.funding_summary.payments_total, beneficiary.funding_summary.currency, locale)}
        />
      </div>
      <RelatedList
        title={copy.profile.contributions}
        empty={copy.profile.noData}
        rows={(beneficiary.sponsorships ?? []).map((item) => ({
          id: item.uuid,
          title: item.donor?.name ?? item.reference,
          meta: item.status_label ?? item.status,
          value: formatMoney(item.pledged_amount, item.currency, locale),
        }))}
      />
      <RelatedList
        title={copy.profile.payments}
        empty={copy.profile.noData}
        rows={(beneficiary.payments ?? []).map((item) => ({
          id: item.uuid,
          title: item.payee_name,
          meta: item.status_label ?? item.status,
          value: formatMoney(item.amount, item.currency, locale),
        }))}
      />
    </div>
  );
}

function HistoryTab({ beneficiary, copy, locale }: { beneficiary: BeneficiaryRecord; copy: BeneficiariesCopy; locale: Locale }) {
  const history = beneficiary.support_history ?? [];

  if (!history.length) {
    return <EmptyPanel icon={History} text={copy.profile.noData} />;
  }

  return (
    <div className="space-y-3">
      {history.map((item, index) => (
        <article key={`${item.type}-${item.happened_at}-${index}`} className="rounded-md border border-ink-100 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-ink-900">{item.title}</p>
              {item.description ? <p className="mt-1 text-sm text-ink-500">{item.description}</p> : null}
            </div>
            <p className="shrink-0 text-xs font-bold text-ink-400">{formatDate(item.happened_at, locale)}</p>
          </div>
          {item.actor ? <p className="mt-3 text-xs font-semibold uppercase text-ink-400">{item.actor}</p> : null}
        </article>
      ))}
    </div>
  );
}

function RelatedList({ title, rows, empty }: { title: string; empty: string; rows: Array<{ id: string; title: string; meta: string; value: string }> }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white">
      <h4 className="border-b border-ink-100 px-4 py-3 text-sm font-black text-ink-900">{title}</h4>
      {rows.length ? (
        <div className="divide-y divide-ink-100">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">{row.title}</p>
                <p className="mt-1 text-xs text-ink-500">{row.meta}</p>
              </div>
              <p className="shrink-0 text-sm font-black text-ink-900">{row.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-4 py-5 text-sm font-medium text-ink-500">{empty}</p>
      )}
    </div>
  );
}

function Metric({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-4">
      <p className="text-xs font-bold uppercase text-ink-400">{label}</p>
      <p className="mt-2 text-lg font-black text-ink-900">{value}</p>
      {subValue ? <p className="mt-1 text-xs font-semibold text-ink-500">{subValue}</p> : null}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-ink-50 px-3 py-3">
      <p className="text-[11px] font-black uppercase leading-none text-ink-400">{label}</p>
      <p className="mt-2 break-words text-sm font-black leading-5 text-ink-900">{value}</p>
    </div>
  );
}

function displayValue(value: string | null | undefined) {
  if (!value) {
    return '-';
  }

  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function EmptyPanel({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink-200 bg-ink-50 p-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-white text-ink-500 shadow-sm">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-ink-500">{text}</p>
    </div>
  );
}
