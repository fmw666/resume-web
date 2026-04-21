/**
 * Testimonials 区块的 Slick 轮播。按需懒加载。
 */
import $ from 'jquery';
import { loadVendorScripts } from './vendor-loader.js';

let loaded = false;

async function init() {
  if (loaded) return;
  loaded = true;
  await loadVendorScripts(['/assets/js/slick.min.js']);
  $('.testimonials-wrapper').slick({
    dots: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
  });
}

export function initTestimonialsLazy() {
  const el = document.querySelector('.testimonials-wrapper');
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
      { rootMargin: '200px' },
    );
    io.observe(el);
  } else {
    init();
  }
}
