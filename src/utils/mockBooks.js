import { isDevelopment, getDataByEnv } from './envConfig';

/** 
 * 首页与搜索共用的示例书目数据
 * 在开发环境下返回模拟数据，生产环境下返回空数组
 */
const mockBooksData = [
  {
    id: 1,
    title: '普通心理学 (第5版) 彭聃龄',
    price: 35,
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20psychology%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    distance: '200m',
    isSameArea: true,
    location: '橘园 (北区)',
    college: '心理学部',
    courseName: '普通心理学',
    grade: '2023级',
    condition: '九成新',
    category: '专业课',
    user: { id: 201, name: '王同学', avatar: '/images/icons/avatar.png' }
  },
  {
    id: 2,
    title: '数据结构 (C语言版) 严蔚敏',
    price: 28,
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20computer%20science%20programming%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    distance: '500m',
    isSameArea: true,
    location: '楠园 (南区)',
    college: '计信院',
    courseName: '数据结构',
    grade: '2022级',
    condition: '八成新',
    category: '专业课',
    user: { id: 202, name: '老张', avatar: '/images/icons/avatar.png' }
  },
  {
    id: 3,
    title: '大学英语四级真题解析 (2024)',
    price: 15,
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20english%20exam%20practice%20book%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    distance: '800m',
    isSameArea: false,
    location: '竹园 (北区)',
    college: '不限',
    courseName: '大学英语',
    grade: '不限',
    condition: '几乎全新',
    category: '英语四六级',
    user: { id: 203, name: 'Lily', avatar: '/images/icons/avatar.png' }
  },
  {
    id: 4,
    title: '教育学基础 第3版',
    price: 22,
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20education%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    distance: '1.2km',
    isSameArea: false,
    location: '梅园 (北区)',
    college: '教育学部',
    courseName: '教育学',
    grade: '2024级',
    condition: '九成新',
    category: '通识课',
    user: { id: 204, name: '学霸', avatar: '/images/icons/avatar.png' }
  }
];

/**
 * 获取书籍列表
 * 开发环境返回模拟数据，生产环境返回空数组（需要从服务器获取）
 */
export const mockBooks = getDataByEnv(mockBooksData, []);

/**
 * 获取模拟书籍数据（仅开发环境使用）
 * @returns {Array}
 */
export function getMockBooks() {
  return isDevelopment() ? mockBooksData : [];
}
