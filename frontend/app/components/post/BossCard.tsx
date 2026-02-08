import CharacterBadge from "./CharacterBadge";

type Boss = {
  id: number;
  name: string;
  icon: string;
  buildInfo?: string;
  characters: any[];
};

export default function BossCard({ name, icon, buildInfo, characters }: Boss) {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body gap-4">
        {/* Boss header */}
        <div className="flex items-center gap-3">
          <img src={icon} alt={name} className="w-12 h-12 rounded-md" />
          <h3 className="text-lg font-semibold">{name}</h3>
        </div>

        {/* Build info */}
        {buildInfo && (
          <div className="border-l-4 border-primary bg-base-300 px-3 py-2 text-sm">
            <span className="opacity-80">{buildInfo}</span>
          </div>
        )}

        {/* Characters */}
        <div className="grid gap-3">
          {characters.map((char) => (
            <CharacterBadge key={char.id} {...char} />
          ))}
        </div>
      </div>
    </div>
  );
}
