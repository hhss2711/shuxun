<template>
  <div class="container">
    <div class="page-header">
      <span class="page-title">完善个人资料</span>
      <span class="page-subtitle">让校友更放心地与你交易</span>
    </div>

    <div class="avatar-section">
      <button class="avatar-wrapper" @click="onChooseAvatar">
        <img class="avatar" :src="avatarUrl || '/images/icons/avatar.png'" alt="" />
        <div class="avatar-edit-badge">
          <img class="camera-icon" src="/images/icons/camera.svg" alt="" />
        </div>
      </button>
      <span class="avatar-tip">点击修改头像</span>
    </div>

    <div class="form-section card">
      <!-- Group 1: Basic Info -->
      <div class="input-group">
        <div class="label-row">
          <span class="label">昵称</span>
          <button class="wechat-sync-btn" @click="syncWeChatProfile">同步微信</button>
        </div>
        <input class="input" type="nickname" placeholder="输入昵称" v-model="nickName" />
      </div>

      <div class="input-group">
        <span class="label">学号 (仅后台可见，用于实名验证)</span>
        <input
          class="input"
          type="tel"
          inputmode="numeric"
          placeholder="输入15位学号"
          maxlength="15"
          v-model="studentId"
        />
      </div>

      <div class="input-group">
        <span class="label">电话号码</span>
        <input
          class="input"
          type="tel"
          inputmode="numeric"
          placeholder="输入手机号"
          maxlength="11"
          v-model="phoneNumber"
        />
      </div>
    </div>

    <div class="form-section card">
      <!-- Group 2: Academic Info -->
      <div class="picker-group">
        <span class="label">学院</span>
        <select
          class="picker-box select"
          :class="{ placeholder: collegeIndex === -1 }"
          v-model.number="collegeIndex"
          @change="onCollegeChange"
        >
          <option :value="-1" disabled>选择学院</option>
          <option v-for="(c, i) in colleges" :key="c" :value="i">{{ c }}</option>
        </select>
      </div>

      <div class="picker-group">
        <span class="label">专业</span>
        <select
          class="picker-box select"
          :class="{ placeholder: majorIndex === -1 }"
          v-model.number="majorIndex"
          :disabled="collegeIndex === -1"
        >
          <option :value="-1" disabled>
            {{ collegeIndex === -1 ? '请先选择学院' : '选择专业' }}
          </option>
          <option v-for="(m, i) in majors" :key="m" :value="i">{{ m }}</option>
        </select>
      </div>

      <div class="picker-group">
        <span class="label">年级</span>
        <select
          class="picker-box select"
          :class="{ placeholder: gradeIndex === -1 }"
          v-model.number="gradeIndex"
        >
          <option :value="-1" disabled>选择年级</option>
          <option v-for="(g, i) in grades" :key="g" :value="i">{{ g }}</option>
        </select>
      </div>
    </div>

    <div class="form-section card">
      <!-- Group 3: Location Info -->
      <div class="picker-group">
        <span class="label">校区 & 园区</span>
        <div class="dorm-selects">
          <select class="picker-box select" v-model.number="dormCampusIndex" @change="onDormCampusChange">
            <option v-for="(c, i) in dormCampuses" :key="c" :value="i">{{ c }}</option>
          </select>
          <select class="picker-box select" v-model.number="dormAreaIndex" @change="onDormAreaChange">
            <option v-for="(a, i) in dormAreas" :key="a" :value="i">{{ a }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="footer-section">
      <div class="agreement-row">
        <span class="agreement-icon">✓</span>
        <span class="agreement-text">同意《书循用户服务及实名认证协议》</span>
      </div>
      <button class="submit-btn" @click="onSave">保存资料</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { swuColleges, swuGrades, swuDormitories } from '@/utils/swuData';
import { initAuth, updateProfile, ensureLogin } from '@/utils/authStore';

const avatarUrl = ref('');
const nickName = ref('');
const studentId = ref('');
const phoneNumber = ref('');

// Academic
const colleges = swuColleges.map((c) => c.name);
const collegeIndex = ref(-1);
const majors = ref([]);
const majorIndex = ref(-1);
const grades = swuGrades;
const gradeIndex = ref(-1);

// Dormitory（原 multiSelector 降级为 校区 + 园区 两个下拉）
const dormCampuses = swuDormitories.map((d) => d.campus);
const dormCampusIndex = ref(0);
const dormAreaIndex = ref(0);
const dormAreas = computed(() => swuDormitories[dormCampusIndex.value].areas);
const selectedDormText = ref('');

async function initData() {
  await initAuth();
  const app = getApp();
  const userInfo = (app.globalData && app.globalData.userInfo) || {};

  // Find indices for existing data
  const ci = swuColleges.findIndex((c) => c.name === userInfo.college);
  let mj = [];
  let mi = -1;
  if (ci !== -1) {
    mj = swuColleges[ci].majors;
    mi = mj.indexOf(userInfo.major);
  }

  const gi = swuGrades.indexOf(userInfo.grade);

  // Dormitory initial index
  let dci = 0;
  let dai = 0;
  let dormText = '';
  if (userInfo.location) {
    const parts = userInfo.location.split(' · ');
    const campusIdx = swuDormitories.findIndex((d) => d.campus === parts[0]);
    if (campusIdx !== -1) {
      const areaIdx = swuDormitories[campusIdx].areas.indexOf(parts[1]);
      dci = campusIdx;
      dai = areaIdx !== -1 ? areaIdx : 0;
      dormText = userInfo.location;
    }
  }

  avatarUrl.value = userInfo.avatarUrl || '';
  nickName.value = userInfo.nickName || '';
  // 统一转字符串：历史数据可能被 number 输入框转成了数字
  studentId.value = String(userInfo.studentId ?? '');
  phoneNumber.value = String(userInfo.phoneNumber ?? '');
  collegeIndex.value = ci;
  majors.value = mj;
  majorIndex.value = mi;
  gradeIndex.value = gi;
  dormCampusIndex.value = dci;
  dormAreaIndex.value = dai;
  selectedDormText.value = dormText;
  if (!selectedDormText.value) syncDormText();
}

// 初始化（对应原页面 onLoad）
onMounted(initData);

function onChooseAvatar() {
  // 原为 button open-type="chooseAvatar"，降级为 wx.chooseImage
  wx.chooseImage({
    count: 1,
    sourceType: ['album', 'camera'],
    success: (res) => {
      avatarUrl.value = res.tempFilePaths[0];
    }
  });
}

function syncWeChatProfile() {
  wx.showLoading({ title: '同步中...' });
  // Mocking WeChat sync
  setTimeout(() => {
    wx.hideLoading();
    nickName.value = '微信用户';
    avatarUrl.value = '/images/icons/avatar.png'; // Usually this would come from wx.getUserProfile or ChooseAvatar
    wx.showToast({ title: '同步成功', icon: 'success' });
  }, 800);
}

function onCollegeChange() {
  const index = collegeIndex.value;
  majors.value = index === -1 ? [] : swuColleges[index].majors;
  majorIndex.value = -1;
}

// --- Dormitory Picker Logic ---
function onDormCampusChange() {
  dormAreaIndex.value = 0;
  syncDormText();
}

function onDormAreaChange() {
  syncDormText();
}

function syncDormText() {
  const campus = swuDormitories[dormCampusIndex.value].campus;
  const area = swuDormitories[dormCampusIndex.value].areas[dormAreaIndex.value];
  selectedDormText.value = campus === area ? campus : `${campus} · ${area}`;
}

async function onSave() {
  if (!ensureLogin('/pages/profile-edit/profile-edit')) return;

  if (
    !nickName.value ||
    !studentId.value ||
    !phoneNumber.value ||
    collegeIndex.value === -1 ||
    majorIndex.value === -1 ||
    gradeIndex.value === -1 ||
    !selectedDormText.value
  ) {
    wx.showToast({ title: '请完善所有必填项', icon: 'none' });
    return;
  }

  if (studentId.value.length !== 15) {
    wx.showToast({ title: '请输入15位学号', icon: 'none' });
    return;
  }

  if (phoneNumber.value.length !== 11) {
    wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }

  const app = getApp();
  const existingUserInfo = app.globalData.userInfo || {};

  wx.showLoading({ title: '保存中...' });
  const { error } = await updateProfile({
    nickName: nickName.value,
    studentId: studentId.value,
    phoneNumber: phoneNumber.value,
    avatarUrl: avatarUrl.value,
    college: colleges[collegeIndex.value],
    major: majors.value[majorIndex.value],
    grade: grades[gradeIndex.value],
    location: selectedDormText.value,
    joinDate:
      existingUserInfo.joinDate ||
      new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
  });
  wx.hideLoading();

  if (error) {
    wx.showToast({ title: error.message || '保存失败', icon: 'none' });
    return;
  }

  wx.showToast({
    title: '资料已更新',
    icon: 'success',
    duration: 1500,
    success: () => {
      setTimeout(() => wx.navigateBack(), 1500);
    }
  });
}
</script>

<style scoped>
.container {
  padding: 20px 16px;
  background-color: #faf9f6;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  padding: 0 4px;
}

.page-title {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 13px;
  color: #8e8e93;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  padding: 0;
  width: 90px;
  height: 90px;
  border-radius: 45px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
  overflow: visible;
  border: none;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 45px;
  object-fit: cover;
}

.avatar-edit-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 28px;
  height: 28px;
  background: #e8e8ed;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

.camera-icon {
  width: 15px;
  height: 15px;
  opacity: 0.95;
}

.avatar-tip {
  font-size: 12px;
  color: #8e8e93;
}

/* Form Sections */
.form-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.input-group,
.picker-group {
  margin-bottom: 16px;
}

.input-group:last-child,
.picker-group:last-child {
  margin-bottom: 0;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: #8e8e93;
  margin-bottom: 8px;
  display: block;
}

.wechat-sync-btn {
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  font-size: 12px;
  color: #007aff;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
}

.input,
.picker-box {
  height: 48px;
  background: #f2f2f7;
  border-radius: 10px;
  padding: 0 16px;
  font-size: 15px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
}

.select {
  appearance: none;
  display: block;
  width: 100%;
  cursor: pointer;
}

.placeholder {
  color: #c7c7cc;
}

.dorm-selects {
  display: flex;
  gap: 8px;
}

.arrow {
  width: 12px;
  height: 12px;
  opacity: 0.2;
}

/* Footer Section */
.footer-section {
  margin-top: 32px;
  padding-bottom: 40px;
}

.agreement-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.agreement-icon {
  color: #1a1a1a;
  font-size: 14px;
  line-height: 1;
}

.agreement-text {
  font-size: 11px;
  color: #8e8e93;
  margin-left: 6px;
}

.submit-btn {
  background: #1a1a1a;
  color: #ffffff;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border: none;
  width: 100%;
  cursor: pointer;
}

.submit-btn:hover {
  opacity: 0.9;
}
</style>
