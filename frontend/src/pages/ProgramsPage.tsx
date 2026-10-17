import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Program } from '../types';
import {
  FolderCode,
  Terminal,
  Cpu,
  Search,
  Plus,
  Play,
  Download,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ProgramsPageProps {
  onLoadIntoWorkspace: (language: 'matlab' | 'verilog', code: string, testbench?: string, filename?: string) => void;
  onNavigate: (tab: string) => void;
}

export const ProgramsPage: React.FC<ProgramsPageProps> = ({ onLoadIntoWorkspace, onNavigate }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [langFilter, setLangFilter] = useState<'all' | 'matlab' | 'verilog'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPrograms = () => {
    setLoading(true);
    api.getPrograms(langFilter === 'all' ? undefined : langFilter, searchQuery || undefined)
      .then(setPrograms)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPrograms();
  }, [langFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPrograms();
  };

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete '${title}'?`)) {
      try {
        await api.deleteProgram(id);
        setPrograms(programs.filter(p => p.id !== id));
      } catch (err: any) {
        alert('Failed to delete program: ' + err.message);
      }
    }
  };

  const handleDownload = (prog: Program) => {
    const ext = prog.language === 'matlab' ? '.m' : '.v';
    const filename = prog.filename.endsWith(ext) ? prog.filename : `${prog.filename}${ext}`;
    const blob = new Blob([prog.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            My Saved Programs
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Manage, reopen, and organize your MATLAB scripts and Verilog HDL designs
          </div>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onNavigate('matlab')}
            className="btn btn-primary"
            style={{ fontSize: '12px' }}
          >
            <Plus size={14} /> New MATLAB Script
          </button>
          <button
            onClick={() => onNavigate('verilog')}
            className="btn btn-primary"
            style={{ fontSize: '12px', backgroundColor: '#10b981', borderColor: '#10b981' }}
          >
            <Plus size={14} /> New Verilog Design
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setLangFilter('all')}
            className={`btn ${langFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
          >
            All Programs ({programs.length})
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

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="input"
            style={{ width: '220px', fontSize: '12px' }}
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" style={{ fontSize: '12px' }}>
            <Search size={13} /> Search
          </button>
        </form>
      </div>

      {/* Programs List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading programs from database...
          </div>
        ) : programs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FolderCode size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
            <div style={{ fontSize: '14px', fontWeight: 600 }}>No Saved Programs Found</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Create or run a script in the MATLAB or Verilog workspace and click "Save" to keep it here.
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
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>TITLE / FILENAME</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>LANGUAGE</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>DESCRIPTION</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>UPDATED</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {p.filename}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${p.language === 'matlab' ? 'badge-blue' : 'badge-success'}`}>
                        {p.language.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                      {p.description || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {new Date(p.updated_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => onLoadIntoWorkspace(
                            p.language,
                            p.code,
                            p.testbench_code || undefined,
                            p.filename
                          )}
                          className="btn btn-primary"
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            backgroundColor: p.language === 'matlab' ? 'var(--brand-primary)' : 'var(--accent-green)',
                            borderColor: p.language === 'matlab' ? 'var(--brand-primary)' : 'var(--accent-green)'
                          }}
                        >
                          <Play size={10} /> Open
                        </button>
                        <button
                          onClick={() => handleDownload(p)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Download Code"
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--accent-red)' }}
                          title="Delete Program"
                        >
                          <Trash2 size={12} />
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
    </div>
  );
};
