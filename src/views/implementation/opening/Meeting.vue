<!--
 * @file 开题会议管理页面 - 管理角色
 * @description 管理角色组织开题会议和录入开题结论
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-23
-->
<template>
  <div class="opening-meeting-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <ScheduleOutlined />
          </span>
          开题会议管理
        </h1>
        <p class="page-description">
          组织开题会议，录入会议结论，管理开题流程
        </p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="scheduleBatchMeeting">
          <CalendarOutlined />
          批量安排会议
        </a-button>
      </div>
    </div>

    <!-- 会议统计 -->
    <div class="meeting-stats">
      <a-row :gutter="24">
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card pending">
            <div class="stat-icon">
              <ClockCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.pendingSchedule }}</div>
              <div class="stat-label">待安排会议</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card scheduled">
            <div class="stat-icon">
              <CalendarOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.scheduled }}</div>
              <div class="stat-label">已安排会议</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card completed">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.completed }}</div>
              <div class="stat-label">已完成开题</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card conclusion">
            <div class="stat-icon">
              <FileTextOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.pendingConclusion }}</div>
              <div class="stat-label">待录入结论</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <a-form layout="inline" :model="filters" @finish="handleFilter">
        <a-form-item label="会议状态">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="pending_schedule">待安排</a-select-option>
            <a-select-option value="scheduled">已安排</a-select-option>
            <a-select-option value="in_progress">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="会议时间">
          <a-range-picker
            v-model:value="filters.meetingDateRange"
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item label="项目名称">
          <a-input
            v-model:value="filters.keyword"
            placeholder="搜索项目名称"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <SearchOutlined />
              查询
            </a-button>
            <a-button @click="resetFilters">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 会议管理标签页 -->
    <div class="meeting-tabs">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="schedule" tab="会议安排">
          <!-- 待安排会议列表 -->
          <div class="meeting-list">
            <div
              v-for="item in pendingScheduleList"
              :key="item.id"
              class="meeting-item"
            >
              <div class="item-header">
                <div class="project-info">
                  <h4 class="project-name">{{ item.projectName }}</h4>
                  <div class="project-meta">
                    <span class="project-code">{{ item.projectCode }}</span>
                    <span class="material-status">材料审核：{{ getMaterialStatusText(item.materialStatus) }}</span>
                    <span class="submit-time">申请时间：{{ item.submitTime }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <a-tag color="orange" size="large">待安排会议</a-tag>
                </div>
              </div>

              <div class="item-content">
                <div class="project-details">
                  <a-descriptions :column="3" size="small">
                    <a-descriptions-item label="项目负责人">
                      {{ item.projectLeader }}
                    </a-descriptions-item>
                    <a-descriptions-item label="项目周期">
                      {{ item.projectDuration }}
                    </a-descriptions-item>
                    <a-descriptions-item label="项目预算">
                      {{ item.projectBudget }}万元
                    </a-descriptions-item>
                  </a-descriptions>
                </div>

                <div class="material-summary">
                  <div class="summary-title">材料审核情况</div>
                  <div class="summary-content">
                    <span class="summary-item">
                      必需材料：{{ item.requiredMaterials }}/{{ item.totalRequired }} 已通过
                    </span>
                    <span class="summary-item">
                      可选材料：{{ item.optionalMaterials }} 已提交
                    </span>
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <a-space>
                  <a-button type="primary" @click="scheduleMeeting(item)">
                    <CalendarOutlined />
                    安排会议
                  </a-button>
                  <a-button @click="viewProjectDetail(item)">
                    <FileTextOutlined />
                    查看详情
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="scheduled" tab="已安排会议">
          <!-- 已安排会议列表 -->
          <div class="meeting-list">
            <div
              v-for="item in scheduledMeetingList"
              :key="item.id"
              class="meeting-item"
            >
              <div class="item-header">
                <div class="project-info">
                  <h4 class="project-name">{{ item.projectName }}</h4>
                  <div class="project-meta">
                    <span class="project-code">{{ item.projectCode }}</span>
                    <span class="meeting-time">会议时间：{{ item.meetingTime }}</span>
                    <span class="meeting-location">地点：{{ item.meetingLocation }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <a-tag :color="getMeetingStatusColor(item.meetingStatus)" size="large">
                    {{ getMeetingStatusText(item.meetingStatus) }}
                  </a-tag>
                </div>
              </div>

              <div class="item-content">
                <div class="meeting-details">
                  <a-descriptions :column="2" size="small">
                    <a-descriptions-item label="会议形式">
                      {{ item.meetingFormat }}
                    </a-descriptions-item>
                    <a-descriptions-item label="主持人">
                      {{ item.chairperson }}
                    </a-descriptions-item>
                    <a-descriptions-item label="专家组">
                      {{ item.experts.join('、') }}
                    </a-descriptions-item>
                    <a-descriptions-item label="参会人数">
                      {{ item.attendeeCount }}人
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </div>

              <div class="item-actions">
                <a-space>
                  <a-button 
                    v-if="item.meetingStatus === 'scheduled'"
                    type="primary" 
                    @click="inputConclusion(item)"
                  >
                    <EditOutlined />
                    录入结论
                  </a-button>
                  <a-button 
                    v-if="item.meetingStatus === 'scheduled'"
                    @click="editMeeting(item)"
                  >
                    <EditOutlined />
                    编辑会议
                  </a-button>
                  <a-button @click="viewProjectDetail(item)">
                    <FileTextOutlined />
                    查看详情
                  </a-button>
                  <a-button 
                    v-if="item.meetingStatus === 'scheduled'"
                    @click="sendNotification(item)"
                  >
                    <MessageOutlined />
                    一键通知
                  </a-button>
                  <a-button 
                    v-if="item.meetingStatus === 'scheduled'"
                    danger
                    @click="deleteMeeting(item)"
                  >
                    <DeleteOutlined />
                    删除会议
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="conclusion" tab="结论管理">
          <!-- 结论管理列表 -->
          <div class="conclusion-list">
            <div
              v-for="item in conclusionList"
              :key="item.id"
              class="conclusion-item"
            >
              <div class="item-header">
                <div class="project-info">
                  <h4 class="project-name">{{ item.projectName }}</h4>
                  <div class="project-meta">
                    <span class="project-code">{{ item.projectCode }}</span>
                    <span class="conclusion-time">结论时间：{{ item.conclusionTime }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <a-tag :color="getConclusionStatusColor(item.conclusionResult)" size="large">
                    {{ getConclusionStatusText(item.conclusionResult) }}
                  </a-tag>
                </div>
              </div>

              <div class="item-content">
                <div class="conclusion-content">
                  <div class="conclusion-summary">
                    <h5>开题结论概要</h5>
                    <p>{{ item.conclusionSummary }}</p>
                  </div>
                  
                  <div class="conclusion-files" v-if="item.conclusionFiles && item.conclusionFiles.length > 0">
                    <h5>结论相关文件</h5>
                    <div class="file-list">
                      <div v-for="file in item.conclusionFiles" :key="file.id" class="file-item">
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ file.size }}</span>
                        <a-space>
                          <a-button type="link" size="small" @click="previewFile(file)">
                            预览
                          </a-button>
                          <a-button type="link" size="small" @click="downloadFile(file)">
                            下载
                          </a-button>
                        </a-space>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <a-space>
                  <a-button @click="editConclusion(item)">
                    <EditOutlined />
                    编辑结论
                  </a-button>
                  <a-button @click="viewProjectDetail(item)">
                    <FileTextOutlined />
                    查看详情
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 安排会议弹窗 -->
    <a-modal
      v-model:open="scheduleModalVisible"
      title="安排开题会议"
      width="800px"
      @ok="handleScheduleSubmit"
      @cancel="handleScheduleCancel"
    >
      <a-form :model="scheduleForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="会议时间" required>
              <a-date-picker
                v-model:value="scheduleForm.meetingDate"
                style="width: 100%"
                show-time
                format="YYYY-MM-DD HH:mm"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="会议地点" required>
              <a-input v-model:value="scheduleForm.meetingLocation" placeholder="请输入会议地点" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="会议形式" required>
              <a-select v-model:value="scheduleForm.meetingFormat">
                <a-select-option value="offline">线下会议</a-select-option>
                <a-select-option value="online">线上会议</a-select-option>
                <a-select-option value="hybrid">线上线下结合</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="主持人" required>
              <a-select
                v-model:value="scheduleForm.chairperson"
                mode="tags"
                placeholder="选择或输入主持人"
                :options="chairpersonOptions"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="专家组" required>
          <a-select
            v-model:value="scheduleForm.experts"
            mode="tags"
            placeholder="选择或输入专家"
            :options="expertOptions"
          />
        </a-form-item>
        <a-form-item label="会议资料">
          <a-upload
            v-model:file-list="scheduleForm.meetingMaterials"
            :before-upload="beforeUpload"
            multiple
            :max-count="10"
          >
            <a-button>
              <UploadOutlined />
              上传会议资料
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item label="会议说明">
          <a-textarea
            v-model:value="scheduleForm.meetingNote"
            :rows="3"
            placeholder="请输入会议说明"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 录入结论弹窗 -->
    <a-modal
      v-model:open="conclusionModalVisible"
      title="录入开题结论"
      width="900px"
      @ok="handleConclusionSubmit"
      @cancel="handleConclusionCancel"
    >
      <div v-if="currentProject" class="conclusion-form">
        <div class="project-header">
          <h3>{{ currentProject.projectName }}</h3>
          <p>项目编号：{{ currentProject.projectCode }}</p>
        </div>
        
        <a-form :model="conclusionForm" layout="vertical">
          <a-form-item label="开题结论" required>
            <a-radio-group v-model:value="conclusionForm.result">
              <a-radio value="passed">开题通过</a-radio>
              <a-radio value="conditional">有条件通过</a-radio>
              <a-radio value="failed">开题未通过</a-radio>
            </a-radio-group>
          </a-form-item>
          
          <a-form-item label="结论详情" required>
            <a-textarea
              v-model:value="conclusionForm.summary"
              :rows="5"
              placeholder="请输入开题结论的详细说明..."
            />
          </a-form-item>
          
          <a-form-item label="改进建议">
            <a-textarea
              v-model:value="conclusionForm.suggestions"
              :rows="3"
              placeholder="请输入改进建议（可选）"
            />
          </a-form-item>
          
          <a-form-item label="结论相关文件">
            <a-upload
              v-model:file-list="conclusionForm.files"
              :before-upload="beforeUpload"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              :max-count="5"
            >
              <a-button>
                <UploadOutlined />
                上传结论文件
              </a-button>
            </a-upload>
            <div class="upload-tip">
              支持PDF、Word、Excel格式，单个文件不超过20MB
            </div>
      </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 开题会议管理页面
 * 功能：会议安排、进度跟踪、结论录入、通知发送
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ScheduleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  EditOutlined,
  MessageOutlined,
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 页面状态
const activeTab = ref('schedule')
const scheduleModalVisible = ref(false)
const conclusionModalVisible = ref(false)
const currentProject = ref(null)

// 统计数据
const stats = ref({
  pendingSchedule: 8,
  scheduled: 12,
  completed: 25,
  pendingConclusion: 3
})

// 筛选条件
const filters = ref({
  status: '',
  meetingDateRange: [],
  keyword: ''
})

// 安排会议表单
const scheduleForm = ref({
  meetingDate: null,
  meetingLocation: '',
  meetingFormat: 'offline',
  chairperson: [],
  experts: [],
  meetingMaterials: [],
  meetingNote: ''
})

// 录入结论表单
const conclusionForm = ref({
  result: 'passed',
  summary: '',
  suggestions: '',
  files: []
})

// 选项数据
const chairpersonOptions = ref([
  { value: '王教授', label: '王教授' },
  { value: '李主任', label: '李主任' },
  { value: '张院长', label: '张院长' }
])

const expertOptions = ref([
  { value: '陈专家', label: '陈专家' },
  { value: '刘专家', label: '刘专家' },
  { value: '赵专家', label: '赵专家' },
  { value: '孙专家', label: '孙专家' }
])

// 待安排会议列表
const pendingScheduleList = ref([
  {
    id: 1,
    projectName: '智慧城市大数据平台建设项目',
    projectCode: 'PROJ-2024-001',
    projectLeader: '张三',
    projectDuration: '36个月',
    projectBudget: 500,
    materialStatus: 'approved',
    submitTime: '2024-01-15',
    requiredMaterials: 5,
    totalRequired: 5,
    optionalMaterials: 3
  },
  {
    id: 2,
    projectName: '区块链供应链金融平台',
    projectCode: 'PROJ-2024-002',
    projectLeader: '李四',
    projectDuration: '24个月',
    projectBudget: 300,
    materialStatus: 'approved',
    submitTime: '2024-01-18',
    requiredMaterials: 4,
    totalRequired: 4,
    optionalMaterials: 2
  }
])

// 已安排会议列表
const scheduledMeetingList = ref([
  {
    id: 3,
    projectName: 'AI智能客服系统开发',
    projectCode: 'PROJ-2024-003',
    projectLeader: '王五',
    meetingTime: '2024-02-10 14:00',
    meetingLocation: '会议室A',
    meetingFormat: '线下会议',
    chairperson: '王教授',
    experts: ['陈专家', '刘专家'],
    attendeeCount: 8,
    meetingStatus: 'scheduled'
  }
])

// 结论管理列表
const conclusionList = ref([
  {
    id: 4,
    projectName: '物联网智能家居平台',
    projectCode: 'PROJ-2024-004',
    projectLeader: '赵六',
    conclusionTime: '2024-01-25',
    conclusionResult: 'passed',
    conclusionSummary: '项目开题报告内容完整，研究目标明确，技术路线可行，预期成果合理。同意开题。',
    conclusionFiles: [
      { id: 1, name: '开题会议纪要.pdf', size: '2.3MB' },
      { id: 2, name: '专家意见汇总.docx', size: '1.8MB' }
    ]
  }
])

// 计算属性
const allMeetingList = computed(() => {
  let list = []
  if (activeTab.value === 'schedule') {
    list = pendingScheduleList.value
  } else if (activeTab.value === 'scheduled') {
    list = scheduledMeetingList.value
  } else {
    list = conclusionList.value
  }
  
  return list.filter(item => {
    if (filters.value.keyword) {
      return item.projectName.includes(filters.value.keyword) ||
             item.projectCode.includes(filters.value.keyword)
    }
    return true
  })
})

// 状态相关方法
const getMaterialStatusText = (status) => {
  const textMap = {
    'approved': '已通过',
    'rejected': '未通过',
    'pending': '审核中'
  }
  return textMap[status] || '未知'
}

const getMeetingStatusColor = (status) => {
  const colorMap = {
    'scheduled': 'blue',
    'in_progress': 'orange',
    'completed': 'green',
    'cancelled': 'red'
  }
  return colorMap[status] || 'default'
}

const getMeetingStatusText = (status) => {
  const textMap = {
    'scheduled': '已安排',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status] || '未知'
}

const getConclusionStatusColor = (result) => {
  const colorMap = {
    'passed': 'green',
    'conditional': 'orange',
    'failed': 'red'
  }
  return colorMap[result] || 'default'
}

const getConclusionStatusText = (result) => {
  const textMap = {
    'passed': '开题通过',
    'conditional': '有条件通过',
    'failed': '开题未通过'
  }
  return textMap[result] || '未知'
}

// 事件处理方法
const handleTabChange = (key) => {
  activeTab.value = key
}

const handleFilter = () => {
  message.success('筛选完成')
}

const resetFilters = () => {
  filters.value = {
    status: '',
    meetingDateRange: [],
    keyword: ''
  }
  message.info('筛选条件已重置')
}

const scheduleBatchMeeting = () => {
  message.info('批量安排会议功能开发中')
}

const scheduleMeeting = (item) => {
  currentProject.value = item
  scheduleModalVisible.value = true
}

const inputConclusion = (item) => {
  currentProject.value = item
  conclusionModalVisible.value = true
}

const editMeeting = (item) => {
  message.info(`编辑会议：${item.projectName}`)
}

const deleteMeeting = (item) => {
  message.confirm({
    title: '确认删除',
    content: `确定要删除项目"${item.projectName}"的会议安排吗？`,
    onOk: () => {
      message.success('会议已删除')
    }
  })
}

const sendNotification = (item) => {
  message.info(`发送会议通知：${item.projectName}`)
}

const editConclusion = (item) => {
  currentProject.value = item
  conclusionForm.value = {
    result: item.conclusionResult,
    summary: item.conclusionSummary,
    suggestions: '',
    files: []
  }
  conclusionModalVisible.value = true
}

const viewProjectDetail = (item) => {
  message.info(`查看项目详情：${item.projectName}`)
}

const handleScheduleSubmit = () => {
  message.success('会议安排成功')
  scheduleModalVisible.value = false
  scheduleForm.value = {
    meetingDate: null,
    meetingLocation: '',
    meetingFormat: 'offline',
    chairperson: [],
    experts: [],
    meetingMaterials: [],
    meetingNote: ''
  }
}

const handleScheduleCancel = () => {
  scheduleModalVisible.value = false
}

const handleConclusionSubmit = () => {
  message.success('开题结论录入成功')
  conclusionModalVisible.value = false
  conclusionForm.value = {
    result: 'passed',
    summary: '',
    suggestions: '',
    files: []
  }
}

const handleConclusionCancel = () => {
  conclusionModalVisible.value = false
}

const beforeUpload = (file) => {
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    message.error('文件大小不能超过50MB!')
  }
  return false // 阻止自动上传
}

const previewFile = (file) => {
  message.info(`预览文件：${file.name}`)
}

const downloadFile = (file) => {
  message.info(`下载文件：${file.name}`)
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.opening-meeting-management {
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

/* 统计卡片样式 */
.meeting-stats {
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  margin-right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.pending .stat-icon {
  background: linear-gradient(135deg, #faad14, #d48806);
}

.scheduled .stat-icon {
  background: linear-gradient(135deg, #1890ff, #096dd9);
}

.completed .stat-icon {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.conclusion .stat-icon {
  background: linear-gradient(135deg, #722ed1, #531dab);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

/* 筛选区域样式 */
.filter-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 标签页样式 */
.meeting-tabs {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 会议列表样式 */
.meeting-list,
.conclusion-list {
  padding: 24px;
}

.meeting-item,
.conclusion-item {
  padding: 24px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.meeting-item:hover,
.conclusion-item:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.project-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #8c8c8c;
}

.item-content {
  margin-bottom: 16px;
}

.project-details,
.meeting-details {
  margin-bottom: 16px;
}

.material-summary {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.summary-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #262626;
}

.summary-content {
  display: flex;
  gap: 24px;
}

.summary-item {
  font-size: 14px;
  color: #666;
}

.item-actions {
  text-align: right;
}

/* 结论内容样式 */
.conclusion-content h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.conclusion-summary {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.conclusion-summary p {
  margin: 0;
  line-height: 1.6;
  color: #595959;
}

.conclusion-files {
  margin-bottom: 16px;
}

.file-list {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.file-item:last-child {
  border-bottom: none;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #262626;
}

.file-size {
  margin-right: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

/* 弹窗样式 */
.conclusion-form {
  max-height: 60vh;
  overflow-y: auto;
}

.project-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.project-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.project-header p {
  margin: 0;
  color: #8c8c8c;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #8c8c8c;
}
</style> 