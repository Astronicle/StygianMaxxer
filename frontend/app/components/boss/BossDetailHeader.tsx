// BossDetailHeader — icon + name banner at the top of the boss detail page.
// The backend's BossResponse { id, slug, name } does NOT include stygianVersions,
// so we removed that prop. The page fetches posts separately and shows them below.

type BossDetailHeaderProps = {
  name: string;
  icon: string;    // full Supabase URL built by the parent page
};

export default function BossDetailHeader({ name, icon }: BossDetailHeaderProps) {
  return (
    <div className="flex items-center gap-6">
      <img
        src={icon}
        alt={name}
        className="w-28 h-28 object-contain"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{name}</h1>
      </div>
    </div>
  );
}
