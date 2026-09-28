import React, { useState } from 'react';
import type { ActiveIncident } from '../../types/incident';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Crosshair, Tag, GitCommit, Clock, Server, Plus, X, CheckCircle2 } from 'lucide-react';

interface CurrentIncidentPanelProps {
  incident: ActiveIncident;
  isInvestigating: boolean;
  onInvestigate: (incident: ActiveIncident) => void;
  onUpdateSymptoms?: (newSymptoms: string[]) => void;
  onResolve?: () => void;
}

export const CurrentIncidentPanel: React.FC<CurrentIncidentPanelProps> = ({
  incident,
  isInvestigating,
  onInvestigate,
  onUpdateSymptoms,
  onResolve,
}) => {
  const [symptoms, setSymptoms] = useState<string[]>(incident.symptoms);
  const [newSymptomText, setNewSymptomText] = useState('');
  const [isEditingSymptoms, setIsEditingSymptoms] = useState(false);

  const handleAddSymptom = () => {
    if (newSymptomText.trim()) {
      const updated = [...symptoms, newSymptomText.trim()];
      setSymptoms(updated);
      setNewSymptomText('');
      if (onUpdateSymptoms) onUpdateSymptoms(updated);
    }
  };

  const handleRemoveSymptom = (index: number) => {
    const updated = symptoms.filter((_, i) => i !== index);
    setSymptoms(updated);
    if (onUpdateSymptoms) onUpdateSymptoms(updated);
  };

  const currentPayload: ActiveIncident = {
    ...incident,
    symptoms,
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            CURRENT INCIDENT
          </span>
          <span className="text-xs font-mono text-sky-400 font-bold">
            {incident.incident_id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {incident.severity === 'SEV-1' ? (
            <Badge variant="danger">SEV-1 CRITICAL</Badge>
          ) : (
            <Badge variant="warning">{incident.severity}</Badge>
          )}
        </div>
      </div>

      {/* Incident Title */}
      <div>
        <h2 className="text-base font-semibold text-white leading-snug">
          {incident.title}
        </h2>
        {incident.description && (
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {incident.description}
          </p>
        )}
      </div>

      {/* Primary Key-Value Telemetry */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="rounded border border-slate-800 bg-[#070a12] p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px]">SERVICE:</span>
          </div>
          <p className="mt-1 font-semibold text-sky-300 truncate">{incident.service}</p>
        </div>

        <div className="rounded border border-slate-800 bg-[#070a12] p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <GitCommit className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px]">DEPLOYMENT:</span>
          </div>
          <p className="mt-1 font-semibold text-indigo-300 truncate">
            {incident.deployment_version || 'None / N/A'}
          </p>
        </div>

        <div className="rounded border border-slate-800 bg-[#070a12] p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px]">ENVIRONMENT:</span>
          </div>
          <p className="mt-1 font-semibold text-slate-200">{incident.environment}</p>
        </div>

        <div className="rounded border border-slate-800 bg-[#070a12] p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px]">STARTED:</span>
          </div>
          <p className="mt-1 font-semibold text-amber-300">{incident.started_at}</p>
        </div>
      </div>

      {/* Observed Symptoms */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
            OBSERVED SYMPTOMS ({symptoms.length})
          </span>
          <button
            onClick={() => setIsEditingSymptoms(!isEditingSymptoms)}
            className="text-[10px] font-mono text-sky-400 hover:text-sky-300 transition-colors"
          >
            {isEditingSymptoms ? 'Done' : '+ Edit Symptoms'}
          </button>
        </div>

        <div className="space-y-1.5">
          {symptoms.map((symptom, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-2 rounded border border-slate-800/80 bg-[#070a12] px-2.5 py-1.5 text-xs text-slate-200"
            >
              <div className="flex items-start gap-2">
                <span className="text-sky-500 font-mono mt-0.5">•</span>
                <span className="font-mono text-[11px] leading-tight">{symptom}</span>
              </div>
              {isEditingSymptoms && (
                <button
                  onClick={() => handleRemoveSymptom(idx)}
                  className="text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {isEditingSymptoms && (
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newSymptomText}
              onChange={(e) => setNewSymptomText(e.target.value)}
              placeholder="e.g. Connection pool exhausted in PostgreSQL"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSymptom()}
              className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
            <Button size="sm" onClick={handleAddSymptom} leftIcon={<Plus className="w-3 h-3" />}>
              Add
            </Button>
          </div>
        )}
      </div>

      {/* Affected Endpoints if present */}
      {incident.affected_endpoints && incident.affected_endpoints.length > 0 && (
        <div className="space-y-1.5 text-xs font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            IMPACTED ENDPOINTS
          </span>
          <div className="flex flex-wrap gap-1.5">
            {incident.affected_endpoints.map((ep) => (
              <span
                key={ep}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
              >
                {ep}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Status Banner if incident is resolved */}
      {incident.status === 'Resolved' && (
        <div className="p-3.5 rounded-lg border border-emerald-900/60 bg-emerald-950/20 text-emerald-300 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              STATUS: RESOLVED
            </span>
            {incident.resolved_at && (
              <span className="text-[10px] text-emerald-400/90">{incident.resolved_at}</span>
            )}
          </div>
          {incident.root_cause && (
            <p className="text-[11px] text-slate-300 font-sans">
              <strong className="text-white font-mono">Cause:</strong> {incident.root_cause}
            </p>
          )}
          {incident.resolution && (
            <p className="text-[11px] text-slate-300 font-sans">
              <strong className="text-white font-mono">Fix:</strong> {incident.resolution}
            </p>
          )}
        </div>
      )}

      {/* Primary Investigation Action Button */}
      <div className="pt-2 space-y-2.5">
        <Button
          variant="primary"
          size="lg"
          className="w-full justify-center text-xs py-2.5 font-bold uppercase tracking-wider"
          isLoading={isInvestigating}
          onClick={() => onInvestigate(currentPayload)}
          leftIcon={<Crosshair className="w-4 h-4 text-slate-950" />}
        >
          {isInvestigating ? 'Correlating Precedents & Telemetry...' : 'Run SRE Investigation'}
        </Button>

        {onResolve && (
          <Button
            variant="secondary"
            size="lg"
            className={`w-full justify-center text-xs py-2.5 font-bold uppercase tracking-wider ${
              incident.status === 'Resolved'
                ? 'border-indigo-500/40 text-indigo-300 hover:text-white bg-indigo-950/20'
                : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/40 hover:text-white'
            }`}
            onClick={onResolve}
            leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          >
            {incident.status === 'Resolved' ? 'View / Update Postmortem' : 'Resolve Incident & Retain'}
          </Button>
        )}

        <p className="text-[11px] text-center text-slate-500 font-mono">
          Engine: Meta Muse Spark 1.3 • Memory: Hindsight Cloud
        </p>
      </div>
    </div>
  );
};
