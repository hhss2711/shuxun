/**
 * 书本数据访问层：Supabase public.books
 * 全部为异步接口（返回 Promise），调用方需要 await。
 * 未配置后端时退化为本地示例书目（仅用于离线预览）。
 */
import { supabase } from './supabaseClient';
import { mockBooks } from './mockBooks';

export const ON_SALE = '在售';
export const DELISTED = '已下架';
export const SOLD = '已售出';

function currentUserId() {
  return getApp()?.globalData?.userInfo?.id || '';
}

/** 由课程类型推导首页分类 */
export function deriveCategory(courseType) {
  if (!courseType) return '其他';
  if (courseType.includes('通识')) return '通识课';
  if (courseType.includes('专业')) return '专业课';
  if (courseType.includes('考研')) return '考研资料';
  if (courseType.includes('英语')) return '英语四六级';
  if (courseType.includes('课辅')) return '课辅资料';
  return '其他';
}

/** 把数据库行映射为页面使用的书籍结构 */
export function mapBook(row, sellerMap = {}) {
  const seller = sellerMap[row.seller_id] || {};
  const images = Array.isArray(row.images) ? row.images : [];
  const cover = row.cover || images[0] || '';
  const sellerName = seller.nick_name || '匿名用户';
  const sellerAvatar = seller.avatar_url || '/images/icons/avatar.png';
  return {
    id: row.id,
    title: row.title,
    author: row.author || '',
    cover,
    image: cover,
    price: Number(row.price) || 0,
    originalPrice: row.original_price != null ? Number(row.original_price) : 0,
    description: row.description || '',
    condition: row.condition || '',
    category: row.category || '',
    location: row.location || '',
    campus: row.campus || '',
    college: row.college || '',
    grade: row.grade || '',
    semester: row.semester || '',
    courseType: row.course_type || '',
    courseName: row.course_name || '',
    images: images.length ? images : cover ? [cover] : [],
    status: row.status || ON_SALE,
    sellerId: row.seller_id,
    sellerName,
    sellerAvatar,
    publishTime: row.created_at ? Date.parse(row.created_at) : 0,
    isSameArea: false,
    distance: '校内',
    user: { id: row.seller_id, name: sellerName, avatar: sellerAvatar }
  };
}

/** 批量补全卖家昵称/头像（books 与 profiles 之间没有外键，需手动拼接） */
async function attachSellers(rows) {
  if (!rows.length) return [];
  const ids = [...new Set(rows.map((r) => r.seller_id).filter(Boolean))];
  const sellerMap = {};
  if (ids.length) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nick_name, avatar_url')
      .in('id', ids);
    if (error) console.warn('[books] 读取卖家资料失败：', error.message);
    (data || []).forEach((p) => {
      sellerMap[p.id] = p;
    });
  }
  return rows.map((r) => mapBook(r, sellerMap));
}

/* ---------------- 读取 ---------------- */

/** 首页 / 搜索：全部「在售」商品 */
export async function getOnSaleBooks() {
  if (!supabase) return mockBooks;
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('status', ON_SALE)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[books] 读取在售商品失败：', error.message);
    return [];
  }
  return attachSellers(data || []);
}

/** 当前用户发布的书（我卖出的） */
export async function getMyPublishedBooks(userId) {
  const uid = userId || currentUserId();
  if (!supabase || !uid) return [];
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('seller_id', uid)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[books] 读取我的发布失败：', error.message);
    return [];
  }
  return (data || []).map((r) => mapBook(r));
}

/** 按 id 读取单本 */
export async function getBookById(bookId) {
  if (!bookId && bookId !== 0) return null;
  if (!supabase) return mockBooks.find((b) => b.id === Number(bookId)) || null;
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .maybeSingle();
  if (error) {
    console.warn('[books] 读取商品失败：', error.message);
    return null;
  }
  if (!data) return null;
  const [book] = await attachSellers([data]);
  return book;
}

/** 按 id 批量读取（用于收藏列表等） */
export async function getBooksByIds(ids) {
  const list = (ids || []).filter((id) => id || id === 0);
  if (!supabase || !list.length) return [];
  const { data, error } = await supabase.from('books').select('*').in('id', list);
  if (error) {
    console.warn('[books] 批量读取商品失败：', error.message);
    return [];
  }
  const mapped = await attachSellers(data || []);
  const order = new Map(list.map((id, i) => [String(id), i]));
  return mapped.sort((a, b) => order.get(String(a.id)) - order.get(String(b.id)));
}

/* ---------------- 写入 ---------------- */

function toBookRow(bookData) {
  const images = Array.isArray(bookData.images) ? bookData.images : [];
  return {
    title: bookData.title,
    author: bookData.author || null,
    cover: bookData.cover || images[0] || null,
    price: Number(bookData.price) || 0,
    original_price: bookData.originalPrice ? Number(bookData.originalPrice) : null,
    description: bookData.description || null,
    condition: bookData.condition || null,
    category: bookData.category || deriveCategory(bookData.courseType),
    location: bookData.location || null,
    campus: bookData.campus || null,
    college: bookData.college || null,
    grade: bookData.grade || null,
    semester: bookData.semester || null,
    course_type: bookData.courseType || null,
    course_name: bookData.courseName || null,
    images
  };
}

/** 发布新书；返回映射后的书籍 */
export async function publishBook(bookData) {
  const uid = currentUserId();
  if (!supabase || !uid) throw new Error('请先登录后再发布');
  const { data, error } = await supabase
    .from('books')
    .insert({ ...toBookRow(bookData), seller_id: uid, status: ON_SALE })
    .select('*')
    .single();
  if (error) throw error;
  return mapBook(data);
}

/** 编辑已有书籍（仅卖家本人可改） */
export async function updatePublishedBook(bookId, bookData) {
  const uid = currentUserId();
  if (!supabase || !uid) throw new Error('请先登录后再保存');
  const { data, error } = await supabase
    .from('books')
    .update({ ...toBookRow(bookData), updated_at: new Date().toISOString() })
    .eq('id', bookId)
    .eq('seller_id', uid)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? mapBook(data) : null;
}

/** 更新书籍状态（在售 / 已下架 / 已售出） */
export async function updateBookStatus(bookId, newStatus) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('books')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', bookId);
  if (error) {
    console.warn('[books] 更新状态失败：', error.message);
    return false;
  }
  return true;
}

/** 是否已下架（含被拍下） */
export async function isBookDelisted(bookId) {
  const book = await getBookById(bookId);
  return !book || book.status !== ON_SALE;
}

/** 下架（被拍下后调用） */
export function delistBook(bookId) {
  return updateBookStatus(bookId, DELISTED);
}

/** 重新上架（卖家操作） */
export function relistBook(bookId) {
  return updateBookStatus(bookId, ON_SALE);
}

/** 删除发布 */
export async function deletePublishedBook(bookId, userId) {
  const uid = userId || currentUserId();
  if (!supabase || !uid) return false;
  const { error } = await supabase.from('books').delete().eq('id', bookId).eq('seller_id', uid);
  if (error) {
    console.warn('[books] 删除失败：', error.message);
    return false;
  }
  return true;
}
