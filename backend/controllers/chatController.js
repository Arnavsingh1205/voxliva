import { callGroq } from "../services/groqService.js";

/*
|--------------------------------------------------------------------------
| Groq Structured Output Schema
|--------------------------------------------------------------------------
*/

const chatSchema = {
  name: "voxliva_chat_response",
  strict: true,

  schema: {
    type: "object",

    properties: {
      reply: {
        type: "string",
        description:
          "The natural spoken reply from the AI character.",
      },

      question: {
        type: "string",
        description:
          "Exactly one short question for the learner.",
      },

      options: {
        type: "array",
        description:
          "Exactly five natural English answer suggestions.",
        items: {
          type: "string",
        },
      },
    },

    required: [
      "reply",
      "question",
      "options",
    ],

    additionalProperties: false,
  },
};

/*
|--------------------------------------------------------------------------
| Character Personalities
|--------------------------------------------------------------------------
*/

const characterPersonalities = {
  Maya:
    "Friendly, patient and supportive. Speak naturally like a helpful English practice partner.",

  Ryan:
    "Confident and professional. Act like a realistic job interviewer.",

  Sophia:
    "Casual, friendly and energetic. Speak naturally like a college student.",

  Daniel:
    "Professional, calm and practical. Focus on workplace conversations.",

  Emma:
    "Fun, relaxed and friendly. Speak naturally like a close friend.",

  Alex:
    "Natural and realistic. Simulate conversations with someone the user has just met.",
};

/*
|--------------------------------------------------------------------------
| Normalize Conversation History
|--------------------------------------------------------------------------
*/

function normalizeHistory(history = []) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .slice(-12)
    .map((item) => {
      const role =
        item?.role === "assistant" ||
        item?.sender === "ai"
          ? "assistant"
          : "user";

      const content =
        item?.content ||
        item?.text ||
        item?.message ||
        "";

      return {
        role,
        content: String(content).trim(),
      };
    })
    .filter((item) => item.content);
}

/*
|--------------------------------------------------------------------------
| Build Normal Conversation System Prompt
|--------------------------------------------------------------------------
*/

function buildSystemPrompt({
  character,
  mode,
  userName,
  isFirstTurn,
}) {
  const personality =
    characterPersonalities[character] ||
    "Friendly, natural and supportive English conversation partner.";

  const nameInstruction = userName
    ? `The learner's name is ${userName}. Use their name naturally when appropriate. Do not repeat their name in every response.`
    : "Do not invent or assume the learner's name.";

  const introductionInstruction = isFirstTurn
    ? `This is the first turn. Briefly introduce yourself as ${character} and greet the learner naturally. Keep the introduction short.`
    : `This is NOT the first turn. Never introduce yourself again. Do not say "Hi, I'm ${character}" or repeat your introduction. Continue the existing conversation naturally.`;

  return `
You are ${character}, an AI English speaking partner in Voxliva.

Conversation mode:
${mode || "Daily Conversation"}

Personality:
${personality}

${nameInstruction}

${introductionInstruction}

IMPORTANT OUTPUT RULES:
- Return ONLY the structured response requested by the schema.
- Do not write Markdown.
- Do not write JSON inside a code block.
- Do not add explanations outside the requested fields.

Conversation rules:
- Speak naturally and conversationally.
- Help the learner practice English.
- Do not sound robotic.
- Do not restart the conversation on every turn.
- Respond directly to what the learner actually said.
- Give exactly ONE new question.
- Give exactly FIVE useful answer suggestions.
- Every suggestion must be a complete natural English sentence.
- Suggestions should be relevant to the question.
- The learner may ignore the suggestions and speak their own answer.
- Keep the response concise enough for spoken conversation.
- Do not provide grammar analysis here.
- Grammar analysis is handled separately.
- Do not repeat the same question unnecessarily.
`;
}

/*
|--------------------------------------------------------------------------
| Chat Controller
|--------------------------------------------------------------------------
*/

async function chatController(req, res) {
  try {
    const {
      character = "Maya",
      mode = "Daily Conversation",
      message = "",
      userName = "",
      start = false,
      history = [],
    } = req.body || {};

    /*
    |--------------------------------------------------------------------------
    | Safe Input Values
    |--------------------------------------------------------------------------
    */

    const safeCharacter =
      String(character).trim() || "Maya";

    const safeMode =
      String(mode).trim() || "Daily Conversation";

    const safeMessage =
      String(message).trim();

    const safeUserName =
      String(userName).trim();

    const safeHistory =
      normalizeHistory(history);

    /*
    |--------------------------------------------------------------------------
    | First Turn Detection
    |--------------------------------------------------------------------------
    */

    const isFirstTurn =
      Boolean(start) ||
      safeHistory.length === 0;

    /*
    |--------------------------------------------------------------------------
    | Grammar Teaching Mode
    |--------------------------------------------------------------------------
    */

    if (safeMode === "Grammar Teaching") {
      const messages = [
        {
          role: "system",
          content: `
You are Voxliva's English Grammar Teacher.

Teach English grammar in simple and beginner-friendly language.

For every learner message:

1. Explain the grammar point clearly.
2. Give a simple example.
3. Give one corrected example if needed.
4. Ask one short practice question.

Important output rules:

- Return only the structured response.
- Do not use Markdown.
- Do not use code blocks.
- Keep explanations short.
- Avoid unnecessary technical terminology.
- The "reply" field should contain the grammar explanation.
- The "question" field should contain one practice question.
- The "options" field should contain exactly five possible answers.
`,
        },

        ...safeHistory,

        {
          role: "user",
          content:
            safeMessage ||
            "Teach me an important English grammar rule.",
        },
      ];

      const data = await callGroq({
        messages,
        schema: chatSchema,
        maxCompletionTokens: 500,
      });

      return res.json({
        success: true,
        character: safeCharacter,
        mode: safeMode,
        reply: data.reply,
        question: data.question,
        options: Array.isArray(data.options)
          ? data.options.slice(0, 5)
          : [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Hindi → English Mode
    |--------------------------------------------------------------------------
    */

    if (safeMode === "Hindi to English") {
      const messages = [
        {
          role: "system",
          content: `
You are Voxliva's Hindi/Hinglish to Natural English teacher.

The learner may write in:

- Hindi
- Hinglish
- Mixed Hindi and English

Your job is to help the learner speak natural English.

For every learner message:

1. Convert the learner's sentence into natural spoken English.
2. Explain the correction briefly.
3. Give an alternative natural version when useful.
4. Give one useful pronunciation or usage tip.
5. Ask one short practice question.

Important output rules:

- Return only the structured response.
- Do not use Markdown.
- Do not use code blocks.
- Keep the response concise.
- The "reply" field should contain the explanation and natural English sentence.
- The "question" field should contain one practice question.
- The "options" field should contain exactly five natural English answers.
`,
        },

        ...safeHistory,

        {
          role: "user",
          content:
            safeMessage ||
            "Mujhe English bolna practice karna hai.",
        },
      ];

      const data = await callGroq({
        messages,
        schema: chatSchema,
        maxCompletionTokens: 500,
      });

      return res.json({
        success: true,
        character: safeCharacter,
        mode: safeMode,
        reply: data.reply,
        question: data.question,
        options: Array.isArray(data.options)
          ? data.options.slice(0, 5)
          : [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Normal Conversation Mode
    |--------------------------------------------------------------------------
    */

    const systemPrompt =
      buildSystemPrompt({
        character: safeCharacter,
        mode: safeMode,
        userName: safeUserName,
        isFirstTurn,
      });

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },

      ...safeHistory,
    ];

    /*
    |--------------------------------------------------------------------------
    | Add Learner Message
    |--------------------------------------------------------------------------
    |
    | On the first turn, the frontend may send an empty message
    | so that Maya starts the conversation herself.
    |
    */

    if (safeMessage) {
      messages.push({
        role: "user",
        content: safeMessage,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Call Groq
    |--------------------------------------------------------------------------
    */

    const data = await callGroq({
      messages,
      schema: chatSchema,
      maxCompletionTokens: 1000,
    });

    /*
    |--------------------------------------------------------------------------
    | Normalize Options
    |--------------------------------------------------------------------------
    */

    const options =
      Array.isArray(data?.options)
        ? data.options
            .map((option) =>
              String(option).trim()
            )
            .filter(Boolean)
            .slice(0, 5)
        : [];

    /*
    |--------------------------------------------------------------------------
    | Final Response
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,
      character: safeCharacter,
      mode: safeMode,
      reply: String(data?.reply || "").trim(),
      question: String(
        data?.question || ""
      ).trim(),
      options,
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Error Handling
    |--------------------------------------------------------------------------
    */

    console.error(
      "Chat controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to generate AI conversation.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
  chatController,
};

export default chatController;