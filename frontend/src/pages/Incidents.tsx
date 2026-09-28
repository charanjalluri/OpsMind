import React, { useState, useEffect } from 'react';
import type { ActiveIncident } from '../types/incident';
import { fetchIncidents } from '../services/incidents';
import { ActiveIncidentsTable } from '../components/dashboard/ActiveIncidentsTable';
import { AlertOctagon, Search } from 'lucide-react';

interface IncidentsProps {
  onSelectIncident: (incident: ActiveIncident) => void;
}

export const Incidents: React.FC<IncidentsProps> = ({ onSelectIncident }) => {
  const [incidents, setIncidents] = useState<ActiveIncident[]>([]);
  const [filter, setFilter] = useState<'all' | 'sev1' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIncidents()
      .then((data) => setIncidents(data))
      .catch((err) => console.error('Failed to fetch incidents:', err));
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'sev1' && inc.severity !== 'SEV-1') return false;
    if (filter === 'active' && inc.status === 'Resolved') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.incident_id.toLowerCase().includes(q) ||
        inc.service.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl font-bold tracking-tight text-white font-mono">
              PRODUCTION INCIDENTS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse and triage production outages with Hindsight historical memory grounding.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex rounded border border-slate-800 bg-[#0a0d17] p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded transition-colors ${
                filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({incidents.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded transition-colors ${
                filter === 'active' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Triage
            </button>
            <button
              onClick={() => setFilter('sev1')}
              className={`px-3 py-1 rounded transition-colors ${
                filter === 'sev1' ? 'bg-rose-950/60 text-rose-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SEV-1 Critical
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter incidents by service, ID, or keywords..."
          className="w-full rounded border border-slate-800 bg-[#0f1422] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
        />
      </div>

      {/* Incidents Table */}
      <ActiveIncidentsTable
        incidents={filteredIncidents}
        onSelectIncident={onSelectIncident}
      />
    </div>
  );
};
