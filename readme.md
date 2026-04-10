# 🧑‍💻 Austin's Resume & Portfolio

> 一个零构建工具、纯静态的个人简历网站。没有 React，没有 Next.js，没有 node_modules 黑洞——只有 HTML、CSS、JS，和一点 Python 胶水。

## ✨ 亮点

| 功能 | 实现 |
|------|------|
| 🎨 明暗主题切换 | `localStorage` + 一键切换 |
| 🤖 AI 聊天机器人 | Botpress Cloud，懒加载 iframe |
| 📬 联系表单 | Formspree，无后端也能收邮件 |
| 🔒 隐私访问控制 | URL 参数 `?code=xxx` 解锁简历下载与工作经历 |
| 🎙️ 语音自我介绍 | 点击段落即可播放 AI 生成的音频 |
| 🖼️ 作品集筛选 | Isotope 分类 + Infinite Scroll 分页加载 |

## 🤖 AI 素材来源

这个站点的素材几乎全由 AI 生成：

- **图片** — ComfyUI + Flux
- **音频** — Fish Speech
- **Logo** — ChatGPT 4o
- **聊天机器人** — Botpress

## 🏗️ 项目结构

```
├── index.html              # 线上入口（由脚本生成，勿直接编辑）
├── index_dev.html          # 开发用 HTML 壳
├── sections/               # 各区块 HTML 片段
│   ├── section-home.html
│   ├── section-about.html
│   ├── section-works.html
│   └── ...
├── create_index_html.py    # 拼接脚本：sections → index.html
├── works-2.html            # 作品集第二页（Infinite Scroll 加载）
└── assets/
    ├── css/
    ├── js/
    ├── images/
    ├── videos/
    └── audios/
```

## 🚀 开发 & 部署

```bash
# 预览（任选其一）
open index.html
python3 -m http.server

# 修改内容后，重新生成 index.html
python3 create_index_html.py
```

部署：把整站丢到任意静态托管即可（GitHub Pages / Vercel / Netlify / ...）。

## 🐛 Known Issues

- 移动端「Recent Works」下拉框样式异常
- 移动端 Load more 后图片有边影
- 暗色主题下 brand logo 过暗
- 窗口压缩时 works title 被挤压
