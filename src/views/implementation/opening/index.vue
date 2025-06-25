<template>
  <div class="opening-container">
    <div class="page-header">
      <h1 class="page-title">项目开题管理</h1>
      <div class="page-desc">管理项目开题相关材料、流程和会议，确保项目顺利启动</div>
    </div>
    
    <!-- 横向标签菜单 -->
    <a-tabs 
      v-model:activeKey="activeTabKey" 
      class="custom-tabs role-colored-tabs"
      @change="handleTabChange">
      <a-tab-pane key="application-manage" class="applicant-role">
        <template #tab>
          <UserOutlined class="applicant-role-icon" />
          申请管理
        </template>
        <applicant-manage-component v-if="activeTabKey === 'application-manage'" />
      </a-tab-pane>
      <a-tab-pane key="application-submit" class="applicant-role">
        <template #tab>
          <FileAddOutlined class="applicant-role-icon" />
          提交开题
        </template>
        <applicant-submit-component v-if="activeTabKey === 'application-submit'" />
      </a-tab-pane>

      <a-tab-pane key="management-center" class="manager-role">
        <template #tab>
          <SettingOutlined class="manager-role-icon" />
          管理中心
        </template>
        <management-center-component v-if="activeTabKey === 'management-center'" />
      </a-tab-pane>
      <a-tab-pane key="meeting-conclusion" class="manager-role">
        <template #tab>
          <TeamOutlined class="manager-role-icon" />
          会议管理
        </template>
        <management-conclusion-component v-if="activeTabKey === 'meeting-conclusion'" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserOutlined, FileAddOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons-vue'

// 导入原来的子菜单页面组件
const ApplicantManageComponent = defineAsyncComponent(() => import('@/views/opening/applicant/manage.vue'))
const ApplicantSubmitComponent = defineAsyncComponent(() => import('@/views/opening/applicant/submit.vue'))
const ManagementCenterComponent = defineAsyncComponent(() => import('@/views/opening/management/center.vue'))
const ManagementConclusionComponent = defineAsyncComponent(() => import('@/views/opening/management/conclusion.vue'))

const route = useRoute()
const router = useRouter()
const activeTabKey = ref('application-manage') // 默认选中"申请管理"标签

// 监听路由变化，更新activeTabKey
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      activeTabKey.value = newTab
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 如果URL中有tab参数，则选中对应标签
  if (route.query.tab) {
    activeTabKey.value = route.query.tab
  }
})

// 处理标签切换事件
const handleTabChange = (key) => {
  // 更新URL，不刷新页面
  router.push({
    path: route.path,
    query: { ...route.query, tab: key }
  })
}
</script>

<style scoped>
.opening-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.page-header {
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.page-desc {
  font-size: 14px;
  color: #8c8c8c;
}

.custom-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
  background-color: #f8f9fa;
  padding: 4px;
  border-radius: 8px;
}

.custom-tabs :deep(.ant-tabs-tab) {
  padding: 12px 24px;
  margin: 0 4px;
  transition: all 0.3s;
  border-radius: 6px;
}

.custom-tabs :deep(.ant-tabs-tab-active) {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 角色颜色样式已在全局样式中定义 */

.custom-tabs :deep(.ant-tabs-tab-btn) {
  font-weight: 500;
  font-size: 15px;
}

.custom-tabs :deep(.ant-tabs-ink-bar) {
  display: none;
}
</style> 