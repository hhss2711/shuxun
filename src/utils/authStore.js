/**
 * 登录态与用户资料（Supabase Auth 邮箱 + 密码）
 * 登录后把 profiles 表的资料映射进 getApp().globalData.userInfo，
 * 使原有页面无需改动即可读取当前用户。
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';

const EXTRA_KEY = 'shuxun_local_profile_extra';

export const DEFAULT_USER_INFO = {
  id: '',
  email: '',
  nickName: '未登录',
  avatarUrl: '/images/icons/avatar.png',
  campus: '',
  college: '',
  grade: '',
  major: '',
  location: '',
  description: '',
  studentId: '',
  phoneNumber: '',
  creditScore: 100,
  dealCount: 0,
  joinDate: '',
  isProfileComplete: false
};

let readyPromise = null;
let currentUser = { ...DEFAULT_USER_INFO };
const authListeners = new Set();

/* ---------------- 本地附加字段（profiles 表未包含学号/手机号） ---------------- */

function readExtras() {
  try {
    return JSON.parse(localStorage.getItem(EXTRA_KEY) || '{}') || {};
  } catch (e) {
    return {};
  }
}

function saveExtras(userId, patch) {
  if (!userId) return;
  const all = readExtras();
  all[userId] = { ...(all[userId] || {}), ...patch };
  try {
    localStorage.setItem(EXTRA_KEY, JSON.stringify(all));
  } catch (e) {
    /* 忽略写入失败 */
  }
}

/* ---------------- 映射与写回 ---------------- */

export function mapProfileToUser(profile, session) {
  const p = profile || {};
  const email = session?.user?.email || '';
  const extra = readExtras()[session?.user?.id] || {};
  return {
    ...DEFAULT_USER_INFO,
    id: session?.user?.id || '',
    email,
    nickName: p.nick_name || (email ? email.split('@')[0] : DEFAULT_USER_INFO.nickName),
    avatarUrl: p.avatar_url || DEFAULT_USER_INFO.avatarUrl,
    campus: p.campus || '',
    college: p.college || '',
    grade: p.grade || '',
    major: p.major || '',
    location: p.location || '',
    description: p.description || '',
    studentId: extra.studentId || '',
    phoneNumber: extra.phoneNumber || '',
    creditScore: p.credit_score ?? 100,
    dealCount: p.deal_count ?? 0,
    joinDate: p.join_date || '',
    isProfileComplete: Boolean(p.college && p.grade && p.major)
  };
}

function applyUser(user) {
  currentUser = user;
  const app = typeof getApp === 'function' ? getApp() : null;
  if (app) {
    if (typeof app.saveUserInfo === 'function') app.saveUserInfo(user);
    else app.globalData.userInfo = user;
  }
  authListeners.forEach((cb) => cb(user));
}

async function applySession(session) {
  if (!session?.user) {
    applyUser({ ...DEFAULT_USER_INFO });
    return null;
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();
  if (error) console.warn('[auth] 读取 profiles 失败：', error.message);
  const user = mapProfileToUser(data, session);
  applyUser(user);
  return user;
}

/* ---------------- 对外接口 ---------------- */

export function isLoggedIn() {
  return Boolean(currentUser.id);
}

export function getUser() {
  return currentUser;
}

export function onAuthChange(cb) {
  authListeners.add(cb);
  return () => authListeners.delete(cb);
}

/** 还原登录态（幂等，仅首次真正执行） */
export function initAuth() {
  if (!isSupabaseConfigured) {
    applyUser({ ...DEFAULT_USER_INFO });
    return Promise.resolve(null);
  }
  if (!readyPromise) {
    readyPromise = (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.warn('[auth] 读取会话失败：', error.message);
      const session = data?.session || null;
      if (session) await applySession(session);
      else applyUser({ ...DEFAULT_USER_INFO });

      supabase.auth.onAuthStateChange((_event, nextSession) => {
        void applySession(nextSession);
      });
      return session;
    })();
  }
  return readyPromise;
}

export async function signUp({ email, password, nickName }) {
  if (!supabase) return { error: new Error('未配置后端服务') };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nick_name: nickName || '' } }
  });
  if (error) return { error };
  if (data.session) await applySession(data.session);
  return { data, needConfirm: !data.session };
}

export async function signIn({ email, password }) {
  if (!supabase) return { error: new Error('未配置后端服务') };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error };
  await applySession(data.session);
  return { data };
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  applyUser({ ...DEFAULT_USER_INFO });
}

/** 写入 profiles（另有学号/手机号仅缓存本地） */
export async function updateProfile(patch) {
  if (!isLoggedIn()) return { error: new Error('未登录') };
  const userId = currentUser.id;

  const row = {
    nick_name: patch.nickName,
    avatar_url: patch.avatarUrl,
    campus: patch.campus,
    college: patch.college,
    grade: patch.grade,
    major: patch.major,
    location: patch.location,
    description: patch.description,
    join_date: patch.joinDate,
    updated_at: new Date().toISOString()
  };
  Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);

  if (supabase) {
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...row });
    if (error) return { error };
  }

  saveExtras(userId, { studentId: patch.studentId, phoneNumber: patch.phoneNumber });
  const merged = { ...currentUser, ...row, ...patch };
  merged.nickName = row.nick_name ?? merged.nickName;
  merged.avatarUrl = row.avatar_url ?? merged.avatarUrl;
  merged.isProfileComplete = Boolean(merged.college && merged.grade && merged.major);
  applyUser(merged);
  return { user: merged };
}

/** 读取任意用户的公开资料（用于用户主页） */
export async function fetchProfileById(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[auth] 读取用户资料失败：', error.message);
    return null;
  }
  return data ? mapProfileToUser(data, { user: { id: userId } }) : null;
}

/** 未登录时跳转登录页，返回是否已登录 */
export function ensureLogin(redirect) {
  if (isLoggedIn()) return true;
  const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
  wx.navigateTo({ url: `/pages/login/login${query}` });
  return false;
}
