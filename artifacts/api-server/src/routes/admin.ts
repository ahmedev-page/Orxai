import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, apiKeysTable, platformSettingsTable, usersTable, websitesTable } from "@workspace/db";
import {
  AdminLoginBody,
  AdminLoginResponse,
  CreateAdminApiKeyBody,
  CreateAdminApiKeyResponse,
  GetAdminSummaryResponse,
  ListAdminApiKeysResponse,
  ListAdminSettingsResponse,
  ListAdminUsersResponse,
  UpdateAdminApiKeyBody,
  UpdateAdminApiKeyParams,
  UpdateAdminApiKeyResponse,
  UpdateAdminSettingsBody,
  UpdateAdminSettingsResponse,
  UpdateUserQuotaBody,
  UpdateUserQuotaParams,
  UpdateUserQuotaResponse,
} from "@workspace/api-zod";
import { requireAdmin, setAdminSession } from "../lib/admin-auth";
import { getMetaGraphVersion } from "../lib/meta";
import { encryptSecret } from "../lib/secret-box";

const router: IRouter = Router();
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

function maskedKey(value: string): string {
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 4)}${"•".repeat(12)}${value.slice(-4)}`;
}

function publicUser(user: typeof usersTable.$inferSelect, websiteCount: number) {
  return {
    id: user.id.toString(),
    phoneNumber: user.phoneNumber,
    freeMessagesUsed: user.freeMessagesUsed,
    freeMessagesLimit: user.freeMessagesLimit,
    websiteCount,
    createdAt: user.createdAt,
  };
}

function publicKey(key: typeof apiKeysTable.$inferSelect) {
  return {
    id: key.id.toString(),
    provider: key.provider,
    maskedKey: maskedKey(key.keyString),
    status: key.status,
    lastUsedAt: key.lastUsedAt,
  };
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const now = Date.now();
  const address = req.ip || req.socket.remoteAddress || "unknown";
  const current = loginAttempts.get(address);
  if (current && current.resetAt > now && current.count >= LOGIN_MAX_ATTEMPTS) {
    res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
    res.status(429).json({ error: "Too many login attempts. Try again later." });
    return;
  }
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || parsed.data.password !== expected) {
    const next = current && current.resetAt > now
      ? { count: current.count + 1, resetAt: current.resetAt }
      : { count: 1, resetAt: now + LOGIN_WINDOW_MS };
    loginAttempts.set(address, next);
    res.status(401).json({ error: "Invalid admin password" });
    return;
  }
  loginAttempts.delete(address);
  setAdminSession(res);
  res.json(AdminLoginResponse.parse({ authenticated: true }));
});

router.use("/admin", requireAdmin);

router.get("/admin/summary", async (_req, res): Promise<void> => {
  const [users, websites, messages, keys, whatsapp] = await Promise.all([
    db.select({ value: sql<number>`count(*)` }).from(usersTable),
    db.select({ value: sql<number>`count(*)` }).from(websitesTable),
    db.select({ value: sql<number>`coalesce(sum(${usersTable.freeMessagesUsed}), 0)` }).from(usersTable),
    db.select({ value: sql<number>`count(*)` }).from(apiKeysTable).where(eq(apiKeysTable.status, "active")),
    db.select().from(platformSettingsTable).where(eq(platformSettingsTable.key, "whatsapp_number")),
  ]);
  res.json(
    GetAdminSummaryResponse.parse({
      totalUsers: Number(users[0]?.value ?? 0),
      totalWebsites: Number(websites[0]?.value ?? 0),
      messagesUsed: Number(messages[0]?.value ?? 0),
      activeApiKeys: Number(keys[0]?.value ?? 0),
      whatsappConfigured: Boolean(whatsapp[0]?.value),
    }),
  );
});

router.get("/admin/whatsapp/status", async (_req, res): Promise<void> => {
  const settings = await db
    .select()
    .from(platformSettingsTable)
    .where(eq(platformSettingsTable.key, "meta_phone_number_id"));
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID || settings[0]?.value || null;
  const token = process.env.META_WHATSAPP_TOKEN;

  if (!phoneNumberId || !token) {
    res.json({
      connected: false,
      phoneNumberId,
      displayName: null,
      message: "أضف بيانات Meta Cloud API في متغيرات البيئة.",
    });
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/${getMetaGraphVersion()}/${encodeURIComponent(phoneNumberId)}?fields=display_phone_number,verified_name`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) {
    res.json({
      connected: false,
      phoneNumberId,
      displayName: null,
      message: "تعذر الاتصال بـ Meta Cloud API.",
    });
    return;
  }
  const data = (await response.json()) as { display_phone_number?: string; verified_name?: string };
  res.json({
    connected: true,
    phoneNumberId,
    displayName: data.verified_name || data.display_phone_number || null,
    message: "متصل وجاهز لاستقبال الرسائل.",
  });
});

router.get("/admin/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  const websiteCounts = await db
    .select({ userId: websitesTable.userId, count: sql<number>`count(*)` })
    .from(websitesTable)
    .groupBy(websitesTable.userId);
  const countByUser = new Map(websiteCounts.map((row) => [row.userId.toString(), Number(row.count)]));
  res.json(ListAdminUsersResponse.parse(users.map((user) => publicUser(user, countByUser.get(user.id.toString()) ?? 0))));
});

router.patch("/admin/users/:id/quota", async (req, res): Promise<void> => {
  const params = UpdateUserQuotaParams.safeParse(req.params);
  const parsed = UpdateUserQuotaBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set({ freeMessagesLimit: sql`${usersTable.freeMessagesLimit} + ${parsed.data.delta}` })
    .where(eq(usersTable.id, params.data.id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const websiteCount = await db.select({ count: sql<number>`count(*)` }).from(websitesTable).where(eq(websitesTable.userId, user.id));
  res.json(UpdateUserQuotaResponse.parse(publicUser(user, Number(websiteCount[0]?.count ?? 0))));
});

router.get("/admin/api-keys", async (_req, res): Promise<void> => {
  const keys = await db.select().from(apiKeysTable).orderBy(desc(apiKeysTable.lastUsedAt));
  res.json(ListAdminApiKeysResponse.parse(keys.map(publicKey)));
});

router.post("/admin/api-keys", async (req, res): Promise<void> => {
  const parsed = CreateAdminApiKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [key] = await db
    .insert(apiKeysTable)
    .values({ keyString: encryptSecret(parsed.data.key) })
    .returning();
  res.status(201).json(CreateAdminApiKeyResponse.parse(publicKey(key)));
});

router.patch("/admin/api-keys/:id", async (req, res): Promise<void> => {
  const params = UpdateAdminApiKeyParams.safeParse(req.params);
  const parsed = UpdateAdminApiKeyBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [key] = await db.update(apiKeysTable).set({ status: parsed.data.status }).where(eq(apiKeysTable.id, params.data.id)).returning();
  if (!key) {
    res.status(404).json({ error: "API key not found" });
    return;
  }
  res.json(UpdateAdminApiKeyResponse.parse(publicKey(key)));
});

router.get("/admin/settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(platformSettingsTable).orderBy(platformSettingsTable.key);
  res.json(ListAdminSettingsResponse.parse(settings.map(({ key, value }) => ({ key, value }))));
});

router.put("/admin/settings", async (req, res): Promise<void> => {
  const parsed = UpdateAdminSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  for (const setting of parsed.data.settings) {
    await db
      .insert(platformSettingsTable)
      .values({ key: setting.key, value: setting.value })
      .onConflictDoUpdate({ target: platformSettingsTable.key, set: { value: setting.value } });
  }
  const settings = await db.select().from(platformSettingsTable).orderBy(platformSettingsTable.key);
  res.json(UpdateAdminSettingsResponse.parse(settings.map(({ key, value }) => ({ key, value }))));
});

export default router;