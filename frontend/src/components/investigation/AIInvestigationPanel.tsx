import React from 'react';
import type { InvestigationResult } from '../../types/investigation';
import { Badge } from '../ui/Badge';
import {
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Database,
  Cpu,
  Loader2,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';

interface AIInvestigationPanelProps {
  result: InvestigationResult | null;
  isLoading: boolean;
  onExploreMemory?: () => void;
}

export const AIInvestigationPanel: React.FC<AIInvestigationPanelProps> = ({
  result,
  isLoading,
  onExploreMemory,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-8 text-center space-y-4">
        <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
            Synthesizing Telemetry &amp; Precedents
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Meta Muse Spark 1.3 is evaluating active symptoms against recalled Hindsight experience units...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-slate-800 bg-[#0a0d17] p-12 text-center space-y-3">
        <Cpu className="w-9 h-9 text-slate-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-300">Ready for SRE Investigation</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Click <span className="text-sky-400 font-mono">"Run SRE Investigation"</span> to analyze this failure.
          OpsMind cross-references failure modes against historical engineering postmortems in
          Hindsight before generating safe remediation steps.
        </p>
      </div>
    );
  }

  const isHighConfidence = result.confidence.toLowerCase().includes('high');
  const isLowConfidence = result.confidence.toLowerCase().includes('low');

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-5 space-y-5">
      {/* Header with Meta Muse Spark and Confidence */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Investigation Telemetry &amp; Remediation
            </span>
            <p className="text-[11px] font-mono text-slate-400">
              Engine: Meta Muse Spark 1.3 • Hindsight Cloud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {result.memory_used ? (
            <Badge variant="memory" size="sm">
              <Database className="w-3 h-3" />
              MEMORY GROUNDED
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              NO PRECEDENT MATCH
            </Badge>
          )}

          <Badge
            variant={isHighConfidence ? 'success' : isLowConfidence ? 'danger' : 'warning'}
            size="sm"
          >
            {result.confidence}
          </Badge>
        </div>
      </div>

      {/* Incident Summary */}
      <div className="rounded border border-slate-800 bg-[#070a12] p-3 text-xs leading-relaxed space-y-1">
        <span className="font-mono text-slate-400 uppercase text-[10px] tracking-wider block">
          Incident Synthesis:
        </span>
        <p className="text-slate-200 leading-relaxed">{result.incident_summary}</p>
      </div>

      {/* CRITICAL WARNINGS (Elevated Prominently without radioactive glow) */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="rounded-lg border border-rose-900/60 bg-rose-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Operational Warnings &amp; Anti-Patterns</span>
          </div>
          <div className="space-y-1.5 pl-6">
            {result.warnings.map((warn, idx) => (
              <p key={idx} className="text-xs text-rose-200/90 leading-relaxed font-sans">
                • {warn}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Likely Root Causes */}
      <div className="space-y-2.5">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          Likely Root Causes
        </span>
        <div className="space-y-2">
          {result.possible_root_causes.map((cause, idx) => (
            <div
              key={idx}
              className="rounded border border-slate-800 bg-[#070a12] p-3 flex items-start gap-3"
            >
              <span className="text-xs font-mono font-bold text-sky-400 mt-0.5 shrink-0">
                {idx + 1}.
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{cause}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="space-y-2.5">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Recommended Remediation Plan
        </span>
        <div className="space-y-2">
          {result.recommended_steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded border border-slate-800 bg-[#0e1320] p-3 flex items-start gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-200 leading-relaxed">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Grounding Status Footer */}
      <div className="p-3 rounded border border-indigo-950/60 bg-indigo-950/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-indigo-300">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            {result.memory_used
              ? `Grounded with ${result.raw_evidence_count} recalled Hindsight experience units.`
              : 'No prior incident memory found in Hindsight bank.'}
          </span>
        </div>
        {onExploreMemory && (
          <button
            onClick={onExploreMemory}
            className="text-indigo-400 hover:text-indigo-200 text-right underline underline-offset-2 shrink-0 flex items-center gap-1 text-[11px]"
          >
            <span>Inspect in Memory Explorer</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
