import React, { useState, useEffect } from 'react';
import type { SeedEngineeringMemory, MemoryRecallResponse } from '../types/memory';
import { fetchKnowledgeBase, recallMemories } from '../services/memory';
import { MemoryCard } from '../components/memory/MemoryCard';
import { MemorySearch } from '../components/memory/MemorySearch';
import { MemoryRelationshipView } from '../components/memory/MemoryRelationshipView';
import { Button } from '../components/ui/Button';
import { BrainCircuit, Layers, GitBranch, Terminal, RefreshCw, CheckCircle2 } from 'lucide-react';

interface MemoryExplorerProps {
  selectedMemoryId?: string | null;
}

export const MemoryExplorer: React.FC<MemoryExplorerProps> = () => {
  const [memories, setMemories] = useState<SeedEngineeringMemory[]>([]);
  const [categories, setCategories] = useState<{
    incidents: number;
    decisions: number;
    lessons: number;
    warnings: number;
  }>({ incidents: 4, decisions: 1, lessons: 7, warnings: 5 });
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [bankId, setBankId] = useState<string>('opsmind-engineering');
  const [recallResponse, setRecallResponse] = useState<MemoryRecallResponse | null>(null);
  const [isRecalling, setIsRecalling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newMemoryAlert, setNewMemoryAlert] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'cards' | 'graph'>('cards');

  const loadKnowledge = async (showNotification = false) => {
    setIsRefreshing(true);
    try {
      const data = await fetchKnowledgeBase();
      const prevCount = memories.length;
      setMemories(data.memories);
      setCategories(data.categories);
      setBankId(data.bank_id);

      if (showNotification || (prevCount > 0 && data.memories.length > prevCount)) {
        const latest = data.memories[0];
        setNewMemoryAlert(
          latest?.incident_id
            ? `New memory available: ${latest.incident_id} (${latest.service}) retained into Hindsight.`
            : 'Knowledge base updated from Hindsight bank.'
        );
      }
    } catch (err) {
      console.warn('Failed to load memory knowledge base:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadKnowledge(false);
  }, []);

  const handleSearch = async (query: string) => {
    setIsRecalling(true);
    try {
      const response = await recallMemories(query, bankId);
      setRecallResponse(response);
    } catch (err: any) {
      console.error('Recall query error:', err);
    } finally {
      setIsRecalling(false);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (activeCategory === 'incidents') return m.memory_type === 'incident' || m.memory_type === 'incident_postmortem';
    if (activeCategory === 'postmortems') return m.memory_type === 'incident_postmortem' || m.incident_id?.includes('1127');
    if (activeCategory === 'decisions') return m.memory_type === 'decision';
    if (activeCategory === 'warnings') return m.warnings && m.warnings.length > 0;
    if (activeCategory === 'lessons') return m.lessons_learned && m.lessons_learned.length > 0;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white font-mono">
              HINDSIGHT MEMORY EXPLORER
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              BANK: {bankId}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inspection of persistent organizational memory, engineering postmortems, and decision records.
          </p>
        </div>

        {/* View Switcher & Refresh Button */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => loadKnowledge(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />}
            className="border-slate-700 text-slate-300 hover:text-white"
          >
            Refresh Memory
          </Button>

          <div className="flex rounded border border-slate-800 bg-[#070a12] p-0.5 text-xs font-mono">
            <button
              onClick={() => setActiveView('cards')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                activeView === 'cards'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Memory Cards ({memories.length})
            </button>
            <button
              onClick={() => setActiveView('graph')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                activeView === 'graph'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Relationship Graph
            </button>
          </div>
        </div>
      </div>

      {/* New Memory Alert banner */}
      {newMemoryAlert && (
        <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-4 flex items-center justify-between gap-3 text-xs font-mono text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white uppercase text-[11px] block">
                NEW MEMORY AVAILABLE
              </span>
              <span className="text-emerald-300/90">{newMemoryAlert}</span>
            </div>
          </div>
          <button
            onClick={() => setNewMemoryAlert(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* Real-time Query / Recall Bar */}
      <MemorySearch onSearch={handleSearch} isLoading={isRecalling} />

      {/* Live Hindsight Recall Results (if query was run) */}
      {recallResponse && (
        <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                LIVE RECALL QUERY RESULT ({recallResponse.count} FACTS RETURNED)
              </span>
            </div>
            <button
              onClick={() => setRecallResponse(null)}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200"
            >
              Dismiss ✕
            </button>
          </div>

          <div className="text-xs font-mono text-slate-300 bg-[#070a12] p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Query Sent to Hindsight:</span>
            <p className="mt-0.5 text-white font-medium">{recallResponse.query}</p>
          </div>

          {recallResponse.results.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No matching memories returned from bank.</p>
          ) : (
            <div className="space-y-2">
              {recallResponse.results.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded border border-slate-800 bg-[#070a12] p-3 text-xs space-y-1 font-mono"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-indigo-300 font-bold">
                      [{idx + 1}] {item.id || item.metadata?.incident_id || 'RECALLED FACT'}
                    </span>
                    {item.type && (
                      <span className="text-slate-400 uppercase text-[10px]">{item.type}</span>
                    )}
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed font-sans">{item.text}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 pt-1">
                      {item.tags.map((t) => (
                        <span key={t} className="text-[9px] text-slate-400 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {activeView === 'graph' ? (
        <MemoryRelationshipView />
      ) : (
        <div className="space-y-4">
          {/* Categories Tab Bar */}
          <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-800 pb-2 text-xs font-mono">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeCategory === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Memories ({memories.length})
            </button>
            <button
              onClick={() => setActiveCategory('incidents')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeCategory === 'incidents'
                  ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Incident Postmortems ({categories.incidents})
            </button>
            <button
              onClick={() => setActiveCategory('decisions')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeCategory === 'decisions'
                  ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Engineering Decisions ({categories.decisions})
            </button>
            <button
              onClick={() => setActiveCategory('warnings')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeCategory === 'warnings'
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-800/50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Warnings &amp; Anti-Patterns
            </button>
            <button
              onClick={() => setActiveCategory('lessons')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeCategory === 'lessons'
                  ? 'bg-amber-950/40 text-amber-300 border border-amber-800/50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lessons Learned
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMemories.map((mem, idx) => (
              <MemoryCard key={mem.incident_id || idx} memory={mem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
