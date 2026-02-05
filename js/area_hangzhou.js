$(function () {
    // 加载浙江省地图并注册
    $.get('js/hangzhou.json', function (geoJson) {
        echarts.registerMap('zhejiang', geoJson);
        map();
    });
    function map() {
        var myChart = echarts.init(document.getElementById('map_1'));
        // 杭州市各区名称和对应数据
        var data = [
            { name: '上城区', value: 2 },
            { name: '临安区', value: 25 },
            { name: '临平区', value: 10 },
            { name: '余杭区', value: 16 },
            { name: '富阳区', value: 9 },
            { name: '建德市', value: 18 },
            { name: '拱墅区', value: 1 },
            { name: '桐庐县', value: 3 },
            { name: '淳安县', value: 7 },
            { name: '滨江区', value: 2 },
            { name: '萧山区', value: 5 },
            { name: '西湖区', value: 9 },
            { name: '钱塘区', value: 5 }
        ];
        // 各区经纬度（大致中心点）
        var geoCoordMap = {
            '上城区': [120.1808, 30.2425],
            '拱墅区': [120.1500, 30.3199],
            '西湖区': [120.1296, 30.2595],
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
        // 经营主体信息数组，包含名称、村名、运营时间、投入资金、所属区
        var linanCompanies = [
            { name: '集智兴村（杭州）技术有限公司', village: '锦源村', year: '2024', invest: '50', area: '临安区' },
            { name: '杭州无界文旅发展有限公司', village: '高源村', year: '2023', invest: '600', area: '临安区' },
            { name: '杭州森活文化旅游发展有限公司', village: '洪村村', year: '2021.3', invest: '150', area: '临安区' },
            { name: '杭州村社通企业管理有限公司', village: '朱村', year: '2021', invest: '280', area: '临安区' },
            { name: '浙江相爱文化产业有限公司', village: '孝村村', year: '2024', invest: '50', area: '临安区' },
            { name: '杭州九桥旅游发展有限公司', village: '文武上田', year: '2023.11', invest: '150', area: '临安区' },
            { name: '杭州九桥旅游发展有限公司', village: '上田花戏', year: '2023.11', invest: '150', area: '临安区' },
            { name: '浙江金诺传媒有限公司', village: '龙门秘境', year: '2017', invest: '13000', area: '临安区' },
            { name: '江南舅舅文化传媒有限公司', village: '崇阳村', year: '2024', invest: '50', area: '临安区' },
            { name: '杭州众神影视文化有限公司', village: '临目村', year: '2023', invest: '1500', area: '临安区' },
            { name: '杭州新蓝筹文化旅游管理有限公司', village: '红叶指南', year: '2024', invest: '95', area: '临安区' },
            { name: '杭州乡野乐创文旅发展有限公司', village: '朱湾村', year: '2021', invest: '120', area: '临安区' },
            { name: '杭州村光灿烂科技有限公司', village: '逸逸村', year: '2023', invest: '', area: '临安区' },
            { name: '中创乡旅（浙江）文化旅游发展有限公司', village: '绍鲁村', year: '2024', invest: '35', area: '临安区' },
            { name: '浙江臻远乡村发展有限公司', village: '潜东村', year: '2024', invest: '', area: '临安区' },
            { name: '杭州新富景文旅发展有限公司', village: '九狮村', year: '2024', invest: '50', area: '临安区' },
            { name: '杭州临安中青时代旅游有限公司', village: '月亮桥村', year: '2024.4', invest: '300', area: '临安区' },
            { name: '杭州前方文化传播有限公司', village: '天目村', year: '2024', invest: '200', area: '临安区' },
            { name: '杭州一线天广告有限公司', village: '告岭村', year: '2024', invest: '50', area: '临安区' },
            { name: '杭州临安即安文旅发展有限责任公司', village: '枫树岭村', year: '2024', invest: '250', area: '临安区' }
        ];
        // 临安区中心点
        // 临安区大致范围：东经119.45~120.00，北纬30.05~30.45
        var linanCompanyCoords = [
            [119.215, 30.230], // 1
            [119.630, 30.210], // 2
            [119.650, 30.250], // 3
            [119.670, 30.220], // 4
            [119.790, 30.240], // 5
            [119.660, 30.260], // 6
            [119.720, 30.245], // 7
            [119.835, 30.265], // 8
            [119.455, 30.215], // 9
            [119.680, 30.225], // 10
            [119.765, 30.235], // 11
            [119.425, 30.255], // 12
            [119.745, 30.225], // 13
            [119.285, 30.255], // 14
            [119.295, 30.115], // 15
            [119.315, 30.265], // 16
            [119.735, 30.235], // 17
            [119.355, 30.245], // 18
            [119.175, 30.265], // 19
            [119.295, 30.235]  // 20
        ];
        // 生成经营主体散点数据（分布在临安区范围内）
        var linanCompanyScatter = linanCompanies.map(function(item, idx) {
            return {
                name: item.name,
                value: linanCompanyCoords[idx],
                village: item.village,
                year: item.year,
                invest: item.invest
            };
        });
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
                roam: true, // 允许缩放和拖拽
                zoom: 1.25, // 默认缩放级别
                center: [119.2850, 29.7978], // 默认中心点为桐庐区
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
                        return val[2] * 1 + 10; // 放大圆圈，最小10，随数量增大
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
                },
                // 新增：临安区经营主体散点
                {
                    name: '临安区经营主体',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: linanCompanyScatter,
                    symbol: 'circle',
                    symbolSize: 12,
                    label: {
                        show: false
                    },
                    itemStyle: {
                        color: '#ff4d4f',
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    tooltip: {
                        show: true,
                        backgroundColor: 'rgba(50,50,50,0.95)',
                        borderColor: '#fff',
                        borderWidth: 1,
                        textStyle: {
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: 14
                        },
                        formatter: function(params) {
                            var d = params.data;
                            return '<b style="color:#fff">' + d.name + '</b><br>' +
                                   '<span style="color:#fff">村落：</span>' + (d.village||'') + '<br>' +
                                   '<span style="color:#fff">运营时间：</span>' + (d.year||'') + '<br>' +
                                   '<span style="color:#fff">投入资金：</span>' + (d.invest||'') + '万元';
                        }
                    },
                    zlevel: 10
                }
            ]
        };
        myChart.setOption(option);
        window.addEventListener("resize", function () {
            myChart.resize();
        });
        // 1. 添加浮动筛选窗口（宽度加宽，结构优化）
        $('body').append(`
          <div id="floatFilterBox" style="position:fixed;right:30px;bottom:30px;z-index:9999;width:550px;background:rgba(30,34,60,0.98);border-radius:10px;box-shadow:0 2px 12px #0003;padding:18px 18px 12px 18px;color:#fff;font-size:15px;">
            <div style="font-weight:bold;font-size:17px;margin-bottom:10px;color:#ffffff">经营主体筛选</div>
            <div style="margin-bottom:8px;display:flex;gap:12px;align-items:center;">
              <span style="color:#ffffff">地区：</span><select id="filterRegion" style="width:60px;"></select>
              <span style="color:#ffffff">年份：</span><select id="filterYear" style="width:80px;"></select>
              <span style="color:#ffffff">资金：</span><select id="filterInvest" style="width:80px;"></select>
            </div>
            <div id="filterCompanyList" style="max-height:220px;overflow:auto;"></div>
          </div>
        `);

        // 2. 生成筛选选项
        var allAreas = Array.from(new Set(linanCompanies.map(c => c.area))).filter(Boolean);
        $('#filterRegion').append('<option value="">全部</option>' + allAreas.map(r => `<option value="${r}">${r}</option>`).join(''));

        var yearOptions = [
          { label: '全部', value: '' },
          { label: '2022年以前', value: 'before2023' },
          { label: '2023年', value: '2023' },
          { label: '2024年', value: '2024' },
          { label: '2025年', value: '2025' }
        ];
        $('#filterYear').append(yearOptions.map(y => `<option value="${y.value}">${y.label}</option>`).join(''));

        var investOptions = [
          { label: '全部', value: '' },
          { label: '小于50万', value: 'lt50' },
          { label: '50-300万', value: '50to300' },
          { label: '300万以上', value: 'gt300' }
        ];
        $('#filterInvest').append(investOptions.map(i => `<option value="${i.value}">${i.label}</option>`).join(''));

        // 3. 筛选并显示公司列表（重构筛选逻辑）
        function filterCompanies(region, year, invest) {
          return linanCompanies.filter(function (c) {
            // 地区筛选
            var regionOk = !region || c.area === region;
            // 年份筛选
            var yearOk = true;
            var yearNum = parseInt((c.year || '').toString().split('.')[0]);
            if (year === 'before2023') {
              yearOk = yearNum && yearNum < 2023;
            } else if (year === '2023') {
              yearOk = yearNum === 2023;
            } else if (year === '2024') {
              yearOk = yearNum === 2024;
            } else if (year === '2025') {
              yearOk = yearNum === 2025;
            }
            // 投资额筛选
            var investOk = true;
            var investNum = parseFloat(c.invest);
            if (invest === 'lt50') {
              investOk = investNum && investNum < 50;
            } else if (invest === '50to300') {
              investOk = investNum && investNum >= 50 && investNum <= 300;
            } else if (invest === 'gt300') {
              investOk = investNum && investNum > 300;
            }
            return regionOk && yearOk && investOk;
          });
        }

        function updateCompanyList(region, year, invest) {
          var list = filterCompanies(region, year, invest);
          if (list.length === 0) {
            $('#filterCompanyList').html('<span style="color:#ffeb7b">无匹配经营主体</span>');
          } else {
            $('#filterCompanyList').html(list.map(function (c) {
              return `<div style='margin-bottom:6px;line-height:1.5;'><b style='color:#fff'>${c.name}</b><br><span style='color:#aaa;font-size:13px;'>${c.area} | ${c.village} | ${c.year} | ${c.invest ? c.invest + '万' : ''}</span></div>`;
            }).join(''));
          }
          // 地图同步显示
          var showNames = list.map(c => c.name);
          var newData = linanCompanyScatter.filter(c => showNames.includes(c.name));
          var option = myChart.getOption();
          option.series.forEach(function (s) {
            if (s.name === '临安区经营主体') s.data = newData;
          });
          myChart.setOption(option, true);
        }

        // 4. 监听筛选变化
        $('#filterRegion,#filterYear,#filterInvest').on('change', function () {
          var region = $('#filterRegion').val();
          var year = $('#filterYear').val();
          var invest = $('#filterInvest').val();
          updateCompanyList(region, year, invest);
        });

        // 5. 默认显示：点击区时只显示该区经营主体
        myChart.on('click', function (params) {
          if (params.componentType === 'geo' && params.name) {
            var region = params.name;
            if (allAreas.includes(region)) {
              $('#filterRegion').val(region).trigger('change');
            }
          }
        });

        // 6. 页面初始化时显示全部公司
        updateCompanyList('', '', '');
    }

})

