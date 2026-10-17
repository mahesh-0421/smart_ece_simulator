from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.program import Program
from app.schemas.program import ProgramCreate, ProgramUpdate, ProgramResponse

router = APIRouter(prefix="/programs", tags=["Program Management"])

@router.get("", response_model=List[ProgramResponse])
def list_programs(
    language: Optional[str] = Query(None, description="Filter by language: matlab or verilog"),
    search: Optional[str] = Query(None, description="Search in title or filename"),
    db: Session = Depends(get_db)
):
    """
    Returns list of saved student programs, with optional filtering and search.
    """
    query = db.query(Program)
    if language:
        query = query.filter(Program.language == language.lower())
    if search:
        search_fmt = f"%{search}%"
        query = query.filter((Program.title.ilike(search_fmt)) | (Program.filename.ilike(search_fmt)))

    return query.order_by(Program.updated_at.desc()).all()

@router.post("", response_model=ProgramResponse)
def create_program(prog: ProgramCreate, db: Session = Depends(get_db)):
    """
    Saves a new program and optional testbench.
    """
    # Check for duplicate filename within same language
    existing = db.query(Program).filter(
        Program.filename == prog.filename,
        Program.language == prog.language
    ).first()

    if existing:
        # Update existing
        existing.title = prog.title
        existing.code = prog.code
        existing.testbench_code = prog.testbench_code
        existing.description = prog.description
        existing.tags = prog.tags
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return existing

    new_prog = Program(
        title=prog.title,
        filename=prog.filename,
        language=prog.language.lower(),
        code=prog.code,
        testbench_code=prog.testbench_code,
        description=prog.description,
        tags=prog.tags
    )
    db.add(new_prog)
    db.commit()
    db.refresh(new_prog)
    return new_prog

@router.get("/{program_id}", response_model=ProgramResponse)
def get_program(program_id: int, db: Session = Depends(get_db)):
    """
    Fetches a saved program by ID.
    """
    prog = db.query(Program).filter(Program.id == program_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found")
    return prog

@router.put("/{program_id}", response_model=ProgramResponse)
def update_program(program_id: int, prog_update: ProgramUpdate, db: Session = Depends(get_db)):
    """
    Updates code, filename, or metadata of a saved program.
    """
    prog = db.query(Program).filter(Program.id == program_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found")

    if prog_update.title is not None:
        prog.title = prog_update.title
    if prog_update.filename is not None:
        prog.filename = prog_update.filename
    if prog_update.code is not None:
        prog.code = prog_update.code
    if prog_update.testbench_code is not None:
        prog.testbench_code = prog_update.testbench_code
    if prog_update.description is not None:
        prog.description = prog_update.description
    if prog_update.tags is not None:
        prog.tags = prog_update.tags

    prog.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(prog)
    return prog

@router.delete("/{program_id}")
def delete_program(program_id: int, db: Session = Depends(get_db)):
    """
    Deletes a saved program.
    """
    prog = db.query(Program).filter(Program.id == program_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found")

    db.delete(prog)
    db.commit()
    return {"message": f"Program '{prog.title}' deleted successfully"}

@router.get("/{program_id}/download")
def download_program_file(program_id: int, db: Session = Depends(get_db)):
    """
    Returns source code as downloadable raw text file.
    """
    prog = db.query(Program).filter(Program.id == program_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found")

    filename = prog.filename
    ext = ".m" if prog.language == "matlab" else ".v"
    if not filename.endswith(ext):
        filename += ext

    return PlainTextResponse(
        content=prog.code,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
