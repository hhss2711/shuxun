<template>
  <div class="container book-list-container">
    <div class="book-list">
      <div
        v-for="item in books"
        :key="item.id"
        class="book-item card"
        @click="goToDetail(item.id)"
      >
        <img class="book-cover" :src="item.image" alt="" />
        <div class="book-info">
          <div class="book-top">
            <span class="book-title">{{ item.title }}</span>
            <span class="book-status">{{ item.status }}</span>
          </div>
          <div class="book-bottom">
            <span class="book-price">¥{{ item.price }}</span>
            <div class="action-btn-sm">查看详情</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="books.length === 0" class="empty-tip">
      <img class="empty-icon" src="/images/icons/question.svg" alt="" />
      <span>暂无相关图书</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getOnSaleBooks, getMyPublishedBooks, getBooksByIds } from '@/utils/bookStore';
import { listOrders } from '@/utils/orderStore';
import { getUserFavorites } from '@/utils/favoriteStore';

const route = useRoute();
const type = route.query.type || 'publish';

const FALLBACK_COVER =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20psychology%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3';

const title = ref('');
const books = ref([]);

function currentUserId() {
  return getApp()?.globalData?.userInfo?.id || '';
}

function toItem(book) {
  return {
    id: book.id,
    title: book.title,
    price: book.price,
    status: book.status || '在售',
    image: book.cover || book.image || FALLBACK_COVER
  };
}

async function load() {
  if (type === 'search') {
    title.value = '搜索结果';
    const q = String(route.query.q || '').trim().toLowerCase();
    const all = await getOnSaleBooks();
    books.value = all
      .filter((b) => {
        if (!q) return true;
        const hay = [b.title, b.courseName, b.category, b.college].join(' ').toLowerCase();
        return hay.includes(q);
      })
      .map(toItem);
  } else if (type === 'buy') {
    // 我买到的：来源于真实的拍下记录
    title.value = '我买到的';
    books.value = (await listOrders()).map((order) => ({
      id: order.bookId,
      title: order.bookTitle,
      price: order.price,
      status: '已拍下',
      image: order.bookCover || FALLBACK_COVER
    }));
  } else if (type === 'fav') {
    // 我的收藏：来源于真实的收藏记录
    title.value = '我的收藏';
    const ids = await getUserFavorites(currentUserId());
    books.value = (await getBooksByIds(ids)).map(toItem);
  } else {
    title.value = '我的发布';
    books.value = (await getMyPublishedBooks(currentUserId())).map(toItem);
  }
  wx.setNavigationBarTitle({ title: title.value });
}

onMounted(load);

function goToDetail(id) {
  wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
}
</script>

<style scoped>
.book-list-container {
  padding: 16px;
  background-color: var(--bg-color);
  min-height: 100vh;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.book-item {
  display: flex;
  padding: 12px;
  margin-bottom: 0;
  gap: 12px;
  cursor: pointer;
}

.book-cover {
  width: 70px;
  height: 90px;
  border-radius: 6px;
  background-color: #f0f0f0;
  object-fit: cover;
  flex-shrink: 0;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.book-top {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.book-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-status {
  font-size: 11px;
  color: #5856d6;
  font-weight: 500;
}

.book-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-price {
  font-size: 17px;
  font-weight: 700;
  color: #ff3b30;
}

.action-btn-sm {
  font-size: 12px;
  padding: 5px 12px;
  background-color: var(--apple-light-gray);
  color: var(--text-main);
  border-radius: 15px;
  font-weight: 600;
}

.empty-tip {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  width: 60px;
  height: 60px;
  opacity: 0.2;
}

.empty-tip span {
  font-size: 14px;
  color: var(--apple-gray);
}

@media (max-width: 767px) {
  .book-list {
    grid-template-columns: 1fr;
  }
}
</style>
