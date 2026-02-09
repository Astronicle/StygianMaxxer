import { mockStygianBrowse } from "@/app/lib/mock/stygianBrowse";
import StygianBrowseCard from "@/app/components/stygianBrowse/StygianBrowseCard";

export default function StygianBrowsePage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stygians</h1>
        <p className="opacity-70">
          Browse all available Stygian cycles
        </p>
      </div>

      {mockStygianBrowse.length === 0 ? (
        <div className="alert alert-info">
          No Stygians available.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStygianBrowse.map((stygian) => (
            <StygianBrowseCard
              key={stygian.stygianID}
              {...stygian}
            />
          ))}
        </div>
      )}
    </div>
  );
}
