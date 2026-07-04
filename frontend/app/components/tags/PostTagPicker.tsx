"use client";

import type { PostTag } from "@/app/lib/api";
import { POST_TAG_LABELS } from "@/app/lib/api";

type PostTagPickerProps = {
  selected: Set<PostTag>;
  onChange: (next: Set<PostTag>) => void;
};

// Each row is its own mutually-exclusive group (radio-style — picking one
// clears the others in the same row) except "No Builds", which stands alone
// as a plain toggle. See the "How to Use Tags" section on /about.
const GROUPS: readonly PostTag[][] = [
  ["MINE", "NOT_MINE"],
  ["NO_BUILDS"],
  ["FPS_30", "FPS_60", "FPS_120"],
  ["HIGH_PING", "LOW_PING"],
];

export default function PostTagPicker({ selected, onChange }: PostTagPickerProps) {
  function pick(group: readonly PostTag[], tag: PostTag) {
    const next = new Set(selected);
    const alreadyActive = next.has(tag);

    // Clear the rest of this group, then toggle the clicked tag.
    for (const t of group) next.delete(t);
    if (!alreadyActive) next.add(tag);

    onChange(next);
  }

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text text-sm">Tags (see /about for what each tag means)</span>
      </label>
      <div className="flex flex-col gap-2">
        {GROUPS.map((group) => (
          <div key={group.join("-")} className="flex flex-wrap gap-2">
            {group.map((tag) => {
              const active = selected.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => pick(group, tag)}
                  className={`btn btn-sm ${active ? "btn-primary" : "btn-outline"}`}
                >
                  {POST_TAG_LABELS[tag]}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
