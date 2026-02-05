// 乡村运营数据大屏展示系统 - 更新版
let mapChart = null;
let operationTypeChart = null;
let regionChart = null;
let businessTypeChart = null;
let rentModeChart = null;

// 杭州市各区县经纬度映射
const HANGZHOU_DISTRICT_COORDS = {
    '西湖区': [120.1296, 30.2595],
    '上城区': [120.1808, 30.2425],
    '拱墅区': [120.1500, 30.3199],
    '滨江区': [120.2108, 30.2084],
    '萧山区': [120.2707, 30.1629],
    '余杭区': [120.3017, 30.4212],
    '临平区': [120.2986, 30.4210],
    '钱塘区': [120.3489, 30.3225],
    '富阳区': [119.9605, 30.0488],
    '临安区': [119.7247, 30.2339],
    '桐庐县': [119.6850, 29.7978],
    '淳安县': [119.0421, 29.6046],
    '建德市': [119.2816, 29.4746]
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    // 绑定刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', loadData);
});

// 加载数据
async function loadData() {
    try {
        console.log('开始加载数据...');
        document.getElementById('totalVillages').textContent = '加载中...';
        
        // 加载真实数据
        const dataResponse = await fetch('data/data.json');
        const data = await dataResponse.json();
        
        const statsResponse = await fetch('data/stats.json');
        const stats = await statsResponse.json();
        
        console.log(`成功加载 ${data.length} 条数据`);
        
        // 更新概览数据
        updateOverview(stats);
        
        // 更新地图
        await updateMap(data, stats);
        
        // 更新图表
        updateCharts(data, stats);
        
        // 更新表格
        updateTable(data);
        
        // 更新时间
        updateLastUpdatedTime();
        
    } catch (error) {
        console.error('数据加载失败:', error);
        document.getElementById('totalVillages').textContent = '加载失败';
    }
}

// 更新概览数据
function updateOverview(stats) {
    document.getElementById('totalVillages').textContent = stats.total_villages || 0;
    document.getElementById('regionCount').textContent = stats.regions_count || 0;
    document.getElementById('operationTypes').textContent = stats.top_business_type || '--';
    
    // 计算数据更新率 (假设已更新/总数)
    const updateRate = stats.total_villages > 0 ? '100%' : '0%';
    document.getElementById('updateRate').textContent = updateRate;
}

// 更新地图
async function updateMap(data, stats) {
    try {
        // 加载杭州地图数据
        const mapResponse = await fetch('data/hangzhou.json');
        const hangzhouGeoJson = await mapResponse.json();
        
        // 注册地图
        echarts.registerMap('hangzhou', hangzhouGeoJson);
        
        // 初始化地图
        const mapDom = document.getElementById('mapChart');
        if (mapChart) {
            mapChart.dispose();
        }
        mapChart = echarts.init(mapDom);
        
        // 处理地图数据
        const mapData = [];
        const scatterData = [];
        
        // 统计各区域数量
        Object.entries(stats.regions).forEach(([region, count]) => {
            mapData.push({
                name: region,
                value: count
            });
            
            // 添加散点数据
            const coords = HANGZHOU_DISTRICT_COORDS[region];
            if (coords) {
                scatterData.push({
                    name: region,
                    value: [...coords, count]
                });
            }
        });
        
        const option = {
            title: {
                text: '杭州市乡村运营分布',
                left: 'center',
                top: 20,
                textStyle: {
                    color: '#fff',
                    fontSize: 20
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (params.componentSubType === 'scatter') {
                        return `${params.name}<br/>运营村庄: ${params.value[2]} 个`;
                    } else {
                        return `${params.name}<br/>运营村庄: ${params.value || 0} 个`;
                    }
                }
            },
            visualMap: {
                min: 0,
                max: Math.max(...mapData.map(d => d.value)),
                left: 'left',
                top: 'bottom',
                text: ['高', '低'],
                textStyle: {
                    color: '#fff'
                },
                inRange: {
                    color: ['#50a3ba', '#eac736', '#d94e5d']
                },
                calculable: true
            },
            geo: {
                map: 'hangzhou',
                roam: true,
                label: {
                    show: true,
                    color: '#fff'
                },
                itemStyle: {
                    areaColor: '#2e5266',
                    borderColor: '#4b7a8e'
                },
                emphasis: {
                    label: {
                        color: '#fff'
                    },
                    itemStyle: {
                        areaColor: '#3e6f87'
                    }
                }
            },
            series: [
                {
                    name: '运营村庄数',
                    type: 'map',
                    geoIndex: 0,
                    data: mapData
                },
                {
                    name: '散点',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: scatterData,
                    symbolSize: function(val) {
                        return Math.max(val[2] * 0.8, 10);
                    },
                    label: {
                        formatter: '{b}',
                        position: 'right',
                        show: false
                    },
                    itemStyle: {
                        color: '#ffa500'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            color: '#fff'
                        }
                    }
                }
            ]
        };
        
        mapChart.setOption(option);
        
    } catch (error) {
        console.error('地图加载失败:', error);
    }
}

// 更新图表
function updateCharts(data, stats) {
    // 1. 运营主体性质分布
    if (operationTypeChart) {
        operationTypeChart.dispose();
    }
    operationTypeChart = echarts.init(document.getElementById('operationTypeChart'));
    
    const subjectData = Object.entries(stats.subject_types || {}).map(([name, value]) => ({
        name: name || '其他',
        value
    }));
    
    operationTypeChart.setOption({
        title: {
            text: '运营主体性质',
            left: 'center',
            textStyle: { color: '#fff' }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: '#fff' }
        },
        series: [{
            type: 'pie',
            radius: '60%',
            data: subjectData,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    });
    
    // 2. 区域分布柱状图
    if (regionChart) {
        regionChart.dispose();
    }
    regionChart = echarts.init(document.getElementById('regionChart'));
    
    const regionData = Object.entries(stats.regions || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 13);
    
    regionChart.setOption({
        title: {
            text: '区域分布',
            left: 'center',
            textStyle: { color: '#fff' }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: regionData.map(d => d[0]),
            axisLabel: {
                color: '#fff',
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#fff' }
        },
        series: [{
            type: 'bar',
            data: regionData.map(d => d[1]),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 0.5, color: '#188df0' },
                    { offset: 1, color: '#188df0' }
                ])
            }
        }]
    });
    
    // 3. 业态类型分布
    if (businessTypeChart) {
        businessTypeChart.dispose();
    }
    businessTypeChart = echarts.init(document.getElementById('businessTypeChart'));
    
    const businessData = Object.entries(stats.business_types || {})
        .filter(([_, value]) => value > 0)
        .sort((a, b) => b[1] - a[1]);
    
    businessTypeChart.setOption({
        title: {
            text: '业态类型',
            left: 'center',
            textStyle: { color: '#fff' }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLabel: { color: '#fff' }
        },
        yAxis: {
            type: 'category',
            data: businessData.map(d => d[0]),
            axisLabel: { color: '#fff' }
        },
        series: [{
            type: 'bar',
            data: businessData.map(d => d[1]),
            itemStyle: {
                color: '#91cc75'
            }
        }]
    });
    
    // 4. 租金模式分布
    if (rentModeChart) {
        rentModeChart.dispose();
    }
    rentModeChart = echarts.init(document.getElementById('rentModeChart'));
    
    // 统计租金模式
    const rentModes = {
        '固定租金': 0,
        '保底+分红': 0,
        '纯分红': 0,
        '其他': 0
    };
    
    data.forEach(item => {
        if (item['租金模式_固定']) rentModes['固定租金']++;
        if (item['租金模式_保底分红']) rentModes['保底+分红']++;
        if (item['租金模式_纯分红']) rentModes['纯分红']++;
    });
    
    const rentData = Object.entries(rentModes)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));
    
    rentModeChart.setOption({
        title: {
            text: '租金模式',
            left: 'center',
            textStyle: { color: '#fff' }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 'right',
            textStyle: { color: '#fff' }
        },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            data: rentData
        }]
    });
}

// 更新表格
function updateTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    // 只显示前50条
    const displayData = data.slice(0, 50);
    
    displayData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // 判断运营状态
        const status = item['开始时间'] ? '运营中' : '筹备中';
        const statusClass = status === '运营中' ? 'active' : 'pending';
        
        // 获取主要业态
        const businesses = [];
        if (item['业态_土特产']) businesses.push('土特产');
        if (item['业态_民宿']) businesses.push('民宿');
        if (item['业态_研学']) businesses.push('研学');
        if (item['业态_康养']) businesses.push('康养');
        if (item['业态_电商']) businesses.push('电商');
        const businessType = businesses.slice(0, 2).join('、') || '综合';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item['村庄名称'] || '--'}</td>
            <td>${item['所属区域'] || '--'}</td>
            <td>${businessType}</td>
            <td>${item['书记姓名'] || '--'}</td>
            <td>${item['联系电话'] || '--'}</td>
            <td><span class="status-${statusClass}">${status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 更新最后更新时间
function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = `最后更新: ${timeString}`;
}

// 响应窗口大小变化
window.addEventListener('resize', function() {
    if (mapChart) mapChart.resize();
    if (operationTypeChart) operationTypeChart.resize();
    if (regionChart) regionChart.resize();
    if (businessTypeChart) businessTypeChart.resize();
    if (rentModeChart) rentModeChart.resize();
});
