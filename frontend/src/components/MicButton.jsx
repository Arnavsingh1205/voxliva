function MicButton({
  isListening = false,
  isThinking = false,
  isSpeaking = false,
  onClick,
  disabled = false,
}) {
  const isDisabled =
    disabled || isThinking || isSpeaking;

  return (
    <button
      type="button"
      className={`mic-button ${isListening ? "listening" : ""}`}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={
        isListening
          ? "Stop listening"
          : "Start speaking"
      }
      aria-pressed={isListening}
    >
      <span className="mic-icon">
        {isListening ? "⏹" : "🎙️"}
      </span>

      <span className="mic-label">
        {isListening
          ? "Listening..."
          : isThinking
          ? "Thinking..."
          : isSpeaking
          ? "Speaking..."
          : "Tap to Speak"}
      </span>
    </button>
  );
}

export default MicButton;