import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BarChart3, HandCoins, Home, Inbox, Mail, UsersRound } from 'lucide-react';
import { Locale } from '../../lib/i18n';
import { Seo } from '../../components/seo/Seo';
import { isAuthenticated } from '../../lib/auth';
import { publicNavigation } from '../../content/publicPages';
import { useEffect } from 'react';

interface NotFoundPageProps {
  locale: Locale;
}

export function NotFoundPage({ locale }: NotFoundPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const seoPath = stripLocalePrefix(location.pathname, locale);

  useEffect(() => {
    // Track 404 for analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_not_found', {
        page_path: location.pathname,
        referrer: document.referrer,
        locale,
        authenticated,
        timestamp: new Date().toISOString(),
      });
    }
  }, [location.pathname, locale, authenticated]);

  const copy = {
    en: {
      title: 'Page Not Found',
      heading: "We couldn't find that page",
      description: "The page you're looking for doesn't exist or may have been moved.",
      goBack: 'Go Back',
      goHome: 'Go to Home',
      dashboard: 'Go to Dashboard',
      publicLinks: 'Helpful Links',
      staffLinks: 'Work Area Shortcuts',
      contact: 'Need Help?',
      contactText: 'If you believe this is an error, please contact us.',
      contactButton: 'Contact Support',
    },
    fr: {
      title: 'Page introuvable',
      heading: 'Nous ne trouvons pas cette page',
      description: "La page que vous recherchez n'existe pas ou a peut-être été déplacée.",
      goBack: 'Retour',
      goHome: "Aller à l'accueil",
      dashboard: 'Aller au tableau de bord',
      publicLinks: 'Liens utiles',
      staffLinks: 'Raccourcis de travail',
      contact: "Besoin d'aide ?",
      contactText: "Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.",
      contactButton: 'Contacter le support',
    },
  };

  const t = copy[locale];
  const publicLinks = publicNavigation.filter((item) => ['home', 'about', 'contact', 'donate', 'sponsor', 'apply'].includes(item.key));
  const staffLinks = [
    { to: `/${locale}/staff`, label: t.dashboard, icon: BarChart3 },
    { to: `/${locale}/staff/applications`, label: locale === 'fr' ? 'Demandes' : 'Applications', icon: Inbox },
    { to: `/${locale}/staff/beneficiaries`, label: locale === 'fr' ? 'Bénéficiaires' : 'Beneficiaries', icon: UsersRound },
    { to: `/${locale}/staff/funding`, label: locale === 'fr' ? 'Financement' : 'Funding', icon: HandCoins },
  ];

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/${locale}`);
    }
  };

  return (
    <>
      <Seo
        meta={{
          title: `404 - ${t.title}`,
          description: t.description,
          path: { en: seoPath, fr: seoPath },
          locale,
          noIndex: true,
        }}
      />

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-foundation-50">
            <AlertCircle className="h-10 w-10 text-foundation-600" aria-hidden="true" />
          </div>

          <p className="mb-3 text-7xl font-black leading-none text-foundation-900 sm:text-8xl" aria-label="404">
            404
          </p>

          {/* Heading */}
          <h1 className="mb-4 text-4xl font-bold text-ink-900 sm:text-5xl">{t.heading}</h1>
          
          {/* Description */}
          <p className="mb-8 text-lg text-ink-600">{t.description}</p>

          {/* Primary Actions */}
          <div className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={handleGoBack}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-6 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t.goBack}
            </button>

            {authenticated ? (
              <Link
                to={`/${locale}/staff`}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-6 text-sm font-semibold text-white transition hover:bg-foundation-900"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                {t.dashboard}
              </Link>
            ) : (
              <Link
                to={`/${locale}`}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-6 text-sm font-semibold text-white transition hover:bg-foundation-900"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                {t.goHome}
              </Link>
            )}
          </div>

          {/* Helpful Links */}
          <div className="mx-auto max-w-lg rounded-xl border border-ink-100 bg-white p-6 text-left shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-ink-900">{authenticated ? t.staffLinks : t.publicLinks}</h2>
            <nav className="grid gap-2">
              {authenticated
                ? staffLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-foundation-50 hover:text-foundation-900"
                  >
                    <item.icon className="h-4 w-4 text-foundation-600" aria-hidden="true" />
                    {item.label}
                  </Link>
                ))
                : publicLinks.map((item) => (
                  <Link
                    key={item.key}
                    to={`/${locale}${item.path[locale]}`}
                    className="focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-foundation-50 hover:text-foundation-900"
                  >
                    <item.icon className="h-4 w-4 text-foundation-600" aria-hidden="true" />
                    {item.label[locale]}
                  </Link>
                ))}
            </nav>
          </div>

          {/* Contact Support */}
          <div className="mt-8 rounded-lg border border-ink-100 bg-ink-50 p-6">
            <h3 className="mb-2 text-base font-semibold text-ink-900">{t.contact}</h3>
            <p className="mb-4 text-sm text-ink-600">{t.contactText}</p>
            <Link
              to={`/${locale}/contact`}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-foundation-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-foundation-900"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t.contactButton}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function stripLocalePrefix(pathname: string, locale: Locale): string {
  const prefix = `/${locale}`;

  if (pathname === prefix) {
    return '/';
  }

  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length);
  }

  return pathname || '/';
}
