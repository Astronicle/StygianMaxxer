import { useState } from "react";
import CreateCharacterRow from "./CreateCharacterRow";

export default function CreateBossCard({ boss, characters, onChange }: any) {
  const [selected, setSelected] = useState<any[]>([]);

  function addCharacter(char: any) {
    if (selected.length >= 4) return;

    const exists = selected.find((c) => c.characterID === char.id);
    if (exists) return;

    const updated = [
      ...selected,
      {
        characterID: char.id,
        constellation: 1,
        hasSig: false,
      },
    ];

    setSelected(updated);
    onChange(updated);
  }

  function removeCharacter(characterID: number) {
    const updated = selected.filter((c) => c.characterID !== characterID);
    setSelected(updated);
    onChange(updated);
  }

  function updateCharacter(id: number, data: any) {
    const updated = selected.map((c) =>
      c.characterID === id ? { ...c, ...data } : c,
    );
    setSelected(updated);
    onChange(updated);
  }

  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body gap-4">
        {/* Boss header */}
        <div className="flex items-center gap-3">
          <img src={boss.icon} className="w-10 h-10" />
          <h3 className="text-lg font-semibold">{boss.name}</h3>
        </div>

        {/* Character picker */}
        <select
          className="select select-bordered w-full max-w-xs"
          value=""
          onChange={(e) => {
            const char = characters.find(
              (c: any) => c.id === Number(e.target.value),
            );
            if (char) addCharacter(char);
          }}
        >
          <option disabled value="">
            Add character
          </option>

          {characters.map((char: any) => (
            <option
              key={char.id}
              value={char.id}
              disabled={selected.some((s) => s.characterID === char.id)}
            >
              {char.name}
            </option>
          ))}
        </select>

        {/* Selected characters */}
        <div className="grid gap-3">
          {selected.map((sel) => {
            const char = characters.find((c: any) => c.id === sel.characterID);
            if (!char) return null;

            return (
              <CreateCharacterRow
                key={char.id}
                character={char}
                data={sel}
                onRemove={() => removeCharacter(char.id)}
                onUpdate={(data: any) => updateCharacter(char.id, data)}
              />
            );
          })}
        </div>

        <p className="text-xs opacity-60">Select up to 4 characters</p>
      </div>
    </div>
  );
}
