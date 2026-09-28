import React, { useState, useEffect } from 'react';
import type { ActiveIncident, IncidentResolutionRequest, IncidentResolutionResponse } from '../../types/incident';
import { resolveIncident } from '../../services/incidents';
import { Button } from '../ui/Button';
import {
  X,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileText,
} from 'lucide-react';

interface ResolutionPostmortemModalProps {
  incident: ActiveIncident;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (response: IncidentResolutionResponse) => void;
}

export const ResolutionPostmortemModal: React.FC<ResolutionPostmortemModalProps> = ({
  incident,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rootCause, setRootCause] = useState(incident.root_cause || '');
  const [resolution, setResolution] = useState(incident.resolution || '');
  const [outcome, setOutcome] = useState(incident.outcome || 'Successful - HTTP 502 errors returned to baseline.');
  const [lessonsLearned, setLessonsLearned] = useState(
    'For payment-api 502 errors after deployment, compare connection pool configuration before restarting the service.'
  );
  const [successfulActions, setSuccessfulActions] = useState(
    'Rollback deployment v2.9.1 to v2.9.0\nCompare connection pool settings in Helm values'
  );
  const [failedActions, setFailedActions] = useState(
    'Emergency service restart (avoided - known to cause duplicate payment transactions)'
  );
  const [warnings, setWarnings] = useState(
    'Do not automatically restart payment-api because a previous restart caused duplicate payment processing.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePreFillSuggested = () => {
    setRootCause('Database connection pool configuration regression introduced in v2.9.1: pool_max was inadvertently reduced from 50 to 5, starving worker threads during standard traffic.');
    setResolution('Rolled back payment-api release v2.9.1 and restored the previous connection pool configuration (pool_max=50).');
    setOutcome('Successful - HTTP 502 error rate dropped to 0.0% within 90 seconds of rollback completion.');
    setLessonsLearned('For payment-api 502 errors after deployment, compare database connection pool configuration before restarting the service.');
    setSuccessfulActions('Rollback deployment v2.9.1 to v2.9.0\nCompare connection pool settings in Helm values manifest\nMonitor database connection count');
    setFailedActions('Emergency service restart (causes in-flight 2PC failure and duplicate billing)');
    setWarnings('Do not automatically restart payment-api because a previous restart caused duplicate payment processing.');
    setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!rootCause.trim()) {
      setError('Root Cause is required. Please explain what caused this incident.');
      return;
    }
    if (!resolution.trim()) {
      setError('Resolution is required. Please describe the actions that resolved the incident.');
      return;
    }
    if (!outcome.trim()) {
      setError('Outcome is required. Please specify the final outcome.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const parseList = (text: string) =>
      text
        .split('\n')
        .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);

    const payload: IncidentResolutionRequest = {
      incident_id: incident.incident_id,
      service: incident.service,
      environment: incident.environment,
      severity: incident.severity,
      deployment_version: incident.deployment_version,
      symptoms: incident.symptoms,
      root_cause: rootCause.trim(),
      resolution: resolution.trim(),
      outcome: outcome.trim(),
      lessons_learned: lessonsLearned.trim(),
      successful_actions: parseList(successfulActions),
      failed_actions: parseList(failedActions),
      warnings: parseList(warnings),
    };

    try {
      const response = await resolveIncident(incident.incident_id, payload);
      setIsSubmitting(false);
      onSuccess(response);
    } catch (err: any) {
      setIsSubmitting(false);
      const detail = err?.message || err?.detail || 'Hindsight retain request failed.';
      if (detail.includes('unavailable') || detail.includes('503')) {
        setError(`Memory service unavailable. The incident has NOT been marked as learned. (${detail})`);
      } else {
        setError(`Failed to retain experience in Hindsight: ${detail}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-700 bg-[#0c101c] shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-[#0f1422]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 uppercase tracking-wide">
                Resolve Incident &amp; Retain Postmortem
              </h2>
              <p className="text-xs text-slate-400">
                Index operational postmortem and lessons permanently into Hindsight memory bank
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 font-mono text-xs">
          {/* Read-only Incident Info Banner */}
          <div className="rounded-lg border border-slate-800 bg-[#070a12] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                INCIDENT TELEMETRY (READ-ONLY)
              </span>
              <button
                type="button"
                onClick={handlePreFillSuggested}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium underline underline-offset-2"
              >
                <FileText className="w-3 h-3" />
                Pre-fill Suggested Postmortem
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block">INCIDENT ID</span>
                <span className="text-sky-400 font-bold">{incident.incident_id}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block">SERVICE</span>
                <span className="text-indigo-300 font-semibold">{incident.service}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block">ENVIRONMENT</span>
                <span className="text-slate-200">{incident.environment}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block">SEVERITY</span>
                <span className="text-rose-400 font-bold">{incident.severity}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block">DEPLOYMENT</span>
                <span className="text-slate-300">{incident.deployment_version || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Validation Error Banner */}
          {error && (
            <div className="p-3.5 rounded-lg border border-rose-500/50 bg-rose-950/30 text-rose-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-300">Submission Blocked</p>
                <p className="mt-0.5 text-[11px] leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Field 1: Root Cause */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>What was the root cause? <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-slate-500 font-normal">Required</span>
            </label>
            <textarea
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="e.g. Database connection pool configuration regression introduced in v2.9.1..."
              className="w-full rounded-md border border-slate-700 bg-slate-900/90 p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />
          </div>

          {/* Field 2: Resolution */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>What resolved the incident? <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-slate-500 font-normal">Required</span>
            </label>
            <textarea
              rows={2}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="e.g. Rolled back v2.9.1 and restored the previous connection pool configuration..."
              className="w-full rounded-md border border-slate-700 bg-slate-900/90 p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />
          </div>

          {/* Field 3: Final Outcome */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>What was the final outcome? <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-slate-500 font-normal">Required</span>
            </label>
            <input
              type="text"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g. HTTP 502 errors returned to baseline."
              className="w-full rounded-md border border-slate-700 bg-slate-900/90 p-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Field 4: Lessons Learned */}
          <div className="space-y-1.5">
            <label className="block text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
              What did we learn? (Lessons Learned)
            </label>
            <textarea
              rows={2}
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              placeholder="e.g. For payment-api 502 errors after deployment, compare connection pool configuration before restarting the service."
              className="w-full rounded-md border border-slate-700 bg-slate-900/90 p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />
          </div>

          {/* Dual Column: Successful vs Failed Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-emerald-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Successful Actions (1 per line)
              </label>
              <textarea
                rows={3}
                value={successfulActions}
                onChange={(e) => setSuccessfulActions(e.target.value)}
                placeholder="Rollback deployment&#10;Compare connection pool settings"
                className="w-full rounded-md border border-slate-700 bg-slate-900/90 p-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-[11px] leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-rose-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Failed / Risky Actions (1 per line)
              </label>
              <textarea
                rows={3}
                value={failedActions}
                onChange={(e) => setFailedActions(e.target.value)}
                placeholder="Emergency service restart&#10;In-place config patching"
                className="w-full rounded-md border border-slate-700 bg-slate-900/90 p-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 font-mono text-[11px] leading-relaxed"
              />
            </div>
          </div>

          {/* Field 7: Operational Warnings */}
          <div className="space-y-1.5">
            <label className="block text-amber-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              What should engineers avoid doing? (Operational Warning)
            </label>
            <textarea
              rows={2}
              value={warnings}
              onChange={(e) => setWarnings(e.target.value)}
              placeholder="e.g. Do not automatically restart payment-api because a previous restart caused duplicate payment processing."
              className="w-full rounded-md border border-slate-700 bg-slate-900/90 p-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-sans text-xs leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 uppercase tracking-wider"
              leftIcon={<BrainCircuit className="w-4 h-4 text-indigo-200" />}
            >
              {isSubmitting ? 'Retaining to Hindsight...' : 'Retain Postmortem'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
