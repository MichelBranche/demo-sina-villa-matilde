#!/usr/bin/env python3
"""Extract structured room specs and full gallery catalog."""

import json
import re
import time
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path

BASE = "https://www.sinahotels.com/it/h/sina-villa-matilde-torino"
ROOMS = [
    ("classic", "camere-e-suite/classic.html", "Classic"),
    ("superior", "camere-e-suite/superior.html", "Superior"),
    ("deluxe", "camere-e-suite/deluxe.html", "Deluxe"),
    ("premium-deluxe", "camere-e-suite/premium-deluxe.html", "Premium Deluxe"),
    ("premium-deluxe-balcony", "camere-e-suite/premium-deluxe-with-balcony.html", "Premium Deluxe with Balcony"),
    ("premium-deluxe-terrace", "camere-e-suite/premium-deluxe-with-terrace.html", "Premium Deluxe with Terrace"),
    ("family-junior-suite", "camere-e-suite/family-junior-suite.html", "Family Junior Suite"),
    ("two-floor-suite", "camere-e-suite/two-floor-suite.html", "Two Floor Suite"),
    ("park-view-heritage-balcony", "camere-e-suite/park-view-heritage-suite-with-balcony.html", "Park View Heritage Suite with Balcony"),
    ("park-view-heritage-suite", "camere-e-suite/suite-torino.html", "Park View Heritage Suite"),
]

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; VillaMatildeInventory/1.0)"}
OUT = Path(__file__).resolve().parents[1] / "inventory"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=45) as resp:
        return resp.read().decode("utf-8", errors="replace")


def strip_tags(html: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", html))).strip()


def normalize_asset(path: str) -> str:
    path = urllib.parse.unquote(path)
    if path.startswith("/"):
        return "https://www.sinahotels.com" + path
    if path.startswith("http"):
        return path
    return "https://www.sinahotels.com/assets/uploads/" + path.lstrip("/")


def extract_room(html: str) -> dict:
    title = None
    m = re.search(r'<div class="d1-d5 room">[\s\S]*?<h2>(.*?)</h2>', html, re.I)
    if m:
        title = strip_tags(m.group(1))

    specs = {"sqm": None, "sqf": None, "max_guests": None}
    rows = re.search(
        r'<table class="detail">[\s\S]*?<tbody>[\s\S]*?<tr>[\s\S]*?<td>(\d+)</td>[\s\S]*?<td>(\d+)</td>[\s\S]*?<td[^>]*>(\d+)</td>',
        html,
        re.I,
    )
    if rows:
        specs = {"sqm": int(rows.group(1)), "sqf": int(rows.group(2)), "max_guests": int(rows.group(3))}

    services = None
    sm = re.search(
        r'<div class="info-box first border-top">[\s\S]*?<div class="info-title">\s*Servizi\s*</div>\s*([\s\S]*?)</div>',
        html,
        re.I,
    )
    if sm:
        services = strip_tags(sm.group(1))

    descriptions = []
    for pm in re.finditer(r'<div class="d7-d11[\s\S]*?<p[^>]*>(.*?)</p>', html, re.I):
        text = strip_tags(pm.group(1))
        if len(text) > 30:
            descriptions.append(text)

    images = []
    seen = set()
    for im in re.finditer(r'<img[^>]+(?:src|srcset)=["\']([^"\']+)["\'][^>]*alt=["\']([^"\']*)["\']', html, re.I):
        raw = im.group(1).split(",")[0].strip().split()[0]
        if "uploads" not in raw and "cdn-cgi" not in raw:
            continue
        url = normalize_asset(raw if raw.startswith("/") else re.search(r"(/cdn-cgi/image/[^\"']+|/assets/uploads/[^\"']+)", raw).group(1) if re.search(r"(/cdn-cgi/image/[^\"']+|/assets/uploads/[^\"']+)", raw) else raw)
        asset = re.search(r"/assets/uploads/(.+)$", url)
        key = asset.group(1) if asset else url
        if key not in seen:
            seen.add(key)
            images.append({"asset_path": key, "alt": im.group(2), "url": url})

    related = []
    for rm in re.finditer(r'<div class="container center related-rooms">[\s\S]*?</div>\s*</div>', html, re.I):
        for hm in re.finditer(r"<h2[^>]*>(.*?)</h2>", rm.group(0), re.I):
            t = strip_tags(hm.group(1))
            if t and t not in related:
                related.append(t)

    return {
        "title": title,
        "specs": specs,
        "services": services,
        "descriptions": descriptions,
        "images": images,
        "related_rooms": related,
    }


def extract_gallery(html: str) -> list[dict]:
    items = []
    for m in re.finditer(
        r'<a class="gallery-fs"[^>]+href="([^"]+)"[^>]+title="([^"]*)"[^>]*>([\s\S]*?)</a>\s*<a class="download" href="([^"]+)"',
        html,
        re.I,
    ):
        preview = normalize_asset(m.group(1))
        download = normalize_asset(m.group(4).replace("download.php?file=", "/assets/uploads/").split("&")[0])
        if "download.php" in m.group(4):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(m.group(4)).query)
            if "file" in q:
                download = normalize_asset(q["file"][0])
        alt_m = re.search(r'alt="([^"]*)"', m.group(3), re.I)
        asset_m = re.search(r"/assets/uploads/(.+)$", preview)
        items.append(
            {
                "category": m.group(2),
                "alt": alt_m.group(1) if alt_m else None,
                "preview_url": preview,
                "asset_path": urllib.parse.unquote(asset_m.group(1)) if asset_m else None,
                "download_url": download,
            }
        )
    return items


def main() -> None:
    rooms_data = []
    for slug, path, label in ROOMS:
        url = f"{BASE}/{path}"
        html = fetch(url)
        data = extract_room(html)
        data.update({"slug": slug, "label": label, "url": url})
        rooms_data.append(data)
        print(f"{slug}: {data['title']} | {data['specs']} | {len(data['images'])} img")
        time.sleep(0.3)

    gallery_html = fetch(f"{BASE}/gallery.html")
    gallery = extract_gallery(gallery_html)
    print(f"gallery: {len(gallery)} items")

    (OUT / "rooms-content.json").write_text(json.dumps(rooms_data, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "gallery-content.json").write_text(json.dumps(gallery, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
