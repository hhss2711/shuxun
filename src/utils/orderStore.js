/**
 * 订单数据访问层：Supabase public.orders
 * 买家拍下即锁定商品，平台不参与收款，付款与交货由买卖双方自行完成。
 */
import { supabase } from './supabaseClient';

function currentUserId() {
  return getApp()?.globalData?.userInfo?.id || '';
}

function mapOrder(row, nameMap = {}) {
  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: row.book_title || '',
    bookCover: row.book_cover || '',
    price: Number(row.price) || 0,
    sellerId: row.seller_id,
    buyerId: row.buyer_id,
    sellerName: nameMap[row.seller_id] || '卖家',
    buyerName: nameMap[row.buyer_id] || '买家',
    meetupNote: row.meetup_note || '',
    status: row.status || 'reserved',
    createdAt: row.created_at ? Date.parse(row.created_at) : 0
  };
}

async function attachNames(rows) {
  if (!rows.length) return [];
  const ids = [...new Set(rows.flatMap((r) => [r.buyer_id, r.seller_id]).filter(Boolean))];
  const nameMap = {};
  if (ids.length) {
    const { data, error } = await supabase.from('profiles').select('id, nick_name').in('id', ids);
    if (error) console.warn('[orders] 读取用户昵称失败：', error.message);
    (data || []).forEach((p) => {
      nameMap[p.id] = p.nick_name || '';
    });
  }
  return rows.map((r) => mapOrder(r, nameMap));
}

/** 拍下：创建订单 */
export async function createOrder({
  bookId,
  bookTitle,
  bookCover,
  goodsPrice,
  sellerId,
  meetupNote
}) {
  const buyerId = currentUserId();
  if (!supabase || !buyerId) throw new Error('请先登录后再拍下');
  const { data, error } = await supabase
    .from('orders')
    .insert({
      book_id: bookId,
      buyer_id: buyerId,
      seller_id: sellerId,
      book_title: bookTitle,
      book_cover: bookCover,
      price: Number(Number(goodsPrice).toFixed(2)),
      meetup_note: meetupNote || null,
      status: 'reserved'
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapOrder(data);
}

/** 我买到的（当前用户作为买家） */
export async function listOrders() {
  const uid = currentUserId();
  if (!supabase || !uid) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', uid)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[orders] 读取我的订单失败：', error.message);
    return [];
  }
  return attachNames(data || []);
}

/** 我卖出的（当前用户作为卖家） */
export async function listSoldOrders() {
  const uid = currentUserId();
  if (!supabase || !uid) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('seller_id', uid)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[orders] 读取卖出订单失败：', error.message);
    return [];
  }
  return attachNames(data || []);
}
