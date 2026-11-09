import type { BlogCategory, BlogPost } from "@/features/marketing/types";

export const blogCategories: BlogCategory[] = [
  { slug: "buying-guides", name: "Buying Guides" },
  { slug: "investment", name: "Investment" },
  { slug: "company-news", name: "Company News" },
];

/** Default seeded article so the journal is never empty. Mirrors the backend `posts` seed. */
export const blogPosts: BlogPost[] = [
  {
    slug: "location-first-how-to-choose-a-home-that-grows-in-value",
    title: "Location First: How to Choose a Home That Grows in Value",
    excerpt:
      "Finishes can be changed and furniture replaced, but you can never move a building. Here is how experienced buyers judge a location before they look at a single floor plan.",
    author: { name: "Chiamaka Eze", role: "Head of Sales Advisory" },
    category: blogCategories[0],
    tags: ["Buying tips", "Investment", "Abuja"],
    publishedAt: "2026-10-28",
    readingMinutes: 6,
    featuredImage: { src: "/images/blog/location-first.jpg", alt: "Modern residential building at golden hour" },
    seo: {
      title: "How to Choose a Location That Grows in Value | Citadel Journal",
      description:
        "Five practical checks experienced buyers use to judge a neighbourhood in Abuja before they commit to a home.",
    },
    body: [
      {
        kind: "paragraph",
        text: "Ask any long-time property owner what they would do differently and most give the same answer: they would have paid more attention to where, not just what. A beautiful kitchen dates in ten years. A great location tends to improve.",
      },
      { kind: "heading", text: "1. Follow the infrastructure" },
      {
        kind: "paragraph",
        text: "New roads, rail lines, airports and business districts are the strongest signals of future demand. Homes within easy reach of committed public projects — not just announced ones — usually appreciate faster once construction begins.",
      },
      { kind: "heading", text: "2. Check the daily journey" },
      {
        kind: "paragraph",
        text: "Drive the route to work, school and the shops at rush hour, not on a quiet Sunday. Time saved every day is the most underrated luxury in a big city, and buyers and tenants will pay for it.",
      },
      { kind: "heading", text: "3. Look at what is already around you" },
      {
        kind: "list",
        items: [
          "Good schools within 15 minutes",
          "Hospitals and pharmacies close by",
          "Reliable power and water infrastructure",
          "Restaurants, gyms and green space nearby",
        ],
      },
      { kind: "heading", text: "4. Ask who will manage the estate" },
      {
        kind: "paragraph",
        text: "A well-run estate holds its value. Ask how security is organised, how service charges are set and reported, and how quickly maintenance requests are handled. Transparent management protects your investment long after handover.",
      },
      {
        kind: "quote",
        text: "The best time to think about estate management is before you buy, not after the first problem.",
        cite: "Chiamaka Eze",
      },
      { kind: "heading", text: "5. Verify the title" },
      {
        kind: "paragraph",
        text: "Before paying any deposit, confirm the land title with the relevant land registry and ask your lawyer to review the documents. A reputable developer will welcome the scrutiny and share everything you need.",
      },
      {
        kind: "image",
        image: { src: "/images/blog/location-first-2.jpg", alt: "City skyline with residential towers" },
        caption: "Proximity to business districts remains one of the strongest drivers of long-term value.",
      },
      {
        kind: "paragraph",
        text: "Thinking about a home in Abuja? Our advisers are happy to walk you through any of these checks for the neighbourhoods you are considering — with no obligation to buy.",
      },
    ],
  },
];
