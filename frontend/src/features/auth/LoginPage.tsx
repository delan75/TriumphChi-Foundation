import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../../components/ui/cn';
import { Locale } from '../../lib/i18n';
import { Seo } from '../../components/seo/Seo';
import { ApiRequestError, VerificationContext, apiLogin } from '../../lib/api';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { InputField } from '../../components/ui/InputField';
import { PasswordField } from '../../components/ui/PasswordField';
import { GoogleAuthButton, SocialAuthButton } from '../../components/ui/GoogleAuthButton';
import { buildAuthPath, resolvePostAuthPath, sanitizeRedirectTo, storeAuthSession } from '../../lib/auth';
import { getPublicContactSupportText } from '../../lib/publicContact';
import classroomImage from '../../assets/landing/classroom-support.png';
import kidsImage from '../../assets/landing/kids_studying_tree.webp';

interface LoginPageProps {
  locale: Locale;
  redirectTo?: string | null;
}

export function LoginPage({ locale, redirectTo }: LoginPageProps) {
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const copy = loginCopy[locale];
  const redirectTarget = redirectTo ?? searchParams.get('redirectTo');

  useEffect(() => {
    const error = searchParams.get('error');
    const verified = searchParams.get('verified');

    if (verified) {
      setNotice(copy.verifiedNotice);
    } else if (error) {
      setNotice(oauthErrorMessage(error, copy));
    }
  }, [copy, searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateLogin(formData, copy);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiLogin(formData.email, formData.password);

      if (!storeAuthSession(response)) {
        throw new Error(copy.invalidLogin);
      }

      navigate(resolvePostAuthPath(locale, redirectTarget), { replace: true });
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === 'email_not_verified') {
        persistVerificationContext(error.data, formData.email);
        navigate(`/${locale}/verify-account?email=${encodeURIComponent(formData.email)}`, { replace: true });
        return;
      }

      setErrors({ submit: error instanceof Error ? error.message : copy.invalidLogin });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }));
    }

    if (notice) {
      setNotice(null);
    }
  };

  const beginSocialAuth = (provider: 'google' | 'facebook') => {
    const sanitizedRedirect = sanitizeRedirectTo(redirectTarget);

    if (sanitizedRedirect) {
      window.localStorage.setItem('triumphchi.oauth.redirectTo', sanitizedRedirect);
    } else {
      window.localStorage.removeItem('triumphchi.oauth.redirectTo');
    }

    window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'}/auth/${provider}/redirect`;
  };

  return (
    <>
      <Seo
        meta={{
          title: `${copy.title} - ${copy.leftPanel.title}`,
          description: copy.subtitle,
          path: { en: '/login', fr: '/login' },
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
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-ink-900">{copy.title}</h2>
                <p className="mt-2 text-sm text-ink-500">{copy.subtitle}</p>
              </div>

              {notice && (
                <div className="mb-6 rounded-md border border-foundation-200 bg-foundation-50 p-3">
                  <p className="text-sm text-foundation-900">{notice}</p>
                </div>
              )}

              <GoogleAuthButton
                onClick={() => beginSocialAuth('google')}
              >
                {copy.continueWithGoogle}
              </GoogleAuthButton>
              <SocialAuthButton
                provider="facebook"
                className="mt-3"
                onClick={() => beginSocialAuth('facebook')}
              >
                {copy.continueWithFacebook}
              </SocialAuthButton>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-ink-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs uppercase tracking-wider text-ink-400">{copy.orContinueWith}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <InputField
                  label={copy.emailLabel}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="you@example.com"
                />

                <PasswordField
                  label={copy.passwordLabel}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="********"
                />

                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center text-sm text-ink-700">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-ink-300 text-foundation-600 focus:ring-foundation-500"
                    />
                    <span className="ml-2">{copy.rememberMe}</span>
                  </label>

                  <Link
                    to={buildAuthPath(locale, 'forgot-password', redirectTarget)}
                    className="text-sm font-medium text-foundation-600 hover:text-foundation-900"
                  >
                    {copy.forgotPassword}
                  </Link>
                </div>

                {errors.submit && (
                  <div className="rounded-md border border-support-red/20 bg-support-red/5 p-3">
                    <p className="text-sm text-support-red">{errors.submit}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'focus-ring flex w-full justify-center rounded-md bg-foundation-50 px-4 py-2.5 text-sm font-semibold text-foundation-900 shadow-sm transition hover:bg-foundation-900 hover:text-white',
                    isLoading && 'cursor-not-allowed opacity-50',
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-400 border-t-transparent" />
                      {copy.signingIn}
                    </span>
                  ) : (
                    copy.signIn
                  )}
                </button>
              </form>

              <div className="mt-8 border-t border-ink-100 pt-6 text-center">
                <p className="text-sm text-ink-500">
                  {copy.noAccount}{' '}
                  <Link
                    to={buildAuthPath(locale, 'register', redirectTarget)}
                    className="font-semibold text-foundation-600 hover:text-foundation-900 hover:underline hover:underline-offset-4"
                  >
                    {copy.createAccount}
                  </Link>
                </p>
              </div>

              <div className="mt-6 text-center">
                <Link to={`/${locale}`} className="text-sm text-ink-400 hover:underline hover:underline-offset-4 hover:text-ink-600">
                  {'←'} {copy.backHome}
                </Link>
              </div>
            </div>

            <div className="mt-8 text-center lg:hidden">
              <p className="text-xs text-ink-400">{getPublicContactSupportText(locale)}</p>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}

function persistVerificationContext(data: unknown, fallbackEmail: string): void {
  const context = isVerificationContext(data)
    ? data
    : {
        email: fallbackEmail,
        masked_email: maskEmail(fallbackEmail),
        masked_phone: null,
        has_phone: false,
      };

  window.sessionStorage.setItem('triumphchi.verification', JSON.stringify(context));
}

function isVerificationContext(data: unknown): data is VerificationContext {
  return Boolean(
    data
      && typeof data === 'object'
      && 'email' in data
      && typeof (data as VerificationContext).email === 'string'
      && 'masked_email' in data
      && typeof (data as VerificationContext).masked_email === 'string',
  );
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');

  if (!name || !domain) {
    return email;
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

function oauthErrorMessage(error: string, copy: typeof loginCopy.en): string {
  return copy.oauthErrors[error as keyof typeof copy.oauthErrors] ?? copy.oauthErrors.oauth_failed;
}

function validateLogin(formData: { email: string; password: string }, copy: typeof loginCopy.en) {
  const errors: Record<string, string> = {};

  if (!formData.email) {
    errors.email = copy.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = copy.emailInvalid;
  }

  if (!formData.password) {
    errors.password = copy.passwordRequired;
  }

  return errors;
}

const sharedLeftPanel = {
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

const loginCopy = {
  en: {
    title: 'Welcome Back',
    subtitle: 'Sign in to access your account and continue supporting the mission.',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot your password?',
    signIn: 'Sign in',
    noAccount: "Don't have an account?",
    createAccount: 'Create Account',
    continueWithGoogle: 'Continue with Google',
    continueWithFacebook: 'Continue with Facebook',
    orContinueWith: 'Or continue with email',
    backHome: 'Back to home',
    signingIn: 'Signing in...',
    invalidLogin: 'Invalid email or password. Please try again.',
    verifiedNotice: 'Your email has been verified. You can now sign in.',
    oauthErrors: {
      oauth_failed: 'Social sign-in could not be completed. Please try again.',
      email_required: 'Your social account did not share an email address.',
      email_not_verified: 'Please verify your social account email before signing in.',
      account_inactive: 'This account is not active. Please contact support.',
      server_error: 'We could not complete sign-in. Please try again shortly.',
    },
    emailRequired: 'Email address is required',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Password is required',
    leftPanel: sharedLeftPanel.en,
  },
  fr: {
    title: 'Bon retour',
    subtitle: 'Connectez-vous pour accéder à votre compte et continuer à soutenir la mission.',
    emailLabel: 'Adresse email',
    passwordLabel: 'Mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    signIn: 'Se connecter',
    noAccount: "Vous n'avez pas de compte ?",
    createAccount: 'Créer un compte',
    continueWithGoogle: 'Continuer avec Google',
    continueWithFacebook: 'Continuer avec Facebook',
    orContinueWith: 'Ou continuer avec votre email',
    backHome: "Retour à l'accueil",
    signingIn: 'Connexion...',
    invalidLogin: 'Email ou mot de passe invalide. Veuillez réessayer.',
    verifiedNotice: 'Votre email a ete verifie. Vous pouvez maintenant vous connecter.',
    oauthErrors: {
      oauth_failed: 'La connexion sociale n a pas pu aboutir. Veuillez reessayer.',
      email_required: 'Votre compte social n a pas partage d adresse email.',
      email_not_verified: 'Veuillez verifier l email de votre compte social avant de vous connecter.',
      account_inactive: 'Ce compte n est pas actif. Veuillez contacter le support.',
      server_error: 'Connexion impossible pour le moment. Veuillez reessayer.',
    },
    emailRequired: 'Adresse email requise',
    emailInvalid: 'Veuillez entrer une adresse email valide',
    passwordRequired: 'Mot de passe requis',
    leftPanel: sharedLeftPanel.fr,
  },
};
