import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  School,
  Send,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { Locale } from '../../../lib/i18n';
import heroImage from '../../../assets/landing/rural-home-cameroon.jpg';
import contactImage from '../../../assets/landing/education_aid_project.jpg';
import communityImage from '../../../assets/landing/rural_kids.jpg';

interface ContactPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

type ContactReason = 'sponsorship' | 'assistance' | 'school' | 'volunteer' | 'partnership' | 'general';

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  reason: ContactReason;
  subject: string;
  message: string;
  consent: boolean;
}

const initialForm: ContactFormState = {
  name: '',
  email: '',
  phone: '',
  reason: 'general',
  subject: '',
  message: '',
  consent: false,
};

const reasonIcons: LucideIcon[] = [HeartHandshake, HandHeart, School, UsersRound, Building2, MessageSquareText];
const pageLinkIcons: LucideIcon[] = [HeartHandshake, HandHeart, BookOpen, GraduationCap, ShieldCheck];

export function ContactPage({ locale, page }: ContactPageProps) {
  const copy = contactCopy[locale];
  const homePage = getPageByKey('home');
  const sponsorPage = getPageByKey('sponsor');
  const applyPage = getPageByKey('apply');
  const donatePage = getPageByKey('donate');
  const impactPage = getPageByKey('impact');
  const aboutPage = getPageByKey('about');
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const publicLinks = useMemo(
    () => [
      { page: sponsorPage, text: copy.relatedLinks.sponsor },
      { page: applyPage, text: copy.relatedLinks.apply },
      { page: donatePage, text: copy.relatedLinks.donate },
      { page: impactPage, text: copy.relatedLinks.impact },
      { page: aboutPage, text: copy.relatedLinks.about },
    ],
    [aboutPage, applyPage, copy.relatedLinks, donatePage, impactPage, sponsorPage],
  );

  const updateField = <Field extends keyof ContactFormState>(field: Field, value: ContactFormState[Field]) => {
    setForm((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }

    if (isSuccess) {
      setIsSuccess(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateContactForm(form, copy);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setForm(initialForm);
    }, 450);
  };

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
        title={page.title[locale]}
        description={page.description[locale]}
        backgroundImage={heroImage}
        backgroundAlt={copy.heroImageAlt}
        breadcrumbs={[
          { label: homePage.label[locale], to: `/${locale}${homePage.path[locale]}` },
          { label: page.label[locale] },
        ]}
        actions={
          <>
            <a
              href="#contact-form"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-foundation-900 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-50"
            >
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              to={`/${locale}${applyPage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.18]"
            >
              {copy.secondaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <ImageStory image={contactImage} alt={copy.introImageAlt} caption={copy.introCaption} />
          <div className="self-center">
            <SectionIntro eyebrow={copy.introEyebrow} title={copy.introTitle} body={copy.introBody} />
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {copy.contactMethods.map((method) => {
                const Icon = method.icon;

                return (
                  <a
                    key={method.label}
                    href={method.href}
                    className="focus-ring rounded-md border border-ink-100 bg-ink-50 p-4 transition duration-200 hover:-translate-y-1 hover:border-foundation-100 hover:bg-foundation-50"
                  >
                    <Icon className="h-5 w-5 text-foundation-600" aria-hidden="true" />
                    <p className="mt-3 text-sm font-black text-ink-900">{method.label}</p>
                    <p className="mt-1 text-sm leading-6 text-ink-500">{method.value}</p>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.reasonsEyebrow} title={copy.reasonsTitle} body={copy.reasonsBody} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.reasons.map((reason, index) => {
              const Icon = reasonIcons[index];

              return (
                <article key={reason.title} className="rounded-md border border-foundation-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-black text-ink-900">{reason.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{reason.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contact-form" className="scroll-mt-24 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-16">
          <div className="rounded-md border border-ink-100 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-8">
              <p className="text-sm font-black uppercase text-foundation-600">{copy.formEyebrow}</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-ink-900">{copy.formTitle}</h2>
              <p className="mt-3 text-base leading-7 text-ink-500">{copy.formBody}</p>
            </div>

            {isSuccess ? (
              <div className="mb-6 rounded-md border border-foundation-100 bg-foundation-50 p-4" role="status" aria-live="polite">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-black text-foundation-900">{copy.successTitle}</p>
                    <p className="mt-1 text-sm leading-6 text-ink-600">{copy.successBody}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={copy.fields.name} id="contact-name" error={errors.name}>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className={fieldClass(Boolean(errors.name))}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  />
                </Field>

                <Field label={copy.fields.email} id="contact-email" error={errors.email}>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className={fieldClass(Boolean(errors.email))}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={copy.fields.phone} id="contact-phone" error={errors.phone}>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    className={fieldClass(Boolean(errors.phone))}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                  />
                </Field>

                <Field label={copy.fields.reason} id="contact-reason" error={errors.reason}>
                  <select
                    id="contact-reason"
                    name="reason"
                    value={form.reason}
                    onChange={(event) => updateField('reason', event.target.value as ContactReason)}
                    className={fieldClass(Boolean(errors.reason))}
                    aria-invalid={Boolean(errors.reason)}
                    aria-describedby={errors.reason ? 'contact-reason-error' : undefined}
                  >
                    {copy.reasonOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label={copy.fields.subject} id="contact-subject" error={errors.subject}>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={(event) => updateField('subject', event.target.value)}
                  className={fieldClass(Boolean(errors.subject))}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                />
              </Field>

              <Field label={copy.fields.message} id="contact-message" error={errors.message} helpText={copy.messageHelp}>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  className={cn(fieldClass(Boolean(errors.message)), 'min-h-40 resize-y leading-6')}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-help'}
                />
              </Field>

              <label className="flex items-start gap-3 rounded-md border border-ink-100 bg-ink-50 p-4 text-sm leading-6 text-ink-600">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(event) => updateField('consent', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-ink-300 text-foundation-600 focus:ring-foundation-500"
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? 'contact-consent-error' : undefined}
                />
                <span>
                  {copy.fields.consent}
                  {errors.consent ? (
                    <span id="contact-consent-error" className="mt-2 block text-sm text-support-red">
                      {errors.consent}
                    </span>
                  ) : null}
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-900 sm:justify-self-start',
                  isSubmitting && 'cursor-not-allowed opacity-60 hover:translate-y-0',
                )}
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                {isSubmitting ? copy.sending : copy.send}
              </button>
            </form>
          </div>

          <aside className="grid content-start gap-5">
            <div className="rounded-md border border-foundation-100 bg-foundation-50 p-5">
              <ShieldCheck className="h-6 w-6 text-foundation-600" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-ink-900">{copy.safeguardingTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-600">{copy.safeguardingBody}</p>
            </div>
            <ImageStory image={communityImage} alt={copy.sideImageAlt} caption={copy.sideCaption} />
          </aside>
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-foundation-100">{copy.linksEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{copy.linksTitle}</h2>
            <p className="mt-3 text-base leading-7 text-ink-100">{copy.linksBody}</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {publicLinks.map((item, index) => {
              const Icon = pageLinkIcons[index];

              return (
                <Link
                  key={item.page.key}
                  to={`/${locale}${item.page.path[locale]}`}
                  className="focus-ring rounded-md border border-white/10 bg-white/5 p-5 transition duration-200 hover:-translate-y-1 hover:bg-white/10"
                >
                  <Icon className="h-5 w-5 text-foundation-100" aria-hidden="true" />
                  <p className="mt-4 text-base font-black">{item.page.label[locale]}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-100">{item.text}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function validateContactForm(form: ContactFormState, copy: ContactCopy) {
  const errors: Partial<Record<keyof ContactFormState, string>> = {};

  if (!form.name.trim()) {
    errors.name = copy.validation.name;
  }

  if (!form.email.trim()) {
    errors.email = copy.validation.email;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = copy.validation.emailInvalid;
  }

  if (!form.subject.trim()) {
    errors.subject = copy.validation.subject;
  }

  if (!form.message.trim()) {
    errors.message = copy.validation.message;
  } else if (form.message.trim().length < 20) {
    errors.message = copy.validation.messageLength;
  }

  if (!form.consent) {
    errors.consent = copy.validation.consent;
  }

  return errors;
}

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-black uppercase text-foundation-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight text-ink-900 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-ink-500">{body}</p>
    </div>
  );
}

function Field({
  label,
  id,
  error,
  helpText,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  helpText?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink-700">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {helpText ? (
        <p id={`${id}-help`} className="mt-2 text-xs leading-5 text-ink-500">
          {helpText}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-support-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ImageStory({ image, alt, caption }: { image: string; alt: string; caption: string }) {
  return (
    <figure className="overflow-hidden rounded-md border border-ink-100 bg-white shadow-sm">
      <div className="relative isolate overflow-hidden">
        <img src={image} alt={alt} className="aspect-[4/3] w-full object-cover opacity-80 saturate-[0.74]" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,55,47,0.76),rgba(18,55,47,0.42)_48%,rgba(18,55,47,0.78))] mix-blend-multiply" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_18%,rgba(255,255,255,0.14),transparent_32%),linear-gradient(90deg,rgba(18,55,47,0.22),rgba(18,55,47,0.56))]" aria-hidden="true" />
      </div>
      <figcaption className="px-4 py-3 text-sm leading-6 text-ink-500">{caption}</figcaption>
    </figure>
  );
}

function fieldClass(hasError: boolean) {
  return cn(
    'block min-h-12 w-full rounded-md border bg-white px-3 py-2.5 text-base text-ink-900 shadow-sm transition duration-200 focus:outline-none sm:text-sm',
    hasError
      ? 'border-support-red focus:border-support-red focus:ring-2 focus:ring-support-red/20'
      : 'border-ink-200 focus:border-foundation-500 focus:ring-2 focus:ring-foundation-500/20',
  );
}

interface ContactCopy {
  heroImageAlt: string;
  primaryCta: string;
  secondaryCta: string;
  introEyebrow: string;
  introTitle: string;
  introBody: string;
  introImageAlt: string;
  introCaption: string;
  contactMethods: Array<{ icon: LucideIcon; label: string; value: string; href: string }>;
  reasonsEyebrow: string;
  reasonsTitle: string;
  reasonsBody: string;
  reasons: Array<{ title: string; body: string }>;
  formEyebrow: string;
  formTitle: string;
  formBody: string;
  fields: {
    name: string;
    email: string;
    phone: string;
    reason: string;
    subject: string;
    message: string;
    consent: string;
  };
  reasonOptions: Array<{ value: ContactReason; label: string }>;
  messageHelp: string;
  send: string;
  sending: string;
  successTitle: string;
  successBody: string;
  validation: {
    name: string;
    email: string;
    emailInvalid: string;
    subject: string;
    message: string;
    messageLength: string;
    consent: string;
  };
  safeguardingTitle: string;
  safeguardingBody: string;
  sideImageAlt: string;
  sideCaption: string;
  linksEyebrow: string;
  linksTitle: string;
  linksBody: string;
  relatedLinks: {
    sponsor: string;
    apply: string;
    donate: string;
    impact: string;
    about: string;
  };
}

const contactCopy = {
  en: {
    heroImageAlt: 'A rural home and community setting in Cameroon.',
    primaryCta: 'Send a Message',
    secondaryCta: 'Request Assistance',
    introEyebrow: 'We would be glad to hear from you',
    introTitle: 'Reach out with care, partnership, or a school support need.',
    introBody:
      'TriumphChi Foundation welcomes messages from donors, families, schools, churches, volunteers, community leaders, and partners who want to support education for orphaned and vulnerable children in rural Cameroon.',
    introImageAlt: 'Children receiving education support from community volunteers.',
    introCaption: 'Contact begins with listening. The right response depends on understanding the real need with dignity.',
    contactMethods: [
      { icon: Mail, label: 'Email', value: 'support@triumphchi.org', href: 'mailto:support@triumphchi.org' },
      { icon: Phone, label: 'Phone', value: '+237 000 000 000', href: 'tel:+237000000000' },
      { icon: MapPin, label: 'Focus', value: 'Rural Cameroon', href: '/en/contact' },
    ],
    reasonsEyebrow: 'How can we help?',
    reasonsTitle: 'Different people reach out for different reasons.',
    reasonsBody: 'The contact page should guide the right conversation without making visitors search through the whole site first.',
    reasons: [
      { title: 'Sponsor a child', body: 'Ask about helping a child remain in school through shared or direct education support.' },
      { title: 'Request assistance', body: 'Families, guardians, schools, churches, or local leaders can ask how to begin a support request.' },
      { title: 'School coordination', body: 'Schools can reach out about fees, documents, participation updates, and verified needs.' },
      { title: 'Volunteer or mentor', body: 'Share your interest in walking alongside children through encouragement and practical service.' },
      { title: 'Church or partner inquiry', body: 'Discuss community partnership, outreach, corporate giving, or program support.' },
      { title: 'General question', body: 'Ask about the foundation, the mission, public updates, or how to get involved.' },
    ],
    formEyebrow: 'Contact form',
    formTitle: 'Tell us how we can respond.',
    formBody: 'Share enough context for the team to understand your message. Please avoid sending sensitive child information through the public form.',
    fields: {
      name: 'Full name',
      email: 'Email address',
      phone: 'Phone number',
      reason: 'Reason for contact',
      subject: 'Subject',
      message: 'Message',
      consent: 'I understand this public form should not include sensitive child information, medical details, or private documents.',
    },
    reasonOptions: [
      { value: 'general', label: 'General question' },
      { value: 'sponsorship', label: 'Sponsor a child' },
      { value: 'assistance', label: 'Request assistance' },
      { value: 'school', label: 'School coordination' },
      { value: 'volunteer', label: 'Volunteer or mentor' },
      { value: 'partnership', label: 'Church, company, or partner inquiry' },
    ],
    messageHelp: 'Minimum 20 characters. Keep private child details out of this public form.',
    send: 'Send message',
    sending: 'Sending...',
    successTitle: 'Your message is ready for the foundation team.',
    successBody: 'This frontend form is prepared for the contact workflow. Delivery will be connected when the backend contact endpoint is added.',
    validation: {
      name: 'Please enter your name.',
      email: 'Please enter your email address.',
      emailInvalid: 'Please enter a valid email address.',
      subject: 'Please add a subject.',
      message: 'Please write a message.',
      messageLength: 'Please write at least 20 characters.',
      consent: 'Please confirm the privacy note before sending.',
    },
    safeguardingTitle: 'Child privacy comes first',
    safeguardingBody:
      'This public form is for first contact only. Sensitive beneficiary information, documents, and private updates should be handled through protected workflows after the team responds.',
    sideImageAlt: 'Children gathered in a rural community in Cameroon.',
    sideCaption: 'The safest first step is a respectful conversation, followed by the right protected process.',
    linksEyebrow: 'Continue exploring',
    linksTitle: 'Find the right next step.',
    linksBody: 'Public pages should guide visitors naturally. These links connect common contact reasons to the right page.',
    relatedLinks: {
      sponsor: 'Learn how sponsorship helps children stay in school.',
      apply: 'Start with guidance for educational assistance.',
      donate: 'Give toward school needs and education support.',
      impact: 'See how support is reported without exposing private records.',
      about: 'Understand the foundation story, values, and mission.',
    },
  },
  fr: {
    heroImageAlt: 'Une maison rurale et un cadre communautaire au Cameroun.',
    primaryCta: 'Envoyer un message',
    secondaryCta: 'Demander une aide',
    introEyebrow: 'Nous serons heureux de vous lire',
    introTitle: 'Contactez-nous pour le soutien, le partenariat ou un besoin scolaire.',
    introBody:
      "La Fondation TriumphChi accueille les messages des donateurs, familles, écoles, églises, bénévoles, leaders communautaires et partenaires qui veulent soutenir l'éducation des orphelins et enfants vulnérables au Cameroun rural.",
    introImageAlt: 'Des enfants reçoivent un soutien éducatif avec des bénévoles communautaires.',
    introCaption: "Le contact commence par l'écoute. La bonne réponse dépend d'une compréhension digne du vrai besoin.",
    contactMethods: [
      { icon: Mail, label: 'Email', value: 'support@triumphchi.org', href: 'mailto:support@triumphchi.org' },
      { icon: Phone, label: 'Téléphone', value: '+237 000 000 000', href: 'tel:+237000000000' },
      { icon: MapPin, label: 'Lieu de service', value: 'Cameroun rural', href: '/fr/contact' },
    ],
    reasonsEyebrow: 'Comment pouvons-nous aider ?',
    reasonsTitle: 'Chaque personne contacte la fondation pour une raison différente.',
    reasonsBody: 'La page contact doit orienter la bonne conversation sans obliger les visiteurs à chercher partout dans le site.',
    reasons: [
      { title: 'Parrainer un enfant', body: "Demander comment aider un enfant à rester à l'école par un soutien scolaire partagé ou direct." },
      { title: 'Demander une aide', body: 'Familles, tuteurs, écoles, églises ou leaders locaux peuvent demander comment commencer une demande.' },
      { title: 'Coordination avec une école', body: 'Les écoles peuvent contacter la fondation pour les frais, documents, nouvelles de participation et besoins vérifiés.' },
      { title: 'Bénévolat ou mentorat', body: 'Partager votre intérêt à accompagner les enfants par encouragement et service pratique.' },
      { title: 'Église ou partenaire', body: "Discuter partenariat communautaire, action locale, soutien d'entreprise ou appui aux programmes." },
      { title: 'Question générale', body: "Demander des informations sur la fondation, la mission, les nouvelles publiques ou comment participer." },
    ],
    formEyebrow: 'Formulaire de contact',
    formTitle: 'Dites-nous comment répondre.',
    formBody: "Partagez assez de contexte pour que l'équipe comprenne votre message. Veuillez éviter d'envoyer des informations sensibles sur un enfant par ce formulaire public.",
    fields: {
      name: 'Nom complet',
      email: 'Adresse email',
      phone: 'Téléphone',
      reason: 'Raison du contact',
      subject: 'Sujet',
      message: 'Message',
      consent: "Je comprends que ce formulaire public ne doit pas contenir d'informations sensibles sur un enfant, de détails médicaux ou de documents privés.",
    },
    reasonOptions: [
      { value: 'general', label: 'Question générale' },
      { value: 'sponsorship', label: 'Parrainer un enfant' },
      { value: 'assistance', label: 'Demander une aide' },
      { value: 'school', label: 'Coordination avec une école' },
      { value: 'volunteer', label: 'Bénévolat ou mentorat' },
      { value: 'partnership', label: 'Église, entreprise ou partenaire' },
    ],
    messageHelp: "Minimum 20 caractères. Gardez les détails privés d'un enfant hors de ce formulaire public.",
    send: 'Envoyer le message',
    sending: 'Envoi...',
    successTitle: "Votre message est prêt pour l'équipe de la fondation.",
    successBody: "Ce formulaire frontend est préparé pour le parcours contact. L'envoi sera connecté lorsque l'endpoint backend sera ajouté.",
    validation: {
      name: 'Veuillez entrer votre nom.',
      email: 'Veuillez entrer votre adresse email.',
      emailInvalid: 'Veuillez entrer une adresse email valide.',
      subject: 'Veuillez ajouter un sujet.',
      message: 'Veuillez écrire un message.',
      messageLength: 'Veuillez écrire au moins 20 caractères.',
      consent: "Veuillez confirmer la note de confidentialité avant l'envoi.",
    },
    safeguardingTitle: "La confidentialité de l'enfant passe d'abord",
    safeguardingBody:
      "Ce formulaire public sert au premier contact uniquement. Les informations sensibles, documents et nouvelles privées doivent passer par des workflows protégés après la réponse de l'équipe.",
    sideImageAlt: 'Des enfants réunis dans une communauté rurale au Cameroun.',
    sideCaption: 'La première étape la plus sûre est une conversation respectueuse, suivie du bon processus protégé.',
    linksEyebrow: 'Continuer la visite',
    linksTitle: 'Trouver la bonne prochaine étape.',
    linksBody: 'Les pages publiques doivent orienter les visiteurs naturellement. Ces liens relient les raisons fréquentes de contact aux bonnes pages.',
    relatedLinks: {
      sponsor: "Comprendre comment le parrainage aide les enfants à rester à l'école.",
      apply: 'Commencer avec les informations pour une aide scolaire.',
      donate: 'Donner pour les besoins scolaires et le soutien éducatif.',
      impact: "Voir comment le soutien est présenté sans exposer les dossiers privés.",
      about: "Comprendre l'histoire, les valeurs et la mission de la fondation.",
    },
  },
} satisfies Record<Locale, ContactCopy>;
