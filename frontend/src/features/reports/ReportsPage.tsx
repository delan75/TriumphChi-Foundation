import { CalendarPlus, FileText, RefreshCcw, Save, Search, Sparkles } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { DashboardResponseModal } from '../../components/staff/DashboardResponseModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { readStoredAuthUser } from '../../lib/auth';
import { isLocale } from '../../lib/i18n';
import { CustomReportBuilder } from './components/CustomReportBuilder';
import { OperationalInsights } from './components/OperationalInsights';
import { SavedReportsPanel, ScheduledReportsPanel } from './components/ReportCollections';
import { ReportCategoryCards } from './components/ReportCategoryCards';
import { ReportLibraryTable } from './components/ReportLibraryTable';
import { QuickReportsGrid } from './components/QuickReportsGrid';
import { hasAnyPermission, hasPermission } from './reportPermissions';
import { reportsContent, type ReportCategoryKey } from './reportsContent';

export function ReportsPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = reportsContent[activeLocale];
  const user = readStoredAuthUser();
  const permissions = user?.permissions ?? [];
  const canViewReports = hasAnyPermission(permissions, ['reports.view', 'impact_updates.view']);
  const [activeCategory, setActiveCategory] = useState<ReportCategoryKey>('all');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const libraryRef = useRef<HTMLDivElement | null>(null);
  const savedRef = useRef<HTMLDivElement | null>(null);
  const scheduledRef = useRef<HTMLDivElement | null>(null);

  const visibleCategories = useMemo(
    () => copy.categories.filter((category) => hasAnyPermission(permissions, category.permissions)),
    [copy.categories, permissions],
  );

  const visibleQuickReports = useMemo(
    () => copy.quickReports.filter((report) => hasPermission(permissions, report.permission)),
    [copy.quickReports, permissions],
  );

  const visibleInsights = useMemo(
    () => copy.insights.filter((insight) => hasPermission(permissions, insight.permission)),
    [copy.insights, permissions],
  );

  const visibleTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return copy.templates
      .filter((template) => hasAnyPermission(permissions, template.permissions))
      .filter((template) => activeCategory === 'all' || template.category === activeCategory)
      .filter((template) => {
        if (!normalizedSearch) {
          return true;
        }

        return [template.name, template.categoryLabel, template.format, template.key]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      });
  }, [activeCategory, copy.templates, permissions, search]);

  const showNotice = (label: string) => {
    setNotice({
      title: copy.notice.title,
      message: `${label} - ${copy.notice.body}`,
    });
  };

  if (!canViewReports) {
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
              onClick={() => libraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              {copy.generateReport}
            </button>
            <button
              type="button"
              onClick={() => savedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {copy.savedReports}
            </button>
            <button
              type="button"
              onClick={() => scheduledRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              {copy.scheduleReport}
            </button>
          </div>
        }
      />

      <DashboardResponseModal
        isOpen={Boolean(notice)}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        closeLabel={copy.notice.close}
        countdownLabel={copy.notice.countdown}
        pausedLabel={copy.notice.paused}
        onClose={() => setNotice(null)}
      />

      <DashboardPanel title={copy.sections.summary} description={copy.sections.summaryDescription} bodyClassName="p-4">
        <ReportCategoryCards
          copy={copy}
          categories={visibleCategories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </DashboardPanel>

      <DashboardPanel
        title={copy.sections.insights}
        description={copy.sections.insightsDescription}
        action={<StatusBadge label={`${visibleInsights.length}`} tone="warning" />}
        bodyClassName="p-4"
      >
        <OperationalInsights copy={copy} insights={visibleInsights} locale={activeLocale} />
      </DashboardPanel>

      <DashboardPanel title={copy.sections.quick} description={copy.sections.quickDescription} bodyClassName="p-4">
        <QuickReportsGrid copy={copy} reports={visibleQuickReports} onGenerate={showNotice} />
      </DashboardPanel>

      <div ref={libraryRef} className="scroll-mt-24">
        <DashboardPanel
          title={copy.sections.library}
          description={copy.sections.libraryDescription}
          className="min-w-0"
          action={
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setActiveCategory('all');
              }}
              className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              {copy.actions.clear}
            </button>
          }
          bodyClassName="min-w-0 p-4"
        >
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
            <label className="block">
              <span className="text-xs font-bold uppercase text-ink-500">{copy.filters.search}</span>
              <div className="focus-within:ring-focus mt-1 flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-3">
                <Search className="h-4 w-4 text-ink-400" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={copy.filters.searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-400"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-ink-500">{copy.filters.category}</span>
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value as ReportCategoryKey)}
                className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
              >
                <option value="all">{copy.filters.all}</option>
                {visibleCategories.map((category) => (
                  <option key={category.key} value={category.key}>{category.label}</option>
                ))}
              </select>
            </label>
          </div>

          <ReportLibraryTable copy={copy} reports={visibleTemplates} onAction={showNotice} />
        </DashboardPanel>
      </div>

      <DashboardPanel
        title={copy.sections.builder}
        description={copy.sections.builderDescription}
        action={<Sparkles className="h-5 w-5 text-foundation-700" aria-hidden="true" />}
        bodyClassName="p-4"
      >
        <CustomReportBuilder copy={copy} onGenerate={showNotice} />
      </DashboardPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <div ref={savedRef} className="scroll-mt-24">
          <DashboardPanel title={copy.sections.saved} description={copy.sections.savedDescription} bodyClassName="p-4">
            <SavedReportsPanel copy={copy} reports={copy.saved} onDownload={showNotice} />
          </DashboardPanel>
        </div>

        <div ref={scheduledRef} className="scroll-mt-24">
          <DashboardPanel title={copy.sections.scheduled} description={copy.sections.scheduledDescription} bodyClassName="p-4">
            <ScheduledReportsPanel reports={copy.scheduled} />
          </DashboardPanel>
        </div>
      </div>
    </section>
  );
}
