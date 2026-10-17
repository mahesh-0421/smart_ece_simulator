from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.experiment import Experiment
from app.services.experiment_service import ExperimentService

router = APIRouter(prefix="/experiments", tags=["ECE Experiments Library"])

@router.get("", response_model=List[Experiment])
def list_experiments(category: Optional[str] = Query(None, description="Category filter: matlab or verilog")):
    """
    Returns curated laboratory experiments with objectives, theory, procedures,
    sample code, testbenches, and expected outputs.
    """
    return ExperimentService.get_all_experiments(category=category)

@router.get("/{experiment_id}", response_model=Experiment)
def get_experiment(experiment_id: str):
    """
    Returns details of a specific laboratory experiment.
    """
    exp = ExperimentService.get_experiment_by_id(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp
