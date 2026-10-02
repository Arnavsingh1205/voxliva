function ChatMessage({
  message,
}) {
  if (!message) return null;

  const isUser =
    message.sender === "user" ||
    message.role === "user";

  return (
    <div
      className={`chat-message ${
        isUser ? "user-message" : "ai-message"
      }`}
    >
      <div className="message-avatar">
        {isUser ? "👤" : "🤖"}
      </div>

      <div className="message-content">
        <div className="message-text">
          {message.text || message.content || message.message}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;