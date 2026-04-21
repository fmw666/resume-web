#!/usr/bin/env node
/**
 * 静态结构检查：不启动浏览器，只看文件 & 源码。
 *
 * 作用：在 CI 最早期就拦住"某个必需文件被误删 / 某个模块没被组装进 main.js"
 * 这一类低级结构回归。任何一项失败 → 退出码 1。
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const failures = [];

function must(cond, label) {
  if (cond) {
    console.log(`  ok   ${label}`);
  } else {
    console.log(`  FAIL ${label}`);
    failures.push(label);
  }
}

function fileExists(p) {
  try {
    return statSync(join(ROOT, p)).isFile();
  } catch {
    return false;
  }
}

function dirExists(p) {
  try {
    return statSync(join(ROOT, p)).isDirectory();
  } catch {
    return false;
  }
}

// ── 1) 关键入口文件 ───────────────────────────────
console.log('[1] Entry files present');
[
  'package.json',
  'vite.config.js',
  'index.html',
  'src/main.js',
].forEach((p) => must(fileExists(p), `file: ${p}`));

// ── 2) 必需的业务模块 ─────────────────────────────
console.log('\n[2] Business modules present');
const REQUIRED_MODULES = [
  'jquery-global.js',
  'sections.js',
  'theme.js',
  'preloader.js',
  'navigation.js',
  'animations.js',
  'self-intro.js',
  'agent.js',
  'portfolio.js',
  'testimonials.js',
  'contact.js',
  'chatbot.js',
  'privacy.js',
  'demo-viewer.js',
  'demos-data.js',
  'vendor-loader.js',
];
REQUIRED_MODULES.forEach((m) => {
  must(fileExists(`src/modules/${m}`), `module: src/modules/${m}`);
});

// ── 3) 所有 section html 齐全 ────────────────────
console.log('\n[3] Section HTML partials present');
const REQUIRED_SECTIONS = [
  'home.html',
  'agent.html',
  'about.html',
  'services.html',
  'experience.html',
  'works.html',
  'works-page-2.html',
  'projects.html',
  'blog.html',
  'contact.html',
];
REQUIRED_SECTIONS.forEach((s) => {
  must(fileExists(`src/sections/${s}`), `section: src/sections/${s}`);
});

// ── 4) public/assets 必需资源（老 vendor + 样式）──
console.log('\n[4] public/assets required files present');
[
  'public/assets/css/style.css',
  'public/assets/css/bootstrap.min.css',
  'public/assets/js/wow.min.js',
  'public/assets/js/parallax.min.js',
  'public/assets/js/morphext.min.js',
  'public/assets/js/jquery.counterup.min.js',
  'public/assets/js/jquery.waypoints.min.js',
  'public/assets/js/jquery.easing.min.js',
  'public/assets/js/popper.min.js',
  'public/assets/js/bootstrap.min.js',
  'public/assets/js/isotope.pkgd.min.js',
  'public/assets/js/imagesloaded.pkgd.min.js',
  'public/assets/js/jquery.magnific-popup.min.js',
  'public/assets/js/infinite-scroll.min.js',
  'public/assets/js/slick.min.js',
  'public/assets/js/validator.js',
  'public/assets/images/logo.png',
  'public/assets/images/avatar.png',
  'public/assets/audios/self-intro.mp3',
].forEach((p) => must(fileExists(p), `asset: ${p}`));

// ── 5) main.js 必须引用所有业务模块 ──────────────
// 注释掉的 import 不算数。先剥掉 // 行注释和 /* */ 块注释，再检查
// 剩下的源码里是否存在对应模块路径的字符串字面量。
console.log('\n[5] main.js wires every business module');
const mainSrc = readFileSync(join(ROOT, 'src/main.js'), 'utf8');
const strippedMain = mainSrc
  .replace(/\/\*[\s\S]*?\*\//g, '')     // 块注释
  .replace(/^[ \t]*\/\/.*$/gm, '');     // 行注释

function hasRealImport(modulePath) {
  return strippedMain.includes(`'${modulePath}'`) || strippedMain.includes(`"${modulePath}"`);
}

[
  './modules/jquery-global.js',
  './modules/sections.js',
  './modules/theme.js',
  './modules/preloader.js',
  './modules/navigation.js',
  './modules/animations.js',
  './modules/self-intro.js',
  './modules/agent.js',
  './modules/portfolio.js',
  './modules/testimonials.js',
  './modules/contact.js',
  './modules/chatbot.js',
  './modules/privacy.js',
  './modules/demo-viewer.js',
].forEach((p) => {
  must(hasRealImport(p), `main.js imports ${p}`);
});

// ── 6) sections.js 必须按既定顺序引用 8 个区块 ────
console.log('\n[6] sections.js imports the 8 canonical page sections in order');
const sectionsSrc = readFileSync(join(ROOT, 'src/modules/sections.js'), 'utf8');
const SECTION_ORDER = ['home', 'agent', 'about', 'services', 'experience', 'works', 'projects', 'blog', 'contact'];
let lastIndex = -1;
let orderOk = true;
for (const name of SECTION_ORDER) {
  const needle = `sections/${name}.html?raw`;
  const at = sectionsSrc.indexOf(needle);
  if (at < 0) {
    must(false, `sections.js imports ${needle}`);
    orderOk = false;
  } else if (at < lastIndex) {
    orderOk = false;
  }
  lastIndex = at;
}
must(orderOk, 'sections imports appear in canonical order');

// ── 7) index.html 必须挂载 main.js 作为 ES module ─
console.log('\n[7] index.html wires /src/main.js');
const indexSrc = readFileSync(join(ROOT, 'index.html'), 'utf8');
must(
  /<script[^>]+type=["']module["'][^>]+src=["']\/src\/main\.js["']/.test(indexSrc),
  'index.html <script type="module" src="/src/main.js">',
);
must(indexSrc.includes('id="main"'), 'index.html has <main id="main">');
must(indexSrc.includes('id="preloader"'), 'index.html has #preloader');

// ── 8) package.json 的 scripts 有 build / preview / test ─
console.log('\n[8] package.json scripts cover build / preview / test');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
['dev', 'build', 'preview', 'test', 'test:static', 'test:smoke'].forEach((s) => {
  must(!!(pkg.scripts && pkg.scripts[s]), `package.json scripts.${s}`);
});

// ── Summary ──────────────────────────────────────
console.log('');
if (failures.length === 0) {
  console.log('PASS — project structure is intact.');
  process.exit(0);
} else {
  console.log(`FAIL — ${failures.length} structural assertion(s) failed:`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
