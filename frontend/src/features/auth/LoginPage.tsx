import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../../components/ui/cn';
import { Locale } from '../../lib/i18n';
import { Seo } from '../../components/seo/Seo';
import { apiLogin } from '../../lib/api';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { InputField } from '../../components/ui/InputField';
import { PasswordField } from '../../components/ui/PasswordField';
import { GoogleAuthButton, SocialAuthButton } from '../../components/ui/GoogleAuthButton';
import { buildAuthPath, resolvePostAuthPath } from '../../lib/auth';
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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const copy = loginCopy[locale];
  const redirectTarget = redirectTo ?? searchParams.get('redirectTo');

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

      localStorage.setItem('triumphchi.authenticated', 'true');
      localStorage.setItem('triumphchi.user', JSON.stringify(response.user));
      localStorage.setItem('auth_token', response.token.access_token);

      navigate(resolvePostAuthPath(locale, redirectTarget), { replace: true });
    } catch (error) {
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

              <GoogleAuthButton
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'}/auth/google/redirect`)}
              >
                {copy.continueWithGoogle}
              </GoogleAuthButton>
              <SocialAuthButton
                provider="facebook"
                className="mt-3"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'}/auth/facebook/redirect`)}
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
                    'focus-ring flex w-full justify-center rounded-md border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition duration-200 hover:border-foundation-200 hover:bg-foundation-50',
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
                    className="font-semibold text-foundation-600 hover:text-foundation-900"
                  >
                    {copy.createAccount}
                  </Link>
                </p>
              </div>

              <div className="mt-6 text-center">
                <Link to={`/${locale}`} className="text-sm text-ink-400 hover:text-ink-600">
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
    emailRequired: 'Adresse email requise',
    emailInvalid: 'Veuillez entrer une adresse email valide',
    passwordRequired: 'Mot de passe requis',
    leftPanel: sharedLeftPanel.fr,
  },
};
