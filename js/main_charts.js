$(function () {
    // 数字农业工厂数据（2021-2024）
    var digitalFarmData = {
        cities: ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
        values: [65, 61, 54, 63, 74, 43, 51, 53, 16, 49, 33]
    };

    // 未来农场数据（2022-2024）
    var futureFarmData = {
        cities: ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
        values: [6, 6, 3, 7, 12, 3, 6, 3, 1, 0, 1]
    };

    // 初始化图表
    initDigitalFarmChart();
    initFutureFarmChart();
    initMap();

    // 数字农业工厂柱状图
    function initDigitalFarmChart() {
        var myChart = echarts.init(document.getElementById('echart_digital_farm'));
        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '15%',
                right: '5%',
                bottom: '8%',
                top: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: digitalFarmData.cities,
                axisLine: {
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                axisLabel: {
                    interval: 0,
                    rotate: 45,
                    textStyle: {
                        color: '#333',
                        fontSize: '14'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    textStyle: {
                        color: '#666',
                        fontSize: '12'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#e0e0e0'
                    }
                }
            },
            series: [{
                name: '数字农业工厂',
                type: 'bar',
                data: digitalFarmData.values,
                barWidth: '50%',
                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#00d4ff'
                        }, {
                            offset: 1,
                            color: '#0066ff'
                        }]),
                        barBorderRadius: [5, 5, 0, 0]
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    textStyle: {
                        color: '#0066ff',
                        fontSize: 13,
                        fontWeight: 'bold'
                    }
                }
            }]
        };
        myChart.setOption(option);
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

    // 未来农场柱状图
    function initFutureFarmChart() {
        var myChart = echarts.init(document.getElementById('echart_future_farm'));
        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '15%',
                right: '5%',
                bottom: '8%',
                top: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: futureFarmData.cities,
                axisLine: {
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                axisLabel: {
                    interval: 0,
                    rotate: 45,
                    textStyle: {
                        color: '#333',
                        fontSize: '14'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    textStyle: {
                        color: '#666',
                        fontSize: '12'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#e0e0e0'
                    }
                }
            },
            series: [{
                name: '未来农场',
                type: 'bar',
                data: futureFarmData.values,
                barWidth: '50%',
                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#ffd700'
                        }, {
                            offset: 1,
                            color: '#ff8800'
                        }]),
                        barBorderRadius: [5, 5, 0, 0]
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    textStyle: {
                        color: '#ff8800',
                        fontSize: 13,
                        fontWeight: 'bold'
                    }
                }
            }]
        };
        myChart.setOption(option);
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

    // 浙江省地图
    function initMap() {
        $.get('js/zhejiang2.json', function (geoJson) {
            echarts.registerMap('zhejiang', geoJson);
            
            var myChart = echarts.init(document.getElementById('map_1'));
            
            // 计算汇总数据（数字农业工厂 + 未来农场）
            var mapData = [
                {name: '杭州市', value: 71, digital: 65, future: 6},
                {name: '宁波市', value: 67, digital: 61, future: 6},
                {name: '温州市', value: 57, digital: 54, future: 3},
                {name: '嘉兴市', value: 70, digital: 63, future: 7},
                {name: '湖州市', value: 86, digital: 74, future: 12},
                {name: '绍兴市', value: 46, digital: 43, future: 3},
                {name: '金华市', value: 57, digital: 51, future: 6},
                {name: '衢州市', value: 56, digital: 53, future: 3},
                {name: '舟山市', value: 17, digital: 16, future: 1},
                {name: '台州市', value: 49, digital: 49, future: 0},
                {name: '丽水市', value: 34, digital: 33, future: 1}
            ];

            // 取值范围用于视觉映射
            var minVal = Math.min.apply(null, mapData.map(function (d) { return d.value; }));
            var maxVal = Math.max.apply(null, mapData.map(function (d) { return d.value; }));

            // 从 GeoJSON 中提取每个地级市的坐标
            var cityCoords = {};  // 行政标注位置（用于城市名称）
            var cityCentroids = {};  // 几何中心位置（用于圆圈）
            if (geoJson.features) {
                geoJson.features.forEach(function(feature) {
                    var name = feature.properties.name;
                    // center 用于城市名称标注
                    var center = feature.properties.center;
                    // centroid 用于圆圈定位（几何中心）
                    var centroid = feature.properties.centroid || center;
                    if (center) {
                        cityCoords[name] = center;
                    }
                    if (centroid) {
                        cityCentroids[name] = centroid;
                    }
                });
            }

            var option = {
                legend: {
                    orient: 'vertical',
                    right: '2%',
                    bottom: '5%',
                    data: ['数字农业工厂', '未来农场'],
                    selected: {
                        '数字农业工厂': true,
                        '未来农场': true
                    },
                    textStyle: {
                        color: '#444',
                        fontSize: 14
                    },
                    itemWidth: 20,
                    itemHeight: 20,
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    borderWidth: 0,
                    padding: 6,
                    borderRadius: 6
                },
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    textStyle: { color: '#333' },
                    formatter: function (params) {
                        if (params.componentSubType === 'map') {
                            var city = params.name;
                            var found = mapData.find(function(item){return item.name === city});
                            if(found) {
                                return city + '<br/>' +
                                       '数字农业工厂: ' + found.digital + '<br/>' +
                                       '未来农场: ' + found.future + '<br/>' +
                                       '合计: ' + found.value;
                            }
                            return city;
                        } else if (params.seriesName === '数字农业工厂') {
                            return params.data.cityName + '<br/>' +
                                   '数字农业工厂: ' + params.data.digital;
                        } else if (params.seriesName === '未来农场') {
                            return params.data.cityName + '<br/>' +
                                   '未来农场: ' + params.data.future;
                        } else if (params.seriesName === '城市名称') {
                            var data = params.data;
                            return data.cityName;
                        }
                    }
                },
                geo: {
                    map: 'zhejiang',
                    roam: true,
                    scaleLimit: {
                        min: 0.8,
                        max: 3
                    },
                    zoom: 1.3,
                    aspectScale: 0.75,
                    label: {
                        show: false
                    },
                    itemStyle: {
                        areaColor: '#f7f9fa',
                        borderColor: '#99bcd9',
                        borderWidth: 1,
                        shadowColor: 'rgba(0,0,0,0.05)',
                        shadowBlur: 4,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0
                    },
                    emphasis: {
                        itemStyle: {
                            areaColor: '#e3f2fd'
                        }
                    }
                },
                series: [
                    // 数字农业工厂圆圈（蓝色）- 放在地级市几何中心偏左
                    {
                        name: '数字农业工厂',
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        data: mapData.map(function(item) {
                            var coord = cityCentroids[item.name];
                            if (coord) {
                                return {
                                    name: item.name,
                                    value: [coord[0] - 0.08, coord[1], item.digital],
                                    digital: item.digital,
                                    future: item.future,
                                    cityName: item.name
                                };
                            }
                        }).filter(function(item) { return item; }),
                        symbolSize: function(val) {
                            return Math.sqrt(val[2]) * 5 + 10;
                        },
                        itemStyle: {
                            color: 'rgba(0,120,255,0.6)',
                            borderWidth: 0
                        },
                        label: {
                            show: true,
                            position: 'inside',
                            formatter: function(params) {
                                return params.data.digital;
                            },
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold'
                        }
                    },
                    // 未来农场圆圈（橙色）- 放在地级市几何中心偏右
                    {
                        name: '未来农场',
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        data: mapData.map(function(item) {
                            var coord = cityCentroids[item.name];
                            if (coord) {
                                return {
                                    name: item.name,
                                    value: [coord[0] + 0.08, coord[1], item.future],
                                    digital: item.digital,
                                    future: item.future,
                                    cityName: item.name
                                };
                            }
                        }).filter(function(item) { return item; }),
                        symbolSize: function(val) {
                            return Math.sqrt(val[2]) * 8 + 10;
                        },
                        itemStyle: {
                            color: 'rgba(255,140,0,0.6)',
                            borderWidth: 0
                        },
                        label: {
                            show: true,
                            position: 'inside',
                            formatter: function(params) {
                                return params.data.future;
                            },
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold'
                        }
                    },
                    // 城市名称标注 - 放在行政位置
                    {
                        name: '城市名称',
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        data: mapData.map(function(item) {
                            var coord = cityCoords[item.name];
                            if (coord) {
                                return {
                                    name: item.name,
                                    value: coord,
                                    cityName: item.name
                                };
                            }
                        }).filter(function(item) { return item; }),
                        symbolSize: 1,
                        itemStyle: {
                            color: 'transparent'
                        },
                        label: {
                            show: true,
                            position: 'bottom',
                            formatter: function(params) {
                                return params.data.cityName.replace('市', '');
                            },
                            color: '#444',
                            fontSize: 15,
                            fontWeight: 'bold',
                            offset: [0, 5]
                        }
                    }
                ]
            };

            myChart.setOption(option);

            window.addEventListener("resize", function () {
                myChart.resize();
            });
        });
    }
});
