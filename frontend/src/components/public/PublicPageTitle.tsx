import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ReactNode } from 'react';
import { Locale } from '../../lib/i18n';
import { cn } from '../ui/cn';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PublicPageTitleProps {
  locale: Locale;
  title: string;
  description: string;
  backgroundImage: string;
  backgroundAlt: string;
  breadcrumbs: BreadcrumbItem[];
  seoTitle?: string;
  seoDescription?: string;
  className?: string;
  actions?: ReactNode;
}

export function PublicPageTitle({
  locale,
  title,
  description,
  backgroundImage,
  backgroundAlt,
  breadcrumbs,
  className,
  actions,
}: PublicPageTitleProps) {
  return (
    <section className={cn('relative isolate overflow-hidden bg-foundation-900 text-white', className)}>
      <img
        src={backgroundImage}
        alt={backgroundAlt}
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-70 saturate-[0.72]"
        loading="eager"
        decoding="async"
        width="1600"
        height="900"
        {...({ fetchpriority: 'high' } as Record<string, string>)}
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,55,47,0.98)_0%,rgba(18,55,47,0.9)_45%,rgba(18,55,47,0.68)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_16%,rgba(215,243,234,0.18),transparent_24%),linear-gradient(0deg,rgba(18,55,47,0.9),rgba(18,55,47,0.24)_44%)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-foundation-50" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 ? <ChevronRight className="h-4 w-4 text-foundation-100/80" aria-hidden="true" /> : null}
              {item.to ? (
                <Link
                  to={item.to}
                  className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-md px-1 transition hover:text-white"
                >
                  {index === 0 ? <Home className="h-4 w-4" aria-hidden="true" /> : null}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="inline-flex min-h-9 items-center rounded-md px-1 text-white">{item.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-black uppercase text-foundation-100">
            {locale === 'fr' ? 'Fondation TriumphChi' : 'TriumphChi Foundation'}
          </p>
          <h1 className="text-balance text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-foundation-50">{description}</p>
          {actions ? <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
