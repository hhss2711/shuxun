<template>
  <div class="container">
    <!-- 1. User Card -->
    <div class="user-card card">
      <!-- 分享按钮 -->
      <div class="share-btn" @click="onShare">
        <img class="share-icon" src="/images/icons/share.svg" alt="" />
      </div>
      <div class="user-main">
        <img class="avatar" :src="user.avatarUrl" alt="" />
        <div class="info-content">
          <div class="nickname">
            {{ user.nickName }}
            <div v-if="isCurrentUser" class="current-user-badge">本人</div>
          </div>
          <div class="detail-row">
            <img class="row-icon" src="/images/icons/business.png" alt="" />
            <span>{{ user.college }} · {{ user.grade }} · {{ user.major || '未知专业' }}</span>
          </div>
          <div class="detail-row">
            <img class="row-icon" src="/images/icons/home.png" alt="" />
            <span>{{ user.campus }} · {{ user.location || '未知位置' }}</span>
          </div>
          <div v-if="user.joinDate" class="detail-row">
            <span class="row-icon">📅</span>
            <span>{{ user.joinDate }}加入书循</span>
          </div>
          <div v-if="user.description" class="detail-row">
            <span class="row-icon">📝</span>
            <span>{{ user.description }}</span>
          </div>

          <!-- 用户标签 -->
          <div v-if="user.tags && user.tags.length > 0" class="user-tags">
            <div v-for="tag in user.tags" :key="tag" class="user-tag">
              {{ tag }}
            </div>
          </div>

          <div class="credit-row">
            <div class="credit-badge">信用值：{{ user.creditScore }}</div>
            <div class="deal-count">成交 {{ user.dealCount }} 单</div>
          </div>
        </div>
      </div>

      <!-- 用户统计信息 -->
      <div v-if="userStatistics" class="user-stats">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-value">{{ userStatistics.totalPublished || 0 }}</span>
            <span class="stat-label">发布</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userStatistics.totalSold || 0 }}</span>
            <span class="stat-label">售出</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userStatistics.totalPurchased || 0 }}</span>
            <span class="stat-label">购买</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userStatistics.successRate || 0 }}%</span>
            <span class="stat-label">成交率</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Tabs -->
    <div class="tabs-container">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'selling' }"
        @click="switchTab('selling')"
      >
        在售物品 ({{ sellingBooks.length }})
        <div v-if="activeTab === 'selling'" class="active-bar"></div>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'sold' }"
        @click="switchTab('sold')"
      >
        已售物品 ({{ soldBooks.length }})
        <div v-if="activeTab === 'sold'" class="active-bar"></div>
      </div>
    </div>

    <!-- 3. Books Grid -->
    <div class="product-grid">
      <div
        v-for="item in displayBooks"
        :key="item.id"
        class="product-card"
        @click="goToDetail(item.id)"
      >
        <div class="image-wrapper">
          <img class="product-image" :src="item.image" alt="" />
          <div v-if="activeTab === 'sold'" class="sold-overlay">
            <span>已售出</span>
          </div>
        </div>
        <div class="product-info">
          <div class="product-title">{{ item.title }}</div>
          <div class="product-tags">
            <span class="tag-item condition">{{ item.condition }}</span>
            <span class="tag-item location">{{ item.location }}</span>
          </div>
          <div class="product-footer">
            <div class="price-box">
              <span class="currency">¥</span>
              <span class="price">{{ item.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Empty State -->
    <div v-if="displayBooks.length === 0" class="empty-state">
      <img class="empty-icon" src="/images/icons/goods.png" alt="" />
      <span>暂无相关书籍</span>
    </div>

    <!-- 5. Actions -->
    <div class="bottom-actions">
      <button class="chat-btn" @click="onChat">私聊 Ta</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchProfileById, initAuth, getUser } from '@/utils/authStore';
import { getMyPublishedBooks, ON_SALE, DELISTED, SOLD } from '@/utils/bookStore';

const route = useRoute();

// 原页面读取 options.id（调用方实际传 userId），此处兼容两者
const userId = String(route.query.id ?? route.query.userId ?? '');

const activeTab = ref('selling');

const user = ref({
  id: '',
  nickName: '',
  avatarUrl: '',
  college: '',
  grade: '',
  creditScore: 0,
  dealCount: 0,
  campus: '',
  major: '',
  joinDate: '',
  description: '',
  location: '',
  tags: []
});

const userStatistics = ref({});
const sellingBooks = ref([]);
const soldBooks = ref([]);
const isCurrentUser = ref(false);

const displayBooks = computed(() =>
  activeTab.value === 'selling' ? sellingBooks.value : soldBooks.value
);

function toItem(book) {
  return {
    id: book.id,
    title: book.title,
    image: book.cover || '',
    price: book.price,
    condition: book.condition,
    location: book.location
  };
}

async function load() {
  await initAuth();

  const profile = userId ? await fetchProfileById(userId) : null;
  if (profile) user.value = { ...user.value, ...profile };

  isCurrentUser.value = Boolean(userId) && userId === getUser().id;

  const published = userId ? await getMyPublishedBooks(userId) : [];
  sellingBooks.value = published
    .filter((b) => b.status === ON_SALE || b.status === DELISTED)
    .map(toItem);
  soldBooks.value = published.filter((b) => b.status === SOLD).map(toItem);

  const totalPublished = published.length;
  const totalSold = soldBooks.value.length;
  userStatistics.value = {
    totalPublished,
    totalSold,
    totalPurchased: user.value.dealCount || 0,
    successRate: totalPublished ? Math.round((totalSold / totalPublished) * 100) : 0
  };

  wx.setNavigationBarTitle({ title: `${user.value.nickName}的主页` });
}

onMounted(load);

function switchTab(tab) {
  activeTab.value = tab;
}

function onShare() {
  // 原页面 wxml 绑定了 onShare 但未实现，此处降级为提示
  wx.showToast({ title: '分享功能开发中', icon: 'none' });
}

function onChat() {
  wx.navigateTo({ url: `/pages/chat/chat?otherUserId=${user.value.id}` });
}

function goToDetail(id) {
  if (activeTab.value === 'selling') {
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  } else {
    wx.showToast({ title: '已售书籍无法查看详情', icon: 'none' });
  }
}
</script>

<style scoped>
.container {
  padding: 16px;
  background-color: #faf9f6;
  min-height: 100vh;
  padding-bottom: 60px;
}

.share-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
}

.share-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

.user-card {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
}

.user-main {
  display: flex;
  align-items: center;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 35px;
  background-color: #f2f2f7;
  margin-right: 16px;
}

.info-content {
  flex: 1;
}

.nickname {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.current-user-badge {
  font-size: 11px;
  font-weight: 600;
  color: #07c160;
  background: rgba(7, 193, 96, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px solid rgba(7, 193, 96, 0.2);
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.row-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-right: 6px;
  opacity: 0.5;
  font-size: 12px;
}

.detail-row span {
  font-size: 14px;
  color: #8e8e93;
}

.credit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credit-badge {
  background: rgba(26, 26, 26, 0.05);
  color: #1a1a1a;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
}

.deal-count {
  font-size: 12px;
  color: #8e8e93;
}

/* 用户标签 */
.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 8px 0;
}

.user-tag {
  font-size: 10px;
  color: #007aff;
  background: rgba(0, 122, 255, 0.1);
  padding: 3px 6px;
  border-radius: 8px;
  border: 1px solid rgba(0, 122, 255, 0.2);
}

/* 用户统计信息 */
.user-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-row {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 16px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: #8e8e93;
}

/* Tabs */
.tabs-container {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  background-color: #faf9f6;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  position: relative;
  padding: 12px 0;
  margin-right: 24px;
  font-size: 15px;
  color: #8e8e93;
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
}

.tab-item.active {
  color: #1a1a1a;
  font-weight: 700;
}

.active-bar {
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 3px;
  background-color: #1a1a1a;
  border-radius: 1.5px;
}

/* Product Grid Adjustments */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 0 16px;
  gap: 12px;
}

.product-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  cursor: pointer;
}

.sold-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.sold-overlay span {
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(2px);
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.tag-item {
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 3px;
  font-weight: 600;
}

.tag-item.condition {
  color: #a66b74;
  background-color: #fdcfd5;
}

.tag-item.location {
  color: #4a7a80;
  background-color: #d4f2f5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 50px;
}

.empty-icon {
  width: 60px;
  height: 60px;
  opacity: 0.1;
  margin-bottom: 12px;
}

.empty-state span {
  font-size: 14px;
  color: #c7c7cc;
}

.image-wrapper {
  position: relative;
  padding-top: 100%;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 10px;
}

.product-title {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
  height: 40px;
}

.price-box {
  display: flex;
  align-items: baseline;
  color: #ff5a5f;
}

.currency {
  font-size: 12px;
  font-weight: 600;
}

.price {
  font-size: 16px;
  font-weight: 700;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px 20px;
  background: rgba(250, 249, 246, 0.8);
  backdrop-filter: blur(10px);
}

.chat-btn {
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 25px;
  height: 45px;
  line-height: 45px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  width: 100%;
  cursor: pointer;
}

/* 移动端：底部操作栏上移，避免与底部 tab 栏重叠 */
@media (max-width: 767px) {
  .bottom-actions {
    bottom: 56px;
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
}
</style>
