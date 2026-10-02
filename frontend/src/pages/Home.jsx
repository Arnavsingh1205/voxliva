import Navbar from "../components/Navbar";
import CharacterGrid from "../components/CharacterGrid";

function Home({
  characters = [],
  selectedCharacter = null,
  onSelectCharacter,
  onProfileClick,
}) {
  return (
    <>
      <Navbar onProfileClick={onProfileClick} />

      <main>
        {/* Hero Section */}
        <section id="home" className="hero-section">
          <div className="hero-content">
            <span className="hero-badge">
              AI English Conversation Partner
            </span>

            <h1>
              Speak English.
              <br />
              <span>Build Confidence.</span>
            </h1>

            <p>
              Practice real conversations with AI
              characters, improve your English and
              speak with confidence.
            </p>

            <a
              href="#characters"
              className="hero-btn"
            >
              Start Practicing
            </a>
          </div>
        </section>

        {/* Characters Section */}
        <section
          id="characters"
          className="characters-section"
        >
          <div className="section-heading">
            <span className="section-label">
              Choose your partner
            </span>

            <h2>
              Who do you want to
              <br />
              <span>talk with?</span>
            </h2>

            <p>
              Choose a conversation partner based
              on the situation you want to practice.
            </p>
          </div>

          <CharacterGrid
            characters={characters}
            selectedCharacter={selectedCharacter}
            onSelect={onSelectCharacter}
          />
        </section>

        {/* Practice Section */}
        <section
          id="practice"
          className="practice-section"
        >
          <div className="section-heading">
            <span className="section-label">
              Practice
            </span>

            <h2>
              Improve your English
              <br />
              <span>every day.</span>
            </h2>

            <p>
              Practice speaking, grammar,
              vocabulary and real-life conversations.
            </p>
          </div>

          <div className="practice-grid">
            <div className="practice-card">
              <div className="practice-icon">
                🎙️
              </div>

              <h3>Speaking Practice</h3>

              <p>
                Have natural conversations with
                your AI speaking partner.
              </p>
            </div>

            <div className="practice-card">
              <div className="practice-icon">
                ✨
              </div>

              <h3>Grammar Correction</h3>

              <p>
                Understand your mistakes and learn
                how to say things correctly.
              </p>
            </div>

            <div className="practice-card">
              <div className="practice-icon">
                📈
              </div>

              <h3>Track Your Progress</h3>

              <p>
                Improve your grammar, fluency and
                vocabulary over time.
              </p>
            </div>
          </div>
        </section>

        {/* Learn Section */}
        <section
          id="learn"
          className="learn-section"
        >
          <div className="section-heading">
            <span className="section-label">
              Learning Studio
            </span>

            <h2>
              Learn English
              <br />
              <span>the practical way.</span>
            </h2>

            <p>
              Learn grammar and convert Hindi or
              Hinglish sentences into natural English.
            </p>
          </div>

          <div className="learn-grid">
            <div className="learn-card">
              <div className="learn-icon">
                📚
              </div>

              <h3>English Grammar Teacher</h3>

              <p>
                Ask questions and learn grammar with
                simple explanations and examples.
              </p>
            </div>

            <div className="learn-card">
              <div className="learn-icon">
                🇮🇳
              </div>

              <h3>Hindi → Natural English</h3>

              <p>
                Write in Hindi or Hinglish and learn
                how to express it naturally in English.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;