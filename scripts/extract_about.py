#!/usr/bin/env python3
import re
from pathlib import Path

html = (Path(__file__).resolve().parents[1] / "reference-houseofhoney" / "www.houseofhoney.com" / "index.html").read_text(encoding="utf-8", errors="replace")

# Find about section
m = re.search(r'id="about"[^>]*>([\s\S]{0,8000})', html)
if m:
    chunk = m.group(0)
    # strip scripts
    chunk = re.sub(r"<script[\s\S]*?</script>", "", chunk)
    # get class on div
    cls = re.search(r'id="about"[^>]*class="([^"]+)"', html)
    print("CLASS:", cls.group(1) if cls else "n/a")
    # visible text snippets
    texts = re.findall(r'>([^<]{3,120})<', chunk)
    for t in texts[:40]:
        t = t.strip()
        if t and not t.startswith("$") and "function" not in t:
            print("TXT:", t[:100])

# search marquee related
for pat in ["textMarquee", "marquee", "about", "STUDIO", "House of Honey"]:
    if pat.lower() in html.lower():
        print(f"found: {pat}")

# extract structure around about
idx = html.find('id="about"')
print("\nSNIPPET:", html[idx:idx+3500][:3500])
