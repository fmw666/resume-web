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
├── vite.config.js          # Vite 配置（output=dist, assetsDir=app, manualChunks）
├── package.json            # npm 依赖、scripts
├── src/
│   ├── main.js             # 应用入口：注册式 pipeline，分阶段 + 错误隔离
│   ├── config/
│   │   └── index.js        # 配置中心：外部 URL / 时序 / 懒加载阈值 / feature flag
│   ├── core/               # 与业务无关的基础设施
│   │   ├── lifecycle.js    # Pipeline 抽象：PHASES + 并行执行 + 错误隔离
│   │   ├── safe-run.js     # 把任务包成"抛错不影响其他任务"
│   │   ├── logger.js       # 分级日志（生产默认 warn+）
│   │   ├── vendor-loader.js# 动态 <script> 注入：去重/超时/重试
│   │   ├── lazy.js         # 统一 IntersectionObserver 懒加载样板
│   │   └── schedule.js     # rAF 节流 / debounce / whenIdle
│   ├── modules/            # 业务模块（每个职责独立，便于维护）
│   │   ├── jquery-global.js        # 把 jQuery 暴露到 window.$
│   │   ├── sections.js             # HTML partials 注入
│   │   ├── theme.js                # 主题切换（data-had-light 记忆式）
│   │   ├── preloader.js            # 预加载动画
│   │   ├── navigation.js           # 菜单 / 平滑滚动 / scrollspy / 回到顶部
│   │   ├── animations.js           # WOW / Morphext / Parallax / Counterup / Skill bar
│   │   ├── dom-utils.js            # 通用 DOM helper（data-height / data-color 应用）
│   │   ├── self-intro.js           # About 音频
│   │   ├── agent.js                # For-Your-Agent Copy 按钮
│   │   ├── portfolio.js            # Isotope + MagnificPopup + InfiniteScroll（懒加载）
│   │   ├── testimonials.js         # Slick 轮播（懒加载）
│   │   ├── contact.js              # Formspree 提交 + validator
│   │   ├── chatbot.js              # Botpress iframe 懒加载
│   │   ├── privacy.js              # URL ?code= 控制
│   │   ├── demo-viewer.js          # Projects 入口（< 40 行的瘦协调器）
│   │   ├── demos/                  # demo-viewer 的子职责
│   │   │   ├── demo-masonry.js     # Masonry 卡片渲染
│   │   │   ├── demo-arc.js         # 全屏 viewer 的 Arc 缩略图面板
│   │   │   └── demo-fullscreen.js  # 全屏 viewer 本体（切换 / 缩放 / 键盘导航）
│   │   ├── demos-data.js           # Demo 数据
│   │   └── vendor-loader.js        # 按序注入 vendor <script>
│   └── sections/           # 各区块 HTML 片段（通过 ?raw 导入为字符串）
│       ├── home.html
│       ├── agent.html
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
│       │   ├── style.css           # 仅 @import 清单（< 60 行）
│       │   └── style/              # 27 个按 TABLE OF CONTENTS 拆分的分片
│       │       ├── 01-base.css
│       │       ├── 02-typography.css
│       │       ├── …
│       │       └── 27-agent.css
│       ├── js/             # 老版 jQuery 插件（保持原版本以零回归）
│       ├── images/
│       ├── videos/
│       └── audios/
└── scripts/
    ├── check-structure.mjs     # 静态结构断言
    ├── smoke.mjs               # Puppeteer 端到端冒烟
    └── run-smoke.mjs           # 一键 build + preview + smoke
```

### 架构策略

- **启动 pipeline（`src/core/lifecycle.js`）**：boot 过程被切成 `PRE_MOUNT` →
  `MOUNT` → `POST_MOUNT` → `ENHANCE` → `DEFER` 五个阶段。每个阶段内任务并行
  执行（`Promise.allSettled`），阶段之间串行。新增模块只需 `pipe.register(phase, label, fn)`
  一行，`main.js` 不会随规模爆炸。任何一个任务抛错都被 `safeRun` 捕获并记录，
  不会连累其他任务。
- **配置集中（`src/config/index.js`）**：外部服务 URL、时序、懒加载阈值、
  访问码等一律放这里，并通过 `Object.freeze` 固化；支持 `import.meta.env.VITE_*`
  覆盖，便于部署时改 CDN / Formspree 项目 / Botpress 配置。
- **每个模块一个职责（SRP）**：
  - 业务模块放在 `src/modules/`，重而边界清的子职责（如 demo viewer 的 3 个子模块）
    放在同名子目录下；
  - 与业务解耦的基础设施放在 `src/core/`；
  - 样式按 `TABLE OF CONTENTS` 拆成 27 个 ≤ 500 行的分片（`public/assets/css/style/`），
    `style.css` 退化为只做 `@import` 的清单。CI 里 `test:static` 会断言几个关键分片
    必须存在 + `demo-viewer.js` 必须委托给 3 个子模块，防止未来回到"胖文件"。
- **section 独立**：每个区块是一个 `.html` 文件，通过 Vite 的 `?raw` 在构建期作为字符串
  导入，然后由 `src/modules/sections.js` 按数组顺序注入 `<main id="main">`。改区块完全
  不会影响其他区块。想加新页面？把一个新模块接入 `main.js` 即可。
- **动画零回归**：Morphext / WOW / Parallax / Counterup / Waypoints / Isotope / Slick /
  MagnificPopup / infinite-scroll 等老 jQuery 插件**保留原文件**在 `public/assets/js/`，
  通过 `core/vendor-loader` 按需动态注入（带去重 / 超时 / 重试）。`npm` 只锁
  `jquery@1.12.4` 作为 ES 模块的全局桥接。
- **懒加载抽象**：`Portfolio` / `Testimonials` 通过 `core/lazy.whenVisible` 统一
  `IntersectionObserver` 样板，只有真的滚到附近才下载对应的重量级插件（Isotope /
  MagnificPopup / InfiniteScroll / Slick）。Portfolio 的 vendor 下载与第二页 HTML
  import 并行发起，进一步缩短可交互延迟。
- **Chatbot**：`core/schedule.whenIdle` 在浏览器空闲时创建 Botpress iframe；用户点击
  widget 时立即拉起，不等 idle。
- **资源指纹 + 代码分包**：Vite 给每个 chunk 加 content hash；`manualChunks`
  把 jQuery 和 `src/core/` 分别拆成独立 chunk，便于长缓存与按需加载。
- **Theme 切换**：用 `data-had-light` 打标 + 一次性批读批写，避免在切换时
  对整棵 DOM 造成多轮强制布局；并 `dispatchEvent('theme-change')` 广播给
  订阅方，代替"谁都直接 import theme 内部状态"。
- **Return-to-top**：用 `IntersectionObserver` 监测"顶部哨兵"替代逐帧 `scroll`
  handler，主线程更安静，滚动更顺滑。

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
| 静态结构 | `scripts/check-structure.mjs` | 必需文件/模块/section/资源存在（含 CSS 分片与 demos/ 子模块）；main.js 按真正 import（排除注释）组装所有模块；sections.js 的 9 个区块按规范顺序；demo-viewer.js 必须委托给 3 个子模块；index.html 正确挂载入口 |
| 端到端冒烟 | `scripts/smoke.mjs` + `scripts/run-smoke.mjs` | 9 个 section DOM 注入；6 个 vendor 脚本到全局；Demos/Works 渲染数量；URL `?code=` 隐私控制；滚动懒加载触发；Demo viewer 打开/标题；Agent copy 按钮；主题切换 **light→dark→light 可逆 + dark 模式下 `.light` 元素归零**；Preloader 淡出；**零 runtime error / 零失败同源请求** |

任何一条失败 → 命令退出码 1。

### CI 门控

`.github/workflows/ci.yml` 在每次 `push` 和 PR 上自动跑：

1. `npm ci` 安装依赖
2. `npm run test:static`
3. `npm run build`
4. `npm run test:smoke`（用 `browser-actions/setup-chrome` 的 headless Chrome）
5. 上传 `dist/` artifact（成功时，便于部署追溯）

PR 若任一步失败会被标红、阻止合并。

### 自动 merge + main 分支保护

仓库还启用了两条工作流来省掉手工 merge：

- **`.github/workflows/auto-merge.yml`** —— PR 一旦 ready（非 draft），且满足下面任一
  条件，就会被放进 GitHub 原生的 auto-merge 队列，CI 绿后自动 squash 合入 + 删源分支：
  - PR 贴了 `auto-merge` 标签；
  - PR 源分支以 `cursor/` 开头（给 Cursor Cloud Agent 用的默认通道）；
  - PR 作者是仓库 owner。
- **`scripts/setup-branch-protection.sh`** —— 一键给 `main` 配好分支保护：
  - 禁止任何人直接 commit / push 到 `main`（强制走 PR）；
  - 要求 `build + test` 状态检查通过；
  - 禁止 force-push / 删除 `main`；
  - 要求线性历史 + 所有对话 resolved；
  - 管理员同样受限（可按需改成豁免）。
  
  运行一次即可（需已 `gh auth login`）：
  ```bash
  bash scripts/setup-branch-protection.sh
  ```
  想撤销：`gh api -X DELETE /repos/:owner/:repo/branches/main/protection`。

> ⚠️ 仓库还需要手动打开一次 **Settings → General → Pull Requests → Allow auto-merge**
> 的全局开关（`setup-branch-protection.sh` 会帮你通过 API 自动打开，但某些组织策略
> 下仍需人工确认）。

## 🐛 Known Issues

- 移动端「Recent Works」下拉框样式异常
- 移动端 Load more 后图片有边影
- 暗色主题下 brand logo 过暗
- 窗口压缩时 works title 被挤压
