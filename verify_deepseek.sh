#!/bin/bash

# DeepSeek 集成验证脚本

echo "🔍 DeepSeek 集成验证开始..."
echo ""

# 1. 检查核心文件
echo "📋 检查核心文件..."
files=(
    "deepseek_analysis.js"
    "deepseek_analysis.html"
    "DEEPSEEK_GUIDE.md"
    "VERIFICATION.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo "✅ $file ($lines 行)"
    else
        echo "❌ $file (未找到)"
    fi
done

echo ""

# 2. 检查导航更新
echo "📍 检查导航链接更新..."
pages=("index.html" "charts.html" "ai_insights.html" "table.html" "deepseek_analysis.html")

for page in "${pages[@]}"; do
    if grep -q "deepseek_analysis.html" "$page"; then
        echo "✅ $page (已更新)"
    else
        echo "❌ $page (未更新)"
    fi
done

echo ""

# 3. 检查 API 配置
echo "🔐 检查 API 配置..."
if grep -q "sk-633ffa72aa394e4e90020f41d6033fb9" deepseek_analysis.js; then
    echo "✅ DeepSeek API Key 已配置"
else
    echo "❌ DeepSeek API Key 未配置"
fi

if grep -q "deepseek-chat" deepseek_analysis.js; then
    echo "✅ 模型名称已配置"
else
    echo "❌ 模型名称未配置"
fi

echo ""

# 4. 检查函数定义
echo "🔧 检查关键函数..."
functions=(
    "analyzeWithDeepSeek"
    "prepareDataForAnalysis"
    "buildAnalysisPrompt"
    "displayAnalysisReport"
    "formatAnalysisContent"
    "exportReport"
    "printReport"
    "copyReport"
)

for func in "${functions[@]}"; do
    if grep -q "function $func\|$func.*=.*function\|const $func.*=" deepseek_analysis.js; then
        echo "✅ $func()"
    else
        echo "❌ $func() (未找到)"
    fi
done

echo ""

# 5. 检查 HTML 元素
echo "🎨 检查 HTML 元素..."
elements=(
    "deepseekLoading"
    "analyzeBtn"
    "deepseekReport"
    "pageNavigation"
)

for elem in "${elements[@]}"; do
    if grep -q "id=\"$elem\"" deepseek_analysis.html; then
        echo "✅ #$elem"
    else
        echo "❌ #$elem (未找到)"
    fi
done

echo ""

# 6. 检查数据依赖
echo "📊 检查数据文件..."
data_files=(
    "data/data.json"
    "data/stats.json"
)

for df in "${data_files[@]}"; do
    if [ -f "$df" ]; then
        size=$(du -h "$df" | cut -f1)
        echo "✅ $df ($size)"
    else
        echo "❌ $df (未找到)"
    fi
done

echo ""

# 7. 检查导航菜单完整性
echo "🧭 检查导航菜单..."
nav_items=(
    "地图展示"
    "数据统计"
    "AI 洞察"
    "深度分析"
    "详细列表"
)

found=0
for item in "${nav_items[@]}"; do
    if grep -q "$item" deepseek_analysis.html; then
        echo "✅ $item"
        ((found++))
    else
        echo "❌ $item"
    fi
done

echo ""

# 8. 统计代码行数
echo "📈 代码统计..."
js_lines=$(wc -l < deepseek_analysis.js)
html_lines=$(wc -l < deepseek_analysis.html)
total=$((js_lines + html_lines))

echo "JavaScript: $js_lines 行"
echo "HTML: $html_lines 行"
echo "总计: $total 行"

echo ""

# 9. 最终验证
echo "✨ 最终验证结果..."
if [ $found -eq 5 ]; then
    echo "✅ 所有导航项已完整配置"
else
    echo "⚠️  部分导航项缺失 ($found/5)"
fi

echo ""
echo "✅ 验证完成！"
echo ""
echo "📖 使用指南: 查看 DEEPSEEK_GUIDE.md"
echo "🚀 访问页面: http://localhost:8000/deepseek_analysis.html"
echo ""
