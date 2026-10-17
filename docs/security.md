# Smart ECE Lab – Security Architecture & Isolation Model

## 1. Threat Model & Overview
Because this platform compiles and executes student-submitted code (GNU Octave scripts and Verilog HDL designs), execution security and resource containment are fundamental engineering requirements.

```
+-------------------------------------------------------------+
|                     Client Request                          |
|         (Arbitrary Source Code & Parameters)                |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 FastAPI Application Tier                    |
|  1. Request Size Validation (Max 64 KB)                     |
|  2. Filename Sanitization (Path Traversal Prevention)       |
|  3. Safe Argument Array Building (No Shell Interpolation)   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|               Isolated Subprocess Worker                    |
|  1. Ephemeral Sandbox (tempfile.TemporaryDirectory)         |
|  2. Process-Level Timeout (15s Enforced Limit)              |
|  3. Strict Output Cap (256 KB Buffer Limit)                 |
|  4. Directory Cleanup on Exit (try...finally)               |
+-------------------------------------------------------------+
```

## 2. Implemented Defense Mechanisms

### 2.1 Parameterized Subprocess Invocation (Zero Shell Interpolation)
- User input is **never** interpolated into shell strings. Commands are invoked using strict token arrays:
  ```python
  # Safe parameter array invocation:
  cmd = [octave_exe, "--quiet", "--no-gui", "--no-history", "-W", safe_filename]
  subprocess.run(cmd, cwd=str(work_dir), capture_output=True, timeout=15)
  ```
- Shell execution (`shell=True`) is strictly prohibited throughout the entire codebase, eliminating shell injection vulnerabilities (`&&`, `;`, `|`, `` ` ``).

### 2.2 Path Traversal & Filename Sanitization
- Filenames submitted via the API are sanitized using `pathlib.Path(filename).name`, stripping any leading directories, drive letters, or `../` path traversal sequences.
- All temporary files are created inside an isolated `tempfile.TemporaryDirectory(prefix="ece_...")` located in the OS temporary tree.
- The directory is automatically unlinked and erased upon completion using `temp_dir.cleanup()` inside a guaranteed `finally:` block.

### 2.3 Strict Resource Limits
- **Wall-Clock Execution Timeout**: 15 seconds enforced via `subprocess.TimeoutExpired`. This prevents server starvation from infinite while-loops or Verilog clock oscillators without delays (`always clk = ~clk;`).
- **Source Code Upload Limit**: 64 KB (65,536 bytes) enforced via Pydantic model validation.
- **Console Output Buffer Cap**: Output stdout and stderr streams are truncated at 256 KB to prevent memory exhaustion from runaway `$display()` or `disp()` loops.

### 2.4 Internal Path Disclosure Protection
- Diagnostic stack traces produced by compilers are filtered to strip server-side filesystem paths before returning output to the client.

### 2.5 API Credential Protection
- Optional AI provider API keys (`AI_API_KEY`) remain strictly on the backend and are loaded via environment variables (`.env`). Credentials are never included in client JavaScript bundles.

## 3. Production Multi-Tenant Hardening Recommendations
When transitioning this platform from single-user / local laboratory demonstration mode to a campus-wide multi-tenant deployment, apply the following containerized worker measures:

1. **Unprivileged Worker Accounts**: Run the execution workers under a dedicated, unprivileged Linux user (`ece_sandbox`) with minimal filesystem permissions.
2. **Containerized Execution / MicroVMs**:
   - Wrap compiler workers in lightweight Docker containers or gVisor (`runsc`) sandboxes.
   - Restrict network egress (`--network none`) so compiled scripts cannot establish outbound socket connections.
   - Restrict memory ceilings (`--memory=256m`) and CPU cores (`--cpus=1.0`).
3. **Database Authentication**: Deploy PostgreSQL with per-student JWT authentication (bcrypt password hashing) and role-based access control (Student vs Faculty roles).
