import { useCallback, useEffect, useRef } from "react";
import {
  sendConversationMessage,
  startChat,
} from "../services/chatApi";
import analyzeAnswer from "../services/analyzeApi";
import useSpeechRecognition from "./useSpeechRecognition";
import useSpeechSynthesis from "./useSpeechSynthesis";

function useConversation({
  selectedCharacter = null,
  userName = "",
  question = "",
  messages = [],
  setMessages,
  setQuestionHistory,
  setCurrentQuestionIndex,
  setIsListening,
  setIsThinking,
  setIsSpeaking,
  setFeedback,
  setSelectedOption,
  setStarted,
} = {}) {
  const mountedRef = useRef(true);
  const historyRef = useRef(messages);

  useEffect(() => {
    historyRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addMessage = useCallback(
    (message) => {
      if (!setMessages) return;

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${Math.random()}`,
          ...message,
        },
      ]);
    },
    [setMessages]
  );

  const speakText = useCallback(
    (text) => {
      if (!text) return;

      speak(text);
    },
    []
  );

  const handleSpeechResult = useCallback(
    async (text) => {
      if (!text?.trim() || !selectedCharacter) {
        return;
      }

      setIsListening?.(false);
      setIsThinking?.(true);
      setFeedback?.(null);
      setSelectedOption?.(null);

      addMessage({
        sender: "user",
        role: "user",
        text: text.trim(),
      });

      try {
        const analysis = await analyzeAnswer({
          character: selectedCharacter.name,
          mode: selectedCharacter.mode,
          question,
          answer: text.trim(),
          userName,
        });

        if (mountedRef.current) {
          setFeedback?.(analysis);
        }
      } catch (error) {
        console.error(
          "Answer analysis failed:",
          error
        );
      }

      try {
        const data =
          await sendConversationMessage({
            character: selectedCharacter.name,
            mode: selectedCharacter.mode,
            message: text.trim(),
            userName,
            history: historyRef.current,
          });

        if (!mountedRef.current) return;

        if (data?.reply) {
          addMessage({
            sender: "ai",
            role: "assistant",
            text: data.reply,
          });

          setIsSpeaking?.(true);

          speak(data.reply);
        }

        if (data?.question) {
          setQuestionHistory?.((previous) => [
            ...previous,
            {
              question: data.question,
              options: data.options || [],
            },
          ]);

          setCurrentQuestionIndex?.(
            (previous) => previous + 1
          );
        }
      } catch (error) {
        console.error(
          "Conversation request failed:",
          error
        );
      } finally {
        if (mountedRef.current) {
          setIsThinking?.(false);
        }
      }
    },
    [
      selectedCharacter,
      question,
      userName,
      addMessage,
      setIsListening,
      setIsThinking,
      setFeedback,
      setSelectedOption,
      setQuestionHistory,
      setCurrentQuestionIndex,
      setIsSpeaking,
    ]
  );

  const {
    isSupported: speechRecognitionSupported,
    isListening: recognitionListening,
    transcript,
    error: recognitionError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,

    onStart: () => {
      setIsListening?.(true);
    },

    onEnd: () => {
      setIsListening?.(false);
    },

    onError: (error) => {
      console.error(
        "Speech recognition error:",
        error
      );

      setIsListening?.(false);
    },
  });

  const {
    isSupported: speechSynthesisSupported,
    isSpeaking: synthesisSpeaking,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
  } = useSpeechSynthesis({
    onStart: () => {
      setIsSpeaking?.(true);
    },

    onEnd: () => {
      setIsSpeaking?.(false);
    },

    onError: (error) => {
      console.error(
        "Speech synthesis error:",
        error
      );

      setIsSpeaking?.(false);
    },
  });

  useEffect(() => {
    if (recognitionListening !== undefined) {
      setIsListening?.(recognitionListening);
    }
  }, [
    recognitionListening,
    setIsListening,
  ]);

  useEffect(() => {
    if (synthesisSpeaking !== undefined) {
      setIsSpeaking?.(synthesisSpeaking);
    }
  }, [
    synthesisSpeaking,
    setIsSpeaking,
  ]);

  const beginConversation = useCallback(
    async () => {
      if (!selectedCharacter) return null;

      setIsThinking?.(true);
      setFeedback?.(null);
      setSelectedOption?.(null);

      try {
        const data = await startChat({
          character: selectedCharacter.name,
          mode: selectedCharacter.mode,
          userName,
        });

        if (!mountedRef.current) {
          return null;
        }

        setStarted?.(true);

        if (data?.reply) {
          addMessage({
            sender: "ai",
            role: "assistant",
            text: data.reply,
          });

          speak(data.reply);
        }

        if (data?.question) {
          setQuestionHistory?.([
            {
              question: data.question,
              options: data.options || [],
            },
          ]);

          setCurrentQuestionIndex?.(0);
        }

        return data;
      } catch (error) {
        console.error(
          "Failed to start conversation:",
          error
        );

        return null;
      } finally {
        if (mountedRef.current) {
          setIsThinking?.(false);
        }
      }
    },
    [
      selectedCharacter,
      userName,
      addMessage,
      setStarted,
      setQuestionHistory,
      setCurrentQuestionIndex,
      setIsThinking,
      setFeedback,
      setSelectedOption,
    ]
  );

  const submitTextAnswer = useCallback(
    async (text) => {
      if (!text?.trim()) return;

      await handleSpeechResult(text.trim());
    },
    [handleSpeechResult]
  );

  const handleMic = useCallback(() => {
    if (recognitionListening) {
      stopListening();
      return;
    }

    resetTranscript();
    startListening();
  }, [
    recognitionListening,
    startListening,
    stopListening,
    resetTranscript,
  ]);

  return {
    transcript,
    recognitionError,
    speechRecognitionSupported,
    speechSynthesisSupported,

    isListening: recognitionListening,
    isSpeaking: synthesisSpeaking,

    startListening,
    stopListening,
    handleMic,

    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,

    beginConversation,
    submitTextAnswer,
  };
}

export default useConversation;