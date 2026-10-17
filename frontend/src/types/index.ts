export interface Program {
  id: number;
  title: string;
  filename: string;
  language: 'matlab' | 'verilog';
  code: string;
  testbench_code?: string | null;
  description?: string | null;
  tags?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExecutionRecord {
  id: number;
  program_name: string;
  language: 'matlab' | 'verilog';
  status: 'success' | 'error' | 'timeout' | 'compilation_failed';
  duration_ms: number;
  error_summary?: string | null;
  has_plot: boolean;
  has_waveform: boolean;
  created_at: string;
  stdout?: string | null;
  stderr?: string | null;
  source_code?: string | null;
  testbench_code?: string | null;
}

export interface MatlabExecuteResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
  plot_image_base64?: string | null;
  has_plot: boolean;
  error_summary?: string | null;
}

export interface VerilogCompileResponse {
  success: boolean;
  compiler_output: string;
  exit_code: number;
  duration_ms: number;
  error_summary?: string | null;
}

export interface WaveformTransition {
  time: number;
  value: string;
}

export interface WaveformSignal {
  name: string;
  wire_id: string;
  width: number;
  signal_type: string;
  transitions: WaveformTransition[];
}

export interface WaveformParsed {
  timescale: string;
  end_time: number;
  signals: WaveformSignal[];
}

export interface VerilogSimulateResponse {
  success: boolean;
  compiled: boolean;
  compiler_output: string;
  simulation_output: string;
  exit_code: number;
  duration_ms: number;
  has_waveform: boolean;
  vcd_raw?: string | null;
  waveform?: WaveformParsed | null;
  error_summary?: string | null;
}

export interface TestbenchGenerateResponse {
  success: boolean;
  module_name: string;
  inputs: Array<{ name: string; width: number; is_clock: boolean; is_reset: boolean }>;
  outputs: Array<{ name: string; width: number }>;
  testbench_code: string;
  message: string;
}

export interface ErrorExplanationResponse {
  original_error: string;
  likely_cause: string;
  suggested_fix: string;
  line_number?: number | null;
  corrected_code?: string | null;
  confidence: 'high' | 'medium' | 'general';
  provider_used: 'rule_based' | 'ai_model';
}

export interface WaveformAnalysisResponse {
  success: boolean;
  total_time: number;
  signals_count: number;
  total_transitions: number;
  check_results: Array<{
    check_type: string;
    signal?: string;
    timestamp?: number;
    expected?: string;
    actual?: string;
    passed: boolean;
    details: string;
  }>;
  summary: string;
  clock_detected?: {
    signal_name: string;
    period: number;
    timescale: string;
    estimated_frequency: string;
    total_cycles: number;
  } | null;
}

export interface Experiment {
  id: string;
  title: string;
  category: 'matlab' | 'verilog';
  objective: string;
  required_software: string;
  theory: string;
  procedure: string[];
  sample_code: string;
  sample_testbench?: string | null;
  expected_output: string;
  expected_waveform_desc?: string | null;
  result_explanation: string;
  conclusion: string;
  tags: string[];
}

export interface SystemStatus {
  status: string;
  app_name: string;
  version: string;
  mode: string;
  tools: {
    octave: { available: boolean; path: string | null; notes: string };
    iverilog: { available: boolean; iverilog_path: string | null; vvp_path: string | null; notes: string };
    ai_debugger: { configured: boolean; provider: string; notes: string };
  };
  limits: {
    max_execution_time_sec: number;
    max_code_size_bytes: number;
  };
}

export interface DashboardStats {
  total_saved_programs: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  matlab_count: number;
  verilog_count: number;
}
