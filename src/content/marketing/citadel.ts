import type { Property } from "@/features/marketing/types";

/**
 * The Citadel, Asokoro — the development the website sells. Copy from the client's updated profile (Quo Engineering & Construction, Nov 2026).
 * Single source for the home page, the listing, the about page and the backend seed. Images are placeholders for now.
 */
export const CITADEL_SLUG = "the-citadel-asokoro";

export const citadel = {
  name: "The Citadel",
  tagline: "Luxury in Peace & Comfort",
  place: "Asokoro • Abuja",
  status: "Now selling",
  intro:
    "Nestled in the hills of Asokoro, on the prestigious Mary Slessor Street, The Citadel brings together luxury, comfort, security and prominence for the discerning buyer. It comprises just eight three-bedroom residences, each offering over 200 square metres of refined living space, with all bedrooms en-suite and a domestic quarters — a rare combination of generous space and true privacy.",
  detail:
    "A dedicated lift serves the residences, making movement effortless. Comfort is heightened by a large swimming pool, a fully equipped gym, and an expansive green recreational area overlooking the hills of Asokoro. The development is secured by a perimeter wall, round-the-clock professional security personnel and CCTV surveillance.",
  residences: [
    {
      label: "Residences",
      value: "Eight Three-Bedroom apartments",
      note: "All bedrooms en-suite, each residence with its own domestic quarters",
    },
    {
      label: "Premium residences",
      value: "≈ 217 m²",
      note: "Three bedrooms, all en-suite, with domestic quarters",
    },
    {
      label: "Deluxe residences",
      value: "≈ 204 m²",
      note: "Three bedrooms, all en-suite, with domestic quarters",
    },
    {
      label: "Parking & access",
      value: "Two Bays",
      note: "Two covered, secured bays per residence; dedicated lift to all floors",
    },
    {
      label: "Amenities",
      value: "Pool & Green Area",
      note: "Swimming pool with landscaped deck, gym, green recreational area and children’s playground",
    },
    {
      label: "Security",
      value: "Round the Clock",
      note: "Perimeter wall, manned security post, concierge-served secured lobby and CCTV surveillance",
    },
  ],
  address: "15 Mary Slessor Street, Asokoro, Abuja",
  location:
    "15 Mary Slessor Street, Asokoro — close to the High Commission of Malaysia, in the same diplomatic and security zone as the Presidential Villa. Mary Slessor Street is home to several diplomatic missions and is widely regarded as one of the most secure streets in Abuja; permanent checkpoints and patrols make Asokoro the capital’s safest address, and scarce land under strict development control keeps quality new residences rare.",
  distances: [
    { place: "Maitama", time: "8–12 minutes" },
    { place: "Central Business District", time: "10–18 minutes" },
    { place: "Wuse 2 Dining and Retail", time: "10–15 minutes" },
    { place: "NISA / Cedarcrest Hospitals", time: "10–15 minutes" },
    { place: "Transcorp Hilton", time: "About 15 minutes" },
    { place: "International Schools (AISA, Whiteplains)", time: "15–20 minutes" },
    { place: "Nnamdi Azikiwe International Airport", time: "30–45 minutes" },
  ],
  developer:
    "The Citadel is developed by Quo Engineering & Construction Limited, a luxury brand promoted by the principals of Houses for Africa Nigeria Limited and Mobus Property Nigeria Limited — the teams behind River Park Estate, one of Abuja’s largest residential developments, and award-recognised homes across Accra including The Monarch Residences, Phoenix Villas, Richfield Lifestyle Estate, Capella Place, Knight Court and Park Apartments, and Capital Place, Accra’s first office park.",
  developerName: "Quo Engineering & Construction Limited",
  /** Release and pricing line, from the updated profile (Nov 2026). */
  availability: "Only eight residences will be built — Premium and Deluxe, prices on application.",
  /** The client's profile brochure, served from /public. Offered for download wherever The Citadel is listed. */
  brochure: {
    href: "/downloads/the-citadel-brochure.pdf",
    fileName: "The-Citadel-Asokoro-Brochure.pdf",
    label: "Download the brochure",
    meta: "PDF · 7.2 MB",
  },
  promise: "Quality assured!",
  /** Architectural renders. [0] is the home hero, [1] the home showcase; the full set is the offline listing gallery. */
  images: [
    {
      src: "/images/citadel/entrance-sign.jpg",
      alt: "The Citadel entrance and stone signage wall (architectural render)",
    },
    {
      src: "/images/citadel/facade-corner.jpg",
      alt: "The Citadel from the street corner, five storeys with roof terrace (architectural render)",
    },
    {
      src: "/images/citadel/facade-front.jpg",
      alt: "Front elevation of The Citadel with palm-lined entrance (architectural render)",
    },
    {
      src: "/images/citadel/facade-side.jpg",
      alt: "The Citadel's balconies and timber-clad facade (architectural render)",
    },
    {
      src: "/images/citadel/entrance-gate.jpg",
      alt: "Gated car entrance beneath the residences (architectural render)",
    },
    {
      src: "/images/citadel/pool-loungers.jpg",
      alt: "Pool deck with sun loungers and outdoor lounge (architectural render)",
    },
    {
      src: "/images/citadel/pool-deck.jpg",
      alt: "Private pool and timber deck framed by mature trees (architectural render)",
    },
    {
      src: "/images/citadel/covered-parking.jpg",
      alt: "Covered residents' parking with timber ceiling (architectural render)",
    },
  ],
} as const;

/** The Citadel as a website listing (also seeded into the database by backend migration 0013). Price 0 = "Price on request". */
export const citadelListing: Property = {
  slug: CITADEL_SLUG,
  name: citadel.name,
  type: "Apartments",
  neighbourhood: "Asokoro",
  city: "Abuja",
  address: citadel.address,
  priceFrom: 0,
  status: "selling",
  units: "Eight three-bedroom residences — Premium (≈217 m²) and Deluxe (≈204 m²)",
  bedroomsMin: 3,
  bedroomsMax: 3,
  completion: "",
  paymentPlan: false,
  featured: true,
  summary:
    "Just eight three-bedroom residences of over 200 m², all en-suite, on Mary Slessor Street in the hills of Asokoro — Abuja’s diplomatic enclave.",
  description: [
    citadel.intro,
    citadel.detail,
    citadel.location,
    citadel.developer,
  ],
  features: [
    "Three bedrooms, all en-suite",
    "Domestic quarters with every residence",
    "Premium residences of approximately 217 m²",
    "Deluxe residences of approximately 204 m²",
    "Two covered, secured parking bays per residence",
    "Dedicated lift serving all floors",
    "Private balconies",
  ],
  amenities: [
    "Swimming pool with landscaped deck",
    "Fully equipped gym",
    "Green recreational area",
    "Children’s playground",
    "Concierge service",
    "Secured lobby & security post",
    "24-hour security",
    "Perimeter wall",
    "CCTV surveillance",
  ],
  images: citadel.images.map((i) => ({ ...i })),
  seo: {
    title: "The Citadel, Asokoro — Luxury Three-Bedroom Residences in Abuja",
    description:
      "Eight en-suite three-bedroom residences (≈204–217 m²) with domestic quarters on Mary Slessor Street, Asokoro — Abuja’s diplomatic enclave. Now selling.",
  },
};

/** True for any listing that is The Citadel ("Citadel", "The Citadel", "The Citadel, Asokoro"…) — these carry the brochure download. */
export function isCitadelProperty(property: Pick<Property, "name" | "slug">): boolean {
  return property.slug === CITADEL_SLUG || /\bcitadel\b/i.test(property.name);
}
