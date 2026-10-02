import { useEffect, useRef, useState } from "react";
import "./App.css";

const characters = [
  { id: 1, name: "Maya", gender: "Female", mode: "Daily Conversation", emoji: "👩🏻", description: "Friendly, patient and easy to talk to." },
  { id: 2, name: "Ryan", gender: "Male", mode: "Interview", emoji: "👨🏻", description: "Confident and professional conversation partner." },
  { id: 3, name: "Sophia", gender: "Female", mode: "College", emoji: "👩🏻‍🎓", description: "Casual college conversation partner." },
  { id: 4, name: "Daniel", gender: "Male", mode: "Office", emoji: "👨🏻‍💼", description: "Professional workplace English practice." },
  { id: 5, name: "Emma", gender: "Female", mode: "Friends", emoji: "👩🏻", description: "Fun and casual friend-style conversations." },
  { id: 6, name: "Alex", gender: "Male", mode: "Unknown Person", emoji: "👨🏻", description: "Natural real-life conversations with strangers." },
];

const API = "http://127.0.0.1:5001";

// Prevent the AI reply from repeating the question that is shown separately.
// Remove the character's one-time introduction from later turns.
// The first question keeps the full introduction; every later reply stays conversational.
const removeRepeatedIntroduction = (reply, characterName, isFirstTurn) => {
  let text = String(reply || "").trim();
  if (isFirstTurn || !text) return text;

  const name = String(characterName || "").trim();
  if (!name) return text;

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Remove only the familiar introduction from later turns.
  // Everything after the introduction is preserved.
  const intro = new RegExp(
    String.raw`^\s*(?:🎙️|🔊|🗣️)?\s*Hi\s+[^,!.?]+[,!]?\s+I(?:'|’)m\s+${escapedName}[,!]?\s+your\s+(?:friendly|helpful|professional)\s+English\s+practice\s+partner\.?\s*`,
    "i"
  );

  const cleaned = text.replace(intro, "").trim();
  return cleaned || text;
};

const cleanAIReply = (reply, question) => {
  let text = String(reply || "").trim();
  const q = String(question || "").trim();
  if (!text || !q) return text;

  const escapeRegExp = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Remove an exact question appearing at the end of the AI reply.
  text = text.replace(
    new RegExp(`\\s*${escapeRegExp(q)}\\s*$`, "i"),
    ""
  );

  // Also remove a repeated question followed by normal punctuation/spacing.
  text = text.replace(
    new RegExp(`\\s*${escapeRegExp(q.replace(/[?!.]+$/, ""))}[?!.]*\\s*$`, "i"),
    ""
  );

  return text.trim();
};

const conversationLayoutStyles = `
.conversation-page{height:100vh;min-height:0;overflow:hidden;background:#f5f4fb}
.conversation-page .navbar{height:72px;min-height:72px;box-sizing:border-box}
.conversation-page .conversation-container{height:calc(100vh - 72px);max-height:calc(100vh - 72px);box-sizing:border-box;padding:18px 28px;gap:18px;overflow:hidden;align-items:stretch}
.conversation-page .character-video{height:100%;min-height:0;box-sizing:border-box;padding:18px 22px;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
.conversation-page .character-top{width:100%;margin-bottom:4px}
.conversation-page .character-large{width:150px;height:150px;min-height:150px;display:grid;place-items:center;position:relative;margin:4px auto 0;font-size:118px;line-height:1;transform-origin:center bottom}
.conversation-page .avatar-face{display:block;line-height:1}
.conversation-page .avatar-mouth{position:absolute;left:50%;bottom:30px;width:22px;height:7px;border-radius:50%;transform:translateX(-50%) scaleY(.45);background:#6f3028;opacity:0;pointer-events:none}
.conversation-page .avatar-mouth.moving{opacity:.85;animation:voxlivaMouth .14s ease-in-out infinite alternate}
@keyframes voxlivaMouth{from{transform:translateX(-50%) scaleY(.35)}to{transform:translateX(-50%) scaleY(1.25)}}
.conversation-page .character-video h1{margin:2px 0 0;font-size:30px}
.conversation-page .character-video>p{margin:2px 0 10px;font-size:14px}
.conversation-page .ai-caption{width:min(94%,720px);max-height:64px;overflow:hidden;box-sizing:border-box;padding:12px 16px;margin:4px 0 5px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.35;font-size:15px}
.conversation-page .voice-wave{height:30px;margin:4px auto}
.conversation-page .mic-button{width:66px;height:66px;min-height:66px;margin:3px auto 2px}
.conversation-page .mic-text{margin:4px 0 6px;font-size:13px}
.conversation-page .user-transcript{width:min(94%,700px);max-height:72px;overflow:hidden;box-sizing:border-box;padding:8px 12px;margin:4px 0;font-size:13px}
.conversation-page .user-transcript p{margin:3px 0 0}
.conversation-page .error-message{max-width:94%;margin:4px 0;padding:7px 10px;font-size:12px}
.conversation-page .pause-btn{margin-top:5px;padding:9px 15px}
.conversation-page .conversation-side{height:100%;min-height:0;box-sizing:border-box;overflow-y:auto;overflow-x:hidden;padding:0 4px 2px;scrollbar-width:thin}
.conversation-page .question-header{padding:13px 15px;margin-bottom:10px;min-height:82px}
.conversation-page .question-header h2{margin-top:5px;font-size:19px;line-height:1.25}
.conversation-page .answer-options-box{padding:13px;margin-bottom:10px}
.conversation-page .answer-options-box h3{margin-bottom:9px;font-size:15px}
.conversation-page .answer-options{gap:7px}
.conversation-page .answer-option{min-height:55px;padding:9px;gap:8px;border-radius:12px}
.conversation-page .answer-option span{min-width:24px;height:24px;font-size:12px}
.conversation-page .answer-option strong{font-size:13px;line-height:1.25}
.conversation-page .answer-options-box>p{margin:8px 0 0;font-size:11px;line-height:1.3}
.conversation-page .learning-feedback{padding:12px;margin-bottom:10px}
.conversation-page .learning-feedback h3{margin:0 0 8px;font-size:14px}
.conversation-page .score-grid{gap:6px;margin-bottom:8px}
.conversation-page .score-grid>div{padding:7px}
.conversation-page .score-grid span{font-size:10px}
.conversation-page .score-grid b{font-size:18px}
.conversation-page .correction-card{padding:9px;margin-bottom:8px}
.conversation-page .correction-card p{margin:4px 0 7px;font-size:13px}
.conversation-page .feedback-details{font-size:11px;line-height:1.35}
.conversation-page .feedback-details p{margin:4px 0}
.conversation-page .practice-actions{gap:6px;margin-top:7px}
.conversation-page .practice-actions button{padding:7px 9px;font-size:11px}
.conversation-page .question-navigation{position:sticky;bottom:0;z-index:5;display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;padding:7px 0;background:rgba(255,255,255,.96);backdrop-filter:blur(8px)}
.conversation-page .question-navigation button{padding:9px 8px;font-size:12px}
.conversation-page .conversation-history-mini{margin-top:6px}
.conversation-page .conversation-history-mini h3{margin:4px 0 6px;font-size:15px}
.conversation-page .messages-container{max-height:100px;overflow-y:auto}
.conversation-page .messages-container>div{padding:8px 10px;margin-bottom:6px;font-size:12px}
.conversation-page .messages-container p{margin:3px 0}
@media (min-width:1100px){.conversation-page .conversation-container{grid-template-columns:minmax(0,1.12fr) minmax(420px,.88fr)}}
@media (min-width:769px) and (max-height:820px){.conversation-page .conversation-container{padding:12px 20px}.conversation-page .character-large{width:125px;height:125px;min-height:125px;font-size:98px}.conversation-page .avatar-mouth{bottom:26px;width:19px;height:6px}.conversation-page .character-video h1{font-size:26px}.conversation-page .ai-caption{max-height:56px;font-size:13px}}
@media (max-width:768px){.conversation-page{height:auto;min-height:100vh;overflow:visible}.conversation-page .navbar{height:64px;min-height:64px}.conversation-page .conversation-container{height:auto;max-height:none;overflow:visible;padding:12px;grid-template-columns:1fr}.conversation-page .character-video,.conversation-page .conversation-side{height:auto;overflow:visible}.conversation-page .answer-options{grid-template-columns:1fr}.conversation-page .question-navigation{position:static}}
`;

function App() {
  // -----------------------------
  // AUTHENTICATION
  // -----------------------------
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem("voxlivaUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("voxlivaToken") || "");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });

  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [started, setStarted] = useState(false);

  const [messages, setMessages] = useState([]);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);

  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const [learningMode, setLearningMode] = useState(null);
  const [grammarTopic, setGrammarTopic] = useState("Present Simple");
  const [grammarAnswer, setGrammarAnswer] = useState("");
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [hindiText, setHindiText] = useState("");
  const [englishReply, setEnglishReply] = useState("");
  const [translateLoading, setTranslateLoading] = useState(false);
  const [hindiListening, setHindiListening] = useState(false);
  const hindiRecognitionRef = useRef(null);

  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const recognitionStartingRef = useRef(false);
  const sendMessageRef = useRef(null);
  const selectedCharacterRef = useRef(null);
  const autoListenRef = useRef(true);

  // Refs keep the latest React state available inside speech callbacks.
  // This prevents the microphone from getting stuck after question 1.
  const isThinkingRef = useRef(false);
  const isPausedRef = useRef(false);
  const isListeningRef = useRef(false);
  const startListeningRef = useRef(null);
  const nextQuestionRef = useRef(null);
  const previousQuestionRef = useRef(null);
  const skipQuestionRef = useRef(null);
  const autoListenTimerRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const startedRef = useRef(false);
  const recognitionSubmitTimerRef = useRef(null);
  const liveTranscriptRef = useRef("");

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthError("");
    setAuthForm({ name: "", email: "", password: "" });
    setAuthOpen(true);
  };

  const closeAuth = () => {
    if (!authLoading) setAuthOpen(false);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    const name = authForm.name.trim();
    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password;

    if (authMode === "signup" && name.length < 2) {
      setAuthError("Please enter your name.");
      return;
    }

    if (!email || !email.includes("@")) {
      setAuthError("Please enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const endpoint =
        authMode === "signup"
          ? "/api/auth/signup"
          : "/api/auth/login";

      const body =
        authMode === "signup"
          ? { name, email, password }
          : { email, password };

      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Authentication failed.");
      }

      const user = data.user || null;
      const token = data.token || "";

      if (!token || !user) {
        throw new Error("Authentication succeeded but user data was not returned.");
      }

      localStorage.setItem("voxlivaToken", token);
      localStorage.setItem("voxlivaUser", JSON.stringify(user));
      localStorage.setItem("voxlivaUserName", user.name || "");

      setAuthToken(token);
      setAuthUser(user);
      setAuthOpen(false);
      setAuthForm({ name: "", email: "", password: "" });
      setAuthError("");
    } catch (err) {
      setAuthError(err.message || "Unable to connect to Voxliva.");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    if (startedRef.current) {
      goBack();
    }
    localStorage.removeItem("voxlivaToken");
    localStorage.removeItem("voxlivaUser");
    localStorage.removeItem("voxlivaUserName");
    setAuthToken("");
    setAuthUser(null);
    setAuthOpen(false);
    setAuthError("");
  };

  const requireAuth = (action) => {
    if (authUser && authToken) {
      action?.();
      return true;
    }
    openAuth("login");
    return false;
  };

  const currentTurn =
    currentQuestionIndex >= 0
      ? questionHistory[currentQuestionIndex]
      : null;

  const currentQuestion = currentTurn?.question || "";
  const currentOptions = currentTurn?.options || [];
  const currentAttempt = currentTurn?.attempts || 0;

  useEffect(() => {
    selectedCharacterRef.current = selectedCharacter;
  }, [selectedCharacter]);

  // Keep refs synchronized with the latest state.
  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    startedRef.current = started;
  }, [started]);

  useEffect(() => {
    return () => {
      if (autoListenTimerRef.current) {
        clearTimeout(autoListenTimerRef.current);
      }
      if (recognitionSubmitTimerRef.current) {
        clearTimeout(recognitionSubmitTimerRef.current);
      }
    };
  }, []);

  // -----------------------------
  // SPEECH RECOGNITION
  // -----------------------------
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      recognitionStartingRef.current = false;
      recognitionRunningRef.current = true;
      liveTranscriptRef.current = "";
      isListeningRef.current = true;
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += part + " ";
        else interimText += part + " ";
      }

      const combined = `${liveTranscriptRef.current} ${finalText}`.trim();
      liveTranscriptRef.current = combined;
      setTranscript(`${combined}${interimText ? ` ${interimText.trim()}` : ""}`.trim());

      if (!finalText.trim()) return;

      // Give the learner a normal pause after the last spoken words before submitting.
      if (recognitionSubmitTimerRef.current) {
        clearTimeout(recognitionSubmitTimerRef.current);
      }

      recognitionSubmitTimerRef.current = setTimeout(() => {
        recognitionSubmitTimerRef.current = null;
        const spokenText = liveTranscriptRef.current.trim();
        if (!spokenText) return;

        liveTranscriptRef.current = "";
        recognitionStartingRef.current = false;

        // Stop the current Chrome recognition session before submitting.
        // This prevents the next question from calling start() while the
        // previous recognition instance is still running.
        try {
          recognition.stop();
        } catch {}

        recognitionRunningRef.current = false;
        isListeningRef.current = false;
        setIsListening(false);

        // Voice navigation commands. Exact/near-exact commands only so normal
        // English answers containing these words are not accidentally skipped.
        const command = spokenText.toLowerCase().replace(/[.!?,]/g, "").trim();
        if (/^(next|next question|go next|go to next|move to next|next one)$/.test(command)) {
          nextQuestionRef.current?.();
          return;
        }
        if (/^(previous|previous question|go previous|go to previous|back|go back|previous one)$/.test(command)) {
          previousQuestionRef.current?.();
          return;
        }
        if (/^(skip|skip question|skip this|skip this question|skip it)$/.test(command)) {
          skipQuestionRef.current?.();
          return;
        }

        sendMessageRef.current?.(spokenText, "voice");
      }, 1500);
    };

    recognition.onerror = (event) => {
      if (recognitionSubmitTimerRef.current) clearTimeout(recognitionSubmitTimerRef.current);
      liveTranscriptRef.current = "";
      recognitionStartingRef.current = false;
      recognitionRunningRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);

      if (event.error === "not-allowed") {
        autoListenRef.current = false;
        setError("Microphone permission was denied. Allow microphone access in Chrome.");
      } else if (event.error === "no-speech") {
        if (autoListenRef.current && startedRef.current && !isPausedRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
          scheduleAutoListen();
        } else {
          setError("I couldn't hear you. Please speak again.");
        }
      } else if (event.error !== "aborted") {
        setError(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      recognitionStartingRef.current = false;
      recognitionRunningRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);

      // IMPORTANT: when Chrome ends after giving us a final transcript,
      // the 1.5s submit timer is still waiting. Do NOT reopen the mic here.
      // Otherwise the mic starts again before sendMessage() runs and the
      // answer gets stuck/replaced by another listening session.
      if (recognitionSubmitTimerRef.current) {
        return;
      }

      if (autoListenRef.current && startedRef.current && !isPausedRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
        scheduleAutoListen();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, []);

  // -----------------------------
  // TTS + AUTO LISTEN
  // -----------------------------
  const scheduleAutoListen = () => {
    if (autoListenTimerRef.current) {
      clearTimeout(autoListenTimerRef.current);
    }

    const tryStart = (attempt = 0) => {
      if (attempt > 12) return;

      if (
        !startedRef.current ||
        isPausedRef.current ||
        isListeningRef.current ||
        recognitionRunningRef.current ||
        recognitionStartingRef.current ||
        isSpeakingRef.current
      ) {
        return;
      }

      // The answer/next-question API can still be finishing when TTS ends.
      // Keep checking until React and the ref both say the AI is no longer thinking.
      if (isThinkingRef.current) {
        autoListenTimerRef.current = setTimeout(() => tryStart(attempt + 1), 250);
        return;
      }

      autoListenTimerRef.current = setTimeout(() => {
        startListeningRef.current?.();
      }, 150);
    };

    tryStart(0);
  };

  const speakText = (text, thenListen = false) => {
    autoListenRef.current = thenListen;

    if (!text) {
      if (thenListen) scheduleAutoListen();
      return;
    }

    if (!("speechSynthesis" in window)) {
      if (thenListen) scheduleAutoListen();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.94;
    utterance.pitch = 1;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);

      if (thenListen && autoListenRef.current && !isPausedRef.current) {
        scheduleAutoListen();
      }
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);

      if (thenListen && autoListenRef.current && !isPausedRef.current) {
        scheduleAutoListen();
      }
    };

    isSpeakingRef.current = true;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const listenToAI = (text) => speakText(text, false);

  // -----------------------------
  // START CONVERSATION
  // -----------------------------
  const startConversation = async () => {
    if (!selectedCharacter) return;
    if (!authUser || !authToken) {
      openAuth("login");
      return;
    }

    window.speechSynthesis?.cancel();
    if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
    autoListenRef.current = true;

    setStarted(true);
    setMessages([]);
    setQuestionHistory([]);
    setCurrentQuestionIndex(-1);
    setTranscript("");
    setFeedback(null);
    setError("");
    setIsPaused(false);

    await getNextAIQuestion(
      `Start a natural ${selectedCharacter.mode} English conversation with me. Briefly introduce yourself as ${selectedCharacter.name} and ask me one simple question.`,
      true
    );
  };

  // -----------------------------
  // GET NEXT QUESTION FROM AI
  // -----------------------------
  const getNextAIQuestion = async (prompt, isFirstTurn = false) => {
    const character = selectedCharacterRef.current || selectedCharacter;
    if (!character) return;

    isThinkingRef.current = true;
    setIsThinking(true);
    setError("");

    try {
      const historyForAI = messages.slice(-12).map((m) => ({
        role: m.sender === "ai" ? "assistant" : "user",
        content: m.text,
      }));

      const userName = localStorage.getItem("voxlivaUserName") || "Arnav";

      const response = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          character: character.name,
          mode: character.mode,
          history: historyForAI,
          start: isFirstTurn,
          userName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "AI response failed");
      }

      const question =
        data.question ||
        "Can you tell me a little more about that?";
      let reply = cleanAIReply(data.reply || "", question);

      // Keep the introduction only on the first question.
      reply = removeRepeatedIntroduction(
        reply,
        character.name,
        isFirstTurn
      );
      const options = Array.isArray(data.options)
        ? data.options.slice(0, 5)
        : [];

      const newAIMessage = {
        id: Date.now() + Math.random(),
        sender: "ai",
        text: reply,
      };

      setMessages((prev) => [...prev, newAIMessage]);

      const newTurn = {
        id: Date.now(),
        question,
        options,
        attempts: 0,
        completed: false,
        skipped: false,
        lastAnswer: "",
        lastFeedback: null,
      };

      setQuestionHistory((prev) => {
        const next = [...prev, newTurn];
        setCurrentQuestionIndex(next.length - 1);
        return next;
      });

      // AI speaks reply + question, then automatically opens the mic.
      autoListenRef.current = true;
      speakText(`${reply} ${question}`, true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to connect with Voxliva AI.");
    } finally {
      isThinkingRef.current = false;
      setIsThinking(false);
    }
  };

  // -----------------------------
  // ANALYZE USER ANSWER
  // -----------------------------
  const analyzeAnswer = async (answer) => {
    const response = await fetch(`${API}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer: answer,
        question: currentQuestion,
        character: selectedCharacter?.name || "Maya",
        mode: selectedCharacter?.mode || "Daily Conversation",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || data.error || "Analysis failed"
      );
    }

    return data.analysis || data.feedback || {};
  };

  // -----------------------------
  // SUBMIT ANSWER
  // Voice OR option both come here.
  // -----------------------------
  const sendMessage = async (userMessage, source = "voice") => {
    const clean = userMessage?.trim();
    const character = selectedCharacterRef.current || selectedCharacter;

    if (!clean || !character || isThinkingRef.current || isPausedRef.current) return;

    if (currentQuestionIndex < 0 || !currentTurn) {
      return;
    }

    isThinkingRef.current = true;
    setIsThinking(true);
    setError("");
    setFeedback(null);
    autoListenRef.current = false;
    if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
    if (recognitionSubmitTimerRef.current) {
      clearTimeout(recognitionSubmitTimerRef.current);
      recognitionSubmitTimerRef.current = null;
    }
    window.speechSynthesis?.cancel();

    const turnIndex = currentQuestionIndex;

    try {
      // 1. Analyze EVERYTHING, including option clicks.
      const result = await analyzeAnswer(clean);

      const grammar = Number(result?.grammarScore ?? 0);
      const fluency = Number(result?.fluencyScore ?? 0);
      const vocabulary = Number(result?.vocabularyScore ?? 0);

      // Prefer the backend's explicit correctness when available.
      // Otherwise use the learning score threshold.
      const passed =
        result?.isCorrect === true ||
        (grammar >= 80 && fluency >= 70 && vocabulary >= 65);

      const nextFeedback = {
        ...result,
        source,
        passed,
        attempt: (questionHistory[turnIndex]?.attempts || 0) + 1,
      };

      setFeedback(nextFeedback);
      setTranscript(clean);

      setQuestionHistory((prev) =>
        prev.map((turn, index) =>
          index === turnIndex
            ? {
                ...turn,
                attempts: turn.attempts + 1,
                lastAnswer: clean,
                lastFeedback: nextFeedback,
                completed: passed,
              }
            : turn
        )
      );

      // Show the exact user sentence in conversation.
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          sender: "user",
          text: clean,
        },
      ]);

      // 2. If wrong: DO NOT move to next question.
      // Teach -> correct -> practice same question.
      if (!passed) {
        const correction =
          result.correctedSentence ||
          "Try saying the sentence in a clearer and more natural way.";

        speakText(
          `Let's practice this question again. The natural sentence is: ${correction}. Now try again: ${currentQuestion}`,
          true
        );

        return;
      }

      // 3. Correct enough -> AI replies and gives a NEW question.
      const historyForAI = [
        ...messages.slice(-10).map((m) => ({
          role: m.sender === "ai" ? "assistant" : "user",
          content: m.text,
        })),
        { role: "user", content: clean },
      ];

      const userName = localStorage.getItem("voxlivaUserName") || "Arnav";

      const response = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          character: character.name,
          mode: character.mode,
          history: historyForAI,
          start: false,
          userName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "AI response failed");
      }

      const nextQuestion =
        data.question ||
        "What would you like to talk about next?";
      const aiReply = cleanAIReply(data.reply || "", nextQuestion);
      const nextOptions = Array.isArray(data.options)
        ? data.options.slice(0, 5)
        : [];

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          sender: "ai",
          text: aiReply,
        },
      ]);

      setQuestionHistory((prev) => {
        const next = [
          ...prev,
          {
            id: Date.now() + Math.random(),
            question: nextQuestion,
            options: nextOptions,
            attempts: 0,
            completed: false,
            skipped: false,
            lastAnswer: "",
            lastFeedback: null,
          },
        ];
        setCurrentQuestionIndex(next.length - 1);
        return next;
      });

      setFeedback({
        ...nextFeedback,
        passed: true,
      });

      autoListenRef.current = true;
      speakText(`Correct. ${aiReply} ${nextQuestion}`, true);
    } catch (err) {
      console.error("Conversation error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      isThinkingRef.current = false;
      setIsThinking(false);
    }
  };

  sendMessageRef.current = sendMessage;

  // -----------------------------
  // MICROPHONE
  // -----------------------------
  const startListening = (fromAutoListen = false) => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not available. Use Chrome.");
      return;
    }

    if (!startedRef.current) return;
    if (isListeningRef.current || recognitionRunningRef.current || recognitionStartingRef.current) return;
    if (isThinkingRef.current || isPausedRef.current || isSpeakingRef.current) return;

    setError("");
    setTranscript("");
    liveTranscriptRef.current = "";
    if (recognitionSubmitTimerRef.current) {
      clearTimeout(recognitionSubmitTimerRef.current);
      recognitionSubmitTimerRef.current = null;
    }
    recognitionStartingRef.current = true;

    try {
      recognitionRef.current.start();
    } catch (err) {
      recognitionStartingRef.current = false;

      if (err?.name === "InvalidStateError") {
        if (fromAutoListen || autoListenRef.current) {
          if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
          autoListenTimerRef.current = setTimeout(() => startListeningRef.current?.(true), 500);
        }
        return;
      }

      console.log("Recognition start:", err.message);
    }
  };

  startListeningRef.current = startListening;

  const stopListening = (manual = true) => {
    if (manual) autoListenRef.current = false;
    recognitionStartingRef.current = false;
    if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
    try {
      recognitionRef.current?.stop();
    } catch {}
    recognitionRunningRef.current = false;
    isListeningRef.current = false;
    setIsListening(false);
  };

  // -----------------------------
  // PRACTICE SAME QUESTION
  // -----------------------------
  const practiceAgain = () => {
    setFeedback(null);
    setTranscript("");
    setError("");

    speakText(
      `Let's try the same question again. ${currentQuestion}`,
      true
    );
  };

  const speakCorrection = () => {
    if (!feedback?.correctedSentence) return;

    speakText(
      `The correct natural sentence is: ${feedback?.correctedSentence}`,
      false
    );
  };

  // -----------------------------
  // SKIP / NEXT
  // -----------------------------
  const skipQuestion = async () => {
    if (isThinking || !selectedCharacter) return;

    const idx = currentQuestionIndex;

    setQuestionHistory((prev) =>
      prev.map((turn, index) =>
        index === idx ? { ...turn, skipped: true } : turn
      )
    );

    setFeedback(null);
    setTranscript("");

    await getNextAIQuestion(
      `Skip the current question and move to a completely new question. Keep the conversation natural. Do not repeat the previous question.`
    );
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < questionHistory.length - 1) {
      const next = currentQuestionIndex + 1;
      setCurrentQuestionIndex(next);
      setFeedback(questionHistory[next]?.lastFeedback || null);
      setTranscript(questionHistory[next]?.lastAnswer || "");
      return;
    }

    await skipQuestion();
  };

  const previousQuestion = () => {
    if (currentQuestionIndex <= 0) return;

    const previous = currentQuestionIndex - 1;
    setCurrentQuestionIndex(previous);
    setFeedback(questionHistory[previous]?.lastFeedback || null);
    setTranscript(questionHistory[previous]?.lastAnswer || "");
  };

  nextQuestionRef.current = nextQuestion;
  previousQuestionRef.current = previousQuestion;
  skipQuestionRef.current = skipQuestion;

  // -----------------------------
  // PAUSE / RESUME
  // -----------------------------
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      autoListenRef.current = true;

      if (currentQuestion) {
        speakText(`Let's continue. ${currentQuestion}`, true);
      }
    } else {
      setIsPaused(true);
      autoListenRef.current = false;
      stopListening();
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  };

  // -----------------------------
  // LEARNING STUDIO
  // -----------------------------
  const askGrammarTeacher = async () => {
    if (!grammarTopic.trim()) return;
    setGrammarLoading(true);
    setGrammarAnswer("");

    try {
      const response = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Teach English grammar in simple language. Topic: ${grammarTopic}. Explain the rule, when to use it, 3 examples, common mistakes, and one short practice question. Do not ask a conversation question.`,
          character: "Voxliva Grammar Teacher",
          mode: "Grammar Teaching",
          history: [],
          start: false,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Grammar teacher failed");
      setGrammarAnswer(data.reply || "No explanation received.");
    } catch (err) {
      setGrammarAnswer("Grammar teacher could not connect. Please make sure the Voxliva backend is running.");
    } finally {
      setGrammarLoading(false);
    }
  };

  const translateToEnglish = async (inputText = hindiText) => {
    const textToTranslate = inputText.trim();
    if (!textToTranslate) return;
    setTranslateLoading(true);
    setEnglishReply("");

    try {
      const response = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `The user wrote this Hindi or Hinglish text: "${textToTranslate}". Give the natural English version first, then briefly explain the useful English phrase. Do not ask a question.`,
          character: "Voxliva Translator",
          mode: "Hindi to English",
          history: [],
          start: false,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Translation failed");
      setEnglishReply(data.reply || "No English reply received.");
    } catch (err) {
      setEnglishReply("Translator could not connect. Please make sure the Voxliva backend is running.");
    } finally {
      setTranslateLoading(false);
    }
  };

  const startHindiListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setEnglishReply("Hindi voice input is not supported in this browser. Please use Chrome.");
      return;
    }
    try { hindiRecognitionRef.current?.stop(); } catch {}

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setHindiListening(true);
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.trim();
      setHindiText(text);
      setHindiListening(false);
      if (text) setTimeout(() => translateToEnglish(text), 100);
    };
    recognition.onerror = () => setHindiListening(false);
    recognition.onend = () => setHindiListening(false);
    hindiRecognitionRef.current = recognition;
    recognition.start();
  };

  // -----------------------------
  // GO BACK
  // -----------------------------
  const goBack = () => {
    if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
    autoListenRef.current = false;
    stopListening();
    window.speechSynthesis?.cancel();

    setStarted(false);
    setMessages([]);
    setQuestionHistory([]);
    setCurrentQuestionIndex(-1);
    setTranscript("");
    setFeedback(null);
    setError("");
    setIsListening(false);
    setIsThinking(false);
    setIsSpeaking(false);
  };

  // -----------------------------
  // ROUTING / PAGES
  // -----------------------------
  const getPageFromHash = () => {
    const hash = window.location.hash.replace("#", "").trim();
    return ["home", "characters", "practice", "learn"].includes(hash)
      ? hash
      : "home";
  };

  const [page, setPage] = useState(getPageFromHash());

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (target) => {
    if (started) return;
    window.location.hash = target;
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };

  // -----------------------------
  // CONVERSATION SCREEN
  // -----------------------------
  if (started && selectedCharacter) {
    const lastAIMessage = [...messages]
      .reverse()
      .find((message) => message.sender === "ai");

    return (
      <div className="conversation-page">
        <style>{conversationLayoutStyles + `
          .conversation-page{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at 10% 0%,#eee7ff 0,#f7f6fb 42%,#f1eff8 100%)}
          .conversation-page .navbar{background:rgba(255,255,255,.92);backdrop-filter:blur(18px);border-bottom:1px solid #e8e2f4;box-shadow:0 5px 20px rgba(44,30,80,.05)}
          .conversation-page .conversation-container{max-width:1480px;margin:auto;grid-template-columns:minmax(0,1.05fr) minmax(450px,.95fr);padding:18px 26px}
          .conversation-page .character-video{border:1px solid rgba(124,77,216,.15);border-radius:30px;background:linear-gradient(145deg,#ddd0ff 0%,#f8f4ff 70%,#fff 100%);box-shadow:0 20px 55px rgba(86,54,160,.14);position:relative}
          .conversation-page .character-top{display:flex;justify-content:space-between;align-items:center;color:#34254f;font-weight:800}
          .conversation-page .live-dot{color:#e53935;font-weight:900}
          .conversation-page .character-large{filter:drop-shadow(0 16px 12px rgba(70,40,120,.15));}
          .conversation-page .character-video h1{color:#171321;font-weight:850}
          .conversation-page .ai-caption{background:#29233b;color:white;border-radius:18px;box-shadow:0 12px 25px rgba(32,23,48,.12);font-weight:600}
          .conversation-page .mic-button{border:0;background:linear-gradient(145deg,#8052df,#6034b6);box-shadow:0 12px 25px rgba(105,62,190,.3);font-size:25px;cursor:pointer;transition:.2s}
          .conversation-page .mic-button:hover{transform:translateY(-2px) scale(1.03)}
          .conversation-page .mic-button.listening{background:linear-gradient(145deg,#ef5350,#d32f2f);animation:pulseMic 1.2s infinite}
          @keyframes pulseMic{50%{box-shadow:0 0 0 12px rgba(239,83,80,.12),0 12px 25px rgba(180,40,40,.2)}}
          .conversation-page .conversation-side{background:rgba(255,255,255,.8);border:1px solid #e6def5;border-radius:30px;padding:14px;box-shadow:0 18px 45px rgba(48,35,82,.08)}
          .conversation-page .question-header,.conversation-page .answer-options-box,.conversation-page .learning-feedback{border:1px solid #e8defa!important;background:#fff;border-radius:20px!important;box-shadow:0 8px 22px rgba(86,54,160,.05)}
          .conversation-page .question-header h2{font-size:23px;color:#181421}
          .conversation-page .question-label{font-weight:900;letter-spacing:.16em;color:#7046c6;font-size:11px}
          .conversation-page .attempt-pill{background:#f0e8ff;color:#6b40c2;font-weight:800}
          .conversation-page .answer-option{background:#fff;border:1px solid #e5dafa;color:#211b2c;cursor:pointer;transition:.18s}
          .conversation-page .answer-option:hover:not(:disabled){border-color:#7c4fe0;background:#faf7ff;transform:translateY(-1px);box-shadow:0 7px 15px rgba(91,57,155,.08)}
          .conversation-page .answer-option span{background:#eee6ff;color:#7045c7;font-weight:900}
          .conversation-page .question-navigation button{border:1px solid #e2d7f6;background:white;border-radius:13px;font-weight:800;color:#6940bd;cursor:pointer}
          .conversation-page .question-navigation button:hover:not(:disabled){background:#f5efff}
          .conversation-page .messages-container>div{border-radius:15px!important;background:#f5efff!important;border:1px solid #eadfff!important}
        `}</style>
        <header className="navbar">
          <div className="logo">Vox<span>liva</span></div>
          <button className="back-btn" onClick={goBack}>← Change Character</button>
        </header>

        <main className="conversation-container">
          <section className="character-video">
            <div className="character-top"><span>Voxliva AI • Live Coach</span><span className="live-dot">● LIVE</span></div>
            <div className={`character-large ${isSpeaking ? "avatar-speaking" : ""}`}>
              <span className="avatar-face">{selectedCharacter.emoji}</span>
              <span className={`avatar-mouth ${isSpeaking ? "moving" : ""}`} />
            </div>
            <h1>{selectedCharacter.name}</h1>
            <p>{selectedCharacter.mode} • {selectedCharacter.gender}</p>
            <div className="ai-caption">
              {isThinking ? `${selectedCharacter.name} is checking your English...` : lastAIMessage ? `🔊 ${cleanAIReply(lastAIMessage.text, currentQuestion)}` : `Hi! I'm ${selectedCharacter.name}.`}
            </div>
            <div className={`voice-wave ${isSpeaking || isListening ? "active" : ""}`}>
              {Array.from({ length: 25 }).map((_, index) => <span key={index} style={{ "--i": index }} />)}
            </div>
            <button className={`mic-button ${isListening ? "listening" : ""}`} onClick={isListening ? stopListening : startListening} disabled={isThinking || isPaused}>
              {isListening ? "🛑" : "🎤"}
            </button>
            <p className="mic-text">
              {isListening ? "Listening... speak naturally." : isSpeaking ? `${selectedCharacter.name} is speaking...` : isThinking ? "Checking your English..." : isPaused ? "Conversation paused" : "Tap the mic or choose an answer"}
            </p>
            {transcript && <div className="user-transcript"><strong>You said:</strong><p>{transcript}</p></div>}
            {error && <div className="error-message">{error}</div>}
            <button className="pause-btn" onClick={togglePause}>{isPaused ? "▶ Resume Conversation" : "Ⅱ Pause Conversation"}</button>
          </section>

          <section className="conversation-side">
            <div className="question-header">
              <div><span className="question-label">QUESTION</span><h2>{currentQuestion || "Loading question..."}</h2></div>
              <span className="attempt-pill">Attempt {currentAttempt}</span>
            </div>
            <div className="answer-options-box">
              <h3>💡 Choose an answer or speak your own</h3>
              <div className="answer-options">
                {currentOptions.map((option,index)=><button key={`${option}-${index}`} className="answer-option" disabled={isThinking||isPaused} onClick={()=>sendMessage(option,"option")}><span>{index+1}</span><strong>{option}</strong></button>)}
              </div>
              <p>🎙️ Your own answer is always welcome — Voxliva checks it too.</p>
            </div>
            {feedback && <div className={`learning-feedback ${feedback?.passed ? "success" : "needs-practice"}`}>
              <h3>{feedback?.passed ? "✅ Nice! Let's keep the conversation going." : "📚 Let's improve this answer."}</h3>
              <div className="score-grid">
                <div><span>Grammar</span><b>{feedback?.grammarScore ?? "--"}</b></div>
                <div><span>Fluency</span><b>{feedback?.fluencyScore ?? "--"}</b></div>
                <div><span>Vocabulary</span><b>{feedback?.vocabularyScore ?? "--"}</b></div>
              </div>
              {feedback?.correctedSentence && <div className="correction-card"><span>Natural sentence</span><p>{feedback.correctedSentence}</p><button onClick={speakCorrection}>🔊 Hear correction</button></div>}
              <div className="feedback-details">
                {feedback?.grammarFeedback && <p><strong>Grammar:</strong> {feedback.grammarFeedback}</p>}
                {feedback?.fluencyFeedback && <p><strong>Fluency:</strong> {feedback.fluencyFeedback}</p>}
                {feedback?.vocabularyFeedback && <p><strong>Vocabulary:</strong> {feedback.vocabularyFeedback}</p>}
              </div>
              {!feedback?.passed && <div className="practice-actions"><button onClick={practiceAgain}>🎤 Practice again</button><button onClick={speakCorrection}>🔊 Learn sentence</button></div>}
            </div>}
            <div className="question-navigation">
              <button onClick={previousQuestion} disabled={currentQuestionIndex<=0||isThinking}>← Previous</button>
              <button onClick={skipQuestion} disabled={isThinking}>Skip</button>
              <button onClick={nextQuestion} disabled={isThinking}>Next →</button>
            </div>
            <div className="conversation-history-mini"><h3>Conversation</h3><div className="messages-container">
              {messages.slice(-8).map(message=><div key={message.id} className={message.sender === "ai" ? "ai-message" : "user-message"}><strong>{message.sender === "ai" ? selectedCharacter.name : "You"}</strong><p>{message.text}</p>{message.sender === "ai" && <button className="speak-btn" onClick={()=>listenToAI(message.text)}>🔊 Listen</button>}</div>)}
            </div></div>
          </section>
        </main>
      </div>
    );
  }

  const globalStyles = `
    *{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{margin:0;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f6f4fb;color:#191522}
    .vx-shell{min-height:100vh;background:radial-gradient(circle at 10% 0%,#efe8ff 0,#f8f7fc 38%,#f3f1f8 100%)}
    .vx-nav{height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(22px,5vw,78px);background:rgba(255,255,255,.88);backdrop-filter:blur(18px);border-bottom:1px solid #e8e2f2;position:sticky;top:0;z-index:30}
    .vx-logo{font-size:29px;font-weight:950;letter-spacing:-1.7px}.vx-logo span{color:#7448d0}.vx-navlinks{display:flex;gap:8px}.vx-navlinks button{border:0;background:transparent;padding:10px 15px;border-radius:12px;color:#5e586a;font-size:15px;font-weight:800;cursor:pointer}.vx-navlinks button:hover,.vx-navlinks button.active{background:#f0e9ff;color:#7044c5}.vx-profile{border:0;background:#1e1829;color:#fff;padding:11px 18px;border-radius:13px;font-weight:800}
    .vx-home-hero{min-height:470px;display:grid;place-items:center;text-align:center;padding:70px 24px;position:relative;overflow:hidden}.vx-home-hero:before,.vx-home-hero:after{content:"";position:absolute;border-radius:50%;filter:blur(2px);opacity:.55}.vx-home-hero:before{width:330px;height:330px;background:#dfd0ff;left:-100px;top:30px}.vx-home-hero:after{width:300px;height:300px;background:#e9dcff;right:-80px;bottom:-70px}.vx-hero-content{max-width:920px;position:relative;z-index:1}.vx-badge{display:inline-flex;padding:8px 14px;border-radius:999px;background:#e9ddff;color:#6940bb;font-weight:850;font-size:13px}.vx-home-hero h1{font-size:clamp(42px,6vw,76px);line-height:.98;letter-spacing:-3px;margin:22px 0 18px}.vx-home-hero h1 span{color:#7549cf}.vx-home-hero p{font-size:19px;color:#706a7b;max-width:720px;margin:auto;line-height:1.6}.vx-hero-actions{display:flex;justify-content:center;gap:12px;margin-top:28px}.vx-primary,.vx-secondary{border:0;padding:14px 22px;border-radius:15px;font-weight:900;font-size:15px;cursor:pointer}.vx-primary{background:linear-gradient(135deg,#8255df,#6034b5);color:#fff;box-shadow:0 12px 28px rgba(105,62,190,.25)}.vx-secondary{background:#fff;border:1px solid #e1d8f1;color:#6040a0}
    .vx-stats{display:grid;grid-template-columns:repeat(4,1fr);max-width:1080px;margin:-38px auto 0;position:relative;z-index:2;padding:0 20px}.vx-stat{background:rgba(255,255,255,.9);border:1px solid #e8e1f3;padding:22px;text-align:center}.vx-stat:first-child{border-radius:20px 0 0 20px}.vx-stat:last-child{border-radius:0 20px 20px 0}.vx-stat b{font-size:25px}.vx-stat span{display:block;color:#7b7485;font-size:12px;margin-top:5px}
    .vx-section{padding:72px clamp(22px,6vw,90px)}.vx-section-head{text-align:center;max-width:760px;margin:0 auto 30px}.vx-section-head .eyebrow{color:#7549cf;font-weight:900;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.vx-section-head h2{font-size:38px;letter-spacing:-1.5px;margin:8px 0}.vx-section-head p{color:#777080;line-height:1.6}.vx-feature-grid{max-width:1100px;margin:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.vx-feature{padding:25px;border-radius:22px;background:#fff;border:1px solid #e8e1f3;box-shadow:0 10px 30px rgba(62,43,99,.06)}.vx-feature .icon{font-size:30px}.vx-feature h3{margin:13px 0 7px}.vx-feature p{color:#777080;line-height:1.5;font-size:14px}
    .vx-character-page{min-height:calc(100vh - 76px);padding:34px clamp(20px,5vw,80px) 40px}.vx-character-head{text-align:center;margin-bottom:20px}.vx-character-head h1{font-size:40px;letter-spacing:-1.5px;margin:8px 0}.vx-character-head p{color:#777080;margin:0}.vx-character-grid{max-width:1240px;margin:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.vx-character-card{border:1px solid #e7def5;background:rgba(255,255,255,.92);border-radius:23px;padding:14px;display:grid;grid-template-columns:88px 1fr;gap:15px;text-align:left;cursor:pointer;transition:.2s;min-height:154px}.vx-character-card:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(70,45,125,.1)}.vx-character-card.selected{border:2px solid #7949d4;box-shadow:0 14px 35px rgba(108,67,196,.16)}.vx-character-image{background:linear-gradient(145deg,#f0e8ff,#faf8ff);border-radius:17px;display:grid;place-items:center;font-size:58px}.vx-character-name{display:flex;justify-content:space-between;align-items:center}.vx-character-name h3{font-size:20px;margin:0}.vx-character-gender{font-size:12px;color:#817a8d;margin:4px 0 8px}.vx-mode{display:inline-flex;background:#eee5ff;color:#6e43c2;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:900}.vx-character-card p{font-size:12px;line-height:1.4;color:#777080;margin:9px 0 0}.vx-startbar{max-width:1240px;margin:18px auto 0;background:#211b2f;border-radius:22px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;color:#fff}.vx-startbar span{color:#cfc5df}.vx-startbar strong{color:#fff}.vx-startbar button{border:0;background:#8254df;color:#fff;border-radius:13px;padding:12px 18px;font-weight:900;cursor:pointer}
    .vx-practice-grid{max-width:1100px;margin:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.vx-practice-card{padding:25px;background:#fff;border:1px solid #e7e0f1;border-radius:22px;cursor:pointer;transition:.2s}.vx-practice-card:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(70,45,125,.08)}.vx-practice-card .big{font-size:34px}.vx-practice-card h3{margin:12px 0 5px}.vx-practice-card p{margin:0;color:#777080;font-size:14px;line-height:1.5}
    .vx-learn-grid{max-width:1150px;margin:auto;display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.vx-learn-card{background:#fff;border:1px solid #e7e0f1;border-radius:25px;padding:28px;box-shadow:0 12px 30px rgba(66,44,103,.06)}.vx-learn-card .big{font-size:35px}.vx-learn-card h2{margin:12px 0 6px}.vx-learn-card p{color:#777080;line-height:1.55}.vx-learn-card select,.vx-learn-card textarea{width:100%;padding:12px;border:1px solid #ded5ed;border-radius:13px;margin:8px 0 10px;font:inherit}.vx-learn-card textarea{min-height:130px;resize:vertical}.vx-learn-card button{border:0;background:#7548cc;color:#fff;border-radius:12px;padding:11px 15px;font-weight:850;cursor:pointer}.vx-learn-result{margin-top:15px;padding:15px;border-radius:15px;background:#f8f4ff;color:#4e4560;line-height:1.65;white-space:pre-wrap}
    .vx-footer{background:#211b2f;color:#fff;text-align:center;padding:42px 20px}.vx-footer h2{margin:0 0 6px}.vx-footer p{margin:0;color:#bcb3ca}
    @media(max-width:900px){.vx-character-grid,.vx-feature-grid,.vx-practice-grid{grid-template-columns:repeat(2,1fr)}.vx-stats{grid-template-columns:repeat(2,1fr)}.vx-stat:first-child{border-radius:20px 0 0 0}.vx-stat:last-child{border-radius:0 0 20px 0}.vx-learn-grid{grid-template-columns:1fr}}
    @media(max-width:620px){.vx-navlinks{display:none}.vx-home-hero{min-height:520px}.vx-home-hero h1{letter-spacing:-2px}.vx-hero-actions{flex-direction:column}.vx-stats,.vx-character-grid,.vx-feature-grid,.vx-practice-grid{grid-template-columns:1fr}.vx-stat:first-child,.vx-stat:last-child{border-radius:0}.vx-character-card{min-height:135px}.vx-startbar{flex-direction:column;gap:12px;text-align:center}.vx-section{padding:52px 18px}}
  `;

  const renderNav = () => (
    <header className="vx-nav">
      <div className="vx-logo">Vox<span>liva</span></div>
      <nav className="vx-navlinks">
        <button className={page === "home" ? "active" : ""} onClick={() => navigate("home")}>Home</button>
        <button className={page === "characters" ? "active" : ""} onClick={() => navigate("characters")}>Characters</button>
        <button className={page === "practice" ? "active" : ""} onClick={() => navigate("practice")}>Practice</button>
        <button className={page === "learn" ? "active" : ""} onClick={() => navigate("learn")}>Learn</button>
      </nav>
      {authUser ? (
        <div className="vx-auth-user">
          <button className="vx-profile" onClick={() => window.alert(`Logged in as ${authUser.email}`)}>
            👤 {authUser.name || "Profile"}
          </button>
          <button className="vx-logout" onClick={logout}>Logout</button>
        </div>
      ) : (
        <div className="vx-auth-actions">
          <button className="vx-login-btn" onClick={() => openAuth("login")}>Login</button>
          <button className="vx-signup-btn" onClick={() => openAuth("signup")}>Sign Up</button>
        </div>
      )}
    </header>
  );

  const homePage = (
    <>
      {renderNav()}
      <section className="vx-home-hero">
        <div className="vx-hero-content">
          <span className="vx-badge">✦ AI ENGLISH SPEAKING COACH</span>
          <h1>Speak English.<br/><span>Build Confidence.</span></h1>
          <p>Practice real conversations with AI partners, get instant grammar and fluency feedback, and learn to speak more naturally every day.</p>
          <div className="vx-hero-actions"><button className="vx-primary" onClick={()=>navigate("characters")}>🎙️ Start Speaking</button><button className="vx-secondary" onClick={()=>navigate("learn")}>📚 Learn English</button></div>
        </div>
      </section>
      <div className="vx-stats"><div className="vx-stat"><b>6</b><span>AI conversation partners</span></div><div className="vx-stat"><b>5</b><span>suggested answers</span></div><div className="vx-stat"><b>3</b><span>speaking scores</span></div><div className="vx-stat"><b>24/7</b><span>practice anytime</span></div></div>
      <section className="vx-section"><div className="vx-section-head"><div className="eyebrow">HOW VOXLIVA WORKS</div><h2>Your personal English practice room</h2><p>Speak, get corrected, practice again and continue naturally — without worrying about making mistakes.</p></div><div className="vx-feature-grid"><div className="vx-feature"><div className="icon">🎙️</div><h3>Speak naturally</h3><p>Use your microphone and answer in your own words. Your voice becomes the conversation.</p></div><div className="vx-feature"><div className="icon">🧠</div><h3>AI understands you</h3><p>Voxliva keeps the conversation moving and gives you useful answer suggestions.</p></div><div className="vx-feature"><div className="icon">📈</div><h3>Improve every answer</h3><p>See grammar, fluency and vocabulary feedback and practice the corrected sentence.</p></div></div></section>
      <section className="vx-section" style={{paddingTop:10}}><div className="vx-section-head"><div className="eyebrow">READY?</div><h2>Choose your conversation partner</h2><button className="vx-primary" onClick={()=>navigate("characters")}>Explore AI Characters →</button></div></section>
      <footer className="vx-footer"><h2>Voxliva</h2><p>AI English Conversation Practice • Speak more. Fear less.</p></footer>
    </>
  );

  const charactersPage = (
    <>
      {renderNav()}
      <main className="vx-character-page"><div className="vx-character-head"><span className="vx-badge">MEET YOUR AI PARTNERS</span><h1>Choose who you want to talk to</h1><p>Each partner has a different personality, situation and speaking style.</p></div><div className="vx-character-grid">{characters.map(character=><button key={character.id} className={`vx-character-card ${selectedCharacter?.id===character.id?"selected":""}`} onClick={()=>handleCharacterSelect(character)}><div className="vx-character-image">{character.emoji}</div><div><div className="vx-character-name"><h3>{character.name}</h3><span>🔊</span></div><div className="vx-character-gender">{character.gender}</div><span className="vx-mode">{character.mode}</span><p>{character.description}</p></div></button>)}</div><div className="vx-startbar">{selectedCharacter?<span>Selected partner: <strong>{selectedCharacter.name}</strong></span>:<span>Select an AI partner to start speaking</span>}{selectedCharacter?<button onClick={startConversation}>🎙️ Start Conversation</button>:<button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>Choose a partner ↑</button>}</div></main>
      <footer className="vx-footer"><h2>Voxliva</h2><p>Your AI-powered English speaking practice space.</p></footer>
    </>
  );

  const practicePage = (
    <>
      {renderNav()}
      <section className="vx-section" style={{minHeight:"calc(100vh - 76px)"}}><div className="vx-section-head"><span className="vx-badge">REAL-LIFE PRACTICE</span><h2>Practice English for every situation</h2><p>Pick a situation, choose an AI partner and start speaking.</p></div><div className="vx-practice-grid">{[["🎓","College","Practice classroom, friends and campus conversations."],["💼","Interview","Answer common interview questions with confidence."],["🏢","Office","Practice meetings, colleagues and workplace English."],["👥","Friends","Casual conversations, plans and everyday topics."],["🗣️","Unknown Person","Practice natural conversations with strangers."],["☀️","Daily Conversation","Talk about your day, hobbies, food, travel and life."]].map(([icon,title,desc])=><button key={title} className="vx-practice-card" onClick={()=>navigate("characters")}><div className="big">{icon}</div><h3>{title}</h3><p>{desc}</p></button>)}</div></section>
      <footer className="vx-footer"><h2>Practice. Speak. Improve.</h2><p>Voxliva keeps your English practice simple and consistent.</p></footer>
    </>
  );

  const learnPage = (
    <>
      {renderNav()}
      <section className="vx-section" style={{minHeight:"calc(100vh - 76px)"}}><div className="vx-section-head"><span className="vx-badge">LEARNING STUDIO</span><h2>Learn English with Voxliva</h2><p>Fix grammar, build natural sentences and turn Hindi/Hinglish thoughts into confident English.</p></div><div className="vx-learn-grid"><div className="vx-learn-card"><div className="big">📚</div><h2>English Grammar Teacher</h2><p>Learn the rule, examples, common mistakes and a practical explanation.</p><select value={grammarTopic} onChange={e=>setGrammarTopic(e.target.value)}><option>Present Simple</option><option>Present Continuous</option><option>Past Simple</option><option>Future Tense</option><option>Articles (a, an, the)</option><option>Prepositions</option><option>Has / Have / Had</option><option>Is / Am / Are</option><option>Was / Were</option><option>Can / Could / Should</option><option>Since / For</option></select><button onClick={askGrammarTeacher} disabled={grammarLoading}>{grammarLoading?"Teaching...":"Teach Me"}</button>{grammarAnswer&&<div className="vx-learn-result">{grammarAnswer}</div>}</div><div className="vx-learn-card"><div className="big">🇮🇳 → 🇬🇧</div><h2>Hindi / Hinglish → Natural English</h2><p>Type your thought or speak Hindi/Hinglish and learn how to say it naturally in English.</p><textarea value={hindiText} onChange={e=>setHindiText(e.target.value)} placeholder="Example: Mujhe kal college jana hai..."/><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button onClick={startHindiListening}>{hindiListening?"🎙️ Listening...":"🎤 Speak Hindi"}</button><button onClick={()=>translateToEnglish()} disabled={translateLoading}>{translateLoading?"Translating...":"Translate to English"}</button></div>{englishReply&&<div className="vx-learn-result">{englishReply}</div>}</div></div></section>
      <footer className="vx-footer"><h2>Keep learning with Voxliva</h2><p>Grammar • Speaking • Vocabulary • Natural English</p></footer>
    </>
  );

  const authModal = authOpen && authMode !== "profile" ? (
    <div className="vx-auth-overlay" onMouseDown={closeAuth}>
      <div className="vx-auth-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="vx-auth-close" onClick={closeAuth}>×</button>

        <div className="vx-auth-brand">Vox<span>liva</span></div>
        <h2>{authMode === "login" ? "Welcome back" : "Create your Voxliva account"}</h2>
        <p className="vx-auth-subtitle">
          {authMode === "login"
            ? "Login to continue your English speaking practice."
            : "Create an account to save your Voxliva progress."}
        </p>

        <div className="vx-auth-tabs">
          <button className={authMode === "login" ? "active" : ""} onClick={() => { setAuthMode("login"); setAuthError(""); }}>
            Login
          </button>
          <button className={authMode === "signup" ? "active" : ""} onClick={() => { setAuthMode("signup"); setAuthError(""); }}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuthSubmit} className="vx-auth-form">
          {authMode === "signup" && (
            <label>
              Full name
              <input
                value={authForm.name}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Minimum 6 characters"
              autoComplete={authMode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {authError && <div className="vx-auth-error">{authError}</div>}

          <button className="vx-auth-submit" type="submit" disabled={authLoading}>
            {authLoading
              ? "Please wait..."
              : authMode === "login"
              ? "Login to Voxliva"
              : "Create Account"}
          </button>
        </form>

        <p className="vx-auth-switch">
          {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>
            {authMode === "login" ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  ) : null;

  const authStyles = `
    .vx-auth-actions,.vx-auth-user{display:flex;align-items:center;gap:8px}
    .vx-login-btn,.vx-signup-btn,.vx-logout{border:0;cursor:pointer;font-weight:850;border-radius:11px;padding:10px 14px}
    .vx-login-btn{background:transparent;color:#5e586a}.vx-signup-btn{background:#7549cf;color:#fff}
    .vx-logout{background:#f3edff;color:#7045c7}.vx-profile{cursor:pointer}
    .vx-auth-overlay{position:fixed;inset:0;background:rgba(24,17,38,.58);backdrop-filter:blur(7px);z-index:1000;display:grid;place-items:center;padding:20px}
    .vx-auth-modal{width:min(440px,100%);background:#fff;border-radius:26px;padding:30px;position:relative;box-shadow:0 30px 80px rgba(20,12,40,.28)}
    .vx-auth-close{position:absolute;right:16px;top:12px;border:0;background:#f4effa;color:#5d526e;width:34px;height:34px;border-radius:50%;font-size:24px;cursor:pointer}
    .vx-auth-brand{font-size:28px;font-weight:950;letter-spacing:-1.5px}.vx-auth-brand span{color:#7549cf}
    .vx-auth-modal h2{margin:18px 0 6px;font-size:27px}.vx-auth-subtitle{margin:0 0 20px;color:#777080;font-size:14px;line-height:1.5}
    .vx-auth-tabs{display:grid;grid-template-columns:1fr 1fr;background:#f5f1fa;padding:4px;border-radius:13px;margin-bottom:18px}
    .vx-auth-tabs button{border:0;background:transparent;padding:10px;border-radius:10px;font-weight:850;color:#756b82;cursor:pointer}
    .vx-auth-tabs button.active{background:#fff;color:#7044c5;box-shadow:0 3px 10px rgba(60,35,100,.08)}
    .vx-auth-form{display:grid;gap:14px}.vx-auth-form label{display:grid;gap:6px;font-size:13px;font-weight:800;color:#42384e}
    .vx-auth-form input{width:100%;border:1px solid #ddd3eb;border-radius:12px;padding:12px 13px;font:inherit;outline:none}
    .vx-auth-form input:focus{border-color:#7a4bd2;box-shadow:0 0 0 3px rgba(122,75,210,.1)}
    .vx-auth-submit{border:0;border-radius:13px;padding:13px;background:linear-gradient(135deg,#8255df,#6034b5);color:#fff;font-weight:900;font-size:15px;cursor:pointer}
    .vx-auth-submit:disabled{opacity:.65;cursor:not-allowed}.vx-auth-error{padding:10px 12px;border-radius:11px;background:#fff0f0;color:#c0392b;font-size:13px;font-weight:700}
    .vx-auth-switch{text-align:center;color:#777080;font-size:13px;margin:17px 0 0}.vx-auth-switch button{border:0;background:transparent;color:#7044c5;font-weight:900;cursor:pointer}
    @media(max-width:620px){.vx-auth-user .vx-logout{display:none}.vx-profile{padding:9px 11px!important}.vx-auth-actions{gap:4px}.vx-login-btn,.vx-signup-btn{padding:8px 10px;font-size:12px}}
  `;

  return (
    <div className="vx-shell">
      <style>{globalStyles + authStyles}</style>
      {page === "home" ? homePage : page === "characters" ? charactersPage : page === "practice" ? practicePage : learnPage}
      {authModal}
    </div>
  );
}

export default App;
