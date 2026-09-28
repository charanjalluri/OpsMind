import { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import type { NavTab } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Incidents } from './pages/Incidents';
import { IncidentDetail } from './pages/IncidentDetail';
import { MemoryExplorer } from './pages/MemoryExplorer';
import { DemoLearning } from './pages/DemoLearning';
import type { ActiveIncident } from './types/incident';
import { fetchHealth, fetchDashboardStats } from './services/incidents';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedIncident, setSelectedIncident] = useState<ActiveIncident | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [activeCount, setActiveCount] = useState<number>(3);
  const [memoryCount, setMemoryCount] = useState<number>(47);
  const [bankId, setBankId] = useState<string>('opsmind-engineering');
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);

  useEffect(() => {
    // Check backend health and stats
    fetchHealth()
      .then((res) => {
        setBackendConnected(res.status === 'ok');
      })
      .catch(() => {
        setBackendConnected(false);
      });

    fetchDashboardStats()
      .then((stats) => {
        setActiveCount(stats.active_incidents);
        setMemoryCount(stats.engineering_memories);
        setBankId(stats.memory_signal.bank_id);
      })
      .catch((err) => {
        console.warn('Backend stats connection fallback:', err);
      });
  }, []);

  const handleSelectIncident = (incident: ActiveIncident) => {
    setSelectedIncident(incident);
    setCurrentTab('investigation');
  };

  const handleBackToIncidents = () => {
    setCurrentTab('incidents');
  };

  const handleNavigateToMemoryId = (memId: string) => {
    setSelectedMemoryId(memId);
    setCurrentTab('memory');
  };

  return (
    <Layout
      currentTab={currentTab}
      onSelectTab={(tab) => {
        setCurrentTab(tab);
      }}
      backendConnected={backendConnected}
      activeCount={activeCount}
      memoryCount={memoryCount}
      bankId={bankId}
    >
      {currentTab === 'dashboard' && (
        <Dashboard
          onSelectIncident={handleSelectIncident}
          onNavigateToMemory={() => setCurrentTab('memory')}
          onNavigateToDemo={() => setCurrentTab('demo')}
        />
      )}

      {currentTab === 'incidents' && (
        <Incidents onSelectIncident={handleSelectIncident} />
      )}

      {currentTab === 'investigation' && (
        <IncidentDetail
          incident={
            selectedIncident || {
              incident_id: 'INC-1127',
              service: 'payment-api',
              severity: 'SEV-1',
              status: 'Investigating',
              title: 'Payment API returning HTTP 502 after deployment',
              environment: 'production',
              deployment_version: 'v2.9.1',
              symptoms: [
                'HTTP 502 responses increased immediately after deployment v2.9.1',
                'Gateway timeouts on /v1/charges and /v1/refunds',
                'Spike in 502 Bad Gateway alerts across European payment ingress',
              ],
              description:
                'Immediate surge in 502 Bad Gateway responses following rolling release of payment-api v2.9.1 to production. On-call engineer alerted.',
              started_at: '4m ago',
              affected_endpoints: ['/v1/charges', '/v1/refunds'],
            }
          }
          onBack={handleBackToIncidents}
          onNavigateToMemoryId={handleNavigateToMemoryId}
          onNavigateToMemory={() => setCurrentTab('memory')}
        />
      )}

      {currentTab === 'memory' && (
        <MemoryExplorer selectedMemoryId={selectedMemoryId} />
      )}

      {currentTab === 'demo' && <DemoLearning />}
    </Layout>
  );
}

export default App;
