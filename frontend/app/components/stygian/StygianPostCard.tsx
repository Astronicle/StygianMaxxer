import type { PostSummary, PostBossCharacterIcon } from "@/app/lib/api";

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";
const WEAPON_ICON_BASE = process.env.NEXT_PUBLIC_WEAPON_ICON_BASE_URL ?? "";

type StygianPostCardProps = {
  post: PostSummary;
  highlightBossId?: number; // when a boss filter chip is active, highlight that boss column
};

function formatClearTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function CharacterRow({ c }: { c: PostBossCharacterIcon }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={`${CHAR_ICON_BASE}/${c.charSlug}/icon.webp`}
        alt={c.charName}
        className="w-9 h-9 rounded-md object-cover shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <div className="text-xs leading-tight min-w-0">
        <p className="font-medium truncate">
          <span className="opacity-60">C{c.cons}</span> {c.charName}
        </p>
        {c.weaponName && (
          <p className="opacity-70 flex items-center gap-1 truncate">
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

function BossColumn({ boss, highlighted }: { boss: PostSummary["bosses"][number]; highlighted: boolean }) {
  return (
    <div
      className={`flex-1 min-w-[220px] rounded-lg p-3 space-y-2 transition-colors ${
        highlighted ? "bg-primary/15 ring-1 ring-primary" : "bg-base-300/40"
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        <img
          src={`${BOSS_ICON_BASE}/${boss.bossSlug}/model.webp`}
          alt={boss.bossName}
          className="w-6 h-6 object-contain shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className={`font-medium truncate ${highlighted ? "text-primary" : ""}`}>{boss.bossName}</span>
        <span className="ml-auto flex items-center gap-2 shrink-0 text-xs opacity-60">
          <span title="Cost">💰 {boss.cost}</span>
          <span title="Clear time">⏱ {formatClearTime(boss.clearTime)}</span>
        </span>
      </div>

      {boss.characters.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {boss.characters.map((c) => (
            <CharacterRow key={c.charId} c={c} />
          ))}
        </div>
      )}
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
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow w-full">
      <div className="card-body gap-3 p-4">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <h3 className="card-title text-lg">{post.title}</h3>
            <div className="flex flex-wrap gap-2 text-sm opacity-70 mt-1">
              <span>By {post.username}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="badge badge-outline badge-sm">{post.stygianName}</span>
            <span
              className={`badge badge-sm font-semibold ${
                post.difficulty === "Dire" ? "badge-error" : "badge-warning"
              }`}
            >
              {post.difficulty}
            </span>
            <span className="badge badge-sm badge-outline" title="Total cost">
              💰 {post.totalCost}
            </span>
            {post.videoLink && (
              <a
                href={post.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn btn-circle btn-xs btn-info"
                title="Watch clear video"
              >
                ▶
              </a>
            )}
          </div>
        </div>

        {/* Bosses laid out horizontally, characters underneath each */}
        {post.bosses.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {post.bosses.map((boss) => (
              <BossColumn
                key={boss.bossId}
                boss={boss}
                highlighted={highlightBossId != null && boss.bossId === highlightBossId}
              />
            ))}
          </div>
        )}

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
