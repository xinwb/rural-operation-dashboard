# 乡村运营数据大屏展示系统 - AI 编码指南

## 项目概述
这是一个混合架构的数据可视化系统,支持两种运行模式:
- **开发模式**: Flask 后端 + 静态前端,从本地 Excel 文件实时读取数据
- **生产模式**: 纯静态站点(GitHub Pages),使用预生成的 JSON 数据

## 核心架构决策

### 数据源双轨设计
系统优雅降级处理数据加载失败:
1. [script.js](script.js) 的 `loadData()` 首先尝试从 `/api/data` 获取 Excel 数据
2. 失败时自动降级到静态 `data/*.json` 文件
3. 最终回退到客户端模拟数据 `generateMockData()`

```javascript
// 示例: script.js L5-45 展示了多层降级策略
async function loadData() {
  const response = await fetch('/api/data');  // 优先 API
  // 失败时使用 data/data.json 或模拟数据
}
```

### Excel 列名动态映射
[server.py](server.py#L71-L80) 和 [script.js](script.js#L120-L145) 使用关键词匹配而非硬编码列名:
```python
# 查找包含"区域"/"地区"/"区"的列
if '区域' in key or '地区' in key or '区' in key:
    region_column = key
```
**修改数据处理时**: 始终使用 `findColumnByKeywords()` 而非直接访问列名。

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
node generate_static_data.js  # 生成 data/data.json 和 data/stats.json
```
这是部署到 GitHub Pages **必须**的步骤,因为 Pages 不支持后端。

### 部署到 GitHub Pages
```bash
./deploy.sh  # 或参考 PUSH_INSTRUCTIONS.md 手动推送
```
部署后站点将在 `https://xinwb.github.io/rural-operation-dashboard/` 可用。

## 项目特定约定

### 图表库选择
- 使用 **ECharts**(而非 Chart.js),尽管 [index.html](index.html#L8) 中加载了两者
- 所有图表初始化在 [script.js](script.js) 的 `updateCharts()` 中,使用 ECharts API

### 中文优先
- 所有变量名、注释、文档使用中文
- API 响应和 JSON 键名使用中文(如 `村庄名称`、`所属区域`)

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
2. 在 [script.js](script.js) 的 `updateCharts()` 中使用 `echarts.init()`
3. 更新 [generate_static_data.js](generate_static_data.js) 同步模拟数据

**修改 Excel 数据源**:
更新 [server.py](server.py#L8) 的 `EXCEL_FILE_PATH` 常量。

**调试数据加载问题**:
检查浏览器控制台,系统会记录降级步骤:`"数据加载失败"` → `"使用模拟数据作为备选方案"`。
