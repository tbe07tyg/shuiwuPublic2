import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue')
      },
      {
        path: 'project',
        name: 'Project',
        component: () => import('@/views/project/index.vue')
      },
      {
        path: 'project/list',
        name: 'ProjectList',
        component: () => import('@/views/project/list.vue')
      },
      {
        path: 'project/create',
        name: 'ProjectCreate',
        component: () => import('@/views/project/create.vue')
      },
      {
        path: 'project/detail/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/project/detail.vue')
      },
      
      // 项目调研模块路由 (第1周已开发完成)
      {
        path: 'research/requirements',
        name: 'ResearchRequirements',
        component: () => import('@/views/research/requirements/index.vue')
      },

      {
        path: 'research/results',
        name: 'ResearchResults',
        component: () => import('@/views/research/results/index.vue')
      },

      
      // 项目立项模块路由 (使用占位组件)
      {
        path: 'approval/materials',
        name: 'ApprovalMaterials',
        component: () => import('@/views/approval/materials/index.vue')
      },
      {
        path: 'approval/review',
        name: 'ApprovalReview',
        component: () => import('@/views/approval/review/index.vue')
      },
      {
        path: 'approval/decision',
        name: 'ApprovalDecision',
        component: () => import('@/views/approval/decision/index.vue')
      },

      {
        path: 'approval/center',
        name: 'ApprovalCenter',
        component: () => import('@/views/approval/index.vue'),
        meta: {
          title: '立项管理中心',
          icon: 'FileTextOutlined'
        }
      },
      
      // 项目实施模块路由 (使用占位组件)
      {
        path: 'implementation/contract',
        name: 'ImplementationContract',
        component: () => import('@/views/implementation/contract/index.vue'),
        meta: {
          title: '合同管理',
          icon: 'FileTextOutlined'
        }
      },
      {
        path: 'implementation/nodes',
        name: 'ImplementationNodes',
        component: () => import('@/views/implementation/nodes/index.vue'),
        meta: {
          title: '节点管理',
          icon: 'NodeIndexOutlined'
        }
      },
      {
        path: 'implementation/payment',
        name: 'ImplementationPayment',
        component: () => import('@/views/implementation/payment/index.vue'),
        meta: {
          title: '付款管理',
          icon: 'AccountBookOutlined'
        }
      },
      {
        path: 'implementation/progress',
        name: 'ImplementationProgress',
        component: () => import('@/views/implementation/progress/index.vue'),
        meta: {
          title: '进度监控',
          icon: 'LineChartOutlined'
        }
      },
      {
        path: 'implementation/acceptance',
        name: 'ImplementationAcceptance',
        component: () => import('@/views/implementation/acceptance/index.vue'),
        meta: {
          title: '项目验收',
          icon: 'CheckCircleOutlined'
        }
      },
      {
        path: 'implementation/center',
        name: 'ImplementationCenter',
        component: () => import('@/views/implementation/center/index.vue'),
        meta: {
          title: '项目实施管理中心',
          icon: 'AppstoreOutlined'
        }
      },
      {
        path: 'implementation/template',
        name: 'ImplementationTemplate',
        component: () => import('@/views/implementation/template/index.vue'),
        meta: {
          title: '节点模板库',
          icon: 'AppstoreOutlined'
        }
      },
      
      // 成果管理模块路由
      {
        path: 'achievements',
        name: 'Achievements',
        component: () => import('@/views/achievements/index.vue'),
        meta: {
          title: '成果管理',
          icon: 'TrophyOutlined'
        }
      },
      
      // 统计分析模块路由
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/analytics/index.vue'),
        meta: {
          title: '统计分析中心',
          icon: 'BarChartOutlined'
        }
      },
      {
        path: 'analytics/project',
        name: 'AnalyticsProject',
        component: () => import('@/views/analytics/index.vue')
      },
      {
        path: 'analytics/finance',
        name: 'AnalyticsFinance',
        component: () => import('@/views/analytics/index.vue')
      },
      {
        path: 'analytics/efficiency',
        name: 'AnalyticsEfficiency',
        component: () => import('@/views/analytics/index.vue')
      },
      
      // 保留原有路由
      {
        path: 'literature',
        name: 'Literature',
        component: () => import('@/views/literature/index.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue')
      },
      {
        path: 'preview',
        name: 'Preview',
        component: () => import('@/views/设计方案/工作台方案/Preview.vue')
      },
      {
        path: 'implementation/opening/submit',
        name: 'ImplementationOpeningSubmit',
        component: () => import('@/views/implementation/opening/Submit.vue'),
        meta: { title: '项目开题-材料提交' }
      },
      {
        path: 'implementation/opening/meeting',
        name: 'ImplementationOpeningMeeting',
        component: () => import('@/views/implementation/opening/Meeting.vue'),
        meta: { title: '项目开题-组织会议' }
      },
      {
        path: 'implementation/midterm/submit',
        name: 'ImplementationMidtermSubmit',
        component: () => import('@/views/implementation/midterm/Submit.vue'),
        meta: { title: '项目中期-材料提交' }
      },
      {
        path: 'implementation/midterm/meeting',
        name: 'ImplementationMidtermMeeting',
        component: () => import('@/views/implementation/midterm/Meeting.vue'),
        meta: { title: '项目中期-组织会议' }
      },
      {
        path: 'implementation/acceptance/submit',
        name: 'ImplementationAcceptanceSubmit',
        component: () => import('@/views/implementation/acceptance/Submit.vue'),
        meta: { title: '项目验收-材料提交' }
      },
      {
        path: 'implementation/acceptance/meeting',
        name: 'ImplementationAcceptanceMeeting',
        component: () => import('@/views/implementation/acceptance/Meeting.vue'),
        meta: { title: '项目验收-组织会议' }
      },
      {
        path: '',
        redirect: 'dashboard'
      }
    ]
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 