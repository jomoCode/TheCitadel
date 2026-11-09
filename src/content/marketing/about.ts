import { citadel } from "./citadel";

/** About page. Facts come only from the client's brochure copy; mission and values are placeholders for the client to confirm. */
export const aboutContent = {
  heroImage: { src: "/images/hero/hero-buildings-dusk.jpg", alt: "Contemporary residences lit at dusk (illustrative image)" },
  story: [
    citadel.developer,
    "With The Citadel, the team brings that experience to Asokoro: a boutique, residents-only development of eight residences on Mary Slessor Street, in Abuja’s diplomatic and security zone.",
    "Every detail — from en-suite bedrooms and domestic quarters to a concierge-served secured lobby — is designed for one idea: luxury in peace and comfort.",
  ],
  mission: "To create a small number of exceptional residences, built to last and cared for with the attention their owners deserve.",
  vision: "Homes where privacy, security and calm are part of the design — not an afterthought.",
  values: [
    { title: "Quality", body: "Quality assured — in the design, the materials and the finish." },
    { title: "Privacy", body: "A boutique, residents-only development with only eight homes." },
    { title: "Security", body: "A protected address, a secured lobby and a security post on site." },
    { title: "Care", body: "Attentive service from the first viewing to long after you move in." },
  ],
} as const;

export const referralContent = {
  heroImage: { src: "/images/hero/interior-lounge.jpg", alt: "Elegant living room with soft light" },
  commission: "1%",
  steps: [
    { title: "Register as a referrer", body: "Fill in the short form below. Individuals and companies are both welcome." },
    { title: "Introduce a buyer", body: "Share the buyer's details with us, or ask them to mention your name when they contact us." },
    { title: "They buy a home", body: "Our advisers look after your contact through viewing, reservation and purchase." },
    { title: "You get paid", body: "Once their purchase is complete, we pay you 1% of the sale value." },
  ],
  terms: [
    "Commission is paid once the buyer has completed payment in full.",
    "The buyer must not already be in contact with us about the same property.",
    "Referral commissions are paid by bank transfer within 30 days of completion.",
  ],
} as const;

export const legalPages = {
  privacy: {
    title: "Privacy policy",
    body: [
      "This placeholder privacy notice explains how Quo Engineering & Construction Limited collects and uses personal information through this website, in line with the Nigeria Data Protection Act 2023.",
      "We collect the details you choose to give us (such as your name, email address and phone number) to respond to your enquiry. We also collect anonymous usage information to improve the website.",
      "We do not sell your information. You may ask to see, correct or delete the personal data we hold about you by emailing our data protection officer.",
      "The final privacy policy will be provided by the client and reviewed by counsel before launch.",
    ],
  },
  terms: {
    title: "Terms & conditions",
    body: [
      "These placeholder terms govern the use of this website. Property information, images and prices are provided for guidance and do not form part of any contract.",
      "The final terms will be provided by the client and reviewed by counsel before launch.",
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    body: [
      "Images on this website include computer-generated illustrations and stock photography for demonstration purposes. Specifications and prices may change without notice.",
    ],
  },
} as const;
