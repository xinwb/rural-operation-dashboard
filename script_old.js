// 乡村运营数据大屏展示系统脚本
let operationTypeChart = null;
let regionChart = null;

// 从服务器加载Excel数据
async function loadData() {
    try {
        // 显示加载状态
        document.getElementById('totalVillages').textContent = '加载中...';
        
        // 从后端API获取数据
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 显示数据
        displayData(data);
        
        // 同时获取统计数据
        const statsResponse = await fetch('/api/stats');
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            updateStats(stats);
        }
        
        // 更新最后更新时间
        updateLastUpdatedTime();
        
        console.log('数据加载完成');
    } catch (error) {
        console.error('数据加载失败:', error);
        console.log('使用模拟数据作为备选方案');
        
        // 如果API调用失败，使用模拟数据
        const mockData = generateMockData();
        displayData(mockData);
        
        // 更新概览数据
        document.getElementById('totalVillages').textContent = mockData.length;
        document.getElementById('regionCount').textContent = 10;
        document.getElementById('operationTypes').textContent = '文旅融合';
        document.getElementById('updateRate').textContent = '90%';
    }
}

// 模拟生成数据（在实际应用中，这将来自真实的Excel文件）
function generateMockData() {
    const villages = [];
    const regions = ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '台州市', '丽水市'];
    const operationTypes = ['文旅融合', '生态农业', '电商直播', '民宿经济', '康养产业', '数字乡村'];
    
    for (let i = 1; i <= 50; i++) {
        villages.push({
            id: i,
            name: `示范村${i}`,
            region: regions[Math.floor(Math.random() * regions.length)],
            operationType: operationTypes[Math.floor(Math.random() * operationTypes.length)],
            manager: `负责人${String.fromCharCode(65 + i % 26)}`,
            contact: `138${Math.floor(10000000 + Math.random() * 90000000)}`,
            status: Math.random() > 0.2 ? '运营中' : '筹备中'
        });
    }
    
    return villages;
}

// 更新统计数据
function updateStats(stats) {
    document.getElementById('totalVillages').textContent = stats.total_villages || 0;
    document.getElementById('regionCount').textContent = stats.regions_count || 0;
    document.getElementById('operationTypes').textContent = stats.top_operation_type || '--';
    document.getElementById('updateRate').textContent = stats.update_rate || '--';
}

// 显示数据
function displayData(data) {
    // 如果有真实数据，优先使用真实数据更新表格
    if (data && data.length > 0) {
        // 更新表格
        updateTable(data);
        
        // 为真实数据计算图表数据
        // 尝试找到适当的列名
        const operationColumn = findColumnByKeywords(data[0], ['运营', '类型', '模式']);
        const regionColumn = findColumnByKeywords(data[0], ['区域', '地区', '区']);
        const statusColumn = findColumnByKeywords(data[0], ['状态', '运营状态']);
        
        if (operationColumn && regionColumn) {
            // 计算运营类型分布
            const typeCounts = {};
            data.forEach(row => {
                const opType = row[operationColumn];
                if (opType) {
                    const opStr = String(opType);
                    typeCounts[opStr] = (typeCounts[opStr] || 0) + 1;
                }
            });
            
            // 计算区域分布
            const regionCounts = {};
            data.forEach(row => {
                const region = row[regionColumn];
                if (region) {
                    const regionStr = String(region);
                    regionCounts[regionStr] = (regionCounts[regionStr] || 0) + 1;
                }
            });
            
            // 更新图表
            updateCharts(data, typeCounts, regionCounts);
        } else {
            // 如果没找到合适的列，使用模拟数据
            const mockData = generateMockData();
            const typeCounts = {};
            mockData.forEach(village => {
                typeCounts[village.operationType] = (typeCounts[village.operationType] || 0) + 1;
            });
            
            updateCharts(mockData, typeCounts);
        }
    } else {
        // 如果没有真实数据，使用模拟数据
        const mockData = generateMockData();
        displayData(mockData);
    }
}

// 辅助函数：根据关键词查找列名
function findColumnByKeywords(firstRow, keywords) {
    if (!firstRow) return null;
    
    for (const key of Object.keys(firstRow)) {
        for (const keyword of keywords) {
            if (key.includes(keyword)) {
                return key;
            }
        }
    }
    
    // 如果没有精确匹配，返回第一个可能的列
    for (const key of Object.keys(firstRow)) {
        for (const keyword of keywords) {
            if (key.toLowerCase().includes(keyword.toLowerCase())) {
                return key;
            }
        }
    }
    
    return null;
}

// 更新表格
function updateTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    data.forEach((village, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${village.name}</td>
            <td>${village.region}</td>
            <td>${village.operationType}</td>
            <td>${village.manager}</td>
            <td>${village.contact}</td>
            <td><span class="status-${village.status === '运营中' ? 'active' : 'pending'}">${village.status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 更新图表
function updateCharts(data, typeCounts, regionCounts = null) {
    // 销毁现有图表实例
    if (operationTypeChart) {
        operationTypeChart.dispose();
    }
    if (regionChart) {
        regionChart.dispose();
    }
    
    // 初始化运营类型分布图表
    const operationTypeChartDom = document.getElementById('operationTypeChart');
    operationTypeChart = echarts.init(operationTypeChartDom);
    
    const operationTypeOption = {
        title: {
            text: '运营类型分布',
            left: 'center',
            textStyle: { color: '#fff' }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: '#fff' }
        },
        series: [{
            name: '运营类型',
            type: 'pie',
            radius: '50%',
            data: Object.entries(typeCounts).map(([name, value]) => ({
                value: value,
                name: name
            })),
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            label: {
                color: '#fff'
            },
            labelLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.3)'
                }
            }
        }],
        color: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c']
    };
    
    operationTypeChart.setOption(operationTypeOption);
    
    // 初始化区域分布图表
    const regionChartDom = document.getElementById('regionChart');
    regionChart = echarts.init(regionChartDom);
    
    // 如果没有传入regionCounts，尝试从数据中计算
    if (!regionCounts) {
        regionCounts = {};
        // 尝试找到区域列
        if (data && data.length > 0 && typeof data[0] === 'object') {
            const regionColumn = findColumnByKeywords(data[0], ['区域', '地区', '区']);
            if (regionColumn) {
                data.forEach(row => {
                    const region = row[regionColumn];
                    if (region) {
                        const regionStr = String(region);
                        regionCounts[regionStr] = (regionCounts[regionStr] || 0) + 1;
                    }
                });
            } else {
                // 如果没找到区域列，使用模拟数据
                const mockRegions = ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市'];
                mockRegions.forEach(region => {
                    regionCounts[region] = Math.floor(Math.random() * 20) + 5;
                });
            }
        }
    }
    
    const regionOption = {
        title: {
            text: '各区域运营村庄数量',
            left: 'center',
            textStyle: { color: '#fff' }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'category',
            data: Object.keys(regionCounts),
            axisLabel: { color: '#fff' },
            axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#fff' },
            axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
            splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
        },
        series: [{
            name: '村庄数量',
            type: 'bar',
            data: Object.values(regionCounts),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 0.5, color: '#188df0' },
                    { offset: 1, color: '#188df0' }
                ])
            },
            emphasis: {
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#2378f7' },
                        { offset: 0.7, color: '#2378f7' },
                        { offset: 1, color: '#83bff6' }
                    ])
                }
            }
        }]
    };
    
    regionChart.setOption(regionOption);
    
    // 自适应窗口大小
    window.addEventListener('resize', function() {
        if (operationTypeChart) operationTypeChart.resize();
        if (regionChart) regionChart.resize();
    });
}

// 更新最后更新时间
function updateLastUpdatedTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN');
    document.getElementById('lastUpdated').textContent = `最后更新: ${timeStr}`;
}

// 显示错误信息
function showError(message) {
    document.getElementById('totalVillages').textContent = '加载失败';
    console.error(message);
}

// 刷新数据
function refreshData() {
    document.getElementById('refreshBtn').disabled = true;
    document.getElementById('refreshBtn').textContent = '刷新中...';
    
    loadData().finally(() => {
        setTimeout(() => {
            document.getElementById('refreshBtn').disabled = false;
            document.getElementById('refreshBtn').textContent = '刷新数据';
        }, 1000);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载初始数据
    loadData();
    
    // 绑定刷新按钮事件
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    
    // 每5分钟自动刷新一次数据（可选）
    setInterval(refreshData, 5 * 60 * 1000);
});

// 为状态标签添加样式
const style = document.createElement('style');
style.textContent = `
    .status-active {
        color: #2ecc71;
        font-weight: bold;
    }
    .status-pending {
        color: #f39c12;
        font-weight: bold;
    }
`;
document.head.appendChild(style);