<!--
 * @file 中期会议管理页面 - 管理角色
 * @description 管理角色的中期会议管理，专注于中期材料审核与中期会议组织
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="midterm-meeting-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <CalendarOutlined />
          </span>
          中期会议管理
        </h1>
        <p class="page-description">
          审核中期材料，组织中期会议，管理中期流程
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
              <div class="stat-label">中期通过</div>
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
              <div class="stat-label">中期未通过</div>
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
          <a-step title="申请提交" description="申报单位提交中期申请" status="finish" />
          <a-step title="材料审核" status="finish">
            <template #description>
              <div class="step-description">
                审核中期材料，决定通过或驳回
                <div class="step-status-tags">
                  <a-tag color="orange" size="small">材料审核中</a-tag>
                </div>
              </div>
            </template>
          </a-step>
          <a-step title="组织会议" status="finish">
            <template #description>
              <div class="step-description">
                安排中期会议并组织专家评审
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
                根据会议结果录入最终中期结论
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

    <!-- 会议管理标签页 -->
    <div class="content-card">
      <a-tabs v-model:activeKey="activeTab" type="card" @change="handleTabChange">
        <!-- 待安排会议 -->
        <a-tab-pane key="pending" tab="待安排会议">
          <template #tab>
            <span>
              <CalendarOutlined />
              待安排会议
              <a-badge :count="pendingMeetings.length" style="margin-left: 8px" />
            </span>
          </template>

          <div class="meeting-list">
            <div v-if="pendingMeetings.length === 0" class="empty-state">
              <CalendarOutlined />
              <p>暂无待安排的中期会议</p>
            </div>
            <div
              v-for="meeting in pendingMeetings"
              :key="meeting.id"
              class="meeting-item pending-item"
            >
              <div class="meeting-info">
                <div class="project-header">
                  <h4 class="project-name">{{ meeting.projectName }}</h4>
                  <a-tag color="orange" size="small">待安排</a-tag>
                </div>
                <div class="project-details">
                  <div class="detail-row">
                    <span class="label">项目编号：</span>
                    <span class="value">{{ meeting.projectCode }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">负责人：</span>
                    <span class="value">{{ meeting.leader }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">申请时间：</span>
                    <span class="value">{{ meeting.submitDate }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">检查形式：</span>
                    <span class="value">{{ meeting.checkType }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">项目进度：</span>
                    <span class="value">{{ meeting.progress }}%</span>
                  </div>
                </div>
              </div>
              <div class="meeting-actions">
                <a-space>
                  <a-button type="primary" @click="arrangeMeeting(meeting)">
                    <CalendarOutlined />
                    安排会议
                  </a-button>
                  <a-button @click="viewProjectDetails(meeting)">
                    <EyeOutlined />
                    查看详情
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 已安排会议 -->
        <a-tab-pane key="scheduled" tab="已安排会议">
          <template #tab>
            <span>
              <ScheduleOutlined />
              已安排会议
              <a-badge :count="scheduledMeetings.length" style="margin-left: 8px" />
            </span>
          </template>

          <div class="meeting-list">
            <div v-if="scheduledMeetings.length === 0" class="empty-state">
              <ScheduleOutlined />
              <p>暂无已安排的中期会议</p>
            </div>
            <div
              v-for="meeting in scheduledMeetings"
              :key="meeting.id"
              class="meeting-item scheduled-item"
            >
              <div class="meeting-info">
                <div class="project-header">
                  <h4 class="project-name">{{ meeting.projectName }}</h4>
                  <a-tag :color="getMeetingStatusColor(meeting.status)" size="small">
                    {{ meeting.status }}
                  </a-tag>
                </div>
                <div class="project-details">
                  <div class="detail-row">
                    <span class="label">项目编号：</span>
                    <span class="value">{{ meeting.projectCode }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">负责人：</span>
                    <span class="value">{{ meeting.leader }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">会议时间：</span>
                    <span class="value">{{ meeting.meetingTime }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">会议地点：</span>
                    <span class="value">{{ meeting.location }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">主持人：</span>
                    <span class="value">{{ meeting.chairperson }}</span>
                  </div>
                </div>
              </div>
              <div class="meeting-actions">
                <a-space>
                  <a-button 
                    type="primary" 
                    @click="enterConclusion(meeting)"
                    :disabled="meeting.status !== '已开始' && meeting.status !== '进行中'"
                  >
                    <EditOutlined />
                    录入结论
                  </a-button>
                  <a-button @click="viewProjectDetails(meeting)">
                    <EyeOutlined />
                    查看详情
                  </a-button>
                  <a-button 
                    @click="editMeeting(meeting)"
                    :disabled="meeting.status !== '已安排'"
                  >
                    <EditOutlined />
                    编辑会议
                  </a-button>
                  <a-button 
                    danger 
                    @click="deleteMeeting(meeting)"
                    :disabled="meeting.status !== '已安排'"
                  >
                    <DeleteOutlined />
                    删除
                  </a-button>
                  <a-button 
                    @click="notifyParticipants(meeting)"
                    :disabled="meeting.status !== '已安排'"
                  >
                    <MessageOutlined />
                    一键通知
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 已完成会议 -->
        <a-tab-pane key="completed" tab="已完成会议">
          <template #tab>
            <span>
              <CheckCircleOutlined />
              已完成会议
              <a-badge :count="completedMeetings.length" style="margin-left: 8px" />
            </span>
          </template>

          <div class="meeting-list">
            <div v-if="completedMeetings.length === 0" class="empty-state">
              <CheckCircleOutlined />
              <p>暂无已完成的中期会议</p>
            </div>
            <div
              v-for="meeting in completedMeetings"
              :key="meeting.id"
              class="meeting-item completed-item"
            >
              <div class="meeting-info">
                <div class="project-header">
                  <h4 class="project-name">{{ meeting.projectName }}</h4>
                  <a-tag :color="getConclusionColor(meeting.conclusion)" size="small">
                    {{ meeting.conclusion }}
                  </a-tag>
                </div>
                <div class="project-details">
                  <div class="detail-row">
                    <span class="label">项目编号：</span>
                    <span class="value">{{ meeting.projectCode }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">负责人：</span>
                    <span class="value">{{ meeting.leader }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">会议时间：</span>
                    <span class="value">{{ meeting.meetingTime }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">完成时间：</span>
                    <span class="value">{{ meeting.completedTime }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">最终结论：</span>
                    <span class="value">{{ meeting.conclusion }}</span>
                  </div>
                </div>
              </div>
              <div class="meeting-actions">
                <a-space>
                  <a-button @click="viewConclusion(meeting)">
                    <FileTextOutlined />
                    查看结论
                  </a-button>
                  <a-button @click="viewProjectDetails(meeting)">
                    <EyeOutlined />
                    查看详情
                  </a-button>
                </a-space>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 安排会议弹窗 -->
    <a-modal
      v-model:open="arrangeMeetingVisible"
      title="安排中期会议"
      width="800px"
      @ok="handleArrangeMeeting"
      @cancel="cancelArrangeMeeting"
    >
      <a-form
        ref="meetingFormRef"
        :model="meetingForm"
        :rules="meetingRules"
        layout="vertical"
      >
        <!-- 项目信息展示 -->
        <div class="project-info-section">
          <h4>项目信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedMeeting?.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedMeeting?.projectCode }}
            </a-descriptions-item>
            <a-descriptions-item label="项目负责人">
              {{ selectedMeeting?.leader }}
            </a-descriptions-item>
            <a-descriptions-item label="当前进度">
              {{ selectedMeeting?.progress }}%
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              label="会议时间"
              name="meetingTime"
              :rules="[{ required: true, message: '请选择会议时间' }]"
            >
              <a-date-picker
                v-model:value="meetingForm.meetingTime"
                show-time
                format="YYYY-MM-DD HH:mm"
                placeholder="请选择会议时间"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="会议地点"
              name="location"
              :rules="[{ required: true, message: '请输入会议地点' }]"
            >
              <a-input
                v-model:value="meetingForm.location"
                placeholder="请输入会议地点"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              label="会议形式"
              name="meetingType"
              :rules="[{ required: true, message: '请选择会议形式' }]"
            >
              <a-select
                v-model:value="meetingForm.meetingType"
                placeholder="请选择会议形式"
              >
                <a-select-option value="onsite">现场会议</a-select-option>
                <a-select-option value="online">线上会议</a-select-option>
                <a-select-option value="hybrid">线上线下结合</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="主持人"
              name="chairperson"
              :rules="[{ required: true, message: '请选择主持人' }]"
            >
              <a-select
                v-model:value="meetingForm.chairperson"
                mode="tags"
                placeholder="请选择或输入主持人"
                :filter-option="false"
                style="width: 100%"
              >
                <a-select-option v-for="host in chairpersonOptions" :key="host" :value="host">
                  {{ host }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item
          label="评审专家"
          name="experts"
          :rules="[{ required: true, message: '请选择评审专家' }]"
        >
          <a-select
            v-model:value="meetingForm.experts"
            mode="tags"
            placeholder="请选择或输入评审专家"
            :filter-option="false"
            style="width: 100%"
          >
            <a-select-option v-for="expert in expertOptions" :key="expert" :value="expert">
              {{ expert }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="会议资料">
            <a-upload
            v-model:file-list="meetingForm.materials"
            :before-upload="beforeUploadMaterial"
            :on-remove="removeMaterial"
            :multiple="true"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
          >
            <a-button>
              <UploadOutlined />
              上传会议资料
            </a-button>
          </a-upload>
          <div class="upload-tip">
            支持PDF、Word、PPT、压缩包等格式，单个文件不超过50MB
          </div>
        </a-form-item>

        <a-form-item label="会议说明" name="description">
          <a-textarea
            v-model:value="meetingForm.description"
            placeholder="请输入中期会议相关说明（选填）"
            :rows="3"
            show-count
            :maxlength="200"
          />
      </a-form-item>
      </a-form>
    </a-modal>

    <!-- 其他弹窗和功能保持与验收管理中心类似 -->
    <!-- 项目详情弹窗、录入结论弹窗、编辑会议弹窗、通知弹窗等 -->
  </div>
</template>

<script setup>
/**
 * 中期会议管理页面
 * 功能：中期材料审核、中期会议安排、中期结论录入
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  CalendarOutlined,
  AuditOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  ScheduleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MessageOutlined,
  FileTextOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const router = useRouter()

// 页面状态
const activeTab = ref('pending')
const showFlowDescription = ref(false)
const arrangeMeetingVisible = ref(false)
const selectedMeeting = ref(null)

// 表单引用
const meetingFormRef = ref()

// 统计数据
const stats = ref({
  pendingReview: 8,
  pendingMeeting: 6,
  passed: 15,
  rejected: 3
})

// 会议表单数据
const meetingForm = ref({
  meetingTime: undefined,
  location: '',
  meetingType: undefined,
  chairperson: [],
  experts: [],
  materials: [],
  description: ''
})

// 表单验证规则
const meetingRules = {
  meetingTime: [{ required: true, message: '请选择会议时间' }],
  location: [{ required: true, message: '请输入会议地点' }],
  meetingType: [{ required: true, message: '请选择会议形式' }],
  chairperson: [{ required: true, message: '请选择主持人' }],
  experts: [{ required: true, message: '请选择评审专家' }]
}

// 选项数据
const chairpersonOptions = ref([
  '张教授', '李主任', '王研究员', '陈主任'
])

const expertOptions = ref([
  '刘专家', '赵博士', '孙教授', '周研究员', '吴主任', '郑博士'
])

// 模拟数据 - 待安排会议
const pendingMeetings = ref([
  {
    id: 1,
    projectName: '智慧城市大数据平台建设项目',
    projectCode: 'PROJ-2024-001',
    leader: '张三',
    submitDate: '2024-06-10',
    checkType: '会议检查',
    progress: 65,
    status: '待安排'
  },
  {
    id: 2,
    projectName: '区块链供应链金融平台',
    projectCode: 'PROJ-2024-002',
    leader: '李四',
    submitDate: '2024-06-15',
    checkType: '线上检查',
    progress: 70,
    status: '待安排'
  }
])

// 模拟数据 - 已安排会议
const scheduledMeetings = ref([
  {
    id: 3,
    projectName: '人工智能医疗诊断系统',
    projectCode: 'PROJ-2024-003',
    leader: '王五',
    meetingTime: '2024-08-15 14:00',
    location: '学术报告厅A',
    chairperson: '张教授',
    status: '已安排'
  }
])

// 模拟数据 - 已完成会议
const completedMeetings = ref([
  {
    id: 4,
    projectName: '物联网智能监控平台',
    projectCode: 'PROJ-2024-004',
    leader: '赵六',
    meetingTime: '2024-07-20 10:00',
    completedTime: '2024-07-20 12:00',
    conclusion: '中期通过'
  }
])

// 计算属性和方法
const toggleFlowDescription = () => {
  showFlowDescription.value = !showFlowDescription.value
}

const handleTabChange = (key) => {
  console.log('切换标签页:', key)
}

const handleBatchReview = () => {
  message.info('批量审核功能开发中...')
}

const arrangeMeeting = (meeting) => {
  selectedMeeting.value = meeting
  arrangeMeetingVisible.value = true
  // 重置表单
  meetingForm.value = {
    meetingTime: undefined,
    location: '',
    meetingType: undefined,
    chairperson: [],
    experts: [],
    materials: [],
    description: ''
  }
}

const handleArrangeMeeting = async () => {
  try {
    await meetingFormRef.value.validate()
    
    // 模拟安排会议操作
    const newScheduledMeeting = {
      ...selectedMeeting.value,
      meetingTime: meetingForm.value.meetingTime.format('YYYY-MM-DD HH:mm'),
      location: meetingForm.value.location,
      meetingType: meetingForm.value.meetingType,
      chairperson: meetingForm.value.chairperson.join('、'),
      experts: meetingForm.value.experts,
      materials: meetingForm.value.materials,
      description: meetingForm.value.description,
      status: '已安排'
    }

    // 从待安排列表移除，添加到已安排列表
    const index = pendingMeetings.value.findIndex(m => m.id === selectedMeeting.value.id)
    if (index > -1) {
      pendingMeetings.value.splice(index, 1)
      scheduledMeetings.value.push(newScheduledMeeting)
    }

    arrangeMeetingVisible.value = false
    message.success('中期会议安排成功！')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const cancelArrangeMeeting = () => {
  arrangeMeetingVisible.value = false
  selectedMeeting.value = null
}

const beforeUploadMaterial = (file) => {
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    message.error('文件大小不能超过50MB')
  return false
}
  return false // 阻止自动上传
}

const removeMaterial = (file) => {
  const index = meetingForm.value.materials.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    meetingForm.value.materials.splice(index, 1)
  }
}

const getMeetingStatusColor = (status) => {
  const colorMap = {
    '已安排': 'blue',
    '已开始': 'processing',
    '进行中': 'processing',
    '已完成': 'success'
  }
  return colorMap[status] || 'default'
}

const getConclusionColor = (conclusion) => {
  const colorMap = {
    '中期通过': 'green',
    '有条件通过': 'orange',
    '中期未通过': 'red'
  }
  return colorMap[conclusion] || 'default'
}

const viewProjectDetails = (meeting) => {
  message.info(`查看项目详情: ${meeting.projectName}`)
}

const enterConclusion = (meeting) => {
  message.info(`录入中期结论: ${meeting.projectName}`)
}

const editMeeting = (meeting) => {
  message.info(`编辑会议: ${meeting.projectName}`)
}

const deleteMeeting = (meeting) => {
  message.info(`删除会议: ${meeting.projectName}`)
}

const notifyParticipants = (meeting) => {
  message.info(`一键通知参会人员: ${meeting.projectName}`)
}

const viewConclusion = (meeting) => {
  message.info(`查看中期结论: ${meeting.projectName}`)
}

// 生命周期
onMounted(() => {
  // 初始化页面数据
})
</script>

<style scoped>
.midterm-meeting-management {
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
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border-left: 4px solid;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-card.pending {
  border-left-color: #faad14;
}

.stat-card.reviewing {
  border-left-color: #1890ff;
}

.stat-card.completed {
  border-left-color: #52c41a;
}

.stat-card.rejected {
  border-left-color: #ff4d4f;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
  color: white;
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #faad14, #d48806);
}

.stat-card.reviewing .stat-icon {
  background: linear-gradient(135deg, #1890ff, #096dd9);
}

.stat-card.completed .stat-icon {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.stat-card.rejected .stat-icon {
  background: linear-gradient(135deg, #ff4d4f, #cf1322);
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
  color: #8c8c8c;
  font-size: 14px;
}

/* 内容卡片样式 */
.content-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  overflow: hidden;
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
  color: #262626;
  display: flex;
  align-items: center;
}

.card-header h3 .anticon {
  margin-right: 8px;
  color: #1890ff;
}

/* 流程描述样式 */
.flow-description {
  margin-bottom: 24px;
}

.flow-content {
  padding: 24px;
}

.step-description {
  color: #8c8c8c;
  font-size: 12px;
}

.step-status-tags {
  margin-top: 4px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* 会议列表样式 */
.meeting-list {
  padding: 24px;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: #8c8c8c;
}

.empty-state .anticon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d9d9d9;
}

.meeting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.meeting-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.meeting-item:last-child {
  margin-bottom: 0;
}

.meeting-info {
  flex: 1;
  margin-right: 24px;
}

.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  flex: 1;
  margin-right: 12px;
}

.project-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.detail-row {
  display: flex;
  font-size: 14px;
}

.detail-row .label {
  color: #8c8c8c;
  margin-right: 8px;
  min-width: 80px;
}

.detail-row .value {
  color: #262626;
  font-weight: 500;
}

.meeting-actions {
  flex-shrink: 0;
}

/* 弹窗样式 */
.project-info-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.project-info-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.upload-tip {
  margin-top: 8px;
  color: #8c8c8c;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .midterm-meeting-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .meeting-item {
    flex-direction: column;
    gap: 16px;
  }
  
  .meeting-info {
    margin-right: 0;
  }
  
  .project-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .project-details {
    grid-template-columns: 1fr;
  }
}
</style> 