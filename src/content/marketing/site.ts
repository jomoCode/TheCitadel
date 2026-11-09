/** Brand-wide settings. The phone numbers are still placeholders — replace with Quo's real numbers before launch. */
export const siteConfig = {
  name: "The Citadel",
  legalName: "Quo Engineering & Construction Limited",
  tagline: "Luxury in Peace & Comfort",
  description:
    "The Citadel, Asokoro — a private collection of eight en-suite three-bedroom residences in Abuja’s diplomatic enclave, developed by Quo Engineering & Construction Limited.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  developerUrl: "https://www.quoec.com",
  ogImage: "/images/hero/hero-buildings-dusk.jpg",
  contact: {
    phone: "+234 (0) 201 555 0188",
    mobile: "+234 (0) 908 555 0144",
    email: "enquiries@quoec.com",
    address: "15 Mary Slessor Street, Asokoro, Abuja, Nigeria",
    hours: "Mon – Fri, 8:30am – 5:30pm · Sat by appointment",
    mapQuery: "15 Mary Slessor Street, Asokoro, Abuja",
  },
  socials: [
    { name: "Instagram", href: "https://instagram.com" },
    { name: "LinkedIn", href: "https://linkedin.com" },
    { name: "Facebook", href: "https://facebook.com" },
    { name: "X", href: "https://x.com" },
  ],
} as const;

export const mainNav = [
  { label: "Properties", href: "/properties" },
  {
    label: "Buy · Rent · Sell",
    href: "/guides/how-to-buy",
    children: [
      { label: "How to buy", href: "/guides/how-to-buy" },
      { label: "How to rent", href: "/guides/how-to-rent" },
      { label: "Sell your land", href: "/guides/sell-your-land" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/blog" },
  { label: "Referrals", href: "/referral" },
] as const;

export const footerNav = {
  explore: [
    { label: "Properties", href: "/properties" },
    { label: "About us", href: "/about" },
    { label: "Journal", href: "/blog" },
    { label: "FAQs", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  services: [
    { label: "How to buy", href: "/guides/how-to-buy" },
    { label: "How to rent", href: "/guides/how-to-rent" },
    { label: "Sell your land", href: "/guides/sell-your-land" },
    { label: "Referral programme", href: "/referral" },
    { label: "Resident login", href: "/login" },
  ],
  legal: [
    { label: "Privacy policy", href: "/legal/privacy" },
    { label: "Terms & conditions", href: "/legal/terms" },
    { label: "Disclaimer", href: "/legal/disclaimer" },
  ],
} as const;

/** Key figures for The Citadel (from the client's brochure copy). */
export const keyFigures = [
  { value: "8", label: "Residences only" },
  { value: "3", label: "Bedrooms, en-suite" },
  { value: "≈217 m²", label: "Premium residences" },
  { value: "2", label: "Parking bays each" },
] as const;

/** The group behind the developer (from the client's brochure copy). */
export const developerGroup = ["Houses for Africa Nigeria Limited", "Mobus Property Nigeria Limited", "River Park Estate, Abuja"] as const;
