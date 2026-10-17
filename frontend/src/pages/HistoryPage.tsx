import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ExecutionRecord } from '../types';
import {
  History,
  Terminal,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Play,
  RotateCw,
  Eye,
  X
} from 'lucide-react';

interface HistoryPageProps {
  onLoadIntoWorkspace: (language: 'matlab' | 'verilog', code: string, testbench?: string, filename?: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onLoadIntoWorkspace }) => {
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [langFilter, setLangFilter] = useState<'all' | 'matlab' | 'verilog'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<ExecutionRecord | null>(null);

  const loadHistory = () => {
    setLoading(true);
    api.getHistory(langFilter === 'all' ? undefined : langFilter, undefined, 100)
      .then(res => setRecords(res.records))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, [langFilter]);

  const handleClear = async () => {
    if (window.confirm('Clear all execution history records?')) {
      await api.clearHistory();
      setRecords([]);
    }
  };

  const handleInspectDetail = async (id: number) => {
    try {
      const fullRecord = await api.getHistoryDetail(id);
      setSelectedRecord(fullRecord);
    } catch (err: any) {
      alert('Failed to load history details: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Execution & Simulation History
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Audit log of all past compilation attempts, MATLAB runs, and Verilog simulations
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={loadHistory} className="btn btn-secondary" style={{ fontSize: '12px' }} disabled={loading}>
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={handleClear} className="btn btn-outline" style={{ fontSize: '12px', color: 'var(--accent-red)' }}>
            <Trash2 size={13} /> Clear History
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => setLangFilter('all')}
          className={`btn ${langFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px' }}
        >
          All Records ({records.length})
        </button>
        <button
          onClick={() => setLangFilter('matlab')}
          className={`btn ${langFilter === 'matlab' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px' }}
        >
          <Terminal size={13} /> MATLAB
        </button>
        <button
          onClick={() => setLangFilter('verilog')}
          className={`btn ${langFilter === 'verilog' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px' }}
        >
          <Cpu size={13} /> Verilog
        </button>
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading execution records...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <History size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
            <div style={{ fontSize: '14px', fontWeight: 600 }}>No Execution History Available</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Run scripts in the MATLAB or Verilog workspaces to populate execution logs.
            </div>
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
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>LANGUAGE</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>DURATION</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>ARTIFACTS</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>TIMESTAMP</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
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
                    <td style={{ padding: '10px 16px' }}>
                      {r.has_plot && <span className="badge badge-blue" style={{ marginRight: '4px' }}>Plot</span>}
                      {r.has_waveform && <span className="badge badge-amber">Waveform</span>}
                      {!r.has_plot && !r.has_waveform && <span style={{ color: 'var(--text-muted)' }}>Console</span>}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handleInspectDetail(r.id)}
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          title="Inspect Details"
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>
                  Execution Record #{selectedRecord.id}: {selectedRecord.program_name}
                </h3>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="btn btn-outline" style={{ padding: '4px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
                <div>Status: <span className={`badge ${selectedRecord.status === 'success' ? 'badge-success' : 'badge-error'}`}>{selectedRecord.status}</span></div>
                <div>Language: <b style={{ textTransform: 'uppercase' }}>{selectedRecord.language}</b></div>
                <div>Elapsed Duration: <b>{selectedRecord.duration_ms} ms</b></div>
                <div>Timestamp: <b>{new Date(selectedRecord.created_at).toLocaleString()}</b></div>
              </div>

              {selectedRecord.source_code && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    SOURCE CODE EXECUTED:
                  </div>
                  <pre style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    maxHeight: '160px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedRecord.source_code}
                  </pre>
                </div>
              )}

              {selectedRecord.stdout && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    STANDARD OUTPUT (STDOUT):
                  </div>
                  <pre style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedRecord.stdout}
                  </pre>
                </div>
              )}

              {selectedRecord.stderr && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-red)', marginBottom: '4px' }}>
                    DIAGNOSTIC ERROR (STDERR):
                  </div>
                  <pre style={{
                    backgroundColor: 'var(--accent-red-bg)',
                    color: 'var(--accent-red)',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedRecord.stderr}
                  </pre>
                </div>
              )}
            </div>

            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                onClick={() => {
                  onLoadIntoWorkspace(
                    selectedRecord.language,
                    selectedRecord.source_code || '',
                    selectedRecord.testbench_code || undefined,
                    selectedRecord.program_name
                  );
                  setSelectedRecord(null);
                }}
                className="btn btn-primary"
                style={{ fontSize: '12px' }}
              >
                <Play size={12} /> Reopen in Workspace
              </button>

              <button onClick={() => setSelectedRecord(null)} className="btn btn-secondary" style={{ fontSize: '12px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
