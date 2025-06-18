<template>
  <div class="budget-execution-page">
    <!-- 角色判断加载中 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
      <p>正在识别用户权限...</p>
    </div>

    <!-- 角色选择（开发调试用） -->
    <div v-else-if="showRoleSelector" class="role-selector">
      <a-card title="经费执行进度 - 角色选择" style="max-width: 400px; margin: 100px auto;">
        <p>系统检测到您有多个角色权限，请选择要使用的角色：</p>
        <a-radio-group v-model:value="selectedRole" style="width: 100%;">
          <a-radio-button value="reporter" style="width: 50%; text-align: center;">
            <UserOutlined /> 填报人员
          </a-radio-button>
          <a-radio-button value="manager" style="width: 50%; text-align: center;">
            <CrownOutlined /> 管理角色
          </a-radio-button>
        </a-radio-group>
        <div style="margin-top: 16px; text-align: center;">
          <a-button type="primary" @click="confirmRole" :disabled="!selectedRole">
            确认进入
          </a-button>
        </div>
      </a-card>
    </div>

    <!-- 根据角色显示对应页面 -->
    <BudgetReporter v-else-if="userRole === 'reporter'" :user-permissions="userPermissions" @switch-role="handleSwitchRole" />
    <BudgetManager v-else-if="userRole === 'manager'" :user-permissions="userPermissions" @switch-role="handleSwitchRole" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UserOutlined, CrownOutlined } from '@ant-design/icons-vue'
import BudgetReporter from './BudgetReporter.vue'
import BudgetManager from './BudgetManager.vue'

const loading = ref(true)
const showRoleSelector = ref(false)
const selectedRole = ref('')
const userRole = ref('')
const userPermissions = ref({})

// 模拟用户权限检测
const checkUserRole = async () => {
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟用户权限数据
  userPermissions.value = {
    roles: ['reporter', 'manager'], // 用户拥有的角色
    defaultRole: 'reporter' // 默认角色
  }
  
  loading.value = false
  
  // 如果用户只有一个角色，直接进入
  if (userPermissions.value.roles.length === 1) {
    userRole.value = userPermissions.value.roles[0]
  } 
  // 如果用户有多个角色，显示选择器
  else if (userPermissions.value.roles.length > 1) {
    showRoleSelector.value = true
  }
  // 如果用户没有权限，显示无权限提示
  else {
    userRole.value = 'no-permission'
  }
}

const confirmRole = () => {
  userRole.value = selectedRole.value
  showRoleSelector.value = false
}

// 处理角色切换
const handleSwitchRole = (newRole) => {
  if (userPermissions.value.roles.includes(newRole)) {
    userRole.value = newRole
  }
}

onMounted(() => {
  checkUserRole()
})
</script>

<style scoped>
.budget-execution-page {
  min-height: 100vh;
  background: #f5f8ff;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #666;
}

.loading-container p {
  margin-top: 16px;
  font-size: 16px;
}

.role-selector {
  padding: 20px;
}

.role-selector .ant-radio-button-wrapper {
  height: 60px;
  line-height: 60px;
  font-size: 16px;
}
</style> 