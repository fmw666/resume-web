/**
 * Projects 区块入口 —— 把三个关注点组合起来：
 *   1. `demos/demo-masonry.js`   渲染卡片瀑布流
 *   2. `demos/demo-arc.js`       全屏 viewer 的 Arc 缩略图面板
 *   3. `demos/demo-fullscreen.js` 全屏 viewer 本体（切换/缩放/键盘导航）
 *
 * 这样 `demo-viewer` 文件本身非常薄（< 40 行），每个子模块各管一件事。
 */
import { renderMasonry } from './demos/demo-masonry.js';
import { createArcController } from './demos/demo-arc.js';
import { createFullscreenViewer } from './demos/demo-fullscreen.js';

let inited = false;

export function initDemoViewer() {
  if (inited) return;
  inited = true;

  const grid = document.getElementById('project-grid');
  const viewer = document.getElementById('project-viewer');
  if (!grid || !viewer) return;

  const arc = createArcController({
    panel: viewer.querySelector('.dv-arc-panel'),
    list: viewer.querySelector('.dv-arc-list'),
    trigger: viewer.querySelector('.dv-arc-trigger'),
    viewer,
    onSelect: (i) => fullscreen.showMedia(i),
  });

  const fullscreen = createFullscreenViewer({ viewer, arc });

  renderMasonry(grid, (demo) => fullscreen.open(demo));
}
