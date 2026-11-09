import type { Guide } from "@/features/marketing/types";

export const guides: Guide[] = [
  {
    slug: "how-to-buy",
    title: "How to buy a Citadel home",
    intro:
      "Buying a home should feel exciting, not confusing. Here is exactly what happens, step by step, from your first call to the day you receive your keys.",
    image: { src: "/images/guides/buy.jpg", alt: "Bright, elegant living room" },
    enquiryType: "purchase",
    steps: [
      { title: "Talk to an adviser", body: "Tell us your budget, preferred area and timeline. We shortlist homes that genuinely fit — no pressure." },
      { title: "Visit or take a virtual tour", body: "See the show home or finished units in person, or join a live video walkthrough from anywhere in the world." },
      { title: "Reserve your unit", body: "Pay a reservation deposit to hold your chosen home and price while the paperwork is prepared." },
      { title: "Sign your contract", body: "Review the sale agreement with your lawyer. We explain every clause in plain language before you sign." },
      { title: "Pay in full or by instalments", body: "Pay at once or follow an agreed payment plan. Every payment is receipted and visible in your buyer portal." },
      { title: "Handover & title", body: "Inspect your home, collect your keys and receive your title documents. Your resident app is activated on the same day." },
    ],
  },
  {
    slug: "how-to-rent",
    title: "How to rent with Citadel",
    intro: "Many of our owners let their homes through us. Renting is straightforward, transparent and fully managed.",
    image: { src: "/images/guides/rent.jpg", alt: "Calm furnished bedroom" },
    enquiryType: "rental",
    steps: [
      { title: "Share what you need", body: "Tell us the area, number of bedrooms, move-in date and budget." },
      { title: "View available homes", body: "We arrange viewings of vetted, well-maintained homes in our managed estates." },
      { title: "Apply & verify", body: "Submit a short application with ID and references. We usually respond within two working days." },
      { title: "Sign & move in", body: "Sign the tenancy, pay the agreed rent and service charge, and collect your keys." },
    ],
  },
  {
    slug: "sell-your-land",
    title: "Sell or develop your land with us",
    intro:
      "Own land in Abuja? We buy land outright or partner with landowners to develop it, and we are transparent about value every step of the way.",
    image: { src: "/images/guides/land.jpg", alt: "Open green land under a wide sky" },
    enquiryType: "landowner",
    steps: [
      { title: "Tell us about the land", body: "Share its location, size and the title documents you hold." },
      { title: "Site visit & due diligence", body: "Our team visits the site and verifies the title with the relevant land registry." },
      { title: "Receive an offer", body: "We present a cash offer or a joint-development proposal, with the numbers explained clearly." },
      { title: "Agree & complete", body: "Once both sides agree, lawyers complete the transfer or partnership agreement." },
    ],
  },
];
