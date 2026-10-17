from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class Experiment(BaseModel):
    id: str
    title: str
    category: str  # "matlab" or "verilog"
    objective: str
    required_software: str
    theory: str
    procedure: List[str]
    sample_code: str
    sample_testbench: Optional[str] = None
    expected_output: str
    expected_waveform_desc: Optional[str] = None
    result_explanation: str
    conclusion: str
    tags: List[str]

class ErrorExplanationRequest(BaseModel):
    language: str  # "matlab" or "verilog"
    code: str
    testbench_code: Optional[str] = None
    error_message: str

class ErrorExplanationResponse(BaseModel):
    original_error: str
    likely_cause: str
    suggested_fix: str
    line_number: Optional[int] = None
    corrected_code: Optional[str] = None
    confidence: str  # "high", "medium", "general"
    provider_used: str  # "rule_based" or "ai_model"
