type BossBrowseCardProps = {
  id: number;
  name: string;
  slug: string;
};

export default function BossBrowseCard({
  name,
  slug,
}: BossBrowseCardProps) {

  const iconBaseUrl = process.env.NEXT_PUBLIC_ICON_BASE_URL;
  
  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <div className="card-body items-center text-center gap-3">
        <img
          src={`${iconBaseUrl}/${slug}/model.webp`}
          alt={name}
          className="w-24 h-24 object-contain"
        />

        <h3 className="font-semibold text-lg">{name}</h3>
      </div>
    </div>
  );
}
