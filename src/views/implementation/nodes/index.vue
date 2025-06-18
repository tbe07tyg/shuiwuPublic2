<template>
  <div class="implementation-nodes-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <NodeIndexOutlined /> 节点管理计划
        </h1>
        <p class="page-desc">配置项目实施节点，支持拖拽排序、属性编辑、依赖关系与流程预览</p>
      </div>
      <div class="header-actions">
        <a-select v-model:value="selectedProjectId" placeholder="选择项目" style="width: 220px; margin-right: 12px;">
          <a-select-option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</a-select-option>
        </a-select>
        <a-button type="primary" @click="saveConfig">保存配置</a-button>
        <a-button type="dashed" @click="handlePublish">发布到实施流程</a-button>
      </div>
    </div>

    <!-- 节点模板库区 -->
    <a-card class="template-section" title="节点模板库">
      <a-select v-model:value="selectedTemplate" placeholder="选择模板" style="width: 220px" @change="applyTemplate">
        <a-select-option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</a-select-option>
      </a-select>
      <a-button type="link" @click="manageTemplates">管理模板</a-button>
    </a-card>

    <!-- 节点配置区（可拖拽） -->
    <a-card class="nodes-section" title="节点配置">
      <draggable v-model="nodes" item-key="id" animation="200">
        <template #item="{ element, index }">
          <div class="node-item">
            <span class="drag-handle">☰</span>
            <a-input v-model:value="element.name" placeholder="节点名称" style="width: 120px; margin-right:8px;" />
            <a-input-number v-model:value="element.percent" :min="0" :max="100" style="width: 80px; margin-right:8px;" placeholder="金额" />
            <a-input v-model:value="element.condition" placeholder="条件说明" style="width: 180px; margin-right:8px;" />
            <a-date-picker 
              v-model:value="element.deadline" 
              placeholder="截止日期" 
              style="width: 140px; margin-right:8px;"
              :disabledDate="current => current && current < dayjs().startOf('day')"
            />
            <a-select v-model:value="element.dependency" placeholder="节点数据类型" allowClear style="width: 120px; margin-right:8px;">
              <a-select-option v-for="n in nodes.filter(n2 => n2.id !== element.id)" :key="n.id" :value="n.id">{{ n.name }}</a-select-option>
            </a-select>
            <a-upload
              v-model:file-list="element.attachments"
              :before-upload="() => false"
              :max-count="3"
              style="width: 120px; margin-right:8px;"
            >
              <a-button type="link" size="small">
                {{ element.attachments?.length ? `已上传${element.attachments.length}个文件` : '上传附件' }}
              </a-button>
            </a-upload>
            <a-button type="link" danger size="small" @click="removeNode(index)">移除</a-button>
          </div>
        </template>
      </draggable>
      <a-button type="dashed" @click="addNode" style="margin-top:12px;">添加节点</a-button>
    </a-card>

    <!-- 节点流程图预览区 -->
    <a-card class="flow-section" title="流程图预览">
      <!-- 这里可集成可视化流程图组件，如需对接外部系统，显著标记 -->
      <a-alert message="流程图预览功能开发中..." type="info" show-icon />
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NodeIndexOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useImplementationStore } from '@/store/implementation'
import { useApprovalStore } from '@/store/approval'
import dayjs from 'dayjs'
import { useNodeTemplateStore } from '@/store/nodeTemplate'

const projects = ref([
  { id: 'P001', name: '项目A' },
  { id: 'P002', name: '项目B' }
])
const selectedProjectId = ref('')
const nodes = ref([
  { id: 'N1', name: '首付款', percent: 30, condition: '合同签订后7日内', dependency: '' },
  { id: 'N2', name: '中期款', percent: 40, condition: '项目进度过半', dependency: 'N1' },
  { id: 'N3', name: '尾款', percent: 30, condition: '项目验收合格', dependency: 'N2' }
])
const nodeTemplateStore = useNodeTemplateStore()
const templates = nodeTemplateStore.templateList
const selectedTemplate = ref()
const router = useRouter()
const implementationStore = useImplementationStore()

function applyTemplate(id) {
  const tpl = templates.value.find(t => t.id === id)
  if (tpl) nodes.value = tpl.nodes.map(n => ({ ...n, id: Math.random().toString(36).slice(2, 10) }))
}
function manageTemplates() {
  router.push({ path: '/implementation/template' })
}
function addNode() {
  nodes.value.push({ 
    id: Math.random().toString(36).slice(2, 10), 
    name: '', 
    percent: 0, 
    condition: '', 
    dependency: null,
    deadline: null,
    attachments: []
  })
}
function removeNode(index) {
  nodes.value.splice(index, 1)
}
function saveConfig() {
  if (!selectedProjectId.value) {
    message.error('请先选择项目')
    return
  }
  Modal.confirm({
    title: `是否将当前配置保存到${selectedProjectId.value}项目？`,
    onOk: () => {
      message.success('保存成功！')
    }
  })
}
function handlePublish() {
  if (!selectedProjectId.value) {
    message.error('请先选择项目')
    return
  }
  
  // 保存节点配置到store
  implementationStore.saveProjectNodes(selectedProjectId.value, nodes.value)
  
  // 更新项目状态
  const approvalStore = useApprovalStore()
  const project = approvalStore.approvalList.find(p => p.id === selectedProjectId.value)
  if (project) {
    project.nodeConfigured = true
  }
  
  message.success('节点配置已发布到实施流程')
}
const route = useRoute()
onMounted(() => {
  if (route.query.projectId) {
    selectedProjectId.value = route.query.projectId
  }
  if (route.query.nodes) {
    try {
      nodes.value = JSON.parse(route.query.nodes)
    } catch {}
  }
})
</script>

<style scoped>
.implementation-nodes-page {
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
.template-section,
.nodes-section,
.flow-section {
  margin-bottom: 24px;
}
.node-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 8px;
}
.drag-handle {
  cursor: move;
  margin-right: 8px;
  color: #999;
}
</style> 