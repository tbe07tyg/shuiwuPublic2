<!--
 * @file 提交立项申请页面 - 申报单位角色
 * @description 申报单位提交新的项目立项申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 * @reference 严格遵循《页面统一风格设计规范.md》进行页面结构和样式优化
-->
<template>
  <div class="submit-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-description">{{ pageDescription }}</p>
      </div>
      <div class="header-actions">
        <a-button @click="goBack">
          <ArrowLeftOutlined />
          返回列表
        </a-button>
      </div>
    </div>

    <!-- 申请表单 -->
    <a-card :bordered="false">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >


        <!-- 申请信息 -->
        <div class="form-section">
          <div class="section-header">
            <h3>
              <FileTextOutlined />
              申请信息
            </h3>
            <p>填写立项申请的基本信息</p>
          </div>
          <div class="section-content">
            <a-form-item
              label="立项名称"
              name="projectName"
              :rules="[{ required: true, message: '请输入立项名称' }]"
            >
              <a-input
                v-model:value="formData.projectName"
                placeholder="请输入立项名称"
                size="large"
              />
            </a-form-item>

            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="年度"
                  name="year"
                  :rules="[{ required: true, message: '请选择年度' }]"
                >
                  <a-select
                    v-model:value="formData.year"
                    placeholder="请选择年度"
                    size="large"
                  >
                    <a-select-option value="2024">2024</a-select-option>
                    <a-select-option value="2025">2025</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="申请人"
                  name="applicant"
                  :rules="[{ required: true, message: '请输入申请人姓名' }]"
                >
                  <a-input
                    v-model:value="formData.applicant"
                    placeholder="请输入申请人姓名"
                    size="large"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="申请单位"
                  name="department"
                  :rules="[{ required: true, message: '请输入申请单位' }]"
                >
                  <a-input
                    v-model:value="formData.department"
                    placeholder="请输入申请单位"
                    size="large"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="项目周期(月)"
                  name="duration"
                  :rules="[{ required: true, message: '请输入项目周期' }]"
                >
                  <a-input-number
                    v-model:value="formData.duration"
                    placeholder="请输入项目周期"
                    size="large"
                    :min="1"
                    :max="60"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="预算(万元)"
                  name="budget"
                  :rules="[{ required: true, message: '请输入项目预算' }]"
                >
                  <a-input-number
                    v-model:value="formData.budget"
                    placeholder="请输入项目预算"
                    size="large"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="预期立项时间"
                  name="expectedDate"
                  :rules="[{ required: true, message: '请选择预期立项时间' }]"
                >
                  <a-date-picker
                    v-model:value="formData.expectedDate"
                    placeholder="请选择预期立项时间"
                    size="large"
                    style="width: 100%"
                    :disabled-date="disabledDate"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item
              label="申请说明"
              name="description"
              :rules="[{ required: true, message: '请填写申请说明' }]"
            >
              <a-textarea
                v-model:value="formData.description"
                placeholder="请详细说明项目完成情况、主要成果及立项准备情况"
                :rows="4"
                size="large"
                show-count
                :maxlength="500"
              />
            </a-form-item>

            <a-form-item label="备注说明" name="remarks">
              <a-textarea
                v-model:value="formData.remarks"
                placeholder="其他需要说明的事项（选填）"
                :rows="3"
                size="large"
                show-count
                :maxlength="200"
              />
            </a-form-item>
          </div>
        </div>

        <!-- 评审意见显示 -->
        <div v-if="(isResubmit || isImprovement) && reviewComments" class="form-section">
          <div class="section-header">
            <h3>
              <ExclamationCircleOutlined />
              {{ isImprovement ? '整改要求' : '审核意见' }}
            </h3>
            <p>请仔细阅读以下{{ isImprovement ? '整改要求' : '审核意见' }}，并据此修改完善申请材料</p>
          </div>
          <div class="review-comments-content">
            <a-alert
              :message="isImprovement ? '立项会议整改要求' : '材料审核意见'"
              :type="isImprovement ? 'warning' : 'error'"
              show-icon
            >
              <template #description>
                <div class="comments-text">{{ reviewComments }}</div>
              </template>
            </a-alert>
          </div>
        </div>

        <!-- 材料上传 -->
        <div class="form-section">
          <div v-if="isResubmit || isImprovement" class="resubmit-notice">
            <a-alert
              :message="isImprovement ? '整改材料提交' : '重新提交提醒'"
              :description="isImprovement ? 
                '请根据立项会议的整改要求，上传相应的整改材料和说明文档。' : 
                '由于材料审核未通过，请根据审核意见重新准备并上传所有必需材料。'"
              :type="isImprovement ? 'warning' : 'info'"
              show-icon
              style="margin-bottom: 16px"
            />
          </div>
          
          <!-- 使用材料模板同步组件 -->
          <MaterialTemplateSync
            ref="materialTemplateSyncRef"
            business-type="apply"
            @files-change="handleFilesChange"
            @validation-change="handleValidationChange"
            @config-update="handleConfigUpdate"
          />
        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <a-space>
            <a-button @click="handleSaveDraft">
              <SaveOutlined />
              保存草稿
            </a-button>
            <a-button type="primary" html-type="submit">
              <SendOutlined />
              提交申请
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
/**
 * 提交验收申请页面 - 申报单位角色
 * 
 * 本页面严格遵循《页面统一风格设计规范.md》中的规范要求：
 * 1. 使用PageContainer作为页面最外层容器
 * 2. 提供title和description作为PageContainer的属性
 * 3. 将主要操作按钮放在actions插槽中
 * 4. 内容区域使用统一的灰色背景
 * 5. 卡片内容区域置于灰色背景之上
 * 6. 统一使用Ant Design Vue组件和全局样式
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  UploadOutlined,
  SaveOutlined,
  SendOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import FilePreview from '@/components/FilePreview.vue'
import MaterialTemplateSync from '@/components/MaterialTemplateSync.vue'

const router = useRouter()
const formRef = ref()
const materialTemplateSyncRef = ref()

// 材料模板同步相关状态
const materialValidation = ref({
  allRequiredUploaded: false,
  uploadedCount: 0,
  totalCount: 0
})
const uploadedMaterials = ref([])

// 判断是否是重新提交模式
const isResubmit = computed(() => {
  return router.currentRoute.value.query.resubmit === 'true'
})

// 判断是否是整改材料提交模式
const isImprovement = computed(() => {
  return router.currentRoute.value.query.improvement === 'true'
})

/**
 * 页面标题
 * @type {ComputedRef<string>}
 */
const pageTitle = computed(() => {
  if (isImprovement.value) {
    return '提交整改材料'
  } else if (isResubmit.value) {
    return '重新提交立项申请'
  } else {
    return '提交立项申请'
  }
})

/**
 * 页面描述
 * @type {ComputedRef<string>}
 */
const pageDescription = computed(() => {
  if (isImprovement.value) {
    return '根据立项会议的整改要求，提交相应的整改材料和说明'
  } else if (isResubmit.value) {
    return '根据审核意见修改完善后重新提交立项申请'
  } else {
    return '填写项目立项申请信息并上传相关材料'
  }
})

// 表单数据
const formData = ref({
  year: '2024',
  projectName: '',
  applicant: '',
  department: '',
  duration: undefined,
  budget: undefined,
  expectedDate: undefined,
  description: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  year: [{ required: true, message: '请选择年度' }],
  projectName: [{ required: true, message: '请输入立项名称' }],
  applicant: [{ required: true, message: '请输入申请人姓名' }],
  department: [{ required: true, message: '请输入申请单位' }],
  duration: [{ required: true, message: '请输入项目周期' }],
  budget: [{ required: true, message: '请输入项目预算' }],
  expectedDate: [{ required: true, message: '请选择预期立项时间' }],
  description: [{ required: true, message: '请填写申请说明' }]
}



// 必需材料配置
const requiredMaterials = ref([
  {
    key: 'acceptance_report',
    name: '项目立项报告',
    description: '详细的项目立项报告，包含项目完成情况、技术指标等',
    fileList: []
  },
  {
    key: 'summary_report',
    name: '项目总结报告',
    description: '项目实施过程总结，包含经验教训、改进建议等',
    fileList: []
  },
  {
    key: 'achievement_materials',
    name: '成果汇总材料',
    description: '项目产出的各类成果材料，如软件、报告、专利等',
    fileList: []
  },
  {
    key: 'financial_report',
    name: '财务决算报告',
    description: '项目资金使用情况的详细财务报告',
    fileList: []
  }
])

// 可选材料配置
const optionalMaterials = ref([
  {
    key: 'ip_list',
    name: '知识产权清单',
    description: '项目产生的专利、软著等知识产权清单',
    fileList: []
  },
  {
    key: 'test_report',
    name: '测试报告',
    description: '系统测试、性能测试等相关测试报告',
    fileList: []
  },
  {
    key: 'user_manual',
    name: '用户手册',
    description: '系统使用手册、操作指南等文档',
    fileList: []
  },
  {
    key: 'other_materials',
    name: '其他材料',
    description: '其他与项目立项相关的补充材料',
    fileList: []
  }
])

// 提交状态
const submitting = ref(false)

// 审核意见
const reviewComments = ref('')

// 文件预览相关
const previewVisible = ref(false)
const currentPreviewFile = ref({})



// 日期禁用规则
const disabledDate = (current) => {
  // 不能选择今天之前的日期
  return current && current < dayjs().startOf('day')
}

// 事件处理方法
const goBack = () => {
  router.go(-1)
}



const handleMaterialUpload = (info, materialKey) => {
  // 找到对应的材料配置
  let material = requiredMaterials.value.find(m => m.key === materialKey)
  if (!material) {
    material = optionalMaterials.value.find(m => m.key === materialKey)
  }
  
  if (material) {
    material.fileList = info.fileList
  }
}

// 预览材料文件
const previewMaterial = (file) => {
  currentPreviewFile.value = {
    id: file.uid,
    name: file.name,
    type: file.type,
    size: file.size,
    url: file.url || URL.createObjectURL(file.originFileObj || file),
    uploadTime: new Date().toLocaleString()
  }
  
  previewVisible.value = true
}

// 下载材料文件
const downloadMaterial = (file) => {
  const link = document.createElement('a')
  link.href = file.url || URL.createObjectURL(file.originFileObj || file)
  link.download = file.name
  link.click()
  
  message.success(`正在下载：${file.name}`)
}

// 处理文件下载事件
const handleDownloadFile = (fileInfo) => {
  const link = document.createElement('a')
  link.href = fileInfo.url
  link.download = fileInfo.name
  link.click()
  
  message.success(`正在下载：${fileInfo.name}`)
}

// 删除材料文件
const removeMaterial = (material, file) => {
  const index = material.fileList.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    material.fileList.splice(index, 1)
    message.success('文件删除成功')
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size) return ''
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + 'MB'
  return (size / 1024 / 1024 / 1024).toFixed(1) + 'GB'
}

const handleSaveDraft = async () => {
  try {
    // 保存草稿逻辑
    message.success('草稿保存成功')
  } catch (error) {
    message.error('草稿保存失败')
  }
}

const handleSubmit = async (values) => {
  try {
    submitting.value = true
    
    // 检查必需材料是否已上传
    const missingMaterials = requiredMaterials.value.filter(m => m.fileList.length === 0)
    if (missingMaterials.length > 0) {
      message.error(`请上传必需材料：${missingMaterials.map(m => m.name).join('、')}`)
      return
    }
    
    // 构建提交数据
    const submitData = {
      ...values,
      materials: {
        required: requiredMaterials.value.reduce((acc, m) => {
          acc[m.key] = m.fileList
          return acc
        }, {}),
        optional: optionalMaterials.value.reduce((acc, m) => {
          acc[m.key] = m.fileList
          return acc
        }, {})
      }
    }
    
    console.log('Submit data:', submitData)
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    message.success('立项申请提交成功')
              router.push('/implementation/approval?tab=application-manage')
    
  } catch (error) {
    message.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

/**
 * 处理材料文件变化
 */
const handleFilesChange = (data) => {
  const { configId, file, action } = data
  if (action === 'add') {
    uploadedMaterials.value.push({ configId, file })
  } else if (action === 'remove') {
    const index = uploadedMaterials.value.findIndex(item => item.configId === configId)
    if (index > -1) {
      uploadedMaterials.value.splice(index, 1)
    }
  }
}

/**
 * 处理验证状态变化
 */
const handleValidationChange = (validation) => {
  materialValidation.value = validation
}

/**
 * 处理配置更新
 */
const handleConfigUpdate = (configs) => {
  console.log('立项材料配置已更新:', configs)
}

// 生命周期
onMounted(() => {
  const route = router.currentRoute.value
  
  // 检查是否是重新提交
  if (route.query.resubmit === 'true') {
    // 自动填充预期立项时间
    if (route.query.expectedTime) {
      formData.value.expectedDate = dayjs(route.query.expectedTime)
    }
    
    // 自动填充申请说明
    if (route.query.description) {
      formData.value.description = decodeURIComponent(route.query.description)
    }
    
    // 接收审核意见（优先使用rejectionReason，兼容reviewComments）
    if (route.query.rejectionReason) {
      reviewComments.value = decodeURIComponent(route.query.rejectionReason)
    } else if (route.query.reviewComments) {
      reviewComments.value = decodeURIComponent(route.query.reviewComments)
    }
    
    // 显示重新提交提示
    message.info('请重新上传立项材料并完善申请信息')
  }
  
  // 检查是否是提交整改材料
  if (route.query.improvement === 'true') {
    // 自动填充预期立项时间
    if (route.query.expectedTime) {
      formData.value.expectedDate = dayjs(route.query.expectedTime)
    }
    
    // 自动填充申请说明
    if (route.query.description) {
      formData.value.description = decodeURIComponent(route.query.description)
    }
    
    // 接收整改要求
    if (route.query.improvementRequirements) {
      reviewComments.value = decodeURIComponent(route.query.improvementRequirements)
    }
    
    // 显示整改材料提交提示
    message.info('请根据整改要求上传相关材料')
  }
})
</script>

<style scoped>
.submit-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 0;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 表单区域样式 */
.form-section {
  margin-bottom: 32px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header p {
  color: #8c8c8c;
  margin: 0;
}

.section-content {
  margin-bottom: 16px;
}



/* 材料上传样式 */
.material-group {
  margin-bottom: 24px;
}

.material-group h4 {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin: 0 0 8px 0;
}

.material-tip {
  color: #8c8c8c;
  font-size: 13px;
  margin: 0 0 16px 0;
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
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.material-info {
  flex: 1;
}

.material-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.material-desc {
  font-size: 13px;
  color: #8c8c8c;
}

.material-upload {
  min-width: 120px;
  display: flex;
  justify-content: flex-end;
}

/* 评审意见显示样式 */
.review-comments-content {
  margin-top: 16px;
}

.comments-text {
  white-space: pre-line;
  line-height: 1.6;
  color: #262626;
  background: #fafafa;
  padding: 12px;
  border-radius: 6px;
  margin-top: 8px;
}

/* 重新提交提醒样式 */
.resubmit-notice {
  margin-top: 16px;
}

/* 表单操作区域 */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .material-item {
    flex-direction: column;
    gap: 16px;
  }
  
  .material-upload {
    width: 100%;
    justify-content: flex-start;
  }
}
</style> 