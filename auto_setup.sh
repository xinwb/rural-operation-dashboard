#!/bin/bash

# 乡村运营数据大屏展示系统 - 自动化部署脚本

echo "乡村运营数据大屏展示系统 - 部署脚本"
echo "=================================="

# 检查是否已安装必要工具
if ! command -v curl &> /dev/null; then
    echo "错误: 未找到 curl 命令"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "错误: 未找到 git 命令"
    exit 1
fi

echo "步骤 1: 检查远程仓库是否存在"
REPO_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" https://github.com/xinwb/rural-operation-dashboard)

if [ "$REPO_EXISTS" -eq 200 ]; then
    echo "✓ 仓库已存在，正在推送..."
    git push -u origin main
elif [ "$REPO_EXISTS" -eq 404 ]; then
    echo "✗ 仓库不存在，需要先在GitHub上创建"
    echo ""
    echo "请按以下步骤操作："
    echo "1. 访问 https://github.com/new"
    echo "2. 创建名为 'rural-operation-dashboard' 的新仓库"
    echo "3. 选择公开（Public）选项"
    echo "4. 不要勾选任何初始化选项（README、.gitignore等）"
    echo "5. 点击 'Create repository'"
    echo ""
    echo "创建完成后，再次运行此脚本。"
    echo ""
    read -p "完成以上步骤后按 Enter 继续..."
    
    # 再次检查仓库是否存在
    REPO_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" https://github.com/xinwb/rural-operation-dashboard)
    
    if [ "$REPO_EXISTS" -eq 200 ]; then
        echo "✓ 仓库已创建，正在推送..."
        git push -u origin main
        echo "✓ 项目已成功推送到GitHub！"
    else
        echo "✗ 仓库仍然不存在，请确认已在GitHub上创建"
        exit 1
    fi
else
    echo "✗ 无法访问GitHub，请检查网络连接"
    exit 1
fi

echo ""
echo "步骤 2: 配置 GitHub Pages"
echo "请按以下步骤启用 GitHub Pages："
echo "1. 访问 https://github.com/xinwb/rural-operation-dashboard"
echo "2. 点击 'Settings' 标签"
echo "3. 向下滚动到 'Pages' 部分"
echo "4. 在 'Source' 下拉菜单中选择 'Deploy from a branch'"
echo "5. 选择 'main' 分支和 '/' 目录"
echo "6. 点击 'Save'"
echo ""

echo "步骤 3: 访问您的网站"
echo "配置完成后，您的网站将在以下地址可用："
echo "https://xinwb.github.io/rural-operation-dashboard/"

echo ""
echo "部署完成！"