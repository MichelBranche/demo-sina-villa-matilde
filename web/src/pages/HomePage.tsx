import { SiteShell } from "../components/layout/SiteShell";
import { Hero } from "../components/sections/Hero";
import { AboutSection } from "../components/sections/AboutSection";
import { SpacesShowcase } from "../components/sections/SpacesShowcase";
import { DearVilla } from "../components/sections/DearVilla";
import { VillaStory } from "../components/sections/VillaStory";
import { ContactCta } from "../components/sections/ContactFooter";
import { useLocale } from "../i18n/locale";

export function HomePage() {
  const { locale } = useLocale();

  return (
    <SiteShell withIntro>
      <div key={locale}>
        <Hero />
        <AboutSection />
        <SpacesShowcase />
        <DearVilla />
        <VillaStory />
        <ContactCta />
      </div>
    </SiteShell>
  );
}
