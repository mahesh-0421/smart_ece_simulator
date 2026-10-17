import React, { useState } from 'react';
import { api } from '../services/api';
import { FileText, Download, X, Loader2 } from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle: string;
  language: string;
  code: string;
  testbenchCode?: string | null;
  status: string;
  durationMs: number;
  stdout: string;
  stderr: string;
  plotImageBase64?: string | null;
  vcdRaw?: string | null;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  defaultTitle,
  language,
  code,
  testbenchCode,
  status,
  durationMs,
  stdout,
  stderr,
  plotImageBase64,
  vcdRaw,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [objective, setObjective] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      await api.generateReport({
        title: title || 'ECE Laboratory Report',
        language,
        code,
        testbench_code: testbenchCode,
        status,
        duration_ms: durationMs,
        stdout,
        stderr,
        plot_image_base64: plotImageBase64,
        vcd_raw: vcdRaw,
        objective: objective.trim() || undefined,
        conclusion: conclusion.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
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
              <FileText size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Generate Laboratory Report</h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Download an official academic PDF with source code, outputs, and graphs
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMsg && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--accent-red-bg)',
              color: 'var(--accent-red)',
              fontSize: '12px'
            }}>
              {errorMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Experiment / Report Title:
            </label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 4-Bit Synchronous Counter Verification"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Experiment Objective (Optional):
            </label>
            <textarea
              className="textarea"
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Describe the aim of the laboratory experiment..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Conclusion & Observations (Optional):
            </label>
            <textarea
              className="textarea"
              rows={2}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Summarize simulation findings or theoretical verification..."
            />
          </div>

          {/* Included Artifacts Checklist */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
              Artifacts Automatically Embedded in PDF:
            </div>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <li>Source Code & Testbench</li>
              <li>Terminal stdout / stderr diagnostics</li>
              <li>Status ({status.toUpperCase()}) & Duration ({durationMs} ms)</li>
              {plotImageBase64 && <li>Generated GNU Octave Graphical Plot (Embedded image)</li>}
              {vcdRaw && <li>Rendered Digital Timing Waveform (Vector diagram)</li>}
              <li>Student and Faculty Signature blocks</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}>
          <button onClick={onClose} className="btn btn-secondary" disabled={isGenerating}>
            Cancel
          </button>
          <button onClick={handleDownload} className="btn btn-primary" disabled={isGenerating}>
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isGenerating ? 'Compiling PDF...' : 'Download PDF Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
