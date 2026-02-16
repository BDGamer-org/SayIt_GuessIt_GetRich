import json
import re
import os

def check_vocabulary(file_path):
    print(f"正在检查文件: {file_path} ...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print("❌ 错误: 找不到文件，请确认路径是否正确。")
        return

    # --- 核心修复区域 ---
    
    # 1. 去掉 'export default'
    content = re.sub(r'export default\s*', '', content)
    
    # 2. 【新增】去掉所有以 // 开头的注释
    content = re.sub(r'//.*', '', content)
    
    # 3. 去掉末尾分号和多余空白
    content = content.strip().rstrip(';')

    # 4. 【容错】尝试修复常见的"多余逗号"问题 (比如 },])
    # JSON 不允许最后一个元素后面有逗号，但 JS 允许
    content = re.sub(r',\s*]', ']', content) 
    
    # --- 修复结束 ---

    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        print("\n❌ 解析失败！脚本没能处理掉某些格式问题。")
        print(f"报错位置: line {e.lineno} column {e.colno}")
        print(f"报错详情: {e}")
        # 把报错附近的内容打印出来给你看
        lines = content.split('\n')
        if 0 <= e.lineno - 1 < len(lines):
            print(f"问题可能出在这行附近: {lines[e.lineno - 1].strip()}")
        return

    # 下面是正常的检查逻辑
    word_map = {}
    id_map = {}
    suspicious = []
    
    total_count = len(data)
    
    for item in data:
        word = item.get('word', '').strip()
        wid = item.get('word_id')

        if word in word_map:
            word_map[word].append(wid)
        else:
            word_map[word] = [wid]

        if wid in id_map:
            id_map[wid].append(word)
        else:
            id_map[wid] = [word]

        issues = []
        if len(word) > 6: # 放宽一点点标准到6
            issues.append("太长")
        
        # 检查是否包含非法字符 (保留汉字、英文字母、数字)
        # 这一行排除了标点符号
        if not re.match(r'^[\u4e00-\u9fa5a-zA-Z0-9]+$', word):
            issues.append("含特殊字符")
            
        if issues:
            suspicious.append(f"{word} ({wid}): {', '.join(issues)}")

    print("-" * 30)
    print(f"📊 检查完成! 共扫描 {total_count} 个词")
    print("-" * 30)

    duplicates = {k: v for k, v in word_map.items() if len(v) > 1}
    if duplicates:
        print(f"\n🚫 发现 {len(duplicates)} 个重复词汇:")
        for word, ids in duplicates.items():
            print(f"  - '{word}' 出现了 {len(ids)} 次 (IDs: {ids})")
    else:
        print("\n✅ 词汇无重复。")

    id_dups = {k: v for k, v in id_map.items() if len(v) > 1}
    if id_dups:
        print(f"\n🚫 发现 {len(id_dups)} 个重复 ID (这会导致Bug):")
        for wid, words in id_dups.items():
            print(f"  - ID {wid} 冲突: {words}")
    else:
        print("\n✅ ID 无冲突。")

    if suspicious:
        print(f"\n⚠️ 发现 {len(suspicious)} 个可能不规范的词:")
        for item in suspicious:
            print(f"  - {item}")
    else:
        print("\n✅ 所有词汇格式规范。")

if __name__ == "__main__":
    # 记得改成你的真实文件名
    check_vocabulary("life_fixed.js")