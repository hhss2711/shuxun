<template>
  <div class="splash-container">
    <img class="background-image" src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20psychology%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3" alt="" />
    <div class="overlay"></div>
    <div class="content">
      <span class="welcome-text">欢迎使用西大书循</span>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue';

// 展示 1.2 秒后跳转到首页（与原小程序逻辑一致）
const timer = setTimeout(() => {
  wx.switchTab({
    url: '/pages/index/index',
    fail: () => {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  });
}, 1200);

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<style scoped>
.splash-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.content {
  position: relative;
  z-index: 3;
  text-align: center;
}

.welcome-text {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 2px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  animation: fadeIn 1.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
