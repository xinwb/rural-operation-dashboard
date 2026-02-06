# 乡村运营数据大屏展示系统 - AI 编码指南

## 项目概述
数据可视化大屏系统,采用混合架构支持两种运行模式:
- **开发模式**: Flask 后端 (http://localhost:5002) + 静态前端,从本地 Excel 文件实时读取数据
- **生产模式**: 纯静态站点 (GitHub Pages),使用预生成的 JSON 数据

## 核心架构决策

### 数据加载策略
[script.js](script.js#L35-L65) 的 `loadData()` 采用**单一数据源**设计:
- **当前版本**直接从 `data/data.json` 和 `data/stats.json` 加载静态数据
- 如果静态文件加载失败,抛出错误并显示"加载失败"
- **不存在**多层降级策略或客户端模拟数据

**注意**: 旧代码中的 API 调用 (`/api/data`) 已被移除,仅在开发模式下通过后端 [server.py](server.py#L40-L44) 提供 API 接口,但前端不再使用。

### Excel 列名动态映射
[server.py](server.py#L71-L80) 使用关键词匹配识别 Excel 列名,避免硬编码依赖:
```python
# 遍历所有列名,查找包含特定关键词的列
if '区域' in key or '地区' in key or '区' in key:
    region_column = key
if '运营' in key or '类型' in key:
    operation_column = key
```
**修改数据处理时**: 确保关键词匹配逻辑涵盖可能的列名变体。

## 关键开发工作流

### 本地开发
```bash
# 一键启动(自动检查依赖)
./start.sh

# 或手动启动
pip3 install flask pandas openpyxl xlrd
python3 server.py  # 运行在 http://localhost:5002
```
**注意**: Excel 文件路径硬编码在 [server.py](server.py#L8),指向微信文件目录。

### 生成静态数据用于部署
```bash
node generate_static_data.js
# 生成 data/data.json (50条模拟村庄数据)
# 生成 data/stats.json (统计信息)
# 注意: 此脚本会修改 index.html 插入内联脚本 (已废弃功能,实际不再执行)
```
这是部署到 GitHub Pages **必须**的步骤,因为 Pages 不支持后端。

### 部署到 GitHub Pages
```bash
./deploy.sh  # 自动初始化 git 仓库并推送 (需手动设置 GitHub token)
# 或参考 PUSH_INSTRUCTIONS.md 手动推送
```
部署后站点将在 `https://xinwb.github.io/rural-operation-dashboard/` 可用。
 5.4.3**(而非 Chart.js),尽管 [index.html](index.html#L8) 中加载了两者
- 所有图表初始化在 [script.js](script.js) 的 `updateCharts()` 中,使用 ECharts API
- 地图图表需要额外加载 [data/hangzhou.json](data/hangzhou.json) 等 GeoJSON 文件

### 中文优先约定
- 所有变量名、注释、文档**必须**使用中文
- JSON 数据键名使用中文(如 `村庄名称`、`所属区域`)
- 文件路径和 Git 提交信息也使用中文

### 响应式设计约束
[styles.css](styles.css) 针对**大屏展示**优化 (1920x1080):
- 默认字体 24px,卡片布局固定宽度
- **不要添加移动端适配**,除非明确要求
- 图表高度硬编码 (如 `height: 400px`)

### 未使用的代码文件
- [js/](js/) 目录下文件 (area_echarts.js, hangzhou_charts.js 等) **未被引用**
- [script_old.js](script_old.js) 是历史版本,已废弃
### 响应式设计约束
[styles.css](styles.css) 针对**大屏展示**优化:
- 默认字体 24px,适配 1920x1080 分辨率
- 不要添加移动端适配,除非明确要求

## 数据结构示例

```json
// data/data.json 格式
[
  {
    "id": 1,
    "村庄名称": "示范村1",
    "所属区域": "杭州市",
    "运营类型": "文旅融合",
    "负责人": "负责人A",
    "联系方式": "13812345678",
    "运营状态": "运营中"
  }
]
```

## 常见任务指南

**添加新图表**:
1. 在 [index.html](index.html) 中添加 `<div id="newChart">`
1. 打开浏览器控制台查看错误信息
2. 确认 [data/data.json](data/data.json) 和 [data/stats.json](data/stats.json) 存在
3. 检查 Flask 后端是否在开发模式下正常运行 (若使用 API 模式)

## 地理数据与地图
- 杭州市各区县经纬度硬编码在 [script.js](script.js#L8-L22) 的 `HANGZHOU_DISTRICT_COORDS` 中
- 地图 GeoJSON 数据存储在 `data/` 目录:
  - [hangzhou.json](data/hangzhou.json) - 杭州市地图
  - [linan.json](data/linan.json) / [linan.geojson](data/linan.geojson) - 临安区地图
  - [zhejiang.json](data/zhejiang.json) - 浙江省地图
- 地图数据需在 [script.js](script.js) 中通过 `echarts.registerMap()` 注册后使用

## 关键技术栈
- **前端**: 原生 JavaScript (ES6+), ECharts 5.4.3, 无框架
- **后端**: Python 3 + Flask + Pandas (用于 Excel 解析)
- **数据格式**: Excel (.xls) → JSON (pandas 转换)
- **部署**: GitHub Pages (静态托管)用 `echarts.init()`
3. 更新 [generate_static_data.js](generate_static_data.js) 同步模拟数据

**修改 Excel 数据源**:
更新 [server.py](server.py#L8) 的 `EXCEL_FILE_PATH` 常量。

**调试数据加载问题**:
检查浏览器控制台,系统会记录降级步骤:`"数据加载失败"` → `"使用模拟数据作为备选方案"`。
