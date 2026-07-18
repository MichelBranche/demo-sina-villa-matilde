#!/usr/bin/env python3
"""Generate human-readable inventory report from crawl data."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INV_PATH = ROOT / "inventory" / "inventory.json"
OUT_PATH = ROOT / "inventory" / "INVENTARIO.md"
IMG_CATALOG = ROOT / "inventory" / "images-catalog.json"

NOISE_PATTERNS = [
    r"^Viale Marconi",
    r"^Dorsoduro",
    r"^Fondamenta",
    r"^Via Hoepli",
    r"^Via San Raffaele",
    r"^Viale Mentana",
    r"^Viale Carducci",
    r"^Via Il Prato",
    r"^Piazza Italia",
    r"^Piazza Barberini",
    r"^Via Federico Serena",
    r"^T\.\s*\+39",
    r"^Miglior Prezzo Garantito",
    r"^La Tua Prenotazione$",
]


def is_noise(text: str) -> bool:
    t = text.strip()
    if len(t) < 30:
        return True
    for pat in NOISE_PATTERNS:
        if re.search(pat, t):
            return True
    return False


def normalize_image_url(url: str) -> str:
    url = url.replace("\\u0026", "&")
    # Fix malformed relative CDN paths captured from srcset
    m = re.search(r"(/assets/uploads/.+)$", url)
    if m:
        return "https://www.sinahotels.com" + m.group(1)
    if "/cdn-cgi/image/" in url:
        m2 = re.search(r"/cdn-cgi/image/[^/]+/(assets/uploads/.+)", url)
        if m2:
            return "https://www.sinahotels.com/" + m2.group(1)
    return url


def categorize_image(url: str) -> str:
    u = url.lower()
    if "/video/" in u:
        return "video"
    if "/assets/i/" in u:
        return "ui-branding"
    if "/assets/components/" in u:
        return "instagram-cache"
    if "/immagini-definitive/villa-matilde/gallery/" in u:
        return "gallery"
    if "/immagini-definitive/villa-matilde/matrimoni/" in u:
        return "matrimoni"
    if "/immagini-definitive/villa-matilde/home-hotel/" in u:
        return "home-hotel"
    if "/immagini-definitive/villa-matilde/" in u:
        return "villa-matilde"
    if "/immagini-definitive/location/" in u:
        return "location-canavese"
    if "/hotels/villa-matilde/camere/" in u or "/camere/" in u:
        return "camere"
    if "/hotels/villa-matilde/canavese/" in u:
        return "canavese-territorio"
    if "/hotels/villa-matilde/" in u:
        return "hotels-vma"
    if "/box/vma/" in u:
        return "box-highlights"
    if "/meeting/" in u:
        return "meeting"
    if "villamatilde" in u or "villa-matilde" in u or "villa_matilde" in u:
        return "villa-generale"
    if "/mappe" in u:
        return "mappe"
    return "altro"


def main() -> None:
    inv = json.loads(INV_PATH.read_text(encoding="utf-8"))

    # Normalize all image URLs
    catalog: dict[str, dict] = {}
    for img in inv["all_images"]:
        url = normalize_image_url(img["url"])
        if url not in catalog:
            catalog[url] = {
                "url": url,
                "alt": img.get("alt"),
                "category": categorize_image(url),
                "pages": sorted(set(img.get("pages", []))),
            }
        else:
            catalog[url]["pages"] = sorted(set(catalog[url]["pages"]) | set(img.get("pages", [])))
            if not catalog[url].get("alt") and img.get("alt"):
                catalog[url]["alt"] = img["alt"]

    images = sorted(catalog.values(), key=lambda x: (x["category"], x["url"]))
    IMG_CATALOG.write_text(json.dumps(images, ensure_ascii=False, indent=2), encoding="utf-8")

    by_cat: dict[str, list] = {}
    for img in images:
        by_cat.setdefault(img["category"], []).append(img)

    lines: list[str] = []
    lines.append("# Inventario completo — Sina Villa Matilde")
    lines.append("")
    lines.append("**Fonte:** [sinahotels.com — Villa Matilde](https://www.sinahotels.com/it/h/sina-villa-matilde-torino/)")
    lines.append(f"**Data estrazione:** {inv['crawled_at']}")
    lines.append(f"**Pagine analizzate:** {len(inv['pages'])} (tutte raggiungibili, HTTP 200)")
    lines.append(f"**Immagini uniche normalizzate:** {len(images)}")
    lines.append(f"**Video:** {len(inv['all_videos'])}")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 1. Riepilogo esecutivo")
    lines.append("")
    lines.append("| Metrica | Valore |")
    lines.append("|---|---|")
    lines.append(f"| Pagine IT mappate | {len(inv['pages'])} |")
    lines.append(f"| Immagini uniche | {len(images)} |")
    lines.append(f"| Video hero | 1 (`Sina-Villa-Matilde-v2.mp4`) |")
    lines.append("| Versione EN | `/en/h/sina-villa-matilde-turin/` |")
    lines.append("| Booking engine | Blastness (id albergo 207, stile 21160) |")
    lines.append("| Contatti | +39 012 5639290 · info@sinavillamatilde.it |")
    lines.append("| Indirizzo | Viale Marconi 29, 10090 Romano Canavese (TO) |")
    lines.append("| what3words | `///chain.scone.elector` |")
    lines.append("| Coordinate | 45.387453, 7.869775 |")
    lines.append("| Camere totali | 43 |")
    lines.append("| Fascia prezzo (schema.org) | 100€ – 200€ |")
    lines.append("| CIN | IT001223A1QNMUMEUD |")
    lines.append("")
    lines.append("### Social e link esterni")
    lines.append("- Facebook: https://www.facebook.com/relaisvillamatilde")
    lines.append("- Instagram: https://www.instagram.com/sinavillamatilde/")
    lines.append("- LinkedIn: https://www.linkedin.com/company/sinahotels/")
    lines.append("- Video YouTube: https://www.youtube.com/watch?v=QcKBlS7lSOQ")
    lines.append("- Google Maps: https://goo.gl/maps/4cK5owT1a3mQBofc7")
    lines.append("- Charging station: Porsche / Chargetrip")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 2. Mappa del sito (architettura informativa)")
    lines.append("")
    lines.append("```")
    lines.append("Sina Villa Matilde (IT)")
    lines.append("├── Home")
    lines.append("├── Camere & Suite")
    lines.append("│   ├── Classic")
    lines.append("│   ├── Superior")
    lines.append("│   ├── Deluxe")
    lines.append("│   ├── Premium Deluxe")
    lines.append("│   ├── Premium Deluxe with Balcony")
    lines.append("│   ├── Premium Deluxe with Terrace")
    lines.append("│   ├── Family Junior Suite")
    lines.append("│   ├── Two Floor Suite")
    lines.append("│   ├── Park View Heritage Suite with Balcony")
    lines.append("│   └── Park View Heritage Suite")
    lines.append("├── Dining (Le Scuderie)")
    lines.append("├── Dove Siamo & Contatti")
    lines.append("│   └── Alla scoperta del Canavese")
    lines.append("├── Offerte")
    lines.append("├── Gallery")
    lines.append("├── Video (esterno YouTube)")
    lines.append("├── Benessere (Sina Wellness Club)")
    lines.append("├── Meeting & Eventi")
    lines.append("│   ├── Il Parco")
    lines.append("│   ├── Sala Arduino")
    lines.append("│   ├── Sala Biblioteca")
    lines.append("│   └── Salone Reale")
    lines.append("├── Matrimoni")
    lines.append("├── Storia")
    lines.append("├── Esperienze nel Canavese")
    lines.append("├── Vivere Sina Villa Matilde")
    lines.append("└── Sostenibilità (certificazione DCA)")
    lines.append("```")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 3. Inventario pagine e contenuti")
    lines.append("")

    section_groups = {
        "Core": ["home"],
        "Camere & Suite": [
            "camere-e-suite",
            "classic",
            "superior",
            "deluxe",
            "premium-deluxe",
            "premium-deluxe-balcony",
            "premium-deluxe-terrace",
            "family-junior-suite",
            "two-floor-suite",
            "park-view-heritage-balcony",
            "park-view-heritage-suite",
        ],
        "Esperienze & Servizi": [
            "dining",
            "benessere",
            "matrimoni",
            "meeting-eventi",
            "il-parco",
            "sala-arduino",
            "sala-biblioteca",
            "salone-reale",
            "esperienze-canavese",
            "vivere-vma",
        ],
        "Territorio & Info": ["location", "romano-canavese", "storia", "offerte", "gallery", "sostenibilita"],
    }

    pages_by_slug = {p["slug"]: p for p in inv["pages"]}

    for group, slugs in section_groups.items():
        lines.append(f"### {group}")
        lines.append("")
        for slug in slugs:
            p = pages_by_slug[slug]
            meta = p.get("meta", {})
            lines.append(f"#### `{slug}`")
            lines.append(f"- **URL:** {p['url']}")
            lines.append(f"- **Title:** {meta.get('title', '—')}")
            lines.append(f"- **Meta description:** {meta.get('description', '—')}")
            if p.get("headings"):
                h_text = " · ".join(h["text"] for h in p["headings"][:8])
                lines.append(f"- **Heading principali:** {h_text}")
            content = [x for x in p.get("paragraphs", []) if not is_noise(x)]
            if content:
                lines.append("- **Testi chiave:**")
                for c in content[:6]:
                    lines.append(f"  - {c[:500]}{'…' if len(c) > 500 else ''}")
            lines.append(f"- **Immagini pagina:** {p.get('media_counts', {}).get('images', 0)}")
            lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 4. Contenuti testuali per sezione (sintesi)")
    lines.append("")

    summaries = {
        "home": (
            "Dimora storica della famiglia Bocca a Romano Canavese (XVIII sec.). "
            "Parco secolare, piscina, tennis, palestra, sauna, bagno turco. "
            "43 camere heritage. Location per matrimoni ed eventi."
        ),
        "camere-e-suite": "10 tipologie, 43 camere totali con arredi originali d'epoca.",
        "dining": "Ristorante Le Scuderie — enogastronomia piemontese, colazione e cena.",
        "benessere": "Sina Wellness Club: piscina outdoor, palestra, sauna, bagno turco, tennis.",
        "matrimoni": "Location: parco secolare, bordo piscina, Salone Reale, chiostro antico.",
        "meeting-eventi": "Sale raffinate + spazi esterni per team building.",
        "storia": "Residenza d'epoca piemontese — storia della villa e della famiglia Bocca.",
        "esperienze-canavese": "Esperienze territoriali: natura, storia, moda, sapori del Canavese.",
        "vivere-vma": "Esperienze in villa — tempo sospeso, fascino e calma.",
        "romano-canavese": "Guida al territorio: Ivrea, Forte di Bard, Gran Paradiso, castelli.",
        "sostenibilita": "Certificazione DCA — standard ambientali e qualità servizi.",
    }

    for slug, text in summaries.items():
        p = pages_by_slug.get(slug)
        if p:
            lines.append(f"- **{p['meta'].get('title', slug)}** — {text}")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 5. Inventario media")
    lines.append("")
    lines.append("### Video")
    lines.append("")
    for v in inv["all_videos"]:
        lines.append(f"- `{normalize_image_url(v['url'])}` — pagine: {', '.join(v.get('pages', []))}")
    lines.append("")
    lines.append("### Immagini per categoria")
    lines.append("")
    lines.append("| Categoria | N. immagini | Uso nel nuovo sito |")
    lines.append("|---|---:|---|")
    cat_usage = {
        "gallery": "Gallery fullscreen, lightbox",
        "home-hotel": "Hero, sezioni homepage",
        "villa-matilde": "Storytelling villa e outdoor",
        "matrimoni": "Sezione matrimoni",
        "camere": "Pagine camere",
        "hotels-vma": "Highlight e card",
        "box-highlights": "Card highlights homepage",
        "canavese-territorio": "Esperienze / territorio",
        "location-canavese": "Pagina Canavese",
        "meeting": "Meeting & eventi",
        "villa-generale": "Varie sezioni",
        "ui-branding": "Logo e icone (da ridisegnare)",
        "instagram-cache": "Feed social (rigenerare via API)",
        "mappe": "Mappa location",
        "altro": "Da verificare",
    }
    for cat in sorted(by_cat.keys()):
        lines.append(f"| `{cat}` | {len(by_cat[cat])} | {cat_usage.get(cat, '—')} |")

    lines.append("")
    for cat in sorted(by_cat.keys()):
        lines.append(f"### Categoria: `{cat}` ({len(by_cat[cat])} file)")
        lines.append("")
        for img in by_cat[cat]:
            alt = img.get("alt") or "—"
            pages = ", ".join(img.get("pages", [])) or "—"
            fname = img["url"].split("/")[-1]
            lines.append(f"- `{fname}` — *{alt}* — pagine: {pages}")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 6. Asset critici per il nuovo sito React")
    lines.append("")
    lines.append("### Priorità ALTA (hero e identità)")
    lines.append("- `villamatilde_facciata.jpg` — facciata villa")
    lines.append("- `Sina-Villa-Matilde-v2.mp4` — video hero homepage")
    lines.append("- `villamatilde_epigrafe.png` — logo VMA")
    lines.append("- `SinaVillaMatilde_Outdoor.jpg` — outdoor/parco")
    lines.append("- `VMA Swimming pool.jpg` — piscina")
    lines.append("- `Sina-Villa-Matilde-deluxe1.jpg` — interni camera")
    lines.append("")
    lines.append("### Priorità MEDIA (sezioni principali)")
    lines.append("- Suite: `Sina-Villa-Matilde-suite.jpg`")
    lines.append("- Dining: `Villa_Matilde_Restaurant.jpg`, `ristorante_lescuderie.jpg`")
    lines.append("- Benessere: `Villa_Matilde_Spa.jpg`, `Sina-Villamatilde-wellness5-benessere.jpg`")
    lines.append("- Matrimoni: cartella `Immagini-Definitive/Villa-Matilde/Matrimoni/` (8 img)")
    lines.append("- Meeting: `villamatilde_salone.jpg`, `villamatilde_library.jpg`")
    lines.append("- Territorio: cartella `hotels/villa-matilde/Canavese/` (6 img)")
    lines.append("")
    lines.append("### Priorità BASSA / da sostituire")
    lines.append("- `assets/components/phpthumbof/cache/*` — thumbnail Instagram (20 img, bassa qualità)")
    lines.append("- Icone SVG corporate Sina (`btn-menu`, frecce, ecc.)")
    lines.append("- Mappa statica `Sina_cartina_Torino.jpg` → sostituire con Google Maps / Mapbox")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 7. Integrazioni da preservare")
    lines.append("")
    lines.append("| Servizio | Dettaglio |")
    lines.append("|---|---|")
    lines.append("| **Booking** | `blastnessbooking.com` — id_albergo=207, id_stile=21160, dc=458 |")
    lines.append("| **Google Tag Manager** | GTM-P3JQ86F |")
    lines.append("| **Hotjar** | hjid 654912 |")
    lines.append("| **Newsletter** | `/it/fm/newsletter/` |")
    lines.append("| **Small Luxury Hotels** | Badge footer |")
    lines.append("| **what3words** | `chain.scone.elector` |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 8. Gap e raccomandazioni")
    lines.append("")
    lines.append("1. **ZIP fornito incompleto** — contiene solo homepage; le immagini CDN non sono incluse localmente.")
    lines.append("2. **Contenuti camere** — ogni tipologia ha ~7 img ma testi descrittivi da estrarre manualmente dal body HTML (il parser attuale include rumore dal booking widget).")
    lines.append("3. **Gallery** — 41 immagini nella pagina dedicata; fonte primaria per il nuovo sito.")
    lines.append("4. **Offerte** — contenuto dinamico; nel nuovo sito serve CMS o integrazione API Blastness.")
    lines.append("5. **Instagram feed** — attualmente embedded via cache locale; meglio usare API Instagram Graph.")
    lines.append("6. **Versione EN** — mirror da mappare in fase 2 (28 pagine equivalenti).")
    lines.append("7. **Scaricare asset originali** — consigliato download bulk da `/assets/uploads/` prima dello sviluppo.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 9. File generati")
    lines.append("")
    lines.append("- `inventory/inventory.json` — dump completo strutturato")
    lines.append("- `inventory/summary.json` — riepilogo numerico")
    lines.append("- `inventory/images-catalog.json` — catalogo immagini normalizzato")
    lines.append("- `inventory/INVENTARIO.md` — questo documento")
    lines.append("- `scripts/crawl_inventory.py` — script di crawling riutilizzabile")
    lines.append("- `scripts/extract_rooms_gallery.py` — estrazione camere e gallery")
    lines.append("")

    rooms_path = ROOT / "inventory" / "rooms-content.json"
    gallery_path = ROOT / "inventory" / "gallery-content.json"
    if rooms_path.exists():
        rooms = json.loads(rooms_path.read_text(encoding="utf-8"))
        lines.append("---")
        lines.append("")
        lines.append("## 10. Inventario camere (10 tipologie)")
        lines.append("")
        lines.append("| Tipologia | mq | ospiti max | Descrizione breve |")
        lines.append("|---|---:|---:|---|")
        for r in rooms:
            desc = r["descriptions"][0][:120] + "…" if r.get("descriptions") else "—"
            lines.append(
                f"| **{r['label']}** | {r['specs']['sqm']} | {r['specs']['max_guests']} | {desc} |"
            )
        if rooms and rooms[0].get("services"):
            lines.append("")
            lines.append("**Servizi comuni (tutte le camere):**")
            lines.append(f"> {rooms[0]['services']}")
        lines.append("")

    if gallery_path.exists():
        gallery = json.loads(gallery_path.read_text(encoding="utf-8"))
        by_gallery_cat: dict[str, list] = {}
        for g in gallery:
            by_gallery_cat.setdefault(g.get("category") or "—", []).append(g)
        lines.append("---")
        lines.append("")
        lines.append(f"## 11. Gallery ufficiale ({len(gallery)} immagini)")
        lines.append("")
        lines.append("| Categoria gallery | N. | Esempio asset |")
        lines.append("|---|---:|---|")
        for cat in sorted(by_gallery_cat.keys()):
            sample = by_gallery_cat[cat][0].get("asset_path", "—")
            lines.append(f"| {cat} | {len(by_gallery_cat[cat])} | `{sample}` |")
        lines.append("")
        lines.append("<details><summary>Elenco completo gallery</summary>")
        lines.append("")
        for g in gallery:
            lines.append(
                f"- **{g.get('category')}** — `{g.get('asset_path')}` — {g.get('alt') or '—'}"
            )
        lines.append("")
        lines.append("</details>")

    OUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    print(f"Wrote {IMG_CATALOG} ({len(images)} images)")


if __name__ == "__main__":
    main()
