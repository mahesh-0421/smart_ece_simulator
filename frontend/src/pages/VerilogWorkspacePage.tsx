
import React, { useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { WaveformViewer } from '../components/WaveformViewer';
import { ErrorExplainerModal } from '../components/ErrorExplainerModal';
import { TestbenchModal } from '../components/TestbenchModal';
import { WaveformAnalysisModal } from '../components/WaveformAnalysisModal';
import { ReportExportModal } from '../components/ReportExportModal';
import { api } from '../services/api';
import {
  VerilogCompileResponse,
  VerilogSimulateResponse,
  TestbenchGenerateResponse,
  ErrorExplanationResponse,
  WaveformAnalysisResponse
} from '../types';
import {
  Play, Save, Download, FileText, Sparkles, Layers, Cpu,
  AlertCircle, Clock, BookOpen, Loader2, Activity, Code
} from 'lucide-react';

interface VerilogWorkspacePageProps {
  initialDesignCode?: string;
  initialTbCode?: string;
  initialFilename?: string;
}

const DEFAULT_COUNTER_DESIGN = `module counter4 (
    input wire clk,
    input wire reset,
    output reg [3:0] count
);
always @(posedge clk or posedge reset) begin
    if (reset)
        count <= 4'b0000;
    else
        count <= count + 1'b1;
end
endmodule
`;

const DEFAULT_COUNTER_TB = `
\`timescale 1ns / 1ps

module tb_counter4;
    reg clk;
    reg reset;
    wire [3:0] count;

    counter4 uut (
        .clk(clk),
        .reset(reset),
        .count(count)
    );

    always #5 clk = ~clk;

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_counter4);
        clk = 0;
        reset = 1;
        #12 reset = 0;
        #100;
        $display("Simulation finished at time %0t", $time);
        $finish;
    end

    initial begin
        $monitor("Time=%0t | clk=%b reset=%b | count=%b (%0d)",
                 $time, clk, reset, count, count);
    end
endmodule
`;

const VERILOG_EXAMPLES = [
  {
    name: '4-Bit Counter',
    design: DEFAULT_COUNTER_DESIGN,
    tb: DEFAULT_COUNTER_TB,
    filename: 'counter4.v',
    tbFilename: 'tb_counter4.v'
  },
  {
    name: 'Full Adder',
    design: `module full_adder (
    input wire a,
    input wire b,
    input wire cin,
    output wire sum,
    output wire cout
);
    assign sum = a ^ b ^ cin;
    assign cout = (a & b) | (cin & (a ^ b));
endmodule
`,
    tb: `
\`timescale 1ns / 1ps
module tb_full_adder;
    reg a, b, cin;
    wire sum, cout;

    full_adder uut (.a(a), .b(b), .cin(cin), .sum(sum), .cout(cout));

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_full_adder);
        {a,b,cin}=3'b000; #10;
        {a,b,cin}=3'b001; #10;
        {a,b,cin}=3'b010; #10;
        {a,b,cin}=3'b011; #10;
        {a,b,cin}=3'b100; #10;
        {a,b,cin}=3'b101; #10;
        {a,b,cin}=3'b110; #10;
        {a,b,cin}=3'b111; #10;
        $finish;
    end

    initial
        $monitor("Time=%0t A=%b B=%b Cin=%b Sum=%b Cout=%b",
                 $time, a, b, cin, sum, cout);
endmodule
`,
    filename: 'full_adder.v',
    tbFilename: 'tb_full_adder.v'
  },
  {
    name: 'Logic Gates',
    design: `module logic_gates (
    input wire a,
    input wire b,
    output wire and_out,
    output wire or_out,
    output wire not_out,
    output wire xor_out,
    output wire nand_out,
    output wire nor_out
);
    assign and_out = a & b;
    assign or_out = a | b;
    assign not_out = ~a;
    assign xor_out = a ^ b;
    assign nand_out = ~(a & b);
    assign nor_out = ~(a | b);
endmodule
`,
    tb: `
\`timescale 1ns / 1ps
module tb_logic_gates;
    reg a, b;
    wire and_out, or_out, not_out, xor_out, nand_out, nor_out;

    logic_gates uut (
        .a(a), .b(b),
        .and_out(and_out), .or_out(or_out),
        .not_out(not_out), .xor_out(xor_out),
        .nand_out(nand_out), .nor_out(nor_out)
    );

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_logic_gates);
        a=0; b=0; #10;
        a=0; b=1; #10;
        a=1; b=0; #10;
        a=1; b=1; #10;
        $finish;
    end

    initial
        $monitor("Time=%0t A=%b B=%b AND=%b OR=%b NOT_A=%b XOR=%b NAND=%b NOR=%b",
          $time, a, b, and_out, or_out, not_out, xor_out, nand_out, nor_out);
endmodule
`,
    filename: 'logic_gates.v',
    tbFilename: 'tb_logic_gates.v'
  },
  {
    name: '4-to-1 Multiplexer',
    design: `module mux4to1 (
    input wire [3:0] in,
    input wire [1:0] sel,
    output reg out
);
    always @(*) begin
        case (sel)
            2'b00: out = in[0];
            2'b01: out = in[1];
            2'b10: out = in[2];
            2'b11: out = in[3];
            default: out = 1'b0;
        endcase
    end
endmodule
`,
    tb: `
\`timescale 1ns / 1ps
module tb_mux4to1;
    reg [3:0] in;
    reg [1:0] sel;
    wire out;

    mux4to1 uut (.in(in), .sel(sel), .out(out));

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_mux4to1);
        in = 4'b1010;
        sel = 0; #10;
        sel = 1; #10;
        sel = 2; #10;
        sel = 3; #10;
        $finish;
    end

    initial
        $monitor("Time=%0t sel=%b in=%b out=%b", $time, sel, in, out);
endmodule
`,
    filename: 'mux4to1.v',
    tbFilename: 'tb_mux4to1.v'
  },
  {
    name: 'Sequence Detector 101',
    design: `module seq_detector_101 (
    input wire clk,
    input wire reset,
    input wire din,
    output reg detected
);
    parameter S_IDLE = 2'b00, S_1 = 2'b01, S_10 = 2'b10;
    reg [1:0] state, next_state;

    always @(posedge clk or posedge reset) begin
        if (reset) state <= S_IDLE;
        else state <= next_state;
    end

    always @(*) begin
        detected = 1'b0;
        next_state = state;
        case (state)
            S_IDLE: if (din) next_state = S_1;
            S_1: if (!din) next_state = S_10;
                 else next_state = S_1;
            S_10: if (din) begin
                detected = 1'b1;
                next_state = S_1;
            end else next_state = S_IDLE;
            default: next_state = S_IDLE;
        endcase
    end
endmodule
`,
    tb: `
\`timescale 1ns / 1ps
module tb_seq_detector;
    reg clk, reset, din;
    wire detected;

    seq_detector_101 uut (
        .clk(clk), .reset(reset), .din(din), .detected(detected)
    );

    always #5 clk = ~clk;

    initial begin
        $dumpfile("dump.vcd");
        $dumpvars(0, tb_seq_detector);
        clk=0; reset=1; din=0;
        #12 reset=0;
        din=1; #10;
        din=0; #10;
        din=1; #10;
        din=0; #10;
        din=1; #10;
        #20 $finish;
    end

    initial
        $monitor("Time=%0t din=%b detected=%b", $time, din, detected);
endmodule
`,
    filename: 'seq_detector_101.v',
    tbFilename: 'tb_seq_detector.v'
  }
];

function splitVerilogSource(source: string): {
  design: string;
  testbench: string;
} {
  const modulePattern =
    /^[ \t]*module[ \t]+(?:(?:automatic|static)[ \t]+)?([a-zA-Z_]\w*)/gm;

  const modules: Array<{ name: string; index: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = modulePattern.exec(source)) !== null) {
    modules.push({ name: match[1], index: match.index });
  }

  if (modules.length < 2) {
    return { design: source.trim(), testbench: '' };
  }

  let tbModule = modules.find((item, index) =>
    index > 0 &&
    (/^(tb_|testbench_)/i.test(item.name) || /_tb$/i.test(item.name))
  );

  if (!tbModule) {
    tbModule = modules.find((item, index) => {
      if (index === 0) return false;
      const tail = source.slice(item.index);
      return /\binitial\b/.test(tail) &&
        /\$(dumpvars|dumpfile|finish|monitor|fatal|display|stop)\b/.test(tail);
    });
  }

  if (!tbModule) {
    return { design: source.trim(), testbench: '' };
  }

  let splitIndex = tbModule.index;
  const previousEndmodule = source.lastIndexOf(
    'endmodule',
    tbModule.index
  );

  const precedingStart = previousEndmodule >= 0
    ? previousEndmodule + 'endmodule'.length
    : 0;

  const precedingText = source.slice(precedingStart, tbModule.index);
  const timescaleMatch = precedingText.match(/`timescale[^\r\n]*/);

  if (timescaleMatch && timescaleMatch.index !== undefined) {
    splitIndex = precedingStart + timescaleMatch.index;
  }

  return {
    design: source.slice(0, splitIndex).trim(),
    testbench: source.slice(splitIndex).trim()
  };
}

export const VerilogWorkspacePage: React.FC<VerilogWorkspacePageProps> = ({
  initialDesignCode,
  initialTbCode,
  initialFilename
}) => {
  const [designCode, setDesignCode] = useState(
    initialDesignCode || DEFAULT_COUNTER_DESIGN
  );
  const [tbCode, setTbCode] = useState(
    initialTbCode || DEFAULT_COUNTER_TB
  );
  const [filename, setFilename] = useState(
    initialFilename || 'counter4.v'
  );
  const [tbFilename, setTbFilename] = useState('tb_counter4.v');

  const [outputTab, setOutputTab] = useState<'console' | 'waveform'>('waveform');
  const [isRunning, setIsRunning] = useState(false);
  const [simResult, setSimResult] = useState<VerilogSimulateResponse | null>(null);

  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [errorExplanation, setErrorExplanation] =
    useState<ErrorExplanationResponse | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const [isTbModalOpen, setIsTbModalOpen] = useState(false);
  const [tbGenData, setTbGenData] =
    useState<TestbenchGenerateResponse | null>(null);
  const [isGeneratingTb, setIsGeneratingTb] = useState(false);

  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisData, setAnalysisData] =
    useState<WaveformAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const combinedCode = [designCode.trimEnd(), tbCode.trimStart()]
    .filter(Boolean)
    .join('\n\n');

  const handleCombinedCodeChange = (source: string) => {
    const separated = splitVerilogSource(source);
    setDesignCode(separated.design);
    setTbCode(separated.testbench);
    setSimResult(null);
  };

  const handleSimulate = async (
    design = designCode,
    designFilename = filename,
    testbench = tbCode,
    testbenchFilename = tbFilename
  ) => {
    setIsRunning(true);
    setSaveSuccessMsg(null);

    try {
      const res = await api.simulateVerilog(
        design,
        designFilename,
        testbench,
        testbenchFilename
      );
      setSimResult(res);
      setOutputTab(res.has_waveform ? 'waveform' : 'console');
    } catch (err: any) {
      setSimResult({
        success: false,
        compiled: false,
        compiler_output: err?.message || 'Simulation execution error',
        simulation_output: '',
        exit_code: 1,
        duration_ms: 0,
        has_waveform: false,
        error_summary: err?.message || 'Simulation execution error'
      });
      setOutputTab('console');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCompileOnly = async () => {
    setIsRunning(true);

    try {
      const res: VerilogCompileResponse = await api.compileVerilog(
        designCode,
        filename,
        tbCode,
        tbFilename
      );

      setSimResult({
        success: res.success,
        compiled: res.success,
        compiler_output: res.compiler_output ||
          (res.success
            ? 'Compilation passed without reported errors.'
            : 'Compilation errors found.'),
        simulation_output: '',
        exit_code: res.exit_code,
        duration_ms: res.duration_ms,
        has_waveform: false,
        error_summary: res.error_summary
      });
      setOutputTab('console');
    } catch (err: any) {
      alert('Compilation error: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenTestbenchAssistant = async () => {
    setIsGeneratingTb(true);
    try {
      const res = await api.generateTestbench(designCode);
      setTbGenData(res);
      setIsTbModalOpen(true);
    } catch (err: any) {
      alert('Failed to generate testbench: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGeneratingTb(false);
    }
  };

  const handleAnalyzeWaveforms = async () => {
    if (!simResult?.vcd_raw) {
      alert('No waveform data available. Please simulate first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await api.analyzeWaveform(simResult.vcd_raw);
      setAnalysisData(res);
      setIsAnalysisOpen(true);
    } catch (err: any) {
      alert('Waveform analysis failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExplainError = async () => {
    const errorText =
      simResult?.compiler_output || simResult?.simulation_output || '';
    if (!errorText) return;

    setIsExplaining(true);
    try {
      const result = await api.explainError(
        'verilog',
        designCode,
        errorText,
        tbCode
      );
      setErrorExplanation(result);
      setIsExplainerOpen(true);
    } catch (err: any) {
      alert('Could not explain error: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSaveProgram = async () => {
    try {
      await api.createProgram({
        title: filename.replace(/\.v$/i, ''),
        filename: filename.endsWith('.v') ? filename : `${filename}.v`,
        language: 'verilog',
        code: designCode,
        testbench_code: tbCode,
        description: 'Saved from Verilog Workspace'
      });
      setSaveSuccessMsg('Verilog design and testbench saved!');
      window.setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Failed to save: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleDownloadSource = () => {
    const blob = new Blob([combinedCode], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename.endsWith('.v') ? filename : `${filename}.v`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleLoadExample = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const example = VERILOG_EXAMPLES.find(
      item => item.name === event.target.value
    );
    if (!example) return;

    setDesignCode(example.design);
    setTbCode(example.tb);
    setFilename(example.filename);
    setTbFilename(example.tbFilename);
    setSimResult(null);
    setOutputTab('waveform');
  };

  const handleInsertTestbench = (generatedTestbench: string) => {
    const cleaned = generatedTestbench.trim();
    setTbCode(cleaned);
    setIsTbModalOpen(false);
  };

  const panelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    minWidth: 0
  };

  const smallButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: '12px'
  };

  return (
    <div style={{
      padding: '16px 20px',
      maxWidth: '1440px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        backgroundColor: 'var(--bg-card)',
        padding: '10px 16px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => void handleSimulate()}
            disabled={isRunning}
            className="btn btn-primary"
            style={{
              padding: '6px 14px',
              backgroundColor: '#10b981',
              borderColor: '#10b981'
            }}
          >
            {isRunning
              ? <Loader2 size={14} className="animate-spin" />
              : <Play size={14} />}
            <span>{isRunning ? 'Simulating...' : 'Simulate (VVP)'}</span>
          </button>

          <button
            onClick={() => void handleCompileOnly()}
            disabled={isRunning}
            className="btn btn-secondary"
            style={smallButtonStyle}
          >
            <Cpu size={13} /> <span>Compile Check</span>
          </button>

          <button
            onClick={() => void handleOpenTestbenchAssistant()}
            disabled={isGeneratingTb}
            className="btn btn-secondary"
            style={smallButtonStyle}
          >
            {isGeneratingTb
              ? <Loader2 size={13} className="animate-spin" />
              : <Sparkles size={13} />}
            <span>Testbench Assistant</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <BookOpen size={13} color="var(--text-muted)" />
            <select
              onChange={handleLoadExample}
              defaultValue=""
              className="select"
              style={{ width: '190px', padding: '5px 8px', fontSize: '12px' }}
            >
              <option value="" disabled>Load Verilog Example...</option>
              {VERILOG_EXAMPLES.map(example => (
                <option key={example.name} value={example.name}>
                  {example.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {simResult?.has_waveform && (
            <button
              onClick={() => void handleAnalyzeWaveforms()}
              disabled={isAnalyzing}
              className="btn btn-primary"
              style={{
                ...smallButtonStyle,
                backgroundColor: '#8b5cf6',
                borderColor: '#8b5cf6'
              }}
            >
              {isAnalyzing
                ? <Loader2 size={13} className="animate-spin" />
                : <Activity size={13} />}
              <span>Waveform Analysis</span>
            </button>
          )}

          {saveSuccessMsg && (
            <span style={{
              fontSize: '11px',
              color: 'var(--accent-green)',
              fontWeight: 600
            }}>
              {saveSuccessMsg}
            </span>
          )}

          <button
            onClick={() => void handleSaveProgram()}
            className="btn btn-secondary"
            style={smallButtonStyle}
          >
            <Save size={13} /> <span>Save</span>
          </button>

          <button
            onClick={handleDownloadSource}
            className="btn btn-secondary"
            style={smallButtonStyle}
          >
            <Download size={13} /> <span>Download .v</span>
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="btn btn-outline"
            style={smallButtonStyle}
          >
            <FileText size={13} /> <span>PDF Report</span>
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
        gap: '14px',
        alignItems: 'stretch'
      }}>
        <div style={panelStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            padding: '10px 12px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={15} />
              <strong style={{ fontSize: '12px' }}>
                Verilog Design + Testbench
              </strong>
            </div>

            <input
              aria-label="Verilog filename"
              type="text"
              className="input"
              value={filename}
              onChange={event => setFilename(event.target.value)}
              style={{
                width: '150px',
                padding: '4px 6px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div style={{ padding: '8px' }}>
            <CodeEditor
              value={combinedCode}
              onChange={handleCombinedCodeChange}
              language="verilog"
              height="540px"
            />
          </div>

          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '11px'
          }}>
            Write the design module first and the testbench after it.
            Name the testbench module like <code>tb_my_design</code>.
          </div>
        </div>

        <div style={{ ...panelStyle, minHeight: '600px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '0 10px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            minHeight: '42px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setOutputTab('waveform')}
              style={{
                padding: '9px 10px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: outputTab === 'waveform'
                  ? 'var(--bg-card)' : 'transparent',
                color: outputTab === 'waveform'
                  ? 'var(--brand-primary)' : 'var(--text-secondary)',
                borderBottom: outputTab === 'waveform'
                  ? '2px solid var(--brand-primary)'
                  : '2px solid transparent'
              }}
            >
              <Layers size={13} style={{ verticalAlign: 'middle' }} /> Waveform
            </button>

            <button
              onClick={() => setOutputTab('console')}
              style={{
                padding: '9px 10px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: outputTab === 'console'
                  ? 'var(--bg-card)' : 'transparent',
                color: outputTab === 'console'
                  ? 'var(--brand-primary)' : 'var(--text-secondary)',
                borderBottom: outputTab === 'console'
                  ? '2px solid var(--brand-primary)'
                  : '2px solid transparent'
              }}
            >
              Compiler &amp; Logs
            </button>

            {simResult && (
              <span style={{ marginLeft: 'auto', fontSize: '11px' }}>
                <Clock size={12} style={{ verticalAlign: 'middle' }} />{' '}
                {simResult.duration_ms} ms
              </span>
            )}
          </div>

          <div style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
            {outputTab === 'waveform' ? (
              <WaveformViewer
                waveform={simResult?.waveform}
                onLoadExample={() => {
                  const example = VERILOG_EXAMPLES[0];
                  setDesignCode(example.design);
                  setTbCode(example.tb);
                  setFilename(example.filename);
                  setTbFilename(example.tbFilename);
                  setSimResult(null);
                  void handleSimulate(
                    example.design,
                    example.filename,
                    example.tb,
                    example.tbFilename
                  );
                }}
                height="530px"
              />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {simResult && (!simResult.success || !simResult.compiled) && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--accent-red-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginBottom: '8px'
                    }}>
                      <strong style={{
                        color: 'var(--accent-red)',
                        fontSize: '12px'
                      }}>
                        <AlertCircle size={14} style={{ verticalAlign: 'middle' }} />{' '}
                        Verilog Diagnostic Error
                      </strong>

                      <button
                        onClick={() => void handleExplainError()}
                        disabled={isExplaining}
                        className="btn btn-primary"
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          backgroundColor: '#8b5cf6',
                          borderColor: '#8b5cf6'
                        }}
                      >
                        {isExplaining
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Sparkles size={12} />}
                        Explain Error
                      </button>
                    </div>

                    <pre style={{
                      fontSize: '11px',
                      color: 'var(--accent-red)',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere'
                    }}>
                      {!simResult.compiled
                        ? simResult.compiler_output
                        : simResult.simulation_output || simResult.compiler_output}
                    </pre>
                  </div>
                )}

                <div>
                  <strong style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}>
                    ICARUS VERILOG COMPILER
                  </strong>
                  <pre style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid var(--border-color)',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    maxHeight: '220px',
                    overflow: 'auto'
                  }}>
                    {simResult?.compiler_output || 'No compilation run yet.'}
                  </pre>
                </div>

                <div>
                  <strong style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}>
                    VVP SIMULATION OUTPUT
                  </strong>
                  <pre style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid var(--border-color)',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    minHeight: '160px',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {simResult?.simulation_output || 'No simulation executed yet.'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TestbenchModal
        isOpen={isTbModalOpen}
        onClose={() => setIsTbModalOpen(false)}
        testbenchData={tbGenData}
        onInsertTestbench={handleInsertTestbench}
      />

      <WaveformAnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        analysis={analysisData}
      />

      <ErrorExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        explanation={errorExplanation}
        onApplyFix={fixedCode => {
          const separated = splitVerilogSource(fixedCode);
          setDesignCode(separated.design);
          if (separated.testbench) setTbCode(separated.testbench);
          setSimResult(null);
        }}
      />

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        defaultTitle={filename.replace(/\.v$/i, '')}
        language="verilog"
        code={designCode}
        testbenchCode={tbCode}
        status={simResult?.success ? 'success' : 'error'}
        durationMs={simResult?.duration_ms || 0}
        stdout={simResult?.simulation_output || ''}
        stderr={simResult?.compiler_output || ''}
        vcdRaw={simResult?.vcd_raw}
      />
    </div>
  );
};
