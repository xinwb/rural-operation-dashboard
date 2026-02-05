#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
处理乡村运营 Excel 数据并生成 JSON 文件
"""

import pandas as pd
import json
from datetime import datetime

def process_excel_data(excel_path):
    """读取并处理 Excel 数据"""
    # 读取Excel，跳过前4行表头
    df = pd.read_excel(excel_path, skiprows=4)
    
    # 删除第一行（可能是空行）
    df = df[df['县（市、区）'].notna()]
    
    # 重命名关键列，保持中文列名
    column_mapping = {
        'Unnamed: 0': '序号',
        '县（市、区）': '所属区域',
        '乡镇（街道）': '乡镇街道',
        '行政村': '村庄名称',
        '城区距离（公里）': '城区距离',
        '车程（分钟）': '车程',
        '户籍人口(人)': '户籍人口',
        '常住人口(人)': '常住人口',
        '2024年村集体经营性收入（万元）': '村集体收入',
        '省级未来乡村': '未来乡村',
        '历史文化（传统）村落': '历史文化村落',
        '重点村组团片区': '重点片区',
        '村党组织书记姓名': '书记姓名',
        '联系电话': '联系电话',
        '运营主体名称': '运营主体',
        '运营主体是否聘有乡村运营职业经理人': '有职业经理人',
        '职业经理人联系电话': '经理人电话',
        '主体性质': '主体性质',
        '固定租金': '租金模式_固定',
        '保底+分红': '租金模式_保底分红',
        '纯分红': '租金模式_纯分红',
        '整村运营': '运营模式_整村',
        '单一项目（业态）运营': '运营模式_单项',
        '土特产生产销售': '业态_土特产',
        '民宿\n农家乐': '业态_民宿',
        '研学': '业态_研学',
        '营地': '业态_营地',
        '康养': '业态_康养',
        '市集': '业态_市集',
        '村咖': '业态_村咖',
        '电商直播': '业态_电商',
        '文化创意': '业态_文创',
        '物业经济': '业态_物业',
        '开始运营时间': '开始时间',
        '年均为村集体带来收入（万元）': '年均收入',
        '吸纳当地村民就业创业人数（人）': '就业人数',
        '盘活资源宗数（宗）': '盘活资源数',
        '引进提升业态数量（个）': '业态数量',
        '吸引入乡青年数（人）': '入乡青年数',
        '举办活动场数（场次）': '活动场数'
    }
    
    # 只保留需要的列
    df = df.rename(columns=column_mapping)
    
    # 选择核心列
    core_columns = ['序号', '所属区域', '乡镇街道', '村庄名称', '城区距离', '车程',
                   '户籍人口', '常住人口', '村集体收入', '未来乡村', '历史文化村落',
                   '重点片区', '书记姓名', '联系电话', '运营主体', '有职业经理人',
                   '经理人电话', '主体性质', '租金模式_固定', '租金模式_保底分红',
                   '租金模式_纯分红', '运营模式_整村', '运营模式_单项',
                   '业态_土特产', '业态_民宿', '业态_研学', '业态_营地', '业态_康养',
                   '业态_市集', '业态_村咖', '业态_电商', '业态_文创', '业态_物业',
                   '开始时间', '年均收入', '就业人数', '盘活资源数', '业态数量',
                   '入乡青年数', '活动场数']
    
    # 只保留存在的列
    available_columns = [col for col in core_columns if col in df.columns]
    df = df[available_columns]
    
    # 处理缺失值
    df = df.fillna('')
    
    # 转换为字典列表
    data_list = df.to_dict('records')
    
    # 清理数据
    cleaned_data = []
    for record in data_list:
        cleaned_record = {}
        for key, value in record.items():
            # 转换数值类型
            if isinstance(value, (int, float)):
                if pd.isna(value):
                    cleaned_record[key] = None
                else:
                    cleaned_record[key] = value
            else:
                cleaned_record[key] = str(value).strip()
        cleaned_data.append(cleaned_record)
    
    return cleaned_data

def generate_stats(data):
    """生成统计数据"""
    if not data:
        return {}
    
    # 统计总数
    total_villages = len(data)
    
    # 统计区域分布
    regions = {}
    for item in data:
        region = item.get('所属区域', '')
        if region:
            regions[region] = regions.get(region, 0) + 1
    
    # 统计运营主体性质
    subject_types = {}
    for item in data:
        subject_type = item.get('主体性质', '')
        if subject_type:
            subject_types[subject_type] = subject_types.get(subject_type, 0) + 1
    
    # 统计业态类型
    business_types = {
        '土特产': 0,
        '民宿': 0,
        '研学': 0,
        '营地': 0,
        '康养': 0,
        '市集': 0,
        '村咖': 0,
        '电商直播': 0,
        '文创': 0,
        '物业': 0
    }
    
    for item in data:
        if item.get('业态_土特产'): business_types['土特产'] += 1
        if item.get('业态_民宿'): business_types['民宿'] += 1
        if item.get('业态_研学'): business_types['研学'] += 1
        if item.get('业态_营地'): business_types['营地'] += 1
        if item.get('业态_康养'): business_types['康养'] += 1
        if item.get('业态_市集'): business_types['市集'] += 1
        if item.get('业态_村咖'): business_types['村咖'] += 1
        if item.get('业态_电商'): business_types['电商直播'] += 1
        if item.get('业态_文创'): business_types['文创'] += 1
        if item.get('业态_物业'): business_types['物业'] += 1
    
    # 获取最多的业态
    top_business = max(business_types.items(), key=lambda x: x[1])[0] if business_types else '未知'
    
    return {
        'total_villages': total_villages,
        'regions_count': len(regions),
        'regions': regions,
        'subject_types': subject_types,
        'business_types': business_types,
        'top_business_type': top_business,
        'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

if __name__ == '__main__':
    excel_path = 'data/0501（汇总）乡村运营行政村信息表(已开展运营).xls'
    
    print('正在读取 Excel 文件...')
    data = process_excel_data(excel_path)
    
    print(f'成功读取 {len(data)} 条数据')
    
    # 保存数据
    with open('data/data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('已保存到 data/data.json')
    
    # 生成并保存统计数据
    stats = generate_stats(data)
    with open('data/stats.json', 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print('已保存统计数据到 data/stats.json')
    
    print('\n统计信息:')
    print(f'  总村庄数: {stats["total_villages"]}')
    print(f'  覆盖区域数: {stats["regions_count"]}')
    print(f'  主要业态: {stats["top_business_type"]}')
    print(f'  更新时间: {stats["update_time"]}')
