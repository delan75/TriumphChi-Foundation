import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, type PublicPageDefinition } from '../../../content/publicPages';
import { apiPublicGetBlogOptions, apiPublicListBlogPosts, type BlogCategoryRecord, type BlogPostRecord } from '../../../lib/api';
import type { Locale } from '../../../lib/i18n';
import defaultBlogImage from '../../../assets/landing/kids_studying_tree.webp';
import heroImage from '../../../assets/landing/education_aid_project.jpg';
import { publicBlogContent } from './blogContent';

interface BlogIndexPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

export function BlogIndexPage({ locale, page }: BlogIndexPageProps) {
  const copy = publicBlogContent[locale];
  const homePage = getPageByKey('home');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const optionsQuery = useQuery({
    queryKey: ['public-blog-options', locale],
    queryFn: () => apiPublicGetBlogOptions(locale),
    staleTime: 1000 * 60 * 5,
  });

  const postsQuery = useQuery({
    queryKey: ['public-blog-posts', locale, category, search],
    queryFn: () =>
      apiPublicListBlogPosts(
        {
          category: category || undefined,
          search: search || undefined,
          per_page: 12,
        },
        locale,
      ),
    staleTime: 1000 * 60,
  });

  const posts = postsQuery.data?.data ?? [];
  const featured = posts.find((post) => post.is_featured) ?? posts[0] ?? null;
  const remainingPosts = featured ? posts.filter((post) => post.uuid !== featured.uuid) : posts;

  const categories = useMemo(
    () => optionsQuery.data?.categories.filter((item) => (item.posts_count ?? 0) > 0) ?? [],
    [optionsQuery.data?.categories],
  );

  return (
    <>
      <Seo
        meta={{
          title: page.seoTitle?.[locale] ?? page.title[locale],
          description: page.seoDescription?.[locale] ?? page.description[locale],
          path: page.path,
          locale,
          image: heroImage,
        }}
        structuredData={buildPublicPageSchema(page, locale)}
      />

      <PublicPageTitle
        locale={locale}
        title={page.title[locale]}
        description={page.description[locale]}
        backgroundImage={heroImage}
        backgroundAlt={locale === 'fr' ? 'Enfants et communaute autour du soutien scolaire.' : 'Children and community around education support.'}
        breadcrumbs={[
          { label: homePage.label[locale], to: `/${locale}${homePage.path[locale]}` },
          { label: page.label[locale] },
        ]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-4 rounded-md border border-foundation-100 bg-foundation-50 p-4 shadow-xs lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.38fr)] lg:p-5">
            <div>
              <p className="text-sm font-black uppercase text-foundation-700">{copy.heroEyebrow}</p>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-600">
                {locale === 'fr'
                  ? 'Des notes soigneusement publiees sur l education, les familles, les ecoles et les communautes qui aident les enfants a continuer.'
                  : 'Carefully published notes about education, families, schools, and the communities helping children continue learning.'}
              </p>
            </div>
            <label className="relative block">
              <span className="sr-only">{copy.searchLabel}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="focus-ring h-12 w-full rounded-md border border-ink-200 bg-white pl-10 pr-3 text-sm font-semibold text-ink-800 placeholder:text-ink-400"
              />
            </label>
          </div>

          <CategoryRail copy={copy} categories={categories} selected={category} onSelect={setCategory} />

          {postsQuery.isLoading ? (
            <div className="mt-8 rounded-md border border-ink-100 bg-white p-8 text-sm font-bold text-ink-500 shadow-xs">{copy.loading}</div>
          ) : posts.length === 0 ? (
            <div className="mt-8 rounded-md border border-ink-100 bg-ink-50 p-8">
              <h2 className="text-xl font-black text-ink-900">{copy.emptyTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-500">{copy.emptyBody}</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
              {featured ? <FeaturedArticle post={featured} locale={locale} copy={copy} /> : null}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="flex items-center justify-between sm:col-span-2 lg:col-span-1">
                  <h2 className="text-lg font-black text-ink-900">{copy.latest}</h2>
                  <span className="rounded-md bg-ink-50 px-3 py-1 text-xs font-bold text-ink-500">{posts.length}</span>
                </div>
                {remainingPosts.map((post) => (
                  <ArticleCard key={post.uuid} post={post} locale={locale} copy={copy} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function CategoryRail({
  copy,
  categories,
  selected,
  onSelect,
}: {
  copy: (typeof publicBlogContent)['en'];
  categories: BlogCategoryRecord[];
  selected: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-2">
      <div className="flex min-w-max gap-2">
        <button
          type="button"
          onClick={() => onSelect('')}
          className={cn(
            'focus-ring min-h-11 rounded-md border px-4 text-sm font-black transition',
            selected === '' ? 'border-foundation-700 bg-foundation-700 text-white' : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
          )}
        >
          {copy.allCategories}
        </button>
        {categories.map((category) => (
          <button
            key={category.uuid}
            type="button"
            onClick={() => onSelect(category.current_slug ?? '')}
            className={cn(
              'focus-ring min-h-11 rounded-md border px-4 text-sm font-black transition',
              selected === category.current_slug
                ? 'border-foundation-700 bg-foundation-700 text-white'
                : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FeaturedArticle({ post, locale, copy }: { post: BlogPostRecord; locale: Locale; copy: (typeof publicBlogContent)['en'] }) {
  return (
    <article className="group overflow-hidden rounded-md border border-foundation-100 bg-foundation-950 text-white shadow-xs">
      <div className="relative min-h-[420px]">
        <ArticleImage post={post} className="absolute inset-0 h-full w-full object-cover opacity-70 saturate-[0.72] transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(10,39,33,0.96),rgba(10,39,33,0.62)_48%,rgba(10,39,33,0.2))]" />
        <div className="relative flex min-h-[420px] flex-col justify-end p-6 sm:p-8">
          <span className="inline-flex w-fit items-center gap-2 rounded-md bg-white/90 px-3 py-1 text-xs font-black uppercase text-foundation-900">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.featured}
          </span>
          <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">{post.current_title}</h2>
          {post.current_excerpt ? <p className="mt-4 max-w-xl text-base leading-7 text-white/85">{post.current_excerpt}</p> : null}
          <ArticleMeta post={post} copy={copy} className="mt-5 text-white/80" />
          <Link
            to={`/${locale}/blog/${post.current_slug}`}
            className="focus-ring mt-6 inline-flex min-h-12 w-fit items-center gap-2 rounded-md bg-white px-5 text-sm font-black text-foundation-900 transition hover:bg-foundation-50"
          >
            {copy.read}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ArticleCard({
  post,
  locale,
  copy,
  compact = false,
}: {
  post: BlogPostRecord;
  locale: Locale;
  copy: (typeof publicBlogContent)['en'];
  compact?: boolean;
}) {
  return (
    <article className="group grid overflow-hidden rounded-md border border-ink-100 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md sm:grid-cols-[150px_1fr]">
      <div className="relative min-h-40 overflow-hidden bg-foundation-900">
        <ArticleImage post={post} className="h-full min-h-40 w-full object-cover opacity-80 saturate-[0.75] transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,55,47,0.08),rgba(18,55,47,0.72))]" />
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.category ? (
            <span className="rounded-md bg-foundation-50 px-2.5 py-1 text-xs font-black uppercase text-foundation-700">{post.category.label}</span>
          ) : null}
          <ArticleMeta post={post} copy={copy} />
        </div>
        <h3 className={cn('mt-3 font-black leading-tight text-ink-900', compact ? 'text-xl' : 'text-2xl')}>{post.current_title}</h3>
        {post.current_excerpt ? <p className="mt-2 text-sm leading-6 text-ink-500">{post.current_excerpt}</p> : null}
        <Link
          to={`/${locale}/blog/${post.current_slug}`}
          className="focus-ring mt-4 inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-black text-foundation-700 transition hover:text-foundation-900"
        >
          {copy.read}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function ArticleImage({ post, className }: { post: BlogPostRecord; className: string }) {
  return (
    <img
      src={post.featured_image_path || defaultBlogImage}
      alt={post.current_featured_image_alt || post.current_title}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

function ArticleMeta({ post, copy, className }: { post: BlogPostRecord; copy: (typeof publicBlogContent)['en']; className?: string }) {
  const date = post.published_at ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(post.published_at)) : null;

  return (
    <span className={cn('text-xs font-bold text-ink-500', className)}>
      {date ? `${copy.published} ${date} · ` : ''}
      {post.reading_minutes} {copy.minRead}
    </span>
  );
}
