import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'memory' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3.5 py-1.5 text-xs font-medium',
    lg: 'px-4 py-2 text-sm font-semibold',
  }[size];

  const variantClasses = {
    primary:
      'bg-sky-600 hover:bg-sky-500 text-white border border-sky-500/40 shadow-sm font-medium active:translate-y-0.5',
    secondary:
      'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 active:translate-y-0.5',
    memory:
      'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/40 active:translate-y-0.5',
    danger:
      'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 active:translate-y-0.5',
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
