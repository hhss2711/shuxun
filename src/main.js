import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { installWxCompat } from './wx-compat';
import { initAuth } from './utils/authStore';
import './styles/global.css';

// 安装 wx.* / getApp() 兼容层（必须在挂载前）
installWxCompat(router);

// 还原 Supabase 登录态（不阻塞首屏，路由守卫会等待同一个 Promise）
initAuth();

createApp(App).use(router).mount('#app');
