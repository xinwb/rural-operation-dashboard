const data = require('./data/data.json');
const towns = require('./data/hangzhou_town_centers.json');
const townSet = new Set(towns.map(t => t.name));

// 从数据中提取所有乡镇名称
const dataTowns = new Set(data.map(d => d['乡镇（街道）']?.trim()).filter(Boolean));

console.log('=== 数据中出现但在中心点数据中未找到的乡镇 ===');
let missingCount = 0;
const missingTowns = [];
dataTowns.forEach(town => {
    if (!townSet.has(town)) {
        missingTowns.push(town);
        missingCount++;
    }
});

if (missingCount > 0) {
    console.log(`找到 ${missingCount} 个乡镇缺少坐标：`);
    missingTowns.forEach(t => console.log(`  - ${t}`));
} else {
    console.log('✓ 所有乡镇都有对应的坐标！');
}

console.log(`\n总计：数据中 ${dataTowns.size} 个不同乡镇，中心点数据 ${towns.length} 条`);

// 显示样本坐标
console.log('\n=== 坐标范例 ===');
let count = 0;
dataTowns.forEach(town => {
    if (count < 5) {
        const coord = townSet.has(town) ? towns.find(t => t.name === town).center : '未找到';
        console.log(`${town}: ${Array.isArray(coord) ? `[${coord[0]}, ${coord[1]}]` : coord}`);
        count++;
    }
});
