/**
 * 通用动画初始化：WOW / Morphext / Parallax / Counterup / Skill bar。
 *
 * 为保持对老版 jQuery 插件（Morphext / Counterup / Waypoints / WOW /
 * Parallax …）的零回归，这些 vendor 脚本通过动态 <script> 注入（见
 * `core/vendor-loader.js`），而不是 ES import。npm 只用于锁定依赖版本，
 * 便于未来升级时有迹可循。
 *
 * vendor 清单、超时等由 `config/index.js` 集中管理。
 */
import $ from 'jquery';
import { VENDORS } from '../config/index.js';
import { loadVendorScripts } from '../core/vendor-loader.js';

export async function loadCoreVendors() {
  await loadVendorScripts(VENDORS.core);
}

export function initWow() {
  if (typeof window.WOW === 'undefined') return;
  // 让主线程先把 sections 布局画出来再起 WOW，避免首屏视觉抖动
  setTimeout(() => { new window.WOW().init(); }, 0);
}

export function initMorphext() {
  if (typeof $.fn.Morphext !== 'function') return;
  $('.text-rotating').Morphext({
    animation: 'bounceIn',
    separator: ',',
    speed: 4000,
    complete: () => {},
  });
}

export function initParallax() {
  if ($('.parallax').length === 0) return;
  const Parallax = window.Parallax;
  if (!Parallax) return;
  const scene = $('.parallax').get(0);
  // eslint-disable-next-line no-new
  new Parallax(scene, { relativeInput: true });
}

export function initCounterUp() {
  if (typeof $.fn.counterUp !== 'function') return;
  $('.count').counterUp({
    delay: 10,
    time: 2000,
  });
}

export function initSkillBars() {
  if ($('.skill-item').length === 0) return;
  if (typeof window.Waypoint === 'undefined') return;
  // eslint-disable-next-line no-new
  new window.Waypoint({
    element: document.getElementsByClassName('skill-item'),
    handler() {
      $('.progress-bar').each(function () {
        const barValue = `${$(this).attr('aria-valuenow')}%`;
        $(this).animate({ width: barValue }, { easing: 'linear' });
      });
      this.destroy();
    },
    offset: '50%',
  });
}
