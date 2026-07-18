import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useContent } from "../../i18n/useContent";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { EASE, hasIntroSeen, onIntroReveal, splitChars, splitWords } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const content = useContent();
  const { hero } = content;
  // Capture once: if the session already saw the preloader, skip hero entrance on remount
  const skipEntrance = useRef(hasIntroSeen());

  useGSAP(
    () => {
      if (reducedMotion || !sectionRef.current) return;

      const brandEl = sectionRef.current.querySelector(".hero-brand-line");
      const charSplit = splitChars(brandEl);
      const tagSplits = gsap.utils
        .toArray<HTMLElement>(".hero-tag")
        .map((el) => splitWords(el))
        .filter((s): s is SplitText => Boolean(s));

      // Initial hidden states
      gsap.set(".hero-chain", { y: 20, opacity: 0 });
      gsap.set(".hero-meta", { y: 12, opacity: 0 });
      if (charSplit) gsap.set(charSplit.chars, { yPercent: 120, rotateX: -35, opacity: 0 });
      tagSplits.forEach((s) => gsap.set(s.words, { yPercent: 100, opacity: 0 }));
      gsap.set(".hero-media-reveal", { clipPath: "inset(15% 20% 15% 20%)" });
      gsap.set(".hero-media-inner", { scale: 1.12 });

      // Intro timeline, built once and played on reveal
      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.villa } });

      tl.to(".hero-chain", { y: 0, opacity: 1, duration: 0.7, ease: EASE.villaOut }, 0);

      if (charSplit) {
        tl.to(
          charSplit.chars,
          {
            yPercent: 0,
            rotateX: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.03,
          },
          0.05,
        );
      }

      tagSplits.forEach((s, i) => {
        tl.to(
          s.words,
          { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: EASE.villaOut },
          0.35 + i * 0.08,
        );
      });

      tl.to(
        ".hero-media-reveal",
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.45 },
        0.25,
      ).to(".hero-media-inner", { scale: 1, duration: 1.45 }, 0.25);

      tl.to(
        ".hero-meta",
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: EASE.villaOut },
        0.85,
      );

      const off = onIntroReveal(() => {
        if (skipEntrance.current) tl.progress(1);
        else tl.play();
      });

      // Continuous scroll effects
      gsap.to(".hero-media-inner", {
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(".hero-copy", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(".hero-scroll", {
        y: 6,
        repeat: -1,
        yoyo: true,
        duration: 1.1,
        ease: "sine.inOut",
      });

      return () => {
        off();
        tl.kill();
        charSplit?.revert();
        tagSplits.forEach((s) => s.revert());
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion, content.locale] },
  );

  useEffect(() => {
    const video = sectionRef.current?.querySelector("video");
    video?.play().catch(() => undefined);
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate bg-cream" data-nav-tone="dark">
      <div className="hero-copy section-px flex flex-col pt-32 pb-8 lg:pt-40 lg:pb-10">
        <span className="hero-chain mb-4 flex items-center gap-3 font-sans text-body-30 uppercase tracking-[0.35em] text-dark/55 lg:mb-6">
          <span>
            {hero.chain}
            <sup className="ml-0.5 text-[0.6em] tracking-normal align-super">®</sup>
          </span>
          <span aria-hidden className="h-px w-8 bg-dark/25" />
        </span>
        <h1
          className="text-hero-brand font-noe-text uppercase text-dark"
          style={{ perspective: "800px" }}
        >
          <span className="block overflow-hidden">
            <span className="hero-brand-line block whitespace-nowrap">{hero.brand}</span>
          </span>
        </h1>

        <div className="mt-6 flex items-start justify-between gap-6 lg:mt-8">
          <p className="hero-tag hidden whitespace-pre-line font-noe-text text-title-10 uppercase leading-tight text-dark lg:block">
            {hero.taglineLeft.join("\n")}
          </p>
          <p className="hero-tag hidden whitespace-pre-line text-right font-noe-text text-title-10 uppercase leading-tight text-dark lg:block">
            {hero.taglineRight.join("\n")}
          </p>
          <p className="hero-tag whitespace-pre-line font-noe-text text-title-10 uppercase leading-tight text-dark lg:hidden">
            {hero.taglineMobile}
          </p>
        </div>
      </div>

      <div className="relative isolate h-[80svh] lg:h-svh" data-hero-media data-nav-tone="light">
        <div className="absolute inset-0">
          <div className="hero-media-reveal relative size-full overflow-hidden">
            <div className="hero-media-inner absolute top-1/2 left-1/2 h-[109.5%] w-[109.5%] -translate-x-1/2 -translate-y-1/2">
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={hero.poster}
              >
                <source src={hero.video} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        <div className="section-px pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between pb-6 lg:pb-8">
          <p className="hero-meta font-sans text-body-30 uppercase text-cream mix-blend-difference">
            Romano Canavese — Piemonte
          </p>
          <span className="hero-scroll hero-meta hidden font-sans text-body-30 uppercase text-cream mix-blend-difference lg:inline">
            {content.spaceUi.scrollDown}
          </span>
        </div>
      </div>
    </section>
  );
}
