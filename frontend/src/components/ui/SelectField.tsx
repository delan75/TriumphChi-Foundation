import React from 'react';
import { cn } from './cn';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, helpText, className, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    const errorId = `${selectId}-error`;
    const helpId = `${selectId}-help`;

    const describedBy = [error ? errorId : null, helpText ? helpId : null].filter(Boolean).join(' ') || undefined;

    return (
      <div>
        <label htmlFor={selectId} className="block text-sm font-bold text-ink-700">
          {label}
          {props.required && <span className="ml-1 text-support-red">*</span>}
        </label>
        <div className="relative mt-1">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'block min-h-12 w-full appearance-none rounded-md border bg-white px-3 py-2.5 text-base text-ink-900 shadow-sm transition duration-200 focus:outline-none sm:text-sm pr-10',
              'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")] bg-[position:right_0.5rem_center] bg-no-repeat',
              error
                ? 'border-support-red focus:border-support-red focus:ring-2 focus:ring-support-red/20'
                : 'border-ink-200 focus:border-foundation-500 focus:ring-2 focus:ring-foundation-500/20',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...props}
          >
            {children}
          </select>
        </div>
        {helpText && !error && (
          <p id={helpId} className="mt-2 text-xs leading-5 text-ink-500">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-2 flex items-center gap-1.5 text-sm text-support-red">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
