<template>
  <div class="approval-list-page">
    <!-- 顶部操作区 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <FileTextOutlined /> 项目立项管理清单
          <a-tag :color="userRole === 'admin' ? 'blue' : 'green'" style="margin-left: 12px;">
            {{ userRole === 'admin' ? '管理角色' : '申报单位' }}
          </a-tag>
        </h1>
        <p class="page-desc">
          {{ userRole === 'admin' ? '集中管理所有立项申请，具有批量操作和全面管理权限' : '管理本单位立项申请，负责填写申报信息和上传资料' }}
        </p>
      </div>
      <div class="header-actions">
        <!-- 角色切换按钮（演示用） -->
        <a-button @click="switchRole" style="margin-right: 8px;">
          切换到{{ userRole === 'admin' ? '申报单位' : '管理角色' }}
        </a-button>
        <a-button type="primary" @click="openAddModal">
          <PlusOutlined /> 新建立项申请
        </a-button>
        <a-button v-if="userRole === 'admin'">
          <BarChartOutlined /> 立项数据统计
        </a-button>
      </div>
    </div>

    <!-- 立项流程说明区 -->
    <a-card class="flow-description-section" title="立项流程说明">
      <div class="flow-description">
        <div class="flow-steps">
          <div class="flow-step">
            <div class="step-icon">
              <span class="step-number">1</span>
            </div>
            <div class="step-content">
              <h4>申请材料管理</h4>
              <p>提交立项申请书、需求说明书、预算方案等必要材料，完成初步审核和材料完整性检查。</p>
            </div>
          </div>
          
          <div class="flow-arrow">→</div>
          
          <div class="flow-step">
            <div class="step-icon">
              <span class="step-number">2</span>
            </div>
            <div class="step-content">
              <h4>立项论证会</h4>
              <p>组织专家评审会议，对项目技术可行性、经济效益、风险评估等进行全面论证。</p>
            </div>
          </div>
          
          <div class="flow-arrow">→</div>
          
          <div class="flow-step">
            <div class="step-icon">
              <span class="step-number">3</span>
            </div>
            <div class="step-content">
              <h4>立项审批决策</h4>
              <p>根据论证会结果，由决策层进行最终审批，确定项目是否立项及预算分配。</p>
            </div>
          </div>
                 </div>
      </div>
    </a-card>

    <!-- 立项申请清单表格 -->
    <a-card class="list-section">
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span>立项申请清单</span>
          <a-input
            v-model:value="searchText"
            placeholder="搜索项目名称/申请人/申请单位"
            allow-clear
            style="width: 260px; margin-left: 16px;"
          />
          <div v-if="userRole === 'admin'">
            <!-- 批量操作按钮组 -->
            <div v-if="batchMode" style="display: flex; gap: 8px; align-items: center; padding: 8px 12px; background: #f0f8ff; border: 1px solid #d4edda; border-radius: 6px;">
              <span style="color: #1890ff; font-size: 14px; font-weight: 500;">
                ✓ 已选择 {{ selectedRowKeys.length }} 项
              </span>
              <a-divider type="vertical" />
              <a-button type="primary" size="small" @click="batchApprove" :disabled="selectedRowKeys.length === 0">
                <CheckSquareOutlined />
                批量通过
              </a-button>
              <a-button danger size="small" @click="batchReject" :disabled="selectedRowKeys.length === 0">
                批量驳回
              </a-button>
              <a-button size="small" @click="toggleBatchMode" style="margin-left: 8px;">
                退出批量
              </a-button>
            </div>
            <!-- 批量操作切换按钮 -->
            <a-button v-else type="default" size="small" @click="toggleBatchMode">
              <CheckSquareOutlined />
              批量操作
            </a-button>
          </div>
        </div>
      </template>
      <a-table 
        :columns="columns" 
        :data-source="filteredList" 
        :row-selection="rowSelection"
        :row-class-name="getRowClassName"
        rowKey="id" 
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'attachments'">
            <span v-if="record.fileList && record.fileList.length > 0">
              <a-tag v-for="file in record.fileList" :key="file.uid" color="blue" style="margin: 2px;">
                {{ file.name }}
              </a-tag>
            </span>
            <span v-else style="color: #ccc;">无附件</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <!-- 管理角色：可以编辑所有记录 -->
            <template v-if="userRole === 'admin'">
              <a-button type="link" @click="editApproval(record)">编辑</a-button>
              <a-button type="link" @click="viewDetail(record)">详情</a-button>
            </template>
            <!-- 申报单位角色：只能编辑被驳回或未通过的记录 -->
            <template v-else>
              <a-button 
                type="link" 
                @click="editApproval(record)"
                :disabled="!canApplicantEdit(record)"
                :title="!canApplicantEdit(record) ? '只能编辑被驳回或未通过的申请' : ''"
              >
                编辑
              </a-button>
              <a-button type="link" @click="viewDetail(record)">详情</a-button>
            </template>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新建/编辑立项弹窗 -->
    <a-modal 
      v-model:open="showAddModal" 
      :title="editId ? '编辑立项申请' : '新建立项申请'" 
      @ok="handleSave"
      width="700px"
    >
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="年度" required>
              <a-input-number v-model:value="formData.year" :min="2020" :max="2030" style="width:100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="立项名称" required>
              <a-input v-model:value="formData.title" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="申请人" required>
              <a-input v-model:value="formData.applicant" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="申请单位" required>
              <a-input v-model:value="formData.department" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="项目周期(月)" required>
              <a-input-number v-model:value="formData.duration" :min="1" :max="60" style="width:100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="预算(万元)">
              <a-input-number v-model:value="formData.budget" :min="0" style="width:100%" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="申请时间" required>
              <a-date-picker v-model:value="formData.applyTime" style="width:100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-select 
                v-model:value="formData.status" 
                :disabled="userRole !== 'admin'"
                :placeholder="userRole !== 'admin' ? '状态由管理员设置' : '请选择状态'"
              >
                <a-select-option value="通过">通过</a-select-option>
                <a-select-option value="未通过">未通过</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="科技研发项目申报书" required>
          <a-upload
            v-model:file-list="formData.fileList.declare"
            name="declare"
            :max-count="1"
            :before-upload="file => beforeUpload(file, 'declare')"
            @remove="file => handleRemove(file, 'declare')"
            :show-upload-list="{ showRemoveIcon: true, showPreviewIcon: false }"
          >
            <a-button type="dashed" style="width: 100%;">上传申报书</a-button>
          </a-upload>
        </a-form-item>
        <a-form-item label="科技研发项目立项PPT" required>
          <a-upload
            v-model:file-list="formData.fileList.ppt"
            name="ppt"
            :max-count="1"
            :before-upload="file => beforeUpload(file, 'ppt')"
            @remove="file => handleRemove(file, 'ppt')"
            :show-upload-list="{ showRemoveIcon: true, showPreviewIcon: false }"
          >
            <a-button type="dashed" style="width: 100%;">上传立项PPT</a-button>
          </a-upload>
        </a-form-item>
        <a-form-item label="其它附件">
          <a-upload
            v-model:file-list="formData.fileList.others"
            name="others"
            :multiple="true"
            :before-upload="file => beforeUpload(file, 'others')"
            @remove="file => handleRemove(file, 'others')"
            :show-upload-list="{ showRemoveIcon: true, showPreviewIcon: false }"
          >
            <a-button type="dashed" style="width: 100%;">上传其它材料</a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FileTextOutlined, PlusOutlined, BarChartOutlined, CheckSquareOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useApprovalStore } from '@/store/approval'
import dayjs from 'dayjs'

const approvalStore = useApprovalStore()

/**
 * 用户角色管理（模拟登录用户角色）
 * 'admin' - 管理角色，具有批量操作权限
 * 'applicant' - 申报单位角色，只能管理自己的申请
 */
const userRole = ref('admin') // 可以通过登录状态获取，这里模拟为管理员
const currentUser = ref('系统管理员') // 当前登录用户

/**
 * 切换角色（用于演示）
 */
function switchRole() {
  userRole.value = userRole.value === 'admin' ? 'applicant' : 'admin'
  currentUser.value = userRole.value === 'admin' ? '系统管理员' : '申报用户'
  // 退出批量模式
  batchMode.value = false
  selectedRowKeys.value = []
}

/**
 * 批量操作相关状态
 */
const batchMode = ref(false)
const selectedRowKeys = ref([])

/**
 * 搜索逻辑
 */
const searchText = ref('')
const filteredList = computed(() => {
  if (!searchText.value) return approvalStore.approvalList
  const text = searchText.value.trim().toLowerCase()
  return approvalStore.approvalList.filter(item =>
    (item.title && item.title.toLowerCase().includes(text)) ||
    (item.applicant && item.applicant.toLowerCase().includes(text)) ||
    (item.department && item.department.toLowerCase().includes(text))
  )
})

/**
 * 表格列定义
 */
const columns = computed(() => [
  { title: '年度', dataIndex: 'year', key: 'year' },
  { title: '立项名称', dataIndex: 'title', key: 'title' },
  { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
  { title: '申请单位', dataIndex: 'department', key: 'department' },
  { title: '项目周期(月)', dataIndex: 'duration', key: 'duration' },
  { title: '预算(万元)', dataIndex: 'budget', key: 'budget' },
  { title: '附件', key: 'attachments' },
  { title: '申请时间', dataIndex: 'applyTime', key: 'applyTime' },
  { title: '状态', dataIndex: 'status', key: 'status',
    customRender: ({ text }) => {
      const statusMap = { 
        '待审批': '未通过', 
        '已通过': '通过', 
        '已驳回': '未通过',
        '通过': '通过',
        '未通过': '未通过'
      }
      return statusMap[text] || text
    }
  },
  { title: '操作', key: 'actions' }
])

/**
 * 表格行选择配置
 */
const rowSelection = computed(() => {
  if (!batchMode.value || userRole.value !== 'admin') return null
  
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (selectedKeys) => {
      selectedRowKeys.value = selectedKeys
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (selected) {
        selectedRowKeys.value = filteredList.value.map(item => item.id)
      } else {
        selectedRowKeys.value = []
      }
    }
  }
})

/**
 * 新建/编辑弹窗相关
 */
const showAddModal = ref(false)
const editId = ref(null)
const formData = ref({
  title: '',
  applicant: '',
  department: '',
  year: new Date().getFullYear(),
  duration: 12,
  budget: 0,
  applyTime: null,
  status: '未通过',
  fileList: {
    declare: [],
    ppt: [],
    others: []
  }
})

/**
 * 打开新建申请弹窗
 */
function openAddModal() {
  editId.value = null
  const now = dayjs()
  formData.value = {
    title: '',
    applicant: '',
    department: '',
    year: now.year(),
    duration: 12,
    budget: 0,
    applyTime: now,
    status: '未通过',
    fileList: { declare: [], ppt: [], others: [] }
  }
  showAddModal.value = true
}

/**
 * 编辑立项
 */
function editApproval(record) {
  editId.value = record.id
  // 兼容老数据
  let fileList = { declare: [], ppt: [], others: [] }
  if (Array.isArray(record.fileList)) {
    // 老数据为数组，尝试自动分配
    fileList.declare = record.fileList.filter(f => f.name.includes('申报书'))
    fileList.ppt = record.fileList.filter(f => f.name.toLowerCase().includes('ppt'))
    fileList.others = record.fileList.filter(f => !f.name.includes('申报书') && !f.name.toLowerCase().includes('ppt'))
  } else {
    fileList = record.fileList || { declare: [], ppt: [], others: [] }
  }
  formData.value = {
    ...record,
    applyTime: record.applyTime ? dayjs(record.applyTime) : null,
    fileList
  }
  showAddModal.value = true
}

/**
 * 查看详情
 */
function viewDetail(record) {
  // 跳转到申请材料管理页面，并传递id参数
  router.push({ path: '/approval/materials', query: { id: record.id } })
}

/**
 * 文件上传前的校验
 */
function beforeUpload(file, type) {
  // 文件类型/大小校验可复用
  const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg', 'image/png', 'image/gif', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)
  if (!isValidType) {
    message.error('只能上传 PDF、Word、Excel、PPT、图片格式的文件！')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB！')
    return false
  }
  // 只保存到fileList
  return false
}

/**
 * 移除文件
 */
function handleRemove(file, type) {
  const arr = formData.value.fileList[type]
  const idx = arr.indexOf(file)
  if (idx > -1) arr.splice(idx, 1)
}

/**
 * 保存立项
 */
function handleSave() {
  if (!formData.value.title || !formData.value.applicant || !formData.value.department || !formData.value.year || !formData.value.duration || !formData.value.applyTime) {
    message.error('请填写必填项')
    return
  }
  if (formData.value.fileList.declare.length === 0) {
    message.error('请上传科技研发项目申报书')
    return
  }
  if (formData.value.fileList.ppt.length === 0) {
    message.error('请上传科技研发项目立项PPT')
    return
  }
  // 合并所有附件为数组，便于材料管理页兼容
  const allFiles = [
    ...formData.value.fileList.declare,
    ...formData.value.fileList.ppt,
    ...formData.value.fileList.others
  ]
  const saveData = { ...formData.value, applyTime: formData.value.applyTime ? dayjs(formData.value.applyTime).format('YYYY-MM-DD') : '', fileList: allFiles }
  if (editId.value) {
    const idx = approvalStore.approvalList.findIndex(a => a.id === editId.value)
    approvalStore.approvalList[idx] = { ...saveData }
    message.success('立项申请已更新')
  } else {
    approvalStore.approvalList.unshift({ ...saveData, id: `A${String(approvalStore.approvalList.length + 1).padStart(3, '0')}` })
    message.success('立项申请已创建')
  }
  showAddModal.value = false
  editId.value = null
  formData.value = {
    title: '',
    applicant: '',
    department: '',
    year: new Date().getFullYear(),
    duration: 12,
    budget: 0,
    applyTime: null,
    status: '未通过',
    fileList: { declare: [], ppt: [], others: [] }
  }
}

/**
 * 切换批量模式
 */
function toggleBatchMode() {
  batchMode.value = !batchMode.value
  selectedRowKeys.value = []
}

/**
 * 批量通过
 */
function batchApprove() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要操作的记录')
    return
  }
  
  Modal.confirm({
    title: '确认批量通过',
    content: `确定要将选中的 ${selectedRowKeys.value.length} 条立项申请标记为"通过"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      selectedRowKeys.value.forEach(id => {
        const idx = approvalStore.approvalList.findIndex(a => a.id === id)
        if (idx !== -1) {
          approvalStore.approvalList[idx].status = '通过'
        }
      })
      
      message.success(`已批量通过 ${selectedRowKeys.value.length} 条记录`)
      selectedRowKeys.value = []
    }
  })
}

/**
 * 批量驳回
 */
function batchReject() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要操作的记录')
    return
  }
  
  Modal.confirm({
    title: '确认批量驳回',
    content: `确定要将选中的 ${selectedRowKeys.value.length} 条立项申请标记为"未通过"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      selectedRowKeys.value.forEach(id => {
        const idx = approvalStore.approvalList.findIndex(a => a.id === id)
        if (idx !== -1) {
          approvalStore.approvalList[idx].status = '未通过'
        }
      })
      
      message.success(`已批量驳回 ${selectedRowKeys.value.length} 条记录`)
      selectedRowKeys.value = []
    }
  })
}

/**
 * 设置表格行的样式类名
 */
function getRowClassName(record) {
  if (batchMode.value && selectedRowKeys.value.includes(record.id)) {
    return 'selected-row'
  }
  return ''
}

/**
 * 判断申报单位是否可编辑该条目
 * 允许编辑"未通过"或"已驳回"状态
 */
function canApplicantEdit(record) {
  return record.status === '未通过' || record.status === '已驳回'
}

const router = useRouter()
</script>

<style scoped>
.approval-list-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 批量选择时的行高亮样式 */
:deep(.selected-row) {
  background-color: #e6f7ff !important;
}

:deep(.selected-row:hover) {
  background-color: #bae7ff !important;
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
.flow-description-section,
.list-section {
  margin-bottom: 24px;
}

/* 静态流程说明样式 */
.flow-description {
  padding: 20px 0 8px 0;
}

.flow-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  padding: 0 24px;
}

.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  max-width: 280px;
}

.step-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #234fa2, #4a79c4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(35, 79, 162, 0.3);
}

.step-number {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}

.step-content h4 {
  margin: 0 0 8px 0;
  color: #234fa2;
  font-size: 16px;
  font-weight: 600;
}

.step-content p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.flow-arrow {
  font-size: 24px;
  color: #234fa2;
  font-weight: bold;
  margin: 0 16px;
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .flow-steps {
    flex-direction: column;
    gap: 24px;
    padding: 0 12px;
  }
  
  .flow-step {
    max-width: none;
  }
  
  .flow-arrow {
    transform: rotate(90deg);
    margin: 0;
  }
}
</style> 