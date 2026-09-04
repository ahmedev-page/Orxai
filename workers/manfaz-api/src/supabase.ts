import type {
  ApiKeyRow,
  Env,
  PlatformSettingRow,
  UserRow,
  WebsiteRow,
} from "./types";

function baseUrl(env: Env): string {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase Worker secrets are incomplete");
  }
  return env.SUPABASE_URL.replace(/\/$/, "");
}

export async function supabaseRequest<T>(
  env: Env,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${baseUrl(env)}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${errorText}`);
  }
  const body = await response.text();
  return (body ? JSON.parse(body) : []) as T;
}

export async function supabaseRpc<T>(
  env: Env,
  name: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${baseUrl(env)}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase RPC failed (${response.status}): ${errorText}`);
  }
  const bodyText = await response.text();
  return (bodyText ? JSON.parse(bodyText) : []) as T;
}

export async function ensureUser(env: Env, phone: string): Promise<UserRow> {
  const existing = await supabaseRequest<UserRow[]>(
    env,
    `users?phone_number=eq.${encodeURIComponent(phone)}&select=*&limit=1`,
  );
  if (existing[0]) return existing[0];

  await supabaseRequest<UserRow[]>(
    env,
    "users?on_conflict=phone_number",
    {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ phone_number: phone }),
    },
  );
  const created = await supabaseRequest<UserRow[]>(
    env,
    `users?phone_number=eq.${encodeURIComponent(phone)}&select=*&limit=1`,
  );
  if (!created[0]) throw new Error("Unable to create or load WhatsApp user");
  return created[0];
}

export async function consumeMessageQuota(env: Env, userId: string): Promise<UserRow | null> {
  const result = await supabaseRpc<UserRow[]>(env, "consume_message_quota", {
    p_user_id: userId,
  });
  return result[0] ?? null;
}

export async function getLatestWebsite(env: Env, userId: string): Promise<WebsiteRow | null> {
  const rows = await supabaseRequest<WebsiteRow[]>(
    env,
    `websites?user_id=eq.${encodeURIComponent(userId)}&select=*&order=updated_at.desc&limit=1`,
  );
  return rows[0] ?? null;
}

export async function getWebsiteByPublicId(
  env: Env,
  publicId: string,
): Promise<WebsiteRow | null> {
  const rows = await supabaseRequest<WebsiteRow[]>(
    env,
    `websites?public_id=eq.${encodeURIComponent(publicId)}&select=*&limit=1`,
  );
  return rows[0] ?? null;
}

export async function createWebsite(
  env: Env,
  data: Omit<WebsiteRow, "id" | "user_id" | "public_id" | "created_at" | "updated_at"> & {
    user_id: string;
  },
): Promise<WebsiteRow> {
  const rows = await supabaseRequest<WebsiteRow[]>(env, "websites", {
    method: "POST",
    body: JSON.stringify({
      user_id: data.user_id,
      site_name: data.site_name,
      template_id: data.template_id,
      theme_color: data.theme_color,
      json_structure: data.json_structure,
    }),
  });
  if (!rows[0]) throw new Error("Website creation returned no row");
  return rows[0];
}

export async function updateWebsite(
  env: Env,
  websiteId: string,
  data: Pick<WebsiteRow, "site_name" | "template_id" | "theme_color" | "json_structure">,
): Promise<void> {
  await supabaseRequest(env, `websites?id=eq.${encodeURIComponent(websiteId)}`, {
    method: "PATCH",
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  });
}

export async function getActiveApiKeys(env: Env): Promise<ApiKeyRow[]> {
  return supabaseRequest<ApiKeyRow[]>(
    env,
    "api_keys?provider=eq.gemini&status=eq.active&select=*&order=id.asc",
  );
}

export async function markApiKeyUsed(env: Env, id: string): Promise<void> {
  await supabaseRequest(env, `api_keys?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ last_used_at: new Date().toISOString() }),
  });
}

export async function getSettings(env: Env): Promise<Record<string, string>> {
  const rows = await supabaseRequest<PlatformSettingRow[]>(
    env,
    "platform_settings?select=key,value",
  );
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function claimProcessedMessage(
  env: Env,
  messageId: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  return supabaseRpc<boolean>(env, "claim_processed_message", {
    p_message_id: messageId,
    p_payload: payload,
  });
}

export async function finishProcessedMessage(env: Env, messageId: string): Promise<void> {
  await supabaseRequest(env, `processed_messages?message_id=eq.${encodeURIComponent(messageId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "processed",
      processed_at: new Date().toISOString(),
      last_error: null,
    }),
  });
}

export async function failProcessedMessage(
  env: Env,
  messageId: string,
  error: unknown,
): Promise<void> {
  await supabaseRequest(env, `processed_messages?message_id=eq.${encodeURIComponent(messageId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "failed",
      last_error: error instanceof Error ? error.message.slice(0, 500) : "Unknown error",
    }),
  });
}