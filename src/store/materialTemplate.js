/**
 * @file 材料提交模板全局状态管理
 * @description 统一管理各业务环节的材料模板配置，实现配置的集中存储和实时同步
 * @author 科研管理系统
 * @version 1.0.0
 * @date 2025-01-22
 */

import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

// 材料模板配置状态
const materialTemplateState = reactive({
  // 各业务环节的配置数据
  configs: {
    apply: [], // 立项申请
    opening: [], // 项目开题
    midterm: [], // 项目中期
    acceptance: [] // 项目验收
  },
  
  // 加载状态
  loading: false,
  
  // 最后更新时间
  lastUpdateTime: null,
  
  // 配置版本号
  version: '1.0.0'
})

// 业务类型映射
const businessTypeMap = {
  apply: '立项申请',
  opening: '项目开题', 
  midterm: '项目中期',
  acceptance: '项目验收'
}

/**
 * 初始化默认配置
 */
const initDefaultConfigs = () => {
  const defaultConfigs = {
    apply: [
      {
        id: 1,
        categoryName: '项目申请书',
        isRequired: true,
        templateFileName: '项目申请书模板.docx',
        templateFilePath: '/templates/apply/project_application.docx',
        sortOrder: 1,
        description: '详细的项目申请信息，包含项目背景、目标、实施方案等',
        businessType: 'apply',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        categoryName: '可行性研究报告',
        isRequired: true,
        templateFileName: '可行性研究报告模板.docx',
        templateFilePath: '/templates/apply/feasibility_study.docx',
        sortOrder: 2,
        description: '项目技术可行性、经济可行性分析报告',
        businessType: 'apply',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    
    opening: [
      {
        id: 11,
        categoryName: '开题报告',
        isRequired: true,
        templateFileName: '开题报告模板.docx',
        templateFilePath: '/templates/opening/opening_report.docx',
        sortOrder: 1,
        description: '项目开题报告，说明研究方案和计划',
        businessType: 'opening',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    
    midterm: [
      {
        id: 21,
        categoryName: '中期报告',
        isRequired: true,
        templateFileName: '中期报告模板.docx',
        templateFilePath: '/templates/midterm/midterm_report.docx',
        sortOrder: 1,
        description: '项目中期进展报告',
        businessType: 'midterm',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    
    acceptance: [
      {
        id: 31,
        categoryName: '验收报告',
        isRequired: true,
        templateFileName: '验收报告模板.docx',
        templateFilePath: '/templates/acceptance/acceptance_report.docx',
        sortOrder: 1,
        description: '项目验收报告',
        businessType: 'acceptance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }
  
  return defaultConfigs
}

// 页面更新监听器
const pageUpdateListeners = new Map()

/**
 * 获取指定业务类型的配置
 */
const getConfigsByBusinessType = (businessType) => {
  return materialTemplateState.configs[businessType] || []
}

/**
 * 获取所有配置的统计信息
 */
const getConfigsStats = computed(() => {
  const stats = {}
  Object.keys(materialTemplateState.configs).forEach(businessType => {
    const configs = materialTemplateState.configs[businessType] || []
    stats[businessType] = {
      total: configs.length,
      required: configs.filter(item => item.isRequired).length,
      optional: configs.filter(item => !item.isRequired).length
    }
  })
  return stats
})

/**
 * 从本地存储加载配置
 */
const loadConfigsFromStorage = () => {
  try {
    const stored = localStorage.getItem('materialTemplateConfigs')
    if (stored) {
      const parsed = JSON.parse(stored)
      materialTemplateState.configs = parsed.configs || {}
      materialTemplateState.version = parsed.version || '1.0.0'
      materialTemplateState.lastUpdateTime = parsed.lastUpdateTime
      return true
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
  return false
}

/**
 * 保存配置到本地存储
 */
const saveConfigsToStorage = () => {
  try {
    const configData = {
      configs: materialTemplateState.configs,
      version: materialTemplateState.version,
      lastUpdateTime: materialTemplateState.lastUpdateTime
    }
    localStorage.setItem('materialTemplateConfigs', JSON.stringify(configData))
    return true
  } catch (error) {
    console.error('保存配置失败:', error)
    return false
  }
}

/**
 * 初始化配置数据
 */
const initConfigs = async () => {
  materialTemplateState.loading = true
  
  try {
    // 尝试从本地存储加载
    const loaded = loadConfigsFromStorage()
    
    if (!loaded) {
      // 如果本地没有配置，使用默认配置
      materialTemplateState.configs = initDefaultConfigs()
      materialTemplateState.lastUpdateTime = new Date().toISOString()
      saveConfigsToStorage()
    }
    
    message.success('配置加载成功')
  } catch (error) {
    console.error('初始化配置失败:', error)
    message.error('配置加载失败')
  } finally {
    materialTemplateState.loading = false
  }
}

/**
 * 添加新配置
 */
const addConfig = async (businessType, configData) => {
  try {
    const newConfig = {
      ...configData,
      id: Date.now(), // 简单的ID生成
      businessType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (!materialTemplateState.configs[businessType]) {
      materialTemplateState.configs[businessType] = []
    }
    
    materialTemplateState.configs[businessType].push(newConfig)
    materialTemplateState.lastUpdateTime = new Date().toISOString()
    
    // 保存到本地存储
    saveConfigsToStorage()
    
    // 通知相关页面更新
    notifyBusinessPageUpdate(businessType)
    
    message.success('添加配置成功')
    return newConfig
  } catch (error) {
    console.error('添加配置失败:', error)
    message.error('添加配置失败')
    throw error
  }
}

/**
 * 更新配置
 */
const updateConfig = async (businessType, configId, configData) => {
  try {
    const configs = materialTemplateState.configs[businessType] || []
    const index = configs.findIndex(item => item.id === configId)
    
    if (index === -1) {
      throw new Error('配置项不存在')
    }
    
    // 更新配置
    const updatedConfig = {
      ...configs[index],
      ...configData,
      updatedAt: new Date().toISOString()
    }
    
    materialTemplateState.configs[businessType][index] = updatedConfig
    materialTemplateState.lastUpdateTime = new Date().toISOString()
    
    // 保存到本地存储
    saveConfigsToStorage()
    
    // 通知相关页面更新
    notifyBusinessPageUpdate(businessType)
    
    message.success('更新配置成功')
    return updatedConfig
  } catch (error) {
    console.error('更新配置失败:', error)
    message.error('更新配置失败')
    throw error
  }
}

/**
 * 删除配置
 */
const deleteConfig = async (businessType, configId) => {
  try {
    const configs = materialTemplateState.configs[businessType] || []
    const index = configs.findIndex(item => item.id === configId)
    
    if (index === -1) {
      throw new Error('配置项不存在')
    }
    
    // 删除配置
    materialTemplateState.configs[businessType].splice(index, 1)
    materialTemplateState.lastUpdateTime = new Date().toISOString()
    
    // 保存到本地存储
    saveConfigsToStorage()
    
    // 通知相关页面更新
    notifyBusinessPageUpdate(businessType)
    
    message.success('删除配置成功')
    return true
  } catch (error) {
    console.error('删除配置失败:', error)
    message.error('删除配置失败')
    throw error
  }
}

/**
 * 批量更新配置
 */
const batchUpdateConfigs = async (businessType, configsList) => {
  try {
    materialTemplateState.configs[businessType] = configsList.map(config => ({
      ...config,
      businessType,
      updatedAt: new Date().toISOString()
    }))
    
    materialTemplateState.lastUpdateTime = new Date().toISOString()
    
    // 保存到本地存储
    saveConfigsToStorage()
    
    // 通知相关页面更新
    notifyBusinessPageUpdate(businessType)
    
    message.success('批量更新配置成功')
    return true
  } catch (error) {
    console.error('批量更新配置失败:', error)
    message.error('批量更新配置失败')
    throw error
  }
}

/**
 * 重置为默认配置
 */
const resetToDefault = async (businessType) => {
  try {
    const defaultConfigs = initDefaultConfigs()
    
    if (businessType) {
      // 重置指定业务类型
      materialTemplateState.configs[businessType] = defaultConfigs[businessType] || []
    } else {
      // 重置所有配置
      materialTemplateState.configs = defaultConfigs
    }
    
    materialTemplateState.lastUpdateTime = new Date().toISOString()
    
    // 保存到本地存储
    saveConfigsToStorage()
    
    // 通知相关页面更新
    if (businessType) {
      notifyBusinessPageUpdate(businessType)
    } else {
      Object.keys(defaultConfigs).forEach(type => {
        notifyBusinessPageUpdate(type)
      })
    }
    
    message.success('重置配置成功')
    return true
  } catch (error) {
    console.error('重置配置失败:', error)
    message.error('重置配置失败')
    throw error
  }
}

/**
 * 通知业务页面更新
 */
const notifyBusinessPageUpdate = (businessType) => {
  const listeners = pageUpdateListeners.get(businessType)
  if (listeners && listeners.size > 0) {
    const configs = getConfigsByBusinessType(businessType)
    listeners.forEach(callback => {
      try {
        callback(configs, businessType)
      } catch (error) {
        console.error('页面更新回调执行失败:', error)
      }
    })
  }
}

/**
 * 注册页面更新监听器
 */
const registerPageUpdateListener = (businessType, callback) => {
  if (!pageUpdateListeners.has(businessType)) {
    pageUpdateListeners.set(businessType, new Set())
  }
  pageUpdateListeners.get(businessType).add(callback)
  
  // 返回取消注册的函数
  return () => {
    const listeners = pageUpdateListeners.get(businessType)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        pageUpdateListeners.delete(businessType)
      }
    }
  }
}

// 导出状态和方法
export default {
  // 状态
  state: materialTemplateState,
  businessTypeMap,
  
  // 计算属性
  getConfigsStats,
  
  // 初始化方法
  initConfigs,
  
  // CRUD方法
  getConfigsByBusinessType,
  addConfig,
  updateConfig,
  deleteConfig,
  batchUpdateConfigs,
  resetToDefault,
  
  // 页面同步方法
  registerPageUpdateListener,
  notifyBusinessPageUpdate,
  
  // 存储方法
  saveConfigsToStorage,
  loadConfigsFromStorage
}
