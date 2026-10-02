import CharacterCard from "./CharacterCard";

function CharacterGrid({
  characters = [],
  selectedCharacter = null,
  onSelect,
}) {
  return (
    <div className="characters-grid">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          selected={selectedCharacter?.id === character.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default CharacterGrid;