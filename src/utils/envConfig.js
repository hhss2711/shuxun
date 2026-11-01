/**
 * 环境配置工具
 * 用于区分开发环境和生产环境，统一管理模拟数据的使用
 */

// 当前环境配置
// 开发环境: 'development'
// 生产环境: 'production'
const CURRENT_ENV = 'development';

/**
 * 判断当前是否为开发环境
 * @returns {boolean}
 */
export function isDevelopment() {
  return CURRENT_ENV === 'development';
}

/**
 * 判断当前是否为生产环境
 * @returns {boolean}
 */
export function isProduction() {
  return CURRENT_ENV === 'production';
}

/**
 * 获取当前环境
 * @returns {string}
 */
export function getCurrentEnv() {
  return CURRENT_ENV;
}

/**
 * 根据环境返回数据
 * @param {any} mockData - 开发环境使用的模拟数据
 * @param {any} realData - 生产环境使用的真实数据
 * @returns {any}
 */
export function getDataByEnv(mockData, realData) {
  return isDevelopment() ? mockData : realData;
}

/**
 * 开发环境日志输出
 * @param {...any} args
 */
export function devLog(...args) {
  if (isDevelopment()) {
    console.log('[DEV]', ...args);
  }
}

/**
 * 切换到生产环境
 * 在真实小程序开发完成后，调用此函数切换到生产环境
 */
export function switchToProduction() {
  // 注意：实际切换需要修改 CURRENT_ENV 常量
  // 这里提供函数是为了方便后续扩展
  console.warn('请手动修改 envConfig.js 中的 CURRENT_ENV 为 "production"');
}
