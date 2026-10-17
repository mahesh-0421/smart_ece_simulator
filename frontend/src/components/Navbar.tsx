import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Terminal,
  Activity,
  Layers,
  BookOpen,
  FolderCode,
  History,
  FileText,
  HelpCircle,
  Settings,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SystemStatus } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    api.getStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'matlab', label: 'MATLAB Workspace', icon: Terminal },
    { id: 'verilog', label: 'Verilog Workspace', icon: Cpu },
    { id: 'waveform', label: 'Waveform Viewer', icon: Layers },
    { id: 'experiments', label: 'ECE Experiments', icon: BookOpen },
    { id: 'programs', label: 'My Programs', icon: FolderCode },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'docs', label: 'Docs', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Brand */}
        <div
          onClick={() => setActiveTab('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #10b981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            Σ
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Smart ECE Lab
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              MATLAB & Verilog Compiler, Simulation & Debugger
            </div>
          </div>
        </div>

        {/* Engine status indicators & controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {status && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
              {/* Octave status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: status.tools.octave.available ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                  color: status.tools.octave.available ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontWeight: 600,
                }}
                title={status.tools.octave.available ? `GNU Octave ready at ${status.tools.octave.path}` : 'GNU Octave not found'}
              >
                {status.tools.octave.available ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                Octave: {status.tools.octave.available ? 'Ready' : 'Missing'}
              </div>

              {/* Icarus Verilog status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: status.tools.iverilog.available ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                  color: status.tools.iverilog.available ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontWeight: 600,
                }}
                title={status.tools.iverilog.available ? 'Icarus Verilog & VVP ready' : 'Icarus Verilog or VVP not found'}
              >
                {status.tools.iverilog.available ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                Iverilog: {status.tools.iverilog.available ? 'Ready' : 'Missing'}
              </div>

              {/* Single User Badge */}
              <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                Local Mode
              </span>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>

      {/* Navigation tabs */}
      <nav style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '0 16px',
        gap: '4px',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 12px',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
