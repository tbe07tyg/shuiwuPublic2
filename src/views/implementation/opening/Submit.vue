<template>
  <div class="opening-submit-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <FileAddOutlined /> 项目开题材料提交
        </h1>
        <p class="page-desc">管理项目开题所需的各类申请材料，支持材料上传、预算解析</p>
      </div>
      <div class="header-actions" style="display: flex; align-items: center; gap: 16px;">
        <a-select v-model:value="selectedProjectId" style="width: 260px" @change="onProjectChange">
          <a-select-option v-for="item in projectOptions" :key="item.id" :value="item.id">
            {{ item.title }}
          </a-select-option>
        </a-select>
        <a-button type="primary" @click="handleSubmit">
          <SendOutlined /> 提交审批
        </a-button>
      </div>
    </div>

    <!-- 材料提交截止时间设置 -->
    <a-card class="deadline-section" title="材料提交截止时间设置">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="截止时间" required>
              <a-date-picker 
                v-model:value="submitDeadline" 
                show-time 
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%" 
                placeholder="请设置材料提交截止时间"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="提醒设置">
              <a-select v-model:value="reminderSetting" style="width: 100%">
                <a-select-option value="1day">截止前1天提醒</a-select-option>
                <a-select-option value="3days">截止前3天提醒</a-select-option>
                <a-select-option value="1week">截止前1周提醒</a-select-option>
                <a-select-option value="custom">自定义提醒</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="操作">
              <a-button type="primary" @click="saveDeadline" style="margin-right: 8px;">
                保存设置
              </a-button>
              <a-button @click="sendDeadlineNotice">
                发送通知
              </a-button>
            </a-form-item>
          </a-col>
        </a-row>
        <a-alert 
          v-if="submitDeadline"
          :message="`当前截止时间：${formatDeadline(submitDeadline)}`"
          type="info" 
          show-icon
          style="margin-top: 12px;"
        />
      </a-form>
    </a-card>

    <!-- 材料上传与管理区 -->
    <a-card class="materials-section" title="开题材料上传与管理">
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
            <div v-if="record.fileList && record.fileList.length > 0" style="margin-top: 4px;">
              <a-tag color="blue" v-for="file in record.fileList" :key="file.uid || file.name" style="margin-bottom: 4px;">
                <span>{{ file.name }}</span>
                <a @click.stop="downloadFile(file)" style="margin-left: 8px;">下载</a>
                <a @click.stop="removeFile(record, file)" style="margin-left: 8px; color: #ff4d4f;">删除</a>
              </a-tag>
            </div>
            <span v-if="record.rejected" style="color: #ff4d4f; margin-left: 8px;">需重新上传</span>
          </template>
          <template v-else-if="column.key === 'template'">
            <a-button type="link" @click="downloadTemplate(record)">
              下载模板
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 预算解析区 -->
    <a-card class="budget-section" title="开题预算解析">
      <a-alert
        message="上传Excel后自动解析开题预算科目和金额，结果如下："
        type="info"
        show-icon
      />
      <a-upload :before-upload="handleBudgetExcel" :show-upload-list="false">
        <a-button type="primary" style="margin-bottom: 12px;">上传开题预算Excel</a-button>
      </a-upload>
      <a-table :columns="budgetColumns" :data-source="budgetData" bordered size="small" />
    </a-card>

    <!-- 材料完整性校验区 -->
    <a-card class="integrity-section" title="材料完整性校验">
      <a-alert
        :message="integrityMessage"
        :type="integrityStatus === '完整' ? 'success' : 'warning'"
        show-icon
      />
      <a-list :data-source="integrityList" bordered>
        <template #renderItem="{ item }">
          <a-list-item>
            <a-badge :status="item.status === '已上传' ? 'success' : 'error'" :text="item.name + ' - ' + item.status" />
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  FileAddOutlined,
  SendOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { useApprovalStore } from '@/store/approval'

const approvalStore = useApprovalStore()
const router = useRouter()
const route = useRoute()

// 项目选择相关
const selectedProjectId = ref('')
const projectOptions = computed(() => approvalStore.approvalList.map(p => ({ id: p.id, title: p.title })))

// 截止时间相关
const submitDeadline = ref('')
const reminderSetting = ref('3days')

onMounted(() => {
  if (route.query.id) {
    selectedProjectId.value = route.query.id
    loadProjectMaterials(route.query.id)
  } else if (approvalStore.approvalList.length > 0) {
    selectedProjectId.value = approvalStore.approvalList[0].id
    loadProjectMaterials(selectedProjectId.value)
  }
})

function onProjectChange(id) {
  loadProjectMaterials(id)
}

// 材料表格列
const materialColumns = [
  { title: '材料名称', dataIndex: 'name', key: 'name' },
  { title: '模板下载', key: 'template', width: 120 },
  { title: '文件上传', key: 'file', width: 180 }
]

// 开题材料数据
const materials = ref([
  { name: '项目开题报告', fileList: [], rejected: false },
  { name: '项目实施方案', fileList: [], rejected: false },
  { name: '开题预算明细', fileList: [], rejected: false },
  { name: '技术路线图', fileList: [], rejected: false }
])

// 预算表格列
const budgetColumns = [
  { title: '预算科目', dataIndex: 'subject', key: 'subject' },
  { title: '金额(元)', dataIndex: 'amount', key: 'amount' }
]

// 预算数据
const budgetData = ref([])

// 完整性校验数据
const integrityList = ref([
  { name: '项目开题报告', status: '未上传' },
  { name: '项目实施方案', status: '未上传' },
  { name: '开题预算明细', status: '未上传' },
  { name: '技术路线图', status: '未上传' }
])
const integrityStatus = ref('不完整')
const integrityMessage = ref('请上传所有必需材料')

// 加载项目已上传材料
function loadProjectMaterials(projectId) {
  const project = approvalStore.approvalList.find(p => p.id === projectId)
  if (!project) return
  // 模拟加载开题材料
  materials.value.forEach(mat => {
    mat.fileList = []
    mat.rejected = false
  })
  budgetData.value = []
}

// 上传材料
function beforeUpload(file, record) {
  record.fileList = [file]
  record.rejected = false
  updateIntegrity(record.name, '已上传')
  message.success('文件已上传（模拟）')
  return false
}

function onRemove(file, record) {
  record.fileList = []
  record.rejected = false
  updateIntegrity(record.name, '未上传')
}

function updateIntegrity(name, status) {
  const item = integrityList.value.find(i => i.name === name)
  if (item) item.status = status
  integrityStatus.value = integrityList.value.every(i => i.status === '已上传') ? '完整' : '不完整'
  integrityMessage.value = integrityStatus.value === '完整' ? '所有材料已上传，可提交审批' : '请上传所有必需材料'
}

// 下载模板
function downloadTemplate(record) {
  message.success('模板下载功能开发中...')
}

// 预算Excel上传并解析
function handleBudgetExcel(file) {
  budgetData.value = [
    { subject: '人员经费', amount: 30000 },
    { subject: '设备购置', amount: 80000 },
    { subject: '材料费', amount: 20000 }
  ]
  message.success('开题预算Excel已解析')
  return false
}

// 提交审批
function handleSubmit() {
  message.success('开题材料已提交审批（模拟）')
}

function downloadFile(file) {
  message.info('下载示例：' + file.name)
}

function removeFile(record, file) {
  record.fileList = record.fileList.filter(f => f !== file)
  updateIntegrity(record.name, '未上传')
  message.success('已删除示例文件')
}

// 截止时间相关函数
function saveDeadline() {
  if (!submitDeadline.value) {
    message.warning('请先设置截止时间')
    return
  }
  message.success('截止时间设置已保存')
}

function sendDeadlineNotice() {
  if (!submitDeadline.value) {
    message.warning('请先设置截止时间')
    return
  }
  message.success('截止时间通知已发送给相关人员')
}

function formatDeadline(deadline) {
  if (!deadline) return ''
  return deadline.format('YYYY年MM月DD日 HH:mm:ss')
}
</script>

<style scoped>
.opening-submit-page {
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
.deadline-section,
.materials-section,
.budget-section,
.integrity-section {
  margin-bottom: 24px;
}
</style> 