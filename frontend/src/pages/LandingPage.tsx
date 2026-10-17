import React from 'react';
import {
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity
} from 'lucide-react';
import { SystemStatus } from '../types';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  status: SystemStatus | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, status }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: 'var(--brand-light)',
          color: 'var(--brand-primary)',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          <ShieldCheck size={14} />
          <span>Integrated Engineering Learning Platform for ECE Students</span>
        </div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: '14px'
        }}>
          Smart ECE Lab
        </h1>

        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          maxWidth: '720px',
          margin: '0 auto 28px auto',
          lineHeight: 1.6
        }}>
          An integrated web-based MATLAB-compatible compiler, Verilog HDL simulator, digital timing waveform analyzer, and intelligent debugging platform designed for university Electronics and Communication Engineering laboratories.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: '14px' }}
          >
            Open Dashboard <ArrowRight size={16} />
          </button>
          <button
            onClick={() => onNavigate('matlab')}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            <Terminal size={16} /> MATLAB Workspace
          </button>
          <button
            onClick={() => onNavigate('verilog')}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            <Cpu size={16} /> Verilog Workspace
          </button>
          <button
            onClick={() => onNavigate('experiments')}
            className="btn btn-outline"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            <BookOpen size={16} /> Experiment Library
          </button>
        </div>
      </div>

      {/* Feature Modules Grid */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '18px', textAlign: 'center' }}>
          Core Laboratory Modules
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: MATLAB */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Terminal size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                MATLAB-Compatible Computing
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                Powered by GNU Octave. Execute numerical scripts, matrix arithmetic, linear convolution, FFT spectral analysis, and render high-resolution 2D graphical plots.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                <span className="badge badge-blue">Matrix Math</span>
                <span className="badge badge-blue">GNU Octave</span>
                <span className="badge badge-blue">Plot Graphics</span>
                <span className="badge badge-blue">FFT & Signals</span>
              </div>
            </div>
            <button onClick={() => onNavigate('matlab')} className="btn btn-outline" style={{ width: '100%' }}>
              Launch MATLAB Workspace &rarr;
            </button>
          </div>

          {/* Card 2: Verilog */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Cpu size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Verilog HDL Simulation
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                Genuine Icarus Verilog compiler and VVP simulation runtime. Compile digital circuit designs, write testbenches, and generate IEEE 1364 standard VCD waveform files.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                <span className="badge badge-success">Icarus Verilog</span>
                <span className="badge badge-success">VVP Engine</span>
                <span className="badge badge-success">Testbenches</span>
                <span className="badge badge-success">VCD Generation</span>
              </div>
            </div>
            <button onClick={() => onNavigate('verilog')} className="btn btn-outline" style={{ width: '100%' }}>
              Launch Verilog Workspace &rarr;
            </button>
          </div>

          {/* Card 3: Waveform Viewer */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Interactive Digital Waveform Viewer
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                Inspect multi-signal timing diagrams parsed directly from actual simulation VCD data. Features time ruler, zoom controls, bus decodes, and interactive time-cursor inspection.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                <span className="badge badge-amber">Timing Diagrams</span>
                <span className="badge badge-amber">Time Cursor</span>
                <span className="badge badge-amber">Bus Diamonds</span>
                <span className="badge badge-amber">VCD Parser</span>
              </div>
            </div>
            <button onClick={() => onNavigate('waveform')} className="btn btn-outline" style={{ width: '100%' }}>
              Open Waveform Viewer &rarr;
            </button>
          </div>

          {/* Card 4: Intelligent Debugger */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Intelligent Error Debugger
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                Understand compiler diagnostics in plain English. Deterministic rule matching pinpoints line numbers, identifies syntax mistakes, and suggests verified engineering corrections.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                <span className="badge badge-blue">Rule-Based Debugger</span>
                <span className="badge badge-blue">Line Highlighting</span>
                <span className="badge badge-blue">Optional AI</span>
              </div>
            </div>
            <button onClick={() => onNavigate('matlab')} className="btn btn-outline" style={{ width: '100%' }}>
              Try in Workspaces &rarr;
            </button>
          </div>

          {/* Card 5: Experiments */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                color: '#ec4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <BookOpen size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                ECE Laboratory Experiments Library
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                20 verified experiments spanning DSP, Communications, Combinational and Sequential digital design. Includes objectives, theory, runnable code, and expected outputs.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                <span className="badge badge-blue">10 MATLAB Labs</span>
                <span className="badge badge-success">10 Verilog Labs</span>
                <span className="badge badge-blue">Theory & Steps</span>
              </div>
            </div>
            <button onClick={() => onNavigate('experiments')} className="btn btn-outline" style={{ width: '100%' }}>
              Browse Experiment Library &rarr;
            </button>
          </div>

          {/* Card 6: PDF Reports */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                color: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <FileText size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Academic Laboratory Report Generation
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                Export publication-grade PDF laboratory experiment records embedding genuine source code, terminal logs, graphical plots, and rendered timing waveforms for faculty evaluation.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                <span className="badge badge-blue">ReportLab Engine</span>
                <span className="badge badge-blue">Plot Images</span>
                <span className="badge badge-blue">Timing Diagrams</span>
              </div>
            </div>
            <button onClick={() => onNavigate('reports')} className="btn btn-outline" style={{ width: '100%' }}>
              Create Lab Report &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Honest Academic Disclosure & Engineering Limitations */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700 }}>
          <AlertTriangle size={18} className="text-amber-500" />
          <span>Supported Capabilities & Academic Engineering Disclosures</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <b>MATLAB Compatibility:</b> The numerical computing engine uses <b>GNU Octave</b> (a high-level, open-source language primarily intended for numerical computations). While GNU Octave provides broad syntax compatibility with MATLAB for linear algebra, arithmetic, vectors, control structures, and standard plotting functions, it does <i>not</i> claim 100% proprietary MathWorks toolbox compatibility (e.g. Simulink or proprietary hardware-in-the-loop toolboxes are unsupported).
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <b>Verilog HDL Simulation:</b> Digital compilation and simulation are executed via <b>Icarus Verilog</b> (IEEE 1364 standard) and the <b>VVP virtual machine</b>. Waveform visualizer reads actual VCD files. Note that successful simulation indicates that the testbench ran to completion without compiler errors, but does not substitute for formal physical synthesis or place-and-route timing closure on silicon FPGAs/ASICs.
        </p>
      </div>
    </div>
  );
};
