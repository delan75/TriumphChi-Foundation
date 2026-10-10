import { useEffect, useMemo, useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { DashboardPanel } from '../../../components/staff/DashboardPanel';
import { apiUploadBlogMedia, type BlogOptionsResponse, type BlogPostMediaRecord, type BlogPostPayload, type BlogPostRecord, type LocalizedText } from '../../../lib/api';
import { slugify } from '../../../lib/slugify';
import type { BlogCopy } from '../blogContent';

interface BlogEditorPanelProps {
  copy: BlogCopy;
  mode: 'create' | 'edit';
  post: BlogPostRecord | null;
  options?: BlogOptionsResponse;
  isWorking: boolean;
  error?: string | null;
  canPublish: boolean;
  surface?: 'panel' | 'plain';
  onClose: () => void;
  onSubmit: (payload: BlogPostPayload) => Promise<void>;
}

type LocaleKey = 'en' | 'fr';

const emptyLocalized: LocalizedText = { en: '', fr: '' };
const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
const allowedMediaExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'mp4', 'webm', 'mov'];
const imageAccept = allowedImageExtensions.map((extension) => `.${extension}`).join(',');
const mediaAccept = allowedMediaExtensions.map((extension) => `.${extension}`).join(',');

export function BlogEditorPanel({ copy, mode, post, options, isWorking, error, canPublish, surface = 'panel', onClose, onSubmit }: BlogEditorPanelProps) {
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
  const [media, setMedia] = useState<BlogPostMediaRecord[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState<Record<LocaleKey, boolean>>({
    en: mode === 'create',
    fr: mode === 'create',
  });

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
    setMedia(post?.media ?? []);
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
      media: media
        .filter((item) => item.url?.trim())
        .map((item, index) => ({
          type: item.type ?? 'image',
          url: item.url.trim(),
          title: cleanLocalized(item.title ?? {}),
          alt: cleanLocalized(item.alt ?? {}),
          caption: cleanLocalized(item.caption ?? {}),
          credit: item.credit?.trim() || null,
          position: Number.isFinite(Number(item.position)) ? Number(item.position) : index,
          layout: item.layout ?? 'full',
        })),
    });
  }

  async function handleFeaturedUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!files.length) {
      return;
    }

    setUploadError(null);
    setIsUploadingMedia(true);

    if (!isAllowedMediaName(files[0].name, allowedImageExtensions)) {
      setUploadError(`${files[0].name} cannot be selected as a featured image.`);
      setIsUploadingMedia(false);
      return;
    }

    try {
      const [uploaded] = await apiUploadBlogMedia([files[0]]);

      if (uploaded) {
        setImagePath(uploaded.url);
        setImageAlt(uploaded.alt ?? uploaded.title ?? {});
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Unable to upload media.');
    } finally {
      setIsUploadingMedia(false);
    }
  }

  async function handleArticleMediaUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!files.length) {
      return;
    }

    const blocked = files.find((file) => !isAllowedMediaName(file.name));

    if (blocked) {
      setUploadError(`${blocked.name} cannot be selected for blog media.`);
      return;
    }

    setUploadError(null);
    setIsUploadingMedia(true);

    try {
      const uploaded = await apiUploadBlogMedia(files);
      setMedia((current) => [
        ...current,
        ...uploaded.map((item, index) => ({
          type: item.type,
          url: item.url,
          title: item.title,
          alt: item.alt,
          caption: item.caption,
          credit: item.credit,
          position: current.length + index,
          layout: item.layout ?? 'full',
        })),
      ]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Unable to upload media.');
    } finally {
      setIsUploadingMedia(false);
    }
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
                activeLocale === locale ? 'bg-white text-foundation-800 shadow-xs' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {locale === 'en' ? copy.form.english : copy.form.french}
            </button>
          ))}
        </div>

        <TextInput
          label={copy.form.title}
          value={title[activeLocale] ?? ''}
          required={activeLocale === 'en'}
          onChange={(value) => {
            setTitle((current) => ({ ...current, [activeLocale]: value }));
            if (autoSlug[activeLocale]) {
              setSlug((current) => ({ ...current, [activeLocale]: slugify(value) }));
            }
          }}
        />
        <TextInput
          label={copy.form.slug}
          value={slug[activeLocale] ?? ''}
          onChange={(value) => {
            setAutoSlug((current) => ({ ...current, [activeLocale]: false }));
            setSlug((current) => ({ ...current, [activeLocale]: value }));
          }}
        />
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
                  className="h-4 w-4 rounded-sm border-ink-300 text-foundation-700"
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
            className="h-4 w-4 rounded-sm border-ink-300 text-foundation-700"
          />
          {copy.form.featured}
        </label>

        <div className="rounded-md border border-ink-100 bg-ink-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-ink-500">{copy.form.imagePath}</p>
              <p className="mt-1 text-xs font-semibold text-ink-500">{imagePath || copy.form.mediaHelp}</p>
            </div>
            <label className="focus-within:ring-2 focus-within:ring-foundation-500 inline-flex min-h-10 cursor-pointer items-center rounded-md bg-white px-3 text-xs font-black text-foundation-800 shadow-xs transition hover:bg-foundation-50">
              {isUploadingMedia ? copy.form.uploadingMedia : copy.form.uploadMedia}
              <input
                type="file"
                accept={imageAccept}
                className="sr-only"
                disabled={isUploadingMedia}
                onChange={handleFeaturedUpload}
              />
            </label>
          </div>
        </div>
        <TextInput label={copy.form.imageAlt} value={imageAlt[activeLocale] ?? ''} onChange={(value) => setImageAlt((current) => ({ ...current, [activeLocale]: value }))} />

        <fieldset className="rounded-md border border-ink-100 bg-ink-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <legend className="text-xs font-black uppercase text-ink-500">{copy.form.media}</legend>
              <p className="mt-1 text-xs font-semibold text-ink-500">{copy.form.mediaHelp}</p>
            </div>
            <label className="focus-within:ring-2 focus-within:ring-foundation-500 inline-flex min-h-9 cursor-pointer items-center rounded-md bg-white px-3 text-xs font-black text-foundation-800 shadow-xs transition hover:bg-foundation-50">
              {isUploadingMedia ? copy.form.uploadingMedia : copy.form.uploadMedia}
              <input
                type="file"
                accept={mediaAccept}
                multiple
                className="sr-only"
                disabled={isUploadingMedia}
                onChange={handleArticleMediaUpload}
              />
            </label>
          </div>
          {uploadError ? <p className="mt-3 rounded-md border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">{uploadError}</p> : null}

          <div className="mt-3 space-y-3">
            {media.map((item, index) => (
              <div key={`${index}-${item.url}`} className="rounded-md border border-ink-100 bg-white p-3 shadow-xs">
                <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px]">
                  <div className="min-w-0 rounded-md border border-ink-100 bg-ink-50 px-3 py-2">
                    <p className="text-xs font-black uppercase text-ink-500">{copy.form.mediaUrl}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-ink-700">{item.url}</p>
                  </div>
                  <TextInput
                    label={copy.form.mediaPosition}
                    value={String(item.position ?? index)}
                    onChange={(value) => updateMedia(index, (current) => ({ ...current, position: Number(value) }), setMedia)}
                  />
                  <label className="block">
                    <span className="text-xs font-black uppercase text-ink-500">{copy.form.mediaLayout}</span>
                    <select
                      value={item.layout ?? 'full'}
                      onChange={(event) => updateMedia(index, (current) => ({ ...current, layout: event.target.value as BlogPostMediaRecord['layout'] }), setMedia)}
                      className="focus-ring mt-1 h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800"
                    >
                      <option value="full">Full</option>
                      <option value="inset">Inset</option>
                      <option value="side">Side</option>
                    </select>
                  </label>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <TextInput
                    label={copy.form.mediaTitle}
                    value={item.title?.[activeLocale] ?? ''}
                    onChange={(value) => updateMedia(index, (current) => ({
                      ...current,
                      title: { ...(current.title ?? {}), [activeLocale]: value },
                      alt: current.alt?.[activeLocale] ? current.alt : { ...(current.alt ?? {}), [activeLocale]: value },
                    }), setMedia)}
                  />
                  <TextInput
                    label={copy.form.mediaAlt}
                    value={item.alt?.[activeLocale] ?? ''}
                    onChange={(value) => updateMedia(index, (current) => ({ ...current, alt: { ...(current.alt ?? {}), [activeLocale]: value } }), setMedia)}
                  />
                  <TextInput
                    label={copy.form.mediaCaption}
                    value={item.caption?.[activeLocale] ?? ''}
                    onChange={(value) => updateMedia(index, (current) => ({ ...current, caption: { ...(current.caption ?? {}), [activeLocale]: value } }), setMedia)}
                  />
                  <TextInput
                    label={copy.form.mediaCredit}
                    value={item.credit ?? ''}
                    onChange={(value) => updateMedia(index, (current) => ({ ...current, credit: value }), setMedia)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setMedia((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                  className="focus-ring mt-3 min-h-9 rounded-md border border-red-200 px-3 text-xs font-black text-red-700 transition hover:bg-red-50"
                >
                  {copy.form.removeMedia}
                </button>
              </div>
            ))}
          </div>
        </fieldset>

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
  );

  if (surface === 'plain') {
    return form;
  }

  return (
    <DashboardPanel
      title={mode === 'create' ? copy.form.titleCreate : copy.form.titleEdit}
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

function updateMedia(
  index: number,
  update: (item: BlogPostMediaRecord) => BlogPostMediaRecord,
  setMedia: Dispatch<SetStateAction<BlogPostMediaRecord[]>>,
) {
  setMedia((current) => current.map((item, currentIndex) => (currentIndex === index ? update(item) : item)));
}

function isAllowedMediaName(fileName: string, allowedExtensions = allowedMediaExtensions): boolean {
  const parts = fileName.toLowerCase().split('.').filter(Boolean);
  const extension = parts[parts.length - 1];

  if (!extension || !allowedExtensions.includes(extension)) {
    return false;
  }

  return !parts.slice(0, -1).some((part) => ['sql', 'exe', 'php', 'js', 'bat', 'cmd', 'ps1', 'sh', 'vbs'].includes(part));
}
