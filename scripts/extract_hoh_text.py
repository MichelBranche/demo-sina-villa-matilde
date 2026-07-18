#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "reference-houseofhoney" / "www.houseofhoney.com"

def extract_readable_blocks(html: str, max_blocks=80):
    # split on major section markers
    chunks = re.split(r'(<section[^>]*>|<div class="relative isolate|<header|<footer)', html)
    texts = []
    for c in chunks:
        t = re.sub(r"<[^>]+>", " ", c)
        t = re.sub(r"\s+", " ", t).strip()
        if len(t) > 20 and not t.startswith("$"):
            texts.append(t[:200])
    return texts[:max_blocks]

for page in ["index.html", "spaces.html"]:
    html = (ROOT / page).read_text(encoding="utf-8", errors="replace")
    print(f"\n{'='*60}\n{page}\n{'='*60}")
    for i, t in enumerate(extract_readable_blocks(html)[:30]):
        print(f"{i:02d}: {t}")

# Extract nav link text
idx = (ROOT / "index.html").read_text(encoding="utf-8", errors="replace")
for pat in [r'>(Spaces|Studio|Dear Honey|The Buzz|Press|Contact)<', r'href="/([^"]+)"[^>]*>([^<]+)<']:
    pass
links = re.findall(r'>(Spaces|Studio|Dear Honey|The Buzz|Press|Contact|Homepage)<', idx)
print("\nNav labels:", sorted(set(links)))

# space names on homepage
for m in re.finditer(r'aria-label="([^"]{8,60})"', idx):
    t = m.group(1)
    if any(w in t.lower() for w in ['house', 'coastal', 'heirloom', 'glamour', 'fantasy', 'reverence', 'expression', 'study']):
        print("space:", t)
