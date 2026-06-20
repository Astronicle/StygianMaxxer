import RatingStars from "./RatingStars";

type PostHeaderProps = {
  title: string;
  description: string;
  createdAt: string;
  difficulty: "Fearless" | "Dire";
  author: {
    username: string;
  };
  rating: number;
};

export default function PostHeader({
  title,
  description,
  createdAt,
  difficulty,
  author,
  rating,
}: PostHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">{title}</h1>

      <p className="opacity-80">{description}</p>

      <div className="flex items-center gap-4 text-sm opacity-70">
        <span>By {author.username}</span>
        <span>{new Date(createdAt).toDateString()}</span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`badge badge-sm font-semibold ${
            difficulty === "Dire" ? "badge-error" : "badge-warning"
          }`}
        >
          {difficulty}
        </span>
        <RatingStars rating={rating} />
      </div>
    </div>
  );
}
