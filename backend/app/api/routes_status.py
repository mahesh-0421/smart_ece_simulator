from fastapi import APIRouter
from app.core.config import settings
from app.services.octave_service import OctaveService
from app.services.verilog_service import VerilogService

router = APIRouter(prefix="/status", tags=["System Status"])

@router.get("")
def get_system_status():
    """
    Returns live health information, tool detection paths, and runtime capabilities.
    """
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "Single-User Local Academic Demonstration Mode",
        "tools": {
            "octave": {
                "available": OctaveService.is_available(),
                "path": settings.octave_path,
                "notes": "GNU Octave (MATLAB-compatible numerical computing)"
            },
            "iverilog": {
                "available": VerilogService.is_available(),
                "iverilog_path": settings.iverilog_path,
                "vvp_path": settings.vvp_path,
                "notes": "Icarus Verilog compiler and VVP simulation runtime"
            },
            "ai_debugger": {
                "configured": bool(settings.AI_PROVIDER and settings.AI_API_KEY),
                "provider": settings.AI_PROVIDER or "deterministic_rules_only",
                "notes": "Deterministic rules active. Optional AI enhancement configured via environment."
            }
        },
        "limits": {
            "max_execution_time_sec": settings.MAX_EXECUTION_TIME_SECONDS,
            "max_code_size_bytes": settings.MAX_SOURCE_CODE_SIZE_BYTES
        }
    }
