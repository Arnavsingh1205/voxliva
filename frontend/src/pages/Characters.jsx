import Navbar from "../components/Navbar";
import CharacterGrid from "../components/CharacterGrid";

function Characters({
  characters = [],
  selectedCharacter = null,
  onSelectCharacter,
  onProfileClick,
}) {
  return (
    <>
      <Navbar onProfileClick={onProfileClick} />

      <main className="characters-page">
        <section
          id="characters"
          className="characters-section"
        >
          <div className="section-heading">
            <span className="section-label">
              Choose your partner
            </span>

            <h1>
              Choose your
              <br />
              <span>AI Conversation Partner</span>
            </h1>

            <p>
              Practice English with different AI
              characters designed for real-life
              conversations.
            </p>
          </div>

          <CharacterGrid
            characters={characters}
            selectedCharacter={selectedCharacter}
            onSelect={onSelectCharacter}
          />
        </section>
      </main>
    </>
  );
}

export default Characters;