from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.history import ExecutionRecord
from app.schemas.execution import (
    VerilogCompileRequest, VerilogCompileResponse,
    VerilogSimulateRequest, VerilogSimulateResponse,
    TestbenchGenerateRequest, TestbenchGenerateResponse
)
from app.services.verilog_service import VerilogService
from app.services.testbench_assistant import TestbenchAssistant

router = APIRouter(prefix="/verilog", tags=["Verilog Simulation Engine"])

@router.post("/compile", response_model=VerilogCompileResponse)
def compile_verilog_code(req: VerilogCompileRequest):
    """
    Compiles Verilog HDL design using Icarus Verilog.
    Validates design hierarchy and syntax without running simulation.
    """
    result = VerilogService.compile_code(
        code=req.code,
        filename=req.filename or "design.v",
        testbench_code=req.testbench_code,
        testbench_filename=req.testbench_filename or "tb_design.v"
    )
    return VerilogCompileResponse(**result)

@router.post("/simulate", response_model=VerilogSimulateResponse)
def simulate_verilog_code(req: VerilogSimulateRequest, db: Session = Depends(get_db)):
    """
    Compiles and simulates Verilog HDL design using Icarus Verilog and VVP.
    Generates and parses real VCD waveform dump data.
    """
    result = VerilogService.simulate_code(
        code=req.code,
        filename=req.filename or "design.v",
        testbench_code=req.testbench_code,
        testbench_filename=req.testbench_filename or "tb_design.v"
    )

    # Record in history table
    try:
        if not result["compiled"]:
            status_str = "compilation_failed"
        elif not result["success"]:
            status_str = "timeout" if result["exit_code"] == -1 else "error"
        else:
            status_str = "success"

        record = ExecutionRecord(
            program_name=req.filename or "design.v",
            language="verilog",
            status=status_str,
            duration_ms=result["duration_ms"],
            stdout=result["simulation_output"],
            stderr=result["compiler_output"] if not result["compiled"] else "",
            error_summary=result["error_summary"],
            has_plot=False,
            has_waveform=result["has_waveform"],
            source_code=req.code,
            testbench_code=req.testbench_code
        )
        db.add(record)
        db.commit()
    except Exception:
        db.rollback()

    return VerilogSimulateResponse(**result)

@router.post("/generate-testbench", response_model=TestbenchGenerateResponse)
def generate_testbench(req: TestbenchGenerateRequest):
    """
    Analyzes Verilog design ports and generates a customized testbench template
    with clock, reset, stimulus, and VCD dumping.
    """
    result = TestbenchAssistant.generate_testbench(
        verilog_code=req.code,
        target_module=req.module_name
    )
    return TestbenchGenerateResponse(**result)
