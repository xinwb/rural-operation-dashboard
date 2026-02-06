// 乡村运营数据大屏展示系统 - 更新版
let mapChart = null;
let operationTypeChart = null;
let regionChart = null;
let businessTypeChart = null;
let rentModeChart = null;
let 当前选中业态 = '全部';  // 追踪当前选中的业态筛选

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
    // 更新实时时钟
    updateClock();
    setInterval(updateClock, 1000);
    
    // 初始化汉堡菜单
    initHamburgerMenu();
    
    // 根据当前页面初始化内容
    initializePage();
    
    // 绑定刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadData);
    }
    
    // 监听窗口大小变化，自动调整图表
    window.addEventListener('resize', function() {
        if (mapChart && !mapChart.isDisposed?.()) {
            setTimeout(() => mapChart.resize(), 100);
        }
        if (operationTypeChart && !operationTypeChart.isDisposed?.()) {
            operationTypeChart.resize();
        }
        if (regionChart && !regionChart.isDisposed?.()) {
            regionChart.resize();
        }
        if (businessTypeChart && !businessTypeChart.isDisposed?.()) {
            businessTypeChart.resize();
        }
    });
});

// 汉堡菜单功能
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const navigation = document.getElementById('pageNavigation');
    
    if (hamburger && navigation) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navigation.classList.toggle('show');
        });
        
        // 点击菜单项后关闭菜单
        const navLinks = navigation.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navigation.classList.remove('show');
            });
        });
        
        // 点击外部区域关闭菜单
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navigation.contains(event.target)) {
                hamburger.classList.remove('active');
                navigation.classList.remove('show');
            }
        });
    }
}

// 实时时钟
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { hour12: false });
    const dateString = now.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
    const currentTimeEl = document.getElementById('currentTime');
    if (currentTimeEl) {
        currentTimeEl.textContent = `${dateString} ${timeString}`;
    }
}

// 根据当前页面初始化
function initializePage() {
    let currentPage = window.location.pathname.split('/').pop();
    
    // 如果没有文件名或是空字符串，默认为index.html
    if (!currentPage || currentPage === '') {
        currentPage = 'index.html';
    }
    
    console.log('当前页面:', currentPage);
    console.log('完整路径:', window.location.pathname);
    
    if (currentPage === 'index.html' || currentPage === '') {
        // 地图页面
        console.log('初始化地图页面');
        loadData();
    } else if (currentPage === 'charts.html') {
        // 数据统计页面（已包含业态分析）
        console.log('初始化数据统计页面');
        loadData();
    } else if (currentPage === 'table.html') {
        // 详细列表页面
        console.log('初始化详细列表页面');
        loadData();
    } else if (currentPage === 'ai_insights.html') {
        // AI 洞察页面 - 由 ai_analysis.js 单独处理
        console.log('初始化 AI 洞察页面');
        // 不需要额外的数据加载，ai_analysis.js 会自己处理
    } else {
        // 默认加载
        console.log('未知页面，默认加载');
        loadData();
    }
}

// 加载数据
async function loadData() {
    try {
        console.log('开始加载数据...');
        
        // 获取当前页面
        let currentPage = window.location.pathname.split('/').pop();
        if (!currentPage || currentPage === '') {
            currentPage = 'index.html';
        }
        
        console.log('loadData - 当前页面:', currentPage);
        
        // 加载真实数据
        const dataResponse = await fetch('data/data.json');
        let data = await dataResponse.json();
        
        const statsResponse = await fetch('data/stats.json');
        const stats = await statsResponse.json();
        
        // 只显示杭州市数据（兼容数据中可能的不一致性）
        const 杭州区县 = ['西湖区', '上城区', '拱墅区', '滨江区', '萧山区', '余杭区', '临平区', '钱塘区', '富阳区', '临安区', '桐庐县', '淳安县', '建德市', '建德'];
        data = data.filter(d => {
            const 区县名 = (d['县（市、区）'] || '').trim();
            return 杭州区县.includes(区县名);
        });
        
        console.log(`成功加载杭州市 ${data.length} 条数据`);
        
        // 计算杭州市的统计数据
        const 杭州统计 = calculateHangzhouStats(data);
        
        // 根据当前页面初始化对应内容
        if (currentPage === 'index.html' || currentPage === '') {
            // 地图页面
            console.log('初始化地图内容');
            updateOverview(杭州统计);
            await updateMap(data, 杭州统计);
            initBusinessFilter(data, 杭州统计);
        } else if (currentPage === 'charts.html') {
            // 数据统计页面（包含所有图表）
            console.log('初始化数据统计内容');
            updateOverview(杭州统计);
            updateCharts(data, 杭州统计);
        } else if (currentPage === 'table.html') {
            // 详细列表页面
            console.log('初始化详细列表内容');
            updateTable(data);
        } else if (currentPage === 'ai_insights.html') {
            // AI 洞察页面 - 由 ai_analysis.js 单独处理
            console.log('AI 洞察页面数据已加载，由 ai_analysis.js 处理');
        } else {
            // 默认初始化地图
            console.log('默认初始化地图');
            updateOverview(杭州统计);
            await updateMap(data, 杭州统计);
            initBusinessFilter(data, 杭州统计);
        }
        
        // 更新时间
        updateLastUpdatedTime();
        
    } catch (error) {
        console.error('数据加载失败:', error);
        const totalVilEl = document.getElementById('totalVillages');
        if (totalVilEl) {
            totalVilEl.textContent = '加载失败';
        }
    }
}

// 计算杭州市统计数据
function calculateHangzhouStats(data) {
    const stats = {
        total_villages: data.length,
        regions_count: new Set(data.map(d => d['县（市、区）'])).size,
        update_rate: '95%',
        operation_types: {},
        operation_forms: {}
    };
    
    // 统计运营业态
    const 业态映射 = [
        '运营业态_土特产生产销售',
        '运营业态_民宿农家乐',
        '运营业态_研学',
        '运营业态_营地',
        '运营业态_市集',
        '运营业态_村咖',
        '运营业态_电商直播',
        '运营业态_文化创意',
        '运营业态_物业经济',
        '运营业态_康养'
    ];
    
    业态映射.forEach(字段 => {
        const 名称 = 字段.replace('运营业态_', '');
        stats.operation_types[名称] = data.filter(d => d[字段] === '√').length;
    });
    
    // 统计运营形式
    stats.operation_forms['整村运营'] = data.filter(d => d['运营形式_整村运营'] === '√').length;
    stats.operation_forms['单一项目运营'] = data.filter(d => d['运营形式_单一项目运营'] === '√').length;
    
    return stats;
}

// 更新概览数据
function updateOverview(stats) {
    const totalVilEl = document.getElementById('totalVillages');
    const regionCountEl = document.getElementById('regionCount');
    const operationTypesEl = document.getElementById('operationTypes');
    const updateRateEl = document.getElementById('updateRate');
    
    if (totalVilEl) totalVilEl.textContent = stats.total_villages || 0;
    if (regionCountEl) regionCountEl.textContent = stats.regions_count || 0;
    
    // 计算业态分类数（有村庄运营的业态种类）
    const 业态分类数 = Object.values(stats.operation_types).filter(count => count > 0).length;
    if (operationTypesEl) operationTypesEl.textContent = 业态分类数;
    if (updateRateEl) updateRateEl.textContent = stats.update_rate || '0%';
    
    // 更新地图悬浮统计
    const mapTotalVillEl = document.getElementById('mapTotalVillages');
    const mapRegionCountEl = document.getElementById('mapRegionCount');
    const mapOperationTypesEl = document.getElementById('mapOperationTypes');
    const mapUpdateRateEl = document.getElementById('mapUpdateRate');
    
    if (mapTotalVillEl) mapTotalVillEl.textContent = stats.total_villages || 0;
    if (mapRegionCountEl) mapRegionCountEl.textContent = stats.regions_count || 0;
    if (mapOperationTypesEl) mapOperationTypesEl.textContent = 业态分类数;
    if (mapUpdateRateEl) mapUpdateRateEl.textContent = stats.update_rate || '0%';
}

// 更新地图
async function updateMap(data, stats) {
    try {
        // 检查是否有地图容器（AI 洞察页面没有地图）
        const mapDom = document.getElementById('mapChart');
        if (!mapDom) {
            console.log('未找到地图容器，跳过地图初始化');
            return;
        }
        
        // 加载杭州地图数据（330100）
        const mapResponse = await fetch('data/330100.geoJson');
        const hangzhouGeoJson = await mapResponse.json();
        
        // 加载乡镇中心点数据
        const townResponse = await fetch('data/hangzhou_town_centers.json');
        const townCenters = await townResponse.json();
        const 乡镇中心点 = new Map();
        townCenters.forEach(item => {
            if (item?.name && Array.isArray(item.center)) {
                乡镇中心点.set(item.name, item.center);
            }
        });
        
        // 注册地图
        echarts.registerMap('hangzhou', hangzhouGeoJson);
        
        // 初始化地图
        if (mapChart) {
            mapChart.dispose();
        }
        mapChart = echarts.init(mapDom);
        
        // 按村庄分类统计（显示村镇名称）
        const 村庄统计 = {};
        console.log(`开始处理 ${data.length} 个村庄数据...`);
        data.forEach((村庄, index) => {
            const 村名 = 村庄['行政村'] || '未知';
            const 区县 = (村庄['县（市、区）'] || '未知').trim();
            const 乡镇 = (村庄['乡镇（街道）'] || '未知').trim();
            const 关键 = `${区县}-${乡镇}-${村名}`;
            
            if (!村庄统计[关键]) {
                const 乡镇中心 = 乡镇中心点.get(乡镇);
                const 中心坐标 = 乡镇中心 || HANGZHOU_DISTRICT_COORDS[区县] || [120.1551, 30.2875];
                const 偏移坐标 = 计算村庄偏移坐标(中心坐标, 关键);
                const 所有业态 = 获取所有业态(村庄);
                const 主要业态 = 获取主要业态(村庄);
                const 运营人 = 村庄['运营主体名称'] || 村庄['村党组织书记姓名'] || '暂无';
                
                if (index < 3) {
                    console.log(`样本村庄[${index}]: ${村名} - 业态: ${所有业态.join('、')}`);
                }
                
                村庄统计[关键] = {
                    name: 村名,
                    region: 区县,
                    town: 乡镇,
                    count: 0,
                    coord: 偏移坐标,
                    businesses: 所有业态,
                    mainBusiness: 主要业态,
                    operator: 运营人
                };
            }
            村庄统计[关键].count++;
        });
        
        console.log(`村庄统计完成: ${Object.keys(村庄统计).length} 个唯一村庄`);
        
        // 转换为散点数据 - 每个村只显示一个散点
        const villageScatterData = [];
        const 业态颜色映射 = {
            '土特产生产销售': '#ff6b6b',
            '民宿农家乐': '#4ecdc4',
            '研学': '#ffd93d',
            '营地': '#95e1d3',
            '市集': '#ff8fab',
            '村咖': '#a8e6cf',
            '电商直播': '#ffd700',
            '文化创意': '#b19cd9',
            '物业经济': '#ff9a76',
            '康养': '#74b9ff',
            '其他': '#95afc0'
        };
        
        Object.values(村庄统计).forEach((v, villageIdx) => {
            // 每个村只创建一个散点，使用第一个业态的颜色
            const 主要业态 = v.businesses[0] || '其他';
            
            const scatterPoint = {
                name: `${v.name} (${v.region}${v.town})`,
                value: [...v.coord, v.count],
                villageName: v.name,
                region: v.region,
                town: v.town,
                operator: v.operator,
                business: 主要业态,
                allBusinesses: v.businesses,  // 用于 tooltip 显示所有业态
                itemStyle: { color: 业态颜色映射[主要业态] }
            };
            
            if (villageIdx < 3) {
                console.log(`散点[${villageIdx}]: ${v.name} - 主要业态: ${主要业态}, 所有业态: ${v.businesses.join('、')}`);
            }
            
            villageScatterData.push(scatterPoint);
        });
        
        console.log(`生成散点数据: ${villageScatterData.length} 个散点（每个村一个）`);
        
        // 按区县统计（显示热力图）
        const 区县统计 = {};
        data.forEach(村庄 => {
            const 区县 = (村庄['县（市、区）'] || '').trim();
            if (区县) {
                区县统计[区县] = (区县统计[区县] || 0) + 1;
            }
        });
        
        const mapData = Object.entries(区县统计).map(([name, value]) => ({
            name,
            value
        }));
        
        console.log(`区县统计: ${Object.keys(区县统计).length} 个区县:`, 区县统计);
        
        const maxValue = mapData.length ? Math.max(...mapData.map(d => d.value)) : 0;
        const 区县要素索引 = {};
        hangzhouGeoJson.features.forEach(feature => {
            const 名称 = feature?.properties?.name;
            if (名称) {
                区县要素索引[名称] = feature;
            }
        });

        const option = {
            title: {
                text: '杭州市乡村运营分布地图',
                left: 'center',
                top: 20,
                textStyle: {
                    color: '#f5f7ff',
                    fontSize: 20
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (params.componentSubType === 'scatter') {
                        const data = params.data || {};
                        let 业态显示 = data.business || '其他';
                        
                        // 根据当前选中业态来显示
                        if (当前选中业态 === '全部') {
                            // 如果显示全部，显示所有业态
                            if (data.allBusinesses && data.allBusinesses.length > 0) {
                                业态显示 = data.allBusinesses.join('、');
                            }
                        } else {
                            // 如果筛选了特定业态，只显示当前筛选的业态
                            业态显示 = 当前选中业态;
                        }
                        
                        return `<strong>${data.villageName || params.name}</strong>` +
                            `<br/>运营人: ${data.operator || '暂无'}` +
                            `<br/>业态: ${业态显示}`;
                    }

                    const 要素 = 区县要素索引[params.name];
                    const 层级 = 要素?.properties?.level || 'district';
                    return `<strong>${params.name}</strong><br/>层级: ${层级}<br/>运营村庄数: ${params.value || 0} 个`;
                },
                backgroundColor: 'rgba(13, 16, 30, 0.8)',
                borderColor: '#5c7cfa',
                textStyle: {
                    color: '#f5f7ff'
                }
            },
            visualMap: {
                min: 0,
                max: maxValue,
                left: 'left',
                top: 'bottom',
                text: ['高', '低'],
                textStyle: {
                    color: '#f5f7ff'
                },
                inRange: {
                    color: ['rgba(92, 124, 250, 0.3)', '#5c7cfa']
                },
                calculable: true
            },
            geo: {
                map: 'hangzhou',
                roam: true,
                label: {
                    show: true,
                    color: '#f5f7ff',
                    fontSize: 12,
                    fontWeight: 500
                },
                itemStyle: {
                    areaColor: 'rgba(13, 16, 30, 0.6)',
                    borderColor: 'rgba(92, 124, 250, 0.5)',
                    borderWidth: 1.5
                },
                emphasis: {
                    label: {
                        color: '#5c7cfa',
                        fontSize: 13
                    },
                    itemStyle: {
                        areaColor: 'rgba(92, 124, 250, 0.25)',
                        borderColor: '#5c7cfa',
                        borderWidth: 2
                    }
                }
            },
            series: [
                {
                    name: '区县热力',
                    type: 'map',
                    geoIndex: 0,
                    data: mapData
                },
                {
                    name: '村镇位置',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: villageScatterData,
                    symbolSize: function(val) {
                        return Math.max(12 + val[2] * 3, 12);
                    },
                    symbol: 'circle',
                    label: {
                        formatter: function(params) {
                            const data = params.data || {};
                            return data.villageName || params.name.split('(')[0];
                        },
                        position: 'top',
                        show: true,
                        fontSize: 10,
                        color: '#f5f7ff',
                        fontWeight: 500
                    },
                    itemStyle: {
                        color: function(params) {
                            // 直接从数据中获取颜色
                            return params.data.itemStyle.color;
                        },
                        opacity: 0.95,
                        borderColor: '#ffffff',
                        borderWidth: 2.5,
                        shadowBlur: 12,
                        shadowColor: function(params) {
                            return params.data.itemStyle.color + '80';
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            color: '#ffffff',
                            fontSize: 11,
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            padding: [4, 8],
                            borderRadius: 4
                        },
                        itemStyle: {
                            opacity: 1,
                            borderColor: '#ffffff',
                            borderWidth: 3.5,
                            shadowBlur: 20,
                            shadowColor: function(params) {
                                return params.data.itemStyle.color + 'cc';
                            }
                        },
                        scale: 1.5
                    }
                }
            ]
        };
        
        // 使用 notMerge: true 确保完全替换而不是合并（避免旧数据残留）
        mapChart.setOption(option, { notMerge: true });
        
        console.log(`=== 地图更新完成 ===`);
        console.log(`数据量: ${data.length} 个村庄`);
        console.log(`散点数: ${villageScatterData.length} 个运营点`);
        console.log(`区县数: ${Object.keys(区县统计).length} 个`);
        if (villageScatterData.length > 0) {
            console.log(`散点样本: ${villageScatterData.slice(0, 3).map(d => d.villageName).join(', ')}`);
        }
    } catch (error) {
        console.error('地图加载失败:', error);
    }
}

// 根据村名生成稳定偏移，避免重叠
function 计算村庄偏移坐标(中心坐标, 关键) {
    const 偏移半径 = 0.08; // 经纬度偏移量，约数公里范围
    let hash = 0;
    for (let i = 0; i < 关键.length; i++) {
        hash = (hash << 5) - hash + 关键.charCodeAt(i);
        hash |= 0;
    }
    const 角度 = (Math.abs(hash) % 360) * (Math.PI / 180);
    const 半径因子 = (Math.abs(hash) % 100) / 100;
    const 半径 = 偏移半径 * (0.3 + 0.7 * 半径因子);
    const 偏移经度 = Math.cos(角度) * 半径;
    const 偏移纬度 = Math.sin(角度) * 半径;
    return [中心坐标[0] + 偏移经度, 中心坐标[1] + 偏移纬度];
}

// 更新图表
function updateCharts(data, stats) {
    // 1. 运营业态分布（使用真实数据）
    const operationTypeChartEl = document.getElementById('operationTypeChart');
    if (operationTypeChartEl) {
        if (operationTypeChart) {
            operationTypeChart.dispose();
        }
        operationTypeChart = echarts.init(operationTypeChartEl);

        const businessData = Object.entries(stats.operation_types || {})
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);

        operationTypeChart.setOption({
            title: {
                text: '运营业态分布',
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
                textStyle: { color: '#fff' },
                formatter: function(name) {
                    return name.length > 6 ? name.substring(0, 6) + '...' : name;
                }
            },
            series: [{
                type: 'pie',
                radius: '60%',
                data: businessData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        });
    }

    // 2. 杭州市各区县分布柱状图
    const regionChartEl = document.getElementById('regionChart');
    if (regionChartEl) {
        if (regionChart) {
            regionChart.dispose();
        }
        regionChart = echarts.init(regionChartEl);

        // data 已经过滤为杭州市数据，直接统计
        const 区县统计 = {};
        data.forEach(村庄 => {
            const 区县 = 村庄['县（市、区）'];
            if (区县) {
                区县统计[区县] = (区县统计[区县] || 0) + 1;
            }
        });

        const regionData = Object.entries(区县统计).sort((a, b) => b[1] - a[1]);

        regionChart.setOption({
            title: {
                text: '杭州市各区县分布',
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
    }

    // 3. 运营形式分布
    const businessTypeChartEl = document.getElementById('businessTypeChart');
    if (businessTypeChartEl) {
        if (businessTypeChart) {
            businessTypeChart.dispose();
        }
        businessTypeChart = echarts.init(businessTypeChartEl);

        const formData = Object.entries(stats.operation_forms || {})
            .map(([name, value]) => ({ name, value }));

        businessTypeChart.setOption({
            title: {
                text: '运营形式分布',
                left: 'center',
                textStyle: { color: '#fff' }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'horizontal',
                bottom: 'bottom',
                textStyle: { color: '#fff' }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    formatter: '{b}: {d}%',
                    color: '#fff'
                },
                data: formData,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#1a2332',
                    borderWidth: 2
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        });
    }

    // 4. 利益分配方式分布
    const rentModeChartEl = document.getElementById('rentModeChart');
    if (rentModeChartEl) {
        if (rentModeChart) {
            rentModeChart.dispose();
        }
        rentModeChart = echarts.init(rentModeChartEl);

        const rentModes = {
            '固定租金': 0,
            '保底+分红': 0,
            '纯分红': 0,
            '其他': 0
        };

        data.forEach(item => {
        if (item['利益分配_固定租金'] === '√') rentModes['固定租金']++;
        if (item['利益分配_保底+分红'] === '√') rentModes['保底+分红']++;
        if (item['利益分配_纯分红'] === '√') rentModes['纯分红']++;
        if (item['利益分配_其他']) rentModes['其他']++;
    });

    const rentData = Object.entries(rentModes)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));

    rentModeChart.setOption({
        title: {
            text: '利益分配方式',
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
            label: {
                show: true,
                color: '#fff'
            },
            itemStyle: {
                borderRadius: 10,
                borderColor: '#1a2332',
                borderWidth: 2
            },
            data: rentData
        }]
    });
    }
}

// 获取村庄主要业态
function 获取主要业态(村庄) {
    const 业态顺序 = [
        ['运营业态_土特产生产销售', '土特产生产销售'],
        ['运营业态_民宿农家乐', '民宿农家乐'],
        ['运营业态_研学', '研学'],
        ['运营业态_营地', '营地'],
        ['运营业态_市集', '市集'],
        ['运营业态_村咖', '村咖'],
        ['运营业态_电商直播', '电商直播'],
        ['运营业态_文化创意', '文化创意'],
        ['运营业态_物业经济', '物业经济'],
        ['运营业态_康养', '康养']
    ];

    for (const [字段, 名称] of 业态顺序) {
        if (村庄[字段] === '√') {
            return 名称;
        }
    }
    return '其他';
}

// 获取村庄的所有业态
function 获取所有业态(村庄) {
    const 业态列表 = [
        ['运营业态_土特产生产销售', '土特产生产销售'],
        ['运营业态_民宿农家乐', '民宿农家乐'],
        ['运营业态_研学', '研学'],
        ['运营业态_营地', '营地'],
        ['运营业态_市集', '市集'],
        ['运营业态_村咖', '村咖'],
        ['运营业态_电商直播', '电商直播'],
        ['运营业态_文化创意', '文化创意'],
        ['运营业态_物业经济', '物业经济'],
        ['运营业态_康养', '康养']
    ];

    const 结果 = [];
    for (const [字段, 名称] of 业态列表) {
        if (村庄[字段] === '√') {
            结果.push(名称);
        }
    }
    return 结果.length > 0 ? 结果 : ['其他'];
}

// 多边形坐标预览（避免过长）
function formatPolygonPreview(geometry) {
    if (!geometry || !geometry.coordinates) {
        return '--';
    }

    const 坐标 = geometry.coordinates;
    const 预览点数 = 5;

    if (geometry.type === 'MultiPolygon') {
        const 多边形 = 坐标[0] || [];
        const 环 = 多边形[0] || [];
        const 预览 = 环.slice(0, 预览点数).map(p => `[${p[0].toFixed(4)},${p[1].toFixed(4)}]`).join(' ');
        return 预览 + (环.length > 预览点数 ? ' ...' : '');
    }

    if (geometry.type === 'Polygon') {
        const 环 = 坐标[0] || [];
        const 预览 = 环.slice(0, 预览点数).map(p => `[${p[0].toFixed(4)},${p[1].toFixed(4)}]`).join(' ');
        return 预览 + (环.length > 预览点数 ? ' ...' : '');
    }

    return '--';
}

// 更新表格
function updateTable(data) {
    const tableBody = document.getElementById('tableBody');
    const tableHeaderRow = document.getElementById('tableHeaderRow');
    if (!tableBody) {
        return;
    }
    tableBody.innerHTML = '';
    if (tableHeaderRow) {
        tableHeaderRow.innerHTML = '';
    }

    if (!Array.isArray(data) || data.length === 0) {
        return;
    }

    const 合并列配置 = getMergedTableColumns();

    if (tableHeaderRow) {
        合并列配置.forEach(列 => {
            const th = document.createElement('th');
            th.textContent = 列.label;
            tableHeaderRow.appendChild(th);
        });
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        合并列配置.forEach(列 => {
            const td = document.createElement('td');
            const 值 = 列.value(item);
            td.innerHTML = formatTableCellValue(列.label, 值);
            row.appendChild(td);
        });
        tableBody.appendChild(row);
    });
}

// 表格内容格式化
function formatTableCellValue(字段, 值) {
    if (值 === null || 值 === undefined || 值 === '') {
        return '--';
    }

    let 文本 = String(值);

    if (字段.includes('电话') || 字段.includes('手机') || 字段.includes('联系方式')) {
        文本 = maskPhoneNumber(文本);
    }

    return 文本.replace(/\n/g, '<br>');
}

// 手机号脱敏
function maskPhoneNumber(文本) {
    const 数字 = String(文本).replace(/\D/g, '');
    if (数字.length === 11) {
        return 数字.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
    }
    return String(文本);
}

// 合并列配置
function getMergedTableColumns() {
    return [
        {
            label: '序号',
            value: item => item['序号']
        },
        {
            label: '区域信息',
            value: item => joinNotEmpty([
                item['县（市、区）'],
                item['乡镇（街道）'],
                item['行政村']
            ], ' / ')
        },
        {
            label: '距离信息',
            value: item => joinNotEmpty([
                formatUnit(item['城区距离（公里）'], '公里'),
                formatUnit(item['车程（分钟）'], '分钟')
            ], ' / ')
        },
        {
            label: '人口信息',
            value: item => joinNotEmpty([
                formatUnit(item['户籍人口(人)'], '人'),
                formatUnit(item['常住人口(人)'], '人')
            ], ' / ')
        },
        {
            label: '经营收入（万元）',
            value: item => item['2024年村集体经营性收入（万元）']
        },
        {
            label: '特色标签',
            value: item => joinNotEmpty([
                formatTag(item['省级未来乡村'], '省级未来乡村'),
                formatTag(item['历史文化（传统）村落'], '历史文化村落'),
                formatTag(item['重点村组团片区'], '重点村组团片区')
            ], ' / ')
        },
        {
            label: '联系人信息',
            value: item => joinNotEmpty([
                item['村党组织书记姓名'],
                item['联系电话']
            ], ' / ')
        },
        {
            label: '运营主体',
            value: item => joinNotEmpty([
                item['运营主体名称'],
                formatBodyNature(item)
            ], ' / ')
        },
        {
            label: '职业经理人',
            value: item => joinNotEmpty([
                item['运营主体是否聘有乡村运营职业经理人'],
                item['职业经理人联系电话']
            ], ' / ')
        },
        {
            label: '利益分配',
            value: item => formatCheckList(item, [
                ['利益分配_固定租金', '固定租金'],
                ['利益分配_保底+分红', '保底+分红'],
                ['利益分配_纯分红', '纯分红'],
                ['利益分配_其他', '其他']
            ])
        },
        {
            label: '运营形式',
            value: item => formatCheckList(item, [
                ['运营形式_整村运营', '整村运营'],
                ['运营形式_单一项目运营', '单一项目运营'],
                ['运营形式_其他', '其他']
            ])
        },
        {
            label: '运营业态',
            value: item => formatCheckList(item, [
                ['运营业态_土特产生产销售', '土特产生产销售'],
                ['运营业态_民宿农家乐', '民宿农家乐'],
                ['运营业态_研学', '研学'],
                ['运营业态_营地', '营地'],
                ['运营业态_市集', '市集'],
                ['运营业态_村咖', '村咖'],
                ['运营业态_电商直播', '电商直播'],
                ['运营业态_文化创意', '文化创意'],
                ['运营业态_物业经济', '物业经济'],
                ['运营业态_康养', '康养'],
                ['运营业态_其他', '其他']
            ])
        },
        {
            label: '开始运营时间',
            value: item => item['开始运营时间']
        },
        {
            label: '年均为村集体带来收入（万元）',
            value: item => item['年均为村集体带来收入（万元）']
        },
        {
            label: '吸纳当地村民就业创业人数（人）',
            value: item => item['吸纳当地村民就业创业人数（人）']
        },
        {
            label: '盘活资源宗数（宗）',
            value: item => item['盘活资源宗数（宗）']
        },
        {
            label: '引进提升业态数量（个）',
            value: item => item['引进提升业态数量（个）']
        },
        {
            label: '吸引入乡青年数（人）',
            value: item => item['吸引入乡青年数（人）']
        },
        {
            label: '举办活动场数（场次）',
            value: item => item['举办活动场数（场次）']
        },
        {
            label: '运营成效_其他',
            value: item => item['运营成效_其他']
        },
    ];
}

function joinNotEmpty(数组, 分隔符) {
    return 数组
        .map(item => (item === null || item === undefined || item === '') ? null : String(item))
        .filter(item => item && item !== '否')
        .join(分隔符) || '--';
}

function formatUnit(值, 单位) {
    if (值 === null || 值 === undefined || 值 === '') {
        return null;
    }
    return `${值}${单位}`;
}

function formatTag(值, 标签) {
    if (值 === '是' || 值 === '√') {
        return 标签;
    }
    return null;
}

function formatBodyNature(item) {
    const 结果 = formatCheckList(item, [
        ['主体性质_国有企业', '国有企业'],
        ['主体性质_集体所有制企业', '集体所有制企业'],
        ['主体性质_私营企业', '私营企业'],
        ['主体性质_强村公司', '强村公司'],
        ['主体性质_个人（含运营团队）', '个人（含运营团队）'],
        ['主体性质_混合所有制企业', '混合所有制企业']
    ]);
    return 结果 === '--' ? null : 结果;
}

function formatCheckList(item, 列表) {
    const 结果 = [];
    列表.forEach(([字段, 名称]) => {
        if (item[字段] === '√') {
            结果.push(名称);
        }
    });
    return 结果.length > 0 ? 结果.join('、') : '--';
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
    const lastUpdatedEl = document.getElementById('lastUpdated');
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = `最后更新: ${timeString}`;
    }
}

// 响应窗口大小变化
window.addEventListener('resize', function() {
    if (mapChart) mapChart.resize();
    if (operationTypeChart) operationTypeChart.resize();
    if (regionChart) regionChart.resize();
    if (businessTypeChart) businessTypeChart.resize();
    if (rentModeChart) rentModeChart.resize();
});

// 初始化业态过滤器
let currentFilteredData = null;
let currentFilteredStats = null;
let originalVillageData = null; // 保存原始数据的引用
let originalVillageStats = null; // 保存原始统计的引用

function initBusinessFilter(data, stats) {
    // 检查是否在 AI 洞察页面
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'ai_insights.html') {
        console.log('AI 洞察页面，跳过业态筛选器初始化');
        return;
    }
    
    // 保存原始数据，供筛选时使用
    originalVillageData = data;
    originalVillageStats = stats;
    currentFilteredData = data;
    currentFilteredStats = stats;
    
    const filterBtns = document.querySelectorAll('.filter-btn');
    console.log('初始化业态筛选器 - 找到按钮数量:', filterBtns.length);
    console.log('原始数据量:', data.length);
    
    // 清除旧的事件监听器（防止重复绑定）
    filterBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    // 重新获取按钮并绑定事件
    const newFilterBtns = document.querySelectorAll('.filter-btn');
    newFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const businessType = this.getAttribute('data-business');
            console.log('=== 点击业态筛选按钮 ===');
            console.log('选择的业态:', businessType);
            
            // 更新当前选中的业态
            当前选中业态 = businessType;
            
            // 移除所有active类
            newFilterBtns.forEach(b => b.classList.remove('active'));
            // 添加active类到当前button
            this.classList.add('active');
            
            // 使用原始数据进行筛选
            filterByBusinessType(businessType, originalVillageData, originalVillageStats);
        });
    });
    
    console.log('业态筛选器初始化完成');
}

function filterByBusinessType(businessType, originalData, originalStats) {
    console.log('=== 开始业态筛选 ===');
    console.log('筛选类型:', businessType);
    console.log('原始数据量:', originalData.length);
    
    let filteredData = originalData;
    
    if (businessType !== '全部') {
        // 业态字段映射 - 确保字段名与data-business属性值对应
        const businessFieldMap = {
            '土特产生产销售': '运营业态_土特产生产销售',
            '民宿农家乐': '运营业态_民宿农家乐',
            '研学': '运营业态_研学',
            '营地': '运营业态_营地',
            '市集': '运营业态_市集',
            '村咖': '运营业态_村咖',
            '电商直播': '运营业态_电商直播',
            '文化创意': '运营业态_文化创意',
            '物业经济': '运营业态_物业经济',
            '康养': '运营业态_康养'
        };
        
        const fieldName = businessFieldMap[businessType];
        console.log('映射到字段名:', fieldName);
        
        if (fieldName) {
            // 先检查一下数据中该字段的值分布
            const 字段值分布 = {};
            originalData.forEach(d => {
                const 值 = d[fieldName];
                字段值分布[值] = (字段值分布[值] || 0) + 1;
            });
            console.log(`字段 ${fieldName} 的值分布:`, 字段值分布);
            
            filteredData = originalData.filter(d => {
                const hasBusinessType = d[fieldName] === '√';
                return hasBusinessType;
            });
            console.log('筛选后数据量:', filteredData.length);
            
            if (filteredData.length > 0) {
                console.log('前5个匹配村庄:');
                filteredData.slice(0, 5).forEach(d => {
                    console.log(`  - ${d['行政村']} (${d['县（市、区）']} ${d['乡镇（街道）']})`);
                });
            } else {
                console.warn('⚠️ 没有找到任何匹配的村庄！');
                console.warn('字段名:', fieldName);
                console.warn('原始数据第一条的该字段值:', originalData[0]?.[fieldName]);
            }
        } else {
            console.warn('未找到业态字段映射:', businessType);
            console.warn('可用的映射键:', Object.keys(businessFieldMap));
        }
    } else {
        console.log('显示全部数据');
    }
    
    // 重新计算统计数据
    const filteredStats = calculateHangzhouStats(filteredData);
    console.log('重新计算统计数据:', filteredStats);
    
    // 更新地图
    console.log('开始更新地图...');
    updateMap(filteredData, filteredStats);
    
    // 更新悬浮统计卡片
    if (document.getElementById('mapTotalVillages')) {
        document.getElementById('mapTotalVillages').textContent = filteredData.length;
        const 业态分类数 = Object.values(filteredStats.operation_types).filter(count => count > 0).length;
        document.getElementById('mapOperationTypes').textContent = 业态分类数;
        
        // 更新区域数
        const regionCount = new Set(filteredData.map(d => d['县（市、区）'])).size;
        const mapRegionCountEl = document.getElementById('mapRegionCount');
        if (mapRegionCountEl) {
            mapRegionCountEl.textContent = regionCount;
        }
    }
    
    console.log(`=== 业态筛选完成 ===`);
    console.log(`${businessType}: ${filteredData.length}个村庄, 覆盖${new Set(filteredData.map(d => d['县（市、区）'])).size}个区域`);
}
