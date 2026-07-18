import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BOOKING_URL } from "../../data/site";
import { useLocale } from "../../i18n/locale";
import { EASE, onIntroReveal, useMagnetic } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { usePageTransition } from "./PageTransition";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type NavTone = "dark" | "light";
type LenisLike = { stop: () => void; start: () => void };

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

function getLenis(): LenisLike | undefined {
  return (window as Window & { __lenis?: LenisLike }).__lenis;
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<NavTone>("dark");
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelInnerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const introPlayed = useRef(false);
  const { transitionTo } = usePageTransition();
  const { t, locale } = useLocale();

  useMagnetic(ctaRef, { strength: 8, disabled: reducedMotion });

  const go = (href: string) => {
    const navigate = () => transitionTo(href);
    if (!open) {
      navigate();
      return;
    }
    setOpen(false);
    // Let close animation breathe, then navigate
    window.setTimeout(navigate, reducedMotion ? 0 : 420);
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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

  useGSAP(
    () => {
      const panel = panelRef.current;
      const inner = panelInnerRef.current;
      if (!panel || !inner) return;

      const links = gsap.utils.toArray<HTMLElement>(".mobile-menu-link", inner);
      const metas = gsap.utils.toArray<HTMLElement>(".mobile-menu-meta", inner);

      gsap.set(panel, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(inner, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(links, { yPercent: 110, opacity: 0 });
      gsap.set(metas, { y: 16, opacity: 0 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: EASE.villa },
      });

      tl.to(panel, { autoAlpha: 1, duration: 0.01 }, 0)
        .set(panel, { pointerEvents: "auto" }, 0)
        .to(
          inner,
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, ease: EASE.villa },
          0,
        )
        .to(
          links,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.07,
            ease: EASE.villaOut,
          },
          0.28,
        )
        .to(
          metas,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.06,
            ease: EASE.villaOut,
          },
          0.45,
        );

      tlRef.current = tl;

      return () => {
        tl.kill();
        tlRef.current = null;
      };
    },
    { dependencies: [locale] },
  );

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;

    if (reducedMotion) {
      if (open) {
        tl.progress(1);
        gsap.set(panelRef.current, { autoAlpha: 1, pointerEvents: "auto" });
      } else {
        tl.progress(0);
        gsap.set(panelRef.current, { autoAlpha: 0, pointerEvents: "none" });
      }
      return;
    }

    if (open) tl.play();
    else tl.reverse();
  }, [open, reducedMotion, locale]);

  // Close overlay if viewport grows to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const linkTone = tone === "dark" ? "text-dark" : "text-cream";
  const burgerTone = open ? "text-blush" : linkTone;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="section-px relative z-20">
        <div className="flex items-center justify-between py-4 sm:py-5 lg:py-6">
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
              aria-controls="mobile-menu"
              className={`nav-intro ${burgerTone} relative flex h-11 w-11 flex-col items-center justify-center transition-colors duration-500 lg:hidden`}
              onClick={() => setOpen((v) => !v)}
            >
              <span
                className={`absolute h-px w-6 origin-center bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  open ? "translate-y-0 rotate-45" : "-translate-y-[5px]"
                }`}
              />
              <span
                className={`absolute h-px w-6 bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute h-px w-6 origin-center bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  open ? "translate-y-0 -rotate-45" : "translate-y-[5px]"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen mobile menu — always mounted for enter/exit GSAP */}
      <div
        ref={panelRef}
        id="mobile-menu"
        className="pointer-events-none fixed inset-0 z-10 lg:hidden"
        aria-hidden={!open}
      >
        <div
          ref={panelInnerRef}
          className="theme-primary absolute inset-0 flex h-dvh flex-col"
        >
          <div className="section-px flex min-h-0 flex-1 flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,env(safe-area-inset-top))]">
            <p className="mobile-menu-meta font-sans text-[0.7rem] uppercase tracking-[0.28em] text-blush/50">
              Sina
              <sup className="ml-0.5 text-[0.65em] tracking-normal">®</sup>
              <span className="mx-2 text-blush/30">·</span>
              Villa Matilde
            </p>

            <nav className="flex flex-1 flex-col justify-center gap-1 py-8">
              {NAV_HREFS.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="mobile-menu-link group flex items-baseline gap-4 border-b border-blush/15 py-4 last:border-b-0"
                  onClick={(e) => {
                    e.preventDefault();
                    go(link.href);
                  }}
                >
                  <span className="w-6 shrink-0 font-sans text-[0.7rem] tabular-nums text-blush/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="overflow-hidden">
                    <span className="block font-noe-text text-[clamp(2rem,9vw,3.25rem)] uppercase leading-[0.95] tracking-[-0.03em] text-blush transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-active:translate-x-2">
                      {t.nav[link.key]}
                    </span>
                  </span>
                </a>
              ))}
            </nav>

            <div className="mobile-menu-meta flex items-end justify-between gap-4 border-t border-blush/15 pt-6">
              <div className="flex flex-col gap-3">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-blush/45">
                  {t.nav.language}
                </span>
                <LanguageSwitcher
                  toneClass="text-blush"
                  placement="top"
                  variant="onDark"
                />
              </div>

              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border-2 border-blush px-5 py-2.5 font-sans text-body-30 uppercase leading-none text-blush transition-colors duration-300 active:bg-blush active:text-dark"
                onClick={() => setOpen(false)}
              >
                {t.nav.book}
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
