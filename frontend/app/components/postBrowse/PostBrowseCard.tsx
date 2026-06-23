type BossSummary = {
  bossId: number;
  bossSlug: string;
  bossName: string;
  clearTime: number;
  cost: number;
  characters: { charId: number; charSlug: string; charName: string }[];
};

type PostBrowseCardProps = {
  postId: number;
  title: string;
  username: string;
  stygianName: string;
  averageRating: number | null;
  ratingCount: number;
  createdAt: string;
  difficulty: "Fearless" | "Dire";
  totalClearTime: number;
  totalCost: number;
  bosses: BossSummary[];
};

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";

function formatClearTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function PostBrowseCard({
  title,
  username,
  stygianName,
  averageRating,
  ratingCount,
  createdAt,
  difficulty,
  totalClearTime,
  totalCost,
  bosses,
}: PostBrowseCardProps) {
  return (
    <div className="card bg-base-200 shadow-md min-w-72 shrink-0 hover:shadow-lg transition-shadow">
      <div className="card-body gap-3">
        <h3 className="card-title text-lg line-clamp-1">{title}</h3>

        <div className="flex items-center gap-2">
          <span className="badge badge-outline badge-sm">{stygianName}</span>
          <span className={`badge badge-sm font-semibold ${difficulty === "Dire" ? "badge-error" : "badge-warning"}`}>
            {difficulty}
          </span>
          <span className="badge badge-sm badge-outline ml-auto" title="Total cost">
            💰 {totalCost}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-sm opacity-70">
          <span>By {username}</span>
          <span>•</span>
          <span>{new Date(createdAt).toDateString()}</span>
        </div>

        {/* Per-boss: icon + name + characters + cost + clear time */}
        {bosses.length > 0 && (
          <div className="space-y-3">
            {bosses.map((b) => (
              <div key={b.bossId} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <img
                    src={`${BOSS_ICON_BASE}/${b.bossSlug}/model.webp`}
                    alt={b.bossName}
                    className="w-6 h-6 object-contain shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="flex-1 truncate">{b.bossName}</span>
                  <span className="opacity-60 text-xs shrink-0">{b.cost}c · {formatClearTime(b.clearTime)}</span>
                </div>
                {b.characters.length > 0 && (
                  <div className="flex items-center gap-1 pl-8">
                    {b.characters.map((c) => (
                      <img
                        key={c.charId}
                        src={`${CHAR_ICON_BASE}/${c.charSlug}/icon.webp`}
                        alt={c.charName}
                        title={c.charName}
                        className="w-7 h-7 rounded-md object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="font-medium">{averageRating != null ? averageRating.toFixed(1) : "—"}</span>
            <span className="opacity-60">({ratingCount} ratings)</span>
          </div>
          <span className="opacity-40">•</span>
          <span className="opacity-80">⏱ {formatClearTime(totalClearTime)} total</span>
        </div>
      </div>
    </div>
  );
}
