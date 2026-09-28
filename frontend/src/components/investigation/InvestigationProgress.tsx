import React from 'react';
import { CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';

interface InvestigationProgressProps {
  step: number; // 1 to 5
  evidenceCount?: number;
}

export const InvestigationProgress: React.FC<InvestigationProgressProps> = ({
  step,
  evidenceCount = 0,
}) => {
  const steps = [
    {
      id: 1,
      title: 'Incident normalized',
      desc: 'Telemetry extracted & structured query constructed',
    },
    {
      id: 2,
      title: 'Searching Hindsight persistent memory',
      desc: 'Querying organizational memory bank (opsmind-engineering)',
    },
    {
      id: 3,
      title:
        evidenceCount > 0
          ? `Retrieved ${evidenceCount} historical engineering experiences`
          : 'Retrieved relevant experiences from Hindsight',
      desc: 'Extracted postmortems, root causes, decisions & warnings',
    },
    {
      id: 4,
      title: 'Reasoning with Meta Muse Spark 1.3',
      desc: 'Grounding recommendations strictly in empirical evidence',
    },
    {
      id: 5,
      title: 'Generating structured SRE action plan',
      desc: 'Synthesizing root causes, safe steps & anti-pattern cautions',
    },
  ];

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
          OpsMind SRE Investigation In Progress
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((s) => {
          const isDone = step > s.id;
          const isCurrent = step === s.id;
          const isUpcoming = step < s.id;

          return (
            <div key={s.id} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isCurrent && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                {isUpcoming && <CircleDashed className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <p
                  className={`text-xs font-mono font-medium ${
                    isDone
                      ? 'text-emerald-300'
                      : isCurrent
                      ? 'text-white font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </p>
                <p className="text-[11px] text-slate-400">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
