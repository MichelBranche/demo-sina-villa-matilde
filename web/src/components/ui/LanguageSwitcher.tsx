import { useEffect, useRef, useState, type ReactElement } from "react";
import gsap from "gsap";
import { LOCALE_META, LOCALES, useLocale, type Locale } from "../../i18n/locale";
import { EASE } from "../../lib/motion";

type LanguageSwitcherProps = {
  toneClass: string;
  className?: string;
  /** Popup opens upward (useful near bottom of mobile menu) */
  placement?: "bottom" | "top";
  /** Border/popup colors for dark surfaces */
  variant?: "default" | "onDark";
};

const FLAGS: Record<Locale, () => ReactElement> = {
  it: FlagIT,
  en: FlagEN,
  fr: FlagFR,
  de: FlagDE,
  es: FlagES,
  ru: FlagRU,
  zh: FlagZH,
};

function FlagIT() {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="none" className="size-full" aria-hidden>
      <rect width="8" height="16" fill="#009246" />
      <rect x="8" width="8" height="16" fill="#fff" />
      <rect x="16" width="8" height="16" fill="#ce2b37" />
    </svg>
  );
}

function FlagEN() {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="none" className="size-full" aria-hidden>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="2.6" />
    </svg>
  );
}

function FlagFR() {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="none" className="size-full" aria-hidden>
      <rect width="8" height="16" fill="#002395" />
      <rect x="8" width="8" height="16" fill="#fff" />
      <rect x="16" width="8" height="16" fill="#ED2939" />
    </svg>
  );
}

function FlagDE() {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="none" className="size-full" aria-hidden>
      <rect width="24" height="5.33" fill="#000" />
      <rect y="5.33" width="24" height="5.34" fill="#D00" />
      <rect y="10.67" width="24" height="5.33" fill="#FFCE00" />
    </svg>
  );
}

function FlagES() {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="none" className="size-full" aria-hidden>
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </svg>
  );
}

function FlagRU() {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="none" className="size-full" aria-hidden>
      <rect width="24" height="5.33" fill="#fff" />
      <rect y="5.33" width="24" height="5.34" fill="#0039A6" />
      <rect y="10.67" width="24" height="5.33" fill="#D52B1E" />
    </svg>
  );
}

function FlagZH() {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="none" className="size-full" aria-hidden>
      <rect width="24" height="16" fill="#DE2910" />
      <polygon
        fill="#FFDE00"
        points="4.2,2.2 4.9,4.4 7.2,4.4 5.4,5.7 6,7.9 4.2,6.6 2.4,7.9 3,5.7 1.2,4.4 3.5,4.4"
      />
    </svg>
  );
}

export function LanguageSwitcher({
  toneClass,
  className = "",
  placement = "bottom",
  variant = "default",
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const ActiveFlag = FLAGS[locale];
  const onDark = variant === "onDark";

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const pop = popRef.current;
    if (!open || !pop) return;

    const origin = placement === "top" ? "90% 100%" : "90% 0%";

    gsap.fromTo(
      pop,
      { opacity: 0, y: placement === "top" ? 8 : -8, scale: 0.86, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.42,
        ease: EASE.villaOut,
        transformOrigin: origin,
      },
    );

    gsap.fromTo(
      pop.querySelectorAll("[data-lang-option]"),
      { opacity: 0, y: placement === "top" ? -8 : 8, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.32,
        stagger: 0.04,
        delay: 0.06,
        ease: EASE.villaOut,
      },
    );
  }, [open, placement]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        className={`nav-intro ${toneClass} relative h-10 w-14 shrink-0 overflow-hidden rounded-full border-2 border-current transition-[border-color,transform] duration-500`}
        aria-label={t.nav.language}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="absolute inset-0">
          <ActiveFlag />
        </span>
        <span className="sr-only">{LOCALE_META[locale].label}</span>
      </button>

      {open && (
        <div
          ref={popRef}
          role="listbox"
          aria-label={t.nav.language}
          className={`absolute right-0 z-[60] will-change-transform ${
            placement === "top"
              ? "bottom-[calc(100%+0.75rem)]"
              : "top-[calc(100%+0.75rem)]"
          }`}
        >
          <div
            className={`relative max-h-[min(50vh,22rem)] overflow-y-auto rounded-[1.35rem] px-3 py-3 shadow-[0_20px_50px_rgba(51,25,23,0.18)] [scrollbar-width:thin] ${
              onDark
                ? "border-2 border-blush/25 bg-cream"
                : "border-2 border-dark/15 bg-cream"
            }`}
          >
            <span
              aria-hidden
              className={`absolute right-5 size-3.5 rotate-45 bg-cream ${
                placement === "top"
                  ? "-bottom-2 border-b-2 border-r-2"
                  : "-top-2 border-l-2 border-t-2"
              } ${onDark ? "border-blush/25" : "border-dark/15"}`}
            />
            <ul className="relative flex flex-col gap-1.5">
              {LOCALES.map((code) => {
                const selected = code === locale;
                const Flag = FLAGS[code];
                return (
                  <li key={code} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      data-lang-option
                      className={`group flex w-full items-center gap-3 rounded-full p-1 pr-3 text-left transition-colors ${
                        selected ? "bg-dark/5" : "hover:bg-dark/[0.04]"
                      }`}
                      onClick={() => {
                        setLocale(code);
                        setOpen(false);
                      }}
                    >
                      <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded-full border-2 border-dark/20">
                        <span className="absolute inset-0">
                          <Flag />
                        </span>
                      </span>
                      <span className="font-sans text-body-30 uppercase tracking-[0.08em] text-dark">
                        {LOCALE_META[code].label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
