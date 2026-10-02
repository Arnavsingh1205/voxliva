import { useCallback, useEffect, useRef, useState } from "react";

function useSpeechSynthesis({
  onStart,
  onEnd,
  onError,
} = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const supported =
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window;

    setIsSupported(supported);

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      utteranceRef.current = null;
    };
  }, []);

  const speak = useCallback(
    (
      text,
      {
        rate = 0.95,
        pitch = 1,
        volume = 1,
        voiceName = "",
      } = {}
    ) => {
      if (!isSupported || !text?.trim()) {
        return false;
      }

      window.speechSynthesis.cancel();

      cancelledRef.current = false;

      const utterance =
        new SpeechSynthesisUtterance(
          text.trim()
        );

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (voiceName) {
        const voices =
          window.speechSynthesis.getVoices();

        const selectedVoice = voices.find(
          (voice) =>
            voice.name === voiceName
        );

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onstart = () => {
        if (cancelledRef.current) return;

        setIsSpeaking(true);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);

        if (!cancelledRef.current) {
          onEnd?.();
        }
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);

        if (!cancelledRef.current) {
          onError?.(event);
        }
      };

      utteranceRef.current = utterance;

      window.speechSynthesis.speak(
        utterance
      );

      return true;
    },
    [
      isSupported,
      onStart,
      onEnd,
      onError,
    ]
  );

  const stopSpeaking = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    cancelledRef.current = true;

    window.speechSynthesis.cancel();

    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (
      !("speechSynthesis" in window) ||
      !window.speechSynthesis.speaking
    ) {
      return;
    }

    window.speechSynthesis.pause();
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (
      !("speechSynthesis" in window) ||
      !window.speechSynthesis.paused
    ) {
      return;
    }

    window.speechSynthesis.resume();
  }, []);

  return {
    isSupported,
    isSpeaking,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
  };
}

export default useSpeechSynthesis;