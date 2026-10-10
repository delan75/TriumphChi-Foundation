import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { apiResetPassword } from '../../lib/api';
import { cn } from '../../components/ui/cn';
import { Locale } from '../../lib/i18n';
import { Seo } from '../../components/seo/Seo';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordField } from '../../components/ui/PasswordField';
import { buildAuthPath } from '../../lib/auth';
import classroomImage from '../../assets/landing/classroom-support.png';
import kidsImage from '../../assets/landing/kids_studying_tree.webp';

interface ResetPasswordPageProps {
  locale: Locale;
  redirectTo?: string | null;
}

export function ResetPasswordPage({ locale, redirectTo }: ResetPasswordPageProps) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const copy = resetPasswordCopy[locale];
  const redirectTarget = redirectTo ?? searchParams.get('redirectTo');

  useEffect(() => {
    if (!token || !email) {
      setErrors({ submit: copy.invalidToken });
    }
  }, [copy.invalidToken, email, token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token || !email) {
      return;
    }

    const validationErrors = validateResetPassword(formData, copy);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiResetPassword(token, email, formData.password, formData.confirmPassword);
      setSuccessMessage(response.message);
      setIsSuccess(true);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : copy.failed });
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
          path: { en: '/reset-password', fr: '/reset-password' },
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
                    <CheckCircle2 className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-bold text-ink-900">{copy.successTitle}</h2>
                  <p className="mt-2 text-sm text-ink-500">{successMessage}</p>
                  <button
                    type="button"
                    onClick={() => navigate(buildAuthPath(locale, 'login', redirectTarget), { replace: true })}
                    className="focus-ring mt-8 flex w-full justify-center rounded-md bg-foundation-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-foundation-900"
                  >
                    {copy.successAction}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-ink-900">{copy.title}</h2>
                    <p className="mt-2 text-sm text-ink-500">{copy.subtitle}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                      disabled={isLoading || !token || !email}
                      className={cn(
                        'focus-ring flex w-full justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition duration-200',
                        isLoading || !token || !email ? 'cursor-not-allowed bg-foundation-400' : 'bg-foundation-600 hover:bg-foundation-900',
                      )}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {copy.resetting}
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

function validateResetPassword(
  formData: { password: string; confirmPassword: string },
  copy: typeof resetPasswordCopy.en,
) {
  const errors: Record<string, string> = {};

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

const resetPasswordCopy = {
  en: {
    title: 'Create new password',
    subtitle: 'Please enter your new password below.',
    passwordLabel: 'New Password',
    confirmPasswordLabel: 'Confirm New Password',
    submit: 'Reset Password',
    resetting: 'Resetting...',
    backToLogin: 'Back to sign in',
    successTitle: 'Password reset complete',
    successMessage: 'Your password has been successfully reset. You can now log in with your new password.',
    successAction: 'Go to login',
    passwordHelp: 'Must be at least 8 characters.',
    invalidToken: 'Invalid or missing password reset token.',
    failed: 'Failed to reset password. The link may have expired.',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 8 characters',
    confirmRequired: 'Please confirm your password',
    passwordMismatch: 'Passwords do not match',
    leftPanel: leftPanel.en,
  },
  fr: {
    title: 'Créer un nouveau mot de passe',
    subtitle: 'Veuillez entrer votre nouveau mot de passe ci-dessous.',
    passwordLabel: 'Nouveau mot de passe',
    confirmPasswordLabel: 'Confirmer le mot de passe',
    submit: 'Réinitialiser le mot de passe',
    resetting: 'Réinitialisation...',
    backToLogin: 'Retour à la connexion',
    successTitle: 'Mot de passe réinitialisé',
    successMessage: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    successAction: 'Aller à la connexion',
    passwordHelp: 'Doit contenir au moins 8 caractères.',
    invalidToken: 'Jeton de réinitialisation invalide ou manquant.',
    failed: 'La réinitialisation a échoué. Le lien a peut-être expiré.',
    passwordRequired: 'Mot de passe requis',
    passwordMinLength: 'Le mot de passe doit contenir au moins 8 caractères',
    confirmRequired: 'Veuillez confirmer votre mot de passe',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    leftPanel: leftPanel.fr,
  },
};
