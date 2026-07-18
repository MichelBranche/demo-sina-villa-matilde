import { useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteShell } from "../components/layout/SiteShell";
import { TransitionLink } from "../components/layout/PageTransition";
import { SpaceGalleryStrip } from "../components/sections/SpaceGalleryStrip";
import { CurtainLink } from "../components/ui/CurtainLink";
import { useContent, type LocalizedSpace } from "../i18n/useContent";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { EASE, splitLines } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function SpacePage() {
  const { slug = "" } = useParams();
  const { locale, getSpaceBySlug, getNextSpace } = useContent();
  const space = getSpaceBySlug(slug);

  if (!space) return <Navigate to="/" replace />;

  const next = getNextSpace(space.slug);
  const gallery = space.gallery.filter((src) => src !== space.image);

  return (
    <SiteShell>
      <SpaceContent
        key={`${locale}-${space.slug}`}
        space={space}
        next={next}
        gallery={gallery}
      />
    </SiteShell>
  );
}

type SpaceContentProps = {
  space: LocalizedSpace;
  next: LocalizedSpace;
  gallery: string[];
};

function SpaceContent({ space, next, gallery }: SpaceContentProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { spaceUi, locale } = useContent();

  useGSAP(
    () => {
      if (reducedMotion) return;

      const titleSplit = splitLines(titleRef.current);
      const leadSplit = splitLines(leadRef.current);

      const tl = gsap.timeline({ defaults: { ease: EASE.villa } });

      gsap.set(".space-hero-media", { scale: 1.08 });
      gsap.set(".space-hero-copy > *", { y: 24, opacity: 0 });

      tl.to(".space-hero-media", { scale: 1, duration: 1.4 }, 0)
        .to(
          ".space-hero-copy > *",
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: EASE.villaOut },
          0.2,
        );

      if (titleSplit?.lines) {
        gsap.from(titleSplit.lines, {
          yPercent: 110,
          duration: 1,
          stagger: 0.04,
          ease: EASE.villa,
          delay: 0.15,
        });
      }

      if (leadSplit?.lines) {
        gsap.from(leadSplit.lines, {
          yPercent: 100,
          duration: 0.9,
          stagger: 0.06,
          ease: EASE.villa,
          scrollTrigger: { trigger: leadRef.current, start: "top 85%" },
        });
      }

      return () => {
        titleSplit?.revert();
        leadSplit?.revert();
      };
    },
    { scope: pageRef, dependencies: [reducedMotion, space.slug, locale] },
  );

  return (
    <div ref={pageRef}>
      <section
        className="relative isolate flex min-h-[85svh] flex-col justify-end overflow-hidden"
        data-nav-tone="light"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src={space.image}
            alt=""
            className="space-hero-media size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/75 via-dark/25 to-dark/20" />
        </div>

        <div className="space-hero-copy section-px relative z-10 pb-12 pt-32 lg:pb-16 lg:pt-40">
          <TransitionLink
            to="/#spazi"
            className="inline-flex font-sans text-body-30 uppercase text-cream/80 transition-opacity hover:opacity-100"
          >
            {spaceUi.backToSpaces}
          </TransitionLink>
          <p className="mt-8 font-sans text-body-30 uppercase tracking-[0.2em] text-cream/70">
            {space.eyebrow}
          </p>
          <h1
            ref={titleRef}
            className="mt-4 max-w-5xl font-noe-text text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.9] tracking-[-0.03em] text-cream"
          >
            {space.title}
          </h1>
          <p className="mt-6 font-sans text-body-30 text-cream/70">{space.coords}</p>
        </div>
      </section>

      <section className="section-px section-py bg-cream" data-nav-tone="dark">
        <div className="mx-auto max-w-3xl">
          <p
            ref={leadRef}
            className="font-noe-text text-title-20 text-dark"
          >
            {space.lead}
          </p>
          <div className="mt-10 flex flex-col gap-6 font-sans text-body-30 leading-relaxed text-dark/70">
            {space.paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>

          {space.restaurant && (
            <div className="mt-16 grid gap-10 border-t border-line pt-12 sm:grid-cols-2">
              <div>
                <p className="font-sans text-body-30 uppercase text-dark/50">{spaceUi.hours}</p>
                <dl className="mt-4 space-y-3 font-sans text-body-30 text-dark">
                  <div>
                    <dt className="text-dark/55">{spaceUi.lunch}</dt>
                    <dd>{space.restaurant.lunch}</dd>
                  </div>
                  <div>
                    <dt className="text-dark/55">{spaceUi.dinner}</dt>
                    <dd>{space.restaurant.dinner}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <p className="font-sans text-body-30 uppercase text-dark/50">{spaceUi.contacts}</p>
                <address className="mt-4 not-italic font-sans text-body-30 text-dark">
                  <p>{space.restaurant.address}</p>
                  <p className="mt-3">
                    <a
                      href={`tel:${space.restaurant.phone.replace(/\s/g, "")}`}
                      className="transition-opacity hover:opacity-60"
                    >
                      {space.restaurant.phone}
                    </a>
                  </p>
                  <p className="mt-1">
                    <a
                      href={`mailto:${space.restaurant.email}`}
                      className="transition-opacity hover:opacity-60"
                    >
                      {space.restaurant.email}
                    </a>
                  </p>
                </address>
              </div>
            </div>
          )}
        </div>
      </section>

      <SpaceGalleryStrip images={gallery} />

      <section className="section-px bg-cream py-20 text-center lg:py-28" data-nav-tone="dark">
        {space.restaurant?.menuUrl && (
          <div className="mb-20 border-b border-line pb-20 lg:mb-28 lg:pb-28">
            <div className="mx-auto mt-6 max-w-3xl">
              <a
                href={space.restaurant.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-noe-text text-[clamp(2rem,5vw,4.5rem)] uppercase leading-[0.95] tracking-[-0.03em] text-dark transition-opacity hover:opacity-60"
              >
                {spaceUi.menuLabel}
              </a>
            </div>
          </div>
        )}
        <p className="font-sans text-body-30 uppercase text-dark/50">{spaceUi.nextSpace}</p>
        <div className="mx-auto mt-6 max-w-3xl">
          <CurtainLink href={`/spazi/${next.slug}`}>{next.title}</CurtainLink>
        </div>
      </section>
    </div>
  );
}
