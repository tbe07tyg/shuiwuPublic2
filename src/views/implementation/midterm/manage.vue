<!--
 * @file 中期申请管理页面 - 申报单位角色
 * @description 申报单位查看和管理自己提交的中期申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-23
-->
<template>
  <div class="midterm-application-manage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <FolderOutlined />
          </span>
          中期申请管理
        </h1>
        <p class="page-description">
          查看和管理您提交的项目中期申请
        </p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="goToSubmit">
          <PlusOutlined />
          提交新申请
        </a-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <a-row :gutter="24">
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card total">
            <div class="stat-icon">
              <FileTextOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">申请总数</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card pending">
            <div class="stat-icon">
              <ClockCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card approved">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.approved }}</div>
              <div class="stat-label">已通过</div>
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
              <div class="stat-label">被驳回</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 中期流程说明 -->
    <div class="content-card flow-description">
      <div class="card-header">
        <h3>
          <BulbOutlined />
          中期流程说明
        </h3>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </div>
      <div v-show="showFlowDescription" class="flow-content">
        <a-steps :current="3" size="small" direction="horizontal" status="finish">
          <a-step title="提交申请" description="准备中期检查报告等材料并提交申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员审核中期材料
                <div class="step-status-tags">
                  <a-tag color="orange" size="small">材料审核中</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="组织会议" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员组织中期检查会
                <div class="step-status-tags">
                  <a-tag color="blue" size="small">会议待组织</a-tag>
                  <a-tag color="cyan" size="small">会议已安排</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="中期结论" status="finish">
            <template #description>
              <div class="step-description">
                根据会议结果获得最终结论
                <div class="step-status-tags">
                  <a-tag color="green" size="small">中期通过</a-tag>
                  <a-tag color="orange" size="small">有条件通过</a-tag>
                  <a-tag color="red" size="small">中期未通过</a-tag>
                </div>
              </div>
            </template>
          </a-step>
        </a-steps>
      </div>
    </div>

    <!-- 申请列表 -->
    <div class="content-card">
      <div class="card-header">
        <h3>
          <UnorderedListOutlined />
          我的中期申请
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
            <a-select-option value="midterm_passed">中期通过</a-select-option>
            <a-select-option value="midterm_conditional">有条件通过</a-select-option>
            <a-select-option value="midterm_failed">中期未通过</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目名称"
            style="width: 200px"
            @search="handleSearch"
          />
        </div>
      </div>
      
      <div class="application-list">
        <a-table
          :columns="columns"
          :data-source="filteredApplications"
          :pagination="pagination"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'projectInfo'">
              <div class="project-info">
                <div class="project-name">{{ record.projectName }}</div>
                <div class="project-code">{{ record.projectCode }}</div>
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
                <div class="progress-text">{{ getProgressText(record.status, record) }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button 
                  v-if="record.status === 'material_reviewing' && record.materialRejected" 
                  type="primary" 
                  size="small" 
                  @click="handleResubmitMaterial(record)"
                >
                  重新提交
                </a-button>
                <a-button 
                  type="default" 
                  size="small" 
                  @click="handleViewDetail(record)"
                >
                  查看详情
                </a-button>
                <a-button 
                  v-if="canEdit(record)" 
                  type="link" 
                  size="small" 
                  @click="handleEdit(record)"
                >
                  编辑
                </a-button>
                <a-button 
                  v-if="canCancel(record)" 
                  type="link" 
                  size="small" 
                  danger 
                  @click="handleCancel(record)"
                >
                  撤销
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 中期申请管理页面
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  FolderOutlined,
  PlusOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  UnorderedListOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 统计数据
const stats = ref({
  total: 8,
  pending: 2,
  approved: 5,
  rejected: 1
})

// 流程说明显示状态
const showFlowDescription = ref(true)

// 筛选条件
const filters = ref({
  status: '',
  keyword: ''
})

// 表格列配置
const columns = [
  {
    title: '项目信息',
    key: 'projectInfo',
    width: 250
  },
  {
    title: '申请时间',
    dataIndex: 'submitTime',
    key: 'submitTime',
    width: 120
  },
  {
    title: '当前状态',
    key: 'status',
    width: 120
  },
  {
    title: '审核进度',
    key: 'progress',
    width: 200
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right'
  }
]

// 模拟数据
const applications = ref([
  {
    id: 1,
    projectName: '智能水资源监测系统开发',
    projectCode: 'HS2024001',
    submitTime: '2024-06-15',
    status: 'midterm_passed',
    materialRejected: false,
    meetingDate: '2024-07-20',
    conclusion: '中期通过'
  },
  {
    id: 2,
    projectName: '河流生态修复技术研究',
    projectCode: 'HS2024002',
    submitTime: '2024-07-10',
    status: 'meeting_scheduled',
    materialRejected: false,
    meetingDate: '2024-08-15',
    conclusion: ''
  }
])

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 计算属性 - 过滤后的申请列表
const filteredApplications = computed(() => {
  let result = applications.value
  
  if (filters.value.status) {
    result = result.filter(item => item.status === filters.value.status)
  }
  
  if (filters.value.keyword) {
    result = result.filter(item => 
      item.projectName.includes(filters.value.keyword) ||
      item.projectCode.includes(filters.value.keyword)
    )
  }
  
  pagination.value.total = result.length
  return result
})

// 方法定义
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}

const goToSubmit = () => {
  router.push('/midterm/application/submit')
}

const handleFilterChange = () => {
  pagination.value.current = 1
}

const handleSearch = () => {
  pagination.value.current = 1
}

const getStatusColor = (status) => {
  const colorMap = {
    'material_reviewing': 'orange',
    'meeting_preparing': 'blue',
    'meeting_scheduled': 'cyan',
    'midterm_passed': 'green',
    'midterm_conditional': 'orange',
    'midterm_failed': 'red'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'material_reviewing': '材料审核中',
    'meeting_preparing': '会议待组织',
    'meeting_scheduled': '会议已安排',
    'midterm_passed': '中期通过',
    'midterm_conditional': '有条件通过',
    'midterm_failed': '中期未通过'
  }
  return textMap[status] || '未知状态'
}

const getProgressPercent = (status) => {
  const percentMap = {
    'material_reviewing': 25,
    'meeting_preparing': 50,
    'meeting_scheduled': 75,
    'midterm_passed': 100,
    'midterm_conditional': 100,
    'midterm_failed': 100
  }
  return percentMap[status] || 0
}

const getProgressStatus = (status) => {
  if (['midterm_passed'].includes(status)) return 'success'
  if (['midterm_failed'].includes(status)) return 'exception'
  return 'active'
}

const getProgressText = (status, record) => {
  const textMap = {
    'material_reviewing': '正在审核中期材料',
    'meeting_preparing': '材料审核通过，待安排会议',
    'meeting_scheduled': `中期会议已安排：${record.meetingDate}`,
    'midterm_passed': '中期已通过',
    'midterm_conditional': '有条件通过中期',
    'midterm_failed': '中期未通过'
  }
  return textMap[status] || ''
}

const canEdit = (record) => {
  return ['material_reviewing'].includes(record.status)
}

const canCancel = (record) => {
  return ['material_reviewing', 'meeting_preparing'].includes(record.status)
}

const handleResubmitMaterial = (record) => {
  router.push(`/implementation/midterm/Submit?type=resubmit&rejectionReason=${encodeURIComponent(record.rejectionInfo?.rejectionReason || '')}`)
}

const handleSubmitImprovement = (record) => {
  let improvementRequirements = ''
  if (record.conclusion && record.conclusion.requirements) {
    improvementRequirements = record.conclusion.requirements
  }
  
  router.push(`/implementation/midterm/Submit?type=improvement&improvementRequirements=${encodeURIComponent(improvementRequirements)}`)
}

const handleViewDetail = (record) => {
  router.push(`/midterm/application/detail/${record.id}`)
}

const handleEdit = (record) => {
  router.push(`/midterm/application/edit/${record.id}`)
}

const handleCancel = (record) => {
  message.success('申请已撤销')
}

onMounted(() => {
  pagination.value.total = applications.value.length
})
</script>

<style scoped>
.midterm-application-manage {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

/* 其他样式与开题申请管理页面相同 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 12px;
  color: #1890ff;
}

.page-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-overview {
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.approved .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.rejected .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.content-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-filters {
  display: flex;
  gap: 12px;
}

.flow-content {
  padding: 20px 24px 24px;
}

.step-description {
  margin-top: 4px;
}

.step-status-tags {
  margin-top: 8px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.application-list {
  padding: 0 24px 24px;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
  color: #1a1a1a;
}

.project-code {
  font-size: 12px;
  color: #666;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-text {
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .midterm-application-manage {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-filters {
    flex-direction: column;
    width: 100%;
  }
  
  .stats-overview :deep(.ant-col) {
    margin-bottom: 16px;
  }
}
</style>


