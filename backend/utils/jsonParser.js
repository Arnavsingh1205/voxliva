function cleanJson(text = "") {
  let cleaned = String(text).trim();

  // Markdown code fences remove karo
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Agar response ke around extra text aa gaya ho
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error("Invalid JSON response from AI.");
  }
}

export { cleanJson };
export default cleanJson;