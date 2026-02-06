// AI 洞察分析模块 - 简化版本
let allData = null;  // 全局数据存储

async function initializeAIInsights() {
    try {
        console.log('开始加载 AI 洞察数据...');
        showLoadingIndicator(true);
        
        // 直接从文件加载数据
        const dataResponse = await fetch('data/data.json');
        if (!dataResponse.ok) {
            throw new Error(`数据文件加载失败: ${dataResponse.status}`);
        }
        
        allData = await dataResponse.json();
        
        if (!allData || allData.length === 0) {
            throw new Error('数据为空');
        }

        console.log(`✓ 成功加载 ${allData.length} 条数据，开始 AI 分析...`);
        
        // 初始化筛选器
        initializeFilters(allData);
        
        // 顺序生成各个分析模块
        generateVillageAssessment(allData);
        generateBusinessSuggestions(allData);
        generateRiskWarnings(allData);
        generateBenchmarkAnalysis(allData);
        generateDevelopmentPath(allData);
        generateInsightsSummary(allData);

        console.log('✓ AI 洞察分析完成');
        
        // 隐藏加载指示器
        setTimeout(() => showLoadingIndicator(false), 300);
        
    } catch (error) {
        console.error('AI 分析初始化失败:', error);
        showLoadingIndicator(false);
        document.body.innerHTML += `<div style="color: red; padding: 20px; text-align: center;"><h2>数据加载失败</h2><p>${error.message}</p></div>`;
    }
}

// ==================== 加载指示器 ====================
function showLoadingIndicator(show) {
    const container = document.getElementById('loadingContainer');
    if (!container) return;
    
    if (show) {
        container.classList.add('visible');
        container.classList.remove('hidden');
    } else {
        container.classList.remove('visible');
        container.classList.add('hidden');
    }
}

// ==================== 初始化筛选器 ====================
function initializeFilters(data) {
    // 更新快速统计
    updateQuickStats(data);
    
    // 获取所有唯一的区域
    const regions = new Set(data.map(v => v['县（市、区）']));
    const regionSelect = document.getElementById('regionFilter');
    
    if (regionSelect) {
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });
    }
    
    // 绑定搜索和筛选事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterAndSearch(allData, e.target.value, regionSelect?.value || '');
        });
    }
    
    if (regionSelect) {
        regionSelect.addEventListener('change', (e) => {
            filterAndSearch(allData, searchInput?.value || '', e.target.value);
        });
    }
}

// ==================== 更新快速统计 ====================
function updateQuickStats(data) {
    // 计算唯一村庄数
    const villageMap = new Map();
    data.forEach(v => {
        const key = v['行政村'];
        if (!villageMap.has(key)) {
            villageMap.set(key, true);
        }
    });
    
    const totalVillages = villageMap.size;
    const avgIncome = (data.reduce((sum, v) => sum + (parseFloat(v['2024年村集体经营性收入（万元）']) || 0), 0) / totalVillages).toFixed(1);
    const regionCount = new Set(data.map(v => v['县（市、区）'])).size;
    
    // 更新 DOM
    const totalEl = document.getElementById('totalVillages');
    const avgEl = document.getElementById('avgIncome');
    const regionEl = document.getElementById('regionCount');
    
    if (totalEl) totalEl.textContent = totalVillages;
    if (avgEl) avgEl.textContent = avgIncome + '万元';
    if (regionEl) regionEl.textContent = regionCount;
}

// ==================== 搜索和筛选 ====================
function filterAndSearch(data, searchText, region) {
    let filtered = data;
    
    // 按区域筛选
    if (region) {
        filtered = filtered.filter(v => v['县（市、区）'] === region);
    }
    
    // 按搜索文本筛选
    if (searchText) {
        const lower = searchText.toLowerCase();
        filtered = filtered.filter(v => 
            v['行政村']?.toLowerCase().includes(lower) ||
            v['县（市、区）']?.toLowerCase().includes(lower) ||
            v['乡镇（街道）']?.toLowerCase().includes(lower)
        );
    }
    
    console.log(`筛选后: ${filtered.length} 个村庄`);
    
    // 显示加载指示器
    showLoadingIndicator(true);
    
    // 延迟重新生成以显示加载动画
    setTimeout(() => {
        if (filtered.length === 0) {
            // 显示空状态提示
            const container = document.getElementById('villageAssessment');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                        <h3 style="font-size: 24px; margin-bottom: 12px;">🔍 未找到匹配的村庄</h3>
                        <p>请调整搜索条件或筛选器重试</p>
                    </div>
                `;
            }
        } else {
            generateVillageAssessment(filtered);
        }
        
        showLoadingIndicator(false);
        
        // 重新附加点击事件
        setTimeout(() => {
            attachCardClickListeners();
        }, 100);
    }, 400);
}

// ==================== 1. 村庄发展评估 ====================
function generateVillageAssessment(data) {
    const container = document.getElementById('villageAssessment');
    if (!container) return;

    try {
        const villageScores = [];
        const villageMap = new Map();

        data.forEach(village => {
            const key = village['行政村'];
            if (villageMap.has(key)) return;
            
            const businessCount = countBusinesses(village);
            const income = parseFloat(village['2024年村集体经营性收入（万元）']) || 0;
            const population = parseInt(village['常住人口(人)']) || 0;
            
            const businessScore = Math.min(businessCount * 3, 30);
            const incomeScore = Math.min(income / 10, 30);
            const populationScore = population > 500 ? 20 : (population > 200 ? 10 : 0);
            const futureBonus = village['省级未来乡村'] === '是' ? 20 : 0;
            const totalScore = businessScore + incomeScore + populationScore + futureBonus;

            villageScores.push({
                name: key,
                region: village['县（市、区）'],
                town: village['乡镇（街道）'],
                score: Math.round(totalScore),
                businessCount,
                income,
                population,
                isFutureVillage: village['省级未来乡村'] === '是'
            });
            villageMap.set(key, true);
        });

        const topVillages = villageScores.sort((a, b) => b.score - a.score).slice(0, 6);

        container.innerHTML = topVillages.map(v => {
            const scoreLevel = v.score >= 80 ? 'high' : v.score >= 60 ? 'medium' : 'low';
            const scorePercent = (v.score / 100) * 100;
            const insight = v.score >= 80 
                ? `${v.name}发展潜力强，建议继续深化运营。`
                : v.score >= 60 
                ? `${v.name}有发展基础，建议补充新业态。`
                : `${v.name}发展空间大，建议学习对标村。`;

            return `
                <div class="ai-card assessment-card score-${scoreLevel}">
                    <div class="card-header">
                        <h4>${v.name}</h4>
                        <span class="score-badge">${v.score}分</span>
                    </div>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${scorePercent}%"></div>
                    </div>
                    <div class="card-body">
                        <p><strong>所属地区:</strong> ${v.region} ${v.town}</p>
                        <p><strong>运营业态:</strong> ${v.businessCount} 种</p>
                        <p><strong>集体收入:</strong> ${v.income}万元</p>
                        <p><strong>常住人口:</strong> ${v.population}人</p>
                        ${v.isFutureVillage ? '<span class="badge-future">🌟 省级未来乡村</span>' : ''}
                    </div>
                    <div class="card-insight"><strong>洞察:</strong> ${insight}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('村庄评估失败:', error);
        container.innerHTML = `<p style="color: #ff6b6b;">数据处理失败</p>`;
    }
}

// ==================== 2. 业态发展建议 ====================
function generateBusinessSuggestions(data) {
    const container = document.getElementById('businessSuggestions');
    if (!container) return;

    try {
        const regionStats = new Map();
        const businessTypes = ['土特产', '民宿', '研学', '营地', '市集', '村咖', '电商', '文创', '物业', '康养'];
        
        data.forEach(village => {
            const region = village['县（市、区）'];
            if (!regionStats.has(region)) {
                const stat = { total: 0, businesses: {} };
                businessTypes.forEach(b => stat.businesses[b] = 0);
                regionStats.set(region, stat);
            }
            
            const stat = regionStats.get(region);
            stat.total++;
            if (village['运营业态_土特产生产销售'] === '√') stat.businesses['土特产']++;
            if (village['运营业态_民宿农家乐'] === '√') stat.businesses['民宿']++;
            if (village['运营业态_研学'] === '√') stat.businesses['研学']++;
            if (village['运营业态_营地'] === '√') stat.businesses['营地']++;
            if (village['运营业态_市集'] === '√') stat.businesses['市集']++;
            if (village['运营业态_村咖'] === '√') stat.businesses['村咖']++;
            if (village['运营业态_电商直播'] === '√') stat.businesses['电商']++;
            if (village['运营业态_文化创意'] === '√') stat.businesses['文创']++;
            if (village['运营业态_物业经济'] === '√') stat.businesses['物业']++;
            if (village['运营业态_康养'] === '√') stat.businesses['康养']++;
        });

        const suggestions = [];
        regionStats.forEach((stat, region) => {
            const percentages = Object.entries(stat.businesses)
                .map(([name, count]) => ({ name, count, pct: Math.round((count / stat.total) * 100) }))
                .sort((a, b) => b.count - a.count);

            suggestions.push({
                region,
                total: stat.total,
                strong: percentages.filter(b => b.pct >= 40).map(b => b.name).join('、') || '均衡',
                weak: percentages.filter(b => b.pct <= 20).map(b => b.name).join('、') || '无',
                top: percentages[0]
            });
        });

        container.innerHTML = suggestions.map(s => `
            <div class="ai-card suggestion-card">
                <div class="card-header">
                    <h4>${s.region}</h4>
                    <span class="village-count">${s.total}个村</span>
                </div>
                <div class="card-body">
                    <p><strong>✓ 优势业态:</strong> ${s.strong}</p>
                    <p><strong>⚡ 发展机会:</strong> ${s.weak}</p>
                    <p><strong>📊 主导业态:</strong> ${s.top.name} (${s.top.pct}%)</p>
                </div>
                <div class="card-insight"><strong>建议:</strong> ${s.weak !== '无' ? `重点发展${s.weak}业态` : '业态覆盖均衡，可打造特色品牌'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('业态建议失败:', error);
        container.innerHTML = `<p style="color: #ff6b6b;">数据处理失败</p>`;
    }
}

// ==================== 3. 运营风险预警 ====================
function generateRiskWarnings(data) {
    const container = document.getElementById('riskWarnings');
    if (!container) return;

    try {
        const lowIncome = data.filter(v => (parseFloat(v['2024年村集体经营性收入（万元）']) || 0) < 30).length;
        const popLoss = data.filter(v => {
            const current = parseInt(v['常住人口(人)']) || 0;
            const registered = parseInt(v['户籍人口(人)']) || 1;
            return current < registered * 0.7;
        }).length;
        const singleBusiness = data.filter(v => countBusinesses(v) === 1).length;

        container.innerHTML = `
            <div class="risk-item risk-high">
                <div class="risk-header">
                    <span class="risk-level">⚠️ 高风险</span>
                    <span class="risk-count">${lowIncome}个村</span>
                </div>
                <p class="risk-desc"><strong>低收入村庄:</strong> 年集体经营性收入 < 30万元</p>
                <p class="risk-suggestion">建议：优先扶持，补充新业态，加强资金政策支持</p>
            </div>
            
            <div class="risk-item risk-medium">
                <div class="risk-header">
                    <span class="risk-level">🔔 中风险</span>
                    <span class="risk-count">${popLoss}个村</span>
                </div>
                <p class="risk-desc"><strong>人口流失风险:</strong> 常住人口 < 户籍人口的70%</p>
                <p class="risk-suggestion">建议：加强产业发展，创造就业机会，改善生活条件</p>
            </div>
            
            <div class="risk-item risk-medium">
                <div class="risk-header">
                    <span class="risk-level">💡 多元化需求</span>
                    <span class="risk-count">${singleBusiness}个村</span>
                </div>
                <p class="risk-desc"><strong>单一业态村庄:</strong> 仅运营1种业态</p>
                <p class="risk-suggestion">建议：降低经营风险，引导发展互补业态</p>
            </div>
        `;
    } catch (error) {
        console.error('风险预警失败:', error);
        container.innerHTML = `<p style="color: #ff6b6b;">数据处理失败</p>`;
    }
}

// ==================== 4. 对标分析 ====================
function generateBenchmarkAnalysis(data) {
    const container = document.getElementById('benchmarkAnalysis');
    if (!container) return;

    try {
        const topVillages = data
            .filter(v => v['2024年村集体经营性收入（万元）'] > 0)
            .sort((a, b) => (parseFloat(b['2024年村集体经营性收入（万元）']) || 0) - (parseFloat(a['2024年村集体经营性收入（万元）']) || 0))
            .slice(0, 3);

        container.innerHTML = topVillages.map(v => {
            const income = parseFloat(v['2024年村集体经营性收入（万元）']) || 0;
            const population = parseInt(v['常住人口(人)']) || 0;
            const businessCount = countBusinesses(v);

            return `
                <div class="ai-card benchmark-card">
                    <div class="card-header">
                        <h4>🏆 ${v['行政村']}</h4>
                        <span class="rank-badge">标杆村</span>
                    </div>
                    <div class="card-body">
                        <div class="metric">
                            <span class="label">年集体收入</span>
                            <span class="value">${income}万元</span>
                        </div>
                        <div class="metric">
                            <span class="label">运营业态</span>
                            <span class="value">${businessCount}种</span>
                        </div>
                        <div class="metric">
                            <span class="label">常住人口</span>
                            <span class="value">${population}人</span>
                        </div>
                        <div class="metric">
                            <span class="label">所属</span>
                            <span class="value">${v['县（市、区）']} ${v['乡镇（街道）']}</span>
                        </div>
                    </div>
                    <div class="card-insight"><strong>经验:</strong> 多业态发展，可作为对标对象</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('对标分析失败:', error);
        container.innerHTML = `<p style="color: #ff6b6b;">数据处理失败</p>`;
    }
}

// ==================== 5. 发展路径推荐 ====================
function generateDevelopmentPath(data) {
    const container = document.getElementById('developmentPath');
    if (!container) return;

    try {
        const villageMap = new Map();
        const stages = { '初期': [], '成长': [], '成熟': [] };

        data.forEach(village => {
            const key = village['行政村'];
            if (villageMap.has(key)) return;

            const count = countBusinesses(village);
            let stage;
            if (count === 1) stage = '初期';
            else if (count <= 3) stage = '成长';
            else stage = '成熟';

            if (stages[stage].length < 3) {
                stages[stage].push({ name: key, count });
            }
            villageMap.set(key, true);
        });

        const total = villageMap.size;
        container.innerHTML = Object.entries(stages).map(([stage, examples]) => {
            const count = { '初期': villageMap.size / 3, '成长': villageMap.size / 3, '成熟': villageMap.size / 3 };
            return `
                <div class="ai-card development-card stage-${stage}">
                    <div class="card-header">
                        <h4>${stage}阶段</h4>
                        <span class="percentage">${Math.round(villageMap.size / 3)}个村</span>
                    </div>
                    <div class="card-body">
                        <p><strong>特征:</strong> ${stage === '初期' ? '1个业态' : stage === '成长' ? '2-3个业态' : '4个及以上业态'}</p>
                        <p><strong>示例:</strong> ${examples.map(e => e.name).join('、')}</p>
                    </div>
                    <div class="card-insight">
                        <strong>建议:</strong> ${stage === '初期' ? '确保现有业态稳定，逐步拓展新业态' : stage === '成长' ? '巩固基础，向2-3个新业态扩展' : '创新业态组合，成为区域标杆'}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('发展路径失败:', error);
        container.innerHTML = `<p style="color: #ff6b6b;">数据处理失败</p>`;
    }
}

// ==================== 6. 数据洞察总结 ====================
function generateInsightsSummary(data) {
    const container = document.getElementById('insightsSummary');
    if (!container) return;

    try {
        const villageMap = new Map();
        const businessCounts = [];
        
        data.forEach(v => {
            const key = v['行政村'];
            if (!villageMap.has(key)) {
                businessCounts.push(countBusinesses(v));
                villageMap.set(key, true);
            }
        });

        const totalVillages = villageMap.size;
        const avgIncome = data.reduce((sum, v) => sum + (parseFloat(v['2024年村集体经营性收入（万元）']) || 0), 0) / totalVillages;
        const avgPopulation = data.reduce((sum, v) => sum + (parseInt(v['常住人口(人)']) || 0), 0) / totalVillages;
        const avgBusinessCount = (businessCounts.reduce((a, b) => a + b, 0) / businessCounts.length).toFixed(1);

        const insights = [
            {
                title: '规模指标',
                items: [
                    `运营村庄总数：${totalVillages}个`,
                    `平均运营业态：${avgBusinessCount}种`,
                    `业态最多村庄：${Math.max(...businessCounts)}种`
                ]
            },
            {
                title: '收入指标',
                items: [
                    `平均集体收入：${avgIncome.toFixed(1)}万元/村`,
                    `高收入村庄(>100万)：${data.filter(v => (parseFloat(v['2024年村集体经营性收入（万元）']) || 0) > 100).length}个`,
                    `低收入村庄(<30万)：${data.filter(v => (parseFloat(v['2024年村集体经营性收入（万元）']) || 0) < 30).length}个`
                ]
            },
            {
                title: '人口指标',
                items: [
                    `平均常住人口：${avgPopulation.toFixed(0)}人/村`,
                    `人口超1000人：${data.filter(v => (parseInt(v['常住人口(人)']) || 0) > 1000).length}个村`,
                    `人口流失风险：${data.filter(v => (parseInt(v['常住人口(人)']) || 0) < (parseInt(v['户籍人口(人)']) || 1) * 0.7).length}个村`
                ]
            },
            {
                title: '政策覆盖',
                items: [
                    `省级未来乡村：${data.filter(v => v['省级未来乡村'] === '是').length}个`,
                    `历史文化村落：${data.filter(v => v['历史文化（传统）村落'] === '是').length}个`,
                    `覆盖区域：10个区县`
                ]
            }
        ];

        container.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <h3>${insight.title}</h3>
                <ul class="insight-list">
                    ${insight.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    } catch (error) {
        console.error('洞察总结失败:', error);
        container.innerHTML = `<p style="color: #ff6b6b;">数据处理失败</p>`;
    }
}

// ==================== 辅助函数 ====================
function countBusinesses(village) {
    return (village['运营业态_土特产生产销售'] === '√' ? 1 : 0) +
           (village['运营业态_民宿农家乐'] === '√' ? 1 : 0) +
           (village['运营业态_研学'] === '√' ? 1 : 0) +
           (village['运营业态_营地'] === '√' ? 1 : 0) +
           (village['运营业态_市集'] === '√' ? 1 : 0) +
           (village['运营业态_村咖'] === '√' ? 1 : 0) +
           (village['运营业态_电商直播'] === '√' ? 1 : 0) +
           (village['运营业态_文化创意'] === '√' ? 1 : 0) +
           (village['运营业态_物业经济'] === '√' ? 1 : 0) +
           (village['运营业态_康养'] === '√' ? 1 : 0);
}

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI 洞察页面开始初始化...');
    updateClock();
    setInterval(updateClock, 1000);
    initHamburgerMenu();
    initializeAIInsights();
    
    // 绑定卡片点击事件
    setTimeout(() => {
        attachCardClickListeners();
    }, 500);
});

// ==================== 卡片点击事件 ====================
function attachCardClickListeners() {
    // 为所有卡片添加点击事件
    const cards = document.querySelectorAll('.ai-card');
    cards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
            e.stopPropagation();
            // 获取卡片中的数据
            const title = this.querySelector('.card-header h4')?.textContent || '信息';
            const insightDiv = this.querySelector('.card-insight');
            const insight = insightDiv ? insightDiv.textContent.replace('洞察:', '').trim() : '';
            
            // 简单的视觉反馈 - 高亮显示
            this.classList.toggle('card-expanded');
            
            // 3秒后恢复
            setTimeout(() => {
                this.classList.remove('card-expanded');
            }, 3000);
        });
    });
    
    console.log(`已绑定 ${cards.length} 个卡片的点击事件`);
}
