import { cn } from '../ui/cn';
import { Locale } from '../../lib/i18n';

interface PaymentMethodsProps {
  locale: Locale;
  variant?: 'light' | 'dark';
}

const paymentMethods = [
  {
    key: 'momo',
    mark: 'MoMo',
    label: 'MoMo',
    detail: { en: 'Mobile money', fr: 'Mobile money' },
    className: 'bg-[#ffcc00] text-[#1f2937]',
  },
  {
    key: 'paypal',
    mark: 'PayPal',
    label: 'PayPal',
    detail: { en: 'Online wallet', fr: 'Portefeuille en ligne' },
    className: 'bg-[#003087] text-white',
  },
  {
    key: 'eft',
    mark: 'EFT',
    label: 'EFT',
    detail: { en: 'Bank transfer', fr: 'Virement bancaire' },
    className: 'bg-foundation-700 text-white',
  },
  {
    key: 'cards',
    mark: 'Cards',
    label: 'Cards',
    detail: { en: 'Online, credit, and debit', fr: 'En ligne, crédit et débit' },
    className: 'bg-ink-900 text-white',
  },
];

export function PaymentMethods({ locale, variant = 'light' }: PaymentMethodsProps) {
  const isDark = variant === 'dark';

  return (
    <div>
      <p className={cn('text-sm font-black uppercase', isDark ? 'text-foundation-100' : 'text-foundation-700')}>
        {locale === 'fr' ? 'Moyens de paiement' : 'Payment methods'}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {paymentMethods.map(({ key, mark, label, detail, className }) => (
          <div
            key={key}
            className={cn(
              'flex min-h-20 items-center gap-3 rounded-md border p-3 shadow-sm',
              isDark ? 'border-white/10 bg-white/5' : 'border-foundation-100 bg-white',
            )}
          >
            <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-md font-black shadow-sm', className)}>
              <span className="text-[0.65rem] leading-none tracking-normal">{mark}</span>
            </span>
            <span>
              <span className={cn('block text-base font-black', isDark ? 'text-white' : 'text-ink-900')}>{label}</span>
              <span className={cn('block text-sm leading-5', isDark ? 'text-foundation-100' : 'text-ink-500')}>
                {detail[locale]}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
