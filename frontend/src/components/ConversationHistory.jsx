function ConversationHistory({
  messages = [],
}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return (
      <div className="conversation-history">
        <div className="history-header">
          <h3>Conversation History</h3>
        </div>

        <p className="history-empty">
          Your conversation will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="conversation-history">
      <div className="history-header">
        <h3>Conversation History</h3>
      </div>

      <div className="history-list">
        {messages.map((message, index) => {
          const isUser =
            message?.sender === "user" ||
            message?.role === "user";

          const text =
            message?.text ||
            message?.content ||
            message?.message ||
            "";

          return (
            <div
              key={message?.id || index}
              className={`history-message ${
                isUser
                  ? "history-user"
                  : "history-ai"
              }`}
            >
              <div className="history-avatar">
                {isUser ? "👤" : "🤖"}
              </div>

              <div className="history-content">
                <span className="history-sender">
                  {isUser ? "You" : "AI"}
                </span>

                <p>{text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConversationHistory;