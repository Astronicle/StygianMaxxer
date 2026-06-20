"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, apiGetStygians, type Stygian } from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

// What the backend expects per character in a boss entry
// POST /api/posts → PostCreateRequest → PostBossCreateRequest → PostBossCharacterCreateRequest
type CharacterEntry = {
  charId: number;
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
  characters: CharacterEntry[];
};

// A character as returned by GET /api/characters
type CharacterOption = {
  id: number;
  slug: string;
  name: string;
  rarity: number;
  element: { id: number; slug: string; name: string };
  weaponType: { id: number; slug: string; name: string };
};

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostCreatePage() {
  const router = useRouter();

  // ── Form meta fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [difficulty, setDifficulty] = useState<"Fearless" | "Dire">("Fearless");

  // ── Lookup data loaded from the API
  const [stygians, setStygians] = useState<Stygian[]>([]);
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
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

  // ── Load stygians + characters in parallel on mount
  useEffect(() => {
    async function loadLookups() {
      try {
        const { apiFetch } = await import("@/app/lib/api");
        const [stygiansData, charsData] = await Promise.all([
          apiGetStygians(),
          apiFetch<CharacterOption[]>("/api/characters"),
        ]);
        // Sort newest stygian first
        setStygians(stygiansData.sort((a, b) => b.version.localeCompare(a.version)));
        // Sort characters alphabetically
        setCharacters(charsData.sort((a, b) => a.name.localeCompare(b.name)));
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

  function addCharacterToBoss(bossId: number, char: CharacterOption) {
    setBossEntries((prev) =>
      prev.map((b) => {
        if (b.bossId !== bossId) return b;
        if (b.characters.length >= 4) return b;
        if (b.characters.some((c) => c.charId === char.id)) return b;
        const nextSlot = b.characters.length + 1; // slot is 1-indexed
        return {
          ...b,
          characters: [
            ...b.characters,
            { charId: char.id, slot: nextSlot, hasSig: false, cons: 0 },
          ],
        };
      })
    );
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
    field: "cons" | "hasSig",
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

  // ── Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStygianId) return;

    setSubmitError(null);
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
        bosses: bossEntries
          .filter((b) => activeBossIds.has(b.bossId))
          .map((b) => ({
          bossId: b.bossId,
          buildInfo: b.buildInfo,
          characters: b.characters.map((c) => ({
            charId: c.charId,
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
      <div className="max-w-2xl mx-auto p-6">
        <div className="alert alert-error">{lookupsError}</div>
      </div>
    );
  }

  const selectedStygian = stygians.find((s) => s.id === selectedStygianId);
  const activeBosses = bossEntries.filter((b) => activeBossIds.has(b.bossId));

  // Validation: at least 1 boss selected, and every active boss has ≥1 character + buildInfo
  const bossesValid =
    activeBosses.length >= 1 &&
    activeBosses.every(
      (b) => b.characters.length >= 1 && b.buildInfo.trim().length > 0
    );
  const canSubmit =
    title.trim() &&
    description.trim() &&
    videoLink.trim() &&
    selectedStygianId !== null &&
    bossesValid;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
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
                      onBuildInfoChange={(v) => setBuildInfo(boss.bossId, v)}
                      onAddCharacter={(c) => addCharacterToBoss(boss.bossId, c)}
                      onRemoveCharacter={(charId) => removeCharacterFromBoss(boss.bossId, charId)}
                      onUpdateCharacter={(charId, field, value) =>
                        updateCharacterField(boss.bossId, charId, field, value)
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
  onBuildInfoChange: (v: string) => void;
  onAddCharacter: (c: CharacterOption) => void;
  onRemoveCharacter: (charId: number) => void;
  onUpdateCharacter: (charId: number, field: "cons" | "hasSig", value: number | boolean) => void;
};

function BossSection({
  boss,
  allCharacters,
  onBuildInfoChange,
  onAddCharacter,
  onRemoveCharacter,
  onUpdateCharacter,
}: BossSectionProps) {
  const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
  const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";

  const selectedCharIds = new Set(boss.characters.map((c) => c.charId));

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
            {allCharacters.map((c) => (
              <option key={c.id} value={c.id} disabled={selectedCharIds.has(c.id)}>
                {c.name} ({c.element.name} · {c.weaponType.name})
              </option>
            ))}
          </select>
        </div>

        {/* Selected characters */}
        {boss.characters.length > 0 && (
          <div className="divide-y divide-base-300">
            {boss.characters.map((entry) => {
              const char = allCharacters.find((c) => c.id === entry.charId);
              if (!char) return null;
              return (
                <div key={entry.charId} className="flex items-center gap-3 py-2 flex-wrap">
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
