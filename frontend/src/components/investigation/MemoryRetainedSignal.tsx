import React from 'react';
import { CheckCircle2, Archive, ExternalLink, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface MemoryRetainedSignalProps {
  incidentId: string;
  service: string;
  bankId: string;
  onDismiss: () => void;
  onExploreMemory?: () => void;
}

export const MemoryRetainedSignal: React.FC<MemoryRetainedSignalProps> = ({
  incidentId,
  service,
  bankId,
  onDismiss,
  onExploreMemory,
}) => {
  return (
    <div className="relative rounded-lg border border-emerald-900/60 bg-[#091517] p-5 animate-in fade-in slide-in-from-top-3 duration-200">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              POSTMORTEM COMMITTED • HINDSIGHT ENGINE
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Archive className="w-4 h-4 text-emerald-400" />
              Retained Experience: {incidentId}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Resolution postmortem for <strong className="text-white font-mono">{service}</strong> is now
              permanently indexed in Hindsight bank <strong className="text-emerald-300 font-mono">{bankId}</strong>.
              Future incidents exhibiting matching symptoms will automatically retrieve these lessons.
            </p>
          </div>

          {/* Substantive Checklist */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Incident Record Closed</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Postmortem Retained</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Knowledge Base Updated</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onExploreMemory && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onExploreMemory}
              leftIcon={<ExternalLink className="w-3.5 h-3.5 text-emerald-400" />}
              className="border-emerald-800/60 text-emerald-300 hover:text-white bg-emerald-950/30"
            >
              Inspect in Memory Explorer
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
};
