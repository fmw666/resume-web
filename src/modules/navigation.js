/**
 * 导航：菜单开合、锚点平滑滚动、scrollspy、sub-menu 展开、回到顶部。
 *
 * 注意：jQuery 1.12.4 自带的 `scrollspy`（Bootstrap 4）和 `jquery.easing`
 * 仍然是老生态里最稳的方案，所以这里沿用。
 */
import $ from 'jquery';

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
    $('html, body').stop().animate(
      { scrollTop: target.offset().top },
      800,
      'easeInOutQuad',
    );
    event.preventDefault();
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
  const $btn = $('#return-to-top');
  if ($btn.length === 0) return;
  $(window).on('scroll', function () {
    if ($(this).scrollTop() >= 350) {
      $btn.fadeIn(200);
    } else {
      $btn.fadeOut(200);
    }
  });
  $btn.on('click', function (event) {
    event.preventDefault();
    $('body,html').animate({ scrollTop: 0 }, 400);
  });
}
