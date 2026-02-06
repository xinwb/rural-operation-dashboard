# 乡村运营数据大屏展示系统

这是一个基于Web的数据可视化大屏展示系统，用于展示乡村运营行政村的相关信息。

## 功能特性

- 实时展示乡村运营数据
- 数据可视化图表（饼图、柱状图）
- 响应式设计，适配大屏显示
- 自动刷新功能
- 数据表格展示

## 技术栈

- 前端：HTML, CSS, JavaScript
- 图表库：ECharts
- 后端：Python Flask
- 数据处理：Pandas

## 安装依赖

```bash
pip3 install flask pandas openpyxl xlrd
```

## 运行应用

```bash
python3 server.py
```

应用将在 http://localhost:5002 上运行。

## 数据源

系统默认读取微信文件中的Excel文件：
`/Users/wubin/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wubin010745_34d6/msg/file/2026-01/0501（汇总）乡村运营行政村信息表(已开展运营).xls`

## API接口

- `GET /api/data` - 获取Excel中的所有数据
- `GET /api/stats` - 获取统计数据

## 项目结构

```
dashboard-system/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 前端JavaScript
├── server.py           # 后端Flask服务器
├── README.md           # 项目说明
└── package.json        # 项目配置
```

## 部署到GitHub Pages

由于GitHub Pages不支持后端服务，需要将后端API替换为静态JSON数据或使用第三方服务。

## 注意事项

- 确保Excel文件路径正确
- 后端服务需要Python环境
- 前端图表使用ECharts库，需要联网加载CDN资源