type Boss = {
  id: number;
  name: string;
  icon: string;
};

type StygianDetailHeaderProps = {
  version: string;
  bosses: Boss[];
};

export default function StygianDetailHeader({
  version,
  bosses,
}: StygianDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        Stygian {version}
      </h1>

      <div className="flex flex-wrap gap-3">
        {bosses.map((boss) => (
          <div
            key={boss.id}
            className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2"
          >
            <img
              src={boss.icon}
              alt={boss.name}
              className="w-8 h-8 rounded-md"
            />
            <span className="text-sm font-medium">
              {boss.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
