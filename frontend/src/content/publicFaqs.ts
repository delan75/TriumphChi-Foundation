import type { FaqItem } from '../components/public/FaqSection';
import type { Locale } from '../lib/i18n';

type PublicFaqKey = 'home' | 'about' | 'contact' | 'privacy';

interface PublicFaqSection {
  eyebrow: Record<Locale, string>;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  items: Record<Locale, FaqItem[]>;
}

export const publicFaqSections: Record<PublicFaqKey, PublicFaqSection> = {
  home: {
    eyebrow: { en: 'Common questions', fr: 'Questions frequentes' },
    title: { en: 'Questions people ask before they reach out.', fr: 'Questions posees avant de nous contacter.' },
    body: {
      en: 'A few simple answers for families, schools, donors, churches, and partners who want to understand the work.',
      fr: 'Quelques reponses simples pour les familles, ecoles, donateurs, eglises et partenaires qui veulent comprendre le travail.',
    },
    items: {
      en: [
        {
          question: 'Who can request educational assistance?',
          answer:
            'A child, parent, guardian, school, church, community leader, or responsible adult may reach out when a child is at risk of missing school because of a real education need.',
        },
        {
          question: 'What kind of support does the foundation provide?',
          answer:
            'Support may include school fees, learning materials, uniforms, examination costs, mentorship, encouragement, and follow-up with people who know the child.',
        },
        {
          question: 'Do donors choose or own a specific child?',
          answer:
            'No. Giving is handled as shared education support. A child may be helped by more than one supporter, and gifts are directed toward verified needs with care.',
        },
        {
          question: 'How is a child protected publicly?',
          answer:
            'Public stories should focus on hope, learning, and progress. Sensitive records, family details, and private beneficiary information remain protected.',
        },
      ],
      fr: [
        {
          question: 'Qui peut demander une aide scolaire ?',
          answer:
            'Un enfant, parent, tuteur, ecole, eglise, responsable communautaire ou adulte responsable peut nous contacter lorsqu un enfant risque de manquer l ecole a cause d un vrai besoin scolaire.',
        },
        {
          question: 'Quel type de soutien la fondation apporte-t-elle ?',
          answer:
            'Le soutien peut inclure les frais scolaires, fournitures, uniformes, frais d examen, mentorat, encouragement et suivi avec les personnes qui connaissent l enfant.',
        },
        {
          question: 'Les donateurs choisissent-ils un enfant comme une propriete ?',
          answer:
            'Non. Le don est un soutien educatif partage. Un enfant peut etre aide par plusieurs personnes, et les dons sont orientes vers des besoins verifies avec soin.',
        },
        {
          question: 'Comment un enfant est-il protege publiquement ?',
          answer:
            'Les recits publics doivent parler d esperance, d apprentissage et de progres. Les dossiers sensibles, details familiaux et informations privees restent proteges.',
        },
      ],
    },
  },
  about: {
    eyebrow: { en: 'About the foundation', fr: 'A propos de la fondation' },
    title: { en: 'A few things worth knowing.', fr: 'Quelques points importants.' },
    body: {
      en: 'These answers explain how TriumphChi Foundation thinks about children, community, giving, and accountability.',
      fr: 'Ces reponses expliquent comment la Fondation TriumphChi comprend les enfants, la communaute, le don et la responsabilite.',
    },
    items: {
      en: [
        {
          question: 'Why focus on education?',
          answer:
            'Education gives a child room to grow, prepare for the future, and remain connected to hope even when family circumstances are difficult.',
        },
        {
          question: 'Why work with local communities?',
          answer:
            'Families, schools, churches, and local leaders often understand the child and the need best. Their knowledge helps support become more respectful and useful.',
        },
        {
          question: 'What does covenant giving mean?',
          answer:
            'It means generosity is not treated as leftover giving. It is a commitment to respond with responsibility, compassion, and shared purpose.',
        },
        {
          question: 'How does the foundation avoid exposing children?',
          answer:
            'The foundation separates public storytelling from private records. Public updates should be reviewed, respectful, and limited to what protects dignity.',
        },
      ],
      fr: [
        {
          question: 'Pourquoi se concentrer sur l education ?',
          answer:
            'L education donne a l enfant de l espace pour grandir, preparer l avenir et rester attache a l esperance meme lorsque la situation familiale est difficile.',
        },
        {
          question: 'Pourquoi travailler avec les communautes locales ?',
          answer:
            'Les familles, ecoles, eglises et responsables locaux connaissent souvent le mieux l enfant et le besoin. Leur connaissance rend le soutien plus respectueux et utile.',
        },
        {
          question: 'Que signifie donner par alliance ?',
          answer:
            'Cela signifie que la generosite n est pas un don de restes. C est un engagement a repondre avec responsabilite, compassion et objectif partage.',
        },
        {
          question: 'Comment la fondation evite-t-elle d exposer les enfants ?',
          answer:
            'La fondation separe les recits publics des dossiers prives. Les nouvelles publiques doivent etre verifiees, respectueuses et limitees pour proteger la dignite.',
        },
      ],
    },
  },
  contact: {
    eyebrow: { en: 'Before you message us', fr: 'Avant de nous ecrire' },
    title: { en: 'Helpful answers for the first conversation.', fr: 'Reponses utiles pour commencer.' },
    body: {
      en: 'If you are not sure where your message fits, send it anyway. A genuine conversation is a good first step.',
      fr: 'Si vous ne savez pas dans quelle categorie placer votre message, envoyez-le quand meme. Une conversation sincere est un bon premier pas.',
    },
    items: {
      en: [
        {
          question: 'Who should use the contact form?',
          answer:
            'Anyone with a genuine question may use it: families, schools, churches, donors, volunteers, community leaders, companies, and partner organizations.',
        },
        {
          question: 'Can I request help for a child through the contact page?',
          answer:
            'Yes, but the education assistance form is usually better when you already know the child, school context, and need. Contact is best for questions and first conversations.',
        },
        {
          question: 'Can I attach a supporting file?',
          answer:
            'Yes. If a document helps explain the conversation, you may attach it. Files are checked and stored privately for review by the foundation team.',
        },
        {
          question: 'How quickly will someone respond?',
          answer:
            'The foundation aims to respond as promptly as possible to genuine inquiries. Response time may depend on the nature of the message and verification needed.',
        },
      ],
      fr: [
        {
          question: 'Qui doit utiliser le formulaire de contact ?',
          answer:
            'Toute personne avec une vraie question peut l utiliser : familles, ecoles, eglises, donateurs, benevoles, responsables communautaires, entreprises et partenaires.',
        },
        {
          question: 'Puis-je demander de l aide pour un enfant depuis la page contact ?',
          answer:
            'Oui, mais le formulaire de demande d aide scolaire est souvent mieux si vous connaissez deja l enfant, le contexte scolaire et le besoin. Le contact sert surtout aux questions et premieres conversations.',
        },
        {
          question: 'Puis-je joindre un fichier ?',
          answer:
            'Oui. Si un document aide a expliquer la conversation, vous pouvez le joindre. Les fichiers sont verifies et gardes en prive pour l equipe de la fondation.',
        },
        {
          question: 'Quand recevrai-je une reponse ?',
          answer:
            'La fondation cherche a repondre aussi rapidement que possible aux demandes sinceres. Le delai peut dependre du message et des verifications necessaires.',
        },
      ],
    },
  },
  privacy: {
    eyebrow: { en: 'Privacy questions', fr: 'Questions de confidentialite' },
    title: { en: 'Clear answers about information and care.', fr: 'Reponses claires sur les informations.' },
    body: {
      en: 'Privacy should be understandable. These answers explain how the foundation thinks about personal information in daily practice.',
      fr: 'La confidentialite doit etre comprehensible. Ces reponses expliquent comment la fondation traite les informations personnelles dans la pratique.',
    },
    items: {
      en: [
        {
          question: 'Do you sell personal information?',
          answer:
            'No. Personal information is not sold. It is only shared when needed for support, accountability, trusted service providers, safety, or legal reasons.',
        },
        {
          question: 'Are child records shown publicly?',
          answer:
            'No. Private child records remain protected. Public stories and updates should be reviewed, limited, and respectful of the child and family.',
        },
        {
          question: 'Why do you collect information about a child or guardian?',
          answer:
            'Information helps the foundation understand the need, verify the situation, contact a responsible person, provide support, and keep responsible records.',
        },
        {
          question: 'Can I ask for my information to be corrected?',
          answer:
            'Yes. You may contact the foundation to request a correction. We may need to confirm your identity before making changes.',
        },
      ],
      fr: [
        {
          question: 'Vendez-vous les informations personnelles ?',
          answer:
            'Non. Les informations personnelles ne sont pas vendues. Elles sont partagees seulement si necessaire pour le soutien, la redevabilite, les prestataires de confiance, la securite ou la loi.',
        },
        {
          question: 'Les dossiers des enfants sont-ils publics ?',
          answer:
            'Non. Les dossiers prives des enfants restent proteges. Les recits et nouvelles publics doivent etre verifies, limites et respectueux de l enfant et de la famille.',
        },
        {
          question: 'Pourquoi collecter des informations sur un enfant ou un tuteur ?',
          answer:
            'Ces informations aident la fondation a comprendre le besoin, verifier la situation, contacter une personne responsable, apporter un soutien et garder des traces responsables.',
        },
        {
          question: 'Puis-je demander la correction de mes informations ?',
          answer:
            'Oui. Vous pouvez contacter la fondation pour demander une correction. Nous pouvons devoir confirmer votre identite avant de faire des changements.',
        },
      ],
    },
  },
};
