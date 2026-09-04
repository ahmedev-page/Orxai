import { encryptSecret, isAdminRequest, sessionCookie } from "./crypto";
import { getMetaPhoneNumber, verifyMetaSignature } from "./meta";
import { processIncomingMessage } from "./message-handler";
import {
  getSettings,
  getWebsiteByPublicId,
  supabaseRequest,
} from "./supabase";
import type {
  ApiKeyRow,
  Env,
  IncomingMessage,
  PlatformSettingRow,
  UserRow,
  WebsiteRow,
} from "./types";

const memoryLoginAttempts = new Map<string, { count: number; resetAt: number }>();
const loginWindowSeconds = 15 * 60;
const loginMaxAttempts = 5;

function json(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

function corsHeaders(env: Env, request: Request): Record<string, string> {
  const origin = request.headers.get("Origin");
  const allowed = (env.FRONTEND_URL || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return {
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "Content-Type",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,OPTIONS",
    ...(origin && allowed.includes(origin) ? { "access-control-allow-origin": origin } : {}),
  };
}

function withCors(response: Response, env: Env, request: Request): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(env, request))) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const value = (await request.json()) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
}

async function rateLimitLogin(env: Env, address: string): Promise<{
  limited: boolean;
  retryAfter?: number;
}> {
  const now = Math.floor(Date.now() / 1000);
  const key = `login:${address}`;
  let current: { count: number; resetAt: number } | null = null;
  if (env.MANFAZ_RATE_LIMIT) {
    current = await env.MANFAZ_RATE_LIMIT.get<{ count: number; resetAt: number }>(key, "json");
  } else {
    current = memoryLoginAttempts.get(address) ?? null;
  }
  if (current && current.resetAt > now && current.count >= loginMaxAttempts) {
    return { limited: true, retryAfter: current.resetAt - now };
  }
  return { limited: false };
}

async function recordLoginFailure(env: Env, address: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const key = `login:${address}`;
  const existing = env.MANFAZ_RATE_LIMIT
    ? await env.MANFAZ_RATE_LIMIT.get<{ count: number; resetAt: number }>(key, "json")
    : memoryLoginAttempts.get(address);
  const record =
    existing && existing.resetAt > now
      ? { count: existing.count + 1, resetAt: existing.resetAt }
      : { count: 1, resetAt: now + loginWindowSeconds };
  if (env.MANFAZ_RATE_LIMIT) {
    await env.MANFAZ_RATE_LIMIT.put(key, JSON.stringify(record), {
      expirationTtl: loginWindowSeconds,
    });
  } else {
    memoryLoginAttempts.set(address, record);
  }
}

async function clearLoginFailures(env: Env, address: string): Promise<void> {
  if (env.MANFAZ_RATE_LIMIT) await env.MANFAZ_RATE_LIMIT.delete(`login:${address}`);
  else memoryLoginAttempts.delete(address);
}

async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  if (!await isAdminRequest(request, env.SESSION_SECRET)) {
    return json({ error: "Admin authentication required" }, 401);
  }
  return null;
}

function publicUser(user: UserRow, websiteCount: number) {
  return {
    id: user.id,
    phoneNumber: user.phone_number,
    freeMessagesUsed: user.free_messages_used,
    freeMessagesLimit: user.free_messages_limit,
    websiteCount,
    createdAt: user.created_at,
  };
}

function maskKey(value: string): string {
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 4)}${"•".repeat(12)}${value.slice(-4)}`;
}

function publicKey(key: ApiKeyRow) {
  return {
    id: key.id,
    provider: key.provider,
    maskedKey: maskKey(key.key_string),
    status: key.status,
    lastUsedAt: key.last_used_at,
  };
}

async function handlePublic(request: Request, env: Env, pathname: string): Promise<Response> {
  if (pathname === "/api/public/settings/whatsapp" && request.method === "GET") {
    const settings = await getSettings(env);
    let whatsappNumber = settings.whatsapp_number || "";
    if (!whatsappNumber && env.META_WHATSAPP_TOKEN && env.META_PHONE_NUMBER_ID) {
      whatsappNumber = await getMetaPhoneNumber(env);
    }
    return json({
      whatsappNumber,
      frontendUrl: settings.frontend_url || env.FRONTEND_URL || "http://localhost",
    });
  }

  const websiteMatch = pathname.match(/^\/api\/public\/websites\/([^/]+)$/);
  if (websiteMatch && request.method === "GET") {
    const website = await getWebsiteByPublicId(env, websiteMatch[1]);
    if (!website) return json({ error: "Website not found" }, 404);
    return json({
      id: website.id,
      publicId: website.public_id,
      siteName: website.site_name,
      templateId: website.template_id,
      themeColor: website.theme_color,
      jsonStructure: website.json_structure,
      createdAt: website.created_at,
      updatedAt: website.updated_at,
    });
  }
  return json({ error: "Not found" }, 404);
}

async function handleAdmin(request: Request, env: Env, pathname: string): Promise<Response> {
  if (pathname === "/api/admin/login" && request.method === "POST") {
    const address = request.headers.get("CF-Connecting-IP") || "unknown";
    const limit = await rateLimitLogin(env, address);
    if (limit.limited) {
      return json({ error: "Too many login attempts. Try again later." }, 429, {
        "retry-after": String(limit.retryAfter),
      });
    }
    const body = await readJson(request);
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || password !== env.ADMIN_PASSWORD) {
      await recordLoginFailure(env, address);
      return json({ error: "Invalid admin password" }, 401);
    }
    await clearLoginFailures(env, address);
    const sameSite = request.headers.get("Origin") && env.FRONTEND_URL !== request.headers.get("Origin")
      ? "none"
      : "lax";
    return json({ authenticated: true }, 200, {
      "set-cookie": await sessionCookie(env.SESSION_SECRET, sameSite),
    });
  }

  const authenticationError = await requireAdmin(request, env);
  if (authenticationError) return authenticationError;

  if (pathname === "/api/admin/summary" && request.method === "GET") {
    const [users, websites, keys, settings] = await Promise.all([
      supabaseRequest<UserRow[]>(env, "users?select=id,free_messages_used"),
      supabaseRequest<WebsiteRow[]>(env, "websites?select=id"),
      supabaseRequest<ApiKeyRow[]>(env, "api_keys?status=eq.active&select=id"),
      getSettings(env),
    ]);
    return json({
      totalUsers: users.length,
      totalWebsites: websites.length,
      messagesUsed: users.reduce((sum, user) => sum + Number(user.free_messages_used), 0),
      activeApiKeys: keys.length,
      whatsappConfigured: Boolean(settings.whatsapp_number),
    });
  }

  if (pathname === "/api/admin/whatsapp/status" && request.method === "GET") {
    const settings = await getSettings(env);
    const phoneNumberId = env.META_PHONE_NUMBER_ID || settings.meta_phone_number_id || null;
    if (!phoneNumberId || !env.META_WHATSAPP_TOKEN) {
      return json({
        connected: false,
        phoneNumberId,
        displayName: null,
        message: "أضف بيانات Meta Cloud API في متغيرات البيئة.",
      });
    }
    const response = await fetch(
      `https://graph.facebook.com/${env.META_GRAPH_VERSION || "v20.0"}/${encodeURIComponent(phoneNumberId)}?fields=display_phone_number,verified_name`,
      { headers: { Authorization: `Bearer ${env.META_WHATSAPP_TOKEN}` } },
    );
    if (!response.ok) {
      return json({
        connected: false,
        phoneNumberId,
        displayName: null,
        message: "تعذر الاتصال بـ Meta Cloud API.",
      });
    }
    const data = (await response.json()) as { display_phone_number?: string; verified_name?: string };
    return json({
      connected: true,
      phoneNumberId,
      displayName: data.verified_name || data.display_phone_number || null,
      message: "متصل وجاهز لاستقبال الرسائل.",
    });
  }

  if (pathname === "/api/admin/users" && request.method === "GET") {
    const [users, websites] = await Promise.all([
      supabaseRequest<UserRow[]>(env, "users?select=* &order=created_at.desc".replace(" ", "")),
      supabaseRequest<WebsiteRow[]>(env, "websites?select=id,user_id"),
    ]);
    const counts = new Map<string, number>();
    for (const website of websites) counts.set(website.user_id, (counts.get(website.user_id) || 0) + 1);
    return json(users.map((user) => publicUser(user, counts.get(user.id) || 0)));
  }

  const quotaMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/quota$/);
  if (quotaMatch && request.method === "PATCH") {
    const body = await readJson(request);
    const delta = typeof body.delta === "number" && Number.isInteger(body.delta) ? body.delta : NaN;
    if (!Number.isInteger(delta) || delta < -1000 || delta > 1000) {
      return json({ error: "Invalid quota delta" }, 400);
    }
    const users = await supabaseRequest<UserRow[]>(
      env,
      `users?id=eq.${encodeURIComponent(quotaMatch[1])}&select=*`,
    );
    if (!users[0]) return json({ error: "User not found" }, 404);
    const nextLimit = Math.max(0, users[0].free_messages_limit + delta);
    const updated = await supabaseRequest<UserRow[]>(
      env,
      `users?id=eq.${encodeURIComponent(quotaMatch[1])}`,
      { method: "PATCH", body: JSON.stringify({ free_messages_limit: nextLimit }) },
    );
    const websites = await supabaseRequest<WebsiteRow[]>(
      env,
      `websites?user_id=eq.${encodeURIComponent(quotaMatch[1])}&select=id`,
    );
    return json(publicUser(updated[0] || { ...users[0], free_messages_limit: nextLimit }, websites.length));
  }

  if (pathname === "/api/admin/api-keys" && request.method === "GET") {
    const keys = await supabaseRequest<ApiKeyRow[]>(env, "api_keys?select=*&order=id.desc");
    return json(keys.map(publicKey));
  }
  if (pathname === "/api/admin/api-keys" && request.method === "POST") {
    const body = await readJson(request);
    if (typeof body.key !== "string" || body.key.length < 10) return json({ error: "Invalid API key" }, 400);
    const keys = await supabaseRequest<ApiKeyRow[]>(env, "api_keys", {
      method: "POST",
      body: JSON.stringify({ key_string: await encryptSecret(env.SESSION_SECRET, body.key) }),
    });
    return json(publicKey(keys[0]), 201);
  }

  const keyMatch = pathname.match(/^\/api\/admin\/api-keys\/([^/]+)$/);
  if (keyMatch && request.method === "PATCH") {
    const body = await readJson(request);
    if (body.status !== "active" && body.status !== "disabled") return json({ error: "Invalid key status" }, 400);
    const keys = await supabaseRequest<ApiKeyRow[]>(
      env,
      `api_keys?id=eq.${encodeURIComponent(keyMatch[1])}`,
      { method: "PATCH", body: JSON.stringify({ status: body.status }) },
    );
    if (!keys[0]) return json({ error: "API key not found" }, 404);
    return json(publicKey(keys[0]));
  }

  if (pathname === "/api/admin/settings" && request.method === "GET") {
    const settings = await supabaseRequest<PlatformSettingRow[]>(
      env,
      "platform_settings?select=key,value&order=key.asc",
    );
    return json(settings.map(({ key, value }) => ({ key, value })));
  }
  if (pathname === "/api/admin/settings" && request.method === "PUT") {
    const body = await readJson(request);
    if (!Array.isArray(body.settings)) return json({ error: "Invalid settings" }, 400);
    for (const setting of body.settings) {
      if (!setting || typeof setting !== "object" || typeof setting.key !== "string" || typeof setting.value !== "string") {
        return json({ error: "Invalid setting" }, 400);
      }
      await supabaseRequest(env, "platform_settings?on_conflict=key", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ key: setting.key, value: setting.value }),
      });
    }
    const settings = await supabaseRequest<PlatformSettingRow[]>(
      env,
      "platform_settings?select=key,value&order=key.asc",
    );
    return json(settings.map(({ key, value }) => ({ key, value })));
  }

  return json({ error: "Not found" }, 404);
}

async function handleWebhook(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "GET") {
    if (
      url.searchParams.get("hub.mode") === "subscribe" &&
      url.searchParams.get("hub.verify_token") === env.META_VERIFY_TOKEN
    ) {
      return new Response(url.searchParams.get("hub.challenge") || "", { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const body = await request.arrayBuffer();
  if (!await verifyMetaSignature(env, body, request.headers.get("x-hub-signature-256"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const payload = JSON.parse(new TextDecoder().decode(body)) as {
    entry?: Array<{ changes?: Array<{ value?: { messages?: IncomingMessage[] } }> }>;
  };
  const messages = payload.entry?.flatMap((entry) =>
    entry.changes?.flatMap((change) => change.value?.messages || []) || [],
  ) || [];
  if (env.WHATSAPP_QUEUE) {
    for (const message of messages) await env.WHATSAPP_QUEUE.send({ message });
  } else {
    context.waitUntil(Promise.all(messages.map((message) => processIncomingMessage(env, message))));
  }
  return new Response("EVENT_RECEIVED", { status: 200 });
}

const worker = {
  async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }), env, request);
      if (url.pathname === "/webhook") return withCors(await handleWebhook(request, env, context), env, request);
      if (url.pathname === "/api/healthz") return withCors(json({ status: "ok" }), env, request);
      const response = url.pathname.startsWith("/api/admin/")
        ? await handleAdmin(request, env, url.pathname)
        : await handlePublic(request, env, url.pathname);
      return withCors(response, env, request);
    } catch (error) {
      if (error instanceof Response) return withCors(error, env, request);
      console.error(error);
      return withCors(json({ error: "Internal server error" }, 500), env, request);
    }
  },

  async queue(batch: MessageBatch<{ message: IncomingMessage }>, env: Env): Promise<void> {
    for (const item of batch.messages) await processIncomingMessage(env, item.body.message);
  },
};

export default worker;