/**
 * 书籍简要信息查询（基于 Supabase books 表）
 * 供聊天、消息、收藏、拍下确认等页面复用。
 */
import { getBookById } from './bookStore';

/** 按 id 读取书籍简要信息；不存在时返回 null */
export async function getBookBriefById(id) {
  const book = await getBookById(id);
  if (!book) return null;
  return {
    id: book.id,
    title: book.title,
    price: book.price,
    cover: book.cover,
    sellerId: book.sellerId,
    sellerName: book.sellerName,
    sellerAvatar: book.sellerAvatar,
    status: book.status
  };
}
