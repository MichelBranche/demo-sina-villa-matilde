import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MESSAGES } from "./messages";
import {
  LOCALE_META,
  LOCALES,
  type Locale,
  type Messages,
} from "./types";

export type { Locale, Messages };
export { LOCALES, LOCALE_META };

const STORAGE_KEY = "villa:locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (LOCALES as string[]).includes(stored)) {
      return stored as Locale;
    }
  } catch {
    /* ignore */
  }
  return "it";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === "undefined" ? "it" : readStoredLocale(),
  );

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = LOCALE_META[locale].htmlLang;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: MESSAGES[locale],
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
