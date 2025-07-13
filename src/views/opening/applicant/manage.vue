<!--
 * @file 开题申请管理页面 - 申报单位角色
 * @description 申报单位查看和管理自己提交的开题申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
 * @reference 严格遵循《页面统一风格设计规范.md》进行页面结构和样式优化，复制验收模块完整功能
-->
<template>
  <div class="applicant-manage-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">开题申请管理</h1>
        <p class="page-description">查看和管理您提交的项目开题申请</p>
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
          <div class="stat-card completed" @click="handleStatCardClick('opening_passed')">
            <div class="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.openingPassed }}</div>
              <div class="stat-label">开题通过</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card conditional" @click="handleStatCardClick('opening_conditional')">
            <div class="stat-icon">
              <BulbOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.openingConditional }}</div>
              <div class="stat-label">有条件通过</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <div class="stat-card rejected" @click="handleStatCardClick('opening_failed')">
            <div class="stat-icon">
              <CloseCircleOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.openingFailed }}</div>
              <div class="stat-label">开题未通过</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 开题流程说明 -->
    <a-card class="flow-description" title="开题流程说明" :bordered="false">
      <template #extra>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </template>
      <div v-show="showFlowDescription" class="flow-content">
        <a-steps :current="3" size="small" direction="horizontal" status="finish">
          <a-step title="提交申请" description="准备材料并提交开题申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员审核开题材料
                <div class="step-status-tags">
                  <a-tag color="orange" size="small">材料审核中</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="组织会议" status="finish">
            <template #description>
              <div class="step-description">
                等待管理员组织开题答辩会议
                <div class="step-status-tags">
                  <a-tag color="blue" size="small">会议待组织</a-tag>
                  <a-tag color="cyan" size="small">会议已安排</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="开题结论" status="finish">
            <template #description>
              <div class="step-description">
                根据会议结果获得最终结论
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
    </a-card>

    <!-- 申请列表 -->
    <a-card :bordered="false">
      <template #title>
        <div class="card-title-with-total">
          <span>我的开题申请</span>
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
                v-if="record.status === 'opening_conditional'" 
                type="primary" 
                size="small" 
                @click="handleSubmitImprovement(record)"
              >
                提交整改材料
              </a-button>
              <a-button 
                v-if="record.status === 'opening_failed'" 
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
                v-if="['opening_passed', 'opening_conditional', 'opening_failed'].includes(record.status)" 
                size="small" 
                @click="handleViewDetails(record)"
              >
                查看详情
              </a-button>
              <a-dropdown v-if="getMoreActions(record).length > 0">
                <a-button type="link" size="small">
                  更多 <DownOutlined />
                </a-button>
                <template #overlay>
                  <a-menu @click="handleMoreAction($event, record)">
                    <a-menu-item 
                      v-for="action in getMoreActions(record)" 
                      :key="action.key"
                    >
                      {{ action.label }}
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
/**
 * 开题申请管理页面 - 申报单位角色
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
  DownOutlined
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
  const openingPassed = applications.value.filter(app => 
    app.status === 'opening_passed'
  ).length
  const openingConditional = applications.value.filter(app => 
    app.status === 'opening_conditional'
  ).length
  const openingFailed = applications.value.filter(app => 
    app.status === 'opening_failed'
  ).length
  
  return {
    total,
    materialReviewing,
    meetingPreparing,
    meetingScheduled,
    openingPassed,
    openingConditional,
    openingFailed
  }
})

// 筛选条件
const filters = ref({
  status: '',
  keyword: ''
})

// 流程说明显示状态
const showFlowDescription = ref(false)

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
      { id: 1, name: '项目开题报告.pdf', type: '开题报告' },
      { id: 2, name: '技术方案.docx', type: '技术方案' }
    ],
    // 模拟材料审核被驳回的情况
    materialRejected: true,
    rejectionInfo: {
      time: '2024-01-18',
      reviewer: '张审核员',
      comments: '材料基本符合要求，但需要完善部分内容。',
      rejectionReason: '1. 项目开题报告中缺少详细的研究目标和技术路线；2. 技术方案需要补充风险分析和应对措施；3. 请提供详细的项目实施计划和时间节点。'
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
      { id: 3, name: '项目开题报告.pdf', type: '开题报告' }
    ]
  },
  {
    id: 3,
    projectName: '物联网环境监测系统',
    projectCode: 'PROJ-2024-003',
    status: 'meeting_scheduled',
    submitTime: '2024-02-01',
    expectedTime: '2024-04-01',
    description: '基于物联网技术的实时环境监测与预警系统',
    materials: [
      { id: 4, name: '项目开题报告.pdf', type: '开题报告' },
      { id: 5, name: '技术架构.pdf', type: '技术文档' }
    ],
    meetingInfo: {
      time: '2024-02-15 14:00',
      location: '学术会议室A',
      participants: ['专家A', '专家B', '专家C']
    }
  },
  {
    id: 4,
    projectName: '人工智能教育辅助平台',
    projectCode: 'PROJ-2024-004',
    status: 'opening_passed',
    submitTime: '2024-01-10',
    expectedTime: '2024-03-10',
    description: '基于AI技术的个性化教育辅助系统',
    materials: [
      { id: 6, name: '项目开题报告.pdf', type: '开题报告' }
    ],
    conclusion: {
      time: '2024-01-25',
      type: 'opening_passed',
      feedback: '项目技术方案可行，预期目标明确，研究计划合理，专家组一致通过开题申请。建议在实施过程中加强用户体验设计和数据安全保护。',
      score: 92
    }
  },
  {
    id: 5,
    projectName: '5G网络优化项目',
    projectCode: 'PROJ-2024-005',
    status: 'opening_conditional',
    submitTime: '2024-01-25',
    expectedTime: '2024-03-25',
    description: '5G基站布局优化算法研究',
    materials: [
      { id: 7, name: '项目开题报告.pdf', type: '开题报告' }
    ],
    conclusion: {
      time: '2024-02-10',
      type: 'opening_conditional',
      feedback: '项目研究方向正确，但技术路线需进一步完善。要求在3个月内补充详细的算法设计和实验方案，并重新提交审核。',
      requirements: '1. 补充算法的理论分析和性能评估指标；2. 提供详细的实验环境搭建方案；3. 完善项目风险评估和应对措施。'
    }
  },
  {
    id: 6,
    projectName: '区块链电子投票系统',
    projectCode: 'PROJ-2024-006',
    status: 'opening_failed',
    submitTime: '2024-02-05',
    expectedTime: '2024-04-05',
    description: '基于区块链的安全电子投票平台',
    materials: [
      { id: 8, name: '项目开题报告.pdf', type: '开题报告' }
    ],
    conclusion: {
      time: '2024-02-20',
      type: 'opening_failed',
      feedback: '项目技术方案存在重大安全隐患，研究目标与现有资源不匹配，专家组认为项目不具备实施条件，不予通过开题申请。建议重新设计技术方案后重新申请。'
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
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120
  },
  {
    title: '申请时间',
    dataIndex: 'submitTime',
    key: 'submitTime',
    width: 120
  },
  {
    title: '预期时间',
    dataIndex: 'expectedTime',
    key: 'expectedTime',
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
    width: 200
  }
]

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `共 ${total} 条记录`
})

// 过滤后的申请列表
const filteredApplications = computed(() => {
  let result = applications.value
  
  if (filters.value.status) {
    result = result.filter(app => app.status === filters.value.status)
  }
  
  if (filters.value.keyword) {
    result = result.filter(app => 
      app.projectName.toLowerCase().includes(filters.value.keyword.toLowerCase()) ||
      app.projectCode.toLowerCase().includes(filters.value.keyword.toLowerCase())
    )
  }
  
  pagination.value.total = result.length
  return result
})

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'material_reviewing': 'orange',
    'meeting_preparing': 'blue',
    'meeting_scheduled': 'cyan',
    'opening_passed': 'green',
    'opening_conditional': 'orange',
    'opening_failed': 'red'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
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

// 获取进度百分比
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

// 获取进度状态
const getProgressStatus = (status) => {
  if (['opening_passed'].includes(status)) return 'success'
  if (['opening_failed'].includes(status)) return 'exception'
  return 'active'
}

// 获取进度文本
const getProgressText = (status, record) => {
  const textMap = {
    'material_reviewing': record.materialRejected ? '材料被驳回，需重新提交' : '材料审核中',
    'meeting_preparing': '等待会议组织',
    'meeting_scheduled': '会议已安排',
    'opening_passed': '开题通过',
    'opening_conditional': '有条件通过',
    'opening_failed': '开题未通过'
  }
  return textMap[status] || '进行中'
}

// 获取更多操作
const getMoreActions = (record) => {
  const actions = []
  
  if (record.materials?.length > 0) {
    actions.push({ key: 'viewMaterials', label: '查看材料' })
  }
  
  if (['opening_passed', 'opening_conditional', 'opening_failed'].includes(record.status)) {
    actions.push({ key: 'downloadReport', label: '下载报告' })
  }
  
  return actions
}

// 事件处理函数
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}

const handleStatCardClick = (status) => {
  filters.value.status = status
}

const handleFilterChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const goToSubmit = () => {
  router.push('/implementation/opening?tab=application-submit')
}

const handleResubmitMaterial = (record) => {
  router.push({
    path: '/opening/applicant/submit',
    query: {
      resubmit: 'true',
      projectId: record.id,
      projectName: encodeURIComponent(record.projectName),
      projectCode: record.projectCode,
      expectedTime: record.expectedTime,
      description: encodeURIComponent(record.description || ''),
      rejectionReason: encodeURIComponent(record.rejectionInfo?.rejectionReason || '')
    }
  })
}

const handleSubmitImprovement = (record) => {
  let improvementRequirements = ''
  if (record.conclusion && record.conclusion.requirements) {
    improvementRequirements = record.conclusion.requirements
  }
  
  router.push({
    path: '/opening/applicant/submit',
    query: {
      improvement: 'true',
      projectId: record.id,
      projectName: encodeURIComponent(record.projectName),
      projectCode: record.projectCode,
      expectedTime: record.expectedTime,
      description: encodeURIComponent(record.description || ''),
      improvementRequirements: encodeURIComponent(improvementRequirements)
    }
  })
}

const handleResubmit = (record) => {
  router.push(`/implementation/opening?tab=application-submit&id=${record.id}&type=new`)
}

const handleViewDetails = (record) => {
  // 查看结论详情逻辑
  if (record.conclusion) {
    Modal.info({
      title: '开题结论详情',
      width: 600,
      content: h('div', [
        h('p', `结论时间: ${record.conclusion.time}`),
        h('p', `结论类型: ${getStatusText(record.status)}`),
        h('div', [
          h('p', '结论意见:'),
          h('div', { style: 'background: #f5f5f5; padding: 12px; border-radius: 4px; margin-top: 8px;' }, 
            record.conclusion.feedback)
        ]),
        record.conclusion.requirements && h('div', [
          h('p', { style: 'margin-top: 16px;' }, '整改要求:'),
          h('div', { style: 'background: #fff7e6; padding: 12px; border-radius: 4px; margin-top: 8px; border: 1px solid #ffd591;' }, 
            record.conclusion.requirements)
        ])
      ])
    })
  } else {
    message.info('暂无结论详情')
  }
}

const handleViewRejectionDetails = (record) => {
  Modal.info({
    title: '材料驳回详情',
    width: 600,
    content: h('div', [
      h('p', `驳回时间: ${record.rejectionInfo.time}`),
      h('p', `审核人员: ${record.rejectionInfo.reviewer}`),
      h('p', `审核意见: ${record.rejectionInfo.comments}`),
      h('div', [
        h('p', '驳回原因:'),
        h('div', { style: 'background: #f5f5f5; padding: 12px; border-radius: 4px; margin-top: 8px;' }, 
          record.rejectionInfo.rejectionReason)
      ])
    ])
  })
}

const handleMoreAction = ({ key }, record) => {
  switch (key) {
    case 'viewMaterials':
      // 查看材料逻辑
      message.info('查看材料功能')
      break
    case 'downloadReport':
      // 下载报告逻辑
      message.info('下载报告功能')
      break
  }
}

onMounted(() => {
  // 页面初始化逻辑
})
</script>

<style scoped>
/* 页面容器样式 */
.applicant-manage-container {
  padding: 0;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
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

/* 统计概览样式 */
.stats-overview {
  margin: 0 16px 16px 16px;
}

/* 页面主要内容区域 */
.applicant-manage-container :deep(.ant-card) {
  margin: 0 16px 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

/* 避免重复的统计卡片样式覆盖 */
.applicant-manage-container .stat-card:hover {
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

/* 响应式适配 */
@media (max-width: 768px) {
  .header-filters {
    flex-direction: column;
    gap: 8px;
  }
}
</style>