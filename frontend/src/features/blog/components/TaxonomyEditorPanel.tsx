import { useEffect, useState, type FormEvent } from 'react';
import { DashboardPanel } from '../../../components/staff/DashboardPanel';
import type { BlogCategoryRecord, BlogTagRecord, LocalizedText } from '../../../lib/api';
import { slugify } from '../../../lib/slugify';

type LocaleKey = 'en' | 'fr';

const emptyLocalized: LocalizedText = { en: '', fr: '' };

type TaxonomyItem = BlogCategoryRecord | BlogTagRecord;

interface TaxonomyEditorPanelProps {
  title: string;
  mode: 'create' | 'edit';
  item: TaxonomyItem | null;
  isWorking: boolean;
  error?: string | null;
  surface?: 'panel' | 'plain';
  onClose: () => void;
  onSubmit: (payload: { name: LocalizedText; slug: LocalizedText }) => Promise<void>;
}

export function TaxonomyEditorPanel({ title, mode, item, isWorking, error, surface = 'panel', onClose, onSubmit }: TaxonomyEditorPanelProps) {
  const [activeLocale, setActiveLocale] = useState<LocaleKey>('en');
  const [name, setName] = useState<LocalizedText>(emptyLocalized);
  const [slug, setSlug] = useState<LocalizedText>(emptyLocalized);
  const [autoSlug, setAutoSlug] = useState<Record<LocaleKey, boolean>>({
    en: mode === 'create',
    fr: mode === 'create',
  });

  useEffect(() => {
    setName({ en: item?.name.en ?? '', fr: item?.name.fr ?? '' });
    setSlug({ en: item?.slug.en ?? '', fr: item?.slug.fr ?? '' });
  }, [item]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      name: cleanLocalized(name),
      slug: cleanLocalized(slug),
    });
  }

  const form = (
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div> : null}

        <div className="flex rounded-md bg-ink-50 p-1">
          {(['en', 'fr'] as LocaleKey[]).map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => setActiveLocale(locale)}
              className={`focus-ring min-h-10 flex-1 rounded-md text-sm font-black transition ${
                activeLocale === locale ? 'bg-white text-foundation-800 shadow-sm' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {locale === 'en' ? 'English' : 'French'}
            </button>
          ))}
        </div>

        <TextInput
          label="Name"
          value={name[activeLocale] ?? ''}
          required={activeLocale === 'en'}
          onChange={(value) => {
            setName((current) => ({ ...current, [activeLocale]: value }));
            if (autoSlug[activeLocale]) {
              setSlug((current) => ({ ...current, [activeLocale]: slugify(value) }));
            }
          }}
        />
        <TextInput
          label="Slug"
          value={slug[activeLocale] ?? ''}
          onChange={(value) => {
            setAutoSlug((current) => ({ ...current, [activeLocale]: false }));
            setSlug((current) => ({ ...current, [activeLocale]: value }));
          }}
        />

        <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring min-h-11 rounded-md border border-ink-200 px-4 text-sm font-black text-ink-700 transition hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isWorking}
            className="focus-ring min-h-11 rounded-md bg-foundation-600 px-4 text-sm font-black text-white transition hover:bg-foundation-900 disabled:opacity-50"
          >
            {isWorking ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
  );

  if (surface === 'plain') {
    return form;
  }

  return (
    <DashboardPanel
      title={mode === 'create' ? `Create ${title}` : `Edit ${title}`}
      className="min-w-0"
      bodyClassName="min-w-0"
    >
      {form}
    </DashboardPanel>
  );
}

function TextInput({
  label,
  value,
  required,
  onChange,
}: {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-ink-500">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-1 h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
      />
    </label>
  );
}

function cleanLocalized(value: LocalizedText): LocalizedText {
  return {
    en: value.en?.trim() || '',
    fr: value.fr?.trim() || null,
  };
}
