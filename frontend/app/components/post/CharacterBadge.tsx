type Character = {
  id: number;
  name: string;
  icon: string;
  element: string;
  cons: number;
  hasSig: boolean;
  weaponName?: string;
  weaponIcon?: string;
  weaponRarity?: number;
  refinement?: number; // 1-5 (R1-R5)
  artifactSetName?: string;
  artifactSetIcon?: string;
};

export default function CharacterBadge({
  name,
  icon,
  element,
  cons,
  hasSig,
  weaponName,
  weaponIcon,
  weaponRarity,
  refinement,
  artifactSetName,
  artifactSetIcon,
}: Character) {
  return (
    <div className="flex items-center gap-3 bg-base-200 rounded-lg p-2">
      <img
        src={icon}
        alt={name}
        className="w-12 h-12 rounded-md object-cover"
      />

      <div className="text-sm flex-1">
        <p className="font-semibold">{name}</p>
        <p className="opacity-70">
          {element} • C{cons}
        </p>
        {hasSig && (
          <span className="badge badge-primary badge-sm mt-1">Signature</span>
        )}
      </div>

      {/* Weapon */}
      {weaponName && (
        <div className="flex items-center gap-2" title={weaponName}>
          {weaponIcon && (
            <img
              src={weaponIcon}
              alt={weaponName}
              className="w-9 h-9 rounded-md object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div className="text-xs leading-tight">
            <p className="font-medium">
              {weaponName}
              {typeof refinement === "number" && (
                <span className="opacity-60"> R{refinement}</span>
              )}
            </p>
            {typeof weaponRarity === "number" && (
              <p className="opacity-60">{"★".repeat(weaponRarity)}</p>
            )}
          </div>
        </div>
      )}

      {/* Artifact Set */}
      {artifactSetName && (
        <div className="flex items-center gap-2" title={artifactSetName}>
          {artifactSetIcon && (
            <img
              src={artifactSetIcon}
              alt={artifactSetName}
              className="w-9 h-9 rounded-md object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <p className="text-xs font-medium leading-tight max-w-[6rem]">
            {artifactSetName}
          </p>
        </div>
      )}
    </div>
  );
}
