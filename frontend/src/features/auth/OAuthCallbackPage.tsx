import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { Locale } from '../../lib/i18n';
import { apiExchangeOAuthCode } from '../../lib/api';
import { resolvePostAuthPath, storeAuthSession, sanitizeRedirectTo } from '../../lib/auth';

interface OAuthCallbackPageProps {
  locale: Locale;
}

export function OAuthCallbackPage({ locale }: OAuthCallbackPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const copy = oauthCallbackCopy[locale];
  const code = searchParams.get('code');

  useEffect(() => {
    let isMounted = true;

    if (!code) {
      setError(copy.missingCode);
      return;
    }

    const exchangeCodeValue = code;

    async function exchangeCode() {
      try {
        const response = await apiExchangeOAuthCode(exchangeCodeValue, 'web-client');

        if (!storeAuthSession(response)) {
          throw new Error(copy.failed);
        }

        const redirectTo = sanitizeRedirectTo(window.localStorage.getItem('triumphchi.oauth.redirectTo'));
        window.localStorage.removeItem('triumphchi.oauth.redirectTo');

        if (isMounted) {
          navigate(resolvePostAuthPath(locale, redirectTo), { replace: true });
        }
      } catch (exchangeError) {
        if (isMounted) {
          setError(exchangeError instanceof Error ? exchangeError.message : copy.failed);
        }
      }
    }

    void exchangeCode();

    return () => {
      isMounted = false;
    };
  }, [code, copy, locale, navigate]);

  return (
    <>
      <Seo
        meta={{
          title: `${copy.title} - TriumphChi Foundation`,
          description: copy.description,
          path: { en: '/oauth/callback', fr: '/oauth/callback' },
          locale,
        }}
      />

      <main className="min-h-screen bg-foundation-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
          <section className="w-full rounded-xl border border-foundation-100 bg-white p-8 text-center shadow-lg">
            {!error ? (
              <>
                <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-foundation-700 border-t-transparent" />
                <h1 className="mt-6 text-2xl font-bold text-ink-900">{copy.title}</h1>
                <p className="mt-3 text-sm leading-6 text-ink-600">{copy.description}</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-ink-900">{copy.errorTitle}</h1>
                <p className="mt-3 text-sm leading-6 text-support-red">{error}</p>
                <Link
                  to={`/${locale}/login`}
                  className="focus-ring mt-6 inline-flex rounded-md bg-foundation-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-foundation-900"
                >
                  {copy.backToLogin}
                </Link>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

const oauthCallbackCopy = {
  en: {
    title: 'Completing Sign In',
    description: 'Please wait while we complete your secure sign-in.',
    errorTitle: 'Sign In Could Not Be Completed',
    missingCode: 'This sign-in session is missing a verification code.',
    failed: 'This sign-in session has expired. Please try signing in again.',
    backToLogin: 'Back to sign in',
  },
  fr: {
    title: 'Connexion en cours',
    description: 'Veuillez patienter pendant la finalisation de votre connexion securisee.',
    errorTitle: 'Connexion impossible',
    missingCode: 'Cette session de connexion ne contient pas de code de verification.',
    failed: 'Cette session de connexion a expire. Veuillez recommencer.',
    backToLogin: 'Retour a la connexion',
  },
};
