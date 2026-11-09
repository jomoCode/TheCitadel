import type { Testimonial } from "@/features/marketing/types";

/** Dummy testimonials — NOT shown on the site. Replace with real, consented client quotes before displaying them. */
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Adaeze O.",
    location: "Jabi, Abuja",
    purchase: "4-bedroom terrace, Cedar Gardens",
    quote:
      "From the first viewing to the day we collected our keys, everything was clear and calm. Paying the service charge and letting guests in from my phone is a small luxury I now can't live without.",
    rating: 5,
    image: { src: "/images/testimonials/bento-1.jpg", alt: "Modern home with timber deck surrounded by greenery" },
  },
  {
    id: "t2",
    name: "Tunde & Bisi A.",
    location: "Maitama, Abuja",
    purchase: "Detached duplex, Meridian Court",
    quote:
      "We bought off-plan from London. Monthly progress photos, honest timelines and a payment plan that actually fit our lives — it felt like the team was building for us.",
    rating: 5,
    image: { src: "/images/testimonials/bento-2.jpg", alt: "Stone family house with a manicured lawn" },
  },
  {
    id: "t3",
    name: "Ibrahim K.",
    location: "Wuse 2, Abuja",
    purchase: "2-bedroom serviced apartment, Azure Residences",
    quote:
      "I wanted an investment that ran itself. The monthly statements are clear and the apartment has stayed booked. Professional from start to finish.",
    rating: 5,
    image: { src: "/images/testimonials/bento-3.jpg", alt: "Contemporary courtyard home with open living space" },
  },
];
