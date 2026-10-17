import re
from typing import Dict, List, Any, Optional

class TestbenchAssistant:
    @classmethod
    def analyze_module_ports(cls, verilog_code: str, target_module: Optional[str] = None) -> Dict[str, Any]:
        """
        Parses Verilog code to identify module name, inputs, outputs, and bit widths.
        Supports both ANSI-C style and classic Verilog-95 port styles.
        """
        # Remove comments first
        clean_code = re.sub(r"//.*", "", verilog_code)
        clean_code = re.sub(r"/\*.*?\*/", "", clean_code, flags=re.DOTALL)

        # Find module headers
        module_pattern = r"\bmodule\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:#\s*\(.*?\)\s*)?\s*\((.*?)\);"
        matches = list(re.finditer(module_pattern, clean_code, re.DOTALL))

        if not matches:
            # Check for non-ANSI module header without port list in parentheses
            alt_pattern = r"\bmodule\s+([A-Za-z_][A-Za-z0-9_]*)\s*;"
            alt_matches = list(re.finditer(alt_pattern, clean_code))
            if alt_matches:
                mod_name = alt_matches[0].group(1)
                return cls._extract_ports_from_body(clean_code, mod_name)
            return {
                "success": False,
                "module_name": "",
                "inputs": [],
                "outputs": [],
                "message": "No valid Verilog 'module' definition found."
            }

        selected_match = matches[0]
        if target_module:
            for m in matches:
                if m.group(1) == target_module:
                    selected_match = m
                    break

        module_name = selected_match.group(1)
        port_list_str = selected_match.group(2)

        inputs = []
        outputs = []

        # Check if ANSI style: contains input/output keywords inside parentheses
        if "input" in port_list_str or "output" in port_list_str:
            port_decls = [p.strip() for p in port_list_str.split(",") if p.strip()]
            current_dir = "input"
            current_width = 1

            for decl in port_decls:
                m_dir = re.search(r"\b(input|output|inout)\b", decl)
                if m_dir:
                    current_dir = m_dir.group(1)

                m_width = re.search(r"\[\s*(\d+)\s*:\s*(\d+)\s*\]", decl)
                if m_width:
                    msb = int(m_width.group(1))
                    lsb = int(m_width.group(2))
                    current_width = abs(msb - lsb) + 1
                elif "input" in decl or "output" in decl:
                    current_width = 1

                # Extract signal name: last identifier
                names = re.findall(r"([A-Za-z_][A-Za-z0-9_]*)", decl)
                # Filter out keywords
                keywords = {"input", "output", "inout", "wire", "reg", "logic", "signed"}
                names = [n for n in names if n not in keywords]

                for name in names:
                    port_info = {
                        "name": name,
                        "width": current_width,
                        "is_clock": bool(re.search(r"(clk|clock)", name, re.I)),
                        "is_reset": bool(re.search(r"(rst|reset)", name, re.I))
                    }
                    if current_dir == "input":
                        inputs.append(port_info)
                    elif current_dir == "output":
                        outputs.append(port_info)
        else:
            # Classic style: declarations are in module body
            return cls._extract_ports_from_body(clean_code, module_name)

        return {
            "success": True,
            "module_name": module_name,
            "inputs": inputs,
            "outputs": outputs,
            "message": f"Successfully detected module '{module_name}' with {len(inputs)} inputs and {len(outputs)} outputs."
        }

    @classmethod
    def _extract_ports_from_body(cls, clean_code: str, module_name: str) -> Dict[str, Any]:
        inputs = []
        outputs = []

        # Find module block
        mod_block_match = re.search(rf"\bmodule\s+{module_name}\b.*?\bendmodule\b", clean_code, re.DOTALL)
        body = mod_block_match.group(0) if mod_block_match else clean_code

        # Search for input / output lines
        for line in body.splitlines():
            line = line.strip()
            if line.startswith("input") or line.startswith("output"):
                is_input = line.startswith("input")
                width = 1
                m_width = re.search(r"\[\s*(\d+)\s*:\s*(\d+)\s*\]", line)
                if m_width:
                    msb = int(m_width.group(1))
                    lsb = int(m_width.group(2))
                    width = abs(msb - lsb) + 1

                # Remove direction and width
                remainder = re.sub(r"^(input|output)\s*(wire|reg)?\s*(\[\s*\d+\s*:\s*\d+\s*\])?", "", line)
                remainder = remainder.replace(";", "")
                signals = [s.strip() for s in remainder.split(",") if s.strip()]

                for sig in signals:
                    name_match = re.search(r"([A-Za-z_][A-Za-z0-9_]*)", sig)
                    if name_match:
                        name = name_match.group(1)
                        info = {
                            "name": name,
                            "width": width,
                            "is_clock": bool(re.search(r"(clk|clock)", name, re.I)),
                            "is_reset": bool(re.search(r"(rst|reset)", name, re.I))
                        }
                        if is_input:
                            inputs.append(info)
                        else:
                            outputs.append(info)

        return {
            "success": True,
            "module_name": module_name,
            "inputs": inputs,
            "outputs": outputs,
            "message": f"Detected module '{module_name}' with {len(inputs)} inputs and {len(outputs)} outputs."
        }

    @classmethod
    def generate_testbench(cls, verilog_code: str, target_module: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates a robust, ready-to-simulate Verilog testbench template
        including VCD waveform dumping, clock generation, reset sequence, and test vectors.
        """
        analysis = cls.analyze_module_ports(verilog_code, target_module)
        if not analysis["success"]:
            return {
                "success": False,
                "module_name": "",
                "inputs": [],
                "outputs": [],
                "testbench_code": "",
                "message": analysis["message"]
            }

        mod_name = analysis["module_name"]
        inputs = analysis["inputs"]
        outputs = analysis["outputs"]
        tb_name = f"tb_{mod_name}"

        lines = [
            "`timescale 1ns / 1ps",
            "",
            "// ===========================================================================",
            f"// Starting Testbench Template for: {mod_name}",
            "// Generated automatically by Smart ECE Lab Testbench Assistant.",
            "// You can customize clock periods, reset timings, and test stimulus below.",
            "// ===========================================================================",
            f"module {tb_name};",
            "",
            "    // --- Testbench Stimulus Signals (reg for inputs, wire for outputs) ---"
        ]

        # Declare regs for inputs
        for inp in inputs:
            w_str = f"[{inp['width']-1}:0] " if inp['width'] > 1 else ""
            lines.append(f"    reg {w_str}{inp['name']};")

        # Declare wires for outputs
        for out in outputs:
            w_str = f"[{out['width']-1}:0] " if out['width'] > 1 else ""
            lines.append(f"    wire {w_str}{out['name']};")

        lines.append("")
        lines.append(f"    // --- Instantiate Unit Under Test (UUT) ---")
        lines.append(f"    {mod_name} uut (")

        all_ports = [(inp["name"], inp["name"]) for inp in inputs] + [(out["name"], out["name"]) for out in outputs]
        port_conns = [f"        .{p[0]}({p[1]})" for p in all_ports]
        lines.append(",\n".join(port_conns))
        lines.append("    );")
        lines.append("")

        # Check for clock signal
        clk_sig = next((inp["name"] for inp in inputs if inp["is_clock"]), None)
        rst_sig = next((inp["name"] for inp in inputs if inp["is_reset"]), None)

        if clk_sig:
            lines.append("    // --- Clock Generator (10ns period / 100MHz) ---")
            lines.append(f"    always #5 {clk_sig} = ~{clk_sig};")
            lines.append("")

        lines.append("    // --- Simulation & Stimulus Process ---")
        lines.append("    initial begin")
        lines.append("        // Configure VCD Waveform Dump for Browser Viewer")
        lines.append('        $dumpfile("dump.vcd");')
        lines.append(f"        $dumpvars(0, {tb_name});")
        lines.append("")
        lines.append("        // Initialize All Inputs")

        for inp in inputs:
            if inp["name"] == clk_sig:
                lines.append(f"        {inp['name']} = 0;")
            elif inp["name"] == rst_sig:
                lines.append(f"        {inp['name']} = 1;  // Assert initial reset")
            elif inp["width"] > 1:
                lines.append(f"        {inp['name']} = {inp['width']}'b0;")
            else:
                lines.append(f"        {inp['name']} = 0;")

        lines.append("")
        if rst_sig:
            lines.append("        // Hold Reset for 20ns, then Release")
            lines.append("        #20;")
            lines.append(f"        {rst_sig} = 0;")
            lines.append("")

        # Stimulus test steps
        data_inputs = [inp for inp in inputs if inp["name"] not in (clk_sig, rst_sig)]
        if data_inputs:
            lines.append("        // Apply Test Vectors")
            # Step 1
            for idx, inp in enumerate(data_inputs):
                val = 1 if inp["width"] == 1 else (idx + 1)
                lines.append(f"        #10 {inp['name']} = {val};")
            # Step 2
            for idx, inp in enumerate(data_inputs):
                val = 0 if inp["width"] == 1 else (idx * 2 + 3)
                lines.append(f"        #15 {inp['name']} = {val};")

        # Let simulation run
        sim_duration = 100 if clk_sig else 50
        lines.append(f"        // Wait for results and finish simulation")
        lines.append(f"        #{sim_duration};")
        lines.append('        $display("Simulation completed successfully at time %0t", $time);')
        lines.append("        $finish;")
        lines.append("    end")
        lines.append("")
        lines.append("    // --- Optional Console Monitor ---")
        monitor_args = [f"{p[0]}=%b" for p in all_ports]
        monitor_sigs = [p[0] for p in all_ports]
        lines.append("    initial begin")
        lines.append(f'        $monitor("Time=%0t | {" ".join(monitor_args)}", $time, {", ".join(monitor_sigs)});')
        lines.append("    end")
        lines.append("")
        lines.append("endmodule")

        generated_code = "\n".join(lines)

        return {
            "success": True,
            "module_name": mod_name,
            "inputs": inputs,
            "outputs": outputs,
            "testbench_code": generated_code,
            "message": f"Generated testbench '{tb_name}' with VCD dumping and stimulus template."
        }
