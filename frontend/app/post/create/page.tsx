"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getToken,
  apiGetStygians,
  defaultRefinementForRarity,
  calculateCharacterCost,
  calculateWeaponCost,
  ALL_BOSS_TAGS,
  BOSS_TAG_LABELS,
  type Stygian,
  type PostTag,
  type BossTag,
} from "@/app/lib/api";
import TagPicker from "@/app/components/tags/TagPicker";
import PostTagPicker from "@/app/components/tags/PostTagPicker";

// ─── Types ────────────────────────────────────────────────────────────────────

// What the backend expects per character in a boss entry
// POST /api/posts → PostCreateRequest → PostBossCreateRequest → PostBossCharacterCreateRequest
type CharacterEntry = {
  charId: number;
  weaponId: number | null;
  artifactSetId: number | null;
  refinement: number;  // 1–5 (R1–R5); defaulted based on weapon rarity, user-overridable
  slot: number;    // 1–4, assigned in order of adding
  hasSig: boolean;
  cons: number;    // 0–6
};

// One boss section in the form
type BossEntry = {
  bossId: number;
  bossName: string;
  bossSlug: string;
  buildInfo: string;
  clearTime: number;  // seconds, 0-120
  tags: Set<BossTag>;
  characters: CharacterEntry[];
};

// A character as returned by GET /api/characters
type CharacterOption = {
  id: number;
  slug: string;
  name: string;
  rarity: number;
  isLimited: boolean;
  element: { id: number; slug: string; name: string };
  weaponType: { id: number; slug: string; name: string };
};

// A weapon as returned by GET /api/weapons
type WeaponOption = {
  id: number;
  slug: string;
  name: string;
  rarity: number;
  isLimited: boolean;
  weaponType: { id: number; slug: string; name: string };
};

// An artifact set as returned by GET /api/artifact-sets
type ArtifactSetOption = {
  id: number;
  slug: string;
  name: string;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostCreatePage() {
  const router = useRouter();

  // ── Form meta fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [difficulty, setDifficulty] = useState<"Fearless" | "Dire">("Fearless");
  const [postTags, setPostTags] = useState<Set<PostTag>>(new Set(["NOT_MINE"]));

  // ── Lookup data loaded from the API
  const [stygians, setStygians] = useState<Stygian[]>([]);
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [weapons, setWeapons] = useState<WeaponOption[]>([]);
  const [artifactSets, setArtifactSets] = useState<ArtifactSetOption[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [lookupsError, setLookupsError] = useState<string | null>(null);

  // ── Stygian selection drives the boss list
  const [selectedStygianId, setSelectedStygianId] = useState<number | null>(null);
  // All bosses for the selected stygian (always 1–3 depending on the cycle)
  const [bossEntries, setBossEntries] = useState<BossEntry[]>([]);
  // Which of those bosses the user has opted to include in this post
  const [activeBossIds, setActiveBossIds] = useState<Set<number>>(new Set());

  // ── Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Redirect if not logged in
  useEffect(() => {
    if (!getToken()) router.push("/login");
  }, [router]);

  // ── Load stygians + characters + weapons + artifact sets in parallel on mount
  useEffect(() => {
    async function loadLookups() {
      try {
        const { apiFetch } = await import("@/app/lib/api");
        const [stygiansData, charsData, weaponsData, artifactSetsData] = await Promise.all([
          apiGetStygians(),
          apiFetch<CharacterOption[]>("/api/characters"),
          apiFetch<WeaponOption[]>("/api/weapons"),
          apiFetch<ArtifactSetOption[]>("/api/artifact-sets"),
        ]);
        // Sort newest stygian first
        setStygians(stygiansData.sort((a, b) => b.version.localeCompare(a.version)));
        // Sort characters alphabetically
        setCharacters(charsData.sort((a, b) => a.name.localeCompare(b.name)));
        setWeapons(weaponsData);
        // Sort artifact sets alphabetically
        setArtifactSets(artifactSetsData.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        setLookupsError(err instanceof Error ? err.message : "Failed to load form data");
      } finally {
        setLoadingLookups(false);
      }
    }
    loadLookups();
  }, []);

  // ── When the user picks a stygian, initialise one BossEntry per boss in that cycle
  function handleStygianChange(stygianId: number) {
    setSelectedStygianId(stygianId);
    setSubmitError(null);

    const stygian = stygians.find((s) => s.id === stygianId);
    if (!stygian) return;

    // Sort bosses by slot so they appear in cycle order
    const sorted = [...stygian.bosses].sort((a, b) => a.slot - b.slot);
    setBossEntries(
      sorted.map((b) => ({
        bossId: b.bossId,
        bossName: b.bossName,
        bossSlug: b.bossSlug,
        buildInfo: "",
        clearTime: 0,
        tags: new Set<BossTag>(),
        characters: [],
      }))
    );
    // Start with no bosses selected — user picks which ones apply to their clear
    setActiveBossIds(new Set());
  }

  function toggleBoss(bossId: number) {
    setActiveBossIds((prev) => {
      const next = new Set(prev);
      if (next.has(bossId)) {
        next.delete(bossId);
      } else {
        next.add(bossId);
      }
      return next;
    });
  }

  // ── Boss field updaters
  function setBuildInfo(bossId: number, buildInfo: string) {
    setBossEntries((prev) =>
      prev.map((b) => (b.bossId === bossId ? { ...b, buildInfo } : b))
    );
  }

  function setClearTime(bossId: number, clearTime: number) {
    setBossEntries((prev) =>
      prev.map((b) => (b.bossId === bossId ? { ...b, clearTime } : b))
    );
  }

  function setBossTags(bossId: number, tags: Set<BossTag>) {
    setBossEntries((prev) =>
      prev.map((b) => (b.bossId === bossId ? { ...b, tags } : b))
    );
  }

  function addCharacterToBoss(bossId: number, char: CharacterOption) {
    // Default to the highest-rarity weapon matching this character's weapon type,
    // since a weapon selection is compulsory. Artifact set is left unset so the
    // user makes a conscious choice.
    const matchingWeapons = weapons
      .filter((w) => w.weaponType.id === char.weaponType.id)
      .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));
    const defaultWeapon = matchingWeapons.length > 0 ? matchingWeapons[0] : null;
    const defaultWeaponId = defaultWeapon?.id ?? null;
    // 5★ weapons default to R1, everything else defaults to R5 — user can change it.
    const defaultRefinement = defaultWeapon ? defaultRefinementForRarity(defaultWeapon.rarity) : 5;

    setBossEntries((prev) => {
      // Block if character is already used in ANY boss across the post
      const usedGlobally = new Set(prev.flatMap((b) => b.characters.map((c) => c.charId)));
      if (usedGlobally.has(char.id)) return prev;

      return prev.map((b) => {
        if (b.bossId !== bossId) return b;
        if (b.characters.length >= 4) return b;
        const nextSlot = b.characters.length + 1; // slot is 1-indexed
        return {
          ...b,
          characters: [
            ...b.characters,
            {
              charId: char.id,
              weaponId: defaultWeaponId,
              artifactSetId: null,
              refinement: defaultRefinement,
              slot: nextSlot,
              hasSig: false,
              cons: 0,
            },
          ],
        };
      });
    });
  }

  function removeCharacterFromBoss(bossId: number, charId: number) {
    setBossEntries((prev) =>
      prev.map((b) => {
        if (b.bossId !== bossId) return b;
        // Re-number slots after removal so they stay sequential
        const remaining = b.characters
          .filter((c) => c.charId !== charId)
          .map((c, i) => ({ ...c, slot: i + 1 }));
        return { ...b, characters: remaining };
      })
    );
  }

  function updateCharacterField(
    bossId: number,
    charId: number,
    field: "cons" | "hasSig" | "weaponId" | "artifactSetId" | "refinement",
    value: number | boolean
  ) {
    setBossEntries((prev) =>
      prev.map((b) => {
        if (b.bossId !== bossId) return b;
        return {
          ...b,
          characters: b.characters.map((c) =>
            c.charId === charId ? { ...c, [field]: value } : c
          ),
        };
      })
    );
  }

  // Weapon changes also re-default the refinement to match the new weapon's
  // rarity (5★ → R1, everything else → R5), since the old refinement was
  // chosen for a different weapon. The user can still override afterward.
  function onWeaponChange(bossId: number, charId: number, weapon: WeaponOption) {
    setBossEntries((prev) =>
      prev.map((b) => {
        if (b.bossId !== bossId) return b;
        return {
          ...b,
          characters: b.characters.map((c) =>
            c.charId === charId
              ? { ...c, weaponId: weapon.id, refinement: defaultRefinementForRarity(weapon.rarity) }
              : c
          ),
        };
      })
    );
  }

  // ── Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStygianId) return;

    setSubmitError(null);

    // canSubmit (disabled state) already guarantees every character has a
    // weapon + artifact set selected, but guard explicitly before sending.
    const activeBosses = bossEntries.filter((b) => activeBossIds.has(b.bossId));
    for (const b of activeBosses) {
      for (const c of b.characters) {
        if (c.weaponId === null || c.artifactSetId === null) {
          setSubmitError("Every character needs a weapon and artifact set selected.");
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const { apiFetch } = await import("@/app/lib/api");

      // Build the request body matching PostCreateRequest exactly:
      // { stygianId: Short, title, description, videoLink, bosses: PostBossCreateRequest[] }
      const body = {
        stygianId: selectedStygianId,
        title,
        description,
        videoLink,
        difficulty,
        tags: Array.from(postTags),
        bosses: activeBosses.map((b) => ({
          bossId: b.bossId,
          buildInfo: b.buildInfo,
          clearTime: b.clearTime,
          tags: Array.from(b.tags),
          characters: b.characters.map((c) => ({
            charId: c.charId,
            weaponId: c.weaponId as number,
            artifactSetId: c.artifactSetId as number,
            refinement: c.refinement,
            slot: c.slot,
            hasSig: c.hasSig,
            cons: c.cons,
          })),
        })),
      };

      const created = await apiFetch<{ postId: number }>("/api/posts", {
        method: "POST",
        body,
      });

      // On success, navigate to the new post's detail page
      router.push(`/post/${created.postId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loadingLookups) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (lookupsError) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="alert alert-error">{lookupsError}</div>
      </div>
    );
  }

  const selectedStygian = stygians.find((s) => s.id === selectedStygianId);
  const activeBosses = bossEntries.filter((b) => activeBossIds.has(b.bossId));

  // Set of all char IDs used across ALL bosses — passed to BossSection
  // so it can disable chars already claimed by another boss.
  const allUsedCharIds = new Set(
    bossEntries.flatMap((b) => b.characters.map((c) => c.charId))
  );

  // Validation: at least 1 boss selected, and every active boss has ≥1 character + buildInfo
  // + a valid clear time, and every character has a weapon + artifact set selected (both compulsory)
  const bossesValid =
    activeBosses.length >= 1 &&
    activeBosses.every(
      (b) =>
        b.characters.length >= 1 &&
        b.buildInfo.trim().length > 0 &&
        b.clearTime >= 0 &&
        b.clearTime <= 120 &&
        b.characters.every((c) => c.weaponId !== null && c.artifactSetId !== null)
    );
  const canSubmit =
    title.trim() &&
    description.trim() &&
    videoLink.trim() &&
    selectedStygianId !== null &&
    bossesValid;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Post</h1>
        <p className="opacity-60 mt-1">Share your Stygian clear</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Meta fields ─────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Details</h2>

          <div className="form-control">
            <label className="label"><span className="label-text">Title</span></label>
            <input
              type="text"
              placeholder="e.g. Full clear with Varka + Zibai"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Description</span></label>
            <textarea
              placeholder="Describe your team, rotations, tips..."
              className="textarea textarea-bordered w-full h-28"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Video Link</span></label>
            <input
              type="url"
              placeholder="https://youtube.com/..."
              className="input input-bordered w-full"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Difficulty</span></label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "Fearless" | "Dire")}
              required
            >
              <option value="Fearless">Fearless</option>
              <option value="Dire">Dire</option>
            </select>
          </div>

          <PostTagPicker selected={postTags} onChange={setPostTags} />
        </section>

        {/* ── Stygian select ──────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Stygian Cycle</h2>
          <select
            className="select select-bordered w-full max-w-xs"
            value={selectedStygianId ?? ""}
            onChange={(e) => handleStygianChange(Number(e.target.value))}
            required
          >
            <option disabled value="">Select version</option>
            {stygians.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} v{s.version}
              </option>
            ))}
          </select>
        </section>

        {/* ── Boss sections — one per boss in the selected stygian ─────────── */}
        {selectedStygian && bossEntries.length > 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Bosses</h2>
              <p className="text-sm opacity-60 mt-1">
                Select the bosses you cleared (1–3). Fill in details for each selected boss.
              </p>
            </div>

            {bossEntries.map((boss) => {
              const isActive = activeBossIds.has(boss.bossId);
              return (
                <div key={boss.bossId}>
                  {/* Toggle row — click to include/exclude this boss */}
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={isActive}
                      onChange={() => toggleBoss(boss.bossId)}
                    />
                    <img
                      src={`${process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? ""}/${boss.bossSlug}/model.webp`}
                      alt={boss.bossName}
                      className="w-8 h-8 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className="font-medium">{boss.bossName}</span>
                  </label>

                  {/* Detail card — only shown when the boss is checked */}
                  {isActive && (
                    <BossSection
                      boss={boss}
                      allCharacters={characters}
                      allWeapons={weapons}
                      allArtifactSets={artifactSets}
                      usedCharIds={allUsedCharIds}
                      onBuildInfoChange={(v) => setBuildInfo(boss.bossId, v)}
                      onClearTimeChange={(v) => setClearTime(boss.bossId, v)}
                      onTagsChange={(tags) => setBossTags(boss.bossId, tags)}
                      onAddCharacter={(c) => addCharacterToBoss(boss.bossId, c)}
                      onRemoveCharacter={(charId) => removeCharacterFromBoss(boss.bossId, charId)}
                      onUpdateCharacter={(charId, field, value) =>
                        updateCharacterField(boss.bossId, charId, field, value)
                      }
                      onWeaponChange={(charId, weapon) =>
                        onWeaponChange(boss.bossId, charId, weapon)
                      }
                    />
                  )}
                </div>
              );
            })}
          </section>
        )}

        {submitError && (
          <div className="alert alert-error">{submitError}</div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="btn btn-primary w-full"
        >
          {submitting ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Submit Post"
          )}
        </button>
      </form>
    </div>
  );
}

// ─── BossSection sub-component ────────────────────────────────────────────────

type BossSectionProps = {
  boss: BossEntry;
  allCharacters: CharacterOption[];
  allWeapons: WeaponOption[];
  allArtifactSets: ArtifactSetOption[];
  usedCharIds: Set<number>;  // char IDs already used in ANY boss in this post
  onBuildInfoChange: (v: string) => void;
  onClearTimeChange: (v: number) => void;
  onTagsChange: (tags: Set<BossTag>) => void;
  onAddCharacter: (c: CharacterOption) => void;
  onRemoveCharacter: (charId: number) => void;
  onUpdateCharacter: (
    charId: number,
    field: "cons" | "hasSig" | "weaponId" | "artifactSetId" | "refinement",
    value: number | boolean
  ) => void;
  onWeaponChange: (charId: number, weapon: WeaponOption) => void;
};

function BossSection({
  boss,
  allCharacters,
  allWeapons,
  allArtifactSets,
  usedCharIds,
  onBuildInfoChange,
  onClearTimeChange,
  onTagsChange,
  onAddCharacter,
  onRemoveCharacter,
  onUpdateCharacter,
  onWeaponChange,
}: BossSectionProps) {
  const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
  const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";
  const WEAPON_ICON_BASE = process.env.NEXT_PUBLIC_WEAPON_ICON_BASE_URL ?? "";
  const ARTIFACT_ICON_BASE = process.env.NEXT_PUBLIC_ARTIFACT_ICON_BASE_URL ?? "";

  // usedCharIds already includes this boss's chars — any char in here is
  // either already on this boss (can't re-add) or on another boss (blocked).
  const selectedCharIds = usedCharIds;

  // Live cost calculation — mirrors the backend CostCalculator exactly.
  // Each entry contributes characterCost + weaponCost; the boss total is
  // the sum across every filled slot. Only slots with both a character and
  // a resolved weapon contribute (per the spec: "empty or incomplete slots
  // only count the parts you have actually selected").
  const costBreakdown = boss.characters.map((entry) => {
    const char = allCharacters.find((c) => c.id === entry.charId);
    const weapon = allWeapons.find((w) => w.id === entry.weaponId);
    const characterCost = char ? calculateCharacterCost(char.rarity, char.isLimited, entry.cons) : 0;
    const weaponCost = weapon ? calculateWeaponCost(weapon.rarity, weapon.isLimited, entry.refinement) : 0;
    return { entry, char, weapon, characterCost, weaponCost, slotCost: characterCost + weaponCost };
  });
  const totalCost = costBreakdown.reduce((sum, b) => sum + b.slotCost, 0);

  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body gap-4">
        {/* Boss header */}
        <div className="flex items-center gap-3">
          <img
            src={`${BOSS_ICON_BASE}/${boss.bossSlug}/model.webp`}
            alt={boss.bossName}
            className="w-10 h-10 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <h3 className="text-lg font-semibold">{boss.bossName}</h3>
        </div>

        {/* Build info */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">Build notes / team comp summary</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Varka hyper carry + Zibai support"
            className="input input-bordered input-sm w-full"
            value={boss.buildInfo}
            onChange={(e) => onBuildInfoChange(e.target.value)}
            required
          />
        </div>

        <div className="flex items-start gap-4 flex-wrap">
          {/* Clear time */}
          <div className="form-control max-w-xs">
            <label className="label">
              <span className="label-text text-sm">Clear time (seconds)</span>
            </label>
            <input
              type="number"
              min={0}
              max={120}
              placeholder="0–120"
              className="input input-bordered input-sm w-full"
              value={boss.clearTime}
              onChange={(e) => {
                const v = Math.max(0, Math.min(120, Number(e.target.value)));
                onClearTimeChange(v);
              }}
              required
            />
          </div>

          {/* Cost (auto) — hover to see the line-by-line breakdown */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm flex items-center gap-1">
                Cost (auto)
                <span className="opacity-50 cursor-help" title="Standardizes team investment level. Limited 5★ = cons+1, standard 5★ = (cons+1)×0.5. Same for weapon refinement. 4★ and below are always 0 cost.">ⓘ</span>
              </span>
            </label>
            <div className="dropdown dropdown-hover">
              <div
                tabIndex={0}
                className="input input-bordered input-sm flex items-center justify-center font-semibold cursor-default w-20"
              >
                {totalCost}
              </div>
              {costBreakdown.length > 0 && (
                <div
                  tabIndex={0}
                  className="dropdown-content z-10 menu p-3 shadow-lg bg-base-300 rounded-box w-72 mt-1"
                >
                  <p className="text-xs font-bold uppercase opacity-60 mb-2">Cost breakdown</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {costBreakdown.map(({ entry, char, weapon }) => (
                      <div key={entry.charId} className="text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {char?.name ?? "?"} C{entry.cons}
                          </span>
                          <span className={char && char.rarity >= 5 ? "text-warning font-semibold" : "opacity-50"}>
                            {calculateCharacterCost(char?.rarity ?? 0, char?.isLimited ?? false, entry.cons) || 0}
                          </span>
                        </div>
                        <p className="opacity-50">
                          {char ? `${char.rarity}★ ${char.isLimited ? "Limited" : "Standard"}` : "—"}
                        </p>
                        <div className="flex justify-between mt-1">
                          <span className="font-medium">
                            {weapon?.name ?? "?"} R{entry.refinement}
                          </span>
                          <span className={weapon && weapon.rarity >= 5 ? "text-warning font-semibold" : "opacity-50"}>
                            {calculateWeaponCost(weapon?.rarity ?? 0, weapon?.isLimited ?? false, entry.refinement) || 0}
                          </span>
                        </div>
                        <p className="opacity-50">
                          {weapon ? `${weapon.rarity}★ ${weapon.isLimited ? "Limited" : "Free"}` : "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="divider my-1" />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Total</span>
                    <span>{totalCost}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boss-specific tags */}
        <TagPicker
          label="Boss tags"
          allTags={ALL_BOSS_TAGS}
          labels={BOSS_TAG_LABELS}
          selected={boss.tags}
          onChange={onTagsChange}
          size="xs"
        />

        {/* Character picker */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm">
              Add characters ({boss.characters.length}/4)
            </span>
          </label>
          <select
            className="select select-bordered select-sm w-full max-w-xs"
            value=""
            onChange={(e) => {
              const char = allCharacters.find((c) => c.id === Number(e.target.value));
              if (char) onAddCharacter(char);
            }}
            disabled={boss.characters.length >= 4}
          >
            <option disabled value="">Add character…</option>
            {allCharacters.map((c) => {
              const thisBosskChars = new Set(boss.characters.map((ch) => ch.charId));
              const usedElsewhere = selectedCharIds.has(c.id) && !thisBosskChars.has(c.id);
              const alreadyHere   = thisBosskChars.has(c.id);
              return (
                <option key={c.id} value={c.id} disabled={alreadyHere || usedElsewhere}>
                  {usedElsewhere ? `[Used] ${c.name}` : alreadyHere ? `[Added] ${c.name}` : c.name}
                  {!usedElsewhere && !alreadyHere ? ` (${c.element.name} · ${c.weaponType.name})` : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* Selected characters */}
        {boss.characters.length > 0 && (
          <div className="divide-y divide-base-300">
            {boss.characters.map((entry) => {
              const char = allCharacters.find((c) => c.id === entry.charId);
              if (!char) return null;

              // Only weapons matching this character's weapon type are selectable,
              // sorted by rarity descending (5★ first) for easier scanning.
              const matchingWeapons = allWeapons
                .filter((w) => w.weaponType.id === char.weaponType.id)
                .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));
              const selectedWeapon = matchingWeapons.find((w) => w.id === entry.weaponId);
              const selectedArtifactSet = allArtifactSets.find((a) => a.id === entry.artifactSetId);

              return (
                <div key={entry.charId} className="py-2 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <img
                      src={`${CHAR_ICON_BASE}/${char.slug}/icon.webp`}
                      alt={char.name}
                      className="w-9 h-9 rounded-md object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />

                    <span className="font-medium w-24 text-sm">{char.name}</span>
                    <span className="text-xs opacity-50">Slot {entry.slot}</span>

                    {/* Constellation */}
                    <label className="flex items-center gap-1 text-sm">
                      <span className="opacity-60">C</span>
                      <input
                        type="number"
                        min={0}
                        max={6}
                        value={entry.cons}
                        onChange={(e) =>
                          onUpdateCharacter(entry.charId, "cons", Number(e.target.value))
                        }
                        className="input input-bordered input-xs w-14"
                      />
                    </label>

                    {/* Signature weapon */}
                    <label className="flex items-center gap-1 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={entry.hasSig}
                        onChange={(e) =>
                          onUpdateCharacter(entry.charId, "hasSig", e.target.checked)
                        }
                      />
                      Sig
                    </label>

                    <button
                      type="button"
                      className="btn btn-xs btn-error ml-auto"
                      onClick={() => onRemoveCharacter(entry.charId)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap pl-12">
                    {/* Weapon picker — required, filtered to character's weapon type */}
                    <label className="flex items-center gap-2 text-sm">
                      {selectedWeapon && (
                        <img
                          src={`${WEAPON_ICON_BASE}/${selectedWeapon.weaponType.slug}/${selectedWeapon.slug}.png`}
                          alt={selectedWeapon.name}
                          className="w-7 h-7 rounded object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <select
                        className="select select-bordered select-xs w-44"
                        value={entry.weaponId ?? ""}
                        onChange={(e) => {
                          const weapon = matchingWeapons.find((w) => w.id === Number(e.target.value));
                          if (weapon) onWeaponChange(entry.charId, weapon);
                        }}
                        required
                      >
                        <option disabled value="">Select weapon…</option>
                        {matchingWeapons.map((w) => (
                          <option key={w.id} value={w.id}>
                            {"★".repeat(w.rarity)} {w.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Refinement — required, R1–R5. Defaults to R1 for 5★ weapons,
                        R5 for everything else, but the user can always change it. */}
                    <label className="flex items-center gap-1 text-sm">
                      <span className="opacity-60">R</span>
                      <select
                        className="select select-bordered select-xs w-16"
                        value={entry.refinement}
                        onChange={(e) =>
                          onUpdateCharacter(entry.charId, "refinement", Number(e.target.value))
                        }
                        required
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            R{r}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Artifact set picker — required */}
                    <label className="flex items-center gap-2 text-sm">
                      {selectedArtifactSet && (
                        <img
                          src={`${ARTIFACT_ICON_BASE}/${selectedArtifactSet.slug}.png`}
                          alt={selectedArtifactSet.name}
                          className="w-7 h-7 rounded object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <select
                        className="select select-bordered select-xs w-52"
                        value={entry.artifactSetId ?? ""}
                        onChange={(e) =>
                          onUpdateCharacter(entry.charId, "artifactSetId", Number(e.target.value))
                        }
                        required
                      >
                        <option disabled value="">Select artifact set…</option>
                        {allArtifactSets.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
