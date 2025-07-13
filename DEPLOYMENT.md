# 🚀 科研管理系统前端部署指南

## 📋 部署前准备

### 1. 确认构建正常
```bash
npm run build
```

### 2. 检查构建产物
构建完成后，检查 `dist/` 目录是否包含完整文件。

## 🌐 部署方案

### 方案一：Netlify 部署（推荐）

#### 步骤：
1. 访问 [Netlify](https://www.netlify.com/)
2. 注册账号并登录
3. 点击 "New site from Git"
4. 连接 GitHub 仓库
5. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 点击 "Deploy site"

#### 优势：
- ✅ 免费额度充足
- ✅ 自动 CI/CD
- ✅ 支持自定义域名
- ✅ 全球 CDN
- ✅ 支持表单处理

### 方案二：Vercel 部署

#### 步骤：
1. 访问 [Vercel](https://vercel.com/)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择您的仓库
5. 配置项目设置（已自动识别）
6. 点击 "Deploy"

#### 优势：
- ✅ 免费且性能优异
- ✅ 自动优化
- ✅ 全球边缘网络
- ✅ 支持 Serverless Functions

### 方案三：GitHub Pages 部署

#### 步骤：
1. 推送代码到 GitHub 仓库
2. 进入仓库设置页面
3. 找到 "Pages" 选项
4. 选择 "GitHub Actions" 作为 Source
5. 系统会自动使用 `.github/workflows/deploy.yml` 配置
6. 等待部署完成

#### 优势：
- ✅ 完全免费
- ✅ 与 GitHub 无缝集成
- ✅ 自动部署

### 方案四：服务器部署

#### 步骤：
1. 构建项目：`npm run build`
2. 将 `dist/` 目录内容上传到服务器
3. 配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 部署后配置

### 1. 环境变量配置
根据部署平台配置以下环境变量：
- `VITE_API_BASE_URL`: 后端API地址
- `VITE_APP_TITLE`: 应用标题

### 2. 域名配置
- 在部署平台设置自定义域名
- 配置SSL证书（通常自动）

### 3. 后端API配置
确保后端服务已部署并配置CORS：
```javascript
// 后端需要配置的CORS域名
const allowedOrigins = [
  'https://your-domain.com',
  'https://your-app.netlify.app',
  'https://your-app.vercel.app'
];
```

## 🛡️ 安全配置

### 1. 内容安全策略
已在配置文件中添加基本的安全头：
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff

### 2. HTTPS 强制
确保所有部署平台都启用HTTPS重定向。

## 📊 监控与分析

### 1. 性能监控
- 使用 Google Analytics 或其他分析工具
- 监控页面加载时间
- 跟踪用户行为

### 2. 错误监控
- 集成 Sentry 或其他错误追踪工具
- 监控前端错误

## 🔄 更新部署

### 自动部署
推送代码到主分支后，部署平台会自动构建和部署。

### 手动部署
如需手动部署：
1. 运行 `npm run build`
2. 上传 `dist/` 目录内容

## 🎯 推荐选择

- **个人项目**：Netlify 或 Vercel
- **企业项目**：自建服务器 + CDN
- **开源项目**：GitHub Pages

## 📞 技术支持

如遇到部署问题，请检查：
1. 构建日志
2. 浏览器控制台错误
3. 网络请求状态
4. 后端API连接性

---

*最后更新时间：2025年1月22日* 