from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.history import ExecutionRecord
from app.models.program import Program

router = APIRouter(prefix="/history", tags=["Execution History"])

@router.get("")
def get_execution_history(
    language: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    """
    Returns recent execution history records and aggregated dashboard statistics.
    All metrics reflect real execution and simulation runs.
    """
    query = db.query(ExecutionRecord)
    if language:
        query = query.filter(ExecutionRecord.language == language.lower())
    if status:
        query = query.filter(ExecutionRecord.status == status.lower())

    records = query.order_by(ExecutionRecord.created_at.desc()).limit(limit).all()

    # Aggregate actual dashboard stats
    all_records = db.query(ExecutionRecord).all()
    total_execs = len(all_records)
    total_successes = sum(1 for r in all_records if r.status == "success")
    total_failures = total_execs - total_successes
    matlab_execs = sum(1 for r in all_records if r.language == "matlab")
    verilog_execs = sum(1 for r in all_records if r.language == "verilog")
    saved_programs_count = db.query(Program).count()

    return {
        "stats": {
            "total_saved_programs": saved_programs_count,
            "total_executions": total_execs,
            "successful_executions": total_successes,
            "failed_executions": total_failures,
            "matlab_count": matlab_execs,
            "verilog_count": verilog_execs
        },
        "records": [
            {
                "id": r.id,
                "program_name": r.program_name,
                "language": r.language,
                "status": r.status,
                "duration_ms": r.duration_ms,
                "error_summary": r.error_summary,
                "has_plot": r.has_plot,
                "has_waveform": r.has_waveform,
                "created_at": r.created_at
            }
            for r in records
        ]
    }

@router.get("/{record_id}")
def get_history_detail(record_id: int, db: Session = Depends(get_db)):
    """
    Retrieves full execution transcript, inputs, and outputs of a past run.
    """
    record = db.query(ExecutionRecord).filter(ExecutionRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Execution record not found")

    return {
        "id": record.id,
        "program_name": record.program_name,
        "language": record.language,
        "status": record.status,
        "duration_ms": record.duration_ms,
        "stdout": record.stdout,
        "stderr": record.stderr,
        "error_summary": record.error_summary,
        "has_plot": record.has_plot,
        "has_waveform": record.has_waveform,
        "source_code": record.source_code,
        "testbench_code": record.testbench_code,
        "created_at": record.created_at
    }

@router.delete("")
def clear_history(db: Session = Depends(get_db)):
    """
    Clears execution history records.
    """
    db.query(ExecutionRecord).delete()
    db.commit()
    return {"message": "Execution history cleared"}
