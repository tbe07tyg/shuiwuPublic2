<!--
 * @file 验收进度查询页面 - 申报单位角色
 * @description 申报单位查询验收申请的进度和状态
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="acceptance-progress-query">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <SearchOutlined />
          </span>
          验收进度查询
        </h1>
        <p class="page-description">
          查询和跟踪您的项目验收申请进度
        </p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="refreshData">
          <ReloadOutlined />
          刷新数据
        </a-button>
      </div>
    </div>

    <!-- 查询条件 -->
    <div class="query-section">
      <a-form layout="inline" :model="queryForm" @finish="handleQuery">
        <a-form-item label="项目名称" name="projectName">
          <a-input
            v-model:value="queryForm.projectName"
            placeholder="请输入项目名称"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="申请状态" name="status">
          <a-select
            v-model:value="queryForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 150px"
          >
            <a-select-option value="submitted">已提交</a-select-option>
            <a-select-option value="under_review">审核中</a-select-option>
            <a-select-option value="approved">审核通过</a-select-option>
            <a-select-option value="rejected">审核驳回</a-select-option>
            <a-select-option value="meeting_scheduled">会议已定</a-select-option>
            <a-select-option value="completed">验收完成</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="提交时间" name="dateRange">
          <a-range-picker
            v-model:value="queryForm.dateRange"
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <SearchOutlined />
              查询
            </a-button>
            <a-button @click="handleReset">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 进度概览 -->
    <div class="progress-overview">
      <a-row :gutter="24">
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="overview-card submitted">
            <div class="card-icon">
              <SendOutlined />
            </div>
            <div class="card-content">
              <div class="card-number">{{ overview.submitted }}</div>
              <div class="card-label">已提交申请</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="overview-card reviewing">
            <div class="card-icon">
              <EyeOutlined />
            </div>
            <div class="card-content">
              <div class="card-number">{{ overview.reviewing }}</div>
              <div class="card-label">审核中</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="overview-card meeting">
            <div class="card-icon">
              <CalendarOutlined />
            </div>
            <div class="card-content">
              <div class="card-number">{{ overview.meeting }}</div>
              <div class="card-label">待会议</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="overview-card completed">
            <div class="card-icon">
              <CheckCircleOutlined />
            </div>
            <div class="card-content">
              <div class="card-number">{{ overview.completed }}</div>
              <div class="card-label">已完成</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 进度列表 -->
    <div class="progress-list">
      <div class="list-header">
        <h3>
          <UnorderedListOutlined />
          验收进度列表
        </h3>
      </div>
      
      <div class="progress-items">
        <div
          v-for="item in filteredProgressList"
          :key="item.id"
          class="progress-item"
          @click="showProgressDetail(item)"
        >
          <!-- 项目基本信息 -->
          <div class="item-header">
            <div class="project-info">
              <h4 class="project-name">{{ item.projectName }}</h4>
              <span class="project-code">{{ item.projectCode }}</span>
            </div>
            <div class="status-info">
              <a-tag :color="getStatusColor(item.status)" class="status-tag">
                {{ getStatusText(item.status) }}
              </a-tag>
              <span class="submit-time">{{ item.submitTime }}</span>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="item-progress">
            <a-progress
              :percent="getProgressPercent(item.status)"
              :status="getProgressStatus(item.status)"
              :stroke-color="getProgressColor(item.status)"
              size="small"
            />
            <div class="progress-text">{{ getProgressText(item.status) }}</div>
          </div>

          <!-- 时间线 -->
          <div class="item-timeline">
            <a-timeline size="small">
              <a-timeline-item
                v-for="step in item.timeline"
                :key="step.id"
                :color="getTimelineColor(step.status)"
              >
                <template #dot>
                  <component :is="getTimelineIcon(step.status)" />
                </template>
                <div class="timeline-content">
                  <div class="timeline-title">{{ step.title }}</div>
                  <div class="timeline-desc">{{ step.description }}</div>
                  <div class="timeline-time">{{ step.time }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>

          <!-- 操作按钮 -->
          <div class="item-actions">
            <a-space>
              <a-button size="small" @click.stop="viewDetail(item)">
                查看详情
              </a-button>
              <a-button 
                v-if="item.status === 'rejected'" 
                type="primary" 
                size="small" 
                @click.stop="resubmit(item)"
              >
                重新提交
              </a-button>
              <a-button 
                v-if="item.meetingInfo" 
                type="link" 
                size="small" 
                @click.stop="viewMeetingInfo(item)"
              >
                会议信息
              </a-button>
            </a-space>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredProgressList.length === 0" class="empty-state">
        <a-empty description="暂无验收申请记录">
          <a-button type="primary" @click="goToSubmit">
            <PlusOutlined />
            提交验收申请
          </a-button>
        </a-empty>
      </div>
    </div>

    <!-- 进度详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="验收进度详情"
      width="900px"
      :footer="null"
    >
      <div v-if="selectedItem" class="progress-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedItem.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedItem.projectCode }}
            </a-descriptions-item>
            <a-descriptions-item label="当前状态">
              <a-tag :color="getStatusColor(selectedItem.status)">
                {{ getStatusText(selectedItem.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="提交时间">
              {{ selectedItem.submitTime }}
            </a-descriptions-item>
            <a-descriptions-item label="预期验收时间">
              {{ selectedItem.expectedTime }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 详细时间线 -->
        <div class="detail-section">
          <h4>详细进度</h4>
          <a-timeline>
            <a-timeline-item
              v-for="step in selectedItem.detailTimeline"
              :key="step.id"
              :color="getTimelineColor(step.status)"
            >
              <template #dot>
                <component :is="getTimelineIcon(step.status)" />
              </template>
              <div class="timeline-detail">
                <div class="timeline-header">
                  <span class="timeline-title">{{ step.title }}</span>
                  <span class="timeline-time">{{ step.time }}</span>
                </div>
                <div class="timeline-desc">{{ step.description }}</div>
                <div v-if="step.operator" class="timeline-operator">
                  操作人：{{ step.operator }}
                </div>
                <div v-if="step.comments" class="timeline-comments">
                  <div class="comments-title">处理意见：</div>
                  <div class="comments-content">{{ step.comments }}</div>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>

        <!-- 会议信息 -->
        <div v-if="selectedItem.meetingInfo" class="detail-section">
          <h4>会议信息</h4>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="会议时间">
              {{ selectedItem.meetingInfo.time }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedItem.meetingInfo.location }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式">
              {{ selectedItem.meetingInfo.type }}
            </a-descriptions-item>
            <a-descriptions-item label="参会要求">
              {{ selectedItem.meetingInfo.requirements }}
            </a-descriptions-item>
            <a-descriptions-item label="联系人" :span="2">
              {{ selectedItem.meetingInfo.contact }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 验收进度查询页面 - 申报单位角色
 * 功能：进度查询、状态跟踪、时间线展示、会议信息查看
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  SearchOutlined,
  ReloadOutlined,
  SendOutlined,
  EyeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const router = useRouter()

// 查询表单
const queryForm = ref({
  projectName: '',
  status: undefined,
  dateRange: undefined
})

// 概览数据
const overview = ref({
  submitted: 5,
  reviewing: 2,
  meeting: 1,
  completed: 2
})

// 进度列表数据
const progressList = ref([
  {
    id: 1,
    projectName: '智慧城市大数据平台建设项目',
    projectCode: 'PROJ-2024-001',
    status: 'meeting_scheduled',
    submitTime: '2024-01-15',
    expectedTime: '2024-03-20',
    timeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已提交',
        time: '2024-01-15 10:30',
        status: 'completed'
      },
      {
        id: 2,
        title: '材料审核',
        description: '材料审核通过',
        time: '2024-01-16 14:20',
        status: 'completed'
      },
      {
        id: 3,
        title: '会议安排',
        description: '验收会议已安排',
        time: '2024-01-18 09:15',
        status: 'current'
      }
    ],
    meetingInfo: {
      time: '2024-01-25 14:00',
      location: '会议室A-201',
      type: '现场会议',
      requirements: '请携带项目相关材料',
      contact: '张秘书 13800138000'
    },
    detailTimeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已成功提交，等待审核',
        time: '2024-01-15 10:30',
        status: 'completed',
        operator: '系统自动'
      },
      {
        id: 2,
        title: '材料审核',
        description: '材料审核通过，符合验收要求',
        time: '2024-01-16 14:20',
        status: 'completed',
        operator: '张审核员',
        comments: '材料齐全，符合验收要求，同意进入验收程序。'
      },
      {
        id: 3,
        title: '会议安排',
        description: '验收会议已安排，请按时参加',
        time: '2024-01-18 09:15',
        status: 'current',
        operator: '李管理员',
        comments: '会议时间：2024-01-25 14:00，地点：会议室A-201'
      }
    ]
  },
  {
    id: 2,
    projectName: '区块链供应链金融平台',
    projectCode: 'PROJ-2024-002',
    status: 'under_review',
    submitTime: '2024-01-20',
    expectedTime: '2024-04-15',
    timeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已提交',
        time: '2024-01-20 15:45',
        status: 'completed'
      },
      {
        id: 2,
        title: '材料审核',
        description: '正在审核中',
        time: '2024-01-21 08:00',
        status: 'current'
      }
    ],
    detailTimeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已成功提交，等待审核',
        time: '2024-01-20 15:45',
        status: 'completed',
        operator: '系统自动'
      },
      {
        id: 2,
        title: '材料审核',
        description: '材料正在审核中，请耐心等待',
        time: '2024-01-21 08:00',
        status: 'current',
        operator: '王审核员'
      }
    ]
  },
  {
    id: 3,
    projectName: 'AI智能客服系统',
    projectCode: 'PROJ-2024-003',
    status: 'rejected',
    submitTime: '2024-01-18',
    expectedTime: '2024-03-30',
    timeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已提交',
        time: '2024-01-18 11:20',
        status: 'completed'
      },
      {
        id: 2,
        title: '材料审核',
        description: '材料审核不通过',
        time: '2024-01-19 16:30',
        status: 'failed'
      }
    ],
    detailTimeline: [
      {
        id: 1,
        title: '申请提交',
        description: '验收申请已成功提交，等待审核',
        time: '2024-01-18 11:20',
        status: 'completed',
        operator: '系统自动'
      },
      {
        id: 2,
        title: '材料审核',
        description: '材料审核不通过，需要补充材料',
        time: '2024-01-19 16:30',
        status: 'failed',
        operator: '李审核员',
        comments: '材料不完整，缺少财务决算报告和知识产权清单，请补充后重新提交。'
      }
    ]
  }
])

// 弹窗状态
const detailModalVisible = ref(false)
const selectedItem = ref(null)

// 过滤后的进度列表
const filteredProgressList = computed(() => {
  let result = progressList.value
  
  if (queryForm.value.projectName) {
    result = result.filter(item => 
      item.projectName.includes(queryForm.value.projectName) ||
      item.projectCode.includes(queryForm.value.projectName)
    )
  }
  
  if (queryForm.value.status) {
    result = result.filter(item => item.status === queryForm.value.status)
  }
  
  // 日期范围过滤逻辑可以在这里添加
  
  return result
})

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    submitted: 'blue',
    under_review: 'orange',
    approved: 'green',
    rejected: 'red',
    meeting_scheduled: 'purple',
    completed: 'success'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    submitted: '已提交',
    under_review: '审核中',
    approved: '审核通过',
    rejected: '审核驳回',
    meeting_scheduled: '会议已定',
    completed: '验收完成'
  }
  return textMap[status] || '未知'
}

const getProgressPercent = (status) => {
  const percentMap = {
    submitted: 25,
    under_review: 50,
    approved: 75,
    rejected: 25,
    meeting_scheduled: 90,
    completed: 100
  }
  return percentMap[status] || 0
}

const getProgressStatus = (status) => {
  if (status === 'rejected') return 'exception'
  if (status === 'completed') return 'success'
  return 'active'
}

const getProgressColor = (status) => {
  const colorMap = {
    submitted: '#fa8c16',
    under_review: '#fa8c16',
    approved: '#52c41a',
    rejected: '#ff4d4f',
    meeting_scheduled: '#722ed1',
    completed: '#52c41a'
  }
  return colorMap[status] || '#fa8c16'
}

const getProgressText = (status) => {
  const textMap = {
    submitted: '等待审核',
    under_review: '审核中',
    approved: '等待会议安排',
    rejected: '审核驳回，需重新提交',
    meeting_scheduled: '等待验收会议',
    completed: '验收完成'
  }
  return textMap[status] || '未知阶段'
}

const getTimelineColor = (status) => {
  const colorMap = {
    completed: 'green',
    current: 'blue',
    failed: 'red',
    pending: 'gray'
  }
  return colorMap[status] || 'gray'
}

const getTimelineIcon = (status) => {
  const iconMap = {
    completed: CheckCircleOutlined,
    current: ClockCircleOutlined,
    failed: ExclamationCircleOutlined,
    pending: ClockCircleOutlined
  }
  return iconMap[status] || ClockCircleOutlined
}

// 事件处理方法
const refreshData = () => {
  message.success('数据已刷新')
  // 刷新数据逻辑
}

const handleQuery = () => {
  // 查询逻辑已在计算属性中处理
  message.info('查询完成')
}

const handleReset = () => {
  queryForm.value = {
    projectName: '',
    status: undefined,
    dateRange: undefined
  }
}

const showProgressDetail = (item) => {
  selectedItem.value = item
  detailModalVisible.value = true
}

const viewDetail = (item) => {
  message.info(`查看详情：${item.projectName}`)
}

const resubmit = (item) => {
  message.info(`重新提交：${item.projectName}`)
  
  // 提取审核意见（从detailTimeline中获取失败的审核记录）
  let reviewComments = ''
  if (item.detailTimeline && item.detailTimeline.length > 0) {
    const failedReviews = item.detailTimeline.filter(timeline => 
      timeline.status === 'failed' && timeline.comments
    )
    if (failedReviews.length > 0) {
      reviewComments = failedReviews.map(review => 
        `【${review.operator} - ${review.time}】：${review.comments}`
      ).join('\n')
    }
  }
  
  // 跳转到提交页面，并传递项目信息用于自动填充
  router.push({
    path: '/acceptance/application/submit',
    query: {
      resubmit: 'true',
      projectId: item.id,
      projectName: encodeURIComponent(item.projectName),
      projectCode: item.projectCode,
      expectedTime: item.expectedTime,
      // 从detailTimeline中获取申请说明
      description: encodeURIComponent(item.detailTimeline?.[0]?.description || '项目验收申请重新提交'),
      reviewComments: encodeURIComponent(reviewComments)
    }
  })
}

const viewMeetingInfo = (item) => {
  message.info(`查看会议信息：${item.projectName}`)
}

const goToSubmit = () => {
  router.push('/acceptance/application/submit')
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.acceptance-progress-query {
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

/* 查询区域样式 */
.query-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 概览卡片样式 */
.progress-overview {
  margin-bottom: 24px;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  font-size: 20px;
}

.overview-card.submitted .card-icon {
  background: #fff7e6;
  color: #fa8c16;
}

.overview-card.reviewing .card-icon {
  background: #fff7e6;
  color: #fa8c16;
}

.overview-card.meeting .card-icon {
  background: #f9f0ff;
  color: #722ed1;
}

.overview-card.completed .card-icon {
  background: #f6ffed;
  color: #52c41a;
}

.card-content {
  flex: 1;
}

.card-number {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  line-height: 1;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  color: #8c8c8c;
}

/* 进度列表样式 */
.progress-list {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.list-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-items {
  display: flex;
  flex-direction: column;
}

.progress-item {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.progress-item:hover {
  background: #f8f9ff;
}

.progress-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.project-code {
  font-size: 12px;
  color: #8c8c8c;
}

.status-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.submit-time {
  font-size: 12px;
  color: #8c8c8c;
}

.item-progress {
  margin-bottom: 16px;
}

.progress-text {
  margin-top: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.item-timeline {
  margin-bottom: 16px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-title {
  font-weight: 500;
  color: #262626;
}

.timeline-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.timeline-time {
  font-size: 12px;
  color: #bfbfbf;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
}

/* 空状态样式 */
.empty-state {
  padding: 60px 24px;
  text-align: center;
}

/* 详情弹窗样式 */
.progress-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.timeline-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-title {
  font-weight: 500;
  color: #262626;
}

.timeline-time {
  font-size: 12px;
  color: #8c8c8c;
}

.timeline-desc {
  color: #595959;
  line-height: 1.5;
}

.timeline-operator {
  font-size: 12px;
  color: #8c8c8c;
}

.timeline-comments {
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  margin-top: 8px;
}

.comments-title {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.comments-content {
  color: #595959;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .acceptance-progress-query {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .query-section .ant-form {
    flex-direction: column;
  }
  
  .query-section .ant-form-item {
    margin-bottom: 16px;
  }
  
  .item-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .status-info {
    align-items: flex-start;
  }
  
  .progress-overview .ant-col {
    margin-bottom: 16px;
  }
}
</style> 