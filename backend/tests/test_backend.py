import pytest
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.services.octave_service import OctaveService
from app.services.verilog_service import VerilogService
from app.services.waveform_service import WaveformService
from app.services.waveform_analyzer import WaveformAnalyzer
from app.services.testbench_assistant import TestbenchAssistant
from app.services.error_explanation_service import ErrorExplanationService
from app.services.report_service import ReportService

# ----------------- OCTAVE TESTS -----------------
def test_octave_availability():
    """Verify tool detection detects installed GNU Octave."""
    is_avail = OctaveService.is_available()
    assert is_avail is True, "GNU Octave should be auto-detected on this system"

def test_octave_arithmetic_execution():
    """Execute standard arithmetic script."""
    code = "a = 15; b = 30; disp(a + b);"
    res = OctaveService.execute_script(code)
    assert res["success"] is True
    assert "45" in res["stdout"]
    assert res["exit_code"] == 0

def test_octave_matrix_operations():
    """Execute matrix arithmetic script."""
    code = "A = [1, 2; 3, 4]; B = [5, 6; 7, 8]; C = A + B; disp(C);"
    res = OctaveService.execute_script(code)
    assert res["success"] is True
    assert "6" in res["stdout"]
    assert "12" in res["stdout"]

def test_octave_plot_generation():
    """Execute script generating figure and verify base64 image capture."""
    code = "t = 0:0.1:1; y = sin(t); plot(t, y); grid on;"
    res = OctaveService.execute_script(code)
    assert res["success"] is True
    assert res["has_plot"] is True
    assert res["plot_image_base64"] is not None
    assert res["plot_image_base64"].startswith("data:image/png;base64,")

def test_octave_syntax_error():
    """Verify handling and reporting of Octave syntax errors."""
    code = "x = [1, 2, 3"  # Missing closing bracket
    res = OctaveService.execute_script(code)
    assert res["success"] is False
    assert res["exit_code"] != 0
    assert "parse error" in res["stderr"].lower() or "syntax" in res["stderr"].lower()

def test_octave_runtime_error():
    """Verify handling of dimension mismatch runtime errors."""
    code = "A = [1 2 3]; B = [1 2]; C = A + B;"
    res = OctaveService.execute_script(code)
    assert res["success"] is False
    assert "nonconformant" in res["stderr"].lower() or "error" in res["stderr"].lower()

# ----------------- VERILOG TESTS -----------------
def test_verilog_availability():
    """Verify tool detection detects installed Icarus Verilog and VVP."""
    is_avail = VerilogService.is_available()
    assert is_avail is True, "Icarus Verilog and VVP should be auto-detected"

def test_verilog_logic_gate_compilation():
    """Test compiling basic AND gate."""
    code = """
    module and_gate (input wire a, input wire b, output wire y);
        assign y = a & b;
    endmodule
    """
    res = VerilogService.compile_code(code)
    assert res["success"] is True
    assert res["exit_code"] == 0

def test_verilog_compilation_error():
    """Test compiler diagnostics on malformed Verilog."""
    code = """
    module broken (input wire a, output wire y);
        assign y = a + ; // Syntax error
    endmodule
    """
    res = VerilogService.compile_code(code)
    assert res["success"] is False
    assert res["exit_code"] != 0
    assert "syntax error" in res["compiler_output"].lower() or "error" in res["compiler_output"].lower()

def test_verilog_simulation_and_waveform():
    """Simulate 4-bit counter with testbench and verify VCD generation and parsing."""
    design_code = """
    module counter4 (
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
    """

    tb_code = """
    `timescale 1ns / 1ps
    module tb_counter4;
        reg clk;
        reg reset;
        wire [3:0] count;

        counter4 uut (.clk(clk), .reset(reset), .count(count));

        always #5 clk = ~clk;

        initial begin
            $dumpfile("dump.vcd");
            $dumpvars(0, tb_counter4);
            clk = 0;
            reset = 1;
            #12 reset = 0;
            #40 $finish;
        end
    endmodule
    """

    res = VerilogService.simulate_code(design_code, "counter4.v", tb_code, "tb_counter4.v")
    assert res["compiled"] is True
    assert res["success"] is True
    assert res["has_waveform"] is True
    assert res["waveform"] is not None
    signals = res["waveform"]["signals"]
    signal_names = [s["name"] for s in signals]
    assert any("clk" in n for n in signal_names)
    assert any("reset" in n for n in signal_names)
    assert any("count" in n for n in signal_names)

# ----------------- TESTBENCH ASSISTANT TESTS -----------------
def test_testbench_generation():
    """Verify automatic port extraction and testbench code generation."""
    code = """
    module alu (
        input wire [3:0] a,
        input wire [3:0] b,
        input wire [1:0] op,
        output reg [3:0] result
    );
    always @(*) begin
        case (op)
            2'b00: result = a + b;
            default: result = a - b;
        endcase
    end
    endmodule
    """
    res = TestbenchAssistant.generate_testbench(code)
    assert res["success"] is True
    assert res["module_name"] == "alu"
    assert len(res["inputs"]) == 3
    assert len(res["outputs"]) == 1
    assert "module tb_alu;" in res["testbench_code"]
    assert "$dumpfile" in res["testbench_code"]

# ----------------- WAVEFORM ANALYZER TESTS -----------------
def test_waveform_analysis():
    """Verify waveform transition counts, clock detection, and sequence checks."""
    vcd_content = """$timescale 1ns $end
$scope module tb $end
$var wire 1 " clk $end
$var wire 4 ! count [3:0] $end
$upscope $end
$enddefinitions $end
#0
0"
b0000 !
#5
1"
#10
0"
#15
1"
b0001 !
#20
0"
#25
1"
b0010 !
#30
0"
"""
    res = WaveformAnalyzer.analyze_vcd(vcd_content)
    assert res["success"] is True
    assert res["signals_count"] == 2
    assert res["total_transitions"] > 0
    assert res["clock_detected"] is not None
    assert res["clock_detected"]["period"] == 10.0

# ----------------- ERROR EXPLANATION TESTS -----------------
def test_error_explanation_matlab_matrix_dim():
    """Test deterministic explanation for Octave matrix dimension mismatch."""
    err = "error: operator +: nonconformant arguments (op1 is 1x3, op2 is 1x2)"
    res = ErrorExplanationService.explain_error("matlab", "A + B", error_message=err)
    assert res["confidence"] == "high"
    assert "dimension mismatch" in res["likely_cause"].lower()

def test_error_explanation_verilog_wire_assign():
    """Test deterministic explanation for Verilog wire assignment in procedural block."""
    err = "design.v:10: error: can not assign to wire 'sum' in procedural block"
    res = ErrorExplanationService.explain_error("verilog", "always @(*) sum = a + b;", error_message=err)
    assert res["confidence"] == "high"
    assert "reg" in res["suggested_fix"].lower()
    assert res["line_number"] == 10

# ----------------- REPORT GENERATION TESTS -----------------
def test_report_generation():
    """Verify that ReportLab produces a valid non-empty PDF byte stream."""
    pdf_bytes = ReportService.generate_pdf_report(
        title="Verification Test Experiment",
        language="matlab",
        code="a = 10; b = 20; disp(a + b);",
        status="success",
        duration_ms=45.2,
        stdout="30",
        objective="Verify PDF report creation"
    )
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")
