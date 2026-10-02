import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const ConversationContext = createContext(null);

function ConversationProvider({ children }) {
  const [selectedCharacter, setSelectedCharacter] =
    useState(null);

  const [started, setStarted] = useState(false);

  const [messages, setMessages] = useState([]);

  const [questionHistory, setQuestionHistory] =
    useState([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(-1);

  const [isListening, setIsListening] =
    useState(false);

  const [isThinking, setIsThinking] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [feedback, setFeedback] = useState(null);

  const [selectedOption, setSelectedOption] =
    useState(null);

  const resetConversation = () => {
    setStarted(false);
    setMessages([]);
    setQuestionHistory([]);
    setCurrentQuestionIndex(-1);
    setIsListening(false);
    setIsThinking(false);
    setIsSpeaking(false);
    setIsPaused(false);
    setFeedback(null);
    setSelectedOption(null);
  };

  const startConversation = (character) => {
    setSelectedCharacter(character);
    resetConversation();
    setStarted(true);
  };

  const endConversation = () => {
    resetConversation();
    setSelectedCharacter(null);
  };

  const value = useMemo(
    () => ({
      selectedCharacter,
      setSelectedCharacter,

      started,
      setStarted,

      messages,
      setMessages,

      questionHistory,
      setQuestionHistory,

      currentQuestionIndex,
      setCurrentQuestionIndex,

      isListening,
      setIsListening,

      isThinking,
      setIsThinking,

      isSpeaking,
      setIsSpeaking,

      isPaused,
      setIsPaused,

      feedback,
      setFeedback,

      selectedOption,
      setSelectedOption,

      startConversation,
      endConversation,
      resetConversation,
    }),
    [
      selectedCharacter,
      started,
      messages,
      questionHistory,
      currentQuestionIndex,
      isListening,
      isThinking,
      isSpeaking,
      isPaused,
      feedback,
      selectedOption,
    ]
  );

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

function useConversation() {
  const context = useContext(
    ConversationContext
  );

  if (!context) {
    throw new Error(
      "useConversation must be used inside ConversationProvider"
    );
  }

  return context;
}

export {
  ConversationProvider,
  useConversation,
};

export default ConversationContext;