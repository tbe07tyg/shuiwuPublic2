<!--
 * @file 会议结论管理页面 - 管理角色
 * @description 管理角色组织验收会议和录入验收结论
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="meeting-conclusion-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <ScheduleOutlined />
          </span>
          会议结论管理
        </h1>
        <p class="page-description">
          组织验收会议，录入会议结论，管理验收流程
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
              <div class="stat-label">已完成验收</div>
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
                  <a-button @click="viewMaterials(item)">
                    <FileTextOutlined />
                    查看材料
                  </a-button>
                  <a-button type="link" @click="viewProjectDetail(item)">
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
                    <span class="meeting-location">会议地点：{{ item.meetingLocation }}</span>
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
                      {{ getMeetingTypeText(item.meetingType) }}
                    </a-descriptions-item>
                    <a-descriptions-item label="主持人">
                      {{ item.meetingHost }}
                    </a-descriptions-item>
                    <a-descriptions-item label="参会专家">
                      {{ item.experts.join('、') }}
                    </a-descriptions-item>
                    <a-descriptions-item label="会议说明">
                      {{ item.meetingDescription }}
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </div>

              <div class="item-actions">
                <a-space>
                  <a-button
                    v-if="item.meetingStatus === 'scheduled'"
                    type="primary"
                    @click="startMeeting(item)"
                  >
                    <PlayCircleOutlined />
                    开始会议
                  </a-button>
                  <a-button
                    v-if="item.meetingStatus === 'in_progress'"
                    type="primary"
                    @click="inputConclusion(item)"
                  >
                    <EditOutlined />
                    录入结论
                  </a-button>
                  <a-button @click="editMeeting(item)">
                    <EditOutlined />
                    编辑会议
                  </a-button>
                  <a-button type="link" @click="viewMeetingDetail(item)">
                    查看详情
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
                    <span class="meeting-time">会议时间：{{ item.meetingTime }}</span>
                    <span class="conclusion-time">结论时间：{{ item.conclusionTime }}</span>
                  </div>
                </div>
                <div class="item-status">
                  <a-tag :color="getConclusionColor(item.conclusion)" size="large">
                    {{ getConclusionText(item.conclusion) }}
                  </a-tag>
                </div>
              </div>

              <div class="item-content">
                <div class="conclusion-details">
                  <div class="conclusion-section">
                    <div class="section-title">验收结论</div>
                    <div class="section-content">
                      <div class="conclusion-result">
                        <span class="result-label">结论：</span>
                        <span class="result-value">{{ getConclusionText(item.conclusion) }}</span>
                        <span class="result-score">评分：{{ item.score }}分</span>
                      </div>
                      <div class="conclusion-description">{{ item.conclusionDescription }}</div>
                    </div>
                  </div>

                  <div v-if="item.requirements" class="conclusion-section">
                    <div class="section-title">整改要求</div>
                    <div class="section-content">{{ item.requirements }}</div>
                  </div>

                  <div class="conclusion-section">
                    <div class="section-title">专家意见</div>
                    <div class="section-content">
                      <div v-for="opinion in item.expertOpinions" :key="opinion.id" class="expert-opinion">
                        <div class="opinion-header">
                          <span class="expert-name">{{ opinion.expert }}</span>
                          <span class="opinion-score">评分：{{ opinion.score }}分</span>
                        </div>
                        <div class="opinion-content">{{ opinion.content }}</div>
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
                  <a-button @click="exportConclusion(item)">
                    <ExportOutlined />
                    导出结论
                  </a-button>
                  <a-button type="link" @click="viewConclusionDetail(item)">
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
      title="安排验收会议"
      width="700px"
      @ok="handleScheduleSubmit"
      @cancel="handleScheduleCancel"
    >
      <div v-if="selectedProject" class="schedule-modal">
        <a-form :model="scheduleForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="会议时间" required>
                <a-date-picker
                  v-model:value="scheduleForm.datetime"
                  show-time
                  placeholder="选择会议时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="会议地点" required>
                <a-input
                  v-model:value="scheduleForm.location"
                  placeholder="请输入会议地点"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="会议形式" required>
            <a-radio-group v-model:value="scheduleForm.type">
              <a-radio value="offline">现场会议</a-radio>
              <a-radio value="online">线上会议</a-radio>
              <a-radio value="hybrid">混合会议</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="会议主持人" required>
            <a-select
              v-model:value="scheduleForm.host"
              placeholder="选择主持人"
              style="width: 100%"
            >
              <a-select-option v-for="host in hostList" :key="host.id" :value="host.id">
                {{ host.name }} - {{ host.title }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="参会专家" required>
            <a-select
              v-model:value="scheduleForm.experts"
              mode="multiple"
              placeholder="选择参会专家"
              style="width: 100%"
            >
              <a-select-option v-for="expert in expertList" :key="expert.id" :value="expert.id">
                {{ expert.name }} - {{ expert.title }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="会议说明">
            <a-textarea
              v-model:value="scheduleForm.description"
              placeholder="请填写会议说明..."
              :rows="3"
              show-count
              :maxlength="200"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 录入结论弹窗 -->
    <a-modal
      v-model:open="conclusionModalVisible"
      title="录入验收结论"
      width="800px"
      @ok="handleConclusionSubmit"
      @cancel="handleConclusionCancel"
    >
      <div v-if="selectedMeeting" class="conclusion-modal">
        <div class="meeting-info">
          <h4>会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedMeeting.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="会议时间">
              {{ selectedMeeting.meetingTime }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedMeeting.meetingLocation }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <a-form :model="conclusionForm" layout="vertical">
          <a-form-item label="验收结论" required>
            <a-radio-group v-model:value="conclusionForm.conclusion">
              <a-radio value="passed">验收通过</a-radio>
              <a-radio value="conditional_passed">有条件通过</a-radio>
              <a-radio value="failed">验收不通过</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="验收评分" required>
            <a-input-number
              v-model:value="conclusionForm.score"
              :min="0"
              :max="100"
              placeholder="请输入评分"
              style="width: 200px"
            />
            <span style="margin-left: 8px">分</span>
          </a-form-item>

          <a-form-item label="结论说明" required>
            <a-textarea
              v-model:value="conclusionForm.description"
              placeholder="请详细说明验收结论..."
              :rows="4"
              show-count
              :maxlength="500"
            />
          </a-form-item>

          <a-form-item label="整改要求" v-if="conclusionForm.conclusion !== 'passed'">
            <a-textarea
              v-model:value="conclusionForm.requirements"
              placeholder="请填写整改要求..."
              :rows="3"
              show-count
              :maxlength="300"
            />
          </a-form-item>

          <a-form-item label="专家意见">
            <div class="expert-opinions">
              <div
                v-for="(opinion, index) in conclusionForm.expertOpinions"
                :key="index"
                class="opinion-item"
              >
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-input
                      v-model:value="opinion.expert"
                      placeholder="专家姓名"
                    />
                  </a-col>
                  <a-col :span="4">
                    <a-input-number
                      v-model:value="opinion.score"
                      :min="0"
                      :max="100"
                      placeholder="评分"
                    />
                  </a-col>
                  <a-col :span="10">
                    <a-textarea
                      v-model:value="opinion.content"
                      placeholder="专家意见"
                      :rows="2"
                    />
                  </a-col>
                  <a-col :span="2">
                    <a-button
                      type="link"
                      danger
                      @click="removeExpertOpinion(index)"
                    >
                      删除
                    </a-button>
                  </a-col>
                </a-row>
              </div>
              <a-button
                type="dashed"
                @click="addExpertOpinion"
                style="width: 100%; margin-top: 8px"
              >
                <PlusOutlined />
                添加专家意见
              </a-button>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 会议结论管理页面 - 管理角色
 * 功能：会议安排、结论录入、流程管理、状态跟踪
 */
import { ref, computed, onMounted } from 'vue'
import {
  ScheduleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 统计数据
const stats = ref({
  pendingSchedule: 5,
  scheduled: 8,
  completed: 12,
  pendingConclusion: 3
})

// 筛选条件
const filters = ref({
  status: undefined,
  meetingDateRange: undefined,
  keyword: ''
})

// 活动标签页
const activeTab = ref('schedule')

// 待安排会议列表
const pendingScheduleList = ref([
  {
    id: 1,
    projectName: '智慧城市大数据平台建设项目',
    projectCode: 'PROJ-2024-001',
    projectLeader: '张三',
    projectDuration: '12个月',
    projectBudget: 500,
    materialStatus: 'approved',
    submitTime: '2024-01-15',
    requiredMaterials: 4,
    totalRequired: 4,
    optionalMaterials: 2
  }
])

// 已安排会议列表
const scheduledMeetingList = ref([
  {
    id: 2,
    projectName: '区块链供应链金融平台',
    projectCode: 'PROJ-2024-002',
    meetingTime: '2024-01-25 14:00',
    meetingLocation: '会议室A-201',
    meetingType: 'offline',
    meetingHost: '李主任',
    meetingStatus: 'scheduled',
    experts: ['张教授', '李博士', '王专家'],
    meetingDescription: '项目验收会议，请准时参加'
  }
])

// 结论列表
const conclusionList = ref([
  {
    id: 3,
    projectName: 'AI智能客服系统',
    projectCode: 'PROJ-2024-003',
    meetingTime: '2024-01-20 09:00',
    conclusionTime: '2024-01-20 11:30',
    conclusion: 'passed',
    score: 88,
    conclusionDescription: '项目完成质量良好，各项指标达到预期要求，同意验收通过。',
    requirements: null,
    expertOpinions: [
      {
        id: 1,
        expert: '张教授',
        score: 90,
        content: '技术方案先进，实现效果良好。'
      },
      {
        id: 2,
        expert: '李博士',
        score: 86,
        content: '功能完整，用户体验佳。'
      }
    ]
  }
])

// 主持人列表
const hostList = ref([
  { id: 1, name: '李主任', title: '技术主任' },
  { id: 2, name: '王经理', title: '项目经理' },
  { id: 3, name: '张总监', title: '技术总监' }
])

// 专家列表
const expertList = ref([
  { id: 1, name: '张教授', title: '高级工程师' },
  { id: 2, name: '李博士', title: '技术专家' },
  { id: 3, name: '王专家', title: '项目管理专家' },
  { id: 4, name: '赵顾问', title: '行业顾问' }
])

// 弹窗状态
const scheduleModalVisible = ref(false)
const conclusionModalVisible = ref(false)
const selectedProject = ref(null)
const selectedMeeting = ref(null)

// 表单数据
const scheduleForm = ref({
  datetime: undefined,
  location: '',
  type: 'offline',
  host: undefined,
  experts: [],
  description: ''
})

const conclusionForm = ref({
  conclusion: 'passed',
  score: 85,
  description: '',
  requirements: '',
  expertOpinions: [
    { expert: '', score: 85, content: '' }
  ]
})

// 状态相关方法
const getMaterialStatusText = (status) => {
  const textMap = {
    approved: '已通过',
    rejected: '已驳回',
    pending: '待审核'
  }
  return textMap[status] || '未知'
}

const getMeetingStatusColor = (status) => {
  const colorMap = {
    scheduled: 'blue',
    in_progress: 'orange',
    completed: 'green'
  }
  return colorMap[status] || 'default'
}

const getMeetingStatusText = (status) => {
  const textMap = {
    scheduled: '已安排',
    in_progress: '进行中',
    completed: '已完成'
  }
  return textMap[status] || '未知'
}

const getMeetingTypeText = (type) => {
  const textMap = {
    offline: '现场会议',
    online: '线上会议',
    hybrid: '混合会议'
  }
  return textMap[type] || '未知'
}

const getConclusionColor = (conclusion) => {
  const colorMap = {
    passed: 'green',
    conditional_passed: 'orange',
    failed: 'red'
  }
  return colorMap[conclusion] || 'default'
}

const getConclusionText = (conclusion) => {
  const textMap = {
    passed: '验收通过',
    conditional_passed: '有条件通过',
    failed: '验收不通过'
  }
  return textMap[conclusion] || '未知'
}

// 事件处理方法
const scheduleBatchMeeting = () => {
  message.info('批量安排会议功能')
}

const handleFilter = () => {
  // 筛选逻辑
}

const resetFilters = () => {
  filters.value = {
    status: undefined,
    meetingDateRange: undefined,
    keyword: ''
  }
}

const handleTabChange = (key) => {
  activeTab.value = key
}

const scheduleMeeting = (item) => {
  selectedProject.value = item
  scheduleForm.value = {
    datetime: undefined,
    location: '',
    type: 'offline',
    host: undefined,
    experts: [],
    description: ''
  }
  scheduleModalVisible.value = true
}

const viewMaterials = (item) => {
  message.info(`查看材料：${item.projectName}`)
}

const viewProjectDetail = (item) => {
  message.info(`查看详情：${item.projectName}`)
}

const startMeeting = (item) => {
  item.meetingStatus = 'in_progress'
  message.success(`开始会议：${item.projectName}`)
}

const inputConclusion = (item) => {
  selectedMeeting.value = item
  conclusionForm.value = {
    conclusion: 'passed',
    score: 85,
    description: '',
    requirements: '',
    expertOpinions: [
      { expert: '', score: 85, content: '' }
    ]
  }
  conclusionModalVisible.value = true
}

const editMeeting = (item) => {
  message.info(`编辑会议：${item.projectName}`)
}

const viewMeetingDetail = (item) => {
  message.info(`查看会议详情：${item.projectName}`)
}

const editConclusion = (item) => {
  message.info(`编辑结论：${item.projectName}`)
}

const exportConclusion = (item) => {
  message.success(`导出结论：${item.projectName}`)
}

const viewConclusionDetail = (item) => {
  message.info(`查看结论详情：${item.projectName}`)
}

// 弹窗处理方法
const handleScheduleSubmit = () => {
  message.success('会议安排完成')
  scheduleModalVisible.value = false
  
  // 将项目从待安排列表移动到已安排列表
  if (selectedProject.value) {
    const newMeeting = {
      ...selectedProject.value,
      meetingTime: scheduleForm.value.datetime?.format('YYYY-MM-DD HH:mm'),
      meetingLocation: scheduleForm.value.location,
      meetingType: scheduleForm.value.type,
      meetingHost: hostList.value.find(h => h.id === scheduleForm.value.host)?.name,
      meetingStatus: 'scheduled',
      experts: scheduleForm.value.experts.map(id => expertList.value.find(e => e.id === id)?.name),
      meetingDescription: scheduleForm.value.description
    }
    
    scheduledMeetingList.value.push(newMeeting)
    
    const index = pendingScheduleList.value.findIndex(p => p.id === selectedProject.value.id)
    if (index > -1) {
      pendingScheduleList.value.splice(index, 1)
    }
  }
}

const handleScheduleCancel = () => {
  scheduleModalVisible.value = false
}

const handleConclusionSubmit = () => {
  message.success('验收结论录入完成')
  conclusionModalVisible.value = false
  
  // 添加到结论列表
  if (selectedMeeting.value) {
    const newConclusion = {
      ...selectedMeeting.value,
      conclusionTime: new Date().toLocaleString(),
      conclusion: conclusionForm.value.conclusion,
      score: conclusionForm.value.score,
      conclusionDescription: conclusionForm.value.description,
      requirements: conclusionForm.value.requirements,
      expertOpinions: conclusionForm.value.expertOpinions.filter(o => o.expert && o.content)
    }
    
    conclusionList.value.push(newConclusion)
    
    // 更新会议状态
    selectedMeeting.value.meetingStatus = 'completed'
  }
}

const handleConclusionCancel = () => {
  conclusionModalVisible.value = false
}

const addExpertOpinion = () => {
  conclusionForm.value.expertOpinions.push({
    expert: '',
    score: 85,
    content: ''
  })
}

const removeExpertOpinion = (index) => {
  conclusionForm.value.expertOpinions.splice(index, 1)
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.meeting-conclusion-management {
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
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border-radius: 12px;
  color: #fff;
  font-size: 18px;
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
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  font-size: 20px;
}

.stat-card.pending .stat-icon {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-card.scheduled .stat-icon {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-card.completed .stat-icon {
  background: #f6ffed;
  color: #52c41a;
}

.stat-card.conclusion .stat-icon {
  background: #f9f0ff;
  color: #722ed1;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  line-height: 1;
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

.meeting-tabs :deep(.ant-tabs-content-holder) {
  padding: 24px;
}

/* 列表样式 */
.meeting-list,
.conclusion-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.meeting-item,
.conclusion-item {
  padding: 24px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.meeting-item:hover,
.conclusion-item:hover {
  background: #f8f9ff;
  border-color: #d6e4ff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* 项目头部样式 */
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
  font-size: 12px;
  color: #8c8c8c;
}

/* 内容区域样式 */
.item-content {
  margin-bottom: 16px;
}

.project-details,
.meeting-details {
  margin-bottom: 16px;
}

.material-summary {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.summary-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

.summary-content {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #8c8c8c;
}

/* 操作区域样式 */
.item-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 结论详情样式 */
.conclusion-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conclusion-section {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.section-content {
  color: #595959;
  line-height: 1.6;
}

.conclusion-result {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.result-label {
  font-weight: 500;
  color: #262626;
}

.result-value {
  color: #52c41a;
  font-weight: 500;
}

.result-score {
  color: #1890ff;
  font-weight: 500;
}

.conclusion-description {
  color: #595959;
  line-height: 1.6;
}

.expert-opinion {
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.opinion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.expert-name {
  font-weight: 500;
  color: #262626;
}

.opinion-score {
  font-size: 12px;
  color: #1890ff;
}

.opinion-content {
  color: #595959;
  line-height: 1.5;
}

/* 弹窗样式 */
.schedule-modal,
.conclusion-modal {
  padding: 16px 0;
}

.meeting-info {
  margin-bottom: 24px;
}

.meeting-info h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.expert-opinions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opinion-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .meeting-conclusion-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-section .ant-form {
    flex-direction: column;
  }
  
  .filter-section .ant-form-item {
    margin-bottom: 16px;
  }
  
  .meeting-stats .ant-col {
    margin-bottom: 16px;
  }
  
  .item-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .project-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .summary-content {
    flex-direction: column;
    gap: 8px;
  }
  
  .conclusion-result {
    flex-direction: column;
    gap: 8px;
  }
  
  .opinion-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style> 