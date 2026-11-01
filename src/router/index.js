import { createRouter, createWebHistory } from 'vue-router';
import { initAuth, isLoggedIn } from '@/utils/authStore';

/**
 * 路由路径与小程序保持一致（/pages/xxx/xxx），
 * 这样从 miniprogram 迁移过来的 wx.navigateTo({ url }) 无需修改。
 * meta.requiresAuth：未登录时先跳转登录页（按需登录）。
 */
const routes = [
  { path: '/', redirect: '/pages/index/index' },
  { path: '/pages/index/index', name: 'index', component: () => import('@/views/index/index.vue'), meta: { title: '书循 - 校园二手书交易' } },
  { path: '/pages/splash/splash', name: 'splash', component: () => import('@/views/splash/index.vue'), meta: { title: '书循' } },
  { path: '/pages/login/login', name: 'login', component: () => import('@/views/login/index.vue'), meta: { title: '登录 · 书循' } },
  { path: '/pages/search/search', name: 'search', component: () => import('@/views/search/index.vue'), meta: { title: '搜索' } },
  { path: '/pages/book-list/book-list', name: 'book-list', component: () => import('@/views/book-list/index.vue'), meta: { title: '书籍列表' } },
  { path: '/pages/detail/detail', name: 'detail', component: () => import('@/views/detail/index.vue'), meta: { title: '书籍详情' } },
  { path: '/pages/publish/publish', name: 'publish', component: () => import('@/views/publish/index.vue'), meta: { title: '发布书籍', requiresAuth: true } },
  { path: '/pages/order-confirm/order-confirm', name: 'order-confirm', component: () => import('@/views/order-confirm/index.vue'), meta: { title: '确认拍下', requiresAuth: true } },
  { path: '/pages/order-list/order-list', name: 'order-list', component: () => import('@/views/order-list/index.vue'), meta: { title: '我的订单', requiresAuth: true } },
  { path: '/pages/message/message', name: 'message', component: () => import('@/views/message/index.vue'), meta: { title: '消息', requiresAuth: true } },
  { path: '/pages/chat/chat', name: 'chat', component: () => import('@/views/chat/index.vue'), meta: { title: '聊天', requiresAuth: true } },
  { path: '/pages/profile/profile', name: 'profile', component: () => import('@/views/profile/index.vue'), meta: { title: '我的' } },
  { path: '/pages/profile-edit/profile-edit', name: 'profile-edit', component: () => import('@/views/profile-edit/index.vue'), meta: { title: '编辑资料', requiresAuth: true } },
  { path: '/pages/user-detail/user-detail', name: 'user-detail', component: () => import('@/views/user-detail/index.vue'), meta: { title: '用户主页' } },
  { path: '/pages/account/account', name: 'account', component: () => import('@/views/account/index.vue'), meta: { title: '账号与安全', requiresAuth: true } },
  { path: '/pages/notifications/notifications', name: 'notifications', component: () => import('@/views/notifications/index.vue'), meta: { title: '通知' } },
  { path: '/pages/tags/tags', name: 'tags', component: () => import('@/views/tags/index.vue'), meta: { title: '标签' } },
  { path: '/pages/help/help', name: 'help', component: () => import('@/views/help/index.vue'), meta: { title: '帮助中心' } },
  { path: '/pages/about/about', name: 'about', component: () => import('@/views/about/index.vue'), meta: { title: '关于书循' } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach(async (to) => {
  if (!to.meta || !to.meta.requiresAuth) return true;
  await initAuth();
  if (isLoggedIn()) return true;
  return { path: '/pages/login/login', query: { redirect: to.fullPath } };
});

router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  }
});

export default router;
