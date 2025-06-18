<template>
  <div class="budget-manager-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <DashboardOutlined /> 经费执行进度 - 管理页面
        </h1>
        <div class="user-role">
          <a-tag color="red">
            <CrownOutlined /> 我的权限：管理员
          </a-tag>
        </div>
      </div>
      <div class="header-actions">
        <a-button 
          v-if="canSwitchToReporter" 
          type="default" 
          @click="switchToReporter"
          style="border-color: #52c41a; color: #52c41a; margin-right: 12px;"
        >
          <UserOutlined /> 切换到填报视图
        </a-button>
        <a-button type="primary" @click="exportReport">
          <DownloadOutlined /> 导出报表
        </a-button>
      </div>
    </div>

    <!-- 统计概览卡片组 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <FundOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatMoney(totalStats.totalBudget) }}</div>
                <div class="stat-label">总预算</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon executed">
                <DollarOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatMoney(totalStats.executedAmount) }}</div>
                <div class="stat-label">已执行</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon rate">
                <PieChartOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalStats.executionRate }}%</div>
                <div class="stat-label">执行率</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon warning">
                <AlertOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalStats.warningProjects }}</div>
                <div class="stat-label">预警项目</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <a-space>
        <a-select v-model:value="filters.project" placeholder="全部项目" style="width: 150px;">
          <a-select-option value="">全部项目</a-select-option>
          <a-select-option v-for="project in allProjects" :key="project.id" :value="project.id">
            {{ project.name }}
          </a-select-option>
        </a-select>
        <a-select v-model:value="filters.year" placeholder="年份" style="width: 120px;">
          <a-select-option value="2024">2024年</a-select-option>
          <a-select-option value="2023">2023年</a-select-option>
        </a-select>
        <a-select v-model:value="filters.status" placeholder="状态" style="width: 120px;">
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="normal">正常</a-select-option>
          <a-select-option value="warning">预警</a-select-option>
          <a-select-option value="danger">超标</a-select-option>
        </a-select>
        <a-input-search 
          v-model:value="filters.keyword" 
          placeholder="搜索项目名称"
          style="width: 200px;"
          @search="handleSearch"
        />
      </a-space>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <a-tabs v-model:activeKey="activeTab" type="card">
        <!-- 项目列表 -->
        <a-tab-pane key="projects" tab="项目列表">
          <a-table 
            :columns="projectColumns" 
            :data-source="filteredProjects" 
            :pagination="{ pageSize: 10 }"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'totalBudget'">
                ¥{{ formatMoney(record.totalBudget) }}
              </template>
              <template v-else-if="column.key === 'executedAmount'">
                ¥{{ formatMoney(record.executedAmount) }}
              </template>
              <template v-else-if="column.key === 'executionRate'">
                <a-progress 
                  :percent="record.executionRate" 
                  size="small" 
                  :stroke-color="getProgressColor(record.executionRate)"
                />
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-button type="link" size="small" @click="viewProjectDetail(record)">
                  详情
                </a-button>
                <a-button type="link" size="small" @click="viewProjectAnalysis(record)">
                  分析
                </a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 统计分析 -->
        <a-tab-pane key="analysis" tab="统计分析">
          <div class="analysis-content">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-card title="执行趋势图" size="small">
                  <div class="chart-container">
                    图表加载中...
                  </div>
                </a-card>
              </a-col>
              <a-col :span="8">
                <a-card title="科目分布饼图" size="small">
                  <div class="chart-container">
                    图表加载中...
                  </div>
                </a-card>
              </a-col>
              <a-col :span="8">
                <a-card title="月度对比柱状图" size="small">
                  <div class="chart-container">
                    图表加载中...
                  </div>
                </a-card>
              </a-col>
            </a-row>
            
            <a-card title="执行效率排行榜" style="margin-top: 16px;">
              <div class="ranking-list">
                <div v-for="(item, index) in executionRanking" :key="item.id" class="ranking-item">
                  <div class="rank-number" :class="getRankClass(index)">
                    {{ index + 1 }}
                  </div>
                  <div class="project-info">
                    <div class="project-name">{{ item.name }}</div>
                    <div class="project-rate">{{ item.executionRate }}% ({{ item.rateDesc }})</div>
                  </div>
                  <div class="progress-bar">
                    <a-progress 
                      :percent="item.executionRate" 
                      size="small" 
                      :stroke-color="getProgressColor(item.executionRate)"
                      :show-info="false"
                    />
                  </div>
                </div>
              </div>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- 预警监控 -->
        <a-tab-pane key="warning" tab="预警监控">
          <a-alert 
            message="系统检测到以下项目存在预警情况" 
            type="warning" 
            show-icon 
            style="margin-bottom: 16px;"
          />
          <a-table 
            :columns="warningColumns" 
            :data-source="warningProjects" 
            :pagination="false"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'executionRate'">
                <a-progress 
                  :percent="record.executionRate" 
                  size="small" 
                  :stroke-color="getProgressColor(record.executionRate)"
                />
              </template>
              <template v-else-if="column.key === 'warningType'">
                <a-tag :color="getWarningColor(record.warningType)">
                  {{ record.warningType }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-button type="link" size="small" @click="handleWarning(record)">
                  处理
                </a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>


      </a-tabs>
    </div>

    <!-- 项目详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="项目执行详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedProject">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="项目名称">{{ selectedProject.name }}</a-descriptions-item>
          <a-descriptions-item label="项目负责人">{{ selectedProject.manager }}</a-descriptions-item>
          <a-descriptions-item label="预算总额">¥{{ formatMoney(selectedProject.totalBudget) }}</a-descriptions-item>
          <a-descriptions-item label="已执行金额">¥{{ formatMoney(selectedProject.executedAmount) }}</a-descriptions-item>
          <a-descriptions-item label="执行率">{{ selectedProject.executionRate }}%</a-descriptions-item>
          <a-descriptions-item label="项目状态">
            <a-tag :color="getStatusColor(selectedProject.status)">
              {{ getStatusText(selectedProject.status) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
        
        <h4 style="margin-top: 24px;">科目执行明细</h4>
        <a-table 
          :columns="detailColumns" 
          :data-source="selectedProject.details || []" 
          :pagination="false"
          size="small"
          bordered
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  DashboardOutlined, 
  CrownOutlined, 
  DownloadOutlined,
  FundOutlined,
  DollarOutlined,
  PieChartOutlined,
  AlertOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 接收props
const props = defineProps({
  userPermissions: {
    type: Object,
    default: () => ({})
  }
})

// 定义事件
const emit = defineEmits(['switch-role'])

// 计算是否可以切换到填报角色
const canSwitchToReporter = computed(() => {
  return props.userPermissions.roles && props.userPermissions.roles.includes('reporter')
})

// 切换到填报角色
const switchToReporter = () => {
  emit('switch-role', 'reporter')
}

// 数据状态
const activeTab = ref('projects')
const detailModalVisible = ref(false)
const selectedProject = ref(null)

// 筛选条件
const filters = ref({
  project: '',
  year: '2024',
  status: '',
  keyword: ''
})

// 统计数据
const totalStats = ref({
  totalBudget: 50000000,
  executedAmount: 32000000,
  executionRate: 64,
  warningProjects: 12
})

// 项目数据
const allProjects = ref([
  {
    id: 'P001',
    name: 'XXX科研项目',
    manager: '张教授',
    totalBudget: 500000,
    executedAmount: 320000,
    executionRate: 64,
    status: 'normal',
    details: [
      { category: '设备费', budgetAmount: 200000, usedAmount: 120000, executionRate: 60 },
      { category: '材料费', budgetAmount: 150000, usedAmount: 100000, executionRate: 67 },
      { category: '人员费', budgetAmount: 100000, usedAmount: 80000, executionRate: 80 },
      { category: '其他费用', budgetAmount: 50000, usedAmount: 20000, executionRate: 40 }
    ]
  },
  {
    id: 'P002',
    name: 'YYY技术研发',
    manager: '李博士',
    totalBudget: 800000,
    executedAmount: 720000,
    executionRate: 90,
    status: 'warning'
  },
  {
    id: 'P003',
    name: 'ZZZ创新项目',
    manager: '王主任',
    totalBudget: 300000,
    executedAmount: 150000,
    executionRate: 50,
    status: 'normal'
  }
])



// 计算属性
const filteredProjects = computed(() => {
  let result = allProjects.value
  
  if (filters.value.project) {
    result = result.filter(p => p.id === filters.value.project)
  }
  
  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status)
  }
  
  if (filters.value.keyword) {
    result = result.filter(p => p.name.includes(filters.value.keyword))
  }
  
  return result
})

const warningProjects = computed(() => {
  return allProjects.value.filter(p => p.executionRate >= 85).map(p => ({
    ...p,
    warningType: p.executionRate >= 95 ? '超支预警' : '接近预算'
  }))
})

const executionRanking = computed(() => {
  return [...allProjects.value]
    .sort((a, b) => b.executionRate - a.executionRate)
    .map(p => ({
      ...p,
      rateDesc: p.executionRate >= 95 ? '超预期' : p.executionRate >= 80 ? '良好' : '滞后'
    }))
})

// 表格列定义
const projectColumns = [
  { title: '项目名称', dataIndex: 'name', key: 'name' },
  { title: '项目负责人', dataIndex: 'manager', key: 'manager' },
  { title: '预算总额', dataIndex: 'totalBudget', key: 'totalBudget' },
  { title: '已执行', dataIndex: 'executedAmount', key: 'executedAmount' },
  { title: '执行率', dataIndex: 'executionRate', key: 'executionRate' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'actions' }
]

const warningColumns = [
  { title: '项目名称', dataIndex: 'name', key: 'name' },
  { title: '执行率', dataIndex: 'executionRate', key: 'executionRate' },
  { title: '预警类型', dataIndex: 'warningType', key: 'warningType' },
  { title: '项目负责人', dataIndex: 'manager', key: 'manager' },
  { title: '操作', key: 'actions' }
]



const detailColumns = [
  { title: '科目', dataIndex: 'category', key: 'category' },
  { title: '预算金额', dataIndex: 'budgetAmount', key: 'budgetAmount' },
  { title: '已使用', dataIndex: 'usedAmount', key: 'usedAmount' },
  { title: '执行率', dataIndex: 'executionRate', key: 'executionRate' }
]

// 方法
const formatMoney = (amount) => {
  return amount.toLocaleString()
}

const getProgressColor = (rate) => {
  if (rate >= 95) return '#ff4d4f'
  if (rate >= 90) return '#fa8c16'
  if (rate >= 70) return '#52c41a'
  return '#1890ff'
}

const getStatusColor = (status) => {
  const colorMap = {
    'normal': 'green',
    'warning': 'orange',
    'danger': 'red'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'normal': '正常',
    'warning': '预警',
    'danger': '超标'
  }
  return textMap[status] || '未知'
}

const getWarningColor = (type) => {
  return type === '超支预警' ? 'red' : 'orange'
}

const getRankClass = (index) => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return ''
}

const handleSearch = () => {
  console.log('搜索:', filters.value.keyword)
}

const viewProjectDetail = (project) => {
  selectedProject.value = project
  detailModalVisible.value = true
}

const viewProjectAnalysis = (project) => {
  message.info(`查看 ${project.name} 的详细分析`)
}

const handleWarning = (project) => {
  message.info(`处理 ${project.name} 的预警`)
}



const exportReport = () => {
  message.success('报表导出成功')
}

onMounted(() => {
  console.log('管理页面已加载')
})
</script>

<style scoped>
.budget-manager-page {
  padding: 24px;
  background: #f5f8ff;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  color: #234fa2;
  margin: 0;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.executed {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.rate {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #234fa2;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.filter-toolbar {
  background: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
  margin-bottom: 24px;
}

.main-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(35,79,162,0.06);
}

.analysis-content {
  padding: 16px;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  color: #666;
}

.ranking-list {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
  background: #d9d9d9;
  margin-right: 16px;
}

.rank-number.rank-first {
  background: #ffd700;
}

.rank-number.rank-second {
  background: #c0c0c0;
}

.rank-number.rank-third {
  background: #cd7f32;
}

.project-info {
  flex: 1;
  margin-right: 16px;
}

.project-name {
  font-weight: 500;
  color: #234fa2;
}

.project-rate {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.progress-bar {
  width: 200px;
}
</style> 