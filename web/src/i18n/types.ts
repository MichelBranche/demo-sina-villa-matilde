export type Locale = "it" | "en" | "fr" | "de" | "es" | "ru" | "zh";

export const LOCALES: Locale[] = ["it", "en", "fr", "de", "es", "ru", "zh"];

export const LOCALE_META: Record<
  Locale,
  { label: string; htmlLang: string }
> = {
  it: { label: "Italiano", htmlLang: "it" },
  en: { label: "English", htmlLang: "en" },
  fr: { label: "Français", htmlLang: "fr" },
  de: { label: "Deutsch", htmlLang: "de" },
  es: { label: "Español", htmlLang: "es" },
  ru: { label: "Русский", htmlLang: "ru" },
  zh: { label: "中文", htmlLang: "zh-CN" },
};

export type SpaceId = "parco" | "sale" | "camere" | "scuderie";

export type Messages = {
  nav: {
    villa: string;
    spaces: string;
    living: string;
    contact: string;
    contactCta: string;
    book: string;
    language: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    taglineLeft: [string, string];
    taglineRight: [string, string];
    taglineMobile: string;
  };
  about: {
    eyebrow: string;
    statementLines: [string, string, string];
    secondary: string;
    marqueeText: string;
  };
  spacesSection: {
    eyebrow: string;
    title: string;
    marqueeText: string;
  };
  spaces: Record<
    SpaceId,
    {
      title: string;
      eyebrow: string;
      lead: string;
      paragraphs: string[];
      restaurantName?: string;
    }
  >;
  dearVilla: {
    eyebrow: string;
    title: string;
    marqueeText: string;
    items: [{ title: string; date: string }, { title: string; date: string }, { title: string; date: string }];
  };
  story: {
    eyebrow: string;
    title: string;
    lead: string;
    paragraphs: [string, string];
    chapters: [
      { eyebrow: string; title: string; paragraphs: [string, string] },
      { eyebrow: string; title: string; paragraphs: [string, string] },
      { eyebrow: string; title: string; paragraphs: [string, string] },
    ];
  };
  contactCta: {
    title: [string, string];
    button: string;
  };
  footer: {
    rights: string;
    privacyLabel: string;
    directions: string;
    designBy: string;
    columns: {
      villa: string;
      spaces: string;
      living: string;
      story: string;
      contact: string;
      book: string;
    };
    socialLabel: string;
    secondaryContactLabel: string;
  };
  spaceUi: {
    backToSpaces: string;
    hours: string;
    lunch: string;
    dinner: string;
    contacts: string;
    menuLabel: string;
    nextSpace: string;
    gallery: string;
    scroll: string;
    scrollDown: string;
  };
  preloader: {
    loading: string;
  };
};
