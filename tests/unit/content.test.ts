import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanBlocks, emptyBlock } from "@/features/content/components/BlockEditor";
import { contactProblem } from "@/features/content/components/ContactSettingsForm";
import { toPostInput } from "@/features/content/components/PostEditor";
import { pageMetadata, postFromApi } from "@/features/marketing/services/ContentSource";

const contact = { phone: "+234 803 000 0000", mobile: "0909 000 0000", email: "enquiries@quoec.com", address: "15 Mary Slessor Street", hours: "", mapQuery: "" };

describe("article blocks", () => {
  it("drops empty blocks and blank list items before saving", () => {
    expect(cleanBlocks([
      { kind: "paragraph", text: "  Hello  " }, { kind: "heading", text: " " }, { kind: "list", items: ["Pool", "", " Gym "] },
      { kind: "list", items: [""] }, { kind: "image", image: { src: "", alt: "" } }, { kind: "quote", text: "Calm", cite: " " },
    ])).toEqual([{ kind: "paragraph", text: "Hello" }, { kind: "list", items: ["Pool", "Gym"] }, { kind: "quote", text: "Calm", cite: undefined }]);
  });

  it("creates the right empty block for each kind", () => {
    expect(emptyBlock("list")).toEqual({ kind: "list", items: [""] });
    expect(emptyBlock("image")).toEqual({ kind: "image", image: { src: "", alt: "" } });
  });

  it("turns the editor draft into the API payload", () => {
    const input = toPostInput({ title: " Why Asokoro ", excerpt: "x", category_id: "", tags: "Abuja, , Buying tips ", author_name: " ", author_role: "",
      body: [{ kind: "paragraph", text: "Hi" }], seo_title: "", seo_description: " Calm " });
    expect(input).toMatchObject({ title: "Why Asokoro", category_id: null, tags: ["Abuja", "Buying tips"], author_name: "The Citadel team", author_role: null,
      seo_title: null, seo_description: "Calm" });
  });
});

describe("contact details check", () => {
  it("explains problems in plain words", () => {
    expect(contactProblem(contact, [])).toBeNull();
    expect(contactProblem({ ...contact, phone: "call us" }, [])).toMatch(/digits/);
    expect(contactProblem({ ...contact, email: "nope" }, [])).toMatch(/email/);
    expect(contactProblem(contact, [{ name: "Instagram", href: "instagram.com" }])).toMatch(/https/);
  });
});

describe("journal mapping", () => {
  it("fills in a cover and category when an article has none", () => {
    const post = postFromApi({ slug: "a", title: "A", excerpt: "E", body: [], featured_image_url: null, featured_image_alt: null, author_name: "Team", author_role: null,
      category: null, tags: [], published_at: "2026-11-08T10:00:00Z", reading_minutes: 2, seo_title: null, seo_description: null });
    expect(post.category).toEqual({ slug: "journal", name: "Journal" });
    expect(post.featuredImage.src).toMatch(/^\/images\//);
    expect(post.seo).toEqual({ title: "A", description: "E" });
  });
});

describe("pageMetadata", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("uses the team's search text when set, and the built-in text otherwise", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify([{ path: "/about", title: "About Quo", description: null, image_url: null }]))));
    const about = await pageMetadata("/about", { title: "About Us", description: "Built-in" });
    expect(about).toMatchObject({ title: "About Quo", description: "Built-in", alternates: { canonical: "/about" } });
    const faq = await pageMetadata("/faq", { title: "FAQs", description: "Answers" });
    expect(faq.title).toBe("FAQs");
  });
});
