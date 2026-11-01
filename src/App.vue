<template>
  <div class="app-shell">
    <!-- 桌面端顶部导航（替代小程序 tabBar） -->
    <header class="site-header">
      <div class="header-inner container">
        <router-link class="brand" to="/pages/index/index">
          <span class="brand-mark">书</span>
          <span class="brand-name">书循</span>
        </router-link>

        <nav class="desktop-nav">
          <router-link
            v-for="tab in tabs"
            :key="tab.path"
            :to="tab.path"
            class="nav-link"
            :class="{ active: currentPath === tab.path }"
          >
            {{ tab.text }}
          </router-link>
        </nav>

        <router-link class="header-action" to="/pages/search/search">搜索</router-link>
      </div>
    </header>

    <main class="site-main">
      <router-view />
    </main>

    <!-- 移动端底部 tab 栏 -->
    <nav class="tabbar">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="tabbar-item"
        :class="{ active: currentPath === tab.path }"
      >
        <img :src="currentPath === tab.path ? tab.activeIcon : tab.icon" :alt="tab.text" />
        <span>{{ tab.text }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const tabs = [
  { path: '/pages/index/index', text: '首页', icon: '/images/icons/home.png', activeIcon: '/images/icons/home-active.png' },
  { path: '/pages/publish/publish', text: '发布', icon: '/images/icons/business.png', activeIcon: '/images/icons/business-active.png' },
  { path: '/pages/message/message', text: '消息', icon: '/images/icons/goods.png', activeIcon: '/images/icons/goods-active.png' },
  { path: '/pages/profile/profile', text: '我的', icon: '/images/icons/usercenter.png', activeIcon: '/images/icons/usercenter-active.png' }
];

const currentPath = computed(() => route.path);
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(250, 249, 246, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-inner {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--primary-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.brand-name {
  font-size: 18px;
  letter-spacing: 1px;
}

.desktop-nav {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-link {
  padding: 8px 14px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}
.nav-link:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-main);
}
.nav-link.active {
  color: var(--text-main);
  font-weight: 700;
  background: rgba(0, 0, 0, 0.05);
}

.header-action {
  font-size: 13px;
  color: var(--text-secondary);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
}
.header-action:hover {
  color: var(--text-main);
}

.site-main {
  min-height: calc(100vh - 56px);
}

/* 移动端底部 tabbar */
.tabbar {
  display: none;
}

@media (max-width: 767px) {
  .desktop-nav,
  .header-action {
    display: none;
  }
  .header-inner {
    justify-content: center;
  }
  .site-main {
    padding-bottom: 64px;
  }
  .tabbar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 56px;
    padding-bottom: env(safe-area-inset-bottom);
    background: #fff;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    z-index: 100;
  }
  .tabbar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-size: 11px;
    color: var(--text-secondary);
  }
  .tabbar-item img {
    width: 22px;
    height: 22px;
    opacity: 0.7;
  }
  .tabbar-item.active {
    color: var(--text-main);
    font-weight: 600;
  }
  .tabbar-item.active img {
    opacity: 1;
  }
}
</style>
