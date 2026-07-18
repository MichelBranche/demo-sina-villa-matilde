#!/usr/bin/env python3
"""Re-download all site images at maximum available resolution (original uploads)."""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "web" / "public" / "media"
GALLERY = ROOT / "inventory" / "gallery-content.json"
BASE = "https://www.sinahotels.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; VillaMatildeHiRes/1.0)",
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
}

# local relative path -> assets/uploads path (no CDN resize)
PRIORITY: list[tuple[str, str]] = [
    ("hero/facciata.jpg", "villamatilde_facciata.jpg"),
    (
        "hero/outdoor.jpg",
        "Immagini-Definitive/Villa-Matilde/SinaVillaMatilde_Outdoor.jpg",
    ),
    (
        "hero/pool.jpg",
        "Immagini-Definitive/Villa-Matilde/GALLERY/VMA Swimming pool.jpg",
    ),
    ("sections/suite.jpg", "hotels/villa-matilde/Sina-Villa-Matilde-suite.jpg"),
    ("sections/restaurant.jpg", "Villa_Matilde_Restaurant.jpg"),
    (
        "sections/wellness.jpg",
        "Immagini-Definitive/Villa-Matilde/HOME-HOTEL/Sina-Villamatilde-wellness5-benessere.jpg",
    ),
    ("sections/wedding.jpg", "Box/Vma/Box - Wedding VMA.jpg"),
    ("sections/meeting.jpg", "meeting/eventi 3.jpg"),
    ("sections/salone.jpg", "villamatilde_salone.jpg"),
    ("sections/library.jpg", "villamatilde_library.jpg"),
    ("logo/epigrafe.png", None),  # special non-uploads path
    # Scuderie
    ("spaces/scuderie/01-ristorante.jpg", "ristorante_lescuderie.jpg"),
    ("spaces/scuderie/02-lescuderie.jpg", "villamatilde_lescuderie.jpg"),
    (
        "spaces/scuderie/03-scuderie-interno.jpg",
        "Immagini-Definitive/Villa-Matilde/SinaVillaMatilde_LeScuderie1.jpg",
    ),
    (
        "spaces/scuderie/04-dining-1.jpg",
        "Immagini-Definitive/Villa-Matilde/DINING/DINING LE SCUDERIE 1.jpg",
    ),
    (
        "spaces/scuderie/05-dining-2.jpg",
        "Immagini-Definitive/Villa-Matilde/DINING/DINING LE SCUDERIE 2.jpg",
    ),
    (
        "spaces/scuderie/06-lescuderie-2.jpg",
        "Immagini-Definitive/Villa-Matilde/SinaVillaMatilde_LeScuderie2.jpg",
    ),
    ("spaces/scuderie/07-colazione-1.jpg", "sinavillamatilde_salacolazione.jpg"),
    ("spaces/scuderie/08-colazione-2.jpg", "sinavillamatilde_salacolazione2.jpg"),
    ("spaces/scuderie/09-colazione-3.jpg", "sinavillamatilde_salacolazione3.jpg"),
]


def candidate_urls(asset_path: str | None, special: str | None = None) -> list[str]:
    if special:
        return [BASE + special]
    assert asset_path
    quoted = urllib.parse.quote(asset_path, safe="/")
    return [
        # Original file (best)
        f"{BASE}/assets/uploads/{quoted}",
        # Cloudflare large derivative as fallback
        f"{BASE}/cdn-cgi/image/width=4000,quality=95,format=auto/assets/uploads/{quoted}",
        f"{BASE}/cdn-cgi/image/width=2400,quality=90,format=auto/assets/uploads/{quoted}",
    ]


def fetch_best(urls: list[str], dest: Path) -> tuple[bool, int, str]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    best_data: bytes | None = None
    best_url = ""
    for url in urls:
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = resp.read()
            if not data or len(data) < 1024:
                continue
            if best_data is None or len(data) > len(best_data):
                best_data = data
                best_url = url
        except Exception as exc:  # noqa: BLE001
            print(f"  skip {url.split('/')[-1][:40]}… ({exc.__class__.__name__})")
    if best_data is None:
        return False, 0, ""
    dest.write_bytes(best_data)
    return True, len(best_data), best_url


def main() -> None:
    jobs: list[tuple[str, list[str]]] = []

    for rel, asset in PRIORITY:
        if rel.endswith("epigrafe.png"):
            jobs.append(
                (
                    rel,
                    candidate_urls(
                        None,
                        special="/assets/i/hotels/logos/villamatilde_epigrafe.png",
                    ),
                )
            )
        else:
            jobs.append((rel, candidate_urls(asset)))

    if GALLERY.exists():
        items = json.loads(GALLERY.read_text(encoding="utf-8"))
        for i, item in enumerate(items[:16]):
            safe = re.sub(r"[^\w\-]+", "-", item.get("category", "img")).strip("-").lower()
            ext = Path(item.get("asset_path", "img.jpg")).suffix or ".jpg"
            rel = f"gallery/{i+1:02d}-{safe}{ext}"
            path = item.get("asset_path")
            if path:
                jobs.append((rel, candidate_urls(path)))

    # Deduplicate by local path (keep first)
    seen: set[str] = set()
    unique_jobs: list[tuple[str, list[str]]] = []
    for rel, urls in jobs:
        if rel in seen:
            continue
        seen.add(rel)
        unique_jobs.append((rel, urls))

    print(f"Re-downloading {len(unique_jobs)} assets at max resolution…\n")
    ok = 0
    for rel, urls in unique_jobs:
        dest = OUT / rel
        before = dest.stat().st_size if dest.exists() else 0
        success, size, used = fetch_best(urls, dest)
        if success:
            delta = size - before
            sign = "+" if delta >= 0 else ""
            print(
                f"OK {rel}  {before // 1024}KB -> {size // 1024}KB ({sign}{delta // 1024}KB)"
            )
            ok += 1
        else:
            print(f"ERR {rel}")

    print(f"\nDone: {ok}/{len(unique_jobs)} files updated in {OUT}")


if __name__ == "__main__":
    main()
