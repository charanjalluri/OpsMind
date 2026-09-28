import React from 'react';
import { ArrowRight, Server, BrainCircuit, Cpu, Layers, CheckCircle2 } from 'lucide-react';

interface InvestigationContextTraceProps {
  service: string;
  evidenceCount: number;
  memoryBankId: string;
  modelName?: string;
  confidence: string;
}

export const InvestigationContextTrace: React.FC<InvestigationContextTraceProps> = ({
  service,
  evidenceCount,
  memoryBankId,
  modelName = 'Meta Muse Spark 1.3',
  confidence,
}) => {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#070a12] p-3 space-y-2.5 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
          EVIDENCE PIPELINE TRACE • BANK: {memoryBankId}
        </span>
        <span className="text-[10px] text-indigo-400 font-semibold">
          Hindsight → {modelName} • {confidence}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-1 text-[11px]">
        {/* Step 1: Telemetry */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 shrink-0">
          <Server className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-200">Incident [{service}]</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

        {/* Step 2: Hindsight Recall */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 shrink-0">
          <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Hindsight Recall ({evidenceCount} memories)
          </span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

        {/* Step 3: Evidence Assembled */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 shrink-0">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-200">Precedents &amp; Warnings</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

        {/* Step 4: Reasoning Model */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-sky-950/40 border border-sky-800/50 shrink-0">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-sky-200">{modelName}</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

        {/* Step 5: Grounded Recommendation */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Grounded Plan</span>
        </div>
      </div>
    </div>
  );
};
