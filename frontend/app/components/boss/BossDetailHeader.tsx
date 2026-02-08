type BossDetailHeaderProps = {
  name: string;
  icon: string;
  stygianVersions: string[];
};

export default function BossDetailHeader({
  name,
  icon,
  stygianVersions,
}: BossDetailHeaderProps) {
  return (
    <div className="flex items-center gap-6">
      <img
        src={icon}
        alt={name}
        className="w-28 h-28 object-contain"
      />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{name}</h1>

        <div className="flex flex-wrap gap-2">
          {stygianVersions.map((ver) => (
            <span
              key={ver}
              className="badge badge-outline"
            >
              Stygian {ver}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
