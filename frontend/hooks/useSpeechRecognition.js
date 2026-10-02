import { useCallback, useEffect, useRef, useState } from "react";

function useSpeechRecognition({
  onResult,
  onError,
  onStart,
  onEnd,
} = {}) {
  const recognitionRef = useRef(null);
  const runningRef = useRef(false);
  const startingRef = useRef(false);

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      runningRef.current = true;
      startingRef.current = false;
      setIsListening(true);
      setError("");

      onStart?.();
    };

    recognition.onresult = (event) => {
      const result =
        event.results?.[0]?.[0]?.transcript?.trim() || "";

      if (!result) return;

      setTranscript(result);
      onResult?.(result);
    };

    recognition.onerror = (event) => {
      startingRef.current = false;
      runningRef.current = false;
      setIsListening(false);

      const errorMessage =
        event.error === "not-allowed"
          ? "Microphone permission was denied."
          : event.error === "no-speech"
          ? "No speech was detected."
          : event.error === "audio-capture"
          ? "Microphone could not be accessed."
          : event.error || "Speech recognition failed.";

      setError(errorMessage);
      onError?.(errorMessage, event.error);
    };

    recognition.onend = () => {
      runningRef.current = false;
      startingRef.current = false;
      setIsListening(false);

      onEnd?.();
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }

      recognitionRef.current = null;
      runningRef.current = false;
      startingRef.current = false;
    };
  }, [onResult, onError, onStart, onEnd]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition || !isSupported) {
      setError(
        "Speech recognition is not supported in this browser."
      );
      return false;
    }

    if (
      runningRef.current ||
      startingRef.current
    ) {
      return false;
    }

    try {
      setTranscript("");
      setError("");

      startingRef.current = true;
      recognition.start();

      return true;
    } catch (error) {
      startingRef.current = false;

      if (
        error?.name !== "InvalidStateError"
      ) {
        setError(
          error?.message ||
            "Unable to start microphone."
        );
      }

      return false;
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) return;

    if (
      !runningRef.current &&
      !startingRef.current
    ) {
      return;
    }

    try {
      recognition.stop();
    } catch {
      runningRef.current = false;
      startingRef.current = false;
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError("");
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export default useSpeechRecognition;