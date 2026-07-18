import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "../../i18n/useContent";
import { TextMarquee } from "../ui/TextMarquee";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { EASE, splitLines } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { about, locale } = useContent();

  useGSAP(
    () => {
      if (reducedMotion) return;

      const statementSplit = splitLines(statementRef.current);
      const secondarySplit = splitLines(
        sectionRef.current?.querySelector(".about-secondary") ?? null,
      );
      const eyebrowSplit = splitLines(
        sectionRef.current?.querySelector(".about-eyebrow") ?? null,
      );

      const lines = [
        ...(eyebrowSplit?.lines ?? []),
        ...(statementSplit?.lines ?? []),
        ...(secondarySplit?.lines ?? []),
      ];

      if (lines.length) {
        gsap.from(lines, {
          yPercent: 110,
          duration: 1.05,
          stagger: 0.07,
          ease: EASE.villa,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        });
      }

      gsap.fromTo(
        sectionRef.current,
        { opacity: 0.55 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            end: "top 40%",
            scrub: true,
          },
        },
      );

      return () => {
        statementSplit?.revert();
        secondarySplit?.revert();
        eyebrowSplit?.revert();
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion, locale] },
  );

  return (
    <div
      id="about"
      ref={sectionRef}
      data-page-builder-section="textMarqueeSection"
      className="theme-primary section-px section-py relative isolate flex min-h-svh flex-col overflow-hidden"
      data-nav-tone="light"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1054px] flex-1 flex-col justify-between gap-16 lg:gap-24">
        <p className="about-eyebrow text-center font-sans text-body-30 uppercase">
          {about.eyebrow}
        </p>

        <h2
          ref={statementRef}
          className="about-statement mx-auto max-w-[1054px] text-center font-noe-text text-title-20 uppercase lg:whitespace-pre-line"
        >
          {about.statementLines.join("\n")}
        </h2>

        <div className="about-secondary mx-auto mt-auto max-w-3xl text-center font-noe-text text-subtitle-30 uppercase">
          {about.secondary}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2">
        <TextMarquee text={about.marqueeText} />
      </div>
    </div>
  );
}
