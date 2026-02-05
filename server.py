from flask import Flask, jsonify, render_template_string, send_from_directory
import pandas as pd
import os
import sys
import json

app = Flask(__name__)

# Excel文件路径和 JSON 文件路径
EXCEL_FILE_PATH = "/Users/wubin/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wubin010745_34d6/msg/file/2026-01/0501（汇总）乡村运营行政村信息表(已开展运营).xls"
DATA_JSON_PATH = "data/data.json"
STATS_JSON_PATH = "data/stats.json"

def read_excel_data():
    """读取Excel文件中的数据"""
    try:
        # 读取Excel文件
        df = pd.read_excel(EXCEL_FILE_PATH, sheet_name=0)  # 读取第一个工作表
        
        # 将DataFrame转换为字典列表
        data = df.to_dict('records')
        
        # 处理数据，确保所有值都是字符串或其他JSON序列化友好的类型
        processed_data = []
        for record in data:
            processed_record = {}
            for key, value in record.items():
                # 将NaN值替换为None
                if pd.isna(value):
                    processed_record[key] = None
                else:
                    processed_record[key] = value
            processed_data.append(processed_record)
        
        return processed_data
    except Exception as e:
        print(f"读取Excel文件时出错: {str(e)}", file=sys.stderr)
        return []

@app.route('/')
def index():
    """返回主页面"""
    with open('index.html', 'r', encoding='utf-8') as f:
        template = f.read()
    return render_template_string(template)

@app.route('/data/<path:filename>')
def serve_data(filename):
    """提供 data 目录下的文件"""
    return send_from_directory('data', filename)

@app.route('/script.js')
def serve_script():
    """提供 script.js"""
    return send_from_directory('.', 'script.js')

@app.route('/styles.css')
def serve_styles():
    """提供 styles.css"""
    return send_from_directory('.', 'styles.css')

@app.route('/api/data')
def get_data():
    """API端点，返回JSON数据"""
    try:
        # 优先使用 JSON 文件
        if os.path.exists(DATA_JSON_PATH):
            with open(DATA_JSON_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return jsonify(data)
        else:
            # 回退到读取 Excel
            data = read_excel_data()
            return jsonify(data)
    except Exception as e:
        print(f"读取数据时出错: {str(e)}", file=sys.stderr)
        return jsonify([])

@app.route('/api/stats')
def get_stats():
    """API端点，返回统计数据"""
    try:
        # 优先使用 JSON 文件
        if os.path.exists(STATS_JSON_PATH):
            with open(STATS_JSON_PATH, 'r', encoding='utf-8') as f:
                stats = json.load(f)
            return jsonify(stats)
        else:
            # 回退到动态计算
            return calculate_stats()
    except Exception as e:
        print(f"读取统计数据时出错: {str(e)}", file=sys.stderr)
        return jsonify({
            'total_villages': 0,
            'regions_count': 0,
            'business_types': {},
            'update_rate': '0%'
        })

def calculate_stats():
    """动态计算统计数据"""
    data = read_excel_data()
    
    if not data:
        return jsonify({
            'total_villages': 0,
            'regions_count': 0,
            'operation_types': {},
            'update_rate': '0%'
        })
    
    # 计算统计信息
    total_villages = len(data)
    
    # 计算区域数量（假设有一列叫"区域"或类似名称）
    regions = set()
    operation_types = {}
    
    # 查找可能表示区域的列名
    region_column = None
    operation_column = None
    status_column = None
    
    for record in data:
        for key in record.keys():
            key_lower = key.lower()
            if '区域' in key or '地区' in key or '区' in key:
                region_column = key
            if '运营' in key or '类型' in key or '模式' in key:
                operation_column = key
            if '状态' in key or '运营状态' in key:
                status_column = key
    
    # 统计区域
    if region_column:
        for record in data:
            if record.get(region_column):
                regions.add(str(record[region_column]))
    
    # 统计运营类型
    if operation_column:
        for record in data:
            op_type = record.get(operation_column)
            if op_type:
                op_str = str(op_type)
                operation_types[op_str] = operation_types.get(op_str, 0) + 1
    
    # 计算运营状态比例
    operational_count = 0
    if status_column:
        for record in data:
            status = record.get(status_column)
            if status and ('运营' in str(status) or '正常' in str(status) or 'active' in str(status).lower()):
                operational_count += 1
    
    update_rate = f"{int((operational_count / total_villages) * 100) if total_villages > 0 else 0}%"
    
    stats = {
        'total_villages': total_villages,
        'regions_count': len(regions),
        'operation_types': operation_types,
        'update_rate': update_rate,
        'top_operation_type': max(operation_types, key=operation_types.get) if operation_types else None
    }
    
    return jsonify(stats)

if __name__ == '__main__':
    # 检查Excel文件是否存在
    if not os.path.exists(EXCEL_FILE_PATH):
        print(f"警告: Excel文件不存在: {EXCEL_FILE_PATH}")
        print("请确认文件路径是否正确")
    else:
        print(f"找到Excel文件: {EXCEL_FILE_PATH}")
        print("正在启动服务器...")
    
    app.run(debug=True, host='0.0.0.0', port=5002)