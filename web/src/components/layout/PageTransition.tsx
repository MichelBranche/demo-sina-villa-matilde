import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { EASE } from "../../lib/motion";

type PageTransitionContextValue = {
  transitionTo: (to: string) => void;
  isTransitioning: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) {
    throw new Error("usePageTransition must be used within PageTransitionProvider");
  }
  return ctx;
}

function pathOf(to: string) {
  try {
    return new URL(to, window.location.origin).pathname;
  } catch {
    return to.split("#")[0] || "/";
  }
}

function hashOf(to: string) {
  try {
    return new URL(to, window.location.origin).hash;
  } catch {
    const i = to.indexOf("#");
    return i >= 0 ? to.slice(i) : "";
  }
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const busyRef = useRef(false);
  const selfNavRef = useRef(false);
  const prevPathRef = useRef(location.pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cover = useCallback(() => {
    const overlay = overlayRef.current;
    const label = labelRef.current;
    if (!overlay) return Promise.resolve();

    return new Promise<void>((resolve) => {
      gsap.set(overlay, { pointerEvents: "auto", visibility: "visible" });
      gsap.set(label, { opacity: 0, y: 12 });

      const tl = gsap.timeline({
        defaults: { ease: EASE.villa },
        onComplete: () => resolve(),
      });

      tl.fromTo(
        overlay,
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: 0.85 },
        0,
      );

      if (label) {
        tl.to(
          label,
          { opacity: 1, y: 0, duration: 0.45, ease: EASE.villaOut },
          0.35,
        );
      }
    });
  }, []);

  const uncover = useCallback(() => {
    const overlay = overlayRef.current;
    const label = labelRef.current;
    if (!overlay) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const tl = gsap.timeline({
        defaults: { ease: EASE.villa },
        onComplete: () => {
          gsap.set(overlay, {
            clipPath: "inset(100% 0 0 0)",
            pointerEvents: "none",
            visibility: "hidden",
          });
          resolve();
        },
      });

      if (label) {
        tl.to(
          label,
          { opacity: 0, y: -10, duration: 0.3, ease: EASE.villaOut },
          0,
        );
      }

      tl.to(overlay, { clipPath: "inset(0 0 100% 0)", duration: 0.9 }, 0.05);
    });
  }, []);

  const transitionTo = useCallback(
    async (to: string) => {
      if (busyRef.current) return;

      const nextPath = pathOf(to);

      if (nextPath === location.pathname) {
        const nextHash = hashOf(to);
        if (nextHash) {
          const id = nextHash.slice(1);
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (reducedMotion()) {
        navigate(to);
        return;
      }

      busyRef.current = true;
      selfNavRef.current = true;
      setIsTransitioning(true);

      await cover();
      navigate(to);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await uncover();

      setIsTransitioning(false);
      busyRef.current = false;
      selfNavRef.current = false;
    },
    [cover, uncover, location.pathname, navigate],
  );

  // Browser back / forward: soft reveal over the already-changed page
  useEffect(() => {
    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;

    if (selfNavRef.current || busyRef.current || reducedMotion()) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    busyRef.current = true;
    setIsTransitioning(true);
    gsap.set(overlay, {
      clipPath: "inset(0% 0 0 0)",
      pointerEvents: "auto",
      visibility: "visible",
    });
    gsap.set(labelRef.current, { opacity: 0 });

    void uncover().then(() => {
      setIsTransitioning(false);
      busyRef.current = false;
    });
  }, [location.pathname, uncover]);

  return (
    <PageTransitionContext.Provider value={{ transitionTo, isTransitioning }}>
      {children}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[30000] flex items-center justify-center bg-dark"
        style={{
          clipPath: "inset(100% 0 0 0)",
          pointerEvents: "none",
          visibility: "hidden",
        }}
        aria-hidden
      >
        <p
          ref={labelRef}
          className="font-sans text-body-30 uppercase tracking-[0.35em] text-cream/60"
        >
          Sina
        </p>
      </div>
    </PageTransitionContext.Provider>
  );
}

type TransitionLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">;

export function TransitionLink({
  to,
  children,
  className,
  onClick,
  ...rest
}: TransitionLinkProps) {
  const { transitionTo, isTransitioning } = usePageTransition();

  return (
    <a
      href={to}
      className={className}
      aria-disabled={isTransitioning || undefined}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        transitionTo(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
