"use client";

import { useState } from "react";
import {
  postCreateStygianMock,
  postCreateBossMock,
} from "@/app/lib/mock/postCreate";
import CreateBossCard from "@/app/components/postCreate/CreateBossCard";

export default function PostCreatePage() {
  const [selectedStygian, setSelectedStygian] = useState<string | null>(null);
  const [bossSelections, setBossSelections] = useState<any[]>([]);

  function handleStygianSelect(id: string) {
    setSelectedStygian(id);
    setBossSelections(
      postCreateBossMock.bosses.map((b) => ({
        bossID: b.id,
        characters: [],
      })),
    );
  }

  function updateBoss(bossID: number, characters: any[]) {
    setBossSelections((prev) =>
      prev.map((b) => (b.bossID === bossID ? { ...b, characters } : b)),
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Create Post</h1>

      {/* STYGIAN SELECT */}
      <div className="form-control max-w-xs">
        <label className="label">
          <span className="label-text">Select Stygian</span>
        </label>
        <select
          className="select select-bordered"
          value={selectedStygian ?? ""}
          onChange={(e) => handleStygianSelect(e.target.value)}
        >
          <option disabled value="">
            Select version
          </option>
          {postCreateStygianMock.stygianVersion.map((id) => (
            <option key={id} value={id}>
              Version {id}
            </option>
          ))}
        </select>
      </div>

      {/* BOSSES */}
      {selectedStygian && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Bosses</h2>

          <div className="grid gap-6">
            {postCreateBossMock.bosses.map((boss) => (
              <CreateBossCard
                key={boss.id}
                boss={boss}
                characters={postCreateBossMock.characters}
                onChange={(
                  chars: {
                    characterID: number;
                    constellation: number;
                    hasSig: boolean;
                  }[],
                ) => updateBoss(boss.id, chars)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
