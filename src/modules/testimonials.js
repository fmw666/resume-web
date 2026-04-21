/**
 * Testimonials 区块的 Slick 轮播。按需懒加载。
 */
import $ from 'jquery';
import { VENDORS, LAZY } from '../config/index.js';
import { loadVendorScripts } from '../core/vendor-loader.js';
import { whenVisible } from '../core/lazy.js';

let loaded = false;

async function init() {
  if (loaded) return;
  loaded = true;
  await loadVendorScripts(VENDORS.testimonials);
  $('.testimonials-wrapper').slick({
    dots: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
  });
}

export function initTestimonialsLazy() {
  whenVisible('.testimonials-wrapper', init, {
    rootMargin: LAZY.testimonialsRootMargin,
    label: 'testimonials',
  });
}
