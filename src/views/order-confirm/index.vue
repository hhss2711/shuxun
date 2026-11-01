<template>
  <div class="order-page container">
    <div class="order-wrap">
      <div class="tip-banner">
        <span class="tip-title">拍下即锁定商品</span>
        <span class="tip-desc">平台不参与收款；付款与交货请与卖家自行约定后当面完成。</span>
      </div>

      <div class="card goods-card">
        <div class="section-label">商品信息</div>
        <div class="goods-row">
          <img class="goods-cover" :src="book.cover" alt="" />
          <div class="goods-meta">
            <span class="goods-title">{{ book.title }}</span>
            <span class="goods-seller">卖家：{{ book.sellerName }}</span>
            <div class="goods-price-row">
              <span class="currency">¥</span>
              <span class="amount">{{ book.price }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-label">约定说明（选填）</div>
        <textarea
          class="meetup-input"
          v-model="meetupNote"
          placeholder="例：周三下午图书馆门口、橘园3舍楼下等"
          maxlength="200"
        ></textarea>
      </div>

      <div class="card fee-card">
        <div class="fee-row">
          <span>商品标价</span>
          <span>¥{{ book.price }}</span>
        </div>
        <div class="fee-row total">
          <span>合计</span>
          <span class="total-price">¥{{ totalStr }}</span>
        </div>
      </div>

      <div class="legal-note">
        拍下后商品将下架，请在订单中与卖家约定时间地点完成交易。
      </div>

      <div class="bottom-placeholder"></div>
    </div>

    <div class="bottom-bar-safe">
      <div class="bar-inner">
        <div class="bar-total">
          <span class="lbl">合计</span>
          <span class="sum">¥{{ totalStr }}</span>
        </div>
        <div class="btn-submit" @click="submitOrder">确认拍下</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getBookBriefById } from '@/utils/bookDetailHelper';
import { createOrder } from '@/utils/orderStore';
import { delistBook, ON_SALE } from '@/utils/bookStore';

const route = useRoute();

const book = ref({});
const meetupNote = ref('');
const totalStr = ref('0.00');

onMounted(async () => {
  const brief = await getBookBriefById(route.query.bookId);
  if (!brief) {
    wx.showToast({ title: '商品不存在', icon: 'none' });
    setTimeout(() => wx.navigateBack(), 1500);
    return;
  }
  book.value = brief;
  totalStr.value = Number(brief.price).toFixed(2);
});

async function submitOrder() {
  if (!book.value.id) return;
  if (book.value.status !== ON_SALE) {
    wx.showToast({ title: '该商品已被拍下', icon: 'none' });
    return;
  }
  wx.showLoading({ title: '拍下中...' });
  try {
    await createOrder({
      bookId: book.value.id,
      bookTitle: book.value.title,
      bookCover: book.value.cover,
      goodsPrice: book.value.price,
      sellerId: book.value.sellerId,
      meetupNote: meetupNote.value
    });
    // 拍下后商品下架
    await delistBook(book.value.id);
    wx.hideLoading();
    wx.showToast({ title: '拍下成功', icon: 'success' });
    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/order-list/order-list'
      });
    }, 800);
  } catch (error) {
    console.error('拍下失败:', error);
    wx.hideLoading();
    wx.showToast({ title: '拍下失败，请重试', icon: 'none' });
  }
}
</script>

<style scoped>
.order-page {
  padding-top: 12px;
  padding-bottom: 100px;
  min-height: 100vh;
  box-sizing: border-box;
}

.order-wrap {
  max-width: 640px;
  margin: 0 auto;
}

.tip-banner {
  background: linear-gradient(135deg, #fff8e6 0%, #ffefd0 100%);
  border-radius: var(--border-radius-md);
  padding: 12px 14px;
  margin-bottom: 12px;
}

.tip-title {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #b8860b;
  margin-bottom: 4px;
}

.tip-desc {
  font-size: 12px;
  color: #8b6914;
  line-height: 1.5;
}

.card {
  background: #ffffff;
  border-radius: var(--border-radius-lg);
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 10px;
}

.goods-row {
  display: flex;
  gap: 12px;
}

.goods-cover {
  width: 80px;
  height: 100px;
  border-radius: 6px;
  background: #f0f0f0;
  object-fit: cover;
}

.goods-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.goods-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.35;
}

.goods-seller {
  font-size: 12px;
  color: var(--text-secondary);
}

.goods-price-row {
  margin-top: auto;
  color: #ff5a5f;
  font-weight: 700;
}

.goods-price-row .currency {
  font-size: 13px;
}

.goods-price-row .amount {
  font-size: 20px;
}

.meetup-input {
  width: 100%;
  min-height: 70px;
  padding: 10px;
  font-size: 14px;
  background: var(--apple-light-gray);
  border-radius: var(--border-radius-sm);
  box-sizing: border-box;
  border: none;
  outline: none;
  resize: vertical;
  font-family: inherit;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--text-main);
  padding: 6px 0;
}

.fee-row.sub {
  color: var(--text-secondary);
  font-size: 13px;
}

.fee-row.total {
  padding-top: 10px;
  font-size: 15px;
  font-weight: 600;
}

.total-price {
  color: #ff5a5f;
  font-size: 18px;
}

.legal-note {
  font-size: 11px;
  color: var(--apple-gray);
  line-height: 1.5;
  padding: 0 4px 12px;
}

.bottom-placeholder {
  height: 20px;
}

.bottom-bar-safe {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.bar-inner {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  gap: 12px;
}

.bar-total {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bar-total .lbl {
  font-size: 11px;
  color: var(--text-secondary);
}

.bar-total .sum {
  font-size: 18px;
  font-weight: 700;
  color: #ff5a5f;
}

.btn-submit {
  flex: 1;
  max-width: 210px;
  text-align: center;
  background: linear-gradient(90deg, #ff6b35 0%, #ff5a5f 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 24px;
  border-radius: 24px;
  cursor: pointer;
}

.btn-submit:active {
  opacity: 0.9;
}
</style>
