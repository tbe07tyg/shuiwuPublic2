<template>
  <div class="main-layout">
    <a-menu
      mode="inline"
      :selectedKeys="selectedKey"
      :openKeys="openKeys"
      @openChange="onOpenChange"
      class="main-sider"
      @click="onMenuClick"
      :theme="'light'"
      :inlineIndent="24"
      :style="{ width: '260px' }"
      :forceSubMenuRender="true"
      :multiple="false"
      :overflowedIndicator="null"
    >
      <!-- 一级菜单项 -->
      <a-menu-item key="dashboard">
        <DashboardOutlined />
        <span>工作台</span>
      </a-menu-item>
      
      <!-- 一级菜单：项目管理 -->
      <a-sub-menu key="project" data-menu-id="project">
        <template #title>
          <ProjectOutlined />
          <span>项目管理</span>
        </template>
        
        <!-- 项目调研 -->
        <a-sub-menu key="project-research" data-menu-id="project-research">
          <template #title>
            <SearchOutlined />
            <span>项目调研</span>
          </template>
          <a-menu-item key="research-requirements">
            <DatabaseOutlined />
            <span>需求池管理</span>
          </a-menu-item>
          <a-menu-item key="research-results">
            <FileTextOutlined />
            <span>调研记录</span>
          </a-menu-item>
        </a-sub-menu>
        
        <!-- 项目立项 -->
        <a-menu-item key="project-approval">
          <AuditOutlined />
          <span>项目立项</span>
        </a-menu-item>
        
        <!-- 项目实施 -->
        <a-sub-menu key="project-implementation" data-menu-id="project-implementation">
          <template #title>
            <SettingOutlined />
            <span>项目实施</span>
          </template>
          
          <!-- 项目开题 - 调整为二级菜单项 -->
          <a-menu-item key="implementation-opening" class="implementation-sub-item">
            <RocketOutlined />
            <span>项目开题</span>
          </a-menu-item>
          
          <!-- 项目中期 - 调整为二级菜单项 -->
          <a-menu-item key="implementation-midterm" class="implementation-sub-item">
            <PieChartOutlined />
            <span>项目中期</span>
          </a-menu-item>
          
          <!-- 其它菜单项保持不变 -->
          <a-menu-item key="implementation-contract" class="implementation-sub-item">
            <ContainerOutlined />
            <span>合同管理</span>
          </a-menu-item>
          
          <a-menu-item key="implementation-payment" class="implementation-sub-item">
            <DollarOutlined />
            <span>经费执行进度</span>
          </a-menu-item>
          
          <a-menu-item key="implementation-progress" class="implementation-sub-item">
            <LineChartOutlined />
            <span>进度监控</span>
          </a-menu-item>
        </a-sub-menu>
        
        <!-- 项目验收 -->
        <a-menu-item key="project-acceptance">
          <CheckCircleOutlined />
          <span>项目验收</span>
        </a-menu-item>
        
        <!-- 历史档案 (与项目调研、立项、实施、验收同级) -->
        <a-sub-menu key="project-archive" data-menu-id="project-archive">
          <template #title>
            <DatabaseOutlined />
            <span>历史档案</span>
          </template>
          <a-menu-item key="project-archive-list">
            <FileTextOutlined />
            <span>档案查看</span>
          </a-menu-item>
        </a-sub-menu>
      </a-sub-menu>
      
      <!-- 成果管理 -->
      <a-menu-item key="achievements">
        <TrophyOutlined />
        <span>成果管理</span>
      </a-menu-item>
      
      <a-menu-item key="analysis">
        <BarChartOutlined />
        <span>统计分析</span>
      </a-menu-item>
      <a-menu-item key="knowledge-base">
        <FileTextOutlined />
        <span>知识库管理</span>
      </a-menu-item>
      <a-sub-menu key="maintenance">
        <template #title>
          <ToolOutlined />
          <span>日常维护</span>
        </template>

        <a-menu-item key="material-template-maintenance">
          <FileTextOutlined />
          <span>材料提交模板维护</span>
        </a-menu-item>
        <a-menu-item key="node-data-maintenance">
          <ClusterOutlined />
          <span>节点数据类型维护</span>
        </a-menu-item>
        <a-menu-item key="node-template-maintenance">
          <FileTextOutlined />
          <span>节点模板库维护</span>
        </a-menu-item>
        <a-menu-item key="implementation-nodes">
          <ClusterOutlined />
          <span>节点管理计划</span>
            <div class="urgent-tag" v-if="hasUrgentNodes">🔴</div>
        </a-menu-item>
        <a-menu-item key="knowledge-maintenance">
          <FileTextOutlined />
          <span>知识库维护</span>
        </a-menu-item>
        <a-menu-item key="approval-doc-maintenance">
          <FileTextOutlined />
          <span>立项申报书维护</span>
        </a-menu-item>
        <a-menu-item key="budget-template-maintenance">
          <FileTextOutlined />
          <span>预算模板维护</span>
        </a-menu-item>
        <a-menu-item key="ppt-template-maintenance">
          <FileTextOutlined />
          <span>立项ppt模板维护</span>
        </a-menu-item>
        <a-menu-item key="inquiry-sms-template-maintenance">
          <MailOutlined />
          <span>询价短信模板维护</span>
        </a-menu-item>
        <a-menu-item key="role-permission-maintenance">
          <SafetyOutlined />
          <span>角色与权限维护</span>
        </a-menu-item>

        <a-menu-item key="staff-maintenance">
          <UserOutlined />
          <span>员工管理维护</span>
        </a-menu-item>
      </a-sub-menu>
      <a-menu-item key="settings">
        <SettingOutlined />
        <span>系统设置</span>
      </a-menu-item>
      <a-menu-item key="preview">
        <AppstoreOutlined />
        <span>方案预览</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { 
  AppstoreOutlined, ProjectOutlined, FileTextOutlined, SettingOutlined,
  DashboardOutlined, SearchOutlined, AuditOutlined, DatabaseOutlined,
  EnvironmentOutlined, TeamOutlined, FolderOutlined, SolutionOutlined,
  CheckCircleOutlined, ContainerOutlined,
  ClusterOutlined, DollarOutlined, SafetyOutlined,
  UnorderedListOutlined, BarChartOutlined, PieChartOutlined, FundOutlined,
  RocketOutlined, MailOutlined, ToolOutlined, UserOutlined,
  FileAddOutlined, ScheduleOutlined, RightOutlined, TrophyOutlined,
  PlusOutlined, FileSearchOutlined, LineChartOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

// 手动管理的选中状态
const manualSelectedKeys = ref([])

// 选中的菜单项
const selectedKey = computed(() => {
  // 优先使用手动管理的选中状态
  if (manualSelectedKeys.value.length > 0) {
    return manualSelectedKeys.value
  }
  
  // 如果有自定义选中状态，使用它
  if (customSelectedKeys.value.length > 0) {
    return customSelectedKeys.value
  }
  
  const path = route.path
  
  // 精确匹配菜单项
  const routeToKeyMap = {
    '/dashboard': 'dashboard',
    '/project': 'project',  // 项目管理父菜单
    
    // 项目调研
    '/research/requirements': 'research-requirements',
    '/research/results': 'research-results',
    
    // 项目立项
    '/approval/center': 'approval-center',
    '/approval/materials': 'approval-materials', 
    '/approval/review': 'approval-review',
    '/approval/decision': 'approval-decision',
    
    // 项目实施
    '/implementation/center': 'implementation-center',
    '/implementation/contract': 'implementation-contract',
    '/implementation/nodes': 'implementation-nodes',
    '/implementation/payment': 'implementation-payment',
    '/implementation/progress': 'implementation-progress',
    '/implementation/opening': 'implementation-opening',
    '/implementation/midterm': 'implementation-midterm',
    '/implementation/approval': 'project-approval',
    '/implementation/acceptance': 'project-acceptance',
    
    // 其他页面
    '/project/archive': 'project-archive-list',
    '/analytics': 'analysis',
    '/achievements': 'achievements',
    '/literature': 'knowledge-base',
    '/settings': 'settings',
    '/preview': 'preview'
  }
  
  // 直接匹配路径
  if (routeToKeyMap[path]) {
    return [routeToKeyMap[path]]
  }
  
  // 处理动态路由和子路径
  if (path.startsWith('/project/') && path !== '/project/archive') {
    return ['project']
  }
  
  // 默认选中工作台
  return ['dashboard']
})

// 默认展开的菜单
const openKeys = ref([
  'project',
  'project-research',
  'project-approval',
  'project-implementation',
  'project-archive',
  'maintenance'
])

// 数据统计 (实际项目中从API获取) - v3.0版本
const counts = ref({
  requirements: 123,
  results: 32,
  materials: 25,
  reviews: 3,
  decisions: 8,
  contracts: 12,
  payments: 18,
  progress: 25,
  opening: 15, // 待开题项目数量（管理角色）
  openingApplications: 6, // 开题申请数量（申报单位角色）
  midterm: 18, // 待中期检查项目数量（管理角色）
  midtermApplications: 9, // 中期申请数量（申报单位角色）
  acceptance: 12, // 待验收项目数量（管理角色）
  applications: 8, // 验收申请数量（申报单位角色）
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
const hasUrgentOpening = computed(() => true) // 有紧急开题任务
const hasUrgentMidterm = computed(() => true) // 有紧急中期任务
const hasUrgentAcceptance = computed(() => true) // 有紧急验收任务
const hasUrgentNodes = computed(() => true) // 有紧急节点

// 抽屉相关状态
const drawerVisible = ref(false)
const currentStage = ref('')
const drawerTitle = ref('')
const customSelectedKeys = ref([])

// 抽屉副标题配置 (v3.0移除acceptance)
const drawerSubtitle = computed(() => {
  const subtitles = {
    opening: {
      submit: '上传开题报告、实施方案等材料',
      meeting: '组织开题论证会议、收集专家意见'
    },
    midterm: {
      submit: '提交中期检查报告、阶段性成果',
      meeting: '组织中期检查会议、评审进展'
    }
  }
  return subtitles[currentStage.value] || { submit: '', meeting: '' }
})

function onOpenChange(keys) {
  openKeys.value = keys
}

function onMenuClick({ key, keyPath }) {
  // 清除所有选中状态
  customSelectedKeys.value = []
  manualSelectedKeys.value = []
  
  // 路由映射
  const routeMap = {
    'dashboard': '/dashboard',
    'project': '/project',  // 父菜单项目管理的路由
    
    // 项目调研路由
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
    
    // 项目开题路由 - 使用新的路由
    'implementation-opening': '/implementation/opening',
    
    // 项目中期路由 - 使用新的路由
    'implementation-midterm': '/implementation/midterm',
    
    // 项目立项路由 - 直接使用整合页面
    'project-approval': '/implementation/approval',
    
    // 项目验收路由 - 直接使用整合页面
    'project-acceptance': '/implementation/acceptance',
    
    // 项目管理路由
    'project-archive-list': '/project/archive',
    
    // 统计分析路由
    'analysis': '/analytics',
    
    // 成果管理路由
    'achievements': '/achievements',
    
    // 维护相关菜单
    'maintenance': '/settings', // 日常维护暂时跳转到设置页面
    'node-data-maintenance': '/settings',
    'node-template-maintenance': '/settings',
    'implementation-nodes': '/settings',
    'knowledge-maintenance': '/settings',
    'approval-doc-maintenance': '/settings',
    'budget-template-maintenance': '/settings',
    'ppt-template-maintenance': '/settings',
    'inquiry-sms-template-maintenance': '/settings',
    'role-permission-maintenance': '/settings',
    'staff-maintenance': '/settings',
    'material-template-maintenance': '/settings/material-template',
    
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

// 显示抽屉 (v3.0移除acceptance)
function showDrawer(stage) {
  currentStage.value = stage
  const titles = {
    opening: '项目开题',
    midterm: '项目中期'
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

// 监听路由变化，清除手动选中状态
watch(() => route.path, () => {
  manualSelectedKeys.value = []
  customSelectedKeys.value = []
}, { immediate: true })

// 页面挂载后执行初始化
onMounted(() => {
  // 确保初始状态正确
  manualSelectedKeys.value = []
  customSelectedKeys.value = []
  
  // 移除内联样式
  setTimeout(() => {
    removeInlineStyles()
  }, 100)
})

/* 这个函数会查找菜单项中的内联样式并移除 */
function removeInlineStyles() {
  // 获取所有菜单项
  const menuItems = document.querySelectorAll('.ant-menu-item, .ant-menu-submenu-title');
  
  // 遍历菜单项
  menuItems.forEach(item => {
    // 移除内联样式
    const icons = item.querySelectorAll('.anticon');
    icons.forEach(icon => {
      icon.style.marginRight = '';
      icon.style.fontSize = '';
    });
    
    // 移除span上的内联样式
    const spans = item.querySelectorAll('span');
    spans.forEach(span => {
      span.style.fontSize = '';
      span.style.fontWeight = '';
      span.style.paddingLeft = '';
      
      // 对于显示为...的菜单项，添加特殊类
      if (span.textContent.trim() === '...') {
        item.classList.add('menu-item-ellipsis');
        span.style.display = 'inline-block';
        span.style.maxWidth = '100%';
        span.style.overflow = 'visible';
      }
    });
  });
  
  // 修复可能被截断的菜单项
  fixTruncatedMenuItems();
}

// 添加新方法来修复可能被截断的菜单项
function fixTruncatedMenuItems() {
  // 查找所有菜单项内容容器
  const titleContents = document.querySelectorAll('.ant-menu-title-content');
  
  // 遍历并应用修复
  titleContents.forEach(content => {
    content.style.whiteSpace = 'normal';
    content.style.wordBreak = 'break-word';
  });
}
</script>

<style scoped>
/* 主布局 */
.main-layout {
  display: flex;
  height: 100vh;
  background: #f5f8ff;
  overflow: hidden;
}

/* 侧边栏容器 */
.main-sider {
  position: relative;
  flex: 0 0 260px;
  max-width: 260px;
  min-width: 260px;
  width: 260px !important;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  border-radius: 16px 0 0 16px;
  box-shadow: 2px 0 8px rgba(35,79,162,0.06);
  padding: 24px 0;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-left: 8px;
}

/* 菜单基本样式 */
:deep(.ant-menu) {
  background: transparent;
  border-right: none;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 恢复缩进 - 一级菜单 */
:deep(.ant-menu > .ant-menu-item),
:deep(.ant-menu > .ant-menu-submenu > .ant-menu-submenu-title) {
  padding-left: 24px !important;
}

/* 二级菜单缩进 */
:deep(.ant-menu-sub > .ant-menu-item),
:deep(.ant-menu-sub > .ant-menu-submenu > .ant-menu-submenu-title) {
  padding-left: 48px !important;
}

/* 三级菜单缩进 */
:deep(.ant-menu-sub .ant-menu-sub .ant-menu-item) {
  padding-left: 72px !important;
}

/* 子菜单样式 */
:deep(.ant-menu-sub) {
  position: relative !important;
  max-height: none !important;
  overflow: visible !important;
  background: transparent !important;
  box-shadow: none !important;
  border-right: none !important;
}

/* 优化菜单布局，确保文本不会被截断 */
:deep(.ant-menu-item-only-child) {
  padding-right: 16px !important;
  width: auto !important;
}

/* 三个点的菜单项特别处理 */
:deep(.ant-menu-item) span[title="..."], 
:deep(.ant-menu-submenu-title) span[title="..."] {
  max-width: none !important;
  font-weight: bold;
}

/* 优化子菜单容器 */
:deep(.ant-menu-inline) {
  width: 100%;
}

/* 调整菜单项通用样式 */
:deep(.ant-menu-item), 
:deep(.ant-menu-submenu-title) {
  height: auto !important;
  min-height: 40px;
  line-height: 40px !important;
  margin: 4px 8px 4px 0 !important;
  border-radius: 0 8px 8px 0;
  display: flex !important;
  align-items: center !important;
  padding: 8px 16px !important;
  white-space: normal !important; /* 允许文本换行 */
  word-break: break-word;
  overflow: visible !important;
}

/* 确保子菜单项的宽度足够 */
:deep(.ant-menu-item span),
:deep(.ant-menu-submenu-title span) {
  color: rgba(0, 0, 0, 0.85) !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: inline-block !important;
  overflow: visible !important;
  white-space: normal !important; /* 允许文本换行 */
  max-width: 180px; /* 控制文本最大宽度 */
  word-break: break-word;
  overflow-wrap: break-word;
}

/* 菜单样式统一配置 */

/* 一级菜单图标和文本样式 */
:deep(.ant-menu > .ant-menu-item > .anticon),
:deep(.ant-menu > .ant-menu-submenu > .ant-menu-submenu-title > .anticon) {
  font-size: 18px !important;
  margin-right: 12px !important;
  min-width: 18px !important;
}

:deep(.ant-menu > .ant-menu-item > span),
:deep(.ant-menu > .ant-menu-submenu > .ant-menu-submenu-title > span) {
  font-size: 16px !important;
  font-weight: 600 !important;
}

/* 二级菜单图标和文本样式 */
:deep(.ant-menu-sub > .ant-menu-item > .anticon),
:deep(.ant-menu-sub > .ant-menu-submenu > .ant-menu-submenu-title > .anticon) {
  font-size: 16px !important;
  margin-right: 10px !important;
  min-width: 16px !important;
}

:deep(.ant-menu-sub > .ant-menu-item > span),
:deep(.ant-menu-sub > .ant-menu-submenu > .ant-menu-submenu-title > span) {
  font-size: 14px !important;
  font-weight: 500 !important;
}

/* 三级菜单图标和文本样式 */
:deep(.ant-menu-sub .ant-menu-sub .ant-menu-item > .anticon) {
  font-size: 14px !important;
  margin-right: 8px !important;
  min-width: 14px !important;
}

:deep(.ant-menu-sub .ant-menu-sub .ant-menu-item > span) {
  font-size: 13px !important;
  font-weight: 400 !important;
}

/* 菜单项悬停和选中效果 */
:deep(.ant-menu-item:hover), 
:deep(.ant-menu-submenu-title:hover) {
  background-color: rgba(35, 79, 162, 0.08) !important;
  color: #234fa2 !important;
}

:deep(.ant-menu-item:hover .anticon),
:deep(.ant-menu-submenu-title:hover .anticon) {
  color: #234fa2 !important;
}

:deep(.ant-menu-item-selected) {
  background-color: rgba(35, 79, 162, 0.15) !important;
  color: #234fa2 !important;
  font-weight: 600 !important;
}

:deep(.ant-menu-item-selected .anticon) {
  color: #234fa2 !important;
}

:deep(.ant-menu-item-selected::after) {
  border-right: 3px solid #234fa2 !important;
}

/* 确保子菜单选中时父菜单也有相应样式 */
:deep(.ant-menu-submenu-selected > .ant-menu-submenu-title) {
  color: #234fa2 !important;
  font-weight: 600 !important;
}

:deep(.ant-menu-submenu-selected > .ant-menu-submenu-title .anticon) {
  color: #234fa2 !important;
}

/* 展开状态的子菜单容器样式 */
:deep(.ant-menu-submenu-open > .ant-menu-submenu-title) {
  color: #234fa2 !important;
}

:deep(.ant-menu-submenu-open > .ant-menu-submenu-title .anticon) {
  color: #234fa2 !important;
}

/* 菜单项数量标签样式 */
.item-count {
  margin-left: 8px;
  color: #8c8c8c;
  font-size: 12px;
  background-color: #f5f5f5;
  padding: 0 6px;
  border-radius: 10px;
  display: inline-block;
  line-height: 1.5;
}

/* 紧急标签样式 */
.urgent-tag {
  margin-left: 8px;
  animation: pulse 1.5s infinite;
  filter: drop-shadow(0 0 2px rgba(255, 77, 79, 0.5));
}

@keyframes pulse {
  0% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(0.95); }
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

/* 为不同级别的菜单添加类 */
.menu-icon-level1 {
  font-size: 20px !important;
  margin-right: 16px !important;
}

.menu-icon-level2 {
  font-size: 18px !important;
  margin-right: 12px !important;
}

.menu-icon-level3 {
  font-size: 16px !important;
  margin-right: 8px !important;
}

.menu-text-level1 {
  font-size: 16px;
  font-weight: 600;
}

.menu-text-level2 {
  font-size: 14px;
  font-weight: 500;
}

.menu-text-level3 {
  font-size: 13px;
  font-weight: 400;
}

/* 确保菜单项内容不会被截断 */
:deep(.ant-menu-title-content) {
  white-space: normal;
  word-break: break-word;
  flex: 1;
  max-width: 100%;
}

/* 修复带有三个点的菜单项 */
.menu-item-ellipsis span {
  max-width: 100% !important;
  text-overflow: clip !important;
  overflow: visible !important;
}

/* 修复菜单项文本宽度 */
:deep(.ant-menu-item span),
:deep(.ant-menu-submenu-title span) {
  display: inline-block !important;
  max-width: 100% !important;
  overflow: visible !important;
}

/* 调整菜单项图标的位置 */
:deep(.ant-menu-item) .anticon, 
:deep(.ant-menu-submenu-title) .anticon {
  font-size: 16px !important;
  margin-right: 12px !important;
  min-width: 16px !important;
}

/* 实施下的二级菜单项统一样式 - 与其他二级菜单保持一致 */
.implementation-sub-item {
  position: relative;
  transition: all 0.2s ease-in-out;
  overflow: visible !important;
}

.implementation-sub-item .anticon {
  color: #595959;
  transition: all 0.25s ease;
}

.implementation-sub-item span:not(.item-count) {
  color: #595959;
  transition: all 0.25s ease;
}

.implementation-sub-item:hover .anticon {
  color: #234fa2;
  transform: scale(1.1);
}

.implementation-sub-item:hover span:not(.item-count) {
  color: #234fa2;
}

/* 标签样式美化 */
.custom-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 24px;
  background: linear-gradient(to right, #f9f9f9, #f0f5ff);
  border-radius: 8px;
  padding: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.custom-tabs :deep(.ant-tabs-tab) {
  margin: 0 4px;
  padding: 12px 20px;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.custom-tabs :deep(.ant-tabs-tab-active) {
  background-color: #fff;
  box-shadow: 0 3px 10px rgba(24, 144, 255, 0.1);
}

.custom-tabs :deep(.ant-tabs-tab-btn) {
  font-weight: 500;
  font-size: 15px;
  transition: all 0.25s;
}

.custom-tabs :deep(.ant-tabs-tab:hover .ant-tabs-tab-btn) {
  color: #40a9ff;
  transform: translateY(-1px);
}


</style> 