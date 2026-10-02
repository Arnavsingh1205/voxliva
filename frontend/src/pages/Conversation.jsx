import Navbar from "../components/Navbar";
import VoiceWave from "../components/VoiceWave";
import MicButton from "../components/MicButton";
import QuestionCard from "../components/QuestionCard";
import AnswerOptions from "../components/AnswerOptions";
import FeedbackCard from "../components/FeedbackCard";
import ConversationHistory from "../components/ConversationHistory";

function Conversation({
  selectedCharacter = null,
  question = "",
  options = [],
  messages = [],
  feedback = null,
  isListening = false,
  isThinking = false,
  isSpeaking = false,
  selectedOption = null,
  onMicClick,
  onOptionSelect,
  onBack,
}) {
  if (!selectedCharacter) {
    return null;
  }

  return (
    <div className="conversation-page">
      <Navbar
        conversation
        onBack={onBack}
      />

      <main className="conversation-container">
        <section className="conversation-main">
          <div className="conversation-header">
            <div className="ai-character">
              <div className="ai-avatar">
                {selectedCharacter.emoji}
              </div>

              <div>
                <h2>{selectedCharacter.name}</h2>

                <span>
                  {selectedCharacter.mode}
                </span>
              </div>
            </div>

            <div className="ai-status">
              <span className="status-dot"></span>
              AI Live Coach
            </div>
          </div>

          <div className="voice-area">
            <div className="speaking-avatar">
              {selectedCharacter.emoji}
            </div>

            <VoiceWave
              isSpeaking={isSpeaking}
              isListening={isListening}
            />
          </div>

          <QuestionCard
            question={question}
            isThinking={isThinking}
          />

          <AnswerOptions
            options={options}
            selectedOption={selectedOption}
            onSelect={onOptionSelect}
            disabled={
              isThinking ||
              isSpeaking ||
              isListening
            }
          />

          <div className="conversation-mic">
            <MicButton
              isListening={isListening}
              isThinking={isThinking}
              isSpeaking={isSpeaking}
              onClick={onMicClick}
            />
          </div>

          <FeedbackCard feedback={feedback} />
        </section>

        <aside className="conversation-sidebar">
          <ConversationHistory
            messages={messages}
          />
        </aside>
      </main>
    </div>
  );
}

export default Conversation;