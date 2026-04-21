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

export function initTheme() {
  const saved = getTheme();
  if (saved === 'dark') {
    applyDark();
  } else {
    setMoonSunOffset(0);
    localStorage.setItem(STORAGE_KEY, 'light');
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
