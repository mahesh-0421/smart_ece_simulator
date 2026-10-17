import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MatlabWorkspacePage } from './pages/MatlabWorkspacePage';
import { VerilogWorkspacePage } from './pages/VerilogWorkspacePage';
import { WaveformViewerPage } from './pages/WaveformViewerPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { DocsPage } from './pages/DocsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SystemStatus } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // States for transferring code when student clicks "Run in Workspace" from Experiments or History
  const [matlabInitialCode, setMatlabInitialCode] = useState<string | undefined>(undefined);
  const [matlabInitialFilename, setMatlabInitialFilename] = useState<string | undefined>(undefined);

  const [verilogInitialDesign, setVerilogInitialDesign] = useState<string | undefined>(undefined);
  const [verilogInitialTb, setVerilogInitialTb] = useState<string | undefined>(undefined);
  const [verilogInitialFilename, setVerilogInitialFilename] = useState<string | undefined>(undefined);

  useEffect(() => {
    api.getStatus()
      .then(setSystemStatus)
      .catch(console.error);
  }, []);

  const handleLoadIntoWorkspace = (
    language: 'matlab' | 'verilog',
    code: string,
    testbench?: string,
    filename?: string
  ) => {
    if (language === 'matlab') {
      setMatlabInitialCode(code);
      setMatlabInitialFilename(filename || 'script.m');
      setActiveTab('matlab');
    } else {
      setVerilogInitialDesign(code);
      setVerilogInitialTb(testbench || '');
      setVerilogInitialFilename(filename || 'design.v');
      setActiveTab('verilog');
    }
  };

  const handleNavigate = (tab: string, state?: any) => {
    if (state) {
      if (tab === 'matlab') {
        if (state.code) setMatlabInitialCode(state.code);
        if (state.filename) setMatlabInitialFilename(state.filename);
      } else if (tab === 'verilog') {
        if (state.code) setVerilogInitialDesign(state.code);
        if (state.testbench) setVerilogInitialTb(state.testbench);
        if (state.filename) setVerilogInitialFilename(state.filename);
      }
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'landing' && (
          <LandingPage onNavigate={handleNavigate} status={systemStatus} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage onNavigate={handleNavigate} status={systemStatus} />
        )}

        {activeTab === 'matlab' && (
          <MatlabWorkspacePage
            key={matlabInitialFilename || 'matlab-workspace'}
            initialCode={matlabInitialCode}
            initialFilename={matlabInitialFilename}
          />
        )}

        {activeTab === 'verilog' && (
          <VerilogWorkspacePage
            key={verilogInitialFilename || 'verilog-workspace'}
            initialDesignCode={verilogInitialDesign}
            initialTbCode={verilogInitialTb}
            initialFilename={verilogInitialFilename}
          />
        )}

        {activeTab === 'waveform' && (
          <WaveformViewerPage />
        )}

        {activeTab === 'experiments' && (
          <ExperimentsPage onLoadIntoWorkspace={handleLoadIntoWorkspace} />
        )}

        {activeTab === 'programs' && (
          <ProgramsPage onLoadIntoWorkspace={handleLoadIntoWorkspace} onNavigate={handleNavigate} />
        )}

        {activeTab === 'history' && (
          <HistoryPage onLoadIntoWorkspace={handleLoadIntoWorkspace} />
        )}

        {activeTab === 'reports' && (
          <ReportsPage />
        )}

        {activeTab === 'docs' && (
          <DocsPage />
        )}

        {activeTab === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Academic Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Smart ECE Lab</span>
          <span>&bull;</span>
          <span>Web-Based MATLAB & Verilog Simulation Platform</span>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => setActiveTab('docs')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '12px' }}>
            Documentation
          </button>
          <button onClick={() => setActiveTab('experiments')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '12px' }}>
            Experiments
          </button>
          <button onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '12px' }}>
            System Status
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
