from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class MatlabExecuteRequest(BaseModel):
    code: str = Field(..., max_length=65536, description="MATLAB / Octave script code")
    filename: Optional[str] = Field("script.m", max_length=120)

class MatlabExecuteResponse(BaseModel):
    success: bool
    stdout: str
    stderr: str
    exit_code: int
    duration_ms: float
    plot_image_base64: Optional[str] = None
    has_plot: bool = False
    error_summary: Optional[str] = None

class VerilogCompileRequest(BaseModel):
    code: str = Field(..., max_length=65536, description="Verilog design code")
    filename: Optional[str] = Field("design.v", max_length=120)
    testbench_code: Optional[str] = Field(None, max_length=65536, description="Verilog testbench code")
    testbench_filename: Optional[str] = Field("tb_design.v", max_length=120)

class VerilogCompileResponse(BaseModel):
    success: bool
    compiler_output: str
    exit_code: int
    duration_ms: float
    error_summary: Optional[str] = None

class WaveformTransition(BaseModel):
    time: int
    value: str

class WaveformSignal(BaseModel):
    name: str
    wire_id: str
    width: int
    signal_type: str  # "wire", "reg", etc.
    transitions: List[WaveformTransition]

class WaveformParsed(BaseModel):
    timescale: str
    end_time: int
    signals: List[WaveformSignal]

class VerilogSimulateRequest(BaseModel):
    code: str = Field(..., max_length=65536, description="Verilog design code")
    filename: Optional[str] = Field("design.v", max_length=120)
    testbench_code: Optional[str] = Field(None, max_length=65536, description="Verilog testbench code")
    testbench_filename: Optional[str] = Field("tb_design.v", max_length=120)

class VerilogSimulateResponse(BaseModel):
    success: bool
    compiled: bool
    compiler_output: str
    simulation_output: str
    exit_code: int
    duration_ms: float
    has_waveform: bool = False
    vcd_raw: Optional[str] = None
    waveform: Optional[WaveformParsed] = None
    error_summary: Optional[str] = None

class TestbenchGenerateRequest(BaseModel):
    code: str = Field(..., max_length=65536)
    module_name: Optional[str] = None

class TestbenchGenerateResponse(BaseModel):
    success: bool
    module_name: str
    inputs: List[Dict[str, Any]]
    outputs: List[Dict[str, Any]]
    testbench_code: str
    message: str

class SignalCheck(BaseModel):
    signal_name: str
    expected_value_at_time: Dict[int, str]

class WaveformAnalysisRequest(BaseModel):
    vcd_text: str
    expected_checks: Optional[List[SignalCheck]] = None
    target_module: Optional[str] = None

class WaveformAnalysisResponse(BaseModel):
    success: bool
    total_time: int
    signals_count: int
    total_transitions: int
    check_results: List[Dict[str, Any]]
    summary: str
    clock_detected: Optional[Dict[str, Any]] = None
