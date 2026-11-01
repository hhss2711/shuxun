<template>
  <div class="list-page container">
    <div class="list-wrap">
      <div class="empty" v-if="orders.length === 0">
        <span>暂无订单</span>
        <div class="btn-link" @click="goIndex">去首页逛逛</div>
      </div>

      <div
        class="order-item card"
        v-for="item in orders"
        :key="item.id"
      >
        <div class="item-top">
          <span class="order-id">订单 {{ item.id }}</span>
          <span class="badge" :class="item.status">{{ item.statusText }}</span>
        </div>
        <div class="item-goods">
          <img class="thumb" :src="item.bookCover" alt="" />
          <div class="info">
            <span class="title">{{ item.bookTitle }}</span>
            <span class="sub">卖家：{{ item.sellerName }}</span>
            <span class="sub" v-if="item.meetupNote">约定：{{ item.meetupNote }}</span>
          </div>
          <div class="price-col">
            <span class="p">¥{{ item.totalStr }}</span>
          </div>
        </div>
        <div class="trade-tip">平台不参与收款，请与卖家自行联系完成付款与交货</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { listOrders } from '@/utils/orderStore';

const orders = ref([]);

function decorate(o) {
  return {
    ...o,
    statusText: '已拍下',
    totalStr: Number(o.price).toFixed(2)
  };
}

async function refresh() {
  orders.value = (await listOrders()).map(decorate);
}

// onShow
onMounted(refresh);

function goIndex() {
  wx.switchTab({ url: '/pages/index/index' });
}
</script>

<style scoped>
.list-page {
  padding-top: 12px;
  padding-bottom: 24px;
  min-height: 100vh;
  box-sizing: border-box;
}

.list-wrap {
  max-width: 640px;
  margin: 0 auto;
}

.empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.btn-link {
  margin-top: 16px;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
}

.order-item {
  margin-bottom: 12px;
  padding: 12px 14px;
  cursor: pointer;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-id {
  font-size: 12px;
  color: var(--apple-gray);
}

.badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.badge.reserved {
  background: #fff3e0;
  color: #e65100;
}

.item-goods {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.thumb {
  width: 60px;
  height: 75px;
  border-radius: 5px;
  background: #eee;
  flex-shrink: 0;
  object-fit: cover;
}

.info {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sub {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-secondary);
}

.price-col {
  text-align: right;
  flex-shrink: 0;
}

.p {
  font-size: 16px;
  font-weight: 700;
  color: #ff5a5f;
}

.trade-tip {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 11px;
  color: var(--text-secondary);
}
</style>
