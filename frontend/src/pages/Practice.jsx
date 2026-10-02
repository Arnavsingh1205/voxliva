import Navbar from "../components/Navbar";

function Practice({
  onStartPractice,
  onProfileClick,
}) {
  const practiceModes = [
    {
      id: "conversation",
      icon: "🎙️",
      title: "AI Conversation",
      description:
        "Have a natural English conversation with an AI partner.",
    },
    {
      id: "grammar",
      icon: "✨",
      title: "Grammar Practice",
      description:
        "Practice English grammar and understand your mistakes.",
    },
    {
      id: "vocabulary",
      icon: "📚",
      title: "Vocabulary",
      description:
        "Build useful vocabulary for everyday conversations.",
    },
    {
      id: "pronunciation",
      icon: "🔊",
      title: "Pronunciation",
      description:
        "Practice speaking clearly and improve your pronunciation.",
    },
  ];

  return (
    <>
      <Navbar onProfileClick={onProfileClick} />

      <main className="practice-page">
        <section className="practice-section">
          <div className="section-heading">
            <span className="section-label">
              Practice Studio
            </span>

            <h1>
              Practice English.
              <br />
              <span>Your way.</span>
            </h1>

            <p>
              Choose a practice mode and improve
              your English through real conversations
              and guided learning.
            </p>
          </div>

          <div className="practice-grid">
            {practiceModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className="practice-card"
                onClick={() =>
                  onStartPractice?.(mode.id)
                }
              >
                <div className="practice-icon">
                  {mode.icon}
                </div>

                <h3>{mode.title}</h3>

                <p>{mode.description}</p>

                <span className="practice-card-arrow">
                  Start →
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default Practice;