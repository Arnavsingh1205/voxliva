function FeedbackCard({
  feedback = null,
}) {
  if (!feedback) {
    return null;
  }

  const grammarScore = Number(feedback.grammarScore ?? 0);
  const fluencyScore = Number(feedback.fluencyScore ?? 0);
  const vocabularyScore = Number(
    feedback.vocabularyScore ?? 0
  );

  return (
    <div className="feedback-card">
      <div className="feedback-header">
        <h3>AI Feedback</h3>

        {feedback.isCorrect && (
          <span className="correct-badge">
            ✓ Correct
          </span>
        )}
      </div>

      <div className="feedback-scores">
        <div className="feedback-score">
          <span>Grammar</span>
          <strong>{grammarScore}/100</strong>
        </div>

        <div className="feedback-score">
          <span>Fluency</span>
          <strong>{fluencyScore}/100</strong>
        </div>

        <div className="feedback-score">
          <span>Vocabulary</span>
          <strong>{vocabularyScore}/100</strong>
        </div>
      </div>

      {feedback.correctedSentence && (
        <div className="correction-box">
          <span className="feedback-label">
            Better Sentence
          </span>

          <p>{feedback.correctedSentence}</p>
        </div>
      )}

      {feedback.grammarFeedback && (
        <div className="feedback-section">
          <strong>Grammar</strong>
          <p>{feedback.grammarFeedback}</p>
        </div>
      )}

      {feedback.fluencyFeedback && (
        <div className="feedback-section">
          <strong>Fluency</strong>
          <p>{feedback.fluencyFeedback}</p>
        </div>
      )}

      {feedback.vocabularyFeedback && (
        <div className="feedback-section">
          <strong>Vocabulary</strong>
          <p>{feedback.vocabularyFeedback}</p>
        </div>
      )}

      {feedback.practiceSentence && (
        <div className="practice-box">
          <span className="feedback-label">
            Practice This
          </span>

          <p>{feedback.practiceSentence}</p>

          {feedback.practiceTip && (
            <small>{feedback.practiceTip}</small>
          )}
        </div>
      )}

      {Array.isArray(feedback.mistakes) &&
        feedback.mistakes.length > 0 && (
          <div className="mistakes-box">
            <span className="feedback-label">
              Mistakes
            </span>

            {feedback.mistakes.map((mistake, index) => (
              <div
                className="mistake-item"
                key={index}
              >
                {typeof mistake === "string"
                  ? mistake
                  : mistake?.message ||
                    mistake?.explanation ||
                    JSON.stringify(mistake)}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default FeedbackCard;