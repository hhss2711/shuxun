<template>
  <div class="login-container">
    <div class="login-card">
      <div class="brand">
        <span class="brand-mark">书</span>
        <span class="brand-name">书循</span>
      </div>
      <div class="subtitle">西南大学校园二手书交易</div>

      <div class="mode-switch">
        <div class="mode-item" :class="{ active: mode === 'signin' }" @click="switchMode('signin')">
          登录
        </div>
        <div class="mode-item" :class="{ active: mode === 'signup' }" @click="switchMode('signup')">
          注册
        </div>
      </div>

      <div class="form">
        <div v-if="mode === 'signup'" class="field">
          <span class="label">昵称</span>
          <input class="input" type="text" v-model.trim="nickName" placeholder="用于展示的名字" />
        </div>

        <div class="field">
          <span class="label">邮箱</span>
          <input class="input" type="email" v-model.trim="email" placeholder="you@example.com" />
        </div>

        <div class="field">
          <span class="label">密码</span>
          <input
            class="input"
            type="password"
            v-model="password"
            :placeholder="mode === 'signup' ? '至少 6 位' : '请输入密码'"
            @keyup.enter="onSubmit"
          />
        </div>

        <div class="error" v-if="errorMsg">{{ errorMsg }}</div>
        <div class="notice" v-if="noticeMsg">{{ noticeMsg }}</div>

        <button class="submit-btn" :disabled="loading" @click="onSubmit">
          {{ loading ? '处理中...' : mode === 'signin' ? '登录' : '注册并登录' }}
        </button>
      </div>

      <div class="tip">
        {{ mode === 'signin' ? '还没有账号？' : '已有账号？' }}
        <span class="link" @click="switchMode(mode === 'signin' ? 'signup' : 'signin')">
          {{ mode === 'signin' ? '立即注册' : '去登录' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { signIn, signUp } from '@/utils/authStore';

const route = useRoute();
const router = useRouter();

const mode = ref('signin');
const nickName = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');
const noticeMsg = ref('');

function switchMode(next) {
  mode.value = next;
  errorMsg.value = '';
  noticeMsg.value = '';
}

function goAfterLogin() {
  const redirect = route.query.redirect;
  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    router.replace(redirect);
  } else {
    router.replace('/pages/index/index');
  }
}

async function onSubmit() {
  if (loading.value) return;
  errorMsg.value = '';
  noticeMsg.value = '';

  if (!email.value || !password.value) {
    errorMsg.value = '请填写邮箱和密码';
    return;
  }
  if (mode.value === 'signup' && password.value.length < 6) {
    errorMsg.value = '密码至少 6 位';
    return;
  }

  loading.value = true;
  try {
    if (mode.value === 'signin') {
      const { error } = await signIn({ email: email.value, password: password.value });
      if (error) {
        errorMsg.value = translateError(error);
        return;
      }
      wx.showToast({ title: '登录成功', icon: 'success' });
      goAfterLogin();
    } else {
      const { error, needConfirm } = await signUp({
        email: email.value,
        password: password.value,
        nickName: nickName.value
      });
      if (error) {
        errorMsg.value = translateError(error);
        return;
      }
      if (needConfirm) {
        noticeMsg.value = '注册成功，请先到邮箱点击确认链接后再登录。';
        mode.value = 'signin';
        return;
      }
      wx.showToast({ title: '注册成功', icon: 'success' });
      goAfterLogin();
    }
  } finally {
    loading.value = false;
  }
}

function translateError(error) {
  const msg = String(error?.message || error || '');
  if (/Invalid login credentials/i.test(msg)) return '邮箱或密码不正确';
  if (/already registered|already exists/i.test(msg)) return '该邮箱已注册，请直接登录';
  if (/Password should be at least/i.test(msg)) return '密码至少 6 位';
  if (/Email not confirmed/i.test(msg)) return '邮箱尚未确认，请先查看邮件';
  if (/Unable to validate email/i.test(msg)) return '邮箱格式不正确';
  return msg || '操作失败，请稍后重试';
}
</script>

<style scoped>
.login-container {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 80px;
  background-color: var(--bg-color);
  box-sizing: border-box;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  padding: 28px 22px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #1a1a1a;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-name {
  font-size: 22px;
  font-weight: 800;
  color: #1a1a1a;
}
.subtitle {
  text-align: center;
  font-size: 12px;
  color: #8e8e93;
  margin: 8px 0 22px;
}

.mode-switch {
  display: flex;
  background: #f2f2f7;
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 20px;
}
.mode-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #8e8e93;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.mode-item.active {
  background: #ffffff;
  color: #1a1a1a;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.field {
  margin-bottom: 14px;
}
.label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #8e8e93;
  margin-bottom: 6px;
}
.input {
  width: 100%;
  height: 46px;
  background: #f2f2f7;
  border: none;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 15px;
  color: #1a1a1a;
  outline: none;
  box-sizing: border-box;
}

.error,
.notice {
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 12px;
}
.error {
  color: #ff3b30;
}
.notice {
  color: #07c160;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 24px;
  background: #1a1a1a;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.tip {
  margin-top: 18px;
  text-align: center;
  font-size: 13px;
  color: #8e8e93;
}
.link {
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
}
</style>
