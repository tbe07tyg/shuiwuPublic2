<!--
 * @file 立项申请管理页面 - 申报单位角色
 * @description 申报单位查看和管理自己提交的立项申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 * @reference 严格遵循《页面统一风格设计规范.md》进行页面结构和样式优化
-->
<template>
  <div class="applicant-manage-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">立项申请管理</h1>
        <p class="page-description">查看和管理您提交的项目立项申请</p>
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
      <a-row :gutter="16">
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card pending" @click="handleStatCardClick('material_reviewing')">
            <div class="stat-icon">
              <FileTextOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.materialReviewing }}</div>
              <div class="stat-label">材料审核中</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card reviewing" @click="handleStatCardClick('meeting_preparing')">
            <div class="stat-icon">
              <CalendarOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.meetingPreparing }}</div>
              <div class="stat-label">会议待组织</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card scheduled" @click="handleStatCardClick('meeting_scheduled')">
            <div class="stat-icon">
              <ClockCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.meetingScheduled }}</div>
              <div class="stat-label">会议已安排</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card completed" @click="handleStatCardClick('acceptance_passed')">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.approvalPassed }}</div>
              <div class="stat-label">立项通过</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card conditional" @click="handleStatCardClick('acceptance_conditional')">
            <div class="stat-icon">
              <BulbOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.approvalConditional }}</div>
              <div class="stat-label">有条件通过</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card rejected" @click="handleStatCardClick('acceptance_failed')">
            <div class="stat-icon">
              <CloseCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.approvalFailed }}</div>
              <div class="stat-label">立项未通过</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 立项流程说明 -->
    <a-card class="flow-description" title="立项流程说明" :bordered="false">
      <template #extra>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </template>
      <div v-show="showFlowDescription" class="flow-content">
        <a-steps :current="3" size="small" direction="horizontal" status="finish">
          <a-step title="提交申请" description="准备材料并提交立项申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员审核立项材料
                <div class="step-status-tags">
                  <a-tag color="orange" size="small">材料审核中</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="组织会议" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员组织立项会议
                <div class="step-status-tags">
                  <a-tag color="blue" size="small">会议待组织</a-tag>
                  <a-tag color="cyan" size="small">会议已安排</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="立项结论" status="finish">
            <template #description>
              <div class="step-description">
                根据会议结果获得最终结论
                <div class="step-status-tags">
                  <a-tag color="green" size="small">立项通过</a-tag>
                  <a-tag color="orange" size="small">有条件通过</a-tag>
                  <a-tag color="red" size="small">立项未通过</a-tag>
                </div>
              </div>
            </template>
          </a-step>
        </a-steps>
      </div>
    </a-card>

    <!-- 申请列表 -->
    <a-card :bordered="false">
      <template #title>
        <div class="card-title-with-total">
          <span>我的立项申请</span>
          <a-badge :count="stats.total" :number-style="{ backgroundColor: '#1890ff' }" />
        </div>
      </template>
      <template #extra>
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
            <a-select-option value="approval_passed">立项通过</a-select-option>
            <a-select-option value="approval_conditional">有条件通过</a-select-option>
            <a-select-option value="approval_failed">立项未通过</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="搜索项目名称"
            style="width: 200px"
            @search="handleSearch"
          />
        </div>
      </template>
      <a-table
        :columns="columns"
        :data-source="filteredApplications"
        :pagination="pagination"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
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
                重新提交材料
              </a-button>
              <a-button 
                v-if="record.status === 'approval_conditional'" 
                type="primary" 
                size="small" 
                @click="handleSubmitImprovement(record)"
              >
                提交整改材料
              </a-button>
              <a-button 
                v-if="record.status === 'approval_failed'" 
                type="primary" 
                size="small" 
                @click="handleResubmit(record)"
              >
                重新提交申请
              </a-button>

              <a-button 
                v-if="record.status === 'material_reviewing' && record.materialRejected" 
                size="small" 
                @click="handleViewRejectionDetails(record)"
              >
                查看驳回原因
              </a-button>
              <a-button 
                v-if="['approval_passed', 'approval_conditional', 'approval_failed'].includes(record.status)" 
                size="small" 
                @click="handleViewDetails(record)"
              >
                查看详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 查看详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="立项申请详情"
      width="800px"
      :footer="null"
      @cancel="handleDetailCancel"
    >
      <div v-if="selectedApplication" class="detail-modal">
        <!-- 项目基本信息 -->
        <div class="detail-section">
          <h4><FileSearchOutlined /> 项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="年度">
              {{ selectedApplication.year }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedApplication.projectCode }}
            </a-descriptions-item>
            <a-descriptions-item label="立项名称" :span="2">
              {{ selectedApplication.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="申请人">
              {{ selectedApplication.applicant }}
            </a-descriptions-item>
            <a-descriptions-item label="申请单位">
              {{ selectedApplication.department }}
            </a-descriptions-item>
            <a-descriptions-item label="项目周期(月)">
              {{ selectedApplication.duration }}个月
            </a-descriptions-item>
            <a-descriptions-item label="预算(万元)">
              {{ selectedApplication.budget }}万元
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ selectedApplication.submitTime }}
            </a-descriptions-item>
            <a-descriptions-item label="当前状态">
              <a-tag :color="getStatusColor(selectedApplication.status)">
                {{ getStatusText(selectedApplication.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="项目描述" :span="2">
              {{ selectedApplication.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 会议信息 -->
        <div class="detail-section" v-if="selectedApplication.meetingInfo">
          <h4><CalendarOutlined /> 会议信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="会议时间">
              {{ selectedApplication.meetingInfo.time }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedApplication.meetingInfo.location }}
            </a-descriptions-item>
            <a-descriptions-item label="会议形式" :span="2">
              {{ selectedApplication.meetingInfo.type === 'offline' ? '现场会议' : selectedApplication.meetingInfo.type === 'online' ? '线上会议' : '混合会议' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议说明" :span="2" v-if="selectedApplication.meetingInfo.description">
              {{ selectedApplication.meetingInfo.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 立项结论 -->
        <div class="detail-section" v-if="selectedApplication.conclusion">
          <h4><AuditOutlined /> 立项结论</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="立项结果">
              <a-tag :color="selectedApplication.conclusion.result === 'passed' ? 'green' : selectedApplication.conclusion.result === 'failed' ? 'red' : 'orange'">
                {{ selectedApplication.conclusion.result === 'passed' ? '立项通过' : selectedApplication.conclusion.result === 'failed' ? '立项未通过' : '有条件通过' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="结论时间">
              {{ selectedApplication.conclusion.time }}
            </a-descriptions-item>
            <a-descriptions-item label="评分" v-if="selectedApplication.conclusion.score">
              <span :style="{ color: selectedApplication.conclusion.score >= 90 ? '#52c41a' : selectedApplication.conclusion.score >= 80 ? '#fa8c16' : '#ff4d4f' }">
                {{ selectedApplication.conclusion.score }}分
              </span>
            </a-descriptions-item>
            <a-descriptions-item label="结论说明" :span="2">
              {{ selectedApplication.conclusion.description }}
            </a-descriptions-item>
            <a-descriptions-item label="整改要求" :span="2" v-if="selectedApplication.conclusion.requirements">
              <div class="requirements-text">
                {{ selectedApplication.conclusion.requirements }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 驳回信息 -->
        <div class="detail-section" v-if="selectedApplication.rejectionInfo">
          <h4><ExclamationCircleOutlined /> 驳回信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="驳回时间">
              {{ selectedApplication.rejectionInfo.time }}
            </a-descriptions-item>
            <a-descriptions-item label="审核人员">
              {{ selectedApplication.rejectionInfo.reviewer }}
            </a-descriptions-item>
            <a-descriptions-item label="审核意见" :span="2">
              {{ selectedApplication.rejectionInfo.comments }}
            </a-descriptions-item>
            <a-descriptions-item label="驳回原因" :span="2">
              <div class="rejection-reason">
                {{ selectedApplication.rejectionInfo.rejectionReason }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 验收申请管理页面 - 申报单位角色
 * 
 * 本页面严格遵循《页面统一风格设计规范.md》中的规范要求：
 * 1. 使用PageContainer作为页面最外层容器
 * 2. 提供title和description作为PageContainer的属性
 * 3. 将主要操作按钮放在actions插槽中
 * 4. 内容区域使用统一的灰色背景
 * 5. 卡片内容区域置于灰色背景之上
 * 6. 统一使用Ant Design Vue组件和全局样式
 */
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'

import {
  PlusOutlined,
  FolderOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  FileSearchOutlined,
  AuditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 统计数据 - 基于申请列表动态计算
const stats = computed(() => {
  const total = applications.value.length
  const materialReviewing = applications.value.filter(app => 
    app.status === 'material_reviewing'
  ).length
  const meetingPreparing = applications.value.filter(app => 
    app.status === 'meeting_preparing'
  ).length
  const meetingScheduled = applications.value.filter(app => 
    app.status === 'meeting_scheduled'
  ).length
  const approvalPassed = applications.value.filter(app => 
    app.status === 'approval_passed'
  ).length
  const approvalConditional = applications.value.filter(app => 
    app.status === 'approval_conditional'
  ).length
  const approvalFailed = applications.value.filter(app => 
    app.status === 'approval_failed'
  ).length
  
  return {
    total,
    materialReviewing,
    meetingPreparing,
    meetingScheduled,
    approvalPassed,
    approvalConditional,
    approvalFailed
  }
})

// 筛选条件
const filters = ref({
  status: '',
  keyword: ''
})

// 流程说明显示状态
const showFlowDescription = ref(false)

// 详情弹窗状态
const detailModalVisible = ref(false)
const selectedApplication = ref(null)

// 申请列表数据
const applications = ref([
  {
    id: 1,
    year: '2024',
    projectName: '智慧城市大数据平台建设项目',
    applicant: '王五',
    department: '技术部',
    duration: 18,
    budget: 200,
    submitTime: '2024-01-15',
    status: 'material_reviewing',
    projectCode: 'PROJ-2024-001',
    expectedTime: '2024-03-15',
    description: '构建城市级大数据分析平台，支持多源数据接入和实时分析',
    // 模拟材料审核被驳回的情况
    materialRejected: true,
    rejectionInfo: {
      time: '2024-01-18',
      reviewer: '张审核员',
      comments: '材料基本符合要求，但需要完善部分内容。',
      rejectionReason: '1. 项目申请书中缺少详细的技术指标；2. 技术方案需要补充系统架构图；3. 请提供预算明细表。'
    }
  },
  {
    id: 2,
    year: '2024',
    projectName: '区块链供应链金融平台',
    applicant: '赵六',
    department: '工程部',
    duration: 12,
    budget: 150,
    submitTime: '2024-01-20',
    status: 'meeting_preparing',
    projectCode: 'PROJ-2024-002',
    expectedTime: '2024-03-20',
    description: '基于区块链技术的供应链金融解决方案'
  },
  {
    id: 3,
    year: '2024',
    projectName: '物联网环境监测系统',
    applicant: '李明',
    department: '自动化部',
    duration: 24,
    budget: 180,
    submitTime: '2024-01-12',
    status: 'meeting_scheduled',
    projectCode: 'PROJ-2024-003',
    expectedTime: '2024-03-12',
    description: '部署IoT传感器网络，实现环境数据实时监控',
    meetingInfo: {
      time: '2024-01-25 14:00',
      location: '会议室A301',
      type: 'offline',
      description: '项目立项会议，重点评审环境监测系统的技术实现'
    }
  },
  {
    id: 4,
    year: '2024',
    projectName: '电子商务数据分析系统',
    applicant: '王强',
    department: '信息部',
    duration: 15,
    budget: 220,
    submitTime: '2024-01-08',
    status: 'approval_passed',
    projectCode: 'PROJ-2024-004',
    expectedTime: '2024-03-08',
    description: '数据分析系统开发完成，功能完善',
    conclusion: {
      result: 'passed',
      score: 92,
      time: '2024-01-22',
      description: '项目立项通过，系统功能完整，技术指标达标。',
      feedback: '项目立项通过，技术方案可行，预算合理。'
    }
  },
  {
    id: 5,
    year: '2024',
    projectName: '在线教育管理平台',
    applicant: '张华',
    department: '教育部',
    duration: 20,
    budget: 160,
    submitTime: '2024-01-03',
    status: 'approval_conditional',
    projectCode: 'PROJ-2024-005',
    expectedTime: '2024-03-03',
    description: '在线教育管理平台开发',
    conclusion: {
      result: 'conditional_passed',
      score: 82,
      time: '2024-01-21',
      description: '项目基本达到立项要求，有条件通过立项。',
      requirements: '1. 完善数据备份机制；2. 优化系统界面布局；3. 30天内提交整改确认。',
      feedback: '项目基本达到立项要求，有条件通过立项。需要在指定时间内完成整改要求。'
    },
    improvementSubmitted: false
  },
  {
    id: 6,
    year: '2024',
    projectName: '移动办公应用系统',
    applicant: '刘涛',
    department: '移动部',
    duration: 14,
    budget: 130,
    submitTime: '2024-01-05',
    status: 'approval_failed',
    projectCode: 'PROJ-2024-006',
    expectedTime: '2024-03-05',
    description: '移动办公应用系统开发',
    conclusion: {
      result: 'failed',
      score: 68,
      time: '2024-01-20',
      description: '项目立项未通过，系统稳定性有待提升，需要完善相关功能。',
      requirements: '1. 优化系统性能；2. 完善用户界面；3. 补充测试文档。',
      feedback: '项目立项未通过，系统稳定性有待提升，需要完善相关功能。建议重新修改方案后再次申请。'
    }
  }
])

// 表格列配置
const columns = [
  {
    title: '年度',
    dataIndex: 'year',
    width: 80
  },
  {
    title: '立项名称',
    dataIndex: 'projectName',
    width: 220,
    ellipsis: true
  },
  {
    title: '申请人',
    dataIndex: 'applicant',
    width: 100
  },
  {
    title: '申请单位',
    dataIndex: 'department',
    width: 140,
    ellipsis: true
  },
  {
    title: '项目周期(月)',
    dataIndex: 'duration',
    width: 120
  },
  {
    title: '预算(万元)',
    dataIndex: 'budget',
    width: 110
  },
  {
    title: '申请时间',
    dataIndex: 'submitTime',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    fixed: 'right'
  }
]

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`
})

/**
 * 计算属性：过滤后的申请列表
 * @returns {Array} 过滤后的申请列表
 */
const filteredApplications = computed(() => {
  let result = applications.value
  
  if (filters.value.status) {
    result = result.filter(app => app.status === filters.value.status)
  }
  
  if (filters.value.keyword) {
    result = result.filter(app => 
      app.projectName.includes(filters.value.keyword) ||
      app.projectCode.includes(filters.value.keyword)
    )
  }
  
  pagination.value.total = result.length
  return result
})

/**
 * 获取状态对应的颜色
 * @param {string} status 状态标识
 * @returns {string} 颜色代码
 */
const getStatusColor = (status) => {
  const colorMap = {
    material_reviewing: 'orange',
    meeting_preparing: 'blue',
    meeting_scheduled: 'cyan',
    approval_passed: 'green',
    approval_conditional: 'orange',
    approval_failed: 'red'
  }
  return colorMap[status] || 'default'
}

/**
 * 获取状态对应的文本
 * @param {string} status 状态标识
 * @returns {string} 状态文本
 */
const getStatusText = (status) => {
  const textMap = {
    material_reviewing: '材料审核中',
    meeting_preparing: '会议待组织',
    meeting_scheduled: '会议已安排',
    approval_passed: '立项通过',
    approval_conditional: '有条件通过',
    approval_failed: '立项未通过'
  }
  return textMap[status] || '未知'
}

/**
 * 获取进度百分比
 * @param {string} status 状态标识
 * @returns {number} 进度百分比
 */
const getProgressPercent = (status) => {
  const percentMap = {
    material_reviewing: 35,
    meeting_preparing: 60,
    meeting_scheduled: 80,
    approval_passed: 100,
    approval_conditional: 95,
    approval_failed: 100
  }
  return percentMap[status] || 0
}

/**
 * 获取进度状态
 * @param {string} status 状态标识
 * @returns {string} 进度状态
 */
const getProgressStatus = (status) => {
  if (status === 'approval_failed') return 'exception'
  if (status === 'approval_passed') return 'success'
  if (status === 'approval_conditional') return 'active'
  return 'active'
}

/**
 * 获取进度文本
 * @param {string} status 状态标识
 * @param {Object} record 记录对象
 * @returns {string} 进度文本
 */
const getProgressText = (status, record = null) => {
  // 特殊处理材料被驳回的情况
  if (status === 'material_reviewing' && record?.materialRejected) {
    return '材料需要重新提交'
  }
  
  const textMap = {
    material_reviewing: '材料审核中',
    meeting_preparing: '会议待组织',
    meeting_scheduled: '等待参加会议',
    approval_passed: '立项通过',
    approval_conditional: '待提交整改材料',
    approval_failed: '立项未通过'
  }
  return textMap[status] || '未知阶段'
}



// 事件处理方法
const goToSubmit = () => {
          router.push('/implementation/approval?tab=application-submit')
}

/**
 * 筛选变更处理
 */
const handleFilterChange = () => {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

/**
 * 重新提交材料
 * @param {Object} record 申请记录
 */
const handleResubmit = (record) => {
  message.info(`重新提交申请：${record.projectName}`)
  
  // 提取审核意见
  let reviewComments = ''
  if (record.reviewComments && record.reviewComments.length > 0) {
    reviewComments = record.reviewComments.map(comment => 
      `【${comment.reviewer} - ${comment.time}】：${comment.content}`
    ).join('\n')
  }
  
  // 跳转到提交页面，并传递项目信息用于自动填充
  router.push({
    path: '/approval/applicant/submit',
    query: {
      resubmit: 'true',
      projectId: record.id,
      projectName: encodeURIComponent(record.projectName),
      projectCode: record.projectCode,
      expectedTime: record.expectedTime,
      description: encodeURIComponent(record.description),
      reviewComments: encodeURIComponent(reviewComments)
    }
  })
}

/**
 * 查看详情
 * @param {Object} record 申请记录
 */
const handleViewDetails = (record) => {
  selectedApplication.value = record
  detailModalVisible.value = true
}

/**
 * 关闭详情弹窗
 */
const handleDetailCancel = () => {
  detailModalVisible.value = false
  selectedApplication.value = null
}

/**
 * 重新提交材料
 * @param {Object} record 申请记录
 */
const handleResubmitMaterial = (record) => {
  router.push({
    path: '/approval/applicant/submit',
    query: {
      resubmit: 'true',
      projectId: record.id,
      projectName: encodeURIComponent(record.projectName),
      projectCode: record.projectCode,
      expectedTime: record.expectedTime,
      description: encodeURIComponent(record.description),
      rejectionReason: encodeURIComponent(record.rejectionInfo?.rejectionReason || '')
    }
  })
}

/**
 * 查看驳回原因详情
 * @param {Object} record 申请记录
 */
const handleViewRejectionDetails = (record) => {
  const rejectionInfo = record.rejectionInfo
  if (!rejectionInfo) {
    message.warning('暂无驳回信息')
    return
  }
  
  // 创建驳回详情内容
  const content = `
    <div style="line-height: 1.6;">
      <div style="margin-bottom: 16px;">
        <strong>驳回时间：</strong>${rejectionInfo.time}
      </div>
      <div style="margin-bottom: 16px;">
        <strong>审核人员：</strong>${rejectionInfo.reviewer}
      </div>
      <div style="margin-bottom: 16px;">
        <strong>审核意见：</strong>
        <div style="margin-top: 8px; padding: 12px; background: #f5f5f5; border-radius: 6px;">
          ${rejectionInfo.comments}
        </div>
      </div>
      <div style="margin-bottom: 16px;">
        <strong>具体要求：</strong>
        <div style="margin-top: 8px; padding: 12px; background: #fff2f0; border: 1px solid #ffccc7; border-radius: 6px; white-space: pre-line;">
          ${rejectionInfo.rejectionReason}
        </div>
      </div>
      <div style="margin-top: 16px; padding: 12px; background: #e6f7ff; border-radius: 6px;">
        <div style="color: #1890ff; font-weight: 500;">💡 温馨提示</div>
        <div style="margin-top: 4px; color: #666;">请根据上述要求修改和补充材料后重新提交，如有疑问可联系审核人员。</div>
      </div>
    </div>
  `
  
  // 显示驳回原因详情弹窗
  Modal.info({
    title: '材料审核驳回详情',
    width: 600,
    content: content,
    okText: '我知道了'
  })
}

const handleSubmitImprovement = (record) => {
  message.info(`提交整改材料：${record.projectName}`)
  
  // 提取整改要求
  let improvementRequirements = ''
  if (record.conclusion && record.conclusion.requirements) {
    improvementRequirements = record.conclusion.requirements
  }
  
  // 跳转到提交页面，并传递项目信息用于自动填充
  router.push({
    path: '/approval/applicant/submit',
    query: {
      improvement: 'true',
      projectId: record.id,
      projectName: encodeURIComponent(record.projectName),
      projectCode: record.projectCode,
      expectedTime: record.expectedTime,
      description: encodeURIComponent(record.description),
      improvementRequirements: encodeURIComponent(improvementRequirements)
    }
  })
}



// 切换流程说明显示状态
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}

// 处理统计卡片点击筛选
const handleStatCardClick = (filterType) => {
  // 清除关键词筛选
  filters.value.keyword = ''
  
  // 直接设置状态筛选
  filters.value.status = filterType
}



// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
/* 遵循《页面统一风格设计规范.md》中的样式规范 */

.applicant-manage-container {
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

/* 统计卡片区域样式 */
.stats-overview {
  margin-bottom: 16px;
}

/* 统计卡片可点击样式 */
.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  user-select: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: rgba(35, 79, 162, 0.2);
}

.stat-card:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 统计卡片样式 - 与管理中心保持一致 */
.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: rgba(35, 79, 162, 0.2);
}

.stat-card:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.pending:hover {
  background: linear-gradient(135deg, #fff7e6 0%, #fff2e6 100%);
}

.stat-card.reviewing:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.stat-card.scheduled:hover {
  background: linear-gradient(135deg, #e6fffb 0%, #b5f5ec 100%);
}

.stat-card.completed:hover {
  background: linear-gradient(135deg, #f6ffed 0%, #efffef 100%);
}

.stat-card.conditional:hover {
  background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
}

.stat-card.rejected:hover {
  background: linear-gradient(135deg, #fff2f0 0%, #fff1f0 100%);
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

.stat-card.reviewing .stat-icon {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-card.scheduled .stat-icon {
  background: #e6fffb;
  color: #13c2c2;
}

.stat-card.completed .stat-icon {
  background: #f6ffed;
  color: #52c41a;
}

.stat-card.conditional .stat-icon {
  background: #fffbe6;
  color: #faad14;
}

.stat-card.rejected .stat-icon {
  background: #fff2f0;
  color: #ff4d4f;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

/* 卡片标题样式 */
.card-title-with-total {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title-with-total span {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

/* 流程说明样式 */
.flow-description {
  margin-bottom: 16px;
}

.flow-content {
  padding: 8px 0;
}

/* 筛选区域样式 */
.header-filters {
  display: flex;
  gap: 12px;
}

/* 步骤描述样式 */
.step-description {
  text-align: center;
}

.step-status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
  justify-content: center;
}

.step-status-tags .ant-tag {
  margin: 0;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 项目信息样式 */
.project-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
  color: #262626;
}

.project-code {
  font-size: 12px;
  color: #8c8c8c;
}

/* 进度信息样式 */
.progress-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #8c8c8c;
}

/* 详情弹窗样式 */
.detail-modal {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin-bottom: 16px;
  color: #262626;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.detail-section h4 .anticon {
  margin-right: 8px;
  color: #1890ff;
}

.requirements-text {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  padding: 12px;
  white-space: pre-line;
  line-height: 1.6;
}

.rejection-reason {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  padding: 12px;
  white-space: pre-line;
  line-height: 1.6;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .header-filters {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 