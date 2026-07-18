#!/usr/bin/env python3
"""Download priority media assets for the React site."""

import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GALLERY = ROOT / "inventory" / "gallery-content.json"
OUT = ROOT / "web" / "public" / "media"
BASE = "https://www.sinahotels.com"

PRIORITY = [
    ("hero/facciata.jpg", "/cdn-cgi/image/width=1920,format=auto/assets/uploads/villamatilde_facciata.jpg"),
    ("hero/outdoor.jpg", "/cdn-cgi/image/width=1920,format=auto/assets/uploads/Immagini-Definitive/Villa-Matilde/SinaVillaMatilde_Outdoor.jpg"),
    ("hero/pool.jpg", "/cdn-cgi/image/width=1920,format=auto/assets/uploads/Immagini-Definitive/Villa-Matilde/GALLERY/VMA%20Swimming%20pool.jpg"),
    ("sections/suite.jpg", "/cdn-cgi/image/width=1200,format=auto/assets/uploads/hotels/villa-matilde/Sina-Villa-Matilde-suite.jpg"),
    ("sections/restaurant.jpg", "/cdn-cgi/image/width=1200,format=auto/assets/uploads/Villa_Matilde_Restaurant.jpg"),
    ("sections/wellness.jpg", "/cdn-cgi/image/width=1200,format=auto/assets/uploads/Immagini-Definitive/Villa-Matilde/HOME-HOTEL/Sina-Villamatilde-wellness5-benessere.jpg"),
    ("sections/wedding.jpg", "/cdn-cgi/image/width=1200,format=auto/assets/uploads/Box/Vma/Box%20-%20Wedding%20VMA.jpg"),
    ("sections/meeting.jpg", "/cdn-cgi/image/width=1200,format=auto/assets/uploads/meeting/eventi%203.jpg"),
    ("sections/salone.jpg", "/cdn-cgi/image/width=1200,format=auto/assets/uploads/villamatilde_salone.jpg"),
    ("sections/library.jpg", "/cdn-cgi/image/width=1200,format=auto/assets/uploads/villamatilde_library.jpg"),
    ("logo/epigrafe.png", "/assets/i/hotels/logos/villamatilde_epigrafe.png"),
]

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; VillaMatildeAssetDownloader/1.0)"}


def download(url: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=60) as resp:
            dest.write_bytes(resp.read())
        print(f"OK {dest.name} ({dest.stat().st_size // 1024} KB)")
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"ERR {dest}: {exc}")
        return False


def gallery_url(item: dict) -> str:
    path = item.get("asset_path")
    if not path:
        return item["preview_url"]
    return f"{BASE}/cdn-cgi/image/width=1200,format=auto/assets/uploads/{urllib.parse.quote(path, safe='/')}"


def main() -> None:
    ok = 0
    for rel, path in PRIORITY:
        url = BASE + path
        if download(url, OUT / rel):
            ok += 1

    # Video hero
    video_url = f"{BASE}/assets/uploads/video/provv/Sina-Villa-Matilde-v2_v2.mp4"
    if download(video_url, OUT / "hero/hero.mp4"):
        ok += 1

    # Gallery subset
    gallery_dir = OUT / "gallery"
    gallery_dir.mkdir(parents=True, exist_ok=True)
    if GALLERY.exists():
        items = json.loads(GALLERY.read_text(encoding="utf-8"))
        for i, item in enumerate(items[:16]):
            safe = re.sub(r"[^\w\-]+", "-", item.get("category", "img")).strip("-").lower()
            ext = Path(item.get("asset_path", "img.jpg")).suffix or ".jpg"
            dest = gallery_dir / f"{i+1:02d}-{safe}{ext}"
            if download(gallery_url(item), dest):
                ok += 1

    print(f"\nDownloaded {ok} files to {OUT}")


if __name__ == "__main__":
    main()
