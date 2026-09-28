import React from 'react';
import {
  LayoutDashboard,
  AlertOctagon,
  BrainCircuit,
  Workflow,
  GitCommit,
  Server,
  BookOpen,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'incidents' | 'investigation' | 'memory' | 'demo';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeIncidentsCount?: number;
  memoryCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeIncidentsCount = 3,
  memoryCount = 47,
}) => {
  const mainNav = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'incidents' as NavTab,
      label: 'Incidents',
      icon: AlertOctagon,
      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount}` : null,
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
    {
      id: 'memory' as NavTab,
      label: 'Memory Explorer',
      icon: BrainCircuit,
      badge: `${memoryCount}`,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700 font-medium',
      highlight: true,
    },
    {
      id: 'demo' as NavTab,
      label: 'Experience Loop',
      icon: Workflow,
      badge: 'DEMO',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
    },
  ];

  const futureNav = [
    { label: 'Deployments', icon: GitCommit },
    { label: 'Services', icon: Server },
    { label: 'Runbooks', icon: BookOpen },
  ];

  return (
    <aside className="w-56 border-r border-slate-800 bg-[#070a12] flex flex-col justify-between shrink-0 select-none">
      <div className="p-3 space-y-6">
        {/* Core SRE Console Navigation */}
        <div className="space-y-1">
          <p className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            OPERATIONS
          </p>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-medium border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-sky-400'
                        : item.highlight
                        ? 'text-indigo-400'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Future Integrations */}
        <div className="space-y-1">
          <p className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            PLATFORM (FUTURE)
          </p>
          {futureNav.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded text-xs text-slate-500 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">
                  SOON
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Persistent Memory Badge in Sidebar */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090d16]">
        <div className="p-2.5 rounded border border-slate-800 bg-[#070a12] text-xs">
          <div className="flex items-center gap-1.5 text-indigo-300 font-mono text-[11px] font-semibold">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>HINDSIGHT ACTIVE</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Persistent incident experience retained across team postmortems.
          </p>
        </div>
      </div>
    </aside>
  );
};
