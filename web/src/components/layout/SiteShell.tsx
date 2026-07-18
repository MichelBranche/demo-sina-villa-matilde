import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { SmoothScroll } from "./SmoothScroll";
import { Preloader } from "./Preloader";
import { Nav } from "./Nav";
import { Cursor } from "./Cursor";
import { Footer } from "../sections/ContactFooter";
import {
  emitIntroReveal,
  hasIntroSeen,
  initParallax,
  markIntroSeen,
} from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type SiteShellProps = {
  children: ReactNode;
  /** Full cinematic preloader (home only, once per session) */
  withIntro?: boolean;
};

export function SiteShell({ children, withIntro = false }: SiteShellProps) {
  const showPreloader = withIntro && !hasIntroSeen();
  const [unlocked, setUnlocked] = useState(!showPreloader);
  const reducedMotion = usePrefersReducedMotion();
  const location = useLocation();

  // Skip cinematic intro after the first play, or on non-home pages
  useEffect(() => {
    if (!showPreloader) emitIntroReveal();
  }, [showPreloader]);

  useEffect(() => {
    if (!unlocked || reducedMotion) return;
    return initParallax(document);
  }, [unlocked, reducedMotion, location.pathname]);

  useEffect(() => {
    document.body.style.overflow = unlocked ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [unlocked]);

  // Scroll to top on route change, or to hash when present
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      {showPreloader && (
        <Preloader
          onComplete={() => {
            markIntroSeen();
            setUnlocked(true);
          }}
        />
      )}
      <SmoothScroll enabled={unlocked}>
        <div className="relative min-h-dvh w-full">
          <Cursor />
          <Nav />
          <main className="relative z-10 bg-cream shadow-[0_24px_60px_rgba(51,25,23,0.18)]">
            {children}
          </main>
          <Footer />
        </div>
      </SmoothScroll>
    </>
  );
}
