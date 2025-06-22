<!--
 * @file 项目历史档案页面 - 管理角色
 * @description 管理角色查看项目的开题、中期、验收等历史档案
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="project-archive">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <DatabaseOutlined />
          </span>
          项目历史档案
        </h1>
        <p class="page-description">
          查看项目从开题到验收的完整历史记录
        </p>
      </div>
      <div class="header-actions">
        <a-button @click="exportArchive">
          <ExportOutlined />
          导出档案
        </a-button>
      </div>
    </div>

    <!-- 查询筛选 -->
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
        <a-form-item label="项目状态" name="status">
          <a-select
            v-model:value="queryForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 150px"
          >
            <a-select-option value="opening">开题阶段</a-select-option>
            <a-select-option value="midterm">中期阶段</a-select-option>
            <a-select-option value="acceptance">验收阶段</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间范围" name="dateRange">
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

    <!-- 项目档案列表 -->
    <div class="archive-list">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="archive-item"
      >
        <!-- 项目基本信息 -->
        <div class="project-header">
          <div class="project-info">
            <h3 class="project-name">{{ project.name }}</h3>
            <div class="project-meta">
              <span class="project-code">{{ project.code }}</span>
              <span class="project-leader">负责人：{{ project.leader }}</span>
              <span class="project-duration">
                {{ project.startDate }} ~ {{ project.endDate }}
              </span>
            </div>
          </div>
          <div class="project-status">
            <a-tag :color="getStatusColor(project.currentStatus)" size="large">
              {{ getStatusText(project.currentStatus) }}
            </a-tag>
          </div>
        </div>

        <!-- 项目进度时间线 -->
        <div class="project-timeline">
          <a-timeline>
            <!-- 开题阶段 -->
            <a-timeline-item
              :color="getPhaseColor('opening', project.phases.opening)"
            >
              <template #dot>
                <RocketOutlined v-if="project.phases.opening.status === 'completed'" />
                <ClockCircleOutlined v-else />
              </template>
              <div class="timeline-content">
                <div class="phase-header">
                  <h4>项目开题</h4>
                  <span class="phase-time">{{ project.phases.opening.time }}</span>
                </div>
                <div class="phase-details">
                  <div class="phase-info">
                    <span class="info-label">开题会议：</span>
                    <span>{{ project.phases.opening.meetingDate || '未安排' }}</span>
                  </div>
                  <div class="phase-info">
                    <span class="info-label">会议结论：</span>
                    <span>{{ project.phases.opening.conclusion || '待定' }}</span>
                  </div>
                  <div class="phase-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="viewPhaseDetail(project, 'opening')"
                    >
                      查看详情
                    </a-button>
                    <a-button
                      v-if="project.phases.opening.materials"
                      type="link"
                      size="small"
                      @click="downloadPhaseMaterials(project, 'opening')"
                    >
                      下载材料
                    </a-button>
                  </div>
                </div>
              </div>
            </a-timeline-item>

            <!-- 中期阶段 -->
            <a-timeline-item
              :color="getPhaseColor('midterm', project.phases.midterm)"
            >
              <template #dot>
                <PieChartOutlined v-if="project.phases.midterm.status === 'completed'" />
                <ClockCircleOutlined v-else />
              </template>
              <div class="timeline-content">
                <div class="phase-header">
                  <h4>项目中期</h4>
                  <span class="phase-time">{{ project.phases.midterm.time }}</span>
                </div>
                <div class="phase-details">
                  <div class="phase-info">
                    <span class="info-label">中期会议：</span>
                    <span>{{ project.phases.midterm.meetingDate || '未安排' }}</span>
                  </div>
                  <div class="phase-info">
                    <span class="info-label">会议结论：</span>
                    <span>{{ project.phases.midterm.conclusion || '待定' }}</span>
                  </div>
                  <div class="phase-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="viewPhaseDetail(project, 'midterm')"
                    >
                      查看详情
                    </a-button>
                    <a-button
                      v-if="project.phases.midterm.materials"
                      type="link"
                      size="small"
                      @click="downloadPhaseMaterials(project, 'midterm')"
                    >
                      下载材料
                    </a-button>
                  </div>
                </div>
              </div>
            </a-timeline-item>

            <!-- 验收阶段 -->
            <a-timeline-item
              :color="getPhaseColor('acceptance', project.phases.acceptance)"
            >
              <template #dot>
                <CheckCircleOutlined v-if="project.phases.acceptance.status === 'completed'" />
                <ClockCircleOutlined v-else />
              </template>
              <div class="timeline-content">
                <div class="phase-header">
                  <h4>项目验收</h4>
                  <span class="phase-time">{{ project.phases.acceptance.time }}</span>
                </div>
                <div class="phase-details">
                  <div class="phase-info">
                    <span class="info-label">验收会议：</span>
                    <span>{{ project.phases.acceptance.meetingDate || '未安排' }}</span>
                  </div>
                  <div class="phase-info">
                    <span class="info-label">验收结论：</span>
                    <span>{{ project.phases.acceptance.conclusion || '待定' }}</span>
                  </div>
                  <div class="phase-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="viewPhaseDetail(project, 'acceptance')"
                    >
                      查看详情
                    </a-button>
                    <a-button
                      v-if="project.phases.acceptance.materials"
                      type="link"
                      size="small"
                      @click="downloadPhaseMaterials(project, 'acceptance')"
                    >
                      下载材料
                    </a-button>
                  </div>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>

        <!-- 项目统计信息 -->
        <div class="project-stats">
          <a-row :gutter="16">
            <a-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ project.stats.duration }}</div>
                <div class="stat-label">项目周期(月)</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ project.stats.budget }}</div>
                <div class="stat-label">项目预算(万)</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ project.stats.members }}</div>
                <div class="stat-label">团队人数</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ project.stats.achievements }}</div>
                <div class="stat-label">成果数量</div>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredProjects.length === 0" class="empty-state">
      <a-empty description="暂无项目档案数据" />
    </div>

    <!-- 阶段详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="modalTitle"
      width="900px"
      :footer="null"
    >
      <div v-if="selectedPhase" class="phase-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="阶段名称">
              {{ getPhaseTitle(selectedPhase.type) }}
            </a-descriptions-item>
            <a-descriptions-item label="当前状态">
              <a-tag :color="getPhaseStatusColor(selectedPhase.status)">
                {{ getPhaseStatusText(selectedPhase.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="开始时间">
              {{ selectedPhase.startTime }}
            </a-descriptions-item>
            <a-descriptions-item label="完成时间">
              {{ selectedPhase.endTime || '进行中' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议时间">
              {{ selectedPhase.meetingDate || '未安排' }}
            </a-descriptions-item>
            <a-descriptions-item label="会议地点">
              {{ selectedPhase.meetingLocation || '未定' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 提交材料 -->
        <div v-if="selectedPhase.materials" class="detail-section">
          <h4>提交材料</h4>
          <a-list
            :data-source="selectedPhase.materials"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <div class="material-item">
                  <div class="material-info">
                    <span class="material-name">{{ item.name }}</span>
                    <span class="material-size">{{ item.size }}</span>
                  </div>
                  <div class="material-actions">
                    <a-button type="link" size="small" @click="previewMaterial(item)">
                      预览
                    </a-button>
                    <a-button type="link" size="small" @click="downloadMaterial(item)">
                      下载
                    </a-button>
                  </div>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <!-- 专家评审意见 -->
        <div v-if="selectedPhase.reviews" class="detail-section">
          <h4>专家评审意见</h4>
          <div class="review-list">
            <div v-for="review in selectedPhase.reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <span class="reviewer-name">{{ review.reviewer }}</span>
                <span class="review-time">{{ review.time }}</span>
              </div>
              <div class="review-content">{{ review.content }}</div>
              <div class="review-score">
                评分：<a-rate :value="review.score / 2" disabled allow-half />
                <span class="score-text">{{ review.score }}分</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 会议纪要 -->
        <div v-if="selectedPhase.meetingMinutes" class="detail-section">
          <h4>会议纪要</h4>
          <div class="meeting-minutes">
            <div class="minutes-header">
              <div class="minutes-info">
                <span class="info-item">会议时间：{{ selectedPhase.meetingDate }}</span>
                <span class="info-item">会议地点：{{ selectedPhase.meetingLocation }}</span>
                <span class="info-item">主持人：{{ selectedPhase.meetingHost }}</span>
              </div>
            </div>
            <div class="minutes-content">
              <div class="content-section">
                <h5>参会人员</h5>
                <div class="attendees">
                  <a-tag v-for="attendee in selectedPhase.attendees" :key="attendee">
                    {{ attendee }}
                  </a-tag>
                </div>
              </div>
              <div class="content-section">
                <h5>会议内容</h5>
                <div class="meeting-content">{{ selectedPhase.meetingMinutes }}</div>
              </div>
              <div class="content-section">
                <h5>会议结论</h5>
                <div class="meeting-conclusion">{{ selectedPhase.conclusion }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 项目历史档案页面 - 管理角色
 * 功能：查看项目历史、阶段详情、材料下载、进度跟踪
 */
import { ref, computed, onMounted } from 'vue'
import {
  DatabaseOutlined,
  ExportOutlined,
  SearchOutlined,
  RocketOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 查询表单
const queryForm = ref({
  projectName: '',
  status: undefined,
  dateRange: undefined
})

// 项目档案数据
const projects = ref([
  {
    id: 1,
    name: '智慧城市大数据平台建设项目',
    code: 'PROJ-2024-001',
    leader: '张三',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    currentStatus: 'acceptance',
    phases: {
      opening: {
        status: 'completed',
        time: '2023-06-15',
        startTime: '2023-06-01',
        endTime: '2023-06-20',
        meetingDate: '2023-06-15 14:00',
        meetingLocation: '会议室A-301',
        meetingHost: '李主任',
        conclusion: '开题通过，同意按计划实施',
        attendees: ['张三', '李四', '王五', '赵六'],
        meetingMinutes: '经过专家组评审，项目开题报告内容详实，技术路线清晰，预期目标明确，同意按计划实施。',
        materials: [
          { id: 1, name: '开题报告.pdf', size: '2.5MB' },
          { id: 2, name: '技术方案.docx', size: '1.8MB' }
        ],
        reviews: [
          {
            id: 1,
            reviewer: '专家A',
            time: '2023-06-15',
            content: '项目技术路线合理，目标明确，建议按计划实施。',
            score: 85
          }
        ]
      },
      midterm: {
        status: 'completed',
        time: '2023-12-10',
        startTime: '2023-12-01',
        endTime: '2023-12-15',
        meetingDate: '2023-12-10 09:00',
        meetingLocation: '会议室B-201',
        meetingHost: '王主任',
        conclusion: '中期检查通过，项目进展良好',
        attendees: ['张三', '李四', '专家B', '专家C'],
        meetingMinutes: '项目按计划推进，阶段性成果显著，技术指标达到预期，建议继续实施。',
        materials: [
          { id: 3, name: '中期报告.pdf', size: '3.2MB' },
          { id: 4, name: '阶段成果.zip', size: '15.6MB' }
        ],
        reviews: [
          {
            id: 2,
            reviewer: '专家B',
            time: '2023-12-10',
            content: '项目进展顺利，阶段性成果良好，建议继续实施。',
            score: 88
          }
        ]
      },
      acceptance: {
        status: 'in_progress',
        time: '2024-01-15',
        startTime: '2024-01-15',
        endTime: null,
        meetingDate: '2024-01-25 14:00',
        meetingLocation: '会议室A-201',
        conclusion: null,
        materials: [
          { id: 5, name: '验收报告.pdf', size: '4.1MB' },
          { id: 6, name: '项目总结.pdf', size: '2.8MB' }
        ]
      }
    },
    stats: {
      duration: 12,
      budget: 500,
      members: 8,
      achievements: 15
    }
  },
  {
    id: 2,
    name: '区块链供应链金融平台',
    code: 'PROJ-2024-002',
    leader: '李四',
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    currentStatus: 'midterm',
    phases: {
      opening: {
        status: 'completed',
        time: '2023-08-15',
        meetingDate: '2023-08-15 10:00',
        conclusion: '开题通过'
      },
      midterm: {
        status: 'in_progress',
        time: '2024-01-20',
        meetingDate: null,
        conclusion: null
      },
      acceptance: {
        status: 'pending',
        time: null,
        meetingDate: null,
        conclusion: null
      }
    },
    stats: {
      duration: 12,
      budget: 300,
      members: 6,
      achievements: 8
    }
  }
])

// 弹窗状态
const detailModalVisible = ref(false)
const selectedPhase = ref(null)
const modalTitle = ref('')

// 过滤后的项目列表
const filteredProjects = computed(() => {
  let result = projects.value
  
  if (queryForm.value.projectName) {
    result = result.filter(project => 
      project.name.includes(queryForm.value.projectName) ||
      project.code.includes(queryForm.value.projectName)
    )
  }
  
  if (queryForm.value.status) {
    result = result.filter(project => project.currentStatus === queryForm.value.status)
  }
  
  // 日期范围过滤逻辑可以在这里添加
  
  return result
})

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    opening: 'blue',
    midterm: 'orange',
    acceptance: 'purple',
    completed: 'green'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    opening: '开题阶段',
    midterm: '中期阶段',
    acceptance: '验收阶段',
    completed: '已完成'
  }
  return textMap[status] || '未知'
}

const getPhaseColor = (phaseType, phase) => {
  if (phase.status === 'completed') return 'green'
  if (phase.status === 'in_progress') return 'blue'
  return 'gray'
}

const getPhaseTitle = (type) => {
  const titleMap = {
    opening: '项目开题',
    midterm: '项目中期',
    acceptance: '项目验收'
  }
  return titleMap[type] || '未知阶段'
}

const getPhaseStatusColor = (status) => {
  const colorMap = {
    completed: 'green',
    in_progress: 'blue',
    pending: 'default'
  }
  return colorMap[status] || 'default'
}

const getPhaseStatusText = (status) => {
  const textMap = {
    completed: '已完成',
    in_progress: '进行中',
    pending: '待开始'
  }
  return textMap[status] || '未知'
}

// 事件处理方法
const exportArchive = () => {
  message.success('档案导出功能')
}

const handleQuery = () => {
  message.info('查询完成')
}

const handleReset = () => {
  queryForm.value = {
    projectName: '',
    status: undefined,
    dateRange: undefined
  }
}

const viewPhaseDetail = (project, phaseType) => {
  const phase = project.phases[phaseType]
  selectedPhase.value = {
    ...phase,
    type: phaseType,
    projectName: project.name
  }
  modalTitle.value = `${project.name} - ${getPhaseTitle(phaseType)}`
  detailModalVisible.value = true
}

const downloadPhaseMaterials = (project, phaseType) => {
  message.success(`下载${getPhaseTitle(phaseType)}材料`)
}

const previewMaterial = (material) => {
  message.info(`预览材料：${material.name}`)
}

const downloadMaterial = (material) => {
  message.success(`下载材料：${material.name}`)
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.project-archive {
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

/* 查询区域样式 */
.query-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 档案列表样式 */
.archive-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.archive-item {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 项目头部样式 */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.project-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.project-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #8c8c8c;
}

/* 时间线样式 */
.project-timeline {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.timeline-content {
  width: 100%;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.phase-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.phase-time {
  font-size: 12px;
  color: #8c8c8c;
}

.phase-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.phase-info {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.info-label {
  color: #8c8c8c;
  min-width: 80px;
}

.phase-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* 统计信息样式 */
.project-stats {
  padding: 20px 24px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

/* 空状态样式 */
.empty-state {
  padding: 60px 0;
  text-align: center;
}

/* 详情弹窗样式 */
.phase-detail {
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

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.material-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.material-name {
  font-weight: 500;
  color: #262626;
}

.material-size {
  font-size: 12px;
  color: #8c8c8c;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer-name {
  font-weight: 500;
  color: #262626;
}

.review-time {
  font-size: 12px;
  color: #8c8c8c;
}

.review-content {
  color: #595959;
  line-height: 1.6;
  margin-bottom: 8px;
}

.review-score {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #8c8c8c;
}

.score-text {
  font-weight: 500;
}

.meeting-minutes {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.minutes-header {
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.minutes-info {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #595959;
}

.info-item {
  display: flex;
  align-items: center;
}

.minutes-content {
  padding: 16px;
}

.content-section {
  margin-bottom: 16px;
}

.content-section:last-child {
  margin-bottom: 0;
}

.content-section h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.attendees {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meeting-content,
.meeting-conclusion {
  color: #595959;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-archive {
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
  
  .project-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .project-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .phase-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .minutes-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 