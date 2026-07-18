import type { Locale, Messages } from "../types";
import { it } from "./it";
import { en } from "./en";
import { fr } from "./fr";
import { de } from "./de";
import { es } from "./es";
import { ru } from "./ru";
import { zh } from "./zh";

export const MESSAGES: Record<Locale, Messages> = {
  it,
  en,
  fr,
  de,
  es,
  ru,
  zh,
};
