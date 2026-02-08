type Boss = {
  id: number;
  name: string;
  icon: string;
};

type PostCardProps = {
  postID: number;
  title: string;
  stygianVersion: string;
  bossesKilled: Boss[];
};

export default function PostCard({
  title,
  stygianVersion,
  bossesKilled,
}: PostCardProps) {
  return (
    <div className="card bg-base-200 shadow-md min-w-70 shrink-0">
      <div className="card-body p-4">
        <h3 className="card-title text-lg">{title}</h3>

        <p className="text-sm opacity-70">
          Version {stygianVersion}
        </p>

        <div className="flex gap-2 mt-3">
          {bossesKilled.map((boss) => (
            <div
              key={boss.id}
              className="tooltip"
              data-tip={boss.name}
            >
              <img
                src={boss.icon}
                alt={boss.name}
                className="w-10 h-10 rounded-md object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
