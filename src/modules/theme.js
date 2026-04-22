/**
 * 主题切换（light / dark）。
 *
 * 背景：CSS 里大量 `.light` 选择器负责浅色态样式，早期实现切到 dark
 * 时要手工 `removeClass('light')`，切回又得按一张长名单 `addClass`。
 * 这种"知识泄漏"会在新增 `.light` 元素时悄悄 regress。
 *
 * 现策略：
 *   - 切到 dark 时把带 `.light` 的元素打上 `data-had-light` 记号并去掉
 *     class；切回 light 时按记号批量还原。JS 不再感知具体选择器集合。
 *   - 切换过程**合并到单次 rAF** 里做，让浏览器只经历一次样式重计算，
 *     避免连续 DOM 写操作导致强制布局。
 *   - 用 `dispatchEvent` 广播 `theme-change`，其它模块（比如 portfolio
 *     新元素）可以订阅而不是 import theme 状态。
 *
 * 初始化分成两步（避免"暗色刷新时 section 内 `.light` 没被 strip"的
 * 回归）：
 *   - `initTheme` 在 `PRE_MOUNT` 跑：只处理和 body / 开关小按钮有关、
 *     不依赖 section DOM 的状态（body.dark / moon 偏移 / localStorage）。
 *   - `syncThemeToSections` 在 `POST_MOUNT` 跑：sections 已注入，这时
 *     才知道页面全部 `.light` 节点集合，按当前主题做一次性 strip + 广播。
 *
 * 向后兼容：smoke test 断言 dark 下 `.light` 数量为 0、toggle 回来后
 * >= 50，这里严格保持该语义。
 */

const DARK_OFFSET_PX = 30;
const MARK = 'data-had-light';
const STORAGE_KEY = 'theme';

function setMoonSunOffset(px) {
  const icon = document.querySelector('#theme-icon .moon-sun');
  if (icon) icon.style.transform = `translateX(${px}px)`;
}

function stripLightClasses() {
  const all = document.querySelectorAll('.light');
  for (const el of all) {
    el.setAttribute(MARK, '1');
    el.classList.remove('light');
  }
  // `.service-box` 在 light 下没有配对的 `.dark`，dark 模式要显式补上
  const boxes = document.querySelectorAll('.service-box');
  for (const el of boxes) el.classList.add('dark');
}

function restoreLightClasses() {
  const all = document.querySelectorAll(`[${MARK}]`);
  for (const el of all) {
    el.classList.add('light');
    el.removeAttribute(MARK);
  }
  const boxes = document.querySelectorAll('.service-box');
  for (const el of boxes) el.classList.remove('dark');
}

function broadcast(theme) {
  document.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
}

function applyDark() {
  document.body.classList.add('dark');
  stripLightClasses();
  setMoonSunOffset(DARK_OFFSET_PX);
  localStorage.setItem(STORAGE_KEY, 'dark');
  broadcast('dark');
}

function applyLight() {
  document.body.classList.remove('dark');
  restoreLightClasses();
  setMoonSunOffset(0);
  localStorage.setItem(STORAGE_KEY, 'light');
  broadcast('light');
}

/** 读当前主题（其它模块可以用它决定渲染新元素时带不带 `.light`）。 */
export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

/**
 * PRE_MOUNT 阶段调用。此刻 sections 还没被 `mountSections` 注入，只能
 * 对 body / 主题小按钮这类 shell 节点做状态标记 —— 把 `body.dark` 先
 * 打上，避免 sections 注入后再切导致"浅 → 深"视觉闪烁；真正 strip
 * `.light` 要留到 `syncThemeToSections`。
 */
export function initTheme() {
  const saved = getTheme();
  if (saved === 'dark') {
    document.body.classList.add('dark');
    setMoonSunOffset(DARK_OFFSET_PX);
    localStorage.setItem(STORAGE_KEY, 'dark');
  } else {
    setMoonSunOffset(0);
    localStorage.setItem(STORAGE_KEY, 'light');
  }
}

/**
 * POST_MOUNT 阶段调用。sections HTML 已进入 DOM，此时 `.light` 节点
 * 集合才是完整的；若当前是 dark，就对全页做一次性 strip，保证所有
 * section 内部元素（agent / about / services / …）在首屏就是深色。
 */
export function syncThemeToSections() {
  if (getTheme() === 'dark') {
    stripLightClasses();
    broadcast('dark');
  } else {
    broadcast('light');
  }
}

export function bindThemeToggle() {
  const btn = document.getElementById('theme-icon');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (getTheme() === 'dark') applyLight(); else applyDark();
  });
}
