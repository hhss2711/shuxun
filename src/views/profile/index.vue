<template>
  <div class="profile-container container">
    <!-- 1. User Info Card -->
    <div class="user-card-section">
      <div class="user-card card">
        <div class="user-info">
          <div class="user-main" @click="onNickNameTap">
            <div class="info-content">
              <div class="nickname">{{ userInfo.nickName }}</div>
              <div class="detail-row" v-if="userInfo.location">{{ userInfo.location }}</div>
              <div class="detail-row" v-if="userInfo.college">{{ userInfo.college }}</div>
              <div class="detail-row">信用分：{{ userInfo.creditScore }} | 成交{{ userInfo.dealCount }}单</div>
            </div>
          </div>
          <div class="card-actions">
            <div class="action-btn" @click="onEditProfile">编辑资料</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Stats Row -->
    <div class="stats-section">
      <div class="stat-box" @click="onStatClick('sell')">
        <div class="stat-label">我卖的</div>
        <div class="stat-num">{{ stats.sell }}本</div>
      </div>
      <div class="stat-box" @click="onStatClick('buy')">
        <div class="stat-label">我买的</div>
        <div class="stat-num">{{ stats.buy }}本</div>
      </div>
      <div class="stat-box" @click="onStatClick('fav')">
        <div class="stat-label">我收藏的</div>
        <div class="stat-num">{{ stats.fav }}本</div>
      </div>
    </div>

    <!-- 3. Menu List -->
    <div class="menu-group-container">
      <div class="menu-group card">
        <div class="menu-item" @click="onMenuClick('publish')">
          <div class="menu-left">
            <div class="menu-icon">📋</div>
            <span class="menu-name">我的发布</span>
          </div>
          <div class="menu-right">
            <img class="arrow" src="/images/arrow.svg" alt="" />
          </div>
        </div>
        <div class="menu-item" @click="onMenuClick('fav')">
          <div class="menu-left">
            <div class="menu-icon">❤️</div>
            <span class="menu-name">我的收藏</span>
          </div>
          <div class="menu-right">
            <img class="arrow" src="/images/arrow.svg" alt="" />
          </div>
        </div>
        <div class="menu-item" @click="onMenuClick('notice')">
          <div class="menu-left">
            <div class="menu-icon">🔔</div>
            <span class="menu-name">消息通知设置</span>
          </div>
          <div class="menu-right">
            <img class="arrow" src="/images/arrow.svg" alt="" />
          </div>
        </div>
      </div>
      <div class="menu-group card">
        <div class="menu-item" @click="onMenuClick('security')">
          <div class="menu-left">
            <div class="menu-icon">🔒</div>
            <span class="menu-name">账号与安全</span>
          </div>
          <div class="menu-right">
            <img class="arrow" src="/images/arrow.svg" alt="" />
          </div>
        </div>
        <div class="menu-item" @click="onMenuClick('help')">
          <div class="menu-left">
            <div class="menu-icon">❓</div>
            <span class="menu-name">帮助与反馈</span>
          </div>
          <div class="menu-right">
            <img class="arrow" src="/images/arrow.svg" alt="" />
          </div>
        </div>
        <div class="menu-item" @click="onMenuClick('about')">
          <div class="menu-left">
            <div class="menu-icon">ℹ️</div>
            <span class="menu-name">关于我们</span>
          </div>
          <div class="menu-right">
            <img class="arrow" src="/images/arrow.svg" alt="" />
          </div>
        </div>
      </div>
    </div>

    <div class="footer-tip">书循 · 极简主义二手交易</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMyPublishedBooks } from '@/utils/bookStore';
import { listOrders } from '@/utils/orderStore';
import { getUserFavorites } from '@/utils/favoriteStore';
import { initAuth, isLoggedIn, ensureLogin } from '@/utils/authStore';

const userInfo = ref({
  id: '',
  nickName: '未登录',
  location: '',
  college: '',
  creditScore: 100,
  dealCount: 0,
  avatarUrl: '/images/icons/avatar.png',
  isProfileComplete: false
});

// 新用户各项统计均为 0，数据来自 Supabase
const stats = ref({
  sell: 0,
  buy: 0,
  fav: 0
});

async function refreshUserInfo() {
  // 确保登录态已还原（全局资料由 authStore 写回）
  await initAuth();

  const info = getApp().globalData?.userInfo || {};
  userInfo.value = { ...userInfo.value, ...info };

  const userId = userInfo.value.id;
  if (!userId) {
    stats.value = { sell: 0, buy: 0, fav: 0 };
    return;
  }

  const [sell, buy, fav] = await Promise.all([
    getMyPublishedBooks(userId),
    listOrders(),
    getUserFavorites(userId)
  ]);
  stats.value = { sell: sell.length, buy: buy.length, fav: fav.length };
}

// 对应原页面 onLoad / onShow，均刷新用户信息
onMounted(refreshUserInfo);

function onNickNameTap() {
  if (!isLoggedIn()) {
    wx.navigateTo({ url: '/pages/login/login' });
    return;
  }
  // 进入用户本人的卡片
  wx.navigateTo({ url: `/pages/user-detail/user-detail?userId=${userInfo.value.id}` });
}

function onEditProfile() {
  if (!ensureLogin('/pages/profile-edit/profile-edit')) return;
  wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
}

function onStatClick(type) {
  if (!ensureLogin(`/pages/book-list/book-list?type=${type}`)) return;
  wx.navigateTo({ url: `/pages/book-list/book-list?type=${type}` });
}

function onMenuClick(id) {
  if (id === 'darkmode') return;

  const routeMap = {
    orders: '/pages/order-list/order-list',
    publish: '/pages/book-list/book-list?type=publish',
    fav: '/pages/book-list/book-list?type=fav',
    notice: '/pages/notifications/notifications',
    security: '/pages/account/account',
    tags: '/pages/tags/tags',
    help: '/pages/help/help',
    about: '/pages/about/about'
  };

  if (routeMap[id]) {
    if ((id === 'publish' || id === 'fav') && !ensureLogin(routeMap[id])) return;
    wx.navigateTo({ url: routeMap[id] });
  } else {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 8px 16px;
  box-sizing: border-box;
}

/* 通用卡片样式 */
.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 12px;
  margin-bottom: 8px;
}

/* 用户信息卡片 */
.user-card-section {
  margin-bottom: 8px;
}

.user-card {
  background-color: var(--bg-color);
  box-shadow: none;
  padding: 16px;
  border-radius: 0;
}

.user-info {
  width: 100%;
}

.user-main {
  width: 100%;
  cursor: pointer;
}

.info-content {
  width: 100%;
}

.nickname {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
}

.detail-row {
  font-size: 14px;
  color: #666666;
  margin-bottom: 6px;
  line-height: 1.4;
}

.card-actions {
  display: flex;
  margin-top: 12px;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 6px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  color: #666666;
  background-color: #f9f9f9;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #f0f0f0;
}

/* 统计数据 */
.stats-section {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.stat-box {
  flex: 1;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.stat-label {
  font-size: 12px;
  color: #666666;
  margin-bottom: 4px;
}

.stat-num {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

.stat-box:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* 菜单列表 */
.menu-group-container {
  margin-bottom: 8px;
}

.menu-group {
  margin-bottom: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #666666;
}

/* 为不同菜单项添加不同的图标样式 */
.menu-item:nth-child(1) .menu-icon {
  background-color: #f5f9ff;
  color: #60a5fa;
}

.menu-item:nth-child(2) .menu-icon {
  background-color: #fdf2f2;
  color: #f87171;
}

.menu-item:nth-child(3) .menu-icon {
  background-color: #fef9c3;
  color: #fbbf24;
}

.menu-item:nth-child(4) .menu-icon {
  background-color: #f0fdf4;
  color: #34d399;
}

.menu-item:nth-child(5) .menu-icon {
  background-color: #fdf4ff;
  color: #f472b6;
}

.menu-item:nth-child(6) .menu-icon {
  background-color: #f9fafb;
  color: #9ca3af;
}

.menu-name {
  font-size: 14px;
  color: #000000;
}

.menu-right {
  display: flex;
  align-items: center;
}

.arrow {
  width: 12px;
  height: 12px;
  margin-left: 6px;
}

.menu-item:hover {
  background-color: #f9f9f9;
}

/* 底部提示 */
.footer-tip {
  text-align: center;
  font-size: 12px;
  color: #999999;
  padding: 16px 0;
}
</style>
