import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { retainMemory, recallMemories } from '../services/memory';
import type { MemoryRecallResultItem } from '../types/memory';
import {
  AlertTriangle,
  ShieldAlert,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Layers,
} from 'lucide-react';

export const DemoLearning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'loop' | 'comparison'>('loop');

  // Interactive Live Demo State
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);
  const [isRetaining, setIsRetaining] = useState(false);
  const [isRecalling, setIsRecalling] = useState(false);
  const [retainedSuccess, setRetainedSuccess] = useState(false);
  const [recalledEvidence, setRecalledEvidence] = useState<MemoryRecallResultItem[]>([]);
  const [recallQueryText, setRecallQueryText] = useState('orders-worker queue starvation Redis lock contention batch sync');
  const [error, setError] = useState<string | null>(null);

  // Postmortem Fields for Phase 2
  const [rootCause, setRootCause] = useState(
    'Batch synchronization lock contention in Redis: sync_concurrency was set to 25 instead of 4, causing thread starvation.'
  );
  const [resolution, setResolution] = useState(
    'Throttled sync_concurrency down to 4 in Redis lock manager and cleared deadlock mutexes.'
  );
  const [outcome, setOutcome] = useState('Successful - queue latency returned to 12ms baseline.');
  const [lesson, setLesson] = useState(
    'For orders-worker queue starvation, throttle sync concurrency before any pod restarts.'
  );
  const [warning, setWarning] = useState(
    'Do not kill orders-worker pods during sync lock contention; orphaned mutexes drop in-flight checkout messages.'
  );

  const handleRetainExperience = async () => {
    setIsRetaining(true);
    setError(null);
    try {
      const resp = await retainMemory({
        incident_id: 'INC-1130',
        service: 'orders-worker',
        severity: 'SEV-2',
        environment: 'production',
        memory_type: 'incident_postmortem',
        title: 'Redis batch lock contention causing queue starvation',
        symptoms: ['Worker queue latency spiked to 4500ms', 'Downstream orders stuck in PROCESSING lock state'],
        confirmed_root_cause: rootCause,
        resolution: resolution,
        outcome: outcome,
        lessons_learned: [lesson],
        warnings: [warning],
        successful_actions: ['Throttled sync_concurrency to 4', 'Cleared deadlock mutexes via redis-cli'],
        failed_actions: ['Emergency pod restart (orphaned mutexes)'],
        tags: ['orders-worker', 'redis', 'queue', 'lock'],
      });

      if (resp.success) {
        setRetainedSuccess(true);
        setCurrentPhase(3);
      }
    } catch (err: any) {
      setError(err?.message || 'Retain to Hindsight failed. Check API key configuration.');
    } finally {
      setIsRetaining(false);
    }
  };

  const handleRunFutureInvestigation = async () => {
    setIsRecalling(true);
    setError(null);
    const query = 'orders-worker queue starvation Redis lock contention batch sync';
    setRecallQueryText(query);
    try {
      const resp = await recallMemories(query, 'opsmind-engineering');
      setRecalledEvidence(resp.results || []);
    } catch (err: any) {
      setError(err?.message || 'Hindsight recall query failed.');
    } finally {
      setIsRecalling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white font-mono">
              THE EXPERIENCE LOOP: RETENTION &amp; RECALL
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Unlike stateless agents that forget every resolution, OpsMind uses{' '}
            <strong className="text-indigo-300">Hindsight Persistent Memory</strong> to retain real
            engineering postmortems and automatically ground future investigations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded border border-slate-800 bg-[#070a12] p-0.5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('loop')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'loop'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Live Learning Loop (Interactive)
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Architecture Comparison
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-rose-500/50 bg-rose-950/30 text-rose-200 text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'loop' ? (
        <div className="space-y-6">
          {/* 3-Phase Interactive Progress Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div
              className={`p-3.5 rounded-lg border transition-all ${
                currentPhase === 1
                  ? 'border-sky-500/50 bg-sky-950/20 text-sky-200'
                  : 'border-slate-800 bg-[#070a12] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">PHASE 1: BEFORE LEARNING</span>
                <span className="text-[10px] text-slate-500">INCIDENT A</span>
              </div>
              <p className="text-[11px] mt-1 text-slate-400">
                Novel incident occurs. No prior historical memories exist in Hindsight.
              </p>
            </div>

            <div
              className={`p-3.5 rounded-lg border transition-all ${
                currentPhase === 2
                  ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-200'
                  : 'border-slate-800 bg-[#070a12] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">PHASE 2: RESOLVE &amp; RETAIN</span>
                <span className="text-[10px] text-slate-500">POSTMORTEM</span>
              </div>
              <p className="text-[11px] mt-1 text-slate-400">
                Engineer resolves issue and commits experience into Hindsight memory bank.
              </p>
            </div>

            <div
              className={`p-3.5 rounded-lg border transition-all ${
                currentPhase === 3
                  ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200'
                  : 'border-slate-800 bg-[#070a12] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">PHASE 3: AFTER LEARNING</span>
                <span className="text-[10px] text-slate-500">FUTURE RECALL</span>
              </div>
              <p className="text-[11px] mt-1 text-slate-400">
                Future similar incident retrieves the newly retained experience live from Hindsight.
              </p>
            </div>
          </div>

          {/* Phase 1: Before */}
          <div className="rounded-xl border border-slate-800 bg-[#0b0f19] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="neutral">PHASE 1</Badge>
                <span className="text-sm font-mono font-bold text-white">
                  INC-1130: orders-worker Queue Latency Degradation
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">Service: orders-worker</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded border border-slate-800 bg-[#070a12] p-3.5 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  CURRENT SYMPTOMS:
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  <li>• Worker queue latency spiked to 4500ms</li>
                  <li>• Downstream orders stuck in PROCESSING lock state</li>
                </ul>
              </div>

              <div className="rounded border border-slate-800 bg-[#070a12] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    HINDSIGHT HISTORICAL EVIDENCE:
                  </span>
                  <Badge variant="neutral" size="sm">NONE</Badge>
                </div>
                <p className="text-slate-400 italic text-[11px]">
                  [0 historical records found in memory bank for this symptom profile]
                </p>
                <p className="text-[10px] text-slate-500">
                  Without persistent memory, generic advice might suggest pod restarts.
                </p>
              </div>
            </div>

            {currentPhase === 1 && (
              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentPhase(2)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Resolve &amp; Retain
                </Button>
              </div>
            )}
          </div>

          {/* Phase 2: Resolve & Retain */}
          {(currentPhase === 2 || currentPhase === 3) && (
            <div className="rounded-xl border border-slate-800 bg-[#0b0f19] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="memory">PHASE 2</Badge>
                  <span className="text-sm font-mono font-bold text-white">
                    Engineer Postmortem &amp; Hindsight Retention
                  </span>
                </div>
                <span className="text-xs font-mono text-indigo-300">Target Bank: opsmind-engineering</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-300 uppercase">
                    Root Cause:
                  </label>
                  <textarea
                    rows={2}
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    disabled={retainedSuccess}
                    className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />

                  <label className="text-[10px] font-bold text-slate-300 uppercase block mt-2">
                    Resolution:
                  </label>
                  <textarea
                    rows={2}
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    disabled={retainedSuccess}
                    className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />

                  <label className="text-[10px] font-bold text-slate-300 uppercase block mt-2">
                    Outcome:
                  </label>
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    disabled={retainedSuccess}
                    className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-amber-300 uppercase">
                    Lessons Learned:
                  </label>
                  <textarea
                    rows={2}
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    disabled={retainedSuccess}
                    className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />

                  <label className="text-[10px] font-bold text-rose-400 uppercase block mt-2">
                    Critical Warning:
                  </label>
                  <textarea
                    rows={2}
                    value={warning}
                    onChange={(e) => setWarning(e.target.value)}
                    disabled={retainedSuccess}
                    className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none focus:border-rose-500 font-sans"
                  />
                </div>
              </div>

              {/* Retain Action Button */}
              {!retainedSuccess ? (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="lg"
                    isLoading={isRetaining}
                    onClick={handleRetainExperience}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider"
                    leftIcon={<BrainCircuit className="w-4 h-4 text-indigo-200" />}
                  >
                    {isRetaining ? 'Retaining to Hindsight...' : 'Retain Experience in Hindsight'}
                  </Button>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-emerald-900/60 bg-emerald-950/20 text-emerald-200 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Experience INC-1130 successfully committed into Hindsight Cloud!</span>
                  </div>
                  <Badge variant="success" size="sm">RETAINED</Badge>
                </div>
              )}
            </div>
          )}

          {/* Phase 3: Future Incident (After Learning) */}
          {currentPhase === 3 && (
            <div className="rounded-xl border border-emerald-900/60 bg-[#091617] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="success">PHASE 3</Badge>
                  <span className="text-sm font-mono font-bold text-white">
                    NEW INCIDENT: INC-1142 (2 Weeks Later)
                  </span>
                </div>
                <Badge variant="memory" size="sm">
                  MEMORY IMPACT: +1 NEW EVIDENCE
                </Badge>
              </div>

              <div className="text-xs font-mono space-y-1">
                <p className="text-slate-300">
                  <strong className="text-white">Scenario:</strong> An on-call engineer receives an alert:
                  "orders-worker queue backlog growing rapidly after promotional batch run."
                </p>
              </div>

              {/* Action: Trigger Real Recall */}
              <div className="p-3 rounded border border-slate-800 bg-[#070a12] flex items-center justify-between gap-4">
                <div className="text-xs font-mono text-slate-300">
                  <span className="text-indigo-400 font-bold block text-[10px] uppercase">
                    TRIGGER REAL-TIME HINDSIGHT RECALL:
                  </span>
                  <span>Query: "{recallQueryText}"</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isRecalling}
                  onClick={handleRunFutureInvestigation}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRecalling ? 'animate-spin' : ''}`} />}
                  className="bg-emerald-600 hover:bg-emerald-500 font-bold uppercase shrink-0"
                >
                  {isRecalling ? 'RECALLING...' : 'RECALL FROM HINDSIGHT'}
                </Button>
              </div>

              {/* Recalled Evidence Result */}
              {recalledEvidence.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                      ✓ LIVE HINDSIGHT RECALL RETURNED {recalledEvidence.length} FACT(S):
                    </span>
                    <span className="text-[10px] font-mono text-indigo-300">
                      Retrieved from bank: opsmind-engineering
                    </span>
                  </div>

                  <div className="space-y-2">
                    {recalledEvidence.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded border border-emerald-900/40 bg-[#0e1d1e] text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                          <span>[{idx + 1}] {item.id || 'RECALLED ENGINEERING EXPERIENCE'}</span>
                          <span className="text-slate-400 text-[10px] uppercase">{item.type || 'DOCUMENT'}</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed font-sans">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Factual Memory Impact */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono p-3 rounded bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">MEMORY IMPACT (BEFORE):</span>
                      <span className="text-slate-400">0 relevant historical experiences</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 uppercase block">MEMORY IMPACT (AFTER):</span>
                      <span className="text-emerald-300 font-bold">{recalledEvidence.length} newly relevant experiences retrieved live</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Architecture Comparison (Before vs After) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: BEFORE MEMORY */}
          <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    PHASE 1: BEFORE PERSISTENT MEMORY
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Standard LLM (No persistent memory engine)
                  </p>
                </div>
                <Badge variant="neutral" size="sm">
                  NO EVIDENCE
                </Badge>
              </div>

              <div className="rounded border border-slate-800 bg-[#070a12] p-3 text-xs space-y-1.5 font-mono">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  HINDSIGHT MEMORY RETRIEVAL:
                </span>
                <p className="text-slate-400 italic">
                  [0 records found in memory bank]
                </p>
                <p className="text-[11px] text-slate-400">
                  Agent hypothesizes purely from generic pre-training data without knowledge of team architecture or previous disasters.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-mono text-[11px] font-bold text-slate-400 uppercase">
                  GENERIC REASONING:
                </span>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  Generic SRE advice: Check CPU usage, check network firewalls, review recent pull requests, or restart the container pods.
                </p>
              </div>

              <div className="rounded border border-rose-900/50 bg-rose-950/10 p-3 text-xs space-y-1">
                <span className="font-mono text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  DANGEROUS BLIND SPOT:
                </span>
                <p className="text-rose-300/80 leading-relaxed font-sans text-xs">
                  Fails to warn against restarting payment-api because it has no memory of INC-1091 (where a restart severed 2PC transactions and caused $12,400 in duplicate charges).
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Confidence: <strong className="text-slate-400">Low - No Precedent</strong></span>
              <span>Memory Used: <strong className="text-slate-400">False</strong></span>
            </div>
          </div>

          {/* Right Column: AFTER MEMORY */}
          <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
                    PHASE 2: AFTER PERSISTENT MEMORY
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    OpsMind with Hindsight bank (opsmind-engineering)
                  </p>
                </div>
                <Badge variant="memory" size="sm">
                  PRECEDENTS AVAILABLE
                </Badge>
              </div>

              <div className="rounded border border-slate-800 bg-[#070a12] p-3 text-xs space-y-1.5 font-mono">
                <span className="text-[10px] text-indigo-300 font-bold uppercase">
                  HINDSIGHT RECALL RETRIEVED:
                </span>
                <ul className="space-y-1 text-slate-200 text-[11px]">
                  <li className="flex items-center gap-1.5 text-indigo-200">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong>INC-1042:</strong> Database connection pool regression after deploy</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-indigo-200">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong>INC-1067:</strong> Gateway timeout misconfigured in env variables</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-rose-300">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>INC-1091:</strong> Emergency restart caused duplicate payment processing</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-indigo-200">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span><strong>DECISION-PAYMENT-RESTART:</strong> Automatic pod restart strictly forbidden</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-mono text-[11px] font-bold text-indigo-300 uppercase">
                  EVIDENCE-GROUNDED SRE PLAN:
                </span>
                <div className="space-y-1.5 text-xs font-sans">
                  <p className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-100">
                    1. Compare database connection pool configuration between releases (INC-1042).
                  </p>
                  <p className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-100">
                    2. Check PostgreSQL active connection pool saturation metrics before touching pods.
                  </p>
                </div>
              </div>

              <div className="rounded border border-rose-900/60 bg-rose-950/20 p-3 text-xs space-y-1">
                <span className="font-mono text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  CRITICAL WARNING ELEVATED BY HINDSIGHT:
                </span>
                <p className="text-rose-200 font-sans text-xs leading-relaxed">
                  Do NOT execute "kubectl rollout restart deployment/payment-api". In INC-1091, an uncoordinated restart severed in-flight transactions and caused duplicate payment charges.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Confidence: <strong className="text-emerald-400">High - Precedent Supported</strong></span>
              <span>Memory Used: <strong className="text-white">True (Hindsight)</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#070a12] p-4 text-center">
        <p className="text-xs font-mono text-slate-300">
          <strong className="text-indigo-300 font-semibold">Continuous Learning Architecture:</strong> "The agent did not receive a new model. It received a new memory."
        </p>
      </div>
    </div>
  );
};
