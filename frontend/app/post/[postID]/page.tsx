import { mockPost } from "@/app/lib/mock/post";
import PostHeader from "@/app/components/post/PostHeader";
import VideoEmbed from "@/app/components/post/VideoEmbed";
import BossCard from "@/app/components/post/BossCard";

type PageProps = {
  params: Promise<{
    postID: string;
  }>;
};

export default async function PostPage({ params }: PageProps) {
  const { postID } = await params;
  const numericPostID = Number(postID);

  const post = mockPost.find((p) => p.postID === numericPostID);

  if (!post) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error">Post not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <PostHeader {...post} />

      <div className="badge badge-outline">
        Stygian Version {post.stygianAttempt.version}
      </div>

      <VideoEmbed url={post.videoLink} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bosses</h2>

        <div className="grid gap-6">
          {post.stygianAttempt.bosses.map((boss) => (
            <BossCard key={boss.id} {...boss} />
          ))}
        </div>
      </section>
    </div>
  );
}
