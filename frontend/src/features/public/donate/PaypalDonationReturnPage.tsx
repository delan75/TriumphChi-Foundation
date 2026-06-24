import { ArrowRight, CheckCircle2, CircleAlert, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../components/ui/cn';
import {
  apiCancelPaypalDonationIntent,
  apiCapturePaypalDonationIntent,
  apiGetDonationIntentStatus,
  type PublicDonationIntentResponse,
} from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import { getPageByKey } from '../../../content/publicPages';

interface PaypalDonationReturnPageProps {
  locale: Locale;
  mode: 'return' | 'cancel';
}

type VerificationState = 'verifying' | 'completed' | 'failed' | 'cancelled';

const maxStatusChecks = 8;

export function PaypalDonationReturnPage({ locale, mode }: PaypalDonationReturnPageProps) {
  const copy = paypalReturnCopy[locale];
  const location = useLocation();
  const donatePage = getPageByKey('donate');
  const impactPage = getPageByKey('impact');
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const intentUuid = params.get('intent') ?? '';
  const orderId = params.get('token') ?? '';
  const [state, setState] = useState<VerificationState>('verifying');
  const [message, setMessage] = useState(mode === 'cancel' ? copy.cancelChecking : copy.verifyingBody);
  const [intent, setIntent] = useState<PublicDonationIntentResponse | null>(null);
  const [checks, setChecks] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function verify() {
      if (!intentUuid) {
        setState('failed');
        setMessage(copy.missingIntent);
        return;
      }

      try {
        if (mode === 'cancel') {
          const response = await apiCancelPaypalDonationIntent(intentUuid, locale);

          if (cancelled) {
            return;
          }

          setIntent(response.data ?? null);
          setState('cancelled');
          setMessage(copy.cancelledBody);
          trackPaypalEvent('paypal_cancelled', { intentUuid });
          return;
        }

        trackPaypalEvent('paypal_returned', { intentUuid, hasOrderId: orderId !== '' });
        const capture = await apiCapturePaypalDonationIntent(intentUuid, orderId, locale);

        if (cancelled) {
          return;
        }

        setIntent(capture.data ?? null);
        trackPaypalEvent('paypal_verified', { intentUuid, status: capture.data?.status });

        if (capture.data?.donation.status === 'confirmed' || capture.data?.status === 'completed') {
          setState('completed');
          setMessage(copy.completedBody);
          trackPaypalEvent('paypal_completed', { intentUuid });
          return;
        }

        let attempts = 1;
        setChecks(attempts);
        timer = window.setInterval(async () => {
          attempts += 1;
          setChecks(attempts);

          try {
            const status = await apiGetDonationIntentStatus(intentUuid, locale);

            if (cancelled) {
              return;
            }

            setIntent(status);

            if (status.donation.status === 'confirmed' || status.status === 'completed') {
              setState('completed');
              setMessage(copy.completedBody);
              trackPaypalEvent('paypal_completed', { intentUuid });
              window.clearInterval(timer);
              return;
            }

            if (status.donation.status === 'failed' || status.status === 'failed') {
              setState('failed');
              setMessage(copy.failedBody);
              trackPaypalEvent('paypal_failed', { intentUuid });
              window.clearInterval(timer);
              return;
            }

            if (attempts >= maxStatusChecks) {
              setState('failed');
              setMessage(copy.notConfirmedBody);
              trackPaypalEvent('paypal_failed', { intentUuid, reason: 'status_timeout' });
              window.clearInterval(timer);
            }
          } catch (error) {
            setState('failed');
            setMessage(error instanceof Error ? error.message : copy.failedBody);
            trackPaypalEvent('paypal_failed', { intentUuid, reason: 'status_error' });
            window.clearInterval(timer);
          }
        }, 3000);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState('failed');
        setMessage(error instanceof Error ? error.message : copy.failedBody);
        trackPaypalEvent('paypal_failed', { intentUuid, reason: 'capture_error' });
      }
    }

    void verify();

    return () => {
      cancelled = true;
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [copy, intentUuid, locale, mode, orderId]);

  const isWorking = state === 'verifying';
  const Icon = state === 'completed' ? CheckCircle2 : state === 'failed' || state === 'cancelled' ? CircleAlert : Loader2;

  return (
    <section className="min-h-[70dvh] bg-foundation-50">
      <div className="mx-auto grid min-h-[70dvh] max-w-4xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden rounded-md border border-foundation-100 bg-white shadow-xl shadow-foundation-950/10">
          <div className={cn('px-6 py-8 text-center text-white', state === 'failed' || state === 'cancelled' ? 'bg-red-950' : 'bg-foundation-900')}>
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-white/10">
              <Icon className={cn('h-10 w-10', isWorking ? 'animate-spin text-white' : 'text-foundation-100')} aria-hidden="true" />
            </div>
            <p className="mt-5 text-sm font-black uppercase tracking-wide text-foundation-100">PayPal</p>
            <h1 className="mt-2 text-3xl font-black leading-tight">{titleForState(state, copy)}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-foundation-50" aria-live="polite">
              {message}
            </p>
          </div>

          <div className="grid gap-5 px-6 py-6">
            {intent ? (
              <div className="grid gap-3 rounded-md border border-foundation-100 bg-foundation-50 p-4 sm:grid-cols-3">
                <SummaryItem label={copy.referenceLabel} value={intent.donation.reference_number} />
                <SummaryItem label={copy.amountLabel} value={`${intent.amount} ${intent.currency}`} />
                <SummaryItem label={copy.statusLabel} value={intent.donation.status} />
              </div>
            ) : null}

            {state === 'completed' && intent?.donation.documents?.length ? (
              <div className="rounded-md border border-foundation-100 bg-white p-4">
                <p className="text-xs font-black uppercase text-foundation-700">{copy.documentsTitle}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {intent.donation.documents.map((document) => (
                    <a
                      key={document.uuid}
                      href={document.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring rounded-md border border-ink-100 bg-foundation-50 px-4 py-3 text-sm font-black text-foundation-900 transition hover:border-foundation-200 hover:bg-foundation-100"
                    >
                      <span className="block">{document.title}</span>
                      <span className="mt-1 block text-xs font-bold text-ink-500">{document.document_number}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {isWorking ? (
              <div className="rounded-md border border-ink-100 bg-white p-4">
                <div className="flex items-center justify-between gap-4 text-xs font-black uppercase text-foundation-700">
                  <span>{copy.statusChecksLabel}</span>
                  <span>{Math.min(checks, maxStatusChecks)}/{maxStatusChecks}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-foundation-100">
                  <div className="h-full rounded-full bg-foundation-600 transition-all duration-500" style={{ width: `${Math.max((checks / maxStatusChecks) * 100, 10)}%` }} />
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {state === 'failed' || state === 'cancelled' ? (
                <Link
                  to={`/${locale}${donatePage.path[locale]}`}
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-700 px-5 text-sm font-black text-white transition hover:bg-foundation-900"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  {copy.tryAgainLabel}
                </Link>
              ) : null}

              <Link
                to={`/${locale}${state === 'completed' ? impactPage.path[locale] : donatePage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-foundation-200 bg-white px-5 text-sm font-black text-foundation-900 transition hover:bg-foundation-50"
              >
                {state === 'completed' ? copy.viewImpactLabel : copy.chooseAnotherLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-foundation-700">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-ink-900">{value}</p>
    </div>
  );
}

function titleForState(state: VerificationState, copy: PaypalReturnCopy) {
  if (state === 'completed') {
    return copy.completedTitle;
  }

  if (state === 'cancelled') {
    return copy.cancelledTitle;
  }

  if (state === 'failed') {
    return copy.failedTitle;
  }

  return copy.verifyingTitle;
}

function trackPaypalEvent(name: string, details: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent('triumphchi:analytics', {
    detail: {
      event: name,
      details,
      occurredAt: new Date().toISOString(),
    },
  }));
}

interface PaypalReturnCopy {
  verifyingTitle: string;
  verifyingBody: string;
  completedTitle: string;
  completedBody: string;
  failedTitle: string;
  failedBody: string;
  notConfirmedBody: string;
  cancelledTitle: string;
  cancelledBody: string;
  cancelChecking: string;
  missingIntent: string;
  referenceLabel: string;
  amountLabel: string;
  statusLabel: string;
  statusChecksLabel: string;
  tryAgainLabel: string;
  chooseAnotherLabel: string;
  viewImpactLabel: string;
  documentsTitle: string;
}

const paypalReturnCopy = {
  en: {
    verifyingTitle: 'Verifying your donation...',
    verifyingBody: 'Please wait while we confirm your PayPal payment securely.',
    completedTitle: 'Donation Received',
    completedBody: 'Thank you for supporting our mission. Your donation has been confirmed.',
    failedTitle: 'Payment Not Completed',
    failedBody: 'Your donation could not be confirmed.',
    notConfirmedBody: 'We could not confirm the donation yet. Please try again or choose another giving channel.',
    cancelledTitle: 'Payment Cancelled',
    cancelledBody: 'The PayPal payment was cancelled before the donation was completed.',
    cancelChecking: 'Please wait while we update this donation request.',
    missingIntent: 'This PayPal return link is missing the donation reference.',
    referenceLabel: 'Reference',
    amountLabel: 'Amount',
    statusLabel: 'Status',
    statusChecksLabel: 'Verification checks',
    tryAgainLabel: 'Try Again',
    chooseAnotherLabel: 'Choose Another Channel',
    viewImpactLabel: 'View Impact',
    documentsTitle: 'Receipt and invoice',
  },
  fr: {
    verifyingTitle: 'Verification de votre don...',
    verifyingBody: 'Veuillez patienter pendant que nous confirmons votre paiement PayPal de maniere securisee.',
    completedTitle: 'Don recu',
    completedBody: 'Merci de soutenir notre mission. Votre don a ete confirme.',
    failedTitle: 'Paiement non termine',
    failedBody: 'Votre don n a pas pu etre confirme.',
    notConfirmedBody: 'Nous ne pouvons pas encore confirmer le don. Veuillez reessayer ou choisir un autre canal.',
    cancelledTitle: 'Paiement annule',
    cancelledBody: 'Le paiement PayPal a ete annule avant la fin du don.',
    cancelChecking: 'Veuillez patienter pendant que nous mettons a jour cette demande de don.',
    missingIntent: 'Ce lien de retour PayPal ne contient pas la reference du don.',
    referenceLabel: 'Reference',
    amountLabel: 'Montant',
    statusLabel: 'Statut',
    statusChecksLabel: 'Verifications',
    tryAgainLabel: 'Reessayer',
    chooseAnotherLabel: 'Choisir un autre canal',
    viewImpactLabel: 'Voir l impact',
    documentsTitle: 'Reçu et facture',
  },
} satisfies Record<Locale, PaypalReturnCopy>;
