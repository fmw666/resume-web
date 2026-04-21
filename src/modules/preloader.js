/**
 * Preloader：页面加载完后淡出。
 */
export function hidePreloader() {
  const el = document.getElementById('preloader');
  if (!el) return;
  setTimeout(() => {
    el.style.transition = 'opacity 0.45s ease';
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.display = 'none';
    }, 500);
  }, 350);

  // 原脚本根据 Chrome/其它浏览器切换两种加载动画 DOM
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  if (!isChrome) {
    const chromeEl = document.getElementsByClassName('infinityChrome')[0];
    const fallbackEl = document.getElementsByClassName('infinity')[0];
    if (chromeEl) chromeEl.style.display = 'none';
    if (fallbackEl) fallbackEl.style.display = 'block';
  }
}
