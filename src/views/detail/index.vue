<template>
  <div class="detail-container">
    <!-- Images -->
    <div class="product-swiper">
      <div v-for="(img, idx) in product.images" :key="idx" class="swiper-item">
        <img class="swiper-image" :src="img" alt="" />
      </div>
    </div>

    <div class="content-section container">
      <!-- User Info -->
      <div class="user-card card" @click="goToUserDetail">
        <div class="user-left">
          <img class="user-avatar" :src="product.user.avatar" alt="" />
          <div class="user-text">
            <div class="user-name">{{ product.user.name }}</div>
            <div class="user-school">{{ product.user.school }}</div>
          </div>
        </div>
        <div class="btn-secondary follow-btn">关注</div>
      </div>

      <!-- Product Info -->
      <div class="product-main card">
        <div class="price-box">
          <span class="currency">¥</span>
          <span class="price">{{ product.price }}</span>
          <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
          <div class="detail-tags">
            <div class="tag-item condition">{{ product.condition }}</div>
            <div class="tag-item location">{{ product.location }}</div>
          </div>
        </div>
        <div class="title">{{ product.title }}</div>

        <!-- Course Binding Info -->
        <div v-if="product.courseName" class="course-binding card">
          <div class="binding-title">适用课程</div>
          <div class="binding-grid">
            <div class="binding-item">
              <span class="binding-label">课程名称</span>
              <span class="binding-value">{{ product.courseName }}</span>
            </div>
            <div class="binding-item">
              <span class="binding-label">适用年级</span>
              <span class="binding-value">{{ product.grade }}</span>
            </div>
            <div class="binding-item">
              <span class="binding-label">所属学院</span>
              <span class="binding-value">{{ product.college }}</span>
            </div>
          </div>
        </div>

        <div class="desc-title">书籍描述</div>
        <div class="desc">{{ product.desc }}</div>
        <div class="meta">
          <span>分类: {{ product.category }}</span>
          <span>浏览: {{ product.views }}</span>
        </div>
      </div>
    </div>

    <!-- 卖家专属操作栏 -->
    <div v-if="isSeller" class="seller-actions-section container">
      <div class="seller-actions-title">
        <span>📊 卖家管理面板</span>
        <div class="seller-badge">卖家</div>
      </div>

      <div class="seller-status-control">
        <div class="status-control-title">当前状态：</div>
        <div class="status-buttons">
          <div v-if="product.status !== '在售'" class="status-btn" @click="onRelist">
            重新上架
          </div>
          <div v-if="product.status === '在售'" class="status-btn" @click="onMarkDelisted">
            标记为已下架
          </div>
          <div v-if="product.status !== '已售出'" class="status-btn" @click="onMarkSold">
            标记为已售出
          </div>
        </div>
      </div>

      <div class="seller-action-buttons">
        <div class="seller-action-btn edit" @click="onEditBook">
          <span class="action-icon">✏️</span>
          <span>编辑信息</span>
        </div>
        <div class="seller-action-btn refresh" @click="onRefreshExposure">
          <span class="action-icon">🔄</span>
          <span>刷新曝光</span>
        </div>
        <div class="seller-action-btn stats" @click="onViewStats">
          <span class="action-icon">📊</span>
          <span>查看统计</span>
        </div>
        <div class="seller-action-btn delete" @click="onDeleteBook">
          <span class="action-icon">🗑️</span>
          <span>删除发布</span>
        </div>
      </div>
    </div>

    <!-- Bottom Bar (根据身份显示不同) -->
    <div class="bottom-bar">
      <div class="action-icons">
        <div v-if="!isSeller" class="icon-btn" @click="toggleFav">
          <span class="icon">{{ isFav ? '❤️' : '🤍' }}</span>
          <span class="icon-text">{{ isFav ? '已收藏' : '收藏' }}</span>
        </div>
        <div class="icon-btn" @click="onShare">
          <img class="icon" src="/images/icons/share.svg" alt="分享" />
          <span class="icon-text">分享</span>
        </div>
      </div>

      <!-- 买家操作按钮 -->
      <div v-if="!isSeller" class="bar-btns">
        <div class="btn-outline" @click="onContact">联系卖家</div>
        <div v-if="product.status === '在售'" class="btn-buy" @click="onBuy">立即购买</div>
        <div v-if="product.status === '已下架'" class="btn-disabled">已拍下</div>
        <div v-if="product.status === '已售出'" class="btn-disabled">已售出</div>
      </div>

      <!-- 卖家操作按钮（简化版） -->
      <div v-else class="bar-btns">
        <div class="btn-outline" @click="onEditBook">编辑信息</div>
        <div class="btn-seller" @click="onRefreshExposure">刷新曝光</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  getBookById,
  delistBook,
  relistBook,
  updateBookStatus,
  deletePublishedBook,
  ON_SALE,
  DELISTED,
  SOLD
} from '@/utils/bookStore';
import { isFavorited, addFavorite, removeFavorite } from '@/utils/favoriteStore';
import { getCurrentUserInfo, isCurrentUserSeller } from '@/utils/userIdentity';
import { ensureLogin } from '@/utils/authStore';

const route = useRoute();

const product = ref({
  id: 0,
  title: '',
  price: 0,
  originalPrice: 0,
  images: [],
  desc: '',
  condition: '',
  category: '',
  college: '',
  courseName: '',
  grade: '',
  location: '',
  views: 0,
  status: ON_SALE,
  user: { id: '', name: '', avatar: '/images/icons/avatar.png', school: '' }
});

const isFav = ref(false);
const isSeller = ref(false);

function currentUserId() {
  return getCurrentUserInfo().id;
}

function toViewModel(book) {
  return {
    ...book,
    images: book.images && book.images.length ? book.images : book.cover ? [book.cover] : [],
    desc: book.description || '',
    views: 0,
    user: {
      id: book.sellerId,
      name: book.sellerName,
      avatar: book.sellerAvatar,
      school: book.college ? `西南大学 · ${book.college}` : '西南大学'
    }
  };
}

// 按路由参数从 Supabase 读取商品
onMounted(async () => {
  const book = await getBookById(route.query.id);
  if (!book) {
    wx.showToast({ title: '商品不存在', icon: 'none' });
    setTimeout(() => wx.navigateBack(), 1200);
    return;
  }
  product.value = toViewModel(book);
  isSeller.value = isCurrentUserSeller(book.sellerId);
  wx.setNavigationBarTitle({ title: book.title });
  if (currentUserId()) isFav.value = await isFavorited(currentUserId(), book.id);
});

async function toggleFav() {
  if (!ensureLogin(route.fullPath)) return;
  const uid = currentUserId();
  if (isFav.value) {
    await removeFavorite(uid, product.value.id);
    isFav.value = false;
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  } else {
    await addFavorite(uid, product.value.id);
    isFav.value = true;
    wx.showToast({ title: '已收藏', icon: 'none' });
  }
}

function onShare() {
  wx.showActionSheet({
    itemList: ['分享链接'],
    success: (res) => {
      if (res.tapIndex === 0) {
        shareAsLink();
      }
    }
  });
}

function shareAsLink() {
  wx.setClipboardData({
    data: `https://书循.com/book/${product.id}`,
    success: () => {
      wx.showToast({
        title: '链接已复制',
        icon: 'success'
      });
    }
  });
}

function shareAsImage() {
  wx.showLoading({ title: '生成图片中...' });

  setTimeout(() => {
    wx.hideLoading();
    wx.showToast({
      title: '图片生成功能开发中',
      icon: 'none'
    });
  }, 1000);
}

function onContact() {
  if (!ensureLogin(route.fullPath)) return;
  const p = product.value;
  wx.navigateTo({
    url: `/pages/chat/chat?bookId=${p.id}&otherUserId=${p.user.id}`
  });
}

function onBuy() {
  if (!ensureLogin(route.fullPath)) return;
  wx.navigateTo({
    url: `/pages/order-confirm/order-confirm?bookId=${product.value.id}`
  });
}

function goToUserDetail() {
  wx.navigateTo({
    url: `/pages/user-detail/user-detail?userId=${product.value.user.id}`
  });
}

// 卖家专属功能
function onEditBook() {
  wx.navigateTo({
    url: `/pages/publish/publish?edit=1&bookId=${product.value.id}`
  });
}

function onMarkDelisted() {
  wx.showModal({
    title: '标记为已下架',
    content: '确定将这本书下架吗？下架后买家将无法看到。',
    success: async (res) => {
      if (!res.confirm) return;
      await delistBook(product.value.id);
      product.value.status = DELISTED;
      wx.showToast({ title: '已下架', icon: 'success' });
    }
  });
}

function onMarkSold() {
  wx.showModal({
    title: '标记为已售出',
    content: '确定将这本书标记为已售出吗？',
    success: async (res) => {
      if (!res.confirm) return;
      await updateBookStatus(product.value.id, SOLD);
      product.value.status = SOLD;
      wx.showToast({ title: '标记成功', icon: 'success' });
    }
  });
}

function onRelist() {
  wx.showModal({
    title: '重新上架',
    content: '确定重新上架这本书吗？',
    success: async (res) => {
      if (!res.confirm) return;
      await relistBook(product.value.id);
      product.value.status = ON_SALE;
      wx.showToast({ title: '重新上架成功', icon: 'success' });
    }
  });
}

function onDeleteBook() {
  wx.showModal({
    title: '删除发布',
    content: '确定要删除这个发布吗？删除后无法恢复。',
    confirmColor: '#FF3B30',
    success: async (res) => {
      if (!res.confirm) return;
      await deletePublishedBook(product.value.id, currentUserId());
      wx.showToast({ title: '删除成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  });
}

function onRefreshExposure() {
  wx.showLoading({ title: '刷新中...' });

  setTimeout(() => {
    wx.hideLoading();
    wx.showToast({ title: '曝光已刷新', icon: 'success' });
  }, 1000);
}

function onViewStats() {
  wx.showToast({
    title: '统计功能开发中',
    icon: 'none'
  });
}
</script>

<style scoped>
.detail-container {
  padding-bottom: 70px;
}

/* Images */
.product-swiper {
  width: 100%;
  height: 300px;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  background-color: #f0f0f0;
}

.swiper-item {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.swiper-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #f0f0f0;
}

.content-section {
  padding-top: 16px;
  padding-bottom: 16px;
}

/* User Card */
.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.user-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #eee;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.user-school {
  font-size: 12px;
  color: var(--text-secondary);
}

.follow-btn {
  padding: 5px 12px;
  font-size: 12px;
}

/* Product Main */
.product-main {
  padding: 16px;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
  color: #ff5a5f;
}

.currency {
  font-size: 16px;
  font-weight: 600;
}

.price {
  font-size: 24px;
  font-weight: 700;
}

.original-price {
  font-size: 14px;
  color: var(--apple-gray);
  text-decoration: line-through;
  margin-left: 6px;
}

.detail-tags {
  display: flex;
  gap: 6px;
  margin-left: 10px;
}

.tag-item {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
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

.product-main .title {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 8px 0 16px;
  line-height: 1.3;
}

/* Course Binding Info */
.product-main .course-binding {
  background-color: #f8f8f8;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 16px;
}

.binding-title {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
  opacity: 0.8;
}

.binding-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.binding-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.binding-label {
  font-size: 12px;
  color: #8e8e93;
}

.binding-value {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.desc-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.desc {
  font-size: 14px;
  color: #48484a;
  line-height: 1.6;
  margin-bottom: 20px;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: var(--max-content-width);
  margin: 0 auto;
  min-height: 56px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  gap: 8px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.action-icons {
  display: flex;
  gap: 16px;
}

.icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.icon {
  width: 22px;
  height: 22px;
}

.icon-btn span.icon {
  font-size: 22px;
  line-height: 22px;
}

.icon-text {
  font-size: 10px;
  color: var(--text-secondary);
}

.bar-btns {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.btn-outline {
  flex: 1;
  text-align: center;
  padding: 11px 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  background: var(--apple-light-gray);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
}

.btn-buy {
  flex: 1.2;
  text-align: center;
  padding: 11px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(90deg, #ff6b35 0%, #ff5a5f 100%);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
}

.btn-buy:hover,
.btn-outline:hover {
  opacity: 0.88;
}

/* ===== 卖家专属样式 ===== */

.seller-actions-section {
  margin: 10px 0;
  padding: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.seller-actions-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.seller-actions-title span {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
}

.seller-badge {
  font-size: 11px;
  font-weight: 600;
  color: #07c160;
  background: rgba(7, 193, 96, 0.1);
  padding: 3px 8px;
  border-radius: 10px;
  border: 1px solid rgba(7, 193, 96, 0.2);
}

/* 状态控制 */
.seller-status-control {
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
}

.status-control-title {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.status-btn {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  background: #f2f2f7;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  cursor: pointer;
}

.status-btn.active {
  color: #ffffff;
  background: linear-gradient(90deg, #07c160 0%, #05a850 100%);
  border-color: transparent;
}

.status-btn:hover {
  opacity: 0.8;
}

/* 卖家操作按钮 */
.seller-action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.seller-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.seller-action-btn:hover {
  opacity: 0.8;
}

.seller-action-btn.edit {
  background: rgba(0, 122, 255, 0.08);
  color: #007aff;
  border: 1px solid rgba(0, 122, 255, 0.2);
}

.seller-action-btn.refresh {
  background: rgba(255, 149, 0, 0.08);
  color: #ff9500;
  border: 1px solid rgba(255, 149, 0, 0.2);
}

.seller-action-btn.stats {
  background: rgba(88, 86, 214, 0.08);
  color: #5856d6;
  border: 1px solid rgba(88, 86, 214, 0.2);
}

.seller-action-btn.delete {
  background: rgba(255, 59, 48, 0.08);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.2);
}

.action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-bottom: 4px;
  opacity: 0.9;
  font-size: 16px;
}

/* 卖家底部按钮 */
.btn-seller {
  flex: 1.2;
  text-align: center;
  padding: 11px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(90deg, #07c160 0%, #05a850 100%);
  border-radius: var(--border-radius-lg);
  transition: opacity 0.2s;
  cursor: pointer;
}

.btn-seller:hover {
  opacity: 0.88;
}

.btn-disabled {
  flex: 1.2;
  text-align: center;
  padding: 11px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #8e8e93;
  background: #e5e5ea;
  border-radius: var(--border-radius-lg);
}

@media (max-width: 767px) {
  .bottom-bar {
    bottom: 56px;
  }
}
</style>
