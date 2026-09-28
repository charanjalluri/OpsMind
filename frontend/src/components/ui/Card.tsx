import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  highlight?: 'memory' | 'danger' | 'warning' | 'accent' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  highlight = 'none',
}) => {
  const highlightClasses = {
    none: 'border-slate-800 bg-[#0b0f19]',
    memory: 'border-indigo-900/60 bg-[#0c1020]',
    danger: 'border-rose-900/60 bg-rose-950/20',
    warning: 'border-amber-900/60 bg-amber-950/20',
    accent: 'border-sky-900/60 bg-sky-950/20',
  }[highlight];

  const hoverClasses = hoverable
    ? 'cursor-pointer transition-colors hover:border-slate-700 hover:bg-[#111827]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border p-4 text-slate-100 ${highlightClasses} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};
