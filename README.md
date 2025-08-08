# 科研管理系统前端项目

## 项目简介

这是一个基于Vue 3 + Vite + Ant Design Vue的现代化科研管理系统前端项目，专为国企科研机构设计，提供完整的项目管理、立项、实施、验收等全流程管理功能。

## 技术栈

- **前端框架**: Vue 3.4.0
- **构建工具**: Vite 6.3.5
- **UI组件库**: Ant Design Vue 4.2.6
- **状态管理**: Pinia 2.1.0
- **路由管理**: Vue Router 4.2.0
- **图表库**: ECharts 5.6.0
- **流程图**: Mermaid 11.9.0
- **HTTP客户端**: Axios 1.11.0

## 功能特性

### 🎯 多角色管理
- **项目经理**: 项目配置、团队管理、资源分配
- **团队成员**: 任务看板、进度更新、材料提交
- **管理层**: 数据分析、审批管理、系统监控

### 📊 项目管理
- 项目立项申请与审批
- 项目实施进度监控
- 项目验收与归档
- 里程碑任务分配
- 材料提交模板管理

### 🤖 AI助手功能
- 项目经理AI助手
- 团队成员AI助手
- 管理层AI助手
- 智能问答与建议

### 📈 数据分析
- 项目统计分析
- 经费执行进度
- 效率分析报告
- 可视化图表展示

### 🔧 系统功能
- 用户权限管理
- 角色颜色区分
- 响应式设计
- 文件预览功能
- 会议管理

## 项目结构

```
src/
├── api/                    # API接口
├── assets/                 # 静态资源
├── components/             # 公共组件
│   ├── ai/                # AI助手组件
│   └── research/          # 调研相关组件
├── config/                 # 配置文件
├── layout/                 # 布局组件
├── router/                 # 路由配置
├── services/               # 服务层
├── store/                  # 状态管理
├── styles/                 # 样式文件
├── utils/                  # 工具函数
└── views/                  # 页面组件
    ├── ai-assistant/       # AI助手页面
    ├── approval/           # 立项管理
    ├── implementation/     # 项目实施
    ├── project-manager/    # 项目经理后台
    ├── team-member/        # 团队成员工作台
    └── ...
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run serve
```

## 部署方案

### Vercel部署
项目已配置`vercel.json`，支持一键部署到Vercel：

```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages部署
项目支持GitHub Pages部署，配置了相应的构建脚本。

### Netlify部署
项目包含`netlify.toml`配置文件，支持Netlify部署。

## 主要页面

### 登录页面
- 现代化登录界面
- 支持多种登录方式
- 响应式设计

### 工作台
- 项目经理工作台
- 团队成员工作台
- 管理层工作台

### 项目管理
- 项目列表与详情
- 项目创建与编辑
- 项目归档管理

### 立项管理
- 申请管理
- 提交立项
- 管理中心
- 会议管理

### 项目实施
- 合同管理
- 节点管理
- 付款管理
- 进度监控

### 项目验收
- 申请管理
- 提交验收
- 进度查询
- 会议管理

## 开发指南

### 代码规范
- 使用ESLint进行代码检查
- 遵循Vue 3 Composition API规范
- 组件命名采用PascalCase
- 文件命名采用kebab-case

### 状态管理
- 使用Pinia进行状态管理
- 按模块划分store
- 支持持久化存储

### 路由管理
- 基于Vue Router 4
- 支持路由守卫
- 动态路由加载

## 贡献指南

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目维护者: TBE07TYG
- GitHub: [https://github.com/TBE07TYG/shuiwuPublic2](https://github.com/TBE07TYG/shuiwuPublic2)

## 更新日志

### v1.0.0 (2025-01-27)
- 初始版本发布
- 完整的科研管理系统功能
- 多角色权限管理
- AI助手功能集成
- 响应式设计支持 