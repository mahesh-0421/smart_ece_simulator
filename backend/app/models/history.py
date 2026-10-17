from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class ExecutionRecord(Base):
    __tablename__ = "execution_history"

    id = Column(Integer, primary_key=True, index=True)
    program_name = Column(String(120), nullable=False)
    language = Column(String(20), nullable=False, index=True)  # "matlab" or "verilog"
    status = Column(String(20), nullable=False)  # "success", "error", "timeout", "compilation_failed"
    duration_ms = Column(Float, default=0.0)
    stdout = Column(Text, nullable=True)
    stderr = Column(Text, nullable=True)
    error_summary = Column(String(255), nullable=True)
    has_plot = Column(Boolean, default=False)
    has_waveform = Column(Boolean, default=False)
    source_code = Column(Text, nullable=True)
    testbench_code = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
