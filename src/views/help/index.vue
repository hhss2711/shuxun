<template>
  <div class="container">
    <div class="section">
      <div class="section-title">常见问题</div>
      <div class="faq-list card">
        <div
          class="faq-item"
          v-for="(item, index) in faqs"
          :key="item.id"
          @click="toggleFaq(index)"
        >
          <div class="faq-header">
            <span class="faq-q">{{ item.question }}</span>
            <img class="arrow" :class="{ active: item.show }" src="/images/arrow.svg" alt="" />
          </div>
          <div class="faq-content" v-if="item.show">
            <span>{{ item.answer }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">联系我们</div>
      <div class="contact-card card">
        <div class="contact-item">
          <span class="label">反馈邮箱</span>
          <span class="value" @click="copyEmail">wwxx222@email.swu.edu.cn</span>
        </div>
        <div class="contact-tip">点击邮箱地址可直接复制</div>
      </div>
    </div>

    <div class="feedback-btn-box">
      <button class="btn-primary" @click="onFeedback">提交在线反馈</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const faqs = ref([
  {
    id: 1,
    question: '如何发布图书？',
    answer:
      '在首页点击下方的“发布”按钮，选择智能录入（扫码或拍照）或手动输入，填写课程信息和交易信息后即可发布。',
    show: false
  },
  {
    id: 2,
    question: '如何联系买家/卖家？',
    answer:
      '在图书详情页点击“联系卖家”，或者在“消息”页面查看已有的对话进行沟通。',
    show: false
  },
  {
    id: 3,
    question: '跨校区交易如何处理？',
    answer: '若买卖双方不在同一校区（如北碚与荣昌），建议协商邮寄，运费预估约为12元。',
    show: false
  },
  {
    id: 4,
    question: '信用分如何提升？',
    answer: '诚实描述书况、准时完成交易、获得好评均可提升信用分。',
    show: false
  }
]);

function toggleFaq(index) {
  faqs.value[index].show = !faqs.value[index].show;
}

function copyEmail() {
  wx.setClipboardData({
    data: 'wwxx222@email.swu.edu.cn',
    success: () => {
      wx.showToast({ title: '邮箱已复制', icon: 'success' });
    }
  });
}

// 原按钮为 open-type="feedback"（微信反馈页），浏览器无等价能力，降级为提示
function onFeedback() {
  wx.showToast({ title: '请在微信小程序中提交在线反馈', icon: 'none' });
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

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  margin-left: 8px;
}

.faq-list {
  padding: 0 16px;
  background-color: #ffffff;
  margin-bottom: 0;
}

.faq-item {
  padding: 16px 0;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-q {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  flex: 1;
}

.arrow {
  width: 14px;
  height: 14px;
  opacity: 0.3;
  transition: transform 0.2s;
}

.arrow.active {
  transform: rotate(90deg);
}

.faq-content {
  margin-top: 12px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.contact-card {
  padding: 16px;
  background-color: #ffffff;
  margin-bottom: 0;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.label {
  font-size: 15px;
  color: var(--text-main);
}

.value {
  font-size: 14px;
  color: #5856d6;
  text-decoration: underline;
  cursor: pointer;
}

.contact-tip {
  font-size: 12px;
  color: var(--apple-gray);
}

.feedback-btn-box {
  margin-top: 30px;
  padding: 0 16px;
}

.btn-primary {
  width: 100% !important;
}

@media (max-width: 767px) {
  .container {
    max-width: 100%;
  }
}
</style>
