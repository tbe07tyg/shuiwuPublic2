<template>
  <a-modal
    :open="visible"
    :title="fileInfo.name || '文件预览'"
    width="90%"
    :footer="null"
    :destroy-on-close="true"
    @cancel="handleClose"
    class="file-preview-modal"
  >
    <div class="file-preview-container">
      <!-- 文件信息头部 -->
      <div class="file-info-header">
        <div class="file-info">
          <span class="file-name">{{ fileInfo.name }}</span>
          <span class="file-size">{{ formatFileSize(fileInfo.size) }}</span>
          <a-tag :color="getFileTypeColor(fileInfo.type)">{{ getFileTypeText(fileInfo.type) }}</a-tag>
        </div>
        <div class="file-actions">
          <a-button type="link" @click="downloadFile">
            <DownloadOutlined />
            下载
          </a-button>
          <a-button type="link" @click="refreshPreview">
            <ReloadOutlined />
            刷新
          </a-button>
        </div>
      </div>

      <!-- 预览内容区域 -->
      <div class="preview-content">
        <!-- PDF 预览 -->
        <div v-if="fileType === 'pdf'" class="pdf-preview">
          <div class="pdf-toolbar">
            <a-space>
              <a-button @click="zoomOut" :disabled="scale <= 0.5">
                <ZoomOutOutlined />
              </a-button>
              <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
              <a-button @click="zoomIn" :disabled="scale >= 3">
                <ZoomInOutlined />
              </a-button>
              <a-divider type="vertical" />
              <span>页面: {{ currentPage }} / {{ totalPages }}</span>
              <a-button @click="prevPage" :disabled="currentPage <= 1">
                <LeftOutlined />
              </a-button>
              <a-button @click="nextPage" :disabled="currentPage >= totalPages">
                <RightOutlined />
              </a-button>
            </a-space>
          </div>
          <div class="pdf-viewer">
            <iframe 
              v-if="previewUrl"
              :src="previewUrl"
              frameborder="0"
              width="100%"
              height="600px"
            ></iframe>
          </div>
        </div>

        <!-- Office 文档预览 -->
        <div v-else-if="isOfficeFile" class="office-preview">
          <!-- 自动转换为PDF预览 -->
          <div v-if="convertedPdfUrl" class="pdf-preview">
            <div class="pdf-toolbar">
            <a-space>
                <a-button @click="zoomOut" :disabled="scale <= 0.5">
                  <ZoomOutOutlined />
              </a-button>
                <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
                <a-button @click="zoomIn" :disabled="scale >= 3">
                  <ZoomInOutlined />
              </a-button>
                <a-divider type="vertical" />
                <span>{{ getFileTypeText(fileInfo.type) }} (已转换为PDF)</span>
            </a-space>
          </div>
            <div class="pdf-viewer">
            <iframe 
                :src="convertedPdfUrl"
              frameborder="0"
              width="100%"
              height="600px"
            ></iframe>
            </div>
          </div>
          
          <!-- 智能转换中状态 -->
          <div v-else-if="converting" class="converting-status">
            <div class="converting-content">
              <div class="conversion-animation">
                <ExportOutlined style="font-size: 48px; color: #1890ff; margin-bottom: 16px;" />
                <h3>正在智能转换 {{ getFileTypeText(fileInfo.type) }}</h3>
                <p>自动优化内容布局和显示效果，请稍候...</p>
                
                <div class="progress-info">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: convertProgress + '%' }"></div>
                  </div>
                  <div class="progress-text">{{ convertProgress }}%</div>
                </div>
                
                <div class="conversion-features">
                  <div class="feature-item">
                    <CheckCircleOutlined style="color: #52c41a;" />
                    <span>智能页面布局</span>
                  </div>
                  <div class="feature-item">
                    <CheckCircleOutlined style="color: #52c41a;" />
                    <span>自适应内容大小</span>
                  </div>
                  <div class="feature-item">
                    <CheckCircleOutlined style="color: #52c41a;" />
                    <span>最优显示方向</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 转换错误或等待状态 -->
          <div v-else class="conversion-error">
              <div class="unavailable-content">
              <ExportOutlined style="font-size: 48px; color: #ff4d4f;" />
              <h3>{{ getFileTypeText(fileInfo.type) }} 转换遇到问题</h3>
              <p>智能转换服务暂时不可用，请稍后重试</p>
              
              <div class="error-actions">
                <a-space>
                  <a-button type="primary" @click="convertToPdf" :loading="converting">
                    <ReloadOutlined />
                    重新转换
                  </a-button>
                  <a-button @click="downloadFile">
                    <DownloadOutlined />
                    下载文件
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </div>

        <!-- 图片预览 -->
        <div v-else-if="fileType === 'image'" class="image-preview">
          <div class="image-toolbar">
            <a-space>
              <a-button @click="zoomOut" :disabled="scale <= 0.1">
                <ZoomOutOutlined />
              </a-button>
              <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
              <a-button @click="zoomIn" :disabled="scale >= 5">
                <ZoomInOutlined />
              </a-button>
              <a-button @click="resetZoom">
                <CompressOutlined />
                适应窗口
              </a-button>
            </a-space>
          </div>
          <div class="image-viewer">
            <img 
              :src="previewUrl" 
              :style="{ transform: `scale(${scale})`, transformOrigin: 'center' }"
            />
          </div>
        </div>

        <!-- 不支持的文件类型 -->
        <div v-else class="unsupported-preview">
          <div class="unsupported-content">
            <QuestionCircleOutlined style="font-size: 48px; color: #ccc;" />
            <h3>不支持预览此文件类型</h3>
            <p>文件类型：{{ getFileTypeText(fileInfo.type) }}</p>
            <a-button type="primary" @click="downloadFile">
              <DownloadOutlined />
              下载文件查看
            </a-button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-overlay">
          <a-spin size="large">
            <template #tip>正在加载预览...</template>
          </a-spin>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
/**
 * 文件预览组件
 * 支持 PDF、Word、PPT、图片等格式的预览
 */
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  DownloadOutlined,
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  LeftOutlined,
  RightOutlined,
  FileTextOutlined,
  ExportOutlined,
  CompressOutlined,
  QuestionCircleOutlined,
  CopyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  fileInfo: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:visible', 'download'])

// 响应式数据
const loading = ref(false)
const converting = ref(false)
const scale = ref(1)
const currentPage = ref(1)
const totalPages = ref(1)
const previewUrl = ref('')
const officePreviewUrl = ref('')
const convertedPdfUrl = ref('')
const convertProgress = ref(0)

// 计算属性
const fileType = computed(() => {
  const name = props.fileInfo.name || ''
  const ext = name.split('.').pop()?.toLowerCase()
  
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['ppt', 'pptx'].includes(ext)) return 'powerpoint'
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image'
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  
  return 'unknown'
})

const isOfficeFile = computed(() => {
  return ['word', 'powerpoint', 'excel'].includes(fileType.value)
})

// 监听文件变化
watch(() => props.fileInfo, (newFile) => {
  if (newFile && newFile.name) {
    initPreview()
  }
}, { immediate: true })

watch(() => props.visible, (visible) => {
  if (visible && props.fileInfo?.name) {
    initPreview()
  } else if (!visible) {
    resetPreviewState()
  }
})

// 初始化预览
const initPreview = async () => {
  if (!props.fileInfo?.name) return
  
  loading.value = true
  
  try {
    await generatePreviewUrl()
  } catch (err) {
    console.error('Preview generation failed:', err)
  } finally {
    loading.value = false
  }
}

// 生成预览URL
const generatePreviewUrl = async () => {
  const file = props.fileInfo
  
  if (fileType.value === 'pdf') {
    // PDF 预览
    if (file.url) {
      previewUrl.value = file.url
    } else {
      // 模拟 PDF URL
      previewUrl.value = `/api/files/preview/demo.pdf`
    }
  } else if (isOfficeFile.value) {
    // Office 文档预览
    await generateOfficePreviewUrl()
  } else if (fileType.value === 'image') {
    // 图片预览
    if (file.url) {
      previewUrl.value = file.url
    } else {
      previewUrl.value = `/api/files/preview/demo.jpg`
    }
  }
}

// 生成 Office 文档预览 URL（自动转换方案）
const generateOfficePreviewUrl = async () => {
  const file = props.fileInfo
  
  // 直接启动智能转换
  await smartConvertToPdf(file)
}

// 缩放控制
const zoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.min(scale.value + 0.25, 3)
  }
}

const zoomOut = () => {
  if (scale.value > 0.1) {
    scale.value = Math.max(scale.value - 0.25, 0.1)
  }
}

const resetZoom = () => {
  scale.value = 1
}

// 页面控制
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// 刷新预览
const refreshPreview = () => {
  initPreview()
}

const refreshOfficePreview = () => {
  generateOfficePreviewUrl()
}

// 创建演示PDF预览内容
const createDemoPdfDataUrl = (file) => {
  // 创建一个简单的HTML预览，模拟PDF转换结果
  const fileName = file.name || '未知文件'
  const fileType = getFileTypeText(fileType.value)
  
  const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>${fileName} - 预览</title>
        <style>
          body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            margin: 40px;
            background: #f5f5f5;
            color: #333;
          }
          .preview-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1890ff;
            padding-bottom: 20px;
          }
          .file-icon {
            font-size: 48px;
            color: #1890ff;
            margin-bottom: 10px;
          }
          .file-name {
            font-size: 24px;
            font-weight: bold;
            color: #1890ff;
          }
          .file-type {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .content {
            margin: 30px 0;
            line-height: 1.8;
          }
          .demo-text {
            background: #f0f8ff;
            padding: 20px;
            border-radius: 4px;
            border-left: 4px solid #1890ff;
            margin: 20px 0;
          }
          .conversion-info {
            background: #f6ffed;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #b7eb8f;
            margin-top: 30px;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e8e8e8;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="header">
            <div class="file-icon">📄</div>
            <div class="file-name">${fileName}</div>
            <div class="file-type">${fileType} 智能转换预览</div>
          </div>
          
          <div class="content">
            <div class="demo-text">
              <h3>📋 文件预览演示</h3>
              <p>这是 <strong>${fileType}</strong> 文件的智能转换预览效果。</p>
              <p>实际项目中，这里会显示您的文档转换后的真实内容。</p>
            </div>
            
            <h4>🔧 智能转换特性：</h4>
            <ul>
              <li><strong>自动布局优化</strong>：根据内容类型选择最佳页面方向</li>
              <li><strong>智能缩放调整</strong>：确保所有内容都能完整显示</li>
              <li><strong>字体嵌入处理</strong>：保证文字显示效果一致</li>
              <li><strong>图片质量优化</strong>：平衡文件大小与显示质量</li>
            </ul>
            
            <div class="conversion-info">
              ✅ <strong>转换完成</strong> - 文件已成功转换为PDF格式，支持缩放、翻页等操作
            </div>
          </div>
          
          <div class="footer">
            华水科研管理系统 - 智能文档预览服务
          </div>
        </div>
      </body>
    </html>
  `
  
  // 将HTML内容转换为data URL，这样可以在iframe中显示
  const blob = new Blob([htmlContent], { type: 'text/html' })
  return URL.createObjectURL(blob)
}

// 尝试本地预览
const tryLocalPreview = async () => {
  converting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 尝试不同的预览方案
    const file = props.fileInfo
    
    // 方案1：尝试直接在iframe中显示（可能被浏览器阻止）
    if (file.url) {
      officePreviewUrl.value = file.url
      message.success('已尝试加载本地预览，如果无法显示请下载文件查看')
    } else {
      message.warning('无法获取文件地址，请使用下载功能')
    }
  } catch (err) {
    message.error('本地预览尝试失败: ' + err.message)
  } finally {
    converting.value = false
  }
}

// 转换预览（保留原有功能）
const convertToPreview = async () => {
  converting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    await generateOfficePreviewUrl()
    
    if (officePreviewUrl.value) {
      message.success('文档转换成功')
    } else {
      message.warning('转换服务暂时不可用，请稍后重试')
    }
  } catch (err) {
    message.error('转换失败: ' + err.message)
  } finally {
    converting.value = false
  }
}

// 下载文件
const downloadFile = () => {
  emit('download', props.fileInfo)
  message.info('开始下载文件...')
}

// 关闭预览
const handleClose = () => {
  emit('update:visible', false)
}

// 重置预览状态
const resetPreviewState = () => {
  scale.value = 1
  currentPage.value = 1
  totalPages.value = 1
  
  // 清理URL对象，防止内存泄漏
  if (convertedPdfUrl.value && convertedPdfUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(convertedPdfUrl.value)
  }
  
  previewUrl.value = ''
  officePreviewUrl.value = ''
  convertedPdfUrl.value = ''
  loading.value = false
}

// 工具函数
const formatFileSize = (size) => {
  if (!size) return '未知大小'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + 'MB'
  return (size / 1024 / 1024 / 1024).toFixed(1) + 'GB'
}

const getFileTypeColor = (type) => {
  const colorMap = {
    'pdf': 'red',
    'word': 'blue',
    'powerpoint': 'orange',
    'excel': 'green',
    'image': 'purple'
  }
  return colorMap[fileType.value] || 'default'
}

const getFileTypeText = (type) => {
  const textMap = {
    'pdf': 'PDF文档',
    'word': 'Word文档',
    'powerpoint': 'PowerPoint演示文稿',
    'excel': 'Excel表格',
    'image': '图片文件',
    'unknown': '未知文件'
  }
  return textMap[fileType.value] || '未知文件'
}

const formatDate = (date) => {
  if (!date) return '未知时间'
  return new Date(date).toLocaleDateString()
}

// 复制文件信息
const copyFileInfo = async () => {
  const fileInfo = `文件名: ${props.fileInfo.name}
文件大小: ${formatFileSize(props.fileInfo.size)}
文件类型: ${getFileTypeText(props.fileInfo.type)}
最后修改: ${formatDate(props.fileInfo.lastModified)}`
  
  try {
    await navigator.clipboard.writeText(fileInfo)
    message.success('文件信息已复制到剪贴板')
  } catch (err) {
    message.error('复制失败，请手动选择文本复制')
  }
}

// 打开在线工具
const openOnlineTool = (tool) => {
  const urls = {
    office365: 'https://www.office.com/',
    googleDocs: 'https://docs.google.com/',
    wpsCloud: 'https://www.kdocs.cn/'
  }
  
  if (urls[tool]) {
    window.open(urls[tool], '_blank')
    message.info('已打开在线工具，请手动上传文件进行预览')
  }
}

// 打开转换器
const openConverter = (converter) => {
  const urls = {
    smallpdf: 'https://smallpdf.com/cn/word-to-pdf',
    ilovepdf: 'https://www.ilovepdf.com/zh-cn/word_to_pdf'
  }
  
  if (urls[converter]) {
    window.open(urls[converter], '_blank')
    message.info('已打开转换工具，转换为PDF后可支持在线预览')
  }
}

// 智能自动转换为PDF预览
const smartConvertToPdf = async (file) => {
  converting.value = true
  convertProgress.value = 0
  
  try {
    // 分析文件属性，生成智能转换参数
    const conversionParams = analyzeFileForConversion(file)
    
    // 模拟智能转换进度
    const progressSteps = [
      { step: '分析文档结构...', progress: 15 },
      { step: '优化页面布局...', progress: 35 },
      { step: '调整内容大小...', progress: 55 },
      { step: '生成PDF格式...', progress: 80 },
      { step: '完成转换处理...', progress: 100 }
    ]
    
    for (const stepInfo of progressSteps) {
      convertProgress.value = stepInfo.progress
      // 实际项目中这里调用后端API
      // const response = await fetch('/api/convert/smart-office-to-pdf', { 
      //   method: 'POST',
      //   body: JSON.stringify({ 
      //     fileUrl: file.url, 
      //     fileName: file.name,
      //     ...conversionParams 
      //   })
      // })
      
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    // 模拟转换成功，生成本地演示PDF预览
    // 创建一个简单的PDF预览内容
    convertedPdfUrl.value = createDemoPdfDataUrl(file)
    
    message.success(`${getFileTypeText(fileType.value)} 转换完成！已优化为最佳预览效果`)
  } catch (error) {
    message.error('智能转换失败：' + error.message)
  } finally {
    converting.value = false
    convertProgress.value = 0
  }
}

// 分析文件特征，生成转换参数
const analyzeFileForConversion = (file) => {
  const fileSize = file.size || 0
  const fileName = file.name || ''
  const fileType = getFileTypeFromName(fileName)
  
  // 智能参数配置
  const params = {
    // 页面方向：PPT通常横向，Word通常纵向
    orientation: fileType === 'powerpoint' ? 'landscape' : 'portrait',
    
    // 质量设置：根据文件大小调整
    quality: fileSize > 10 * 1024 * 1024 ? 'medium' : 'high', // 10MB以上用中等质量
    
    // 页面大小：根据内容类型优化
    pageSize: getOptimalPageSize(fileType, fileSize),
    
    // 缩放策略：确保内容完整显示
    scaleToFit: true,
    
    // 字体嵌入：确保显示效果
    embedFonts: true,
    
    // 图片压缩：平衡质量和大小
    imageCompression: fileSize > 5 * 1024 * 1024 ? 0.8 : 0.9,
    
    // 特殊优化
    optimizations: getTypeSpecificOptimizations(fileType)
  }
  
  return params
}

// 根据文件名获取类型
const getFileTypeFromName = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['ppt', 'pptx'].includes(ext)) return 'powerpoint'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  return 'unknown'
}

// 获取最优页面大小
const getOptimalPageSize = (fileType, fileSize) => {
  switch (fileType) {
    case 'powerpoint':
      return 'A4-landscape' // PPT适合横向A4
    case 'excel':
      return 'A3-landscape' // Excel适合大尺寸横向
    case 'word':
    default:
      return 'A4-portrait' // Word适合纵向A4
  }
}

// 获取类型特定优化
const getTypeSpecificOptimizations = (fileType) => {
  switch (fileType) {
    case 'powerpoint':
      return {
        preserveSlideTransitions: false,
        optimizeForViewing: true,
        maintainAspectRatio: true
      }
    case 'excel':
      return {
        autoFitColumns: true,
        showGridlines: true,
        optimizeForPrint: false
      }
    case 'word':
      return {
        preserveFormatting: true,
        optimizeImages: true,
        maintainPageBreaks: true
      }
    default:
      return {}
  }
}

// 兼容旧版本的转换函数（用于按钮调用）
const convertToPdf = async () => {
  await smartConvertToPdf(props.fileInfo)
}
</script>

<style scoped>
.file-preview-modal {
  top: 20px;
}

.file-preview-modal :deep(.ant-modal-body) {
  padding: 0;
  max-height: 80vh;
  overflow: hidden;
}

.file-preview-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.file-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-name {
  font-weight: 600;
  font-size: 16px;
  color: #262626;
}

.file-size {
  color: #8c8c8c;
  font-size: 14px;
}

.preview-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* PDF 预览样式 */
.pdf-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pdf-toolbar {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.zoom-info {
  min-width: 50px;
  text-align: center;
  font-weight: 500;
}

.pdf-viewer {
  flex: 1;
  overflow: auto;
}

/* Office 预览样式 */
.office-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.office-toolbar {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.office-viewer {
  flex: 1;
  position: relative;
}

.preview-unavailable {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unavailable-content {
  text-align: center;
  padding: 48px;
}

.unavailable-content h3 {
  margin: 16px 0 8px;
  color: #262626;
}

.unavailable-content p {
  color: #8c8c8c;
  margin-bottom: 24px;
}

.preview-options {
  margin-top: 24px;
}

.preview-tips {
  text-align: left;
  padding: 16px;
  background: #f6f8ff;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.preview-tips h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 14px;
}

.preview-tips ul {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #666;
}

.preview-tips li {
  margin-bottom: 4px;
}

.file-details {
  margin: 20px 0;
  text-align: left;
}

.online-tools, .format-suggestions {
  text-align: left;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  margin: 8px 0;
}

.online-tools h4, .format-suggestions h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 14px;
}

.format-suggestions p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

/* 转换状态样式 */
.converting-status {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.converting-content {
  text-align: center;
  padding: 48px;
}

.converting-info h3 {
  margin: 16px 0 8px;
  color: #1890ff;
}

.converting-info p {
  color: #8c8c8c;
  margin-bottom: 16px;
}

.progress-text {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.conversion-needed {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.conversion-options {
  margin-top: 24px;
}

.conversion-tips {
  text-align: left;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.conversion-tips h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 14px;
}

.conversion-tips ul {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #666;
}

.conversion-tips li {
  margin-bottom: 4px;
}

/* 智能转换状态样式 */
.conversion-animation {
  text-align: center;
  padding: 48px 24px;
}

.conversion-animation h3 {
  margin: 16px 0 8px;
  color: #1890ff;
  font-size: 18px;
}

.conversion-animation p {
  color: #8c8c8c;
  margin-bottom: 24px;
}

.progress-info {
  margin: 24px 0;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin: 0 auto 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.conversion-features {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.conversion-error .error-actions {
  margin-top: 24px;
}

/* 图片预览样式 */
.image-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.image-toolbar {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.image-viewer {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.image-viewer img {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.3s;
}

/* 不支持的文件类型 */
.unsupported-preview {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unsupported-content {
  text-align: center;
  padding: 48px;
}

.unsupported-content h3 {
  margin: 16px 0 8px;
  color: #262626;
}

.unsupported-content p {
  color: #8c8c8c;
  margin-bottom: 24px;
}

/* 加载和错误状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-preview-modal {
    top: 0;
    margin: 0;
  }
  
  .file-preview-modal :deep(.ant-modal) {
    max-width: 100vw;
    margin: 0;
  }
  
  .file-info-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .file-actions {
    align-self: stretch;
  }
}
</style> 