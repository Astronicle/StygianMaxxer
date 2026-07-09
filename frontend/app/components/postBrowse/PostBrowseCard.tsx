import type { PostSummary, PostBossCharacterIcon } from "@/app/lib/api";
import { Coins, Timer, Star, PlayCircle } from "lucide-react";

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";
const WEAPON_ICON_BASE = process.env.NEXT_PUBLIC_WEAPON_ICON_BASE_URL ?? "";

function formatClearTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function CharacterRow({ c }: { c: PostBossCharacterIcon }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={`${CHAR_ICON_BASE}/${c.charSlug}/icon.webp`}
        alt={c.charName}
        className="w-12 h-12 rounded-md object-cover shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <div className="text-sm leading-tight min-w-0">
        <p className="font-semibold truncate">
          <span className="opacity-60">C{c.cons}</span> {c.charName}
        </p>
        {c.weaponName && (
          <p className="opacity-70 flex items-center gap-1.5 truncate">
            {c.weaponSlug && c.weaponTypeSlug && (
              <img
                src={`${WEAPON_ICON_BASE}/${c.weaponTypeSlug}/${c.weaponSlug}.png`}
                alt={c.weaponName}
                className="w-5 h-5 object-contain shrink-0"
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

function BossColumn({ boss }: { boss: PostSummary["bosses"][number] }) {
  return (
    <div className="w-full sm:flex-1 sm:min-w-[280px] bg-base-300/40 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3 text-lg">
        <img
          src={`${BOSS_ICON_BASE}/${boss.bossSlug}/model.webp`}
          alt={boss.bossName}
          className="w-10 h-10 object-contain shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="font-bold truncate">{boss.bossName}</span>
        <span className="ml-auto flex items-center gap-3 text-base opacity-60 shrink-0">
          <span className="flex items-center gap-1.5"><Coins size={18} />{boss.cost}</span>
          <span className="flex items-center gap-1.5"><Timer size={18} />{formatClearTime(boss.clearTime)}</span>
        </span>
      </div>

      {boss.characters.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {boss.characters.map((c) => (
            <CharacterRow key={c.charId} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostBrowseCard({
  title,
  username,
  stygianName,
  averageRating,
  ratingCount,
  createdAt,
  difficulty,
  videoLink,
  totalClearTime,
  totalCost,
  bosses,
}: PostSummary) {
  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow w-full">
      <div className="card-body gap-3">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <h3 className="card-title text-lg">{title}</h3>
            <div className="flex flex-wrap gap-2 text-sm opacity-70 mt-1">
              <span>By {username}</span>
              <span>•</span>
              <span>{new Date(createdAt).toDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="badge badge-outline badge-sm">{stygianName}</span>
            <span className={`badge badge-sm font-semibold ${difficulty === "Dire" ? "badge-error" : "badge-warning"}`}>
              {difficulty}
            </span>
            <span className="badge badge-sm badge-outline gap-1" title="Total cost">
              <Coins size={12} /> {totalCost}
            </span>
            {videoLink && (
              <a
                href={videoLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn btn-circle btn-xs btn-info"
                title="Watch clear video"
              >
                <PlayCircle size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Bosses laid out horizontally, characters underneath each */}
        {bosses.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {bosses.map((b) => (
              <BossColumn key={b.bossId} boss={b} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-warning text-warning" />
            <span className="font-medium">{averageRating != null ? averageRating.toFixed(1) : "—"}</span>
            <span className="opacity-60">({ratingCount} ratings)</span>
          </div>
          <span className="opacity-40">•</span>
          <span className="opacity-80 flex items-center gap-1"><Timer size={14} />{formatClearTime(totalClearTime)} total</span>
        </div>
      </div>
    </div>
  );
}
