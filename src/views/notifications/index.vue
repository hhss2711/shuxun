<template>
  <div class="container">
    <div class="setting-list card">
      <div class="setting-item" v-for="item in settings" :key="item.id">
        <div class="setting-info">
          <span class="setting-name">{{ item.name }}</span>
          <span class="setting-desc">{{ item.desc }}</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="item.checked" @change="onSwitchChange(item.id, $event)" />
          <span class="slider"></span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const settings = reactive([
  { id: 'chat', name: '私信消息提醒', desc: '开启后将收到买家或卖家的消息推送', checked: true },
  { id: 'order', name: '交易状态更新', desc: '订单被预订、售出时及时通知您', checked: true },
  { id: 'system', name: '系统公告', desc: '接收平台活动及重要规则更新', checked: false }
]);

function onSwitchChange(id, e) {
  const value = e.target.checked;
  console.log(`Notification ${id} changed to ${value}`);
}
</script>

<style scoped>
.container {
  padding: 16px;
  background-color: var(--bg-color);
  min-height: 100vh;
  max-width: 720px;
  margin: 0 auto;
  box-sizing: border-box;
}

.setting-list {
  padding: 0 16px;
  background-color: #ffffff;
  margin-bottom: 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.05);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  margin-right: 16px;
}

.setting-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.setting-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 自定义开关（替代小程序 switch 组件） */
.switch {
  position: relative;
  display: inline-block;
  width: 51px;
  height: 31px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background-color: #e5e5e5;
  border-radius: 31px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.slider::before {
  content: '';
  position: absolute;
  height: 27px;
  width: 27px;
  left: 2px;
  bottom: 2px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background-color: #1a1a1a;
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

@media (max-width: 767px) {
  .container {
    max-width: 100%;
  }
}
</style>
