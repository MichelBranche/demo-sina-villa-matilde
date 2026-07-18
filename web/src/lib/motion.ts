import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);

CustomEase.create("villa", "0.7, 0, 0.25, 1");
CustomEase.create("villa-out", "0.16, 1, 0.3, 1");

export const EASE = {
  villa: "villa",
  villaOut: "villa-out",
} as const;

export function splitChars(el: Element | null) {
  if (!el) return null;
  return SplitText.create(el, {
    type: "chars",
    charsClass: "split-char",
    mask: "chars",
    autoSplit: true,
  });
}

export function splitLines(el: Element | null) {
  if (!el) return null;
  return SplitText.create(el, {
    type: "lines",
    linesClass: "split-line",
    mask: "lines",
    autoSplit: true,
  });
}

export function splitWords(el: Element | null) {
  if (!el) return null;
  return SplitText.create(el, {
    type: "words",
    wordsClass: "split-word",
    mask: "words",
    autoSplit: true,
  });
}

/** Attach scrub parallax to all [data-parallax] images inside a root. */
export function initParallax(root: ParentNode | Document = document) {
  const triggers: ScrollTrigger[] = [];

  root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
    const amount = Number(el.dataset.parallax) || 8;
    gsap.set(el, { scale: 1.12, transformOrigin: "center center" });

    const tween = gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  return () => {
    triggers.forEach((t) => t.kill());
  };
}

type MagneticOptions = {
  strength?: number;
  disabled?: boolean;
};

/** Pull an element toward the cursor within max strength (px). */
export function useMagnetic<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { strength = 8, disabled = false }: MagneticOptions = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      gsap.to(el, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.45,
        ease: EASE.villaOut,
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [ref, strength, disabled]);
}

/** Dispatch / listen for the intro reveal handoff. */
export const INTRO_REVEAL_EVENT = "villa:intro-reveal";

/** In-memory only: survives SPA navigation, resets on full/hard refresh. */
let introSeenInSpaSession = false;

let introRevealed = false;

export function hasIntroSeen(): boolean {
  return introSeenInSpaSession;
}

export function markIntroSeen() {
  introSeenInSpaSession = true;
}

export function emitIntroReveal() {
  introRevealed = true;
  window.dispatchEvent(new CustomEvent(INTRO_REVEAL_EVENT));
}

/**
 * Subscribe to the intro reveal. If it already happened (late mount, HMR),
 * the callback fires immediately so nothing stays stuck hidden.
 */
export function onIntroReveal(cb: () => void) {
  if (introRevealed) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(INTRO_REVEAL_EVENT, handler, { once: true });
  return () => window.removeEventListener(INTRO_REVEAL_EVENT, handler);
}

export function hasIntroRevealed() {
  return introRevealed;
}
