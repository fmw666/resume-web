/**
 * 统一的"滚动到附近再初始化"懒加载工具。
 *
 * 把 `portfolio.js` / `testimonials.js` 里重复的 IntersectionObserver
 * 模板抽出来，保证行为一致 + 未来可以在一处优化（如 fallback 到 idle
 * callback、支持 once=false、统一错误处理）。
 */
import { safeRun } from './safe-run.js';

/**
 * @param {Element | string} target  目标元素或选择器
 * @param {() => Promise<void> | void} init  进入视口后执行一次
 * @param {{ rootMargin?: string, label?: string }} [opts]
 */
export function whenVisible(target, init, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return () => {};

  const label = opts.label || 'lazy';

  if (!('IntersectionObserver' in window)) {
    // 老浏览器：退化到立即初始化，至少不会丢功能
    safeRun(label, init);
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          io.disconnect();
          safeRun(label, init);
          return;
        }
      }
    },
    { rootMargin: opts.rootMargin || '200px' },
  );
  io.observe(el);
  return () => io.disconnect();
}
