import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-all duration-200 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variant === 'primary' &&
          'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
        variant === 'secondary' &&
          'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
        variant === 'ghost' &&
          'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
