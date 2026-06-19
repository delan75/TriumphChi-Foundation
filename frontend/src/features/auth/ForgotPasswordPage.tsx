import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { apiForgotPassword } from '../../lib/api';
import { cn } from '../../components/ui/cn';
import { Locale } from '../../lib/i18n';
import { Seo } from '../../components/seo/Seo';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { InputField } from '../../components/ui/InputField';
import { buildAuthPath } from '../../lib/auth';
import classroomImage from '../../assets/landing/classroom-support.png';
import kidsImage from '../../assets/landing/kids_studying_tree.webp';

interface ForgotPasswordPageProps {
  locale: Locale;
  redirectTo?: string | null;
}

export function ForgotPasswordPage({ locale, redirectTo }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchParams] = useSearchParams();
  const copy = forgotPasswordCopy[locale];
  const redirectTarget = redirectTo ?? searchParams.get('redirectTo');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email) {
      setError(copy.emailRequired);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(copy.emailInvalid);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiForgotPassword(email);
      setSuccessMessage(response.message);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Seo
        meta={{
          title: `${copy.title} - ${copy.leftPanel.title}`,
          description: copy.subtitle,
          path: { en: '/forgot-password', fr: '/forgot-password' },
          locale,
          image: classroomImage,
        }}
      />

      <AuthLayout
        locale={locale}
        leftPanelContent={copy.leftPanel}
        backgroundImages={{
          primary: classroomImage,
          secondary: kidsImage,
        }}
      >
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 lg:py-0">
          <div className="w-full max-w-md">
            <div className="rounded-xl border border-ink-100 bg-white p-8 shadow-lg">
              {isSuccess ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-foundation-100">
                    <Mail className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-bold text-ink-900">{copy.successTitle}</h2>
                  <p className="mt-2 text-sm text-ink-500">{successMessage}</p>
                  <p className="mt-2 text-sm text-ink-500">
                    <span className="font-medium text-ink-900">{email}</span>
                  </p>
                  <Link
                    to={buildAuthPath(locale, 'login', redirectTarget)}
                    className="focus-ring mt-8 flex w-full justify-center rounded-md bg-foundation-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-foundation-900"
                  >
                    {copy.successAction}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-ink-900">{copy.title}</h2>
                    <p className="mt-2 text-sm text-ink-500">{copy.subtitle}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <InputField
                      label={copy.emailLabel}
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError('');
                      }}
                      error={error}
                      placeholder="you@example.com"
                    />

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        'focus-ring flex w-full justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200',
                        isLoading ? 'cursor-not-allowed bg-foundation-400' : 'bg-foundation-600 hover:bg-foundation-900',
                      )}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {copy.sending}
                        </span>
                      ) : (
                        copy.submit
                      )}
                    </button>
                  </form>

                  <div className="mt-8 border-t border-ink-100 pt-6 text-center">
                    <Link
                      to={buildAuthPath(locale, 'login', redirectTarget)}
                      className="text-sm font-medium text-foundation-600 hover:text-foundation-900"
                    >
                      {'←'} {copy.backToLogin}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}

const leftPanel = {
  en: {
    title: 'TriumphChi Foundation',
    tagline: 'Giving from a covenant, not from leftovers.',
    description: 'Helping orphaned and vulnerable children in rural Cameroon continue learning through education support, mentorship, and community partnership.',
    highlights: ['Education Support', 'Community Partnership', 'Mentorship', 'Dignity and Opportunity'],
  },
  fr: {
    title: 'Fondation TriumphChi',
    tagline: 'Donner par alliance, pas avec les restes.',
    description: "Aider les orphelins et enfants vulnérables du Cameroun rural à continuer d'apprendre grâce au soutien éducatif, au mentorat et au partenariat communautaire.",
    highlights: ['Soutien éducatif', 'Partenariat communautaire', 'Mentorat', 'Dignité et opportunité'],
  },
};

const forgotPasswordCopy = {
  en: {
    title: 'Reset your password',
    subtitle: "Enter your email address and we'll send you a link to reset your password.",
    emailLabel: 'Email Address',
    submit: 'Send Reset Link',
    sending: 'Sending...',
    backToLogin: 'Back to sign in',
    successTitle: 'Check your email',
    successMessage: 'We have sent a password reset link to',
    successAction: 'Return to login',
    emailRequired: 'Email address is required',
    emailInvalid: 'Please enter a valid email address',
    failed: 'Failed to send reset link. Please try again later.',
    leftPanel: leftPanel.en,
  },
  fr: {
    title: 'Réinitialiser votre mot de passe',
    subtitle: 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
    emailLabel: 'Adresse email',
    submit: 'Envoyer le lien',
    sending: 'Envoi...',
    backToLogin: 'Retour à la connexion',
    successTitle: 'Vérifiez vos emails',
    successMessage: 'Nous avons envoyé un lien de réinitialisation à',
    successAction: 'Retour à la connexion',
    emailRequired: 'Adresse email requise',
    emailInvalid: 'Veuillez entrer une adresse email valide',
    failed: "L'envoi du lien a échoué. Veuillez réessayer plus tard.",
    leftPanel: leftPanel.fr,
  },
};
