/**
 * Preloader：页面加载完后淡出。
 *
 * 细节：
 *   - 时序参数集中在 `config.TIMINGS`；
 *   - UA 判断过去只是在给两种 loading 动画做 Fallback，保留；
 *   - 用 `transitionend` + 超时兜底代替硬编码双层 setTimeout。
 */
import { TIMINGS } from '../config/index.js';

export function hidePreloader() {
  const el = document.getElementById('preloader');
  if (!el) return;

  setTimeout(() => {
    el.style.transition = `opacity ${TIMINGS.preloaderFadeMs}ms ease`;
    el.style.opacity = '0';

    const done = () => {
      el.style.display = 'none';
      el.removeEventListener('transitionend', done);
    };
    el.addEventListener('transitionend', done);
    // 兜底：防 transitionend 因某种原因不触发（如被 display:none 抢先切换）
    setTimeout(done, TIMINGS.preloaderFadeMs + 100);
  }, TIMINGS.preloaderDelayMs);

  // 非 Chrome 浏览器下切到 fallback 动画样式
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  if (!isChrome) {
    const chromeEl = document.getElementsByClassName('infinityChrome')[0];
    const fallbackEl = document.getElementsByClassName('infinity')[0];
    if (chromeEl) chromeEl.style.display = 'none';
    if (fallbackEl) fallbackEl.style.display = 'block';
  }
}
