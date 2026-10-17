from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.history import ExecutionRecord
from app.schemas.execution import MatlabExecuteRequest, MatlabExecuteResponse
from app.services.octave_service import OctaveService

router = APIRouter(prefix="/matlab", tags=["MATLAB-Compatible Engine"])

@router.post("/execute", response_model=MatlabExecuteResponse)
def execute_matlab_code(req: MatlabExecuteRequest, db: Session = Depends(get_db)):
    """
    Executes MATLAB-compatible code via GNU Octave in an isolated sandbox.
    Captures numerical outputs, plots, execution time, and logs history.
    """
    result = OctaveService.execute_script(code=req.code, filename=req.filename or "script.m")

    # Record in history table
    try:
        status_str = "success" if result["success"] else ("timeout" if result["exit_code"] == -1 else "error")
        record = ExecutionRecord(
            program_name=req.filename or "script.m",
            language="matlab",
            status=status_str,
            duration_ms=result["duration_ms"],
            stdout=result["stdout"],
            stderr=result["stderr"],
            error_summary=result["error_summary"],
            has_plot=result["has_plot"],
            has_waveform=False,
            source_code=req.code
        )
        db.add(record)
        db.commit()
    except Exception:
        db.rollback()

    return MatlabExecuteResponse(**result)
