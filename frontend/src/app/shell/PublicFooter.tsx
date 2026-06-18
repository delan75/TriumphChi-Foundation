import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { publicNavigation } from '../../content/publicPages';
import { Locale, t } from '../../lib/i18n';

interface PublicFooterProps {
  locale: Locale;
}

export function PublicFooter({ locale }: PublicFooterProps) {
  return (
    <footer className="border-t border-foundation-100 bg-foundation-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-foundation-900">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold">{t(locale, 'appName')}</p>
              <p className="text-sm text-foundation-100">{t(locale, 'operationsSubtitle')}</p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-foundation-100">
            {locale === 'fr'
              ? "Un site public pour mobiliser les donateurs, proteger les enfants et expliquer clairement l'impact du soutien scolaire."
              : 'A public site for mobilizing donors, protecting children, and explaining the impact of education support clearly.'}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {publicNavigation.slice(1).map((item) => (
            <Link
              key={item.key}
              to={`/${locale}${item.path[locale]}`}
              className="focus-ring inline-flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-semibold text-foundation-50 transition hover:bg-white/10"
            >
              {item.label[locale]}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
