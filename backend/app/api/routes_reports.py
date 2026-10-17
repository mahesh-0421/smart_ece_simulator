from fastapi import APIRouter, Response, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.report_service import ReportService
import re

router = APIRouter(prefix="/reports", tags=["Report Generation"])

class ReportGenerateRequest(BaseModel):
    title: str = Field(..., max_length=150)
    language: str = Field(..., max_length=30)
    code: str
    testbench_code: Optional[str] = None
    status: str = Field("success", max_length=30)
    duration_ms: float = 0.0
    stdout: str = ""
    stderr: str = ""
    plot_image_base64: Optional[str] = None
    vcd_raw: Optional[str] = None
    objective: Optional[str] = None
    conclusion: Optional[str] = None
    error_explanation: Optional[Dict[str, Any]] = None

@router.post("/generate")
def generate_report(req: ReportGenerateRequest):
    """
    Compiles full experiment execution data, genuine plots, waveforms, and logs
    into a professional downloadable PDF laboratory report.
    """
    try:
        pdf_bytes = ReportService.generate_pdf_report(
            title=req.title,
            language=req.language,
            code=req.code,
            testbench_code=req.testbench_code,
            status=req.status,
            duration_ms=req.duration_ms,
            stdout=req.stdout,
            stderr=req.stderr,
            plot_image_base64=req.plot_image_base64,
            vcd_raw=req.vcd_raw,
            objective=req.objective,
            conclusion=req.conclusion,
            error_explanation=req.error_explanation
        )

        safe_filename = re.sub(r"[^\w\-_]", "_", req.title).strip("_") or "lab_report"
        filename = f"{safe_filename}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")
