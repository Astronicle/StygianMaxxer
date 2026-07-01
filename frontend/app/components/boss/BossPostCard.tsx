import type { PostSummary, PostBossCharacterIcon } from "@/app/lib/api";

const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";
const WEAPON_ICON_BASE = process.env.NEXT_PUBLIC_WEAPON_ICON_BASE_URL ?? "";

type BossPostCardProps = {
  post: PostSummary;
  highlightBossId?: number; // boss this page is scoped to
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

export default function BossPostCard({ post, highlightBossId }: BossPostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  // Scope this card to just the boss the page is filtered to — the backend
  // attaches `bossClear` (this-boss-only clearTime/cost/characters) whenever
  // the /api/posts request is filtered by bossId, which the boss detail page
  // always does. Fall back to the matching entry in `bosses` just in case.
  const scoped =
    post.bossClear ??
    post.bosses.find((b) => highlightBossId != null && b.bossId === highlightBossId);

  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
      <div className="card-body gap-2 p-4">
        <h3 className="card-title text-base line-clamp-1">{post.title}</h3>

        <div className="flex items-center gap-2">
          <span className="badge badge-outline badge-xs">{post.stygianName}</span>
          <span className={`badge badge-xs font-semibold ${post.difficulty === "Dire" ? "badge-error" : "badge-warning"}`}>
            {post.difficulty}
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

        {/* Stats + characters for THIS boss only */}
        {scoped && (
          <div className="rounded-lg p-2 bg-primary/15 ring-1 ring-primary mt-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="ml-auto flex items-center gap-2 shrink-0 text-xs opacity-60">
                <span title="Cost">💰 {scoped.cost}</span>
                <span title="Clear time">⏱ {formatClearTime(scoped.clearTime)}</span>
              </span>
            </div>

            {scoped.characters.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {scoped.characters.map((c) => (
                  <CharacterChip key={c.charId} c={c} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 text-xs mt-1">
          <span>⭐</span>
          <span className="font-medium">{post.averageRating != null ? post.averageRating.toFixed(1) : "—"}</span>
          <span className="opacity-60">({post.ratingCount} ratings)</span>
        </div>
      </div>
    </div>
  );
}
