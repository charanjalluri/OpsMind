import React from 'react';
import type { ActiveIncident } from '../../types/incident';
import { Badge } from '../ui/Badge';
import { StatusIndicator } from '../ui/StatusIndicator';
import { ArrowRight, Clock, ShieldCheck } from 'lucide-react';

interface ActiveIncidentsTableProps {
  incidents: ActiveIncident[];
  onSelectIncident: (incident: ActiveIncident) => void;
}

export const ActiveIncidentsTable: React.FC<ActiveIncidentsTableProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'SEV-1':
        return <Badge variant="danger">SEV-1</Badge>;
      case 'SEV-2':
        return <Badge variant="warning">SEV-2</Badge>;
      case 'SEV-3':
        return <Badge variant="accent">SEV-3</Badge>;
      default:
        return <Badge variant="neutral">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Investigating':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-medium">
            <StatusIndicator status="warning" pulse size="sm" />
            Investigating
          </span>
        );
      case 'Mitigated':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400 font-medium">
            <StatusIndicator status="active" size="sm" />
            Mitigated
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Resolved
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0f1422] overflow-hidden">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            ACTIVE INCIDENTS
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
            {incidents.length} MONITORED
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Click row to open Hindsight memory investigation
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/60 bg-[#0a0d17] font-mono text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-4">Incident</th>
              <th className="py-2.5 px-4">Service</th>
              <th className="py-2.5 px-4">Severity</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Symptoms / Title</th>
              <th className="py-2.5 px-4">Started</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {incidents.map((incident) => (
              <tr
                key={incident.incident_id}
                onClick={() => onSelectIncident(incident)}
                className="group hover:bg-[#141b2d] cursor-pointer transition-colors duration-150"
              >
                <td className="py-3 px-4 font-mono font-semibold text-white whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-400 group-hover:text-sky-300">
                      {incident.incident_id}
                    </span>
                    {incident.deployment_version && (
                      <span className="text-[10px] text-slate-400 px-1 rounded bg-slate-800">
                        {incident.deployment_version}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {incident.service}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {getSeverityBadge(incident.severity)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {getStatusBadge(incident.status)}
                </td>
                <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                  <span className="font-medium text-slate-200">{incident.title}</span>
                  {incident.symptoms.length > 0 && (
                    <span className="block text-[11px] text-slate-400 truncate">
                      {incident.symptoms.join(' • ')}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{incident.started_at}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono text-[11px] font-semibold transition-all">
                    <span>Investigate</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
