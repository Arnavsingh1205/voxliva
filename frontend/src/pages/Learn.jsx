import Navbar from "../components/Navbar";

function Learn({
  onOpenGrammar,
  onOpenHindiToEnglish,
  onProfileClick,
}) {
  const lessons = [
    {
      id: "grammar",
      icon: "📚",
      title: "English Grammar Teacher",
      description:
        "Learn English grammar with simple explanations, examples and practice.",
      button: "Learn Grammar",
      onClick: onOpenGrammar,
    },
    {
      id: "hindi-to-english",
      icon: "🇮🇳",
      title: "Hindi → Natural English",
      description:
        "Write a Hindi or Hinglish sentence and learn how to say it naturally in English.",
      button: "Start Learning",
      onClick: onOpenHindiToEnglish,
    },
  ];

  return (
    <>
      <Navbar onProfileClick={onProfileClick} />

      <main className="learn-page">
        <section className="learn-section">
          <div className="section-heading">
            <span className="section-label">
              Learning Studio
            </span>

            <h1>
              Learn English
              <br />
              <span>the practical way.</span>
            </h1>

            <p>
              Improve your grammar and learn to
              express Hindi or Hinglish thoughts
              naturally in English.
            </p>
          </div>

          <div className="learn-grid">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="learn-card"
              >
                <div className="learn-icon">
                  {lesson.icon}
                </div>

                <h3>{lesson.title}</h3>

                <p>{lesson.description}</p>

                <button
                  type="button"
                  className="learn-card-button"
                  onClick={lesson.onClick}
                >
                  {lesson.button} →
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default Learn;