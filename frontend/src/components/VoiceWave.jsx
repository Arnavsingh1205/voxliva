function VoiceWave({
  isSpeaking = false,
  isListening = false,
}) {
  const active = isSpeaking || isListening;

  return (
    <div
      className={`voice-wave ${active ? "active" : ""}`}
      aria-label={
        isSpeaking
          ? "AI is speaking"
          : isListening
          ? "Listening"
          : "Voice inactive"
      }
    >
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

export default VoiceWave;