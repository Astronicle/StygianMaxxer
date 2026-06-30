"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  apiGetPost,
  apiGetPostRatingSummary,
  type PostDetail,
  type RatingSummary,
} from "@/app/lib/api";
import PostHeader from "@/app/components/post/PostHeader";
import PostRatingPanel from "@/app/components/post/PostRatingPanel";
import VideoEmbed from "@/app/components/post/VideoEmbed";
import BossCard from "@/app/components/post/BossCard";

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";
const WEAPON_ICON_BASE = process.env.NEXT_PUBLIC_WEAPON_ICON_BASE_URL ?? "";
const ARTIFACT_ICON_BASE = process.env.NEXT_PUBLIC_ARTIFACT_ICON_BASE_URL ?? "";

// Map a bossSlug/charName to the Supabase icon URL.
// Boss icons live at: <BOSS_ICON_BASE><bossSlug>.png  (same bucket the dashboard uses)
// Char icons live at: <CHAR_ICON_BASE>char/<charName>.png  — adjust the path if yours differs
function bossIcon(slug: string) {
  return `${BOSS_ICON_BASE}/${slug}/model.webp`;
}
function charIcon(name: string) {
  return `${CHAR_ICON_BASE}/${name}/icon.webp`;
}
function weaponIcon(weaponTypeSlug: string, weaponSlug: string) {
  return `${WEAPON_ICON_BASE}/${weaponTypeSlug}/${weaponSlug}.png`;
}
function artifactSetIcon(slug: string) {
  return `${ARTIFACT_ICON_BASE}/${slug}.png`;
}

export default function PostPage() {
  const { postID } = useParams<{ postID: string }>();
  const postId = Number(postID);

  const [post, setPost] = useState<PostDetail | null>(null);
  const [rating, setRating] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch the post and its rating summary in parallel
        const [postData, ratingData] = await Promise.all([
          apiGetPost(postId),
          apiGetPostRatingSummary(postId),
        ]);
        setPost(postData);
        setRating(ratingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error">{error ?? "Post not found"}</div>
      </div>
    );
  }

  const headerProps = {
    title: post.title,
    description: post.description ?? "",
    createdAt: post.createdAt,
    difficulty: post.difficulty,
    author: { username: post.account.username },
  };

  const bosses = post.bosses.map((b) => ({
    id: b.bossId,
    name: b.bossName,
    icon: bossIcon(b.bossSlug),
    buildInfo: b.buildInfo ?? undefined,
    clearTime: b.clearTime,
    cost: b.cost,
    characters: b.characters.map((c) => ({
      id: c.charId,
      name: c.charName,
      icon: charIcon(c.charSlug),
      element: "",   // backend doesn't return element — add later if needed
      cons: c.cons,
      hasSig: c.hasSig,
      weaponName: c.weaponName,
      weaponIcon: weaponIcon(c.weaponTypeSlug, c.weaponSlug),
      weaponRarity: c.weaponRarity,
      refinement: c.refinement,
      artifactSetName: c.artifactSetName,
      artifactSetIcon: artifactSetIcon(c.artifactSetSlug),
    })),
  }));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <PostHeader {...headerProps} />

      <div className="badge badge-outline">
        {post.stygian.stygianName} {post.stygian.version}
      </div>

      {rating && (
        <PostRatingPanel
          postId={postId}
          postOwnerId={post.account.accountId}
          initialSummary={rating}
        />
      )}

      {post.videoLink && <VideoEmbed url={post.videoLink} />}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bosses</h2>
        <div className="grid gap-6">
          {bosses.map((boss) => (
            <BossCard key={boss.id} {...boss} />
          ))}
        </div>
      </section>
    </div>
  );
}
