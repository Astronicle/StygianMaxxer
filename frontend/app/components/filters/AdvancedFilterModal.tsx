"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Character, PostFilterParams, StygianBoss } from "@/app/lib/api";
import { apiGetCharacters } from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdvancedFilters = Pick<
  PostFilterParams,
  | "difficulty"
  | "minCost"
  | "maxCost"
  | "minTime"
  | "maxTime"
  | "charInclude"
  | "includeMode"
  | "charExclude"
  | "allBossesOnly"
>;

interface AdvancedFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedFilters) => void;
  initial: AdvancedFilters;
  // stygian page only — shows "All Bosses Cleared" toggle + boss multi-select
  stygianBosses?: StygianBoss[];
}

const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";

// ─── Character search chip ───────────────────────────────────────────────────

function CharChip({
  char,
  onRemove,
}: {
  char: Character;
  onRemove: () => void;
}) {
  return (
    <span className="badge badge-outline gap-1 pl-1 pr-2 py-3">
      <img
        src={`${CHAR_ICON_BASE}/${char.slug}/icon.webp`}
        alt={char.name}
        className="w-5 h-5 rounded"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <span className="text-xs">{char.name}</span>
      <button
        type="button"
        className="ml-1 opacity-60 hover:opacity-100"
        onClick={onRemove}
      >
        ×
      </button>
    </span>
  );
}

// ─── Reusable character search input ─────────────────────────────────────────

function CharacterSearchInput({
  label,
  selected,
  allChars,
  onAdd,
  onRemove,
  max,
}: {
  label: string;
  selected: Character[];
  allChars: Character[];
  onAdd: (c: Character) => void;
  onRemove: (id: number) => void;
  max?: number;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selected.map((c) => c.id));
  const filtered = allChars.filter(
    (c) =>
      !selectedIds.has(c.id) &&
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const isFull = max != null && selected.length >= max;

  return (
    <div>
      <p className="text-xs font-bold uppercase opacity-60 mb-2">{label} ({selected.length}{max != null ? `/${max}` : ""})</p>

      {/* Selected chips */}
      <div className="flex flex-wrap gap-1 mb-2 min-h-[2rem]">
        {selected.map((c) => (
          <CharChip key={c.id} char={c} onRemove={() => onRemove(c.id)} />
        ))}
        {selected.length === 0 && (
          <span className="text-xs opacity-40">No {label.toLowerCase()} characters</span>
        )}
      </div>

      {/* Search input */}
      {!isFull && (
        <div ref={containerRef} className="relative">
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="e.g. Mavuika"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {open && filtered.length > 0 && (
            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-base-300 rounded-box shadow-lg max-h-52 overflow-y-auto">
              {filtered.slice(0, 40).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-base-100 text-sm"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onAdd(c);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <img
                    src={`${CHAR_ICON_BASE}/${c.slug}/icon.webp`}
                    alt={c.name}
                    className="w-6 h-6 rounded"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span>{c.name}</span>
                  <span className="ml-auto opacity-50 text-xs">{c.rarity}★ {c.isLimited ? "Limited" : "Standard"}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function AdvancedFilterModal({
  open,
  onClose,
  onApply,
  initial,
  stygianBosses,
}: AdvancedFilterModalProps) {
  const isStygianPage = stygianBosses != null;

  // Local working state — committed to parent only on Apply
  const [difficulty, setDifficulty] = useState<"Fearless" | "Dire" | undefined>(
    initial.difficulty
  );
  const [minCost, setMinCost] = useState<string>(
    initial.minCost != null ? String(initial.minCost) : ""
  );
  const [maxCost, setMaxCost] = useState<string>(
    initial.maxCost != null ? String(initial.maxCost) : ""
  );
  const [minTime, setMinTime] = useState<string>(
    initial.minTime != null ? String(initial.minTime) : ""
  );
  const [maxTime, setMaxTime] = useState<string>(
    initial.maxTime != null ? String(initial.maxTime) : ""
  );
  const [allBossesOnly, setAllBossesOnly] = useState(
    Boolean(initial.allBossesOnly)
  );
  const [includeMode, setIncludeMode] = useState<"AND" | "OR">(
    (initial.includeMode as "AND" | "OR") ?? "AND"
  );

  // Characters
  const [allChars, setAllChars] = useState<Character[]>([]);
  const [included, setIncluded] = useState<Character[]>([]);
  const [excluded, setExcluded] = useState<Character[]>([]);

  // Load characters once
  useEffect(() => {
    apiGetCharacters().then((chars) =>
      setAllChars(chars.sort((a, b) => a.name.localeCompare(b.name)))
    );
  }, []);

  // Sync initial → local state when modal opens.
  // Since the component is only rendered when open=true (via "if (!open) return null"
  // at the bottom), each open is a fresh mount and initial useState values are correct.
  // We only need to handle the allChars hydration for charInclude/charExclude IDs.
  useEffect(() => {
    if (allChars.length === 0) return;
    const inclIds = new Set(initial.charInclude ?? []);
    const exclIds = new Set(initial.charExclude ?? []);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIncluded(allChars.filter((c) => inclIds.has(c.id)));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExcluded(allChars.filter((c) => exclIds.has(c.id)));
  }, [allChars]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleReset() {
    setDifficulty(undefined);
    setMinCost(""); setMaxCost("");
    setMinTime(""); setMaxTime("");
    setAllBossesOnly(false);
    setIncludeMode("AND");
    setIncluded([]);
    setExcluded([]);
  }

  function handleApply() {
    onApply({
      difficulty,
      minCost:    minCost  !== "" ? Number(minCost)  : undefined,
      maxCost:    maxCost  !== "" ? Number(maxCost)  : undefined,
      minTime:    minTime  !== "" ? Number(minTime)  : undefined,
      maxTime:    maxTime  !== "" ? Number(maxTime)  : undefined,
      charInclude: included.map((c) => c.id),
      includeMode,
      charExclude: excluded.map((c) => c.id),
      allBossesOnly: isStygianPage ? allBossesOnly : undefined,
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-base-200 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
          <h2 className="text-xl font-bold">Advanced Filter</h2>
          <button type="button" className="btn btn-sm btn-ghost btn-circle" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Top grid: difficulty + cost */}
          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="bg-base-300 rounded-xl p-4">
              <p className="text-xs font-bold uppercase opacity-60 mb-2">Difficulty</p>
              <div className="flex gap-2">
                {(["Fearless", "Dire"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`btn btn-sm flex-1 ${difficulty === d ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setDifficulty(difficulty === d ? undefined : d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost range */}
            <div className="bg-base-300 rounded-xl p-4">
              <p className="text-xs font-bold uppercase opacity-60 mb-2">Cost Range</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  className="input input-bordered input-sm w-full"
                  value={minCost}
                  onChange={(e) => setMinCost(e.target.value)}
                />
                <span className="opacity-50">–</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  className="input input-bordered input-sm w-full"
                  value={maxCost}
                  onChange={(e) => setMaxCost(e.target.value)}
                />
              </div>
            </div>

            {/* Time range */}
            <div className="bg-base-300 rounded-xl p-4">
              <p className="text-xs font-bold uppercase opacity-60 mb-2">Clear Time (seconds)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={360}
                  placeholder="Min"
                  className="input input-bordered input-sm w-full"
                  value={minTime}
                  onChange={(e) => setMinTime(e.target.value)}
                />
                <span className="opacity-50">–</span>
                <input
                  type="number"
                  min={0}
                  max={360}
                  placeholder="Max"
                  className="input input-bordered input-sm w-full"
                  value={maxTime}
                  onChange={(e) => setMaxTime(e.target.value)}
                />
              </div>
            </div>

            {/* All bosses cleared — stygian page only */}
            {isStygianPage && (
              <div className="bg-base-300 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase opacity-60">All Bosses Cleared</p>
                  <p className="text-xs opacity-50 mt-1">Only show posts that cleared every boss in this stygian.</p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={allBossesOnly}
                  onChange={(e) => setAllBossesOnly(e.target.checked)}
                />
              </div>
            )}
          </div>

          {/* Include */}
          <div className="bg-base-300 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span />
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-60">MODE</span>
                <div
                  className="tooltip tooltip-left"
                  data-tip="AND requires every included character. OR matches teams with at least one included character."
                >
                  <div className="join">
                    {(["AND", "OR"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`join-item btn btn-xs ${includeMode === m ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setIncludeMode(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <CharacterSearchInput
              label={`Include (${included.length}/4)`}
              selected={included}
              allChars={allChars.filter((c) => !excluded.find((e) => e.id === c.id))}
              onAdd={(c) => setIncluded((prev) => prev.length < 4 ? [...prev, c] : prev)}
              onRemove={(id) => setIncluded((prev) => prev.filter((c) => c.id !== id))}
              max={4}
            />
          </div>

          {/* Exclude */}
          <div className="bg-base-300 rounded-xl p-4">
            <CharacterSearchInput
              label={`Exclude (${excluded.length})`}
              selected={excluded}
              allChars={allChars.filter((c) => !included.find((e) => e.id === c.id))}
              onAdd={(c) => setExcluded((prev) => [...prev, c])}
              onRemove={(id) => setExcluded((prev) => prev.filter((c) => c.id !== id))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-base-300">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
            Reset Advanced Filters
          </button>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleApply}>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}
