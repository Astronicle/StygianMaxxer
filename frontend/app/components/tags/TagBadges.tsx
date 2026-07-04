type TagBadgesProps<T extends string> = {
  tags: T[] | undefined;
  labels: Record<T, string>;
  className?: string;
};

/**
 * Read-only tag chips. Used on /post/[postID] for both post-wide tags
 * (PostTag, shown near the post header) and boss-specific tags (BossTag,
 * shown on each BossCard). See the "How to use Tags" section on /about.
 */
export default function TagBadges<T extends string>({ tags, labels, className }: TagBadgesProps<T>) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {tags.map((tag) => (
        <span key={tag} className="badge badge-sm badge-outline badge-secondary">
          {labels[tag]}
        </span>
      ))}
    </div>
  );
}
