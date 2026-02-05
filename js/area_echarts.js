$(function () {
    // 加载浙江省地图并注册
    $.get('js/zhejiang2.json', function (geoJson) {
        echarts.registerMap('zhejiang', geoJson);
        map();
    });
    function map() {
        var myChart = echarts.init(document.getElementById('map_1'));
        var data = [
            {name: '杭州市', value: 71},
            {name: '宁波市', value: 67},
            {name: '温州市', value: 57},
            {name: '嘉兴市', value: 70},
            {name: '湖州市', value: 86},
            {name: '绍兴市', value: 46},
            {name: '金华市', value: 57},
            {name: '衢州市', value: 56},
            {name: '舟山市', value: 17},
            {name: '台州市', value: 49},
            {name: '丽水市', value: 34}
        ];
        var geoCoordMap = {
            '杭州市': [120.1551, 30.2741],
            '宁波市': [121.5503, 29.8746],
            '温州市': [120.6994, 27.9949],
            '嘉兴市': [120.7555, 30.7461],
            '湖州市': [120.0868, 30.8946],
            '绍兴市': [120.5821, 29.9971],
            '金华市': [119.6474, 29.0790],
            '衢州市': [118.8726, 28.9417],
            '舟山市': [122.1069, 30.0160],
            '台州市': [121.4208, 28.6564],
            '丽水市': [119.9218, 28.4519]
        };
        var convertData = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var geoCoord = geoCoordMap[data[i].name];
                if (geoCoord) {
                    res.push({
                        name: data[i].name,
                        value: geoCoord.concat(data[i].value)
                    });
                }
            }
            return res;
        };
        var option = {
            title: {
                text: '',
                left: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    if (typeof(params.value)[2] == "undefined") {
                        return params.name + ' : ' + params.value;
                    } else {
                        return params.name + ' : ' + params.value[2];
                    }
                }
            },
            geo: {
                map: 'zhejiang',
                label: {
                    show: true, // 默认显示各市名称
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 'bold',
                    formatter: function(params) {
                        // 在地图上显示名称和数量
                        var city = params.name;
                        var found = data.find(function(item){return item.name===city});
                        if(found) {
                            return city + '\n' + found.value;
                        }
                        return city;
                    }
                },
                emphasis: {
                    label: {
                        show: true,
                        color: '#ffeb7b',
                        fontSize: 16,
                        fontWeight: 'bold',
                        formatter: function(params) {
                            var city = params.name;
                            var found = data.find(function(item){return item.name===city});
                            if(found) {
                                return city + '\n' + found.value;
                            }
                            return city;
                        }
                    }
                },
                roam: false, // 允许缩放和拖拽
                zoom: 1.03, // 默认缩放级别
                center: [120.1474, 28.7990], // 默认中心点为金华市
                itemStyle: {
                    normal: {
                        areaColor: '#4c60ff',
                        borderColor: '#002097'
                    },
                    emphasis: {
                        areaColor: '#293fff'
                    }
                }
            },
            series: [
                {
                    name: '数据',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: convertData(data),
                    symbolSize: function (val) {
                        return Math.max(val[2] * 0.2, 10);
                    },
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: false
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#ffeb7b'
                        }
                    }
                }
            ]
        };
        myChart.setOption(option);

        // 点击城市时，跳转到对应页面
        myChart.on('click', function (params) {
            var city = params.name;
            if(city === '杭州市') {
                window.location.href = 'hangzhou.html';
            }
            // 可根据需要添加更多城市跳转
        });

        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }

})

