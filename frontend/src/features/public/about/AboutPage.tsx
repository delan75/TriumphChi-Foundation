import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Home,
  School,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { FaqSection } from '../../../components/public/FaqSection';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { publicFaqSections } from '../../../content/publicFaqs';
import { Locale } from '../../../lib/i18n';
import heroImage from '../../../assets/landing/cameroon-children-educationjpg.jpg';
import ruralHomeImage from '../../../assets/public/about/rural-home-cameroon.jpg';
import covenantImage from '../../../assets/public/about/covenant-growth.jpg';
import classroomImage from '../../../assets/landing/education_aid_project.jpg';

interface AboutPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

const beliefIcons = [ShieldCheck, GraduationCap, UsersRound, HeartHandshake];
const workIcons = [HandHeart, CheckCircle2, BookOpen, HeartHandshake];
const stewardshipIcons = [HandHeart, BookOpen, School, ShieldCheck];

export function AboutPage({ locale, page }: AboutPageProps) {
  const copy = aboutCopy[locale];
  const homePage = getPageByKey('home');
  const donatePage = getPageByKey('donate');
  const applyPage = getPageByKey('apply');
  const contactPage = getPageByKey('contact');
  const faqSection = publicFaqSections.about;

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
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <ImageStory image={ruralHomeImage} alt={copy.storyImageAlt} caption={copy.storyCaption} />
          <div className="self-center">
            <SectionIntro eyebrow={copy.storyEyebrow} title={copy.storyTitle} body={copy.storyBody} />
            <p className="mt-5 text-lg font-black text-foundation-900">{copy.storyClosing}</p>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-foundation-900 text-white">
        <img src={covenantImage} alt={copy.covenantImageAlt} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-70 saturate-[0.7]" loading="lazy" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,55,47,0.99),rgba(18,55,47,0.92)_48%,rgba(18,55,47,0.78))]" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_18%,rgba(215,243,234,0.18),transparent_26%),linear-gradient(0deg,rgba(18,55,47,0.74),transparent_42%)]" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-foundation-100">{copy.covenantEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{copy.covenantTitle}</h2>
            <div className="mt-5 grid gap-4 text-base leading-7 text-foundation-50">
              {copy.covenantBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.beliefsEyebrow} title={copy.beliefsTitle} body={copy.beliefsBody} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.beliefs.map((belief, index) => {
              const Icon = beliefIcons[index];

              return (
                <article key={belief.title} className="rounded-md border border-foundation-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-black text-ink-900">{belief.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{belief.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div className="self-center">
            <SectionIntro eyebrow={copy.ruralEyebrow} title={copy.ruralTitle} body={copy.ruralBody} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {copy.ruralPoints.map((point) => (
                <div key={point} className="flex min-h-12 items-center gap-3 rounded-md border border-ink-100 bg-ink-50 px-4 py-3 text-sm font-bold text-ink-700">
                  <Home className="h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                  {point}
                </div>
              ))}
            </div>
          </div>
          <ImageStory image={classroomImage} alt={copy.ruralImageAlt} caption={copy.ruralCaption} />
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-foundation-100">{copy.processEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{copy.processTitle}</h2>
            <p className="mt-3 text-base leading-7 text-ink-100">{copy.processBody}</p>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {copy.process.map((step, index) => {
              const Icon = workIcons[index];

              return (
                <article key={step.title} className="rounded-md border border-white/10 bg-white/5 p-5 transition duration-200 hover:-translate-y-1 hover:bg-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-white text-foundation-900">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-black uppercase text-foundation-100">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h2 className="mt-4 text-lg font-black">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-100">{step.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {/*
            Review note: the "Children Are Not Fundraising Objects" section is intentionally not rendered publicly.
            The framing needs further review before it appears on the public website.

            <div className="rounded-md border border-foundation-100 bg-foundation-50 p-6">
              <ShieldCheck className="h-8 w-8 text-foundation-600" aria-hidden="true" />
              <h2 className="mt-4 text-3xl font-black leading-tight text-ink-900">{copy.protectionTitle}</h2>
              <p className="mt-4 text-base leading-7 text-ink-600">{copy.protectionBody}</p>
            </div>
          */}
          <div className="max-w-4xl">
            <SectionIntro eyebrow={copy.stewardshipEyebrow} title={copy.stewardshipTitle} body={copy.stewardshipBody} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {copy.stewardship.map((item, index) => {
                const Icon = stewardshipIcons[index];

                return (
                  <div key={item} className="flex min-h-12 items-center gap-3 rounded-md border border-ink-100 bg-ink-50 px-4 py-3 text-sm font-bold text-ink-700">
                    <Icon className="h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <FaqSection
        eyebrow={faqSection.eyebrow[locale]}
        title={faqSection.title[locale]}
        body={faqSection.body[locale]}
        items={faqSection.items[locale]}
        surface="tinted"
      />

      <section className="bg-foundation-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase text-foundation-600">{copy.ctaEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black text-ink-900 sm:text-4xl">{copy.ctaTitle}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-600">{copy.ctaBody}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CtaLink to={`/${locale}${donatePage.path[locale]}`}>{copy.supportCta}</CtaLink>
            <CtaLink to={`/${locale}${applyPage.path[locale]}`} variant="secondary">
              {copy.applyCta}
            </CtaLink>
            <CtaLink to={`/${locale}${contactPage.path[locale]}`} variant="secondary">
              {copy.contactCta}
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  );
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

function CtaLink({ to, children, variant = 'primary' }: { to: string; children: string; variant?: 'primary' | 'secondary' }) {
  return (
    <Link
      to={to}
      className={cn(
        'focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-black transition duration-200 hover:-translate-y-0.5',
        variant === 'primary'
          ? 'bg-foundation-600 text-white shadow-sm hover:bg-foundation-900'
          : 'border border-foundation-200 bg-white text-foundation-900 hover:bg-foundation-100',
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

interface AboutCopy {
  heroImageAlt: string;
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;
  storyClosing: string;
  storyImageAlt: string;
  storyCaption: string;
  covenantEyebrow: string;
  covenantTitle: string;
  covenantBody: string[];
  covenantImageAlt: string;
  beliefsEyebrow: string;
  beliefsTitle: string;
  beliefsBody: string;
  beliefs: Array<{ title: string; body: string }>;
  ruralEyebrow: string;
  ruralTitle: string;
  ruralBody: string;
  ruralPoints: string[];
  ruralImageAlt: string;
  ruralCaption: string;
  processEyebrow: string;
  processTitle: string;
  processBody: string;
  process: Array<{ title: string; body: string }>;
  protectionTitle: string;
  protectionBody: string;
  stewardshipEyebrow: string;
  stewardshipTitle: string;
  stewardshipBody: string;
  stewardship: string[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  supportCta: string;
  applyCta: string;
  contactCta: string;
}

const aboutCopy = {
  en: {
    heroImageAlt: 'Children learning together in a classroom in Cameroon.',
    storyEyebrow: 'Our story',
    storyTitle: 'Why We Exist',
    storyBody:
      "Education can change the direction of a child's life. Yet in many rural communities across Cameroon, children face barriers that have little to do with their willingness to learn. The loss of a parent, economic hardship, school fees, examination costs, or the lack of basic learning materials can quietly place education out of reach. TriumphChi Foundation exists to help remove those barriers and walk alongside children, families, schools, churches, and communities so that education remains possible where it is most at risk.",
    storyClosing: 'The work begins with people, not programs.',
    storyImageAlt: 'Children and family members outside a rural home in Cameroon.',
    storyCaption: 'Rural communities carry real hardship, but they also carry resilience, family, faith, and hope.',
    covenantEyebrow: 'Covenant giving',
    covenantTitle: 'Giving from a covenant, not from leftovers.',
    covenantBody: [
      'The foundation is built on the belief that generosity is more than a transaction.',
      'A covenant reflects commitment, responsibility, and care for one another.',
      "When a child's education is threatened by circumstances beyond their control, we believe communities can respond with compassion, dignity, and practical support.",
      'The goal is not charity that creates dependence. The goal is opportunity that helps children continue learning, growing, and preparing for the future.',
    ],
    covenantImageAlt: 'A hand watering young green shoots.',
    beliefsEyebrow: 'What we believe',
    beliefsTitle: 'Every response should protect dignity and create opportunity.',
    beliefsBody: 'Our values shape how support is requested, reviewed, shared, and followed through.',
    beliefs: [
      { title: 'Every Child Has Value', body: 'A child is never defined by loss, poverty, or need.' },
      { title: 'Education Creates Opportunity', body: 'Learning opens doors that hardship tries to close.' },
      { title: 'Community Matters', body: 'Families, schools, churches, and local leaders all have a role.' },
      { title: 'Dignity Must Be Protected', body: 'Stories and images should honor children, not expose them.' },
    ],
    ruralEyebrow: 'Where we serve',
    ruralTitle: 'Rural Cameroon matters.',
    ruralBody:
      'The foundation focuses on rural communities where educational opportunities are often affected by distance, limited resources, economic hardship, and family circumstances. These communities are not defined by need alone. They are places of resilience, faith, culture, family, and determination.',
    ruralPoints: ['Distance to school', 'Limited learning resources', 'Economic hardship', 'Strong community bonds'],
    ruralImageAlt: 'Children gathered in a classroom supported by the foundation.',
    ruralCaption: 'Support should strengthen the local relationships already surrounding a child.',
    processEyebrow: 'How we work',
    processTitle: 'Support is intentional, careful, and followed through.',
    processBody: 'Each request should be handled with respect so help can meet a real education need.',
    process: [
      { title: 'Needs Identified', body: 'A child, guardian, school, church, or local leader raises a concern.' },
      { title: 'Requests Reviewed', body: 'The situation is considered carefully and respectfully.' },
      { title: 'Support Provided', body: 'Fees, supplies, mentorship, or other education support is arranged.' },
      { title: 'Continued Follow-Up', body: 'The foundation remains connected with the child, family, and school.' },
    ],
    protectionTitle: 'Children Are Not Fundraising Objects',
    protectionBody:
      "Every child deserves privacy, dignity, and protection. Public stories focus on growth, learning, courage, and impact. Sensitive information remains protected, and images or updates should always respect the child's wellbeing.",
    stewardshipEyebrow: 'Stewardship and accountability',
    stewardshipTitle: 'Stewardship matters.',
    stewardshipBody:
      'Every gift entrusted to the foundation carries responsibility. The foundation seeks to maintain clear records, responsible oversight, and transparent reporting so educational support can reach children effectively and responsibly.',
    stewardship: ['Donation receipts', 'Impact reporting', 'Educational support tracking', 'Responsible governance'],
    ctaEyebrow: 'Walk with us',
    ctaTitle: 'There is a place for you in this work.',
    ctaBody: 'Whether you are a donor, volunteer, school, church, community leader, or family seeking support, this mission grows through shared care.',
    supportCta: 'Support a child',
    applyCta: 'Apply for assistance',
    contactCta: 'Contact us',
  },
  fr: {
    heroImageAlt: 'Des enfants apprennent ensemble dans une salle de classe au Cameroun.',
    storyEyebrow: 'Notre histoire',
    storyTitle: 'Pourquoi nous existons',
    storyBody:
      "L'éducation peut changer la direction de la vie d'un enfant. Pourtant, dans beaucoup de communautés rurales au Cameroun, les enfants rencontrent des obstacles qui n'ont rien à voir avec leur volonté d'apprendre. La perte d'un parent, les difficultés économiques, les frais scolaires, les examens ou le manque de fournitures peuvent discrètement mettre l'éducation hors de portée. La Fondation TriumphChi existe pour aider à lever ces obstacles et marcher avec les enfants, familles, écoles, églises et communautés afin que l'éducation reste possible là où elle est le plus menacée.",
    storyClosing: 'Le travail commence avec les personnes, pas avec les programmes.',
    storyImageAlt: 'Des enfants et membres de famille devant une maison rurale au Cameroun.',
    storyCaption: 'Les communautés rurales portent de vraies difficultés, mais aussi résilience, famille, foi et espérance.',
    covenantEyebrow: "Don d'alliance",
    covenantTitle: 'Donner par alliance, pas avec les restes.',
    covenantBody: [
      'La fondation est bâtie sur la conviction que la générosité est plus qu’une transaction.',
      "Une alliance reflète l'engagement, la responsabilité et le soin les uns envers les autres.",
      "Quand l'éducation d'un enfant est menacée par des circonstances hors de son contrôle, nous croyons que les communautés peuvent répondre avec compassion, dignité et soutien pratique.",
      "Le but n'est pas une charité qui crée la dépendance. Le but est une opportunité qui aide les enfants à continuer d'apprendre, de grandir et de préparer l'avenir.",
    ],
    covenantImageAlt: 'Une main arrose de jeunes pousses vertes.',
    beliefsEyebrow: 'Ce que nous croyons',
    beliefsTitle: 'Chaque réponse doit protéger la dignité et ouvrir une opportunité.',
    beliefsBody: "Nos valeurs guident la manière dont l'aide est demandée, étudiée, partagée et suivie.",
    beliefs: [
      { title: 'Chaque enfant a de la valeur', body: 'Un enfant ne se définit jamais par la perte, la pauvreté ou le besoin.' },
      { title: "L'éducation crée l'opportunité", body: "Apprendre ouvre les portes que les difficultés essaient de fermer." },
      { title: 'La communauté compte', body: 'Familles, écoles, églises et leaders locaux ont tous un rôle.' },
      { title: 'La dignité doit être protégée', body: 'Les récits et images doivent honorer les enfants, pas les exposer.' },
    ],
    ruralEyebrow: 'Où nous servons',
    ruralTitle: 'Le Cameroun rural compte.',
    ruralBody:
      "La fondation se concentre sur les communautés rurales où les opportunités éducatives sont souvent touchées par la distance, les ressources limitées, les difficultés économiques et les situations familiales. Ces communautés ne sont pas définies seulement par le besoin. Ce sont des lieux de résilience, foi, culture, famille et détermination.",
    ruralPoints: ["Distance vers l'école", "Ressources d'apprentissage limitées", 'Difficultés économiques', 'Liens communautaires forts'],
    ruralImageAlt: 'Des enfants rassemblés dans une classe soutenue par la fondation.',
    ruralCaption: "Le soutien doit renforcer les relations locales qui entourent déjà l'enfant.",
    processEyebrow: 'Comment nous travaillons',
    processTitle: "Le soutien est intentionnel, attentif et suivi.",
    processBody: "Chaque demande doit être traitée avec respect afin que l'aide réponde à un vrai besoin scolaire.",
    process: [
      { title: 'Besoins identifiés', body: 'Un enfant, tuteur, école, église ou leader local signale une situation.' },
      { title: 'Demandes étudiées', body: 'La situation est considérée avec soin et respect.' },
      { title: 'Soutien apporté', body: 'Frais, fournitures, mentorat ou autre aide éducative sont organisés.' },
      { title: 'Suivi continu', body: "La fondation reste en lien avec l'enfant, la famille et l'école." },
    ],
    protectionTitle: 'Les enfants ne sont pas des objets de collecte',
    protectionBody:
      "Chaque enfant mérite vie privée, dignité et protection. Les récits publics parlent de croissance, apprentissage, courage et impact. Les informations sensibles restent protégées, et les images ou nouvelles doivent toujours respecter le bien-être de l'enfant.",
    stewardshipEyebrow: 'Gestion et responsabilité',
    stewardshipTitle: 'La gestion compte.',
    stewardshipBody:
      "Chaque don confié à la fondation porte une responsabilité. La fondation cherche à garder des dossiers clairs, une supervision responsable et des rapports transparents afin que l'aide scolaire atteigne les enfants avec sérieux.",
    stewardship: ['Reçus de don', "Rapports d'impact", 'Suivi du soutien scolaire', 'Gouvernance responsable'],
    ctaEyebrow: 'Marcher avec nous',
    ctaTitle: 'Il y a une place pour vous dans cette œuvre.',
    ctaBody: "Que vous soyez donateur, bénévole, école, église, leader communautaire ou famille cherchant du soutien, cette mission grandit par le soin partagé.",
    supportCta: 'Soutenir un enfant',
    applyCta: 'Demander une aide',
    contactCta: 'Nous contacter',
  },
} satisfies Record<Locale, AboutCopy>;
