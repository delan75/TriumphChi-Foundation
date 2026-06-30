import { SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReportsCopy } from '../reportsContent';

export function CustomReportBuilder({
  copy,
  onGenerate,
}: {
  copy: ReportsCopy;
  onGenerate: (label: string) => void;
}) {
  const [dataset, setDataset] = useState(copy.datasets[0] ?? '');
  const [format, setFormat] = useState(copy.formats[0] ?? 'PDF');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedFields, setSelectedFields] = useState<string[]>(copy.fields.slice(0, 5));

  const selectedLabel = useMemo(() => selectedFields.join(', '), [selectedFields]);

  const toggleField = (field: string) => {
    setSelectedFields((current) => (
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field]
    ));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="grid gap-4">
        <label className="block">
          <span className="text-xs font-bold uppercase text-ink-500">{copy.builder.dataset}</span>
          <select
            value={dataset}
            onChange={(event) => setDataset(event.target.value)}
            className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
          >
            {copy.datasets.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase text-ink-500">{copy.builder.region}</span>
            <input className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 px-3 text-sm text-ink-900" placeholder="All" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-ink-500">{copy.builder.academicYear}</span>
            <input className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 px-3 text-sm text-ink-900" placeholder="2026" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-ink-500">{copy.builder.supportStatus}</span>
            <input className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 px-3 text-sm text-ink-900" placeholder="Active" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-ink-500">{copy.builder.fundingStatus}</span>
            <input className="focus-ring mt-1 min-h-11 w-full rounded-md border border-ink-200 px-3 text-sm text-ink-900" placeholder="Funding Gap" />
          </label>
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
              {copy.formats.map((option) => (
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
            onClick={() => setSelectedFields(copy.fields.slice(0, 5))}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-ink-200 px-4 text-sm font-black text-ink-700 transition hover:bg-ink-50"
          >
            {copy.actions.clear}
          </button>
          <button
            type="button"
            onClick={() => onGenerate(`${dataset} - ${format}`)}
            className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink-900 px-4 text-sm font-black text-white transition hover:bg-ink-700"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {copy.actions.buildReport}
          </button>
        </div>
      </div>
    </div>
  );
}
