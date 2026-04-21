/**
 * 通用动画初始化：WOW / Morphext / Parallax / Counterup / Skill bar。
 *
 * 为了保持对老版 jQuery 插件（Morphext / Counterup / Waypoints / WOW /
 * Parallax …）的零回归，这些 vendor 脚本通过动态 <script> 注入（见
 * loadVendorScripts），而不是 ES import。npm 只用于锁定依赖版本，便于
 * 未来升级时有迹可循。
 */
import $ from 'jquery';
import { loadVendorScripts } from './vendor-loader.js';

const VENDORS = [
  '/assets/js/popper.min.js',
  '/assets/js/bootstrap.min.js',
  '/assets/js/jquery.easing.min.js',
  '/assets/js/jquery.waypoints.min.js',
  '/assets/js/jquery.counterup.min.js',
  '/assets/js/morphext.min.js',
  '/assets/js/wow.min.js',
  '/assets/js/parallax.min.js',
];

export async function loadCoreVendors() {
  await loadVendorScripts(VENDORS);
}

export function initWow() {
  if (typeof window.WOW === 'undefined') return;
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

/**
 * 把 data-height / data-color 属性应用到对应元素。
 */
export function applyDataAttrs() {
  document.querySelectorAll('.spacer').forEach((el) => {
    const size = el.getAttribute('data-height');
    if (size) el.style.height = `${size}px`;
  });
  document.querySelectorAll('.data-background').forEach((el) => {
    const color = el.getAttribute('data-color');
    if (color) el.style.backgroundColor = color;
  });
}
