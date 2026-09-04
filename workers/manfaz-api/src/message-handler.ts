import { askGemini } from "./gemini";
import { markMessageRead, sendTextMessage } from "./meta";
import {
  claimProcessedMessage,
  consumeMessageQuota,
  createWebsite,
  ensureUser,
  failProcessedMessage,
  finishProcessedMessage,
  getLatestWebsite,
  getSettings,
  updateWebsite,
} from "./supabase";
import type { Env, IncomingMessage } from "./types";

const templates = new Set(["store", "restaurant", "services", "portfolio"]);

function textFromMessage(message: IncomingMessage): string {
  return message.text?.body?.trim() ?? "";
}

function buildPrompt(text: string): string {
  return `أنت مولد مواقع عربية. حوّل طلب صاحب العمل التالي إلى JSON فقط، دون markdown، وفق هذا الشكل:
{
  "siteName": "اسم الموقع",
  "templateId": "store|restaurant|services|portfolio",
  "themeColor": "#hex",
  "jsonStructure": {
    "tagline": "جملة تعريفية",
    "description": "وصف قصير",
    "ctaLabel": "زر الإجراء",
    "phone": "",
    "items": [{"name":"","description":"","price":"","image":""}],
    "services": [{"name":"","description":""}],
    "projects": [{"title":"","description":"","image":""}],
    "hours": [{"day":"","time":""}],
    "address": ""
  }
}
املأ الحقول المناسبة فقط، واجعل النصوص عربية، واختر القالب الأنسب. طلب العميل: ${text}`;
}

function normalizeGenerated(value: Record<string, unknown>) {
  const siteName =
    typeof value.siteName === "string" && value.siteName.trim()
      ? value.siteName.trim().slice(0, 120)
      : "موقع جديد";
  const templateId =
    typeof value.templateId === "string" && templates.has(value.templateId)
      ? value.templateId
      : "services";
  const themeColor =
    typeof value.themeColor === "string" && /^#[0-9a-f]{6}$/i.test(value.themeColor)
      ? value.themeColor
      : "#e56b4e";
  const jsonStructure =
    value.jsonStructure &&
    typeof value.jsonStructure === "object" &&
    !Array.isArray(value.jsonStructure)
      ? (value.jsonStructure as Record<string, unknown>)
      : {};
  return { siteName, templateId, themeColor, jsonStructure };
}

async function handleMessage(env: Env, message: IncomingMessage): Promise<void> {
  const from = message.from;
  const text = textFromMessage(message);
  if (!from || !text || message.type !== "text" || !message.id) return;

  await markMessageRead(env, message.id);
  let user = await ensureUser(env, from);

  if (/تبق[تى]|المتبقي|رصيدي|كم.*رسالة/i.test(text)) {
    const remaining = Math.max(0, user.free_messages_limit - user.free_messages_used);
    await sendTextMessage(env, from, `متبقي لك ${remaining} رسالة مجانية من أصل ${user.free_messages_limit}.`);
    return;
  }

  const quotaUser = await consumeMessageQuota(env, user.id);
  if (!quotaUser) {
    await sendTextMessage(env, from, "انتهت رسائلك المجانية. تواصل مع الإدارة لتوسيع حصتك.");
    return;
  }
  user = quotaUser;

  const website = await getLatestWebsite(env, user.id);
  const updatePattern = /(عدّل|عدل|غيّر|غير|أضف|اضف|احذف|حسّن|حسن|تحديث)/i;
  const initialBuildPattern = /(أنشئ|انشئ|ابن[ِيى]|اصنع|سوي|سو[ِّي]|موقع)/i;
  const intent = website && updatePattern.test(text)
    ? "UPDATE"
    : initialBuildPattern.test(text)
      ? "INITIAL_BUILD"
      : "CHAT";

  if (intent === "CHAT") {
    const reply = await askGemini(env, `أجب بالعربية وباختصار وبأسلوب مساعد. رسالة العميل: ${text}`);
    await sendTextMessage(env, from, typeof reply === "string" ? reply : "وصلت رسالتك.");
    return;
  }

  if (intent === "INITIAL_BUILD") {
    await sendTextMessage(env, from, "جاري بناء موقعك الآن، أرسل لك الرابط فور اكتماله.");
    const generated = normalizeGenerated(
      (await askGemini(env, buildPrompt(text), true)) as Record<string, unknown>,
    );
    const created = await createWebsite(env, {
      user_id: user.id,
      site_name: generated.siteName,
      template_id: generated.templateId,
      theme_color: generated.themeColor,
      json_structure: generated.jsonStructure,
    });
    const settings = await getSettings(env);
    const baseUrl = (settings.frontend_url || env.FRONTEND_URL || "https://manfaz.pages.dev").replace(/\/$/, "");
    await sendTextMessage(env, from, `تم إنشاء موقعك بنجاح: ${baseUrl}/site/${created.public_id}`);
    return;
  }

  if (!website) throw new Error("Cannot update a website that does not exist");
  const updated = normalizeGenerated(
    (await askGemini(
      env,
      `عدّل JSON التالي حسب طلب العميل. أعد JSON كاملًا فقط مع الحفاظ على نفس البنية قدر الإمكان.
الطلب: ${text}
JSON الحالي: ${JSON.stringify(website.json_structure)}`,
      true,
    )) as Record<string, unknown>,
  );
  await updateWebsite(env, website.id, {
    site_name: updated.siteName,
    template_id: updated.templateId,
    theme_color: updated.themeColor,
    json_structure: updated.jsonStructure,
  });
  await sendTextMessage(env, from, "تم تحديث موقعك بنجاح. افتح نفس الرابط لرؤية التغييرات.");
}

export async function processIncomingMessage(env: Env, message: IncomingMessage): Promise<void> {
  if (!message.id || !(await claimProcessedMessage(env, message.id, message as Record<string, unknown>))) return;
  try {
    await handleMessage(env, message);
    await finishProcessedMessage(env, message.id);
  } catch (error) {
    await failProcessedMessage(env, message.id, error);
    throw error;
  }
}