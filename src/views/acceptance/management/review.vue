<!--
 * @file 材料审核管理页面 - 管理角色
 * @description 管理角色专门审核验收申请材料的页面
 * @author 科研管理系统
 * @version 3.0.0
 * @date 2025-01-22
-->
<template>
  <div class="material-review-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">
            <FileSearchOutlined />
          </span>
          材料审核管理
        </h1>
        <p class="page-description">
          审核验收申请材料，确保材料完整性和规范性
        </p>
      </div>
      <div class="header-actions">
        <a-space>
          <a-button @click="batchApprove">
            <CheckOutlined />
            批量通过
          </a-button>
          <a-button @click="exportReviewReport">
            <ExportOutlined />
            导出报告
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 审核统计 -->
    <div class="review-stats">
      <a-row :gutter="24">
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
              <div class="stat-label">已驳回</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card total">
            <div class="stat-icon">
              <FileTextOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">总申请</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <a-form layout="inline" :model="filters" @finish="handleFilter">
        <a-form-item label="审核状态">
          <a-select
            v-model:value="filters.status"
            placeholder="选择状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="rejected">已驳回</a-select-option>
            <a-select-option value="need_supplement">需补充</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="项目类型">
          <a-select
            v-model:value="filters.projectType"
            placeholder="选择类型"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="research">科研项目</a-select-option>
            <a-select-option value="development">开发项目</a-select-option>
            <a-select-option value="cooperation">合作项目</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="提交时间">
          <a-range-picker
            v-model:value="filters.dateRange"
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item label="项目名称">
          <a-input
            v-model:value="filters.keyword"
            placeholder="搜索项目名称"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <SearchOutlined />
              查询
            </a-button>
            <a-button @click="resetFilters">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 审核列表 -->
    <div class="review-list">
      <div class="list-header">
        <h3>
          <UnorderedListOutlined />
          材料审核列表
        </h3>
        <div class="header-actions">
          <a-checkbox
            v-model:checked="selectAll"
            :indeterminate="indeterminate"
            @change="handleSelectAll"
          >
            全选
          </a-checkbox>
        </div>
      </div>

      <div class="review-items">
        <div
          v-for="item in filteredReviewList"
          :key="item.id"
          class="review-item"
          :class="{ selected: selectedItems.includes(item.id) }"
        >
          <!-- 选择框和基本信息 -->
          <div class="item-header">
            <div class="item-selection">
              <a-checkbox
                :checked="selectedItems.includes(item.id)"
                @change="handleItemSelect(item.id, $event)"
              />
            </div>
            <div class="item-info">
              <h4 class="project-name">{{ item.projectName }}</h4>
              <div class="project-meta">
                <span class="project-code">{{ item.projectCode }}</span>
                <span class="project-type">{{ getProjectTypeText(item.projectType) }}</span>
                <span class="submit-time">{{ item.submitTime }}</span>
              </div>
            </div>
            <div class="item-status">
              <a-tag :color="getStatusColor(item.status)" size="large">
                {{ getStatusText(item.status) }}
              </a-tag>
              <div class="priority-indicator" :class="item.priority"></div>
            </div>
          </div>

          <!-- 材料清单 -->
          <div class="item-materials">
            <div class="materials-header">
              <h5>提交材料 ({{ item.materials.length }}项)</h5>
              <div class="completeness-indicator">
                <span class="completeness-text">完整性：</span>
                <a-progress
                  :percent="getCompletenessPercent(item.materials)"
                  size="small"
                  :status="getCompletenessStatus(item.materials)"
                />
              </div>
            </div>
            <div class="materials-grid">
              <div
                v-for="material in item.materials"
                :key="material.id"
                class="material-card"
                :class="{ required: material.required, reviewed: material.reviewStatus !== 'pending' }"
              >
                <div class="material-header">
                  <div class="material-info">
                    <span class="material-name">{{ material.name }}</span>
                    <span v-if="material.required" class="required-mark">*</span>
                  </div>
                  <div class="material-status">
                    <a-tag
                      :color="getMaterialStatusColor(material.reviewStatus)"
                      size="small"
                    >
                      {{ getMaterialStatusText(material.reviewStatus) }}
                    </a-tag>
                  </div>
                </div>
                <div class="material-details">
                  <div class="material-meta">
                    <span class="file-size">{{ material.size }}</span>
                    <span class="file-type">{{ material.type }}</span>
                  </div>
                  <div class="material-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="previewMaterial(material)"
                    >
                      预览
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="downloadMaterial(material)"
                    >
                      下载
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="reviewMaterial(item, material)"
                    >
                      审核
                    </a-button>
                  </div>
                </div>
                <div v-if="material.reviewComments" class="material-comments">
                  <div class="comments-title">审核意见：</div>
                  <div class="comments-content">{{ material.reviewComments }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作区域 -->
          <div class="item-actions">
            <div class="action-left">
              <span class="reviewer-info">
                审核人：{{ item.reviewer || '未分配' }}
              </span>
              <span class="review-deadline">
                截止时间：{{ item.deadline }}
              </span>
            </div>
            <div class="action-right">
              <a-space>
                <a-button
                  v-if="item.status === 'pending'"
                  type="primary"
                  @click="quickApprove(item)"
                >
                  快速通过
                </a-button>
                <a-button
                  v-if="item.status === 'pending'"
                  danger
                  @click="quickReject(item)"
                >
                  快速驳回
                </a-button>
                <a-button @click="detailedReview(item)">
                  详细审核
                </a-button>
                <a-button type="link" @click="viewHistory(item)">
                  审核历史
                </a-button>
              </a-space>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredReviewList.length === 0" class="empty-state">
        <a-empty description="暂无待审核材料" />
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :show-size-changer="true"
        :show-quick-jumper="true"
        :show-total="(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
      />
    </div>

    <!-- 详细审核弹窗 -->
    <a-modal
      v-model:open="reviewModalVisible"
      title="详细审核"
      width="1000px"
      @ok="handleDetailedReviewSubmit"
      @cancel="handleDetailedReviewCancel"
    >
      <div v-if="selectedReviewItem" class="detailed-review">
        <!-- 项目基本信息 -->
        <div class="review-section">
          <h4>项目基本信息</h4>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="项目名称" :span="2">
              {{ selectedReviewItem.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="项目编号">
              {{ selectedReviewItem.projectCode }}
            </a-descriptions-item>
            <a-descriptions-item label="项目类型">
              {{ getProjectTypeText(selectedReviewItem.projectType) }}
            </a-descriptions-item>
            <a-descriptions-item label="申请人">
              {{ selectedReviewItem.applicant }}
            </a-descriptions-item>
            <a-descriptions-item label="提交时间">
              {{ selectedReviewItem.submitTime }}
            </a-descriptions-item>
            <a-descriptions-item label="申请说明" :span="2">
              {{ selectedReviewItem.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 材料审核 -->
        <div class="review-section">
          <h4>材料审核</h4>
          <div class="material-review-list">
            <div
              v-for="material in selectedReviewItem.materials"
              :key="material.id"
              class="material-review-item"
            >
              <div class="material-basic">
                <div class="material-name">
                  {{ material.name }}
                  <span v-if="material.required" class="required-mark">*</span>
                </div>
                <div class="material-meta">
                  <span>{{ material.size }}</span>
                  <span>{{ material.type }}</span>
                </div>
              </div>
              <div class="material-review-controls">
                <a-form-item label="审核状态">
                  <a-select
                    v-model:value="material.reviewStatus"
                    style="width: 120px"
                    size="small"
                  >
                    <a-select-option value="approved">通过</a-select-option>
                    <a-select-option value="rejected">驳回</a-select-option>
                    <a-select-option value="need_supplement">需补充</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="审核意见">
                  <a-textarea
                    v-model:value="material.reviewComments"
                    placeholder="请填写审核意见..."
                    :rows="2"
                    style="width: 300px"
                  />
                </a-form-item>
              </div>
            </div>
          </div>
        </div>

        <!-- 整体审核意见 -->
        <div class="review-section">
          <h4>整体审核意见</h4>
          <a-form layout="vertical">
            <a-form-item label="审核结论">
              <a-radio-group v-model:value="reviewForm.conclusion">
                <a-radio value="approved">材料审核通过</a-radio>
                <a-radio value="rejected">材料审核驳回</a-radio>
                <a-radio value="need_supplement">需要补充材料</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="审核意见">
              <a-textarea
                v-model:value="reviewForm.comments"
                placeholder="请填写整体审核意见..."
                :rows="4"
                show-count
                :maxlength="500"
              />
            </a-form-item>
            <a-form-item label="补充要求" v-if="reviewForm.conclusion === 'need_supplement'">
              <a-textarea
                v-model:value="reviewForm.supplementRequirements"
                placeholder="请详细说明需要补充的材料..."
                :rows="3"
                show-count
                :maxlength="300"
              />
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-modal>

    <!-- 审核历史弹窗 -->
    <a-modal
      v-model:open="historyModalVisible"
      title="审核历史"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedHistoryItem" class="review-history">
        <a-timeline>
          <a-timeline-item
            v-for="record in selectedHistoryItem.reviewHistory"
            :key="record.id"
            :color="getHistoryColor(record.action)"
          >
            <template #dot>
              <component :is="getHistoryIcon(record.action)" />
            </template>
            <div class="history-content">
              <div class="history-header">
                <span class="history-action">{{ getHistoryActionText(record.action) }}</span>
                <span class="history-time">{{ record.time }}</span>
              </div>
              <div class="history-details">
                <div class="history-reviewer">审核人：{{ record.reviewer }}</div>
                <div v-if="record.comments" class="history-comments">
                  意见：{{ record.comments }}
                </div>
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * 材料审核管理页面 - 管理角色
 * 功能：材料审核、批量操作、审核历史、状态管理
 */
import { ref, computed, onMounted } from 'vue'
import {
  FileSearchOutlined,
  CheckOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 统计数据
const stats = ref({
  pending: 8,
  approved: 15,
  rejected: 3,
  total: 26
})

// 筛选条件
const filters = ref({
  status: undefined,
  projectType: undefined,
  dateRange: undefined,
  keyword: ''
})

// 选择状态
const selectAll = ref(false)
const indeterminate = ref(false)
const selectedItems = ref([])

// 审核列表数据
const reviewList = ref([
  {
    id: 1,
    projectName: '智慧城市大数据平台建设项目',
    projectCode: 'PROJ-2024-001',
    projectType: 'research',
    status: 'pending',
    priority: 'high',
    submitTime: '2024-01-15 10:30',
    deadline: '2024-01-25',
    applicant: '张三',
    reviewer: '李审核员',
    description: '项目已完成所有开发任务，各项指标达到预期要求',
    materials: [
      {
        id: 1,
        name: '项目验收报告.pdf',
        type: 'PDF',
        size: '2.5MB',
        required: true,
        reviewStatus: 'pending',
        reviewComments: ''
      },
      {
        id: 2,
        name: '项目总结报告.pdf',
        type: 'PDF',
        size: '1.8MB',
        required: true,
        reviewStatus: 'pending',
        reviewComments: ''
      },
      {
        id: 3,
        name: '成果汇总材料.zip',
        type: 'ZIP',
        size: '15.6MB',
        required: true,
        reviewStatus: 'pending',
        reviewComments: ''
      },
      {
        id: 4,
        name: '财务决算报告.pdf',
        type: 'PDF',
        size: '1.2MB',
        required: true,
        reviewStatus: 'pending',
        reviewComments: ''
      }
    ],
    reviewHistory: [
      {
        id: 1,
        action: 'submit',
        time: '2024-01-15 10:30',
        reviewer: '系统',
        comments: '申请已提交，等待审核'
      }
    ]
  },
  {
    id: 2,
    projectName: '区块链供应链金融平台',
    projectCode: 'PROJ-2024-002',
    projectType: 'development',
    status: 'approved',
    priority: 'medium',
    submitTime: '2024-01-20 15:45',
    deadline: '2024-01-30',
    applicant: '李四',
    reviewer: '王审核员',
    description: '项目核心功能已完成，正在进行最终测试',
    materials: [
      {
        id: 5,
        name: '项目验收报告.pdf',
        type: 'PDF',
        size: '3.2MB',
        required: true,
        reviewStatus: 'approved',
        reviewComments: '材料完整，符合要求'
      },
      {
        id: 6,
        name: '财务决算报告.pdf',
        type: 'PDF',
        size: '1.5MB',
        required: true,
        reviewStatus: 'approved',
        reviewComments: '财务数据准确'
      }
    ],
    reviewHistory: [
      {
        id: 1,
        action: 'submit',
        time: '2024-01-20 15:45',
        reviewer: '系统',
        comments: '申请已提交，等待审核'
      },
      {
        id: 2,
        action: 'approve',
        time: '2024-01-21 09:20',
        reviewer: '王审核员',
        comments: '材料齐全，符合验收要求，同意进入验收程序。'
      }
    ]
  }
])

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 弹窗状态
const reviewModalVisible = ref(false)
const historyModalVisible = ref(false)
const selectedReviewItem = ref(null)
const selectedHistoryItem = ref(null)

// 审核表单
const reviewForm = ref({
  conclusion: 'approved',
  comments: '',
  supplementRequirements: ''
})

// 计算属性
const filteredReviewList = computed(() => {
  let result = reviewList.value
  
  if (filters.value.status) {
    result = result.filter(item => item.status === filters.value.status)
  }
  
  if (filters.value.projectType) {
    result = result.filter(item => item.projectType === filters.value.projectType)
  }
  
  if (filters.value.keyword) {
    result = result.filter(item => 
      item.projectName.includes(filters.value.keyword) ||
      item.projectCode.includes(filters.value.keyword)
    )
  }
  
  pagination.value.total = result.length
  return result
})

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    need_supplement: 'blue'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    need_supplement: '需补充'
  }
  return textMap[status] || '未知'
}

const getProjectTypeText = (type) => {
  const textMap = {
    research: '科研项目',
    development: '开发项目',
    cooperation: '合作项目'
  }
  return textMap[type] || '未知类型'
}

const getMaterialStatusColor = (status) => {
  const colorMap = {
    pending: 'default',
    approved: 'green',
    rejected: 'red',
    need_supplement: 'orange'
  }
  return colorMap[status] || 'default'
}

const getMaterialStatusText = (status) => {
  const textMap = {
    pending: '待审',
    approved: '通过',
    rejected: '驳回',
    need_supplement: '需补充'
  }
  return textMap[status] || '未知'
}

const getCompletenessPercent = (materials) => {
  const requiredMaterials = materials.filter(m => m.required)
  const submittedRequired = requiredMaterials.length
  const totalRequired = requiredMaterials.length
  return totalRequired > 0 ? Math.round((submittedRequired / totalRequired) * 100) : 0
}

const getCompletenessStatus = (materials) => {
  const percent = getCompletenessPercent(materials)
  if (percent === 100) return 'success'
  if (percent >= 80) return 'active'
  return 'exception'
}

const getHistoryColor = (action) => {
  const colorMap = {
    submit: 'blue',
    approve: 'green',
    reject: 'red',
    supplement: 'orange'
  }
  return colorMap[action] || 'default'
}

const getHistoryIcon = (action) => {
  const iconMap = {
    submit: FileTextOutlined,
    approve: CheckCircleOutlined,
    reject: CloseCircleOutlined,
    supplement: EditOutlined
  }
  return iconMap[action] || FileTextOutlined
}

const getHistoryActionText = (action) => {
  const textMap = {
    submit: '提交申请',
    approve: '审核通过',
    reject: '审核驳回',
    supplement: '要求补充'
  }
  return textMap[action] || '未知操作'
}

// 事件处理方法
const batchApprove = () => {
  if (selectedItems.value.length === 0) {
    message.warning('请选择要批量通过的项目')
    return
  }
  message.success(`批量通过 ${selectedItems.value.length} 个项目`)
}

const exportReviewReport = () => {
  message.success('导出审核报告')
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const resetFilters = () => {
  filters.value = {
    status: undefined,
    projectType: undefined,
    dateRange: undefined,
    keyword: ''
  }
}

const handleSelectAll = (e) => {
  if (e.target.checked) {
    selectedItems.value = filteredReviewList.value.map(item => item.id)
    indeterminate.value = false
  } else {
    selectedItems.value = []
    indeterminate.value = false
  }
}

const handleItemSelect = (id, e) => {
  if (e.target.checked) {
    selectedItems.value.push(id)
  } else {
    selectedItems.value = selectedItems.value.filter(item => item !== id)
  }
  
  // 更新全选状态
  const total = filteredReviewList.value.length
  const selected = selectedItems.value.length
  selectAll.value = selected === total
  indeterminate.value = selected > 0 && selected < total
}

const previewMaterial = (material) => {
  message.info(`预览材料：${material.name}`)
}

const downloadMaterial = (material) => {
  message.success(`下载材料：${material.name}`)
}

const reviewMaterial = (item, material) => {
  message.info(`审核材料：${material.name}`)
}

const quickApprove = (item) => {
  item.status = 'approved'
  item.reviewer = '当前用户'
  message.success(`快速通过：${item.projectName}`)
}

const quickReject = (item) => {
  item.status = 'rejected'
  item.reviewer = '当前用户'
  message.warning(`快速驳回：${item.projectName}`)
}

const detailedReview = (item) => {
  selectedReviewItem.value = item
  reviewForm.value = {
    conclusion: 'approved',
    comments: '',
    supplementRequirements: ''
  }
  reviewModalVisible.value = true
}

const viewHistory = (item) => {
  selectedHistoryItem.value = item
  historyModalVisible.value = true
}

const handleDetailedReviewSubmit = () => {
  if (selectedReviewItem.value) {
    selectedReviewItem.value.status = reviewForm.value.conclusion
    selectedReviewItem.value.reviewer = '当前用户'
    
    // 添加审核历史
    selectedReviewItem.value.reviewHistory.push({
      id: Date.now(),
      action: reviewForm.value.conclusion === 'approved' ? 'approve' : 
              reviewForm.value.conclusion === 'rejected' ? 'reject' : 'supplement',
      time: new Date().toLocaleString(),
      reviewer: '当前用户',
      comments: reviewForm.value.comments
    })
  }
  
  message.success('审核完成')
  reviewModalVisible.value = false
}

const handleDetailedReviewCancel = () => {
  reviewModalVisible.value = false
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.material-review-management {
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

/* 统计卡片样式 */
.review-stats {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
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

.stat-card.total .stat-icon {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

/* 筛选区域样式 */
.filter-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 审核列表样式 */
.review-list {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 24px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-items {
  display: flex;
  flex-direction: column;
}

.review-item {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.review-item:hover {
  background: #f8f9ff;
}

.review-item.selected {
  background: #e6f7ff;
  border-left: 4px solid #1890ff;
}

.review-item:last-child {
  border-bottom: none;
}

/* 项目头部样式 */
.item-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.item-selection {
  margin-top: 4px;
}

.item-info {
  flex: 1;
}

.project-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.project-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #8c8c8c;
}

.item-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.priority-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.priority-indicator.high {
  background: #ff4d4f;
}

.priority-indicator.medium {
  background: #fa8c16;
}

.priority-indicator.low {
  background: #52c41a;
}

/* 材料区域样式 */
.item-materials {
  margin-bottom: 16px;
}

.materials-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.materials-header h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.completeness-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.completeness-text {
  color: #8c8c8c;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.material-card {
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.material-card:hover {
  background: #f0f5ff;
  border-color: #d6e4ff;
}

.material-card.required {
  border-left: 3px solid #fa8c16;
}

.material-card.reviewed {
  border-left: 3px solid #52c41a;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.material-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.material-name {
  font-weight: 500;
  color: #262626;
}

.required-mark {
  color: #fa8c16;
}

.material-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.material-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.material-actions {
  display: flex;
  gap: 4px;
}

.material-comments {
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  margin-top: 8px;
}

.comments-title {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.comments-content {
  font-size: 12px;
  color: #595959;
  line-height: 1.4;
}

/* 操作区域样式 */
.item-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-left {
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: #8c8c8c;
}

/* 空状态样式 */
.empty-state {
  padding: 60px 24px;
  text-align: center;
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

/* 详细审核弹窗样式 */
.detailed-review {
  max-height: 600px;
  overflow-y: auto;
}

.review-section {
  margin-bottom: 24px;
}

.review-section:last-child {
  margin-bottom: 0;
}

.review-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.material-review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.material-review-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.material-basic {
  flex: 1;
}

.material-review-controls {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* 审核历史样式 */
.review-history {
  max-height: 500px;
  overflow-y: auto;
}

.history-content {
  width: 100%;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-action {
  font-weight: 500;
  color: #262626;
}

.history-time {
  font-size: 12px;
  color: #8c8c8c;
}

.history-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.history-reviewer {
  color: #8c8c8c;
}

.history-comments {
  color: #595959;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .material-review-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-section .ant-form {
    flex-direction: column;
  }
  
  .filter-section .ant-form-item {
    margin-bottom: 16px;
  }
  
  .review-stats .ant-col {
    margin-bottom: 16px;
  }
  
  .materials-grid {
    grid-template-columns: 1fr;
  }
  
  .item-actions {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .action-left {
    flex-direction: column;
    gap: 8px;
  }
  
  .material-review-item {
    flex-direction: column;
  }
  
  .material-review-controls {
    flex-direction: column;
  }
}
</style> 