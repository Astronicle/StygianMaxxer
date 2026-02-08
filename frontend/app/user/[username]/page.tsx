import { mockUser } from "@/app/lib/mock/user";
import UserHeader from "@/app/components/user/UserHeader";
import PostCard from "@/app/components/user/PostCard";

type PageProps = {
  params: {
    username: string;
  };
};

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  //mock guard - later this would be a fetch to the backend
  if (username !== mockUser.username) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* USER HEADER */}
      <UserHeader
        username={mockUser.username}
        charIcon={mockUser.charIcon}
      />

      {/* POSTS */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Posts</h2>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {mockUser.posts.map((post) => (
            <PostCard
              key={post.postID}
              postID={post.postID}
              title={post.title}
              stygianVersion={post.stygianVersion}
              bossesKilled={post.bossesKilled}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
