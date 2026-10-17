import re
import os
from typing import Dict, Any, Optional
import urllib.request
import json
from app.core.config import settings


class ErrorExplanationService:
    @classmethod
    def explain_error(
        cls,
        language: str,
        code: str,
        testbench_code: Optional[str] = None,
        error_message: str = ""
    ) -> Dict[str, Any]:
        """
        Explains compiler, simulation, and runtime errors in beginner-friendly
        engineering English, highlights the line number, and suggests fixes.
        Uses deterministic pattern matching first, with optional AI provider fallback.
        """
        lang = language.lower().strip()

        rule_result = cls._rule_based_explain(lang, code, testbench_code, error_message)
        if rule_result["confidence"] == "high":
            return rule_result

        if settings.AI_PROVIDER and settings.AI_API_KEY:
            ai_result = cls._ai_explain(lang, code, testbench_code, error_message)
            if ai_result:
                return ai_result

        return rule_result

    @staticmethod
    def _where(code: str, line_no: Optional[int]) -> str:
        """Returns 'Line 8: `assign carry = a & c;`. ' so the user sees the exact line."""
        if not line_no or not code:
            return ""
        lines = code.splitlines()
        if 1 <= line_no <= len(lines):
            text = lines[line_no - 1].strip()
            if text:
                return f"Line {line_no}: `{text}`. "
        return f"Line {line_no}. "

    @classmethod
    def _rule_based_explain(
        cls,
        language: str,
        code: str,
        testbench_code: Optional[str],
        err: str
    ) -> Dict[str, Any]:
        err_lower = err.lower()
        line_no = None

        # Verilog format: "design.v:14: error: ..." or "line 14"
        v_line_match = re.search(r":(\d+):\s*(?:error|syntax error|warning)", err, re.I)
        if v_line_match:
            line_no = int(v_line_match.group(1))
        else:
            m_line_match = re.search(r"near line (\d+)|at line (\d+)|line (\d+)", err, re.I)
            if m_line_match:
                line_no = int(next(g for g in m_line_match.groups() if g is not None))

        # ---------------- MATLAB / Octave rules ----------------
        if language in ("matlab", "octave"):
            if "nonconformant arguments" in err_lower or "matrix dimensions must agree" in err_lower:
                return {
                    "original_error": err,
                    "likely_cause": "Matrix or vector dimension mismatch during an arithmetic operation (addition, subtraction, or matrix multiplication).",
                    "suggested_fix": "Verify that matrices have compatible dimensions. For element-wise operations (like array multiplication or squaring), use dot-operators like '.*', './', or '.^' instead of '*' or '^'.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            if "undefined near line" in err_lower or "undefined variable" in err_lower or "is undefined" in err_lower:
                var_match = re.search(r"'([A-Za-z0-9_]+)'\s*undefined", err)
                var_name = var_match.group(1) if var_match else "a variable"
                return {
                    "original_error": err,
                    "likely_cause": f"The variable or function '{var_name}' is referenced before it has been defined or assigned a value.",
                    "suggested_fix": f"Check spelling and ensure that '{var_name}' is assigned a value above line {line_no or 'this line'}.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            if "parse error" in err_lower or "syntax error" in err_lower:
                return {
                    "original_error": err,
                    "likely_cause": "Syntax error in MATLAB script. Commonly caused by unmatched brackets, missing commas, or typos in keywords.",
                    "suggested_fix": "Inspect the code around line " + (str(line_no) if line_no else "the error point") + " for unclosed parentheses '()', brackets '[]', or missing operators.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            if "subscript indices must either be real positive integers" in err_lower or "index out of bounds" in err_lower:
                return {
                    "original_error": err,
                    "likely_cause": "Attempted to index an array using zero, a negative number, or a value larger than the array length.",
                    "suggested_fix": "Note that MATLAB and GNU Octave use 1-based indexing (the first element is index 1, not 0). Ensure your loop or index starts at 1 and does not exceed length(array).",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            if "timed out" in err_lower:
                return {
                    "original_error": err,
                    "likely_cause": "The script took longer than the maximum execution limit (15 seconds), likely due to an infinite while-loop.",
                    "suggested_fix": "Verify while-loop termination conditions and ensure the loop counter increments on every iteration.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

        # ---------------- Verilog rules ----------------
        elif language in ("verilog", "hdl"):
            where = cls._where(code, line_no)

            if "can not assign to wire" in err_lower or "cannot be driven by primitives" in err_lower or "is not a valid l-value" in err_lower:
                return {
                    "original_error": err,
                    "likely_cause": where + "A signal declared as 'wire' is being assigned inside an 'always' or 'initial' block.",
                    "suggested_fix": "In Verilog, any signal assigned inside an 'always @(...)' or 'initial' block must be declared as 'reg', not 'wire'. Change the declaration of that signal to 'reg'.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            # Undeclared signal, e.g. "Unable to bind wire/reg/memory `c' in `tb_half_adder.uut'"
            bind_match = re.search(
                r"unable to bind wire/reg/memory\s*[`'\"]+(.+?)['\"]+\s*in\s*[`'\"]+(.+?)['\"]",
                err, re.I
            )
            if bind_match:
                sig, scope = bind_match.group(1), bind_match.group(2)
                return {
                    "original_error": err,
                    "likely_cause": where + f"The signal '{sig}' is used inside '{scope}' but it was never declared, or its name is misspelled.",
                    "suggested_fix": f"Check the spelling of '{sig}'. If it should exist, declare it with 'wire {sig};' or 'reg {sig};', or add it to the module's port list. If it was a typo, replace it with the correct signal name (for example 'b' instead of 'c').",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            # Missing module, e.g. "Unknown module type: counter"
            mod_match = re.search(r"unknown module type:\s*(\w+)", err, re.I)
            if mod_match:
                mod = mod_match.group(1)
                return {
                    "original_error": err,
                    "likely_cause": where + f"The module '{mod}' is instantiated, but its definition was not found in the file.",
                    "suggested_fix": f"Add the code of module '{mod}' (module {mod} ... endmodule) above your testbench, or check that the module name is spelled exactly the same in both places.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            # Wrong port name, e.g. "port ``x'' is not a port of uut"
            port_match = re.search(r"port\s*[`'\"]+(\w+)['\"]+\s*is not a port of\s*(\w+)", err, re.I)
            if port_match:
                port, inst = port_match.group(1), port_match.group(2)
                return {
                    "original_error": err,
                    "likely_cause": where + f"The port '{port}' does not exist on '{inst}'.",
                    "suggested_fix": f"Make the port names in the instance (.{port}(...)) match the names in the module definition exactly.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            if "unable to bind wire/reg" in err_lower or "unknown identifier" in err_lower or "is not a port" in err_lower:
                return {
                    "original_error": err,
                    "likely_cause": where + "Undeclared signal name or port name mismatch between module instantiation and module definition.",
                    "suggested_fix": "Check for typos in port connections. Ensure all signals are declared as wire or reg before being referenced.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            if "syntax error" in err_lower or "malformed statement" in err_lower:
                return {
                    "original_error": err,
                    "likely_cause": where + "Syntax error. Often caused by a missing semicolon ';', a missing 'end', or mismatched parentheses.",
                    "suggested_fix": f"Check the lines immediately before line {line_no or 'the error'}. Ensure every statement ends with a semicolon, and every 'begin' has a matching 'end'.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            if "no top level modules" in err_lower or "unable to find the root module" in err_lower:
                return {
                    "original_error": err,
                    "likely_cause": "Icarus Verilog could not determine the top-level testbench module to simulate.",
                    "suggested_fix": "Ensure you have a testbench module without input ports that instantiates your design, or check for UTF-8 byte-order marks in source files.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

            if "timed out" in err_lower:
                return {
                    "original_error": err,
                    "likely_cause": "The simulation ran indefinitely without terminating. Common causes: missing '$finish;' in testbench, or clock generator 'always clk = ~clk;' without '#delay'.",
                    "suggested_fix": "Add a delay to the clock toggle (e.g. 'always #5 clk = ~clk;') and include '#100 $finish;' in your initial block to end the simulation.",
                    "line_number": line_no,
                    "corrected_code": None,
                    "confidence": "high",
                    "provider_used": "rule_based"
                }

        # General fallback explanation
        return {
            "original_error": err if err else "Execution produced non-zero return code.",
            "likely_cause": "The compiler or interpreter encountered a diagnostic error while analyzing your code.",
            "suggested_fix": "Review the compiler diagnostic output above. Verify syntax, matching keywords, and declared variable types.",
            "line_number": line_no,
            "corrected_code": None,
            "confidence": "general",
            "provider_used": "rule_based"
        }

    @classmethod
    def _ai_explain(
        cls,
        language: str,
        code: str,
        testbench_code: Optional[str],
        err: str
    ) -> Optional[Dict[str, Any]]:
        """
        Optional provider-based AI explanation. Credentials stay strictly on backend.
        Never blocks application if provider is down or key is invalid.
        """
        if not settings.AI_API_KEY:
            return None

        prompt = (
            f"You are a friendly digital electronics and numerical computing professor.\n"
            f"Analyze this {language} error and provide a structured JSON explanation.\n"
            f"Source Code:\n{code[:2000]}\n\n"
            + (f"Testbench Code:\n{testbench_code[:1500]}\n\n" if testbench_code else "")
            + f"Error Message:\n{err}\n\n"
            f"Respond ONLY with a valid JSON object matching:\n"
            f'{{"likely_cause": "string", "suggested_fix": "string", "line_number": int_or_null, "corrected_snippet": "string_or_null"}}'
        )

        try:
            if settings.AI_PROVIDER == "gemini":
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL or 'gemini-1.5-flash'}:generateContent?key={settings.AI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=5) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text)
                    return {
                        "original_error": err,
                        "likely_cause": parsed.get("likely_cause", "AI analysis"),
                        "suggested_fix": parsed.get("suggested_fix", ""),
                        "line_number": parsed.get("line_number"),
                        "corrected_code": parsed.get("corrected_snippet"),
                        "confidence": "high",
                        "provider_used": "ai_model"
                    }
        except Exception:
            return None
        return None