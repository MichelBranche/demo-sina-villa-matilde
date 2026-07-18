import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "../../i18n/useContent";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { EASE } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type SpaceGalleryStripProps = {
  images: string[];
  galleryLabel?: string;
  scrollLabel?: string;
};

export function SpaceGalleryStrip({
  images,
  galleryLabel,
  scrollLabel,
}: SpaceGalleryStripProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { spaceUi } = useContent();
  const galleryText = galleryLabel ?? spaceUi.gallery;
  const scrollText = scrollLabel ?? spaceUi.scroll;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const pin = pinRef.current;
      const track = trackRef.current;
      if (!section || !pin || !track || !images.length) return;

      const slides = gsap.utils.toArray<HTMLElement>(".space-strip-slide", track);

      gsap.from(slides, {
        opacity: 0,
        x: 40,
        duration: 0.9,
        stagger: 0.06,
        ease: EASE.villa,
        scrollTrigger: {
          trigger: section,
          start: "top 88%",
        },
      });

      if (reducedMotion) return;

      const getDistance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      const applyDepth = () => {
        const centerX = window.innerWidth * 0.5;
        const falloff = window.innerWidth * 0.72;

        slides.forEach((slide) => {
          const img = slide.querySelector("img");
          const rect = slide.getBoundingClientRect();
          const slideCenter = rect.left + rect.width * 0.5;
          const norm = Math.min(1, Math.abs(slideCenter - centerX) / falloff);
          const eased = norm * norm;

          gsap.set(slide, {
            scale: 1 - eased * 0.14,
            y: eased * 36,
            opacity: 1 - eased * 0.28,
            transformOrigin: "50% 50%",
          });

          if (img) {
            gsap.set(img, {
              scale: 1.18 - (1 - eased) * 0.06,
              xPercent: (slideCenter - centerX) * -0.012,
              transformOrigin: "50% 50%",
            });
          }
        });
      };

      gsap.set(slides, { force3D: true });

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: pin,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: applyDepth,
          onRefresh: applyDepth,
        },
      });

      applyDepth();

      const refresh = () => ScrollTrigger.refresh();
      const imgs = track.querySelectorAll("img");
      imgs.forEach((img) => {
        if (!img.complete) img.addEventListener("load", refresh, { once: true });
      });
      window.addEventListener("resize", refresh);

      return () => {
        window.removeEventListener("resize", refresh);
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { clearProps: "x" });
        gsap.set(slides, { clearProps: "scale,y,opacity,transform" });
        slides.forEach((slide) => {
          const img = slide.querySelector("img");
          if (img) gsap.set(img, { clearProps: "scale,xPercent,transform" });
        });
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion, images] },
  );

  if (!images.length) return null;

  return (
    <section
      ref={sectionRef}
      className="space-gallery theme-primary"
      data-nav-tone="light"
    >
      <div
        ref={pinRef}
        className="flex h-svh flex-col justify-center overflow-hidden [perspective:1200px]"
      >
        <div className="section-px mb-8 flex shrink-0 items-end justify-between gap-6 lg:mb-10">
          <p className="font-sans text-body-30 uppercase tracking-[0.16em] text-cream/55">
            {galleryText}
          </p>
          <p className="font-sans text-body-30 uppercase tracking-[0.16em] text-cream/55">
            {scrollText}
          </p>
        </div>

        <div
          ref={trackRef}
          className={`flex w-max gap-6 will-change-transform lg:gap-10 ${
            reducedMotion
              ? "overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:px-8"
              : "px-4 lg:px-8"
          }`}
        >
          {images.map((src) => (
            <figure
              key={src}
              className="space-strip-slide relative h-[55vh] max-h-[560px] w-[min(78vw,720px)] shrink-0 overflow-hidden will-change-transform lg:h-[70vh] lg:max-h-[720px] lg:w-[min(62vw,900px)]"
            >
              <img
                src={src}
                alt=""
                className="size-full object-cover will-change-transform"
                loading="lazy"
                draggable={false}
              />
            </figure>
          ))}
          <div className="w-4 shrink-0 lg:w-8" aria-hidden />
        </div>
      </div>
    </section>
  );
}
