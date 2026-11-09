// Exports the marketing seed content (TypeScript) to JSON for the backend seed migration,
// so both apps share one source of dummy content.
// Usage: node --experimental-strip-types scripts/export-seed.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const load = (p) => import(new URL(`../src/content/${p}`, import.meta.url).href);

const { properties: samples } = await load("marketing/properties.ts");
const { citadelListing } = await load("marketing/citadel.ts");
// The Citadel first; the samples are seeded too but hidden by migration 0013.
const properties = [citadelListing, ...samples];
const { testimonials } = await load("marketing/testimonials.ts");
const { blogPosts, blogCategories } = await load("blog/posts.ts");
const { faqs } = await load("marketing/faqs.ts");
const { siteConfig } = await load("marketing/site.ts");
const siteSettings = { contact: siteConfig.contact, socials: siteConfig.socials };

const out = resolve(root, "../backend/migrations/seed_data/marketing.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ properties, testimonials, blogPosts, blogCategories, faqs, siteSettings }, null, 2) + "\n");
console.log(`Wrote ${out}`);
