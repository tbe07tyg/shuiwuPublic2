<!--
 * @file 开题管理中心页面 - 管理角色
 * @description 管理角色的开题管理中心，专注于材料审核与开题会议管理决策
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-23
-->
<template>
  <div class="opening-management-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <AppstoreOutlined />
          </span>
          开题管理中心
        </h1>
        <p class="page-description">
          审核开题材料，组织开题会议，管理开题流程
        </p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="handleBatchReview">
          <AuditOutlined />
          批量审核
        </a-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <a-row :gutter="24">
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card pending">
            <div class="stat-icon">
              <ClockCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.pendingReview }}</div>
              <div class="stat-label">待审核材料</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card reviewing">
            <div class="stat-icon">
              <CalendarOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.pendingMeeting }}</div>
              <div class="stat-label">待组织会议</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card completed">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.passed }}</div>
              <div class="stat-label">开题通过</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card rejected">
            <div class="stat-icon">
              <CloseCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.rejected }}</div>
              <div class="stat-label">开题未通过</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 开题流程说明 -->
    <div class="content-card flow-description">
      <div class="card-header">
        <h3>
          <BulbOutlined />
          开题流程说明
        </h3>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </div>
      <div v-show="showFlowDescription" class="flow-content">
        <a-steps :current="3" size="small" direction="horizontal" status="finish">
          <a-step title="申请提交" description="申报单位提交开题申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                审核开题材料，决定通过或驳回
                <div class="step-status-tags">
                  <a-tag color="orange" size="small">材料审核中</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="组织会议" status="finish">
            <template #description>
              <div class="step-description">
                安排开题论证会并组织专家评审
                <div class="step-status-tags">
                  <a-tag color="blue" size="small">会议待组织</a-tag>
                  <a-tag color="cyan" size="small">会议已安排</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="结论录入" status="finish">
            <template #description>
              <div class="step-description">
                根据会议结果录入最终开题结论
                <div class="step-status-tags">
                  <a-tag color="green" size="small">开题通过</a-tag>
                  <a-tag color="orange" size="small">有条件通过</a-tag>
                  <a-tag color="red" size="small">开题未通过</a-tag>
                </div>
              </div>
            </template>
          </a-step>
        </a-steps>
      </div>
    </div>

    <!-- 待办事项和管理操作区域 -->
    <a-row :gutter="24" style="margin-bottom: 24px;">
      <!-- 待办事项 -->
      <a-col :xs="24" :lg="12">
        <div class="content-card">
          <div class="card-header">
            <h3>
              <BellOutlined />
              待办事项
              <a-badge :count="todoList.length" />
            </h3>
            <a-button type="link" size="small" @click="handleViewAllTodo">
              查看全部
            </a-button>
          </div>
          <div class="todo-list">
            <div v-for="item in todoList.slice(0, 5)" :key="item.id" class="todo-item">
              <div class="todo-priority" :class="item.priority"></div>
              <div class="todo-content">
                <div class="todo-title">{{ item.title }}</div>
                <div class="todo-meta">
                  <span class="todo-project">{{ item.project }}</span>
                  <span class="todo-time">{{ formatTime(item.deadline) }}</span>
                </div>
              </div>
              <div class="todo-actions">
                <a-button type="text" size="small" @click="handleTodoAction(item)">
                  处理
                </a-button>
              </div>
            </div>
            <div v-if="todoList.length === 0" class="empty-todo">
              <SmileOutlined />
              <p>暂无待办事项</p>
            </div>
          </div>
        </div>
      </a-col>

      <!-- 管理操作 -->
      <a-col :xs="24" :lg="12">
        <div class="content-card">
          <div class="card-header">
            <h3>
              <SettingOutlined />
              管理操作
            </h3>
          </div>
          <div class="management-actions">
            <a-space direction="vertical" style="width: 100%">
              <a-button @click="goToMeetingManagement" block size="large">
                <ScheduleOutlined />
                会议管理
              </a-button>
            </a-space>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 项目审核管理区域 -->
    <div class="content-card">
      <div class="card-header">
        <h3>
          <AuditOutlined />
          开题审核管理
        </h3>
        <div class="header-filters">
          <a-select
            v-model:value="filters.status"
            placeholder="筛选状态"
            style="width: 150px"
            @change="handleFilterChange"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="material_reviewing">材料审核中</a-select-option>
            <a-select-option value="meeting_preparing">会议待组织</a-select-option>
            <a-select-option value="meeting_scheduled">会议已安排</a-select-option>
            <a-select-option value="opening_passed">开题通过</a-select-option>
            <a-select-option value="opening_conditional">有条件通过</a-select-option>
            <a-select-option value="opening_failed">开题未通过</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目名称"
            style="width: 200px"
            @search="handleSearch"
          />
        </div>
      </div>

      <div class="review-list">
        <a-table
          :columns="columns"
          :data-source="filteredApplications"
          :pagination="pagination"
          row-key="id"
          size="middle"
          :row-selection="rowSelection"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'projectInfo'">
              <div class="project-info">
                <div class="project-name">{{ record.projectName }}</div>
                <div class="project-code">{{ record.projectCode }}</div>
                <div class="project-leader">负责人：{{ record.projectLeader }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'progress'">
              <div class="progress-info">
                <a-progress 
                  :percent="getProgressPercent(record.status)" 
                  size="small"
                  :status="getProgressStatus(record.status)"
                />
                <div class="progress-text">{{ getProgressText(record.status) }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button 
                  v-if="record.status === 'material_reviewing'" 
                  type="primary" 
                  size="small" 
                  @click="handleReviewMaterial(record)"
                >
                  审核材料
                </a-button>
                <a-button 
                  v-if="record.status === 'meeting_preparing'" 
                  type="primary" 
                  size="small" 
                  @click="handleScheduleMeeting(record)"
                >
                  安排会议
                </a-button>
                <a-button 
                  v-if="record.status === 'meeting_scheduled'" 
                  size="small" 
                  @click="handleInputConclusion(record)"
                >
                  录入结论
                </a-button>
                <a-button size="small" @click="handleViewDetail(record)">
                  查看详情
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 材料审核弹窗 -->
    <a-modal
      v-model:open="reviewModalVisible"
      title="开题材料审核"
      width="1000px"
      :footer="null"
    >
      <div v-if="currentReview" class="review-modal">
        <div class="review-header">
          <h3>{{ currentReview.projectName }}</h3>
          <a-tag :color="getStatusColor(currentReview.status)">
            {{ getStatusText(currentReview.status) }}
          </a-tag>
        </div>
        
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="项目编号">
            {{ currentReview.projectCode }}
          </a-descriptions-item>
          <a-descriptions-item label="申请时间">
            {{ currentReview.submitTime }}
          </a-descriptions-item>
          <a-descriptions-item label="项目负责人">
            {{ currentReview.projectLeader }}
          </a-descriptions-item>
          <a-descriptions-item label="预期开题时间">
            {{ currentReview.expectedOpeningDate }}
          </a-descriptions-item>
        </a-descriptions>

        <div class="materials-review">
          <h4>开题材料清单</h4>
          <a-table
            :columns="materialColumns"
            :data-source="currentReview.materials"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 'approved' ? 'green' : record.status === 'rejected' ? 'red' : 'orange'">
                  {{ record.status === 'approved' ? '通过' : record.status === 'rejected' ? '驳回' : '待审核' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-space>
                  <a-button size="small" @click="previewMaterial(record)">
                    预览
                  </a-button>
                  <a-button size="small" @click="downloadMaterial(record)">
                    下载
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>

        <div class="review-actions">
          <a-form :model="reviewForm" layout="vertical">
            <a-form-item label="审核意见">
              <a-textarea
                v-model:value="reviewForm.comment"
                :rows="4"
                placeholder="请输入审核意见..."
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleApprove">
                  <CheckOutlined />
                  通过审核
                </a-button>
                <a-button danger @click="handleReject">
                  <CloseOutlined />
                  驳回申请
                </a-button>
                <a-button @click="reviewModalVisible = false">
                  取消
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-modal>

    <!-- 批量审核弹窗 -->
    <a-modal
      v-model:open="batchReviewVisible"
      title="批量审核"
      width="600px"
      @ok="handleBatchApprove"
    >
      <div class="batch-review">
        <p>已选择 {{ selectedRowKeys.length }} 个开题申请进行批量审核</p>
        <a-form :model="batchReviewForm" layout="vertical">
          <a-form-item label="批量操作" required>
            <a-radio-group v-model:value="batchReviewForm.action">
              <a-radio value="approve">批量通过</a-radio>
              <a-radio value="reject">批量驳回</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="统一意见">
            <a-textarea
              v-model:value="batchReviewForm.comment"
              :rows="3"
              placeholder="请输入统一审核意见..."
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 开题管理中心页面
 * 功能：材料审核、会议安排、结论录入、流程管理
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  AppstoreOutlined,
  AuditOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  BellOutlined,
  SettingOutlined,
  ScheduleOutlined,
  CheckOutlined,
  CloseOutlined,
  SmileOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 页面状态
const showFlowDescription = ref(false)
const reviewModalVisible = ref(false)
const batchReviewVisible = ref(false)
const currentReview = ref(null)

// 统计数据
const stats = ref({
  pendingReview: 15,
  pendingMeeting: 8,
  passed: 25,
  rejected: 3
})

// 待办事项
const todoList = ref([
  {
    id: 1,
    title: '审核张三的开题申请材料',
    project: '智慧城市大数据平台建设项目',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: 'high'
  },
  {
    id: 2,
    title: '安排李四项目的开题论证会',
    project: '区块链供应链金融平台',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'medium'
  }
])

// 筛选条件
const filters = ref({
  status: '',
  keyword: ''
})

// 表格选择
const selectedRowKeys = ref([])
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  }
}

// 审核表单
const reviewForm = ref({
  comment: ''
})

const batchReviewForm = ref({
  action: 'approve',
  comment: ''
})

// 开题申请列表
const applicationList = ref([
  {
    id: 1,
    projectName: '智慧城市大数据平台建设项目',
    projectCode: 'PROJ-2024-001',
    projectLeader: '张三',
    status: 'material_reviewing',
    submitTime: '2024-01-15 10:30',
    expectedOpeningDate: '2024-02-10',
    materials: [
      { id: 1, name: '开题报告', type: 'required', status: 'pending', size: '2.5MB' },
      { id: 2, name: '研究方案', type: 'required', status: 'pending', size: '1.8MB' },
      { id: 3, name: '文献综述', type: 'required', status: 'pending', size: '3.2MB' }
    ]
  },
  {
    id: 2,
    projectName: '区块链供应链金融平台',
    projectCode: 'PROJ-2024-002',
    projectLeader: '李四',
    status: 'meeting_preparing',
    submitTime: '2024-01-18 16:45',
    expectedOpeningDate: '2024-02-15',
    materials: [
      { id: 1, name: '开题报告', type: 'required', status: 'approved', size: '2.1MB' },
      { id: 2, name: '研究方案', type: 'required', status: 'approved', size: '1.9MB' }
    ]
  }
])

// 表格配置
const columns = [
  {
    title: '项目信息',
    key: 'projectInfo',
    width: 300
  },
  {
    title: '申请时间',
    dataIndex: 'submitTime',
    width: 150
  },
  {
    title: '预期开题时间',
    dataIndex: 'expectedOpeningDate',
    width: 150
  },
  {
    title: '状态',
    key: 'status',
    width: 120
  },
  {
    title: '进度',
    key: 'progress',
    width: 200
  },
  {
    title: '操作',
    key: 'actions',
    width: 250
  }
]

const materialColumns = [
  {
    title: '材料名称',
    dataIndex: 'name',
    width: 200
  },
  {
    title: '材料类型',
    dataIndex: 'type',
    width: 100,
    customRender: ({ text }) => text === 'required' ? '必需' : '可选'
  },
  {
    title: '文件大小',
    dataIndex: 'size',
    width: 100
  },
  {
    title: '审核状态',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 120
  }
]

const pagination = {
  current: 1,
  pageSize: 10,
  total: 50,
  showSizeChanger: true,
  showQuickJumper: true
}

// 计算属性
const filteredApplications = computed(() => {
  let list = applicationList.value
  
  if (filters.value.status) {
    list = list.filter(item => item.status === filters.value.status)
  }
  
  if (filters.value.keyword) {
    list = list.filter(item => 
      item.projectName.includes(filters.value.keyword) ||
      item.projectCode.includes(filters.value.keyword)
    )
  }
  
  return list
})

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    'material_reviewing': 'orange',
    'meeting_preparing': 'blue',
    'meeting_scheduled': 'cyan',
    'opening_passed': 'green',
    'opening_conditional': 'gold',
    'opening_failed': 'red'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'material_reviewing': '材料审核中',
    'meeting_preparing': '会议待组织',
    'meeting_scheduled': '会议已安排',
    'opening_passed': '开题通过',
    'opening_conditional': '有条件通过',
    'opening_failed': '开题未通过'
  }
  return textMap[status] || '未知状态'
}

const getProgressPercent = (status) => {
  const percentMap = {
    'material_reviewing': 25,
    'meeting_preparing': 50,
    'meeting_scheduled': 75,
    'opening_passed': 100,
    'opening_conditional': 100,
    'opening_failed': 100
  }
  return percentMap[status] || 0
}

const getProgressStatus = (status) => {
  if (status === 'opening_failed') return 'exception'
  if (status === 'opening_passed' || status === 'opening_conditional') return 'success'
  return 'active'
}

const getProgressText = (status) => {
  const textMap = {
    'material_reviewing': '等待材料审核',
    'meeting_preparing': '等待安排会议',
    'meeting_scheduled': '等待会议召开',
    'opening_passed': '开题流程完成',
    'opening_conditional': '有条件通过开题',
    'opening_failed': '开题未通过'
  }
  return textMap[status] || ''
}

// 事件处理
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}

const handleBatchReview = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要审核的申请')
    return
  }
  batchReviewVisible.value = true
}

const handleFilterChange = () => {
  // 筛选变化处理
}

const handleSearch = () => {
  // 搜索处理
}

const handleReviewMaterial = (record) => {
  currentReview.value = record
  reviewModalVisible.value = true
}

const handleScheduleMeeting = (record) => {
  router.push(`/implementation/opening/meeting?projectId=${record.id}&action=schedule`)
}

const handleInputConclusion = (record) => {
  router.push(`/implementation/opening/meeting?projectId=${record.id}&action=conclusion`)
}

const handleViewDetail = (record) => {
  message.info('查看详情功能开发中')
}

const handleApprove = () => {
  message.success('材料审核通过')
  reviewModalVisible.value = false
}

const handleReject = () => {
  message.success('申请已驳回')
  reviewModalVisible.value = false
}

const handleBatchApprove = () => {
  const action = batchReviewForm.value.action === 'approve' ? '通过' : '驳回'
  message.success(`批量${action}成功`)
  batchReviewVisible.value = false
  selectedRowKeys.value = []
}

const handleViewAllTodo = () => {
  message.info('查看全部待办功能开发中')
}

const handleTodoAction = (item) => {
  message.info(`处理待办事项：${item.title}`)
}

const goToMeetingManagement = () => {
  router.push('/implementation/opening/meeting')
}

const previewMaterial = (material) => {
  message.info(`预览材料：${material.name}`)
}

const downloadMaterial = (material) => {
  message.info(`下载材料：${material.name}`)
}

const formatTime = (date) => {
  return date.toLocaleDateString()
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.opening-management-center {
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

/* 统计概览样式 */
.stats-overview {
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

.reviewing .stat-icon {
  background: linear-gradient(135deg, #1890ff, #096dd9);
}

.completed .stat-icon {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.rejected .stat-icon {
  background: linear-gradient(135deg, #ff4d4f, #cf1322);
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

/* 内容卡片样式 */
.content-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
}

.card-header h3 .anticon {
  margin-right: 8px;
  color: #1890ff;
}

.header-filters {
  display: flex;
  gap: 12px;
}

/* 待办事项样式 */
.todo-list {
  padding: 0 24px 24px;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-priority {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  margin-right: 12px;
}

.todo-priority.high {
  background: #ff4d4f;
}

.todo-priority.medium {
  background: #faad14;
}

.todo-priority.low {
  background: #52c41a;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.todo-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.empty-todo {
  text-align: center;
  padding: 24px;
  color: #8c8c8c;
}

/* 管理操作样式 */
.management-actions {
  padding: 0 24px 24px;
}

/* 审核列表样式 */
.review-list {
  padding: 0 24px 24px;
}

.project-info {
  line-height: 1.5;
}

.project-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.project-code {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 2px;
}

.project-leader {
  font-size: 12px;
  color: #8c8c8c;
}

.progress-info {
  line-height: 1.5;
}

.progress-text {
  margin-top: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

/* 弹窗样式 */
.review-modal {
  max-height: 60vh;
  overflow-y: auto;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.review-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.materials-review {
  margin: 24px 0;
}

.materials-review h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.review-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.batch-review {
  padding: 12px 0;
}

/* 流程说明样式 */
.flow-description {
  margin-bottom: 24px;
}

.flow-content {
  padding: 0 24px 24px;
}

.step-description {
  line-height: 1.5;
}

.step-status-tags {
  margin-top: 8px;
}
</style>
