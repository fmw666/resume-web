/**
 * 调度工具：rAF 节流、idle 回调、debounce。
 *
 * 抽出来避免每个模块自己写一份 `setTimeout` 防抖——不仅重复，还
 * 经常忘了清理，尤其在 resize / scroll 事件上会造成卡顿。
 */

/**
 * 用 requestAnimationFrame 节流一个函数：多次触发只会在下一帧执行一次。
 * 适合 scroll / mousemove / resize 这种高频事件。
 */
export function rafThrottle(fn) {
  let ticking = false;
  let lastArgs = null;
  return function throttled(...args) {
    lastArgs = args;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      fn.apply(this, lastArgs);
    });
  };
}

export function debounce(fn, wait = 150) {
  let t = null;
  return function debounced(...args) {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/** idle callback 的 polyfill 版，便于不用每个模块自己判断。 */
export function whenIdle(cb, { timeout = 3000 } = {}) {
  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(cb, { timeout });
  }
  return setTimeout(cb, 0);
}
