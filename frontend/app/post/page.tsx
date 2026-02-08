import { mockPostBrowse } from "@/app/lib/mock/postBrowse";
import PostBrowseCard from "@/app/components/postBrowse/PostBrowseCard";

export default function PostBrowsePage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Posts</h1>
        <p className="opacity-70">
          Browse all Stygian clear posts
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {mockPostBrowse.map((post) => (
          <PostBrowseCard key={post.postID} {...post} />
        ))}
      </div>
    </div>
  );
}
