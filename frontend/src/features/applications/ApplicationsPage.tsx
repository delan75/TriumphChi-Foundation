import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardList,
  Filter,
  Loader2,
  Phone,
  RefreshCcw,
  Search,
  User,
  X,
} from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cn } from '../../components/ui/cn';
import {
  apiListApplications,
  apiTransitionApplicationStatus,
  type ApplicationRecord,
  type PaginatedResponse,
} from '../../lib/api';
import { isLocale } from '../../lib/i18n';

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  en: {
    title: 'Applications',
    description: 'Review, verify and manage all education support applications.',
    searchPlaceholder: 'Search by name or reference…',
    filterLabel: 'Filter by status',
    allStatuses: 'All statuses',
    sourceLabel: 'Source',
    allSources: 'All sources',
    statusLabels: {
      draft: 'Draft',
      submitted: 'Submitted',
      verification_pending: 'Verification pending',
      verified: 'Verified',
      review_pending: 'Review pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
    } as Record<string, string>,
    sourceLabels: {
      online: 'Online',
      school: 'School',
      field_officer: 'Field officer',
      ngo_staff: 'NGO staff',
    } as Record<string, string>,
    columns: {
      reference: 'Reference',
      applicant: 'Applicant',
      status: 'Status',
      source: 'Source',
      region: 'Region',
      submitted: 'Submitted',
    },
    empty: 'No applications match your filters.',
    loadError: 'Failed to load applications.',
    retry: 'Retry',
    of: 'of',
    results: 'results',
    page: 'Page',
    prev: 'Previous',
    next: 'Next',
    open: 'Open',
    // Detail panel
    panel: {
      title: 'Application detail',
      close: 'Close',
      ref: 'Reference',
      status: 'Status',
      source: 'Source',
      applicant: 'Applicant',
      gender: 'Gender',
      dob: 'Date of birth',
      guardian: 'Guardian / Contact',
      phone: 'Phone',
      region: 'Region',
      village: 'Village',
      school: 'School',
      needsAssessment: 'Needs assessment',
      household: 'Household context',
      householdIncome: 'Income range',
      householdSize: 'Household size',
      caregiver: 'Caregiver occupation',
      challenges: 'Challenges',
      verificationNotes: 'Verification notes',
      intakePayload: 'Submitted data',
      submittedAt: 'Submitted at',
      verifiedAt: 'Verified at',
      reviewedAt: 'Reviewed at',
      noValue: '—',
      actions: 'Actions',
      transitionTo: 'Move to',
      transitionLabels: {
        verification_pending: 'Send to verification',
        verified: 'Mark as verified',
        review_pending: 'Move to review',
        accepted: 'Accept application',
        rejected: 'Reject application',
      } as Record<string, string>,
      notesPlaceholder: 'Add notes (optional)…',
      confirm: 'Confirm',
      cancelling: 'Cancel',
      transitioning: 'Saving…',
      transitionSuccess: 'Status updated.',
      transitionError: 'Failed to update status.',
      noTransitions: 'No further actions available for this application.',
    },
  },
  fr: {
    title: 'Demandes',
    description: 'Examinez, vérifiez et gérez toutes les demandes de soutien éducatif.',
    searchPlaceholder: 'Rechercher par nom ou référence…',
    filterLabel: 'Filtrer par statut',
    allStatuses: 'Tous les statuts',
    sourceLabel: 'Source',
    allSources: 'Toutes les sources',
    statusLabels: {
      draft: 'Brouillon',
      submitted: 'Soumis',
      verification_pending: 'Vérification en attente',
      verified: 'Vérifié',
      review_pending: 'Révision en attente',
      accepted: 'Accepté',
      rejected: 'Rejeté',
    } as Record<string, string>,
    sourceLabels: {
      online: 'En ligne',
      school: 'École',
      field_officer: 'Agent de terrain',
      ngo_staff: 'Personnel ONG',
    } as Record<string, string>,
    columns: {
      reference: 'Référence',
      applicant: 'Demandeur',
      status: 'Statut',
      source: 'Source',
      region: 'Région',
      submitted: 'Soumis le',
    },
    empty: 'Aucune demande ne correspond à vos filtres.',
    loadError: 'Échec du chargement des demandes.',
    retry: 'Réessayer',
    of: 'sur',
    results: 'résultats',
    page: 'Page',
    prev: 'Précédent',
    next: 'Suivant',
    open: 'Ouvrir',
    panel: {
      title: 'Détail de la demande',
      close: 'Fermer',
      ref: 'Référence',
      status: 'Statut',
      source: 'Source',
      applicant: 'Demandeur',
      gender: 'Genre',
      dob: 'Date de naissance',
      guardian: 'Tuteur / Contact',
      phone: 'Téléphone',
      region: 'Région',
      village: 'Village',
      school: 'École',
      needsAssessment: 'Évaluation des besoins',
      household: 'Contexte du ménage',
      householdIncome: 'Fourchette de revenus',
      householdSize: 'Taille du ménage',
      caregiver: 'Occupation du tuteur',
      challenges: 'Difficultés',
      verificationNotes: 'Notes de vérification',
      intakePayload: 'Données soumises',
      submittedAt: 'Soumis le',
      verifiedAt: 'Vérifié le',
      reviewedAt: 'Examiné le',
      noValue: '—',
      actions: 'Actions',
      transitionTo: 'Passer à',
      transitionLabels: {
        verification_pending: 'Envoyer en vérification',
        verified: 'Marquer comme vérifié',
        review_pending: 'Passer en révision',
        accepted: 'Accepter la demande',
        rejected: 'Rejeter la demande',
      } as Record<string, string>,
      notesPlaceholder: 'Ajouter des notes (optionnel)…',
      confirm: 'Confirmer',
      cancelling: 'Annuler',
      transitioning: 'Enregistrement…',
      transitionSuccess: 'Statut mis à jour.',
      transitionError: 'Échec de la mise à jour du statut.',
      noTransitions: 'Aucune action supplémentaire disponible pour cette demande.',
    },
  },
};

// ─── Status helpers ────────────────────────────────────────────────────────────

const ALL_STATUSES = [
  'submitted',
  'verification_pending',
  'verified',
  'review_pending',
  'accepted',
  'rejected',
];

/** Ordered next-state transitions per current status */
const TRANSITIONS: Record<string, string[]> = {
  submitted: ['verification_pending', 'rejected'],
  verification_pending: ['verified', 'rejected'],
  verified: ['review_pending'],
  review_pending: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
  draft: [],
};

function statusTone(s: string): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (s === 'accepted' || s === 'verified') return 'success';
  if (s === 'rejected') return 'danger';
  if (s.includes('pending')) return 'warning';
  if (s === 'submitted') return 'info';
  return 'neutral';
}

function transitionTone(s: string): string {
  if (s === 'accepted') return 'bg-emerald-600 hover:bg-emerald-700 text-white';
  if (s === 'rejected') return 'bg-red-600 hover:bg-red-700 text-white';
  return 'bg-foundation-600 hover:bg-foundation-700 text-white';
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

// ─── Application Detail Panel ─────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-2.5 text-sm">
      <dt className="font-medium text-ink-500">{label}</dt>
      <dd className="text-ink-900 break-words">{value ?? <span className="text-ink-400">—</span>}</dd>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-5 mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-400">{children}</h3>
  );
}

interface DetailPanelProps {
  app: ApplicationRecord;
  locale: string;
  c: (typeof copy)['en'];
  onClose: () => void;
  onTransitioned: (updated: ApplicationRecord) => void;
}

function DetailPanel({ app, locale, c, onClose, onTransitioned }: DetailPanelProps) {
  const panel = c.panel;
  const [notes, setNotes] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const transitions = TRANSITIONS[app.status] ?? [];

  async function doTransition(toStatus: string) {
    setTransitioning(true);
    setFeedback(null);
    try {
      const updated = await apiTransitionApplicationStatus(app.uuid, toStatus, notes || undefined);
      setFeedback({ type: 'success', text: panel.transitionSuccess });
      setConfirming(null);
      setNotes('');
      onTransitioned(updated);
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : panel.transitionError });
    } finally {
      setTransitioning(false);
    }
  }

  // Parse intake_payload if available
  const intake = app.intake_payload as Record<string, unknown> | null;

  return (
    <aside
      role="dialog"
      aria-label={panel.title}
      aria-modal="true"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl ring-1 ring-ink-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{panel.title}</p>
          <h2 className="mt-0.5 text-base font-bold text-ink-900">{app.applicant_name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={panel.close}
          className="focus-ring grid h-9 w-9 place-items-center rounded-md text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
        {/* Status pill + reference */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge label={app.status_label ?? app.status} tone={statusTone(app.status)} />
          <span className="rounded-md bg-ink-100 px-2.5 py-1 text-[11px] font-semibold text-ink-600">
            {app.application_number}
          </span>
          <span className="rounded-md bg-ink-50 px-2.5 py-1 text-[11px] font-semibold text-ink-500">
            {app.source_label ?? app.source}
          </span>
        </div>

        {/* Feedback */}
        {feedback ? (
          <div
            className={cn(
              'mt-4 flex items-start gap-2 rounded-md p-3 text-sm font-medium',
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-red-50 text-red-800',
            )}
          >
            {feedback.type === 'success' ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {feedback.text}
          </div>
        ) : null}

        {/* ── Applicant ── */}
        <SectionHeading>{panel.applicant}</SectionHeading>
        <dl className="divide-y divide-ink-50 rounded-md border border-ink-100 bg-ink-50/40 px-4">
          <DetailRow label={panel.applicant} value={app.applicant_name} />
          <DetailRow label={panel.gender} value={app.gender} />
          <DetailRow label={panel.dob} value={app.date_of_birth} />
          <DetailRow label={panel.guardian} value={app.guardian_name} />
          <DetailRow
            label={panel.phone}
            value={
              app.guardian_phone ? (
                <a
                  href={`tel:${app.guardian_phone}`}
                  className="inline-flex items-center gap-1 text-foundation-700 underline-offset-2 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {app.guardian_phone}
                </a>
              ) : null
            }
          />
        </dl>

        {/* ── Location / School ── */}
        <SectionHeading>{panel.region}</SectionHeading>
        <dl className="divide-y divide-ink-50 rounded-md border border-ink-100 bg-ink-50/40 px-4">
          <DetailRow label={panel.region} value={app.region?.name} />
          <DetailRow label={panel.village} value={app.village?.name} />
          <DetailRow label={panel.school} value={app.school?.name} />
        </dl>

        {/* ── Needs assessment ── */}
        {app.needs_assessment ? (
          <>
            <SectionHeading>{panel.needsAssessment}</SectionHeading>
            <div className="rounded-md border border-ink-100 bg-ink-50/40 px-4 py-3 text-sm leading-6 text-ink-800 whitespace-pre-wrap">
              {app.needs_assessment}
            </div>
          </>
        ) : null}

        {/* ── Intake payload (submitted form data) ── */}
        {intake ? (
          <>
            <SectionHeading>{panel.intakePayload}</SectionHeading>
            <dl className="divide-y divide-ink-50 rounded-md border border-ink-100 bg-ink-50/40 px-4">
              {Object.entries(intake)
                .filter(([, v]) => v !== null && v !== undefined && v !== '')
                .map(([key, val]) => (
                  <DetailRow
                    key={key}
                    label={key.replace(/_/g, ' ')}
                    value={
                      typeof val === 'boolean'
                        ? val
                          ? '✓'
                          : '✗'
                        : Array.isArray(val)
                          ? (val as string[]).join(', ')
                          : String(val)
                    }
                  />
                ))}
            </dl>
          </>
        ) : null}

        {/* ── Household ── */}
        {(app.household_income_range ||
          app.household_size ||
          app.primary_caregiver_occupation ||
          (app.household_challenges?.length ?? 0) > 0) ? (
          <>
            <SectionHeading>{panel.household}</SectionHeading>
            <dl className="divide-y divide-ink-50 rounded-md border border-ink-100 bg-ink-50/40 px-4">
              {app.household_income_range ? (
                <DetailRow label={panel.householdIncome} value={app.household_income_range} />
              ) : null}
              {app.household_size ? (
                <DetailRow label={panel.householdSize} value={String(app.household_size)} />
              ) : null}
              {app.primary_caregiver_occupation ? (
                <DetailRow label={panel.caregiver} value={app.primary_caregiver_occupation} />
              ) : null}
              {(app.household_challenges?.length ?? 0) > 0 ? (
                <DetailRow label={panel.challenges} value={(app.household_challenges ?? []).join(', ')} />
              ) : null}
            </dl>
          </>
        ) : null}

        {/* ── Verification notes ── */}
        {app.verification_notes ? (
          <>
            <SectionHeading>{panel.verificationNotes}</SectionHeading>
            <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 whitespace-pre-wrap">
              {app.verification_notes}
            </div>
          </>
        ) : null}

        {/* ── Timeline ── */}
        <SectionHeading>Timeline</SectionHeading>
        <dl className="divide-y divide-ink-50 rounded-md border border-ink-100 bg-ink-50/40 px-4">
          <DetailRow label={panel.submittedAt} value={formatDate(app.submitted_at, locale)} />
          <DetailRow label={panel.verifiedAt} value={formatDate(app.verified_at, locale)} />
          <DetailRow label={panel.reviewedAt} value={formatDate(app.reviewed_at, locale)} />
        </dl>

        {/* ── Actions ── */}
        <SectionHeading>{panel.actions}</SectionHeading>
        {transitions.length === 0 ? (
          <p className="rounded-md border border-dashed border-ink-200 px-4 py-3 text-sm text-ink-500">
            {panel.noTransitions}
          </p>
        ) : (
          <div className="space-y-3">
            {/* Notes textarea */}
            <textarea
              id="transition-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={panel.notesPlaceholder}
              className="w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-foundation-400 focus:outline-none focus:ring-2 focus:ring-foundation-200"
            />

            {/* Transition buttons */}
            <div className="flex flex-wrap gap-2">
              {transitions.map((toStatus) => {
                const isConfirming = confirming === toStatus;
                return (
                  <div key={toStatus} className="flex gap-1.5">
                    {isConfirming ? (
                      <>
                        <button
                          type="button"
                          disabled={transitioning}
                          onClick={() => doTransition(toStatus)}
                          className={cn(
                            'focus-ring inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:opacity-60',
                            transitionTone(toStatus),
                          )}
                        >
                          {transitioning ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          {transitioning ? panel.transitioning : panel.confirm}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(null)}
                          className="focus-ring inline-flex h-9 items-center gap-1 rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
                        >
                          {panel.cancelling}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirming(toStatus)}
                        className={cn(
                          'focus-ring inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold transition',
                          toStatus === 'rejected'
                            ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                            : 'border border-ink-200 bg-white text-ink-700 hover:border-foundation-200 hover:bg-foundation-50 hover:text-foundation-800',
                        )}
                      >
                        {panel.transitionLabels[toStatus] ?? toStatus}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function ApplicationsPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const c = copy[activeLocale];

  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL
  const statusFilter = searchParams.get('status') ?? '';
  const searchQuery = searchParams.get('search') ?? '';
  const sourceFilter = searchParams.get('source') ?? '';
  const currentPage = Number(searchParams.get('page') ?? '1');

  // Local input state (debounced into URL)
  const [searchInput, setSearchInput] = useState(searchQuery);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Data state
  const [response, setResponse] = useState<PaginatedResponse<ApplicationRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApplicationRecord | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiListApplications({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        source: sourceFilter || undefined,
        page: currentPage,
        per_page: 20,
      });
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.loadError);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, sourceFilter, currentPage, c.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  // Update selected application when data refreshes
  useEffect(() => {
    if (selected && response) {
      const refreshed = response.data.find((a) => a.uuid === selected.uuid);
      if (refreshed) setSelected(refreshed);
    }
  }, [response, selected]);

  // ── URL helpers ────────────────────────────────────────────────────────────
  function setFilter(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete('page');
      return next;
    });
  }

  function setPage(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page));
      return next;
    });
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setFilter('search', searchInput.trim());
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setFilter('search', value.trim());
    }, 400);
  }

  // ── Transition callback ────────────────────────────────────────────────────
  function handleTransitioned(updated: ApplicationRecord) {
    setResponse((prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.map((a) => (a.uuid === updated.uuid ? updated : a)),
          }
        : prev,
    );
    setSelected(updated);
  }

  const meta = response?.meta;
  const apps = response?.data ?? [];

  // Status tab options
  const statusTabs: { value: string; label: string }[] = [
    { value: '', label: c.allStatuses },
    ...ALL_STATUSES.map((s) => ({ value: s, label: c.statusLabels[s] ?? s })),
  ];

  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Staff"
        title={c.title}
        description={c.description}
        action={
          <button
            type="button"
            onClick={load}
            aria-label={c.retry}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            <RefreshCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        }
      />

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            id="applications-search"
            type="search"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="h-10 w-full rounded-md border border-ink-200 bg-ink-50 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-foundation-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-foundation-100"
          />
        </form>

        {/* Source filter */}
        <div className="relative">
          <select
            id="applications-source-filter"
            value={sourceFilter}
            onChange={(e) => setFilter('source', e.target.value)}
            className="h-10 appearance-none rounded-md border border-ink-200 bg-white pl-3 pr-8 text-sm text-ink-900 focus:border-foundation-400 focus:outline-none focus:ring-2 focus:ring-foundation-100"
          >
            <option value="">{c.allSources}</option>
            {Object.entries(c.sourceLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
      </div>

      {/* ── Status tabs ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter('status', tab.value)}
            className={cn(
              'focus-ring inline-flex h-8 items-center rounded-md px-3 text-xs font-semibold transition',
              statusFilter === tab.value
                ? 'bg-foundation-600 text-white shadow-sm'
                : 'border border-ink-200 bg-white text-ink-600 hover:border-foundation-200 hover:bg-foundation-50 hover:text-foundation-800',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-md border border-ink-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-ink-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <p className="text-sm font-medium text-ink-700">{error}</p>
            <button
              type="button"
              onClick={load}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-semibold text-white hover:bg-foundation-700"
            >
              <RefreshCcw className="h-4 w-4" />
              {c.retry}
            </button>
          </div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <ClipboardList className="h-8 w-8 text-ink-300" />
            <p className="text-sm text-ink-500">{c.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50 text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">{c.columns.reference}</th>
                  <th className="px-4 py-3 font-semibold">{c.columns.applicant}</th>
                  <th className="px-4 py-3 font-semibold">{c.columns.status}</th>
                  <th className="px-4 py-3 font-semibold">{c.columns.source}</th>
                  <th className="px-4 py-3 font-semibold">{c.columns.region}</th>
                  <th className="px-4 py-3 font-semibold">{c.columns.submitted}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {apps.map((app) => (
                  <tr
                    key={app.uuid}
                    className={cn(
                      'transition hover:bg-foundation-50',
                      selected?.uuid === app.uuid && 'bg-foundation-50',
                    )}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-foundation-700">
                      {app.application_number}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-500">
                          <User className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <p className="font-semibold text-ink-900">{app.applicant_name}</p>
                          {app.guardian_name ? (
                            <p className="text-xs text-ink-400">{app.guardian_name}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        label={app.status_label ?? app.status}
                        tone={statusTone(app.status)}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-ink-500">{app.source_label ?? app.source}</td>
                    <td className="px-4 py-3.5 text-ink-500">{app.region?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-ink-500 tabular-nums">
                      {app.submitted_at
                        ? new Intl.DateTimeFormat(activeLocale, { dateStyle: 'medium' }).format(
                            new Date(app.submitted_at),
                          )
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        id={`app-open-${app.uuid}`}
                        onClick={() => setSelected(app)}
                        className="focus-ring inline-flex h-8 items-center gap-1 rounded-md border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 transition hover:border-foundation-200 hover:bg-foundation-50 hover:text-foundation-800"
                      >
                        {c.open}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {meta && meta.last_page > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            {c.page} {meta.current_page} {c.of} {meta.last_page} &nbsp;·&nbsp;{' '}
            {meta.total} {c.results}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              onClick={() => setPage(meta.current_page - 1)}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              {c.prev}
            </button>
            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage(meta.current_page + 1)}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:pointer-events-none disabled:opacity-40"
            >
              {c.next}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Detail panel overlay ─────────────────────────────────────────────── */}
      {selected ? (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <DetailPanel
            app={selected}
            locale={activeLocale}
            c={c}
            onClose={() => setSelected(null)}
            onTransitioned={handleTransitioned}
          />
        </>
      ) : null}
    </section>
  );
}
