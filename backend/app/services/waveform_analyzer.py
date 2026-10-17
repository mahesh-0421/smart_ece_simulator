from typing import Dict, List, Any, Optional
from app.services.waveform_service import WaveformService

class WaveformAnalyzer:
    @classmethod
    def analyze_vcd(
        cls,
        vcd_text: str,
        expected_checks: Optional[List[Dict[str, Any]]] = None,
        target_module: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyzes actual simulation VCD data. Detects signal transitions,
        clock frequency/period, reset behavior, and verifies expected values
        against simulation time points.
        """
        if not vcd_text or not vcd_text.strip():
            return {
                "success": False,
                "total_time": 0,
                "signals_count": 0,
                "total_transitions": 0,
                "check_results": [],
                "summary": "No VCD data provided for analysis.",
                "clock_detected": None
            }

        parsed = WaveformService.parse_vcd(vcd_text)
        signals = parsed.get("signals", [])
        end_time = parsed.get("end_time", 0)
        timescale = parsed.get("timescale", "1ns")

        if not signals:
            return {
                "success": False,
                "total_time": end_time,
                "signals_count": 0,
                "total_transitions": 0,
                "check_results": [],
                "summary": "Parsed VCD contains no active signals.",
                "clock_detected": None
            }

        total_transitions = sum(len(s.get("transitions", [])) for s in signals)

        # Detect clock signal
        clock_info = None
        for s in signals:
            name_lower = s["name"].lower()
            if "clk" in name_lower or "clock" in name_lower:
                trans = s.get("transitions", [])
                if len(trans) >= 4:
                    # Calculate average half-period
                    deltas = [trans[i]["time"] - trans[i-1]["time"] for i in range(1, min(len(trans), 10))]
                    if deltas:
                        avg_half_period = sum(deltas) / len(deltas)
                        clock_info = {
                            "signal_name": s["name"],
                            "period": avg_half_period * 2,
                            "timescale": timescale,
                            "estimated_frequency": f"{round(1000 / (avg_half_period * 2), 2)} MHz" if "ns" in timescale and avg_half_period > 0 else "N/A",
                            "total_cycles": int(len(trans) / 2)
                        }
                break

        # Check for counter sequence if count signal exists
        auto_checks = []
        count_sig = next((s for s in signals if "count" in s["name"].lower()), None)
        rst_sig = next((s for s in signals if "rst" in s["name"].lower() or "reset" in s["name"].lower()), None)

        if count_sig and count_sig.get("transitions"):
            c_trans = count_sig["transitions"]
            prev_val = None
            is_monotonic_up = True
            mismatch_details = []

            for tr in c_trans:
                val_str = tr["value"]
                # Try to parse binary value
                try:
                    int_val = int(val_str, 2) if all(c in "01" for c in val_str) else None
                except ValueError:
                    int_val = None

                if int_val is not None:
                    if prev_val is not None and prev_val < (2**count_sig["width"] - 1):
                        # Expected either prev_val + 1 or 0 (if reset or wrap)
                        if int_val != (prev_val + 1) and int_val != 0:
                            is_monotonic_up = False
                            mismatch_details.append(f"At {tr['time']}{timescale}: jumped from {prev_val} to {int_val}")
                    prev_val = int_val

            auto_checks.append({
                "check_type": "Counter Up-Sequence Verification",
                "signal": count_sig["name"],
                "passed": is_monotonic_up,
                "details": "Counter incrementally counted up without illegal jumps." if is_monotonic_up else f"Irregular transitions detected: {'; '.join(mismatch_details[:3])}"
            })

        # Evaluate explicit expected checks if provided by student or experiment
        check_results = list(auto_checks)
        if expected_checks:
            for exp in expected_checks:
                sig_name = exp.get("signal_name", "")
                val_map = exp.get("expected_value_at_time", {})
                
                # Find matching signal in parsed data
                matched_sig = next((s for s in signals if s["name"] == sig_name or sig_name in s["name"]), None)
                if not matched_sig:
                    check_results.append({
                        "check_type": f"Signal '{sig_name}' presence check",
                        "signal": sig_name,
                        "passed": False,
                        "details": f"Signal '{sig_name}' was not found in simulation waveform."
                    })
                    continue

                for t_str, exp_val in val_map.items():
                    t = int(t_str)
                    # Find actual value of signal at or immediately before time t
                    actual_val = "x"
                    for tr in matched_sig.get("transitions", []):
                        if tr["time"] <= t:
                            actual_val = str(tr["value"])
                        else:
                            break

                    # Compare values
                    passed = (actual_val == exp_val)
                    check_results.append({
                        "check_type": f"Timestamp value check at {t}{timescale}",
                        "signal": matched_sig["name"],
                        "timestamp": t,
                        "expected": exp_val,
                        "actual": actual_val,
                        "passed": passed,
                        "details": f"Expected '{exp_val}', got '{actual_val}'." if not passed else f"Matches expected '{exp_val}'."
                    })

        # Build analysis summary
        all_passed = all(c.get("passed", True) for c in check_results)
        summary = (
            f"Waveform Analysis Complete: Simulation ran for {end_time}{timescale} across {len(signals)} signals "
            f"with {total_transitions} recorded transitions. "
        )
        if clock_info:
            summary += f"Detected clock on '{clock_info['signal_name']}' with period {clock_info['period']}{timescale} ({clock_info['estimated_frequency']}). "
        
        if check_results:
            passed_cnt = sum(1 for c in check_results if c.get("passed"))
            summary += f"Automated verification: {passed_cnt}/{len(check_results)} assertions PASSED."
        else:
            summary += "No formal assertions were defined; waveforms reflect functional simulation."

        return {
            "success": True,
            "total_time": end_time,
            "signals_count": len(signals),
            "total_transitions": total_transitions,
            "check_results": check_results,
            "summary": summary,
            "clock_detected": clock_info
        }
