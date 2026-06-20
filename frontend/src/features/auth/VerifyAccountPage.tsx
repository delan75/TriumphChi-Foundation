import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, MessageCircle, Smartphone } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { InputField } from '../../components/ui/InputField';
import { cn } from '../../components/ui/cn';
import { Locale } from '../../lib/i18n';
import {
  VerificationContext,
  apiResendVerificationOtp,
  apiUpdateVerificationContact,
  apiVerifyEmailOtp,
} from '../../lib/api';
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
  const storedContext = readVerificationContext();
  const [email, setEmail] = useState(storedContext?.email ?? searchParams.get('email') ?? '');
  const [maskedEmail, setMaskedEmail] = useState(storedContext?.masked_email ?? maskEmail(email));
  const [maskedPhone, setMaskedPhone] = useState<string | null>(storedContext?.masked_phone ?? null);
  const [code, setCode] = useState('');
  const [channel, setChannel] = useState<OtpChannel>('email');
  const [message, setMessage] = useState<string | null>(copy.initialMessage);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
    password: '',
  });
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);

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

      window.sessionStorage.removeItem('triumphchi.verification');
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
      applyVerificationContext(response.data?.verification);
      setMessage(response.message);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : copy.sendFailed);
    } finally {
      setIsSending(false);
    }
  };

  const updateContact = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !contactForm.password) {
      setError(copy.contactPasswordRequired);
      return;
    }

    setIsUpdatingContact(true);

    try {
      const response = await apiUpdateVerificationContact({
        current_email: email,
        password: contactForm.password,
        email: contactForm.email || undefined,
        phone: contactForm.phone || undefined,
        channel,
      });

      applyVerificationContext(response.data?.verification);
      setMessage(response.message);
      setContactForm({ email: '', phone: '', password: '' });
      setIsEditingContact(false);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : copy.contactUpdateFailed);
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const applyVerificationContext = (context?: VerificationContext) => {
    if (!context) {
      return;
    }

    setEmail(context.email);
    setMaskedEmail(context.masked_email);
    setMaskedPhone(context.masked_phone ?? null);
    window.sessionStorage.setItem('triumphchi.verification', JSON.stringify(context));
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

              <div className="mb-6 rounded-lg border border-foundation-100 bg-foundation-50 p-4">
                <p className="text-sm font-semibold text-ink-900">{copy.sentTo}</p>
                <p className="mt-1 text-sm text-ink-600">{maskedEmail || copy.emailUnknown}</p>
                {maskedPhone && <p className="mt-1 text-sm text-ink-500">{maskedPhone}</p>}
                <button
                  type="button"
                  onClick={() => setIsEditingContact((current) => !current)}
                  className="mt-3 text-sm font-semibold text-foundation-700 hover:text-foundation-900"
                >
                  {isEditingContact ? copy.cancelContactEdit : copy.changeContact}
                </button>
              </div>

              {isEditingContact && (
                <form onSubmit={updateContact} className="mb-6 space-y-4 rounded-lg border border-ink-100 p-4" noValidate>
                  <p className="text-sm leading-6 text-ink-600">{copy.contactHelp}</p>
                  <InputField
                    label={copy.newEmailLabel}
                    name="new-email"
                    type="email"
                    autoComplete="email"
                    value={contactForm.email}
                    onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                  />
                  <InputField
                    label={copy.newPhoneLabel}
                    name="new-phone"
                    type="tel"
                    autoComplete="tel"
                    value={contactForm.phone}
                    onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                  <InputField
                    label={copy.passwordLabel}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={contactForm.password}
                    onChange={(event) => setContactForm((current) => ({ ...current, password: event.target.value }))}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingContact}
                    className="focus-ring w-full rounded-md border border-foundation-200 px-4 py-2.5 text-sm font-semibold text-foundation-800 hover:bg-foundation-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingContact ? copy.updatingContact : copy.updateContact}
                  </button>
                </form>
              )}

              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold text-ink-900">{copy.chooseChannel}</p>
                <div className="grid grid-cols-3 gap-2">
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
                    'focus-ring flex w-full justify-center rounded-md bg-foundation-50 px-4 py-2.5 text-sm font-semibold text-foundation-900 shadow-sm transition hover:bg-foundation-900 hover:text-white',
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
  className="font-semibold text-foundation-700 transition-all duration-200 ease-out hover:underline hover:underline-offset-4 hover:-translate-y-0.5 hover:text-foundation-900 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
>
  {isSending ? copy.sending : copy.resend}
</button>

                <Link
  to={`/${locale}/login`}
  className="inline-block text-ink-500 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:text-ink-700 hover:underline hover:underline-offset-4 active:translate-y-0"
>
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

function readVerificationContext(): VerificationContext | null {
  try {
    const raw = window.sessionStorage.getItem('triumphchi.verification');
    return raw ? JSON.parse(raw) as VerificationContext : null;
  } catch {
    return null;
  }
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  return name && domain ? `${name.slice(0, 2)}***@${domain}` : email;
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
    description: 'Thank you for joining a community committed to helping children continue learning with dignity.',
    highlights: ['Confirm your contact', 'Enter the code', 'Continue securely', 'Support the mission'],
  },
  fr: {
    title: 'Fondation TriumphChi',
    tagline: 'Donner par alliance, pas avec les restes.',
    description: 'Merci de rejoindre une communaute engagee a aider les enfants a continuer leur education avec dignite.',
    highlights: ['Confirmer le contact', 'Entrer le code', 'Continuer en securite', 'Soutenir la mission'],
  },
};

const verifyCopy = {
  en: {
    eyebrow: 'Confirm Your Account',
    title: 'Check Your Verification Code',
    subtitle: 'Enter the code we sent, or use the verification link in your email.',
    initialMessage: 'If the code has not arrived, you can send a new one below.',
    sentTo: 'Code sent to',
    emailUnknown: 'Enter your email address below.',
    chooseChannel: 'Send code by',
    emailLabel: 'Email Address',
    codeLabel: 'Verification Code',
    verify: 'Confirm Account',
    verifying: 'Confirming...',
    resend: 'Send a new code',
    sending: 'Sending...',
    backToLogin: 'Back to sign in',
    required: 'Please enter your email address and verification code.',
    emailRequired: 'Please enter your email address before requesting a new code.',
    failed: 'We could not confirm your account. Please try again.',
    sendFailed: 'We could not send a verification code. Please try again.',
    changeContact: 'Wrong email or phone?',
    cancelContactEdit: 'Keep these details',
    contactHelp: 'If you mistyped your email or phone number, correct it here. For your safety, please enter your password before we make the change.',
    newEmailLabel: 'Correct Email Address',
    newPhoneLabel: 'Correct Phone Number',
    passwordLabel: 'Password',
    updateContact: 'Update and send code',
    updatingContact: 'Updating...',
    contactPasswordRequired: 'Please enter your password before updating your verification details.',
    contactUpdateFailed: 'We could not update your verification details. Please check the information and try again.',
    channels: {
      email: 'Email',
      sms: 'SMS',
      whatsapp: 'WhatsApp',
    },
    leftPanel: sharedLeftPanel.en,
  },
  fr: {
    eyebrow: 'Confirmer votre compte',
    title: 'Consultez votre code de verification',
    subtitle: 'Entrez le code envoye, ou utilisez le lien de verification dans votre email.',
    initialMessage: 'Si le code n est pas arrive, vous pouvez en demander un nouveau ci-dessous.',
    sentTo: 'Code envoye a',
    emailUnknown: 'Entrez votre adresse email ci-dessous.',
    chooseChannel: 'Envoyer le code par',
    emailLabel: 'Adresse email',
    codeLabel: 'Code de verification',
    verify: 'Confirmer le compte',
    verifying: 'Confirmation...',
    resend: 'Envoyer un nouveau code',
    sending: 'Envoi...',
    backToLogin: 'Retour a la connexion',
    required: 'Veuillez entrer votre adresse email et le code de verification.',
    emailRequired: 'Veuillez entrer votre adresse email avant de demander un nouveau code.',
    failed: 'Nous n avons pas pu confirmer votre compte. Veuillez reessayer.',
    sendFailed: 'Nous n avons pas pu envoyer de code. Veuillez reessayer.',
    changeContact: 'Email ou telephone incorrect ?',
    cancelContactEdit: 'Garder ces informations',
    contactHelp: 'Si vous avez mal saisi votre email ou numero de telephone, corrigez-le ici. Pour votre securite, entrez votre mot de passe avant la modification.',
    newEmailLabel: 'Adresse email correcte',
    newPhoneLabel: 'Numero de telephone correct',
    passwordLabel: 'Mot de passe',
    updateContact: 'Mettre a jour et envoyer le code',
    updatingContact: 'Mise a jour...',
    contactPasswordRequired: 'Veuillez entrer votre mot de passe avant de modifier vos informations de verification.',
    contactUpdateFailed: 'Nous n avons pas pu modifier vos informations. Veuillez verifier et reessayer.',
    channels: {
      email: 'Email',
      sms: 'SMS',
      whatsapp: 'WhatsApp',
    },
    leftPanel: sharedLeftPanel.fr,
  },
};
