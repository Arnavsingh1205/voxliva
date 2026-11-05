import { callGroq } from "../services/groqService.js";

/*
|--------------------------------------------------------------------------
| Score Helper
|--------------------------------------------------------------------------
*/

function clampScore(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

/*
|--------------------------------------------------------------------------
| Array Helper
|--------------------------------------------------------------------------
*/

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
        return (
          item.explanation ||
          item.message ||
          item.description ||
          item.mistake ||
          item.correction ||
          Object.values(item)
            .filter((v) => typeof v === "string")
            .join(" → ")
        ).trim();
      }

      return String(item || "").trim();
    })
    .filter(Boolean);
}

/*
|--------------------------------------------------------------------------
| Analyze Controller
|--------------------------------------------------------------------------
*/

async function analyzeController(req, res) {
  try {
    const {
      character = "",
      mode = "",
      question = "",
      answer = "",
      userName = "",
    } = req.body || {};

    const safeCharacter =
      String(character).trim();

    const safeMode =
      String(mode).trim();

    const safeQuestion =
      String(question).trim();

    const safeAnswer =
      String(answer).trim();

    const safeUserName =
      String(userName).trim();

    /*
    |--------------------------------------------------------------------------
    | Validate Answer
    |--------------------------------------------------------------------------
    */

    if (!safeAnswer) {
      return res.status(400).json({
        success: false,
        message: "Answer is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | AI Prompt
    |--------------------------------------------------------------------------
    */

    const messages = [
      {
        role: "system",

        content: `
You are Voxliva's English speaking evaluator.

Your job is to evaluate a learner's English answer.

Evaluate:

1. Grammar
2. Fluency and naturalness
3. Vocabulary

IMPORTANT:

- A short answer is NOT automatically wrong.
- A simple sentence can still receive a high score.
- Do not invent mistakes.
- Only mention real grammar or language problems.
- Judge the answer according to the question.
- If the answer clearly answers the question and is grammatically acceptable, isCorrect should be true.
- correctedSentence should be the most natural version of the learner's answer.
- If the learner's sentence is already natural, keep it almost the same.
- mistakes must contain short useful explanations.
- practiceSentence should help the learner practice.
- practiceTip should be short and practical.
- Scores must be numbers from 0 to 100.

VERY IMPORTANT:

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use code fences.
Do NOT write any explanation outside JSON.

Use EXACTLY this JSON structure:

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

Every field MUST be present.
Do not omit any field.
`,
      },

      {
        role: "user",

        content: `
Character: ${
          safeCharacter || "AI English Partner"
        }

Conversation mode: ${
          safeMode || "Daily Conversation"
        }

Learner name: ${
          safeUserName || "Not provided"
        }

AI question:
${
  safeQuestion ||
  "No question provided"
}

Learner answer:
${safeAnswer}
`,
      },
    ];

    /*
    |--------------------------------------------------------------------------
    | Call Groq
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | We intentionally DO NOT send a json_schema here.
    | This prevents the Groq structured-output schema
    | mismatch error.
    |
    */

    const analysis = await callGroq({
      messages,

      // No schema here

      maxCompletionTokens: 1200,
    });

    /*
    |--------------------------------------------------------------------------
    | Normalize AI Response
    |--------------------------------------------------------------------------
    */

    const normalizedAnalysis = {
      isCorrect:
        analysis?.isCorrect === true,

      correctedSentence:
        String(
          analysis?.correctedSentence ||
            safeAnswer
        ).trim(),

      mistakes:
        cleanStringArray(
          analysis?.mistakes
        ),

      practiceSentence:
        String(
          analysis?.practiceSentence ||
            analysis?.correctedSentence ||
            safeAnswer
        ).trim(),

      practiceTip:
        String(
          analysis?.practiceTip ||
            "Try saying the corrected sentence aloud."
        ).trim(),

      grammarScore:
        clampScore(
          analysis?.grammarScore
        ),

      fluencyScore:
        clampScore(
          analysis?.fluencyScore
        ),

      vocabularyScore:
        clampScore(
          analysis?.vocabularyScore
        ),

      grammarFeedback:
        String(
          analysis?.grammarFeedback ||
            "Your grammar is understandable. Keep practicing sentence structure."
        ).trim(),

      fluencyFeedback:
        String(
          analysis?.fluencyFeedback ||
            "Try to speak smoothly and naturally."
        ).trim(),

      vocabularyFeedback:
        String(
          analysis?.vocabularyFeedback ||
            "Keep learning and using new everyday words."
        ).trim(),
    };

    /*
    |--------------------------------------------------------------------------
    | Calculate Correctness Safely
    |--------------------------------------------------------------------------
    */

    if (
      normalizedAnalysis.grammarScore >= 80 &&
      normalizedAnalysis.fluencyScore >= 70 &&
      normalizedAnalysis.vocabularyScore >= 65
    ) {
      normalizedAnalysis.isCorrect = true;
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,

      analysis: normalizedAnalysis,

      // Keep this because your current frontend
      // already supports feedback.
      feedback: normalizedAnalysis,
    });
  } catch (error) {
    console.error(
      "Analyze controller error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Failed to analyze the answer.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
  analyzeController,
};

export default analyzeController;