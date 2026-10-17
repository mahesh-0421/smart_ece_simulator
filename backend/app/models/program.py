from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    filename = Column(String(120), nullable=False, index=True)
    language = Column(String(20), nullable=False, index=True)  # "matlab" or "verilog"
    code = Column(Text, nullable=False)
    testbench_code = Column(Text, nullable=True)  # Used for Verilog testbenches
    description = Column(String(255), nullable=True)
    tags = Column(String(255), nullable=True)  # Comma-separated tags
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
