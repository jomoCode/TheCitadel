import type { Property } from "@/features/marketing/types";

/**
 * The Citadel, Asokoro — the development the website sells. Copy supplied by the client (Quo Engineering & Construction).
 * Single source for the home page, the listing, the about page and the backend seed. Images are placeholders for now.
 */
export const CITADEL_SLUG = "the-citadel-asokoro";

export const citadel = {
  name: "The Citadel",
  tagline: "Luxury in Peace & Comfort",
  place: "Asokoro • Abuja",
  status: "Now selling",
  intro:
    "On the hilltop of Asokoro — Abuja’s diplomatic enclave, within the security zone of the Presidential Villa — The Citadel is a private collection of just eight three-bedroom residences, each en-suite throughout and each with its own domestic quarters.",
  detail:
    "Opposite the Embassy of Israel on Mary Slessor Street, The Citadel pairs the capital’s most protected address with the calm of a boutique, residents-only development: a landscaped swimming pool deck, a concierge-served secured lobby, a residents’ gym, and green areas with a children’s playground. Eight residences only — luxury in peace and comfort, by design.",
  residences: [
    {
      label: "Residences",
      value: "Eight Three-Bedroom apartments",
      note: "En-suite throughout, each with domestic quarters (boys’ quarters)",
    },
    {
      label: "Premium residences",
      value: "≈ 217 m²",
      note: "Approximately 217 square metres",
    },
    {
      label: "Parking",
      value: "Two Bays",
      note: "Two dedicated bays for each residence",
    },
    {
      label: "Access",
      value: "Lift to all Floors",
      note: "Concierge, secured lobby and security post",
    },
    {
      label: "Amenities",
      value: "Pool, Gym & Play Area",
      note: "Swimming pool with landscaped deck; indoor gym; green area with children’s playground",
    },
    {
      label: "Availability",
      value: "Limited Release",
      note: "A limited release of Premium residences is offered for sale",
    },
  ],
  address: "15 Mary Slessor Street, Asokoro, Abuja",
  location:
    "15 Mary Slessor Street, Asokoro — opposite the Embassy of Israel and close to the High Commission of Malaysia, in the same diplomatic and security zone as the Presidential Villa. Permanent checkpoints and patrols make Asokoro widely regarded as Abuja’s safest address, and scarce land under strict development control keeps quality new residences rare.",
  distances: [
    { place: "Embassy of Israel", time: "Opposite" },
    { place: "Maitama", time: "8–12 minutes" },
    { place: "Wuse 2 dining and retail", time: "10–15 minutes" },
    { place: "Central Business District", time: "10–18 minutes" },
    { place: "Transcorp Hilton", time: "About 15 minutes" },
    { place: "Nnamdi Azikiwe International Airport", time: "30–45 minutes" },
  ],
  developer:
    "The Citadel is developed by Quo Engineering & Construction Limited, a luxury brand promoted by the principals of Houses for Africa Nigeria Limited and Mobus Property Nigeria Limited — the team behind River Park Estate in Abuja and award-winning luxury developments in Accra.",
  developerName: "Quo Engineering & Construction Limited",
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
  units: "Eight three-bedroom residences, en-suite throughout",
  bedroomsMin: 3,
  bedroomsMax: 3,
  completion: "",
  paymentPlan: false,
  featured: true,
  summary:
    "A private collection of just eight three-bedroom residences on the hilltop of Asokoro, Abuja’s diplomatic enclave.",
  description: [
    citadel.intro,
    citadel.detail,
    citadel.location,
    citadel.developer,
  ],
  features: [
    "Three bedrooms, en-suite throughout",
    "Domestic quarters (boys’ quarters) with every residence",
    "Premium residences of approximately 217 m²",
    "Two dedicated parking bays per residence",
    "Lift serving all floors",
  ],
  amenities: [
    "Swimming pool with landscaped deck",
    "Indoor residents’ gym",
    "Green area with children’s playground",
    "Concierge and secured lobby",
    "Security post",
  ],
  images: citadel.images.map((i) => ({ ...i })),
  seo: {
    title: "The Citadel, Asokoro — Luxury Three-Bedroom Residences in Abuja",
    description:
      "Eight en-suite three-bedroom residences with domestic quarters on Mary Slessor Street, Asokoro — Abuja’s diplomatic enclave. Now selling.",
  },
};
