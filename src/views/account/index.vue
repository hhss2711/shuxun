<template>
  <div class="account-container">
    <div class="section card">
      <div class="section-title">账号信息</div>
      <div class="account-item" @click="onAccountItemTap('username')">
        <div class="item-left">
          <div class="item-icon"></div>
          <span class="item-name">用户名</span>
        </div>
        <div class="item-right">
          <span class="item-value">{{ userInfo.nickName }}</span>
          <img class="arrow" src="/images/arrow.svg" alt="" />
        </div>
      </div>
      <div class="account-item" @click="onAccountItemTap('phone')">
        <div class="item-left">
          <div class="item-icon"></div>
          <span class="item-name">手机号码</span>
        </div>
        <div class="item-right">
          <span class="item-value">{{ userInfo.phoneNumber || '未绑定' }}</span>
          <img class="arrow" src="/images/arrow.svg" alt="" />
        </div>
      </div>
      <div class="account-item" @click="onAccountItemTap('studentId')">
        <div class="item-left">
          <div class="item-icon"></div>
          <span class="item-name">学号</span>
        </div>
        <div class="item-right">
          <span class="item-value">{{ userInfo.studentId || '未绑定' }}</span>
          <img class="arrow" src="/images/arrow.svg" alt="" />
        </div>
      </div>
    </div>

    <div class="section card">
      <div class="section-title">安全设置</div>
      <div class="account-item" @click="onAccountItemTap('password')">
        <div class="item-left">
          <div class="item-icon"></div>
          <span class="item-name">修改密码</span>
        </div>
        <div class="item-right">
          <img class="arrow" src="/images/arrow.svg" alt="" />
        </div>
      </div>
      <div class="account-item" @click="onAccountItemTap('phone')">
        <div class="item-left">
          <div class="item-icon"></div>
          <span class="item-name">绑定手机</span>
        </div>
        <div class="item-right">
          <span class="item-value">{{ userInfo.phoneNumber ? '已绑定' : '未绑定' }}</span>
          <img class="arrow" src="/images/arrow.svg" alt="" />
        </div>
      </div>
      <div class="account-item" @click="onAccountItemTap('email')">
        <div class="item-left">
          <div class="item-icon"></div>
          <span class="item-name">绑定邮箱</span>
        </div>
        <div class="item-right">
          <span class="item-value">未绑定</span>
          <img class="arrow" src="/images/arrow.svg" alt="" />
        </div>
      </div>
    </div>

    <div class="section card">
      <div class="section-title">隐私设置</div>
      <div class="account-item" @click="onAccountItemTap('visibility')">
        <div class="item-left">
          <div class="item-icon"></div>
          <span class="item-name">谁可以看我的发布</span>
        </div>
        <div class="item-right">
          <span class="item-value">所有人</span>
          <img class="arrow" src="/images/arrow.svg" alt="" />
        </div>
      </div>
      <div class="account-item" @click="onAccountItemTap('location')">
        <div class="item-left">
          <div class="item-icon"></div>
          <span class="item-name">位置信息</span>
        </div>
        <div class="item-right">
          <span class="item-value">已开启</span>
          <img class="arrow" src="/images/arrow.svg" alt="" />
        </div>
      </div>
    </div>

    <div class="danger-zone card">
      <div class="section-title">危险操作</div>
      <div class="account-item danger-item" @click="onAccountItemTap('delete')">
        <div class="item-left">
          <div class="item-icon"></div>
          <span class="item-name danger-text">注销账号</span>
        </div>
        <div class="item-right">
          <img class="arrow" src="/images/arrow.svg" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const userInfo = ref({
  nickName: '张同学',
  phoneNumber: '138****8888',
  studentId: '2023123456'
});

// onLoad -> 顶层执行
refreshUserInfo();

function refreshUserInfo() {
  const app = getApp();
  const globalUserInfo = (app.globalData && app.globalData.userInfo) || {};
  userInfo.value = {
    ...userInfo.value,
    ...globalUserInfo
  };
}

function onAccountItemTap(id) {
  switch (id) {
    case 'username':
      wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
      break;
    case 'phone':
      wx.showModal({
        title: '绑定手机',
        content: '请输入您的手机号码',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: '手机号绑定成功', icon: 'success' });
          }
        }
      });
      break;
    case 'studentId':
      wx.showModal({
        title: '绑定学号',
        content: '请输入您的学号',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: '学号绑定成功', icon: 'success' });
          }
        }
      });
      break;
    case 'password':
      wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
      break;
    case 'email':
      wx.showModal({
        title: '绑定邮箱',
        content: '请输入您的邮箱地址',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: '邮箱绑定成功', icon: 'success' });
          }
        }
      });
      break;
    case 'visibility':
      wx.showActionSheet({
        itemList: ['所有人', '仅好友', '仅自己'],
        success: () => {
          wx.showToast({ title: '设置成功', icon: 'success' });
        }
      });
      break;
    case 'location':
      wx.showActionSheet({
        itemList: ['开启', '关闭'],
        success: () => {
          wx.showToast({ title: '设置成功', icon: 'success' });
        }
      });
      break;
    case 'delete':
      wx.showModal({
        title: '注销账号',
        content: '确定要注销账号吗？此操作不可恢复。',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: '账号注销成功', icon: 'success' });
          }
        }
      });
      break;
    default:
      wx.showToast({ title: '功能开发中', icon: 'none' });
  }
}
</script>

<style scoped>
.account-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 8px;
  box-sizing: border-box;
  max-width: 720px;
  margin: 0 auto;
}

/* 通用卡片样式 */
.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
  padding: 0;
}

/* section */
.section {
  padding: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 12px;
}

/* 账号项 */
.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 0.5px solid #f0f0f0;
  cursor: pointer;
}

.account-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
}

.item-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background-color: #e5e5e5;
  border-radius: 4px;
}

.item-name {
  font-size: 14px;
  color: #000000;
}

.item-right {
  display: flex;
  align-items: center;
}

.item-value {
  font-size: 14px;
  color: #666666;
  margin-right: 6px;
}

.arrow {
  width: 12px;
  height: 12px;
}

.account-item:active {
  background-color: #f9f9f9;
}

/* 危险操作 */
.danger-zone {
  margin-top: 16px;
}

.danger-item {
  padding: 12px 0;
}

.danger-text {
  color: #ff4d4f;
}

@media (max-width: 767px) {
  .account-container {
    max-width: 100%;
  }
}
</style>
