import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { DashboardPanel } from '../../../components/staff/DashboardPanel';
import type { BlogOptionsResponse, BlogPostPayload, BlogPostRecord, LocalizedText } from '../../../lib/api';
import type { BlogCopy } from '../blogContent';

interface BlogEditorPanelProps {
  copy: BlogCopy;
  mode: 'create' | 'edit';
  post: BlogPostRecord | null;
  options?: BlogOptionsResponse;
  isWorking: boolean;
  error?: string | null;
  canPublish: boolean;
  onClose: () => void;
  onSubmit: (payload: BlogPostPayload) => Promise<void>;
}

type LocaleKey = 'en' | 'fr';

const emptyLocalized: LocalizedText = { en: '', fr: '' };

export function BlogEditorPanel({ copy, mode, post, options, isWorking, error, canPublish, onClose, onSubmit }: BlogEditorPanelProps) {
  const [activeLocale, setActiveLocale] = useState<LocaleKey>('en');
  const [title, setTitle] = useState<LocalizedText>(emptyLocalized);
  const [slug, setSlug] = useState<LocalizedText>(emptyLocalized);
  const [excerpt, setExcerpt] = useState<LocalizedText>(emptyLocalized);
  const [body, setBody] = useState<LocalizedText>(emptyLocalized);
  const [seoTitle, setSeoTitle] = useState<LocalizedText>(emptyLocalized);
  const [seoDescription, setSeoDescription] = useState<LocalizedText>(emptyLocalized);
  const [imageAlt, setImageAlt] = useState<LocalizedText>(emptyLocalized);
  const [imagePath, setImagePath] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<BlogPostPayload['status']>('draft');
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    setTitle({ en: post?.title.en ?? '', fr: post?.title.fr ?? '' });
    setSlug({ en: post?.slug.en ?? '', fr: post?.slug.fr ?? '' });
    setExcerpt({ en: post?.excerpt?.en ?? '', fr: post?.excerpt?.fr ?? '' });
    setBody({ en: post?.body.en ?? '', fr: post?.body.fr ?? '' });
    setSeoTitle({ en: post?.seo_title?.en ?? '', fr: post?.seo_title?.fr ?? '' });
    setSeoDescription({ en: post?.seo_description?.en ?? '', fr: post?.seo_description?.fr ?? '' });
    setImageAlt({ en: post?.featured_image_alt?.en ?? '', fr: post?.featured_image_alt?.fr ?? '' });
    setImagePath(post?.featured_image_path ?? '');
    setCategoryId(post?.category?.id ? String(post.category.id) : '');
    setTagIds(post?.tags?.map((tag) => tag.id) ?? []);
    setStatus(post?.status ?? 'draft');
    setIsFeatured(Boolean(post?.is_featured));
  }, [post]);

  const availableStatuses = useMemo(() => {
    if (canPublish) {
      return options?.statuses ?? [];
    }

    return (options?.statuses ?? []).filter((item) => ['draft', 'review'].includes(item.value));
  }, [canPublish, options?.statuses]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      title: cleanLocalized(title),
      slug: cleanLocalized(slug),
      excerpt: cleanLocalized(excerpt),
      body: cleanLocalized(body),
      seo_title: cleanLocalized(seoTitle),
      seo_description: cleanLocalized(seoDescription),
      featured_image_alt: cleanLocalized(imageAlt),
      featured_image_path: imagePath.trim() || null,
      blog_category_id: categoryId ? Number(categoryId) : null,
      tag_ids: tagIds,
      status,
      is_featured: isFeatured,
    });
  }

  return (
    <DashboardPanel
      title={mode === 'create' ? copy.form.titleCreate : copy.form.titleEdit}
      className="min-w-0"
      bodyClassName="min-w-0"
    >
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
              {locale === 'en' ? copy.form.english : copy.form.french}
            </button>
          ))}
        </div>

        <TextInput label={copy.form.title} value={title[activeLocale] ?? ''} required={activeLocale === 'en'} onChange={(value) => setTitle((current) => ({ ...current, [activeLocale]: value }))} />
        <TextInput label={copy.form.slug} value={slug[activeLocale] ?? ''} onChange={(value) => setSlug((current) => ({ ...current, [activeLocale]: value }))} />
        <TextArea label={copy.form.excerpt} value={excerpt[activeLocale] ?? ''} rows={3} onChange={(value) => setExcerpt((current) => ({ ...current, [activeLocale]: value }))} />
        <TextArea label={copy.form.body} value={body[activeLocale] ?? ''} rows={10} required={activeLocale === 'en'} onChange={(value) => setBody((current) => ({ ...current, [activeLocale]: value }))} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-xs font-black uppercase text-ink-500">{copy.form.category}</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="focus-ring mt-1 h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
            >
              <option value="">-</option>
              {(options?.categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-xs font-black uppercase text-ink-500">{copy.form.status}</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BlogPostPayload['status'])}
              className="focus-ring mt-1 h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
            >
              {availableStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="rounded-md border border-ink-100 p-3">
          <legend className="px-1 text-xs font-black uppercase text-ink-500">{copy.form.tags}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(options?.tags ?? []).map((tag) => (
              <label key={tag.id} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700">
                <input
                  type="checkbox"
                  checked={tagIds.includes(tag.id)}
                  onChange={(event) =>
                    setTagIds((current) => (event.target.checked ? [...current, tag.id] : current.filter((id) => id !== tag.id)))
                  }
                  className="h-4 w-4 rounded border-ink-300 text-foundation-700"
                />
                {tag.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(event) => setIsFeatured(event.target.checked)}
            className="h-4 w-4 rounded border-ink-300 text-foundation-700"
          />
          {copy.form.featured}
        </label>

        <TextInput label={copy.form.imagePath} value={imagePath} onChange={setImagePath} />
        <TextInput label={copy.form.imageAlt} value={imageAlt[activeLocale] ?? ''} onChange={(value) => setImageAlt((current) => ({ ...current, [activeLocale]: value }))} />
        <TextInput label={copy.form.seoTitle} value={seoTitle[activeLocale] ?? ''} onChange={(value) => setSeoTitle((current) => ({ ...current, [activeLocale]: value }))} />
        <TextArea label={copy.form.seoDescription} value={seoDescription[activeLocale] ?? ''} rows={3} onChange={(value) => setSeoDescription((current) => ({ ...current, [activeLocale]: value }))} />

        <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring min-h-11 rounded-md border border-ink-200 px-4 text-sm font-black text-ink-700 transition hover:bg-ink-50"
          >
            {copy.cancel}
          </button>
          <button
            type="submit"
            disabled={isWorking}
            className="focus-ring min-h-11 rounded-md bg-foundation-600 px-4 text-sm font-black text-white transition hover:bg-foundation-900 disabled:opacity-50"
          >
            {isWorking ? copy.saving : copy.save}
          </button>
        </div>
      </form>
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

function TextArea({
  label,
  value,
  rows,
  required,
  onChange,
}: {
  label: string;
  value: string;
  rows: number;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-ink-500">{label}</span>
      <textarea
        value={value}
        rows={rows}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-3 text-sm font-semibold leading-6 text-ink-800"
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
