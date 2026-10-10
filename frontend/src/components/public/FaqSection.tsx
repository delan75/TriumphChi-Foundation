import { useId, useState } from 'react';
import { HelpCircle, Minus, Plus } from 'lucide-react';
import { cn } from '../ui/cn';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  eyebrow: string;
  title: string;
  body?: string;
  items: FaqItem[];
  className?: string;
  surface?: 'white' | 'tinted' | 'dark';
}

export function FaqSection({ eyebrow, title, body, items, className, surface = 'white' }: FaqSectionProps) {
  const sectionId = useId();
  const [openIndex, setOpenIndex] = useState(0);
  const isDark = surface === 'dark';

  return (
    <section
      className={cn(
        surface === 'white' && 'bg-white',
        surface === 'tinted' && 'bg-foundation-50',
        surface === 'dark' && 'bg-foundation-900 text-white',
        className,
      )}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:py-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <span
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-md',
              isDark ? 'bg-white text-foundation-900' : 'bg-foundation-100 text-foundation-700',
            )}
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className={cn('mt-5 text-sm font-black uppercase', isDark ? 'text-foundation-100' : 'text-foundation-600')}>
            {eyebrow}
          </p>
          <h2 className={cn('mt-2 text-3xl font-black leading-tight sm:text-4xl', isDark ? 'text-white' : 'text-ink-900')}>
            {title}
          </h2>
          {body ? <p className={cn('mt-4 max-w-xl text-base leading-7', isDark ? 'text-foundation-50' : 'text-ink-500')}>{body}</p> : null}
        </div>

        <div className="grid gap-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `${sectionId}-faq-button-${index}`;
            const panelId = `${sectionId}-faq-panel-${index}`;

            return (
              <article
                key={item.question}
                className={cn(
                  'overflow-hidden rounded-md border shadow-xs transition duration-200',
                  isDark
                    ? 'border-white/10 bg-white/6 hover:bg-white/9'
                    : 'border-ink-100 bg-white hover:border-foundation-100 hover:shadow-md',
                )}
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className={cn(
                    'focus-ring flex min-h-16 w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5',
                    isDark ? 'text-white' : 'text-ink-900',
                  )}
                >
                  <span className="text-base font-black leading-6">{item.question}</span>
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-md transition',
                      isOpen
                        ? isDark
                          ? 'bg-white text-foundation-900'
                          : 'bg-foundation-600 text-white'
                        : isDark
                          ? 'bg-white/10 text-foundation-50'
                          : 'bg-foundation-50 text-foundation-700',
                    )}
                    aria-hidden="true"
                  >
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden">
                    <p
                      className={cn(
                        'border-t px-4 pb-5 pt-4 text-sm leading-7 sm:px-5',
                        isDark ? 'border-white/10 text-foundation-50' : 'border-ink-100 text-ink-600',
                      )}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
