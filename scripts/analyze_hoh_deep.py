#!/usr/bin/env python3
"""Deep extract of House of Honey HTML patterns."""

import json
import re
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "reference-houseofhoney" / "www.houseofhoney.com"


def strip(s: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def extract_sections(html: str) -> list[str]:
    """Find major visible text blocks in order."""
    patterns = [
        r'aria-label="([^"]{12,120})"',
        r'role="text"[^>]*aria-label="([^"]{12,120})"',
        r"<h1[^>]*>([\s\S]*?)</h1>",
        r"<h2[^>]*>([\s\S]*?)</h2>",
        r'class="[^"]*text-title[^"]*"[^>]*>([\s\S]*?)</',
    ]
    found = []
    seen = set()
    for pat in patterns:
        for m in re.finditer(pat, html, re.I):
            t = strip(m.group(1))
            if len(t) > 8 and t not in seen and "keyboard" not in t.lower():
                seen.add(t)
                found.append(t)
    return found


def extract_classes(html: str) -> dict:
    classes = re.findall(r'class="([^"]+)"', html)
    interesting = {}
    for c in classes:
        for part in c.split():
            if any(
                k in part
                for k in (
                    "text-title",
                    "font-",
                    "h-svh",
                    "h-dvh",
                    "grid",
                    "sticky",
                    "uppercase",
                    "noe",
                    "neutral",
                )
            ):
                interesting[part] = interesting.get(part, 0) + 1
    return dict(sorted(interesting.items(), key=lambda x: -x[1])[:40])


def extract_css_vars(html: str) -> list[str]:
    vars_ = sorted(set(re.findall(r"--([a-z0-9-]+):\s*([^;\"]+)", html, re.I)))
    return [f"--{n}: {v.strip()}" for n, v in vars_[:30]]


def analyze_page(name: str) -> dict:
    path = ROOT / name
    html = path.read_text(encoding="utf-8", errors="replace")
    return {
        "sections": extract_sections(html)[:25],
        "top_classes": extract_classes(html),
        "css_vars": extract_css_vars(html)[:20],
        "body_theme": re.search(r'<body[^>]*data-theme="([^"]+)"', html),
        "fonts": sorted(set(re.findall(r'font-family:\s*([^;]+)', html)))[:10],
    }


def main() -> None:
    pages = ["index.html", "spaces.html", "studio.html", "contact.html"]
    out = {}
    for p in pages:
        if (ROOT / p).exists():
            data = analyze_page(p)
            data["body_theme"] = data["body_theme"].group(1) if data["body_theme"] else None
            out[p] = data
            print(f"\n=== {p} ===")
            print("theme:", data["body_theme"])
            print("sections:", data["sections"][:15])
            print("classes:", list(data["top_classes"].keys())[:15])

    # space slugs + titles from spaces.html
    spaces_html = (ROOT / "spaces.html").read_text(encoding="utf-8", errors="replace")
    space_titles = []
    for m in re.finditer(r'>([A-Z][^<]{4,50})</a>', spaces_html):
        t = strip(m.group(1))
        if t not in space_titles and "House" not in t:
            space_titles.append(t)
    out["space_titles"] = space_titles
    print("\nspace titles:", space_titles)

    (ROOT.parent / "deep-analysis.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
