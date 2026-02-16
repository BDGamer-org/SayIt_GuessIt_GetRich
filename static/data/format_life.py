import json
import re
import os

def fix_and_format(file_path):
    print(f"🧹 正在读取并整理: {file_path} ...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print("❌ 找不到文件！")
        return

    # 1. 暴力清洗：只保留核心数据结构
    # 去掉 export default
    content = re.sub(r'export default\s*', '', content)
    # 去掉注释
    content = re.sub(r'//.*', '', content)
    # 去掉末尾的分号
    content = content.strip().rstrip(';')
    
    # 修复：JSON 不允许最后一个元素带逗号 (例如: [A, B, ])，但手写经常会有
    # 这行代码把 ",]" 替换成 "]"
    content = re.sub(r',\s*]', ']', content)

    try:
        # 尝试解析
        raw_data = json.loads(content)
    except json.JSONDecodeError as e:
        print("⚠️ 文件格式有点乱，正在尝试强力修复...")
        # 如果解析失败，可能是因为还有嵌套的结构没清理干净
        # 这里我们假设它还是能被勉强解析的，如果实在不行需要更复杂的逻辑
        print(f"报错信息: {e}")
        return

    # 2. 核心逻辑：递归摊平 (Flatten)
    # 不管数据是 [A, [B, C], [D]] 还是什么样，最后都变成 [A, B, C, D]
    final_list = []

    def flatten(item):
        if isinstance(item, list):
            for sub_item in item:
                flatten(sub_item)
        elif isinstance(item, dict):
            final_list.append(item)

    if isinstance(raw_data, list):
        flatten(raw_data)
    else:
        print("❌ 数据根节点不是数组，无法处理。")
        return

    print(f"✅ 成功提取到 {len(final_list)} 个词汇。")

    # 3. 重新生成漂亮的代码
    # ensure_ascii=False 保证汉字不变成乱码 \uXXXX
    # indent=4 保证缩进整齐
    formatted_json = json.dumps(final_list, ensure_ascii=False, indent=4)

    # 拼上 JS 的头部
    js_content = "export default " + formatted_json

    # 4. 写入新文件
    output_path = "life_fixed.js"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print("=" * 30)
    print(f"🎉 修复完成！新文件已保存为: {output_path}")
    print("请打开 life_fixed.js 查看，确认无误后，删除旧文件并重命名。")
    print("=" * 30)

if __name__ == "__main__":
    # 这里改成你的文件名
    fix_and_format("life.js")