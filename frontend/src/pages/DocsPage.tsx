import React from 'react';
import { HelpCircle, Terminal, Cpu, Layers, Shield, FileText, CheckCircle } from 'lucide-react';

export const DocsPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Platform Documentation & Reference Manual
        </h2>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Technical guide for students, faculty, and system administrators
        </div>
      </div>

      {/* Section 1: Architecture */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', fontWeight: 700 }}>
          <Shield size={18} />
          <h3 style={{ fontSize: '16px' }}>1. System Architecture & Execution Sandboxing</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Smart ECE Lab operates on a decoupled client-server architecture:
        </p>
        <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <li><b>Frontend:</b> React 19 + TypeScript + Vite, using Monaco Editor for code editing and SVG vector rendering for digital waveforms.</li>
          <li><b>Backend:</b> Python 3 FastAPI, Pydantic V2 schema validation, and SQLAlchemy ORM on an SQLite database.</li>
          <li><b>Execution Isolation:</b> User-submitted programs are <i>never</i> evaluated in-process. Each job runs in an isolated, temporary working directory using strictly parameterized subprocess argument arrays (no shell interpolation), with strict CPU/wall-clock timeouts (15s limit) and source code size limits (64 KB).</li>
        </ul>
      </div>

      {/* Section 2: GNU Octave */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', fontWeight: 700 }}>
          <Terminal size={18} />
          <h3 style={{ fontSize: '16px' }}>2. MATLAB-Compatible Computing (GNU Octave)</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          The platform uses <b>GNU Octave</b> to provide syntax compatibility with MATLAB. Students can write matrices, vectors, algebraic expressions, logical conditionals, loops, functions, and standard 2D plots.
        </p>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          fontSize: '12px'
        }}>
          <b>Supported Syntax Examples:</b>
          <pre style={{ marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
{`% Arithmetic & Matrix operations
A = [1, 2; 3, 4];
B = inv(A);
det_val = det(A);

% 2D Graphics Plotting
t = 0:0.01:1;
y = sin(2*pi*5*t);
plot(t, y, 'b-'); grid on;`}
          </pre>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <b>Note:</b> GNU Octave is not MathWorks MATLAB. Proprietary toolboxes (Simulink, Stateflow) are not supported.
        </div>
      </div>

      {/* Section 3: Verilog */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: 700 }}>
          <Cpu size={18} />
          <h3 style={{ fontSize: '16px' }}>3. Verilog HDL Simulation (Icarus Verilog & VVP)</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Digital circuits are compiled using <code>iverilog</code> and simulated with the <code>vvp</code> runtime. To view waveforms in the browser, your testbench must dump signals to a VCD file:
        </p>
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          fontSize: '12px'
        }}>
          <b>Required Testbench Instructions for Waveforms:</b>
          <pre style={{ marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
{`initial begin
    $dumpfile("dump.vcd");
    $dumpvars(0, tb_module_name);
    // ... test stimulus ...
    #100 $finish;
end`}
          </pre>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          You can also click <b>"Testbench Assistant"</b> in the Verilog Workspace to automatically generate this template for any module!
        </p>
      </div>

      {/* Section 4: Intelligent Debugger */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', fontWeight: 700 }}>
          <HelpCircle size={18} />
          <h3 style={{ fontSize: '16px' }}>4. Intelligent Error Debugger</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          When an execution produces a compiler diagnostic or runtime error, click <b>"Explain with Debugger"</b>. The debugger analyzes error messages, pinpoints offending line numbers, explains the cause in plain English (e.g. matrix dimension mismatch, wire assignment in always block, missing semicolon), and suggests verified corrections.
        </p>
      </div>
    </div>
  );
};
