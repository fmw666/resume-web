/**
 * Projects 区块的 Masonry 卡片渲染。
 *
 * 只负责把 `DEMOS` 数据渲染成 3 列 / 2 列 / 1 列的瀑布流，以及
 * 在窗口 resize 时重排。点击卡片时通过回调把 demo 传出去给 Viewer。
 */
import { DEMOS } from '../demos-data.js';

function getColCount() {
  const w = window.innerWidth;
  if (w <= 575) return 1;
  if (w <= 991) return 2;
  return 3;
}

function buildCard(demo, onOpen) {
  const item = document.createElement('div');
  item.className = 'demo-masonry-item';

  const card = document.createElement('div');
  card.className = 'demo-card';

  const img = document.createElement('img');
  img.src = demo.images[0];
  img.alt = demo.title;
  img.loading = 'lazy';
  card.appendChild(img);

  const total = demo.images.length + demo.videos.length;
  if (total > 1) {
    const mc = document.createElement('span');
    mc.className = 'demo-media-count';
    const parts = [];
    if (demo.images.length > 1) parts.push(`<i class="fas fa-image"></i> ${demo.images.length}`);
    if (demo.videos.length > 0) parts.push(`<i class="fas fa-play-circle"></i> ${demo.videos.length}`);
    mc.innerHTML = parts.join('&nbsp;&nbsp;');
    card.appendChild(mc);
  }

  const overlay = document.createElement('div');
  overlay.className = 'demo-card-overlay';
  const content = document.createElement('div');
  content.className = 'demo-card-content';

  const h4 = document.createElement('h4');
  h4.className = 'demo-title';
  h4.textContent = demo.title;

  const p = document.createElement('p');
  p.className = 'demo-desc';
  p.textContent = demo.desc;

  content.appendChild(h4);
  content.appendChild(p);
  overlay.appendChild(content);
  card.appendChild(overlay);

  card.addEventListener('click', () => onOpen(demo));

  item.appendChild(card);
  return item;
}

/**
 * @param {HTMLElement} grid      `#project-grid` 容器
 * @param {(demo: any) => void} onOpen  点击卡片时调用
 * @returns {() => void}          取消 resize 监听（便于未来支持热重载）
 */
export function renderMasonry(grid, onOpen) {
  function render() {
    grid.innerHTML = '';
    const colCount = getColCount();
    const cols = [];
    for (let c = 0; c < colCount; c += 1) {
      const col = document.createElement('div');
      col.className = 'demo-masonry-col';
      cols.push(col);
      grid.appendChild(col);
    }
    DEMOS.forEach((demo, i) => {
      cols[i % colCount].appendChild(buildCard(demo, onOpen));
    });
  }

  render();

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 200);
  };
  window.addEventListener('resize', onResize);

  return () => {
    clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
  };
}
