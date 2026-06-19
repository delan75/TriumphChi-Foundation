import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Locale } from '../../lib/i18n';
import { LocaleSelector } from '../ui/LocaleSelector';

interface AuthLayoutProps {
  children: ReactNode;
  locale: Locale;
  leftPanelContent: {
    title: string;
    tagline: string;
    description: string;
    highlights: string[];
  };
  backgroundImages: {
    primary: string;
    secondary: string;
    primaryAlt?: string;
    secondaryAlt?: string;
  };
  mobileHeader?: boolean;
}

export function AuthLayout({
  children,
  locale,
  leftPanelContent,
  backgroundImages,
  mobileHeader = true
}: AuthLayoutProps) {
  const { primary, secondary } = backgroundImages;

  return (
    <div className="min-h-dvh bg-white">
      {/* Mobile header */}
      {mobileHeader && (
        <header className="sticky top-0 z-30 border-b border-white/20 bg-white/[0.92] shadow-sm backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link to={`/${locale}`} className="focus-ring flex min-h-11 items-center gap-3 rounded-md pr-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-foundation-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-foundation-900">{leftPanelContent.title}</span>
                <span className="block truncate text-xs text-ink-500">{leftPanelContent.tagline}</span>
              </span>
            </Link>

            {/* Mobile Locale Selector */}
            <div className="shrink-0">
              <LocaleSelector locale={locale} theme="light" />
            </div>
          </div>
        </header>
      )}

      <div className="lg:grid lg:min-h-dvh lg:grid-cols-2">
        {/* Left Panel - Brand Storytelling */}
        <div className="relative hidden overflow-hidden bg-foundation-900 lg:block">
          {/* Background Images with Crossfade */}
          <div className="absolute inset-0">
            <img
              src={primary}
              alt=""
              className="auth-slide absolute inset-0 h-full w-full object-cover object-center opacity-100 saturate-[0.78]"
              loading="eager"
            />
            <img
              src={secondary}
              alt=""
              className="auth-slide auth-slide-two absolute inset-0 h-full w-full object-cover object-[center_60%] opacity-0 saturate-[0.78]"
              loading="lazy"
            />
          </div>

          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,55,47,0.94)_0%,rgba(18,55,47,0.88)_28%,rgba(18,55,47,0.62)_72%,rgba(18,55,47,0.82)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(215,243,234,0.16),transparent_24%),linear-gradient(0deg,rgba(18,55,47,0.84),transparent_46%)]" />

          {/* Content */}
          <div className="relative flex h-full flex-col justify-between p-8">
            <div>
              <Link to={`/${locale}`} className="focus-ring inline-flex items-center gap-3 rounded-md p-2">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-white/10 text-white backdrop-blur">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">{leftPanelContent.title}</h1>
                  <p className="text-sm text-foundation-100">{leftPanelContent.tagline}</p>
                </div>
              </Link>
            </div>

            <div className="mt-auto">
              <div className="max-w-md">
                <p className="text-base leading-7 text-foundation-100">{leftPanelContent.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {leftPanelContent.highlights.map((highlight, index) => (
                    <div
                      key={highlight}
                      className="rounded-md border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <p className="text-sm font-semibold text-white">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language selector for desktop */}
              <div className="mt-8">
                <LocaleSelector locale={locale} theme="dark" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="flex flex-col">
          <div className="flex-1 lg:min-h-dvh lg:flex lg:flex-col lg:justify-center">
            {children}
          </div>

          {/* Mobile Brand Storytelling - visible only on mobile */}
          <div className="bg-foundation-900 px-4 py-12 text-white lg:hidden">
            <div className="mx-auto max-w-md">
              <p className="text-base leading-7 text-foundation-100">{leftPanelContent.description}</p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {leftPanelContent.highlights.map((highlight, index) => (
                  <div
                    key={highlight}
                    className="flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-4 text-center"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <p className="text-sm font-semibold text-white">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}