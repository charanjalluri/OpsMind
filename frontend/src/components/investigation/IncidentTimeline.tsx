import React from 'react';
import type { TimelineEvent } from '../../types/incident';
import {
  Clock,
  AlertCircle,
  Activity,
  BrainCircuit,
  Search,
  CheckCircle2,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface IncidentTimelineProps {
  events: TimelineEvent[];
  isResolved?: boolean;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events, isResolved }) => {
  if (!events || events.length === 0) {
    return null;
  }

  const getEventIcon = (type?: string) => {
    switch (type) {
      case 'detection':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'investigation':
        return <Search className="w-3.5 h-3.5 text-sky-400" />;
      case 'memory':
        return <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />;
      case 'diagnosis':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      case 'action':
        return <RotateCcw className="w-3.5 h-3.5 text-blue-400" />;
      case 'recovery':
      case 'resolution':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'postmortem':
      case 'retention':
        return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            INCIDENT TIMELINE
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Telemetry sequence {isResolved ? '• Complete' : '• Active'}
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
        {events.map((evt, idx) => (
          <div key={idx} className="relative flex items-start gap-3 text-xs font-mono">
            {/* Timeline Node dot */}
            <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-[#070a12] border border-slate-700 flex items-center justify-center shrink-0">
              {getEventIcon(evt.type)}
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sky-400 font-semibold text-[11px]">{evt.time}</span>
                <span className="text-white font-medium">{evt.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
