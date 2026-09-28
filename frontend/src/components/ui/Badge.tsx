import React from 'react';

export type BadgeVariant = 'danger' | 'warning' | 'success' | 'accent' | 'memory' | 'neutral' | 'mono';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs';

  const variantClasses: Record<BadgeVariant, string> = {
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 font-mono font-medium',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-medium',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium',
    accent: 'bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-medium',
    memory: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 font-mono font-medium',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs',
    mono: 'bg-slate-900 text-slate-300 border border-slate-800 font-mono text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded tracking-wide uppercase ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
