import os
import re
import time
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from app.core.config import settings
from app.services.waveform_service import WaveformService
from app.services.error_service import parse_diagnostics


class VerilogService:
    @staticmethod
    def is_available() -> bool:
        return (
            settings.iverilog_path is not None
            and os.path.exists(settings.iverilog_path)
            and settings.vvp_path is not None
            and os.path.exists(settings.vvp_path)
        )

    @classmethod
    def compile_code(
        cls,
        code: str,
        filename: str = "design.v",
        testbench_code: Optional[str] = None,
        testbench_filename: str = "tb_design.v"
    ) -> Dict[str, Any]:
        """
        Compiles Verilog source code using Icarus Verilog.
        Validates syntax, port connections, module hierarchy.
        """
        iverilog_exe = settings.iverilog_path
        if not iverilog_exe or not os.path.exists(iverilog_exe):
            return {
                "success": False,
                "compiler_output": (
                    "Icarus Verilog (iverilog) compiler was not found on this system.\n"
                    "Icarus Verilog is required to compile Verilog HDL designs.\n"
                    "Setup instructions:\n"
                    "1. Download Icarus Verilog for Windows from http://bleyer.org/icarus/\n"
                    "2. Install to default directory (e.g. C:\\iverilog)\n"
                    "3. Ensure C:\\iverilog\\bin is added to PATH or set IVERILOG_PATH in backend/.env"
                ),
                "exit_code": 127,
                "duration_ms": 0.0,
                "error_summary": "Icarus Verilog compiler not found.",
                "diagnostics": []
            }

        start_time = time.time()
        temp_dir = tempfile.TemporaryDirectory(prefix="ece_verilog_")

        try:
            work_dir = Path(temp_dir.name)
            design_path = work_dir / Path(filename).name
            output_vvp = work_dir / "design.vvp"

            # Always write utf-8 without BOM
            design_path.write_text(code, encoding="utf-8")
            source_files = [str(design_path)]

            if testbench_code and testbench_code.strip():
                tb_path = work_dir / Path(testbench_filename).name
                tb_path.write_text(testbench_code, encoding="utf-8")
                source_files.append(str(tb_path))

            cmd = [iverilog_exe, "-o", str(output_vvp)] + source_files

            proc = subprocess.run(
                cmd,
                cwd=str(work_dir),
                capture_output=True,
                text=True,
                timeout=settings.MAX_EXECUTION_TIME_SECONDS
            )

            duration_ms = round((time.time() - start_time) * 1000, 2)
            compiler_output = (proc.stdout + proc.stderr).strip()

            success = (proc.returncode == 0) and output_vvp.exists()
            error_summary = None
            if not success:
                err_lines = [l for l in compiler_output.splitlines() if "error" in l.lower() or "syntax" in l.lower()]
                error_summary = err_lines[0] if err_lines else (compiler_output.splitlines()[0] if compiler_output else "Compilation failed.")

            return {
                "success": success,
                "compiler_output": compiler_output,
                "exit_code": proc.returncode,
                "duration_ms": duration_ms,
                "error_summary": error_summary,
                "diagnostics": parse_diagnostics(compiler_output)
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "compiler_output": f"Compilation timed out after {settings.MAX_EXECUTION_TIME_SECONDS} seconds.",
                "exit_code": -1,
                "duration_ms": round((time.time() - start_time) * 1000, 2),
                "error_summary": "Compiler timed out.",
                "diagnostics": []
            }
        except Exception as e:
            return {
                "success": False,
                "compiler_output": f"Internal compilation error: {str(e)}",
                "exit_code": 1,
                "duration_ms": round((time.time() - start_time) * 1000, 2),
                "error_summary": str(e),
                "diagnostics": []
            }
        finally:
            temp_dir.cleanup()

    @classmethod
    def simulate_code(
        cls,
        code: str,
        filename: str = "design.v",
        testbench_code: Optional[str] = None,
        testbench_filename: str = "tb_design.v"
    ) -> Dict[str, Any]:
        """
        Compiles and simulates Verilog HDL design using Icarus Verilog and VVP.
        Extracts execution log and parses generated VCD timing waveform.
        """
        iverilog_exe = settings.iverilog_path
        vvp_exe = settings.vvp_path

        if not iverilog_exe or not vvp_exe or not os.path.exists(iverilog_exe) or not os.path.exists(vvp_exe):
            return {
                "success": False,
                "compiled": False,
                "compiler_output": "Icarus Verilog or VVP simulator binary is missing on this server.",
                "simulation_output": "",
                "exit_code": 127,
                "duration_ms": 0.0,
                "has_waveform": False,
                "vcd_raw": None,
                "waveform": None,
                "error_summary": "Icarus Verilog or VVP runtime not configured.",
                "diagnostics": []
            }

        # Check if testbench is provided or embedded in source
        has_embedded_tb = bool(re.search(r"\binitial\b", code))
        has_separate_tb = bool(testbench_code and testbench_code.strip())

        if not has_embedded_tb and not has_separate_tb:
            return {
                "success": False,
                "compiled": False,
                "compiler_output": (
                    "Notice: Simulation requires a testbench module with stimulus (clock, inputs, and $dumpfile).\n"
                    "Use the 'Testbench Assistant' or 'Load Example' button to generate an automatic testbench."
                ),
                "simulation_output": "",
                "exit_code": 1,
                "duration_ms": 0.0,
                "has_waveform": False,
                "vcd_raw": None,
                "waveform": None,
                "error_summary": "No testbench provided to drive inputs for simulation.",
                "diagnostics": []
            }

        start_time = time.time()
        temp_dir = tempfile.TemporaryDirectory(prefix="ece_sim_")

        try:
            work_dir = Path(temp_dir.name)
            design_path = work_dir / Path(filename).name
            sim_vvp = work_dir / "simulation.vvp"
            vcd_path = work_dir / "dump.vcd"

            # Check if VCD dump commands exist; if not, inject them safely
            tb_to_write = testbench_code or ""
            target_tb_name = testbench_filename

            if has_separate_tb:
                if "$dumpfile" not in tb_to_write:
                    tb_mod_match = re.search(r"module\s+([A-Za-z0-9_]+)", tb_to_write)
                    tb_mod_name = tb_mod_match.group(1) if tb_mod_match else "tb"
                    dump_block = f"""
initial begin
    $dumpfile("dump.vcd");
    $dumpvars(0, {tb_mod_name});
end
"""
                    tb_to_write = re.sub(r"endmodule", f"{dump_block}\nendmodule", tb_to_write, count=1)
            elif has_embedded_tb:
                if "$dumpfile" not in code:
                    mod_match = re.search(r"module\s+([A-Za-z0-9_]+)", code)
                    mod_name = mod_match.group(1) if mod_match else "main"
                    dump_block = f"""
initial begin
    $dumpfile("dump.vcd");
    $dumpvars(0, {mod_name});
end
"""
                    code = re.sub(r"endmodule", f"{dump_block}\nendmodule", code, count=1)

            design_path.write_text(code, encoding="utf-8")
            source_files = [str(design_path)]

            if has_separate_tb:
                tb_path = work_dir / Path(target_tb_name).name
                tb_path.write_text(tb_to_write, encoding="utf-8")
                source_files.append(str(tb_path))

            # Step 1: Compile with iverilog
            compile_cmd = [iverilog_exe, "-o", str(sim_vvp)] + source_files
            comp_proc = subprocess.run(
                compile_cmd,
                cwd=str(work_dir),
                capture_output=True,
                text=True,
                timeout=settings.MAX_EXECUTION_TIME_SECONDS
            )

            compiler_output = (comp_proc.stdout + comp_proc.stderr).strip()

            if comp_proc.returncode != 0 or not sim_vvp.exists():
                duration_ms = round((time.time() - start_time) * 1000, 2)
                err_lines = [l for l in compiler_output.splitlines() if "error" in l.lower() or "syntax" in l.lower()]
                return {
                    "success": False,
                    "compiled": False,
                    "compiler_output": compiler_output,
                    "simulation_output": "",
                    "exit_code": comp_proc.returncode,
                    "duration_ms": duration_ms,
                    "has_waveform": False,
                    "vcd_raw": None,
                    "waveform": None,
                    "error_summary": err_lines[0] if err_lines else "Compilation failed. See compiler output.",
                    "diagnostics": parse_diagnostics(compiler_output)
                }

            # Step 2: Run VVP simulation
            sim_cmd = [vvp_exe, str(sim_vvp)]
            sim_proc = subprocess.run(
                sim_cmd,
                cwd=str(work_dir),
                capture_output=True,
                text=True,
                timeout=settings.MAX_EXECUTION_TIME_SECONDS
            )

            duration_ms = round((time.time() - start_time) * 1000, 2)
            sim_output = (sim_proc.stdout + sim_proc.stderr).strip()

            # Step 3: Check and parse VCD file
            has_waveform = False
            vcd_raw = None
            waveform_parsed = None

            vcd_files = list(work_dir.glob("*.vcd"))
            if vcd_files:
                target_vcd = vcd_files[0]
                if target_vcd.exists() and target_vcd.stat().st_size > 0:
                    vcd_raw = target_vcd.read_text(encoding="utf-8", errors="replace")
                    try:
                        waveform_parsed = WaveformService.parse_vcd(vcd_raw)
                        has_waveform = len(waveform_parsed.get("signals", [])) > 0
                    except Exception as e:
                        sim_output += f"\n[Warning: Failed to parse VCD: {str(e)}]"

            sim_success = (sim_proc.returncode == 0)

            return {
                "success": sim_success,
                "compiled": True,
                "compiler_output": compiler_output or "Compiled successfully.",
                "simulation_output": sim_output[:settings.MAX_OUTPUT_SIZE_BYTES],
                "exit_code": sim_proc.returncode,
                "duration_ms": duration_ms,
                "has_waveform": has_waveform,
                "vcd_raw": vcd_raw[:200000] if vcd_raw else None,
                "waveform": waveform_parsed,
                "error_summary": None if sim_success else "Simulation terminated with errors.",
                "diagnostics": parse_diagnostics(compiler_output)  # warnings, if any
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "compiled": True,
                "compiler_output": "Compilation succeeded.",
                "simulation_output": f"Simulation timed out after {settings.MAX_EXECUTION_TIME_SECONDS} seconds (infinite loop in testbench or clock generator without delay).",
                "exit_code": -1,
                "duration_ms": round((time.time() - start_time) * 1000, 2),
                "has_waveform": False,
                "vcd_raw": None,
                "waveform": None,
                "error_summary": "Simulation timeout (check for $finish or missing #delay in always block).",
                "diagnostics": []
            }
        except Exception as e:
            return {
                "success": False,
                "compiled": False,
                "compiler_output": f"Execution error: {str(e)}",
                "simulation_output": "",
                "exit_code": 1,
                "duration_ms": round((time.time() - start_time) * 1000, 2),
                "has_waveform": False,
                "vcd_raw": None,
                "waveform": None,
                "error_summary": str(e),
                "diagnostics": []
            }
        finally:
            temp_dir.cleanup()