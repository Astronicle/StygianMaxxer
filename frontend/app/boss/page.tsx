import { mockBossBrowse } from "@/app/lib/mock/bossBrowse";
import BossBrowseCard from "@/app/components/bossBrowse/BossBrowseCard";

export default function BossBrowsePage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bosses</h1>
        <p className="opacity-70">
          Browse all bosses available in the Stygian Onslaught database
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {mockBossBrowse.map((boss) => (
          <BossBrowseCard key={boss.id} {...boss} />
        ))}
      </div>
    </div>
  );
}
