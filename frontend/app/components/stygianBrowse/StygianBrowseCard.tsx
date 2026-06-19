import type { Stygian } from "@/app/lib/api";

// Boss icons live at: <BOSS_ICON_BASE>/<bossSlug>/model.webp
// Same URL pattern used in post/[postID]/page.tsx
const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";

type StygianBrowseCardProps = {
  stygian: Stygian;
};

export default function StygianBrowseCard({ stygian }: StygianBrowseCardProps) {
  // Sort bosses by their slot number so they always appear in order
  const sortedBosses = [...stygian.bosses].sort((a, b) => a.slot - b.slot);

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <div className="card-body gap-4">
        {/* Header — name is something like "Stygian Onslaught", version is "6.2" */}
        <h3 className="card-title text-xl">
          {stygian.name} <span className="opacity-60 text-base">v{stygian.version}</span>
        </h3>

        {/* Boss chips with icons from Supabase */}
        <div className="flex flex-wrap gap-3">
          {sortedBosses.map((boss) => (
            <div
              key={boss.bossId}
              className="flex items-center gap-2 bg-base-300 rounded-lg px-2 py-1"
            >
              <img
                src={`${BOSS_ICON_BASE}/${boss.bossSlug}/model.webp`}
                alt={boss.bossName}
                className="w-8 h-8 rounded-md object-cover"
                // Graceful fallback if the Supabase asset doesn't exist yet
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-sm">{boss.bossName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
