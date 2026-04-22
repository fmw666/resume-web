/**
 * 应用入口 —— 把启动过程组织成一个 **分阶段的 pipeline**：
 *
 *   PRE_MOUNT   主题 shell 状态（body.dark / 开关偏移），在 sections 注入
 *               前先打好，避免浅→深闪烁
 *   MOUNT       注入 HTML sections（一次性串行，其它步骤都依赖它）
 *   POST_MOUNT  无 vendor 依赖的轻交互（主题对 section 内部 `.light` 的
 *               一次性同步、导航、数据属性、隐私控制、…）
 *   ENHANCE     需要核心 vendor 就绪的动画 & scrollspy
 *   DEFER       懒加载类（portfolio / testimonials / chatbot / viewer）
 *
 *   - 每个阶段内任务**并行**执行（Promise.allSettled），
 *   - 任一任务抛错走 `safeRun` 捕获，日志落 logger，不中断其它任务，
 *   - 新增模块只需在 `registerXxx` 里再加一条，不会让 boot 函数越写越长。
 */
import './modules/jquery-global.js';

import { mountSections } from './modules/sections.js';
import { initTheme, syncThemeToSections, bindThemeToggle } from './modules/theme.js';
import { hidePreloader } from './modules/preloader.js';
import {
  initMobileMenu,
  initSmoothScroll,
  initScrollspy,
  initSubMenuSwitch,
  initReturnToTop,
} from './modules/navigation.js';
import {
  loadCoreVendors,
  initWow,
  initMorphext,
  initParallax,
  initCounterUp,
  initSkillBars,
} from './modules/animations.js';
import { applyDataAttrs } from './modules/dom-utils.js';
import { initSelfIntroAudio } from './modules/self-intro.js';
import { initAgentCopy } from './modules/agent.js';
import { initPortfolioLazy } from './modules/portfolio.js';
import { initTestimonialsLazy } from './modules/testimonials.js';
import { initContactForm } from './modules/contact.js';
import { initChatbot } from './modules/chatbot.js';
import { enforcePrivacy } from './modules/privacy.js';
import { initDemoViewer } from './modules/demo-viewer.js';

import { createPipeline, PHASES, onDomReady } from './core/lifecycle.js';
import { safeRun } from './core/safe-run.js';
import { logger } from './core/logger.js';

function buildPipeline() {
  const pipe = createPipeline();

  pipe.register(PHASES.PRE_MOUNT, 'theme:init', initTheme);

  pipe.register(PHASES.MOUNT, 'sections:mount', () => mountSections('#main'));

  // `theme:sync` 必须在 `sections:mount` 之后才跑：sections 注入完毕后，
  // 页面里所有带 `.light` 的节点集合才是完整的；若当前是 dark，此刻做
  // 一次性 strip 才能避免"暗色刷新，section 内部仍呈浅色"的初始化回归。
  pipe.register(PHASES.POST_MOUNT, 'theme:sync', syncThemeToSections);
  pipe.register(PHASES.POST_MOUNT, 'dom-attrs', applyDataAttrs);
  pipe.register(PHASES.POST_MOUNT, 'privacy', enforcePrivacy);
  pipe.register(PHASES.POST_MOUNT, 'theme:toggle', bindThemeToggle);
  pipe.register(PHASES.POST_MOUNT, 'nav:menu', initMobileMenu);
  pipe.register(PHASES.POST_MOUNT, 'nav:submenu', initSubMenuSwitch);
  pipe.register(PHASES.POST_MOUNT, 'nav:return-top', initReturnToTop);
  pipe.register(PHASES.POST_MOUNT, 'self-intro', initSelfIntroAudio);
  pipe.register(PHASES.POST_MOUNT, 'agent', initAgentCopy);

  // ENHANCE：核心 vendor 就绪后再绑定依赖它们的能力。
  pipe.register(PHASES.ENHANCE, 'vendors:core+scrollspy+smooth+animations', async () => {
    await loadCoreVendors();
    // 下面这些每个都包在 safeRun 里，避免某一个 vendor 异常连累其它。
    await Promise.allSettled([
      safeRun('scrollspy', initScrollspy),
      safeRun('smooth-scroll', initSmoothScroll),
      safeRun('morphext', initMorphext),
      safeRun('parallax', initParallax),
      safeRun('counterup', initCounterUp),
      safeRun('skillbars', initSkillBars),
      safeRun('wow', initWow),
    ]);
  });

  // DEFER：可延后的重模块 & 第三方 iframe。
  pipe.register(PHASES.DEFER, 'contact', initContactForm);
  pipe.register(PHASES.DEFER, 'portfolio:lazy', initPortfolioLazy);
  pipe.register(PHASES.DEFER, 'testimonials:lazy', initTestimonialsLazy);
  pipe.register(PHASES.DEFER, 'demo-viewer', initDemoViewer);
  pipe.register(PHASES.DEFER, 'chatbot', initChatbot);

  return pipe;
}

async function boot() {
  logger.debug('booting…');
  const pipe = buildPipeline();

  // 关键阶段：POST_MOUNT 跑完 = 首屏 DOM 结构齐、主题/导航/隐私已绑定。
  // 这之后 preloader 就应该淡出，不再等 ENHANCE（vendor JS）或 DEFER
  // （portfolio/chatbot 等懒加载模块）。历史上 preloader 挂在
  // `window.load` 上，右下角 botpress iframe 一旦预热就会把 load 事件
  // 顶到几秒甚至十几秒之后，视觉上就是"首页一直在转圈"。
  await pipe.runPhase(PHASES.PRE_MOUNT);
  await pipe.runPhase(PHASES.MOUNT, { parallel: false });
  await pipe.runPhase(PHASES.POST_MOUNT);
  hidePreloader();

  // 剩下的阶段继续在后台推进，不影响感知到的"加载完成"。
  await pipe.runPhase(PHASES.ENHANCE);
  await pipe.runPhase(PHASES.DEFER);

  logger.debug('boot complete');
}

onDomReady(boot);
