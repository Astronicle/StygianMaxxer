import type { Boss } from "@/app/lib/api";

// Boss icons live at: <BOSS_ICON_BASE>/<bossSlug>/model.webp
// The old card used NEXT_PUBLIC_ICON_BASE_URL (wrong — undefined in .env).
// Fixed to use NEXT_PUBLIC_BOSS_ICON_BASE_URL.
const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";

type BossBrowseCardProps = {
  boss: Boss;
};

export default function BossBrowseCard({ boss }: BossBrowseCardProps) {
  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
      <div className="card-body items-center justify-center text-center gap-3">
        <img
          src={`${BOSS_ICON_BASE}/${boss.slug}/model.webp`}
          alt={boss.name}
          className="w-24 h-24 object-contain"
          onError={(e) => {
            // If the Supabase asset is missing, show a placeholder box
            const img = e.target as HTMLImageElement;
            img.style.display = "none";
          }}
        />
        <h3 className="font-semibold text-lg">{boss.name}</h3>
      </div>
    </div>
  );
}
