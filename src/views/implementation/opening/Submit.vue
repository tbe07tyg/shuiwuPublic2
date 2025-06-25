<!--
 * @file 提交开题申请页面 - 申报单位角色
 * @description 申报单位提交新的项目开题申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="opening-application-submit">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <PlusOutlined />
          </span>
          {{ pageTitle }}
        </h1>
        <p class="page-description">
          {{ pageDescription }}
        </p>
      </div>
      <div class="header-actions">
        <a-button @click="goBack">
          <ArrowLeftOutlined />
          返回列表
        </a-button>
      </div>
    </div>

    <!-- 申请表单 -->
    <div class="form-container">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <!-- 项目选择 -->
        <div class="form-section">
          <div class="section-header">
            <h3>
              <ProjectOutlined />
              项目选择
            </h3>
            <p>选择需要申请开题的项目</p>
          </div>
          <div class="section-content">
            <a-form-item
              label="选择项目"
              name="projectId"
              :rules="[{ required: true, message: '请选择项目' }]"
            >
              <a-select
                v-model:value="formData.projectId"
                placeholder="请选择项目"
                size="large"
                show-search
                :filter-option="filterOption"
                @change="handleProjectChange"
              >
                <a-select-option
                  v-for="project in availableProjects"
                  :key="project.id"
                  :value="project.id"
                >
                  <div class="project-option">
                    <div class="project-name">{{ project.name }}</div>
                    <div class="project-info">
                      <span class="project-code">{{ project.code }}</span>
                      <span class="project-status">{{ project.status }}</span>
                    </div>
                  </div>
                </a-select-option>
              </a-select>
            </a-form-item>

            <!-- 选中项目的详细信息 -->
            <div v-if="selectedProject" class="selected-project-info">
              <a-descriptions :column="2" bordered size="small">
                <a-descriptions-item label="项目名称" :span="2">
                  {{ selectedProject.name }}
                </a-descriptions-item>
                <a-descriptions-item label="项目编号">
                  {{ selectedProject.code }}
                </a-descriptions-item>
                <a-descriptions-item label="项目状态">
                  <a-tag :color="getProjectStatusColor(selectedProject.status)">
                    {{ selectedProject.status }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="立项时间">
                  {{ selectedProject.approvalDate }}
                </a-descriptions-item>
                <a-descriptions-item label="计划开始时间">
                  {{ selectedProject.plannedStartDate }}
                </a-descriptions-item>
                <a-descriptions-item label="项目负责人">
                  {{ selectedProject.leader }}
                </a-descriptions-item>
                <a-descriptions-item label="项目总预算">
                  {{ selectedProject.budget }}万元
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </div>
        </div>

        <!-- 申请信息 -->
        <div class="form-section">
          <div class="section-header">
            <h3>
              <FileTextOutlined />
              开题信息
            </h3>
            <p>填写开题申请的基本信息</p>
          </div>
          <div class="section-content">
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="计划开题时间"
                  name="expectedDate"
                  :rules="[{ required: true, message: '请选择计划开题时间' }]"
                >
              <a-date-picker 
                    v-model:value="formData.expectedDate"
                    placeholder="请选择计划开题时间"
                    size="large"
                style="width: 100%" 
                    :disabled-date="disabledDate"
              />
            </a-form-item>
          </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="开题形式"
                  name="openingType"
                  :rules="[{ required: true, message: '请选择开题形式' }]"
                >
                  <a-select
                    v-model:value="formData.openingType"
                    placeholder="请选择开题形式"
                    size="large"
                  >
                    <a-select-option value="meeting">会议开题</a-select-option>
                    <a-select-option value="written">书面开题</a-select-option>
                    <a-select-option value="online">线上开题</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
            </a-row>

            <a-form-item
              label="开题说明"
              name="description"
              :rules="[{ required: true, message: '请填写开题说明' }]"
            >
              <a-textarea
                v-model:value="formData.description"
                placeholder="请详细说明项目研究背景、研究内容、技术路线及预期目标"
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

        <!-- 材料上传 -->
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
              :message="isImprovement ? '开题会议整改要求' : '材料审核意见'"
              :type="isImprovement ? 'warning' : 'error'"
              show-icon
            >
              <template #description>
                <div class="comments-text">{{ reviewComments }}</div>
              </template>
            </a-alert>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h3>
              <CloudUploadOutlined />
              开题材料
            </h3>
            <p>
              {{ isImprovement ? '根据修改要求上传相关材料' : 
                 isResubmit ? '重新上传项目开题所需的相关材料' : 
                 '上传项目开题所需的相关材料' }}
            </p>
            <div v-if="isResubmit || isImprovement" class="resubmit-notice">
        <a-alert 
                :message="isImprovement ? '开题材料修改' : '重新提交提醒'"
                :description="isImprovement ? 
                  '请根据开题会议的修改要求，上传相应的修改材料和说明文档。' : 
                  '由于材料审核未通过，请根据审核意见重新准备并上传所有必需材料。'"
                type="warning"
          show-icon
                style="margin-bottom: 24px"
              />
            </div>
          </div>

          <!-- 必需材料 -->
          <div class="materials-section">
            <div class="materials-header">
              <h4>
                <ExclamationCircleOutlined />
                必需材料
              </h4>
              <p>以下材料为开题必须提交的材料</p>
            </div>

            <div class="materials-list">
              <div
                v-for="(material, index) in requiredMaterials"
                :key="material.id"
                class="material-item required"
              >
                <div class="material-info">
                  <div class="material-header">
                    <span class="material-name">{{ material.name }}</span>
                    <a-tag color="red" size="small">必需</a-tag>
                  </div>
                  <div class="material-description">{{ material.description }}</div>
                  <div class="material-format">{{ material.format }}</div>
                </div>

                <div class="material-upload">
            <a-upload
                    v-model:file-list="material.files"
                    :before-upload="(file) => beforeUpload(file, material)"
                    :on-remove="(file) => onRemove(file, material)"
                    :multiple="material.multiple"
                    :accept="material.accept"
                    :show-upload-list="true"
                    list-type="text"
                  >
                    <a-button>
                      <UploadOutlined />
                      上传文件
                    </a-button>
            </a-upload>

                  <!-- 已上传文件列表 -->
                  <div v-if="material.files && material.files.length > 0" class="uploaded-files">
                    <div
                      v-for="file in material.files"
                      :key="file.uid"
                      class="uploaded-file"
                    >
                      <div class="file-info">
                        <FileOutlined />
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      </div>
                      <div class="file-actions">
                        <a-button type="link" size="small" @click="handlePreviewFile(file)">
                          预览
                        </a-button>
                        <a-button type="link" size="small" @click="downloadFile(file)">
                          下载
                        </a-button>
                        <a-button
                          type="link"
                          size="small"
                          danger
                          @click="removeFile(file, material)"
                        >
                          删除
                        </a-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 可选材料 -->
          <div class="materials-section">
            <div class="materials-header">
              <h4>
                <InfoCircleOutlined />
                可选材料
              </h4>
              <p>以下材料为开题可选提交的材料，有助于更好地展示项目情况</p>
            </div>

            <div class="materials-list">
              <div
                v-for="(material, index) in optionalMaterials"
                :key="material.id"
                class="material-item optional"
              >
                <div class="material-info">
                  <div class="material-header">
                    <span class="material-name">{{ material.name }}</span>
                    <a-tag color="blue" size="small">可选</a-tag>
                  </div>
                  <div class="material-description">{{ material.description }}</div>
                  <div class="material-format">{{ material.format }}</div>
                </div>

                <div class="material-upload">
                  <a-upload
                    v-model:file-list="material.files"
                    :before-upload="(file) => beforeUpload(file, material)"
                    :on-remove="(file) => onRemove(file, material)"
                    :multiple="material.multiple"
                    :accept="material.accept"
                    :show-upload-list="true"
                    list-type="text"
                  >
                    <a-button>
                      <UploadOutlined />
                      上传文件
            </a-button>
      </a-upload>

                  <!-- 已上传文件列表 -->
                  <div v-if="material.files && material.files.length > 0" class="uploaded-files">
                    <div
                      v-for="file in material.files"
                      :key="file.uid"
                      class="uploaded-file"
                    >
                      <div class="file-info">
                        <FileOutlined />
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      </div>
                      <div class="file-actions">
                        <a-button type="link" size="small" @click="handlePreviewFile(file)">
                          预览
                        </a-button>
                        <a-button type="link" size="small" @click="downloadFile(file)">
                          下载
                        </a-button>
                        <a-button
                          type="link"
                          size="small"
                          danger
                          @click="removeFile(file, material)"
                        >
                          删除
                        </a-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 提交确认 -->
        <div class="form-section">
          <div class="section-header">
            <h3>
              <CheckCircleOutlined />
              提交确认
            </h3>
            <p>请确认所有信息无误后提交开题申请</p>
          </div>
          <div class="section-content">
            <div class="submit-checklist">
              <a-checkbox-group v-model:value="checkedItems" @change="handleCheckChange">
                <div class="checklist-item">
                  <a-checkbox value="materials">
                    我确认已上传所有必需的开题材料
                  </a-checkbox>
                </div>
                <div class="checklist-item">
                  <a-checkbox value="accuracy">
                    我确认所填写的信息真实准确
                  </a-checkbox>
                </div>
                <div class="checklist-item">
                  <a-checkbox value="responsibility">
                    我承诺对提交的材料承担相应责任
                  </a-checkbox>
                </div>
              </a-checkbox-group>
            </div>

            <div class="submit-actions">
              <a-space size="large">
                <a-button size="large" @click="saveDraft">
                  <SaveOutlined />
                  保存草稿
                </a-button>
                <a-button
                  type="primary"
                  size="large"
                  html-type="submit"
                  :loading="submitting"
                  :disabled="!canSubmit"
                >
                  <SendOutlined />
                  {{ submitButtonText }}
                </a-button>
              </a-space>
            </div>
          </div>
        </div>
      </a-form>
    </div>

    <!-- 文件预览弹窗 -->
    <FilePreview
      v-if="previewVisible"
      :visible="previewVisible"
      :file="previewFile"
      @close="closePreview"
    />
  </div>
</template>

<script setup>
/**
 * 项目开题申请提交页面
 * 功能：开题申请表单填写、开题材料上传、申请提交
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  ArrowLeftOutlined,
  ProjectOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  FileOutlined,
  SaveOutlined,
  SendOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import FilePreview from '@/components/FilePreview.vue'

const router = useRouter()

// 页面配置
const pageTitle = ref('提交开题申请')
const pageDescription = ref('申请新的项目开题，上传开题材料并提交审核')

// 表单引用
const formRef = ref()

// 页面状态
const submitting = ref(false)
const checkedItems = ref([])
const previewVisible = ref(false)
const previewFile = ref(null)

// 评审意见
const reviewComments = ref('')

// URL参数判断
const urlParams = new URLSearchParams(window.location.search)
const isResubmit = urlParams.get('type') === 'resubmit'
const isImprovement = urlParams.get('type') === 'improvement'

// 表单数据
const formData = ref({
  projectId: undefined,
  expectedDate: undefined,
  openingType: undefined,
  description: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  projectId: [{ required: true, message: '请选择项目' }],
  expectedDate: [{ required: true, message: '请选择计划开题时间' }],
  openingType: [{ required: true, message: '请选择开题形式' }],
  description: [{ required: true, message: '请填写开题说明' }]
}

// 可选择的项目列表
const availableProjects = ref([
  {
    id: 1,
    name: '智慧城市大数据平台建设项目',
    code: 'PROJ-2024-001',
    status: '已立项',
    approvalDate: '2024-01-10',
    plannedStartDate: '2024-02-01',
    leader: '张三',
    budget: 500
  },
  {
    id: 2,
    name: '区块链供应链金融平台',
    code: 'PROJ-2024-002',
    status: '已立项',
    approvalDate: '2024-01-15',
    plannedStartDate: '2024-02-15',
    leader: '李四',
    budget: 300
  }
])

// 必需材料配置
const requiredMaterials = ref([
  {
    id: 'opening_report',
    name: '开题报告',
    description: '详细的项目开题报告，包括研究背景、研究内容、技术路线等',
    format: '支持PDF、Word格式，文件大小不超过20MB',
    accept: '.pdf,.doc,.docx',
    multiple: false,
    files: []
  },
  {
    id: 'research_plan',
    name: '研究方案',
    description: '项目的具体研究方案和实施计划',
    format: '支持PDF、Word格式，文件大小不超过20MB',
    accept: '.pdf,.doc,.docx',
    multiple: false,
    files: []
  },
  {
    id: 'literature_review',
    name: '文献综述',
    description: '相关领域的文献调研和综述报告',
    format: '支持PDF、Word格式，文件大小不超过20MB',
    accept: '.pdf,.doc,.docx',
    multiple: false,
    files: []
  },
  {
    id: 'technical_route',
    name: '技术路线图',
    description: '项目的技术实现路线和关键技术点',
    format: '支持PDF、Word、PPT格式，文件大小不超过20MB',
    accept: '.pdf,.doc,.docx,.ppt,.pptx',
    multiple: false,
    files: []
  }
])

// 可选材料配置
const optionalMaterials = ref([
  {
    id: 'preliminary_research',
    name: '前期调研报告',
    description: '项目启动前的市场调研和技术调研报告',
    format: '支持PDF、Word格式，文件大小不超过20MB',
    accept: '.pdf,.doc,.docx',
    multiple: true,
    files: []
  },
  {
    id: 'team_introduction',
    name: '团队介绍',
    description: '项目团队成员介绍和分工说明',
    format: '支持PDF、Word格式，文件大小不超过10MB',
    accept: '.pdf,.doc,.docx',
    multiple: false,
    files: []
  },
  {
    id: 'expected_results',
    name: '预期成果',
    description: '项目预期达到的成果和效益分析',
    format: '支持PDF、Word、Excel格式，文件大小不超过20MB',
    accept: '.pdf,.doc,.docx,.xls,.xlsx',
    multiple: true,
    files: []
  }
])

// 计算属性
const selectedProject = computed(() => {
  return availableProjects.value.find(p => p.id === formData.value.projectId)
})

const canSubmit = computed(() => {
  const requiredChecks = ['materials', 'accuracy', 'responsibility']
  return requiredChecks.every(item => checkedItems.value.includes(item))
})

const submitButtonText = computed(() => {
  if (isImprovement) return '提交修改材料'
  if (isResubmit) return '重新提交申请'
  return '提交开题申请'
})

// 事件处理方法
const goBack = () => {
  router.go(-1)
}

const filterOption = (input, option) => {
  const project = availableProjects.value.find(p => p.id === option.value)
  return project?.name.toLowerCase().includes(input.toLowerCase()) ||
         project?.code.toLowerCase().includes(input.toLowerCase())
}

const handleProjectChange = (projectId) => {
  console.log('选择的项目ID:', projectId)
}

const getProjectStatusColor = (status) => {
  const colorMap = {
    '已立项': 'green',
    '待立项': 'orange',
    '已开题': 'blue',
    '进行中': 'processing',
    '已完成': 'success'
  }
  return colorMap[status] || 'default'
}

const disabledDate = (current) => {
  // 不能选择过去的日期
  return current && current < dayjs().startOf('day')
}

const beforeUpload = (file, material) => {
  // 文件大小检查
  const maxSize = 20 * 1024 * 1024 // 20MB
  if (file.size > maxSize) {
    message.error('文件大小不能超过20MB')
  return false
}

  // 添加到对应材料的文件列表
  material.files.push({
    uid: Date.now() + Math.random(),
    name: file.name,
    size: file.size,
    type: file.type,
    originFileObj: file
  })

  return false // 阻止自动上传
}

const onRemove = (file, material) => {
  const index = material.files.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    material.files.splice(index, 1)
  }
}

const removeFile = (file, material) => {
  onRemove(file, material)
}

const handlePreviewFile = (file) => {
  previewFile.value = file
  previewVisible.value = true
}

const downloadFile = (file) => {
  const url = URL.createObjectURL(file.originFileObj)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const closePreview = () => {
  previewVisible.value = false
  previewFile.value = null
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleCheckChange = (checkedValues) => {
  console.log('选中的确认项:', checkedValues)
}

const saveDraft = () => {
  message.success('草稿保存成功')
}

const handleSubmit = async (values) => {
  // 检查必需材料是否都已上传
  const missingMaterials = requiredMaterials.value.filter(m => !m.files || m.files.length === 0)
  if (missingMaterials.length > 0) {
    message.error(`请上传必需材料：${missingMaterials.map(m => m.name).join('、')}`)
    return
  }

  submitting.value = true

  try {
    // 模拟提交API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    message.success('开题申请提交成功！')
    
    // 跳转到进度查询页面
    router.push('/implementation/opening/progress')
  } catch (error) {
    message.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 生命周期
onMounted(() => {
  // 初始化页面数据
  if (isResubmit) {
    pageTitle.value = '重新提交开题申请'
    pageDescription.value = '根据审核意见重新提交开题申请材料'
    
    // 从URL参数获取审核意见
    const rejectionReason = urlParams.get('rejectionReason')
    if (rejectionReason) {
      reviewComments.value = decodeURIComponent(rejectionReason)
    }
  } else if (isImprovement) {
    pageTitle.value = '修改开题材料'
    pageDescription.value = '根据开题会议要求修改相关材料'
    
    // 从URL参数获取整改要求
    const improvementRequirements = urlParams.get('improvementRequirements')
    if (improvementRequirements) {
      reviewComments.value = decodeURIComponent(improvementRequirements)
    }
  }
})
</script>

<style scoped>
.opening-application-submit {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 12px;
  padding: 8px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border-radius: 8px;
  color: white;
  font-size: 16px;
}

.page-description {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* 表单容器样式 */
.form-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.form-section {
  padding: 32px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
}

.section-header h3 .anticon {
  margin-right: 8px;
  color: #1890ff;
}

.section-header p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* 项目选择样式 */
.project-option {
  padding: 4px 0;
}

.project-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.project-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.selected-project-info {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

/* 材料上传样式 */
.materials-section {
  margin-bottom: 32px;
}

.materials-section:last-child {
  margin-bottom: 0;
}

.materials-header {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.materials-header h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
}

.materials-header h4 .anticon {
  margin-right: 8px;
  color: #1890ff;
}

.materials-header p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.material-item {
  padding: 20px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.material-item.required {
  border-color: #ffccc7;
  background: #fff2f0;
}

.material-item.optional {
  border-color: #d6f3ff;
  background: #f6ffff;
}

.material-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.material-info {
  margin-bottom: 16px;
}

.material-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.material-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.material-description {
  color: #595959;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.material-format {
  color: #8c8c8c;
  font-size: 12px;
}

.uploaded-files {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploaded-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-name {
  color: #262626;
  font-weight: 500;
}

.file-size {
  color: #8c8c8c;
  font-size: 12px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

/* 提交确认样式 */
.submit-checklist {
  margin-bottom: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.checklist-item {
  margin-bottom: 12px;
}

.checklist-item:last-child {
  margin-bottom: 0;
}

.submit-actions {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
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

.resubmit-notice {
  margin-bottom: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .opening-application-submit {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .form-section {
    padding: 24px 16px;
  }
  
  .material-item {
    padding: 16px;
  }
  
  .uploaded-file {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .file-actions {
    justify-content: flex-end;
  }
}