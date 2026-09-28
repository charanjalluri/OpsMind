import React from 'react';

interface StatusIndicatorProps {
  status: 'active' | 'warning' | 'danger' | 'memory' | 'offline';
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  pulse = false,
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  const colorMap = {
    active: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-500',
    memory: 'bg-purple-400',
    offline: 'bg-slate-500',
  };

  const pingColorMap = {
    active: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-500',
    memory: 'bg-purple-400',
    offline: 'bg-slate-500',
  };

  return (
    <span className="relative flex items-center justify-center">
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${pingColorMap[status]}`}
        />
      )}
      <span className={`relative inline-flex rounded-full ${sizeClass} ${colorMap[status]}`} />
    </span>
  );
};
