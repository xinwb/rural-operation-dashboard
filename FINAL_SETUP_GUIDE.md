# 乡村运营数据大屏展示系统 - 发布指南

## 项目信息
- 项目名称: rural-operation-dashboard
- 项目描述: 乡村运营数据可视化大屏展示系统

## 部署步骤

### 步骤 1: 在 GitHub 上创建仓库
1. 访问 https://github.com/new
2. 仓库名称: `rural-operation-dashboard`
3. 描述: 乡村运营数据大屏展示系统
4. 公开性: 选择 Public（公开）
5. **不要勾选** "Initialize this repository with a README"
6. **不要勾选** "Add .gitignore" 或 "Choose a license"
7. 点击 "Create repository"

### 步骤 2: 验证仓库创建
1. 访问 https://github.com/xinwb/rural-operation-dashboard
2. 确认仓库已成功创建

### 步骤 3: 推送项目
```bash
cd /Users/wubin/Documents/Github/dashboard-system
git remote set-url origin https://github.com/xinwb/rural-operation-dashboard.git
git push -u origin main
```

### 步骤 4: 启用 GitHub Pages
1. 在仓库页面点击 "Settings"
2. 向下滚动到 "Pages" 部分
3. 从 "Source" 下拉菜单中选择 "Deploy from a branch"
4. 选择 "main" 分支和 "/" 目录
5. 点击 "Save"

### 步骤 5: 访问网站
- 网站将在几分钟后可用
- 地址: https://xinwb.github.io/rural-operation-dashboard/

## 项目特性

### 数据可视化
- 杭州市地图热力图展示各区域村庄分布
- 运营主体性质分布饼图
- 各区域村庄数量对比柱状图
- 业态类型统计分析
- 租金模式分布环形图

### 功能特点
- 实时数据展示（从Excel文件读取564条乡村运营数据）
- 响应式设计，适配大屏显示
- 自动刷新功能
- 数据表格展示
- 支持Excel数据导入

### 技术栈
- 前端: HTML5, CSS3, JavaScript
- 图表库: ECharts 5.4.3
- 后端: Python Flask
- 数据处理: Pandas, xlrd

## 本地运行
```bash
pip3 install flask pandas openpyxl xlrd
python3 server.py
```

访问 http://localhost:5002 查看本地版本。