"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  apiGetPost,
  apiGetMyProfile,
  apiUpdatePost,
  getToken,
  defaultRefinementForRarity,
  calculateCharacterCost,
  calculateWeaponCost,
  ALL_BOSS_TAGS,
  BOSS_TAG_LABELS,
  type PostBossUpdateEntry,
  type PostTag,
  type BossTag,
} from "@/app/lib/api";
import TagPicker from "@/app/components/tags/TagPicker";
import PostTagPicker from "@/app/components/tags/PostTagPicker";

// ─── Types ────────────────────────────────────────────────────────────────────

type CharacterOption = {
  id: number;
  slug: string;
  name: string;
  rarity: number;
  isLimited: boolean;
  element: { id: number; slug: string; name: string };
  weaponType: { id: number; slug: string; name: string };
};

type WeaponOption = {
  id: number;
  slug: string;
  name: string;
  rarity: number;
  isLimited: boolean;
  weaponType: { id: number; slug: string; name: string };
};

type ArtifactSetOption = {
  id: number;
  slug: string;
  name: string;
};

type CharacterEntry = {
  charId: number;
  charName: string;
  charSlug: string;
  weaponId: number | null;
  artifactSetId: number | null;
  refinement: number;  // 1–5 (R1–R5); defaulted based on weapon rarity, user-overridable
  slot: number;
  hasSig: boolean;
  cons: number;
};

type BossEntry = {
  bossId: number;
  bossName: string;
  bossSlug: string;
  buildInfo: string;
  clearTime: number;  // seconds, 0-120
  tags: Set<BossTag>;
  characters: CharacterEntry[];
};

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";
const WEAPON_ICON_BASE = process.env.NEXT_PUBLIC_WEAPON_ICON_BASE_URL ?? "";
const ARTIFACT_ICON_BASE = process.env.NEXT_PUBLIC_ARTIFACT_ICON_BASE_URL ?? "";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostEditPage() {
  const { postID } = useParams<{ postID: string }>();
  const postId = Number(postID);
  const router = useRouter();

  // ── Meta fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [difficulty, setDifficulty] = useState<"Fearless" | "Dire">("Fearless");
  const [postTags, setPostTags] = useState<Set<PostTag>>(new Set());

  // ── Boss entries (mirrors the current post's bosses)
  const [bossEntries, setBossEntries] = useState<BossEntry[]>([]);

  // ── Character lookup for the picker
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [weapons, setWeapons] = useState<WeaponOption[]>([]);
  const [artifactSets, setArtifactSets] = useState<ArtifactSetOption[]>([]);

  // ── Page state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Redirect if not logged in, then load post + characters
  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        const { apiFetch } = await import("@/app/lib/api");
        const [post, me, chars, weaponsData, artifactSetsData] = await Promise.all([
          apiGetPost(postId),
          apiGetMyProfile(),
          apiFetch<CharacterOption[]>("/api/characters"),
          apiFetch<WeaponOption[]>("/api/weapons"),
          apiFetch<ArtifactSetOption[]>("/api/artifact-sets"),
        ]);

        // Ownership check on the client side (backend enforces it too)
        if (post.account.accountId !== me.accountId) {
          router.push(`/post/${postId}`);
          return;
        }

        // Pre-populate fields from existing post
        setTitle(post.title);
        setDescription(post.description ?? "");
        setVideoLink(post.videoLink ?? "");
        setDifficulty(post.difficulty ?? "Fearless");
        {
          const loadedTags = new Set(post.tags ?? []);
          if (!loadedTags.has("MINE") && !loadedTags.has("NOT_MINE")) {
            loadedTags.add("NOT_MINE");
          }
          setPostTags(loadedTags);
        }
        setBossEntries(
          post.bosses.map((b) => ({
            bossId: b.bossId,
            bossName: b.bossName,
            bossSlug: b.bossSlug,
            buildInfo: b.buildInfo ?? "",
            clearTime: b.clearTime,
            tags: new Set(b.tags ?? []),
            characters: b.characters.map((c) => ({
              charId: c.charId,
              charName: c.charName,
              charSlug: c.charSlug,
              weaponId: c.weaponId,
              artifactSetId: c.artifactSetId,
              refinement: c.refinement,
              slot: c.slot,
              hasSig: c.hasSig,
              cons: c.cons,
            })),
          }))
        );
        setCharacters(chars.sort((a, b) => a.name.localeCompare(b.name)));
        setWeapons(weaponsData);
        setArtifactSets(artifactSetsData.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [postId, router]);

  // ── Boss field helpers ──────────────────────────────────────────────────────

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
        const nextSlot = b.characters.length + 1;
        return {
          ...b,
          characters: [
            ...b.characters,
            {
              charId: char.id,
              charName: char.name,
              charSlug: char.slug,
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

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // canSubmit (disabled state) already guarantees every character has a
    // weapon + artifact set selected, but narrow the types explicitly here
    // so the request body matches PostBossUpdateEntry's shape.
    for (const b of bossEntries) {
      for (const c of b.characters) {
        if (c.weaponId === null || c.artifactSetId === null) {
          setSubmitError("Every character needs a weapon and artifact set selected.");
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const bosses: PostBossUpdateEntry[] = bossEntries.map((b) => ({
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
      }));

      await apiUpdatePost(postId, { title, description, videoLink, difficulty, tags: Array.from(postTags), bosses });
      router.push(`/post/${postId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  const bossesValid =
    bossEntries.length >= 1 &&
    bossEntries.every(
      (b) =>
        b.characters.length >= 1 &&
        b.buildInfo.trim().length > 0 &&
        b.clearTime >= 0 &&
        b.clearTime <= 120 &&
        b.characters.every((c) => c.weaponId !== null && c.artifactSetId !== null)
    );
  const canSubmit =
    title.trim() && description.trim() && videoLink.trim() && bossesValid;

  // Set of all char IDs used across ALL bosses — passed into each boss's
  // character picker so chars claimed by another boss show as disabled.
  const allUsedCharIds = new Set(bossEntries.flatMap((b) => b.characters.map((c) => c.charId)));

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="alert alert-error">{loadError}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="opacity-60 mt-1">Update your Stygian clear</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Meta fields ──────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Details</h2>

          <div className="form-control">
            <label className="label"><span className="label-text">Title</span></label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Description</span></label>
            <textarea
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

        {/* ── Boss sections ─────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Bosses</h2>
            <p className="text-sm opacity-60 mt-1">
              Edit build notes and characters for each boss. The boss list is fixed to the
              original stygian cycle.
            </p>
          </div>

          {/* All char IDs used across every boss — blocks cross-boss reuse in the picker */}
          {bossEntries.map((boss) => {
            const thisBossCharIds = new Set(boss.characters.map((c) => c.charId));

            // Live cost calculation — mirrors the backend CostCalculator exactly.
            const costBreakdown = boss.characters.map((entry) => {
              const char = characters.find((c) => c.id === entry.charId);
              const weapon = weapons.find((w) => w.id === entry.weaponId);
              const characterCost = char ? calculateCharacterCost(char.rarity, char.isLimited, entry.cons) : 0;
              const weaponCost = weapon ? calculateWeaponCost(weapon.rarity, weapon.isLimited, entry.refinement) : 0;
              return { entry, char, weapon, characterCost, weaponCost, slotCost: characterCost + weaponCost };
            });
            const totalCost = costBreakdown.reduce((sum, b) => sum + b.slotCost, 0);

            return (
              <div key={boss.bossId} className="card bg-base-200 shadow-md">
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
                      className="input input-bordered input-sm w-full"
                      value={boss.buildInfo}
                      onChange={(e) => setBuildInfo(boss.bossId, e.target.value)}
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
                          setClearTime(boss.bossId, v);
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
                    onChange={(tags) => setBossTags(boss.bossId, tags)}
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
                        const char = characters.find((c) => c.id === Number(e.target.value));
                        if (char) addCharacterToBoss(boss.bossId, char);
                      }}
                      disabled={boss.characters.length >= 4}
                    >
                      <option disabled value="">Add character…</option>
                      {characters.map((c) => {
                        const usedElsewhere = allUsedCharIds.has(c.id) && !thisBossCharIds.has(c.id);
                        const alreadyHere   = thisBossCharIds.has(c.id);
                        return (
                          <option key={c.id} value={c.id} disabled={alreadyHere || usedElsewhere}>
                            {usedElsewhere ? `[Used] ${c.name}` : alreadyHere ? `[Added] ${c.name}` : c.name}
                            {!usedElsewhere && !alreadyHere ? ` (${c.element.name} · ${c.weaponType.name})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Character rows */}
                  {boss.characters.length > 0 && (
                    <div className="divide-y divide-base-300">
                      {boss.characters.map((entry) => {
                        const char = characters.find((c) => c.id === entry.charId);
                        const iconSrc = `${CHAR_ICON_BASE}/${entry.charSlug}/icon.webp`;

                        // Only weapons matching this character's weapon type are
                        // selectable, sorted by rarity descending (5★ first).
                        const matchingWeapons = char
                          ? weapons
                              .filter((w) => w.weaponType.id === char.weaponType.id)
                              .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name))
                          : [];
                        const selectedWeapon = matchingWeapons.find((w) => w.id === entry.weaponId);
                        const selectedArtifactSet = artifactSets.find((a) => a.id === entry.artifactSetId);

                        return (
                          <div key={entry.charId} className="py-2 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <img
                                src={iconSrc}
                                alt={entry.charName}
                                className="w-9 h-9 rounded-md object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />

                              <span className="font-medium w-24 text-sm">{entry.charName}</span>
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
                                    updateCharacterField(boss.bossId, entry.charId, "cons", Number(e.target.value))
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
                                    updateCharacterField(boss.bossId, entry.charId, "hasSig", e.target.checked)
                                  }
                                />
                                Sig
                              </label>

                              <button
                                type="button"
                                className="btn btn-xs btn-error ml-auto"
                                onClick={() => removeCharacterFromBoss(boss.bossId, entry.charId)}
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
                                    if (weapon) onWeaponChange(boss.bossId, entry.charId, weapon);
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
                                    updateCharacterField(boss.bossId, entry.charId, "refinement", Number(e.target.value))
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
                                    updateCharacterField(boss.bossId, entry.charId, "artifactSetId", Number(e.target.value))
                                  }
                                  required
                                >
                                  <option disabled value="">Select artifact set…</option>
                                  {artifactSets.map((a) => (
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
          })}
        </section>

        {submitError && (
          <div className="alert alert-error">{submitError}</div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={() => router.push(`/post/${postId}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
