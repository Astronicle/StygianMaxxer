"use client";

type TagPickerProps<T extends string> = {
  label: string;
  allTags: readonly T[];
  labels: Record<T, string>;
  selected: Set<T>;
  onChange: (next: Set<T>) => void;
  size?: "xs" | "sm";
  /** Pairs of tags that can't both be active — selecting one clears the other (e.g. Mine / Not Mine). */
  exclusivePairs?: readonly [T, T][];
};

/**
 * Multi-select pill picker used for both post-wide tags (PostTag) and
 * boss-specific tags (BossTag) during post creation/editing. See the
 * "How to use Tags" section on /about for what each tag means.
 */
export default function TagPicker<T extends string>({
  label,
  allTags,
  labels,
  selected,
  onChange,
  size = "sm",
  exclusivePairs = [],
}: TagPickerProps<T>) {
  function toggle(tag: T) {
    const next = new Set(selected);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
      for (const [a, b] of exclusivePairs) {
        if (a === tag) next.delete(b);
        if (b === tag) next.delete(a);
      }
    }
    onChange(next);
  }

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text text-sm">{label}</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const active = selected.has(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`btn ${size === "xs" ? "btn-xs" : "btn-sm"} ${
                active ? "btn-primary" : "btn-outline"
              }`}
            >
              {labels[tag]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
