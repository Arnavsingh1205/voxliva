import callGroq from "../services/groqService.js";

// ------------------------------------
// START AI TEST
// ------------------------------------
const startAiTest = async (req, res) => {
  try {
    const mode = String(
      req.body?.mode || "Conversation"
    ).trim();

    const schema = {
      name: "english_test",
      strict: true,
      schema: {
        type: "object",
        properties: {
          q1: { type: "string" },
          q2: { type: "string" },
          q3: { type: "string" },
          q4: { type: "string" },
          q5: { type: "string" }
        },
        required: [
          "q1",
          "q2",
          "q3",
          "q4",
          "q5"
        ],
        additionalProperties: false
      }
    };

    const result = await callGroq({
      messages: [
        {
          role: "user",
          content: `
Create an English test for a learner.

Test type: ${mode}

Generate exactly 5 questions.

Rules:
- Every question must be in English.
- Questions must be short and clear.
- Questions must be suitable for an English learner.
- Questions should test practical communication.
- Difficulty should be beginner to intermediate.
- Do not provide answers.
- Do not provide explanations.

Return exactly:
q1 = first question
q2 = second question
q3 = third question
q4 = fourth question
q5 = fifth question
`
        }
      ],
      schema,
      maxCompletionTokens: 1200,
      reasoningEffort: "low"
    });

    console.log("AI Test generated:", result);

    const questions = [
      result?.q1,
      result?.q2,
      result?.q3,
      result?.q4,
      result?.q5
    ]
      .filter(
        (question) =>
          typeof question === "string"
      )
      .map((question) => question.trim())
      .filter(Boolean);

    if (questions.length !== 5) {
      return res.status(500).json({
        success: false,
        message:
          "AI did not generate exactly 5 valid questions."
      });
    }

    return res.json({
      success: true,
      mode,
      questions
    });

  } catch (error) {
    console.error(
      "AI Test start error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to generate AI test."
    });
  }
};


// ------------------------------------
// EVALUATE AI TEST
// ------------------------------------
const evaluateAiTest = async (req, res) => {
  try {
    const {
      mode,
      questions,
      answers
    } = req.body || {};

    if (
      !Array.isArray(questions) ||
      !Array.isArray(answers) ||
      questions.length !== 5 ||
      answers.length !== 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exactly 5 questions and 5 answers are required."
      });
    }

    const prompt = `
You are an expert English teacher.

Evaluate a student's English test.

Test type:
${mode || "General English"}

There are exactly 5 questions.

QUESTIONS:
${questions
  .map(
    (q, i) =>
      `${i + 1}. ${q}`
  )
  .join("\n")}

STUDENT ANSWERS:
${answers
  .map(
    (a, i) =>
      `${i + 1}. ${a || "(No answer)"}`
  )
  .join("\n")}

Evaluate each answer based on:
- Grammar
- Meaning
- Relevance
- Natural English
- Communication quality

Important:
- Give credit when the student's answer is grammatically different but still correct.
- Do not require one exact sentence.
- Minor spelling mistakes should not automatically make an answer incorrect.
- Judge the answer according to the question.
- Each question is worth exactly 1 mark.

Return:
- score out of 5
- percentage
- feedback for every question
- ideal natural answer for every question
`;

    const schema = {
      name: "english_test_result",
      strict: true,
      schema: {
        type: "object",
        properties: {
          score: {
            type: "integer"
          },
          percentage: {
            type: "integer"
          },
          q1_correct: {
            type: "boolean"
          },
          q1_feedback: {
            type: "string"
          },
          q1_ideal: {
            type: "string"
          },
          q2_correct: {
            type: "boolean"
          },
          q2_feedback: {
            type: "string"
          },
          q2_ideal: {
            type: "string"
          },
          q3_correct: {
            type: "boolean"
          },
          q3_feedback: {
            type: "string"
          },
          q3_ideal: {
            type: "string"
          },
          q4_correct: {
            type: "boolean"
          },
          q4_feedback: {
            type: "string"
          },
          q4_ideal: {
            type: "string"
          },
          q5_correct: {
            type: "boolean"
          },
          q5_feedback: {
            type: "string"
          },
          q5_ideal: {
            type: "string"
          }
        },

        required: [
          "score",
          "percentage",

          "q1_correct",
          "q1_feedback",
          "q1_ideal",

          "q2_correct",
          "q2_feedback",
          "q2_ideal",

          "q3_correct",
          "q3_feedback",
          "q3_ideal",

          "q4_correct",
          "q4_feedback",
          "q4_ideal",

          "q5_correct",
          "q5_feedback",
          "q5_ideal"
        ],

        additionalProperties: false
      }
    };

    const result = await callGroq({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      schema,
      maxCompletionTokens: 1800,
      reasoningEffort: "low"
    });

    console.log(
      "AI Test evaluation:",
      result
    );

    return res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(
      "AI Test evaluation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to evaluate AI test."
    });
  }
};


export {
  startAiTest,
  evaluateAiTest
};

export default startAiTest;