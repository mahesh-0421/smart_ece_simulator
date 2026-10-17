import React from 'react';
import { WaveformAnalysisResponse } from '../types';
import { CheckCircle2, XCircle, Activity, Clock, Zap, X } from 'lucide-react';

interface WaveformAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: WaveformAnalysisResponse | null;
}

export const WaveformAnalysisModal: React.FC<WaveformAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  if (!isOpen || !analysis) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--brand-light)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Activity size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Automated Waveform Analysis</h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Signal transition statistics & assertion checks
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary Box */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '13px',
            color: 'var(--text-primary)',
            lineHeight: 1.5
          }}>
            {analysis.summary}
          </div>

          {/* Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
          }}>
            <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Total Sim Time
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {analysis.total_time}
              </div>
            </div>

            <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Active Signals
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand-primary)' }}>
                {analysis.signals_count}
              </div>
            </div>

            <div className="card" style={{ padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Transitions
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-green)' }}>
                {analysis.total_transitions}
              </div>
            </div>
          </div>

          {/* Clock Detection Card */}
          {analysis.clock_detected && (
            <div style={{
              backgroundColor: 'var(--brand-light)',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} />
                <span>Detected Clock Generator: {analysis.clock_detected.signal_name}</span>
              </div>
              <div style={{ display: 'flex', gap: '20px', color: 'var(--text-primary)', marginTop: '4px' }}>
                <span>Period: <b>{analysis.clock_detected.period} {analysis.clock_detected.timescale}</b></span>
                <span>Frequency: <b>{analysis.clock_detected.estimated_frequency}</b></span>
                <span>Cycles: <b>{analysis.clock_detected.total_cycles}</b></span>
              </div>
            </div>
          )}

          {/* Check results */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Sequential & Formal Verification Assertions:
            </div>
            {analysis.check_results.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No explicit signal assertions were configured for this test run.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysis.check_results.map((chk, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '6px',
                      backgroundColor: chk.passed ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                      border: `1px solid ${chk.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      fontSize: '12px'
                    }}
                  >
                    {chk.passed ? (
                      <CheckCircle2 size={16} color="var(--accent-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    ) : (
                      <XCircle size={16} color="var(--accent-red)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: chk.passed ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {chk.check_type}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {chk.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} className="btn btn-primary">
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
