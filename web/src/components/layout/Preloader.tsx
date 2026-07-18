import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useContent } from "../../i18n/useContent";
import { EASE, emitIntroReveal } from "../../lib/motion";

gsap.registerPlugin(SplitText);

type PreloaderProps = {
  onComplete: () => void;
};

export function Preloader({ onComplete }: PreloaderProps) {
  const [done, setDone] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const { hero, preloader } = useContent();

  // Run exactly once: restarting the intro mid-flight was the source of
  // the stuck preloader (callbacks identity changed on parent re-render).
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      emitIntroReveal();
      onCompleteRef.current();
      setDone(true);
      return;
    }

    const wrap = wrapRef.current;
    const countEl = countRef.current;
    const brandEl = brandRef.current;
    if (!wrap || !countEl || !brandEl) return;

    let killed = false;
    let split: SplitText | null = null;
    let burstTl: gsap.core.Timeline | null = null;
    let delayed: gsap.core.Tween | null = null;

    const finish = () => {
      if (killed) return;
      setDone(true);
      onCompleteRef.current();
    };

    const startBurst = () => {
      if (killed) return;

      split = SplitText.create(brandEl, {
        type: "chars",
        charsClass: "intro-char",
        mask: "chars",
      });

      burstTl = gsap.timeline({ onComplete: finish });

      burstTl.to(
        [".intro-count", ".intro-sina", ".intro-bar-track"],
        { opacity: 0, y: -12, duration: 0.45, ease: EASE.villaOut, stagger: 0.04 },
        0,
      );

      gsap.set(brandEl, { opacity: 1 });
      gsap.set(split.chars, { yPercent: 120, rotateX: -40, opacity: 0 });
      burstTl.to(
        split.chars,
        {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1.05,
          stagger: 0.035,
          ease: EASE.villa,
        },
        0.15,
      );

      burstTl.to({}, { duration: 0.35 });

      burstTl.add(() => emitIntroReveal());

      burstTl.to(
        wrap,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: 1.15,
          ease: EASE.villa,
        },
        "-=0.15",
      );

      burstTl.to(
        split.chars,
        {
          yPercent: -30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.02,
          ease: EASE.villaOut,
        },
        "-=1.0",
      );
    };

    gsap.set([".intro-sina", ".intro-count"], { opacity: 0, y: 16, filter: "blur(8px)" });
    gsap.set(brandEl, { opacity: 0 });
    gsap.set(".intro-bar", { scaleX: 0 });

    const introIn = gsap.timeline();
    introIn
      .to(".intro-sina", {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        ease: EASE.villaOut,
      })
      .to(
        ".intro-count",
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: EASE.villaOut },
        0.15,
      );

    const loadStart = performance.now();
    const MAX_MS = 2200;

    const tickProgress = () => {
      if (killed) return;
      const elapsed = performance.now() - loadStart;
      const t = Math.min(1, elapsed / MAX_MS);
      const eased = 1 - Math.pow(1 - t, 2.4);
      countEl.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      gsap.set(".intro-bar", { scaleX: eased });

      if (t < 1) {
        requestAnimationFrame(tickProgress);
      } else {
        delayed = gsap.delayedCall(0.15, startBurst);
      }
    };

    requestAnimationFrame(tickProgress);

    return () => {
      killed = true;
      introIn.kill();
      burstTl?.kill();
      delayed?.kill();
      split?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <div
      ref={wrapRef}
      className="preloader-wrap fixed inset-0 z-[20000] flex flex-col bg-cream"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      aria-hidden
    >
      <div className="relative flex flex-1 flex-col items-center justify-center section-px">
        <p className="intro-sina font-sans text-body-30 uppercase tracking-[0.35em] text-dark/55">
          {hero.chain}
          <sup className="ml-0.5 text-[0.7em] tracking-normal">®</sup>
        </p>

        <h2
          ref={brandRef}
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-noe-text text-hero-brand uppercase text-dark"
          style={{ perspective: "600px", opacity: 0 }}
        >
          {hero.brand}
        </h2>
      </div>

      <div className="section-px flex items-end justify-between pb-8 lg:pb-10">
        <span
          ref={countRef}
          className="intro-count font-noe-text text-[clamp(2.5rem,6vw,5rem)] leading-none tabular-nums text-dark"
        >
          000
        </span>
        <span className="intro-count font-sans text-body-30 uppercase text-dark/50">
          {preloader.loading}
        </span>
      </div>

      <div className="intro-bar-track h-px w-full bg-line">
        <div className="intro-bar h-full w-full origin-left bg-dark" />
      </div>
    </div>
  );
}
