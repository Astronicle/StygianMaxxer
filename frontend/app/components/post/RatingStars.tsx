type RatingStarsProps = {
  rating: number;
  max?: number;
};

export default function RatingStars({
  rating,
  max = 5,
}: RatingStarsProps) {
  return (
    <div className="rating rating-sm">
      {Array.from({ length: max }).map((_, i) => ( //map accepts map((element, index, array) => ...), so we can ignore the element and just use the index. We dont care what the _ is holding because we already made it undefined
        <input
          key={i}
          type="radio"
          className="mask mask-star-2 bg-warning"
          checked={i < rating}
          readOnly
        />
      ))}
    </div>
  );
}
