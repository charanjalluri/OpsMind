import React from 'react';
import { AlertCircle, Flame, History, BrainCircuit } from 'lucide-react';

interface StatsOverviewProps {
  activeCount: number;
  criticalCount: number;
  historicalCount: number;
  memoriesCount: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  activeCount,
  criticalCount,
  historicalCount,
  memoriesCount,
}) => {
  const stats = [
    {
      label: 'ACTIVE INCIDENTS',
      value: activeCount,
      icon: AlertCircle,
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      caption: 'Real-time production triage',
    },
    {
      label: 'CRITICAL SEV-1',
      value: criticalCount,
      icon: Flame,
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      caption: 'Immediate triage required',
    },
    {
      label: 'HISTORICAL POSTMORTEMS',
      value: historicalCount,
      icon: History,
      textColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      caption: 'Resolved incidents indexed',
    },
    {
      label: 'ORGANIZATIONAL MEMORIES',
      value: memoriesCount,
      icon: BrainCircuit,
      textColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      caption: 'Hindsight persistent units',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="rounded-lg border border-slate-800 bg-[#0b0f19] p-4 transition-colors hover:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400 tracking-wider">
                {s.label}
              </span>
              <div className={`p-1.5 rounded ${s.bgColor} border ${s.borderColor}`}>
                <Icon className={`w-4 h-4 ${s.textColor}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-mono font-bold tracking-tight ${s.textColor}`}>
                {s.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{s.caption}</p>
          </div>
        );
      })}
    </div>
  );
};
