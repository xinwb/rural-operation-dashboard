from flask import Flask, jsonify, send_from_directory
import os
import json

app = Flask(__name__, static_folder='.', static_url_path='')

def read_json_data():
    """从JSON文件读取数据"""
    try:
        with open('data/data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"读取JSON文件时出错: {str(e)}")
        return []

def read_json_stats():
    """从JSON文件读取统计数据"""
    try:
        with open('data/stats.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"读取统计文件时出错: {str(e)}")
        return {}

# 路由
@app.route('/')
def index():
    """返回主页面"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """提供静态文件"""
    return send_from_directory('.', filename)

@app.route('/api/data')
def get_data():
    """获取村庄数据API"""
    data = read_json_data()
    return jsonify(data)

@app.route('/api/stats')
def get_stats():
    """获取统计数据API"""
    stats = read_json_stats()
    return jsonify(stats)

# 健康检查
@app.route('/api/health')
def health():
    """健康检查端点"""
    return jsonify({
        'status': 'ok',
        'message': '服务器正常运行',
        'data_source': 'JSON文件'
    })

if __name__ == '__main__':
    print('启动乡村运营数据大屏后端服务...')
    print('数据源: data/data.json 和 data/stats.json')
    print('运行地址: http://localhost:5002')
    app.run(host='0.0.0.0', port=5002, debug=True)