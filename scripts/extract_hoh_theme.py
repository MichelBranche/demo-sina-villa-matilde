#!/usr/bin/env python3
import re
from pathlib import Path

html = (Path(__file__).resolve().parents[1] / "reference-houseofhoney" / "www.houseofhoney.com" / "index.html").read_text(encoding="utf-8", errors="replace")

# theme CSS variables
for m in re.finditer(r"--([a-z0-9-]+):\s*([^;\"]+)", html[:500000]):
    name, val = m.group(1), m.group(2).strip()
    if any(k in name for k in ("theme", "base", "accent", "bg", "text", "brown", "pink")):
        print(f"--{name}: {val}")

print("\n--- SECTIONS ---")
for m in re.finditer(r'data-page-builder-section="([^"]+)"[^>]*class="([^"]+)"', html):
    print(m.group(1), "->", m.group(2)[:120])
