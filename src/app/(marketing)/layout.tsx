import { SiteFooter } from "@/components/marketing/layout/SiteFooter";
import { SiteHeader } from "@/components/marketing/layout/SiteHeader";
import { AttributionCapture } from "@/components/marketing/layout/AttributionCapture";
import { GoogleAnalytics } from "@/components/marketing/layout/GoogleAnalytics";
import { GoogleTagManager } from "@/components/marketing/layout/GoogleTagManager";
import { PageViewTracker } from "@/components/marketing/layout/PageViewTracker";
import { SiteSettingsProvider } from "@/features/marketing/context/SiteSettingsContext";
import { loadSiteSettings } from "@/features/marketing/services/ContentSource";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const settings = await loadSiteSettings();
  return (
    <SiteSettingsProvider value={settings}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-4 focus:py-2">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <AttributionCapture />
      {process.env.NEXT_PUBLIC_GTM_ID ? <GoogleTagManager /> : <GoogleAnalytics />}
      <PageViewTracker />
    </SiteSettingsProvider>
  );
}
