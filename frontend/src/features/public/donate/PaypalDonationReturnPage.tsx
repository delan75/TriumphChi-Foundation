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

type VerificationState = 'verifying' | 'completed' | 'failed' | 'cancelled' | 'reviewing';

const maxStatusChecks = 8;
const statusCheckIntervalMs = 5000;

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
  const [isManualChecking, setIsManualChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    function applyStatus(nextIntent: PublicDonationIntentResponse, source: string): boolean {
      setIntent(nextIntent);

      if (nextIntent.donation.status === 'confirmed' || nextIntent.status === 'completed') {
        setState('completed');
        setMessage(copy.completedBody);
        trackPaypalEvent('paypal_completed', { intentUuid, source });
        return true;
      }

      if (nextIntent.donation.status === 'failed' || nextIntent.status === 'failed') {
        setState('failed');
        setMessage(copy.failedBody);
        trackPaypalEvent('paypal_failed', { intentUuid, source });
        return true;
      }

      if (nextIntent.donation.status === 'pending' || nextIntent.status === 'processing') {
        setMessage(copy.reviewingBody);
      }

      return false;
    }

    function scheduleStatusCheck(attempt: number) {
      setChecks(attempt);
      const delay = attempt === 1 ? 0 : statusCheckIntervalMs;

      timer = window.setTimeout(async () => {
        if (cancelled) {
          return;
        }

        try {
          const status = await apiGetDonationIntentStatus(intentUuid, locale);

          if (cancelled) {
            return;
          }

          if (applyStatus(status, 'status_poll')) {
            return;
          }

          if (attempt >= maxStatusChecks) {
            setState('reviewing');
            setMessage(copy.notConfirmedBody);
            trackPaypalEvent('paypal_review_pending', { intentUuid, reason: 'status_timeout' });
            return;
          }

          scheduleStatusCheck(attempt + 1);
        } catch (error) {
          if (cancelled) {
            return;
          }

          setState('reviewing');
          setMessage(copy.statusCheckDelayedBody);
          trackPaypalEvent('paypal_review_pending', {
            intentUuid,
            reason: 'status_check_delayed',
            error: error instanceof Error ? error.message : undefined,
          });
        }
      }, delay);
    }

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

        if (!capture.data) {
          setState('failed');
          setMessage(copy.failedBody);
          return;
        }

        if (applyStatus(capture.data, 'capture')) {
          return;
        }

        scheduleStatusCheck(1);
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
        window.clearTimeout(timer);
      }
    };
  }, [copy, intentUuid, locale, mode, orderId]);

  async function checkAgain() {
    if (!intentUuid) {
      return;
    }

    setIsManualChecking(true);

    try {
      const status = await apiGetDonationIntentStatus(intentUuid, locale);
      setIntent(status);

      if (status.donation.status === 'confirmed' || status.status === 'completed') {
        setState('completed');
        setMessage(copy.completedBody);
        trackPaypalEvent('paypal_completed', { intentUuid, source: 'manual_check' });
        return;
      }

      if (status.donation.status === 'failed' || status.status === 'failed') {
        setState('failed');
        setMessage(copy.failedBody);
        trackPaypalEvent('paypal_failed', { intentUuid, source: 'manual_check' });
        return;
      }

      setState('reviewing');
      setMessage(copy.notConfirmedBody);
      trackPaypalEvent('paypal_review_pending', { intentUuid, source: 'manual_check' });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failedBody);
    } finally {
      setIsManualChecking(false);
    }
  }

  const isWorking = state === 'verifying';
  const Icon = state === 'completed' ? CheckCircle2 : state === 'failed' || state === 'cancelled' ? CircleAlert : Loader2;
  const isProblemState = state === 'failed' || state === 'cancelled';

  return (
    <section className="min-h-[70dvh] bg-foundation-50">
      <div className="mx-auto grid min-h-[70dvh] max-w-4xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden rounded-md border border-foundation-100 bg-white shadow-xl shadow-foundation-950/10">
          <div className={cn('px-6 py-8 text-center text-white', isProblemState ? 'bg-red-950' : 'bg-foundation-900')}>
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
                <SummaryItem label={copy.statusLabel} value={statusDisplay(intent, copy)} />
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
              {state === 'reviewing' ? (
                <button
                  type="button"
                  onClick={() => void checkAgain()}
                  disabled={isManualChecking}
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-700 px-5 text-sm font-black text-white transition hover:bg-foundation-900 disabled:cursor-wait disabled:opacity-70"
                >
                  <Loader2 className={cn('h-4 w-4', isManualChecking ? 'animate-spin' : '')} aria-hidden="true" />
                  {isManualChecking ? copy.checkingAgainLabel : copy.checkAgainLabel}
                </button>
              ) : null}

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
                {state === 'completed' ? copy.viewImpactLabel : state === 'reviewing' ? copy.continueBrowsingLabel : copy.chooseAnotherLabel}
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

  if (state === 'reviewing') {
    return copy.reviewingTitle;
  }

  return copy.verifyingTitle;
}

function statusDisplay(intent: PublicDonationIntentResponse, copy: PaypalReturnCopy) {
  if (intent.donation.status === 'pending' || intent.status === 'processing') {
    return copy.reviewingStatusLabel;
  }

  return intent.donation.status;
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
  reviewingTitle: string;
  reviewingBody: string;
  completedTitle: string;
  completedBody: string;
  failedTitle: string;
  failedBody: string;
  notConfirmedBody: string;
  statusCheckDelayedBody: string;
  cancelledTitle: string;
  cancelledBody: string;
  cancelChecking: string;
  missingIntent: string;
  referenceLabel: string;
  amountLabel: string;
  statusLabel: string;
  reviewingStatusLabel: string;
  statusChecksLabel: string;
  tryAgainLabel: string;
  chooseAnotherLabel: string;
  checkAgainLabel: string;
  checkingAgainLabel: string;
  continueBrowsingLabel: string;
  viewImpactLabel: string;
  documentsTitle: string;
}

const paypalReturnCopy = {
  en: {
    verifyingTitle: 'Verifying your donation...',
    verifyingBody: 'Please wait while we confirm your PayPal payment securely.',
    reviewingTitle: 'Thank You For Your Donation',
    reviewingBody: 'Thank you for supporting our mission. Your donation request has been received. If PayPal needs anything else, they may contact you directly.',
    completedTitle: 'Donation Received',
    completedBody: 'Thank you for supporting our mission. Your donation has been confirmed.',
    failedTitle: 'Payment Not Completed',
    failedBody: 'Your donation could not be confirmed.',
    notConfirmedBody: 'Thank you for supporting our mission. Your donation request has been received. If PayPal needs anything else, they may contact you directly.',
    statusCheckDelayedBody: 'Thank you for supporting our mission. Your donation request has been received. If PayPal needs anything else, they may contact you directly.',
    cancelledTitle: 'Payment Cancelled',
    cancelledBody: 'The PayPal payment was cancelled before the donation was completed.',
    cancelChecking: 'Please wait while we update this donation request.',
    missingIntent: 'This PayPal return link is missing the donation reference.',
    referenceLabel: 'Reference',
    amountLabel: 'Amount',
    statusLabel: 'Status',
    reviewingStatusLabel: 'Pending',
    statusChecksLabel: 'Verification checks',
    tryAgainLabel: 'Try Again',
    chooseAnotherLabel: 'Choose Another Channel',
    checkAgainLabel: 'Check Again',
    checkingAgainLabel: 'Checking...',
    continueBrowsingLabel: 'Continue Browsing',
    viewImpactLabel: 'View Impact',
    documentsTitle: 'Receipt and invoice',
  },
  fr: {
    verifyingTitle: 'Verification de votre don...',
    verifyingBody: 'Veuillez patienter pendant que nous confirmons votre paiement PayPal de maniere securisee.',
    reviewingTitle: 'Merci pour votre don',
    reviewingBody: 'Merci de soutenir notre mission. Votre demande de don a ete recue. Si PayPal a besoin d informations supplementaires, il peut vous contacter directement.',
    completedTitle: 'Don recu',
    completedBody: 'Merci de soutenir notre mission. Votre don a ete confirme.',
    failedTitle: 'Paiement non termine',
    failedBody: 'Votre don n a pas pu etre confirme.',
    notConfirmedBody: 'Merci de soutenir notre mission. Votre demande de don a ete recue. Si PayPal a besoin d informations supplementaires, il peut vous contacter directement.',
    statusCheckDelayedBody: 'Merci de soutenir notre mission. Votre demande de don a ete recue. Si PayPal a besoin d informations supplementaires, il peut vous contacter directement.',
    cancelledTitle: 'Paiement annule',
    cancelledBody: 'Le paiement PayPal a ete annule avant la fin du don.',
    cancelChecking: 'Veuillez patienter pendant que nous mettons a jour cette demande de don.',
    missingIntent: 'Ce lien de retour PayPal ne contient pas la reference du don.',
    referenceLabel: 'Reference',
    amountLabel: 'Montant',
    statusLabel: 'Statut',
    reviewingStatusLabel: 'En cours',
    statusChecksLabel: 'Verifications',
    tryAgainLabel: 'Reessayer',
    chooseAnotherLabel: 'Choisir un autre canal',
    checkAgainLabel: 'Verifier encore',
    checkingAgainLabel: 'Verification...',
    continueBrowsingLabel: 'Continuer',
    viewImpactLabel: 'Voir l impact',
    documentsTitle: 'Reçu et facture',
  },
} satisfies Record<Locale, PaypalReturnCopy>;
