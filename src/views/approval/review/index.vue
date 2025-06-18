<template>
  <div class="approval-review-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <ScheduleOutlined /> 立项论证会管理
        </h1>
        <p class="page-desc">组织和管理立项论证会，收集专家意见，生成论证结论</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="handleSendMeetingNotice">
          <MailOutlined /> 发送会议通知
        </a-button>
        <!-- OA系统会议通知/日程对接标记 -->
        <a-tag color="red">对接OA系统会议通知/日程</a-tag>
      </div>
    </div>

    <!-- 论证会计划与组织区 -->
    <a-card class="plan-section" title="论证会计划">
      <a-form :model="meetingPlan" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="会议时间" required>
              <a-date-picker v-model:value="meetingPlan.date" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="会议地点" required>
              <a-input v-model:value="meetingPlan.location" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="会议主题" required>
              <a-input v-model:value="meetingPlan.title" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="会议议程安排">
          <a-textarea v-model:value="meetingPlan.agenda" :rows="2" />
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 参会人员管理区 -->
    <a-card class="attendees-section" title="参会人员管理">
      <a-table :columns="attendeeColumns" :data-source="attendees" rowKey="id" bordered>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'name'">
            <a-input v-model:value="record.name" placeholder="姓名" />
          </template>
          <template v-else-if="column.key === 'role'">
            <a-select v-model:value="record.role" style="width: 120px">
              <a-select-option value="专家">专家</a-select-option>
              <a-select-option value="分管领导">分管领导</a-select-option>
              <a-select-option value="职能部门">职能部门</a-select-option>
              <a-select-option value="项目组">项目组</a-select-option>
            </a-select>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-button type="link" danger size="small" @click="removeAttendee(index)">移除</a-button>
          </template>
        </template>
      </a-table>
      <a-button type="dashed" @click="addAttendee" style="margin-top: 12px;">
        添加参会人员
      </a-button>
    </a-card>

    <!-- 会议资料分发区 -->
    <a-card class="materials-section" title="会议资料分发">
      <a-table :columns="materialColumns" :data-source="materials" rowKey="name" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'file'">
            <a-upload
              :file-list="record.fileList"
              :before-upload="file => beforeUpload(file, record)"
              :on-remove="file => onRemove(file, record)"
              :max-count="1"
            >
              <a-button type="link">上传</a-button>
            </a-upload>
          </template>
          <template v-else-if="column.key === 'template'">
            <a-button type="link" @click="downloadTemplate(record)">
              下载模板
            </a-button>
            <!-- 若模板需从外部系统获取，显著标记 -->
            <a-tag v-if="record.fromExternal" color="orange">外部系统获取</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 论证过程与意见收集区 -->
    <a-card class="opinion-section" title="专家意见与会议纪要">
      <a-table :columns="opinionColumns" :data-source="opinions" rowKey="id" bordered>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'expert'">
            <a-input v-model:value="record.expert" placeholder="专家姓名" />
          </template>
          <template v-else-if="column.key === 'opinion'">
            <a-textarea v-model:value="record.opinion" :rows="2" placeholder="专家意见" />
          </template>
          <template v-else-if="column.key === 'score'">
            <a-input-number v-model:value="record.score" :min="0" :max="100" />
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-button type="link" danger size="small" @click="removeOpinion(index)">移除</a-button>
          </template>
        </template>
      </a-table>
      <a-button type="dashed" @click="addOpinion" style="margin-top: 12px;">
        添加专家意见
      </a-button>
      <a-form-item label="会议纪要" style="margin-top: 16px;">
        <a-textarea v-model:value="meetingSummary" :rows="3" placeholder="请输入会议纪要..." />
      </a-form-item>
    </a-card>

    <!-- 论证结论文件上传区 -->
    <a-card class="conclusion-section" title="论证结论文件上传">
      <a-upload
        :file-list="conclusionFileList"
        :before-upload="beforeUploadConclusion"
        :on-remove="onRemoveConclusion"
        :max-count="1"
      >
        <a-button type="link">上传结论文件</a-button>
      </a-upload>
      <!-- 若结论模板需从外部系统获取，显著标记 -->
      <a-tag color="orange">结论模板如需外部系统获取请在此标记</a-tag>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ScheduleOutlined,
  MailOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'

/**
 * 会议计划表单
 */
const meetingPlan = ref({
  date: '',
  location: '',
  title: '',
  agenda: ''
})

/**
 * 参会人员表格列
 */
const attendeeColumns = [
  { title: '姓名', key: 'name', width: '30%' },
  { title: '角色', key: 'role', width: '30%' },
  { title: '操作', key: 'actions', width: '10%' }
]
const attendees = ref([
  { id: 'A001', name: '张三', role: '专家' },
  { id: 'A002', name: '李四', role: '分管领导' }
])
function addAttendee() {
  attendees.value.push({ id: `A${attendees.value.length + 1}`, name: '', role: '' })
}
function removeAttendee(index) {
  attendees.value.splice(index, 1)
}

/**
 * 会议资料表格列
 */
const materialColumns = [
  { title: '资料名称', dataIndex: 'name', key: 'name' },
  { title: '模板下载', key: 'template', width: 120 },
  { title: '文件上传', key: 'file', width: 180 }
]
const materials = ref([
  { name: '论证会通知', fileList: [], fromExternal: false },
  { name: '会议议程', fileList: [], fromExternal: false },
  { name: '专家名单', fileList: [], fromExternal: false },
  { name: '外部参考资料', fileList: [], fromExternal: true } // 外部系统获取
])
function beforeUpload(file, record) {
  record.fileList = [file]
  return false
}
function onRemove(file, record) {
  record.fileList = []
}
function downloadTemplate(record) {
  if (record.fromExternal) {
    message.info('该模板需从外部系统获取')
  } else {
    message.success('模板下载功能开发中...')
  }
}

/**
 * 专家意见表格列
 */
const opinionColumns = [
  { title: '专家', key: 'expert', width: '20%' },
  { title: '意见', key: 'opinion', width: '50%' },
  { title: '打分', key: 'score', width: '15%' },
  { title: '操作', key: 'actions', width: '10%' }
]
const opinions = ref([
  { id: 'O001', expert: '张三', opinion: '', score: 0 }
])
function addOpinion() {
  opinions.value.push({ id: `O${opinions.value.length + 1}`, expert: '', opinion: '', score: 0 })
}
function removeOpinion(index) {
  opinions.value.splice(index, 1)
}

/**
 * 会议纪要
 */
const meetingSummary = ref('')

/**
 * 结论文件上传
 */
const conclusionFileList = ref([])
function beforeUploadConclusion(file) {
  conclusionFileList.value = [file]
  return false
}
function onRemoveConclusion(file) {
  conclusionFileList.value = []
}

/**
 * 发送会议通知（对接OA系统）
 */
function handleSendMeetingNotice() {
  // TODO: 对接OA系统会议通知/日程
  message.success('会议通知已发送（模拟）')
}

const route = useRoute()
const selectedProjectId = ref('')
onMounted(() => {
  if (route.query.projectId) {
    selectedProjectId.value = route.query.projectId
  }
})
</script>

<style scoped>
.approval-review-page {
  padding: 24px;
  background: #f5f7fa;
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
.header-actions {
  display: flex;
  gap: 12px;
}
.plan-section,
.attendees-section,
.materials-section,
.opinion-section,
.conclusion-section {
  margin-bottom: 24px;
}
</style> 