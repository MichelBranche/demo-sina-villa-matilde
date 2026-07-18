import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "../../i18n/useContent";
import { TextMarquee } from "../ui/TextMarquee";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function DearVilla() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { dearVilla, locale } = useContent();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.from(".dear-line", {
        yPercent: 110,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".dear-hero",
          start: "top 75%",
        },
      });

      gsap.from(".dear-featured", {
        clipPath: "inset(0 0 100% 0)",
        duration: 1.2,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: ".dear-featured",
          start: "top 88%",
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion, locale] },
  );

  const [featured, ...rest] = dearVilla.items;

  return (
    <section id="vivere" ref={sectionRef} data-nav-tone="light">
      <div className="dear-hero theme-primary section-px relative isolate overflow-hidden py-20 pb-32 lg:py-56 lg:pb-64">
        <div className="relative z-10 mx-auto flex max-w-[1054px] flex-col items-center gap-8 text-center lg:gap-12">
          <p className="font-sans text-body-30 uppercase text-blush">
            <span className="block overflow-hidden">
              <span className="dear-line block">{dearVilla.eyebrow}</span>
            </span>
          </p>
          <h2 className="font-noe-text text-title-40 uppercase text-blush">
            <span className="block overflow-hidden">
              <span className="dear-line block">{dearVilla.title}</span>
            </span>
          </h2>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 translate-y-[40%]">
          <TextMarquee text={dearVilla.marqueeText} duration={95} className="!py-8 lg:!py-12" />
        </div>
      </div>

      <div className="theme-primary px-4 pb-16 lg:px-8 lg:pb-24">
        <a
          href={featured.href}
          className="dear-featured group/item relative isolate flex min-h-[70svh] flex-col px-6 py-10 text-blush lg:min-h-svh lg:px-16 lg:py-16"
          data-cursor="view"
        >
          <div className="absolute inset-0 -z-[2] overflow-hidden">
            <img
              src={featured.image}
              alt=""
              data-parallax="10"
              data-cursor="view"
              className="size-full object-cover will-change-transform"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 -z-[1] bg-dark/50" aria-hidden />

          <div className="mt-auto grid flex-1 grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-8 gap-y-8 border-t border-current/30 pt-8 lg:gap-x-16 lg:gap-y-16 lg:pt-16">
            <p className="row-span-2 font-sans text-body-30 uppercase opacity-70">{featured.number}</p>
            <p className="col-start-2 font-sans text-body-30 opacity-70">{featured.date}</p>
            <div className="col-start-2 row-start-2 flex flex-col justify-end gap-3">
              <h3 className="line-clamp-5 font-noe-text text-title-20 uppercase">{featured.title}</h3>
              <p className="font-sans text-body-30 opacity-70 transition-opacity duration-[400ms] group-hover/item:opacity-100">
                Continua a leggere
              </p>
            </div>
          </div>
        </a>
      </div>

      <div className="theme-primary grid gap-1 lg:grid-cols-2">
        {rest.map((item) => (
          <a key={item.title} href={item.href} className="group block" data-cursor="view">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={item.image}
                alt=""
                data-parallax="8"
                className="h-full w-full object-cover will-change-transform"
                loading="lazy"
              />
            </div>
            <div className="section-px py-6">
              <p className="font-sans text-body-30 uppercase text-blush/60">
                {item.number} · {item.date}
              </p>
              <p className="mt-2 font-noe-text text-subtitle-30 text-blush transition-opacity duration-300 group-hover:opacity-70">
                {item.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
