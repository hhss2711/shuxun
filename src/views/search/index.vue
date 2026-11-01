<template>
  <div class="search-container container">
    <!-- Search Header -->
    <div class="search-header">
      <div class="search-input-box">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          placeholder="书名/作者/ISBN/课程名"
          autofocus
          v-model="searchValue"
          @keyup.enter="onSearch"
        />
        <div class="search-btn" @click="onSearch">搜索</div>
      </div>
    </div>

    <div class="mode-section">
      <div class="mode-item mode-item-single" @click="onMediaSearchMenu">
        <img class="mode-icon mode-icon-camera" src="/images/icons/camera.svg" alt="识图" />
        <span>扫码 / 拍照 / 相册识图</span>
      </div>
    </div>

    <!-- Hot Search -->
    <div class="tag-section">
      <div class="section-title">🔥 热门搜索</div>
      <div class="tag-list">
        <div
          v-for="(item, index) in hotSearches"
          :key="index"
          class="tag-item"
          @click="onTagTap(item)"
        >{{ item }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const hotSearches = ref(['高等数学', '大学物理', '心理学与生活', '四级真题', '计算机考研']);
const searchValue = ref('');

function onSearch() {
  const keyword = (searchValue.value || '').trim();
  if (!keyword) {
    wx.showToast({ title: '请输入搜索词', icon: 'none' });
    return;
  }
  wx.navigateTo({
    url: `/pages/book-list/book-list?type=search&q=${encodeURIComponent(keyword)}`
  });
}

function onScanSearch() {
  wx.scanCode({
    success: (res) => {
      wx.showLoading({ title: '正在识别ISBN...' });
      // Simulate real book database matching
      setTimeout(() => {
        wx.hideLoading();
        wx.showModal({
          title: '识别成功',
          content: `识别到图书 ISBN: ${res.result}\n即将进入详情页...`,
          showCancel: false,
          success: () => {
            wx.navigateTo({ url: '/pages/detail/detail?id=1' });
          }
        });
      }, 1500);
    }
  });
}

function onPhotoSearch(sourceType) {
  wx.chooseImage({
    count: 1,
    sourceType: sourceType || ['album', 'camera'],
    success: () => {
      wx.showLoading({ title: '正在进行AI识图...' });
      setTimeout(() => {
        wx.hideLoading();
        wx.showModal({
          title: '识别成功',
          content: '已成功识别封面信息\n即将展示匹配结果...',
          showCancel: false,
          success: () => {
            wx.navigateTo({ url: '/pages/detail/detail?id=2' });
          }
        });
      }, 2000);
    }
  });
}

function onMediaSearchMenu() {
  wx.showActionSheet({
    itemList: ['扫码搜索', '拍照识图', '从相册选择'],
    success: (res) => {
      if (res.tapIndex === 0) onScanSearch();
      else if (res.tapIndex === 1) onPhotoSearch(['camera']);
      else if (res.tapIndex === 2) onPhotoSearch(['album']);
    }
  });
}

function onTagTap(value) {
  searchValue.value = value;
  onSearch();
}
</script>

<style scoped>
.search-container {
  padding: 0 16px;
  background-color: #ffffff;
  min-height: 100vh;
}

.search-header {
  padding: 10px 0;
  position: sticky;
  top: 56px;
  background-color: #ffffff;
  z-index: 100;
}

.search-input-box {
  display: flex;
  align-items: center;
  background-color: var(--apple-light-gray);
  padding: 8px 12px;
  border-radius: 10px;
  gap: 8px;
}

.search-icon {
  font-size: 14px;
  opacity: 0.5;
}

.search-input-box input {
  flex: 1;
  font-size: 14px;
  border: none;
  background: transparent;
  outline: none;
}

.search-btn {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  padding-left: 10px;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

/* Search Modes */
.mode-section {
  display: flex;
  gap: 12px;
  padding: 20px 0;
}

.mode-item {
  flex: 1;
  background-color: var(--bg-color);
  padding: 16px;
  border-radius: var(--border-radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  cursor: pointer;
}

.mode-item-single {
  flex-direction: row;
  justify-content: center;
  gap: 10px;
}

.mode-icon {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}

.mode-icon-camera {
  width: 20px;
  height: 20px;
  opacity: 0.95;
}

.mode-item span {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-main);
}

/* Tag Sections */
.tag-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  padding: 6px 16px;
  background-color: var(--apple-light-gray);
  font-size: 13px;
  color: var(--text-secondary);
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tag-item:hover,
.tag-item:active {
  background-color: #e5e5ea;
}
</style>
