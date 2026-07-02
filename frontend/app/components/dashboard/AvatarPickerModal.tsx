"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { apiGetCharacters, type Character } from "@/app/lib/api";
import { avatarIconUrl } from "@/app/lib/avatar";

interface AvatarPickerModalProps {
  open: boolean;
  currentCharId: number | null;
  onClose: () => void;
  // Called with the chosen character's id when the user confirms a pick.
  onSelect: (charId: number) => void | Promise<void>;
}

export default function AvatarPickerModal({
  open,
  currentCharId,
  onClose,
  onSelect,
}: AvatarPickerModalProps) {
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Load the character list — and reset transient picker state — each time
  // the modal opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setQuery("");
      setSaving(false);
      setSavingId(null);
      try {
        const chars = await apiGetCharacters();
        if (!cancelled) {
          setAllCharacters(
            [...chars].sort((a, b) => a.name.localeCompare(b.name))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load characters");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCharacters;
    return allCharacters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.element.name.toLowerCase().includes(q) ||
        c.weaponType.name.toLowerCase().includes(q)
    );
  }, [allCharacters, query]);

  if (!open) return null;

  async function handlePick(char: Character) {
    if (saving) return;
    setSaving(true);
    setSavingId(char.id);
    setError(null);
    try {
      await onSelect(char.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update avatar");
    } finally {
      setSaving(false);
      setSavingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-base-200 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
          <h2 className="text-xl font-bold">Choose Your Avatar</h2>
          <button
            type="button"
            className="btn btn-sm btn-ghost btn-circle"
            onClick={onClose}
            disabled={saving}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <input
            type="text"
            placeholder="Search characters…"
            className="input input-bordered input-sm w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {error && (
          <div className="px-6 pt-3">
            <div className="alert alert-error text-sm">{error}</div>
          </div>
        )}

        {/* Body — character grid */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center opacity-60 py-10">No characters match your search.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {filtered.map((char) => {
                const isCurrent = char.id === currentCharId;
                const isSaving = savingId === char.id;
                return (
                  <button
                    key={char.id}
                    type="button"
                    title={char.name}
                    disabled={saving}
                    onClick={() => handlePick(char)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors border-2 ${
                      isCurrent
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:bg-base-300"
                    } disabled:opacity-50`}
                  >
                    <div className="avatar">
                      <div className="w-14 rounded-full">
                        {isSaving ? (
                          <div className="w-14 h-14 flex items-center justify-center">
                            <span className="loading loading-spinner loading-sm" />
                          </div>
                        ) : (
                          <img
                            src={avatarIconUrl(char.slug)}
                            alt={char.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/icon.png";
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-center leading-tight line-clamp-2">
                      {char.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
