"use client";

import { createContext, useContext } from "react";
import { siteConfig } from "@/content/marketing/site";
import type { SiteSettings } from "../services/ContentSource";

const fallback: SiteSettings = { contact: { ...siteConfig.contact }, socials: siteConfig.socials.map((s) => ({ ...s })) };
const SiteSettingsContext = createContext<SiteSettings>(fallback);

/** Gives client components (menu, forms, call buttons) the contact details the team edits in the admin. */
export function SiteSettingsProvider({ value, children }: { value: SiteSettings; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext);


