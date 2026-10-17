import os
import time
import base64
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional
from app.core.config import settings

class OctaveService:
    @staticmethod
    def is_available() -> bool:
        return settings.octave_path is not None and os.path.exists(settings.octave_path)

    @classmethod
    def execute_script(cls, code: str, filename: str = "script.m") -> Dict[str, Any]:
        octave_exe = settings.octave_path
        if not octave_exe or not os.path.exists(octave_exe):
            return {
                "success": False,
                "stdout": "",
                "stderr": (
                    "GNU Octave executable was not found on this system.\n"
                    "GNU Octave is required to execute MATLAB-compatible scripts.\n"
                    "Setup instructions:\n"
                    "1. Download GNU Octave from https://octave.org/download\n"
                    "2. Install it (default path: C:\\Program Files\\GNU Octave\\...)\n"
                    "3. Add Octave's mingw64/bin or bin directory to your system PATH or set OCTAVE_PATH in backend/.env"
                ),
                "exit_code": 127,
                "duration_ms": 0.0,
                "has_plot": False,
                "plot_image_base64": None,
                "error_summary": "GNU Octave runtime not installed or not found."
            }

        if len(code.encode('utf-8')) > settings.MAX_SOURCE_CODE_SIZE_BYTES:
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Source code exceeds maximum allowed size ({settings.MAX_SOURCE_CODE_SIZE_BYTES} bytes).",
                "exit_code": 1,
                "duration_ms": 0.0,
                "has_plot": False,
                "plot_image_base64": None,
                "error_summary": "Source code too large."
            }

        # Safe filename sanitization
        safe_filename = Path(filename).name
        if not safe_filename.endswith(".m"):
            safe_filename += ".m"

        start_time = time.time()
        temp_dir = tempfile.TemporaryDirectory(prefix="ece_octave_")

        try:
            work_dir = Path(temp_dir.name)
            script_path = work_dir / safe_filename
            plot_file = work_dir / "plot_output.png"

            # Wrapper logic to catch plots headlessly without hanging GUI
            # Note: graphics_toolkit('gnuplot') allows headless rasterization without X11/DISPLAY
                       preamble = (
                "warning('off', 'all');\n"
                "try\n"
                "  graphics_toolkit('gnuplot');\n"
                "catch\n"
                "end_try_catch\n"
                "try\n"
                "  set(0, 'defaultfigurevisible', 'off');\n"
                "  set(0, 'defaultaxesfontname', 'DejaVu Sans');\n"
                "  set(0, 'defaulttextfontname', 'DejaVu Sans');\n"
                "catch\n"
                "end_try_catch\n"
            )

            # Suffix checks if any figures are open and prints the active/last figure
            postamble = (
                "\n"
                "figs = get(0, 'children');\n"
                "if ~isempty(figs)\n"
                "  try\n"
                "    print(figs(1), 'plot_output.png', '-dpng');\n"
                "  catch\n"
                "  end_try_catch\n"
                "endif\n"
            )

            full_script_content = preamble + code + postamble
            script_path.write_text(full_script_content, encoding="utf-8")

            # Execute Octave in isolated subprocess with strict argument array
            cmd = [
                octave_exe,
                "--quiet",
                "--no-gui",
                "--no-history",
                "-W",
                safe_filename
            ]

            try:
                proc = subprocess.run(
                    cmd,
                    cwd=str(work_dir),
                    capture_output=True,
                    text=True,
                    timeout=settings.MAX_EXECUTION_TIME_SECONDS
                )
                duration_ms = round((time.time() - start_time) * 1000, 2)

                stdout = proc.stdout or ""
                stderr = proc.stderr or ""

                # Filter out gnuplot/fltk warning lines or FC_WEIGHT debug strings if Octave produces them
                cleaned_stderr = "\n".join([
                    line for line in stderr.splitlines()
                    if not line.startswith("warning: using the")
                    and "is discouraged" not in line
                    and "FC_WEIGHT" not in line
                ]).strip()

                cleaned_stdout = "\n".join([
                    line for line in stdout.splitlines()
                    if "FC_WEIGHT" not in line
                ]).strip()

                # Check if plot was produced
                has_plot = False
                plot_b64 = None
                if plot_file.exists() and plot_file.stat().st_size > 0:
                    has_plot = True
                    with open(plot_file, "rb") as pf:
                        b64_str = base64.b64encode(pf.read()).decode("ascii")
                        plot_b64 = f"data:image/png;base64,{b64_str}"

                success = (proc.returncode == 0) and not ("error:" in cleaned_stderr.lower())
                error_summary = None
                if not success:
                    lines = [l for l in cleaned_stderr.splitlines() if l.strip()]
                    error_summary = lines[0] if lines else "Script execution failed."

                return {
                    "success": success,
                    "stdout": cleaned_stdout[:settings.MAX_OUTPUT_SIZE_BYTES],
                    "stderr": cleaned_stderr[:settings.MAX_OUTPUT_SIZE_BYTES],
                    "exit_code": proc.returncode,
                    "duration_ms": duration_ms,
                    "has_plot": has_plot,
                    "plot_image_base64": plot_b64,
                    "error_summary": error_summary
                }

            except subprocess.TimeoutExpired:
                duration_ms = round((time.time() - start_time) * 1000, 2)
                return {
                    "success": False,
                    "stdout": "",
                    "stderr": f"Execution timed out after {settings.MAX_EXECUTION_TIME_SECONDS} seconds.",
                    "exit_code": -1,
                    "duration_ms": duration_ms,
                    "has_plot": False,
                    "plot_image_base64": None,
                    "error_summary": "Execution timed out (possible infinite loop)."
                }

        except Exception as e:
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Internal execution error: {str(e)}",
                "exit_code": 1,
                "duration_ms": round((time.time() - start_time) * 1000, 2),
                "has_plot": False,
                "plot_image_base64": None,
                "error_summary": str(e)
            }
        finally:
            temp_dir.cleanup()
