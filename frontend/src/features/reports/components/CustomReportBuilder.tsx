import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReportFilterOptions, ReportGeneratePayload } from '../../../lib/api';
import { cn } from '../../../components/ui/cn';
import type { ReportTemplate, ReportsCopy } from '../reportsContent';

type ReportFilters = NonNullable<ReportGeneratePayload['filters']>;

export function CustomReportBuilder({
  copy,
  templates,
  filterOptions,
  isWorking = false,
  onGenerate,
}: {
  copy: ReportsCopy;
  templates: ReportTemplate[];
  filterOptions?: ReportFilterOptions;
  isWorking?: boolean;
  onGenerate: (payload: ReportGeneratePayload, label: string) => void;
}) {
  const [templateKey, setTemplateKey] = useState(templates[0]?.key ?? '');
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.key === templateKey) ?? templates[0],
    [templateKey, templates],
  );
  const availableFormats = selectedTemplate?.formats?.length ? selectedTemplate.formats : copy.formats;
  const [format, setFormat] = useState(availableFormats[0] ?? 'PDF');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedFields, setSelectedFields] = useState<string[]>(copy.fields.slice(0, 5));
  const [filters, setFilters] = useState<ReportFilters>({});

  useEffect(() => {
    if (!selectedTemplate) {
      return;
    }

    setFormat((current) => (availableFormats.includes(current) ? current : availableFormats[0] ?? 'PDF'));
  }, [availableFormats, selectedTemplate]);

  useEffect(() => {
    if (templates.length && !templates.some((template) => template.key === templateKey)) {
      setTemplateKey(templates[0].key);
    }
  }, [templateKey, templates]);

  const selectedLabel = useMemo(() => selectedFields.join(', '), [selectedFields]);
  const canGenerate = Boolean(selectedTemplate) && selectedFields.length > 0 && !isWorking;

  const toggleField = (field: string) => {
    setSelectedFields((current) => (
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field]
    ));
  };

  const updateFilter = (key: keyof ReportFilters, value: string) => {
    setFilters((current) => {
      const next = { ...current };

      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }

      return next;
    });
  };

  const generate = () => {
    if (!selectedTemplate || !canGenerate) {
      return;
    }

    onGenerate(
      {
        template_key: selectedTemplate.key,
        format,
        filters: Object.keys(filters).length ? filters : undefined,
        fields: [...selectedFields, `sort:${sortDirection}`],
        source: 'custom_report_builder',
      },
      `${selectedTemplate.name} - ${format}`,
    );
  };

  if (!templates.length) {
    return <p className="rounded-md border border-dashed border-ink-200 p-5 text-sm text-ink-500">{copy.table.empty}</p>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="grid gap-4">
        <label className="block">
          <span className="text-xs font-bold uppercase text-ink-500">{copy.builder.dataset}</span>
          <select
            value={selectedTemplate?.key ?? ''}
            onChange={(event) => setTemplateKey(event.target.value)}
            className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
          >
            {templates.map((template) => (
              <option key={template.key} value={template.key}>{template.name}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <SelectFilter
            label={copy.builder.region}
            allLabel={copy.filters.all}
            emptyLabel={copy.builder.noOptions}
            value={filters.region_id ?? ''}
            options={filterOptions?.regions ?? []}
            onChange={(value) => updateFilter('region_id', value)}
          />
          <SelectFilter
            label={copy.builder.school}
            allLabel={copy.filters.all}
            emptyLabel={copy.builder.noOptions}
            value={filters.school_id ?? ''}
            options={filterOptions?.schools ?? []}
            onChange={(value) => updateFilter('school_id', value)}
          />
          <SelectFilter
            label={copy.builder.academicYear}
            allLabel={copy.filters.all}
            emptyLabel={copy.builder.noOptions}
            value={filters.academic_year ?? ''}
            options={filterOptions?.academic_years ?? []}
            onChange={(value) => updateFilter('academic_year', value)}
          />
          <SelectFilter
            label={copy.builder.supportStatus}
            allLabel={copy.filters.all}
            emptyLabel={copy.builder.noOptions}
            value={filters.support_status ?? ''}
            options={filterOptions?.support_statuses ?? []}
            onChange={(value) => updateFilter('support_status', value)}
          />
          <SelectFilter
            label={copy.builder.fundingStatus}
            allLabel={copy.filters.all}
            emptyLabel={copy.builder.noOptions}
            value={filters.funding_status ?? ''}
            options={filterOptions?.funding_statuses ?? []}
            onChange={(value) => updateFilter('funding_status', value)}
            className="sm:col-span-2"
          />
        </div>
      </div>

      <div className="grid gap-4">
        <fieldset>
          <legend className="text-xs font-bold uppercase text-ink-500">{copy.builder.fields}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {copy.fields.map((field) => (
              <label key={field} className="flex min-h-11 items-center gap-3 rounded-md border border-ink-100 px-3 text-sm font-semibold text-ink-700">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field)}
                  onChange={() => toggleField(field)}
                  className="h-4 w-4 rounded border-ink-300 text-foundation-600"
                />
                {field}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase text-ink-500">{copy.builder.sort}</span>
            <select
              value={sortDirection}
              onChange={(event) => setSortDirection(event.target.value as 'asc' | 'desc')}
              className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
            >
              <option value="asc">{copy.builder.ascending}</option>
              <option value="desc">{copy.builder.descending}</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-ink-500">{copy.builder.output}</span>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
            >
              {availableFormats.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-md border border-foundation-100 bg-foundation-50 p-4">
          <p className="text-xs font-bold uppercase text-foundation-700">{copy.builder.selectedFields}</p>
          <p className="mt-2 text-sm leading-6 text-ink-700">{selectedLabel || '-'}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setSelectedFields(copy.fields.slice(0, 5));
              setFilters({});
            }}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-ink-200 px-4 text-sm font-black text-ink-700 transition hover:bg-ink-50"
          >
            {copy.actions.clear}
          </button>
          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className={cn(
              'focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-black text-white transition',
              canGenerate ? 'bg-ink-900 hover:bg-ink-700' : 'cursor-not-allowed bg-ink-300',
            )}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {copy.actions.buildReport}
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectFilter({
  label,
  allLabel,
  emptyLabel,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  allLabel: string;
  emptyLabel: string;
  value: string;
  options: Array<{ value: string; label: string; count?: number }>;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="text-xs font-bold uppercase text-ink-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={!options.length}
        className={cn(
          'focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800',
          !options.length && 'cursor-not-allowed bg-ink-50 text-ink-400',
        )}
      >
        <option value="">{options.length ? allLabel : emptyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.count !== undefined ? `${option.label} (${option.count})` : option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
