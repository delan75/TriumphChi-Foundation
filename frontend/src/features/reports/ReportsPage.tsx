import {
  CalendarPlus,
  FileText,
  ListChecks,
  RefreshCcw,
  Save,
  Search,
  Sparkles,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { DashboardResponseModal } from '../../components/staff/DashboardResponseModal';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { ReportGeneratePayload } from '../../lib/api';
import { readStoredAuthUser } from '../../lib/auth';
import { isLocale } from '../../lib/i18n';
import { CustomReportBuilder } from './components/CustomReportBuilder';
import { OperationalInsights } from './components/OperationalInsights';
import { SavedReportsPanel, ScheduledReportsPanel } from './components/ReportCollections';
import { ReportCategoryCards } from './components/ReportCategoryCards';
import { ReportQueueDrawer } from './components/ReportQueueDrawer';
import { ReportLibraryTable } from './components/ReportLibraryTable';
import { QuickReportsGrid } from './components/QuickReportsGrid';
import { hasAnyPermission, hasPermission } from './reportPermissions';
import {
  reportsContent,
  type OperationalInsight,
  type QuickReport,
  type ReportCategory,
  type ReportCategoryKey,
  type ReportTemplate,
  type SavedReport,
} from './reportsContent';
import { useGenerateReport, useReportDashboard, useReportQueue } from './useReports';

export function ReportsPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = reportsContent[activeLocale];
  const user = readStoredAuthUser();
  const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);
  const canViewReports = hasPermission(permissions, 'reports.view');
  const [activeCategory, setActiveCategory] = useState<ReportCategoryKey>('all');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const libraryRef = useRef<HTMLDivElement | null>(null);
  const savedRef = useRef<HTMLDivElement | null>(null);
  const scheduledRef = useRef<HTMLDivElement | null>(null);
  const reportDashboardQuery = useReportDashboard(canViewReports);
  const reportQueueQuery = useReportQueue(canViewReports);
  const generateReport = useGenerateReport();
  const dashboard = reportDashboardQuery.data;

  const categoryLabels = useMemo(
    () => new Map(copy.categories.map((category) => [category.key, category.label])),
    [copy.categories],
  );

  const categories = useMemo<ReportCategory[]>(() => {
    if (!dashboard?.categories) {
      return copy.categories.filter((category) =>
        hasAnyPermission(permissions, category.permissions),
      );
    }

    return dashboard.categories.map((category) => ({
      key: category.key as ReportCategoryKey,
      label: category.label,
      available: category.available,
      description: category.description,
      permissions: [],
    }));
  }, [copy.categories, dashboard?.categories, permissions]);

  const quickReports = useMemo<QuickReport[]>(() => {
    if (!dashboard?.quick_reports) {
      return copy.quickReports.filter((report) => hasPermission(permissions, report.permission));
    }

    return dashboard.quick_reports.map((report) => ({
      key: report.key,
      templateKey: report.template_key,
      title: report.title,
      description: report.description,
      category: report.category as ReportCategoryKey,
      permission: report.permission,
      severity: report.severity,
    }));
  }, [copy.quickReports, dashboard?.quick_reports, permissions]);

  const insights = useMemo<OperationalInsight[]>(() => {
    if (!dashboard?.insights) {
      return copy.insights.filter((insight) => hasPermission(permissions, insight.permission));
    }

    return dashboard.insights.map((insight) => ({
      key: insight.key,
      label: insight.label,
      value: insight.value,
      tone: insight.tone,
      path: insight.path,
      permission: insight.permission,
    }));
  }, [copy.insights, dashboard?.insights, permissions]);

  const templates = useMemo<ReportTemplate[]>(() => {
    if (!dashboard?.templates) {
      return copy.templates.filter((template) =>
        hasAnyPermission(permissions, template.permissions),
      );
    }

    return dashboard.templates.map((template) => {
      const category = template.category as ReportCategoryKey;

      return {
        key: template.key,
        name: template.name,
        category,
        categoryLabel: categoryLabels.get(category) ?? template.category,
        lastGenerated: template.last_generated ?? '-',
        format: template.format,
        formats: template.formats,
        permissions: template.permissions,
      };
    });
  }, [categoryLabels, copy.templates, dashboard?.templates, permissions]);

  const queue = useMemo(
    () => reportQueueQuery.data ?? dashboard?.queue ?? [],
    [reportQueueQuery.data, dashboard?.queue],
  );
  const savedReports = useMemo<SavedReport[]>(() => {
    const completed =
      dashboard?.saved_reports ?? queue.filter((request) => request.status === 'completed');

    return completed.map((request) => ({
      title: request.title,
      status: request.status_label ?? request.status,
      generatedAt: request.completed_at ?? request.queued_at ?? '-',
      owner: user?.name ?? '-',
      format: request.format,
    }));
  }, [dashboard?.saved_reports, queue, user?.name]);

  const visibleTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return templates
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
  }, [activeCategory, search, templates]);

  const queueReport = async (payload: ReportGeneratePayload, label: string) => {
    try {
      const reportRequest = await generateReport.mutateAsync(payload);

      setNotice({
        title: copy.notice.title,
        message: `${label || reportRequest.title} - ${copy.notice.body}`,
      });
      setQueueOpen(true);
    } catch (error) {
      setNotice({
        title: copy.accessDeniedTitle,
        message: error instanceof Error ? error.message : copy.accessDeniedBody,
      });
    }
  };

  const handleQuickReport = (report: QuickReport) => {
    const templateKey = report.templateKey ?? report.key;
    const template = templates.find((item) => item.key === templateKey);

    void queueReport(
      {
        template_key: templateKey,
        format: template?.format ?? 'PDF',
        source: 'quick_report',
      },
      report.title,
    );
  };

  const handleTemplateAction = (report: ReportTemplate, action: 'view' | 'generate') => {
    void queueReport(
      {
        template_key: report.key,
        format: report.format,
        source: action === 'view' ? 'report_library_view' : 'report_library_generate',
      },
      `${action === 'view' ? copy.actions.view : report.format}: ${report.name}`,
    );
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
              onClick={() => setQueueOpen(true)}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              {copy.actions.openQueue}
              {queue.length ? (
                <span className="rounded-full bg-foundation-50 px-2 py-0.5 text-xs text-foundation-700">
                  {queue.length}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() =>
                libraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              {copy.generateReport}
            </button>
            <button
              type="button"
              onClick={() =>
                savedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {copy.savedReports}
            </button>
            <button
              type="button"
              onClick={() =>
                scheduledRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
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

      <ReportQueueDrawer
        copy={copy}
        isOpen={queueOpen}
        isLoading={reportQueueQuery.isLoading}
        queue={queue}
        onClose={() => setQueueOpen(false)}
      />

      <DashboardPanel
        title={copy.sections.summary}
        description={copy.sections.summaryDescription}
        bodyClassName="p-4"
      >
        <ReportCategoryCards
          copy={copy}
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </DashboardPanel>

      <DashboardPanel
        title={copy.sections.insights}
        description={copy.sections.insightsDescription}
        action={<StatusBadge label={`${insights.length}`} tone="warning" />}
        bodyClassName="p-4"
      >
        <OperationalInsights copy={copy} insights={insights} locale={activeLocale} />
      </DashboardPanel>

      <DashboardPanel
        title={copy.sections.quick}
        description={copy.sections.quickDescription}
        bodyClassName="p-4"
      >
        <QuickReportsGrid copy={copy} reports={quickReports} onGenerate={handleQuickReport} />
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
              <span className="text-xs font-bold uppercase text-ink-500">
                {copy.filters.search}
              </span>
              <div className="focus-within:ring-focus mt-1 flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-3">
                <Search className="h-4 w-4 text-ink-400" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={copy.filters.searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink-900 outline-hidden placeholder:text-ink-400"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-ink-500">
                {copy.filters.category}
              </span>
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value as ReportCategoryKey)}
                className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
              >
                <option value="all">{copy.filters.all}</option>
                {categories.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ReportLibraryTable
            copy={copy}
            reports={visibleTemplates}
            onAction={handleTemplateAction}
          />
        </DashboardPanel>
      </div>

      <DashboardPanel
        title={copy.sections.builder}
        description={copy.sections.builderDescription}
        action={<Sparkles className="h-5 w-5 text-foundation-700" aria-hidden="true" />}
        bodyClassName="p-4"
      >
        <CustomReportBuilder
          copy={copy}
          templates={templates}
          filterOptions={dashboard?.filter_options}
          isWorking={generateReport.isPending}
          onGenerate={(payload, label) => void queueReport(payload, label)}
        />
      </DashboardPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <div ref={savedRef} className="scroll-mt-24">
          <DashboardPanel
            title={copy.sections.saved}
            description={copy.sections.savedDescription}
            bodyClassName="p-4"
          >
            <SavedReportsPanel
              copy={copy}
              reports={savedReports}
              onDownload={(label) => {
                setNotice({
                  title: copy.notice.title,
                  message: `${label} - ${copy.notice.body}`,
                });
              }}
            />
          </DashboardPanel>
        </div>

        <div ref={scheduledRef} className="scroll-mt-24">
          <DashboardPanel
            title={copy.sections.scheduled}
            description={copy.sections.scheduledDescription}
            bodyClassName="p-4"
          >
            <ScheduledReportsPanel copy={copy} reports={[]} />
          </DashboardPanel>
        </div>
      </div>
    </section>
  );
}
