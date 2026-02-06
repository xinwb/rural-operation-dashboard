// DeepSeek API 集成 - 深度数据分析模块

const DEEPSEEK_API_KEY = 'sk-633ffa72aa394e4e90020f41d6033fb9';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 分析状态管理
let analysisInProgress = false;
let analysisCache = null;

/**
 * 调用 DeepSeek API 进行数据分析
 */
async function analyzeWithDeepSeek(dataPayload) {
    try {
        if (analysisInProgress) {
            console.warn('分析正在进行中，请稍候...');
            return analysisCache;
        }

        analysisInProgress = true;
        showAnalysisLoading(true);

        // 构建分析提示词
        const prompt = buildAnalysisPrompt(dataPayload);

        console.log('正在调用 DeepSeek API 进行深度分析...');

        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: '你是一位资深的乡村运营数据分析专家。你需要根据提供的数据进行深入分析，提供详细的洞察和建议。分析应该从多个维度考虑，包括经济效益、可持续发展、区域特色等。所有数字需要准确，分析需要基于数据事实。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API 错误: ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        const analysisResult = result.choices[0].message.content;

        analysisCache = {
            timestamp: new Date().toISOString(),
            content: analysisResult,
            dataPoints: dataPayload.summary
        };

        console.log('✓ DeepSeek 分析完成');
        analysisInProgress = false;
        showAnalysisLoading(false);

        return analysisCache;

    } catch (error) {
        console.error('DeepSeek 分析失败:', error);
        analysisInProgress = false;
        showAnalysisLoading(false);
        showAnalysisError(error.message);
        return null;
    }
}

/**
 * 构建分析提示词
 */
function buildAnalysisPrompt(dataPayload) {
    const {
        villages,
        regionStats,
        businessStats,
        summary,
        topPerformers,
        riskAreas
    } = dataPayload;

    return `
请对以下杭州市乡村运营数据进行深入分析，并提供详细的分析报告：

【数据概览】
- 总村庄数：${summary.totalVillages}
- 覆盖区域数：${summary.regions}
- 平均集体收入：${summary.avgIncome}万元
- 运营业态数：${summary.businessTypes}

【区域统计】
${Object.entries(regionStats).map(([region, stats]) => 
    `- ${region}: ${stats.villages}个村庄，平均收入${stats.avgIncome}万元，${stats.businessCount}个业态`
).join('\n')}

【业态分布】
${Object.entries(businessStats).map(([business, count]) => 
    `- ${business}: ${count}个村庄运营（占比${((count/summary.totalVillages)*100).toFixed(1)}%）`
).join('\n')}

【标杆村庄（Top 5）】
${topPerformers.map((v, i) => 
    `${i+1}. ${v.name}（${v.region}）- 收入${v.income}万元，运营${v.businessCount}个业态`
).join('\n')}

【风险预警】
${riskAreas.map(risk => 
    `- ${risk.category}: ${risk.count}个村庄（${risk.description}）`
).join('\n')}

请根据这些数据提供以下方面的深入分析：

1. **整体发展态势**
   - 总体运营状况评估
   - 与往年或同类地区的对标分析
   - 主要发展趋势和机遇

2. **区域差异分析**
   - 各区域发展不均衡的原因
   - 先进区域的经验总结
   - 落后区域的短板分析和改进建议

3. **业态结构优化**
   - 当前业态结构的合理性评估
   - 推荐的业态组合方案
   - 差异化发展路径建议

4. **收入提升路径**
   - 增收的关键驱动因素
   - 高收入村庄的成功经验
   - 具体的增收措施和时间表

5. **风险管理与防控**
   - 识别的主要风险
   - 风险的影响评估
   - 防控和应对措施

6. **创新发展建议**
   - 新兴业态的引入机会
   - 数字经济融合的可能性
   - 品牌建设和营销策略

请提供专业、详细、可操作的分析报告，包含具体的数据支撑和实施建议。
`;
}

/**
 * 生成分析报告页面
 */
function displayAnalysisReport(analysis) {
    if (!analysis) {
        console.error('没有分析结果');
        return;
    }

    const reportContainer = document.getElementById('deepseekReport');
    if (!reportContainer) {
        console.warn('未找到报告容器');
        return;
    }

    // 清空旧报告
    reportContainer.innerHTML = '';

    // 创建报告标题
    const header = document.createElement('div');
    header.className = 'report-header';
    header.innerHTML = `
        <div class="report-title">
            <h2>🤖 DeepSeek 深度分析报告</h2>
            <p class="report-meta">生成时间：${new Date(analysis.timestamp).toLocaleString('zh-CN')}</p>
        </div>
    `;

    // 创建报告内容
    const content = document.createElement('div');
    content.className = 'report-content';
    
    // 处理 Markdown 格式的内容
    const formattedContent = formatAnalysisContent(analysis.content);
    content.innerHTML = formattedContent;

    // 创建报告底部（操作按钮）
    const footer = document.createElement('div');
    footer.className = 'report-footer';
    footer.innerHTML = `
        <button class="report-btn" onclick="exportReport()">📥 导出报告</button>
        <button class="report-btn" onclick="copyReport()">📋 复制全文</button>
        <button class="report-btn" onclick="printReport()">🖨️ 打印报告</button>
    `;

    // 组装报告
    reportContainer.appendChild(header);
    reportContainer.appendChild(content);
    reportContainer.appendChild(footer);

    // 滚动到报告位置
    setTimeout(() => {
        reportContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);

    console.log('✓ 分析报告已展示');
}

/**
 * 格式化分析内容（支持 Markdown）
 */
function formatAnalysisContent(content) {
    // 转义 HTML 特殊字符
    let formatted = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // 处理标题
    formatted = formatted.replace(/^### (.*?)$/gm, '<h3 class="report-h3">$1</h3>');
    formatted = formatted.replace(/^## (.*?)$/gm, '<h2 class="report-h2">$1</h2>');
    formatted = formatted.replace(/^# (.*?)$/gm, '<h1 class="report-h1">$1</h1>');

    // 处理粗体
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // 处理斜体
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');

    // 处理列表
    formatted = formatted.replace(/^\- (.*?)$/gm, '<li class="report-li">$1</li>');
    formatted = formatted.replace(/^\* (.*?)$/gm, '<li class="report-li">$1</li>');
    formatted = formatted.replace(/^(\d+)\. (.*?)$/gm, '<li class="report-li">$2</li>');

    // 处理段落
    formatted = formatted
        .split('\n\n')
        .map(p => {
            if (p.trim().startsWith('<h') || p.trim().startsWith('<li')) {
                return p;
            }
            return `<p class="report-p">${p.trim()}</p>`;
        })
        .join('\n');

    // 处理换行
    formatted = formatted.replace(/\n/g, '<br>');

    // 处理数字高亮
    formatted = formatted.replace(/(\d+(?:\.\d+)?%?)/g, '<span class="number-highlight">$1</span>');

    return `<div class="report-text">${formatted}</div>`;
}

/**
 * 导出报告为 PDF
 */
function exportReport() {
    const reportContent = document.getElementById('deepseekReport').innerText;
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `深度分析报告_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('✓ 报告已导出');
}

/**
 * 复制报告
 */
function copyReport() {
    const reportContent = document.getElementById('deepseekReport').innerText;
    navigator.clipboard.writeText(reportContent).then(() => {
        alert('✓ 报告内容已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
    });
}

/**
 * 打印报告
 */
function printReport() {
    const reportContent = document.getElementById('deepseekReport').innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>DeepSeek 深度分析报告</title>
            <style>
                body { font-family: 'SimSun', serif; line-height: 1.8; margin: 20px; }
                h1, h2, h3 { color: #333; }
                p { text-align: justify; }
            </style>
        </head>
        <body>
            ${reportContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

/**
 * 显示加载状态
 */
function showAnalysisLoading(show) {
    const loader = document.getElementById('deepseekLoading');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

/**
 * 显示错误信息
 */
function showAnalysisError(message) {
    const reportContainer = document.getElementById('deepseekReport');
    if (reportContainer) {
        reportContainer.innerHTML = `
            <div class="error-message">
                <h3>❌ 分析失败</h3>
                <p>${message}</p>
                <p>请检查：</p>
                <ul>
                    <li>网络连接是否正常</li>
                    <li>DeepSeek API Key 是否有效</li>
                    <li>API 配额是否充足</li>
                </ul>
            </div>
        `;
    }
}

/**
 * 准备数据用于深度分析
 */
function prepareDataForAnalysis(villages) {
    if (!villages || villages.length === 0) {
        console.warn('没有可用的村庄数据');
        return null;
    }

    // 计算基本统计
    const villageMap = new Map();
    const regionStats = {};
    const businessStats = {};
    let totalIncome = 0;

    villages.forEach(v => {
        const region = v['县（市、区）'] || '未知';
        const village = v['行政村'];
        
        // 去重
        if (villageMap.has(village)) return;
        villageMap.set(village, true);

        // 区域统计
        if (!regionStats[region]) {
            regionStats[region] = { villages: 0, totalIncome: 0, businessCount: 0 };
        }
        regionStats[region].villages++;
        const income = parseFloat(v['2024年村集体经营性收入（万元）']) || 0;
        regionStats[region].totalIncome += income;
        totalIncome += income;

        // 业态统计
        const businessCount = countBusinesses(v);
        regionStats[region].businessCount += businessCount;

        // 业态明细
        const businessTypes = ['土特产生产销售', '民宿农家乐', '研学', '营地', '市集', 
                              '村咖', '电商直播', '文化创意', '物业经济', '康养'];
        businessTypes.forEach(business => {
            const key = `运营业态_${business}`;
            if (v[key] === '√') {
                businessStats[business] = (businessStats[business] || 0) + 1;
            }
        });
    });

    // 计算平均值
    Object.keys(regionStats).forEach(region => {
        const stats = regionStats[region];
        stats.avgIncome = (stats.totalIncome / stats.villages).toFixed(1);
    });

    const totalVillages = villageMap.size;
    const avgIncome = (totalIncome / totalVillages).toFixed(1);

    // 找出标杆村庄
    const topPerformers = villages
        .filter(v => !villageMap.has(v['行政村']) || villageMap.has(v['行政村']))
        .map(v => ({
            name: v['行政村'],
            region: v['县（市、区）'],
            income: parseFloat(v['2024年村集体经营性收入（万元）']) || 0,
            businessCount: countBusinesses(v)
        }))
        .sort((a, b) => b.income - a.income)
        .slice(0, 5);

    // 识别风险区域
    const riskAreas = [];
    const lowIncomeCount = villages.filter(v => (parseFloat(v['2024年村集体经营性收入（万元）']) || 0) < 30).length;
    const singleBusinessCount = villages.filter(v => countBusinesses(v) === 1).length;
    const popLossCount = villages.filter(v => {
        const current = parseInt(v['常住人口(人)']) || 0;
        const registered = parseInt(v['户籍人口(人)']) || 1;
        return current < registered * 0.7;
    }).length;

    if (lowIncomeCount > 0) {
        riskAreas.push({
            category: '低收入风险',
            count: lowIncomeCount,
            description: '年集体经营性收入 < 30万元'
        });
    }
    if (singleBusinessCount > 0) {
        riskAreas.push({
            category: '单一业态',
            count: singleBusinessCount,
            description: '仅运营1种业态，抗风险能力弱'
        });
    }
    if (popLossCount > 0) {
        riskAreas.push({
            category: '人口流失',
            count: popLossCount,
            description: '常住人口 < 户籍人口的70%'
        });
    }

    return {
        villages: villages.slice(0, 10), // 样本数据
        regionStats,
        businessStats,
        summary: {
            totalVillages,
            regions: Object.keys(regionStats).length,
            avgIncome,
            businessTypes: Object.keys(businessStats).length
        },
        topPerformers,
        riskAreas
    };
}

/**
 * 辅助函数：计算村庄业态数
 */
function countBusinesses(village) {
    const businessKeys = [
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
    return businessKeys.filter(key => village[key] === '√').length;
}

// 导出函数
window.performDeepSeekAnalysis = async function(villages) {
    const dataPayload = prepareDataForAnalysis(villages);
    if (!dataPayload) {
        alert('数据准备失败');
        return;
    }
    
    const analysis = await analyzeWithDeepSeek(dataPayload);
    if (analysis) {
        displayAnalysisReport(analysis);
    }
};
