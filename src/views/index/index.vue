<template>
  <div class="home-container container">
    <!-- 1. 顶部：校区选择 + 通知 -->
    <div class="top-header">
      <div class="location-picker">
        <select v-model.number="campusIndex" class="location-select" @change="onCampusChange">
          <option v-for="(c, i) in campusData" :key="c.name" :value="i">{{ c.name }}</option>
        </select>
        <select v-model.number="areaIndex" class="location-select area" @change="onCampusChange">
          <option v-for="(a, i) in currentAreas" :key="a" :value="i">{{ a }}</option>
        </select>
      </div>
      <button class="notification-btn" @click="onNotification">
        <img class="notice-icon" src="/images/icons/goods.png" alt="通知" />
        <span class="notice-dot"></span>
      </button>
    </div>

    <!-- 2. 搜索 -->
    <div class="search-section">
      <div class="search-bar-wrapper" @click="goToSearch">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="书名 / 作者 / ISBN / 课程名" readonly />
        <div class="search-actions" @click.stop="onMediaSearchMenu">
          <img class="search-camera-icon" src="/images/icons/camera.svg" alt="识图" />
        </div>
      </div>
    </div>

    <!-- 3. 学院筛选 -->
    <div class="college-selection-bar">
      <div class="college-picker-trigger card">
        <div class="picker-left">
          <span class="bar-title">学院筛选：</span>
          <select v-model.number="collegeIndex" class="college-select" @change="onCollegePickerChange">
            <option v-for="(c, i) in colleges" :key="c" :value="i">{{ c }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 4. 分类 -->
    <div class="category-scroll">
      <button
        v-for="item in categories"
        :key="item.id"
        class="category-item"
        :class="{ active: activeCategoryId === item.id }"
        @click="onCategoryTap(item.id)"
      >
        {{ item.name }}
      </button>
    </div>

    <!-- 5. 推荐列表 -->
    <div class="section-header">
      <span class="section-title">为你推荐</span>
      <div class="filter-btn">
        <span>按距离排序</span>
        <img class="mini-arrow" src="/images/arrow.svg" alt="" />
      </div>
    </div>

    <div class="product-grid">
      <div
        v-for="item in products"
        :key="item.id"
        class="product-card"
        @click="goToDetail(item.id)"
      >
        <div class="image-wrapper">
          <img class="product-image" :src="item.image" alt="" />
          <div class="dist-badge" :class="{ priority: item.isSameArea }">
            {{ item.isSameArea ? '同园区' : item.distance }}
          </div>
        </div>
        <div class="product-info">
          <div class="product-title">{{ item.title }}</div>
          <div v-if="item.courseName" class="product-course">
            <img class="course-icon" src="/images/icons/copy.png" alt="" />
            <span>{{ item.courseName }}</span>
          </div>
          <div class="product-tags">
            <span class="tag-item condition">{{ item.condition }}</span>
            <span class="tag-item location">{{ item.location }}</span>
          </div>
          <div class="product-footer">
            <div class="price-box">
              <span class="currency">¥</span>
              <span class="price">{{ item.price }}</span>
            </div>
            <div class="footer-right">
              <button class="buy-chip" @click.stop="goToOrderFromList(item.id)">下单</button>
              <img
                class="user-avatar"
                :src="item.user && item.user.avatar"
                alt=""
                @click.stop="goToUserDetail(item.user && item.user.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { swuColleges } from '@/utils/swuData';
import { getOnSaleBooks } from '@/utils/bookStore';

const campusData = [
  { name: '北碚校区', areas: ['全部园区', '楠园', '竹园', '茶园', '李园', '梅园', '杏园', '橘园', '桃园'] },
  { name: '荣昌校区', areas: ['荣昌校区'] }
];

const campusIndex = ref(0);
const areaIndex = ref(0);
const currentAreas = computed(() => campusData[campusIndex.value].areas);
const selectedLocation = computed(() => {
  const campus = campusData[campusIndex.value].name;
  const area = currentAreas.value[areaIndex.value];
  return campus === area ? campus : `${campus} · ${area}`;
});

const colleges = ['不限', ...swuColleges.map((c) => c.short)];
const collegeIndex = ref(0);
const activeCollege = computed(() => colleges[collegeIndex.value]);

const categories = [
  { id: 0, name: '全部' },
  { id: 1, name: '通识课' },
  { id: 2, name: '专业课' },
  { id: 3, name: '考研资料' },
  { id: 4, name: '课辅资料' },
  { id: 5, name: '英语四六级' }
];
const activeCategoryId = ref(0);

// 首页只展示「在售」商品（已拍下/下架的商品由后端过滤，不在列表中返回）
const allProducts = ref([]);

onMounted(async () => {
  allProducts.value = await getOnSaleBooks();
});

const products = computed(() => {
  const categoryName = categories.find((c) => c.id === activeCategoryId.value).name;
  return allProducts.value.filter((item) => {
    const matchCategory = categoryName === '全部' || item.category === categoryName;
    const matchCollege = activeCollege.value === '不限' || item.college === activeCollege.value;
    return matchCategory && matchCollege;
  });
});

function onCampusChange() {
  if (areaIndex.value >= currentAreas.value.length) areaIndex.value = 0;
}

function onCollegePickerChange() {
  /* computed activeCollege 已联动 */
}

function onCategoryTap(id) {
  activeCategoryId.value = id;
}

function goToSearch() {
  wx.navigateTo({ url: '/pages/search/search' });
}

function onNotification() {
  wx.switchTab({ url: '/pages/message/message' });
}

function onMediaSearchMenu() {
  wx.showActionSheet({
    itemList: ['扫描 ISBN', '拍照识图', '从相册选择'],
    success: (res) => {
      if (res.tapIndex === 0) {
        wx.scanCode({ success: (r) => wx.showToast({ title: '已识别: ' + String(r.result).slice(0, 12), icon: 'none' }) });
      } else if (res.tapIndex === 1) {
        wx.chooseImage({ count: 1, sourceType: ['camera'], success: () => wx.showToast({ title: '已选择图片', icon: 'none' }) });
      } else if (res.tapIndex === 2) {
        wx.chooseImage({ count: 1, sourceType: ['album'], success: () => wx.showToast({ title: '已选择图片', icon: 'none' }) });
      }
    }
  });
}

function goToDetail(id) {
  wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
}

function goToOrderFromList(id) {
  wx.navigateTo({ url: `/pages/order-confirm/order-confirm?bookId=${id}` });
}

function goToUserDetail(userId) {
  wx.navigateTo({ url: `/pages/user-detail/user-detail?userId=${userId}` });
}
</script>

<style scoped>
.home-container {
  padding-bottom: 20px;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 5px;
}

.location-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.location-select {
  appearance: none;
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  cursor: pointer;
  padding: 2px 4px;
}
.location-select.area {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.notification-btn {
  position: relative;
  padding: 4px;
  border: none;
  background: none;
}
.notice-icon {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}
.notice-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 7px;
  height: 7px;
  background-color: #ff3b30;
  border-radius: 50%;
  border: 1.5px solid #fff;
}

.search-section {
  padding: 10px 0;
}
.search-bar-wrapper {
  background-color: var(--apple-light-gray);
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  gap: 8px;
  cursor: pointer;
}
.search-bar-wrapper input {
  flex: 1;
  font-size: 14px;
  border: none;
  background: transparent;
  outline: none;
  cursor: pointer;
}
.search-icon {
  font-size: 14px;
  opacity: 0.5;
}
.search-actions {
  display: flex;
  align-items: center;
  padding-left: 10px;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
}
.search-camera-icon {
  width: 18px;
  height: 18px;
  opacity: 0.9;
}

.college-selection-bar {
  padding: 5px 0;
}
.college-picker-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px !important;
  margin-bottom: 0 !important;
}
.picker-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.bar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}
.college-select {
  appearance: none;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  cursor: pointer;
}

.category-scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 0;
}
.category-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  height: 32px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  background-color: #fff;
  border-radius: 20px;
  border: 0.5px solid rgba(0, 0, 0, 0.03);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s;
}
.category-item:hover {
  color: var(--text-main);
}
.category-item.active {
  background-color: var(--primary-color);
  color: #fff;
  font-weight: 600;
  border: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0 8px;
}
.section-title {
  font-size: 17px;
  font-weight: 700;
}
.filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}
.mini-arrow {
  width: 10px;
  height: 10px;
  opacity: 0.3;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.product-card {
  background-color: #fff;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}
.image-wrapper {
  position: relative;
}
.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background-color: #f8f8f8;
}
.dist-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  backdrop-filter: blur(4px);
}
.dist-badge.priority {
  background: #dbed9b;
  color: #5c6b2e;
  font-weight: 700;
}
.product-info {
  padding: 10px;
}
.product-title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
  color: #1a1a1a;
}
.product-course {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
}
.course-icon {
  width: 12px;
  height: 12px;
  opacity: 0.4;
}
.product-course span {
  font-size: 12px;
  color: #8e8e93;
  font-weight: 500;
}
.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.tag-item {
  font-size: 10px;
  padding: 3px 7px;
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
.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.buy-chip {
  font-size: 11px;
  font-weight: 600;
  color: #ff5a5f;
  padding: 3px 8px;
  border-radius: 12px;
  border: 0.5px solid rgba(255, 90, 95, 0.45);
  background: rgba(255, 90, 95, 0.06);
}
.price-box {
  display: flex;
  align-items: baseline;
  color: #ff5a5f;
}
.currency {
  font-size: 12px;
  font-weight: 700;
}
.price {
  font-size: 18px;
  font-weight: 700;
}
.user-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #eee;
}
</style>
