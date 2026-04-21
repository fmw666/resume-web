import puppeteer from 'puppeteer-core';

const URL = 'http://localhost:4173/?code=990718';

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new',
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

const errors = [];
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
});
page.on('requestfailed', (req) => {
  // 忽略 Botpress iframe 可能的网络失败
  const u = req.url();
  if (u.includes('botpress') || u.includes('cdn.bp')) return;
  errors.push(`[requestfailed] ${u} -> ${req.failure()?.errorText}`);
});

await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
await new Promise((r) => setTimeout(r, 2000));

// 测试 privacy 控制：code=990718 应显示 experience
const experienceVisible = await page.evaluate(() => {
  const e = document.getElementById('experience');
  if (!e) return false;
  return getComputedStyle(e).display !== 'none';
});

// 滚动到 works 触发懒加载
await page.evaluate(() => {
  document.getElementById('works')?.scrollIntoView({ behavior: 'instant', block: 'start' });
});
await new Promise((r) => setTimeout(r, 2500));

const worksState = await page.evaluate(() => ({
  hasIsotope: !!(window.jQuery && window.jQuery.fn.isotope),
  hasMagnificPopup: !!(window.jQuery && window.jQuery.fn.magnificPopup),
  isotopeInitialized: document.querySelector('.portfolio-wrapper.isotope') !== null ||
                       document.querySelector('.portfolio-wrapper')?.className.includes('isotope'),
  itemsRendered: document.querySelectorAll('.grid-item').length,
}));

// 滚动到 testimonials (注意原项目的 testimonials 没加到 sections 数组中，所以 Projects 之后是 blog)
// 测试 demo viewer: 点第一个 demo card
await page.evaluate(() => {
  document.getElementById('projects')?.scrollIntoView({ behavior: 'instant', block: 'start' });
});
await new Promise((r) => setTimeout(r, 500));

await page.evaluate(() => {
  document.querySelector('.demo-card')?.click();
});
await new Promise((r) => setTimeout(r, 500));

const demoViewerState = await page.evaluate(() => {
  const v = document.getElementById('project-viewer');
  return {
    isOpen: v ? v.classList.contains('is-open') : false,
    hasActiveImg: !!document.querySelector('.dv-img.is-active'),
    title: document.querySelector('.dv-info-title')?.textContent,
  };
});

// close viewer
await page.evaluate(() => {
  document.querySelector('.dv-close')?.click();
});
await new Promise((r) => setTimeout(r, 300));

// 切换主题（用 JS click 绕开可能的覆盖层）
const themeBefore = await page.evaluate(() => localStorage.getItem('theme'));
await page.evaluate(() => document.getElementById('theme-icon')?.click());
await new Promise((r) => setTimeout(r, 300));
const themeAfter = await page.evaluate(() => localStorage.getItem('theme'));
const bodyHasDark = await page.evaluate(() => document.body.classList.contains('dark'));

console.log(JSON.stringify({ experienceVisible, worksState, demoViewerState, themeBefore, themeAfter, bodyHasDark }, null, 2));

if (errors.length) {
  console.log('\n--- ERRORS ---');
  for (const e of errors) console.log(e);
  process.exitCode = 1;
} else {
  console.log('\nNo errors.');
}

await browser.close();
