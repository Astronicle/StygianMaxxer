import type { PostSummary, PostBossCharacterIcon } from "@/app/lib/api";
import { Coins, Timer, Star, PlayCircle, Link as LinkIcon } from "lucide-react";

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

function CharacterTile({ c }: { c: PostBossCharacterIcon }) {
  return (
    <div className="flex items-center gap-2 bg-base-300/70 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
      <img
        src={`${CHAR_ICON_BASE}/${c.charSlug}/icon.webp`}
        alt={c.charName}
        className="w-10 h-10 rounded-md object-cover shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <div className="text-sm leading-tight min-w-0">
        <p className="font-semibold truncate">
          <span className="opacity-60">C{c.cons}</span> {c.charName}
        </p>
        {c.weaponName && (
          <p className="opacity-70 flex items-center gap-1 text-xs truncate">
            {c.weaponSlug && c.weaponTypeSlug && (
              <img
                src={`${WEAPON_ICON_BASE}/${c.weaponTypeSlug}/${c.weaponSlug}.png`}
                alt={c.weaponName}
                className="w-4 h-4 object-contain shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <span className="truncate">R{c.refinement} {c.weaponName}</span>
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
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full">
      <div className="card-body gap-3 p-4">
        {/* Title row */}
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-semibold text-base">{post.title}</h3>
          <span className="badge badge-outline badge-xs">{post.stygianName}</span>
          <span className={`badge badge-xs font-semibold ${post.difficulty === "Dire" ? "badge-error" : "badge-warning"}`}>
            {post.difficulty}
          </span>
          <span className="text-xs opacity-60 sm:ml-auto w-full sm:w-auto">
            By {post.username} · {formattedDate}
          </span>
        </div>

        {/* Stat bar: cost / time / video link */}
        {scoped && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-base-300/50 rounded-lg px-4 py-2 text-sm">
            <span className="opacity-70 flex items-center gap-1.5">
              <Coins size={14} /> COST: <span className="font-bold">{scoped.cost}</span>
            </span>
            <span className="opacity-70 sm:mx-auto flex items-center gap-1.5">
              <Timer size={14} /> TIME: <span className="font-bold">{formatClearTime(scoped.clearTime)}</span>
            </span>
            <span className="flex items-center gap-2 opacity-70">
              <span className="flex items-center gap-1"><LinkIcon size={14} /> LINK:</span>
              {post.videoLink ? (
                <a
                  href={post.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn-circle btn-xs btn-info"
                  title="Watch clear video"
                >
                  <PlayCircle size={14} />
                </a>
              ) : (
                <span className="opacity-40">—</span>
              )}
            </span>
          </div>
        )}

        {/* Characters, horizontally */}
        {scoped && scoped.characters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {scoped.characters.map((c) => (
              <CharacterTile key={c.charId} c={c} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 text-xs">
          <Star size={14} className="fill-warning text-warning" />
          <span className="font-medium">{post.averageRating != null ? post.averageRating.toFixed(1) : "—"}</span>
          <span className="opacity-60">({post.ratingCount} ratings)</span>
        </div>
      </div>
    </div>
  );
}
