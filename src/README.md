# src 目录结构说明

本项目基于 RuoYi 管理系统规范，前端采用 Vue3 + Ant Design Vue 技术栈，推荐目录结构如下：

```
src/
├── api/           # API 接口定义
├── assets/        # 静态资源（图片、SVG等）
├── components/    # 公共组件
├── layout/        # 布局组件
├── router/        # 路由配置
├── store/         # 状态管理（Pinia）
├── styles/        # 全局样式、主题变量
├── utils/         # 工具函数
└── views/         # 页面组件
    ├── login/     # 登录页
    ├── dashboard/ # 工作台/首页
    └── ...        # 其他业务页面
```

> 建议所有页面目录下主页面文件命名为 `index.vue`，便于自动化和维护。 