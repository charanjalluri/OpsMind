import React from 'react';
import { ShieldAlert, Database, Cpu, Activity } from 'lucide-react';
import { StatusIndicator } from '../ui/StatusIndicator';

interface HeaderProps {
  backendConnected: boolean;
  bankId?: string;
  activeCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  backendConnected,
  bankId = 'opsmind-engineering',
  activeCount = 3,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-[#0c101c] px-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white font-mono text-sm">OPSMIND</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                SRE CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Persistent Engineering Memory for Incident Response
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Memory & Model Telemetry */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/40 border border-purple-800/40 text-purple-300">
          <Database className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] text-purple-400">MEMORY BANK:</span>
          <span className="font-medium text-white">{bankId}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] text-slate-400">REASONING:</span>
          <span className="text-sky-300 font-medium">Muse Spark 1.3</span>
        </div>
      </div>

      {/* Right: Environment & System Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-slate-800 bg-[#0a0d14] text-xs font-mono">
          <span className="text-slate-400">ENV:</span>
          <span className="text-slate-200 font-semibold">Production</span>
          <StatusIndicator status={backendConnected ? 'active' : 'danger'} pulse={backendConnected} size="sm" />
        </div>

        {activeCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{activeCount} ACTIVE</span>
          </div>
        )}
      </div>
    </header>
  );
};
