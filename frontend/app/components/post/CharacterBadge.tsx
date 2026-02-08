type Character = {
  id: number;
  name: string;
  icon: string;
  element: string;
  cons: number;
  hasSig: boolean;
};

export default function CharacterBadge({
  name,
  icon,
  element,
  cons,
  hasSig,
}: Character) {
  return (
    <div className="flex items-center gap-3 bg-base-200 rounded-lg p-2">
      <img
        src={icon}
        alt={name}
        className="w-12 h-12 rounded-md object-cover"
      />

      <div className="text-sm">
        <p className="font-semibold">{name}</p>
        <p className="opacity-70">
          {element} • C{cons}
        </p>
        {hasSig && (
          <span className="badge badge-primary badge-sm mt-1">Signature</span>
        )}
      </div>
    </div>
  );
}
