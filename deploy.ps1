# 科研管理系统前端部署脚本 (PowerShell)
# 使用方法: .\deploy.ps1 [platform]
# 支持平台: netlify, vercel, github

param(
    [string]$Platform = "netlify"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 科研管理系统前端部署脚本" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host "📦 部署平台: $Platform" -ForegroundColor Yellow

# 检查依赖
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误: 请先安装 Node.js 和 npm" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host "📥 安装项目依赖..." -ForegroundColor Blue
npm install

# 构建项目
Write-Host "🔨 构建项目..." -ForegroundColor Blue
npm run build

# 检查构建结果
if (-not (Test-Path "dist")) {
    Write-Host "❌ 构建失败: dist 目录不存在" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 构建完成！" -ForegroundColor Green

# 根据平台执行不同的部署步骤
switch ($Platform) {
    "netlify" {
        Write-Host "🌐 准备 Netlify 部署..." -ForegroundColor Cyan
        Write-Host "请按照以下步骤手动部署：" -ForegroundColor White
        Write-Host "1. 访问 https://www.netlify.com/" -ForegroundColor White
        Write-Host "2. 登录并点击 'New site from Git'" -ForegroundColor White
        Write-Host "3. 连接您的 GitHub 仓库" -ForegroundColor White
        Write-Host "4. 构建设置已自动配置 (netlify.toml)" -ForegroundColor White
        Write-Host "5. 点击 'Deploy site'" -ForegroundColor White
    }
    "vercel" {
        Write-Host "⚡ 准备 Vercel 部署..." -ForegroundColor Cyan
        if (Get-Command vercel -ErrorAction SilentlyContinue) {
            Write-Host "🚀 使用 Vercel CLI 部署..." -ForegroundColor Green
            vercel --prod
        } else {
            Write-Host "请按照以下步骤手动部署：" -ForegroundColor White
            Write-Host "1. 访问 https://vercel.com/" -ForegroundColor White
            Write-Host "2. 使用 GitHub 账号登录" -ForegroundColor White
            Write-Host "3. 点击 'New Project'" -ForegroundColor White
            Write-Host "4. 选择您的仓库" -ForegroundColor White
            Write-Host "5. 配置已自动识别 (vercel.json)" -ForegroundColor White
            Write-Host "6. 点击 'Deploy'" -ForegroundColor White
        }
    }
    "github" {
        Write-Host "🐙 准备 GitHub Pages 部署..." -ForegroundColor Cyan
        Write-Host "请按照以下步骤部署：" -ForegroundColor White
        Write-Host "1. 将代码推送到 GitHub 仓库" -ForegroundColor White
        Write-Host "2. 进入仓库设置页面" -ForegroundColor White
        Write-Host "3. 找到 'Pages' 选项" -ForegroundColor White
        Write-Host "4. 选择 'GitHub Actions' 作为 Source" -ForegroundColor White
        Write-Host "5. 系统会自动使用 .github/workflows/deploy.yml" -ForegroundColor White
        Write-Host "6. 等待部署完成" -ForegroundColor White
    }
    default {
        Write-Host "❌ 不支持的平台: $Platform" -ForegroundColor Red
        Write-Host "支持的平台: netlify, vercel, github" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 部署准备完成！" -ForegroundColor Green
Write-Host "📖 详细说明请查看 DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host "🌟 项目特点：" -ForegroundColor Magenta
Write-Host "   - Vue 3 + Vite + Ant Design Vue" -ForegroundColor White
Write-Host "   - 响应式设计，支持多端适配" -ForegroundColor White
Write-Host "   - 完整的科研管理功能" -ForegroundColor White
Write-Host "   - 角色权限管理" -ForegroundColor White
Write-Host "   - 工作台智能提醒" -ForegroundColor White
Write-Host ""
Write-Host "🔗 下一步:" -ForegroundColor Yellow
Write-Host "   1. 访问对应平台完成部署" -ForegroundColor White
Write-Host "   2. 配置自定义域名（可选）" -ForegroundColor White
Write-Host "   3. 设置后端API地址" -ForegroundColor White
Write-Host "   4. 测试各项功能" -ForegroundColor White

# 打开部署文档
$openDoc = Read-Host "是否打开部署文档？(y/n)"
if ($openDoc -eq "y" -or $openDoc -eq "Y") {
    if (Test-Path "DEPLOYMENT.md") {
        Start-Process "DEPLOYMENT.md"
    }
} 