import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from './cn';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, helpText, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || props.name;
    const errorId = `${inputId}-error`;

    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-700">
          {label}
        </label>
        <div className="relative mt-1">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'block w-full rounded-md border px-3 py-2.5 pr-10 text-sm shadow-xs transition duration-200 focus:outline-hidden',
              error
                ? 'border-support-red focus:border-support-red focus:ring-support-red/20'
                : 'border-ink-200 focus:border-foundation-500 focus:ring-2 focus:ring-foundation-500/20',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 focus:outline-hidden"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {error && (
          <p id={errorId} className="mt-2 text-sm text-support-red">
            {error}
          </p>
        )}
        {helpText && !error && <p className="mt-1 text-xs text-ink-400">{helpText}</p>}
      </div>
    );
  },
);

PasswordField.displayName = 'PasswordField';
