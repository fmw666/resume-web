# 🧑‍💻 Austin's Resume & Portfolio

> 一个基于 **Vite** 的模块化个人简历站。所有区块独立开发、按需加载，
> 兼顾极致性能与原有动画效果的完全保留。

## ✨ 亮点

| 功能 | 实现 |
|------|------|
| 🎨 明暗主题切换 | `localStorage` + 一键切换 |
| 🤖 AI 聊天机器人 | Botpress Cloud，`requestIdleCallback` 懒加载 iframe |
| 📬 联系表单 | Formspree + 1000hz bootstrap-validator |
| 🔒 隐私访问控制 | URL 参数 `?code=xxx` 解锁简历下载与工作经历 |
| 🎙️ 语音自我介绍 | 点击段落即可播放 AI 生成的音频 |
| 🖼️ 作品集筛选 | Isotope 分类 + Infinite Scroll 分页加载（**首屏不加载，滚动时才懒载入**） |
| 🎞️ Demo 全屏查看器 | 原生 JS 实现的 Arc 缩略图面板 / 键盘导航 |

## 🤖 AI 素材来源

站点的素材大多由 AI 生成：

- **图片** — ComfyUI + Flux
- **音频** — Fish Speech
- **Logo** — ChatGPT 4o
- **聊天机器人** — Botpress

## 🏗️ 项目结构

```
├── index.html              # Vite 入口（HTML 壳，不要在此拼装 sections）
├── vite.config.js          # Vite 配置（output=dist, assetsDir=app）
├── package.json            # npm 依赖、scripts
├── src/
│   ├── main.js             # 应用入口：按序组装所有模块
│   ├── modules/            # 业务模块（每个职责独立，便于维护）
│   │   ├── jquery-global.js        # 把 jQuery 暴露到 window.$
│   │   ├── sections.js             # HTML partials 注入
│   │   ├── theme.js                # 主题切换
│   │   ├── preloader.js            # 预加载动画
│   │   ├── navigation.js           # 菜单 / 平滑滚动 / scrollspy / 回到顶部
│   │   ├── animations.js           # WOW / Morphext / Parallax / Counterup / Skill bar
│   │   ├── self-intro.js           # About 音频
│   │   ├── portfolio.js            # Isotope + MagnificPopup + InfiniteScroll（懒加载）
│   │   ├── testimonials.js         # Slick 轮播（懒加载）
│   │   ├── contact.js              # Formspree 提交 + validator
│   │   ├── chatbot.js              # Botpress iframe 懒加载
│   │   ├── privacy.js              # URL ?code= 控制
│   │   ├── demo-viewer.js          # Projects 全屏查看器
│   │   ├── demos-data.js           # Demo 数据
│   │   └── vendor-loader.js        # 按序注入 vendor <script>
│   └── sections/           # 各区块 HTML 片段（通过 ?raw 导入为字符串）
│       ├── home.html
│       ├── about.html
│       ├── services.html
│       ├── experience.html
│       ├── works.html
│       ├── works-page-2.html       # 作品集第二页（懒加载）
│       ├── projects.html
│       ├── blog.html
│       ├── contact.html
│       ├── testimonials.html        # 备用区块，当前未挂载
│       └── price.html               # 备用区块，当前未挂载
├── public/
│   └── assets/             # 原样发布的静态资源（css / js / images / videos / fonts）
│       ├── css/
│       ├── js/             # 老版 jQuery 插件（保持原版本以零回归）
│       ├── images/
│       ├── videos/
│       └── audios/
└── scripts/
    └── smoke-test*.mjs     # Puppeteer 冒烟测试
```

### 模块化策略

- **section 独立**：每个区块是一个 `.html` 文件，通过 Vite 的 `?raw` 在构建期作为字符串
  导入，然后由 `src/modules/sections.js` 按数组顺序注入 `<main id="main">`。改区块完全
  不会影响其他区块。想加新页面？把一个新模块接入 `main.js` 即可。
- **动画零回归**：Morphext / WOW / Parallax / Counterup / Waypoints / Isotope / Slick /
  MagnificPopup / infinite-scroll 等老 jQuery 插件**保留原文件**在 `public/assets/js/`，
  通过 `vendor-loader` 按需动态注入。`npm` 只锁 `jquery@1.12.4` 作为 ES 模块的全局桥接。
- **懒加载**：`Portfolio` 和 `Testimonials` 模块用 `IntersectionObserver` 监听目标区块，
  只有真的滚到附近时才下载对应的重量级插件（Isotope / MagnificPopup / InfiniteScroll /
  Slick），首屏显著变轻。
- **Chatbot**：用 `requestIdleCallback` 延后创建 Botpress iframe，避免阻塞首屏。
- **资源指纹**：Vite 自动为 JS 加上内容 hash 文件名，再不用手动写 `?v=20260410`。

## 🚀 开发 & 部署

```bash
# 1. 安装依赖
npm install

# 2. 本地开发（HMR 热更新）
npm run dev   # -> http://localhost:5173

# 3. 打包生产产物
npm run build

# 4. 预览生产产物
npm run preview  # -> http://localhost:4173
```

### 部署

`npm run build` 会把所有静态文件（带 hash）产出到 `dist/`。直接把 `dist/` 目录部署到任意
静态托管即可（GitHub Pages / Vercel / Netlify / Cloudflare Pages / …）。

`vite.config.js` 里 `base: './'` 保证部署到子路径也能工作。

## ✅ 测试 & 质量门控

本地一键跑全部检查：

```bash
npm test            # = test:static + test:smoke（任一失败 → exit 1）
npm run test:static # 纯静态结构检查，不启动浏览器
npm run test:smoke  # build + preview + Puppeteer 端到端冒烟（带退出码）
```

| 层级 | 脚本 | 覆盖 |
|---|---|---|
| 静态结构 | `scripts/check-structure.mjs` | 必需文件/模块/section/资源存在；main.js 按真正 import（排除注释）组装所有模块；sections.js 的 8 个区块按规范顺序；index.html 正确挂载入口 |
| 端到端冒烟 | `scripts/smoke.mjs` + `scripts/run-smoke.mjs` | 8 个 section DOM 注入；6 个 vendor 脚本到全局；Demos/Works 渲染数量；URL `?code=` 隐私控制；滚动懒加载触发；Demo viewer 打开/标题；主题切换；Preloader 淡出；**零 runtime error / 零失败同源请求** |

总共 **32 条断言**。任何一条失败 → 命令退出码 1。

### CI 门控

`.github/workflows/ci.yml` 在每次 `push` 和 PR 上自动跑：

1. `npm ci` 安装依赖
2. `npm run test:static`
3. `npm run build`
4. `npm run test:smoke`（用 `browser-actions/setup-chrome` 的 headless Chrome）
5. 上传 `dist/` artifact（成功时，便于部署追溯）

PR 若任一步失败会被标红、阻止合并。

## 🐛 Known Issues

- 移动端「Recent Works」下拉框样式异常
- 移动端 Load more 后图片有边影
- 暗色主题下 brand logo 过暗
- 窗口压缩时 works title 被挤压
