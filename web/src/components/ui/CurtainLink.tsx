import { useState, type ReactNode } from "react";
import { usePageTransition } from "../layout/PageTransition";

type CurtainLinkProps = {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
  inverted?: boolean;
};

export function CurtainLink({
  href,
  children,
  external,
  className = "",
  inverted = false,
}: CurtainLinkProps) {
  const [hovered, setHovered] = useState(false);
  const { transitionTo, isTransitioning } = usePageTransition();

  const classes = `group relative inline-flex w-full items-center justify-between overflow-hidden border-t py-8 font-sans text-body-30 uppercase transition-colors duration-[400ms] ${
    inverted
      ? "border-blush/30 text-blush hover:text-dark"
      : "border-dark/30 text-dark hover:text-cream"
  } ${className}`;

  const content = (
    <>
      <span
        className={`absolute inset-0 z-0 transition-transform duration-[400ms] ease-in-out ${
          inverted ? "bg-blush" : "bg-dark"
        }`}
        style={{ transform: hovered ? "translateY(0)" : "translateY(100%)" }}
        aria-hidden
      />
      <span className="relative z-10 flex w-full items-center justify-between transition-transform duration-[400ms] group-hover:translate-x-2">
        <span>{children}</span>
        <span aria-hidden className="opacity-50">
          →
        </span>
      </span>
    </>
  );

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  const isInternal = !external && href.startsWith("/") && !href.startsWith("//");

  if (isInternal) {
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={isTransitioning || undefined}
        onClick={(e) => {
          e.preventDefault();
          transitionTo(href);
        }}
        {...handlers}
      >
        {content}
      </a>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={classes}
      {...handlers}
    >
      {content}
    </a>
  );
}
