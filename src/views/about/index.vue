<template>
  <div class="container">
    <div class="logo-section">
      <div class="logo-box">书循</div>
      <span class="version">Version 1.0.0</span>
    </div>

    <div class="content-section card">
      <div class="intro-title">关于书循</div>
      <div class="intro-text">
        “书循”是一款专为西南大学学子打造的极简主义二手交易平台。我们致力于让每一本承载着知识的图书在校园内继续循环，减少资源浪费，连接西大人的书香情怀。
      </div>

      <div class="feature-list">
        <div class="feature-item">
          <span class="dot">•</span>
          <span>极简设计，专注图书交易</span>
        </div>
        <div class="feature-item">
          <span class="dot">•</span>
          <span>智能录入，扫码即可发布</span>
        </div>
        <div class="feature-item">
          <span class="dot">•</span>
          <span>校区联动，精准课程推荐</span>
        </div>
      </div>
    </div>

    <div class="contact-section card">
      <div class="contact-item">
        <span class="label">开发者邮箱</span>
        <span class="value">wwxx222@email.swu.edu.cn</span>
      </div>
    </div>

    <div class="footer">
      <span>© 2026 书循项目组</span>
    </div>
  </div>
</template>

<script setup>
// 原小程序 about 页面为静态页面（无数据与交互逻辑）
</script>

<style scoped>
.container {
  padding: 30px 20px;
  background-color: var(--bg-color);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 720px;
  margin: 0 auto;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.logo-box {
  width: 80px;
  height: 80px;
  background-color: var(--primary-color);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  border-radius: 20px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.version {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.content-section {
  width: 100%;
  padding: 20px;
  margin-bottom: 16px;
  background-color: #ffffff;
}

.intro-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 12px;
}

.intro-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 20px;
  text-align: justify;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--text-main);
}

.dot {
  color: var(--primary-color);
  font-weight: 700;
}

.contact-section {
  width: 100%;
  padding: 16px 20px;
  background-color: #ffffff;
  margin-bottom: 0;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 14px;
  color: var(--text-main);
}

.value {
  font-size: 13px;
  color: var(--text-secondary);
}

.footer {
  margin-top: auto;
  padding: 20px 0;
}

.footer span {
  font-size: 11px;
  color: var(--apple-gray);
}

@media (max-width: 767px) {
  .container {
    max-width: 100%;
  }
}
</style>
