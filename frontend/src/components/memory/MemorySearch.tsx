import React, { useState } from 'react';
import { Search, BrainCircuit, CornerDownLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface MemorySearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const MemorySearch: React.FC<MemorySearchProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const quickQueries = [
    'The payment API is returning HTTP 502 errors immediately after today\'s deployment. What should I investigate first?',
    'Should I restart payment-api during a 502 incident?',
    'orders-api 5xx errors after Helm release',
    'Database connection pool exhaustion regression',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <BrainCircuit className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
          QUERY HINDSIGHT PERSISTENT MEMORY
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search engineering memories, e.g. 'payment API 502 after deployment'..."
            className="w-full rounded border border-slate-700 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={<CornerDownLeft className="w-3.5 h-3.5" />}
        >
          Execute Recall
        </Button>
      </form>

      {/* Quick Test Chips */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          BENCHMARK INCIDENT QUERIES:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                onSearch(q);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#070a12] hover:bg-slate-900 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-slate-700 transition-colors text-left truncate max-w-md"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
