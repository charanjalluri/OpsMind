import React from 'react';
import { GitBranch, Server } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const MemoryRelationshipView: React.FC = () => {
  return (
    <div className="rounded-lg border border-purple-500/30 bg-[#0f1220] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
            KNOWLEDGE GRAPH &amp; DECISION TOPOLOGY
          </span>
        </div>
        <span className="text-[11px] font-mono text-purple-400">
          Hindsight Linked Experience Graph
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Visual representation of how historical incidents, operational outcomes, and engineering
        decisions interconnect across services in Hindsight:
      </p>

      {/* Service 1: payment-api connected graph */}
      <div className="font-mono text-xs space-y-3 bg-[#0a0d17] p-4 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2 text-sky-400 font-bold">
          <Server className="w-4 h-4 text-sky-400" />
          <span>payment-api</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
            Core Service
          </span>
        </div>

        {/* Tree branches */}
        <div className="pl-4 space-y-3 border-l-2 border-slate-800 ml-2">
          {/* Branch 1 */}
          <div className="relative pl-4 space-y-1">
            <span className="absolute -left-4 top-2 w-3 h-0.5 bg-slate-800" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold">INC-1042</span>
              <span className="text-[11px] text-slate-400">HTTP 502 after v2.9.0 deploy</span>
              <Badge variant="accent" size="sm">
                Regression
              </Badge>
            </div>
            <p className="text-[11px] text-purple-300 pl-3 border-l border-slate-800 ml-1">
              └── <strong className="text-slate-200">Root Cause:</strong> Database connection pool
              exhaustion (pool_max reduced from 50 to 5)
            </p>
          </div>

          {/* Branch 2 */}
          <div className="relative pl-4 space-y-1">
            <span className="absolute -left-4 top-2 w-3 h-0.5 bg-slate-800" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold">INC-1067</span>
              <span className="text-[11px] text-slate-400">HTTP 502 after v2.9.5 deploy</span>
              <Badge variant="accent" size="sm">
                Config
              </Badge>
            </div>
            <p className="text-[11px] text-purple-300 pl-3 border-l border-slate-800 ml-1">
              └── <strong className="text-slate-200">Root Cause:</strong> Upstream gateway timeout
              misconfiguration (PAYMENT_GATEWAY_TIMEOUT_MS)
            </p>
          </div>

          {/* Branch 3: The Disaster */}
          <div className="relative pl-4 space-y-1">
            <span className="absolute -left-4 top-2 w-3 h-0.5 bg-rose-500/60" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-rose-400 font-bold">INC-1091</span>
              <span className="text-[11px] text-rose-300">
                Emergency restart under heavy load
              </span>
              <Badge variant="danger" size="sm">
                Harmful Fix
              </Badge>
            </div>
            <p className="text-[11px] text-rose-300/90 pl-3 border-l border-rose-900/50 ml-1">
              └── <strong className="text-rose-200">Disastrous Outcome:</strong> Uncoordinated pod
              restart severed 2PC transactions → 47 duplicate customer charges ($12,400)
            </p>
          </div>

          {/* Branch 4: The Resulting Policy */}
          <div className="relative pl-4 space-y-1 pt-1">
            <span className="absolute -left-4 top-3 w-3 h-0.5 bg-purple-500" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-purple-300 font-bold">DECISION-PAYMENT-RESTART</span>
              <Badge variant="memory" size="sm">
                Engineering Policy
              </Badge>
            </div>
            <div className="text-[11px] text-purple-200 pl-3 border-l border-purple-800/60 ml-1 bg-purple-950/20 p-2 rounded">
              <p>
                └── <strong className="text-white">Strict Organizational Rule:</strong> Prohibit
                automatic or reflexive restarts of payment-api during production incidents.
              </p>
              <p className="text-purple-400 mt-1">
                Reason: Directly derived from INC-1091 to protect transaction consistency.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service 2: orders-api connected graph */}
      <div className="font-mono text-xs space-y-2 bg-[#0a0d17] p-4 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2 text-sky-400 font-bold">
          <Server className="w-4 h-4 text-sky-400" />
          <span>orders-api</span>
        </div>
        <div className="pl-4 space-y-2 border-l-2 border-slate-800 ml-2">
          <div className="relative pl-4 space-y-1">
            <span className="absolute -left-4 top-2 w-3 h-0.5 bg-slate-800" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold">INC-1110</span>
              <span className="text-[11px] text-slate-400">Elevated 5xx after v1.14.2 deploy</span>
              <Badge variant="accent" size="sm">
                Config
              </Badge>
            </div>
            <p className="text-[11px] text-purple-300 pl-3 border-l border-slate-800 ml-1">
              └── <strong className="text-slate-200">Root Cause:</strong> INVENTORY_SERVICE_PORT string
              vs int configuration mismatch in Helm ConfigMap
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
