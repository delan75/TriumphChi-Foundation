import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, MessageCircle, Smartphone } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { InputField } from '../../components/ui/InputField';
import { cn } from '../../components/ui/cn';
import { Locale } from '../../lib/i18n';
import { apiResendVerificationOtp, apiVerifyEmailOtp } from '../../lib/api';
import { resolvePostAuthPath, storeAuthSession } from '../../lib/auth';
import classroomImage from '../../assets/landing/classroom-support.png';
import communityImage from '../../assets/landing/education_aid_project.jpg';

type OtpChannel = 'email' | 'sms' | 'whatsapp';

interface VerifyAccountPageProps {
  locale: Locale;
  redirectTo?: string | null;
}

export function VerifyAccountPage({ locale, redirectTo }: VerifyAccountPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const copy = verifyCopy[locale];
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [channel, setChannel] = useState<OtpChannel>('email');
  const [message, setMessage] = useState<string | null>(copy.initialMessage);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !code) {
      setError(copy.required);
      return;
    }

    setIsVerifying(true);

    try {
      const response = await apiVerifyEmailOtp(email, code, 'web-client');

      if (!storeAuthSession(response)) {
        throw new Error(copy.failed);
      }

      navigate(resolvePostAuthPath(locale, redirectTo), { replace: true });
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : copy.failed);
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    setError(null);
    setMessage(null);

    if (!email) {
      setError(copy.emailRequired);
      return;
    }

    setIsSending(true);

    try {
      const response = await apiResendVerificationOtp(email, channel);
      setMessage(response.message);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : copy.sendFailed);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Seo
        meta={{
          title: `${copy.title} - TriumphChi Foundation`,
          description: copy.subtitle,
          path: { en: '/verify-account', fr: '/verify-account' },
          locale,
          image: classroomImage,
        }}
      />

      <AuthLayout
        locale={locale}
        leftPanelContent={copy.leftPanel}
        backgroundImages={{ primary: classroomImage, secondary: communityImage }}
      >
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 lg:py-0">
          <div className="w-full max-w-md">
            <div className="rounded-xl border border-ink-100 bg-white p-8 shadow-lg">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foundation-700">{copy.eyebrow}</p>
                <h1 className="mt-3 text-2xl font-bold text-ink-900">{copy.title}</h1>
                <p className="mt-2 text-sm leading-6 text-ink-500">{copy.subtitle}</p>
              </div>

              <div className="mb-6 grid grid-cols-3 gap-2">
                {channelOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setChannel(option.value)}
                    className={cn(
                      'focus-ring flex min-h-20 flex-col items-center justify-center rounded-lg border px-2 py-3 text-xs font-semibold transition',
                      channel === option.value
                        ? 'border-foundation-600 bg-foundation-50 text-foundation-900'
                        : 'border-ink-100 bg-white text-ink-500 hover:border-foundation-200 hover:bg-foundation-50',
                    )}
                  >
                    <option.icon className="mb-2 h-5 w-5" aria-hidden="true" />
                    {copy.channels[option.value]}
                  </button>
                ))}
              </div>

              <form onSubmit={verify} className="space-y-5" noValidate>
                <InputField
                  label={copy.emailLabel}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />

                <InputField
                  label={copy.codeLabel}
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                />

                {(message || error) && (
                  <div
                    className={cn(
                      'rounded-md border p-3',
                      error ? 'border-support-red/20 bg-support-red/5' : 'border-foundation-200 bg-foundation-50',
                    )}
                  >
                    <p className={cn('text-sm', error ? 'text-support-red' : 'text-foundation-900')}>
                      {error ?? message}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className={cn(
                    'focus-ring flex w-full justify-center rounded-md bg-foundation-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-foundation-900',
                    isVerifying && 'cursor-not-allowed opacity-60',
                  )}
                >
                  {isVerifying ? copy.verifying : copy.verify}
                </button>
              </form>

              <div className="mt-5 flex flex-col gap-3 text-center text-sm sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={resend}
                  disabled={isSending}
                  className="font-semibold text-foundation-700 hover:text-foundation-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? copy.sending : copy.resend}
                </button>

                <Link to={`/${locale}/login`} className="text-ink-500 hover:text-ink-700">
                  {copy.backToLogin}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}

const channelOptions: Array<{ value: OtpChannel; icon: typeof Mail }> = [
  { value: 'email', icon: Mail },
  { value: 'sms', icon: Smartphone },
  { value: 'whatsapp', icon: MessageCircle },
];

const sharedLeftPanel = {
  en: {
    title: 'TriumphChi Foundation',
    tagline: 'Giving from a covenant, not from leftovers.',
    description: 'A short verification step helps protect accounts connected to children, donors, families, and staff workflows.',
    highlights: ['Account protection', 'Email verification', 'OTP support', 'Secure access'],
  },
  fr: {
    title: 'Fondation TriumphChi',
    tagline: 'Donner par alliance, pas avec les restes.',
    description: 'Une courte verification aide a proteger les comptes lies aux enfants, donateurs, familles et equipes.',
    highlights: ['Protection du compte', 'Verification email', 'Code OTP', 'Acces securise'],
  },
};

const verifyCopy = {
  en: {
    eyebrow: 'Account Verification',
    title: 'Enter Your Verification Code',
    subtitle: 'We sent a code to help confirm that this account belongs to you. Email is the default channel.',
    initialMessage: 'Check your email for the latest verification code.',
    emailLabel: 'Email Address',
    codeLabel: 'Verification Code',
    verify: 'Verify Account',
    verifying: 'Verifying...',
    resend: 'Send a new code',
    sending: 'Sending...',
    backToLogin: 'Back to sign in',
    required: 'Please enter your email address and verification code.',
    emailRequired: 'Please enter your email address before requesting a new code.',
    failed: 'We could not verify your account. Please try again.',
    sendFailed: 'We could not send a verification code. Please try again.',
    channels: {
      email: 'Email',
      sms: 'SMS',
      whatsapp: 'WhatsApp',
    },
    leftPanel: sharedLeftPanel.en,
  },
  fr: {
    eyebrow: 'Verification du compte',
    title: 'Entrez votre code de verification',
    subtitle: 'Nous avons envoye un code pour confirmer que ce compte vous appartient. Le canal par defaut est email.',
    initialMessage: 'Consultez votre email pour le dernier code de verification.',
    emailLabel: 'Adresse email',
    codeLabel: 'Code de verification',
    verify: 'Verifier le compte',
    verifying: 'Verification...',
    resend: 'Envoyer un nouveau code',
    sending: 'Envoi...',
    backToLogin: 'Retour a la connexion',
    required: 'Veuillez entrer votre adresse email et le code de verification.',
    emailRequired: 'Veuillez entrer votre adresse email avant de demander un nouveau code.',
    failed: 'Nous n avons pas pu verifier votre compte. Veuillez reessayer.',
    sendFailed: 'Nous n avons pas pu envoyer de code. Veuillez reessayer.',
    channels: {
      email: 'Email',
      sms: 'SMS',
      whatsapp: 'WhatsApp',
    },
    leftPanel: sharedLeftPanel.fr,
  },
};
