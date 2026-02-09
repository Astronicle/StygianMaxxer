type Boss = {
  id: number;
  name: string;
  icon: string;
};

type StygianPostCardProps = {
  postID: number;
  title: string;
  description: string;
  rating: number;
  username: string;
  createdAt: string;
  bosses: Boss[];
};

export default function StygianPostCard({
  title,
  description,
  rating,
  username,
  createdAt,
  bosses,
}: StygianPostCardProps) {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body gap-3">
        <h3 className="card-title text-lg">
          {title}
        </h3>

        <p className="text-sm opacity-80 line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 text-sm opacity-70">
          <span>By {username}</span>
          <span>•</span>
          <span>⭐ {rating}/5</span>
          <span>•</span>
          <span>
            {new Date(createdAt).toDateString()}
          </span>
        </div>

        <div className="flex gap-2 mt-2">
          {bosses.map((boss) => (
            <div
              key={boss.id}
              className="tooltip"
              data-tip={boss.name}
            >
              <img
                src={boss.icon}
                alt={boss.name}
                className="w-9 h-9 rounded-md object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
