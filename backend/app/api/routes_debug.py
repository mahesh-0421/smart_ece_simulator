from fastapi import APIRouter
from app.schemas.experiment import ErrorExplanationRequest, ErrorExplanationResponse
from app.schemas.execution import WaveformAnalysisRequest, WaveformAnalysisResponse
from app.services.error_explanation_service import ErrorExplanationService
from app.services.waveform_analyzer import WaveformAnalyzer

router = APIRouter(prefix="", tags=["Debugging & Waveform Analysis"])

@router.post("/errors/explain", response_model=ErrorExplanationResponse)
def explain_code_error(req: ErrorExplanationRequest):
    """
    Analyzes compiler and simulation error messages. Identifies line numbers,
    explains root causes in plain English, and suggests corrections.
    """
    result = ErrorExplanationService.explain_error(
        language=req.language,
        code=req.code,
        testbench_code=req.testbench_code,
        error_message=req.error_message
    )
    return ErrorExplanationResponse(**result)

@router.post("/waveforms/analyze", response_model=WaveformAnalysisResponse)
def analyze_simulation_waveform(req: WaveformAnalysisRequest):
    """
    Analyzes digital VCD simulation waveforms: computes transition statistics,
    detects clock signal characteristics, and verifies sequence assertions.
    """
    checks_dicts = [c.dict() for c in req.expected_checks] if req.expected_checks else None
    result = WaveformAnalyzer.analyze_vcd(
        vcd_text=req.vcd_text,
        expected_checks=checks_dicts,
        target_module=req.target_module
    )
    return WaveformAnalysisResponse(**result)
