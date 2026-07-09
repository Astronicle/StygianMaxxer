"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGetStygians, type Stygian } from "@/app/lib/api";
import StygianBrowseCard from "@/app/components/stygianBrowse/StygianBrowseCard";

export default function StygianBrowsePage() {
  const [stygians, setStygians] = useState<Stygian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // GET /api/stygian — returns all stygian cycles with their boss slots
        const data = await apiGetStygians();
        // Sort newest version first (descending string sort works for "6.2", "6.3" etc.)
        setStygians(data.sort((a, b) => b.version.localeCompare(a.version)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Stygians");
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stygians</h1>
        <p className="opacity-70">Browse all available Stygian cycles</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {stygians.length === 0 ? (
        <div className="alert alert-info">No Stygians available.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stygians.map((stygian) => (
            // Link uses the numeric stygian.id, which the detail page reads as a path param
            <Link key={stygian.id} href={`/stygian/${stygian.id}`} className="h-full">
              <StygianBrowseCard stygian={stygian} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
