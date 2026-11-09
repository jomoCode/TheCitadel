import { Star } from "lucide-react";

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={className} role="img" aria-label={`Rated ${rating} out of 5`}>
      <div className="flex gap-1 text-gold">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="size-3.5" fill={i < rating ? "currentColor" : "none"} aria-hidden />
        ))}
      </div>
    </div>
  );
}
