<!--
 * @file 提交验收申请页面 - 申报单位角色
 * @description 申报单位提交新的项目验收申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="acceptance-application-submit">
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
            <p>选择需要申请验收的项目</p>
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
                <a-descriptions-item label="开始时间">
                  {{ selectedProject.startDate }}
                </a-descriptions-item>
                <a-descriptions-item label="计划结束时间">
                  {{ selectedProject.endDate }}
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
              申请信息
            </h3>
            <p>填写验收申请的基本信息</p>
          </div>
          <div class="section-content">
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="预期验收时间"
                  name="expectedDate"
                  :rules="[{ required: true, message: '请选择预期验收时间' }]"
                >
                  <a-date-picker
                    v-model:value="formData.expectedDate"
                    placeholder="请选择预期验收时间"
                    size="large"
                    style="width: 100%"
                    :disabled-date="disabledDate"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item
                  label="验收类型"
                  name="acceptanceType"
                  :rules="[{ required: true, message: '请选择验收类型' }]"
                >
                  <a-select
                    v-model:value="formData.acceptanceType"
                    placeholder="请选择验收类型"
                    size="large"
                  >
                    <a-select-option value="final">结题验收</a-select-option>
                    <a-select-option value="phase">阶段验收</a-select-option>
                    <a-select-option value="special">专项验收</a-select-option>
                  </a-select>
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
                placeholder="请详细说明项目完成情况、主要成果及验收准备情况"
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
        <div class="form-section">
          <div class="section-header">
            <h3>
              <CloudUploadOutlined />
              验收材料
            </h3>
            <p>
              {{ isImprovement ? '根据整改要求上传相关材料' : 
                 isResubmit ? '重新上传项目验收所需的相关材料' : 
                 '上传项目验收所需的相关材料' }}
            </p>
            <div v-if="isResubmit || isImprovement" class="resubmit-notice">
              <a-alert
                :message="isImprovement ? '整改材料提交' : '重新提交提醒'"
                :description="isImprovement ? 
                  '请根据验收会议的整改要求，上传相应的整改材料和说明文档。' : 
                  '由于材料审核未通过，请根据审核意见重新准备并上传所有必需材料。'"
                type="warning"
                show-icon
                style="margin-top: 12px"
              />
              
              <!-- 显示审核意见或整改要求 -->
              <div v-if="reviewComments" class="review-comments-section">
                <h4>
                  <ExclamationCircleOutlined style="color: #ff4d4f; margin-right: 8px" />
                  {{ isImprovement ? '整改要求' : '审核驳回意见' }}
                </h4>
                <div class="review-comments-content">
                  <pre>{{ reviewComments }}</pre>
                </div>
              </div>
            </div>
          </div>
          <div class="section-content">
            <!-- 必需材料 -->
            <div class="material-group">
              <h4>必需材料</h4>
              <div class="material-list">
                <div
                  v-for="material in requiredMaterials"
                  :key="material.key"
                  class="material-item"
                >
                  <div class="material-info">
                    <div class="material-name">
                      {{ material.name }}
                      <span class="required-mark">*</span>
                    </div>
                    <div class="material-desc">{{ material.description }}</div>
                  </div>
                  <div class="material-upload">
                    <a-upload
                      :file-list="material.fileList"
                      :before-upload="() => false"
                      @change="(info) => handleMaterialUpload(info, material.key)"
                      accept=".pdf,.doc,.docx,.zip,.rar"
                      :show-upload-list="false"
                    >
                      <a-button>
                        <UploadOutlined />
                        选择文件
                      </a-button>
                    </a-upload>
                    
                    <!-- 自定义文件列表 -->
                    <div v-if="material.fileList.length > 0" class="file-list">
                      <div v-for="file in material.fileList" :key="file.uid" class="file-item">
                        <div class="file-info">
                          <FileTextOutlined class="file-icon" />
                          <span class="file-name">{{ file.name }}</span>
                          <span class="file-size">{{ formatFileSize(file.size) }}</span>
                        </div>
                        <div class="file-actions">
                          <a-button type="link" size="small" @click="previewMaterial(file)">
                            预览
                          </a-button>
                          <a-button type="link" size="small" @click="downloadMaterial(file)">
                            下载
                          </a-button>
                          <a-button type="link" size="small" danger @click="removeMaterial(material, file)">
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
            <div class="material-group">
              <h4>可选材料</h4>
              <div class="material-list">
                <div
                  v-for="material in optionalMaterials"
                  :key="material.key"
                  class="material-item"
                >
                  <div class="material-info">
                    <div class="material-name">{{ material.name }}</div>
                    <div class="material-desc">{{ material.description }}</div>
                  </div>
                  <div class="material-upload">
                    <a-upload
                      :file-list="material.fileList"
                      :before-upload="() => false"
                      @change="(info) => handleMaterialUpload(info, material.key)"
                      accept=".pdf,.doc,.docx,.zip,.rar"
                      :show-upload-list="false"
                    >
                      <a-button>
                        <UploadOutlined />
                        选择文件
                      </a-button>
                    </a-upload>
                    
                    <!-- 自定义文件列表 -->
                    <div v-if="material.fileList.length > 0" class="file-list">
                      <div v-for="file in material.fileList" :key="file.uid" class="file-item">
                        <div class="file-info">
                          <FileTextOutlined class="file-icon" />
                          <span class="file-name">{{ file.name }}</span>
                          <span class="file-size">{{ formatFileSize(file.size) }}</span>
                        </div>
                        <div class="file-actions">
                          <a-button type="link" size="small" @click="previewMaterial(file)">
                            预览
                          </a-button>
                          <a-button type="link" size="small" @click="downloadMaterial(file)">
                            下载
                          </a-button>
                          <a-button type="link" size="small" danger @click="removeMaterial(material, file)">
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
        </div>

        <!-- 提交操作 -->
        <div class="form-actions">
          <a-space size="large">
            <a-button size="large" @click="handleSaveDraft">
              <SaveOutlined />
              保存草稿
            </a-button>
            <a-button type="primary" size="large" html-type="submit" :loading="submitting">
              <SendOutlined />
              提交申请
            </a-button>
          </a-space>
        </div>
      </a-form>
    </div>

    <!-- 文件预览弹窗 -->
    <FilePreview
      v-model:visible="previewVisible"
      :file-info="currentPreviewFile"
      @download="handleDownloadFile"
    />
  </div>
</template>

<script setup>
/**
 * 提交验收申请页面 - 申报单位角色
 * 功能：项目选择、申请信息填写、材料上传、申请提交
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
  UploadOutlined,
  SaveOutlined,
  SendOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import FilePreview from '@/components/FilePreview.vue'

const router = useRouter()
const formRef = ref()

// 判断是否是重新提交模式
const isResubmit = computed(() => {
  return router.currentRoute.value.query.resubmit === 'true'
})

// 判断是否是整改材料提交模式
const isImprovement = computed(() => {
  return router.currentRoute.value.query.improvement === 'true'
})

// 页面标题
const pageTitle = computed(() => {
  if (isImprovement.value) {
    return '提交整改材料'
  } else if (isResubmit.value) {
    return '重新提交验收申请'
  } else {
    return '提交验收申请'
  }
})

// 页面描述
const pageDescription = computed(() => {
  if (isImprovement.value) {
    return '根据验收会议的整改要求，提交相应的整改材料和说明'
  } else if (isResubmit.value) {
    return '根据审核意见修改完善后重新提交验收申请'
  } else {
    return '填写项目验收申请信息并上传相关材料'
  }
})

// 表单数据
const formData = ref({
  projectId: undefined,
  expectedDate: undefined,
  acceptanceType: undefined,
  description: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  projectId: [{ required: true, message: '请选择项目' }],
  expectedDate: [{ required: true, message: '请选择预期验收时间' }],
  acceptanceType: [{ required: true, message: '请选择验收类型' }],
  description: [{ required: true, message: '请填写申请说明' }]
}

// 可选择的项目列表
const availableProjects = ref([
  {
    id: 1,
    name: '智慧城市大数据平台建设项目',
    code: 'PROJ-2024-001',
    status: '实施中',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    leader: '张三',
    budget: 500
  },
  {
    id: 2,
    name: '区块链供应链金融平台',
    code: 'PROJ-2024-002',
    status: '实施中',
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    leader: '李四',
    budget: 300
  },
  {
    id: 3,
    name: 'AI智能客服系统',
    code: 'PROJ-2024-003',
    status: '即将结束',
    startDate: '2023-09-01',
    endDate: '2024-03-31',
    leader: '王五',
    budget: 200
  }
])

// 选中的项目
const selectedProject = computed(() => {
  return availableProjects.value.find(p => p.id === formData.value.projectId)
})

// 必需材料配置
const requiredMaterials = ref([
  {
    key: 'acceptance_report',
    name: '项目验收报告',
    description: '详细的项目验收报告，包含项目完成情况、技术指标等',
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
    description: '其他与项目验收相关的补充材料',
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

// 项目状态颜色
const getProjectStatusColor = (status) => {
  const colorMap = {
    '实施中': 'blue',
    '即将结束': 'orange',
    '已完成': 'green',
    '暂停': 'red'
  }
  return colorMap[status] || 'default'
}

// 项目选择过滤
const filterOption = (input, option) => {
  const project = availableProjects.value.find(p => p.id === option.value)
  return project && (
    project.name.toLowerCase().includes(input.toLowerCase()) ||
    project.code.toLowerCase().includes(input.toLowerCase())
  )
}

// 日期禁用规则
const disabledDate = (current) => {
  // 不能选择今天之前的日期
  return current && current < dayjs().startOf('day')
}

// 事件处理方法
const goBack = () => {
  router.go(-1)
}

const handleProjectChange = (projectId) => {
  // 项目变更时的处理逻辑
  console.log('Selected project:', projectId)
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
    
    message.success('验收申请提交成功')
    router.push('/acceptance/application/manage')
    
  } catch (error) {
    message.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 生命周期
onMounted(() => {
  const route = router.currentRoute.value
  
  // 检查是否是重新提交
  if (route.query.resubmit === 'true') {
    // 自动填充项目信息
    if (route.query.projectId) {
      // 根据项目ID查找对应的项目
      const projectId = parseInt(route.query.projectId)
      const project = availableProjects.value.find(p => p.id === projectId)
      if (project) {
        formData.value.projectId = projectId
      }
    }
    
    // 自动填充预期验收时间
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
    
    // 设置默认验收类型
    formData.value.acceptanceType = 'final'
    
    // 显示重新提交提示
    message.info('已自动填充项目信息，请重新上传验收材料并完善申请信息')
  }
  
  // 检查是否是提交整改材料
  if (route.query.improvement === 'true') {
    // 自动填充项目信息
    if (route.query.projectId) {
      const projectId = parseInt(route.query.projectId)
      const project = availableProjects.value.find(p => p.id === projectId)
      if (project) {
        formData.value.projectId = projectId
      }
    }
    
    // 自动填充预期验收时间
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
    
    // 设置默认验收类型
    formData.value.acceptanceType = 'final'
    
    // 显示整改材料提交提示
    message.info('已自动填充项目信息，请根据整改要求上传相关材料')
  }
})
</script>

<style scoped>
.acceptance-application-submit {
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
  gap: 12px;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
  border-radius: 12px;
  color: #fff;
  font-size: 18px;
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

/* 表单分组样式 */
.form-section {
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
}

.section-header {
  padding: 24px 24px 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header p {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
}

.section-content {
  padding: 24px;
}

/* 项目选择样式 */
.project-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
  color: #262626;
}

.project-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.project-code {
  color: #8c8c8c;
}

.project-status {
  color: #fa8c16;
}

.selected-project-info {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9ff;
  border: 1px solid #e6f7ff;
  border-radius: 8px;
}

/* 材料上传样式 */
.material-group {
  margin-bottom: 32px;
}

.material-group:last-child {
  margin-bottom: 0;
}

.material-group h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
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
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.material-item:hover {
  background: #f8f9ff;
  border-color: #d6e4ff;
}

.material-info {
  flex: 1;
  margin-right: 16px;
}

.material-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.required-mark {
  color: #ff4d4f;
  margin-left: 4px;
}

.material-desc {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
}

.material-upload {
  flex-shrink: 0;
}

/* 文件列表样式 */
.file-list {
  margin-top: 12px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-item:hover {
  border-color: #40a9ff;
  background: #f0f9ff;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-icon {
  color: #1890ff;
  font-size: 14px;
}

.file-name {
  color: #262626;
  font-size: 14px;
  font-weight: 500;
}

.file-size {
  color: #8c8c8c;
  font-size: 12px;
  margin-left: 8px;
}

.file-actions {
  display: flex;
  gap: 4px;
}

/* 审核意见样式 */
.review-comments-section {
  margin-top: 16px;
  padding: 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
}

.review-comments-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ff4d4f;
  display: flex;
  align-items: center;
}

.review-comments-content {
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.review-comments-content pre {
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: #262626;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 表单操作样式 */
.form-actions {
  padding: 24px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .acceptance-application-submit {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .material-item {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .material-info {
    margin-right: 0;
  }
  
  .form-actions {
    padding: 16px;
  }
  
  .form-actions .ant-space {
    width: 100%;
    justify-content: center;
  }
}
</style> 