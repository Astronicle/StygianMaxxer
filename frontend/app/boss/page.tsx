"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGetBosses, type Boss } from "@/app/lib/api";
import BossBrowseCard from "@/app/components/bossBrowse/BossBrowseCard";

export default function BossBrowsePage() {
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // GET /api/bosses — returns Boss[] { id, slug, name }
        const data = await apiGetBosses();
        // Sort alphabetically by name for consistent display
        setBosses(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bosses");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bosses</h1>
        <p className="opacity-70">Browse all bosses in the Stygian database</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {bosses.length === 0 ? (
        <div className="alert alert-info">No bosses found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {bosses.map((boss) => (
            // Link uses boss.id (numeric) as the route param
            <Link key={boss.id} href={`/boss/${boss.id}`} className="h-full">
              <BossBrowseCard boss={boss} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
