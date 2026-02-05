$(function () {
    // 初始化杭州地图
    initHangzhouMap();
});

// --- 颜色配置 ---
const mapColorState = { r: 76, g: 96, b: 255 }; // 默认与原配色保持一致

// --- 数据定义 ---
const districtPoints = [
    // 临安区
    {name: '於潜镇', coord: [119.52, 30.24], value: 5, district: '临安区'},
    {name: '天目山镇', coord: [119.43, 30.32], value: 4, district: '临安区'},
    {name: '太湖源镇', coord: [119.58, 30.28], value: 3, district: '临安区'},
    {name: '昌化镇', coord: [119.25, 30.05], value: 6, district: '临安区'},
    {name: '龙岗镇', coord: [119.15, 30.26], value: 4, district: '临安区'},
    {name: '岛石镇', coord: [119.08, 30.12], value: 3, district: '临安区'},
    // 余杭区
    {name: '仓前街道', coord: [120.02, 30.30], value: 5, district: '余杭区'},
    {name: '闲林街道', coord: [119.98, 30.27], value: 4, district: '余杭区'},
    {name: '径山镇', coord: [119.95, 30.35], value: 6, district: '余杭区'},
    {name: '黄湖镇', coord: [119.85, 30.38], value: 4, district: '余杭区'},
    // 富阳区
    {name: '富春街道', coord: [119.96, 30.05], value: 4, district: '富阳区'},
    {name: '新登镇', coord: [119.80, 30.08], value: 5, district: '富阳区'},
    {name: '场口镇', coord: [119.75, 29.98], value: 4, district: '富阳区'},
    {name: '常安镇', coord: [119.88, 29.92], value: 3, district: '富阳区'},
    // 淳安县
    {name: '千岛湖镇', coord: [119.04, 29.61], value: 6, district: '淳安县'},
    {name: '文昌镇', coord: [119.15, 29.70], value: 4, district: '淳安县'},
    {name: '汾口镇', coord: [118.95, 29.65], value: 3, district: '淳安县'},
    {name: '威坪镇', coord: [118.88, 29.58], value: 3, district: '淳安县'},
    // 桐庐县
    {name: '桐君街道', coord: [119.68, 29.79], value: 4, district: '桐庐县'},
    {name: '富春江镇', coord: [119.62, 29.75], value: 3, district: '桐庐县'},
    {name: '分水镇', coord: [119.52, 29.70], value: 4, district: '桐庐县'},
    {name: '瑶琳镇', coord: [119.55, 29.82], value: 3, district: '桐庐县'},
    // 建德市
    {name: '新安江街道', coord: [119.28, 29.48], value: 4, district: '建德市'},
    {name: '更楼街道', coord: [119.32, 29.52], value: 3, district: '建德市'},
    {name: '大同镇', coord: [119.18, 29.55], value: 3, district: '建德市'},
    {name: '寿昌镇', coord: [119.38, 29.58], value: 4, district: '建德市'},
    // 萧山区
    {name: '瓜沥镇', coord: [120.45, 30.08], value: 5, district: '萧山区'},
    {name: '临浦镇', coord: [120.35, 29.98], value: 4, district: '萧山区'},
    {name: '戴村镇', coord: [120.18, 30.03], value: 3, district: '萧山区'},
    {name: '浦阳镇', coord: [120.26, 29.95], value: 4, district: '萧山区'},
    // 西湖区
    {name: '灵隐街道', coord: [120.12, 30.26], value: 3, district: '西湖区'},
    {name: '北山街道', coord: [120.14, 30.27], value: 3, district: '西湖区'},
    {name: '西溪街道', coord: [120.10, 30.28], value: 4, district: '西湖区'},
    // 临平区
    {name: '东湖街道', coord: [120.30, 30.42], value: 3, district: '临平区'},
    {name: '南苑街道', coord: [120.28, 30.40], value: 3, district: '临平区'},
    {name: '崇贤街道', coord: [120.25, 30.43], value: 4, district: '临平区'},
    // 钱塘区
    {name: '白杨街道', coord: [120.38, 30.32], value: 3, district: '钱塘区'},
    {name: '河庄街道', coord: [120.48, 30.28], value: 3, district: '钱塘区'},
    {name: '义蓬街道', coord: [120.52, 30.30], value: 3, district: '钱塘区'}
];

// 将 RGB 对象转换为 rgba 字符串
function toRgba(color, alpha = 1) {
    const r = color.r || 0;
    const g = color.g || 0;
    const b = color.b || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 对颜色进行亮度调整
function lightenColor(color, delta) {
    const clamp = (v) => Math.max(0, Math.min(255, v));
    return {
        r: clamp(color.r + delta),
        g: clamp(color.g + delta),
        b: clamp(color.b + delta)
    };
}

/**
 * 准备图表所需的数据
 * @param {object} geoJson - 地图的GeoJSON数据
 * @param {Array} points - 各区县的点位数据
 * @returns {object} - 包含mapData, bubbleData, labelData的对象
 */
function prepareData(geoJson, points) {
    // 1. 根据点位数据计算各区县总数
    const districtTotals = points.reduce((acc, pt) => {
        acc[pt.district] = (acc[pt.district] || 0) + pt.value;
        return acc;
    }, {});

    // 2. 生成包含所有区县的mapData
    const allDistricts = geoJson.features.map(f => f.properties.name);
    const mapData = allDistricts.map(name => ({
        name: name,
        value: districtTotals[name] || 0
    }));

    // 3. 从GeoJSON中提取区县中心点坐标
    const districtCentroids = geoJson.features.reduce((acc, feature) => {
        const { name, center, centroid } = feature.properties;
        acc[name] = centroid || center;
        return acc;
    }, {});

    // 4. 准备气泡和标签数据
    const bubbleData = [];
    const labelData = [];
    mapData.forEach(item => {
        let coord = districtCentroids[item.name];
        if (coord) {
            // 对特定区县坐标进行微调
            if (item.name === '萧山区') {
                coord = [coord[0], coord[1] - 0.18];
            }
            bubbleData.push({ name: item.name, value: [...coord, item.value] });
            labelData.push({ name: item.name, value: [coord[0] - 0.08, coord[1]] });
        }
    });

    return { mapData, bubbleData, labelData };
}

/**
 * 创建ECharts图表配置项
 * @param {object} data - 由prepareData生成的数据对象
 * @param {object} mapColor - 当前地图主色 {r,g,b}
 * @returns {object} - ECharts的option配置
 */
function createChartOption(data, mapColor = mapColorState) {
    const { mapData, bubbleData, labelData } = data;

    const baseAreaColor = toRgba(mapColor, 1);
    const emphasisAreaColor = toRgba(lightenColor(mapColor, 30), 1);

    const formatters = {
        total: (params) => {
            const district = mapData.find(d => d.name === params.name);
            return `${params.name}(${district ? district.value : 0})`;
        },
        detail: (params) => params.name
    };

    return {
        backgroundColor: {
            type: 'radial', x: 0.5, y: 0.5, r: 0.8,
            colorStops: [{ offset: 0, color: '#152a4a' }, { offset: 0.5, color: '#0a1f3d' }, { offset: 1, color: '#040f1f' }]
        },
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderColor: '#1E90FF',
            borderWidth: 1,
            textStyle: { color: '#fff' },
            formatter: (params) => {
                if (params.seriesName === '区县示范点' && params.data) {
                    return `${params.data.name}<br/>示范点数量: ${params.data.value[2]}`;
                }
                if (params.componentSubType === 'map') {
                    const district = mapData.find(d => d.name === params.name);
                    return `${params.name}<br/>数字乡村示范点总数: ${district ? district.value : 0}`;
                }
                return params.name;
            }
        },
        legend: {
            show: false // 通过开关控制，图例不再需要
        },
        graphic: [
            { type: 'circle', left: '10%', top: '15%', z: 1, shape: { r: 80 }, style: { fill: { type: 'radial', x: 0.5, y: 0.5, r: 0.5, colorStops: [{ offset: 0, color: 'rgba(30,144,255,0.15)' }, { offset: 1, color: 'rgba(30,144,255,0)' }] } } },
            { type: 'circle', right: '8%', bottom: '20%', z: 1, shape: { r: 100 }, style: { fill: { type: 'radial', x: 0.5, y: 0.5, r: 0.5, colorStops: [{ offset: 0, color: 'rgba(76,96,255,0.2)' }, { offset: 1, color: 'rgba(76,96,255,0)' }] } } },
            { type: 'text', left: 20, top: 20, z: 100, style: { text: '* 数据为模拟数据', fill: 'rgba(255,235,123,0.7)', fontSize: 13, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowBlur: 4 } },
            itemStyle: { areaColor: baseAreaColor, borderColor: '#002097', borderWidth: 1, shadowColor: 'rgba(30,144,255,0.4)', shadowBlur: 15, shadowOffsetX: 0, shadowOffsetY: 0 },
        ],
        geo: {
                itemStyle: { areaColor: emphasisAreaColor, shadowColor: 'rgba(30,144,255,0.6)', shadowBlur: 20 }
            roam: true,
            scaleLimit: { min: 0.8, max: 3 },
            zoom: 1.2,
            aspectScale: 0.75,
            label: { show: true, color: '#fff', fontSize: 13, fontWeight: 'bold', formatter: formatters.detail },
            itemStyle: { areaColor: '#4c60ff', borderColor: '#002097', borderWidth: 1, shadowColor: 'rgba(30,144,255,0.4)', shadowBlur: 15, shadowOffsetX: 0, shadowOffsetY: 0 },
            emphasis: {
                label: { show: true, color: '#ffeb7b', fontSize: 15, formatter: formatters.detail },
                itemStyle: { areaColor: '#293fff', shadowColor: 'rgba(30,144,255,0.6)', shadowBlur: 20 }
            }
        },
        series: [
            {
                name: '区县示范点',
                type: 'scatter',
                coordinateSystem: 'geo',
                data: districtPoints.map(pt => ({ name: pt.name, value: pt.coord.concat(pt.value) })),
                symbolSize: (val) => val[2] * 3.5 + 6,
                itemStyle: { color: '#00ff9d', opacity: 0.85, borderColor: '#fff', borderWidth: 0.5 },
                label: { show: true, position: 'right', formatter: (params) => params.data.name, color: '#00ff9d', fontSize: 10, fontWeight: 'normal', textBorderColor: '#000', textBorderWidth: 0.8 },
                emphasis: { itemStyle: { color: '#00ff9d', opacity: 1, borderWidth: 1.5 }, label: { show: true, fontSize: 11, fontWeight: 'bold' } }
            }
        ]
    };
}

/**
 * 设置图表的交互行为
 * @param {echarts.ECharts} myChart - ECharts实例
 * @param {object} initialOption - 初始化的图表配置
 * @param {object} data - 由prepareData生成的数据对象
 */
function setupInteractions(myChart, initialOption, data) {
    window.addEventListener("resize", () => {
        myChart.resize();
    });
}

// 绑定颜色控制器交互
function setupColorControls(myChart, data) {
    const rInput = document.getElementById('map-color-r');
    const gInput = document.getElementById('map-color-g');
    const bInput = document.getElementById('map-color-b');
    const applyBtn = document.getElementById('map-color-apply');

    if (!rInput || !gInput || !bInput || !applyBtn) return;

    const syncInputs = () => {
        rInput.value = mapColorState.r;
        gInput.value = mapColorState.g;
        bInput.value = mapColorState.b;
    };

    const readChannel = (input) => {
        const val = parseInt(input.value, 10);
        if (isNaN(val)) return 0;
        return Math.max(0, Math.min(255, val));
    };

    const applyColor = () => {
        mapColorState.r = readChannel(rInput);
        mapColorState.g = readChannel(gInput);
        mapColorState.b = readChannel(bInput);
        myChart.setOption(createChartOption(data, mapColorState), true);
    };

    applyBtn.addEventListener('click', applyColor);
    [rInput, gInput, bInput].forEach(input => {
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                applyColor();
            }
        });
    });

    syncInputs();
}

/**
 * 主函数：初始化杭州地图
 */
function initHangzhouMap() {
    $.get('js/hangzhou.json', function (geoJson) {
        echarts.registerMap('hangzhou', geoJson);
        const myChart = echarts.init(document.getElementById('map_hangzhou'));

        // 1. 准备数据
        const chartData = prepareData(geoJson, districtPoints);

        // 2. 创建配置项
        const option = createChartOption(chartData, mapColorState);

        // 3. 设置图表并配置交互
        myChart.setOption(option);
        setupInteractions(myChart, option, chartData);
        setupColorControls(myChart, chartData);
    });
}
