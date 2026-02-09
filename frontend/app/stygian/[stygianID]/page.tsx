import { mockStygian } from "@/app/lib/mock/stygian";
import StygianDetailHeader from "@/app/components/stygian/StygianDetailHeader";
import StygianPostCard from "@/app/components/stygian/StygianPostCard";

type PageProps = {
  params: {
    stygianID: string;
  };
};

export default async function StygianDetailPage({ params }: PageProps) {

  const { stygianID } = await params;
  const numericStygianID = Number(stygianID);

  const stygian = mockStygian.find(
    (s) => Number(s.stygianID) === numericStygianID
  );

  if (!stygian) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error">
          Stygian not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Header */}
      <StygianDetailHeader
        version={stygian.version}
        bosses={stygian.bosses}
      />

      {/* Posts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Posts for Stygian {stygian.version}
        </h2>

        {stygian.posts.length === 0 ? (
          <div className="alert alert-info">
            No posts for this Stygian yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {stygian.posts.map((post) => (
              <StygianPostCard
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
