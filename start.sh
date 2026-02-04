#!/bin/bash

# 启动乡村运营数据大屏展示系统

echo "正在启动乡村运营数据大屏展示系统..."

# 检查Python依赖
echo "检查Python依赖..."
python3 -c "import flask, pandas, openpyxl, xlrd" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "缺少必要的Python包，正在安装..."
    pip3 install flask pandas openpyxl xlrd
    if [ $? -ne 0 ]; then
        echo "安装Python包失败，请手动安装: pip3 install flask pandas openpyxl xlrd"
        exit 1
    fi
fi

# 检查Excel文件是否存在
EXCEL_FILE="/Users/wubin/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wubin010745_34d6/msg/file/2026-01/0501（汇总）乡村运营行政村信息表(已开展运营).xls"
if [ ! -f "$EXCEL_FILE" ]; then
    echo "警告: Excel文件不存在: $EXCEL_FILE"
    echo "请确认文件路径是否正确"
else
    echo "找到Excel文件: $EXCEL_FILE"
fi

# 启动服务器
echo "正在启动服务器..."
python3 server.py