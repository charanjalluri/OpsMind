import React from 'react';
import type { SeedEngineeringMemory } from '../../types/memory';
import { Badge } from '../ui/Badge';
import {
  AlertTriangle,
  Lightbulb,
  Tag,
} from 'lucide-react';

interface MemoryCardProps {
  memory: SeedEngineeringMemory;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
  const isDecision = memory.memory_type === 'decision';

  return (
    <div
      className={`rounded-lg border p-5 space-y-4 transition-colors ${
        isDecision
          ? 'border-indigo-900/60 bg-[#0b0f19] hover:border-indigo-800/80'
          : 'border-slate-800 bg-[#0b0f19] hover:border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={isDecision ? 'memory' : 'accent'} size="sm">
              {isDecision ? 'ENGINEERING DECISION' : 'INCIDENT POSTMORTEM'}
            </Badge>
            <span className="text-sm font-mono font-bold text-white">
              {memory.incident_id || 'MEM-RECORD'}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400">
              {memory.service}
            </span>
            {memory.deployment_version && (
              <span className="text-xs font-mono text-indigo-300">
                [{memory.deployment_version}]
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-100 mt-1">
            {memory.title || memory.incident_id}
          </h3>
        </div>

        <div className="text-right text-[11px] font-mono text-slate-400">
          <span>Env: {memory.environment}</span>
          {memory.duration && <span className="ml-2">• {memory.duration}</span>}
        </div>
      </div>

      {/* Root cause / Decision reason */}
      {memory.confirmed_root_cause && (
        <div className="text-xs space-y-1">
          <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            CONFIRMED ROOT CAUSE:
          </span>
          <p className="text-slate-200 bg-[#070a12] p-2.5 rounded border border-slate-800/80 text-xs leading-relaxed">
            {memory.confirmed_root_cause}
          </p>
        </div>
      )}

      {/* Decisions or Resolution */}
      {memory.engineering_decisions && memory.engineering_decisions.length > 0 && (
        <div className="text-xs space-y-1">
          <span className="font-mono text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">
            ESTABLISHED TEAM POLICY:
          </span>
          <div className="space-y-1 bg-indigo-950/20 p-2.5 rounded border border-indigo-900/40">
            {memory.engineering_decisions.map((dec, i) => (
              <p key={i} className="text-indigo-200 font-medium leading-relaxed">
                • {dec}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms */}
      {memory.symptoms && memory.symptoms.length > 0 && (
        <div className="text-xs space-y-1">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
            SYMPTOMS:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {memory.symptoms.map((sym, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
              >
                {sym}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resolution & Outcome */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded border border-slate-800 bg-[#070a12] p-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            RESOLUTION:
          </span>
          <p className="mt-1 text-slate-200 text-xs leading-snug">{memory.resolution}</p>
        </div>
        <div className="rounded border border-slate-800 bg-[#070a12] p-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            OUTCOME:
          </span>
          <p className="mt-1 text-emerald-400 text-xs leading-snug font-medium">
            {memory.outcome}
          </p>
        </div>
      </div>

      {/* Warnings & Anti-patterns */}
      {memory.warnings && memory.warnings.length > 0 && (
        <div className="rounded border border-rose-900/40 bg-rose-950/20 p-3 space-y-1">
          <span className="text-[10px] font-mono font-bold text-rose-400 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            CRITICAL WARNING / ANTI-PATTERN
          </span>
          {memory.warnings.map((w, i) => (
            <p key={i} className="text-xs text-rose-200/90 leading-relaxed font-sans">
              • {w}
            </p>
          ))}
        </div>
      )}

      {/* Lessons learned */}
      {memory.lessons_learned && memory.lessons_learned.length > 0 && (
        <div className="border-t border-slate-800/80 pt-2.5 text-xs text-slate-400 flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-mono text-[10px] text-amber-400 font-semibold uppercase">
              LESSON LEARNED:
            </span>
            <p className="text-slate-300 mt-0.5 italic text-xs leading-relaxed font-sans">
              "{memory.lessons_learned.join(' ')}"
            </p>
          </div>
        </div>
      )}

      {/* Tags footer */}
      {memory.tags && memory.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <Tag className="w-3 h-3 text-slate-500" />
          {memory.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
