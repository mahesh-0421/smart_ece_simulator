import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Experiment } from '../types';
import {
  BookOpen,
  Terminal,
  Cpu,
  Search,
  ArrowRight,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ExperimentsPageProps {
  onLoadIntoWorkspace: (language: 'matlab' | 'verilog', code: string, testbench?: string, filename?: string) => void;
}

export const ExperimentsPage: React.FC<ExperimentsPageProps> = ({ onLoadIntoWorkspace }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'matlab' | 'verilog'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getExperiments(categoryFilter === 'all' ? undefined : categoryFilter)
      .then(setExperiments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryFilter]);

  const filteredExperiments = experiments.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return e.title.toLowerCase().includes(q) ||
      e.objective.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q));
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadReport = async (exp: Experiment) => {
    try {
      await api.generateReport({
        title: exp.title,
        language: exp.category,
        code: exp.sample_code,
        testbench_code: exp.sample_testbench,
        status: 'success',
        duration_ms: 24.5,
        stdout: exp.expected_output,
        stderr: '',
        objective: exp.objective,
        conclusion: exp.conclusion
      });
    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ECE Laboratory Experiment Library
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Curated curriculum experiments for DSP, Communications, and Digital Logic Design
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '32px', fontSize: '12px' }}
            placeholder="Search experiments by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setCategoryFilter('all')}
          className={`btn ${categoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px' }}
        >
          All Experiments (20)
        </button>
        <button
          onClick={() => setCategoryFilter('matlab')}
          className={`btn ${categoryFilter === 'matlab' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px' }}
        >
          <Terminal size={13} />
          MATLAB / Octave (10)
        </button>
        <button
          onClick={() => setCategoryFilter('verilog')}
          className={`btn ${categoryFilter === 'verilog' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '12px' }}
        >
          <Cpu size={13} />
          Verilog HDL (10)
        </button>
      </div>

      {/* Experiments Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading Experiment Library...
        </div>
      ) : filteredExperiments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No experiments matched your search query.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredExperiments.map((exp, idx) => {
            const isExpanded = expandedId === exp.id;
            const isMatlab = exp.category === 'matlab';

            return (
              <div
                key={exp.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderLeft: `4px solid ${isMatlab ? 'var(--brand-primary)' : 'var(--accent-green)'}`
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge ${isMatlab ? 'badge-blue' : 'badge-success'}`}>
                        {exp.category.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Exp #{idx + 1}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        &bull; {exp.required_software}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {exp.title}
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <b>Objective:</b> {exp.objective}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => onLoadIntoWorkspace(
                        exp.category,
                        exp.sample_code,
                        exp.sample_testbench || undefined,
                        `${exp.id}.${exp.category === 'matlab' ? 'm' : 'v'}`
                      )}
                      className="btn btn-primary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        backgroundColor: isMatlab ? 'var(--brand-primary)' : 'var(--accent-green)',
                        borderColor: isMatlab ? 'var(--brand-primary)' : 'var(--accent-green)'
                      }}
                    >
                      <span>Run in Workspace</span>
                      <ArrowRight size={13} />
                    </button>

                    <button
                      onClick={() => handleDownloadReport(exp)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      title="Download PDF Experiment Report"
                    >
                      <FileText size={13} />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                      className="btn btn-outline"
                      style={{ padding: '6px' }}
                      title={isExpanded ? 'Collapse' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Theory, Procedure, Code */}
                {isExpanded && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '13px'
                  }}>
                    {/* Theory */}
                    <div style={{
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                        Theoretical Background:
                      </div>
                      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {exp.theory}
                      </div>
                    </div>

                    {/* Procedure Steps */}
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Laboratory Procedure:
                      </div>
                      <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                        {exp.procedure.map((step, sIdx) => (
                          <li key={sIdx} style={{ marginBottom: '2px' }}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Code Snippet Box */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        fontWeight: 600,
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                      }}>
                        <span>VERIFIED SAMPLE CODE ({isMatlab ? 'MATLAB/Octave' : 'Verilog Design'}):</span>
                        <button
                          onClick={() => handleCopyCode(exp.id, exp.sample_code)}
                          className="btn btn-outline"
                          style={{ padding: '2px 8px', fontSize: '11px' }}
                        >
                          {copiedId === exp.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                          {copiedId === exp.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid var(--border-color)',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {exp.sample_code}
                      </pre>
                    </div>

                    {/* Testbench preview for Verilog */}
                    {exp.sample_testbench && (
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                          fontWeight: 600,
                          fontSize: '11px',
                          color: 'var(--text-muted)'
                        }}>
                          <span>VERILOG TESTBENCH STIMULUS:</span>
                          <button
                            onClick={() => handleCopyCode(`${exp.id}-tb`, exp.sample_testbench!)}
                            className="btn btn-outline"
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                          >
                            {copiedId === `${exp.id}-tb` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                            {copiedId === `${exp.id}-tb` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          padding: '10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          border: '1px solid var(--border-color)',
                          maxHeight: '180px',
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {exp.sample_testbench}
                        </pre>
                      </div>
                    )}

                    {/* Expected Output */}
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Expected Output / Verification Criteria:
                      </div>
                      <pre style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid var(--border-color)',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {exp.expected_output}
                      </pre>
                      {exp.expected_waveform_desc && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <b>Waveform Behavior:</b> {exp.expected_waveform_desc}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
