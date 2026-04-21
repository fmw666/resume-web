#!/usr/bin/env node
/**
 * 端到端冒烟测试：用 Puppeteer 驱动一个真实浏览器加载 preview server，
 * 断言站点的 12 个关键行为。任何一条失败 → 退出码 1，CI 会 fail。
 *
 * 用法：
 *   npm run build && npm run preview &   # 先把 preview 跑起来
 *   node scripts/smoke.mjs
 *
 * 环境变量：
 *   SMOKE_URL        测试目标，默认 http://localhost:4173/
 *   SMOKE_CHROME     Chrome 可执行路径，默认 /usr/local/bin/google-chrome
 *   SMOKE_TIMEOUT    页面加载超时（ms），默认 30000
 */

import puppeteer from 'puppeteer-core';

const URL = process.env.SMOKE_URL || 'http://localhost:4173/';
const CHROME = process.env.SMOKE_CHROME || '/usr/local/bin/google-chrome';
const TIMEOUT = Number(process.env.SMOKE_TIMEOUT || 30000);

const failures = [];

function assert(cond, label) {
  if (cond) {
    console.log(`  ok   ${label}`);
  } else {
    console.log(`  FAIL ${label}`);
    failures.push(label);
  }
}

function assertEq(actual, expected, label) {
  const ok = actual === expected;
  if (ok) {
    console.log(`  ok   ${label} (= ${JSON.stringify(expected)})`);
  } else {
    console.log(`  FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failures.push(label);
  }
}

function assertGte(actual, min, label) {
  const ok = actual >= min;
  if (ok) {
    console.log(`  ok   ${label} (${actual} >= ${min})`);
  } else {
    console.log(`  FAIL ${label}: expected >= ${min}, got ${actual}`);
    failures.push(label);
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Chatbot / 第三方域名我们不追究它们是否可达，只关心自家代码。
function isThirdParty(url) {
  return url.includes('botpress') || url.includes('bpcontent.cloud') || url.includes('formspree');
}

async function main() {
  console.log(`# Smoke test against ${URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const runtimeErrors = [];
  const consoleErrors = [];
  const requestFailures = [];

  page.on('pageerror', (err) => runtimeErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (isThirdParty(url)) return;
    requestFailures.push(`${url} -> ${req.failure()?.errorText}`);
  });

  await page.goto(`${URL}?code=990718`, { waitUntil: 'load', timeout: TIMEOUT });
  // 等 vendor 脚本链加载 + preloader 淡出
  await sleep(3000);

  // ── 1) DOM 结构完整 ─────────────────────────────
  console.log('\n[1] DOM sections injected');
  const domInfo = await page.evaluate(() => ({
    home: !!document.getElementById('home'),
    agent: !!document.getElementById('agent'),
    about: !!document.getElementById('about'),
    services: !!document.getElementById('services'),
    experience: !!document.getElementById('experience'),
    works: !!document.getElementById('works'),
    projects: !!document.getElementById('projects'),
    blog: !!document.getElementById('blog'),
    contact: !!document.getElementById('contact'),
  }));
  for (const [k, v] of Object.entries(domInfo)) {
    assert(v, `section #${k} exists`);
  }

  // ── 2) 核心 vendor 已加载 ────────────────────────
  console.log('\n[2] Core vendor scripts loaded');
  const vendors = await page.evaluate(() => ({
    jquery: typeof window.jQuery === 'function',
    wow: typeof window.WOW === 'function',
    parallax: typeof window.Parallax === 'function',
    morphext: !!(window.jQuery && window.jQuery.fn.Morphext),
    counterup: !!(window.jQuery && window.jQuery.fn.counterUp),
    waypoint: typeof window.Waypoint === 'function',
  }));
  for (const [k, v] of Object.entries(vendors)) {
    assert(v, `vendor '${k}' is available`);
  }

  // ── 3) 数据渲染数量对得上 ────────────────────────
  console.log('\n[3] Data-driven render counts');
  const counts = await page.evaluate(() => ({
    demoCards: document.querySelectorAll('.demo-card').length,
    portfolioItems: document.querySelectorAll('.grid-item').length,
  }));
  assertEq(counts.demoCards, 12, 'Projects demo cards');
  assertGte(counts.portfolioItems, 7, 'Works portfolio items (page 1)');

  // ── 4) 隐私控制：?code=990718 显示 experience ───
  console.log('\n[4] Privacy gate (code=990718)');
  const expVisible = await page.evaluate(() => {
    const e = document.getElementById('experience');
    return !!e && getComputedStyle(e).display !== 'none';
  });
  assert(expVisible, 'Experience section visible with valid code');

  // ── 5) Portfolio 懒加载触发 ─────────────────────
  console.log('\n[5] Portfolio lazy-load on scroll');
  await page.evaluate(() => {
    document.getElementById('works')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(2500);
  const lazyPlugins = await page.evaluate(() => ({
    isotope: !!(window.jQuery && window.jQuery.fn.isotope),
    magnific: !!(window.jQuery && window.jQuery.fn.magnificPopup),
  }));
  assert(lazyPlugins.isotope, 'isotope registered on jQuery after scroll');
  assert(lazyPlugins.magnific, 'magnificPopup registered on jQuery after scroll');

  // ── 6) Demo viewer 交互 ────────────────────────
  console.log('\n[6] Demo viewer interaction');
  await page.evaluate(() => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(300);
  await page.evaluate(() => document.querySelector('.demo-card')?.click());
  await sleep(500);
  const viewer = await page.evaluate(() => ({
    open: document.getElementById('project-viewer')?.classList.contains('is-open'),
    hasImg: !!document.querySelector('.dv-img.is-active'),
    title: document.querySelector('.dv-info-title')?.textContent || '',
  }));
  assert(viewer.open, 'demo viewer is open after clicking a card');
  assert(viewer.hasImg, 'demo viewer shows an active image');
  assert(viewer.title.length > 0, 'demo viewer has a title');
  await page.evaluate(() => document.querySelector('.dv-close')?.click());
  await sleep(200);

  // ── 6b) For-Your-Agent: 点击 copy 按钮 → 按钮标记为 is-copied ────
  console.log('\n[6b] Agent clipboard copy button');
  await page.evaluate(() => {
    document.getElementById('agent')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(200);
  // 注入一个 clipboard polyfill，避免 headless chrome 无权限时直接抛
  await page.evaluate(() => {
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.resolve() },
      });
    }
  });
  await page.evaluate(() => document.getElementById('agent-copy-btn')?.click());
  await sleep(100);
  const copiedFlash = await page.evaluate(() => {
    const btn = document.getElementById('agent-copy-btn');
    return !!btn && btn.classList.contains('is-copied');
  });
  assert(copiedFlash, 'agent copy button toggles .is-copied after click');

  // ── 7) 主题切换写入 localStorage + body class ───
  console.log('\n[7] Theme toggle');
  const themeBefore = await page.evaluate(() => localStorage.getItem('theme'));
  await page.evaluate(() => document.getElementById('theme-icon')?.click());
  await sleep(300);
  const themed = await page.evaluate(() => ({
    theme: localStorage.getItem('theme'),
    bodyDark: document.body.classList.contains('dark'),
  }));
  assert(themeBefore !== themed.theme, `theme flipped (${themeBefore} -> ${themed.theme})`);
  assert(themed.bodyDark || themed.theme === 'light', 'theme state consistent');

  // ── 8) Preloader 已消失 ────────────────────────
  console.log('\n[8] Preloader hidden');
  const preloader = await page.evaluate(() => {
    const el = document.getElementById('preloader');
    if (!el) return { hidden: true };
    const style = getComputedStyle(el);
    return {
      hidden: style.display === 'none' || style.opacity === '0',
      opacity: el.style.opacity,
      display: style.display,
    };
  });
  assert(preloader.hidden, `preloader hidden (opacity=${preloader.opacity}, display=${preloader.display})`);

  // ── 9) 运行时零错误 / 零请求失败 ────────────────
  console.log('\n[9] Runtime cleanliness');
  assertEq(runtimeErrors.length, 0, `no pageerror (got ${runtimeErrors.length})`);
  assertEq(consoleErrors.length, 0, `no console.error (got ${consoleErrors.length})`);
  assertEq(requestFailures.length, 0, `no failed same-origin requests (got ${requestFailures.length})`);
  if (runtimeErrors.length) console.log('  pageerror:', runtimeErrors);
  if (consoleErrors.length) console.log('  console.error:', consoleErrors);
  if (requestFailures.length) console.log('  requestfailed:', requestFailures);

  await browser.close();

  console.log('');
  if (failures.length === 0) {
    console.log(`PASS — all assertions green.`);
    process.exit(0);
  } else {
    console.log(`FAIL — ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(2);
});
