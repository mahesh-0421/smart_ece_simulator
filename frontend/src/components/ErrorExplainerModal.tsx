import React from 'react';
import { ErrorExplanationResponse } from '../types';
import { AlertTriangle, CheckCircle, X, Sparkles, Code } from 'lucide-react';

interface ErrorExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: ErrorExplanationResponse | null;
  onApplyFix?: (code: string) => void;
}

export const ErrorExplainerModal: React.FC<ErrorExplainerModalProps> = ({
  isOpen,
  onClose,
  explanation,
  onApplyFix,
}) => {
  if (!isOpen || !explanation) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
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
              backgroundColor: 'var(--accent-amber-bg)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Intelligent Error Explainer</h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Powered by {explanation.provider_used === 'ai_model' ? 'AI Assistant' : 'Deterministic ECE Knowledge Base'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Diagnostic Error Message */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              ORIGINAL COMPILER / RUNTIME DIAGNOSTIC:
            </div>
            <pre style={{
              backgroundColor: 'var(--accent-red-bg)',
              color: 'var(--accent-red)',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'pre-wrap',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {explanation.original_error}
            </pre>
          </div>

          {/* Line number badge */}
          {explanation.line_number && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                Detected on Line: {explanation.line_number}
              </span>
            </div>
          )}

          {/* Likely Cause */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              What Caused This Error?
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {explanation.likely_cause}
            </p>
          </div>

          {/* Suggested Fix */}
          <div style={{
            backgroundColor: 'var(--brand-light)',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(37, 99, 235, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--brand-primary)',
              marginBottom: '4px'
            }}>
              <Sparkles size={14} />
              <span>Recommended Engineering Fix</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {explanation.suggested_fix}
            </p>
          </div>

          {/* Proposed Code Correction if present */}
          {explanation.corrected_code && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                PROPOSED CODE REPAIR:
              </div>
              <pre style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                border: '1px solid var(--border-color)'
              }}>
                {explanation.corrected_code}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          {explanation.corrected_code && onApplyFix && (
            <button
              onClick={() => {
                onApplyFix(explanation.corrected_code!);
                onClose();
              }}
              className="btn btn-primary"
            >
              <CheckCircle size={14} />
              Apply Fix to Editor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
