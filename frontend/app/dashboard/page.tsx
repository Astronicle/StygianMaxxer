import { dashboardMock } from "@/app/lib/mock/dashboard";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import DashboardPostCard from "@/app/components/dashboard/DashboardPostCard";

export default function DashboardPage() {
  const user = dashboardMock;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Header */}
      <DashboardHeader
        username={user.username}
        charIcon={user.charIcon}
      />

      {/* Posts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Your Posts
        </h2>

        {user.posts.length === 0 ? (
          <div className="alert alert-info">
            You haven't created any posts yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.posts.map((post) => (
              <DashboardPostCard
                key={post.postID}
                {...post}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
