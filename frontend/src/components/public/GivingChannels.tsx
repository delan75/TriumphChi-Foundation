import { cn } from '../ui/cn';
import { Locale } from '../../lib/i18n';

interface GivingChannelsProps {
  locale: Locale;
  variant?: 'light' | 'dark';
}

const givingChannels = [
  { key: 'momo', label: 'MoMo', className: 'bg-[#ffcc00] text-[#1f2937]' },
  { key: 'paypal', label: 'PayPal', className: 'bg-[#003087] text-white' },
  { key: 'bank', label: 'EFT', className: 'bg-foundation-900 text-white' },
  { key: 'cards', label: 'Cards', className: 'bg-ink-900 text-white' },
];

export function GivingChannels({ locale, variant = 'light' }: GivingChannelsProps) {
  const isDark = variant === 'dark';

  return (
    <div aria-label={locale === 'fr' ? 'Canaux de don' : 'Giving channels'}>
      <p className={cn('text-xs font-black uppercase', isDark ? 'text-foundation-100' : 'text-foundation-700')}>
        {locale === 'fr' ? 'Canaux de don' : 'Giving channels'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {givingChannels.map((channel) => (
          <span
            key={channel.key}
            className={cn(
              'inline-flex min-h-9 items-center rounded-md px-3 text-xs font-black shadow-sm ring-1 ring-black/5',
              channel.className,
            )}
          >
            {channel.label}
          </span>
        ))}
      </div>
    </div>
  );
}
