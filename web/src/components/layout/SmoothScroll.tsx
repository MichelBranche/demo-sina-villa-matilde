import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProps = {
  children: ReactNode;
  enabled?: boolean;
};

export function SmoothScroll({ children, enabled = true }: SmoothScrollProps) {
  const reducedMotion = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    if (!enabled) lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.body.style.transform ? "transform" : "fixed",
    });

    ScrollTrigger.addEventListener("refresh", () => lenis.resize());
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as Window & { __lenis?: Lenis }).__lenis;
      ScrollTrigger.scrollerProxy(document.body, {});
    };
  }, [reducedMotion]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (enabled) {
      lenis.start();
      ScrollTrigger.refresh();
    } else {
      lenis.stop();
    }
  }, [enabled]);

  return <>{children}</>;
}

export function scrollTo(target: string | number) {
  const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6 });
  } else {
    const el = typeof target === "string" ? document.querySelector(target) : null;
    el?.scrollIntoView({ behavior: "smooth" });
  }
}
