<!--
 * @file 开题进度查询页面 - 申报单位角色
 * @description 申报单位查询开题申请的进度和状态
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-23
-->
<template>
  <div class="opening-progress-query">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <SearchOutlined />
          </span>
          开题进度查询
        </h1>
        <p class="page-description">
          查询和跟踪您的项目开题申请进度
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
            <a-select-option value="completed">开题完成</a-select-option>
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
          开题进度列表
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
                v-if="item.status === 'meeting_scheduled'" 
                size="small" 
                @click.stop="viewMeetingInfo(item)"
              >
                会议信息
              </a-button>
            </a-space>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredProgressList.length === 0" class="empty-state">
          <a-empty description="暂无开题进度记录">
            <a-button type="primary" @click="goToSubmit">
              提交开题申请
            </a-button>
          </a-empty>
        </div>
      </div>
    </div>

    <!-- 进度详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="开题进度详情"
      width="800px"
      :footer="null"
    >
      <div v-if="currentDetail" class="progress-detail">
        <div class="detail-header">
          <h3>{{ currentDetail.projectName }}</h3>
          <a-tag :color="getStatusColor(currentDetail.status)" size="large">
            {{ getStatusText(currentDetail.status) }}
          </a-tag>
        </div>
        
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="项目编号">
            {{ currentDetail.projectCode }}
          </a-descriptions-item>
          <a-descriptions-item label="申请时间">
            {{ currentDetail.submitTime }}
          </a-descriptions-item>
          <a-descriptions-item label="项目负责人">
            {{ currentDetail.projectLeader }}
          </a-descriptions-item>
          <a-descriptions-item label="联系方式">
            {{ currentDetail.contactPhone }}
          </a-descriptions-item>
          <a-descriptions-item label="预期开题时间" :span="2">
            {{ currentDetail.expectedOpeningDate }}
          </a-descriptions-item>
        </a-descriptions>

        <div class="detail-timeline">
          <h4>进度时间线</h4>
          <a-timeline>
            <a-timeline-item
              v-for="step in currentDetail.timeline"
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
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 开题进度查询页面
 * 功能：查询开题申请进度、查看详细时间线、跟踪审核状态
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  SendOutlined,
  EyeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 查询表单
const queryForm = ref({
  projectName: '',
  status: '',
  dateRange: []
})

// 进度概览数据
const overview = ref({
  submitted: 12,
  reviewing: 5,
  meeting: 3,
  completed: 8
})

// 进度列表数据
const progressList = ref([
  {
    id: 1,
    projectName: '智慧城市大数据平台建设项目',
    projectCode: 'PROJ-2024-001',
    projectLeader: '张三',
    contactPhone: '138****1234',
    status: 'meeting_scheduled',
    submitTime: '2024-01-15 10:30',
    expectedOpeningDate: '2024-02-10',
    timeline: [
      {
        id: 1,
        title: '提交申请',
        description: '开题申请已成功提交，材料包括开题报告、研究方案等',
        time: '2024-01-15 10:30',
        status: 'finished'
      },
      {
        id: 2,
        title: '材料审核',
        description: '管理员正在审核提交的开题材料',
        time: '2024-01-16 14:20',
        status: 'finished'
      },
      {
        id: 3,
        title: '会议安排',
        description: '开题论证会已安排，时间：2024-02-10 14:00',
        time: '2024-01-20 09:15',
        status: 'process'
      }
    ]
  },
  {
    id: 2,
    projectName: '区块链供应链金融平台',
    projectCode: 'PROJ-2024-002',
    projectLeader: '李四',
    contactPhone: '139****5678',
    status: 'under_review',
    submitTime: '2024-01-18 16:45',
    expectedOpeningDate: '2024-02-15',
    timeline: [
      {
        id: 1,
        title: '提交申请',
        description: '开题申请已成功提交',
        time: '2024-01-18 16:45',
        status: 'finished'
      },
      {
        id: 2,
        title: '材料审核',
        description: '管理员正在审核提交的开题材料',
        time: '2024-01-19 09:00',
        status: 'process'
      }
    ]
  }
])

// 弹窗状态
const detailVisible = ref(false)
const currentDetail = ref(null)

// 计算属性
const filteredProgressList = computed(() => {
  let list = progressList.value
  
  if (queryForm.value.projectName) {
    list = list.filter(item => 
      item.projectName.includes(queryForm.value.projectName)
    )
  }
  
  if (queryForm.value.status) {
    list = list.filter(item => item.status === queryForm.value.status)
  }
  
  return list
})

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    'submitted': 'blue',
    'under_review': 'orange',
    'approved': 'green',
    'rejected': 'red',
    'meeting_scheduled': 'cyan',
    'completed': 'green'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'submitted': '已提交',
    'under_review': '审核中',
    'approved': '审核通过',
    'rejected': '审核驳回',
    'meeting_scheduled': '会议已定',
    'completed': '开题完成'
  }
  return textMap[status] || '未知状态'
}

const getProgressPercent = (status) => {
  const percentMap = {
    'submitted': 25,
    'under_review': 50,
    'approved': 75,
    'rejected': 40,
    'meeting_scheduled': 85,
    'completed': 100
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
    'submitted': '#1890ff',
    'under_review': '#faad14',
    'approved': '#52c41a',
    'rejected': '#ff4d4f',
    'meeting_scheduled': '#13c2c2',
    'completed': '#52c41a'
  }
  return colorMap[status] || '#1890ff'
}

const getProgressText = (status) => {
  const textMap = {
    'submitted': '申请已提交，等待审核',
    'under_review': '材料审核中，请耐心等待',
    'approved': '材料审核通过，等待安排会议',
    'rejected': '材料审核未通过，需要重新提交',
    'meeting_scheduled': '开题会议已安排，请按时参加',
    'completed': '开题流程已完成'
  }
  return textMap[status] || ''
}

const getTimelineColor = (status) => {
  const colorMap = {
    'finished': 'green',
    'process': 'blue',
    'wait': 'gray',
    'error': 'red'
  }
  return colorMap[status] || 'gray'
}

const getTimelineIcon = (status) => {
  const iconMap = {
    'finished': CheckCircleOutlined,
    'process': ClockCircleOutlined,
    'wait': ExclamationCircleOutlined,
    'error': CloseCircleOutlined
  }
  return iconMap[status] || ExclamationCircleOutlined
}

// 事件处理
const handleQuery = () => {
  message.success('查询完成')
}

const handleReset = () => {
  queryForm.value = {
    projectName: '',
    status: '',
    dateRange: []
  }
  message.info('查询条件已重置')
}

const refreshData = () => {
  message.success('数据已刷新')
}

const showProgressDetail = (item) => {
  currentDetail.value = item
  detailVisible.value = true
}

const viewDetail = (item) => {
  showProgressDetail(item)
}

const resubmit = (item) => {
  router.push(`/implementation/opening/application/submit?id=${item.id}&type=resubmit`)
}

const viewMeetingInfo = (item) => {
  message.info('会议信息查看功能开发中')
}

const goToSubmit = () => {
  router.push('/implementation/opening/application/submit')
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.opening-progress-query {
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

/* 查询条件样式 */
.query-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 进度概览样式 */
.progress-overview {
  margin-bottom: 24px;
}

.overview-card {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-icon {
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

.submitted .card-icon {
  background: linear-gradient(135deg, #1890ff, #096dd9);
}

.reviewing .card-icon {
  background: linear-gradient(135deg, #faad14, #d48806);
}

.meeting .card-icon {
  background: linear-gradient(135deg, #13c2c2, #08979c);
}

.completed .card-icon {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.card-content {
  flex: 1;
}

.card-number {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
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
}

.list-header h3 .anticon {
  margin-right: 8px;
  color: #1890ff;
}

.progress-items {
  padding: 0;
}

.progress-item {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.progress-item:hover {
  background: #fafafa;
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
  text-align: right;
}

.status-tag {
  margin-bottom: 4px;
  display: block;
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
  font-size: 14px;
  color: #666;
}

.item-timeline {
  margin-bottom: 16px;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.timeline-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.timeline-time {
  font-size: 12px;
  color: #8c8c8c;
}

.item-actions {
  text-align: right;
}

.empty-state {
  padding: 48px;
  text-align: center;
}

/* 弹窗样式 */
.progress-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.detail-timeline {
  margin-top: 24px;
}

.detail-timeline h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}
</style>
