import React, { useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { ErrorExplainerModal } from '../components/ErrorExplainerModal';
import { ReportExportModal } from '../components/ReportExportModal';
import { api } from '../services/api';
import { MatlabExecuteResponse, ErrorExplanationResponse } from '../types';
import {
  Play,
  RotateCcw,
  Save,
  Download,
  FileText,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Loader2
} from 'lucide-react';

interface MatlabWorkspacePageProps {
  initialCode?: string;
  initialFilename?: string;
}

const DEFAULT_MATLAB_CODE = `% Smart ECE Lab - MATLAB-Compatible Script
% Example: Vector Operations and 2D Plotting
a = 0:0.05:2*pi;
b = sin(a);
c = cos(a);

disp('Generated vector points:');
disp(['Total samples: ', num2str(length(a))]);

figure(1);
plot(a, b, 'b-', 'LineWidth', 2);
hold on;
plot(a, c, 'r--', 'LineWidth', 2);
grid on;
title('Sine and Cosine Waveforms');
xlabel('Angle (radians)');
ylabel('Amplitude');
legend('sin(a)', 'cos(a)');
`;

const EXAMPLES = [
  {
    name: 'Sine & Cosine Plot',
    code: DEFAULT_MATLAB_CODE,
    filename: 'sine_cosine_plot.m'
  },
  {
    name: 'Matrix Multiplication',
    code: `% Matrix Operations and Linear Algebra
A = [1, 2, 3; 4, 5, 6; 7, 8, 9];
B = [9, 8, 7; 6, 5, 4; 3, 2, 1];

disp('Matrix A:');
disp(A);

disp('Matrix B:');
disp(B);

disp('Matrix Addition (A + B):');
disp(A + B);

disp('Matrix Multiplication (A * B):');
disp(A * B);

disp('Element-Wise Multiplication (A .* B):');
disp(A .* B);
`,
    filename: 'matrix_ops.m'
  },
  {
    name: 'FFT Frequency Spectrum',
    code: `% Fast Fourier Transform Demonstration
Fs = 200;            % Sampling frequency (Hz)
T = 1/Fs;             % Sampling interval
L = 200;              % Length of signal
t = (0:L-1)*T;        % Time vector

% Form composite signal: 10 Hz + 25 Hz tones
S = 0.7*sin(2*pi*10*t) + 1.2*sin(2*pi*25*t);

% Compute FFT
Y = fft(S);
P2 = abs(Y/L);
P1 = P2(1:L/2+1);
P1(2:end-1) = 2*P1(2:end-1);
f_axis = Fs*(0:(L/2))/L;

figure(1);
plot(f_axis, P1, 'b-', 'LineWidth', 2);
grid on;
title('Single-Sided Amplitude Spectrum (FFT)');
xlabel('Frequency (Hz)');
ylabel('|P1(f)|');

disp('Fast Fourier Transform completed.');
`,
    filename: 'fft_spectrum.m'
  },
  {
    name: 'Discrete Convolution',
    code: `% Discrete Linear Convolution
x = [1, 2, 3, 1];
h = [1, 1, 1];

y = conv(x, h);

disp('Input signal x[n]:');
disp(x);
disp('Impulse response h[n]:');
disp(h);
disp('Convolution y[n] = x[n] * h[n]:');
disp(y);

figure(1);
subplot(3, 1, 1); stem(0:length(x)-1, x, 'filled'); grid on; title('x[n]');
subplot(3, 1, 2); stem(0:length(h)-1, h, 'filled', 'r'); grid on; title('h[n]');
subplot(3, 1, 3); stem(0:length(y)-1, y, 'filled', 'k'); grid on; title('y[n]');
`,
    filename: 'discrete_conv.m'
  }
];

export const MatlabWorkspacePage: React.FC<MatlabWorkspacePageProps> = ({
  initialCode,
  initialFilename
}) => {
  const [code, setCode] = useState<string>(initialCode || DEFAULT_MATLAB_CODE);
  const [filename, setFilename] = useState<string>(initialFilename || 'script.m');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<MatlabExecuteResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'output' | 'plot'>('output');

  // Modals
  const [errorExplanation, setErrorExplanation] = useState<ErrorExplanationResponse | null>(null);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setSaveSuccessMsg(null);
    try {
      const res = await api.executeMatlab(code, filename);
      setResult(res);
      if (res.has_plot) {
        setActiveTab('plot');
      } else {
        setActiveTab('output');
      }
    } catch (err: any) {
      setResult({
        success: false,
        stdout: '',
        stderr: err.message || 'Execution error',
        exit_code: 1,
        duration_ms: 0,
        has_plot: false,
        error_summary: err.message
      });
      setActiveTab('output');
    } finally {
      setIsRunning(false);
    }
  };

  const handleExplainError = async () => {
    if (!result || !result.stderr) return;
    setIsExplaining(true);
    try {
      const exp = await api.explainError('matlab', code, result.stderr);
      setErrorExplanation(exp);
      setIsExplainerOpen(true);
    } catch (err: any) {
      alert('Could not explain error: ' + err.message);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSaveProgram = async () => {
    try {
      await api.createProgram({
        title: filename.replace('.m', ''),
        filename: filename.endsWith('.m') ? filename : `${filename}.m`,
        language: 'matlab',
        code,
        description: 'Saved from MATLAB Workspace'
      });
      setSaveSuccessMsg('Program saved to library successfully!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Failed to save program: ' + err.message);
    }
  };

  const handleDownloadSource = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.m') ? filename : `${filename}.m`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadExample = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = EXAMPLES.find(ex => ex.name === e.target.value);
    if (selected) {
      setCode(selected.code);
      setFilename(selected.filename);
      setResult(null);
    }
  };

  return (
    <div style={{ padding: '16px 20px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        backgroundColor: 'var(--bg-card)',
        padding: '10px 16px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Left: File input and Run */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>File:</span>
            <input
              type="text"
              className="input"
              style={{ width: '150px', padding: '5px 8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="btn btn-primary"
            style={{ padding: '6px 14px' }}
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            <span>{isRunning ? 'Executing...' : 'Run Program'}</span>
          </button>

          <button
            onClick={() => { setCode(''); setResult(null); }}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
            title="Clear Editor"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>

          {/* Example Loader Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={13} color="var(--text-muted)" />
            <select
              onChange={handleLoadExample}
              defaultValue=""
              className="select"
              style={{ width: '180px', padding: '5px 8px', fontSize: '12px' }}
            >
              <option value="" disabled>Load Example Program...</option>
              {EXAMPLES.map(ex => (
                <option key={ex.name} value={ex.name}>{ex.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Save, Download, Report */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {saveSuccessMsg && (
            <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>
              {saveSuccessMsg}
            </span>
          )}

          <button
            onClick={handleSaveProgram}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Save size={13} />
            <span>Save</span>
          </button>

          <button
            onClick={handleDownloadSource}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Download size={13} />
            <span>Download .m</span>
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <FileText size={13} />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Editor (Left) & Output / Plot (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(420px, 1.15fr) minmax(380px, 1fr)',
        gap: '14px',
        alignItems: 'stretch'
      }}>
        {/* Left Column: Monaco Code Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            padding: '0 4px'
          }}>
            <span>MATLAB / OCTAVE SOURCE CODE</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              GNU Octave 11.3 Execution Engine
            </span>
          </div>

          <CodeEditor
            value={code}
            onChange={setCode}
            language="matlab"
            height="560px"
          />
        </div>

        {/* Right Column: Execution Results, Terminal & Plot Tabs */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          height: '584px'
        }}>
          {/* Header Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            minHeight: '40px'
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setActiveTab('output')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: activeTab === 'output' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'output' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'output' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <span>Console Output</span>
                {result && (
                  <span className={`badge ${result.success ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                    {result.success ? 'Pass' : 'Error'}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('plot')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: activeTab === 'plot' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'plot' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'plot' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <ImageIcon size={13} />
                <span>Generated Plot</span>
                {result?.has_plot && (
                  <span className="badge badge-blue" style={{ fontSize: '9px', padding: '1px 5px' }}>
                    Available
                  </span>
                )}
              </button>
            </div>

            {/* Status & Timing badge */}
            {result && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <Clock size={12} />
                <span>{result.duration_ms} ms</span>
              </div>
            )}
          </div>

          {/* Panel Body */}
          <div style={{ flex: 1, padding: '14px', overflowY: 'auto' }}>
            {activeTab === 'output' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                {/* Error diagnostics banner if failed */}
                {result && !result.success && result.stderr && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--accent-red-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-red)', fontWeight: 700, fontSize: '12px' }}>
                        <AlertCircle size={15} />
                        <span>Execution Error Diagnosed</span>
                      </div>
                      <button
                        onClick={handleExplainError}
                        disabled={isExplaining}
                        className="btn btn-primary"
                        style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                      >
                        {isExplaining ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        <span>Explain with Debugger</span>
                      </button>
                    </div>

                    <pre style={{
                      fontSize: '11px',
                      color: 'var(--accent-red)',
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '120px',
                      overflowY: 'auto'
                    }}>
                      {result.stderr}
                    </pre>
                  </div>
                )}

                {/* Stdout Console */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    STANDARD OUTPUT (STDOUT):
                  </div>
                  <pre style={{
                    flex: 1,
                    minHeight: '260px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid var(--border-color)',
                    whiteSpace: 'pre-wrap',
                    overflowY: 'auto'
                  }}>
                    {result ? (result.stdout || '(Program completed with no text output)') : 'Ready to execute. Click "Run Program" or press Ctrl+Enter.'}
                  </pre>
                </div>
              </div>
            ) : (
              /* Plot Tab */
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {result?.has_plot && result.plot_image_base64 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <div style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      boxShadow: 'var(--shadow-sm)',
                      maxWidth: '100%'
                    }}>
                      <img
                        src={result.plot_image_base64}
                        alt="Generated Octave Plot"
                        style={{ maxWidth: '100%', maxHeight: '420px', display: 'block' }}
                      />
                    </div>
                    <a
                      href={result.plot_image_base64}
                      download="octave_plot.png"
                      className="btn btn-secondary"
                      style={{ fontSize: '12px' }}
                    >
                      <Download size={13} />
                      <span>Download Plot (PNG)</span>
                    </a>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                    <ImageIcon size={40} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>No Graphical Plot Generated</div>
                    <div style={{ fontSize: '12px', maxWidth: '320px', margin: '4px auto 0 auto' }}>
                      Call <code>plot(x, y)</code> or <code>stem(n, x)</code> in your script to generate and display graphical figures.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Explainer Modal */}
      <ErrorExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        explanation={errorExplanation}
        onApplyFix={(fixedCode) => setCode(fixedCode)}
      />

      {/* PDF Report Export Modal */}
      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        defaultTitle={filename.replace('.m', '')}
        language="matlab"
        code={code}
        status={result?.success ? 'success' : 'error'}
        durationMs={result?.duration_ms || 0}
        stdout={result?.stdout || ''}
        stderr={result?.stderr || ''}
        plotImageBase64={result?.plot_image_base64}
      />
    </div>
  );
};
