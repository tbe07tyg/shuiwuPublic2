<!--
 * @file 验收申请管理页面 - 申报单位角色
 * @description 申报单位查看和管理自己提交的验收申请
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="acceptance-application-manage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <FolderOutlined />
          </span>
          验收申请管理
        </h1>
        <p class="page-description">
          查看和管理您提交的项目验收申请
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

    <!-- 验收流程说明 -->
    <div class="content-card flow-description">
      <div class="card-header">
        <h3>
          <BulbOutlined />
          验收流程说明
        </h3>
        <a-button type="link" size="small" @click="toggleFlowDescription">
          {{ showFlowDescription ? '收起' : '展开' }}
        </a-button>
      </div>
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
    </div>

    <!-- 申请列表 -->
    <div class="content-card">
      <div class="card-header">
        <h3>
          <UnorderedListOutlined />
          我的验收申请
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
                  重新申请
                </a-button>
                <a-button 
                  v-if="['material_reviewing', 'meeting_preparing', 'meeting_scheduled'].includes(record.status) && !record.materialRejected" 
                  size="small" 
                  @click="handleViewProgress(record)"
                >
                  查看进度
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
                  @click="handleViewProgress(record)"
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
      </div>
    </div>


  </div>
</template>

<script setup>
/**
 * 验收申请管理页面 - 申报单位角色
 * 功能：查看申请列表、管理申请状态、查看审核进度
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FolderOutlined,
  PlusOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UnorderedListOutlined,
  DownOutlined,
  BulbOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

const router = useRouter()

// 统计数据
const stats = ref({
  total: 8,
  pending: 2,
  approved: 3,
  rejected: 3
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



// 计算属性：过滤后的申请列表
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

// 状态相关方法
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

const getProgressStatus = (status) => {
  if (status === 'acceptance_failed') return 'exception'
  if (status === 'acceptance_passed') return 'success'
  if (status === 'acceptance_conditional') return 'active'
  return 'active'
}

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

// 获取更多操作
const getMoreActions = (record) => {
  const actions = []
  
  actions.push({ key: 'copy', label: '复制申请' })
  
  if (record.materials && record.materials.length > 0) {
    actions.push({ key: 'download_all', label: '下载全部材料' })
  }
  
  return actions
}

// 事件处理方法
const goToSubmit = () => {
  router.push('/acceptance/application/submit')
}

const handleFilterChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}



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

const handleViewProgress = (record) => {
  // 跳转到验收进度查询页面
  router.push('/acceptance/progress/query')
}

// 重新提交材料
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

// 查看驳回原因详情
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

const handleMoreAction = ({ key }, record) => {
  switch (key) {
    case 'copy':
      message.info(`复制申请：${record.projectName}`)
      break
    case 'download_all':
      message.success(`下载全部材料：${record.projectName}`)
      break
  }
}

// 切换流程说明显示状态
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}



// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.acceptance-application-manage {
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

/* 统计概览样式 */
.stats-overview {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
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

.stat-card.total .stat-icon {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-card.pending .stat-icon {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-card.approved .stat-icon {
  background: #f6ffed;
  color: #52c41a;
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

/* 内容卡片样式 */
.content-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
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
  gap: 8px;
}

.header-filters {
  display: flex;
  gap: 12px;
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

/* 流程说明样式 */
.flow-description {
  margin-bottom: 24px;
}

.flow-content {
  padding: 24px;
}

.status-legend {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.status-legend h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.legend-item:hover {
  background: #f0f9ff;
  border-color: #91d5ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.legend-item span {
  font-size: 13px;
  color: #595959;
}

/* 申请列表样式 */
.application-list {
  padding: 0 24px 24px 24px;
}

/* 新增步骤描述样式 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .acceptance-application-manage {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-filters {
    flex-direction: column;
  }
  
  .stats-overview .ant-col {
    margin-bottom: 16px;
  }
  
  .legend-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .legend-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .legend-item {
    padding: 8px 12px;
  }
}
</style> 