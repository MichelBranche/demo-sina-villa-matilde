import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useContent } from "../../i18n/useContent";
import { TextMarquee } from "../ui/TextMarquee";
import { TransitionLink } from "../layout/PageTransition";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { EASE } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, useGSAP);

export function SpacesShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { spacesSection, spaces, locale } = useContent();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.from(".spaces-headline-line", {
        yPercent: 110,
        duration: 1,
        stagger: 0.1,
        ease: EASE.villa,
        scrollTrigger: {
          trigger: ".spaces-headline",
          start: "top 80%",
        },
      });

      gsap.from(".space-item", {
        clipPath: "inset(0 0 100% 0)",
        duration: 1.15,
        stagger: 0.08,
        ease: EASE.villa,
        scrollTrigger: {
          trigger: ".spaces-grid",
          start: "top 88%",
        },
      });

      const unbinders: Array<() => void> = [];
      gsap.utils.toArray<HTMLElement>(".space-coords").forEach((el) => {
        const original = el.dataset.coords ?? el.textContent ?? "";
        const parent = el.closest(".space-item");
        if (!parent) return;

        const scramble = () => {
          gsap.to(el, {
            duration: 0.55,
            scrambleText: {
              text: original,
              chars: "0123456789°NSEW. ",
              speed: 0.4,
            },
          });
        };

        parent.addEventListener("mouseenter", scramble);
        unbinders.push(() => parent.removeEventListener("mouseenter", scramble));
      });

      return () => unbinders.forEach((fn) => fn());
    },
    { scope: sectionRef, dependencies: [reducedMotion, locale] },
  );

  return (
    <section id="spazi" ref={sectionRef} data-nav-tone="dark">
      <div
        data-page-builder-section="headlineSection"
        className="spaces-headline theme-secondary section-px relative isolate overflow-hidden py-24 lg:py-56 lg:pb-44"
      >
        <div className="relative z-10 mx-auto flex max-w-[1054px] flex-col gap-16 lg:gap-24">
          <p className="text-center font-sans text-body-30 uppercase">
            <span className="block overflow-hidden">
              <span className="spaces-headline-line block">{spacesSection.eyebrow}</span>
            </span>
          </p>
          <h2 className="text-center font-noe-text text-title-40 uppercase">
            <span className="block overflow-hidden">
              <span className="spaces-headline-line block">{spacesSection.title}</span>
            </span>
          </h2>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 translate-y-[40%]">
          <TextMarquee text={spacesSection.marqueeText} duration={90} />
        </div>
      </div>

      <div className="spaces-grid theme-secondary grid grid-cols-2 gap-px lg:grid-cols-4">
        {spaces.map((space) => (
          <TransitionLink
            key={space.id}
            to={`/spazi/${space.slug}`}
            className="space-item group relative block overflow-hidden"
            data-cursor="view"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={space.image}
                alt={space.title}
                data-parallax="8"
                className="h-full w-full object-cover will-change-transform"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4 lg:p-6">
              <h3 className="font-noe-text text-base uppercase leading-tight text-cream lg:text-lg">
                {space.title}
              </h3>
              <p
                className="space-coords mt-1 font-sans text-xs text-cream/70"
                data-coords={space.coords}
              >
                {space.coords}
              </p>
            </div>
          </TransitionLink>
        ))}
      </div>
    </section>
  );
}
