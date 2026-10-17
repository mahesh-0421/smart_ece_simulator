
import React, { useState } from 'react';
import { TestbenchGenerateResponse } from '../types';
import { Cpu, Check, Copy, ArrowRight, X, HelpCircle } from 'lucide-react';

interface TestbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  testbenchData: TestbenchGenerateResponse | null;
  onInsertTestbench: (code: string) => void;
}

export const TestbenchModal: React.FC<TestbenchModalProps> = ({
  isOpen,
  onClose,
  testbenchData,
  onInsertTestbench,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !testbenchData) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(testbenchData.testbench_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleInsert = () => {
    onInsertTestbench(testbenchData.testbench_code);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--brand-light)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={16} />
            </div>

            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>
                Testbench Generation Assistant
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Target Module:{' '}
                <code style={{ color: 'var(--brand-primary)' }}>
                  {testbenchData.module_name}
                </code>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              backgroundColor: 'var(--bg-secondary)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Detected Inputs ({testbenchData.inputs.length}):
              </div>

              <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)' }}>
                {testbenchData.inputs.map((inp) => (
                  <li key={inp.name}>
                    <code>{inp.name}</code>{' '}
                    {inp.width > 1
                      ? `[${inp.width - 1}:0]`
                      : '(1-bit)'}

                    {inp.is_clock && (
                      <span
                        className="badge badge-blue"
                        style={{ marginLeft: '4px', fontSize: '9px' }}
                      >
                        Clock
                      </span>
                    )}

                    {inp.is_reset && (
                      <span
                        className="badge badge-amber"
                        style={{ marginLeft: '4px', fontSize: '9px' }}
                      >
                        Reset
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Detected Outputs ({testbenchData.outputs.length}):
              </div>

              <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)' }}>
                {testbenchData.outputs.map((out) => (
                  <li key={out.name}>
                    <code>{out.name}</code>{' '}
                    {out.width > 1
                      ? `[${out.width - 1}:0]`
                      : '(1-bit)'}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
            }}
          >
            <HelpCircle size={14} />

            <span>
              The generated testbench may include VCD waveform dumping,
              clock generation, and test stimulus. Insert it after your
              design module in the same Verilog editor. Ensure that the
              combined source contains only one copy of each module.
            </span>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
              }}
            >
              <span>GENERATED TESTBENCH CODE</span>

              <button
                onClick={handleCopy}
                className="btn btn-outline"
                style={{ padding: '3px 8px', fontSize: '11px' }}
              >
                {copied ? (
                  <Check size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {testbenchData.testbench_code}
            </pre>
          </div>
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>

          <button
            onClick={handleInsert}
            className="btn btn-primary"
          >
            Insert into Verilog Editor <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
