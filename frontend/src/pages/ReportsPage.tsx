import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ExecutionRecord } from '../types';
import { FileText, Download, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [title, setTitle] = useState('ECE Laboratory Experiment Report');
  const [language, setLanguage] = useState<'matlab' | 'verilog'>('matlab');
  const [objective, setObjective] = useState('Demonstrate numerical computation and signal behavior using GNU Octave.');
  const [code, setCode] = useState('t = 0:0.01:1;\ny = sin(2*pi*5*t);\nplot(t, y);\ngrid on;\ntitle("5 Hz Sinusoid");\n');
  const [testbenchCode, setTestbenchCode] = useState('');
  const [status, setStatus] = useState('success');
  const [durationMs, setDurationMs] = useState(35.2);
  const [stdout, setStdout] = useState('5 Hz Sinusoid plotted successfully across 101 sample points.');
  const [stderr, setStderr] = useState('');
  const [conclusion, setConclusion] = useState('The experimental output matches theoretical sinusoidal frequency and amplitude.');

  const [recentRecords, setRecentRecords] = useState<ExecutionRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    api.getHistory(undefined, undefined, 10)
      .then(res => setRecentRecords(res.records))
      .catch(console.error);
  }, []);

  const handleLoadFromHistory = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    if (!id) return;
    try {
      const rec = await api.getHistoryDetail(id);
      setTitle(`Report: ${rec.program_name}`);
      setLanguage(rec.language);
      setCode(rec.source_code || '');
      setTestbenchCode(rec.testbench_code || '');
      setStatus(rec.status);
      setDurationMs(rec.duration_ms);
      setStdout(rec.stdout || '');
      setStderr(rec.stderr || '');
      setObjective(`Laboratory analysis of ${rec.program_name} using ${rec.language === 'matlab' ? 'GNU Octave' : 'Icarus Verilog'}.`);
      setConclusion(rec.status === 'success' ? 'Execution passed with expected results.' : 'Execution failed diagnostic verification.');
    } catch (err: any) {
      alert('Failed to load past record: ' + err.message);
    }
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);
    try {
      await api.generateReport({
        title,
        language,
        code,
        testbench_code: testbenchCode || undefined,
        status,
        duration_ms: durationMs,
        stdout,
        stderr,
        objective,
        conclusion
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      alert('Report generation error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Laboratory Report Generator
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Compile formal academic PDF laboratory documentation with code, terminal outputs, and faculty signature blocks
          </div>
        </div>

        {recentRecords.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Load from Recent Run:</span>
            <select onChange={handleLoadFromHistory} defaultValue="" className="select" style={{ width: '220px', fontSize: '12px' }}>
              <option value="" disabled>Select past execution...</option>
              {recentRecords.map(r => (
                <option key={r.id} value={r.id}>
                  #{r.id} - {r.program_name} ({r.language})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Report Config Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Experiment / Report Title:
            </label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Module / Language:
            </label>
            <select
              className="select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
            >
              <option value="matlab">MATLAB / Octave</option>
              <option value="verilog">Verilog HDL</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
            1. Experiment Objective:
          </label>
          <textarea
            className="textarea"
            rows={2}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
            2. Source Code Implementation:
          </label>
          <textarea
            className="textarea"
            rows={6}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {language === 'verilog' && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              3. Verilog Testbench Stimulus (Optional):
            </label>
            <textarea
              className="textarea"
              rows={4}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              value={testbenchCode}
              onChange={(e) => setTestbenchCode(e.target.value)}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Execution Output (Stdout):
            </label>
            <textarea
              className="textarea"
              rows={4}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
              value={stdout}
              onChange={(e) => setStdout(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Compiler / Diagnostic Errors (Stderr):
            </label>
            <textarea
              className="textarea"
              rows={4}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
              value={stderr}
              onChange={(e) => setStderr(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
            4. Conclusion & Observations:
          </label>
          <textarea
            className="textarea"
            rows={2}
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
          />
        </div>

        {/* Generate Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          {downloadSuccess ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontWeight: 600, fontSize: '13px' }}>
              <CheckCircle2 size={16} /> PDF Lab Report Generated and Downloaded!
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Uses ReportLab on Python backend to render academic tables, plots, and waveforms.
            </div>
          )}

          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span>{isGenerating ? 'Compiling PDF...' : 'Download PDF Laboratory Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
