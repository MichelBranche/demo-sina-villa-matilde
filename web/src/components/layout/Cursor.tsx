import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [finePointer, setFinePointer] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion || !finePointer) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.documentElement.classList.add("has-custom-cursor");

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    gsap.set(label, { opacity: 0, scale: 0.8 });

    let state: "default" | "hover" | "view" = "default";

    const applyState = (next: typeof state) => {
      if (state === next) return;
      state = next;

      if (next === "default") {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" });
        gsap.to(dot, { scale: 1, duration: 0.3 });
        gsap.to(label, { opacity: 0, scale: 0.8, duration: 0.25 });
      } else {
        gsap.to(ring, { scale: 2.2, opacity: 0.6, duration: 0.35, ease: "power2.out" });
        gsap.to(dot, { scale: 0.5, duration: 0.3 });
        gsap.to(label, {
          opacity: next === "view" ? 1 : 0,
          scale: next === "view" ? 1 : 0.8,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    // Event delegation: survives re-renders and late-mounted content
    const move = (e: MouseEvent) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.12, ease: "power2.out" });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.45, ease: "power3.out" });

      const target = e.target as Element | null;
      if (target?.closest("[data-cursor='view']")) {
        applyState("view");
      } else if (target?.closest("a, button")) {
        applyState("hover");
      } else {
        applyState("default");
      }
    };

    window.addEventListener("mousemove", move, { passive: true });

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", move);
    };
  }, [reducedMotion, finePointer]);

  if (reducedMotion || !finePointer) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[10000] h-1.5 w-1.5 rounded-full bg-accent mix-blend-difference"
        aria-hidden
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] flex h-10 w-10 items-center justify-center rounded-full border border-dark/30"
        aria-hidden
      >
        <span
          ref={labelRef}
          className="whitespace-nowrap font-sans text-[0.65rem] uppercase tracking-wide text-dark"
        >
          Scopri →
        </span>
      </div>
    </>
  );
}
