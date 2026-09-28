import React from 'react';
import { Database, Clock, ArrowRight } from 'lucide-react';

interface MemorySignalCardProps {
  relevantExperiences: number;
  previousIncidents: number;
  engineeringDecisions: number;
  lessonsLearned: number;
  lastRetained: string;
  bankId: string;
  onExploreMemory?: () => void;
}

export const MemorySignalCard: React.FC<MemorySignalCardProps> = ({
  relevantExperiences = 7,
  previousIncidents = 3,
  engineeringDecisions = 2,
  lessonsLearned = 2,
  lastRetained = '4 minutes ago',
  bankId = 'opsmind-engineering',
  onExploreMemory,
}) => {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Persistent Memory Active
              </span>
              <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                BANK: {bankId}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
              Hindsight grounded with {relevantExperiences} organizational engineering experiences
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Last memory retained:</span>
            <span className="text-slate-200 font-medium">{lastRetained}</span>
          </div>
          {onExploreMemory && (
            <button
              onClick={onExploreMemory}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Explore Bank</span>
              <ArrowRight className="w-3 h-3 text-indigo-400" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="rounded border border-slate-800 bg-[#070a12] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">HISTORICAL INCIDENTS</span>
            <span className="text-sm font-mono font-bold text-white">{previousIncidents}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Matching payment-api connection pool regressions &amp; environment diffs (INC-1042, INC-1067).
          </p>
        </div>

        <div className="rounded border border-slate-800 bg-[#070a12] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">ENGINEERING DECISIONS</span>
            <span className="text-sm font-mono font-bold text-white">{engineeringDecisions}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Strict team policy: avoid automatic/blind restarts of payment-api during incidents.
          </p>
        </div>

        <div className="rounded border border-slate-800 bg-[#070a12] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">LESSONS &amp; WARNINGS</span>
            <span className="text-sm font-mono font-bold text-white">{lessonsLearned}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Learned from INC-1091 duplicate charge disaster: verify queue draining first.
          </p>
        </div>
      </div>
    </div>
  );
};
