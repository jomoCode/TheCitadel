import Image from "next/image";
import type { BlogBlock } from "@/features/marketing/types";

/** Renders structured article blocks with editorial typography. */
export function ArticleBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-6 text-base leading-[1.85] text-foreground/90 md:text-lg">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "paragraph":
            return <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-none first-letter:text-gold" : undefined}>{block.text}</p>;
          case "heading":
            return <h2 key={i} className="pt-6 font-display text-2xl text-foreground md:text-3xl">{block.text}</h2>;
          case "list":
            return (
              <ul key={i} className="space-y-2 pl-1">
                {block.items.map((item) => <li key={item} className="flex gap-3"><span className="mt-3 h-px w-4 shrink-0 bg-gold" aria-hidden />{item}</li>)}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i} className="my-10 border-l-2 border-gold pl-6">
                <p className="font-display text-2xl italic leading-snug md:text-3xl">&ldquo;{block.text}&rdquo;</p>
                {block.cite && <cite className="text-eyebrow mt-3 block not-italic text-muted-foreground">— {block.cite}</cite>}
              </blockquote>
            );
          case "image":
            return (
              <figure key={i} className="-mx-5 my-10 md:mx-0">
                <div className="relative aspect-[16/9] overflow-hidden md:rounded-brand">
                  <Image src={block.image.src} alt={block.image.alt} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
                </div>
                {block.caption && <figcaption className="mt-3 px-5 text-sm text-muted-foreground md:px-0">{block.caption}</figcaption>}
              </figure>
            );
        }
      })}
    </div>
  );
}
