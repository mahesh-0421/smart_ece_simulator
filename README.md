# Smart ECE Lab – Integrated Web-Based MATLAB and Verilog Compiler, Simulation, and Intelligent Debugging Platform

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![GNU Octave](https://img.shields.io/badge/GNU%20Octave-11.3-orange.svg)](https://octave.org)
[![Icarus Verilog](https://img.shields.io/badge/Icarus%20Verilog-12.0-red.svg)](http://bleyer.org/icarus/)
[![Tests](https://img.shields.io/badge/Pytest-22%2F22%20Passing-brightgreen.svg)]()

Smart ECE Lab is a production-minded web platform designed for Electronics and Communication Engineering (ECE) undergraduate students and faculty. It integrates numerical computing (MATLAB-compatible scripts via GNU Octave) and digital logic circuit design (Verilog HDL compilation and simulation via Icarus Verilog & VVP) into a single, cohesive academic dashboard.

---

## 1. Problem Statement
Undergraduate ECE curricula require students to learn both numerical computing (Signals & Systems, Digital Signal Processing, Communications) and hardware description languages (Digital Logic Design, Computer Architecture, VLSI). However:
- Commercial software suites (MathWorks MATLAB, Siemens ModelSim) carry expensive campus licensing constraints and steep workstation installation requirements.
- Students must juggle disparate applications with unrelated workflows, inconsistent user interfaces, and separate error logging formats.
- Beginner students struggle to interpret cryptic compiler syntax diagnostics without actionable pedagogical guidance.
- Generating formal academic laboratory documentation often involves tedious, manual copy-pasting of code, terminal prints, and screenshots.

---

## 2. System Objectives
1. Provide a unified web platform executing genuine MATLAB-compatible and Verilog HDL programs.
2. Deliver genuine execution and simulation workflows through **GNU Octave** and **Icarus Verilog + VVP** (never superficial mockups or fake outputs).
3. Render interactive, vector-based digital timing waveforms parsed directly from IEEE 1364 Value Change Dump (VCD) files.
4. Provide an **Intelligent Error Explainer** utilizing deterministic rules and optional AI provider assistance to explain compiler errors in plain English.
5. Offer a pre-configured library of **20 verified ECE laboratory experiments** across DSP, Communications, and Digital Logic.
6. Automatically compile and export downloadable, formal **PDF laboratory experiment reports** with genuine code, logs, graphs, and waveforms.

---

## 3. Technology Stack

### Frontend:
- **Framework**: React 19, Vite, TypeScript
- **Code Editor**: Monaco Editor (`@monaco-editor/react`) with syntax colorization for MATLAB and Verilog
- **Waveform Engine**: Custom SVG/Canvas digital timing diagram renderer with time ruler, bus diamonds, and interactive inspection cursor
- **Icons & Styling**: Lucide React, CSS variables with Light and Dark academic theme support

### Backend:
- **API Framework**: Python FastAPI, RESTful architecture, Pydantic V2 schema validation
- **Database & ORM**: SQLite (development/single-user) & SQLAlchemy ORM
- **Numerical Computing**: GNU Octave 11.3 (headless execution with gnuplot rasterization)
- **Digital Simulation**: Icarus Verilog 12.0 (`iverilog.exe`) and VVP virtual machine (`vvp.exe`)
- **PDF Report Engine**: ReportLab Flowables with custom academic typography and signature tables
- **Testing**: Pytest automated test suite (22 unit & integration tests)

---

## 4. System Architecture

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

---

## 5. Prerequisites & Toolchain Setup

### A. Windows Installation
1. **Python**: Python 3.10 to 3.14 (ensure `python` and `pip` are in PATH).
2. **Node.js**: Node.js v18+ (tested on v24 with npm 11).
3. **GNU Octave**:
   - Download the official installer from [https://octave.org/download](https://octave.org/download).
   - Default install path: `C:\Program Files\GNU Octave\Octave-11.3.0`.
   - The backend auto-detects `mingw64\bin\octave-cli.exe`.
4. **Icarus Verilog**:
   - Download the Windows installer from [http://bleyer.org/icarus/](http://bleyer.org/icarus/).
   - Default install path: `C:\iverilog`.
   - Ensure `C:\iverilog\bin` is added to your system PATH.

### B. Ubuntu / Debian Linux Installation
```bash
sudo apt update
sudo apt install -y python3 python3-pip nodejs npm octave gnuplot iverilog
```

---

## 6. How to Run Locally

### Step 1: Install Backend Dependencies
In the project root directory:
```bash
cd backend
python -m pip install -r requirements.txt
```

### Step 2: Start the FastAPI Backend Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000/api`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`

### Step 3: Install and Start the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 7. How to Run Automated Tests
The repository includes a comprehensive automated test suite verifying genuine tool detection, arithmetic evaluation, matrix operations, headless plot creation, Verilog logic compilation, VCD simulation, testbench generation, waveform assertion analysis, and PDF report creation:

```bash
python -m pytest backend/tests -v
```

**Results:**
```
backend/tests/test_api.py::test_api_status PASSED                        [  4%]
backend/tests/test_api.py::test_api_matlab_execute PASSED                [  9%]
backend/tests/test_api.py::test_api_verilog_simulate PASSED              [ 13%]
backend/tests/test_api.py::test_api_generate_testbench PASSED            [ 18%]
backend/tests/test_api.py::test_api_program_crud PASSED                  [ 22%]
backend/tests/test_api.py::test_api_experiments PASSED                   [ 27%]
backend/tests/test_api.py::test_api_report_generation PASSED             [ 31%]
backend/tests/test_backend.py::test_octave_availability PASSED           [ 36%]
backend/tests/test_backend.py::test_octave_arithmetic_execution PASSED   [ 40%]
backend/tests/test_backend.py::test_octave_matrix_operations PASSED      [ 45%]
backend/tests/test_backend.py::test_octave_plot_generation PASSED        [ 50%]
backend/tests/test_backend.py::test_octave_syntax_error PASSED           [ 54%]
backend/tests/test_backend.py::test_octave_runtime_error PASSED          [ 59%]
backend/tests/test_backend.py::test_verilog_availability PASSED          [ 63%]
backend/tests/test_backend.py::test_verilog_logic_gate_compilation PASSED [ 68%]
backend/tests/test_backend.py::test_verilog_compilation_error PASSED     [ 72%]
backend/tests/test_backend.py::test_verilog_simulation_and_waveform PASSED [ 77%]
backend/tests/test_backend.py::test_testbench_generation PASSED          [ 81%]
backend/tests/test_backend.py::test_waveform_analysis PASSED             [ 86%]
backend/tests/test_backend.py::test_error_explanation_matlab_matrix_dim PASSED [ 90%]
backend/tests/test_backend.py::test_error_explanation_verilog_wire_assign PASSED [ 95%]
backend/tests/test_backend.py::test_report_generation PASSED             [100%]
======================= 22 passed in 4.95s =======================
```

---

## 8. Docker Deployment
A multi-stage `Dockerfile` and `docker-compose.yml` are provided for containerized deployments with pre-installed GNU Octave, Icarus Verilog, and gnuplot:

```bash
docker-compose up --build
```
Access the application at `http://localhost:8000`.

---

## 9. Predefined Curriculum Experiment Library (20 Labs)

### MATLAB / GNU Octave Experiments:
1. **Basic Arithmetic Operations**: Scalar calculations, operator precedence, formatted terminal printing.
2. **Matrix Addition and Multiplication**: 2D array arithmetic, linear algebra (`*`) vs element-wise (`.*`).
3. **Matrix Transpose and Determinant**: Matrix inversion, determinant singularities, identity matrix verification.
4. **Vector Operations**: Euclidean norm, dot products, vector reversal and slicing.
5. **Continuous Sine & Cosine Plotting**: Continuous-time harmonic oscillations with 2D exportable figures.
6. **Sampling Theorem & Discrete Representation**: Continuous signals vs discrete stem samples (Nyquist criterion).
7. **Discrete-Time Linear Convolution**: Moving average filters and LTI impulse response convolution ($N + M - 1$).
8. **Fast Fourier Transform (FFT)**: Frequency spectral decomposition and tone peak identification.
9. **BPSK Digital Modulation**: Binary phase-shift keying carrier generation across bitstreams.
10. **Numerical Differentiation & Integration**: Finite forward differences (`diff`) and trapezoidal quadrature (`trapz`).

### Verilog HDL Experiments:
1. **Basic Logic Gates**: AND, OR, NOT, XOR, NAND, NOR, XNOR primitive truth-table verification.
2. **Half Adder**: 1-bit arithmetic sum and carry generation.
3. **Full Adder**: 3-input addition ($A, B, C_{in}$) with truth table validation.
4. **4-to-1 Multiplexer**: Behavioral case-statement routing of 4-bit data bus.
5. **2-to-4 Line Decoder**: Active-high enable with one-hot walking bit output.
6. **Positive Edge-Triggered D Flip-Flop**: Asynchronous reset and rising clock edge capture.
7. **4-Bit Synchronous Up-Counter**: Monotonic counter sequence from `0000` to `1111` with VCD dump.
8. **4-Bit SIPO Shift Register**: Serial data bit propagation to parallel bus.
9. **4-Bit Magnitude Comparator**: Relational comparison flags (Greater Than, Equal, Less Than).
10. **Sequence Detector FSM (101)**: Overlapping pattern detection state machine.

---

## 10. Security Architecture & Isolation

1. **Zero Shell Interpolation**: All external invocations (`octave-cli`, `iverilog`, `vvp`) execute via parameterized argument arrays (`subprocess.run(["iverilog", "-o", ...])`). Shell commands (`shell=True`) are strictly forbidden.
2. **Path Traversal Defense**: All input filenames are sanitized using `Path(name).name`, preventing directory traversal (`../../`).
3. **Ephemeral Directories**: Files are written to unique temporary folders (`tempfile.TemporaryDirectory`) and unlinked upon completion.
4. **15-Second Execution Timeout**: Enforced on all compilation and simulation runs to guard against infinite loops.
5. **Input & Output Ceilings**: Source code submissions capped at 64 KB; output buffers capped at 256 KB.
6. **Internal Path Masking**: Diagnostic output removes host server file paths before returning diagnostics.
7. **Credential Protection**: AI keys remain on backend server environment variables (`.env`).

---

## 11. Known Limitations & Engineering Boundaries
- **GNU Octave vs MATLAB**: Proprietary toolboxes (Simulink, Stateflow, proprietary FPGA hardware-in-the-loop toolboxes) are unsupported.
- **Icarus Verilog**: Conforms to IEEE 1364-2005 standard. Complex SystemVerilog assertions or UVM frameworks require specialized commercial toolchains.
- **Single-User Demonstration Mode**: The default local deployment is configured as a single-user local laboratory instance without authentication. For multi-tenant university deployment, containerized isolation (gVisor / Docker) and student login authentication should be configured.

---

## 12. License
Academic Open-Source Project developed for university ECE laboratory curricula. GNU Octave is licensed under GPLv3+. Icarus Verilog is licensed under GPLv2+.
