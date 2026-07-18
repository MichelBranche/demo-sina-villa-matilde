import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "../../i18n/useContent";
import { CurtainLink } from "../ui/CurtainLink";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { EASE, splitChars, useMagnetic } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ContactCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { contactCta, contact, bookingUrl, t, locale } = useContent();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.from(".contact-line", {
        yPercent: 100,
        duration: 1,
        stagger: 0.12,
        ease: EASE.villa,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      gsap.from(".contact-cta-btn", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: EASE.villaOut,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion, locale] },
  );

  return (
    <section
      id="contatti"
      ref={sectionRef}
      className="section-px bg-cream py-28 lg:py-56"
      data-nav-tone="dark"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="font-noe-text text-title-100 text-dark">
          {contactCta.title.map((line) => (
            <span key={line} className="block overflow-hidden">
              <span className="contact-line block">{line}</span>
            </span>
          ))}
        </h2>
        <div className="contact-cta-btn mt-12">
          <CurtainLink href={`mailto:${contact.email}`}>{contactCta.button}</CurtainLink>
        </div>
        <div className="contact-cta-btn mt-4">
          <CurtainLink href={bookingUrl} external>
            {t.nav.book}
          </CurtainLink>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { footer, contact, locale } = useContent();
  const year = footer.year;
  const footerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLParagraphElement>(null);
  const privacyRef = useRef<HTMLAnchorElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useMagnetic(privacyRef, { strength: 10, disabled: reducedMotion });

  useGSAP(
    () => {
      if (reducedMotion) return;

      const brandSplit = splitChars(
        brandRef.current?.querySelector(".footer-brand-text") ?? null,
      );
      if (brandSplit) {
        gsap.from(brandSplit.chars, {
          yPercent: 110,
          opacity: 0,
          duration: 0.95,
          stagger: 0.025,
          ease: EASE.villa,
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
          },
        });
      }

      return () => brandSplit?.revert();
    },
    { scope: footerRef, dependencies: [reducedMotion, locale] },
  );

  return (
    <footer
      ref={footerRef}
      className="theme-primary sticky bottom-0 z-0 flex flex-col gap-8 p-6 lg:gap-10 lg:p-8"
      data-nav-tone="light"
    >
      <div>
        <p
          ref={brandRef}
          className="font-noe-text text-[clamp(2rem,9vw,7rem)] uppercase leading-[0.9] tracking-[-0.03em] text-blush"
          style={{ perspective: "600px" }}
        >
          <span className="mr-3 align-top font-sans text-[0.22em] tracking-[0.28em] text-blush/55">
            {footer.chain}
            <sup className="ml-0.5 text-[0.7em] tracking-normal">®</sup>
          </span>
          <span className="footer-brand-text">{footer.brand}</span>
        </p>

        <div className="grid grid-cols-1 gap-x-10 pt-8 lg:grid-cols-2 lg:pt-12">
          <div className="mb-8 grid grid-cols-2 gap-6 lg:mb-0 lg:gap-10">
            {footer.columns.map((column, i) => (
              <div key={i} className="flex flex-col items-start gap-3 lg:gap-4">
                {column.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    {...("external" in link && link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="font-sans text-body-30 text-blush/60 transition-opacity duration-[400ms] hover:opacity-100"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 border-t border-current/30 pt-8 lg:grid-cols-2 lg:gap-10 lg:border-t-0 lg:pt-0">
            <div className="flex flex-col gap-1 font-sans text-body-30 text-blush">
              <div className="flex items-center gap-2">
                <InstagramIcon />
                <p>{footer.social.label}</p>
              </div>
              <a
                href={footer.social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-blush/60 transition-opacity duration-[400ms] hover:opacity-100"
              >
                {footer.social.handle}
              </a>
            </div>

            <div className="flex flex-col gap-1 font-sans text-body-30 text-blush">
              <p>{footer.secondaryContact.label}</p>
              <a
                href={footer.secondaryContact.href}
                className="text-blush/60 transition-opacity duration-[400ms] hover:opacity-100"
              >
                {footer.secondaryContact.value}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-8 border-t border-current/30 pt-8 lg:grid-cols-2 lg:pt-10">
        <address className="flex flex-col items-start gap-2 not-italic font-sans text-body-30 text-blush">
          <p className="whitespace-pre-line">
            {contact.address}
            {"\n"}
            {contact.city}
          </p>
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="text-blush/60 transition-opacity duration-[400ms] hover:opacity-100"
          >
            {contact.phone}
          </a>
        </address>

        <div className="flex flex-col items-start gap-2 font-sans text-body-30 text-blush">
          <p>{footer.directions}</p>
          <a
            href={contact.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blush/60 transition-opacity duration-[400ms] hover:opacity-100"
          >
            Google Maps →
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl">
        <div className="h-36 w-full sm:h-40 lg:h-44">
          <iframe
            title="Sina Villa Matilde — Google Maps"
            src={`https://www.google.com/maps?q=${contact.coordinates.lat},${contact.coordinates.lng}&z=16&hl=${locale}&output=embed`}
            className="size-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-current/30 pt-5 lg:flex-row lg:items-center lg:justify-between lg:pt-0">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-[0.75rem] uppercase tracking-wide text-blush">
          <p>
            © {footer.chain} {footer.brand} {year}
          </p>
          <p className="opacity-60">{footer.rights}</p>
          <p className="opacity-60">{footer.cin}</p>
        </div>

        <a
          ref={privacyRef}
          href={footer.privacyHref}
          className="group relative inline-flex shrink-0 items-center overflow-hidden bg-blush px-4 py-2 font-sans text-[0.8rem] text-dark transition-colors duration-[400ms] lg:px-6"
        >
          <span
            className="absolute inset-0 z-0 translate-y-full bg-cream transition-transform duration-[400ms] ease-in-out group-hover:translate-y-0"
            aria-hidden
          />
          <span className="relative z-10">{footer.privacyLabel}</span>
        </a>
      </div>

      <p className="font-sans text-[0.75rem] uppercase tracking-wide text-blush/60">
        {footer.designBy}{" "}
        <a
          href="https://www.michelbranche.it"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 transition-opacity hover:opacity-100"
        >
          michel branche
        </a>
      </p>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      aria-hidden
      className="size-[1em] shrink-0"
    >
      <path
        fill="currentColor"
        d="M10 0C7.284 0 6.944.012 5.877.06 4.813.11 4.086.278 3.45.525a4.9 4.9 0 0 0-1.772 1.153A4.9 4.9 0 0 0 .525 3.45C.278 4.086.109 4.813.06 5.877.011 6.944 0 7.284 0 10s.011 3.056.06 4.123c.049 1.064.218 1.791.465 2.427a4.9 4.9 0 0 0 1.153 1.772 4.9 4.9 0 0 0 1.772 1.153c.636.247 1.363.416 2.427.465 1.067.048 1.407.06 4.123.06s3.056-.012 4.123-.06c1.064-.049 1.791-.218 2.427-.465a4.9 4.9 0 0 0 1.772-1.153 4.9 4.9 0 0 0 1.153-1.772c.247-.636.416-1.363.465-2.427.048-1.067.06-1.407.06-4.123s-.012-3.056-.06-4.123c-.049-1.064-.218-1.791-.465-2.427a4.9 4.9 0 0 0-1.153-1.772A4.9 4.9 0 0 0 16.55.525C15.914.278 15.187.109 14.123.06 13.056.012 12.716 0 10 0m0 1.802c2.67 0 2.986.01 4.04.058.976.045 1.505.207 1.858.344.466.182.8.399 1.15.748.35.35.566.684.748 1.15.137.353.3.882.344 1.857.048 1.055.058 1.37.058 4.041 0 2.67-.01 2.986-.058 4.04-.045.976-.207 1.505-.344 1.858-.182.466-.398.8-.748 1.15s-.683.566-1.15.748c-.353.137-.882.3-1.857.344-1.054.048-1.37.058-4.041.058-2.67 0-2.987-.01-4.04-.058-.976-.045-1.505-.207-1.858-.344a3.1 3.1 0 0 1-1.15-.748 3.1 3.1 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.055-.058-1.37-.058-4.041 0-2.67.01-2.986.058-4.04.045-.976.207-1.505.344-1.858.182-.467.399-.8.748-1.15.35-.35.684-.566 1.15-.748.353-.137.882-.3 1.857-.344 1.055-.048 1.37-.058 4.041-.058"
      />
      <path
        fill="currentColor"
        d="M10 13.334a3.333 3.333 0 1 1 0-6.667 3.333 3.333 0 0 1 0 6.667m0-8.468a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27m6.538-.203a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0"
      />
    </svg>
  );
}
