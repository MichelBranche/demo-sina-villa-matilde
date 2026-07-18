#!/usr/bin/env python3
"""Extract embedded woff2 fonts from House of Honey index.html."""

import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "reference-houseofhoney" / "www.houseofhoney.com" / "index.html"
OUT = ROOT / "web" / "public" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)

html = HTML.read_text(encoding="utf-8", errors="replace")

pattern = re.compile(
    r'@font-face\{font-family:([^;]+);src:url\("data:font/woff2;base64,([^"]+)"\)',
)

for match in pattern.finditer(html):
    name = match.group(1).strip()
    data = base64.b64decode(match.group(2))
    filename = f"{name}.woff2"
    path = OUT / filename
    path.write_bytes(data)
    print(f"Wrote {path} ({len(data):,} bytes)")
