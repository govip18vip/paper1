#!/usr/bin/env python3
"""
🔍 bitaigen 文章重复渲染诊断工具
运行: python find-duplicate-content.py

扫描你的 Astro 项目，找到 <Content /> 或 <slot /> 出现两次的文件
"""

import os
import re
import sys

REPO_DIR = r"G:\web\awesome-astronaut\paper\src"

def scan_for_duplicates(directory):
    """扫描所有 .astro 文件，查找 Content/slot 重复"""
    issues = []
    
    for root, dirs, files in os.walk(directory):
        # 跳过 node_modules
        dirs[:] = [d for d in dirs if d != 'node_modules' and d != '.git']
        
        for fname in files:
            if not fname.endswith('.astro'):
                continue
            
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                print(f"  ⚠️ 无法读取: {fpath} ({e})")
                continue
            
            # 查找 <Content /> 或 <Content> 出现次数
            content_tags = re.findall(r'<Content\s*/?\s*>', content)
            slot_tags = re.findall(r'<slot\s*/?\s*>', content)
            
            # 排除注释中的
            # 简单方法：去掉 HTML 注释和 Astro frontmatter 注释
            clean = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
            clean = re.sub(r'{/\*.*?\*/}', '', clean, flags=re.DOTALL)
            
            content_count = len(re.findall(r'<Content\s*/?\s*>', clean))
            slot_count = len(re.findall(r'<slot\s*/?\s*>', clean))
            
            rel_path = os.path.relpath(fpath, directory)
            
            if content_count > 1:
                issues.append({
                    'file': rel_path,
                    'type': '<Content />',
                    'count': content_count,
                    'lines': find_lines(content, r'<Content\s*/?\s*>')
                })
            
            if slot_count > 1:
                # slot 在 Layout 文件中可能有多个 named slot，只检查未命名的
                unnamed_slots = len(re.findall(r'<slot\s*/?\s*>', clean))
                if unnamed_slots > 1:
                    issues.append({
                        'file': rel_path,
                        'type': '<slot />',
                        'count': unnamed_slots,
                        'lines': find_lines(content, r'<slot\s*/?\s*>')
                    })
    
    return issues

def find_lines(content, pattern):
    """找到匹配行号"""
    lines = content.split('\n')
    matches = []
    for i, line in enumerate(lines, 1):
        if re.search(pattern, line):
            matches.append((i, line.strip()))
    return matches

def main():
    directory = REPO_DIR
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    
    if not os.path.isdir(directory):
        print(f"❌ 目录不存在: {directory}")
        print(f"   用法: python {sys.argv[0]} [src目录路径]")
        return
    
    print(f"\n🔍 扫描目录: {directory}\n")
    print("=" * 60)
    
    issues = scan_for_duplicates(directory)
    
    if not issues:
        print("✅ 未发现 Content/slot 重复渲染问题")
    else:
        print(f"🚨 发现 {len(issues)} 个文件有重复渲染!\n")
        for issue in issues:
            print(f"  📄 {issue['file']}")
            print(f"     {issue['type']} 出现了 {issue['count']} 次")
            for line_no, line_text in issue['lines']:
                print(f"     行 {line_no}: {line_text[:80]}")
            print()
        
        print("=" * 60)
        print("\n🔧 修复方法:")
        print("   1. 打开上述文件")
        print("   2. 找到第二个 <Content /> 或 <slot />")
        print("   3. 删除它 (保留第一个)")
        print("   4. npm run dev 验证")
    
    # 额外检查：viewport meta
    print("\n" + "=" * 60)
    print("🔍 检查 viewport meta...\n")
    
    found_viewport = False
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d != 'node_modules']
        for fname in files:
            if not fname.endswith('.astro'):
                continue
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'viewport' in content.lower():
                    rel = os.path.relpath(fpath, directory)
                    if 'width=device-width' in content:
                        print(f"  ✅ {rel} — viewport 设置正确")
                        found_viewport = True
                    elif 'viewport' in content:
                        print(f"  ⚠️ {rel} — 有viewport但可能不完整")
                        found_viewport = True
            except:
                pass
    
    if not found_viewport:
        print("  ❌ 未找到 viewport meta 设置!")
        print("     需要在 <head> 中添加:")
        print('     <meta name="viewport" content="width=device-width, initial-scale=1.0" />')
    
    print()

if __name__ == "__main__":
    main()
