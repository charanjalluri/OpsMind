import React from 'react';
import type { HistoricalEvidenceItem } from '../../types/investigation';
import { Badge } from '../ui/Badge';
import { Archive, ExternalLink, CheckCircle2, AlertOctagon, Loader2 } from 'lucide-react';

interface HistoricalMemoryPanelProps {
  evidence: HistoricalEvidenceItem[];
  rawEvidenceCount?: number;
  memoryBankId?: string | null;
  onExploreMemoryId?: (id: string) => void;
  isLoading?: boolean;
}

export const HistoricalMemoryPanel: React.FC<HistoricalMemoryPanelProps> = ({
  evidence,
  memoryBankId = 'opsmind-engineering',
  onExploreMemoryId,
  isLoading = false,
}) => {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b0f19] overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f1524] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Historical Precedents &amp; Runbooks
          </h3>
        </div>
        <Badge variant="memory" size="sm">
          {evidence.length} Matched
        </Badge>
      </div>

      {/* Telemetry Source Banner */}
      <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          Retrieved from bank <code className="text-slate-300 font-mono font-medium">{memoryBankId || 'opsmind-engineering'}</code>
        </span>
        <span className="font-mono text-[10px] text-slate-400">Verified Evidence</span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Recalling precedents from Hindsight memory bank...</p>
        </div>
      ) : evidence.length === 0 ? (
        <div className="py-10 px-4 text-center space-y-2">
          <Archive className="w-7 h-7 text-slate-400 mx-auto" />
          <p className="text-xs font-medium text-slate-300">No Historical Precedents Found</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
            Hindsight memory contains no prior postmortem matching this symptom pattern. Investigation will proceed without historical bias.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {evidence.map((item, idx) => {
            const isDecision =
              item.incident_id?.toLowerCase().includes('decision') ||
              item.summary.toLowerCase().includes('decision') ||
              item.summary.toLowerCase().includes('policy');

            return (
              <div
                key={idx}
                className="p-4 space-y-3 hover:bg-slate-900/30 transition-colors"
              >
                {/* Precedent Identifier & Service */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase font-semibold">
                        {isDecision ? 'Policy' : 'Postmortem'}
                      </span>
                      {item.incident_id && (
                        <span className="text-xs font-mono font-bold text-slate-100">
                          {item.incident_id}
                        </span>
                      )}
                      {item.service && (
                        <span className="text-[11px] font-mono text-slate-400">
                          [{item.service}]
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-200 leading-snug">
                      {item.summary}
                    </p>
                  </div>

                  {item.incident_id && onExploreMemoryId && (
                    <button
                      onClick={() => onExploreMemoryId(item.incident_id!)}
                      title="Inspect memory record in Memory Explorer"
                      className="text-slate-400 hover:text-indigo-300 p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Relevance to Current Incident */}
                {item.relevance_to_current && (
                  <div className="rounded bg-slate-900/60 p-2.5 border border-slate-800/80 text-xs">
                    <span className="font-mono text-sky-400 font-semibold uppercase text-[10px] block mb-0.5">
                      Relevance to Current Incident:
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {item.relevance_to_current}
                    </p>
                  </div>
                )}

                {/* Past Root Cause */}
                {item.past_root_cause && (
                  <div className="text-xs text-slate-300">
                    <span className="font-mono text-slate-400 text-[10px] uppercase font-semibold block mb-0.5">
                      Historical Root Cause:
                    </span>
                    <div className="rounded bg-slate-900/40 px-2.5 py-1.5 border border-slate-800/70 font-mono text-[11px] text-slate-200 leading-relaxed">
                      {item.past_root_cause}
                    </div>
                  </div>
                )}

                {/* Proven Remediation (What Worked) */}
                {item.effective_actions && item.effective_actions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Proven Remediation:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300 pl-1">
                      {item.effective_actions.map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-emerald-400 font-bold mt-0.5">+</span>
                          <span className="text-slate-200">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dangerous Actions (Anti-Patterns / Previous Disasters) */}
                {item.dangerous_actions && item.dangerous_actions.length > 0 && (
                  <div className="rounded bg-rose-500/10 border border-rose-500/25 p-2.5 space-y-1">
                    <span className="text-[10px] font-mono text-rose-400 font-semibold uppercase flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      Caution / Dangerous Action:
                    </span>
                    <ul className="space-y-1 text-xs text-rose-200/90 pl-1">
                      {item.dangerous_actions.map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-rose-400 font-bold mt-0.5">!</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lessons Learned */}
                {item.lessons_learned && item.lessons_learned.length > 0 && (
                  <div className="text-[11px] text-slate-400 pt-1">
                    <span className="font-mono text-slate-400 text-[10px] uppercase font-semibold mr-1.5">
                      Lesson:
                    </span>
                    <span className="text-slate-300">
                      "{item.lessons_learned.join(' ')}"
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
