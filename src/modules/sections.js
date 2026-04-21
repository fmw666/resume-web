/**
 * HTML section 注入器。
 *
 * 以前是 Python 脚本 create_index_html.py 在构建期把多个 section
 * 片段拼进 index.html。现在交给 Vite：用 `?raw` 把每个 section 的
 * HTML 作为字符串导入，运行时按顺序拼进 <main id="main">，Vite 会
 * 把资源引用和依赖一起打包 & 压缩。
 *
 * 顺序和原先 `sections = [...]` 数组保持一致。
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

  // 追加到 spacer 之后（原结构中 main 里已经有一个 .spacer 占位）
  const frag = document.createDocumentFragment();
  const container = document.createElement('div');
  container.innerHTML = SECTIONS_IN_ORDER.join('\n');
  while (container.firstChild) {
    frag.appendChild(container.firstChild);
  }
  root.appendChild(frag);
}
