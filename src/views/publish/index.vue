<template>
  <div class="publish-container container">
    <div class="form-wrap">
      <!-- 1. Smart Entry Section -->
      <div class="section card">
        <div class="section-title">智能录入</div>
        <div class="smart-entry-row">
          <div class="smart-btn smart-btn-camera" @click="onSmartMediaMenu">
            <img class="btn-icon btn-icon-camera" src="/images/icons/camera.svg" alt="" />
            <span>扫码 / 拍照 / 相册录入</span>
          </div>
        </div>

        <div class="book-preview" v-if="bookInfo.title">
          <img v-if="bookInfo.cover" class="book-cover" :src="bookInfo.cover" alt="" />
          <div class="book-details">
            <input class="title-input" v-model="bookInfo.title" placeholder="书名" />
            <input class="author-input" v-model="bookInfo.author" placeholder="作者" />
            <span v-if="bookInfo.isbn" class="isbn-text">ISBN: {{ bookInfo.isbn }}</span>
          </div>
        </div>

        <div class="manual-entry" v-else>
          <input class="title-input" v-model="bookInfo.title" placeholder="手动输入书名（作为兜底）" />
        </div>
      </div>

      <!-- 2. Course Info Section -->
      <div class="section card">
        <div class="section-title">课程信息绑定 (用于精准推荐)</div>

        <div class="form-item">
          <div class="label">适用校区</div>
          <select class="picker-value" v-model.number="campusIndex" @change="onCampusChange">
            <option v-for="(c, i) in campuses" :key="c" :value="i">{{ c }}</option>
          </select>
        </div>

        <div class="form-item">
          <div class="label">适用学院</div>
          <select class="picker-value" v-model.number="collegeIndex" @change="onCollegeChange">
            <option v-for="(c, i) in colleges" :key="c" :value="i">{{ c }}</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-item flex-1">
            <div class="label">适用年级</div>
            <select class="picker-value" v-model.number="gradeIndex" @change="onGradeChange">
              <option v-for="(g, i) in grades" :key="g" :value="i">{{ g }}</option>
            </select>
          </div>
          <div class="form-item flex-1">
            <div class="label">适用学期</div>
            <select class="picker-value" v-model.number="semesterIndex" @change="onSemesterChange">
              <option v-for="(s, i) in semesters" :key="s" :value="i">{{ s }}</option>
            </select>
          </div>
        </div>

        <div class="form-item">
          <div class="label">课程类型</div>
          <select class="picker-value" v-model.number="courseTypeIndex" @change="onCourseTypeChange">
            <option v-for="(t, i) in courseTypes" :key="t" :value="i">{{ t }}</option>
          </select>
        </div>

        <div class="form-item">
          <div class="label">课程名称</div>
          <input class="input-field" v-model="courseName" placeholder="如：心理学导论" />
        </div>
      </div>

      <!-- 3. Transaction Info Section -->
      <div class="section card">
        <div class="section-title">交易信息</div>

        <div class="form-item">
          <div class="label">商品描述</div>
          <textarea
            class="desc-textarea"
            v-model="description"
            placeholder="描述一下书本的详细情况，或者是否可以小刀、哪里自提等..."
            maxlength="500"
          ></textarea>
        </div>

        <div class="form-item">
          <div class="label">原价 (选填)</div>
          <div class="price-input-wrapper">
            <span class="currency">¥</span>
            <input
              type="number"
              step="0.01"
              class="price-input"
              v-model="originalPrice"
              placeholder="原书价格"
              @input="onOriginalPriceInput"
            />
          </div>
          <div class="form-item">
            <div class="label">定价</div>
            <div class="price-input-wrapper">
              <span class="currency">¥</span>
              <input
                type="number"
                step="0.01"
                class="price-input"
                v-model="price"
                placeholder="0.00"
                @input="onPriceInput"
              />
            </div>
            <div class="ai-tip" v-if="aiSuggestedPrice > 0 && originalPrice > 0">
              AI 建议价: ¥{{ aiSuggestedPrice }} (原价¥{{ originalPrice }}的30%-50%)
            </div>
            <div class="ai-tip" v-if="aiSuggestedPrice > 0 && !originalPrice">
              AI 建议价: ¥{{ aiSuggestedPrice }}
            </div>
          </div>
        </div>

        <div class="form-item">
          <div class="label">书况</div>
          <select class="picker-value" v-model.number="conditionIndex" @change="onConditionChange">
            <option v-for="(c, i) in conditions" :key="c" :value="i">{{ c }}</option>
          </select>
        </div>

        <div class="form-item">
          <div class="label">交易地点</div>
          <select class="picker-value" v-model.number="locationIndex" @change="onLocationChange">
            <option v-for="(l, i) in locations" :key="l" :value="i">{{ l }}</option>
          </select>
        </div>

        <div class="image-upload-section">
          <div class="label" style="margin-bottom: 10px;">实拍图 (选填)</div>
          <div class="image-grid">
            <div class="image-item" v-for="(item, index) in images" :key="index">
              <img class="uploaded-image" :src="item" alt="" />
            </div>
            <div class="add-image" v-if="images.length < 9" @click="onChooseImageMenu">
              <img class="add-image-camera" src="/images/icons/camera.svg" alt="" />
            </div>
          </div>
        </div>
      </div>

      <div class="submit-section">
        <div class="btn-primary" @click="onSubmit">{{ editMode ? '保存修改' : '确认发布' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { swuColleges, swuGrades } from '@/utils/swuData';
import { publishBook, updatePublishedBook, getBookById } from '@/utils/bookStore';
import {
  recognizeByISBN,
  recognizeByOCR,
  calculateSuggestedPrice,
  validateBookInfo
} from '@/utils/bookRecognition';

const route = useRoute();

const editMode = ref(false);
const editingBookId = ref(0);

// Smart Entry
const bookInfo = reactive({
  title: '',
  author: '',
  publisher: '',
  cover: '',
  isbn: ''
});
const images = ref([]);

// Course Info
const campuses = ['北碚校区', '荣昌校区'];
const campusIndex = ref(0);
const colleges = ['不限', ...swuColleges.map((c) => c.name)];
const collegeIndex = ref(0);
const grades = ['不限', ...swuGrades];
const gradeIndex = ref(0);
const semesters = ['不限', '第一学期 (秋季)', '第二学期 (春季)'];
const semesterIndex = ref(0);
const courseTypes = ['通识必修', '通识选修', '专业必修', '专业选修', '考研资料', '英语四六级', '课辅资料', '其他'];
const courseTypeIndex = ref(0);
const courseName = ref('');

// Transaction Info
const description = ref('');
const price = ref('');
const originalPrice = ref('');
const aiSuggestedPrice = ref(0);
const condition = ref('九成新');
const conditions = ['全新', '几乎全新', '九成新', '八成新', '有较多笔记', '有破损'];
const conditionIndex = ref(2);
const location = ref('楠园 (默认园区)');
const locations = ['楠园', '竹园', '茶园', '李园', '梅园', '杏园', '橘园', '桃园', '荣昌校区'];
const locationIndex = ref(0);

// onLoad(options)
const edit = route.query.edit === '1';
const bookId = route.query.bookId ? Number(route.query.bookId) : 0;
editMode.value = edit;
editingBookId.value = bookId;

onMounted(async () => {
  initUserInfo();
  if (edit && bookId) await loadBookForEdit(bookId);
});

// 加载要编辑的书籍信息
async function loadBookForEdit(id) {
  const book = await getBookById(id);
  if (!book) return;
  bookInfo.title = book.title || '';
  bookInfo.author = book.author || '';
  bookInfo.cover = book.cover || '';
  bookInfo.isbn = book.isbn || '';
  originalPrice.value = book.originalPrice || '';
  price.value = book.price || '';
  description.value = book.description || '';
  courseName.value = book.courseName || '';
  images.value = book.images || [];
  setPickerIndexes(book);
  wx.setNavigationBarTitle({ title: '编辑书籍信息' });
}

// 设置选择器索引
function setPickerIndexes(book) {
  if (book.campus) {
    const i = campuses.indexOf(book.campus);
    if (i !== -1) campusIndex.value = i;
  }
  if (book.college) {
    const i = colleges.indexOf(book.college);
    if (i !== -1) collegeIndex.value = i;
  }
  if (book.grade) {
    const i = grades.indexOf(book.grade);
    if (i !== -1) gradeIndex.value = i;
  }
  if (book.semester) {
    const i = semesters.indexOf(book.semester);
    if (i !== -1) semesterIndex.value = i;
  }
  if (book.courseType) {
    const i = courseTypes.indexOf(book.courseType);
    if (i !== -1) courseTypeIndex.value = i;
  }
  if (book.condition) {
    const i = conditions.indexOf(book.condition);
    if (i !== -1) conditionIndex.value = i;
  }
  if (book.location) {
    const i = locations.indexOf(book.location);
    if (i !== -1) locationIndex.value = i;
  }
}

function initUserInfo() {
  const userInfo = getApp().globalData?.userInfo;
  if (!userInfo) return;
  const collegeIdx = colleges.indexOf(userInfo.college);
  const gradeIdx = grades.indexOf(userInfo.grade);

  const campusIdx =
    userInfo.college === '商贸学院' ||
    userInfo.college === '水产学院' ||
    userInfo.college === '动物科学技术学院' ||
    userInfo.college === '动物医学院'
      ? 1
      : 0;

  collegeIndex.value = collegeIdx !== -1 ? collegeIdx : 0;
  gradeIndex.value = gradeIdx !== -1 ? gradeIdx : 0;
  campusIndex.value = campusIdx;
}

// --- Smart Entry Methods ---
function onSmartMediaMenu() {
  wx.showActionSheet({
    itemList: ['扫描 ISBN', '拍照识图', '从相册选择'],
    success: (res) => {
      if (res.tapIndex === 0) onScanISBN();
      else if (res.tapIndex === 1) onPhotoOCR(['camera']);
      else if (res.tapIndex === 2) onPhotoOCR(['album']);
    }
  });
}

function onScanISBN() {
  wx.scanCode({
    success: (res) => {
      const isbn = res.result;
      wx.showLoading({ title: '识别ISBN中...' });

      // 使用优化的识别模块
      const recognitionResult = recognizeByISBN(isbn);

      setTimeout(() => {
        wx.hideLoading();

        if (recognitionResult.success) {
          const info = recognitionResult.bookInfo;
          // 计算推荐价格（根据当前书况，原价的30%-50%）
          const currentCondition = conditions[conditionIndex.value];
          const priceResult = calculateSuggestedPrice(info.originalPrice, currentCondition);

          bookInfo.title = info.title;
          bookInfo.author = info.author;
          bookInfo.publisher = info.publisher || '';
          bookInfo.isbn = info.isbn;
          bookInfo.cover = info.cover;
          originalPrice.value = info.originalPrice;
          aiSuggestedPrice.value = priceResult.suggestedPrice;

          wx.showToast({
            title: `识别成功: ${info.title}`,
            icon: 'success',
            duration: 2000
          });

          console.log('书籍识别结果:', recognitionResult);
        } else {
          // 识别失败，使用手动输入
          bookInfo.title = '';
          bookInfo.isbn = isbn;
          aiSuggestedPrice.value = 0;

          wx.showToast({
            title: '未找到匹配书籍，请手动输入',
            icon: 'none',
            duration: 3000
          });
        }
      }, 1500);
    },
    fail: (err) => {
      console.error('扫描失败:', err);
      wx.showToast({
        title: '扫描失败，请重试',
        icon: 'error'
      });
    }
  });
}

function onPhotoOCR(sourceType) {
  wx.chooseImage({
    count: 1,
    sourceType: sourceType || ['album', 'camera'],
    success: () => {
      wx.showLoading({ title: 'AI识别中...' });

      // 模拟OCR处理（实际项目中应调用OCR API）
      setTimeout(() => {
        // 模拟识别出的文本（实际应从OCR API获取）
        const simulatedOCRText = `高等数学 第七版 上册
同济大学数学系 编
高等教育出版社
ISBN 9787040406641`;

        // 使用OCR识别模块
        const ocrResult = recognizeByOCR(simulatedOCRText);

        if (ocrResult.success) {
          const info = ocrResult.bookInfo;
          // 计算推荐价格（根据当前书况，原价的30%-50%）
          const currentCondition = conditions[conditionIndex.value];
          const priceResult = calculateSuggestedPrice(info.originalPrice, currentCondition);

          bookInfo.title = info.title;
          bookInfo.author = info.author;
          bookInfo.publisher = info.publisher || '';
          bookInfo.isbn = info.isbn;
          bookInfo.cover = info.cover;
          originalPrice.value = info.originalPrice;
          aiSuggestedPrice.value = priceResult.suggestedPrice;

          wx.showToast({
            title: `识别成功: ${info.title}`,
            icon: 'success',
            duration: 2000
          });
        } else {
          // 识别失败，提供建议
          bookInfo.title = ocrResult.suggestedTitle || '';
          bookInfo.author = '';
          aiSuggestedPrice.value = 0;

          wx.showToast({
            title: '请手动确认书名',
            icon: 'none',
            duration: 3000
          });
        }

        wx.hideLoading();
      }, 2000);
    },
    fail: (err) => {
      console.error('选择图片失败:', err);
      wx.showToast({
        title: '选择图片失败',
        icon: 'error'
      });
    }
  });
}

function onChooseImageMenu() {
  wx.showActionSheet({
    itemList: ['拍摄', '从相册选择'],
    success: (res) => {
      const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
      wx.chooseImage({
        count: 9 - images.value.length,
        sourceType,
        success: (r) => {
          images.value = images.value.concat(r.tempFilePaths);
        }
      });
    }
  });
}

// 监听原价输入变化，自动计算AI建议价格
function onOriginalPriceInput(e) {
  const val = e.target.value;
  originalPrice.value = val;

  // 如果有原价，计算AI建议价格（原价的30%-50%）
  if (val && Number(val) > 0) {
    const cond = conditions[conditionIndex.value];
    aiSuggestedPrice.value = calculateSuggestedPrice(Number(val), cond).suggestedPrice;
  } else {
    aiSuggestedPrice.value = 0;
  }
}

// 监听价格输入变化
function onPriceInput(e) {
  price.value = e.target.value;
}

// 监听书况变化，重新计算AI建议价格
function onConditionChange(e) {
  const idx = Number(e.target.value);
  conditionIndex.value = idx;

  // 如果有原价，重新计算AI建议价格
  if (originalPrice.value && Number(originalPrice.value) > 0) {
    const cond = conditions[idx];
    aiSuggestedPrice.value = calculateSuggestedPrice(Number(originalPrice.value), cond).suggestedPrice;
  }
}

// --- Form Change Methods ---
function onCampusChange(e) {
  campusIndex.value = Number(e.target.value);
  collegeIndex.value = 0; // Reset college
}

function onCollegeChange(e) {
  collegeIndex.value = Number(e.target.value);
}
function onGradeChange(e) {
  gradeIndex.value = Number(e.target.value);
}
function onSemesterChange(e) {
  semesterIndex.value = Number(e.target.value);
}
function onCourseTypeChange(e) {
  courseTypeIndex.value = Number(e.target.value);
}
function onLocationChange(e) {
  locationIndex.value = Number(e.target.value);
}

async function onSubmit() {
  // 收集表单数据
  const bookData = {
    title: bookInfo.title,
    author: bookInfo.author || '',
    cover: bookInfo.cover || '',
    isbn: bookInfo.isbn || '',
    price: parseFloat(price.value) || 0,
    originalPrice: originalPrice.value || 0,
    description: description.value || '',
    condition: conditions[conditionIndex.value],
    location: locations[locationIndex.value],
    campus: campuses[campusIndex.value],
    college: colleges[collegeIndex.value],
    grade: grades[gradeIndex.value],
    semester: semesters[semesterIndex.value],
    courseType: courseTypes[courseTypeIndex.value],
    courseName: courseName.value || '',
    images: images.value || []
  };

  // 简单验证
  if (!bookData.title || !bookData.price) {
    wx.showToast({ title: '标题和价格必填', icon: 'none' });
    return;
  }

  wx.showLoading({ title: editMode.value ? '保存中' : '发布中' });

  try {
    if (editMode.value && editingBookId.value) {
      await updatePublishedBook(editingBookId.value, bookData);
    } else {
      await publishBook(bookData);
    }
    wx.hideLoading();
    wx.showToast({ title: editMode.value ? '保存成功' : '发布成功', icon: 'success' });
    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      // 跳转到我的发布页面
      wx.navigateTo({ url: '/pages/book-list/book-list?type=publish' });
    }, 1200);
  } catch (error) {
    console.error('发布失败:', error);
    wx.hideLoading();
    wx.showToast({
      title: '发布失败，请重试',
      icon: 'none'
    });
  }
}
</script>

<style scoped>
.publish-container {
  padding-top: 12px;
  padding-bottom: 90px;
}

.form-wrap {
  max-width: 640px;
  margin: 0 auto;
}

.section {
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Smart Entry */
.smart-entry-row {
  margin-bottom: 16px;
}

.smart-btn {
  flex: 1;
  background-color: var(--apple-light-gray);
  padding: 16px;
  border-radius: var(--border-radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s;
  cursor: pointer;
}

.smart-btn-camera {
  flex-direction: row;
  justify-content: center;
  gap: 10px;
}

.smart-btn:active {
  opacity: 0.7;
}

.btn-icon {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}

.btn-icon-camera {
  width: 20px;
  height: 20px;
  opacity: 0.95;
}

.smart-btn span {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-main);
}

.book-preview {
  display: flex;
  gap: 12px;
  background-color: var(--bg-color);
  padding: 10px;
  border-radius: var(--border-radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.book-cover {
  width: 70px;
  height: 90px;
  border-radius: 4px;
  background-color: #eee;
  object-fit: cover;
}

.book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.title-input {
  font-size: 16px;
  font-weight: 700;
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
}

.author-input {
  font-size: 13px;
  color: var(--text-secondary);
  border: none;
  background: transparent;
  outline: none;
}

.isbn-text {
  font-size: 11px;
  color: var(--apple-gray);
}

/* Form Items */
.form-item {
  margin-bottom: 16px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 6px;
}

.picker-value {
  width: 100%;
  background-color: var(--apple-light-gray);
  padding: 10px 12px;
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  color: var(--text-main);
  border: none;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.input-field {
  width: 100%;
  background-color: var(--apple-light-gray);
  padding: 10px 12px;
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  border: none;
  outline: none;
}

.desc-textarea {
  width: 100%;
  height: 100px;
  background-color: var(--apple-light-gray);
  padding: 10px 12px;
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  box-sizing: border-box;
  border: none;
  outline: none;
  resize: vertical;
  font-family: inherit;
}

.form-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

/* Price & AI Tip */
.price-input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--apple-light-gray);
  padding: 10px 12px;
  border-radius: var(--border-radius-sm);
  margin-bottom: 8px;
}

.price-input-wrapper:last-child {
  margin-bottom: 0;
}

.currency {
  font-size: 16px;
  font-weight: 700;
  margin-right: 4px;
}

.price-input {
  font-size: 16px;
  font-weight: 700;
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
}

.ai-tip {
  font-size: 11px;
  color: #5856d6; /* iOS Purple for AI */
  margin-top: 6px;
  font-weight: 500;
  line-height: 1.4;
}

/* Image Upload */
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item,
.add-image {
  width: 70px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.add-image {
  background-color: var(--apple-light-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--apple-gray);
  cursor: pointer;
}

.add-image-camera {
  width: 22px;
  height: 22px;
  opacity: 0.85;
}

/* Submit */
.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  justify-content: center;
}

.submit-section .btn-primary {
  width: 100%;
  max-width: 640px;
}

@media (max-width: 767px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
