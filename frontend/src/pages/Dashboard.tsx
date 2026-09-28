import React, { useEffect, useState } from 'react';
import type { ActiveIncident, DashboardStats } from '../types/incident';
import { fetchDashboardStats, fetchIncidents } from '../services/incidents';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { MemorySignalCard } from '../components/dashboard/MemorySignalCard';
import { ActiveIncidentsTable } from '../components/dashboard/ActiveIncidentsTable';
import { Button } from '../components/ui/Button';
import { BrainCircuit, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onSelectIncident: (incident: ActiveIncident) => void;
  onNavigateToMemory: () => void;
  onNavigateToDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectIncident,
  onNavigateToMemory,
  onNavigateToDemo,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<ActiveIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, incidentsData] = await Promise.all([
        fetchDashboardStats(),
        fetchIncidents(),
      ]);
      setStats(statsData);
      setIncidents(incidentsData);
    } catch (err: any) {
      console.warn('Dashboard data fetch failed; using fallback:', err);
      setError(err?.message || 'Failed to connect to OpsMind backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-mono">
              SRE INCIDENT OPERATIONS CONSOLE
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              CLUSTER: PROD-US-EAST
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production incident investigation grounded in persistent organizational memory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onNavigateToDemo}
            leftIcon={<BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />}
            className="border-indigo-800/60 text-indigo-300 hover:text-white bg-indigo-950/20"
          >
            Experience Loop
          </Button>
        </div>
      </div>

      {/* Error alert if backend unreachable */}
      {error && (
        <div className="rounded border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-center justify-between">
          <span>{error} — Verify that the FastAPI server is running on http://127.0.0.1:8000</span>
          <Button size="sm" variant="secondary" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* 4 Stats Cards */}
      <StatsOverview
        activeCount={stats?.active_incidents ?? incidents.length}
        criticalCount={stats?.critical_incidents ?? incidents.filter((i) => i.severity === 'SEV-1').length}
        historicalCount={stats?.historical_incidents ?? 24}
        memoriesCount={stats?.engineering_memories ?? 47}
      />

      {/* Memory Signal Box */}
      <MemorySignalCard
        relevantExperiences={stats?.memory_signal.relevant_experiences ?? 7}
        previousIncidents={stats?.memory_signal.previous_incidents ?? 3}
        engineeringDecisions={stats?.memory_signal.engineering_decisions ?? 2}
        lessonsLearned={stats?.memory_signal.lessons_learned ?? 2}
        lastRetained={stats?.memory_signal.last_memory_retained ?? '4 minutes ago'}
        bankId={stats?.memory_signal.bank_id ?? 'opsmind-engineering'}
        onExploreMemory={onNavigateToMemory}
      />

      {/* Active Incidents Table */}
      <ActiveIncidentsTable
        incidents={incidents}
        onSelectIncident={onSelectIncident}
      />
    </div>
  );
};
