import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { cn } from '../../components/ui/cn';
import { Locale } from '../../lib/i18n';
import { Seo } from '../../components/seo/Seo';
import { AuthUser, apiRegister } from '../../lib/api';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { InputField } from '../../components/ui/InputField';
import { PasswordField } from '../../components/ui/PasswordField';
import { GoogleAuthButton, SocialAuthButton } from '../../components/ui/GoogleAuthButton';
import { buildAuthPath, resolvePostAuthPath, sanitizeRedirectTo, storeAuthSession } from '../../lib/auth';
import { getPublicContactSupportText } from '../../lib/publicContact';
import communityImage from '../../assets/landing/education_aid_project.jpg';
import ruralImage from '../../assets/landing/rural-home-cameroon.jpg';

interface RegisterPageProps {
  locale: Locale;
  redirectTo?: string | null;
}

export function RegisterPage({ locale, redirectTo }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const copy = registerCopy[locale];
  const redirectTarget = redirectTo ?? searchParams.get('redirectTo');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateRegister(formData, copy);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRegister(
        formData.name,
        formData.email,
        formData.phone,
        formData.password,
        formData.confirmPassword,
        locale,
        'web-client',
      );

      if (!storeAuthSession(response)) {
        setSuccessMessage(response.message ?? copy.verifyEmailNotice);
        persistVerificationContext(response.user);
        navigate(`/${locale}/verify-account?email=${encodeURIComponent(formData.email)}`, { replace: true });
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        });

        return;
      }

      navigate(resolvePostAuthPath(locale, redirectTarget), { replace: true });
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : copy.registrationFailed });
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

    if (successMessage) {
      setSuccessMessage(null);
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
          path: { en: '/register', fr: '/register' },
          locale,
          image: communityImage,
        }}
      />

      <AuthLayout
        locale={locale}
        leftPanelContent={copy.leftPanel}
        backgroundImages={{
          primary: communityImage,
          secondary: ruralImage,
        }}
      >
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 lg:py-0">
          <div className="w-full max-w-md">
            <div className="rounded-xl border border-ink-100 bg-white p-8 shadow-lg">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-ink-900">{copy.title}</h2>
                <p className="mt-2 text-sm text-ink-500">{copy.subtitle}</p>
              </div>

              {successMessage && (
                <div className="mb-6 rounded-md border border-foundation-200 bg-foundation-50 p-3">
                  <p className="text-sm text-foundation-900">{successMessage}</p>
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
                  label={copy.nameLabel}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder={copy.namePlaceholder}
                  icon={<UserRound className="h-4 w-4 text-ink-400" aria-hidden="true" />}
                />

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

                <InputField
                  label={copy.phoneLabel}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+237600000000"
                />
                <p className="-mt-4 text-xs text-ink-400">{copy.phoneHelp}</p>

                <PasswordField
                  label={copy.passwordLabel}
                  name="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="********"
                  helpText={copy.passwordHelp}
                />

                <PasswordField
                  label={copy.confirmPasswordLabel}
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="********"
                />

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
                      {copy.creating}
                    </span>
                  ) : (
                    copy.createAccount
                  )}
                </button>
              </form>

              <div className="mt-8 border-t border-ink-100 pt-6 text-center">
                <p className="text-sm text-ink-500">
                  {copy.haveAccount}{' '}
                  <Link
                    to={buildAuthPath(locale, 'login', redirectTarget)}
                    className="font-semibold text-foundation-600 hover:text-foundation-900"
                  >
                    {copy.signIn}
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

function persistVerificationContext(user: AuthUser): void {
  window.sessionStorage.setItem('triumphchi.verification', JSON.stringify({
    email: user.email,
    masked_email: maskEmail(user.email),
    masked_phone: user.phone ? maskPhone(user.phone) : null,
    has_phone: Boolean(user.phone),
  }));
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');

  if (!name || !domain) {
    return email;
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 4)}***${phone.slice(-2)}`;
}

function validateRegister(
  formData: { name: string; email: string; phone: string; password: string; confirmPassword: string },
  copy: typeof registerCopy.en,
) {
  const errors: Record<string, string> = {};

  if (!formData.name.trim()) {
    errors.name = copy.nameRequired;
  } else if (formData.name.trim().length < 2) {
    errors.name = copy.nameMinLength;
  }

  if (!formData.email) {
    errors.email = copy.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = copy.emailInvalid;
  }

  if (!formData.password) {
    errors.password = copy.passwordRequired;
  } else if (formData.password.length < 8) {
    errors.password = copy.passwordMinLength;
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = copy.confirmRequired;
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = copy.passwordMismatch;
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

const registerCopy = {
  en: {
    title: 'Create Your Account',
    subtitle: 'Join a community committed to helping children stay in school and thrive.',
    nameLabel: 'Full Name',
    namePlaceholder: 'John Doe',
    emailLabel: 'Email Address',
    phoneLabel: 'Phone Number',
    phoneHelp: 'Enter your phone number.',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    createAccount: 'Create Account',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    continueWithGoogle: 'Continue with Google',
    continueWithFacebook: 'Continue with Facebook',
    orContinueWith: 'Or continue with email',
    backHome: 'Back to home',
    creating: 'Creating account...',
    passwordHelp: 'Must be at least 8 characters.',
    registrationFailed: 'Registration failed. Please try again.',
    verifyEmailNotice: 'Account created. Please verify your email before signing in.',
    nameRequired: 'Full name is required',
    nameMinLength: 'Name must be at least 2 characters',
    emailRequired: 'Email address is required',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 8 characters',
    confirmRequired: 'Please confirm your password',
    passwordMismatch: 'Passwords do not match',
    leftPanel: sharedLeftPanel.en,
  },
  fr: {
    title: 'Créer votre compte',
    subtitle: "Rejoignez une communauté engagée à aider les enfants à rester à l'école et à s'épanouir.",
    nameLabel: 'Nom complet',
    namePlaceholder: 'Jean Dupont',
    emailLabel: 'Adresse email',
    phoneLabel: 'Numero de telephone',
    phoneHelp: 'Necessaire seulement pour la verification par SMS ou WhatsApp.',
    passwordLabel: 'Mot de passe',
    confirmPasswordLabel: 'Confirmer le mot de passe',
    createAccount: 'Créer le compte',
    haveAccount: 'Vous avez déjà un compte ?',
    signIn: 'Se connecter',
    continueWithGoogle: 'Continuer avec Google',
    continueWithFacebook: 'Continuer avec Facebook',
    orContinueWith: 'Ou continuer avec votre email',
    backHome: "Retour à l'accueil",
    creating: 'Création du compte...',
    passwordHelp: 'Doit contenir au moins 8 caractères.',
    registrationFailed: 'La création du compte a échoué. Veuillez réessayer.',
    verifyEmailNotice: 'Compte cree. Veuillez verifier votre email avant de vous connecter.',
    nameRequired: 'Nom complet requis',
    nameMinLength: 'Le nom doit comporter au moins 2 caractères',
    emailRequired: 'Adresse email requise',
    emailInvalid: 'Veuillez entrer une adresse email valide',
    passwordRequired: 'Mot de passe requis',
    passwordMinLength: 'Le mot de passe doit contenir au moins 8 caractères',
    confirmRequired: 'Veuillez confirmer votre mot de passe',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    leftPanel: sharedLeftPanel.fr,
  },
};
