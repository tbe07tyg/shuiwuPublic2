#!/bin/bash

# 科研管理系统前端部署脚本
# 使用方法: ./deploy.sh [platform]
# 支持平台: netlify, vercel, github

set -e

echo "🚀 科研管理系统前端部署脚本"
echo "================================="

# 检查参数
PLATFORM=${1:-"netlify"}
echo "📦 部署平台: $PLATFORM"

# 检查依赖
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 请先安装 Node.js 和 npm"
    exit 1
fi

# 安装依赖
echo "📥 安装项目依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ ! -d "dist" ]; then
    echo "❌ 构建失败: dist 目录不存在"
    exit 1
fi

echo "✅ 构建完成！"

# 根据平台执行不同的部署步骤
case $PLATFORM in
    "netlify")
        echo "🌐 准备 Netlify 部署..."
        echo "请按照以下步骤手动部署："
        echo "1. 访问 https://www.netlify.com/"
        echo "2. 登录并点击 'New site from Git'"
        echo "3. 连接您的 GitHub 仓库"
        echo "4. 构建设置已自动配置 (netlify.toml)"
        echo "5. 点击 'Deploy site'"
        ;;
    "vercel")
        echo "⚡ 准备 Vercel 部署..."
        if command -v vercel &> /dev/null; then
            echo "🚀 使用 Vercel CLI 部署..."
            vercel --prod
        else
            echo "请按照以下步骤手动部署："
            echo "1. 访问 https://vercel.com/"
            echo "2. 使用 GitHub 账号登录"
            echo "3. 点击 'New Project'"
            echo "4. 选择您的仓库"
            echo "5. 配置已自动识别 (vercel.json)"
            echo "6. 点击 'Deploy'"
        fi
        ;;
    "github")
        echo "🐙 准备 GitHub Pages 部署..."
        echo "请按照以下步骤部署："
        echo "1. 将代码推送到 GitHub 仓库"
        echo "2. 进入仓库设置页面"
        echo "3. 找到 'Pages' 选项"
        echo "4. 选择 'GitHub Actions' 作为 Source"
        echo "5. 系统会自动使用 .github/workflows/deploy.yml"
        echo "6. 等待部署完成"
        ;;
    *)
        echo "❌ 不支持的平台: $PLATFORM"
        echo "支持的平台: netlify, vercel, github"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署准备完成！"
echo "📖 详细说明请查看 DEPLOYMENT.md"
echo "🌟 项目特点："
echo "   - Vue 3 + Vite + Ant Design Vue"
echo "   - 响应式设计，支持多端适配"
echo "   - 完整的科研管理功能"
echo "   - 角色权限管理"
echo "   - 工作台智能提醒"
echo ""
echo "🔗 下一步:"
echo "   1. 访问对应平台完成部署"
echo "   2. 配置自定义域名（可选）"
echo "   3. 设置后端API地址"
echo "   4. 测试各项功能" 