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
      {
        path: 'project/archive',
        name: 'ProjectArchive',
        component: () => import('@/views/acceptance/management/archive.vue'),
        meta: {
          title: '历史档案',
          icon: 'DatabaseOutlined'
        }
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

      
      // 项目立项模块路由 (v3.0角色分离版本)
      // 申报单位角色路由
      {
        path: 'approval/applicant/manage',
        name: 'ApprovalApplicantManage',
        component: () => import('@/views/approval/applicant/manage.vue'),
        meta: {
          title: '申请管理',
          icon: 'FolderOutlined'
        }
      },
      {
        path: 'approval/applicant/submit',
        name: 'ApprovalApplicantSubmit',
        component: () => import('@/views/approval/applicant/submit.vue'),
        meta: {
          title: '提交立项',
          icon: 'PlusOutlined'
        }
      },

      // 管理角色路由
      {
        path: 'approval/management/center',
        name: 'ApprovalManagementCenter',
        component: () => import('@/views/approval/management/center.vue'),
        meta: {
          title: '管理中心',
          icon: 'AppstoreOutlined'
        }
      },
      {
        path: 'approval/management/conclusion',
        name: 'ApprovalManagementConclusion',
        component: () => import('@/views/approval/management/conclusion.vue'),
        meta: {
          title: '会议管理',
          icon: 'ScheduleOutlined'
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

      // 项目开题整合页面 - 新增
      {
        path: 'implementation/opening',
        name: 'ImplementationOpening',
        component: () => import('@/views/implementation/opening/index.vue'),
        meta: {
          title: '项目开题',
          icon: 'RocketOutlined'
        }
      },

      // 项目中期整合页面 - 新增
      {
        path: 'implementation/midterm',
        name: 'ImplementationMidterm',
        component: () => import('@/views/implementation/midterm/index.vue'),
        meta: {
          title: '项目中期',
          icon: 'PieChartOutlined'
        }
      },

      // 项目立项整合页面 - 新增
      {
        path: 'implementation/approval',
        name: 'ImplementationApproval',
        component: () => import('@/views/implementation/approval/index.vue'),
        meta: {
          title: '项目立项',
          icon: 'AuditOutlined'
        }
      },

      // 项目验收整合页面 - 新增
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
      
      // 项目开题模块路由 (与项目验收结构相同)
      // 申报单位角色路由
      {
        path: 'opening/application/manage',
        name: 'OpeningApplicationManage',
        component: () => import('@/views/opening/applicant/manage.vue'),
        meta: {
          title: '申请管理',
          icon: 'FolderOutlined'
        }
      },
      {
        path: 'opening/application/submit',
        name: 'OpeningApplicationSubmit',
        component: () => import('@/views/opening/applicant/submit.vue'),
        meta: {
          title: '提交开题',
          icon: 'PlusOutlined'
        }
      },
      {
        path: 'opening/progress/query',
        name: 'OpeningProgressQuery',
        component: () => import('@/views/opening/applicant/progress.vue'),
        meta: {
          title: '进度查询',
          icon: 'SearchOutlined'
        }
      },
      // 管理角色路由
      {
        path: 'opening/management/center',
        name: 'OpeningManagementCenter',
        component: () => import('@/views/opening/management/center.vue'),
        meta: {
          title: '管理中心',
          icon: 'AppstoreOutlined'
        }
      },
      {
        path: 'opening/meeting/conclusion',
        name: 'OpeningMeetingConclusion',
        component: () => import('@/views/opening/management/conclusion.vue'),
        meta: {
          title: '会议管理',
          icon: 'ScheduleOutlined'
        }
      },
      
      // 项目中期模块路由 (与项目验收结构相同)
      // 申报单位角色路由
      {
        path: 'midterm/application/manage',
        name: 'MidtermApplicationManage',
        component: () => import('@/views/midterm/applicant/manage.vue'),
        meta: {
          title: '申请管理',
          icon: 'FolderOutlined'
        }
      },
      {
        path: 'midterm/application/submit',
        name: 'MidtermApplicationSubmit',
        component: () => import('@/views/midterm/applicant/submit.vue'),
        meta: {
          title: '提交中期',
          icon: 'PlusOutlined'
        }
      },
      {
        path: 'midterm/progress/query',
        name: 'MidtermProgressQuery',
        component: () => import('@/views/midterm/applicant/progress.vue'),
        meta: {
          title: '进度查询',
          icon: 'SearchOutlined'
        }
      },
      // 管理角色路由
      {
        path: 'midterm/management/center',
        name: 'MidtermManagementCenter',
        component: () => import('@/views/midterm/management/center.vue'),
        meta: {
          title: '管理中心',
          icon: 'AppstoreOutlined'
        }
      },
      {
        path: 'midterm/meeting/conclusion',
        name: 'MidtermMeetingConclusion',
        component: () => import('@/views/midterm/management/conclusion.vue'),
        meta: {
          title: '会议管理',
          icon: 'ScheduleOutlined'
        }
      },
      
      // 项目验收模块路由 (v3.0角色分离版本)
      // 申报单位角色路由
      {
        path: 'acceptance/application/manage',
        name: 'AcceptanceApplicationManage',
        component: () => import('@/views/acceptance/applicant/manage.vue'),
        meta: {
          title: '申请管理',
          icon: 'FolderOutlined'
        }
      },
      {
        path: 'acceptance/application/submit',
        name: 'AcceptanceApplicationSubmit',
        component: () => import('@/views/acceptance/applicant/submit.vue'),
        meta: {
          title: '提交验收',
          icon: 'PlusOutlined'
        }
      },
      {
        path: 'acceptance/progress/query',
        name: 'AcceptanceProgressQuery',
        component: () => import('@/views/acceptance/applicant/progress.vue'),
        meta: {
          title: '进度查询',
          icon: 'SearchOutlined'
        }
      },
      // 管理角色路由
      {
        path: 'acceptance/management/center',
        name: 'AcceptanceManagementCenter',
        component: () => import('@/views/acceptance/management/center.vue'),
        meta: {
          title: '管理中心',
          icon: 'AppstoreOutlined'
        }
      },


      {
        path: 'acceptance/meeting/conclusion',
        name: 'AcceptanceMeetingConclusion',
        component: () => import('@/views/acceptance/management/conclusion.vue'),
        meta: {
          title: '会议管理',
          icon: 'ScheduleOutlined'
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
      // 材料提交模板维护
      {
        path: 'settings/material-template',
        name: 'MaterialTemplate',
        component: () => import('@/views/settings/material-template.vue'),
        meta: {
          title: '材料提交模板维护',
          icon: 'FileTextOutlined'
        }
      },
      {
        path: 'preview',
        name: 'Preview',
        component: () => import('@/views/设计方案/工作台方案/Preview.vue')
      },
      {
        path: 'implementation/opening/submit',
        name: 'ImplementationOpeningSubmit',
        component: () => import('@/views/opening/applicant/submit.vue'),
        meta: { title: '项目开题-材料提交' }
      },
      {
        path: 'implementation/opening/meeting',
        name: 'ImplementationOpeningMeeting',
        component: () => import('@/views/opening/management/conclusion.vue'),
        meta: { title: '项目开题-组织会议' }
      },
      {
        path: 'implementation/midterm/submit',
        name: 'ImplementationMidtermSubmit',
        component: () => import('@/views/midterm/applicant/submit.vue'),
        meta: { title: '项目中期-材料提交' }
      },
      {
        path: 'implementation/midterm/meeting',
        name: 'ImplementationMidtermMeeting',
        component: () => import('@/views/midterm/management/conclusion.vue'),
        meta: { title: '项目中期-组织会议' }
      },
      {
        path: 'implementation/acceptance/submit',
        name: 'ImplementationAcceptanceSubmit',
        component: () => import('@/views/acceptance/applicant/submit.vue'),
        meta: { title: '项目验收-材料提交' }
      },
      {
        path: 'implementation/acceptance/meeting',
        name: 'ImplementationAcceptanceMeeting',
        component: () => import('@/views/acceptance/management/conclusion.vue'),
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
