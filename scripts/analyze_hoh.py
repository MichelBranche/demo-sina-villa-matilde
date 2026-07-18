#!/usr/bin/env python3
"""Analyze House of Honey reference site structure."""

import json
import re
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "reference-houseofhoney" / "www.houseofhoney.com"


def strip_tags(s: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def analyze_html(path: Path) -> dict:
    html = path.read_text(encoding="utf-8", errors="replace")
    links = sorted(set(re.findall(r'href="(/[^"#?][^"]*)"', html)))
    titles = re.findall(r"<title>([^<]+)</title>", html, re.I)
    h1 = [strip_tags(x) for x in re.findall(r"<h1[^>]*>([\s\S]*?)</h1>", html, re.I)][:5]
    h2 = [strip_tags(x) for x in re.findall(r"<h2[^>]*>([\s\S]*?)</h2>", html, re.I)][:12]
    # visible strings in JSON-like content
    strings = re.findall(r'"children":"([^"]{8,120})"', html)
    unique_strings = []
    seen = set()
    for s in strings:
        s = s.replace("\\n", " ").strip()
        if s not in seen and not s.startswith("http"):
            seen.add(s)
            unique_strings.append(s)
    return {
        "file": path.name,
        "title": titles[0] if titles else None,
        "links": links[:30],
        "h1": h1,
        "h2": h2,
        "content_strings": unique_strings[:40],
    }


def main() -> None:
    pages = [
        "index.html",
        "spaces.html",
        "studio.html",
        "dear-honey.html",
        "the-buzz.html",
        "press.html",
        "contact.html",
    ]
    out = {}
    for p in pages:
        fp = ROOT / p
        if fp.exists():
            out[p] = analyze_html(fp)
            print(f"=== {p} ===")
            data = out[p]
            print("title:", data["title"])
            print("h1:", data["h1"][:3])
            print("h2:", data["h2"][:6])
            print("links:", data["links"][:15])
            print("strings:", data["content_strings"][:12])
            print()
    spaces_html = (ROOT / "spaces.html").read_text(encoding="utf-8", errors="replace")
    space_names = []
    for m in re.finditer(r'aria-label="([^"]{5,80})"', spaces_html):
        label = m.group(1)
        if "keyboard" not in label.lower() and label not in space_names:
            space_names.append(label)
    print("space aria-labels:", space_names[:20])

    (ROOT.parent / "structure-analysis.json").write_text(
        json.dumps({**out, "space_labels": space_names}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
