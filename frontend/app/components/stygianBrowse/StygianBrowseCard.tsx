type Boss = {
  id: number;
  name: string;
  icon: string;
};

type StygianBrowseCardProps = {
  stygianID: number;
  version: string;
  bosses: Boss[];
};

export default function StygianBrowseCard({
  version,
  bosses,
}: StygianBrowseCardProps) {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body gap-4">
        {/* Header */}
        <h3 className="card-title text-xl">
          Stygian {version}
        </h3>

        {/* Bosses */}
        <div className="flex flex-wrap gap-3">
          {bosses.map((boss) => (
            <div
              key={boss.id}
              className="flex items-center gap-2 bg-base-300 rounded-lg px-2 py-1"
            >
              <img
                src={boss.icon}
                alt={boss.name}
                className="w-8 h-8 rounded-md object-cover"
              />
              <span className="text-sm">{boss.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
