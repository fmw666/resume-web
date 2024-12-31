"""
开发时，分块进行开发，最后再合并
将多个 html 组合为一个 index.html 文件
"""

sections = ["home", "about", "services", "experience", "works", "blog", "contact"]


specified_row = '<main class="content light" id="main">'

# 先把 sections 拼接起来
content = ""
for section in sections:
    with open(f"sections/section-{section}.html", "r", encoding="utf-8") as f:
        content += f"{f.read()}\n"

# print(content)

with open("index_dev.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

with open("index.html", "w", encoding="utf-8") as f:
    # 找到指定的行
    for i, line in enumerate(lines):
        if specified_row in line:
            break

    # 写入内容
    lines.insert(i+1, content)

    # 写入文件
    f.writelines(lines)

print("index.html 已生成")

