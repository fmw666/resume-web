/**
 * 主题切换（light / dark）。
 *
 * CSS 用大量 `.light` 选择器给浅色皮肤上色。早期实现切到 dark 时会
 * `removeClass('light')`，切回 light 时再照着一张长长的选择器清单
 * 逐个 `addClass('light')` —— 这是典型的知识泄漏：CSS 里新增一处
 * `.light` 就得同步改 JS。
 *
 * 现在改用 `data-had-light` 做"记忆"：进入 dark 时把带 `.light` 的
 * 元素打上这个 dataset 标记并去掉 class，回到 light 时按 dataset 还原。
 * 这样 JS 不再感知具体选择器集合。
 */

const DARK_OFFSET = 30;
const MARK = 'data-had-light';

function setMoonSunOffset(px) {
  const icon = document.querySelector('#theme-icon .moon-sun');
  if (icon) icon.style.transform = `translateX(${px}px)`;
}

function stripLightClasses() {
  document.querySelectorAll('.light').forEach((el) => {
    el.setAttribute(MARK, '1');
    el.classList.remove('light');
  });
  // `.service-box` 在 light 模式下反而没有 `.dark`，dark 模式要显式标记
  document.querySelectorAll('.service-box').forEach((el) => el.classList.add('dark'));
}

function restoreLightClasses() {
  document.querySelectorAll(`[${MARK}]`).forEach((el) => {
    el.classList.add('light');
    el.removeAttribute(MARK);
  });
  document.querySelectorAll('.service-box').forEach((el) => el.classList.remove('dark'));
}

function applyDark() {
  document.body.classList.add('dark');
  stripLightClasses();
  setMoonSunOffset(DARK_OFFSET);
  localStorage.setItem('theme', 'dark');
}

function applyLight() {
  document.body.classList.remove('dark');
  restoreLightClasses();
  setMoonSunOffset(0);
  localStorage.setItem('theme', 'light');
}

export function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  if (saved === 'dark') {
    applyDark();
  } else {
    setMoonSunOffset(0);
    localStorage.setItem('theme', 'light');
  }
}

export function bindThemeToggle() {
  const btn = document.getElementById('theme-icon');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (localStorage.getItem('theme') === 'dark') {
      applyLight();
    } else {
      applyDark();
    }
  });
}
