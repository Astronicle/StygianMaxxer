export default function CreateCharacterRow({
  character,
  data,
  onRemove,
  onUpdate,
}: any) {
  return (
    <div className="flex items-center gap-3">
      <img src={character.icon} className="w-10 h-10 rounded-md" />

      <span className="font-medium">{character.name}</span>

      <input
        type="number"
        min={1}
        max={6}
        value={data.constellation}
        onChange={(e) =>
          onUpdate({
            constellation: Number(e.target.value),
          })
        }
        className="input input-bordered input-sm w-20"
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={data.hasSig}
          onChange={(e) => onUpdate({ hasSig: e.target.checked })}
        />
        Sig
      </label>

      <button className="btn btn-xs btn-error ml-auto" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}
