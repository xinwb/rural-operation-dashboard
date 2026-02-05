# 推送说明

要将此项目推送到GitHub，请按以下步骤操作：

## 1. 在GitHub上创建仓库
1. 访问 https://github.com/new
2. 创建名为 `rural-operation-dashboard` 的公共仓库
3. 不要初始化仓库（不要添加 README、.gitignore 或 license）

## 2. 推送项目
```bash
cd /Users/wubin/Documents/Github/dashboard-system
git remote add origin https://github.com/xinwb/rural-operation-dashboard.git
git branch -M main
git push -u origin main
```

## 3. 启用GitHub Pages
1. 推送完成后，访问仓库设置页面
2. 点击左侧菜单中的 "Pages"
3. 在 "Source" 下拉菜单中选择 "Deploy from a branch"
4. 选择 "main" 分支和 "/" 文件夹
5. 点击 "Save"

几分钟后，您的网站将在 https://xinwb.github.io/rural-operation-dashboard/ 上可用。

## 项目说明

这是一个乡村运营数据大屏展示系统，具有以下特性：
- 数据可视化（使用ECharts图表库）
- 响应式设计，适合大屏展示
- 自动刷新功能
- 实时数据展示
- 支持Excel数据导入

该项目已配置为静态网站，可以直接部署到GitHub Pages。