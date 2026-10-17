from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class ProgramBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    filename: str = Field(..., min_length=1, max_length=120)
    language: str = Field(..., pattern="^(matlab|verilog)$")
    code: str
    testbench_code: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None

class ProgramCreate(ProgramBase):
    pass

class ProgramUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    filename: Optional[str] = Field(None, min_length=1, max_length=120)
    code: Optional[str] = None
    testbench_code: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None

class ProgramResponse(ProgramBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
