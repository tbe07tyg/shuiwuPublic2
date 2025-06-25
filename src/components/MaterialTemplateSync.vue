<!--
  @component MaterialTemplateSync
  @description 材料模板同步组件，用于在业务页面中显示和使用配置好的材料模板
  @author 科研管理系统
  @version 1.0.0
  @date 2025-01-22
-->

<template>
  <div class="material-template-sync">
    <!-- 材料提交区域 -->
    <div class="material-submit-section">
      <div class="section-header">
        <h4>
          <FileTextOutlined />
          {{ businessTypeMap[businessType] || '材料' }}提交
        </h4>
        <div class="header-actions">
          <a-button 
            type="link" 
            size="small" 
            @click="refreshConfigs"
            :loading="loading"
          >
            <ReloadOutlined />
            刷新配置
          </a-button>
        </div>
      </div>

      <!-- 材料列表 -->
      <div class="material-list" v-if="materialConfigs.length > 0">
        <div 
          v-for="config in materialConfigs" 
          :key="config.id"
          class="material-item"
          :class="{ 'required': config.isRequired }"
        >
          <div class="material-info">
            <div class="material-title">
              <span class="category-name">
                {{ config.categoryName }}
                <a-tag v-if="config.isRequired" color="red" size="small">必传</a-tag>
                <a-tag v-else color="blue" size="small">选传</a-tag>
              </span>
              <a-tooltip v-if="config.description" :title="config.description">
                <InfoCircleOutlined class="info-icon" />
              </a-tooltip>
            </div>
            
            <div class="material-desc" v-if="config.description">
              {{ config.description }}
            </div>

            <!-- 模板下载 -->
            <div class="template-download" v-if="config.templateFileName">
              <a-button 
                type="link" 
                size="small" 
                @click="downloadTemplate(config)"
                class="template-link"
              >
                <DownloadOutlined />
                下载模板：{{ config.templateFileName }}
              </a-button>
            </div>
          </div>

          <!-- 文件上传区域 -->
          <div class="upload-area">
            <a-upload
              :name="`file_${config.id}`"
              :multiple="false"
              :show-upload-list="false"
              :before-upload="(file) => handleBeforeUpload(file, config)"
              class="material-upload"
            >
              <a-button 
                type="primary" 
                :size="config.isRequired ? 'default' : 'small'"
                :danger="config.isRequired && !getUploadedFile(config.id)"
              >
                <UploadOutlined />
                选择文件
              </a-button>
            </a-upload>

            <!-- 已上传文件显示 -->
            <div class="uploaded-file" v-if="getUploadedFile(config.id)">
              <div class="file-info">
                <FileOutlined />
                <span class="file-name">{{ getUploadedFile(config.id).name }}</span>
                <a-button 
                  type="link" 
                  size="small" 
                  danger
                  @click="removeUploadedFile(config.id)"
                >
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <a-empty 
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="暂无配置的材料类目"
        >
          <a-button type="primary" @click="goToConfigPage">
            前往配置
          </a-button>
        </a-empty>
      </div>

      <!-- 提交验证摘要 -->
      <div class="submit-summary" v-if="materialConfigs.length > 0">
        <a-alert
          :type="allRequiredUploaded ? 'success' : 'warning'"
          :message="getSubmitSummaryMessage()"
          show-icon
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { message, Empty } from 'ant-design-vue'
import { 
  FileTextOutlined, 
  ReloadOutlined, 
  InfoCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import materialTemplateStore from '@/store/materialTemplate'

/**
 * 组件属性
 */
const props = defineProps({
  // 业务类型：apply, opening, midterm, acceptance
  businessType: {
    type: String,
    required: true,
    validator: (value) => ['apply', 'opening', 'midterm', 'acceptance'].includes(value)
  },
  // 是否自动加载配置
  autoLoad: {
    type: Boolean,
    default: true
  },
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: true
  }
})

/**
 * 事件定义
 */
const emit = defineEmits([
  'files-change', // 文件变化事件
  'validation-change', // 验证状态变化事件
  'config-update' // 配置更新事件
])

const router = useRouter()

// 响应式数据
const loading = ref(false)
const materialConfigs = ref([])
const uploadedFiles = ref(new Map()) // 存储已上传的文件 

// 获取业务类型映射
const { businessTypeMap } = materialTemplateStore

/**
 * 计算属性：检查是否所有必传材料都已上传
 */
const allRequiredUploaded = computed(() => {
  const requiredConfigs = materialConfigs.value.filter(config => config.isRequired)
  return requiredConfigs.every(config => uploadedFiles.value.has(config.id))
})

/**
 * 计算属性：获取提交摘要信息
 */
const getSubmitSummaryMessage = () => {
  const total = materialConfigs.value.length
  const required = materialConfigs.value.filter(config => config.isRequired).length
  const uploaded = uploadedFiles.value.size
  const requiredUploaded = materialConfigs.value
    .filter(config => config.isRequired)
    .filter(config => uploadedFiles.value.has(config.id)).length

  if (allRequiredUploaded.value) {
    return `已上传 ${uploaded}/${total} 个文件，所有必传材料已完成`
  } else {
    return `已上传 ${requiredUploaded}/${required} 个必传材料，还需上传 ${required - requiredUploaded} 个必传文件`
  }
}

/**
 * 获取已上传的文件
 */
const getUploadedFile = (configId) => {
  return uploadedFiles.value.get(configId)
}

/**
 * 刷新配置
 */
const refreshConfigs = async () => {
  await loadConfigs()
}

/**
 * 加载配置数据
 */
const loadConfigs = async () => {
  loading.value = true
  try {
    // 从状态管理中获取配置
    const configs = materialTemplateStore.getConfigsByBusinessType(props.businessType)
    materialConfigs.value = configs.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    
    // 触发配置更新事件
    emit('config-update', configs)
  } catch (error) {
    console.error('加载配置失败:', error)
    message.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理文件上传前的验证
 */
const handleBeforeUpload = (file, config) => {
  // 文件大小验证（50MB限制）
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    message.error('文件大小不能超过50MB')
    return false
  }

  // 文件类型验证（根据模板文件扩展名）
  if (config.templateFileName) {
    const templateExt = config.templateFileName.split('.').pop().toLowerCase()
    const fileExt = file.name.split('.').pop().toLowerCase()
    
    // 常见的可接受扩展名映射
    const acceptableExts = {
      'docx': ['docx', 'doc', 'pdf'],
      'doc': ['docx', 'doc', 'pdf'],
      'xlsx': ['xlsx', 'xls'],
      'xls': ['xlsx', 'xls'],
      'pdf': ['pdf', 'docx', 'doc']
    }
    
    const acceptable = acceptableExts[templateExt] || [templateExt]
    if (!acceptable.includes(fileExt)) {
      message.error(`请上传 ${acceptable.join('、')} 格式的文件`)
      return false
    }
  }

  // 存储文件
  uploadedFiles.value.set(config.id, file)
  
  // 触发文件变化事件
  emit('files-change', {
    configId: config.id,
    file: file,
    action: 'add'
  })
  
  // 触发验证状态变化事件
  emit('validation-change', {
    allRequiredUploaded: allRequiredUploaded.value,
    uploadedCount: uploadedFiles.value.size,
    totalCount: materialConfigs.value.length
  })
  
  message.success(`文件 "${file.name}" 已选择`)
  
  // 阻止自动上传
  return false
}

/**
 * 移除已上传的文件
 */
const removeUploadedFile = (configId) => {
  const file = uploadedFiles.value.get(configId)
  if (file) {
    uploadedFiles.value.delete(configId)
    
    // 触发文件变化事件
    emit('files-change', {
      configId: configId,
      file: file,
      action: 'remove'
    })
    
    // 触发验证状态变化事件
    emit('validation-change', {
      allRequiredUploaded: allRequiredUploaded.value,
      uploadedCount: uploadedFiles.value.size,
      totalCount: materialConfigs.value.length
    })
    
    message.success('文件已移除')
  }
}

/**
 * 下载模板文件
 */
const downloadTemplate = (config) => {
  // 模拟下载模板文件
  message.info(`正在下载模板：${config.templateFileName}`)
  
  // 实际应用中这里应该调用下载API
  // downloadTemplateAPI(config.templateFilePath)
}

/**
 * 前往配置页面
 */
const goToConfigPage = () => {
  router.push('/settings/material-template')
}

/**
 * 获取所有上传的文件
 */
const getAllUploadedFiles = () => {
  const files = []
  uploadedFiles.value.forEach((file, configId) => {
    const config = materialConfigs.value.find(c => c.id === configId)
    files.push({
      configId,
      config,
      file
    })
  })
  return files
}

/**
 * 验证所有必传文件是否已上传
 */
const validateRequiredFiles = () => {
  return {
    valid: allRequiredUploaded.value,
    missingFiles: materialConfigs.value
      .filter(config => config.isRequired && !uploadedFiles.value.has(config.id))
      .map(config => config.categoryName)
  }
}

/**
 * 清空所有上传的文件
 */
const clearAllFiles = () => {
  uploadedFiles.value.clear()
  emit('validation-change', {
    allRequiredUploaded: false,
    uploadedCount: 0,
    totalCount: materialConfigs.value.length
  })
  message.success('已清空所有文件')
}

// 配置更新监听器
let unregisterListener = null

/**
 * 注册配置更新监听
 */
const registerConfigListener = () => {
  unregisterListener = materialTemplateStore.registerPageUpdateListener(
    props.businessType,
    (configs) => {
      materialConfigs.value = configs.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      
      // 清理已删除配置对应的文件
      const configIds = new Set(configs.map(c => c.id))
      const filesToRemove = []
      uploadedFiles.value.forEach((file, configId) => {
        if (!configIds.has(configId)) {
          filesToRemove.push(configId)
        }
      })
      
      filesToRemove.forEach(configId => {
        uploadedFiles.value.delete(configId)
      })
      
      emit('config-update', configs)
      
      if (filesToRemove.length > 0) {
        emit('validation-change', {
          allRequiredUploaded: allRequiredUploaded.value,
          uploadedCount: uploadedFiles.value.size,
          totalCount: materialConfigs.value.length
        })
      }
    }
  )
}

// 生命周期钩子
onMounted(async () => {
  if (props.autoLoad) {
    // 初始化配置状态管理
    await materialTemplateStore.initConfigs()
    // 加载配置
    await loadConfigs()
  }
  
  // 注册配置更新监听
  registerConfigListener()
})

onUnmounted(() => {
  // 取消注册监听器
  if (unregisterListener) {
    unregisterListener()
  }
})

// 监听业务类型变化
watch(() => props.businessType, async () => {
  if (props.autoLoad) {
    await loadConfigs()
  }
}, { immediate: false })

// 暴露方法给父组件
defineExpose({
  refreshConfigs,
  getAllUploadedFiles,
  validateRequiredFiles,
  clearAllFiles,
  loadConfigs
})
</script>

<style scoped>
.material-template-sync {
  width: 100%;
}

.material-submit-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h4 {
  margin: 0;
  color: #262626;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.material-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  transition: all 0.2s;
}

.material-item:hover {
  border-color: #40a9ff;
  box-shadow: 0 2px 4px rgba(64, 169, 255, 0.1);
}

.material-item.required {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.material-item.required:hover {
  border-color: #ff7875;
}

.material-info {
  flex: 1;
  margin-right: 16px;
}

.material-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.category-name {
  font-weight: 500;
  color: #262626;
  font-size: 14px;
}

.info-icon {
  color: #8c8c8c;
  cursor: help;
}

.material-desc {
  color: #595959;
  font-size: 12px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.template-download {
  margin-bottom: 4px;
}

.template-link {
  padding: 0;
  height: auto;
  font-size: 12px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 120px;
}

.uploaded-file {
  width: 100%;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 12px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.submit-summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .material-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .material-info {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .upload-area {
    align-items: stretch;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style> 