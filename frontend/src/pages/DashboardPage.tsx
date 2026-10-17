import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats, ExecutionRecord, SystemStatus } from '../types';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Cpu,
  FolderCode,
  ArrowRight,
  BookOpen,
  FileText,
  Play,
  RotateCw
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, state?: any) => void;
  status: SystemStatus | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, status }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRecords, setRecentRecords] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.getHistory(undefined, undefined, 8)
      .then(res => {
        setStats(res.stats);
        setRecentRecords(res.records);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header and Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Engineering Laboratory Dashboard
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Real-time execution analytics, compiler status, and quick laboratory actions
          </div>
        </div>
        <button onClick={loadData} className="btn btn-secondary" disabled={loading}>
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Metrics
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Saved Programs */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--brand-light)',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FolderCode size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Saved Programs</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats?.total_saved_programs ?? 0}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>In Local Database</div>
          </div>
        </div>

        {/* Card 2: Total Executions */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Executions</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats?.total_executions ?? 0}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {stats?.matlab_count ?? 0} MATLAB | {stats?.verilog_count ?? 0} Verilog
            </div>
          </div>
        </div>

        {/* Card 3: Successes */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--accent-green-bg)',
            color: 'var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Successful Runs</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-green)' }}>
              {stats?.successful_executions ?? 0}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {stats && stats.total_executions > 0
                ? `${Math.round((stats.successful_executions / stats.total_executions) * 100)}% Pass Rate`
                : '100% Pass Rate'}
            </div>
          </div>
        </div>

        {/* Card 4: Diagnostics & Errors */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--accent-red-bg)',
            color: 'var(--accent-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <XCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Errors / Timeouts</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-red)' }}>
              {stats?.failed_executions ?? 0}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Identified by Debugger</div>
          </div>
        </div>
      </div>

      {/* Quick Access Launch Pad */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
          Quick Laboratory Actions
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => onNavigate('matlab')}
            className="btn btn-primary"
            style={{ padding: '8px 16px' }}
          >
            <Terminal size={14} /> Open MATLAB IDE
          </button>
          <button
            onClick={() => onNavigate('verilog')}
            className="btn btn-primary"
            style={{ padding: '8px 16px', backgroundColor: '#10b981', borderColor: '#10b981' }}
          >
            <Cpu size={14} /> Open Verilog Simulator
          </button>
          <button
            onClick={() => onNavigate('experiments')}
            className="btn btn-secondary"
            style={{ padding: '8px 16px' }}
          >
            <BookOpen size={14} /> 20 ECE Laboratory Experiments
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="btn btn-secondary"
            style={{ padding: '8px 16px' }}
          >
            <FileText size={14} /> Generate Lab Report
          </button>
        </div>
      </div>

      {/* Recent Executions Table */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>
            Recent Simulation & Execution Records
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="btn btn-outline"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            View All History &rarr;
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No programs executed yet. Run an experiment or write a script to see real records here.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-color)',
                  textAlign: 'left',
                  color: 'var(--text-muted)'
                }}>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>PROGRAM NAME</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>MODULE</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>DURATION</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>ARTIFACTS</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    <td style={{ padding: '10px 16px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {r.program_name}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className={`badge ${r.language === 'matlab' ? 'badge-blue' : 'badge-success'}`}>
                        {r.language.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className={`badge ${r.status === 'success' ? 'badge-success' : 'badge-error'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {r.duration_ms} ms
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                      {r.has_plot && <span className="badge badge-blue" style={{ marginRight: '4px' }}>Plot</span>}
                      {r.has_waveform && <span className="badge badge-amber">VCD Waveform</span>}
                      {!r.has_plot && !r.has_waveform && <span style={{ color: 'var(--text-muted)' }}>Console Log</span>}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => onNavigate(r.language === 'matlab' ? 'matlab' : 'verilog', { code: r.source_code, testbench: r.testbench_code, filename: r.program_name })}
                        className="btn btn-outline"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                      >
                        <Play size={10} /> Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
