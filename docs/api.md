# Smart ECE Lab – REST API Documentation

Base URL: `http://localhost:8000/api`

Interactive Swagger UI: `http://localhost:8000/docs`
ReDoc Specification: `http://localhost:8000/redoc`

---

### 1. System Health & Status
#### `GET /api/status`
Returns live system health, auto-detected tool paths (Octave, Icarus Verilog, VVP), and active limits.

**Response Example:**
```json
{
  "status": "healthy",
  "app_name": "Smart ECE Lab API",
  "version": "1.0.0",
  "mode": "Single-User Local Academic Demonstration Mode",
  "tools": {
    "octave": {
      "available": true,
      "path": "C:\\Program Files\\GNU Octave\\Octave-11.3.0\\mingw64\\bin\\octave-cli.exe",
      "notes": "GNU Octave (MATLAB-compatible numerical computing)"
    },
    "iverilog": {
      "available": true,
      "iverilog_path": "C:\\iverilog\\bin\\iverilog.exe",
      "vvp_path": "C:\\iverilog\\bin\\vvp.exe",
      "notes": "Icarus Verilog compiler and VVP simulation runtime"
    }
  },
  "limits": {
    "max_execution_time_sec": 15,
    "max_code_size_bytes": 65536
  }
}
```

---

### 2. MATLAB-Compatible Execution
#### `POST /api/matlab/execute`
Executes MATLAB-compatible numerical scripts through GNU Octave.

**Request Body:**
```json
{
  "code": "a = [1 2 3]; b = a .* 2; disp(b); plot(a, b);",
  "filename": "my_script.m"
}
```

**Response Body:**
```json
{
  "success": true,
  "stdout": "   2   4   6",
  "stderr": "",
  "exit_code": 0,
  "duration_ms": 242.15,
  "has_plot": true,
  "plot_image_base64": "data:image/png;base64,iVBORw0KGgo...",
  "error_summary": null
}
```

---

### 3. Verilog HDL Compilation & Simulation
#### `POST /api/verilog/compile`
Validates design hierarchy and reports compiler syntax/port diagnostics.

**Request Body:**
```json
{
  "code": "module and_gate(input a, input b, output y); assign y = a & b; endmodule",
  "filename": "and_gate.v"
}
```

#### `POST /api/verilog/simulate`
Compiles and simulates design with testbench stimulus, generating parsed VCD waveforms.

**Request Body:**
```json
{
  "code": "module counter4(...); ... endmodule",
  "filename": "counter4.v",
  "testbench_code": "`timescale 1ns/1ps\nmodule tb_counter4; ... endmodule",
  "testbench_filename": "tb_counter4.v"
}
```

**Response Body:**
```json
{
  "success": true,
  "compiled": true,
  "compiler_output": "Compiled successfully.",
  "simulation_output": "Time=0 | clk=0 reset=1 | count=0000 (0)\nTime=15 | clk=1 reset=0 | count=0001 (1)",
  "exit_code": 0,
  "duration_ms": 85.4,
  "has_waveform": true,
  "vcd_raw": "$timescale 1ns ...",
  "waveform": {
    "timescale": "1ns",
    "end_time": 100,
    "signals": [
      {
        "name": "clk",
        "wire_id": "\"",
        "width": 1,
        "signal_type": "reg",
        "transitions": [{"time": 0, "value": "0"}, {"time": 5, "value": "1"}]
      }
    ]
  }
}
```

#### `POST /api/verilog/generate-testbench`
Analyzes port list of a module and generates a testbench template with clock, reset, and `$dumpfile`.

---

### 4. Debugging & Waveform Analysis
#### `POST /api/errors/explain`
Explains compiler error diagnostics and suggests line-specific repairs.

#### `POST /api/waveforms/analyze`
Extracts clock frequencies, counts transitions, and verifies sequential assertion rules.

---

### 5. Programs Management
- `GET /api/programs?language=matlab&search=counter`: List saved programs.
- `POST /api/programs`: Create a program.
- `GET /api/programs/{id}`: Fetch single program.
- `PUT /api/programs/{id}`: Update program.
- `DELETE /api/programs/{id}`: Delete program.
- `GET /api/programs/{id}/download`: Download raw source file.

---

### 6. Execution History & Metrics
- `GET /api/history`: List execution records and aggregated dashboard statistics.
- `GET /api/history/{id}`: Full transcript and outputs of past run.
- `DELETE /api/history`: Clear execution records.

---

### 7. Experiments Library
- `GET /api/experiments?category=matlab`: Retrieve curriculum laboratory experiments.
- `GET /api/experiments/{id}`: Details of specific experiment.

---

### 8. Laboratory Report Generation
#### `POST /api/reports/generate`
Generates a downloadable academic PDF laboratory report. Returns `application/pdf` binary stream.
