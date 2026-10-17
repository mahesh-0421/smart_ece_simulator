import {
  Program,
  ExecutionRecord,
  MatlabExecuteResponse,
  VerilogCompileResponse,
  VerilogSimulateResponse,
  TestbenchGenerateResponse,
  ErrorExplanationResponse,
  WaveformAnalysisResponse,
  Experiment,
  SystemStatus,
  DashboardStats
} from '../types';

const API_BASE = '/api';

export const api = {
  // System Status
  async getStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  // MATLAB Execution
  async executeMatlab(code: string, filename: string = 'script.m'): Promise<MatlabExecuteResponse> {
    const res = await fetch(`${API_BASE}/matlab/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, filename }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'MATLAB execution request failed');
    }
    return res.json();
  },

  // Verilog Compilation
  async compileVerilog(
    code: string,
    filename: string = 'design.v',
    testbenchCode?: string,
    testbenchFilename: string = 'tb_design.v'
  ): Promise<VerilogCompileResponse> {
    const res = await fetch(`${API_BASE}/verilog/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        filename,
        testbench_code: testbenchCode,
        testbench_filename: testbenchFilename,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Verilog compilation request failed');
    }
    return res.json();
  },

  // Verilog Simulation
  async simulateVerilog(
    code: string,
    filename: string = 'design.v',
    testbenchCode?: string,
    testbenchFilename: string = 'tb_design.v'
  ): Promise<VerilogSimulateResponse> {
    const res = await fetch(`${API_BASE}/verilog/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        filename,
        testbench_code: testbenchCode,
        testbench_filename: testbenchFilename,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Verilog simulation request failed');
    }
    return res.json();
  },

  // Testbench Assistant
  async generateTestbench(code: string, moduleName?: string): Promise<TestbenchGenerateResponse> {
    const res = await fetch(`${API_BASE}/verilog/generate-testbench`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, module_name: moduleName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Testbench generation failed');
    }
    return res.json();
  },

  // Intelligent Error Explainer
  async explainError(
    language: string,
    code: string,
    errorMessage: string,
    testbenchCode?: string
  ): Promise<ErrorExplanationResponse> {
    const res = await fetch(`${API_BASE}/errors/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        code,
        error_message: errorMessage,
        testbench_code: testbenchCode,
      }),
    });
    if (!res.ok) throw new Error('Failed to obtain error explanation');
    return res.json();
  },

  // Waveform Analysis
  async analyzeWaveform(
    vcdText: string,
    expectedChecks?: any[],
    targetModule?: string
  ): Promise<WaveformAnalysisResponse> {
    const res = await fetch(`${API_BASE}/waveforms/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vcd_text: vcdText,
        expected_checks: expectedChecks,
        target_module: targetModule,
      }),
    });
    if (!res.ok) throw new Error('Waveform analysis failed');
    return res.json();
  },

  // Experiments Library
  async getExperiments(category?: string): Promise<Experiment[]> {
    const url = category ? `${API_BASE}/experiments?category=${category}` : `${API_BASE}/experiments`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch experiments');
    return res.json();
  },

  async getExperiment(id: string): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments/${id}`);
    if (!res.ok) throw new Error('Experiment not found');
    return res.json();
  },

  // Programs Management
  async getPrograms(language?: string, search?: string): Promise<Program[]> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/programs?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load programs');
    return res.json();
  },

  async getProgram(id: number): Promise<Program> {
    const res = await fetch(`${API_BASE}/programs/${id}`);
    if (!res.ok) throw new Error('Program not found');
    return res.json();
  },

  async createProgram(prog: Omit<Program, 'id' | 'created_at' | 'updated_at'>): Promise<Program> {
    const res = await fetch(`${API_BASE}/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prog),
    });
    if (!res.ok) throw new Error('Failed to save program');
    return res.json();
  },

  async updateProgram(id: number, updateData: Partial<Program>): Promise<Program> {
    const res = await fetch(`${API_BASE}/programs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error('Failed to update program');
    return res.json();
  },

  async deleteProgram(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/programs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete program');
  },

  // Execution History & Stats
  async getHistory(
    language?: string,
    status?: string,
    limit: number = 50
  ): Promise<{ stats: DashboardStats; records: ExecutionRecord[] }> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    if (status) params.append('status', status);
    params.append('limit', limit.toString());

    const res = await fetch(`${API_BASE}/history?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load execution history');
    return res.json();
  },

  async getHistoryDetail(id: number): Promise<ExecutionRecord> {
    const res = await fetch(`${API_BASE}/history/${id}`);
    if (!res.ok) throw new Error('Execution record not found');
    return res.json();
  },

  async clearHistory(): Promise<void> {
    const res = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear execution history');
  },

  // Laboratory Report Generation
  async generateReport(reportData: {
    title: string;
    language: string;
    code: string;
    testbench_code?: string | null;
    status: string;
    duration_ms: number;
    stdout: string;
    stderr: string;
    plot_image_base64?: string | null;
    vcd_raw?: string | null;
    objective?: string | null;
    conclusion?: string | null;
    error_explanation?: any | null;
  }): Promise<void> {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });

    if (!res.ok) throw new Error('PDF report generation failed');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = (reportData.title || 'lab_report').replace(/[^\w\-_]/g, '_');
    a.download = `${safeTitle}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
