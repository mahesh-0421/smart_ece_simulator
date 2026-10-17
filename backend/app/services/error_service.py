import re
from typing import List, Dict, Any

ERR_RE = re.compile(
    r"^(?P<file>.+?):(?P<line>\d+):\s*(?P<kind>error|warning|sorry):\s*(?P<msg>.+)$"
)

HINTS = [
    (r"Unable to bind wire/reg/memory `(.+?)' in `(.+?)'",
     "The signal `@1` is used in `@2` but it was never declared, or its name is misspelled.",
     "Check the spelling, or declare it with `wire @1;` or `reg @1;`. Also check the module's port list."),
    (r"Unknown module type: (\w+)",
     "The module `@1` was not found in the file.",
     "Add the code for module `@1` above your testbench, or check the module name spelling."),
    (r"syntax error",
     "There is a syntax mistake, such as a missing `;`, `end` or `)`.",
     "Check the reported line and the line before it."),
    (r"(\w+) is not a valid l-value",
     "`@1` is assigned inside an `always` block, but it is declared as a `wire`.",
     "Declare `@1` as `reg`."),
]


def _explain(msg: str):
    for pat, why, fix in HINTS:
        m = re.search(pat, msg)
        if m:
            for i, value in enumerate(m.groups(), start=1):
                why = why.replace("@" + str(i), value)
                fix = fix.replace("@" + str(i), value)
            return why, fix
    return None, None


def parse_diagnostics(stderr: str) -> List[Dict[str, Any]]:
    try:
        out: List[Dict[str, Any]] = []
        seen = set()
        for raw in (stderr or "").splitlines():
            m = ERR_RE.match(raw.strip())
            if not m:
                continue
            msg = m.group("msg")
            if msg.startswith("Unable to elaborate"):
                continue
            line_no = int(m.group("line"))
            if (line_no, msg) in seen:
                continue
            seen.add((line_no, msg))
            why, fix = _explain(msg)
            out.append({
                "line": line_no,
                "severity": "warning" if m.group("kind") == "warning" else "error",
                "message": msg,
                "explanation": why or "The compiler found a problem on this line.",
                "fix": fix or "Check this line and the line before it.",
            })
        return out
    except Exception:
        return []