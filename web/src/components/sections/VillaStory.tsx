import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "../../i18n/useContent";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function VillaStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { story, locale } = useContent();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.from(".studio-bio-panel > *", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".studio-bio",
          start: "top 80%",
        },
      });

      gsap.from(".studio-sticky-chapter", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".studio-sticky",
          start: "top 70%",
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion, locale] },
  );

  return (
    <section id="villa" ref={sectionRef}>
      <div className="studio-bio theme-secondary grid grid-cols-1 gap-4 px-4 py-12 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24" data-nav-tone="dark">
        <div className="studio-bio-panel flex flex-col justify-center gap-8 bg-cream px-8 py-16 text-dark lg:gap-12 lg:p-24">
          <p className="font-sans text-body-30 uppercase text-dark/55">{story.eyebrow}</p>
          <h2 className="font-noe-text text-title-40 uppercase text-dark">{story.title}</h2>
          <div className="flex max-w-md flex-col gap-6 font-sans text-body-30 leading-relaxed text-dark/70">
            <p>{story.lead}</p>
            {story.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>

        <div className="relative min-h-[50svh] overflow-hidden lg:min-h-full">
          <img
            src={story.image}
            alt="Sina Villa Matilde"
            data-parallax="8"
            className="absolute inset-0 size-full object-cover will-change-transform"
            loading="lazy"
          />
        </div>
      </div>

      <div className="studio-sticky relative isolate bg-cream" data-nav-tone="dark">
        <div className="lg:grid lg:grid-cols-2 lg:items-start">
          <div className="studio-sticky-copy section-px flex flex-col gap-28 py-24 lg:gap-40 lg:py-32 lg:pr-16 lg:pb-[40vh]">
            {story.sticky.chapters.map((chapter) => (
              <article key={chapter.title} className="studio-sticky-chapter flex flex-col gap-8">
                <p className="font-sans text-body-30 uppercase text-dark/55">{chapter.eyebrow}</p>
                <h3 className="font-noe-text text-title-40 uppercase text-dark">{chapter.title}</h3>
                <div className="flex max-w-md flex-col gap-6 font-sans text-body-30 leading-relaxed text-dark/70">
                  {chapter.paragraphs.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="relative h-[55svh] overflow-hidden lg:sticky lg:top-0 lg:h-svh">
            <img
              src={story.sticky.image}
              alt=""
              data-parallax="6"
              className="size-full object-cover will-change-transform"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
