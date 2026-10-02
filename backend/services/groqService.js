import "dotenv/config";
import cleanJson from "../utils/jsonParser.js";

const MODEL = "openai/gpt-oss-20b";

async function callGroq({
  messages = [],
  schema = null,
  maxCompletionTokens = 650,
}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing in .env");
  }

  const requestBody = {
    model: MODEL,
    messages,
    max_completion_tokens: maxCompletionTokens,
    include_reasoning: false,
  };

  if (schema) {
    requestBody.response_format = {
      type: "json_schema",
      json_schema: schema,
    };
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Groq API Error:", data);

    throw new Error(
      data?.error?.message ||
        data?.message ||
        `Groq API request failed with status ${response.status}`
    );
  }

  const content =
    data?.choices?.[0]?.message?.content?.trim() || "";

  if (!content) {
    console.error("Empty Groq response:", data);

    throw new Error(
      "Groq returned an empty response. Please try again."
    );
  }

  return cleanJson(content);
}

export {
  callGroq,
  MODEL,
};

export default callGroq;