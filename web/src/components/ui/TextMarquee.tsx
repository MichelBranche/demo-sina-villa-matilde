import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type TextMarqueeProps = {
  text: string;
  className?: string;
  duration?: number;
};

export function TextMarquee({ text, className = "", duration = 106 }: TextMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || reducedMotion) return;

      const tween = gsap.to(track, {
        xPercent: -50,
        duration,
        ease: "none",
        repeat: -1,
      });

      const st = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          const boost = gsap.utils.clamp(1, 3, 1 + Math.abs(velocity) / 1800);
          tween.timeScale(boost);
          const skew = gsap.utils.clamp(-4, 4, velocity / -400);
          gsap.to(track, {
            skewX: skew,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        },
        onLeave: () => {
          tween.timeScale(1);
          gsap.to(track, { skewX: 0, duration: 0.6, ease: "power2.out" });
        },
        onLeaveBack: () => {
          tween.timeScale(1);
          gsap.to(track, { skewX: 0, duration: 0.6, ease: "power2.out" });
        },
      });

      return () => {
        st.kill();
        tween.kill();
      };
    },
    { scope: rootRef, dependencies: [duration, reducedMotion, text] },
  );

  const items = Array.from({ length: 8 }, (_, i) => (
    <span
      key={i}
      className="marquee-item shrink-0 pr-[5rem] font-canora text-title-marquee text-accent lg:pr-[8rem]"
    >
      {text}
    </span>
  ));

  return (
    <div
      ref={rootRef}
      className={`marquee-mask overflow-hidden py-20 lg:py-32 ${className}`}
      aria-hidden
    >
      <div
        ref={trackRef}
        className="marquee-track flex w-max whitespace-nowrap will-change-transform"
        style={
          reducedMotion
            ? undefined
            : undefined
        }
      >
        {items}
        {items}
      </div>
    </div>
  );
}
