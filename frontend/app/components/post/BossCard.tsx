import CharacterBadge from "./CharacterBadge";
import { Coins, Timer, PlayCircle } from "lucide-react";
import TagBadges from "@/app/components/tags/TagBadges";
import { BOSS_TAG_LABELS, type BossTag } from "@/app/lib/api";

type Character = {
  id: number;
  name: string;
  icon: string;
  element: string;
  cons: number;
  hasSig: boolean;
  weaponName?: string;
  weaponIcon?: string;
  weaponRarity?: number;
  refinement?: number;
  artifactSetName?: string;
  artifactSetIcon?: string;
};

type Boss = {
  id: number;
  name: string;
  icon: string;
  buildInfo?: string;
  clearTime?: number; // seconds, 0-120
  cost?: number;      // auto-calculated team cost for this boss
  videoLink?: string; // link to the clear video
  tags?: BossTag[];    // boss-specific tags — see BOSS_TAG_LABELS
  characters: Character[];
};

function formatClearTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function BossCard({ name, icon, buildInfo, clearTime, cost, videoLink, tags, characters }: Boss) {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body gap-4">
        {/* Boss header */}
        <div className="flex items-center gap-3">
          <img src={icon} alt={name} className="w-12 h-12 rounded-md" />
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="ml-auto flex items-center gap-2">
            {typeof cost === "number" && (
              <span className="badge badge-warning badge-outline gap-1" title="Team cost">
                <Coins size={14} /> {cost}
              </span>
            )}
            {typeof clearTime === "number" && (
              <span className="badge badge-ghost gap-1">
                <Timer size={14} /> {formatClearTime(clearTime)}
              </span>
            )}
            {videoLink && (
              <a
                href={videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-circle btn-sm btn-info"
                title="Watch clear video"
              >
                <PlayCircle size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Build info */}
        {buildInfo && (
          <div className="border-l-4 border-primary bg-base-300 px-3 py-2 text-sm">
            <span className="opacity-80">{buildInfo}</span>
          </div>
        )}

        {/* Boss-specific tags */}
        <TagBadges tags={tags} labels={BOSS_TAG_LABELS} />

        {/* Characters */}
        <div className="grid gap-3">
          {characters.map((char) => (
            <CharacterBadge key={char.id} {...char} />
          ))}
        </div>
      </div>
    </div>
  );
}
