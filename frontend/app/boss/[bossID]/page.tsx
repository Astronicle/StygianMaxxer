import { bossMock } from "@/app/lib/mock/boss";
import BossDetailHeader from "@/app/components/boss/BossDetailHeader";
import BossPostCard from "@/app/components/boss/BossPostCard";

type PageProps = {
  params: {
    bossID: string;
  };
};

export default async function BossDetailPage({ params }: PageProps) {
  const { bossID } = await params;
  const bossIDNumber = Number(bossID);

  const boss = bossMock.find((b) => b.id === bossIDNumber);

  if (!boss) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error">Boss not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Boss header */}
      <BossDetailHeader
        name={boss.name}
        icon={boss.icon}
        stygianVersions={boss.stygianVersions}
      />

      {/* Posts section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Posts featuring {boss.name}
        </h2>

        {boss.posts.length === 0 ? (
          <div className="alert alert-info">
            No posts available for this boss yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {boss.posts.map((post) => (
              <BossPostCard key={post.id} {...post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
