import { decryptSecret } from "./crypto";
import { getActiveApiKeys, markApiKeyUsed } from "./supabase";
import type { Env } from "./types";

let cursor = 0;

function extractText(body: unknown): string {
  const response = body as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return response.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
}

function parseJson(text: string): Record<string, unknown> {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Gemini did not return a JSON object");
  const value = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Gemini returned an invalid JSON object");
  }
  return value as Record<string, unknown>;
}

export async function askGemini(
  env: Env,
  prompt: string,
  json = false,
): Promise<string | Record<string, unknown>> {
  const keys = await getActiveApiKeys(env);
  if (!keys.length) throw new Error("No active Gemini API keys configured");

  let lastError: Error | undefined;
  for (let attempt = 0; attempt < keys.length; attempt += 1) {
    const index = (cursor + attempt) % keys.length;
    const apiKey = keys[index];
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL || "gemini-1.5-flash"}:generateContent?key=${encodeURIComponent(await decryptSecret(env.SESSION_SECRET, apiKey.key_string))}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: json
            ? { responseMimeType: "application/json", temperature: 0.4 }
            : { temperature: 0.7 },
        }),
      },
    );
    if (response.ok) {
      cursor = (index + 1) % keys.length;
      await markApiKeyUsed(env, apiKey.id);
      const text = extractText(await response.json());
      return json ? parseJson(text) : text;
    }
    lastError = new Error(`Gemini request failed with status ${response.status}`);
    if (response.status !== 429) break;
  }
  throw lastError ?? new Error("Gemini request failed");
}