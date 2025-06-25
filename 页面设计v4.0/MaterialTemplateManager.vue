<template>
  <div class="material-template-manager">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Document /></el-icon>
        材料提交模板维护
      </h2>
      <el-breadcrumb separator=">" class="breadcrumb">
        <el-breadcrumb-item>首页</el-breadcrumb-item>
        <el-breadcrumb-item>日常维护</el-breadcrumb-item>
        <el-breadcrumb-item>材料提交模板维护</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 标签页导航 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="business-tabs">
        <el-tab-pane label="立项申请" name="apply"></el-tab-pane>
        <el-tab-pane label="项目开题" name="opening"></el-tab-pane>
        <el-tab-pane label="项目中期" name="midterm"></el-tab-pane>
        <el-tab-pane label="项目验收" name="acceptance"></el-tab-pane>
      </el-tabs>

      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAddCategory">
            <el-icon><Plus /></el-icon>
            添加新类目
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-button @click="handleBatchImport">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button @click="handleBatchExport">
            <el-icon><Download /></el-icon>
            批量导出
          </el-button>
          <el-button @click="handleResetDefault">
            <el-icon><RefreshRight /></el-icon>
            重置默认
          </el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table 
        :data="currentCategories" 
        stripe 
        row-key="id"
        class="category-table"
      >
        <el-table-column prop="sortOrder" label="序号" width="80" align="center" />
        
        <el-table-column prop="categoryName" label="类目名称" width="200">
          <template #default="scope">
            <span class="category-name">{{ scope.row.categoryName }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="isRequired" label="必填项" width="100" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.isRequired ? 'danger' : 'info'" 
              size="small"
            >
              {{ scope.row.isRequired ? '必填' : '选填' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="templateFileName" label="模板文件" width="250">
          <template #default="scope">
            <div class="file-info" v-if="scope.row.templateFileName">
              <el-icon class="file-icon">
                <component :is="getFileIcon(scope.row.templateFileName)" />
              </el-icon>
              <span class="file-name">{{ scope.row.templateFileName }}</span>
              <el-button 
                link 
                type="primary" 
                size="small"
                @click="handlePreviewTemplate(scope.row)"
              >
                预览
              </el-button>
              <el-button 
                link 
                type="primary" 
                size="small"
                @click="handleDownloadTemplate(scope.row)"
              >
                下载
              </el-button>
            </div>
            <span v-else class="no-template">无模板</span>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述说明" min-width="200">
          <template #default="scope">
            <el-tooltip :content="scope.row.description" placement="top">
              <span class="description-text">{{ scope.row.description }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleEditCategory(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="handlePreviewEffect(scope.row)"
            >
              预览
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDeleteCategory(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 拖拽排序提示 -->
      <div class="sort-hint">
        <el-icon><Rank /></el-icon>
        提示：可通过拖拽调整类目显示顺序
      </div>

      <!-- 效果预览面板 -->
      <div class="preview-panel">
        <h3 class="preview-title">
          <el-icon><View /></el-icon>
          效果预览：{{ getBusinessTypeName(activeTab) }}页面资料提交区域
        </h3>
        <div class="preview-content">
          <div class="material-list">
            <div 
              v-for="item in currentCategories" 
              :key="item.id"
              class="material-item"
            >
              <span class="material-label">
                <span v-if="item.isRequired" class="required-mark">*</span>
                {{ item.categoryName }}
              </span>
              <div class="material-actions">
                <el-button size="small">上传</el-button>
                <el-button 
                  v-if="item.templateFileName" 
                  size="small" 
                  type="primary"
                >
                  模板
                </el-button>
                <span v-else class="no-template-hint">无模板</span>
              </div>
            </div>
          </div>
          <div class="preview-note">
            <span class="required-mark">*</span> 为必填项
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="bottom-actions">
      <div class="status-info">
        <span>当前配置：{{ getBusinessTypeName(activeTab) }}</span>
        <span>| 共 {{ currentCategories.length }} 个类目</span>
        <span>| 其中 {{ requiredCount }} 个必填项</span>
        <span>| 最后更新：{{ lastUpdateTime }}</span>
      </div>
      <div class="save-actions">
        <el-button @click="handlePreviewAll">
          <el-icon><View /></el-icon>
          预览效果
        </el-button>
        <el-button type="success" @click="handleSaveConfig">
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
        <el-button type="primary" @click="handleSyncApply">
          <el-icon><Refresh /></el-icon>
          同步应用
        </el-button>
      </div>
    </div>

    <!-- 添加/编辑类目对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="categoryFormRef"
        :model="categoryForm" 
        :rules="categoryRules"
        label-width="120px"
      >
        <el-form-item label="类目名称" prop="categoryName">
          <el-input 
            v-model="categoryForm.categoryName" 
            placeholder="请输入类目名称，如：项目申请书"
            clearable
          />
        </el-form-item>

        <el-form-item label="是否必填" prop="isRequired">
          <el-radio-group v-model="categoryForm.isRequired">
            <el-radio :label="true">必填</el-radio>
            <el-radio :label="false">选填</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="模板文件">
          <el-upload
            ref="uploadRef"
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            action="/api/upload/template"
            accept=".doc,.docx,.xls,.xlsx,.pdf,.txt"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
          </el-upload>
          <div v-if="categoryForm.templateFileName" class="upload-result">
            <span class="file-name">{{ categoryForm.templateFileName }}</span>
            <el-button 
              link 
              type="primary" 
              size="small"
              @click="handlePreviewUpload"
            >
              预览
            </el-button>
            <el-button 
              link 
              type="danger" 
              size="small"
              @click="handleRemoveUpload"
            >
              移除
            </el-button>
          </div>
          <div class="upload-tips">
            支持格式：.doc .docx .xls .xlsx .pdf .txt，大小不超过10MB
          </div>
        </el-form-item>

        <el-form-item label="显示顺序" prop="sortOrder">
          <el-input-number 
            v-model="categoryForm.sortOrder" 
            :min="1" 
            :max="100"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="描述说明">
          <el-input 
            v-model="categoryForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入对该类目的详细说明..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCategory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入配置" width="500px">
      <div class="import-content">
        <el-alert 
          title="导入说明" 
          type="info" 
          :closable="false"
          class="import-alert"
        >
          <template #default>
            <p>1. 请下载模板文件，按照格式填写类目信息</p>
            <p>2. 上传填写完成的Excel文件</p>
            <p>3. 系统将自动解析并导入配置</p>
          </template>
        </el-alert>

        <div class="import-actions">
          <el-button @click="handleDownloadTemplate">
            <el-icon><Download /></el-icon>
            下载模板
          </el-button>
          <el-upload
            ref="importUploadRef"
            :show-file-list="false"
            :before-upload="handleBeforeImport"
            :on-success="handleImportSuccess"
            action="/api/import/categories"
            accept=".xlsx,.xls"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
          </el-upload>
        </div>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, Plus, Upload, Download, RefreshRight, View, 
  Check, Refresh, Rank, DocumentCopy, Tickets, Files 
} from '@element-plus/icons-vue'

/**
 * 响应式数据定义
 */
const activeTab = ref('apply')
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEdit = ref(false)
const lastUpdateTime = ref('2025-01-22 14:30')

// 类目数据存储
const categoriesData = reactive({
  apply: [],
  opening: [],
  midterm: [],
  acceptance: []
})

// 表单数据
const categoryForm = reactive({
  id: null,
  categoryName: '',
  isRequired: true,
  templateFileName: '',
  templateFilePath: '',
  sortOrder: 1,
  description: ''
})

// 表单验证规则
const categoryRules = {
  categoryName: [
    { required: true, message: '请输入类目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  isRequired: [
    { required: true, message: '请选择是否必填', trigger: 'change' }
  ],
  sortOrder: [
    { required: true, message: '请输入显示顺序', trigger: 'blur' }
  ]
}

/**
 * 计算属性
 */
const currentCategories = computed(() => {
  return categoriesData[activeTab.value] || []
})

const requiredCount = computed(() => {
  return currentCategories.value.filter(item => item.isRequired).length
})

const dialogTitle = computed(() => {
  return isEdit.value ? '编辑资料类目' : '添加资料类目'
})

/**
 * 方法定义
 */

// 获取业务类型名称
const getBusinessTypeName = (type) => {
  const typeMap = {
    apply: '立项申请',
    opening: '项目开题',
    midterm: '项目中期',
    acceptance: '项目验收'
  }
  return typeMap[type] || '未知'
}

// 获取文件图标
const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const iconMap = {
    doc: DocumentCopy,
    docx: DocumentCopy,
    xls: Tickets,
    xlsx: Tickets,
    pdf: Files,
    txt: Document
  }
  return iconMap[ext] || Document
}

// 标签页切换
const handleTabChange = (tabName) => {
  activeTab.value = tabName
  loadCategoriesData(tabName)
}

// 加载类目数据
const loadCategoriesData = async (businessType) => {
  try {
    // 模拟API调用
    const mockData = {
      apply: [
        {
          id: 1,
          categoryName: '项目申请书',
          isRequired: true,
          templateFileName: '项目申请书模板.doc',
          templateFilePath: '/templates/apply_form.doc',
          sortOrder: 1,
          description: '详细的项目申请信息，包含项目背景、目标、实施方案等'
        },
        {
          id: 2,
          categoryName: '可行性研究报告',
          isRequired: true,
          templateFileName: '可行性报告模板.doc',
          templateFilePath: '/templates/feasibility.doc',
          sortOrder: 2,
          description: '项目技术可行性、经济可行性分析报告'
        },
        {
          id: 3,
          categoryName: '预算明细表',
          isRequired: true,
          templateFileName: '预算明细模板.xlsx',
          templateFilePath: '/templates/budget.xlsx',
          sortOrder: 3,
          description: '详细的项目经费预算分配表'
        }
      ],
      opening: [],
      midterm: [],
      acceptance: []
    }
    
    categoriesData[businessType] = mockData[businessType] || []
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 添加类目
const handleAddCategory = () => {
  isEdit.value = false
  resetCategoryForm()
  dialogVisible.value = true
}

// 编辑类目
const handleEditCategory = (row) => {
  isEdit.value = true
  Object.assign(categoryForm, row)
  dialogVisible.value = true
}

// 删除类目
const handleDeleteCategory = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除类目"${row.categoryName}"吗？\n删除后将无法恢复，请谨慎操作！`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 执行删除操作
    const index = currentCategories.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      currentCategories.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

// 保存类目
const handleSaveCategory = async () => {
  try {
    // 表单验证
    // await categoryFormRef.value.validate()
    
    if (isEdit.value) {
      // 编辑模式
      const index = currentCategories.value.findIndex(item => item.id === categoryForm.id)
      if (index > -1) {
        Object.assign(currentCategories.value[index], categoryForm)
      }
      ElMessage.success('编辑成功')
    } else {
      // 新增模式
      const newCategory = {
        ...categoryForm,
        id: Date.now() // 临时ID
      }
      currentCategories.value.push(newCategory)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    updateLastModifyTime()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 重置表单
const resetCategoryForm = () => {
  Object.assign(categoryForm, {
    id: null,
    categoryName: '',
    isRequired: true,
    templateFileName: '',
    templateFilePath: '',
    sortOrder: currentCategories.value.length + 1,
    description: ''
  })
}

// 关闭对话框
const handleDialogClose = () => {
  resetCategoryForm()
}

// 文件上传前验证
const handleBeforeUpload = (file) => {
  const allowedTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                       'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                       'application/pdf', 'text/plain']
  const isAllowed = allowedTypes.includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10
  
  if (!isAllowed) {
    ElMessage.error('只能上传 doc/docx/xls/xlsx/pdf/txt 格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

// 文件上传成功
const handleUploadSuccess = (response) => {
  categoryForm.templateFileName = response.fileName
  categoryForm.templateFilePath = response.filePath
  ElMessage.success('文件上传成功')
}

// 预览模板
const handlePreviewTemplate = (row) => {
  // 实现文件预览逻辑
  ElMessage.info(`预览文件：${row.templateFileName}`)
}

// 下载模板
const handleDownloadTemplate = (row) => {
  // 实现文件下载逻辑
  ElMessage.info(`下载文件：${row.templateFileName}`)
}

// 批量导入
const handleBatchImport = () => {
  importDialogVisible.value = true
}

// 批量导出
const handleBatchExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 重置默认
const handleResetDefault = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置为默认配置吗？当前配置将被清空！',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    categoriesData[activeTab.value] = []
    ElMessage.success('重置成功')
    updateLastModifyTime()
  } catch {
    // 用户取消
  }
}

// 保存配置
const handleSaveConfig = () => {
  ElMessage.success('配置保存成功')
  updateLastModifyTime()
}

// 同步应用
const handleSyncApply = async () => {
  try {
    ElMessage.info('正在同步配置到业务页面...')
    
    // 模拟同步过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('配置同步成功')
    updateLastModifyTime()
  } catch (error) {
    ElMessage.error('同步失败，请重试')
  }
}

// 预览效果
const handlePreviewEffect = (row) => {
  ElMessage.info(`预览类目"${row.categoryName}"在业务页面的效果`)
}

// 预览全部效果
const handlePreviewAll = () => {
  ElMessage.info(`预览${getBusinessTypeName(activeTab.value)}页面整体效果`)
}

// 更新最后修改时间
const updateLastModifyTime = () => {
  const now = new Date()
  lastUpdateTime.value = now.toLocaleString('zh-CN')
}

/**
 * 生命周期钩子
 */
onMounted(() => {
  loadCategoriesData(activeTab.value)
})
</script>

<style scoped>
.material-template-manager {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.breadcrumb {
  margin-top: 8px;
}

.main-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.business-tabs {
  padding: 0 24px;
  background: #fafafa;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
}

.category-table {
  margin: 0 24px;
}

.category-name {
  font-weight: 500;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #1890ff;
}

.file-name {
  color: #333;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-template {
  color: #999;
  font-style: italic;
}

.description-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.sort-hint {
  padding: 12px 24px;
  color: #666;
  font-size: 14px;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview-panel {
  margin: 20px 24px;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-content {
  background: white;
  border-radius: 4px;
  padding: 16px;
}

.material-list {
  margin-bottom: 12px;
}

.material-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e8e8e8;
}

.material-item:last-child {
  border-bottom: none;
}

.material-label {
  font-size: 14px;
  color: #333;
}

.required-mark {
  color: #ff4d4f;
  margin-right: 4px;
}

.material-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-template-hint {
  font-size: 12px;
  color: #999;
}

.preview-note {
  font-size: 12px;
  color: #666;
  padding-top: 8px;
  border-top: 1px solid #e8e8e8;
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
}

.status-info {
  color: #666;
  font-size: 14px;
}

.save-actions {
  display: flex;
  gap: 12px;
}

.upload-result {
  margin-top: 8px;
  padding: 8px;
  background: #f0f9ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-tips {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.import-content {
  padding: 16px 0;
}

.import-alert {
  margin-bottom: 20px;
}

.import-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style> 