/**
 * 聊天数据访问层：Supabase public.chat_messages
 * 会话由 book_id + 双方 id 推导，RLS 仅允许收发双方访问。
 */
import { supabase } from './supabaseClient';

function currentUserId() {
  return getApp()?.globalData?.userInfo?.id || '';
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapMessage(row, meId) {
  const ts = row.created_at ? Date.parse(row.created_at) : Date.now();
  return {
    id: row.id,
    role: row.sender_id === meId ? 'me' : 'other',
    content: row.content,
    timestamp: ts,
    time: formatTime(ts)
  };
}

/** 保存一条消息（发送方为当前用户） */
export async function saveMessage(bookId, otherUserId, message) {
  const meId = currentUserId();
  if (!supabase || !meId || !otherUserId) return null;
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      book_id: bookId,
      sender_id: meId,
      receiver_id: otherUserId,
      content: message.content
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[chat] 发送消息失败：', error.message);
    return null;
  }
  return mapMessage(data, meId);
}

/** 读取与某人在某本书下的全部消息 */
export async function getChatMessages(bookId, otherUserId) {
  const meId = currentUserId();
  if (!supabase || !meId || !otherUserId) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('book_id', bookId)
    .or(
      `and(sender_id.eq.${meId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${meId})`
    )
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('[chat] 读取消息失败：', error.message);
    return [];
  }
  return (data || []).map((row) => mapMessage(row, meId));
}

/** 当前用户的全部会话（按最后一条消息时间倒序） */
export async function getChatSessions() {
  const meId = currentUserId();
  if (!supabase || !meId) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .or(`sender_id.eq.${meId},receiver_id.eq.${meId}`)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('[chat] 读取会话失败：', error.message);
    return [];
  }

  const map = new Map();
  (data || []).forEach((row) => {
    const otherUserId = row.sender_id === meId ? row.receiver_id : row.sender_id;
    const key = `${row.book_id}__${otherUserId}`;
    if (!map.has(key)) {
      map.set(key, {
        id: `chat_${row.book_id}_${[meId, otherUserId].sort().join('_')}`,
        bookId: row.book_id,
        otherUserId,
        messageCount: 0,
        lastMessage: null,
        lastMessageTime: 0
      });
    }
    const session = map.get(key);
    session.messageCount += 1;
    session.lastMessage = { content: row.content, senderId: row.sender_id };
    session.lastMessageTime = row.created_at ? Date.parse(row.created_at) : 0;
  });

  return [...map.values()].sort((a, b) => b.lastMessageTime - a.lastMessageTime);
}
