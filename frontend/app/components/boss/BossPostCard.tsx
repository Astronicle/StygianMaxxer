type BossPostCardProps = {
  id: number;
  title: string;
  description: string;
  rating: number;
  createdAt: string;
};

export default function BossPostCard({
  title,
  description,
  rating,
  createdAt,
}: BossPostCardProps) {
  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body gap-2">
        <h3 className="card-title text-lg">{title}</h3>

        <p className="text-sm opacity-80 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between text-sm opacity-70">
          <span>{new Date(createdAt).toDateString()}</span>
          <span>⭐ {rating}/5</span>
        </div>
      </div>
    </div>
  );
}
