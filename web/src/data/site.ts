export const BOOKING_URL =
  "https://www.blastnessbooking.com/premium/index.html?id_stile=21160&headvar=ok&lingua_int=ita&graph_be=4&id_albergo=207&dc=458";

export const CONTACT = {
  phone: "+39 012 5639290",
  email: "info@sinavillamatilde.it",
  address: "Viale Marconi 29",
  city: "10090 Romano Canavese (TO), Italy",
  what3words: "chain.scone.elector",
  mapsUrl: "https://goo.gl/maps/4cK5owT1a3mQBofc7",
  coordinates: { lat: 45.387453, lng: 7.869775 },
};

export const SOCIAL = {
  instagram: "https://www.instagram.com/sinavillamatilde/",
  facebook: "https://www.facebook.com/relaisvillamatilde",
};

export const HERO = {
  chain: "Sina",
  brand: "Villa Matilde",
  video: "/media/hero/hero.mp4",
  poster: "/media/hero/facciata.jpg",
};

export type SpaceId = "parco" | "sale" | "camere" | "scuderie";

export type SpaceDef = {
  id: SpaceId;
  slug: string;
  coords: string;
  image: string;
  gallery: string[];
  restaurant?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    lunch: string;
    dinner: string;
    menuUrl?: string;
  };
};

export const SPACE_DEFS: SpaceDef[] = [
  {
    id: "parco",
    slug: "parco-secolare",
    coords: "45.3875° N, 7.8698° E",
    image: "/media/hero/outdoor.jpg",
    gallery: [
      "/media/hero/outdoor.jpg",
      "/media/hero/pool.jpg",
      "/media/gallery/01-esterno.jpg",
      "/media/gallery/02-esterno.jpg",
      "/media/gallery/03-esterno.jpg",
    ],
  },
  {
    id: "sale",
    slug: "sale-storiche",
    coords: "45.3875° N, 7.8698° E",
    image: "/media/gallery/05-salone-reale.jpg",
    gallery: [
      "/media/gallery/05-salone-reale.jpg",
      "/media/gallery/07-sala-biblioteca.jpg",
      "/media/gallery/08-galleria.jpg",
      "/media/gallery/06-bar.jpg",
      "/media/sections/salone.jpg",
    ],
  },
  {
    id: "camere",
    slug: "camere-depoca",
    coords: "45.3875° N, 7.8698° E",
    image: "/media/sections/suite.jpg",
    gallery: [
      "/media/sections/suite.jpg",
      "/media/gallery/09-classic.jpg",
      "/media/gallery/10-superior.jpg",
      "/media/gallery/11-deluxe.jpg",
      "/media/gallery/16-two-floor-suite.jpg",
    ],
  },
  {
    id: "scuderie",
    slug: "le-scuderie",
    coords: "45.3875° N, 7.8698° E",
    image: "/media/sections/restaurant.jpg",
    gallery: [
      "/media/spaces/scuderie/04-dining-1.jpg",
      "/media/spaces/scuderie/05-dining-2.jpg",
      "/media/spaces/scuderie/01-ristorante.jpg",
      "/media/spaces/scuderie/03-scuderie-interno.jpg",
      "/media/spaces/scuderie/07-colazione-1.jpg",
      "/media/spaces/scuderie/08-colazione-2.jpg",
    ],
    restaurant: {
      name: "Ristorante Le Scuderie",
      address: "Viale Marconi 29 — 10090 Romano Canavese (TO)",
      phone: "+39 0125 639290",
      email: "sinavillamatilde@sinahotels.com",
      lunch: "12.30 – 14.30",
      dinner: "19.30 – 21.30",
      menuUrl:
        "https://www.sinahotels.com/assets/uploads/VMA%20menu%20Le%20Scuderie%202026.pdf",
    },
  },
];

export function getSpaceDefBySlug(slug: string): SpaceDef | undefined {
  return SPACE_DEFS.find((s) => s.slug === slug);
}

export function getNextSpaceDef(slug: string): SpaceDef {
  const index = SPACE_DEFS.findIndex((s) => s.slug === slug);
  const next = index < 0 ? 0 : (index + 1) % SPACE_DEFS.length;
  return SPACE_DEFS[next];
}

export const DEAR_ITEMS = [
  {
    number: "N.001",
    image: "/media/hero/pool.jpg",
    href: "#villa",
  },
  {
    number: "N.002",
    image: "/media/sections/wellness.jpg",
    href: "#spazi",
  },
  {
    number: "N.003",
    image: "/media/sections/library.jpg",
    href: "#spazi",
  },
] as const;

export const STORY = {
  image: "/media/hero/outdoor.jpg",
  stickyImage: "/media/gallery/07-sala-biblioteca.jpg",
};

export const FOOTER = {
  brand: "Villa Matilde",
  chain: "Sina",
  year: new Date().getFullYear(),
  cin: "CIN IT001223A1QNMUMEUD",
  privacyHref: "#",
  social: {
    handle: "@sinavillamatilde",
    href: "https://www.instagram.com/sinavillamatilde/",
  },
  secondaryContact: {
    value: "info@sinavillamatilde.it",
    href: "mailto:info@sinavillamatilde.it",
  },
};
