<template>
  <div class="progress-monitor-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <ClockCircleOutlined /> 进度监控
        </h1>
        <p class="page-desc">基于时间维度监控项目实施进度，实时跟踪节点状态与材料提交</p>
      </div>
      <div class="header-actions">
        <a-select 
          v-model:value="selectedProject" 
          placeholder="选择项目进行监控" 
          style="width: 280px;"
          @change="handleProjectChange"
          size="large"
        >
          <a-select-option v-for="project in projects" :key="project.id" :value="project.id">
            <div class="project-option">
              <div class="project-name">{{ project.name }}</div>
              <div class="project-info">{{ project.leader }} · {{ project.startDate }}</div>
            </div>
          </a-select-option>
        </a-select>
      </div>
    </div>

    <!-- 项目基本信息 -->
    <a-card v-if="currentProject" class="project-info-card" size="small">
      <div class="project-header">
        <div class="project-basic">
          <h3>{{ currentProject.name }}</h3>
          <a-space>
            <a-tag color="blue">{{ currentProject.type }}</a-tag>
            <a-tag color="green">{{ currentProject.status }}</a-tag>
          </a-space>
        </div>
        <div class="project-stats">
          <div class="stat-item">
            <div class="stat-label">项目负责人</div>
            <div class="stat-value">{{ currentProject.leader }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">立项时间</div>
            <div class="stat-value">{{ currentProject.approvalDate }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">整体进度</div>
            <div class="stat-value">{{ overallProgress }}%</div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 项目进度条 -->
    <a-card v-if="currentProject" class="progress-overview-card" size="small">
      <div class="progress-overview">
        <div class="progress-header">
          <h4>项目整体进度</h4>
          <div class="progress-stats">
            <span class="progress-text">{{ overallProgress }}% 完成</span>
            <span class="progress-detail">{{ completedNodesCount }}/{{ totalNodesCount }} 节点</span>
          </div>
        </div>
        <a-progress 
          :percent="overallProgress" 
          :stroke-color="{
            '0%': '#108ee9',
            '100%': '#87d068',
          }"
          :trail-color="'#f0f0f0'"
          stroke-width="8"
          :show-info="false"
        />
        <div class="progress-milestones">
          <div class="milestone-item" v-for="(milestone, index) in progressMilestones" :key="index">
            <div class="milestone-dot" :class="milestone.status"></div>
            <div class="milestone-info">
              <div class="milestone-name">{{ milestone.name }}</div>
              <div class="milestone-date">{{ milestone.date || '待定' }}</div>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 进度时间轴 -->
    <a-card v-if="currentProject" class="timeline-card" title="项目实施进度时间轴">
      <div class="timeline-container">
        <div class="timeline-wrapper">
          <!-- 实施节点 - 反向显示 -->
          <div 
            v-for="(node, index) in reversedProgressNodes" 
            :key="node.id"
            class="timeline-item"
            :class="getNodeClass(node)"
          >
            <div class="timeline-dot" :class="getNodeDotClass(node)">
              <component :is="getNodeIcon(node)" />
            </div>
            <div class="timeline-content">
              <div class="node-header">
                <h4>{{ node.name }}</h4>
                <div class="node-status" :class="node.status">
                  {{ getStatusText(node.status) }}
                </div>
              </div>
              
              <!-- 时间信息 -->
              <div class="node-time">
                <template v-if="node.scheduledDate">
                  <CalendarOutlined />
                  <span v-if="node.status === 'completed'">完成时间：{{ node.completedDate }}</span>
                  <span v-else-if="node.status === 'overdue'">截止时间：{{ node.scheduledDate }} (已超期)</span>
                  <span v-else>截止时间：{{ node.scheduledDate }}</span>
                </template>
                <template v-else>
                  <ClockCircleOutlined />
                  <span class="pending-time">等待确定时间</span>
                </template>
              </div>

              <!-- 节点描述 -->
              <div class="node-desc">{{ node.description }}</div>

              <!-- 材料提交状态 -->
              <div v-if="node.type === 'submission'" class="materials-section">
                <div class="materials-header">
                  <FileTextOutlined />
                  <span>提交材料</span>
                </div>
                <div v-if="node.materials && node.materials.length" class="materials-list">
                  <div 
                    v-for="material in node.materials" 
                    :key="material.id"
                    class="material-item"
                    :class="material.status"
                  >
                    <div class="material-info">
                      <PaperClipOutlined />
                      <span class="material-name">{{ material.name }}</span>
                      <a-tag :color="getMaterialStatusColor(material.status)" size="small">
                        {{ getMaterialStatusText(material.status) }}
                      </a-tag>
                    </div>
                    <div class="material-actions">
                      <a-button 
                        type="link" 
                        size="small" 
                        @click="downloadMaterial(material)"
                        v-if="material.status !== 'pending'"
                      >
                        <DownloadOutlined /> 下载
                      </a-button>
                      <a-button 
                        type="link" 
                        size="small" 
                        danger
                        @click="rejectMaterial(material, node)"
                        v-if="material.status === 'submitted'"
                      >
                        <CloseOutlined /> 打回
                      </a-button>
                    </div>
                  </div>
                </div>
                <div v-else class="no-materials">
                  <ExclamationCircleOutlined />
                  <span>暂无材料提交</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="node-actions">
                <!-- 提醒按钮 -->
                <a-button 
                  v-if="shouldShowReminder(node)"
                  type="primary"
                  size="small"
                  @click="sendReminder(node)"
                  :loading="reminderLoading[node.id]"
                >
                  <BellOutlined /> 提醒
                </a-button>
                
                <!-- 催办按钮 -->
                <a-button 
                  v-if="shouldShowUrge(node)"
                  type="primary"
                  danger
                  size="small"
                  @click="sendUrge(node)"
                  :loading="urgeLoading[node.id]"
                >
                  <AlertOutlined /> 催办
                </a-button>

                <!-- 设置时间按钮 -->
                <a-button 
                  v-if="!node.scheduledDate && node.status === 'waiting'"
                  type="default"
                  size="small"
                  @click="setNodeTime(node)"
                >
                  <CalendarOutlined /> 设置时间
                </a-button>
              </div>
            </div>
          </div>

          <!-- 立项节点 - 放在最后（时间顺序最早） -->
          <div class="timeline-item approval-node">
            <div class="timeline-dot completed">
              <CheckCircleOutlined />
            </div>
            <div class="timeline-content">
              <div class="node-header">
                <h4>项目立项</h4>
                <div class="node-status completed">已完成</div>
              </div>
              <div class="node-time">{{ currentProject.approvalDate }}</div>
              <div class="node-desc">项目立项审批通过，正式启动</div>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 空状态 -->
    <a-empty v-if="!selectedProject" description="请选择项目查看进度监控">
      <a-button type="primary" @click="selectedProject = projects[0]?.id">
        选择项目
      </a-button>
    </a-empty>

    <!-- 设置节点时间弹窗 -->
    <a-modal
      v-model:open="timeModalVisible"
      title="设置节点时间"
      @ok="confirmSetTime"
      @cancel="cancelSetTime"
    >
      <a-form :model="timeForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="节点名称">
          <span>{{ currentTimeNode?.name }}</span>
        </a-form-item>
        <a-form-item label="截止时间" required>
          <a-date-picker 
            v-model:value="timeForm.scheduledDate" 
            style="width: 100%;"
            :disabled-date="disabledDate"
          />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea 
            v-model:value="timeForm.remark" 
            :rows="3"
            placeholder="可选择添加时间设置说明"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 材料打回弹窗 -->
    <a-modal
      v-model:open="rejectModalVisible"
      title="材料打回"
      @ok="confirmReject"
      @cancel="cancelReject"
    >
      <a-form :model="rejectForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="材料名称">
          <span>{{ currentRejectMaterial?.name }}</span>
        </a-form-item>
        <a-form-item label="打回原因" required>
          <a-textarea 
            v-model:value="rejectForm.reason" 
            :rows="4"
            placeholder="请详细说明材料不合格的原因"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  AlertOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  MinusCircleOutlined
} from '@ant-design/icons-vue'

// 数据状态
const selectedProject = ref('')
const reminderLoading = ref({})
const urgeLoading = ref({})

// 弹窗状态
const timeModalVisible = ref(false)
const currentTimeNode = ref(null)
const timeForm = ref({
  scheduledDate: null,
  remark: ''
})

const rejectModalVisible = ref(false)
const currentRejectMaterial = ref(null)
const currentRejectNode = ref(null)
const rejectForm = ref({
  reason: ''
})

// 项目数据
const projects = ref([
  {
    id: 'P001',
    name: 'XXX科研项目',
    leader: '张教授',
    type: '国家自然科学基金',
    status: '实施中',
    startDate: '2024-01-01',
    approvalDate: '2024-01-15'
  },
  {
    id: 'P002',
    name: 'YYY技术研发',
    leader: '李博士',
    type: '省级科技计划',
    status: '实施中',
    startDate: '2024-02-01',
    approvalDate: '2024-02-10'
  }
])

// 当前项目
const currentProject = computed(() => {
  return projects.value.find(p => p.id === selectedProject.value)
})

// 进度节点数据
const progressNodes = ref([])

// 反向排序的节点（最新的在前面）
const reversedProgressNodes = computed(() => {
  return [...progressNodes.value].reverse()
})

// 节点统计
const totalNodesCount = computed(() => {
  return progressNodes.value.length + 1 // +1 for approval node
})

const completedNodesCount = computed(() => {
  const completedNodes = progressNodes.value.filter(n => n.status === 'completed').length
  return completedNodes + 1 // +1 for approval node (always completed)
})

// 整体进度计算
const overallProgress = computed(() => {
  if (totalNodesCount.value === 0) return 0
  return Math.round((completedNodesCount.value / totalNodesCount.value) * 100)
})

// 进度里程碑
const progressMilestones = computed(() => {
  if (!currentProject.value) return []
  
  return [
    {
      name: '立项',
      date: currentProject.value.approvalDate,
      status: 'completed'
    },
    {
      name: '开题',
      date: progressNodes.value.find(n => n.id === 'opening-meeting')?.scheduledDate,
      status: progressNodes.value.find(n => n.id === 'opening-meeting')?.status || 'waiting'
    },
    {
      name: '中期',
      date: progressNodes.value.find(n => n.id === 'midterm-meeting')?.scheduledDate,
      status: progressNodes.value.find(n => n.id === 'midterm-meeting')?.status || 'waiting'
    },
    {
      name: '验收',
      date: progressNodes.value.find(n => n.id === 'acceptance-meeting')?.scheduledDate,
      status: progressNodes.value.find(n => n.id === 'acceptance-meeting')?.status || 'waiting'
    }
  ]
})

// 初始化节点数据
const initializeNodes = (projectId) => {
  // 模拟不同项目的节点数据
  const nodeTemplates = {
    'P001': [
      {
        id: 'opening-submit',
        name: '项目开题 - 资料提交',
        type: 'submission',
        status: 'completed',
        scheduledDate: '2024-02-15',
        completedDate: '2024-02-12',
        description: '提交开题报告、研究方案等相关材料',
        materials: [
          { id: 'm1', name: '开题报告.pdf', status: 'approved' },
          { id: 'm2', name: '研究方案.docx', status: 'approved' }
        ]
      },
      {
        id: 'opening-meeting',
        name: '项目开题 - 报告会',
        type: 'meeting',
        status: 'completed',
        scheduledDate: '2024-02-20',
        completedDate: '2024-02-20',
        description: '参加开题报告会，专家评审'
      },
      {
        id: 'midterm-submit',
        name: '项目中期 - 资料提交',
        type: 'submission',
        status: 'in-progress',
        scheduledDate: '2024-06-15',
        description: '提交中期检查报告、阶段性成果等材料',
        materials: [
          { id: 'm3', name: '中期报告.pdf', status: 'submitted' },
          { id: 'm4', name: '阶段成果.docx', status: 'pending' }
        ]
      },
      {
        id: 'midterm-meeting',
        name: '项目中期 - 报告会',
        type: 'meeting',
        status: 'waiting',
        description: '参加中期检查报告会'
      },
      {
        id: 'acceptance-submit',
        name: '项目验收 - 资料提交',
        type: 'submission',
        status: 'waiting',
        description: '提交验收报告、最终成果等材料'
      },
      {
        id: 'acceptance-meeting',
        name: '项目验收 - 报告会',
        type: 'meeting',
        status: 'waiting',
        description: '参加项目验收报告会'
      }
    ],
    'P002': [
      {
        id: 'opening-submit',
        name: '项目开题 - 资料提交',
        type: 'submission',
        status: 'overdue',
        scheduledDate: '2024-03-01',
        description: '提交开题报告、技术方案等相关材料',
        materials: [
          { id: 'm1', name: '开题报告.pdf', status: 'rejected' }
        ]
      },
      {
        id: 'opening-meeting',
        name: '项目开题 - 报告会',
        type: 'meeting',
        status: 'waiting',
        description: '参加开题报告会，专家评审'
      }
    ]
  }
  
  progressNodes.value = nodeTemplates[projectId] || []
}

// 方法
const handleProjectChange = (projectId) => {
  initializeNodes(projectId)
}

const getNodeClass = (node) => {
  return {
    'completed-node': node.status === 'completed',
    'in-progress-node': node.status === 'in-progress',
    'overdue-node': node.status === 'overdue',
    'waiting-node': node.status === 'waiting'
  }
}

const getNodeDotClass = (node) => {
  return {
    'completed': node.status === 'completed',
    'in-progress': node.status === 'in-progress',
    'overdue': node.status === 'overdue',
    'waiting': node.status === 'waiting'
  }
}

const getNodeIcon = (node) => {
  switch (node.status) {
    case 'completed': return 'CheckCircleOutlined'
    case 'in-progress': return 'PlayCircleOutlined'
    case 'overdue': return 'AlertOutlined'
    default: return 'MinusCircleOutlined'
  }
}

const getStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'in-progress': '进行中',
    'overdue': '已超期',
    'waiting': '等待中'
  }
  return statusMap[status] || '未知'
}

const getMaterialStatusColor = (status) => {
  const colorMap = {
    'pending': 'orange',
    'submitted': 'blue',
    'approved': 'green',
    'rejected': 'red'
  }
  return colorMap[status] || 'default'
}

const getMaterialStatusText = (status) => {
  const textMap = {
    'pending': '待提交',
    'submitted': '已提交',
    'approved': '已通过',
    'rejected': '已打回'
  }
  return textMap[status] || '未知'
}

const shouldShowReminder = (node) => {
  if (!node.scheduledDate || node.status === 'completed') return false
  const daysLeft = dayjs(node.scheduledDate).diff(dayjs(), 'day')
  return daysLeft <= 3 && daysLeft > 0
}

const shouldShowUrge = (node) => {
  if (!node.scheduledDate || node.status === 'completed') return false
  return node.status === 'overdue' || dayjs().isAfter(dayjs(node.scheduledDate))
}

const sendReminder = async (node) => {
  reminderLoading.value[node.id] = true
  try {
    // 模拟发送提醒
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success(`已向相关人员发送${node.name}的提醒通知`)
  } finally {
    reminderLoading.value[node.id] = false
  }
}

const sendUrge = async (node) => {
  urgeLoading.value[node.id] = true
  try {
    // 模拟发送催办
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success(`已向相关人员发送${node.name}的催办通知`)
  } finally {
    urgeLoading.value[node.id] = false
  }
}

const setNodeTime = (node) => {
  currentTimeNode.value = node
  timeForm.value = {
    scheduledDate: null,
    remark: ''
  }
  timeModalVisible.value = true
}

const confirmSetTime = () => {
  if (!timeForm.value.scheduledDate) {
    message.error('请选择截止时间')
    return
  }
  
  const node = progressNodes.value.find(n => n.id === currentTimeNode.value.id)
  if (node) {
    node.scheduledDate = timeForm.value.scheduledDate.format('YYYY-MM-DD')
    node.status = 'in-progress'
    message.success('节点时间设置成功')
  }
  
  timeModalVisible.value = false
}

const cancelSetTime = () => {
  timeModalVisible.value = false
}

const disabledDate = (current) => {
  return current && current < dayjs().startOf('day')
}

const downloadMaterial = (material) => {
  message.info(`下载材料：${material.name}`)
  // 实际项目中这里会触发文件下载
}

const rejectMaterial = (material, node) => {
  currentRejectMaterial.value = material
  currentRejectNode.value = node
  rejectForm.value = {
    reason: ''
  }
  rejectModalVisible.value = true
}

const confirmReject = () => {
  if (!rejectForm.value.reason.trim()) {
    message.error('请填写打回原因')
    return
  }
  
  // 更新材料状态
  if (currentRejectMaterial.value) {
    currentRejectMaterial.value.status = 'rejected'
    currentRejectMaterial.value.rejectReason = rejectForm.value.reason
  }
  
  message.success('材料已打回，相关人员将收到通知')
  rejectModalVisible.value = false
}

const cancelReject = () => {
  rejectModalVisible.value = false
}

onMounted(() => {
  // 检查URL参数，如果有传入项目ID则优先使用
  const route = useRoute()
  const projectIdFromQuery = route.query.projectId
  
  if (projectIdFromQuery) {
    // 如果URL中有项目ID，检查是否在项目列表中
    const existingProject = projects.value.find(p => p.id === projectIdFromQuery)
    if (existingProject) {
      selectedProject.value = projectIdFromQuery
    } else {
      // 如果项目不在列表中，根据URL参数创建项目信息
      const projectFromQuery = {
        id: projectIdFromQuery,
        name: route.query.projectName || 'Unknown Project',
        leader: route.query.applicant || 'Unknown',
        type: route.query.projectType || 'Unknown Type',
        status: '实施中',
        startDate: route.query.startDate || '2024-01-01',
        approvalDate: route.query.approvalDate || '2024-01-01'
      }
      projects.value.unshift(projectFromQuery)
      selectedProject.value = projectIdFromQuery
    }
    handleProjectChange(selectedProject.value)
  } else {
    // 默认选择第一个项目
    if (projects.value.length > 0) {
      selectedProject.value = projects.value[0].id
      handleProjectChange(selectedProject.value)
    }
  }
})
</script>

<style scoped>
.progress-monitor-page {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  color: #234fa2;
  margin: 0 0 8px 0;
}

.page-desc {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.project-option {
  .project-name {
    font-weight: 500;
    color: #333;
  }
  
  .project-info {
    font-size: 12px;
    color: #999;
    margin-top: 2px;
  }
}

.project-info-card {
  margin-bottom: 24px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.project-basic {
  h3 {
    margin: 0 0 8px 0;
    color: #234fa2;
  }
}

.project-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
  
  .stat-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

.timeline-card {
  margin-bottom: 24px;
}

.timeline-container {
  padding: 20px 0;
}

.timeline-wrapper {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #52c41a, #1890ff, #faad14, #f5222d);
  }
}

.timeline-item {
  position: relative;
  padding-left: 60px;
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.timeline-dot {
  position: absolute;
  left: 10px;
  top: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  z-index: 2;
  
  &.completed {
    background: #52c41a;
  }
  
  &.in-progress {
    background: #1890ff;
  }
  
  &.overdue {
    background: #f5222d;
  }
  
  &.waiting {
    background: #d9d9d9;
    color: #999;
  }
}

.timeline-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #e8e8e8;
  
  .completed-node & {
    border-left-color: #52c41a;
  }
  
  .in-progress-node & {
    border-left-color: #1890ff;
  }
  
  .overdue-node & {
    border-left-color: #f5222d;
  }
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  h4 {
    margin: 0;
    color: #333;
    font-size: 16px;
  }
}

.node-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  &.completed {
    background: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
  }
  
  &.in-progress {
    background: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
  }
  
  &.overdue {
    background: #fff2e8;
    color: #f5222d;
    border: 1px solid #ffbb96;
  }
  
  &.waiting {
    background: #f5f5f5;
    color: #999;
    border: 1px solid #d9d9d9;
  }
}

.node-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  
  .pending-time {
    color: #faad14;
    font-style: italic;
  }
}

.node-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.materials-section {
  background: #fafafa;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.materials-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  
  &.rejected {
    border-color: #ffccc7;
    background: #fff2f0;
  }
}

.material-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.material-name {
  color: #333;
  font-size: 14px;
}

.material-actions {
  display: flex;
  gap: 8px;
}

.no-materials {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-style: italic;
  padding: 16px;
  text-align: center;
  justify-content: center;
}

.node-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.approval-node {
  .timeline-content {
    border-left-color: #52c41a;
    background: linear-gradient(135deg, #f6ffed 0%, #fff 100%);
  }
}

/* 进度概览卡片样式 */
.progress-overview-card {
  margin-bottom: 24px;
}

.progress-overview {
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h4 {
      margin: 0;
      color: #234fa2;
      font-size: 16px;
    }
    
    .progress-stats {
      display: flex;
      gap: 16px;
      align-items: center;
      
      .progress-text {
        font-size: 18px;
        font-weight: 600;
        color: #1890ff;
      }
      
      .progress-detail {
        font-size: 14px;
        color: #666;
      }
    }
  }
  
  .progress-milestones {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    padding: 0 8px;
    
    .milestone-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      
      .milestone-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-bottom: 8px;
        
        &.completed {
          background: #52c41a;
        }
        
        &.in-progress {
          background: #1890ff;
        }
        
        &.overdue {
          background: #f5222d;
        }
        
        &.waiting {
          background: #d9d9d9;
        }
      }
      
      .milestone-info {
        text-align: center;
        
        .milestone-name {
          font-size: 12px;
          color: #333;
          font-weight: 500;
          margin-bottom: 2px;
        }
        
        .milestone-date {
          font-size: 11px;
          color: #999;
        }
      }
    }
  }
}
</style>