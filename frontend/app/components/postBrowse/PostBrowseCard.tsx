type Boss = {
  id: number;
  name: string;
  icon: string;
};

type PostBrowseCardProps = {
  postID: number;
  title: string;
  description: string;
  username: string;
  stygianVersion: string;
  rating: number;
  bosses: Boss[];
  createdAt: string;
};

export default function PostBrowseCard({
  title,
  description,
  username,
  stygianVersion,
  rating,
  bosses,
  createdAt,
}: PostBrowseCardProps) {
  return (
    <div className="card bg-base-200 shadow-md min-w-90 shrink-0">
      <div className="card-body gap-3">
        <div>
          <h3 className="card-title text-lg">{title}</h3>
          <p className="text-sm opacity-80 line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm opacity-70">
          <span>By {username}</span>
          <span>•</span>
          <span>Stygian {stygianVersion}</span>
          <span>•</span>
          <span>⭐ {rating}/5</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Boss icons */}
          <div className="flex gap-2">
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

          <span className="text-xs opacity-60">
            {new Date(createdAt).toDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
