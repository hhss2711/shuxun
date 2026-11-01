/** 用户浏览历史管理 */

const HISTORY_KEY = 'shuxun_user_history';
const MAX_HISTORY_ITEMS = 50; // 最多保存50条历史记录

// 加载浏览历史
function loadHistory() {
  try {
    return wx.getStorageSync(HISTORY_KEY) || {};
  } catch (e) {
    return {};
  }
}

// 保存浏览历史
function saveHistory(history) {
  wx.setStorageSync(HISTORY_KEY, history);
}

// 添加浏览历史
export function addHistory(userId, bookId, bookInfo) {
  const history = loadHistory();
  
  if (!history[userId]) {
    history[userId] = [];
  }
  
  // 移除已存在的相同书籍记录
  history[userId] = history[userId].filter(item => item.bookId !== bookId);
  
  // 添加新记录到开头
  history[userId].unshift({
    bookId,
    bookInfo,
    timestamp: Date.now()
  });
  
  // 限制历史记录数量
  if (history[userId].length > MAX_HISTORY_ITEMS) {
    history[userId] = history[userId].slice(0, MAX_HISTORY_ITEMS);
  }
  
  saveHistory(history);
  return true;
}

// 获取用户浏览历史
export function getUserHistory(userId) {
  const history = loadHistory();
  return history[userId] || [];
}

// 清空用户浏览历史
export function clearHistory(userId) {
  const history = loadHistory();
  if (history[userId]) {
    delete history[userId];
    saveHistory(history);
    return true;
  }
  return false;
}

// 移除单条浏览历史
export function removeHistoryItem(userId, bookId) {
  const history = loadHistory();
  
  if (history[userId]) {
    history[userId] = history[userId].filter(item => item.bookId !== bookId);
    saveHistory(history);
    return true;
  }
  
  return false;
}
