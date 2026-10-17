import os
import shutil
import glob
from pathlib import Path
from typing import Optional
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Smart ECE Lab API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Execution timeouts and resource limits
    MAX_EXECUTION_TIME_SECONDS: int = int(os.getenv("MAX_EXECUTION_TIME_SECONDS", "15"))
    MAX_SOURCE_CODE_SIZE_BYTES: int = int(os.getenv("MAX_SOURCE_CODE_SIZE_BYTES", "65536"))  # 64 KB
    MAX_OUTPUT_SIZE_BYTES: int = int(os.getenv("MAX_OUTPUT_SIZE_BYTES", "262144"))  # 256 KB
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smart_ece_lab.db")
    
    # Optional AI integration
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "").strip().lower()
    AI_API_KEY: str = os.getenv("AI_API_KEY", "").strip()
    AI_MODEL: str = os.getenv("AI_MODEL", "").strip()

    @property
    def octave_path(self) -> Optional[str]:
        env_val = os.getenv("OCTAVE_PATH")
        if env_val and os.path.exists(env_val):
            return env_val

        # Check Windows GNU Octave installations first for real executable
        octave_patterns = [
            r"C:\Program Files\GNU Octave\Octave-*\mingw64\bin\octave-cli.exe",
            r"C:\Program Files\GNU Octave\Octave-*\bin\octave-cli.exe",
            r"C:\Program Files (x86)\GNU Octave\Octave-*\mingw64\bin\octave-cli.exe",
            r"C:\Octave\*\bin\octave-cli.exe",
            r"C:\Program Files\GNU Octave\Octave-*\mingw64\bin\octave.exe",
        ]
        for pattern in octave_patterns:
            matches = glob.glob(pattern)
            if matches:
                return sorted(matches)[-1]  # Highest version found

        # Check standard PATH for octave-cli
        which_cli = shutil.which("octave-cli")
        if which_cli and not which_cli.lower().endswith((".vbs", ".bat")):
            return which_cli

        which_octave = shutil.which("octave")
        if which_octave and not which_octave.lower().endswith((".vbs", ".bat")):
            return which_octave

        return None

    @property
    def iverilog_path(self) -> Optional[str]:
        env_val = os.getenv("IVERILOG_PATH")
        if env_val and os.path.exists(env_val):
            return env_val

        which_iverilog = shutil.which("iverilog")
        if which_iverilog:
            return which_iverilog

        # Check standard Windows paths
        iverilog_candidates = [
            r"C:\iverilog\bin\iverilog.exe",
            r"C:\Program Files\iverilog\bin\iverilog.exe",
            r"C:\Program Files (x86)\iverilog\bin\iverilog.exe"
        ]
        for candidate in iverilog_candidates:
            if os.path.exists(candidate):
                return candidate
        return None

    @property
    def vvp_path(self) -> Optional[str]:
        env_val = os.getenv("VVP_PATH")
        if env_val and os.path.exists(env_val):
            return env_val

        which_vvp = shutil.which("vvp")
        if which_vvp:
            return which_vvp

        vvp_candidates = [
            r"C:\iverilog\bin\vvp.exe",
            r"C:\Program Files\iverilog\bin\vvp.exe",
            r"C:\Program Files (x86)\iverilog\bin\vvp.exe"
        ]
        for candidate in vvp_candidates:
            if os.path.exists(candidate):
                return candidate
        return None

settings = Settings()
