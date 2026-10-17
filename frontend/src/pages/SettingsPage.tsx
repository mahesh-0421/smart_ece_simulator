import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SystemStatus } from '../types';
import { Settings, CheckCircle2, AlertCircle, Shield, RefreshCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    api.getStatus()
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            System Settings & Tool Diagnostics
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Inspect compiler binaries, execution limits, and AI debugger settings
          </div>
        </div>
        <button onClick={fetchStatus} className="btn btn-secondary" disabled={loading} style={{ fontSize: '12px' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Check Status
        </button>
      </div>

      {/* Tool Availability Cards */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Compiler & Engine Diagnostics</h3>

        {/* Octave */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}>
              {status?.tools.octave.available ? (
                <CheckCircle2 size={16} color="var(--accent-green)" />
              ) : (
                <AlertCircle size={16} color="var(--accent-red)" />
              )}
              <span>GNU Octave (MATLAB-Compatible Engine)</span>
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
              Path: {status?.tools.octave.path || 'Not detected on PATH'}
            </div>
          </div>
          <span className={`badge ${status?.tools.octave.available ? 'badge-success' : 'badge-error'}`}>
            {status?.tools.octave.available ? 'Operational' : 'Missing'}
          </span>
        </div>

        {/* Icarus Verilog */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}>
              {status?.tools.iverilog.available ? (
                <CheckCircle2 size={16} color="var(--accent-green)" />
              ) : (
                <AlertCircle size={16} color="var(--accent-red)" />
              )}
              <span>Icarus Verilog & VVP Simulator</span>
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
              Compiler: {status?.tools.iverilog.iverilog_path || 'Not found'} | VVP: {status?.tools.iverilog.vvp_path || 'Not found'}
            </div>
          </div>
          <span className={`badge ${status?.tools.iverilog.available ? 'badge-success' : 'badge-error'}`}>
            {status?.tools.iverilog.available ? 'Operational' : 'Missing'}
          </span>
        </div>

        {/* AI Debugger Provider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>
              Intelligent Error Debugger Mode
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Mode: {status?.tools.ai_debugger.configured ? 'AI Provider Active' : 'Deterministic ECE Knowledge Base (Offline)'}
            </div>
          </div>
          <span className="badge badge-blue">
            {status?.tools.ai_debugger.provider || 'Deterministic'}
          </span>
        </div>
      </div>

      {/* Resource & Security Limits */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Active Sandbox Resource Limits</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MAX EXECUTION TIMEOUT</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {status?.limits.max_execution_time_sec ?? 15} seconds
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Protects against infinite while-loops and non-terminating clocks
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MAX CODE SIZE</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {status ? `${Math.round(status.limits.max_code_size_bytes / 1024)} KB` : '64 KB'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Maximum allowable student source file submission size
            </div>
          </div>
        </div>
      </div>

      {/* Deployment & Mode Info */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          Academic Deployment Notice:
        </div>
        <div>
          This system is configured in <b>Single-User Academic Demonstration Mode</b> with local SQLite persistence. For multi-tenant departmental hosting, student account authentication and containerized worker isolation (Docker/gVisor) can be enabled via configuration.
        </div>
      </div>
    </div>
  );
};
