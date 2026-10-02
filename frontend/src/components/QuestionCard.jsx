function QuestionCard({
  question = "",
  isThinking = false,
}) {
  return (
    <div className="question-card">
      <div className="question-label">
        AI Question
      </div>

      <div className="question-text">
        {isThinking
          ? "Loading question..."
          : question || "Let's start the conversation..."}
      </div>
    </div>
  );
}

export default QuestionCard;