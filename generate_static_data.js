/**
 * 生成静态数据文件用于GitHub Pages部署
 */

const fs = require('fs');
const path = require('path');

// 模拟数据生成函数
function generateMockData() {
    const villages = [];
    const regions = ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '台州市', '丽水市'];
    const operationTypes = ['文旅融合', '生态农业', '电商直播', '民宿经济', '康养产业', '数字乡村'];
    
    for (let i = 1; i <= 50; i++) {
        villages.push({
            id: i,
            村庄名称: `示范村${i}`,
            所属区域: regions[Math.floor(Math.random() * regions.length)],
            运营类型: operationTypes[Math.floor(Math.random() * operationTypes.length)],
            负责人: `负责人${String.fromCharCode(65 + i % 26)}`,
            联系方式: `138${Math.floor(10000000 + Math.random() * 90000000)}`,
            运营状态: Math.random() > 0.2 ? '运营中' : '筹备中'
        });
    }
    
    return villages;
}

// 生成统计数据
function generateStats(data) {
    const totalVillages = data.length;
    
    // 计算区域数量
    const regions = new Set(data.map(v => v['所属区域']));
    
    // 计算运营类型分布
    const operationTypes = {};
    data.forEach(v => {
        const type = v['运营类型'];
        operationTypes[type] = (operationTypes[type] || 0) + 1;
    });
    
    // 计算运营状态比例
    const operationalCount = data.filter(v => v['运营状态'] === '运营中').length;
    const updateRate = `${Math.round((operationalCount / totalVillages) * 100)}%`;
    
    const topOperationType = Object.keys(operationTypes).reduce((a, b) => 
        operationTypes[a] > operationTypes[b] ? a : b
    );
    
    return {
        total_villages: totalVillages,
        regions_count: regions.size,
        operation_types: operationTypes,
        update_rate: updateRate,
        top_operation_type: topOperationType
    };
}

// 生成静态数据文件
function generateStaticData() {
    const mockData = generateMockData();
    const stats = generateStats(mockData);
    
    // 创建data目录
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // 写入数据文件
    fs.writeFileSync(
        path.join(dataDir, 'data.json'), 
        JSON.stringify(mockData, null, 2), 
        'utf8'
    );
    
    fs.writeFileSync(
        path.join(dataDir, 'stats.json'), 
        JSON.stringify(stats, null, 2), 
        'utf8'
    );
    
    console.log('静态数据文件已生成:');
    console.log('- data/data.json: 村庄详细信息');
    console.log('- data/stats.json: 统计数据');
}

// 修改index.html以使用静态数据
function modifyIndexHtml() {
    const indexPath = path.join(__dirname, 'index.html');
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // 替换API调用为静态数据调用
    htmlContent = htmlContent.replace(
        '<script src="script.js"></script>',
        `<script>
    // 使用静态数据替代API调用
    async function loadData() {
        try {
            document.getElementById('totalVillages').textContent = '加载中...';
            
            // 从静态文件加载数据
            const dataResponse = await fetch('data/data.json');
            const data = await dataResponse.json();
            
            const statsResponse = await fetch('data/stats.json');
            const stats = await statsResponse.json();
            
            displayData(data);
            updateStats(stats);
            
            updateLastUpdatedTime();
        } catch (error) {
            console.error('数据加载失败:', error);
            // 使用模拟数据作为备选
            const mockData = generateMockData();
            displayData(mockData);
            
            document.getElementById('totalVillages').textContent = mockData.length;
            document.getElementById('regionCount').textContent = 10;
            document.getElementById('operationTypes').textContent = '文旅融合';
            document.getElementById('updateRate').textContent = '90%';
        }
    }
    
    // 模拟数据生成函数
    function generateMockData() {
        const villages = [];
        const regions = ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '台州市', '丽水市'];
        const operationTypes = ['文旅融合', '生态农业', '电商直播', '民宿经济', '康养产业', '数字乡村'];
        
        for (let i = 1; i <= 50; i++) {
            villages.push({
                id: i,
                村庄名称: '示范村'+i,
                所属区域: regions[Math.floor(Math.random() * regions.length)],
                运营类型: operationTypes[Math.floor(Math.random() * operationTypes.length)],
                负责人: '负责人'+String.fromCharCode(65 + i % 26),
                联系方式: '138'+Math.floor(10000000 + Math.random() * 90000000),
                运营状态: Math.random() > 0.2 ? '运营中' : '筹备中'
            });
        }
        
        return villages;
    }
    </script>
    <script src="script.js"></script>`
    );
    
    fs.writeFileSync(indexPath, htmlContent, 'utf8');
    console.log('index.html 已更新以使用静态数据');
}

// 执行生成
generateStaticData();
modifyIndexHtml();
console.log('静态版本准备完成，可用于GitHub Pages部署');