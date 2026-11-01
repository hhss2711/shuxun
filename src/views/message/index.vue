<template>
  <div class="message-container container">
    <div class="chat-list">
      <div
        v-for="item in conversations"
        :key="item.id"
        class="chat-item"
        @click="goToChat(item)"
      >
        <div class="avatar-box">
          <img class="avatar" :src="item.user.avatarUrl" alt="" />
          <div v-if="item.unreadCount > 0" class="badge">{{ item.unreadCount }}</div>
        </div>
        <div class="chat-info">
          <div class="chat-top">
            <span class="nickname">
              {{ item.user.nickName }}<template v-if="item.book.title"> | {{ item.book.title }}</template>
            </span>
            <span class="time">{{ item.time }}</span>
          </div>
          <div class="chat-bottom">
            <span class="last-msg">{{ item.lastMessage }}</span>
          </div>
        </div>
        <div v-if="item.book.cover" class="book-thumbnail">
          <img :src="item.book.cover" alt="" />
        </div>
      </div>
    </div>

    <div v-if="conversations.length === 0" class="empty-tip">
      <img class="empty-icon" src="/images/icons/goods.png" alt="" />
      <span>暂无消息</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getChatSessions } from '@/utils/chatStore';
import { getBookById } from '@/utils/bookStore';
import { fetchProfileById, initAuth } from '@/utils/authStore';

const conversations = ref([]);

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// 依据真实的聊天会话构建消息列表，新用户无会话时为空
async function buildConversations() {
  await initAuth();

  const sessions = await getChatSessions();
  const list = [];
  for (const session of sessions) {
    const [book, other] = await Promise.all([
      getBookById(session.bookId),
      fetchProfileById(session.otherUserId)
    ]);
    list.push({
      id: session.id,
      bookId: session.bookId,
      otherUserId: session.otherUserId,
      unreadCount: 0,
      user: {
        nickName: (other && other.nickName) || '用户',
        avatarUrl: (other && other.avatarUrl) || '/images/icons/avatar.png'
      },
      book: {
        title: book ? book.title : '',
        cover: book ? book.cover : ''
      },
      lastMessage: session.lastMessage ? session.lastMessage.content : '',
      time: formatTime(session.lastMessageTime)
    });
  }
  conversations.value = list;
}

onMounted(buildConversations);

function goToChat(item) {
  wx.navigateTo({
    url: `/pages/chat/chat?bookId=${item.bookId}&otherUserId=${item.otherUserId}`
  });
}
</script>

<style scoped>
.message-container {
  background-color: #ffffff;
  min-height: 100vh;
  padding-top: 10px;
}

.chat-list {
  padding: 0 16px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.avatar-box {
  position: relative;
  margin-right: 12px;
}

.avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background-color: var(--apple-light-gray);
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #ff3b30;
  color: #ffffff;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
  border: 2px solid #ffffff;
}

.chat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 12px;
}

.chat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.nickname {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
}

.time {
  font-size: 12px;
  color: var(--text-secondary);
}

.last-msg {
  font-size: 14px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-thumbnail {
  width: 45px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f0f0f0;
  flex-shrink: 0;
}

.book-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 120px;
}

.empty-icon {
  width: 60px;
  height: 60px;
  opacity: 0.1;
  margin-bottom: 12px;
}

.empty-tip span {
  font-size: 14px;
  color: #c7c7cc;
}
</style>
