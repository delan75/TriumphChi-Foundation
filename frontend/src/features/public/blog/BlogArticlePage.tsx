import { ArrowLeft, CalendarDays, Clock, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { getPageByKey } from '../../../content/publicPages';
import { apiPublicGetBlogPost, type BlogPostRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildJsonLdGraph,
  buildOrganizationSchema,
  buildWebSiteSchema,
  localizedUrl,
} from '../../../lib/seo';
import defaultBlogImage from '../../../assets/landing/kids_studying_tree.webp';
import { publicBlogContent } from './blogContent';

interface BlogArticlePageProps {
  locale: Locale;
}

export function BlogArticlePage({ locale }: BlogArticlePageProps) {
  const { articleSlug = '' } = useParams();
  const copy = publicBlogContent[locale];
  const blogPage = getPageByKey('blog');
  const homePage = getPageByKey('home');

  const articleQuery = useQuery({
    queryKey: ['public-blog-post', locale, articleSlug],
    queryFn: () => apiPublicGetBlogPost(articleSlug, locale),
    enabled: Boolean(articleSlug),
    staleTime: 1000 * 60,
  });

  const article = articleQuery.data;
  const title = article?.current_seo_title || article?.current_title || blogPage.title[locale];
  const description = article?.current_seo_description || article?.current_excerpt || blogPage.description[locale];
  const path = {
    en: article ? `/blog/${article.slug.en ?? article.current_slug}` : `/blog/${articleSlug}`,
    fr: article ? `/blog/${article.slug.fr ?? article.current_slug}` : `/blog/${articleSlug}`,
  };

  return (
    <>
      <Seo
        meta={{
          title,
          description,
          path,
          locale,
          image: article?.featured_image_path || defaultBlogImage,
          imageAlt: article?.current_featured_image_alt || article?.current_title,
          type: 'article',
          publishedTime: article?.published_at ?? undefined,
          modifiedTime: article?.updated_at ?? undefined,
          section: article?.category?.label,
          tags: article?.tags?.map((tag) => tag.label),
        }}
        structuredData={article ? buildArticleSchema(article, locale, path) : undefined}
      />

      <article className="bg-white">
        <header className="relative overflow-hidden bg-foundation-950 text-white">
          <div className="absolute inset-0">
            <img
              src={article?.featured_image_path || defaultBlogImage}
              alt=""
              className="h-full w-full object-cover opacity-55 saturate-[0.68]"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(8,36,31,0.96),rgba(8,36,31,0.74)_50%,rgba(8,36,31,0.42))]" />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <Link
              to={`/${locale}${blogPage.path[locale]}`}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-white/10 px-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {copy.backToBlog}
            </Link>

            {articleQuery.isLoading ? (
              <div className="mt-10 max-w-3xl rounded-md border border-white/10 bg-white/10 p-6 text-sm font-bold text-white/85">
                {copy.loading}
              </div>
            ) : articleQuery.isError || !article ? (
              <div className="mt-10 max-w-3xl rounded-md border border-white/10 bg-white/10 p-6">
                <h1 className="text-3xl font-black">{copy.emptyTitle}</h1>
                <p className="mt-2 text-sm leading-7 text-white/75">{copy.emptyBody}</p>
              </div>
            ) : (
              <>
                <div className="mt-10 flex flex-wrap items-center gap-2">
                  {article.category ? (
                    <span className="rounded-md bg-white px-3 py-1 text-xs font-black uppercase text-foundation-900">{article.category.label}</span>
                  ) : null}
                  {article.is_featured ? (
                    <span className="rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase text-white backdrop-blur">
                      {copy.featured}
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">{article.current_title}</h1>
                {article.current_excerpt ? <p className="mt-5 max-w-3xl text-lg leading-8 text-white/82">{article.current_excerpt}</p> : null}
                <ArticleByline article={article} copy={copy} className="mt-7 text-white/78" />
              </>
            )}
          </div>
        </header>

        {article ? (
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8 lg:py-14">
            <div className="min-w-0">
              <div className="prose prose-ink max-w-none">
                {paragraphs(article.current_body).map((paragraph, index) => (
                  <p key={`${article.uuid}-${index}`} className="mb-5 text-lg leading-8 text-ink-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-md border border-ink-100 bg-foundation-50 p-5">
                <h2 className="text-sm font-black uppercase text-foundation-700">{copy.relatedTitle}</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <MetaRow icon={CalendarDays} label={copy.published} value={formatDate(article.published_at, locale)} />
                  <MetaRow icon={Clock} label="Reading" value={`${article.reading_minutes} ${copy.minRead}`} />
                  <MetaRow icon={UserRound} label={copy.writtenBy} value={article.author?.name ?? 'TriumphChi Foundation'} />
                </dl>
              </div>

              {article.tags?.length ? (
                <div className="rounded-md border border-ink-100 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-black uppercase text-ink-500">Themes</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span key={tag.uuid} className="rounded-md bg-ink-50 px-3 py-1 text-xs font-bold text-ink-700">
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        ) : null}
      </article>
    </>
  );
}

function ArticleByline({ article, copy, className }: { article: BlogPostRecord; copy: (typeof publicBlogContent)['en']; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold', className)}>
      <span>{copy.writtenBy} {article.author?.name ?? 'TriumphChi Foundation'}</span>
      <span aria-hidden="true">/</span>
      <span>{formatDate(article.published_at)}</span>
      <span aria-hidden="true">/</span>
      <span>{article.reading_minutes} {copy.minRead}</span>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[20px_1fr] gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-foundation-700" aria-hidden="true" />
      <div>
        <dt className="text-xs font-black uppercase text-ink-400">{label}</dt>
        <dd className="mt-0.5 font-bold text-ink-800">{value}</dd>
      </div>
    </div>
  );
}

function paragraphs(body: string): string[] {
  return body
    .split(/\n{2,}|\r\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value?: string | null, locale: Locale | string = 'en'): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function buildArticleSchema(article: BlogPostRecord, locale: Locale, path: Record<Locale, string>) {
  const url = localizedUrl(locale, path[locale]);
  const image = absoluteUrl(article.featured_image_path || defaultBlogImage);
  const blogPage = getPageByKey('blog');
  const homePage = getPageByKey('home');

  return buildJsonLdGraph([
    buildOrganizationSchema(locale),
    buildWebSiteSchema(locale),
    buildBreadcrumbSchema([
      { name: homePage.label[locale], url: localizedUrl(locale, homePage.path[locale]) },
      { name: blogPage.label[locale], url: localizedUrl(locale, blogPage.path[locale]) },
      { name: article.current_title, url },
    ]),
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: article.current_title,
      description: article.current_seo_description || article.current_excerpt,
      image,
      inLanguage: locale,
      datePublished: article.published_at,
      dateModified: article.updated_at,
      author: {
        '@type': 'Organization',
        name: article.author?.name ?? 'TriumphChi Foundation',
      },
      publisher: { '@id': `${absoluteUrl('/')}#organization` },
      mainEntityOfPage: url,
    },
  ]);
}
