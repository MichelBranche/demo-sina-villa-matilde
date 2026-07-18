import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BOOKING_URL } from "../../data/site";
import { useLocale } from "../../i18n/locale";
import { EASE, onIntroReveal, useMagnetic } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { usePageTransition } from "./PageTransition";

gsap.registerPlugin(ScrollTrigger);

type NavTone = "dark" | "light";

const PROBE_Y = 56;

const NAV_HREFS = [
  { key: "villa" as const, href: "/#about" },
  { key: "spaces" as const, href: "/#spazi" },
  { key: "living" as const, href: "/#vivere" },
  { key: "contact" as const, href: "/#contatti" },
];

function readNavTone(): NavTone {
  const zones = document.querySelectorAll<HTMLElement>("[data-nav-tone]");
  let best: HTMLElement | null = null;
  let bestArea = Number.POSITIVE_INFINITY;

  for (const zone of zones) {
    const rect = zone.getBoundingClientRect();
    if (rect.top <= PROBE_Y && rect.bottom > PROBE_Y) {
      const area = rect.width * rect.height;
      if (area < bestArea) {
        bestArea = area;
        best = zone;
      }
    }
  }

  return best?.dataset.navTone === "light" ? "light" : "dark";
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<NavTone>("dark");
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const introPlayed = useRef(false);
  const { transitionTo } = usePageTransition();
  const { t } = useLocale();

  useMagnetic(ctaRef, { strength: 8, disabled: reducedMotion });

  const go = (href: string) => {
    setOpen(false);
    transitionTo(href);
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const update = () => {
      const next = readNavTone();
      setTone((prev) => (prev === next ? prev : next));
    };

    const raf = requestAnimationFrame(update);
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: update,
      onRefresh: update,
    });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(raf);
      st.kill();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || introPlayed.current) {
      gsap.set(".nav-intro", { y: 0, opacity: 1 });
      return;
    }

    gsap.set(".nav-intro", { y: -16, opacity: 0 });

    return onIntroReveal(() => {
      if (introPlayed.current) return;
      introPlayed.current = true;
      gsap.to(".nav-intro", {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.05,
        ease: EASE.villaOut,
      });
    });
  }, [reducedMotion]);

  const linkTone = tone === "dark" ? "text-dark" : "text-cream";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="section-px">
        <div className="flex items-center justify-between py-5 lg:py-6">
          <nav className="pointer-events-auto hidden items-center gap-8 lg:flex">
            {NAV_HREFS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`nav-intro ${linkTone} link-underline font-sans text-body-30 uppercase leading-none transition-colors duration-500`}
                onClick={(e) => {
                  e.preventDefault();
                  go(link.href);
                }}
              >
                {t.nav[link.key]}
              </a>
            ))}
          </nav>

          <div className="pointer-events-auto ml-auto flex items-center gap-3 lg:gap-4">
            <LanguageSwitcher
              toneClass={linkTone}
              className="hidden lg:block"
            />

            <a
              ref={ctaRef}
              href="/#contatti"
              className={`nav-intro ${linkTone} hidden items-center gap-3 rounded-full border-2 border-current px-5 py-2.5 font-sans text-body-30 uppercase leading-none transition-colors duration-500 lg:inline-flex`}
              onClick={(e) => {
                e.preventDefault();
                go("/#contatti");
              }}
            >
              {t.nav.contactCta}
              <span aria-hidden>→</span>
            </a>

            <button
              type="button"
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={open}
              className={`nav-intro ${linkTone} flex h-10 w-10 flex-col items-center justify-center gap-1.5 transition-colors duration-500 lg:hidden`}
              onClick={() => setOpen((v) => !v)}
            >
              <span
                className={`h-px w-6 bg-current transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
              />
              <span
                className={`h-px w-6 bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-px w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav className="pointer-events-auto fixed inset-0 -z-10 flex flex-col justify-center bg-cream px-8 lg:hidden">
          <div className="flex flex-col gap-6">
            {NAV_HREFS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-noe-text text-title-20 uppercase text-dark"
                onClick={(e) => {
                  e.preventDefault();
                  go(link.href);
                }}
              >
                {t.nav[link.key]}
              </a>
            ))}
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 font-sans text-body-30 uppercase text-accent"
              onClick={() => setOpen(false)}
            >
              {t.nav.book} →
            </a>
            <div className="mt-6">
              <LanguageSwitcher toneClass="text-dark" />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
