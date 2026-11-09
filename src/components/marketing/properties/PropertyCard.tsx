import { BedDouble, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/marketing/primitives/StatusBadge";
import { InfoTip } from "@/components/ui/InfoTip";
import type { Property } from "@/features/marketing/types";
import { cn } from "@/lib/utils/cn";
import { formatBedrooms, priceLabel } from "@/lib/utils/format";

type PropertyCardProps = { property: Property; className?: string; priority?: boolean };

export function PropertyCard({ property, className, priority = false }: PropertyCardProps) {
  const cover = property.images[0];
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-brand bg-surface-muted">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <StatusBadge status={property.status} withTip={false} className="absolute left-4 top-4" />
        <div className="absolute inset-x-4 bottom-4 text-white">
          <p className="text-eyebrow flex items-center gap-1.5 text-white/80">
            <MapPin className="size-3" aria-hidden /> {property.neighbourhood}, {property.city}
          </p>
          <h3 className="mt-1 font-display text-2xl">
            <Link href={`/properties/${property.slug}`} className="after:absolute after:inset-0">
              {property.name}
            </Link>
          </h3>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <BedDouble className="size-4" aria-hidden /> {formatBedrooms(property.bedroomsMin, property.bedroomsMax)} · {property.type}
        </span>
        <span className="relative z-10 flex items-center gap-1 font-medium">
          {priceLabel(property.priceFrom, { compact: true, from: true })}
          {property.priceFrom > 0 && <InfoTip tip="marketing.priceFrom" label="About this price" />}
        </span>
      </div>
    </article>
  );
}
