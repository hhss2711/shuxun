/** 分享功能工具模块 */

// 生成分享链接
export function generateShareLink(bookId, title, price) {
  const baseUrl = 'https://shuxun.example.com/book';
  return `${baseUrl}/${bookId}?title=${encodeURIComponent(title)}&price=${price}`;
}

// 生成分享描述文案
export function generateShareText(bookInfo, userInfo) {
  const texts = [
    `【书循】${bookInfo.title} 仅售¥${bookInfo.price}`,
    `校内二手教材：${bookInfo.title}，${bookInfo.condition}，适合${bookInfo.courseName}`,
    `急出${bookInfo.title}，${bookInfo.college}同学看过来！`,
    `超值教材：${bookInfo.title}，原价¥${bookInfo.originalPrice}，现仅¥${bookInfo.price}`,
    `【西南大学】${bookInfo.title}教材转让，${bookInfo.location}可面交`
  ];
  
  return texts[Math.floor(Math.random() * texts.length)];
}

// 生成分享卡片数据（用于微信分享）
export function generateShareCardData(bookInfo) {
  return {
    title: `【书循】${bookInfo.title}`,
    desc: `${bookInfo.condition} | ¥${bookInfo.price} | ${bookInfo.location}`,
    imageUrl: bookInfo.cover || '/images/default-goods-image.png',
    path: `/pages/detail/detail?id=${bookInfo.id}`
  };
}

// 模拟生成分享图片（实际项目需要使用canvas）
export async function generateShareImage(bookInfo, userInfo) {
  return new Promise((resolve) => {
    // 这里应该使用canvas绘制分享图片
    // 由于canvas API复杂，这里返回模拟数据
    
    const shareImageData = {
      title: bookInfo.title,
      price: bookInfo.price,
      originalPrice: bookInfo.originalPrice,
      condition: bookInfo.condition,
      location: bookInfo.location,
      courseName: bookInfo.courseName,
      sellerName: userInfo.nickName || '书循用户',
      qrCode: 'https://shuxun.example.com/qr/share',
      timestamp: new Date().toLocaleDateString()
    };
    
    // 模拟生成时间
    setTimeout(() => {
      resolve({
        success: true,
        imageData: shareImageData,
        message: '分享图片生成成功'
      });
    }, 1000);
  });
}

// 复制到剪贴板
export function copyToClipboard(text, successMsg = '已复制到剪贴板') {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: successMsg,
          icon: 'success'
        });
        resolve(true);
      },
      fail: (err) => {
        console.error('复制失败:', err);
        reject(err);
      }
    });
  });
}

// 保存图片到相册
export function saveImageToAlbum(tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        wx.showToast({
          title: '图片已保存到相册',
          icon: 'success'
        });
        resolve(true);
      },
      fail: (err) => {
        console.error('保存图片失败:', err);
        wx.showToast({
          title: '保存失败，请检查权限',
          icon: 'error'
        });
        reject(err);
      }
    });
  });
}

// 检查相册权限
export function checkAlbumPermission() {
  return new Promise((resolve) => {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => resolve(true),
            fail: () => resolve(false)
          });
        } else {
          resolve(true);
        }
      },
      fail: () => resolve(false)
    });
  });
}

// 生成短链接（模拟）
export function generateShortUrl(longUrl) {
  // 实际应该调用短链接API
  const shortId = Math.random().toString(36).substring(2, 8);
  return `https://shxun.cn/${shortId}`;
}

// 分享统计
export function trackShareEvent(bookId, shareType, platform = 'wechat') {
  // 实际应该调用统计API
  console.log(`分享统计: 书籍${bookId}, 类型${shareType}, 平台${platform}`);
  
  // 保存分享记录到本地
  try {
    const shareHistory = wx.getStorageSync('share_history') || [];
    shareHistory.unshift({
      bookId,
      shareType,
      platform,
      timestamp: Date.now()
    });
    
    // 只保留最近50条记录
    if (shareHistory.length > 50) {
      shareHistory.pop();
    }
    
    wx.setStorageSync('share_history', shareHistory);
  } catch (e) {
    console.error('保存分享记录失败:', e);
  }
}