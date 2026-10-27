import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Loader2,
  MapPin,
  School,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { ImpactSummaryGrid, type ImpactSummaryItem } from '../../../components/public/ImpactSummaryGrid';
import { FaqSection, type FaqItem } from '../../../components/public/FaqSection';
import { GivingChannels } from '../../../components/public/GivingChannels';
import { MomoPaymentWaitingOverlay, type MomoPaymentOverlayStatus, type MomoPaymentWaitingOverlayCopy } from '../../../components/public/MomoPaymentWaitingOverlay';
import { PublicArticlePreviewGrid } from '../../../components/public/PublicArticlePreviewGrid';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import {
  apiCreateDonationIntent,
  apiGetDonationConfig,
  apiPublicGet,
  apiSubmitContactMessage,
  ApiRequestError,
  type PublicDonationConfig,
  type PublicDonationIntentResponse,
  type PublicDonationProvider,
  type DonationDocumentRecord,
  apiGetDonationIntentStatus,
} from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import heroImage from '../../../assets/landing/cameroon-children-educationjpg.jpg';
import whyImage from '../../../assets/landing/classroom-support.png';
import storyImage from '../../../assets/landing/kids_studying_tree.webp';
import updateImage from '../../../assets/landing/education_aid_project.jpg';
import communityImage from '../../../assets/landing/rural-home-cameroon.jpg';

interface DonatePageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

interface PublicImpactSummary {
  data: {
    children_supported: number | null;
    partner_schools: number | null;
    regions_reached: number | null;
    school_continuation_rate: number | null;
  };
}

interface DonationFormState {
  frequency: string;
  currency: string;
  amount: string;
  purpose: string;
  paymentProvider: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  anonymous: boolean;
  paymentConsent: boolean;
  clientReference: string;
}

interface SimilarDonationWarning {
  reference_number?: string;
  amount?: string | number;
  currency?: string;
  provider?: string;
  created_at?: string;
}

type MomoModalState = 'hidden' | 'starting' | 'checking' | 'success' | 'failed' | 'pending';

interface PaypalRedirectState {
  checkoutUrl: string;
  amount: string;
  currency: string;
}

interface MomoStatusHistoryItem {
  attempt: number;
  status: string;
  donationStatus?: string;
  message?: string;
  checkedAt: string;
}

const donationStorageKey = 'triumphchi_public_donation_form_v1';
const momoPollingMaxAttempts = 24;
const impactIcons = [UsersRound, School, BookOpen, MapPin];
const supportIcons = [School, BookOpen, GraduationCap, Sparkles, HeartHandshake, ShieldCheck];
const stewardshipIcons = [HandHeart, CheckCircle2, UsersRound, ShieldCheck];

export function DonatePage({ locale, page }: DonatePageProps) {
  const copy = donateCopy[locale];
  const homePage = getPageByKey('home');
  const impactPage = getPageByKey('impact');
  const contactPage = getPageByKey('contact');

  const donationConfig = useQuery({
    queryKey: ['public-donation-config', locale],
    queryFn: () => apiGetDonationConfig(locale),
    staleTime: 1000 * 60 * 10,
  });

  const impactSummary = useQuery({
    queryKey: ['public-impact-summary', locale],
    queryFn: () => apiPublicGet<PublicImpactSummary>('/public/impact-summary', locale),
    staleTime: 1000 * 60 * 10,
  });

  const impactStats = buildImpactStats(copy, locale, impactSummary.data?.data);

  return (
    <>
      <Seo
        meta={{
          title: page.seoTitle?.[locale] ?? page.title[locale],
          description: page.seoDescription?.[locale] ?? page.description[locale],
          path: page.path,
          locale,
          image: heroImage,
        }}
        structuredData={buildPublicPageSchema(page, locale)}
      />

      <PublicPageTitle
        locale={locale}
        title={copy.heroTitle}
        description={copy.heroDescription}
        backgroundImage={heroImage}
        backgroundAlt={copy.heroAlt}
        breadcrumbs={[
          { label: homePage.label[locale], to: `/${locale}${homePage.path[locale]}` },
          { label: page.label[locale] },
        ]}
        actions={
          <>
            <a
              href="#give"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-foundation-900 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-50"
            >
              {copy.heroPrimaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              to={`/${locale}${impactPage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/18"
            >
              {copy.heroSecondaryCta}
            </Link>
          </>
        }
      />

      <section id="give" className="bg-white scroll-mt-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:px-8 lg:py-16">
          <div className="order-2 lg:order-1">
            <OverlayImage src={whyImage} alt={copy.whyImageAlt} className="min-h-[260px] lg:min-h-[420px]" />
            <div className="mt-8">
              <SectionIntro eyebrow={copy.whyEyebrow} title={copy.whyTitle} body={copy.whyBody} />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {copy.whyPoints.map((point) => (
                  <div key={point} className="flex min-h-12 items-start gap-3 rounded-md border border-ink-100 bg-ink-50 px-4 py-3 text-sm leading-6 text-ink-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DonationCard
            copy={copy}
            config={donationConfig.data}
            isConfigLoading={donationConfig.isLoading}
            locale={locale}
            className="order-1 lg:sticky lg:top-24 lg:order-2"
          />
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.supportEyebrow} title={copy.supportTitle} body={copy.supportBody} />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {copy.supportCards.map((card, index) => {
              const Icon = supportIcons[index] ?? HeartHandshake;

              return (
                <article key={card.title} className="rounded-md border border-white bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black text-ink-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{card.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ImpactSummaryGrid
        eyebrow={copy.impactEyebrow}
        title={copy.impactTitle}
        body={copy.impactBody}
        items={impactStats.items}
        icons={impactIcons}
        usesFallback={impactStats.usesFallback}
        fallbackNote={copy.impactFallbackNote}
        isLoading={impactSummary.isLoading}
      />

      <FaqSection
        eyebrow={copy.faqEyebrow}
        title={copy.faqTitle}
        body={copy.faqBody}
        items={copy.faqItems}
        surface="tinted"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.stewardshipEyebrow} title={copy.stewardshipTitle} body={copy.stewardshipBody} />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {copy.stewardshipCards.map((card, index) => {
              const Icon = stewardshipIcons[index] ?? ShieldCheck;

              return (
                <article key={card.title} className="rounded-md border border-ink-100 bg-white p-5 shadow-xs">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black text-ink-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{card.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <PublicArticlePreviewGrid
        eyebrow={copy.storiesEyebrow}
        title={copy.storiesTitle}
        body={copy.storiesBody}
        items={copy.storyCards.map((story, index) => ({
          ...story,
          image: [storyImage, updateImage, communityImage][index] ?? storyImage,
        }))}
        variant="tinted"
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-16">
          <OverlayImage src={communityImage} alt={copy.communityImageAlt} className="min-h-[280px] lg:min-h-[480px]" />
          <div>
            <SectionIntro eyebrow={copy.communityEyebrow} title={copy.communityTitle} body={copy.communityBody} />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/${locale}${contactPage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white transition hover:bg-foundation-900"
              >
                {copy.partnerCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={`/${locale}${contactPage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-foundation-200 bg-white px-5 text-sm font-black text-foundation-900 transition hover:bg-foundation-100"
              >
                {copy.contactCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase text-foundation-100">{copy.finalEyebrow}</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl">{copy.finalTitle}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-100">{copy.finalBody}</p>
          </div>
          <div className="grid gap-5">
            <a
              href="#give"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-ink-900 transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-50"
            >
              {copy.finalPrimaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <GivingChannels locale={locale} variant="dark" />
          </div>
        </div>
      </section>
    </>
  );
}

function DonationCard({
  copy,
  config,
  isConfigLoading,
  locale,
  className,
}: {
  copy: DonateCopy;
  config?: PublicDonationConfig;
  isConfigLoading: boolean;
  locale: Locale;
  className?: string;
}) {
  const [state, setState] = useState<DonationFormState>(() => ({
    frequency: 'one_time',
    currency: 'USD',
    amount: '25',
    purpose: 'greatest_need',
    paymentProvider: 'cards',
    name: '',
    email: '',
    phone: '',
    country: '',
    anonymous: false,
    paymentConsent: false,
    clientReference: createDonationClientReference(),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [statusKind, setStatusKind] = useState<'success' | 'error' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [momoModalState, setMomoModalState] = useState<MomoModalState>('hidden');
  const [momoModalMessage, setMomoModalMessage] = useState('');
  const [momoPollingAttempt, setMomoPollingAttempt] = useState(0);
  const [momoPollingCycle, setMomoPollingCycle] = useState(0);
  const [momoStatusHistory, setMomoStatusHistory] = useState<MomoStatusHistoryItem[]>([]);
  const [momoSupportMessage, setMomoSupportMessage] = useState('');
  const [momoSupportStatusMessage, setMomoSupportStatusMessage] = useState('');
  const [isSendingMomoSupportNote, setIsSendingMomoSupportNote] = useState(false);
  const [paypalRedirect, setPaypalRedirect] = useState<PaypalRedirectState | null>(null);
  const [donationDocuments, setDonationDocuments] = useState<DonationDocumentRecord[]>([]);
  const [similarDonation, setSimilarDonation] = useState<SimilarDonationWarning | null>(null);
  const [createdIntentUuid, setCreatedIntentUuid] = useState<string | null>(null);
  const [createdIntentStatus, setCreatedIntentStatus] = useState<string | null>(null);

  const currencyConfig = config?.currencies[state.currency];
  const suggestedAmounts = currencyConfig?.suggested_amounts ?? [];
  const supportedProviders = useMemo(
    () => filterProviders(config?.payment_providers ?? [], state.currency, state.country),
    [config?.payment_providers, state.country, state.currency],
  );
  const selectedProvider = supportedProviders.find((provider) => provider.key === state.paymentProvider) ?? supportedProviders[0];
  const selectedPurpose = config?.purposes.find((purpose) => purpose.key === state.purpose);
  const amountNumber = Number(state.amount);
  const minimumAmount = currencyConfig?.minimum_amount ?? 1;

  useEffect(() => {
    if (!config) {
      return;
    }

    const saved = readSavedDonationState();
    const currency = saved?.currency && config.currencies[saved.currency] ? saved.currency : config.default_currency;
    const country = saved?.country || config.detected_country?.country || detectBrowserCountry() || '';
    const providers = filterProviders(config.payment_providers, currency, country);
    const provider = saved?.paymentProvider && providers.some((item) => item.key === saved.paymentProvider)
      ? saved.paymentProvider
      : providers[0]?.key ?? 'cards';
    const purpose = saved?.purpose && config.purposes.some((item) => item.key === saved.purpose) ? saved.purpose : config.default_purpose;
    const frequency = saved?.frequency && config.frequencies.some((item) => item.key === saved.frequency)
      ? saved.frequency
      : config.default_frequency;
    const defaultAmount = String(config.currencies[currency]?.suggested_amounts?.[1] ?? config.currencies[currency]?.minimum_amount ?? 25);

    setState((current) => ({
      ...current,
      ...saved,
      currency,
      country,
      paymentProvider: provider,
      purpose,
      frequency,
      amount: saved?.amount ?? defaultAmount,
      clientReference: saved?.clientReference ?? createDonationClientReference(),
    }));
  }, [config]);

  useEffect(() => {
    if (!config) {
      return;
    }

    try {
      window.localStorage.setItem(donationStorageKey, JSON.stringify(state));
    } catch {
      // Saving donation selections is a convenience only.
    }
  }, [config, state]);

  useEffect(() => {
    if (!config || !supportedProviders.length) {
      return;
    }

    if (!supportedProviders.some((provider) => provider.key === state.paymentProvider)) {
      setState((current) => ({ ...current, paymentProvider: supportedProviders[0].key }));
    }
  }, [config, state.paymentProvider, supportedProviders]);

  useEffect(() => {
    if (!createdIntentUuid || createdIntentStatus !== 'pending') {
      return;
    }

    let attempts = 0;
    const interval = window.setInterval(async () => {
      attempts += 1;
      setMomoPollingAttempt(attempts);
      setMomoModalState('checking');
      trackDonationEvent('momo_waiting', {
        attempt: attempts,
        intentUuid: createdIntentUuid,
      });

      try {
        const intent = await apiGetDonationIntentStatus(createdIntentUuid, locale);
        setCreatedIntentStatus(intent.status);
        setDonationDocuments(intent.donation.documents ?? []);
        setMomoStatusHistory((current) => [
          ...current,
          {
            attempt: attempts,
            status: intent.status,
            donationStatus: intent.donation.status,
            checkedAt: new Date().toISOString(),
          },
        ]);

        if (intent.donation.status === 'confirmed' || intent.status === 'successful') {
          setMomoModalState('success');
          setMomoModalMessage(copy.momoSuccessMessage);
          trackDonationEvent('momo_confirmed', {
            attempt: attempts,
            intentUuid: createdIntentUuid,
          });
          refreshClientReference();
          setStatusKind('success');
          setStatusMessage('');
          window.clearInterval(interval);
          return;
        }

        if (intent.donation.status === 'failed' || intent.status === 'failed') {
          setMomoModalState('failed');
          setMomoModalMessage(extractDonationFailureMessage(intent, copy));
          trackDonationEvent('momo_failed', {
            attempt: attempts,
            intentUuid: createdIntentUuid,
          });
          refreshClientReference();
          setStatusKind('error');
          setStatusMessage('');
          window.clearInterval(interval);
          return;
        }

        if (attempts >= momoPollingMaxAttempts) {
          setMomoModalState('pending');
          setMomoModalMessage(copy.momoStillPendingMessage);
          trackDonationEvent('momo_timeout', {
            attempts,
            intentUuid: createdIntentUuid,
          });
          setStatusKind('success');
          setStatusMessage('');
          window.clearInterval(interval);
          return;
        }
      } catch (error) {
        setMomoStatusHistory((current) => [
          ...current,
          {
            attempt: attempts,
            status: 'check_failed',
            message: error instanceof Error ? error.message : 'Status check failed.',
            checkedAt: new Date().toISOString(),
          },
        ]);

        if (attempts >= momoPollingMaxAttempts) {
          setMomoModalState('pending');
          setMomoModalMessage(copy.momoStillPendingMessage);
          trackDonationEvent('momo_timeout', {
            attempts,
            intentUuid: createdIntentUuid,
          });
          setStatusKind('success');
          setStatusMessage('');
          window.clearInterval(interval);
          return;
        }
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [copy, createdIntentStatus, createdIntentUuid, locale, momoPollingCycle]);

  function updateField<K extends keyof DonationFormState>(field: K, value: DonationFormState[K]) {
    setState((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setStatusMessage('');
    setStatusKind('');
    setMomoModalState('hidden');
    setMomoModalMessage('');
    setMomoPollingAttempt(0);
    setMomoSupportStatusMessage('');
    setSimilarDonation(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitDonation(false);
  }

  async function submitDonation(acknowledgeSimilarDonation: boolean) {
    const nextErrors = validateDonation(state, minimumAmount, copy, selectedProvider);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !selectedProvider) {
      setStatusKind('error');
      setStatusMessage(copy.fixErrorsMessage);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');
    setStatusKind('');
    setMomoPollingAttempt(0);
    setMomoModalMessage('');
    setMomoStatusHistory([]);
    setMomoSupportMessage('');
    setMomoSupportStatusMessage('');
    setPaypalRedirect(null);
    setDonationDocuments([]);

    if (selectedProvider.key === 'momo') {
      setMomoModalState('starting');
      trackDonationEvent('momo_overlay_opened', {
        amount: state.amount,
        currency: state.currency,
        provider: selectedProvider.key,
      });
    }

    if (selectedProvider.key === 'paypal') {
      trackDonationEvent('paypal_checkout_started', {
        amount: state.amount,
        currency: state.currency,
        provider: selectedProvider.key,
      });
    }

    try {
      const response = await apiCreateDonationIntent(
        {
          frequency: state.frequency,
          currency: state.currency,
          amount: amountNumber,
          purpose: state.purpose,
          payment_provider: selectedProvider.key,
          donor: {
            name: state.name.trim(),
            email: state.email.trim(),
            phone: state.phone.trim() || undefined,
            country: state.country.trim().toUpperCase(),
          },
          anonymous: state.anonymous,
          payment_consent: selectedProvider.key === 'momo' ? state.paymentConsent : true,
          client_reference: state.clientReference,
          similar_donation_acknowledged: acknowledgeSimilarDonation,
        },
        locale,
      );

      setStatusKind('success');
      setSimilarDonation(null);
      setCreatedIntentUuid(response.data?.uuid ?? null);
      setCreatedIntentStatus(response.data?.status ?? null);
      setDonationDocuments(response.data?.donation.documents ?? []);
      if (selectedProvider.key === 'momo') {
        setMomoModalState(momoStateFromIntentStatus(response.data?.status));
        setMomoModalMessage(response.message || copy.momoPendingMessage);
        setMomoStatusHistory((current) => [
          ...current,
          {
            attempt: 0,
            status: response.data?.status ?? 'created',
            donationStatus: response.data?.donation.status,
            message: response.message,
            checkedAt: new Date().toISOString(),
          },
        ]);
      }
      setStatusMessage(selectedProvider.key === 'momo' ? '' : response.data?.checkout_url ? copy.redirectingMessage : response.message || copy.intentCreatedMessage);

      if (selectedProvider.key !== 'momo') {
        refreshClientReference();
      }

      if (response.data?.checkout_url) {
        const checkoutUrl = response.data.checkout_url;

        if (selectedProvider.key === 'paypal') {
          setPaypalRedirect({
            checkoutUrl,
            amount: formatDonationAmountOnly(amountNumber || 0, locale),
            currency: state.currency,
          });
          trackDonationEvent('paypal_redirected', {
            intentUuid: response.data.uuid,
            amount: state.amount,
            currency: state.currency,
          });
          window.setTimeout(() => {
            window.location.assign(checkoutUrl);
          }, 700);
          return;
        }

        window.location.assign(checkoutUrl);
      }
    } catch (error) {
      setMomoPollingAttempt(0);
      setPaypalRedirect(null);
      setStatusKind('error');
      if (error instanceof ApiRequestError && error.status === 409 && error.code === 'similar_donation_pending') {
        setMomoModalState('hidden');
        setSimilarDonation(extractSimilarDonationWarning(error.data));
        setStatusMessage(error.message);
        return;
      }

      if (selectedProvider.key === 'momo') {
        setMomoModalState('failed');
        setMomoModalMessage(error instanceof ApiRequestError ? error.message : copy.submitErrorMessage);
        setMomoStatusHistory((current) => [
          ...current,
          {
            attempt: 0,
            status: 'start_failed',
            message: error instanceof Error ? error.message : copy.submitErrorMessage,
            checkedAt: new Date().toISOString(),
          },
        ]);
        trackDonationEvent('momo_failed', {
          reason: error instanceof Error ? error.message : copy.submitErrorMessage,
          stage: 'start',
        });
        setStatusMessage('');
        return;
      }

      setStatusMessage(error instanceof ApiRequestError ? error.message : copy.submitErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function refreshClientReference() {
    setState((current) => ({ ...current, clientReference: createDonationClientReference() }));
  }

  function closeMomoModal() {
    if (momoModalState === 'hidden') {
      return;
    }

    trackDonationEvent('momo_closed', {
      state: momoModalState,
      attempt: momoPollingAttempt,
      intentUuid: createdIntentUuid,
    });
    setMomoModalState('hidden');
    setMomoModalMessage('');
    setMomoPollingAttempt(0);
    setMomoSupportStatusMessage('');
  }

  function retryMomoDonation() {
    closeMomoModal();
    setCreatedIntentUuid(null);
    setCreatedIntentStatus(null);
    setMomoStatusHistory([]);
    refreshClientReference();
  }

  function chooseAnotherPaymentMethod() {
    const fallbackProvider = supportedProviders.find((provider) => provider.key !== 'momo');

    if (fallbackProvider) {
      setState((current) => ({
        ...current,
        paymentProvider: fallbackProvider.key,
        paymentConsent: false,
        clientReference: createDonationClientReference(),
      }));
    }

    closeMomoModal();
    setCreatedIntentUuid(null);
    setCreatedIntentStatus(null);
  }

  function checkMomoStatusAgain() {
    if (!createdIntentUuid) {
      return;
    }

    setMomoPollingAttempt(0);
    setMomoModalState('checking');
    setMomoModalMessage(copy.momoCheckingBody);
    setCreatedIntentStatus('pending');
    setMomoPollingCycle((current) => current + 1);
    trackDonationEvent('momo_waiting', {
      action: 'manual_check_again',
      intentUuid: createdIntentUuid,
    });
  }

  async function sendMomoSupportNote() {
    if (momoSupportMessage.trim().length < 10) {
      setMomoSupportStatusMessage(copy.momoSupportMessageRequired);
      return;
    }

    setIsSendingMomoSupportNote(true);
    setMomoSupportStatusMessage('');

    try {
      const response = await apiSubmitContactMessage(
        {
          name: state.name.trim(),
          email: state.email.trim(),
          phone: state.phone.trim() || undefined,
          reason: 'general',
          subject: copy.momoSupportSubject,
          message: buildMomoSupportMessage({
            userMessage: momoSupportMessage,
            formState: state,
            provider: selectedProvider,
            selectedPurposeLabel: copy.purposeLabels[state.purpose] ?? selectedPurpose?.label ?? state.purpose,
            intentUuid: createdIntentUuid,
            intentStatus: createdIntentStatus,
            modalState: momoModalState,
            modalMessage: momoModalMessage,
            attempts: momoPollingAttempt,
            maxAttempts: momoPollingMaxAttempts,
            history: momoStatusHistory,
            locale,
          }),
          consent: true,
        },
        locale,
      );

      setMomoSupportStatusMessage(response.message || copy.momoOverlay.supportSentFallback);
      setMomoSupportMessage('');
    } catch (error) {
      setMomoSupportStatusMessage(error instanceof Error ? error.message : copy.submitErrorMessage);
    } finally {
      setIsSendingMomoSupportNote(false);
    }
  }

  if (isConfigLoading || !config) {
    return <DonationCardSkeleton className={className} copy={copy} />;
  }

  return (
    <>
      <MomoPaymentWaitingOverlay
        isOpen={momoModalState !== 'hidden'}
        status={momoOverlayStatusFromModalState(momoModalState)}
        phoneNumber={maskPhoneForDisplay(state.phone)}
        amount={formatDonationAmountOnly(amountNumber || 0, locale)}
        currency={state.currency}
        message={momoModalMessage}
        attempts={momoPollingAttempt}
        maxAttempts={momoPollingMaxAttempts}
        supportMessage={momoSupportMessage}
        supportStatusMessage={momoSupportStatusMessage}
        isSendingSupportNote={isSendingMomoSupportNote}
        receiptHref={donationDocuments.find((document) => document.type === 'receipt')?.download_url}
        canClose={momoModalState === 'success' || momoModalState === 'failed' || momoModalState === 'pending'}
        copy={copy.momoOverlay}
        onRetry={retryMomoDonation}
        onChooseAnother={chooseAnotherPaymentMethod}
        onClose={closeMomoModal}
        onCheckAgain={checkMomoStatusAgain}
        onSupportMessageChange={(value) => {
          setMomoSupportMessage(value);
          setMomoSupportStatusMessage('');
        }}
        onSendSupportNote={() => void sendMomoSupportNote()}
      />
      <PaypalRedirectOverlay
        isOpen={Boolean(paypalRedirect)}
        title={copy.paypalRedirectTitle}
        body={copy.paypalRedirectBody}
        secureNote={copy.paypalRedirectSecureNote}
        amount={paypalRedirect?.amount ?? ''}
        currency={paypalRedirect?.currency ?? state.currency}
        amountLabel={copy.summaryAmount}
        providerLabel={copy.summaryProvider}
      />
      <form
        onSubmit={handleSubmit}
        className={cn('rounded-md border border-foundation-100 bg-white p-4 shadow-xl shadow-foundation-950/10 sm:p-6', className)}
      >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-foundation-600">{copy.formEyebrow}</p>
          <h2 className="mt-2 text-2xl font-black text-ink-900">{copy.formTitle}</h2>
        </div>
        <ShieldCheck className="h-6 w-6 shrink-0 text-foundation-600" aria-hidden="true" />
      </div>

      <div className="mt-6 grid gap-5">
        <fieldset>
          <legend className="text-sm font-black text-ink-900">{copy.frequencyLabel}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-md bg-ink-50 p-1">
            {config.frequencies.map((frequency) => (
              <button
                key={frequency.key}
                type="button"
                onClick={() => updateField('frequency', frequency.key)}
                className={cn(
                  'focus-ring min-h-11 rounded-md px-3 text-sm font-black transition',
                  state.frequency === frequency.key ? 'bg-foundation-600 text-white shadow-xs' : 'text-ink-600 hover:bg-white',
                )}
              >
                {copy.frequencyLabels[frequency.key] ?? frequency.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs font-bold text-foundation-700">{copy.monthlyEncouragement}</p>
        </fieldset>

        <div>
          <label htmlFor="donation-currency" className="text-sm font-black text-ink-900">
            {copy.currencyLabel}
          </label>
          <select
            id="donation-currency"
            value={state.currency}
            onChange={(event) => updateField('currency', event.target.value)}
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-bold text-ink-900"
          >
            {Object.keys(config.currencies).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-black text-ink-900">{copy.amountLabel}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {suggestedAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => updateField('amount', String(amount))}
                className={cn(
                  'focus-ring min-h-12 rounded-md border px-3 text-sm font-black transition',
                  amountNumber === amount
                    ? 'border-foundation-600 bg-foundation-600 text-white'
                    : 'border-ink-200 bg-white text-ink-700 hover:border-foundation-200 hover:bg-foundation-50',
                )}
              >
                {formatMoney(amount, state.currency, locale)}
              </button>
            ))}
          </div>
          <label htmlFor="custom-amount" className="mt-3 block text-sm font-black text-ink-900">
            {copy.customAmountLabel}
          </label>
          <div className="mt-2 flex min-h-12 overflow-hidden rounded-md border border-ink-200 bg-white focus-within:ring-2 focus-within:ring-foundation-500 focus-within:ring-offset-2">
            <span className="inline-flex items-center border-r border-ink-100 bg-ink-50 px-3 text-sm font-black text-ink-500">
              {currencyConfig?.symbol ?? state.currency}
            </span>
            <input
              id="custom-amount"
              type="number"
              min={minimumAmount}
              step={state.currency === 'XAF' ? '1' : '0.01'}
              value={state.amount}
              onChange={(event) => updateField('amount', event.target.value)}
              className="min-h-12 flex-1 border-0 px-3 text-base font-bold text-ink-900 outline-hidden"
            />
          </div>
          {errors.amount ? <p className="mt-2 text-sm font-bold text-red-700">{errors.amount}</p> : null}
        </fieldset>

        <div>
          <label htmlFor="donation-purpose" className="text-sm font-black text-ink-900">
            {copy.purposeLabel}
          </label>
          <select
            id="donation-purpose"
            value={state.purpose}
            onChange={(event) => updateField('purpose', event.target.value)}
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-ink-200 bg-white px-3 text-sm font-bold text-ink-900"
          >
            {config.purposes.map((purpose) => (
              <option key={purpose.key} value={purpose.key}>
                {copy.purposeLabels[purpose.key] ?? purpose.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs font-bold leading-5 text-ink-500">{copy.purposeHelper}</p>
        </div>

        <fieldset>
          <legend className="text-sm font-black text-ink-900">{copy.providerLabel}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {supportedProviders.map((provider) => (
              <button
                key={provider.key}
                type="button"
                onClick={() => updateField('paymentProvider', provider.key)}
                className={cn(
                  'focus-ring flex min-h-12 items-center justify-center rounded-md border px-3 text-sm font-black transition',
                  state.paymentProvider === provider.key
                    ? 'border-foundation-600 bg-foundation-600 text-white'
                    : 'border-ink-200 bg-white text-ink-700 hover:border-foundation-200 hover:bg-foundation-50',
                )}
              >
                {providerLogo(provider)}
              </button>
            ))}
          </div>
          {errors.paymentProvider ? <p className="mt-2 text-sm font-bold text-red-700">{errors.paymentProvider}</p> : null}
          <p className="mt-2 text-xs font-bold leading-5 text-ink-500">{providerGuidance(copy, state, config.payment_providers)}</p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="donor-name" label={copy.nameLabel} value={state.name} error={errors.name} onChange={(value) => updateField('name', value)} />
          <TextField id="donor-email" label={copy.emailLabel} value={state.email} error={errors.email} type="email" onChange={(value) => updateField('email', value)} />
          <TextField
            id="donor-phone"
            label={copy.phoneLabel}
            value={state.phone}
            error={errors.phone}
            type="tel"
            onChange={(value) => updateField('phone', value)}
          />
          <TextField
            id="donor-country"
            label={copy.countryLabel}
            value={state.country}
            error={errors.country}
            maxLength={2}
            onChange={(value) => updateField('country', value.toUpperCase())}
          />
        </div>

        {selectedProvider?.key === 'momo' ? (
          <label className="flex items-start gap-3 rounded-md border border-foundation-100 bg-foundation-50 p-3">
            <input
              type="checkbox"
              checked={state.paymentConsent}
              onChange={(event) => updateField('paymentConsent', event.target.checked)}
              className="mt-1 h-4 w-4 rounded-sm border-ink-300 text-foundation-600 focus:ring-foundation-500"
            />
            <span>
              <span className="block text-sm font-black text-ink-900">{copy.momoConsentLabel}</span>
              <span className="mt-1 block text-xs leading-5 text-ink-500">{copy.momoConsentHelper}</span>
              {errors.paymentConsent ? <span className="mt-2 block text-sm font-bold text-red-700">{errors.paymentConsent}</span> : null}
            </span>
          </label>
        ) : null}

        <label className="flex items-start gap-3 rounded-md border border-ink-100 bg-ink-50 p-3">
          <input
            type="checkbox"
            checked={state.anonymous}
            onChange={(event) => updateField('anonymous', event.target.checked)}
            className="mt-1 h-4 w-4 rounded-sm border-ink-300 text-foundation-600 focus:ring-foundation-500"
          />
          <span>
            <span className="block text-sm font-black text-ink-900">{copy.anonymousLabel}</span>
            <span className="mt-1 block text-xs leading-5 text-ink-500">{copy.anonymousHelper}</span>
          </span>
        </label>

        <div className="rounded-md border border-foundation-100 bg-foundation-50 p-4">
          <h3 className="text-sm font-black text-ink-900">{copy.summaryTitle}</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            <SummaryRow label={copy.summaryFrequency} value={copy.frequencyLabels[state.frequency] ?? state.frequency} />
            <SummaryRow label={copy.summaryAmount} value={formatMoney(amountNumber || 0, state.currency, locale)} />
            <SummaryRow label={copy.summaryPurpose} value={copy.purposeLabels[state.purpose] ?? selectedPurpose?.label ?? state.purpose} />
            <SummaryRow label={copy.summaryProvider} value={providerLogo(selectedProvider)} />
          </dl>
          <p className="mt-3 text-sm leading-6 text-ink-600">{copy.impactMessage}</p>
        </div>

        {similarDonation ? (
          <SimilarDonationWarningCard
            copy={copy}
            donation={similarDonation}
            onCancel={() => {
              setSimilarDonation(null);
              setStatusMessage('');
              setStatusKind('');
            }}
            onProceed={() => void submitDonation(true)}
          />
        ) : null}

        <div className="grid gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white shadow-xs transition hover:bg-foundation-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <HandHeart className="h-4 w-4" aria-hidden="true" />}
            {isSubmitting ? copy.submittingLabel : copy.submitLabel}
          </button>
          {statusMessage ? (
            <p
              className={cn(
                'rounded-md px-3 py-2 text-sm font-bold leading-6',
                statusKind === 'success' ? 'bg-foundation-50 text-foundation-800' : 'bg-red-50 text-red-700',
              )}
              role="status"
            >
              {statusMessage}
            </p>
          ) : null}
        </div>
      </div>
      </form>
    </>
  );
}

function PaypalRedirectOverlay({
  isOpen,
  title,
  body,
  secureNote,
  amount,
  currency,
  amountLabel,
  providerLabel,
}: {
  isOpen: boolean;
  title: string;
  body: string;
  secureNote: string;
  amount: string;
  currency: string;
  amountLabel: string;
  providerLabel: string;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-120 grid min-h-dvh place-items-center bg-ink-950/80 px-4 py-8 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="paypal-redirect-title"
      aria-describedby="paypal-redirect-body"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-md border border-white/10 bg-white shadow-2xl shadow-ink-950/30">
        <div className="bg-foundation-900 px-6 py-8 text-center text-white">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-white/10">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-wide text-foundation-100">PayPal</p>
          <h2 id="paypal-redirect-title" className="mt-2 text-2xl font-black leading-tight">
            {title}
          </h2>
          <p id="paypal-redirect-body" className="mx-auto mt-3 max-w-md text-sm leading-6 text-foundation-50" aria-live="polite">
            {body}
          </p>
        </div>
        <div className="grid gap-4 p-5">
          <div className="grid gap-3 rounded-md border border-foundation-100 bg-foundation-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase text-foundation-700">{amountLabel}</p>
              <p className="mt-1 text-lg font-black text-ink-900">{amount} {currency}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-foundation-700">{providerLabel}</p>
              <p className="mt-1 text-lg font-black text-ink-900">PayPal</p>
            </div>
          </div>
          <p className="rounded-md border border-ink-100 bg-white px-4 py-3 text-sm font-bold leading-6 text-ink-600">
            {secureNote}
          </p>
        </div>
      </div>
    </div>
  );
}

function DonationCardSkeleton({ className, copy }: { className?: string; copy: DonateCopy }) {
  return (
    <div className={cn('rounded-md border border-foundation-100 bg-white p-6 shadow-xl shadow-foundation-950/10', className)}>
      <p className="text-sm font-black uppercase text-foundation-600">{copy.formEyebrow}</p>
      <div className="mt-3 h-8 w-48 animate-pulse rounded-md bg-foundation-100" />
      <div className="mt-6 grid gap-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-md bg-ink-100" />
        ))}
      </div>
    </div>
  );
}

function SimilarDonationWarningCard({
  copy,
  donation,
  onCancel,
  onProceed,
}: {
  copy: DonateCopy;
  donation: SimilarDonationWarning;
  onCancel: () => void;
  onProceed: () => void;
}) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-black text-amber-950">{copy.similarDonationTitle}</h3>
      <p className="mt-2 text-sm leading-6 text-amber-900">{copy.similarDonationBody}</p>
      <dl className="mt-3 grid gap-2 text-sm">
        {donation.reference_number ? <SummaryRow label={copy.similarDonationReference} value={donation.reference_number} /> : null}
        {donation.amount && donation.currency ? <SummaryRow label={copy.summaryAmount} value={`${donation.amount} ${donation.currency}`} /> : null}
      </dl>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onCancel}
          className="focus-ring min-h-11 rounded-md border border-amber-300 bg-white px-4 text-sm font-black text-amber-950 transition hover:bg-amber-100"
        >
          {copy.similarDonationCancel}
        </button>
        <button
          type="button"
          onClick={onProceed}
          className="focus-ring min-h-11 rounded-md bg-amber-700 px-4 text-sm font-black text-white transition hover:bg-amber-900"
        >
          {copy.similarDonationProceed}
        </button>
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  error,
  type = 'text',
  maxLength,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  maxLength?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-black text-ink-900">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'focus-ring mt-2 min-h-12 w-full rounded-md border bg-white px-3 text-base text-ink-900',
          error ? 'border-red-400 bg-red-50/40' : 'border-ink-200',
        )}
      />
      {error ? <p id={`${id}-error`} className="mt-2 text-sm font-bold text-red-700">{error}</p> : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-bold text-ink-500">{label}</dt>
      <dd className="text-right font-black text-ink-900">{value}</dd>
    </div>
  );
}

function OverlayImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-md bg-foundation-900', className)}>
      <img src={src} alt={alt} className="h-full w-full object-cover opacity-80 saturate-[0.72]" loading="lazy" />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(18,55,47,0.88),rgba(18,55,47,0.5)_46%,rgba(18,55,47,0.88))] mix-blend-multiply"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(0deg,rgba(18,55,47,0.46),transparent_48%)]"
        aria-hidden="true"
      />
    </div>
  );
}

function SectionIntro({ eyebrow, title, body, dark = false }: { eyebrow: string; title: string; body: string; dark?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={cn('text-sm font-black uppercase', dark ? 'text-foundation-100' : 'text-foundation-600')}>{eyebrow}</p>
      <h2 className={cn('mt-2 text-3xl font-black leading-tight sm:text-4xl', dark ? 'text-white' : 'text-ink-900')}>{title}</h2>
      <p className={cn('mt-3 text-base leading-7', dark ? 'text-ink-100' : 'text-ink-500')}>{body}</p>
    </div>
  );
}

function filterProviders(providers: PublicDonationProvider[], currency: string, country: string) {
  const countryCode = country.trim().toUpperCase();

  return providers.filter((provider) => {
    if (!provider.currencies.includes(currency)) {
      return false;
    }

    if (provider.key === 'momo') {
      const countryCodes = (provider.country_codes?.length ? provider.country_codes : ['CM']).map((code) => code.toUpperCase());
      const expectedCurrency = provider.country_currency_map?.[countryCode];
      return countryCode !== ''
        && (countryCodes.includes('*') || countryCodes.includes(countryCode))
        && (!expectedCurrency || expectedCurrency === currency);
    }

    return true;
  });
}

function providerGuidance(copy: DonateCopy, state: DonationFormState, providers: PublicDonationProvider[]): string {
  const countryCode = state.country.trim().toUpperCase();
  const momoProvider = providers.find((provider) => provider.key === 'momo');
  const momoCountries = (momoProvider?.country_codes?.length ? momoProvider.country_codes : ['CM']).map((code) => code.toUpperCase());
  const momoCurrencies = momoProvider?.currencies ?? ['XAF'];
  const expectedMomoCurrency = momoProvider?.country_currency_map?.[countryCode];

  if (!countryCode) {
    return copy.providerCountryHint;
  }

  if (!(momoCountries.includes('*') || momoCountries.includes(countryCode))) {
    return copy.momoUnavailableCountryMessage;
  }

  if ((expectedMomoCurrency && expectedMomoCurrency !== state.currency) || !momoCurrencies.includes(state.currency)) {
    return copy.momoCountryCurrencyHint;
  }

  return copy.momoAvailableHint;
}

function providerLogo(provider?: PublicDonationProvider): string {
  if (!provider) {
    return '';
  }

  if (provider.key === 'bank_transfer') {
    return 'Bank';
  }

  if (provider.key === 'cards') {
    return 'Cards';
  }

  return provider.name;
}

function readSavedDonationState(): Partial<DonationFormState> | null {
  try {
    const raw = window.localStorage.getItem(donationStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function createDonationClientReference(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `donation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function detectBrowserCountry(): string | null {
  if (typeof Intl === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneCountryMap: Record<string, string> = {
    'Africa/Douala': 'CM',
    'Africa/Accra': 'GH',
    'Africa/Kampala': 'UG',
    'Africa/Kigali': 'RW',
    'Africa/Johannesburg': 'ZA',
    'Africa/Lagos': 'NG',
  };

  if (timeZoneCountryMap[timeZone]) {
    return timeZoneCountryMap[timeZone];
  }

  const localeCountry = navigator.language?.match(/-([A-Z]{2})$/)?.[1];
  return localeCountry ?? null;
}

function extractSimilarDonationWarning(data: unknown): SimilarDonationWarning | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const similar = (data as { similar_donation?: SimilarDonationWarning }).similar_donation;
  return similar && typeof similar === 'object' ? similar : {};
}

function momoStateFromIntentStatus(status?: string | null): MomoModalState {
  if (status === 'successful' || status === 'confirmed') {
    return 'success';
  }

  if (status === 'failed') {
    return 'failed';
  }

  return 'checking';
}

function momoOverlayStatusFromModalState(state: MomoModalState): MomoPaymentOverlayStatus {
  if (state === 'success') {
    return 'confirmed';
  }

  if (state === 'failed') {
    return 'failed';
  }

  if (state === 'pending') {
    return 'timeout';
  }

  if (state === 'checking') {
    return 'waiting';
  }

  return 'request_sent';
}

function extractDonationFailureMessage(intent: PublicDonationIntentResponse, copy: DonateCopy): string {
  const payload = intent as PublicDonationIntentResponse & {
    failure_reason?: string | null;
    provider_message?: string | null;
    message?: string | null;
  };

  return payload.failure_reason || payload.provider_message || payload.message || copy.momoFailedMessage;
}

function maskPhoneForDisplay(phone: string): string {
  const trimmed = phone.trim();

  if (!trimmed) {
    return '-';
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.length < 7) {
    return trimmed;
  }

  const prefix = trimmed.startsWith('+') ? `+${digits.slice(0, Math.min(3, digits.length - 4))}` : digits.slice(0, 3);
  const suffix = digits.slice(-4);
  return `${prefix} *** ${suffix}`;
}

function buildMomoSupportMessage({
  userMessage,
  formState,
  provider,
  selectedPurposeLabel,
  intentUuid,
  intentStatus,
  modalState,
  modalMessage,
  attempts,
  maxAttempts,
  history,
  locale,
}: {
  userMessage: string;
  formState: DonationFormState;
  provider?: PublicDonationProvider;
  selectedPurposeLabel: string;
  intentUuid: string | null;
  intentStatus: string | null;
  modalState: MomoModalState;
  modalMessage: string;
  attempts: number;
  maxAttempts: number;
  history: MomoStatusHistoryItem[];
  locale: Locale;
}): string {
  const browserContext = typeof navigator === 'undefined'
    ? {}
    : {
      user_agent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

  const context = {
    channel: 'momo',
    provider: provider?.key ?? formState.paymentProvider,
    provider_name: provider?.name,
    intent_uuid: intentUuid,
    intent_status: intentStatus,
    modal_state: modalState,
    latest_message: modalMessage,
    amount: formState.amount,
    currency: formState.currency,
    purpose: selectedPurposeLabel,
    country: formState.country,
    phone_masked: maskPhoneForDisplay(formState.phone),
    client_reference: formState.clientReference,
    checks_completed: attempts,
    checks_allowed: maxAttempts,
    locale,
    status_history: history,
    browser_context: browserContext,
  };

  return [
    userMessage.trim(),
    '',
    '--- Donation support context ---',
    JSON.stringify(context, null, 2),
  ].join('\n');
}

function trackDonationEvent(name: string, details: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('triumphchi:analytics', {
    detail: {
      event: name,
      details,
      occurredAt: new Date().toISOString(),
    },
  }));
}

function validateDonation(
  state: DonationFormState,
  minimumAmount: number,
  copy: DonateCopy,
  selectedProvider?: PublicDonationProvider,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const amount = Number(state.amount);

  if (!Number.isFinite(amount) || amount < minimumAmount) {
    errors.amount = copy.minimumAmountError.replace(':amount', String(minimumAmount));
  }

  if (!state.paymentProvider) {
    errors.paymentProvider = copy.providerError;
  }

  if (state.name.trim().length < 2) {
    errors.name = copy.nameError;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
    errors.email = copy.emailError;
  }

  if (!/^[A-Za-z]{2}$/.test(state.country.trim())) {
    errors.country = copy.countryError;
  }

  if (state.paymentProvider === 'momo') {
    const normalizedPhone = state.phone.replace(/[\s-]+/g, '');
    const countryCode = state.country.trim().toUpperCase();
    const countryCodes = (selectedProvider?.country_codes?.length ? selectedProvider.country_codes : ['CM']).map((code) => code.toUpperCase());
    const providerAllowsCountry = countryCodes.includes('*') || countryCodes.includes(countryCode);
    const expectedCurrency = selectedProvider?.country_currency_map?.[countryCode];

    if (!providerAllowsCountry) {
      errors.paymentProvider = copy.momoUnavailableCountryError;
    }

    if ((expectedCurrency && expectedCurrency !== state.currency) || !selectedProvider?.currencies.includes(state.currency)) {
      errors.amount = copy.momoCurrencyError;
    }

    if (!normalizedPhone) {
      errors.phone = copy.momoPhoneRequiredError;
    } else if (!/^\+?[1-9][0-9]{7,14}$/.test(normalizedPhone)) {
      errors.phone = copy.momoPhoneInvalidError;
    }

    if (!state.paymentConsent) {
      errors.paymentConsent = copy.momoConsentError;
    }
  }

  return errors;
}

function formatMoney(value: number, currency: string, locale: Locale): string {
  if (!Number.isFinite(value)) {
    return currency;
  }

  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'XAF' ? 0 : 2,
  }).format(value);
}

function formatDonationAmountOnly(value: number, locale: Locale): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    maximumFractionDigits: 2,
  }).format(value);
}

function buildImpactStats(
  copy: DonateCopy,
  locale: Locale,
  summary?: PublicImpactSummary['data'],
): { items: ImpactSummaryItem[]; usesFallback: boolean } {
  const childrenSupported = formatWholeNumber(summary?.children_supported, copy.impactFallbacks.childrenSupported, locale);
  const partnerSchools = formatWholeNumber(summary?.partner_schools, copy.impactFallbacks.partnerSchools, locale);
  const regionsReached = formatWholeNumber(summary?.regions_reached, copy.impactFallbacks.regionsReached, locale);

  return {
    items: [
      { value: childrenSupported.value, label: copy.impactLabels.childrenSupported },
      { value: partnerSchools.value, label: copy.impactLabels.partnerSchools },
      { value: copy.impactFallbacks.educationalNeeds, label: copy.impactLabels.educationalNeeds },
      { value: regionsReached.value, label: copy.impactLabels.regionsReached },
    ],
    usesFallback: childrenSupported.usedFallback || partnerSchools.usedFallback || regionsReached.usedFallback || true,
  };
}

function formatWholeNumber(value: number | null | undefined, fallback: string, locale: Locale) {
  if (typeof value !== 'number' || value < 1) {
    return { value: fallback, usedFallback: true };
  }

  return { value: new Intl.NumberFormat(locale).format(value), usedFallback: false };
}

interface DonateCopy {
  heroTitle: string;
  heroDescription: string;
  heroAlt: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  whyEyebrow: string;
  whyTitle: string;
  whyBody: string;
  whyImageAlt: string;
  whyPoints: string[];
  formEyebrow: string;
  formTitle: string;
  frequencyLabel: string;
  frequencyLabels: Record<string, string>;
  monthlyEncouragement: string;
  currencyLabel: string;
  amountLabel: string;
  customAmountLabel: string;
  purposeLabel: string;
  purposeLabels: Record<string, string>;
  purposeHelper: string;
  providerLabel: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  countryLabel: string;
  anonymousLabel: string;
  anonymousHelper: string;
  momoConsentLabel: string;
  momoConsentHelper: string;
  momoConsentError: string;
  momoOverlayEyebrow: string;
  momoOverlayTitle: string;
  momoOverlayBody: string;
  momoOverlayNote: string;
  momoCheckingEyebrow: string;
  momoCheckingTitle: string;
  momoCheckingBody: string;
  momoPollingLabel: string;
  momoSuccessEyebrow: string;
  momoSuccessTitle: string;
  momoFailedEyebrow: string;
  momoFailedTitle: string;
  momoLongPendingEyebrow: string;
  momoLongPendingTitle: string;
  momoTerminalNote: string;
  momoCloseLabel: string;
  momoOverlay: MomoPaymentWaitingOverlayCopy;
  momoSupportSubject: string;
  momoSupportMessageRequired: string;
  providerCountryHint: string;
  momoAvailableHint: string;
  momoCountryCurrencyHint: string;
  momoUnavailableCountryMessage: string;
  momoUnavailableCountryError: string;
  momoCurrencyError: string;
  momoPhoneRequiredError: string;
  momoPhoneInvalidError: string;
  summaryTitle: string;
  summaryFrequency: string;
  summaryAmount: string;
  summaryPurpose: string;
  summaryProvider: string;
  similarDonationTitle: string;
  similarDonationBody: string;
  similarDonationReference: string;
  similarDonationCancel: string;
  similarDonationProceed: string;
  impactMessage: string;
  submitLabel: string;
  submittingLabel: string;
  fixErrorsMessage: string;
  intentCreatedMessage: string;
  redirectingMessage: string;
  paypalRedirectTitle: string;
  paypalRedirectBody: string;
  paypalRedirectSecureNote: string;
  submitErrorMessage: string;
  momoPendingMessage: string;
  momoSuccessMessage: string;
  momoFailedMessage: string;
  momoStillPendingMessage: string;
  minimumAmountError: string;
  providerError: string;
  nameError: string;
  emailError: string;
  countryError: string;
  supportEyebrow: string;
  supportTitle: string;
  supportBody: string;
  supportCards: Array<{ title: string; body: string }>;
  impactEyebrow: string;
  impactTitle: string;
  impactBody: string;
  impactFallbackNote: string;
  impactLabels: {
    childrenSupported: string;
    partnerSchools: string;
    educationalNeeds: string;
    regionsReached: string;
  };
  impactFallbacks: {
    childrenSupported: string;
    partnerSchools: string;
    educationalNeeds: string;
    regionsReached: string;
  };
  faqEyebrow: string;
  faqTitle: string;
  faqBody: string;
  faqItems: FaqItem[];
  stewardshipEyebrow: string;
  stewardshipTitle: string;
  stewardshipBody: string;
  stewardshipCards: Array<{ title: string; body: string }>;
  storiesEyebrow: string;
  storiesTitle: string;
  storiesBody: string;
  storyCards: Array<{
    eyebrow: string;
    title: string;
    summary: string;
    imageAlt: string;
  }>;
  communityEyebrow: string;
  communityTitle: string;
  communityBody: string;
  communityImageAlt: string;
  partnerCta: string;
  contactCta: string;
  finalEyebrow: string;
  finalTitle: string;
  finalBody: string;
  finalPrimaryCta: string;
}

const donateCopy = {
  en: {
    heroTitle: 'Help A Child Stay In School',
    heroDescription:
      'A school fee, a notebook, an examination registration, or a school uniform may seem small, but for many children these simple needs determine whether learning continues. Your support helps remove barriers that stand between children and their education.',
    heroAlt: 'Children learning together in Cameroon.',
    heroPrimaryCta: 'Give Today',
    heroSecondaryCta: 'See Our Impact',
    whyEyebrow: 'Why giving matters',
    whyTitle: "Education changes lives, but it is often interrupted by hardship beyond a child's control.",
    whyBody:
      'School fees, learning materials, examination costs, and family hardship can place education at risk. Your contribution helps keep opportunities open and allows children to continue learning with dignity.',
    whyImageAlt: 'Children learning in a classroom.',
    whyPoints: [
      'A school fee can keep a child enrolled.',
      'A notebook can help a child participate with confidence.',
      'An exam registration can protect a full year of effort.',
      'A timely gift can keep hardship from becoming withdrawal.',
    ],
    formEyebrow: 'Make a gift',
    formTitle: 'Give with confidence',
    frequencyLabel: 'Donation frequency',
    frequencyLabels: { one_time: 'One-Time', monthly: 'Monthly' },
    monthlyEncouragement: 'Monthly giving helps support children with steady care through the school year.',
    currencyLabel: 'Currency',
    amountLabel: 'Choose an amount',
    customAmountLabel: 'Custom amount',
    purposeLabel: 'Where would you like your gift to help?',
    purposeLabels: {
      greatest_need: 'Greatest Need',
      general_education: 'General Education Fund',
      school_fees: 'School Fees',
      learning_materials: 'Learning Materials',
      examination_support: 'Examination Support',
      uniform_support: 'Uniform Support',
      emergency_education: 'Emergency Educational Support',
    },
    purposeHelper: 'Your choice helps guide support while allowing responsible flexibility when needs change.',
    providerLabel: 'Giving channel',
    nameLabel: 'Full Name',
    emailLabel: 'Email Address',
    phoneLabel: 'Phone Number',
    countryLabel: 'Country Code',
    anonymousLabel: 'Give anonymously',
    anonymousHelper: 'Anonymous gifts still receive internal records and receipts when needed.',
    momoConsentLabel: 'Confirm this MoMo number',
    momoConsentHelper: 'MoMo will send a payment prompt to this number. Confirm it belongs to you and can be used for this gift.',
    momoConsentError: 'Please confirm the MoMo number before continuing.',
    momoOverlayEyebrow: 'Waiting for MoMo approval',
    momoOverlayTitle: 'Check your phone to approve the gift.',
    momoOverlayBody:
      'A MoMo payment prompt has been sent to your phone. Approve it on your device to complete the donation.',
    momoOverlayNote: 'Please keep this page open while we check the payment status securely.',
    momoCheckingEyebrow: 'Checking payment status',
    momoCheckingTitle: 'We are checking for confirmation.',
    momoCheckingBody:
      'Keep this page open while we ask MoMo for the latest status. This can take a little time after you approve the prompt on your phone.',
    momoPollingLabel: 'Status checks',
    momoSuccessEyebrow: 'Donation confirmed',
    momoSuccessTitle: 'Thank you. Your MoMo donation is confirmed.',
    momoFailedEyebrow: 'Payment not completed',
    momoFailedTitle: 'The MoMo payment was not completed.',
    momoLongPendingEyebrow: 'Still waiting',
    momoLongPendingTitle: 'Your MoMo payment is still pending.',
    momoTerminalNote: 'This transaction update is shown here so you can clearly see the latest donation status.',
    momoCloseLabel: 'Close',
    momoOverlay: {
      titleSent: 'Donation Request Sent',
      bodyPrepared: 'Thank you. Your donation has been prepared securely.',
      bodyPrompt: 'We have sent a Mobile Money payment request to your phone. Please review and approve the prompt on your device.',
      phoneLabel: 'Phone Number',
      amountLabel: 'Amount',
      statusLabel: 'Current update',
      preparedLabel: 'Donation prepared',
      requestSentLabel: 'Request sent to MTN MoMo',
      waitingApprovalLabel: 'Waiting for your approval',
      paymentConfirmedLabel: 'Payment confirmed',
      waitingFirst: 'Waiting for confirmation from your phone...',
      waitingSecond: 'Still waiting. Please check whether a Mobile Money prompt is open on your device.',
      waitingLong: 'Approvals sometimes take a little longer. Please review the request on your phone and confirm the payment.',
      confirmedTitle: 'Payment Confirmed',
      confirmedBody: 'Your donation has been received successfully. Thank you for supporting our mission.',
      failedTitle: 'Payment Not Completed',
      failedBody: 'We could not confirm the Mobile Money payment.',
      timeoutTitle: 'Still Waiting For Confirmation',
      timeoutBody: 'We have not yet received a final response from MTN MoMo.',
      timeoutFollowUp: 'We will keep your donation request open and continue processing if approval is received.',
      progressLabel: 'Status checks',
      spinnerLabel: 'Waiting for Mobile Money confirmation',
      closeLabel: 'Close',
      tryAgainLabel: 'Try Again',
      chooseAnotherLabel: 'Choose Another Channel',
      checkAgainLabel: 'Check Status Again',
      approvedCheckLabel: 'I Have Approved On My Phone',
      continueLabel: 'Continue Browsing',
      receiptLabel: 'View Donation Receipt',
      supportSummary: 'Need help with this donation?',
      supportTitle: 'Send us a note',
      supportBody: 'Tell us what happened. Donation details will be attached automatically so the team can review it quickly.',
      supportMessageLabel: 'Message',
      supportPlaceholder: 'For example: I approved the prompt but the page did not update.',
      supportSendLabel: 'Send Note',
      supportSendingLabel: 'Sending...',
      supportSentFallback: 'Thank you. Your note has been sent.',
    },
    momoSupportSubject: 'MoMo donation support',
    momoSupportMessageRequired: 'Please write a short note before sending.',
    providerCountryHint: 'Enter your country code so we can show the giving channels available to you.',
    momoAvailableHint: 'MoMo is available for Cameroon gifts in XAF. Card, PayPal, and bank transfer remain available where supported.',
    momoCountryCurrencyHint: 'MoMo gifts from Cameroon use XAF. Change the currency to XAF to use MoMo, or choose another channel.',
    momoUnavailableCountryMessage: 'MoMo is currently available only for Cameroon. Please use card, PayPal, or bank transfer for other countries.',
    momoUnavailableCountryError: 'MoMo is currently available only for Cameroon. Please choose another giving channel.',
    momoCurrencyError: 'MoMo requires XAF. Please change the currency to XAF or choose another giving channel.',
    momoPhoneRequiredError: 'Please enter the MoMo phone number that should receive the payment prompt.',
    momoPhoneInvalidError: 'Please enter a valid MoMo phone number.',
    summaryTitle: 'Donation summary',
    summaryFrequency: 'Frequency',
    summaryAmount: 'Amount',
    summaryPurpose: 'Purpose',
    summaryProvider: 'Channel',
    similarDonationTitle: 'A similar donation is already pending',
    similarDonationBody:
      'It looks like you recently started a similar donation. You can wait for that one to finish, or continue if you truly want to start another gift.',
    similarDonationReference: 'Pending reference',
    similarDonationCancel: 'Wait for the first one',
    similarDonationProceed: 'Start another gift',
    impactMessage:
      'Your gift could help provide learning materials, examination support, or educational assistance where it is most needed.',
    submitLabel: 'Give Securely',
    submittingLabel: 'Preparing donation...',
    fixErrorsMessage: 'Please review the highlighted details before continuing.',
    intentCreatedMessage: 'Thank you. Your donation has been prepared securely.',
    redirectingMessage: 'Thank you. Redirecting you to complete your gift.',
    paypalRedirectTitle: 'Redirecting to PayPal',
    paypalRedirectBody: 'You will be securely redirected to PayPal to complete your donation.',
    paypalRedirectSecureNote: 'After PayPal sends you back, we will verify the donation with PayPal before showing confirmation.',
    submitErrorMessage: 'We could not prepare your donation. Please try again.',
    momoPendingMessage: 'MoMo has been prompted. Please check your phone and approve the payment request.',
    momoSuccessMessage: 'Thank you. Your MoMo donation has been confirmed.',
    momoFailedMessage: 'The MoMo payment was not completed. Please confirm the number is active, then try again or choose card, PayPal, or bank transfer.',
    momoStillPendingMessage: 'Your MoMo payment is still pending. Please check your phone; we will keep the donation record open for confirmation.',
    minimumAmountError: 'The minimum donation is :amount.',
    providerError: 'Please choose a giving channel.',
    nameError: 'Please enter your full name.',
    emailError: 'Please enter a valid email address.',
    countryError: 'Use a two-letter country code, such as CM, US, GB, or ZA.',
    supportEyebrow: 'Ways your support helps',
    supportTitle: 'Practical gifts keep children learning.',
    supportBody: "Generosity becomes visible through the ordinary school needs that protect a child's chance to continue.",
    supportCards: [
      { title: 'School Fees', body: 'Helping children remain enrolled.' },
      { title: 'Learning Materials', body: 'Providing books, notebooks, and supplies.' },
      { title: 'Examinations', body: 'Supporting exam registration and participation.' },
      { title: 'Uniforms', body: 'Helping children attend school confidently.' },
      { title: 'Mentorship', body: 'Encouraging children through guidance and support.' },
      { title: 'Emergency Needs', body: 'Responding when educational opportunities are at risk.' },
    ],
    impactEyebrow: 'Impact snapshot',
    impactTitle: 'Support is part of a bigger story.',
    impactBody: 'Public impact figures grow as education support reaches children, schools, and communities.',
    impactFallbackNote: 'Our impact picture is growing as programs expand.',
    impactLabels: {
      childrenSupported: 'Children Supported',
      partnerSchools: 'Schools Reached',
      educationalNeeds: 'Educational Needs Funded',
      regionsReached: 'Regions Reached',
    },
    impactFallbacks: {
      childrenSupported: '300+',
      partnerSchools: '12+',
      educationalNeeds: 'Growing',
      regionsReached: '4+',
    },
    faqEyebrow: 'Giving questions',
    faqTitle: 'Common questions before giving.',
    faqBody: 'A gift should feel clear, responsible, and easy to make.',
    faqItems: [
      { question: 'How is my donation used?', answer: 'Donations support educational needs such as school fees, learning materials, uniforms, examination support, mentorship, and urgent school-related needs.' },
      { question: 'Can I donate monthly?', answer: 'Yes. Monthly giving helps provide steady support across the school year.' },
      { question: 'Will I receive a receipt?', answer: 'Yes. Donations are recorded so receipts and giving records can be prepared.' },
      { question: 'Can I donate anonymously?', answer: 'Yes. Anonymous giving means your name is not shared publicly, while internal records remain available for receipts and stewardship.' },
      { question: 'Can I support from outside Cameroon?', answer: 'Yes. The donation page supports several currencies and giving channels so supporters can give from different countries.' },
      { question: 'Can businesses or churches contribute?', answer: 'Yes. Businesses, churches, foundations, and community groups can give or contact us to explore a partnership.' },
      { question: 'How does the foundation report impact?', answer: 'Impact is shared through public updates, stories of progress, and responsible reporting as programs grow.' },
    ],
    stewardshipEyebrow: 'Stewardship',
    stewardshipTitle: 'Generosity deserves accountability.',
    stewardshipBody:
      'Every contribution is treated as a responsibility. The foundation works to ensure educational support reaches genuine needs while maintaining careful oversight, responsible record keeping, and meaningful impact reporting.',
    stewardshipCards: [
      { title: 'Donation Receipts', body: 'Giving records support responsible acknowledgement and future reporting.' },
      { title: 'Impact Reporting', body: 'Support should tell a clear story of what changed after a gift was given.' },
      { title: 'Community Verification', body: 'Schools, families, churches, and local leaders help confirm real needs.' },
      { title: 'Responsible Governance', body: "Children's dignity and donor trust guide how support is carried." },
    ],
    storiesEyebrow: 'Recent impact stories',
    storiesTitle: 'What giving can make possible.',
    storiesBody: 'These examples show progress without turning children into fundraising objects.',
    storyCards: [
      { eyebrow: 'School Fees', title: 'A child remains enrolled', summary: 'Timely fee support can keep a child in class when hardship threatens attendance.', imageAlt: 'Children studying under a tree.' },
      { eyebrow: 'Examinations', title: 'A school year is protected', summary: 'Exam support can help a student complete what they worked toward all year.', imageAlt: 'Children learning in Cameroon.' },
      { eyebrow: 'Community', title: 'Support grows through relationships', summary: 'Families, schools, churches, and donors each carry part of the work.', imageAlt: 'Rural community in Cameroon.' },
    ],
    communityEyebrow: 'Corporate and community giving',
    communityTitle: 'Support education together.',
    communityBody:
      'Businesses, churches, schools, foundations, and community groups can partner with TriumphChi Foundation to help expand educational opportunities across rural Cameroon.',
    communityImageAlt: 'A rural Cameroon community setting.',
    partnerCta: 'Partner With Us',
    contactCta: 'Contact Us',
    finalEyebrow: 'Giving from a covenant, not from leftovers',
    finalTitle: 'Every act of generosity helps create opportunities for children to keep learning.',
    finalBody:
      'Your gift can help remove the next barrier between a child and school.',
    finalPrimaryCta: 'Donate Today',
  },
  fr: {
    heroTitle: "Aider un enfant a rester a l'ecole",
    heroDescription:
      "Des frais scolaires, un cahier, une inscription a un examen ou un uniforme peuvent sembler simples, mais pour beaucoup d'enfants ces besoins decident si l'apprentissage continue. Votre soutien aide a lever les obstacles entre les enfants et leur education.",
    heroAlt: 'Des enfants apprennent ensemble au Cameroun.',
    heroPrimaryCta: 'Donner aujourd hui',
    heroSecondaryCta: 'Voir notre impact',
    whyEyebrow: 'Pourquoi donner compte',
    whyTitle: "L'education change des vies, mais elle est souvent interrompue par des difficultes hors du controle de l'enfant.",
    whyBody:
      "Les frais scolaires, le materiel, les examens et les difficultes familiales peuvent mettre l'education en danger. Votre contribution garde les opportunites ouvertes et aide les enfants a apprendre avec dignite.",
    whyImageAlt: 'Des enfants apprennent dans une salle de classe.',
    whyPoints: [
      'Des frais scolaires peuvent garder un enfant inscrit.',
      'Un cahier peut aider un enfant a participer avec confiance.',
      'Une inscription a un examen peut proteger une annee d efforts.',
      'Un don au bon moment peut eviter un abandon.',
    ],
    formEyebrow: 'Faire un don',
    formTitle: 'Donner avec confiance',
    frequencyLabel: 'Frequence du don',
    frequencyLabels: { one_time: 'Une fois', monthly: 'Mensuel' },
    monthlyEncouragement: 'Le don mensuel aide a soutenir les enfants avec regularite pendant l annee scolaire.',
    currencyLabel: 'Devise',
    amountLabel: 'Choisir un montant',
    customAmountLabel: 'Montant personnalise',
    purposeLabel: 'Ou souhaitez-vous aider ?',
    purposeLabels: {
      greatest_need: 'Besoin le plus urgent',
      general_education: 'Fonds general pour l education',
      school_fees: 'Frais scolaires',
      learning_materials: 'Materiel scolaire',
      examination_support: 'Soutien aux examens',
      uniform_support: 'Soutien aux uniformes',
      emergency_education: 'Urgence scolaire',
    },
    purposeHelper: 'Votre choix guide le soutien tout en gardant une flexibilite responsable lorsque les besoins changent.',
    providerLabel: 'Canal de don',
    nameLabel: 'Nom complet',
    emailLabel: 'Adresse email',
    phoneLabel: 'Telephone',
    countryLabel: 'Code pays',
    anonymousLabel: 'Donner anonymement',
    anonymousHelper: 'Les dons anonymes gardent des traces internes et des recus lorsque necessaire.',
    momoConsentLabel: 'Confirmer ce numero MoMo',
    momoConsentHelper: 'MoMo enverra une demande de paiement a ce numero. Confirmez qu il vous appartient et peut etre utilise pour ce don.',
    momoConsentError: 'Veuillez confirmer le numero MoMo avant de continuer.',
    momoOverlayEyebrow: 'En attente de validation MoMo',
    momoOverlayTitle: 'Verifiez votre telephone pour approuver le don.',
    momoOverlayBody:
      'Une demande de paiement MoMo a ete envoyee sur votre telephone. Approuvez-la sur votre appareil pour terminer le don.',
    momoOverlayNote: 'Veuillez garder cette page ouverte pendant que nous verifions le statut du paiement.',
    momoCheckingEyebrow: 'Verification du paiement',
    momoCheckingTitle: 'Nous verifions la confirmation.',
    momoCheckingBody:
      'Gardez cette page ouverte pendant que nous demandons a MoMo le dernier statut. Cela peut prendre un peu de temps apres validation sur votre telephone.',
    momoPollingLabel: 'Verifications',
    momoSuccessEyebrow: 'Don confirme',
    momoSuccessTitle: 'Merci. Votre don MoMo est confirme.',
    momoFailedEyebrow: 'Paiement non termine',
    momoFailedTitle: 'Le paiement MoMo n a pas ete termine.',
    momoLongPendingEyebrow: 'Toujours en attente',
    momoLongPendingTitle: 'Votre paiement MoMo est encore en attente.',
    momoTerminalNote: 'Cette mise a jour de transaction reste affichee ici afin que le statut du don soit clair.',
    momoCloseLabel: 'Fermer',
    momoOverlay: {
      titleSent: 'Demande de don envoyee',
      bodyPrepared: 'Merci. Votre don a ete prepare de maniere securisee.',
      bodyPrompt: 'Nous avons envoye une demande de paiement Mobile Money sur votre telephone. Veuillez la verifier et l approuver sur votre appareil.',
      phoneLabel: 'Numero de telephone',
      amountLabel: 'Montant',
      statusLabel: 'Mise a jour',
      preparedLabel: 'Don prepare',
      requestSentLabel: 'Demande envoyee a MTN MoMo',
      waitingApprovalLabel: 'En attente de votre approbation',
      paymentConfirmedLabel: 'Paiement confirme',
      waitingFirst: 'En attente de la confirmation depuis votre telephone...',
      waitingSecond: 'Toujours en attente. Verifiez si une demande Mobile Money est ouverte sur votre appareil.',
      waitingLong: 'Les approbations peuvent parfois prendre un peu plus de temps. Veuillez verifier la demande sur votre telephone et confirmer le paiement.',
      confirmedTitle: 'Paiement confirme',
      confirmedBody: 'Votre don a ete recu avec succes. Merci de soutenir notre mission.',
      failedTitle: 'Paiement non termine',
      failedBody: 'Nous n avons pas pu confirmer le paiement Mobile Money.',
      timeoutTitle: 'Toujours en attente de confirmation',
      timeoutBody: 'Nous n avons pas encore recu de reponse finale de MTN MoMo.',
      timeoutFollowUp: 'Nous garderons votre demande de don ouverte et continuerons le traitement si l approbation est recue.',
      progressLabel: 'Verifications',
      spinnerLabel: 'En attente de confirmation Mobile Money',
      closeLabel: 'Fermer',
      tryAgainLabel: 'Reessayer',
      chooseAnotherLabel: 'Choisir un autre canal',
      checkAgainLabel: 'Verifier encore',
      approvedCheckLabel: 'J ai approuve sur mon telephone',
      continueLabel: 'Continuer la visite',
      receiptLabel: 'Voir le recu du don',
      supportSummary: 'Besoin d aide avec ce don ?',
      supportTitle: 'Envoyez-nous une note',
      supportBody: 'Expliquez ce qui s est passe. Les details du don seront ajoutes automatiquement pour aider l equipe a verifier rapidement.',
      supportMessageLabel: 'Message',
      supportPlaceholder: 'Par exemple : J ai approuve la demande mais la page ne s est pas mise a jour.',
      supportSendLabel: 'Envoyer la note',
      supportSendingLabel: 'Envoi...',
      supportSentFallback: 'Merci. Votre note a ete envoyee.',
    },
    momoSupportSubject: 'Assistance don MoMo',
    momoSupportMessageRequired: 'Veuillez ecrire une courte note avant l envoi.',
    providerCountryHint: 'Saisissez votre code pays afin que nous puissions afficher les canaux de don disponibles.',
    momoAvailableHint: 'MoMo est disponible pour les dons du Cameroun en XAF. Carte, PayPal et virement restent disponibles selon le cas.',
    momoCountryCurrencyHint: 'Les dons MoMo depuis le Cameroun utilisent XAF. Changez la devise en XAF pour utiliser MoMo, ou choisissez un autre canal.',
    momoUnavailableCountryMessage: 'MoMo est actuellement disponible uniquement pour le Cameroun. Veuillez utiliser carte, PayPal ou virement bancaire pour les autres pays.',
    momoUnavailableCountryError: 'MoMo est actuellement disponible uniquement pour le Cameroun. Veuillez choisir un autre canal de don.',
    momoCurrencyError: 'MoMo exige XAF. Veuillez changer la devise en XAF ou choisir un autre canal de don.',
    momoPhoneRequiredError: 'Veuillez saisir le numero MoMo qui doit recevoir la demande de paiement.',
    momoPhoneInvalidError: 'Veuillez saisir un numero MoMo valide.',
    summaryTitle: 'Resume du don',
    summaryFrequency: 'Frequence',
    summaryAmount: 'Montant',
    summaryPurpose: 'But',
    summaryProvider: 'Canal',
    similarDonationTitle: 'Un don similaire est deja en attente',
    similarDonationBody:
      'Il semble que vous avez recemment commence un don similaire. Vous pouvez attendre la fin du premier, ou continuer si vous souhaitez vraiment lancer un autre don.',
    similarDonationReference: 'Reference en attente',
    similarDonationCancel: 'Attendre le premier',
    similarDonationProceed: 'Lancer un autre don',
    impactMessage:
      "Votre don peut aider a fournir du materiel, un soutien aux examens ou une aide scolaire la ou le besoin est le plus urgent.",
    submitLabel: 'Donner securise',
    submittingLabel: 'Preparation du don...',
    fixErrorsMessage: 'Veuillez verifier les informations indiquees avant de continuer.',
    intentCreatedMessage: 'Merci. Votre don a ete prepare de maniere securisee.',
    redirectingMessage: 'Merci. Redirection pour terminer votre don.',
    paypalRedirectTitle: 'Redirection vers PayPal',
    paypalRedirectBody: 'Vous serez redirige vers PayPal de maniere securisee pour terminer votre don.',
    paypalRedirectSecureNote: 'Apres votre retour depuis PayPal, nous verifierons le don avec PayPal avant de confirmer.',
    submitErrorMessage: 'Nous n avons pas pu preparer votre don. Veuillez reessayer.',
    momoPendingMessage: 'MoMo a ete lance. Veuillez verifier votre telephone et approuver la demande de paiement.',
    momoSuccessMessage: 'Merci. Votre don MoMo a ete confirme.',
    momoFailedMessage: 'Le paiement MoMo n a pas ete termine. Verifiez que le numero est actif, puis reessayez ou choisissez carte, PayPal ou virement bancaire.',
    momoStillPendingMessage: 'Votre paiement MoMo est encore en attente. Veuillez verifier votre telephone; nous garderons le don ouvert pour confirmation.',
    minimumAmountError: 'Le don minimum est :amount.',
    providerError: 'Veuillez choisir un canal de don.',
    nameError: 'Veuillez saisir votre nom complet.',
    emailError: 'Veuillez saisir une adresse email valide.',
    countryError: 'Utilisez un code pays de deux lettres, comme CM, US, GB ou ZA.',
    supportEyebrow: 'Comment votre soutien aide',
    supportTitle: "Des dons pratiques gardent les enfants a l'ecole.",
    supportBody: "La generosite devient visible dans les besoins scolaires simples qui protegent la chance d'un enfant de continuer.",
    supportCards: [
      { title: 'Frais scolaires', body: 'Aider les enfants a rester inscrits.' },
      { title: 'Materiel scolaire', body: 'Fournir livres, cahiers et fournitures.' },
      { title: 'Examens', body: 'Soutenir l inscription et la participation aux examens.' },
      { title: 'Uniformes', body: 'Aider les enfants a aller a l ecole avec confiance.' },
      { title: 'Mentorat', body: 'Encourager les enfants par la guidance et le soutien.' },
      { title: 'Urgences', body: 'Repondre lorsque les opportunites scolaires sont en danger.' },
    ],
    impactEyebrow: 'Apercu de l impact',
    impactTitle: "Le soutien fait partie d'une histoire plus grande.",
    impactBody: 'Les chiffres publics grandissent lorsque le soutien scolaire atteint les enfants, les ecoles et les communautes.',
    impactFallbackNote: 'Notre image d impact grandit avec les programmes.',
    impactLabels: {
      childrenSupported: 'Enfants soutenus',
      partnerSchools: 'Ecoles atteintes',
      educationalNeeds: 'Besoins scolaires aides',
      regionsReached: 'Regions atteintes',
    },
    impactFallbacks: {
      childrenSupported: '300+',
      partnerSchools: '12+',
      educationalNeeds: 'En croissance',
      regionsReached: '4+',
    },
    faqEyebrow: 'Questions sur le don',
    faqTitle: 'Questions frequentes avant de donner.',
    faqBody: 'Un don doit etre clair, responsable et facile a faire.',
    faqItems: [
      { question: 'Comment mon don est-il utilise ?', answer: 'Les dons soutiennent les frais scolaires, le materiel, les uniformes, les examens, le mentorat et les besoins scolaires urgents.' },
      { question: 'Puis-je donner chaque mois ?', answer: 'Oui. Le don mensuel aide a fournir un soutien regulier pendant l annee scolaire.' },
      { question: 'Recevrai-je un recu ?', answer: 'Oui. Les dons sont enregistres afin que les recus et documents de don puissent etre prepares.' },
      { question: 'Puis-je donner anonymement ?', answer: 'Oui. Votre nom ne sera pas partage publiquement, mais les traces internes restent disponibles pour les recus et le suivi.' },
      { question: 'Puis-je donner depuis l exterieur du Cameroun ?', answer: 'Oui. La page de don prend en charge plusieurs devises et canaux de don.' },
      { question: 'Les entreprises ou eglises peuvent-elles contribuer ?', answer: 'Oui. Entreprises, eglises, fondations et groupes communautaires peuvent donner ou nous contacter pour un partenariat.' },
      { question: 'Comment la fondation partage-t-elle l impact ?', answer: 'L impact est partage par des nouvelles publiques, des histoires de progres et des rapports responsables au fur et a mesure que les programmes grandissent.' },
    ],
    stewardshipEyebrow: 'Responsabilite',
    stewardshipTitle: 'La generosite merite la confiance.',
    stewardshipBody:
      "Chaque contribution est traitee comme une responsabilite. La fondation travaille pour que le soutien atteigne de vrais besoins avec un suivi attentif et des rapports utiles.",
    stewardshipCards: [
      { title: 'Recus de don', body: 'Les traces de don soutiennent les remerciements et rapports futurs.' },
      { title: 'Rapport d impact', body: 'Le soutien doit raconter clairement ce qui a change apres un don.' },
      { title: 'Verification communautaire', body: 'Ecoles, familles, eglises et leaders locaux aident a confirmer les besoins.' },
      { title: 'Gouvernance responsable', body: 'La dignite des enfants et la confiance des donateurs guident le soutien.' },
    ],
    storiesEyebrow: 'Histoires recentes',
    storiesTitle: 'Ce que le don peut rendre possible.',
    storiesBody: 'Ces exemples montrent le progres sans transformer les enfants en objets de collecte.',
    storyCards: [
      { eyebrow: 'Frais scolaires', title: 'Un enfant reste inscrit', summary: 'Un soutien rapide aux frais peut garder un enfant en classe lorsque la difficulte menace.', imageAlt: 'Des enfants etudient sous un arbre.' },
      { eyebrow: 'Examens', title: 'Une annee scolaire protegee', summary: 'Le soutien aux examens peut aider un eleve a terminer ce pour quoi il a travaille toute l annee.', imageAlt: 'Des enfants apprennent au Cameroun.' },
      { eyebrow: 'Communaute', title: 'Le soutien grandit par les relations', summary: 'Familles, ecoles, eglises et donateurs portent chacun une partie du travail.', imageAlt: 'Communaute rurale au Cameroun.' },
    ],
    communityEyebrow: 'Dons d organisations et communautes',
    communityTitle: "Soutenir l'education ensemble.",
    communityBody:
      'Entreprises, eglises, ecoles, fondations et groupes communautaires peuvent collaborer avec la Fondation TriumphChi pour elargir les opportunites scolaires au Cameroun rural.',
    communityImageAlt: 'Une communaute rurale au Cameroun.',
    partnerCta: 'Devenir partenaire',
    contactCta: 'Nous contacter',
    finalEyebrow: 'Donner par alliance, pas avec les restes',
    finalTitle: 'Chaque acte de generosite aide a creer des opportunites pour que les enfants continuent d apprendre.',
    finalBody: "Votre don peut lever le prochain obstacle entre un enfant et l'ecole.",
    finalPrimaryCta: 'Donner aujourd hui',
  },
} satisfies Record<Locale, DonateCopy>;
