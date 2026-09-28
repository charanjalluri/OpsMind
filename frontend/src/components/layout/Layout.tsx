import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { NavTab } from './Sidebar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  backendConnected: boolean;
  activeCount?: number;
  memoryCount?: number;
  bankId?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentTab,
  onSelectTab,
  backendConnected,
  activeCount,
  memoryCount,
  bankId,
}) => {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans">
      <Header
        backendConnected={backendConnected}
        bankId={bankId}
        activeCount={activeCount}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={onSelectTab}
          activeIncidentsCount={activeCount}
          memoryCount={memoryCount}
        />
        <main className="flex-1 overflow-y-auto bg-[#0a0d14] p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};
