/**
 * 微信小程序 API 的浏览器兼容层
 * 让从 miniprogram 迁移过来的 utils 中的 wx.* / getApp() 调用无需改动即可运行。
 * 在 main.js 中通过 installWxCompat(router) 安装。
 */

const STORAGE_PREFIX = 'shuxun_web:';

/* ---------------- Storage ---------------- */

const storage = {
  getStorageSync(key) {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return '';
    try {
      return JSON.parse(raw);
    } catch (e) {
      return raw;
    }
  },
  setStorageSync(key, value) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  },
  removeStorageSync(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },
  clearStorageSync() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }
};

/* ---------------- 轻量 UI 组件（DOM 实现） ---------------- */

function ensureContainer() {
  let el = document.getElementById('wx-ui-layer');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wx-ui-layer';
    document.body.appendChild(el);
  }
  return el;
}

function showToast({ title = '', icon = 'none', duration = 2000 } = {}) {
  const layer = ensureContainer();
  const toast = document.createElement('div');
  toast.className = 'wx-toast';
  toast.textContent = title;
  layer.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

let loadingEl = null;
function showLoading({ title = '加载中' } = {}) {
  hideLoading();
  const layer = ensureContainer();
  loadingEl = document.createElement('div');
  loadingEl.className = 'wx-loading-mask';
  loadingEl.innerHTML = `<div class="wx-loading"><span class="wx-spinner"></span><span>${title}</span></div>`;
  layer.appendChild(loadingEl);
}
function hideLoading() {
  if (loadingEl) {
    loadingEl.remove();
    loadingEl = null;
  }
}

function showModal(options = {}) {
  const {
    title = '',
    content = '',
    showCancel = true,
    confirmText = '确定',
    cancelText = '取消',
    success
  } = options;

  return new Promise((resolve) => {
    const layer = ensureContainer();
    const mask = document.createElement('div');
    mask.className = 'wx-modal-mask';
    mask.innerHTML = `
      <div class="wx-modal">
        ${title ? `<div class="wx-modal-title">${title}</div>` : ''}
        <div class="wx-modal-content">${content}</div>
        <div class="wx-modal-actions">
          ${showCancel ? `<button class="wx-modal-btn cancel">${cancelText}</button>` : ''}
          <button class="wx-modal-btn confirm">${confirmText}</button>
        </div>
      </div>`;
    layer.appendChild(mask);

    const close = (res) => {
      mask.remove();
      if (success) success(res);
      resolve(res);
    };
    mask.querySelector('.confirm').onclick = () => close({ confirm: true, cancel: false });
    const cancelBtn = mask.querySelector('.cancel');
    if (cancelBtn) cancelBtn.onclick = () => close({ confirm: false, cancel: true });
  });
}

function showActionSheet(options = {}) {
  const { itemList = [], success, fail } = options;
  return new Promise((resolve) => {
    const layer = ensureContainer();
    const mask = document.createElement('div');
    mask.className = 'wx-actionsheet-mask';
    mask.innerHTML = `
      <div class="wx-actionsheet">
        ${itemList.map((t, i) => `<button class="wx-actionsheet-item" data-index="${i}">${t}</button>`).join('')}
        <button class="wx-actionsheet-item cancel">取消</button>
      </div>`;
    layer.appendChild(mask);

    const close = (res, isFail) => {
      mask.remove();
      if (isFail && fail) fail(res);
      if (!isFail && success) success(res);
      resolve(res);
    };
    mask.querySelectorAll('.wx-actionsheet-item').forEach((btn) => {
      btn.onclick = () => {
        if (btn.classList.contains('cancel')) return close({ errMsg: 'showActionSheet:fail cancel' }, true);
        close({ tapIndex: Number(btn.dataset.index) });
      };
    });
    mask.onclick = (e) => {
      if (e.target === mask) close({ errMsg: 'showActionSheet:fail cancel' }, true);
    };
  });
}

/* ---------------- 导航（对接 vue-router） ---------------- */

let routerRef = null;

const navigation = {
  navigateTo({ url, success, fail }) {
    if (!routerRef) return fail && fail({ errMsg: 'router not ready' });
    routerRef.push(url).then(() => success && success()).catch((e) => fail && fail(e));
  },
  redirectTo({ url, success, fail }) {
    if (!routerRef) return fail && fail({ errMsg: 'router not ready' });
    routerRef.replace(url).then(() => success && success()).catch((e) => fail && fail(e));
  },
  switchTab({ url, success, fail }) {
    if (!routerRef) return fail && fail({ errMsg: 'router not ready' });
    routerRef.push(url).then(() => success && success()).catch((e) => fail && fail(e));
  },
  reLaunch({ url, success, fail }) {
    if (!routerRef) return fail && fail({ errMsg: 'router not ready' });
    routerRef.replace(url).then(() => success && success()).catch((e) => fail && fail(e));
  },
  navigateBack({ delta = 1, success } = {}) {
    if (routerRef) routerRef.go(-delta);
    if (success) success();
  }
};

/* ---------------- 全局 App 实例 ---------------- */

const APP_USER_KEY = 'shuxun_user_info';

function createAppInstance() {
  // 登录态以 Supabase 会话为准（见 utils/authStore.js），
  // 这里只提供初始的“未登录”默认值，避免残留本地缓存造成脏数据。
  const defaultUserInfo = {
    id: '',
    email: '',
    nickName: '未登录',
    avatarUrl: '/images/icons/avatar.png',
    studentId: '',
    phoneNumber: '',
    campus: '',
    college: '',
    major: '',
    grade: '',
    location: '',
    description: '',
    creditScore: 100,
    dealCount: 0,
    joinDate: '',
    isProfileComplete: false
  };

  const app = {
    globalData: {
      userInfo: { ...defaultUserInfo },
      env: ''
    },
    saveUserInfo(userInfo) {
      storage.setStorageSync(APP_USER_KEY, JSON.stringify(userInfo));
      app.globalData.userInfo = userInfo;
    }
  };
  return app;
}

let appInstance = null;
function getAppInstance() {
  if (!appInstance) appInstance = createAppInstance();
  return appInstance;
}

/* ---------------- 安装 ---------------- */

export function installWxCompat(router) {
  routerRef = router;
  appInstance = createAppInstance();

  const wx = {
    ...storage,
    ...navigation,
    showToast,
    hideToast: () => {},
    showLoading,
    hideLoading,
    showModal,
    showActionSheet,
    setNavigationBarTitle({ title } = {}) {
      if (title) document.title = title;
    },
    setClipboardData({ data, success } = {}) {
      const done = () => {
        showToast({ title: '已复制', icon: 'success' });
        if (success) success();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data).then(done).catch(done);
      } else {
        done();
      }
    },
    chooseImage({ count = 1, sourceType = ['album'], success } = {}) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = count > 1;
      if (sourceType.includes('camera') && !sourceType.includes('album')) {
        input.capture = 'environment';
      }
      input.onchange = () => {
        const files = Array.from(input.files || []);
        const tempFilePaths = files.map((f) => URL.createObjectURL(f));
        if (success) success({ tempFilePaths, tempFiles: files });
      };
      input.click();
    },
    scanCode({ success, fail } = {}) {
      showToast({ title: '浏览器不支持扫码，请手动输入 ISBN', icon: 'none' });
      if (fail) fail({ errMsg: 'scanCode:fail unsupported' });
    },
    getSystemInfoSync() {
      return { platform: 'web', windowWidth: window.innerWidth, windowHeight: window.innerHeight };
    }
  };

  if (typeof window !== 'undefined') {
    window.wx = wx;
    window.getApp = getAppInstance;
  }
  return wx;
}
