/**
 * Supabase 客户端
 * 密钥来自 .env（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）。
 * 未配置时 supabase 为 null，调用方需自行降级处理。
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** 是否已完成 Supabase 配置 */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.warn('[supabase] 未配置 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY，数据将仍存本地。');
}

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
