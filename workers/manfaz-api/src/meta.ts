import type { Env } from "./types";

function graphVersion(env: Env): string {
  return env.META_GRAPH_VERSION || "v20.0";
}

export async function sendTextMessage(env: Env, to: string, body: string): Promise<void> {
  const response = await fetch(
    `https://graph.facebook.com/${graphVersion(env)}/${encodeURIComponent(env.META_PHONE_NUMBER_ID)}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.META_WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: true, body },
      }),
    },
  );
  if (!response.ok) throw new Error(`Meta send failed with status ${response.status}`);
}

export async function markMessageRead(env: Env, messageId: string): Promise<void> {
  await fetch(
    `https://graph.facebook.com/${graphVersion(env)}/${encodeURIComponent(env.META_PHONE_NUMBER_ID)}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.META_WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    },
  ).catch(() => undefined);
}

export async function getMetaPhoneNumber(env: Env): Promise<string> {
  const response = await fetch(
    `https://graph.facebook.com/${graphVersion(env)}/${encodeURIComponent(env.META_PHONE_NUMBER_ID)}?fields=display_phone_number`,
    { headers: { Authorization: `Bearer ${env.META_WHATSAPP_TOKEN}` } },
  );
  if (!response.ok) return "";
  const body = (await response.json()) as { display_phone_number?: string };
  return body.display_phone_number || "";
}

export async function verifyMetaSignature(
  env: Env,
  body: ArrayBuffer,
  signature: string | null,
): Promise<boolean> {
  if (!signature?.startsWith("sha256=") || !env.META_APP_SECRET) return false;
  const actual = signature.slice("sha256=".length).toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(actual)) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.META_APP_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, body));
  const expected = Array.from(digest, (value) => value.toString(16).padStart(2, "0")).join("");
  let difference = actual.length === expected.length ? 0 : 1;
  for (let index = 0; index < Math.min(actual.length, expected.length); index += 1) {
    difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}