import apiRequest from "./api";

async function sendChat({
  character,
  mode,
  message = "",
  userName = "",
  start = false,
  history = [],
}) {
  return apiRequest("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      character,
      mode,
      message,
      userName,
      start,
      history,
    }),
  });
}

async function startChat({
  character,
  mode,
  userName = "",
}) {
  return sendChat({
    character,
    mode,
    userName,
    start: true,
    history: [],
  });
}

async function sendConversationMessage({
  character,
  mode,
  message,
  userName = "",
  history = [],
}) {
  return sendChat({
    character,
    mode,
    message,
    userName,
    start: false,
    history,
  });
}

async function teachGrammar({
  message,
  userName = "",
  history = [],
}) {
  return sendChat({
    character: "Maya",
    mode: "Grammar Teaching",
    message,
    userName,
    history,
  });
}

async function translateHindiToEnglish({
  message,
  userName = "",
  history = [],
}) {
  return sendChat({
    character: "Maya",
    mode: "Hindi to English",
    message,
    userName,
    history,
  });
}

export {
  sendChat,
  startChat,
  sendConversationMessage,
  teachGrammar,
  translateHindiToEnglish,
};