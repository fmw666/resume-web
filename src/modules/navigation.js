/**
 * 导航：菜单开合、锚点平滑滚动、scrollspy、sub-menu 展开、回到顶部。
 *
 * 性能要点：
 *   - return-to-top 原来挂在 `scroll` 上每帧跑 jQuery DOM 读写，现改用
 *     IntersectionObserver 观察一个"阈值哨兵"，避免频繁 scroll handler；
 *   - 菜单开合 / 子菜单切换仍用 jQuery（保留现有类名状态机，零回归）；
 *   - 平滑滚动如果 vendor easing 没就绪，也能用原生 `behavior: 'smooth'`。
 */
import $ from 'jquery';
import { TIMINGS } from '../config/index.js';

export function initMobileMenu() {
  $('.menu-icon button').on('click', () => {
    $('header.desktop-header-1, main.content, header.mobile-header-1').toggleClass('open');
    $('header.desktop-header-2, main.content-2, header.mobile-header-2').toggleClass('open');
  });

  $('main.content').on('click', () => {
    $('header.desktop-header-1, main.content, header.mobile-header-1').removeClass('open');
  });
  $('main.content-2').on('click', () => {
    $('header.desktop-header-2, main.content-2, header.mobile-header-2').removeClass('open');
  });

  $('.vertical-menu li a').on('click', () => {
    $('header.desktop-header-1, main.content, header.mobile-header-1').removeClass('open');
    $('header.desktop-header-2, main.content-2, header.mobile-header-2').removeClass('open');
  });
}

export function initSmoothScroll() {
  $('a[href^="#"]:not([href="#"])').on('click', function (event) {
    const $anchor = $(this);
    const target = $($anchor.attr('href'));
    if (target.length === 0) return;

    event.preventDefault();
    if (typeof $.easing?.easeInOutQuad === 'function') {
      // 有老版 jquery.easing 就维持原动画曲线（视觉零回归）
      $('html, body').stop().animate(
        { scrollTop: target.offset().top },
        TIMINGS.scrollAnimateMs,
        'easeInOutQuad',
      );
    } else {
      target.get(0).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

export function initScrollspy() {
  $('.vertical-menu li a').addClass('nav-link');
  if (typeof $.fn.scrollspy === 'function') {
    $('body').scrollspy({ target: '.scrollspy' });
  }
}

export function initSubMenuSwitch() {
  $('.submenu').before('<i class="ion-md-add switch"></i>');
  $('.vertical-menu li i.switch').on('click', function () {
    const $submenu = $(this).next('.submenu');
    $submenu.slideToggle(300);
    $submenu.parent().toggleClass('openmenu');
  });
}

export function initReturnToTop() {
  const btn = document.getElementById('return-to-top');
  if (!btn) return;

  // 用 IO 监测"一个离顶部 350px 的哨兵"是否离开视口 —— 比逐帧 scroll
  // 性能好得多，且对 passive listener 没要求（根本没有 scroll handler）。
  let sentinel = document.getElementById('return-to-top-sentinel');
  if (!sentinel) {
    sentinel = document.createElement('div');
    sentinel.id = 'return-to-top-sentinel';
    sentinel.style.cssText =
      'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.insertBefore(sentinel, document.body.firstChild);
  }

  const show = () => { btn.classList.add('is-visible'); $(btn).fadeIn(200); };
  const hide = () => { btn.classList.remove('is-visible'); $(btn).fadeOut(200); };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) hide(); else show();
        }
      },
      { rootMargin: `-${TIMINGS.returnToTopOffsetPx}px 0px 0px 0px` },
    );
    io.observe(sentinel);
  } else {
    // 极老浏览器：passive scroll + rAF 节流
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          if (window.scrollY >= TIMINGS.returnToTopOffsetPx) show(); else hide();
        });
      },
      { passive: true },
    );
  }

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
