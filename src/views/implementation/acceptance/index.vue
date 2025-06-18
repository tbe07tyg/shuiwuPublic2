<template>
  <div class="implementation-acceptance-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <CheckCircleOutlined /> 项目验收
        </h1>
        <p class="page-desc">管理项目验收材料，组织专家评审，结题归档，集成OA流程</p>
      </div>
      <div class="header-actions">
        <a-select v-model:value="selectedProject" placeholder="选择项目" style="width: 220px; margin-right: 12px;" @change="handleProjectChange">
          <a-select-option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</a-select-option>
        </a-select>
        <a-tag color="red">对接OA流程</a-tag>
      </div>
    </div>

    <!-- 验收材料管理区 -->
    <a-card class="materials-section" title="验收材料管理">
      <a-table :columns="materialColumns" :data-source="materials" rowKey="name" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'file'">
            <a-upload
              :file-list="record.fileList"
              :before-upload="file => beforeUpload(file, record)"
              :on-remove="file => onRemove(file, record)"
              :max-count="1"
            >
              <a-button type="link">上传</a-button>
            </a-upload>
          </template>
          <template v-else-if="column.key === 'template'">
            <a-button type="link" @click="downloadTemplate(record)">
              下载模板
            </a-button>
            <!-- 若模板需从外部系统获取，显著标记 -->
            <a-tag v-if="record.fromExternal" color="orange">外部系统获取</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 专家评审区 -->
    <a-card class="review-section" title="专家评审">
      <a-table :columns="reviewColumns" :data-source="reviews" rowKey="id" bordered>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'expert'">
            <a-input v-model:value="record.expert" placeholder="专家姓名" />
          </template>
          <template v-else-if="column.key === 'opinion'">
            <a-textarea v-model:value="record.opinion" :rows="2" placeholder="评审意见" />
          </template>
          <template v-else-if="column.key === 'score'">
            <a-input-number v-model:value="record.score" :min="0" :max="100" />
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-button type="link" danger size="small" @click="removeReview(index)">移除</a-button>
          </template>
        </template>
      </a-table>
      <a-button type="dashed" @click="addReview" style="margin-top: 12px;">添加专家评审</a-button>
    </a-card>

    <!-- 结题归档区 -->
    <a-card class="archive-section" title="结题归档">
      <a-alert message="结题归档与OA流程同步" type="info" show-icon />
      <a-button type="primary" @click="handleArchive">归档项目</a-button>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CheckCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

/**
 * 验收材料表格列
 */
const materialColumns = [
  { title: '材料名称', dataIndex: 'name', key: 'name' },
  { title: '模板下载', key: 'template', width: 120 },
  { title: '文件上传', key: 'file', width: 180 }
]
const materials = ref([
  { name: '技术报告', fileList: [], fromExternal: false },
  { name: '任务决算书', fileList: [], fromExternal: false },
  { name: '结题报告PPT', fileList: [], fromExternal: false },
  { name: '其他验收文档', fileList: [], fromExternal: false }
])
function beforeUpload(file, record) {
  record.fileList = [file]
  return false
}
function onRemove(file, record) {
  record.fileList = []
}
function downloadTemplate(record) {
  if (record.fromExternal) {
    message.info('该模板需从外部系统获取')
  } else {
    message.success('模板下载功能开发中...')
  }
}

/**
 * 专家评审表格列
 */
const reviewColumns = [
  { title: '专家', key: 'expert', width: '20%' },
  { title: '评审意见', key: 'opinion', width: '50%' },
  { title: '打分', key: 'score', width: '15%' },
  { title: '操作', key: 'actions', width: '10%' }
]
const reviews = ref([
  { id: 'R001', expert: '张三', opinion: '', score: 0 }
])
function addReview() {
  reviews.value.push({ id: `R${reviews.value.length + 1}`, expert: '', opinion: '', score: 0 })
}
function removeReview(index) {
  reviews.value.splice(index, 1)
}

/**
 * 结题归档
 */
function handleArchive() {
  // TODO: 归档与OA流程同步
  message.success('项目已归档（同步OA流程）')
}

const projects = ref([
  { id: 'P001', name: '项目A' },
  { id: 'P002', name: '项目B' }
])
const selectedProject = ref()
function handleProjectChange(value) {
  console.log('当前选择项目:', value)
  // 根据项目ID加载相关数据
}
</script>

<style scoped>
.implementation-acceptance-page {
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
.materials-section,
.review-section,
.archive-section {
  margin-bottom: 24px;
}
</style> 