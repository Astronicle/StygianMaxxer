"use client";

import { useState } from "react";

type RatingStarsProps = {
  rating: number;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  // When provided, the stars become clickable and call onRate(1-5) on click.
  // Hovering previews the value before committing.
  onRate?: (value: number) => void;
  disabled?: boolean;
};

const SIZE_CLASS: Record<NonNullable<RatingStarsProps["size"]>, string> = {
  xs: "rating-xs",
  sm: "rating-sm",
  md: "rating-md",
  lg: "rating-lg",
};

export default function RatingStars({
  rating,
  max = 5,
  size = "sm",
  onRate,
  disabled = false,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = !!onRate && !disabled;
  const displayValue = hovered ?? rating;

  return (
    <div
      className={`rating ${SIZE_CLASS[size]} ${interactive ? "cursor-pointer" : ""}`}
      onMouseLeave={interactive ? () => setHovered(null) : undefined}
    >
      {Array.from({ length: max }).map((_, i) => { //map accepts map((element, index, array) => ...), so we can ignore the element and just use the index. We dont care what the _ is holding because we already made it undefined
        const starValue = i + 1;
        return (
          <input
            key={i}
            type="radio"
            className={`mask mask-star-2 bg-warning ${interactive ? "cursor-pointer" : ""}`}
            checked={starValue <= Math.round(displayValue)}
            readOnly={!interactive}
            disabled={disabled}
            onMouseEnter={interactive ? () => setHovered(starValue) : undefined}
            onClick={interactive ? () => onRate!(starValue) : undefined}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
          />
        );
      })}
    </div>
  );
}
