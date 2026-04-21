/**
 * HTML section 注入器。
 *
 * 每个区块是独立 `.html` 片段，通过 Vite `?raw` 作为字符串编译进 bundle，
 * 运行时按顺序拼进 `<main id="main">`。改某个区块完全不会影响其他区块，
 * 想加新页面只需：
 *   1. 新建 `src/sections/<name>.html`
 *   2. 在 `SECTIONS_IN_ORDER` 里按期望顺序插入即可
 *
 * 性能细节：
 *   - 先用一个 `<template>` 做字符串→节点的一次性 parse，
 *   - 再把节点搬到 DocumentFragment 里一次性 `appendChild` 到 `<main>`，
 *   所以整个注入只触发一次 layout。
 */
import homeHtml from '../sections/home.html?raw';
import agentHtml from '../sections/agent.html?raw';
import aboutHtml from '../sections/about.html?raw';
import servicesHtml from '../sections/services.html?raw';
import experienceHtml from '../sections/experience.html?raw';
import worksHtml from '../sections/works.html?raw';
import projectsHtml from '../sections/projects.html?raw';
import blogHtml from '../sections/blog.html?raw';
import contactHtml from '../sections/contact.html?raw';

const SECTIONS_IN_ORDER = [
  homeHtml,
  agentHtml,
  aboutHtml,
  servicesHtml,
  experienceHtml,
  worksHtml,
  projectsHtml,
  blogHtml,
  contactHtml,
];

export function mountSections(target = '#main') {
  const root = document.querySelector(target);
  if (!root) return;

  const tpl = document.createElement('template');
  tpl.innerHTML = SECTIONS_IN_ORDER.join('\n');

  const frag = document.createDocumentFragment();
  while (tpl.content.firstChild) {
    frag.appendChild(tpl.content.firstChild);
  }
  root.appendChild(frag);
}
