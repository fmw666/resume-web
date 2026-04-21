/**
 * Entry — 组合各模块成完整页面。
 *
 * 整体启动顺序：
 *   1. 暴露 jQuery 到全局（老 jQuery 插件都依赖 window.jQuery）
 *   2. 注入 HTML sections（所有后续 DOM 查询依赖此）
 *   3. 基础交互（主题 / 导航 / 菜单 / 返回顶部 / 数据属性 / 隐私控制）
 *   4. 加载核心 vendor 脚本（popper / bootstrap / wow / parallax / morphext ...）
 *      然后初始化对应动画
 *   5. About 音频 / Contact 表单
 *   6. 懒加载 portfolio / testimonials（IntersectionObserver 触发）
 *   7. 初始化 Projects 的 Demo Viewer
 *   8. Chatbot 异步加载
 *   9. 窗口 load 事件后淡出 preloader
 */
import './modules/jquery-global.js';
import $ from 'jquery';

import { mountSections } from './modules/sections.js';
import { initTheme, bindThemeToggle } from './modules/theme.js';
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
  applyDataAttrs,
} from './modules/animations.js';
import { initSelfIntroAudio } from './modules/self-intro.js';
import { initAgentCopy } from './modules/agent.js';
import { initPortfolioLazy } from './modules/portfolio.js';
import { initTestimonialsLazy } from './modules/testimonials.js';
import { initContactForm } from './modules/contact.js';
import { initChatbot } from './modules/chatbot.js';
import { enforcePrivacy } from './modules/privacy.js';
import { initDemoViewer } from './modules/demo-viewer.js';

async function boot() {
  // 1. 主题（必须在 sections 注入之前：.light 类依赖 saved theme）
  initTheme();

  // 2. 注入 sections
  mountSections('#main');

  // 3. 数据属性 + 隐私控制 + 基础交互
  applyDataAttrs();
  enforcePrivacy();
  bindThemeToggle();
  initMobileMenu();
  initSubMenuSwitch();
  initReturnToTop();

  // 4. 核心 vendors（包括 bootstrap 的 scrollspy 依赖）
  await loadCoreVendors();

  // scrollspy 依赖 bootstrap
  initScrollspy();
  // 平滑滚动依赖 jquery.easing
  initSmoothScroll();

  // 动画
  initMorphext();
  initParallax();
  initCounterUp();
  initSkillBars();
  initWow();

  // 5. About 音频 + For-Your-Agent 剪贴板 + Contact 表单
  initSelfIntroAudio();
  initAgentCopy();
  initContactForm();

  // 6. 懒加载
  initPortfolioLazy();
  initTestimonialsLazy();

  // 7. Demo viewer
  initDemoViewer();

  // 8. Chatbot
  initChatbot();

  // 9. Preloader 淡出
  $(window).on('load', hidePreloader);
  if (document.readyState === 'complete') {
    hidePreloader();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
