import { callGroq } from "../services/groqService.js";

function clampScore(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        const text =
          item.explanation ||
          item.message ||
          item.reason ||
          item.mistake ||
          item.error ||
          Object.values(item)
            .filter((v) => typeof v === "string")
            .join(" → ");

        return String(text || "").trim();
      }

      return String(item || "").trim();
    })
    .filter(Boolean);
}

async function analyzeController(req, res) {
  try {
    const {
      character = "",
      mode = "",
      question = "",
      answer = "",
      userName = "",
    } = req.body || {};

    const safeCharacter = String(character).trim();
    const safeMode = String(mode).trim();
    const safeQuestion = String(question).trim();
    const safeAnswer = String(answer).trim();
    const safeUserName = String(userName).trim();

    if (!safeAnswer) {
      return res.status(400).json({
        success: false,
        message: "Answer is required.",
      });
    }

    const messages = [
      {
        role: "system",
        content: `
You are Voxliva's strict but fair English speaking evaluator.

Evaluate the learner's answer against the AI question.

PRIMARY GRAMMAR CHECKS — actively look for real errors in:
1. Verb tense and tense consistency
2. Prepositions
3. Articles: a, an, the
4. Sentence structure and word order
5. Subject-verb agreement
6. Wrong or unnatural word usage
7. Plural/singular noun usage
8. Pronoun usage
9. Auxiliary/modal verb usage
10. Natural English phrasing

IMPORTANT SCORING RULES:
- Do NOT penalize commas, full stops, question marks, exclamation marks, or capitalization.
- Treat punctuation as irrelevant for grammar correctness unless the meaning itself becomes unclear without it.
- A short answer is not automatically wrong.
- A simple sentence can receive a high score when it is correct and natural.
- Do not invent mistakes.
- Only report genuine grammar, vocabulary, fluency, or naturalness problems.
- Judge the answer according to the question and the intended meaning.
- Do not mark an answer wrong merely because another wording is more advanced.
- correctedSentence should preserve the learner's intended meaning while making the English natural.
- mistakes must contain short, useful explanations, not generic labels.
- grammarFeedback should mention the specific grammar category that needs work when a real error exists.
- fluencyFeedback should focus on natural flow, repetition, hesitation, or awkward construction — not punctuation.
- vocabularyFeedback should focus on wrong word choice, limited vocabulary, or unnatural word combinations.
- Scores are integers from 0 to 100.

CORRECTNESS:
- isCorrect may be true only when the answer is grammatically acceptable and naturally answers the question.
- Do not use punctuation or capitalization as a reason to make isCorrect false.
- Do not make isCorrect true just because the meaning is understandable if there is a clear grammar error.

Return ONLY valid JSON with exactly these fields:
{
  "isCorrect": true,
  "correctedSentence": "string",
  "mistakes": [],
  "practiceSentence": "string",
  "practiceTip": "string",
  "grammarScore": 85,
  "fluencyScore": 85,
  "vocabularyScore": 80,
  "grammarFeedback": "string",
  "fluencyFeedback": "string",
  "vocabularyFeedback": "string"
}

Every field is required.
Do not use Markdown or code fences.
`,
      },
      {
        role: "user",
        content: `
Character: ${safeCharacter || "AI English Partner"}
Conversation mode: ${safeMode || "Daily Conversation"}
Learner name: ${safeUserName || "Not provided"}

AI question:
${safeQuestion || "No question provided"}

Learner answer:
${safeAnswer}
`,
      },
    ];

    const analysis = await callGroq({
      messages,
      jsonMode: true,
      maxCompletionTokens: 1200,
    });

    const normalizedAnalysis = {
      isCorrect: analysis?.isCorrect === true,

      correctedSentence: String(
        analysis?.correctedSentence || safeAnswer
      ).trim(),

      mistakes: cleanStringArray(analysis?.mistakes),

      practiceSentence: String(
        analysis?.practiceSentence ||
          analysis?.correctedSentence ||
          safeAnswer
      ).trim(),

      practiceTip: String(
        analysis?.practiceTip ||
          "Say the corrected sentence aloud and try it again."
      ).trim(),

      grammarScore: clampScore(analysis?.grammarScore),
      fluencyScore: clampScore(analysis?.fluencyScore),
      vocabularyScore: clampScore(analysis?.vocabularyScore),

      grammarFeedback: String(
        analysis?.grammarFeedback ||
          "Check your tense, sentence structure, articles, prepositions, and subject-verb agreement."
      ).trim(),

      fluencyFeedback: String(
        analysis?.fluencyFeedback ||
          "Try to speak smoothly and use natural sentence patterns."
      ).trim(),

      vocabularyFeedback: String(
        analysis?.vocabularyFeedback ||
          "Use words that fit the intended meaning and context naturally."
      ).trim(),
    };

    normalizedAnalysis.isCorrect =
      normalizedAnalysis.grammarScore >= 80 &&
      normalizedAnalysis.fluencyScore >= 70 &&
      normalizedAnalysis.vocabularyScore >= 65;

    return res.json({
      success: true,
      analysis: normalizedAnalysis,
      feedback: normalizedAnalysis,
    });
  } catch (error) {
    console.error("Analyze controller error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to analyze the answer.",
    });
  }
}

export { analyzeController };
export default analyzeController;
