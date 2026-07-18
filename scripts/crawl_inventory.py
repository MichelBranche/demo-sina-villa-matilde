#!/usr/bin/env python3
"""Crawl Sina Villa Matilde pages and build content/image inventory."""

import json
import re
import time
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path

BASE = "https://www.sinahotels.com/it/h/sina-villa-matilde-torino"
PAGES = [
    ("home", ""),
    ("camere-e-suite", "camere-e-suite/"),
    ("classic", "camere-e-suite/classic.html"),
    ("superior", "camere-e-suite/superior.html"),
    ("deluxe", "camere-e-suite/deluxe.html"),
    ("premium-deluxe", "camere-e-suite/premium-deluxe.html"),
    ("premium-deluxe-balcony", "camere-e-suite/premium-deluxe-with-balcony.html"),
    ("premium-deluxe-terrace", "camere-e-suite/premium-deluxe-with-terrace.html"),
    ("family-junior-suite", "camere-e-suite/family-junior-suite.html"),
    ("two-floor-suite", "camere-e-suite/two-floor-suite.html"),
    ("park-view-heritage-balcony", "camere-e-suite/park-view-heritage-suite-with-balcony.html"),
    ("park-view-heritage-suite", "camere-e-suite/suite-torino.html"),
    ("dining", "ristorante-le-scuderie.html"),
    ("location", "location.html"),
    ("romano-canavese", "location/romano-canavese.html"),
    ("offerte", "offerte-hotel-torino/"),
    ("gallery", "gallery.html"),
    ("benessere", "hotel-con-spa-piemonte.html"),
    ("meeting-eventi", "meeting-e-eventi/"),
    ("il-parco", "meeting-e-eventi/il-parco.html"),
    ("sala-arduino", "meeting-e-eventi/sala-riunioni-arduino.html"),
    ("sala-biblioteca", "meeting-e-eventi/biblioteca.html"),
    ("salone-reale", "meeting-e-eventi/salone-reale.html"),
    ("matrimoni", "location-matrimoni-piemonte/"),
    ("storia", "residenza-d-epoca-piemonte.html"),
    ("esperienze-canavese", "esperienze-canavese.html"),
    ("vivere-vma", "vivere-sina-villa-matilde.html"),
    ("sostenibilita", "sostenibilit%C3%A0.html"),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; VillaMatildeInventory/1.0)",
    "Accept-Language": "it-IT,it;q=0.9",
}


def fetch(url: str) -> tuple[str | None, int | None, str | None]:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = resp.read()
            charset = "utf-8"
            content_type = resp.headers.get_content_charset()
            if content_type:
                charset = content_type
            return raw.decode(charset, errors="replace"), resp.status, None
    except Exception as exc:  # noqa: BLE001
        return None, None, str(exc)


def strip_tags(html: str) -> str:
    text = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def first_match(pattern: str, html: str, flags=re.I | re.S) -> str | None:
    m = re.search(pattern, html, flags)
    return unescape(m.group(1).strip()) if m else None


def extract_meta(html: str) -> dict:
    return {
        "title": first_match(r"<title>(.*?)</title>", html),
        "description": first_match(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']', html)
        or first_match(r'<meta[^>]+content=["\'](.*?)["\'][^>]+name=["\']description["\']', html),
        "canonical": first_match(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\'](.*?)["\']', html),
        "og_image": first_match(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\'](.*?)["\']', html),
    }


def extract_headings(html: str) -> list[dict]:
    headings = []
    for level in range(1, 4):
        for m in re.finditer(rf"<h{level}[^>]*>(.*?)</h{level}>", html, re.I | re.S):
            text = strip_tags(m.group(1))
            if text and len(text) > 1:
                headings.append({"level": level, "text": text})
    return headings


def extract_paragraphs(html: str, limit: int = 30) -> list[str]:
    paras = []
    for m in re.finditer(r"<p[^>]*>(.*?)</p>", html, re.I | re.S):
        text = strip_tags(m.group(1))
        if len(text) > 25 and text not in paras:
            paras.append(text)
        if len(paras) >= limit:
            break
    return paras


def normalize_asset_url(url: str, page_url: str) -> str:
    url = unescape(url.strip())
    if not url or url.startswith("data:"):
        return ""
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("/"):
        return "https://www.sinahotels.com" + url
    if url.startswith("http"):
        return url
    return urllib.parse.urljoin(page_url, url)


def decode_cdn_path(url: str) -> str:
    """Extract original asset path from Cloudflare image URLs."""
    if "/cdn-cgi/image/" in url:
        m = re.search(r"/cdn-cgi/image/[^/]+/(assets/uploads/[^?\s\"']+)", url)
        if m:
            return "https://www.sinahotels.com/" + urllib.parse.unquote(m.group(1))
    return url


def extract_media(html: str, page_url: str) -> dict:
    images: dict[str, dict] = {}
    videos: dict[str, dict] = {}

    patterns = [
        r'<img[^>]+src=["\']([^"\']+)["\']',
        r'<img[^>]+srcset=["\']([^"\']+)["\']',
        r'<source[^>]+src=["\']([^"\']+)["\']',
        r'<source[^>]+srcset=["\']([^"\']+)["\']',
        r'<video[^>]+poster=["\']([^"\']+)["\']',
    ]

    for pattern in patterns:
        for m in re.finditer(pattern, html, re.I):
            raw = m.group(1)
            for part in re.split(r",\s*", raw):
                token = part.strip().split()[0] if part.strip() else ""
                if not token:
                    continue
                full = normalize_asset_url(token, page_url)
                if not full:
                    continue
                original = decode_cdn_path(full)
                key = original.lower()
                if any(ext in key for ext in [".mp4", ".webm", ".mov"]):
                    videos.setdefault(original, {"url": original, "pages": set()})
                elif any(ext in key for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]):
                    alt_m = re.search(
                        rf'{re.escape(token)}[^>]*>|<img[^>]+src=["\']{re.escape(token)}["\'][^>]*alt=["\']([^"\']*)["\']',
                        html,
                        re.I,
                    )
                    alt = None
                    img_tag = re.search(
                        rf'<img[^>]+(?:src|srcset)=["\'][^"\']*{re.escape(token.split("/")[-1])}[^"\']*["\'][^>]*>',
                        html,
                        re.I,
                    )
                    if img_tag:
                        alt_match = re.search(r'alt=["\']([^"\']*)["\']', img_tag.group(0), re.I)
                        alt = alt_match.group(1) if alt_match else None
                    images.setdefault(
                        original,
                        {"url": original, "cdn_url": full if full != original else None, "alt": alt, "pages": set()},
                    )

    return {
        "images": [
            {**v, "pages": sorted(v["pages"])} for v in sorted(images.values(), key=lambda x: x["url"])
        ],
        "videos": [
            {**v, "pages": sorted(v["pages"])} for v in sorted(videos.values(), key=lambda x: x["url"])
        ],
    }


def extract_links(html: str) -> list[str]:
    links = set()
    for m in re.finditer(r'<a[^>]+href=["\']([^"\']+)["\']', html, re.I):
        href = unescape(m.group(1))
        if "sina-villa-matilde" in href:
            links.add(href)
    return sorted(links)


def extract_schema(html: str) -> dict | None:
    m = re.search(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.I | re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return None


def main() -> None:
    out_dir = Path(__file__).resolve().parents[1] / "inventory"
    out_dir.mkdir(parents=True, exist_ok=True)

    inventory = {
        "source": BASE,
        "crawled_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "pages": [],
        "all_images": {},
        "all_videos": {},
        "errors": [],
    }

    for slug, path in PAGES:
        url = f"{BASE}/{path}" if path else f"{BASE}/"
        html, status, err = fetch(url)
        page_entry = {
            "slug": slug,
            "url": url,
            "status": status,
            "error": err,
            "meta": {},
            "headings": [],
            "paragraphs": [],
            "links_internal": [],
            "schema": None,
            "media_counts": {"images": 0, "videos": 0},
        }

        if html:
            page_entry["meta"] = extract_meta(html)
            page_entry["headings"] = extract_headings(html)
            page_entry["paragraphs"] = extract_paragraphs(html)
            page_entry["links_internal"] = extract_links(html)
            page_entry["schema"] = extract_schema(html)
            media = extract_media(html, url)
            page_entry["images"] = media["images"]
            page_entry["videos"] = media["videos"]
            page_entry["media_counts"] = {
                "images": len(media["images"]),
                "videos": len(media["videos"]),
            }

            for img in media["images"]:
                key = img["url"]
                if key not in inventory["all_images"]:
                    inventory["all_images"][key] = {**img, "pages": []}
                inventory["all_images"][key]["pages"].append(slug)
                if not inventory["all_images"][key].get("alt") and img.get("alt"):
                    inventory["all_images"][key]["alt"] = img["alt"]

            for vid in media["videos"]:
                key = vid["url"]
                if key not in inventory["all_videos"]:
                    inventory["all_videos"][key] = {**vid, "pages": []}
                inventory["all_videos"][key]["pages"].append(slug)
        else:
            inventory["errors"].append({"slug": slug, "url": url, "error": err})

        inventory["pages"].append(page_entry)
        print(f"{slug}: {status or 'ERR'}")
        time.sleep(0.4)

    inventory["all_images"] = sorted(
        [{**v, "pages": sorted(set(v["pages"]))} for v in inventory["all_images"].values()],
        key=lambda x: x["url"],
    )
    inventory["all_videos"] = sorted(
        [{**v, "pages": sorted(set(v["pages"]))} for v in inventory["all_videos"].values()],
        key=lambda x: x["url"],
    )

    summary = {
        "total_pages": len(PAGES),
        "successful_pages": sum(1 for p in inventory["pages"] if p.get("status") == 200),
        "failed_pages": sum(1 for p in inventory["pages"] if p.get("status") != 200),
        "unique_images": len(inventory["all_images"]),
        "unique_videos": len(inventory["all_videos"]),
        "pages": [
            {
                "slug": p["slug"],
                "url": p["url"],
                "title": p.get("meta", {}).get("title"),
                "status": p.get("status"),
                "headings_count": len(p.get("headings", [])),
                "paragraphs_count": len(p.get("paragraphs", [])),
                "images_count": p.get("media_counts", {}).get("images", 0),
            }
            for p in inventory["pages"]
        ],
    }

    (out_dir / "inventory.json").write_text(
        json.dumps(inventory, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (out_dir / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nSaved to {out_dir}")


if __name__ == "__main__":
    main()
