# 乡村运营数据大屏展示系统

这是一个基于Web的数据可视化大屏展示系统，用于展示杭州市乡村运营行政村的相关信息。

## 功能特性

- **实时数据展示**: 从 Excel 文件读取564条乡村运营数据
- **地图可视化**: 杭州市地图展示各区域村庄分布热力图
- **多维度统计**: 
  - 运营主体性质分布
  - 各区域村庄数量对比
  - 业态类型统计分析
  - 租金模式分布
- **数据表格**: 详细列表展示村庄信息
- **响应式设计**: 适配大屏显示，支持缩放交互
- **自动刷新**: 手动刷新按钮，实时更新数据

## 技术栈

- **前端**: HTML5, CSS3, JavaScript
- **图表库**: ECharts 5.4.3
- **后端**: Python Flask
- **数据处理**: Pandas, xlrd
- **地图**: GeoJSON + ECharts 地图组件

## 快速开始

### 安装依赖

```bash
pip3 install flask pandas openpyxl xlrd
```

### 数据处理

```bash
# 处理 Excel 数据生成 JSON 文件
python3 process_excel.py
```

这将读取 `data/` 目录下的 Excel 文件并生成:
- `data/data.json` - 详细数据 (564条记录)
- `data/stats.json` - 统计数据

### 运行应用

方式一: 使用启动脚本
```bash
./start.sh
```

方式二: 直接运行
```bash
python3 server.py
```

应用将在 http://localhost:5002 上运行。

## 数据源

系统从以下 Excel 文件读取数据：
```
data/0501（汇总）乡村运营行政村信息表(已开展运营).xls
```

数据包含：
- 基本信息: 村庄名称、所属区域、乡镇街道
- 人口数据: 户籍人口、常住人口
- 运营信息: 运营主体、主体性质、职业经理人
- 业态类型: 土特产、民宿、研学、康养、电商等
- 运营模式: 整村运营、单项运营
- 租金模式: 固定租金、保底分红、纯分红
- 绩效数据: 年均收入、就业人数、活动场数等

## API接口

- `GET /api/data` - 获取所有村庄数据
- `GET /api/stats` - 获取统计汇总数据

返回 JSON 格式数据。

## 项目结构

```
dashboard-system/
├── index.html              # 主页面
├── styles.css              # 样式文件
├── script.js               # 前端JavaScript
├── server.py               # Flask服务器
├── process_excel.py        # Excel数据处理脚本
├── start.sh                # 启动脚本
├── deploy.sh               # 部署脚本
├── README.md               # 项目说明
├── UPDATE_LOG.md           # 更新日志
├── PUSH_INSTRUCTIONS.md    # 推送说明
└── data/                   # 数据目录
    ├── 0501（汇总）....xls # Excel源数据
    ├── data.json           # 处理后的数据
    ├── stats.json          # 统计数据
    ├── hangzhou.json       # 杭州地图数据
    └── *.json              # 其他地图数据
```

## 数据更新流程

1. 将新的 Excel 文件放入 `data/` 目录
2. 运行数据处理脚本:
   ```bash
   python3 process_excel.py
   ```
3. 重启服务器查看更新

## 可视化展示

### 主要图表
1. **杭州市分布地图** - 热力图展示各区域村庄密度
2. **运营主体性质** - 饼图展示不同主体类型占比
3. **区域分布** - 柱状图对比各区域村庄数量
4. **业态类型** - 横向柱状图展示业态分布
5. **租金模式** - 环形饼图展示租金模式占比

### 概览卡片
- 运营村庄总数: 564个
- 覆盖区域数量: 85个
- 主要业态类型: 土特产
- 数据更新率: 100%

## 部署到GitHub Pages

系统支持静态部署到 GitHub Pages:

```bash
# 生成静态数据
python3 process_excel.py

# 推送到GitHub
./deploy.sh
```

部署后访问: https://xinwb.github.io/rural-operation-dashboard/

**注意**: GitHub Pages 不支持后端服务，使用静态 JSON 数据。

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

建议使用最新版本的现代浏览器以获得最佳体验。

## 注意事项

- Excel 文件路径在 `server.py` 中配置
- 确保有足够的权限读取 Excel 文件
- 前端图表使用 ECharts CDN，需要联网
- 大屏展示建议分辨率 1920x1080 或更高
- 数据更新后需重新运行 `process_excel.py`

## 开发环境

- Python 3.8+
- Node.js 14+ (可选,用于生成静态数据)
- 现代浏览器

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 作者

OpenClaw

## 更新日志

查看 [UPDATE_LOG.md](UPDATE_LOG.md) 了解详细更新记录。