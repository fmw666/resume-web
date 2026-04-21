/**
 * 主题切换（light / dark）。
 *
 * 策略：初始化时把 localStorage 里的主题应用到 DOM，然后绑定切换按钮。
 * 为了兼容原先的 CSS（依赖大量 `.light` 类），这里保留同样的切换逻辑，
 * 只是用原生 DOM 代替 jQuery。
 */

const DARK_OFFSET = 30;

function applyTheme(theme) {
  if (theme === 'dark') {
    document.querySelectorAll('.light').forEach((el) => el.classList.remove('light'));
    document.body.classList.add('dark');
    document.querySelectorAll('.service-box').forEach((el) => el.classList.add('dark'));
    setMoonSunOffset(DARK_OFFSET);
  } else {
    setMoonSunOffset(0);
  }
  localStorage.setItem('theme', theme === 'dark' ? 'dark' : 'light');
}

function setMoonSunOffset(px) {
  const icon = document.querySelector('#theme-icon .moon-sun');
  if (icon) icon.style.transform = `translateX(${px}px)`;
}

// 切换时需要把之前 removeClass('light') 的大量选择器再补回来
const LIGHT_RESTORE_SELECTORS = [
  '.spacer',
  '#preloader',
  'header.desktop-header-1',
  'header.mobile-header-1',
  'main.content',
  '.scroll-down',
  '.content section',
  '.btn-default',
  '.fact-item .number em',
  '.shadow-dark',
  '.desktop-header-3 .dropdown-menu',
  '.form-control',
  '.form-control:focus',
  '.skill-item .skill-info h4',
  '.service-box h3',
  '.timeline .content h3',
  '.portfolio-filter li.list-inline-item',
  '.price-item h2.plan',
  'section h2, section h3, section h4',
  '.blog-item .category',
  '.blog-item .details h4.title a',
];

function restoreLightClasses() {
  LIGHT_RESTORE_SELECTORS.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => el.classList.add('light'));
  });
}

function toggleTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.remove('dark');
    document.querySelectorAll('.service-box').forEach((el) => el.classList.remove('dark'));
    restoreLightClasses();
    localStorage.setItem('theme', 'light');
    setMoonSunOffset(0);
  } else {
    document.body.classList.add('dark');
    document.querySelectorAll('.service-box').forEach((el) => el.classList.add('dark'));
    document.querySelectorAll('.light').forEach((el) => el.classList.remove('light'));
    localStorage.setItem('theme', 'dark');
    setMoonSunOffset(DARK_OFFSET);
  }
}

export function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  applyTheme(saved);
}

export function bindThemeToggle() {
  const btn = document.getElementById('theme-icon');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
  });
}
