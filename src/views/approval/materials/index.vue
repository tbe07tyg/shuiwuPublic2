<template>
  <div class="approval-materials-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <FileAddOutlined /> 立项申请材料管理
        </h1>
        <p class="page-desc">管理立项所需的各类申请材料，支持材料上传、预算解析</p>
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

    <!-- 材料上传与管理区 -->
    <a-card class="materials-section" title="申请材料上传与管理">
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
    <a-card class="budget-section" title="预算解析">
      <a-alert
        message="上传Excel后自动解析预算科目和金额，结果如下："
        type="info"
        show-icon
      />
      <a-upload :before-upload="handleBudgetExcel" :show-upload-list="false">
        <a-button type="primary" style="margin-bottom: 12px;">上传预算Excel</a-button>
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

onMounted(() => {
  // 详情跳转自动选中项目
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

// 材料数据（去掉下年度计划文件）
const materials = ref([
  { name: '科技研发项目申报书', fileList: [], rejected: false },
  { name: '科技研发项目预算', fileList: [], rejected: false },
  { name: '科技研发项目立项PPT', fileList: [], rejected: false }
])

// 预算表格列
const budgetColumns = [
  { title: '预算科目', dataIndex: 'subject', key: 'subject' },
  { title: '金额(元)', dataIndex: 'amount', key: 'amount' }
]

// 预算数据
const budgetData = ref([])

// 完整性校验数据（只针对三项材料）
const integrityList = ref([
  { name: '科技研发项目申报书', status: '未上传' },
  { name: '科技研发项目预算', status: '未上传' },
  { name: '科技研发项目立项PPT', status: '未上传' }
])
const integrityStatus = ref('不完整')
const integrityMessage = ref('请上传所有必需材料')

// 加载项目已上传材料
function loadProjectMaterials(projectId) {
  const project = approvalStore.approvalList.find(p => p.id === projectId)
  if (!project) return
  // 自动带入已上传附件
  materials.value.forEach(mat => {
    if (project.fileList && Array.isArray(project.fileList)) {
      const file = project.fileList.find(f => f.name.includes(mat.name.replace('科技研发项目', '')))
      mat.fileList = file ? [file] : []
      mat.rejected = file && file.rejected
    } else {
      mat.fileList = []
      mat.rejected = false
    }
  })
  // 自动带入预算表内容（如有）
  const budgetFile = project.fileList?.find(f => f.name.includes('预算'))
  if (budgetFile && budgetFile.parsedBudget) {
    budgetData.value = budgetFile.parsedBudget
  } else {
    budgetData.value = []
  }
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
  // TODO: 解析Excel，模拟解析结果
  budgetData.value = [
    { subject: '人员经费', amount: 50000 },
    { subject: '设备购置', amount: 120000 },
    { subject: '材料费', amount: 30000 }
  ]
  message.success('预算Excel已解析')
  return false
}

// 提交审批
function handleSubmit() {
  message.success('已提交审批（模拟）')
}

function downloadFile(file) {
  message.info('下载示例：' + file.name)
}
function removeFile(record, file) {
  record.fileList = record.fileList.filter(f => f !== file)
  updateIntegrity(record.name, '未上传')
  message.success('已删除示例文件')
}
</script>

<style scoped>
.approval-materials-page {
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
.import-section,
.materials-section,
.budget-section,
.integrity-section {
  margin-bottom: 24px;
}
.imported-result-preview {
  margin-top: 12px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
}
.budget-actions {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}
</style> 