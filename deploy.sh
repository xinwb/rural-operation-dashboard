#!/bin/bash

# 部署乡村运营数据大屏展示系统到GitHub

echo "开始部署乡村运营数据大屏展示系统到GitHub..."

# 检查是否已安装git
if ! command -v git &> /dev/null; then
    echo "错误: 未找到git命令，请先安装git"
    exit 1
fi

# 设置仓库信息
REPO_NAME="rural-operation-dashboard"
GITHUB_USER=$(git config github.user 2>/dev/null || echo "")
if [ -z "$GITHUB_USER" ]; then
    echo "请输入您的GitHub用户名:"
    read GITHUB_USER
fi

# 创建远程仓库（如果不存在）
echo "正在创建GitHub仓库 $GITHUB_USER/$REPO_NAME ..."

# 检查本地仓库是否已初始化
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit: 乡村运营数据大屏展示系统"
fi

# 添加远程仓库
REMOTE_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"
git remote set-url origin $REMOTE_URL

# 创建GitHub仓库（需要GitHub CLI或手动创建）
if command -v gh &> /dev/null; then
    # 使用GitHub CLI创建仓库
    gh repo create $GITHUB_USER/$REPO_NAME --public --description "乡村运营数据大屏展示系统 - 数据可视化平台"
else
    echo "GitHub CLI未安装，请手动创建仓库 $GITHUB_USER/$REPO_NAME 或安装GitHub CLI"
    echo "安装GitHub CLI: https://cli.github.com/"
    echo "或者您可以手动创建仓库并继续部署"
fi

# 推送到GitHub
echo "正在推送到GitHub..."
git branch -M main
git push -u origin main

echo "部署完成！"
echo "您的项目可在 https://$GITHUB_USER.github.io/$REPO_NAME 访问（如果启用了GitHub Pages）"
echo ""
echo "要启用GitHub Pages，请："
echo "1. 访问 https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
echo "2. 选择 'Deploy from a branch'"
echo "3. 选择 'main' 分支和 '/' 文件夹"
echo "4. 点击 'Save'"