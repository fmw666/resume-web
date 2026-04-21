/**
 * Works 区块：Isotope 过滤 + Magnific Popup + Infinite Scroll（加载第二页）。
 *
 * 性能策略：这些插件比较重，所以用 IntersectionObserver 懒加载 —— 只有当
 * #works 进入可视范围时才 import 执行。对首屏渲染非常友好。
 */
import $ from 'jquery';

let initialized = false;
let modulePromise = null;

import { loadVendorScripts } from './vendor-loader.js';

async function loadDeps() {
  if (modulePromise) return modulePromise;
  modulePromise = (async () => {
    await loadVendorScripts([
      '/assets/js/imagesloaded.pkgd.min.js',
      '/assets/js/isotope.pkgd.min.js',
      '/assets/js/jquery.magnific-popup.min.js',
      '/assets/js/infinite-scroll.min.js',
    ]);
    const worksPage2Module = await import('../sections/works-page-2.html?raw');
    return { worksPage2Html: worksPage2Module.default };
  })();
  return modulePromise;
}

async function init() {
  if (initialized) return;
  initialized = true;

  await loadDeps();

  // ------- Isotope filter buttons -------
  const $container = $('.portfolio-wrapper');

  $('.portfolio-filter').on('click', 'li', function () {
    const filterValue = $(this).attr('data-filter');
    $container.isotope({ filter: filterValue });
  });

  $('.portfolio-filter').each(function () {
    const $buttonGroup = $(this);
    $buttonGroup.on('click', 'li', function () {
      $buttonGroup.find('.current').removeClass('current');
      $(this).addClass('current');
    });
  });

  $container.imagesLoaded(() => {
    $container.isotope({
      itemSelector: '[class*="col-"]',
      percentPosition: true,
      masonry: { columnWidth: '[class*="col-"]' },
    });
  });

  bindPopups();
  bindInfiniteScroll($container);

  // 移动端下拉筛选
  $('.portfolio-filter-mobile').on('change', function () {
    $container.isotope({ filter: this.value });
  });
}

function bindPopups() {
  $('.work-image').magnificPopup({
    type: 'image',
    closeBtnInside: false,
    mainClass: 'my-mfp-zoom-in',
  });

  $('.work-content').magnificPopup({
    type: 'inline',
    fixedContentPos: true,
    fixedBgPos: true,
    overflowY: 'auto',
    closeBtnInside: false,
    preloader: false,
    midClick: true,
    removalDelay: 300,
    mainClass: 'my-mfp-zoom-in',
  });

  $('.work-link').magnificPopup({
    type: 'inline',
    fixedContentPos: true,
    fixedBgPos: true,
    overflowY: 'auto',
    closeBtnInside: false,
    preloader: false,
    midClick: true,
    removalDelay: 300,
    mainClass: 'my-mfp-zoom-in',
    callbacks: {
      open() {
        $('.mfp-iframe').css({ width: '100%', height: '60vh' });
      },
    },
  });

  $('.work-video').magnificPopup({
    type: 'iframe',
    closeBtnInside: false,
    iframe: {
      markup:
        '<div class="mfp-iframe-scaler">' +
        '<div class="mfp-close"></div>' +
        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
        '</div>',
      patterns: {
        youtube: { index: 'youtube.com/', id: 'v=', src: 'https://www.youtube.com/embed/%id%?autoplay=1' },
        vimeo: { index: 'vimeo.com/', id: '/', src: '//player.vimeo.com/video/%id%?autoplay=1' },
        gmaps: { index: '//maps.google.', src: '%id%&output=embed' },
      },
      srcAction: 'iframe_src',
    },
    callbacks: {
      open() {
        $('.mfp-iframe').css({ width: '100%', height: $(window).height() - 100 });
      },
    },
  });

  $('.gallery-link').off('click.portfolio').on('click.portfolio', function () {
    $(this).next().magnificPopup('open');
  });

  $('.gallery').each(function () {
    $(this).magnificPopup({
      delegate: 'a',
      type: 'image',
      closeBtnInside: false,
      gallery: { enabled: true, navigateByImgClick: true },
      fixedContentPos: false,
      mainClass: 'my-mfp-zoom-in',
    });
  });
}

async function bindInfiniteScroll($container) {
  const { worksPage2Html } = await loadDeps();

  let curPage = 1;
  const pagesNum = $('.portfolio-pagination').find('li a:last').text();

  if (typeof $container.infinitescroll !== 'function') {
    // vendor infinite-scroll 没能挂上去，直接改为点击按钮一次性注入第二页
    $('.load-more .btn').on('click', function () {
      $container.append(worksPage2Html);
      $container.imagesLoaded(() => {
        $container.isotope('reloadItems').isotope({ filter: '*' });
      });
      bindPopups();
      $('.load-more').remove();
      return false;
    });
    return;
  }

  $container.infinitescroll(
    {
      itemSelector: '.grid-item',
      nextSelector: '.portfolio-pagination li a',
      navSelector: '.portfolio-pagination',
      extraScrollPx: 0,
      bufferPx: 0,
      maxPage: 6,
      loading: {
        finishedMsg: 'No more works',
        msgText: '',
        speed: 'slow',
        selector: '.load-more',
      },
    },
    function (newElements) {
      const $newElems = $(newElements);
      const theme = localStorage.getItem('theme');
      if (theme !== 'light') {
        $newElems.each(function () {
          $(this).children().children().removeClass('light');
        });
      } else {
        $newElems.each(function () {
          $(this).children().children().addClass('light');
        });
      }

      $newElems.imagesLoaded(() => {
        $newElems.animate({ opacity: 1 });
        $container.isotope('appended', $newElems);
      });

      bindPopups();
      curPage += 1;
      if (String(curPage) === String(pagesNum)) {
        $('.load-more').remove();
      }
    },
  );

  $container.infinitescroll('unbind');

  $('.load-more .btn').on('click', function () {
    $container.infinitescroll('retrieve');
    $('.load-more .btn i').css('display', 'inline-block').addClass('fa-spin');
    $(document).ajaxStop(() => {
      setTimeout(() => { $('.load-more .btn i').hide(); }, 1000);
    });
    return false;
  });
}

export function initPortfolioLazy() {
  const el = document.getElementById('works');
  if (!el) return;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            io.disconnect();
            init();
          }
        });
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
  } else {
    init();
  }
}
