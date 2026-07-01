import type { PostSummary, PostBossCharacterIcon } from "@/app/lib/api";

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";
const WEAPON_ICON_BASE = process.env.NEXT_PUBLIC_WEAPON_ICON_BASE_URL ?? "";

type StygianPostCardProps = {
  post: PostSummary;
  highlightBossId?: number; // when a boss filter chip is active, highlight that boss row
};

function formatClearTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function CharacterChip({ c }: { c: PostBossCharacterIcon }) {
  return (
    <div className="flex items-center gap-1.5 bg-base-300/70 rounded-md px-1.5 py-1" title={c.charName}>
      <img
        src={`${CHAR_ICON_BASE}/${c.charSlug}/icon.webp`}
        alt={c.charName}
        className="w-7 h-7 rounded-md object-cover shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <div className="text-[11px] leading-tight">
        <p className="font-medium">
          <span className="opacity-60">C{c.cons}</span> {c.charName}
        </p>
        {c.weaponName && (
          <p className="opacity-70 flex items-center gap-1">
            {c.weaponSlug && c.weaponTypeSlug && (
              <img
                src={`${WEAPON_ICON_BASE}/${c.weaponTypeSlug}/${c.weaponSlug}.png`}
                alt={c.weaponName}
                className="w-4 h-4 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            R{c.refinement} {c.weaponName}
          </p>
        )}
      </div>
    </div>
  );
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

        {/* Stygian version + difficulty + total cost + video */}
        <div className="flex items-center gap-2">
          <span className="badge badge-outline badge-xs">{post.stygianName}</span>
          <span
            className={`badge badge-xs font-semibold ${
              post.difficulty === "Dire" ? "badge-error" : "badge-warning"
            }`}
          >
            {post.difficulty}
          </span>
          <span className="badge badge-xs badge-outline" title="Total cost">
            💰 {post.totalCost}
          </span>
          {post.videoLink && (
            <a
              href={post.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn btn-circle btn-xs btn-info ml-auto"
              title="Watch clear video"
            >
              ▶
            </a>
          )}
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

                  {/* Characters — icon, cons, weapon + refinement */}
                  {boss.characters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {boss.characters.map((c) => (
                        <CharacterChip key={c.charId} c={c} />
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
