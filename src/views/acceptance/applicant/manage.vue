<!--
 * @file 验收申请管理页面 - 申报单位角色
 * @description 申报单位查看和管理自己提交的验收申请
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
        <h1 class="page-title">验收申请管理</h1>
        <p class="page-description">查看和管理您提交的项目验收申请</p>
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
              <div class="stat-number">{{ stats.acceptancePassed }}</div>
              <div class="stat-label">验收通过</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card conditional" @click="handleStatCardClick('acceptance_conditional')">
            <div class="stat-icon">
              <BulbOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.acceptanceConditional }}</div>
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
              <div class="stat-number">{{ stats.acceptanceFailed }}</div>
              <div class="stat-label">验收未通过</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 验收流程说明 -->
    <a-card class="flow-description" title="验收流程说明" :bordered="false">
      <template #extra>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </template>
      <div v-show="showFlowDescription" class="flow-content">
        <a-steps :current="3" size="small" direction="horizontal" status="finish">
          <a-step title="提交申请" description="准备材料并提交验收申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员审核验收材料
                <div class="step-status-tags">
                  <a-tag color="orange" size="small">材料审核中</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="组织会议" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员组织验收会议
                <div class="step-status-tags">
                  <a-tag color="blue" size="small">会议待组织</a-tag>
                  <a-tag color="cyan" size="small">会议已安排</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="验收结论" status="finish">
            <template #description>
              <div class="step-description">
                根据会议结果获得最终结论
                <div class="step-status-tags">
                  <a-tag color="green" size="small">验收通过</a-tag>
                  <a-tag color="orange" size="small">有条件通过</a-tag>
                  <a-tag color="red" size="small">验收未通过</a-tag>
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
          <span>我的验收申请</span>
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
            <a-select-option value="acceptance_passed">验收通过</a-select-option>
            <a-select-option value="acceptance_conditional">有条件通过</a-select-option>
            <a-select-option value="acceptance_failed">验收未通过</a-select-option>
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
                重新提交材料
              </a-button>
              <a-button 
                v-if="record.status === 'acceptance_conditional'" 
                type="primary" 
                size="small" 
                @click="handleSubmitImprovement(record)"
              >
                提交整改材料
              </a-button>
              <a-button 
                v-if="record.status === 'acceptance_failed'" 
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
                v-if="['acceptance_passed', 'acceptance_conditional', 'acceptance_failed'].includes(record.status)" 
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
      title="验收申请详情"
      width="800px"
      :footer="null"
      @cancel="handleDetailCancel"
    >
      <div v-if="selectedApplication" class="detail-modal">
        <!-- 项目基本信息 -->
        <div class="detail-section">
          <h4><FileSearchOutlined /> 项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目编号">
              {{ selectedApplication.projectCode }}
            </a-descriptions-item>
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedApplication.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ selectedApplication.submitTime }}
            </a-descriptions-item>
            <a-descriptions-item label="预期验收时间">
              {{ selectedApplication.expectedTime }}
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

        <!-- 提交材料 -->
        <div class="detail-section" v-if="selectedApplication.materials && selectedApplication.materials.length > 0">
          <h4><FileOutlined /> 提交材料</h4>
          <div class="materials-list">
            <div class="material-item" v-for="material in selectedApplication.materials" :key="material.id">
              <div class="material-info">
                <div class="material-name">{{ material.name }}</div>
                <div class="material-type">{{ material.type }}</div>
              </div>
              <a-space>
                <a-button size="small" type="text" @click="handlePreviewMaterial(material)">
                  <EyeOutlined /> 预览
                </a-button>
                <a-button size="small" type="text" @click="handleDownloadMaterial(material)">
                  <DownloadOutlined /> 下载
                </a-button>
              </a-space>
            </div>
          </div>
        </div>

        <!-- 验收结论 -->
        <div class="detail-section" v-if="selectedApplication.finalResult">
          <h4><AuditOutlined /> 验收结论</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="验收结果">
              <a-tag :color="selectedApplication.finalResult.conclusion === 'passed' ? 'green' : selectedApplication.finalResult.conclusion === 'failed' ? 'red' : 'orange'">
                {{ selectedApplication.finalResult.conclusion === 'passed' ? '验收通过' : selectedApplication.finalResult.conclusion === 'failed' ? '验收未通过' : '有条件通过' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="结论时间">
              {{ selectedApplication.finalResult.time }}
            </a-descriptions-item>
            <a-descriptions-item label="评分" v-if="selectedApplication.finalResult.score">
              <span :style="{ color: selectedApplication.finalResult.score >= 90 ? '#52c41a' : selectedApplication.finalResult.score >= 80 ? '#fa8c16' : '#ff4d4f' }">
                {{ selectedApplication.finalResult.score }}分
              </span>
            </a-descriptions-item>
            <a-descriptions-item label="结论说明" :span="2">
              {{ selectedApplication.finalResult.description }}
            </a-descriptions-item>
            <a-descriptions-item label="整改要求" :span="2" v-if="selectedApplication.finalResult.requirements">
              <div class="requirements-text">
                {{ selectedApplication.finalResult.requirements }}
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
  ExclamationCircleOutlined,
  FileOutlined,
  EyeOutlined,
  DownloadOutlined
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
  const acceptancePassed = applications.value.filter(app => 
    app.status === 'acceptance_passed'
  ).length
  const acceptanceConditional = applications.value.filter(app => 
    app.status === 'acceptance_conditional'
  ).length
  const acceptanceFailed = applications.value.filter(app => 
    app.status === 'acceptance_failed'
  ).length
  
  return {
    total,
    materialReviewing,
    meetingPreparing,
    meetingScheduled,
    acceptancePassed,
    acceptanceConditional,
    acceptanceFailed
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
    projectName: '智慧城市大数据平台建设项目',
    projectCode: 'PROJ-2024-001',
    status: 'material_reviewing',
    submitTime: '2024-01-15',
    expectedTime: '2024-03-15',
    description: '构建城市级大数据分析平台，支持多源数据接入和实时分析',
    materials: [
      { id: 1, name: '项目验收报告.pdf', type: '验收报告' },
      { id: 2, name: '技术文档.docx', type: '技术文档' }
    ],
    // 模拟材料审核被驳回的情况
    materialRejected: true,
    rejectionInfo: {
      time: '2024-01-18',
      reviewer: '张审核员',
      comments: '材料基本符合要求，但需要完善部分内容。',
      rejectionReason: '1. 项目验收报告中缺少详细的测试数据和性能指标；2. 技术文档需要补充系统架构图和数据库设计说明；3. 请提供用户手册和部署指南。'
    }
  },
  {
    id: 2,
    projectName: '区块链供应链金融平台',
    projectCode: 'PROJ-2024-002',
    status: 'meeting_preparing',
    submitTime: '2024-01-20',
    expectedTime: '2024-03-20',
    description: '基于区块链技术的供应链金融解决方案',
    materials: [
      { id: 3, name: '项目验收报告.pdf', type: '验收报告' }
    ]
  },
  {
    id: 3,
    projectName: '物联网环境监测系统',
    projectCode: 'PROJ-2024-003',
    status: 'meeting_scheduled',
    submitTime: '2024-01-12',
    expectedTime: '2024-03-12',
    description: '部署IoT传感器网络，实现环境数据实时监控',
    materials: [
      { id: 4, name: '项目验收报告.pdf', type: '验收报告' },
      { id: 5, name: '系统部署文档.pdf', type: '部署文档' }
    ]
  },
  {
    id: 4,
    projectName: '电子商务数据分析系统',
    projectCode: 'PROJ-2024-004',
    status: 'acceptance_passed',
    submitTime: '2024-01-08',
    expectedTime: '2024-03-08',
    description: '数据分析系统开发完成，功能完善',
    materials: [
      { id: 6, name: '项目验收报告.pdf', type: '验收报告' }
    ],
    finalResult: {
      conclusion: 'passed',
      score: 92,
      time: '2024-01-22',
      description: '项目验收通过，系统功能完整，技术指标达标。'
    }
  },
  {
    id: 5,
    projectName: '在线教育管理平台',
    projectCode: 'PROJ-2024-005',
    status: 'acceptance_conditional',
    submitTime: '2024-01-03',
    expectedTime: '2024-03-03',
    description: '在线教育平台核心功能已完成，正在完善细节功能',
    materials: [
      { id: 7, name: '项目验收报告.pdf', type: '验收报告' },
      { id: 8, name: '用户操作手册.pdf', type: '用户手册' }
    ],
    finalResult: {
      conclusion: 'conditional_passed',
      score: 82,
      time: '2024-01-21',
      description: '项目基本达到验收要求，有条件通过验收。',
      requirements: '1. 完善数据备份机制；2. 优化系统界面布局；3. 30天内提交整改确认。'
    }
  },
  {
    id: 6,
    projectName: '移动办公应用系统',
    projectCode: 'PROJ-2024-006',
    status: 'acceptance_failed',
    submitTime: '2024-01-05',
    expectedTime: '2024-03-05',
    description: '移动办公系统基本完成，部分功能待完善',
    materials: [
      { id: 9, name: '项目验收报告.pdf', type: '验收报告' }
    ],
    finalResult: {
      conclusion: 'failed',
      score: 68,
      time: '2024-01-20',
      description: '项目验收未通过，系统稳定性有待提升，需要完善相关功能。',
      requirements: '1. 优化系统性能；2. 完善用户界面；3. 补充测试文档。'
    }
  }
])

// 表格列配置
const columns = [
  {
    title: '项目信息',
    key: 'projectInfo',
    width: 300
  },
  {
    title: '申请状态',
    key: 'status',
    width: 120
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    width: 120
  },
  {
    title: '预期验收时间',
    dataIndex: 'expectedTime',
    width: 140
  },
  {
    title: '验收进度',
    key: 'progress',
    width: 200
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
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
    acceptance_passed: 'green',
    acceptance_conditional: 'orange',
    acceptance_failed: 'red'
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
    acceptance_passed: '验收通过',
    acceptance_conditional: '有条件通过',
    acceptance_failed: '验收未通过'
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
    acceptance_passed: 100,
    acceptance_conditional: 95,
    acceptance_failed: 100
  }
  return percentMap[status] || 0
}

/**
 * 获取进度状态
 * @param {string} status 状态标识
 * @returns {string} 进度状态
 */
const getProgressStatus = (status) => {
  if (status === 'acceptance_failed') return 'exception'
  if (status === 'acceptance_passed') return 'success'
  if (status === 'acceptance_conditional') return 'active'
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
    acceptance_passed: '验收通过',
    acceptance_conditional: '待提交整改材料',
    acceptance_failed: '验收未通过'
  }
  return textMap[status] || '未知阶段'
}



// 事件处理方法
const goToSubmit = () => {
  router.push('/acceptance/application/submit')
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
    path: '/acceptance/application/submit',
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
 * 预览材料
 * @param {Object} material 材料对象
 */
const handlePreviewMaterial = (material) => {
  message.info(`预览材料：${material.name}`)
}

/**
 * 下载材料
 * @param {Object} material 材料对象
 */
const handleDownloadMaterial = (material) => {
  message.success(`下载材料：${material.name}`)
}

/**
 * 重新提交材料
 * @param {Object} record 申请记录
 */
const handleResubmitMaterial = (record) => {
  router.push({
    path: '/acceptance/application/submit',
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
  if (record.finalResult && record.finalResult.requirements) {
    improvementRequirements = record.finalResult.requirements
  }
  
  // 跳转到提交页面，并传递项目信息用于自动填充
  router.push({
    path: '/acceptance/application/submit',
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

.materials-list {
  space-y: 12px;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
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

.material-type {
  font-size: 12px;
  color: #8c8c8c;
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