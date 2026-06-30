import type { PostSummary } from "@/app/lib/api";

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";

type StygianPostCardProps = {
  post: PostSummary;
  highlightBossId?: number; // when a boss filter chip is active, highlight that boss row
};

function formatClearTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function StygianPostCard({ post, highlightBossId }: StygianPostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
      <div className="card-body gap-3 p-4">
        <h3 className="card-title text-base line-clamp-1">{post.title}</h3>

        {/* Stygian version + difficulty + total cost */}
        <div className="flex items-center gap-2">
          <span className="badge badge-outline badge-xs">{post.stygianName}</span>
          <span
            className={`badge badge-xs font-semibold ${
              post.difficulty === "Dire" ? "badge-error" : "badge-warning"
            }`}
          >
            {post.difficulty}
          </span>
          <span className="badge badge-xs badge-outline ml-auto" title="Total cost">
            💰 {post.totalCost}
          </span>
        </div>

        <div className="text-xs opacity-60">
          By {post.username} · {formattedDate}
        </div>

        {/* Per-boss breakdown */}
        {post.bosses.length > 0 && (
          <div className="space-y-2 mt-1">
            {post.bosses.map((boss) => {
              const isHighlighted = highlightBossId != null && boss.bossId === highlightBossId;
              return (
                <div
                  key={boss.bossId}
                  className={`rounded-lg p-2 transition-colors ${
                    isHighlighted
                      ? "bg-primary/15 ring-1 ring-primary"
                      : "bg-base-300/50"
                  }`}
                >
                  {/* Boss header */}
                  <div className="flex items-center gap-2 text-sm">
                    <img
                      src={`${BOSS_ICON_BASE}/${boss.bossSlug}/model.webp`}
                      alt={boss.bossName}
                      className="w-5 h-5 object-contain shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className={`font-medium truncate ${isHighlighted ? "text-primary" : ""}`}>
                      {boss.bossName}
                    </span>
                    <span className="ml-auto flex items-center gap-2 shrink-0 text-xs opacity-60">
                      <span title="Cost">💰 {boss.cost}</span>
                      <span title="Clear time">⏱ {formatClearTime(boss.clearTime)}</span>
                    </span>
                  </div>

                  {/* Character icons */}
                  {boss.characters.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 pl-7">
                      {boss.characters.map((c) => (
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
              );
            })}
          </div>
        )}

        {/* Rating + total clear time */}
        <div className="flex items-center gap-1 text-xs mt-1">
          <span>⭐</span>
          <span className="font-medium">
            {post.averageRating != null ? post.averageRating.toFixed(1) : "—"}
          </span>
          <span className="opacity-60">({post.ratingCount} ratings)</span>
          <span className="opacity-40 mx-1">·</span>
          <span className="opacity-60">⏱ {formatClearTime(post.totalClearTime)} total</span>
        </div>
      </div>
    </div>
  );
}
