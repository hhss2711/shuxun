/**
 * 收藏数据访问层：Supabase public.favorites
 * RLS 限制仅本人可读写，因此 userId 传他人 id 时只会得到空结果。
 */
import { supabase } from './supabaseClient';

function currentUserId() {
  return getApp()?.globalData?.userInfo?.id || '';
}

/** 添加收藏，返回是否新增加成功 */
export async function addFavorite(userId, bookId) {
  const uid = userId || currentUserId();
  if (!supabase || !uid) return false;
  const { error } = await supabase.from('favorites').insert({ user_id: uid, book_id: bookId });
  if (error) {
    // 23505 = 唯一约束冲突（已收藏）
    if (error.code !== '23505') console.warn('[favorites] 收藏失败：', error.message);
    return false;
  }
  return true;
}

/** 取消收藏 */
export async function removeFavorite(userId, bookId) {
  const uid = userId || currentUserId();
  if (!supabase || !uid) return false;
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', uid)
    .eq('book_id', bookId);
  if (error) {
    console.warn('[favorites] 取消收藏失败：', error.message);
    return false;
  }
  return true;
}

/** 是否已收藏 */
export async function isFavorited(userId, bookId) {
  const uid = userId || currentUserId();
  if (!supabase || !uid) return false;
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', uid)
    .eq('book_id', bookId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

/** 收藏的书籍 id 列表 */
export async function getUserFavorites(userId) {
  const uid = userId || currentUserId();
  if (!supabase || !uid) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('book_id, created_at')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[favorites] 读取收藏失败：', error.message);
    return [];
  }
  return (data || []).map((r) => r.book_id);
}

/** 清空收藏 */
export async function clearFavorites(userId) {
  const uid = userId || currentUserId();
  if (!supabase || !uid) return false;
  const { error } = await supabase.from('favorites').delete().eq('user_id', uid);
  return !error;
}
