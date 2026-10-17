import re
from typing import Dict, List, Any, Optional
from PIL import Image, ImageDraw, ImageFont
import io

# VCD time unit -> nanoseconds
UNIT_TO_NS = {"s": 1e9, "ms": 1e6, "us": 1e3, "ns": 1.0, "ps": 1e-3, "fs": 1e-6}


class WaveformService:
    @staticmethod
    def parse_vcd(vcd_content: str) -> Dict[str, Any]:
        """
        Parses IEEE 1364 VCD content into signal transition data.
        All times are converted to nanoseconds using the VCD $timescale.
        """
        original_timescale = "1ns"
        ts_factor = 1.0              # VCD time unit -> ns
        reading_ts = False
        ts_tokens: List[str] = []

        signals_map: Dict[str, Dict[str, Any]] = {}
        current_scope: List[str] = []
        in_definitions = True

        current_time = 0
        transitions_by_id: Dict[str, List[Dict[str, Any]]] = {}

        for raw_line in vcd_content.splitlines():
            line = raw_line.strip()
            if not line:
                continue

            if in_definitions:
                # ---- $timescale (can be multi-line) ----
                if reading_ts or line.startswith("$timescale"):
                    if line.startswith("$timescale"):
                        reading_ts = True
                        ts_tokens = []
                        line = line[len("$timescale"):].strip()
                    for tok in line.split():
                        if tok == "$end":
                            reading_ts = False
                            break
                        ts_tokens.append(tok)
                    if not reading_ts:
                        txt = "".join(ts_tokens)          # e.g. "1ps"
                        m = re.match(r"^(\d+)(s|ms|us|ns|ps|fs)$", txt)
                        if m:
                            original_timescale = txt
                            ts_factor = int(m.group(1)) * UNIT_TO_NS[m.group(2)]
                    continue

                if line.startswith("$scope"):
                    parts = line.split()
                    if len(parts) >= 3:
                        current_scope.append(parts[2])
                elif line.startswith("$upscope"):
                    if current_scope:
                        current_scope.pop()
                elif line.startswith("$var"):
                    # $var <type> <size> <id> <reference> [<bus_slice>] $end
                    parts = line.split()
                    if len(parts) >= 5:
                        var_type = parts[1]
                        try:
                            width = int(parts[2])
                        except ValueError:
                            width = 1
                        id_code = parts[3]
                        name = parts[4]
                        if len(parts) >= 6 and parts[5] != "$end":
                            name = f"{name}{parts[5]}"

                        scoped_name = (
                            f"{'.'.join(current_scope)}.{name}" if current_scope else name
                        )

                        if id_code not in signals_map:
                            signals_map[id_code] = {
                                "name": name,
                                "scoped_name": scoped_name,
                                "wire_id": id_code,
                                "width": width,
                                "signal_type": var_type,
                            }
                            transitions_by_id[id_code] = []
                elif line.startswith("$enddefinitions"):
                    in_definitions = False
                continue

            # ---------- simulation data section ----------
            if line.startswith("#"):
                try:
                    current_time = int(round(int(line[1:]) * ts_factor))
                except ValueError:
                    pass
                continue

            if line.startswith("$"):      # $dumpvars, $end, $dumpoff, ...
                continue

            # Vector change: b<bits> <id>
            if line[0] in "bBrR":
                tokens = line.split()
                if len(tokens) >= 2:
                    val_str = tokens[0][1:]
                    id_code = tokens[1]
                    if id_code in transitions_by_id:
                        transitions_by_id[id_code].append(
                            {"time": current_time, "value": val_str}
                        )
            else:
                # Scalar change: <value><id>
                val_char = line[0]
                id_code = line[1:].strip()
                if id_code in transitions_by_id:
                    transitions_by_id[id_code].append(
                        {"time": current_time, "value": val_char}
                    )

        # Assemble signals
        signals_result = []
        for id_code, info in signals_map.items():
            signals_result.append(
                {
                    "name": info["scoped_name"],
                    "short_name": info["name"],
                    "wire_id": id_code,
                    "width": info["width"],
                    "signal_type": info["signal_type"],
                    "transitions": transitions_by_id.get(id_code, []),
                }
            )

        # Deduplicate (tb vs uut copies of the same signal)
        seen_names = set()
        filtered_signals = []
        for s in signals_result:
            identifier = f"{s['short_name']}_{s['width']}"
            if identifier not in seen_names:
                seen_names.add(identifier)
                filtered_signals.append(
                    {
                        "name": s["short_name"],
                        "wire_id": s["wire_id"],
                        "width": s["width"],
                        "signal_type": s["signal_type"],
                        "transitions": s["transitions"],
                    }
                )

        return {
            "timescale": "1ns",                       # times are already in ns
            "original_timescale": original_timescale,  # what the VCD declared
            "end_time": current_time,
            "signals": filtered_signals,
        }

    @classmethod
    def render_waveform_image(
        cls, parsed_waveform: Dict[str, Any], max_width: int = 900
    ) -> Optional[bytes]:
        """Renders a 2D digital timing diagram (PNG) from parsed VCD data."""
        signals = parsed_waveform.get("signals", [])
        end_time = parsed_waveform.get("end_time", 100)
        timescale = parsed_waveform.get("timescale", "ns")

        if not signals or end_time <= 0:
            return None

        label_width = 160
        row_height = 48
        header_height = 40
        footer_height = 30
        plot_width = max_width - label_width - 30
        total_height = header_height + (len(signals) * row_height) + footer_height

        image = Image.new("RGB", (max_width, total_height), color=(250, 252, 255))
        draw = ImageDraw.Draw(image)

        try:
            font = ImageFont.load_default()
        except Exception:
            font = None

        draw.text((15, 12), f"DIGITAL TIMING DIAGRAM ({timescale})", fill=(30, 41, 59), font=font)
        draw.line([(0, header_height - 5), (max_width, header_height - 5)], fill=(203, 213, 225), width=1)

        time_scale_factor = plot_width / max(end_time, 1)

        step = max(5, int(end_time / 10))
        for t in range(0, end_time + 1, step):
            x = int(label_width + t * time_scale_factor)
            draw.line([(x, header_height), (x, total_height - footer_height)], fill=(241, 245, 249), width=1)
            draw.text((x - 6, total_height - footer_height + 8), str(t), fill=(100, 116, 139), font=font)

        for idx, sig in enumerate(signals):
            y_base = header_height + (idx * row_height)
            y_center = y_base + (row_height // 2)
            y_high = y_center - 14
            y_low = y_center + 14

            sig_name = f"{sig['name']} [{sig['width']-1}:0]" if sig["width"] > 1 else sig["name"]
            draw.text((15, y_center - 6), sig_name, fill=(15, 23, 42), font=font)
            draw.line([(0, y_base + row_height - 1), (max_width, y_base + row_height - 1)], fill=(226, 232, 240), width=1)

            transitions = sig.get("transitions", [])
            width = sig.get("width", 1)

            if not transitions:
                draw.line([(label_width, y_low), (label_width + plot_width, y_low)], fill=(148, 163, 184), width=2)
                continue

            if width == 1:
                last_t = transitions[0]["time"]
                last_val = str(transitions[0]["value"])
                last_x = int(label_width + last_t * time_scale_factor)
                last_y = y_high if last_val == "1" else y_low

                if last_x > label_width:
                    draw.line([(label_width, last_y), (last_x, last_y)], fill=(16, 185, 129), width=2)

                for tr in transitions[1:]:
                    curr_x = int(label_width + tr["time"] * time_scale_factor)
                    curr_y = y_high if str(tr["value"]) == "1" else y_low

                    draw.line([(last_x, last_y), (curr_x, last_y)], fill=(16, 185, 129), width=2)
                    draw.line([(curr_x, last_y), (curr_x, curr_y)], fill=(16, 185, 129), width=2)

                    last_x = curr_x
                    last_y = curr_y

                end_x = int(label_width + end_time * time_scale_factor)
                if end_x > last_x:
                    draw.line([(last_x, last_y), (end_x, last_y)], fill=(16, 185, 129), width=2)

            else:
                for i in range(len(transitions)):
                    curr = transitions[i]
                    val = str(curr["value"])
                    nxt_t = transitions[i + 1]["time"] if (i + 1 < len(transitions)) else end_time

                    x1 = int(label_width + curr["time"] * time_scale_factor)
                    x2 = int(label_width + nxt_t * time_scale_factor)
                    if x2 <= x1:
                        x2 = x1 + 4

                    edge_w = min(4, (x2 - x1) // 3)
                    poly = [
                        (x1, y_center),
                        (x1 + edge_w, y_high),
                        (x2 - edge_w, y_high),
                        (x2, y_center),
                        (x2 - edge_w, y_low),
                        (x1 + edge_w, y_low),
                    ]
                    draw.polygon(poly, outline=(59, 130, 246), fill=(239, 246, 255))

                    hex_val = f"0x{int(val, 2):X}" if val and all(c in "01" for c in val) else val
                    if (x2 - x1) > 28:
                        draw.text((x1 + edge_w + 3, y_center - 5), hex_val, fill=(29, 78, 216), font=font)

        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return buffer.getvalue()