import React, { useState } from 'react';
import type { ActiveIncident, IncidentResolutionResponse } from '../types/incident';
import type { InvestigationResult } from '../types/investigation';
import { runInvestigation } from '../services/investigations';
import { CurrentIncidentPanel } from '../components/investigation/CurrentIncidentPanel';
import { AIInvestigationPanel } from '../components/investigation/AIInvestigationPanel';
import { HistoricalMemoryPanel } from '../components/investigation/HistoricalMemoryPanel';
import { InvestigationProgress } from '../components/investigation/InvestigationProgress';
import { ResolutionPostmortemModal } from '../components/investigation/ResolutionPostmortemModal';
import { MemoryRetainedSignal } from '../components/investigation/MemoryRetainedSignal';
import { IncidentTimeline } from '../components/investigation/IncidentTimeline';
import { InvestigationContextTrace } from '../components/investigation/InvestigationContextTrace';
import { Button } from '../components/ui/Button';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, BrainCircuit } from 'lucide-react';

interface IncidentDetailProps {
  incident: ActiveIncident;
  onBack: () => void;
  onNavigateToMemoryId?: (id: string) => void;
  onNavigateToMemory?: () => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  onBack,
  onNavigateToMemoryId,
  onNavigateToMemory,
}) => {
  const [currentIncident, setCurrentIncident] = useState<ActiveIncident>(incident);
  const [investigationResult, setInvestigationResult] = useState<InvestigationResult | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Resolution modal & signal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [retainedSignal, setRetainedSignal] = useState<{
    incidentId: string;
    service: string;
    bankId: string;
  } | null>(null);

  const handleRunInvestigation = async (inc: ActiveIncident) => {
    setIsInvestigating(true);
    setError(null);
    setProgressStep(1);

    // Realistic progress animation during investigation
    const timer1 = setTimeout(() => setProgressStep(2), 350);
    const timer2 = setTimeout(() => setProgressStep(3), 850);
    const timer3 = setTimeout(() => setProgressStep(4), 1400);

    try {
      const result = await runInvestigation({
        incident_id: inc.incident_id,
        service: inc.service,
        environment: inc.environment,
        symptoms: inc.symptoms,
        deployment_version: inc.deployment_version || undefined,
        description: inc.description || undefined,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setProgressStep(5);

      setTimeout(() => {
        setInvestigationResult(result);
        setIsInvestigating(false);
        setProgressStep(0);
      }, 400);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsInvestigating(false);
      setProgressStep(0);
      setError(
        err?.message ||
          'Investigation failed. Ensure FastAPI backend is running with valid Hindsight and Meta Muse Spark configuration.'
      );
    }
  };

  const handleResolutionSuccess = (res: IncidentResolutionResponse) => {
    setIsResolveModalOpen(false);

    // Update incident state locally
    const nowTime = res.resolved_at || 'Just now';
    setCurrentIncident((prev) => ({
      ...prev,
      status: 'Resolved',
      resolved_at: nowTime,
      retained_memory_id: res.retained_memory.incident_id || prev.incident_id,
      timeline_events: [
        ...(prev.timeline_events || [
          { time: '14:32', title: 'Incident detected', description: `Alert triggered for ${prev.service} (${prev.severity})`, type: 'detection' },
          { time: '14:34', title: 'OpsMind investigation started', description: 'Analyzing telemetry and historical memory precedents', type: 'investigation' },
          { time: '14:35', title: 'Historical memories retrieved', description: '3 matching precedents recalled from Hindsight', type: 'memory' },
          { time: '14:37', title: 'Root cause identified', description: 'Configuration regression diagnosed', type: 'diagnosis' },
          { time: '14:39', title: 'Rollback performed', description: 'Restored previous configuration parameters', type: 'action' },
          { time: '14:40', title: 'Service recovered', description: 'Error rates returned to normal baseline', type: 'recovery' },
        ]),
        {
          time: nowTime,
          title: 'Postmortem captured & retained in Hindsight',
          description: `Experience stored permanently under bank '${res.retained_memory.bank_id}'`,
          type: 'retention',
        },
      ],
    }));

    // Trigger visual memory signal
    setRetainedSignal({
      incidentId: res.incident_id,
      service: currentIncident.service,
      bankId: res.retained_memory.bank_id,
    });
  };

  const defaultTimelineEvents = currentIncident.timeline_events || [
    { time: '14:32', title: 'Incident detected', description: `Alert triggered for ${currentIncident.service} (${currentIncident.severity})`, type: 'detection' },
    { time: '14:34', title: 'OpsMind investigation started', description: 'Analyzing telemetry and querying persistent memory', type: 'investigation' },
    { time: '14:35', title: 'Historical memories retrieved', description: 'Matching precedents queried from Hindsight bank', type: 'memory' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            All Incidents
          </Button>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-400">
                {currentIncident.incident_id}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="font-mono text-xs text-slate-300">
                {currentIncident.service}
              </span>
              {currentIncident.status === 'Resolved' && (
                <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                  • <CheckCircle2 className="w-3 h-3" /> RESOLVED {currentIncident.resolved_at ? `(${currentIncident.resolved_at})` : ''}
                </span>
              )}
            </div>
            <h1 className="text-base font-semibold text-white leading-tight">
              {currentIncident.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentIncident.status === 'Resolved' ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsResolveModalOpen(true)}
              className="border-indigo-500/40 text-indigo-300 hover:text-white bg-indigo-950/20"
              leftIcon={<BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />}
            >
              View Retained Postmortem
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsResolveModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />}
            >
              RESOLVE INCIDENT
            </Button>
          )}

          {investigationResult && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleRunInvestigation(currentIncident)}
              isLoading={isInvestigating}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Re-Investigate
            </Button>
          )}
        </div>
      </div>

      {/* Strong Visual Learning Signal when experience was retained */}
      {retainedSignal && (
        <MemoryRetainedSignal
          incidentId={retainedSignal.incidentId}
          service={retainedSignal.service}
          bankId={retainedSignal.bankId}
          onDismiss={() => setRetainedSignal(null)}
          onExploreMemory={onNavigateToMemory}
        />
      )}

      {/* Error notification */}
      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-rose-300">Investigation Request Failed</p>
            <p>{error}</p>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleRunInvestigation(currentIncident)}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Active Progress Banner when executing */}
      {isInvestigating && (
        <InvestigationProgress
          step={progressStep}
          evidenceCount={investigationResult?.raw_evidence_count || 3}
        />
      )}

      {/* Memory -> Reasoning System Execution Trace (Feature 11 & 12) */}
      <InvestigationContextTrace
        service={currentIncident.service}
        evidenceCount={investigationResult?.raw_evidence_count || 0}
        memoryBankId={investigationResult?.memory_bank_id || 'opsmind-engineering'}
        confidence={investigationResult?.confidence || 'Pending SRE Investigation'}
      />

      {/* The 3-Column Incident Investigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Column 1: Current Incident Telemetry */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          <CurrentIncidentPanel
            incident={currentIncident}
            isInvestigating={isInvestigating}
            onInvestigate={handleRunInvestigation}
            onResolve={() => setIsResolveModalOpen(true)}
            onUpdateSymptoms={(syms) =>
              setCurrentIncident((prev) => ({ ...prev, symptoms: syms }))
            }
          />

          {/* Incident Timeline (Feature 7) */}
          <IncidentTimeline
            events={currentIncident.timeline_events && currentIncident.timeline_events.length > 0 ? currentIncident.timeline_events : defaultTimelineEvents}
            isResolved={currentIncident.status === 'Resolved'}
          />
        </div>

        {/* Column 2: AI Investigation (Reasoning, Causes, Actions, Warnings) */}
        <div className="lg:col-span-8 xl:col-span-5 space-y-4">
          <AIInvestigationPanel
            result={investigationResult}
            isLoading={isInvestigating}
            onExploreMemory={onNavigateToMemory}
          />
        </div>

        {/* Column 3: Hindsight Persistent Memory Evidence */}
        <div className="lg:col-span-12 xl:col-span-4">
          <HistoricalMemoryPanel
            evidence={investigationResult?.historical_evidence || []}
            rawEvidenceCount={investigationResult?.raw_evidence_count || 0}
            memoryBankId={investigationResult?.memory_bank_id || 'opsmind-engineering'}
            onExploreMemoryId={onNavigateToMemoryId}
            isLoading={isInvestigating}
          />
        </div>
      </div>

      {/* Resolution Postmortem Modal Dialog */}
      <ResolutionPostmortemModal
        incident={currentIncident}
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onSuccess={handleResolutionSuccess}
      />
    </div>
  );
};
