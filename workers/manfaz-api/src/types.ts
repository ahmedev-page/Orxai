export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  FRONTEND_URL: string;
  SESSION_SECRET: string;
  ADMIN_PASSWORD: string;
  META_WHATSAPP_TOKEN: string;
  META_PHONE_NUMBER_ID: string;
  META_VERIFY_TOKEN: string;
  META_APP_SECRET: string;
  META_GRAPH_VERSION?: string;
  GEMINI_MODEL?: string;
  WHATSAPP_QUEUE?: Queue<QueueMessage>;
  MANFAZ_RATE_LIMIT?: KVNamespace;
}

export interface IncomingMessage {
  id?: string;
  from?: string;
  type?: string;
  text?: { body?: string };
}

export interface QueueMessage {
  message: IncomingMessage;
}

export interface UserRow {
  id: string;
  phone_number: string;
  free_messages_used: number;
  free_messages_limit: number;
  created_at: string;
}

export interface WebsiteRow {
  id: string;
  user_id: string;
  public_id: string;
  site_name: string;
  template_id: string;
  theme_color: string;
  json_structure: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyRow {
  id: string;
  provider: string;
  key_string: string;
  status: "active" | "disabled";
  last_used_at: string | null;
}

export interface PlatformSettingRow {
  id?: string;
  key: string;
  value: string;
}