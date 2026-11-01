<template>
  <div class="chat-container">
    <!-- 顶部：关联书籍卡片（无关联书籍时不展示） -->
    <div v-if="hasBook" class="chat-header card" @click="goToBookDetail">
      <div class="book-card">
        <img class="book-cover" :src="book.cover" alt="" />
        <div class="book-info">
          <div class="book-title">{{ book.title }}</div>
          <div class="book-price">¥{{ book.price }}</div>
          <div class="book-location">{{ book.location }}</div>
          <div v-if="isSeller" class="book-status">
            <span class="status-label">状态：</span>
            <span class="status-value" :class="statusClass">{{ book.status }}</span>
          </div>
        </div>
        <div
          v-if="!isSeller && book.status === ON_SALE"
          class="action-btn buy-btn"
          @click.stop="goToOrder"
        >
          下单
        </div>
        <div v-if="isSeller" class="action-btn edit-btn" @click.stop="onEditBook">编辑</div>
      </div>
    </div>

    <!-- 卖家状态管理（仅卖家且有关联书籍时可见） -->
    <div v-if="isSeller && hasBook" class="status-management">
      <div class="status-options">
        <div
          class="status-btn"
          :class="{ active: book.status === ON_SALE }"
          @click="updateStatus(ON_SALE)"
        >
          在售
        </div>
        <div
          class="status-btn"
          :class="{ active: book.status === DELISTED }"
          @click="updateStatus(DELISTED)"
        >
          已下架
        </div>
        <div
          class="status-btn"
          :class="{ active: book.status === SOLD }"
          @click="updateStatus(SOLD)"
        >
          已售出
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div ref="messageListRef" class="message-list">
      <div class="messages-container">
        <div
          v-for="item in messages"
          :key="item.id"
          class="msg-item"
          :class="item.role"
        >
          <!-- 对方消息 -->
          <template v-if="item.role === 'other'">
            <img
              class="avatar"
              :src="otherUser.avatarUrl"
              alt=""
              @click="goToUserDetail(otherUser.id)"
            />
            <div class="msg-bubble other">
              <span class="msg-text">{{ item.content }}</span>
              <div class="msg-time">{{ item.time }}</div>
            </div>
          </template>

          <!-- 自己消息 -->
          <template v-else>
            <div class="msg-bubble me">
              <span class="msg-text">{{ item.content }}</span>
              <div class="msg-time">{{ item.time }}</div>
            </div>
            <img
              class="avatar"
              :src="currentUser.avatarUrl"
              alt=""
              @click="goToUserDetail(currentUser.id)"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- 底部输入区域 -->
    <div class="bottom-bar">
      <!-- 快速回复 -->
      <div class="quick-replies">
        <div class="reply-tag" @click="onQuickReply('书还在吗？')">书还在吗？</div>
        <div class="reply-tag" @click="onQuickReply('可以便宜点吗？')">可以便宜点吗？</div>
        <div class="reply-tag" @click="onQuickReply('今天方便吗？')">今天方便吗？</div>
        <div class="reply-tag" @click="onQuickReply('在哪里交易？')">在哪里交易？</div>
        <div class="reply-tag" @click="onQuickReply('什么时候可以取？')">什么时候可以取？</div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-actions">
          <img class="action-icon" src="/images/icons/camera.svg" alt="" @click="sendImage" />
        </div>

        <input
          class="chat-input"
          :placeholder="isSeller ? '回复买家...' : '想对卖家说...'"
          v-model="inputText"
          @keyup.enter="onSend"
        />

        <div class="send-btn" :class="{ active: inputText }" @click="onSend">
          {{ inputText ? '发送' : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getBookById, updateBookStatus, ON_SALE, DELISTED, SOLD } from '@/utils/bookStore';
import { getCurrentUserInfo, isCurrentUserSeller } from '@/utils/userIdentity';
import { saveMessage, getChatMessages } from '@/utils/chatStore';
import { fetchProfileById, initAuth } from '@/utils/authStore';

const route = useRoute();

const bookIdArg = Number(route.query.bookId ?? route.query.id ?? 0) || 0;
const otherUserIdArg = String(
  route.query.otherUserId ?? route.query.sellerId ?? route.query.userId ?? ''
);

// 用户信息
const currentUser = ref({});
const otherUser = ref({});

// 书籍信息
const book = ref({
  id: 0,
  title: '',
  price: 0,
  cover: '',
  status: ON_SALE,
  sellerId: '',
  location: ''
});

// 聊天相关
const messages = ref([]);
const inputText = ref('');
const messageListRef = ref(null);

// 界面状态
const isSeller = ref(false);

// 是否有关联书籍（从用户主页进入的会话没有书籍）
const hasBook = computed(() => Boolean(book.value.id));

// 书籍状态对应的样式类（用于状态标签着色）
const statusClass = computed(() => {
  if (book.value.status === SOLD) return 'sold';
  if (book.value.status === DELISTED) return 'delisted';
  return 'onsale';
});

async function init() {
  await initAuth();

  currentUser.value = getCurrentUserInfo();

  const b = await getBookById(bookIdArg);
  // 书籍不存在（未关联或已删除）时 id 置 0，顶部商品栏不展示
  book.value = {
    id: b ? b.id : 0,
    title: b ? b.title : '',
    price: b ? b.price : 0,
    cover: (b && b.cover) || '',
    status: (b && b.status) || ON_SALE,
    sellerId: (b && b.sellerId) || '',
    location: (b && b.location) || ''
  };

  const iAmSeller = isCurrentUserSeller(book.value.sellerId);
  isSeller.value = iAmSeller;

  // 对方用户：卖家视角下为买家，买家视角下为书籍卖家
  const otherId = otherUserIdArg || (iAmSeller ? '' : book.value.sellerId);
  const other = otherId ? await fetchProfileById(otherId) : null;
  const otherName =
    (other && other.nickName) || (iAmSeller ? '买家' : (b ? b.sellerName : '')) || '用户';
  const otherAvatar = (other && other.avatarUrl) || '/images/icons/avatar.png';
  otherUser.value = { id: otherId, nickName: otherName, avatarUrl: otherAvatar };

  wx.setNavigationBarTitle({ title: otherName });

  // 加载真实聊天记录，新会话为空
  messages.value = await getChatMessages(bookIdArg, otherId);
  scrollToBottom();
}

// 初始化（对应原页面 onLoad）
onMounted(init);

// 点击书籍卡片查看详情
function goToBookDetail() {
  wx.navigateTo({
    url: `/pages/detail/detail?id=${book.value.id}`
  });
}

// 买家操作：立即购买
function goToOrder() {
  wx.navigateTo({
    url: `/pages/order-confirm/order-confirm?bookId=${book.value.id}`
  });
}

// 卖家操作：编辑书籍信息
function onEditBook() {
  wx.navigateTo({
    url: `/pages/publish/publish?edit=1&bookId=${book.value.id}`
  });
}

// 卖家操作：更新书籍状态
async function updateStatus(newStatus) {
  if (newStatus === book.value.status) return;
  const confirmText =
    newStatus === SOLD
      ? '确认标记为已售出？'
      : newStatus === DELISTED
        ? '确认标记为已下架？'
        : '确认重新上架为在售？';

  wx.showModal({
    title: '确认操作',
    content: confirmText,
    success: async (res) => {
      if (!res.confirm) return;
      const ok = await updateBookStatus(book.value.id, newStatus);
      if (!ok) {
        wx.showToast({ title: '状态更新失败', icon: 'none' });
        return;
      }
      book.value.status = newStatus;
      wx.showToast({ title: '状态更新成功', icon: 'success' });
    }
  });
}

// 发送消息
function onSend() {
  if (!inputText.value) return;
  addMessage(inputText.value, 'me');
  inputText.value = '';
}

// 发送图片
function sendImage() {
  wx.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: () => {
      addMessage('[图片]', 'me');
      // 实际应用中应该上传图片并发送图片URL
    }
  });
}

// 快捷回复
function onQuickReply(text) {
  addMessage(text, 'me');
}

// 添加并保存消息
async function addMessage(content, role) {
  if (!otherUser.value.id) {
    wx.showToast({ title: '会话对象不存在', icon: 'none' });
    return;
  }
  const message = {
    id: Date.now(),
    role: role,
    content: content,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  messages.value.push(message);
  scrollToBottom();

  const saved = await saveMessage(book.value.id, otherUser.value.id, message);
  if (saved) {
    // 用后端返回的真实记录替换本地临时项
    const idx = messages.value.findIndex((m) => m.id === message.id);
    if (idx > -1) messages.value.splice(idx, 1, saved);
  }
}

// 滚动到底部
function scrollToBottom() {
  setTimeout(() => {
    const el = messageListRef.value;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, 100);
}

// 跳转到用户主页
function goToUserDetail(userId) {
  wx.navigateTo({
    url: `/pages/user-detail/user-detail?userId=${userId}`
  });
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  max-width: 720px;
  margin: 0 auto;
  background-color: var(--bg-color);
}

/* 聊天头部 - 关联书籍卡片 */
.chat-header {
  margin: 8px 12px;
  padding: 10px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-height: 90px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-header:hover {
  transform: scale(0.99);
  opacity: 0.9;
}

/* 书籍卡片 */
.book-card {
  display: flex;
  align-items: center;
  gap: 8px;
}

.book-cover {
  width: 50px;
  height: 60px;
  border-radius: 5px;
  background-color: #f0f0f0;
  object-fit: cover;
  flex-shrink: 0;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-price {
  font-size: 14px;
  font-weight: 800;
  color: #ff3b30;
  margin-bottom: 2px;
}

.book-location {
  font-size: 9px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.book-status {
  font-size: 9px;
  display: flex;
  align-items: center;
}

.status-label {
  color: var(--text-secondary);
  margin-right: 2px;
}

.status-value {
  font-weight: 600;
}

.status-value.onsale {
  color: #07c160;
}

.status-value.delisted {
  color: #ff9500;
}

.status-value.sold {
  color: #8e8e93;
}

/* 操作按钮 */
.action-btn {
  padding: 6px 12px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 5px;
  white-space: nowrap;
  transition: all 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}

.action-btn:hover {
  opacity: 0.8;
}

.buy-btn {
  background: linear-gradient(90deg, #07c160 0%, #05a850 100%);
  color: #ffffff;
}

.edit-btn {
  background: #f2f2f7;
  color: var(--text-main);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* 卖家状态管理 */
.status-management {
  margin: 0 12px 8px;
  padding: 8px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.status-options {
  display: flex;
  gap: 6px;
  justify-content: space-between;
}

.status-btn {
  flex: 1;
  text-align: center;
  padding: 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: #f2f2f7;
  color: var(--text-secondary);
  transition: all 0.2s;
  cursor: pointer;
}

.status-btn.active {
  background: var(--primary-color);
  color: #ffffff;
}

.status-btn:hover {
  transform: scale(0.98);
  opacity: 0.8;
}

/* 消息列表 */
.message-list {
  flex: 1;
  min-height: 0;
  padding: 8px 12px;
  overflow-y: auto;
}

.messages-container {
  padding-bottom: 20px;
}

.msg-item {
  display: flex;
  margin-bottom: 10px;
  padding: 0 8px;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}

.msg-item.other {
  justify-content: flex-start;
}

.msg-item.me {
  justify-content: flex-end;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  cursor: pointer;
}

.msg-item.other .avatar {
  margin-right: 6px;
}

.msg-item.me .avatar {
  margin-left: 6px;
}

.msg-bubble {
  max-width: 65%;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.4;
  position: relative;
  z-index: 1;
}

.msg-bubble.other {
  background: #ffffff;
  color: var(--text-main);
  border-radius: 0 8px 8px 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.msg-bubble.me {
  background: #333333;
  color: #ffffff;
  border-radius: 8px 0 8px 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.msg-text {
  word-break: break-word;
}

.msg-time {
  font-size: 9px;
  margin-top: 3px;
  opacity: 0.7;
}

.msg-bubble.other .msg-time {
  color: rgba(0, 0, 0, 0.4);
}

.msg-bubble.me .msg-time {
  color: rgba(255, 255, 255, 0.7);
}

/* 底部输入区域 */
.bottom-bar {
  background: var(--bg-color);
  padding: 10px 12px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
}

/* 快速回复 */
.quick-replies {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  overflow-x: auto;
}

.reply-tag {
  white-space: nowrap;
  font-size: 12px;
  color: var(--text-secondary);
  background: #f2f2f7;
  padding: 6px 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  cursor: pointer;
}

.reply-tag:hover {
  background: #e5e5ea;
}

/* 输入区域 */
.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  width: 24px;
  height: 24px;
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
}

.action-icon:hover {
  opacity: 0.8;
}

.chat-input {
  flex: 1;
  background: #f2f2f7;
  height: 40px;
  border-radius: 20px;
  padding: 0 16px;
  font-size: 14px;
  border: 2px solid transparent;
  transition: all 0.2s;
  outline: none;
}

.chat-input:focus {
  border-color: #007aff;
  background: #ffffff;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f2f2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-secondary);
  transition: all 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}

.send-btn.active {
  background: var(--primary-color);
  color: #ffffff;
}

.send-btn:hover {
  transform: scale(0.98);
}

/* 移动端适配 */
@media (max-width: 767px) {
  .chat-container {
    max-width: none;
    height: calc(100vh - 56px - 64px);
  }

  .chat-header {
    margin: 6px 8px;
    padding: 8px;
  }

  .book-cover {
    width: 40px;
    height: 50px;
  }

  .msg-bubble {
    max-width: 70%;
    padding: 7px 9px;
  }

  .quick-replies {
    gap: 6px;
  }

  .reply-tag {
    padding: 6px 10px;
    font-size: 11px;
  }
}
</style>
