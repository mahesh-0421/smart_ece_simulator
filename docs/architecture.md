# Smart ECE Lab – System Architecture

## 1. Overview
Smart ECE Lab is an integrated, dual-engine academic platform enabling Electronics and Communication Engineering students to write, compile, simulate, and debug MATLAB-compatible scripts and Verilog HDL designs in a single unified web environment.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 19 + TypeScript + Vite                                                      |
|  - Monaco Code Editor (MATLAB & Verilog Syntax)                                   |
|  - Digital Timing Waveform Viewer (Vector SVG / Canvas)                           |
|  - Interactive Debugger Modals (Rule-based & AI Assistance)                       |
|  - Real-time Dashboard & 20 Predefined ECE Experiments                            |
+------------------------------------------+----------------------------------------+
                                           | HTTP REST API (/api)
                                           v
+-----------------------------------------------------------------------------------+
|                                 BACKEND TIER                                      |
|  FastAPI (Python 3.14 / 3.11) + SQLAlchemy + Pydantic V2                          |
|  - Subprocess Execution Sandboxing (Timeout & Resource Limits)                    |
|  - IEEE 1364 Value Change Dump (VCD) Parser Engine                                |
|  - ReportLab PDF Generation Engine (Tables, Code, Plots, Waveforms)                |
|  - SQLite / PostgreSQL Database (Programs & Execution History)                    |
+---------------------+---------------------------------------+---------------------+
                      |                                       |
                      v                                       v
+-----------------------------------+   +-------------------------------------------+
|   MATLAB COMPUTING ENGINE         |   |      DIGITAL SIMULATION ENGINE            |
|   GNU Octave 11.3 (mingw64/cli)   |   |      Icarus Verilog 12.0 (iverilog.exe)   |
|   - Headless Gnuplot Graphics     |   |      VVP Virtual Machine (vvp.exe)        |
|   - Matrix & Scalar Arithmetic    |   |      - VCD Waveform Generation ($dumpfile)|
|   - FFT & Linear Convolution      |   |      - Clock & Testbench Stimulus Driver  |
+-----------------------------------+   +-------------------------------------------+
```

## 2. Core Subsystems

### 2.1 GNU Octave Execution Service (`octave_service.py`)
- **Engine**: GNU Octave CLI (`octave-cli.exe` / `octave-cli`).
- **Sandboxing**: Runs in unique ephemeral directories (`tempfile.TemporaryDirectory`).
- **Headless Rasterization**: Injects script preamble configuring `graphics_toolkit('gnuplot')` and auto-dumps figures at script termination using `print(h, 'plot_output.png', '-dpng')`.
- **Output Sanitization**: Captures stdout/stderr, strips local path disclosures, and encodes generated plots into base64 PNG data URLs.
- **Enforced Limits**: 15-second wall clock termination to safeguard against infinite while-loops.

### 2.2 Verilog HDL Simulation Service (`verilog_service.py`)
- **Compilation Engine**: Icarus Verilog (`iverilog.exe`).
- **Simulation Virtual Machine**: VVP (`vvp.exe`).
- **Execution Flow**:
  1. Validates input sizes and generates UTF-8 source files without Byte Order Marks.
  2. Compiles design and testbench into intermediate `.vvp` bytecode. If compilation errors occur, simulation is skipped and exact syntax/port diagnostics are returned.
  3. Executes `vvp` with timeout safeguards.
  4. Automatically inspects working directory for generated `dump.vcd` Value Change Dump files.
  5. Passes raw VCD data through `WaveformService.parse_vcd()` to extract timestamps, bitwidths, and signal transitions.

### 2.3 Interactive Waveform Engine (`waveform_service.py` & `WaveformViewer.tsx`)
- **VCD Parser**: Parses standard `$timescale`, `$scope`, `$var`, and time tick transitions (`#<time>`).
- **Visualization**:
  - 1-bit scalar signals rendered as crisp step curves (High/Low/Unknown/High-Z).
  - Multi-bit buses rendered as bevelled transition diamonds with hexadecimal / binary value labels.
  - Interactive vertical red cursor computes exact signal state at mouse inspection coordinates.
  - Variable zoom scaling (25% to 400%).

### 2.4 Intelligent Error Debugger (`error_explanation_service.py`)
- **Deterministic ECE Knowledge Base**: Recognizes common engineering pitfalls:
  - Octave: Matrix dimension mismatches (`.*` vs `*`), 1-based indexing violations, undefined variables.
  - Verilog: Wire assignments in procedural `always` blocks (`reg` required), undeclared identifiers, missing semicolons, clock oscillators missing delay (`#5`).
- **Optional Provider AI Integration**: Fallback to Google Gemini / OpenAI when environment variables `AI_PROVIDER` and `AI_API_KEY` are configured. Never blocks offline usage.

### 2.5 Academic Report Generator (`report_service.py`)
- **Library**: ReportLab.
- **Output**: Formal PDF document including Experiment Objectives, genuine Source Code, Testbench, Terminal Outputs, Plot Images, Rendered Digital Waveform Diagrams, and Faculty Sign-off Tables.
