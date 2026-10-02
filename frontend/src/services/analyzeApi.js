import apiRequest from "./api";

async function analyzeAnswer({
  character = "",
  mode = "",
  question = "",
  answer = "",
  userName = "",
}) {
  const data = await apiRequest("/api/analyze", {
    method: "POST",
    body: JSON.stringify({
      character,
      mode,
      question,
      answer,
      userName,
    }),
  });

  // Backend currently supports both
  // `analysis` and `feedback`.
  return data?.analysis || data?.feedback || null;
}

export {
  analyzeAnswer,
};

export default analyzeAnswer;