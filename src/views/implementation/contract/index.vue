<template>
  <div class="implementation-contract-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <FileProtectOutlined /> 合同管理
        </h1>
        <p class="page-desc">管理项目合同文件，自动解析付款条款，集成OA流程与节点配置</p>
      </div>
      <div class="header-actions">
        <a-select v-model:value="selectedProject" placeholder="选择项目" style="width: 220px; margin-right: 12px;" @change="handleProjectChange">
          <a-select-option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</a-select-option>
        </a-select>
        <a-tag color="red">对接OA流程</a-tag>
      </div>
    </div>

    <!-- 合同文件上传与管理区 -->
    <a-card class="file-section" title="合同文件上传与管理">
      <a-upload
        :file-list="contractFileList"
        :before-upload="beforeUploadContract"
        :on-remove="onRemoveContract"
        :max-count="1"
      >
        <a-button type="primary">上传合同文件</a-button>
      </a-upload>
      <div v-if="contractFileList.length">
        <a-button type="link" @click="downloadContract">下载合同</a-button>
      </div>
      <!-- OA流程同步标记 -->
      <a-tag color="red">合同文件与OA流程同步</a-tag>
    </a-card>

    <!-- 付款条款自动解析区 -->
    <a-card class="clause-section" title="付款条款自动解析">
      <a-alert
        message="系统将自动解析合同中的付款条款，生成项目节点配置建议。"
        type="info"
        show-icon
      />
      <a-button type="primary" @click="parseContractClauses">自动解析条款</a-button>
      <a-table :columns="clauseColumns" :data-source="clauses" rowKey="id" bordered style="margin-top:16px;" />
      <!-- 节点配置入口 -->
      <a-button type="dashed" style="margin-top:16px;" @click="goToNodeConfig">
        跳转到节点配置
      </a-button>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FileProtectOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * 合同文件上传
 */
const contractFileList = ref([])
function beforeUploadContract(file) {
  contractFileList.value = [file]
  return false
}
function onRemoveContract(file) {
  contractFileList.value = []
}
function downloadContract() {
  message.success('合同下载功能开发中...')
}

/**
 * 付款条款解析
 */
const clauseColumns = [
  { title: '节点名称', dataIndex: 'name', key: 'name' },
  { title: '付款比例(%)', dataIndex: 'percent', key: 'percent' },
  { title: '条件说明', dataIndex: 'condition', key: 'condition' }
]
const clauses = ref([
  { id: 'C001', name: '首付款', percent: 30, condition: '合同签订后7日内' },
  { id: 'C002', name: '中期款', percent: 40, condition: '项目进度过半' },
  { id: 'C003', name: '尾款', percent: 30, condition: '项目验收合格' }
])
function parseContractClauses() {
  // TODO: 合同条款自动解析功能
  message.info('自动解析功能开发中...')
}

/**
 * 跳转到节点配置
 */
const route = useRoute()
const router = useRouter()
const selectedProjectId = ref('')
const selectedProject = ref(null)
const nodeConfig = ref([]) // 合同解析出的节点配置

onMounted(() => {
  if (route.query.projectId) {
    selectedProjectId.value = route.query.projectId
    // TODO: 根据ID查找并选中项目
  }
})

function parseContractNodes() {
  // ...解析逻辑，得到nodes数组...
  nodeConfig.value = [/* 解析结果 */]
}

function goToNodeConfig() {
  router.push({ path: '/implementation/nodes', query: { projectId: selectedProjectId.value, nodes: JSON.stringify(nodeConfig.value) } })
}

const projects = ref([
  { id: 'P001', name: '项目A' },
  { id: 'P002', name: '项目B' }
])
function handleProjectChange(value) {
  console.log('当前选择项目:', value)
  // 根据项目ID加载相关数据
}
</script>

<style scoped>
.implementation-contract-page {
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
.file-section,
.clause-section {
  margin-bottom: 24px;
}
</style> 