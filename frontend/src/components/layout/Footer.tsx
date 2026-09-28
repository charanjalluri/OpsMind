import React from 'react';
import { Database, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-8 border-t border-slate-800 bg-[#070a12] px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          OpsMind SRE Console
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1 text-indigo-400">
          <Database className="w-3 h-3" />
          Hindsight Memory Layer
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1 text-sky-400">
          <Cpu className="w-3 h-3" />
          Meta Muse Spark 1.3
        </span>
      </div>

      <div className="flex items-center gap-3 text-slate-500">
        <span>HackwithHyderabad 3.0</span>
        <span>•</span>
        <span>FastAPI Connected</span>
      </div>
    </footer>
  );
};
