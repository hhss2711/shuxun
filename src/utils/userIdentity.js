/** 用户身份识别模块 */

// 获取当前用户身份信息
export function getCurrentUserInfo() {
  const app = getApp();
  const globalData = app.globalData || {};
  
  // 默认用户信息（登录后 id 为 Supabase uuid）
  const defaultUser = {
    id: '',
    nickName: '未登录用户',
    avatarUrl: '/images/icons/avatar.png',
    campus: '北碚校区',
    college: '未知学院',
    grade: '未知年级',
    role: 'buyer' // 默认身份
  };
  
  return { ...defaultUser, ...globalData.userInfo };
}

// 判断当前用户是否为书籍的卖家
export function isCurrentUserSeller(bookSellerId) {
  const currentUser = getCurrentUserInfo();
  return currentUser.id === bookSellerId;
}