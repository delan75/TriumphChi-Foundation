import type { PublicDonationConfig } from './api';

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;
const options = (value: unknown): value is Array<{ key: string; label: string }> =>
  Array.isArray(value) && value.length > 0 && value.every((item) => record(item) && typeof item.key === 'string' && typeof item.label === 'string');

export function isPublicDonationConfig(value: unknown): value is PublicDonationConfig {
  if (!record(value) || !record(value.currencies) || !Object.keys(value.currencies).length) return false;
  if (typeof value.default_currency !== 'string' || !Object.prototype.hasOwnProperty.call(value.currencies, value.default_currency)) return false;
  if (!Object.entries(value.currencies).every(([code, currency]) =>
    /^[A-Z]{3}$/.test(code) && record(currency) && typeof currency.symbol === 'string'
    && positive(currency.minimum_amount) && Array.isArray(currency.suggested_amounts) && currency.suggested_amounts.every(positive))) return false;
  if (!options(value.frequencies) || !value.frequencies.some((option) => option.key === value.default_frequency)) return false;
  if (!options(value.purposes) || !value.purposes.some((option) => option.key === value.default_purpose)) return false;
  if (!Array.isArray(value.payment_providers) || !value.payment_providers.every((provider) =>
    record(provider) && ['key', 'name', 'method', 'category'].every((key) => typeof provider[key] === 'string')
    && strings(provider.currencies) && (provider.country_codes === undefined || strings(provider.country_codes))
    && (provider.country_currency_map == null || (record(provider.country_currency_map) && Object.values(provider.country_currency_map).every((code) => typeof code === 'string'))))) return false;
  if (value.detected_country !== undefined && (!record(value.detected_country)
    || (value.detected_country.country != null && typeof value.detected_country.country !== 'string'))) return false;
  return true;
}
