<template>
  <div class="implementation-center-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">项目实施管理中心</h1>
        <p class="page-desc">集中观察所有实施项目的进展、状态与各环节管理</p>
      </div>
    </div>
    <a-card class="list-section" title="项目实施项目列表">
      <a-table :columns="columns" :data-source="projectList" rowKey="id" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'progress'">
            <div class="progress-cell">
              <a-progress :percent="record.progress" size="small" />
              <span class="progress-text">{{ record.progress }}%</span>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space wrap>
              <a-button 
                type="primary" 
                size="small" 
                @click="goTo('opening', record)"
                :style="{ backgroundColor: '#52c41a', borderColor: '#52c41a' }"
              >
                开题
              </a-button>
              <a-button 
                type="primary" 
                size="small" 
                @click="goTo('midterm', record)"
                :style="{ backgroundColor: '#1890ff', borderColor: '#1890ff' }"
              >
                中期
              </a-button>
              <a-button 
                type="primary" 
                size="small" 
                @click="goTo('acceptance', record)"
                :style="{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }"
              >
                验收
              </a-button>
              <a-button 
                type="primary" 
                size="small" 
                @click="goTo('payment', record)"
                :style="{ backgroundColor: '#722ed1', borderColor: '#722ed1' }"
              >
                经费
              </a-button>
              <a-button 
                type="primary" 
                size="small" 
                @click="goTo('progress', record)"
                :style="{ backgroundColor: '#eb2f96', borderColor: '#eb2f96' }"
              >
                进度监控
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

/**
 * 表格列定义
 */
const columns = [
  { title: '项目名称', dataIndex: 'title', key: 'title', width: 200 },
  { title: '项目编号', dataIndex: 'projectCode', key: 'projectCode', width: 120 },
  { title: '负责人', dataIndex: 'applicant', key: 'applicant', width: 100 },
  { title: '项目类型', dataIndex: 'projectType', key: 'projectType', width: 120 },
  { title: '当前进度', key: 'progress', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '立项时间', dataIndex: 'approvalDate', key: 'approvalDate', width: 120 },
  { title: '操作', key: 'actions', width: 300, fixed: 'right' }
]

// 样例数据
const projectList = ref([
  {
    id: 'P001',
    title: 'XXX科研项目',
    projectCode: 'NSFC-2024-001',
    applicant: '张教授',
    projectType: '技术创新',
    progress: 43, // 基于进度监控计算的百分比
    status: '实施中',
    approvalDate: '2024-01-15',
    budget: 500000,
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  {
    id: 'P002',
    title: 'YYY技术研发项目',
    projectCode: 'PSTC-2024-002',
    applicant: '李博士',
    projectType: '工艺改进',
    progress: 14, // 基于进度监控计算的百分比
    status: '实施中',
    approvalDate: '2024-02-10',
    budget: 300000,
    startDate: '2024-02-01',
    endDate: '2024-11-30'
  },
  {
    id: 'P003',
    title: 'ZZZ创新研究',
    projectCode: 'CORP-2024-003',
    applicant: '王研究员',
    projectType: '设备更新',
    progress: 78,
    status: '实施中',
    approvalDate: '2024-01-20',
    budget: 800000,
    startDate: '2024-01-15',
    endDate: '2025-01-15'
  },
  {
    id: 'P004',
    title: 'AAA基础研究',
    projectCode: 'BASIC-2024-004',
    applicant: '陈教授',
    projectType: '质量提升',
    progress: 100,
    status: '已完成',
    approvalDate: '2023-12-01',
    budget: 200000,
    startDate: '2023-12-01',
    endDate: '2024-11-30'
  },
  {
    id: 'P005',
    title: 'BBB应用开发',
    projectCode: 'APP-2024-005',
    applicant: '刘工程师',
    projectType: '成本控制',
    progress: 25,
    status: '实施中',
    approvalDate: '2024-03-01',
    budget: 450000,
    startDate: '2024-03-01',
    endDate: '2024-12-31'
  }
])

const router = useRouter()

/**
 * 获取状态颜色
 */
const getStatusColor = (status) => {
  const colorMap = {
    '实施中': 'processing',
    '已完成': 'success',
    '暂停': 'warning',
    '终止': 'error'
  }
  return colorMap[status] || 'default'
}

/**
 * 跳转到对应页面并传递项目信息
 * @param {string} type 操作类型
 * @param {object} record 项目记录
 */
function goTo(type, record) {
  const routeMap = {
    opening: '/implementation/opening',
    midterm: '/implementation/midterm', 
    acceptance: '/implementation/acceptance',
    payment: '/implementation/payment',
    progress: '/implementation/progress'
  }
  
  const path = routeMap[type]
  if (path) {
    // 传递完整的项目信息
    router.push({ 
      path, 
      query: { 
        projectId: record.id,
        projectName: record.title,
        projectCode: record.projectCode,
        applicant: record.applicant,
        projectType: record.projectType,
        budget: record.budget,
        startDate: record.startDate,
        endDate: record.endDate,
        approvalDate: record.approvalDate
      } 
    })
  }
}
</script>

<style scoped>
.implementation-center-page {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  display: flex;
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
  font-size: 24px;
  color: #234fa2;
  margin: 0 0 8px 0;
}

.page-desc {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.list-section {
  margin-bottom: 24px;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 35px;
}

/* 操作按钮样式优化 */
:deep(.ant-btn-sm) {
  font-size: 12px;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
}

:deep(.ant-space-item) {
  margin-bottom: 4px;
}
</style> 