import type { Stygian } from "@/app/lib/api";

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";

type StygianDetailHeaderProps = {
  stygian: Stygian;
};

export default function StygianDetailHeader({ stygian }: StygianDetailHeaderProps) {
  const sortedBosses = [...stygian.bosses].sort((a, b) => a.slot - b.slot);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        {stygian.name}{" "}
        <span className="text-xl opacity-60">v{stygian.version}</span>
      </h1>

      {/* Boss chips */}
      <div className="flex flex-wrap gap-3">
        {sortedBosses.map((boss) => (
          <div
            key={boss.bossId}
            className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2"
          >
            <img
              src={`${BOSS_ICON_BASE}/${boss.bossSlug}/model.webp`}
              alt={boss.bossName}
              className="w-8 h-8 rounded-md object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="text-sm font-medium">{boss.bossName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
