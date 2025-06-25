<template>
  <PageContainer
    title="需求池管理"
    description="项目调研的起点，收集和管理各类研发需求">
    
    <!-- 页面操作区 -->
    <template #actions>
        <a-button type="primary" @click="showAddModal = true">
          <PlusOutlined />
          新增需求
        </a-button>
        <a-button @click="exportRequirements">
          <DownloadOutlined />
          导出需求
        </a-button>
    </template>

    <!-- 筛选和统计区域 -->
    <div class="filter-section">
      <a-row :gutter="16">
        <a-col :span="18">
          <a-space size="middle">
            <a-select 
              v-model:value="filterStatus" 
              placeholder="需求状态" 
              style="width: 120px"
              @change="handleFilter"
            >
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="待分析">待分析</a-select-option>
              <a-select-option value="进行中">进行中</a-select-option>
              <a-select-option value="已完成">已完成</a-select-option>
              <a-select-option value="已暂停">已暂停</a-select-option>
            </a-select>
            
            <a-select 
              v-model:value="filterPriority" 
              placeholder="优先级" 
              style="width: 100px"
              @change="handleFilter"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="高">高</a-select-option>
              <a-select-option value="中">中</a-select-option>
              <a-select-option value="低">低</a-select-option>
            </a-select>
            
            <a-select 
              v-model:value="filterCategory" 
              placeholder="需求分类" 
              style="width: 120px"
              @change="handleFilter"
            >
              <a-select-option value="">全部分类</a-select-option>
              <a-select-option value="技术创新">技术创新</a-select-option>
              <a-select-option value="工艺改进">工艺改进</a-select-option>
              <a-select-option value="设备更新">设备更新</a-select-option>
              <a-select-option value="质量提升">质量提升</a-select-option>
              <a-select-option value="成本控制">成本控制</a-select-option>
            </a-select>
            
            <a-input-search
              v-model:value="searchKeyword"
              placeholder="搜索需求标题或描述"
              style="width: 250px"
              @search="handleFilter"
            />
          </a-space>
        </a-col>
        <a-col :span="6">
          <div class="total-count-row">
            <span>需求总数</span>
            <span class="count-num">{{ requirements.length }}</span>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 需求状态看板 -->
    <div class="status-board">
      <a-row :gutter="16" v-if="visibleStatusOptions.length > 0" class="card-list">
        <a-col v-for="status in visibleStatusOptions" :key="status.value" :span="6">
          <div class="status-column" :class="`status-${status.color}`">
            <div class="status-header">
              <h3>{{ status.label }}</h3>
              <a-badge :count="getStatusCount(status.value)" :number-style="{ backgroundColor: status.color }" />
            </div>
            <div class="requirement-cards">
              <RequirementCard
                v-for="requirement in getRequirementsByStatus(status.value)"
                :key="requirement.id"
                :requirement="requirement"
                @edit="editRequirement"
                @delete="deleteRequirement"
                @status-change="updateRequirementStatus"
                @priority-change="updateRequirementPriority"
              />
            </div>
          </div>
        </a-col>
      </a-row>
      
      <!-- 当没有筛选结果时显示空状态 -->
      <div v-else class="empty-state">
        <a-empty 
          description="没有找到符合条件的需求"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <a-button type="primary" @click="clearFilters">清除筛选条件</a-button>
        </a-empty>
      </div>
    </div>

    <!-- 需求详情表格（可切换视图） -->
    <div class="table-section" v-show="viewMode === 'table'">
      <a-table
        :columns="tableColumns"
        :data-source="filteredRequirements"
        :pagination="{ pageSize: 10 }"
        :scroll="{ x: 1200 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ record.priority }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'category'">
            <a-tag>{{ record.category }}</a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="editRequirement(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="startResearch(record)">
                开始调研
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="viewRequirement(record)">查看详情</a-menu-item>
                    <a-menu-item @click="duplicateRequirement(record)">复制需求</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item @click="deleteRequirement(record)" style="color: #ff4d4f">
                      删除需求
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link" size="small">
                  更多 <DownOutlined />
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </PageContainer>

    <!-- 新增/编辑需求弹窗 -->
    <RequirementModal
      v-model:visible="showAddModal"
      :requirement="currentRequirement"
      @save="saveRequirement"
    />

    <!-- 需求详情抽屉 -->
    <a-drawer
      v-model:open="showDetailDrawer"
      title="需求详情"
      width="600"
      placement="right"
    >
      <RequirementDetail
        v-if="selectedRequirement"
        :requirement="selectedRequirement"
        @edit="editRequirement"
        @start-research="startResearch"
      />
    </a-drawer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message, Empty } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  FileTextOutlined,
  PlusOutlined,
  DownloadOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import RequirementCard from '@/components/research/RequirementCard.vue'
import RequirementModal from '@/components/research/RequirementModal.vue'
import RequirementDetail from '@/components/research/RequirementDetail.vue'
import PageContainer from '@/components/PageContainer.vue'

const router = useRouter()

/**
 * 响应式数据定义
 */
const requirements = ref([])
const filteredRequirements = ref([])
const showAddModal = ref(false)
const showDetailDrawer = ref(false)
const currentRequirement = ref(null)
const selectedRequirement = ref(null)
const viewMode = ref('board') // 'board' | 'table'

/**
 * 筛选条件
 */
const filterStatus = ref('')
const filterPriority = ref('')
const filterCategory = ref('')
const searchKeyword = ref('')

/**
 * 需求状态选项
 */
const statusOptions = [
  { value: '待分析', label: '待分析', color: '#d9d9d9' },
  { value: '进行中', label: '进行中', color: '#1890ff' },
  { value: '已完成', label: '已完成', color: '#52c41a' },
  { value: '已暂停', label: '已暂停', color: '#faad14' }
]

/**
 * 计算有内容的状态选项（用于看板显示）
 */
const visibleStatusOptions = computed(() => {
  return statusOptions.filter(status => {
    const count = getRequirementsByStatus(status.value).length
    return count > 0
  })
})

/**
 * 表格列定义
 */
const tableColumns = [
  { 
    title: '需求标题', 
    dataIndex: 'title', 
    key: 'title',
    width: 200,
    ellipsis: true
  },
  { 
    title: '需求分类', 
    dataIndex: 'category', 
    key: 'category',
    width: 120
  },
  { 
    title: '优先级', 
    dataIndex: 'priority', 
    key: 'priority',
    width: 80
  },
  { 
    title: '状态', 
    dataIndex: 'status', 
    key: 'status',
    width: 100
  },
  { 
    title: '提出人', 
    dataIndex: 'proposer', 
    key: 'proposer',
    width: 100
  },
  { 
    title: '提出部门', 
    dataIndex: 'proposerDept', 
    key: 'proposerDept',
    width: 100
  },
  { 
    title: '提出时间', 
    dataIndex: 'createdAt', 
    key: 'createdAt',
    width: 120
  },
  { 
    title: '操作', 
    key: 'actions',
    width: 180,
    fixed: 'right'
  }
]

/**
 * 初始化模拟数据
 */
function initMockData() {
  requirements.value = [
    {
      id: 'REQ001',
      title: '智能水质监测系统升级',
      description: '对现有水质监测系统进行智能化升级，增加AI预警功能和大数据分析能力',
      category: '技术创新',
      priority: '高',
      status: '待分析',
      proposer: '张三',
      proposerDept: '技术部',
      createdAt: '2024-01-15',
      expectedEffect: '提升水质监测精度30%，降低人工成本50%，实现24小时无人值守监测',
      attachments: []
    },
    {
      id: 'REQ002', 
      title: '污水处理工艺优化研究',
      description: '研究新型污水处理工艺，提高处理效率，降低能耗',
      category: '工艺改进',
      priority: '中',
      status: '进行中',
      proposer: '李四',
      proposerDept: '工艺部',
      createdAt: '2024-01-20',
      expectedEffect: '处理效率提升20%，能耗降低15%，污水处理达标率99%以上',
      attachments: []
    },
    {
      id: 'REQ003',
      title: '管网漏损检测设备更新',
      description: '更新老旧的管网漏损检测设备，采用声学检测和压力监测技术',
      category: '设备更新',
      priority: '高',
      status: '已完成',
      proposer: '王五',
      proposerDept: '运维部',
      createdAt: '2024-01-10',
      expectedEffect: '漏损率降低25%，维护成本减少40%，管网运行稳定性大幅提升',
      attachments: []
    }
  ]
  
  filteredRequirements.value = [...requirements.value]
}

/**
 * 根据状态获取需求数量（基于筛选后的数据）
 */
function getStatusCount(status) {
  return filteredRequirements.value.filter(req => req.status === status).length
}

/**
 * 根据状态获取需求列表
 */
function getRequirementsByStatus(status) {
  return filteredRequirements.value.filter(req => req.status === status)
}

/**
 * 获取优先级颜色
 */
function getPriorityColor(priority) {
  const colors = { '高': 'red', '中': 'orange', '低': 'blue' }
  return colors[priority] || 'default'
}

/**
 * 获取状态颜色
 */
function getStatusColor(status) {
  const colors = {
    '待分析': 'default',
    '进行中': 'processing', 
    '已完成': 'success',
    '已暂停': 'warning'
  }
  return colors[status] || 'default'
}

/**
 * 筛选处理
 */
function handleFilter() {
  let filtered = [...requirements.value]
  
  if (filterStatus.value) {
    filtered = filtered.filter(req => req.status === filterStatus.value)
  }
  
  if (filterPriority.value) {
    filtered = filtered.filter(req => req.priority === filterPriority.value)
  }
  
  if (filterCategory.value) {
    filtered = filtered.filter(req => req.category === filterCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(req => 
      req.title.toLowerCase().includes(keyword) ||
      req.description.toLowerCase().includes(keyword)
    )
  }
  
  filteredRequirements.value = filtered
}

/**
 * 保存需求
 */
function saveRequirement(requirementData) {
  if (currentRequirement.value) {
    // 编辑现有需求
    const index = requirements.value.findIndex(req => req.id === currentRequirement.value.id)
    requirements.value[index] = { ...requirementData }
    message.success('需求更新成功')
  } else {
    // 新增需求
    const newRequirement = {
      ...requirementData,
      id: `REQ${String(requirements.value.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: '待分析'
    }
    requirements.value.unshift(newRequirement)
    message.success('需求添加成功')
  }
  
  handleFilter()
  showAddModal.value = false
  currentRequirement.value = null
}

/**
 * 编辑需求
 */
function editRequirement(requirement) {
  currentRequirement.value = { ...requirement }
  showAddModal.value = true
}

/**
 * 删除需求
 */
function deleteRequirement(requirement) {
  const index = requirements.value.findIndex(req => req.id === requirement.id)
  requirements.value.splice(index, 1)
  handleFilter()
  message.success('需求删除成功')
}

/**
 * 查看需求详情
 */
function viewRequirement(requirement) {
  selectedRequirement.value = requirement
  showDetailDrawer.value = true
}

/**
 * 复制需求
 */
function duplicateRequirement(requirement) {
  const duplicated = {
    ...requirement,
    id: `REQ${String(requirements.value.length + 1).padStart(3, '0')}`,
    title: `${requirement.title} (副本)`,
    status: '待分析',
    createdAt: new Date().toISOString().split('T')[0]
  }
  requirements.value.unshift(duplicated)
  handleFilter()
  message.success('需求复制成功')
}

/**
 * 更新需求状态
 */
function updateRequirementStatus(requirementId, newStatus) {
  const requirement = requirements.value.find(req => req.id === requirementId)
  if (requirement) {
    requirement.status = newStatus
    handleFilter()
    message.success(`需求状态已更新为：${newStatus}`)
  }
}

/**
 * 更新需求优先级
 */
function updateRequirementPriority(requirementId, newPriority) {
  const requirement = requirements.value.find(req => req.id === requirementId)
  if (requirement) {
    requirement.priority = newPriority
    handleFilter()
    message.success(`需求优先级已更新为：${newPriority}`)
  }
}

/**
 * 开始评估
 */
function startResearch(requirement) {
  // v2.0版本：直接进行内部评估，不再跳转到实地调研页面
  updateRequirementStatus(requirement.id, '进行中')
  message.success('已开始内部评估，请完善评估信息')
}

/**
 * 导出需求
 */
function exportRequirements() {
  // 这里实现导出功能
  message.success('需求导出功能开发中...')
}

/**
 * 清除所有筛选条件
 */
function clearFilters() {
  filterStatus.value = ''
  filterPriority.value = ''
  filterCategory.value = ''
  searchKeyword.value = ''
  handleFilter()
}

/**
 * 生命周期钩子
 */
onMounted(() => {
  initMockData()
})
</script>

<style scoped>
.requirements-management {
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

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  margin-bottom: 24px;
}

.status-stats {
  text-align: right;
}

.status-board {
  margin-bottom: 24px;
}

.status-column {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  min-height: 400px;
  border-top: 4px solid #d9d9d9;
  transition: all 0.3s ease;
}

.status-column.status-#d9d9d9 {
  border-top-color: #d9d9d9;
}

.status-column.status-#1890ff {
  border-top-color: #1890ff;
}

.status-column.status-#52c41a {
  border-top-color: #52c41a;
}

.status-column.status-#faad14 {
  border-top-color: #faad14;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.status-header h3 {
  margin: 0;
  color: #234fa2;
  font-size: 16px;
}

.requirement-cards {
  padding: 16px;
  max-height: 350px;
  overflow-y: auto;
}

.table-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  padding: 24px;
}

.empty-state {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  padding: 60px 24px;
  text-align: center;
}

/**
 * 响应式设计
 */
@media (max-width: 768px) {
  .requirements-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    align-self: stretch;
  }
  
  .status-board .ant-col {
    margin-bottom: 16px;
  }
  
  /* 小屏幕状态列布局：最多2列 */
  .status-board .ant-row .ant-col {
    flex: 0 0 50% !important;
    max-width: 50% !important;
  }
  
  /* 如果只有1个状态，占满整行 */
  .status-board .ant-row .ant-col:only-child {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
  
  .empty-state {
    padding: 40px 16px;
  }
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  overflow-x: hidden;
}
.total-count-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  font-size: 16px;
  font-weight: 500;
}
.total-count-row .count-num {
  color: #234fa2;
  margin-left: 4px;
  font-weight: bold;
  margin-right: 0;
}
</style> 