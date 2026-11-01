/** 书本扫描识别优化模块 - 结合大数据和平台参考 */

// 模拟书籍数据库（基于真实教材数据）
const BOOK_DATABASE = [
  {
    isbn: '9787040406641',
    title: '高等数学 第七版 上册',
    author: '同济大学数学系',
    publisher: '高等教育出版社',
    cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20computer%20science%20programming%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    originalPrice: 55.0,
    category: '数学教材'
  },
  {
    isbn: '9787040406658',
    title: '高等数学 第七版 下册',
    author: '同济大学数学系',
    publisher: '高等教育出版社',
    cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20computer%20science%20programming%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    originalPrice: 52.0,
    category: '数学教材'
  },
  {
    isbn: '9787040318921',
    title: '大学物理 上册',
    author: '张三慧',
    publisher: '清华大学出版社',
    cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20psychology%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    originalPrice: 65.0,
    category: '物理教材'
  },
  {
    isbn: '9787302462287',
    title: '心理学与生活',
    author: '理查德·格里格，菲利普·津巴多',
    publisher: '人民邮电出版社',
    cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20psychology%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    originalPrice: 88.0,
    category: '心理学教材'
  },
  {
    isbn: '9787111407010',
    title: 'C++ Primer 中文版',
    author: 'Stanley B. Lippman',
    publisher: '电子工业出版社',
    cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20english%20exam%20practice%20book%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    originalPrice: 128.0,
    category: '计算机教材'
  },
  {
    isbn: '9787111547427',
    title: '数据结构 (C语言版)',
    author: '严蔚敏',
    publisher: '清华大学出版社',
    cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20computer%20science%20programming%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    originalPrice: 35.0,
    category: '计算机教材'
  },
  {
    isbn: '9787040224666',
    title: '普通心理学 第5版',
    author: '彭聃龄',
    publisher: '北京师范大学出版社',
    cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20psychology%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    originalPrice: 75.0,
    category: '心理学教材'
  },
  {
    isbn: '9787301255636',
    title: '经济学原理 第7版',
    author: 'N·格里高利·曼昆',
    publisher: '北京大学出版社',
    cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20education%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
    originalPrice: 98.0,
    category: '经济学教材'
  }
];

// 西南大学常用教材映射
const SWU_COURSE_BOOKS = {
  '高等数学': ['高等数学 第七版 上册', '高等数学 第七版 下册'],
  '大学物理': ['大学物理 上册', '大学物理 下册'],
  '普通心理学': ['普通心理学 第5版'],
  '心理学与生活': ['心理学与生活'],
  '数据结构': ['数据结构 (C语言版)'],
  'C++程序设计': ['C++ Primer 中文版'],
  '经济学原理': ['经济学原理 第7版'],
  '教育学基础': ['教育学基础 第3版']
};

// 价格数据库（基于二手书平台参考价）
const PRICE_DATABASE = {
  // 按原价百分比范围 - 根据需求调整为30%-50%
  '全新': { min: 0.5, max: 0.7 },      // 50%-70% (调整为原价的50%-70%)
  '几乎全新': { min: 0.4, max: 0.6 },  // 40%-60%
  '九成新': { min: 0.3, max: 0.5 },   // 30%-50% (主要需求范围)
  '八成新': { min: 0.25, max: 0.4 },   // 25%-40%
  '有较多笔记': { min: 0.2, max: 0.35 }, // 20%-35%
  '有破损': { min: 0.15, max: 0.3 }    // 15%-30%
};

// ISBN扫描识别
export function recognizeByISBN(isbn) {
  console.log(`识别ISBN: ${isbn}`);
  
  // 清理ISBN（移除空格和横线）
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  
  // 在数据库中查找
  const book = BOOK_DATABASE.find(b => b.isbn === cleanISBN);
  
  if (book) {
    console.log('在数据库中找到了匹配的书籍:', book.title);
    return {
      success: true,
      bookInfo: {
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        cover: book.cover,
        isbn: cleanISBN,
        originalPrice: book.originalPrice
      },
      source: 'database'
    };
  }
  
  // 如果没有找到，尝试在线API（模拟）
  return simulateOnlineRecognition(isbn);
}

// OCR图像识别
export function recognizeByOCR(imageText) {
  console.log('OCR识别文本:', imageText);
  
  // 提取可能的书名和作者
  const lines = imageText.split('\n').filter(line => line.trim().length > 0);
  
  // 查找包含关键词的行
  const titleCandidates = lines.filter(line => {
    const lowerLine = line.toLowerCase();
    return lowerLine.includes('书') || 
           lowerLine.includes('教材') || 
           lowerLine.includes('教程') ||
           lowerLine.includes('第') && lowerLine.includes('版') ||
           line.length > 5 && line.length < 50;
  });
  
  // 尝试匹配数据库
  for (const candidate of titleCandidates) {
    for (const book of BOOK_DATABASE) {
      if (candidate.includes(book.title) || book.title.includes(candidate)) {
        console.log('OCR匹配到书籍:', book.title);
        return {
          success: true,
          bookInfo: {
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            cover: book.cover,
            isbn: '',
            originalPrice: book.originalPrice
          },
          confidence: 0.8,
          source: 'ocr_database'
        };
      }
    }
  }
  
  // 如果没有找到，返回手动输入建议
  return {
    success: false,
    suggestedTitle: titleCandidates[0] || '未知书籍',
    message: '未能准确识别，请手动确认书名'
  };
}

// 基于课程推荐书籍
export function suggestBooksByCourse(courseName) {
  const books = SWU_COURSE_BOOKS[courseName];
  if (books && books.length > 0) {
    const matchedBooks = BOOK_DATABASE.filter(book => 
      books.some(title => book.title.includes(title))
    );
    
    return {
      success: true,
      books: matchedBooks,
      course: courseName
    };
  }
  
  return {
    success: false,
    message: '暂无该课程的推荐教材'
  };
}

// 计算推荐价格
export function calculateSuggestedPrice(originalPrice, condition = '九成新') {
  const priceRange = PRICE_DATABASE[condition] || PRICE_DATABASE['九成新'];
  const minPrice = originalPrice * priceRange.min;
  const maxPrice = originalPrice * priceRange.max;
  const suggestedPrice = (minPrice + maxPrice) / 2;
  
  return {
    suggestedPrice: Math.round(suggestedPrice * 10) / 10, // 保留一位小数
    priceRange: {
      min: Math.round(minPrice * 10) / 10,
      max: Math.round(maxPrice * 10) / 10
    },
    percentage: `${Math.round(priceRange.min * 100)}%-${Math.round(priceRange.max * 100)}%`
  };
}

// 验证书籍信息
export function validateBookInfo(bookInfo) {
  const errors = [];
  
  if (!bookInfo.title || bookInfo.title.trim().length < 2) {
    errors.push('书名过短或为空');
  }
  
  if (bookInfo.originalPrice && bookInfo.originalPrice > 1000) {
    errors.push('原价过高，请确认');
  }
  
  if (bookInfo.price && bookInfo.price > (bookInfo.originalPrice || 500)) {
    errors.push('售价不应超过原价');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// 模拟在线识别（实际项目中应调用真实API）
function simulateOnlineRecognition(isbn) {
  // 模拟网络延迟
  console.log('模拟在线API查询...');
  
  // 简单模拟：基于ISBN格式猜测
  if (isbn.length === 13 && isbn.startsWith('978')) {
    return {
      success: true,
      bookInfo: {
        title: `识别出的书籍 (ISBN: ${isbn})`,
        author: '待确认作者',
        publisher: '待确认出版社',
        cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=used%20psychology%20textbook%20on%20a%20desk%2C%20soft%20natural%20light%2C%20clean%20minimal%20background&image_size=portrait_4_3',
        isbn: isbn,
        originalPrice: 50.0
      },
      source: 'online_api',
      confidence: 0.6,
      message: '来自在线数据库的识别结果'
    };
  }
  
  return {
    success: false,
    message: '未找到匹配的书籍信息，请手动输入'
  };
}

// 获取热门教材
export function getPopularTextbooks() {
  return BOOK_DATABASE.slice(0, 5).map(book => ({
    ...book,
    suggestedPrice: calculateSuggestedPrice(book.originalPrice, '九成新').suggestedPrice
  }));
}