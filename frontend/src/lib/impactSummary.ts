import type { Locale } from './i18n';

export function formatImpactCount(value: unknown, fallback: string, locale: Locale) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    return { value: fallback, usedFallback: true };
  }

  return { value: new Intl.NumberFormat(locale).format(value), usedFallback: false };
}

export function formatImpactPercentage(value: unknown, fallback: string) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
    return { value: fallback, usedFallback: true };
  }

  return { value: `${Math.round(value)}%`, usedFallback: false };
}

export const impactSummaryMessages = {
  en: {
    loading: 'Loading verified impact figures.',
    unavailable: 'Some verified figures are unavailable. A dash means no figure has been reported; available figures come from our records.',
    placeholders: 'Program categories marked “Growing” describe ongoing work, not measured outcomes.',
  },
  fr: {
    loading: 'Chargement des indicateurs vérifiés.',
    unavailable: 'Certains indicateurs vérifiés sont indisponibles. Un tiret indique une donnée non publiée ; les chiffres disponibles proviennent de nos dossiers.',
    placeholders: 'Les catégories indiquées « En croissance » décrivent le travail en cours, pas des résultats mesurés.',
  },
};
