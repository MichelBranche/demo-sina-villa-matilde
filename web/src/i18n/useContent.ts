import { useMemo } from "react";
import {
  BOOKING_URL,
  CONTACT,
  FOOTER as FOOTER_STATIC,
  HERO as HERO_STATIC,
  SOCIAL,
  SPACE_DEFS,
  STORY as STORY_STATIC,
  DEAR_ITEMS,
  type SpaceDef,
} from "../data/site";
import { useLocale } from "./locale";
import type { SpaceId } from "./types";

export function useContent() {
  const { t, locale } = useLocale();

  return useMemo(() => {
    const spaces = SPACE_DEFS.map((def) => {
      const copy = t.spaces[def.id];
      return {
        ...def,
        title: copy.title,
        eyebrow: copy.eyebrow,
        lead: copy.lead,
        paragraphs: copy.paragraphs,
        restaurant: def.restaurant
          ? {
              ...def.restaurant,
              name: copy.restaurantName ?? def.restaurant.name,
            }
          : undefined,
      };
    });

    const getSpaceBySlug = (slug: string) =>
      spaces.find((s) => s.slug === slug);

    const getNextSpace = (slug: string) => {
      const index = spaces.findIndex((s) => s.slug === slug);
      const next = index < 0 ? 0 : (index + 1) % spaces.length;
      return spaces[next];
    };

    return {
      locale,
      t,
      bookingUrl: BOOKING_URL,
      contact: CONTACT,
      social: SOCIAL,
      hero: {
        ...HERO_STATIC,
        ...t.hero,
      },
      about: t.about,
      spacesSection: t.spacesSection,
      spaces,
      getSpaceBySlug,
      getNextSpace,
      dearVilla: {
        ...t.dearVilla,
        items: t.dearVilla.items.map((item, i) => ({
          ...DEAR_ITEMS[i],
          title: item.title,
          date: item.date,
        })),
      },
      story: {
        ...STORY_STATIC,
        ...t.story,
        sticky: {
          image: STORY_STATIC.stickyImage,
          chapters: t.story.chapters,
        },
      },
      contactCta: t.contactCta,
      footer: {
        ...FOOTER_STATIC,
        rights: t.footer.rights,
        privacyLabel: t.footer.privacyLabel,
        directions: t.footer.directions,
        designBy: t.footer.designBy,
        social: {
          ...FOOTER_STATIC.social,
          label: t.footer.socialLabel,
        },
        secondaryContact: {
          ...FOOTER_STATIC.secondaryContact,
          label: t.footer.secondaryContactLabel,
        },
        columns: [
          [
            { label: t.footer.columns.villa, href: "/#about" },
            { label: t.footer.columns.spaces, href: "/#spazi" },
            { label: t.footer.columns.living, href: "/#vivere" },
          ],
          [
            { label: t.footer.columns.story, href: "/#villa" },
            { label: t.footer.columns.contact, href: "/#contatti" },
            { label: t.footer.columns.book, href: BOOKING_URL, external: true },
          ],
        ] as const,
      },
      spaceUi: t.spaceUi,
      preloader: t.preloader,
    };
  }, [t, locale]);
}

export type LocalizedSpace = ReturnType<typeof useContent>["spaces"][number];

export function spaceIdFromDef(def: SpaceDef): SpaceId {
  return def.id;
}
