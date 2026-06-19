import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe2 } from 'lucide-react';
import { cn } from './cn';
import { isLocale, Locale } from '../../lib/i18n';
import { publicPages } from '../../content/publicPages';

interface LocaleSelectorProps {
  locale: Locale;
  currentPath?: string;
  theme?: 'light' | 'dark';
}

export function LocaleSelector({ locale, currentPath, theme = 'light' }: LocaleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' }>({
    vertical: 'bottom',
    horizontal: 'right',
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // If currentPath is not provided, use window location
  const path = currentPath ?? (typeof window !== 'undefined' ? window.location.pathname : '');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    const handleScrollOrResize = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 110;
        const dropdownWidth = 192;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const vertical = spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

        const goesOffLeft = rect.right - dropdownWidth < 0;
        const horizontal = goesOffLeft ? 'left' : 'right';

        setPosition({ vertical, horizontal });
      }
    };

    if (isOpen) {
      handleScrollOrResize(); // initial calculation
      window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
      window.addEventListener('resize', handleScrollOrResize, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleSelect = (selectedLocale: Locale) => {
    if (selectedLocale !== locale) {
      window.location.href = getLocalizedHref(path, locale, selectedLocale);
    }
    setIsOpen(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border pl-3 pr-8 text-xs font-black transition",
          isDark
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur"
            : "border-ink-100 bg-white text-ink-700 hover:border-foundation-100 hover:bg-foundation-50"
        )}
        aria-label="Language selector"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe2 className={cn("h-4 w-4", isDark ? "text-foundation-100" : "text-foundation-600")} aria-hidden="true" />
        <span className="uppercase">{locale}</span>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-2.5 h-4 w-4 transition-transform duration-200",
            isDark ? "text-white/70" : "text-ink-500"
          )}
          aria-hidden="true"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <div
        ref={dropdownRef}
        className={cn(
          'absolute z-50 w-48 overflow-hidden rounded-md border shadow-lg transition-all duration-200',
          position.vertical === 'bottom' ? 'top-full mt-1 origin-top' : 'bottom-full mb-1 origin-bottom',
          position.horizontal === 'right' ? 'right-0' : 'left-0',
          isDark ? 'border-white/20 bg-white/10 backdrop-blur-md' : 'border-ink-100 bg-white',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
        role="menu"
        aria-orientation="vertical"
      >
        <div className="py-1">
          <button
            type="button"
            role="menuitem"
            className={cn(
              'focus-ring w-full px-4 py-3 text-left transition-colors duration-200',
              isDark
                ? (locale === 'en' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10')
                : (locale === 'en' ? 'bg-foundation-50 text-foundation-900' : 'text-ink-700 hover:bg-foundation-50')
            )}
            onClick={() => handleSelect('en')}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-black",
                isDark ? "bg-white/20 text-white" : "bg-foundation-600 text-white"
              )}>EN</div>
              <div className="flex flex-col">
                <span className={cn("text-sm font-black uppercase", isDark ? "text-white" : "text-ink-900")}>English</span>
                <span className={cn("text-xs font-normal", isDark ? "text-white/70" : "text-ink-500")}>English</span>
              </div>
            </div>
          </button>
          <div className={cn("my-1 border-t", isDark ? "border-white/10" : "border-ink-100")} />
          <button
            type="button"
            role="menuitem"
            className={cn(
              'focus-ring w-full px-4 py-3 text-left transition-colors duration-200',
              isDark
                ? (locale === 'fr' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10')
                : (locale === 'fr' ? 'bg-foundation-50 text-foundation-900' : 'text-ink-700 hover:bg-foundation-50')
            )}
            onClick={() => handleSelect('fr')}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-black",
                isDark ? "bg-white/20 text-white" : "bg-foundation-600 text-white"
              )}>FR</div>
              <div className="flex flex-col">
                <span className={cn("text-sm font-black uppercase", isDark ? "text-white" : "text-ink-900")}>Français</span>
                <span className={cn("text-xs font-normal", isDark ? "text-white/70" : "text-ink-500")}>French</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function getLocalizedHref(currentPath: string, currentLocale: Locale, targetLocale: Locale) {
  const [, maybeLocale, ...rest] = currentPath.split('/');

  if (!isLocale(maybeLocale)) {
    return `/${targetLocale}`;
  }

  const normalizedPublicPath = `/${rest.join('/')}`.replace(/\/$/, '') || '/';
  const page = publicPages.find((candidate) => candidate.path[currentLocale] === normalizedPublicPath);

  if (page) {
    return `/${targetLocale}${page.path[targetLocale]}`;
  }

  return `/${targetLocale}/${rest.join('/')}`.replace(/\/$/, '');
}
