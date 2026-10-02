function CharacterCard({
  character,
  selected = false,
  onSelect,
}) {
  if (!character) return null;

  return (
    <button
      type="button"
      className={`character-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect?.(character)}
      aria-pressed={selected}
    >
      {/* Character Image */}
      <div className="character-image">
        {character.emoji}
      </div>

      {/* Character Information */}
      <div className="character-info">
        <div className="character-name">
          <h3>{character.name}</h3>

          <span
            className="voice-icon"
            aria-label={`${character.name} voice`}
            title="Voice available"
          >
            🔊
          </span>
        </div>

        <span className="gender">
          {character.gender}
        </span>

        <div className="mode-tag">
          {character.mode}
        </div>

        <p>
          {character.description}
        </p>
      </div>
    </button>
  );
}

export default CharacterCard;