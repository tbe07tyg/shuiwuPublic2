<template>
  <div class="main-layout">
    <a-menu
      mode="inline"
      :selectedKeys="selectedKey"
      :openKeys="openKeys"
      @openChange="onOpenChange"
      class="main-sider"
      @click="onMenuClick"
      :style="{ width: '240px', height: '100vh', borderRadius: '16px 0 0 16px', background: '#fff', padding: '32px 0' }"
      :theme="'light'"
    >
      <a-menu-item key="dashboard">
        <span style="display: flex; align-items: center; width: 100%;">
          <DashboardOutlined style="margin-right:8px;" />
          <span>工作台</span>
          <div class="menu-badge" v-if="unreadCount.dashboard">
            <a-badge :count="unreadCount.dashboard" />
          </div>
        </span>
      </a-menu-item>
      
      <a-sub-menu key="project">
        <template #title>
          <ProjectOutlined style="margin-right:8px;" />
          <span>项目管理</span>
          <div class="menu-badge" v-if="unreadCount.project">
            <a-badge :count="unreadCount.project" />
          </div>
        </template>
        
        <!-- 项目调研 -->
        <a-sub-menu key="project-research">
          <template #title>
            <SearchOutlined style="margin-right:8px;" />
            <span>项目调研</span>
            <div class="urgent-tag" v-if="hasUrgentResearch">🔴</div>
          </template>
          <a-menu-item key="research-requirements">
            <DatabaseOutlined style="margin-right:8px;" />
            <span>需求池管理</span>
            <span class="item-count">({{ counts.requirements }})</span>
          </a-menu-item>
          <a-menu-item key="research-results">
            <FileTextOutlined style="margin-right:8px;" />
            <span>调研记录</span>
            <span class="item-count">({{ counts.results }})</span>
          </a-menu-item>
        </a-sub-menu>
        
        <!-- 项目立项 -->
        <a-sub-menu key="project-approval">
          <template #title>
            <AuditOutlined style="margin-right:8px;" />
            <span>项目立项</span>
            <div class="urgent-tag" v-if="hasUrgentApproval">🔴</div>
          </template>
          <a-menu-item key="approval-center">
            <FileTextOutlined style="margin-right:8px;" />
            <span style="display: flex; align-items: center; width: 100%;">
              <span>立项管理中心</span>
              <span class="item-count"></span>
            </span>
          </a-menu-item>
          <a-menu-item key="approval-materials">
            <FolderOutlined style="margin-right:8px;" />
            <span>申请材料管理</span>
            <span class="item-count">({{ counts.materials }})</span>
          </a-menu-item>
          <a-menu-item key="approval-review">
            <SolutionOutlined style="margin-right:8px;" />
            <span>立项论证会</span>
            <span class="item-count">({{ counts.reviews }})</span>
          </a-menu-item>
          <a-menu-item key="approval-decision">
            <CheckCircleOutlined style="margin-right:8px;" />
            <span>已立项的项目</span>
            <span class="item-count">({{ counts.decisions }})</span>
          </a-menu-item>

        </a-sub-menu>
        
        <!-- 项目实施 -->
        <a-sub-menu key="project-implementation">
          <template #title>
            <SettingOutlined style="margin-right:8px;" />
            <span>项目实施</span>
            <div class="urgent-tag" v-if="hasUrgentImplementation">🔴</div>
          </template>
          <a-menu-item key="implementation-center">
            <AppstoreOutlined style="margin-right:8px;" />
            <span style="display: flex; align-items: center; width: 100%;">
              <span>项目实施管理中心</span>
              <span class="item-count"></span>
            </span>
          </a-menu-item>
          <a-menu-item key="implementation-contract">
            <ContainerOutlined style="margin-right:8px;" />
            <span>合同管理</span>
            <span class="item-count">({{ counts.contracts }})</span>
          </a-menu-item>
          <a-menu-item key="implementation-opening" @click.stop="showDrawer('opening')">
            <span style="display: flex; align-items: center; width: 100%;">
              <RocketOutlined style="margin-right:8px;" />
              <span>项目开题</span>
            </span>
          </a-menu-item>
          <a-menu-item key="implementation-midterm" @click.stop="showDrawer('midterm')">
            <span style="display: flex; align-items: center; width: 100%;">
              <PieChartOutlined style="margin-right:8px;" />
              <span>项目中期</span>
            </span>
          </a-menu-item>
          <a-menu-item key="implementation-acceptance" @click.stop="showDrawer('acceptance')">
            <span style="display: flex; align-items: center; width: 100%;">
              <CheckCircleOutlined style="margin-right:8px;" />
              <span>项目验收</span>
            </span>
          </a-menu-item>
          <a-menu-item key="implementation-payment">
            <DollarOutlined style="margin-right:8px;" />
            <span>经费执行进度</span>
            <span class="item-count">({{ counts.payments }})</span>
          </a-menu-item>
          <a-menu-item key="implementation-progress">
            <BarChartOutlined style="margin-right:8px;" />
            <span>进度监控</span>
            <span class="item-count">({{ counts.progress }})</span>
          </a-menu-item>
        </a-sub-menu>
      </a-sub-menu>
      
      <!-- 成果管理 -->
      <a-menu-item key="achievements">
        <span style="display: flex; align-items: center; width: 100%;">
          <TrophyOutlined style="margin-right:8px;" />
          <span>成果管理</span>
          <span class="item-count">({{ counts.achievements }})</span>
        </span>
      </a-menu-item>
      
      <a-menu-item key="analysis">
        <span style="display: flex; align-items: center; width: 100%;">
          <BarChartOutlined style="margin-right:8px;" />
          <span>统计分析</span>
        </span>
      </a-menu-item>
      <a-menu-item key="knowledge-base">
        <span style="display: flex; align-items: center; width: 100%;">
          <FileTextOutlined style="margin-right:8px;" />
          <span>知识库管理</span>
        </span>
      </a-menu-item>
      <a-sub-menu key="maintenance">
        <template #title>
          <span style="display: flex; align-items: center; width: 100%;">
            <ToolOutlined style="margin-right:8px;" />
            <span>日常维护</span>
          </span>
        </template>

        <a-menu-item key="node-data-maintenance">
          <span style="display: flex; align-items: center; width: 100%;">
            <ClusterOutlined style="margin-right:8px;" />
            <span>节点数据类型维护</span>
          </span>
        </a-menu-item>
        <a-menu-item key="node-template-maintenance">
          <span style="display: flex; align-items: center; width: 100%;">
            <FileTextOutlined style="margin-right:8px;" />
            <span>节点模板库维护</span>
          </span>
        </a-menu-item>
        <a-menu-item key="implementation-nodes">
          <span style="display: flex; align-items: center; width: 100%;">
            <ClusterOutlined style="margin-right:8px;" />
            <span>节点管理计划</span>
            <div class="urgent-tag" v-if="hasUrgentNodes">🔴</div>
          </span>
        </a-menu-item>
        <a-menu-item key="knowledge-maintenance">
          <span style="display: flex; align-items: center; width: 100%;">
            <FileTextOutlined style="margin-right:8px;" />
            <span>知识库维护</span>
          </span>
        </a-menu-item>
        <a-menu-item key="approval-doc-maintenance">
          <span style="display: flex; align-items: center; width: 100%;">
            <FileTextOutlined style="margin-right:8px;" />
            <span>立项申报书维护</span>
          </span>
        </a-menu-item>
        <a-menu-item key="budget-template-maintenance">
          <span style="display: flex; align-items: center; width: 100%;">
            <FileTextOutlined style="margin-right:8px;" />
            <span>预算模板维护</span>
          </span>
        </a-menu-item>
        <a-menu-item key="ppt-template-maintenance">
          <span style="display: flex; align-items: center; width: 100%;">
            <FileTextOutlined style="margin-right:8px;" />
            <span>立项ppt模板维护</span>
          </span>
        </a-menu-item>
        <a-menu-item key="inquiry-sms-template-maintenance">
          <span style="display: flex; align-items: center; width: 100%;">
            <MailOutlined style="margin-right:8px;" />
            <span>询价短信模板维护</span>
          </span>
        </a-menu-item>
        <a-menu-item key="role-permission-maintenance">
          <span style="display: flex; align-items: center; width: 100%;">
            <SafetyOutlined style="margin-right:8px;" />
            <span>角色与权限维护</span>
          </span>
        </a-menu-item>

        <a-menu-item key="staff-maintenance">
          <span style="display: flex; align-items: center; width: 100%;">
            <UserOutlined style="margin-right:8px;" />
            <span>员工管理维护</span>
          </span>
        </a-menu-item>
      </a-sub-menu>
      <a-menu-item key="settings">
        <span style="display: flex; align-items: center; width: 100%;">
          <SettingOutlined style="margin-right:8px;" />
          <span>系统设置</span>
        </span>
      </a-menu-item>
      <a-menu-item key="preview">
        <span style="display: flex; align-items: center; width: 100%;">
          <AppstoreOutlined style="margin-right:8px;" />
          <span>方案预览</span>
        </span>
      </a-menu-item>
    </a-menu>
    
    <div class="main-content">
      <router-view />
    </div>
    
    <!-- 项目阶段选择抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="drawerTitle"
      placement="right"
      width="320"
      @close="closeDrawer"
    >
      <div class="drawer-content">
        <div class="drawer-options">
          <div class="option-item" @click="navigateToPage('submit')">
            <div class="option-icon">
              <FileAddOutlined />
            </div>
            <div class="option-info">
              <h3>材料提交</h3>
              <p>{{ drawerSubtitle.submit }}</p>
            </div>
            <div class="option-arrow">
              <RightOutlined />
            </div>
          </div>
          <div class="option-item" @click="navigateToPage('meeting')">
            <div class="option-icon">
              <ScheduleOutlined />
            </div>
            <div class="option-info">
              <h3>组织会议</h3>
              <p>{{ drawerSubtitle.meeting }}</p>
            </div>
            <div class="option-arrow">
              <RightOutlined />
            </div>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { 
  AppstoreOutlined, ProjectOutlined, FileTextOutlined, SettingOutlined,
  DashboardOutlined, SearchOutlined, AuditOutlined, DatabaseOutlined,
  EnvironmentOutlined, TeamOutlined, FolderOutlined, SolutionOutlined,
  CheckCircleOutlined, ContainerOutlined,
  ClusterOutlined, DollarOutlined, SafetyOutlined,
  UnorderedListOutlined, BarChartOutlined, PieChartOutlined, FundOutlined,
  RocketOutlined, MailOutlined, ToolOutlined, UserOutlined,
  FileAddOutlined, ScheduleOutlined, RightOutlined, TrophyOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

// 选中的菜单项
const selectedKey = computed(() => {
  // 如果有自定义选中状态，优先使用
  if (customSelectedKeys.value.length > 0) {
    return customSelectedKeys.value
  }
  
  const path = route.path
  // 根据路径匹配菜单key
  if (path.includes('/research/')) return [path.replace('/', '').replace('/', '-')]
  if (path.includes('/approval/')) return [path.replace('/', '').replace('/', '-')]
  if (path.includes('/implementation/')) return [path.replace('/', '').replace('/', '-')]
  if (path.includes('/analytics/')) return [path.replace('/', '').replace('/', '-')]
  if (path === '/analytics') return ['analysis']
  if (path.includes('/project/list')) return ['project-list']
  if (path.includes('/project/')) return ['project-overview']
  
  const key = path.replace('/', '')
  return key ? [key] : ['dashboard']
})

// 默认展开的菜单
const openKeys = ref(['project', 'research', 'approval', 'implementation', 'maintenance'])

// 数据统计 (实际项目中从API获取) - v2.0简化版本
const counts = ref({
  requirements: 123,
  results: 32,
  materials: 25,
  reviews: 3,
  decisions: 8,
  contracts: 12,
  payments: 18,
  progress: 25,
  acceptance: 6,
  achievements: 45
})

// 未读数量统计
const unreadCount = ref({
  dashboard: 3,
  project: 15
})

// 紧急事项标识
const hasUrgentResearch = computed(() => true) // 有紧急调研任务
const hasUrgentApproval = computed(() => true) // 有紧急审批
const hasUrgentImplementation = computed(() => true) // 有紧急实施任务
const hasUrgentNodes = computed(() => true) // 有紧急节点

// 抽屉相关状态
const drawerVisible = ref(false)
const currentStage = ref('')
const drawerTitle = ref('')
const customSelectedKeys = ref([])

// 抽屉副标题配置
const drawerSubtitle = computed(() => {
  const subtitles = {
    opening: {
      submit: '上传开题报告、实施方案等材料',
      meeting: '组织开题论证会议、收集专家意见'
    },
    midterm: {
      submit: '提交中期检查报告、阶段性成果',
      meeting: '组织中期检查会议、评审进展'
    },
    acceptance: {
      submit: '提交验收申请、成果材料等',
      meeting: '组织验收会议、专家评审验收'
    }
  }
  return subtitles[currentStage.value] || { submit: '', meeting: '' }
})

function onOpenChange(keys) {
  openKeys.value = keys
}

function onMenuClick({ key }) {
  // 跳过抽屉菜单项
  if (['implementation-opening', 'implementation-midterm', 'implementation-acceptance'].includes(key)) {
    return
  }
  
  // 清除自定义选中状态
  customSelectedKeys.value = []
  
  // 路由映射
  const routeMap = {
    'dashboard': '/dashboard',
    'project-overview': '/project',
    
    // 项目调研路由 (v2.0简化)
    'research-requirements': '/research/requirements',
    'research-results': '/research/results',
    
    // 项目立项路由
    'approval-center': '/approval/center',
    'approval-materials': '/approval/materials',
    'approval-review': '/approval/review',
    'approval-decision': '/approval/decision',
    
    // 项目实施路由
    'implementation-center': '/implementation/center',
    'implementation-contract': '/implementation/contract',
    'implementation-nodes': '/implementation/nodes',
    'implementation-payment': '/implementation/payment',
    'implementation-progress': '/implementation/progress',
    
    // 统计分析路由
    'analysis': '/analytics',
    'analytics-project': '/analytics/project',
    'analytics-finance': '/analytics/finance',
    'analytics-efficiency': '/analytics/efficiency',
    
    // 成果管理路由
    'achievements': '/achievements',
    
    // 其他路由
    'knowledge-base': '/literature',
    'settings': '/settings',
    'preview': '/preview'
  }
  
  const path = routeMap[key]
  if (path) {
    router.push(path)
  }
}

// 显示抽屉
function showDrawer(stage) {
  currentStage.value = stage
  const titles = {
    opening: '项目开题',
    midterm: '项目中期',
    acceptance: '项目验收'
  }
  drawerTitle.value = titles[stage] || ''
  drawerVisible.value = true
  
  // 设置菜单选中状态
  customSelectedKeys.value = [`implementation-${stage}`]
}

// 关闭抽屉
function closeDrawer() {
  drawerVisible.value = false
  currentStage.value = ''
  drawerTitle.value = ''
  // 清除自定义选中状态
  customSelectedKeys.value = []
}

// 导航到具体页面
function navigateToPage(type) {
  const path = `/implementation/${currentStage.value}/${type}`
  router.push(path)
  closeDrawer()
}
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f8ff;
}

.main-sider {
  box-shadow: 2px 0 8px rgba(35,79,162,0.06);
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 32px;
  border-radius: 16px 0 0 16px;
  overflow-y: auto; /* 支持滚动 */
}

/* 一级菜单项样式 */
.main-sider :deep(.ant-menu-item),
.main-sider :deep(.ant-menu-submenu-title) {
  height: 48px !important;
  line-height: 48px !important;
  font-size: 16px !important;
  font-weight: 600;
  border-radius: 8px;
  margin: 8px 0;
  padding: 0 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between;
  transition: background 0.2s, color 0.2s;
  position: relative;
}

/* 菜单图标样式 */
.main-sider :deep(.ant-menu-submenu-title) .anticon,
.main-sider :deep(.ant-menu-item) .anticon {
  font-size: 18px;
  margin-right: 8px;
  vertical-align: middle;
}

/* 选中状态样式 */
.main-sider :deep(.ant-menu-item-selected) {
  background: #234fa2 !important;
  color: #fff !important;
  font-weight: bold;
  box-shadow: 0 2px 8px #234fa233;
}

/* 悬停状态样式 */
.main-sider :deep(.ant-menu-item:hover),
.main-sider :deep(.ant-menu-submenu-title:hover) {
  background: #eaf0fa !important;
  color: #234fa2 !important;
}

/* 二级菜单项样式 */
.main-sider :deep(.ant-menu .ant-menu .ant-menu-item) {
  height: 40px !important;
  line-height: 40px !important;
  font-size: 15px !important;
  font-weight: 500;
  padding: 0 20px 0 40px !important;
  border-radius: 6px;
  margin: 4px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 三级菜单项样式 */
.main-sider :deep(.ant-menu-sub .ant-menu-item) {
  height: 36px !important;
  line-height: 36px !important;
  font-size: 14px !important;
  font-weight: 500;
  padding: 0 16px 0 60px !important;
  border-radius: 6px;
  margin: 2px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 徽章样式 */
.menu-badge {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.menu-badge :deep(.ant-badge) {
  line-height: 1;
}

.menu-badge :deep(.ant-badge-count) {
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  background: #ff4d4f;
  border-radius: 8px;
}

/* 数量标识样式 */
.item-count {
  font-size: 12px;
  color: #8c8c8c;
  margin-left: auto;
  font-weight: normal;
}

/* 紧急标签样式 */
.urgent-tag {
  margin-left: auto;
  font-size: 12px;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

/* 菜单项内容布局 */
.main-sider :deep(.ant-menu-item) > span,
.main-sider :deep(.ant-menu-submenu-title) > span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* 展开/收起状态过渡 */
.main-sider :deep(.ant-menu-submenu) {
  transition: all 0.3s ease;
}

.main-sider :deep(.ant-menu-submenu-open) .ant-menu-submenu-arrow {
  transform: rotate(180deg);
}

/* 滚动条样式 */
.main-sider::-webkit-scrollbar {
  width: 4px;
}

.main-sider::-webkit-scrollbar-track {
  background: transparent;
}

.main-sider::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}

.main-sider::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-sider {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    width: 240px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .main-sider.mobile-open {
    transform: translateX(0);
  }
  
  .main-content {
    padding: 16px;
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .main-layout {
    background: #141414;
  }
  
  .main-sider {
    background: #001529;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
  
  .main-sider :deep(.ant-menu-item:hover),
  .main-sider :deep(.ant-menu-submenu-title:hover) {
    background: #112a47 !important;
    color: #1890ff !important;
  }
  
  .item-count {
    color: #8c9aae;
  }
}

/* 抽屉样式 */
.drawer-content {
  padding: 0;
}

.drawer-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.option-item:hover {
  background: #f8f9ff;
  border-color: #234fa2;
  box-shadow: 0 4px 16px rgba(35, 79, 162, 0.15);
  transform: translateY(-2px);
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f0f5ff;
  border-radius: 12px;
  margin-right: 16px;
  font-size: 20px;
  color: #234fa2;
  transition: all 0.3s ease;
}

.option-item:hover .option-icon {
  background: #234fa2;
  color: #fff;
}

.option-info {
  flex: 1;
}

.option-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.option-info p {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
  line-height: 1.4;
}

.option-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #bfbfbf;
  font-size: 14px;
  transition: all 0.3s ease;
}

.option-item:hover .option-arrow {
  color: #234fa2;
  transform: translateX(4px);
}
</style> 