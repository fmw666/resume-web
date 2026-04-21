/**
 * jQuery global bootstrap.
 *
 * 遗留的 jQuery 插件（Morphext / Counterup / Waypoints / Magnific-Popup /
 * WOW / Parallax / Isotope / Slick / infinite-scroll …）都依赖
 * window.jQuery / window.$ 为全局对象，所以这里先把 jQuery 暴露到 window。
 *
 * 所有其他插件必须在这个模块之后再 import。
 */
import jQuery from 'jquery';

// 暴露到全局，供后续所有 jQuery 插件使用
window.$ = window.jQuery = jQuery;

export default jQuery;
