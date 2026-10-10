import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../ui/cn';

export interface PublicArticlePreview {
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  eyebrow?: string;
  href?: string;
  ctaLabel?: string;
  meta?: string;
}

interface PublicArticlePreviewGridProps {
  eyebrow: string;
  title: string;
  body?: string;
  items: PublicArticlePreview[];
  variant?: 'light' | 'tinted' | 'dark';
  columns?: 2 | 3;
  className?: string;
}

export function PublicArticlePreviewGrid({
  eyebrow,
  title,
  body,
  items,
  variant = 'light',
  columns = 3,
  className,
}: PublicArticlePreviewGridProps) {
  const dark = variant === 'dark';
  const tinted = variant === 'tinted';

  return (
    <section className={cn(dark ? 'bg-ink-900 text-white' : tinted ? 'bg-foundation-50' : 'bg-white', className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className={cn('text-sm font-black uppercase', dark ? 'text-foundation-100' : 'text-foundation-600')}>{eyebrow}</p>
          <h2 className={cn('mt-2 text-3xl font-black leading-tight sm:text-4xl', dark ? 'text-white' : 'text-ink-900')}>{title}</h2>
          {body ? <p className={cn('mt-3 text-base leading-7', dark ? 'text-ink-100' : 'text-ink-500')}>{body}</p> : null}
        </div>

        <div className={cn('mt-8 grid gap-4', columns === 2 ? 'lg:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3')}>
          {items.map((item) => (
            <article
              key={item.title}
              className={cn(
                'group overflow-hidden rounded-md border shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md',
                dark ? 'border-white/10 bg-white/6' : 'border-ink-100 bg-white',
              )}
            >
              <div className="relative min-h-52 overflow-hidden bg-foundation-900">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="h-56 w-full object-cover opacity-80 saturate-[0.72] transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,55,47,0.25),rgba(18,55,47,0.88))] mix-blend-multiply"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(215,243,234,0.22),transparent_30%)]"
                  aria-hidden="true"
                />
                {item.eyebrow || item.meta ? (
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                    {item.eyebrow ? (
                      <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-black uppercase text-foundation-900">
                        {item.eyebrow}
                      </span>
                    ) : null}
                    {item.meta ? (
                      <span className="rounded-md border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                        {item.meta}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="p-5">
                <h3 className={cn('text-xl font-black leading-tight', dark ? 'text-white' : 'text-ink-900')}>{item.title}</h3>
                <p className={cn('mt-3 text-sm leading-7', dark ? 'text-ink-100' : 'text-ink-500')}>{item.summary}</p>
                {item.href && item.ctaLabel ? (
                  <Link
                    to={item.href}
                    className={cn(
                      'focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-black transition',
                      dark ? 'text-foundation-100 hover:text-white' : 'text-foundation-700 hover:text-foundation-900',
                    )}
                  >
                    {item.ctaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
