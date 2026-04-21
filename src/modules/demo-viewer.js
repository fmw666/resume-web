/**
 * 全屏 demo viewer（Masonry cards + Arc thumb panel）。
 *
 * 纯原生 JS、无 jQuery 依赖，直接从原 assets/js/demo-viewer.js 移植过来。
 */
import { DEMOS } from './demos-data.js';

let inited = false;

export function initDemoViewer() {
  if (inited) return;
  inited = true;

  const grid = document.getElementById('project-grid');
  const viewer = document.getElementById('project-viewer');
  if (!grid || !viewer) return;

  const dvMain = viewer.querySelector('.dv-main');
  const dvImg = viewer.querySelector('.dv-img');
  const dvVideo = viewer.querySelector('.dv-video');
  const dvTitle = viewer.querySelector('.dv-info-title');
  const dvDesc = viewer.querySelector('.dv-info-desc');
  const dvLink = viewer.querySelector('.dv-info-link');
  const dvLinkSpan = dvLink.querySelector('span');
  const dvClose = viewer.querySelector('.dv-close');
  const dvPrev = viewer.querySelector('.dv-prev');
  const dvNext = viewer.querySelector('.dv-next');
  const arcPanel = viewer.querySelector('.dv-arc-panel');
  const arcList = viewer.querySelector('.dv-arc-list');
  const arcTrigger = viewer.querySelector('.dv-arc-trigger');

  let currentIndex = 0;
  let mediaList = [];
  let arcTimer = null;
  const ARC_HIDE_DELAY = 3000;
  const ARC_RADIUS = 420;
  const ARC_MAX_ANGLE = 18;

  function getColCount() {
    const w = window.innerWidth;
    if (w <= 575) return 1;
    if (w <= 991) return 2;
    return 3;
  }

  function buildCard(demo) {
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

    card.addEventListener('click', () => openViewer(demo));

    item.appendChild(card);
    return item;
  }

  function renderCards() {
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
      cols[i % colCount].appendChild(buildCard(demo));
    });
  }

  function buildMediaList(demo) {
    const list = [];
    demo.images.forEach((src) => list.push({ type: 'image', src }));
    demo.videos.forEach((src) => list.push({ type: 'video', src }));
    return list;
  }

  function calcArcTransform(i, total) {
    if (total <= 1) return 'rotate(0deg) translateX(0px)';
    const mid = (total - 1) / 2;
    const t = (i - mid) / Math.max(mid, 1);
    const angle = t * ARC_MAX_ANGLE;
    const rad = (angle * Math.PI) / 180;
    const dx = ARC_RADIUS * (1 - Math.cos(rad));
    return `rotate(${(-angle).toFixed(1)}deg) translateX(${dx.toFixed(0)}px)`;
  }

  function exitZoom() { dvMain.classList.remove('is-zoomed'); }
  function toggleZoom() { dvMain.classList.toggle('is-zoomed'); }

  function showMedia(index) {
    currentIndex = index;
    const m = mediaList[index];
    if (!m) return;

    dvVideo.pause();
    dvVideo.removeAttribute('src');
    dvImg.classList.remove('is-active');
    dvVideo.classList.remove('is-active');
    exitZoom();

    if (m.type === 'image') {
      dvImg.removeAttribute('src');
      // 强制 reflow 以便再次触发过渡
      // eslint-disable-next-line no-unused-expressions
      dvImg.offsetHeight;
      dvImg.src = m.src;
      dvImg.classList.add('is-active');
    } else {
      dvVideo.src = m.src;
      dvVideo.classList.add('is-active');
    }

    dvPrev.classList.toggle('is-hidden', mediaList.length <= 1);
    dvNext.classList.toggle('is-hidden', mediaList.length <= 1);
    updateArcActive();
  }

  function buildArcThumbs(demo) {
    arcList.innerHTML = '';
    if (mediaList.length <= 1) {
      arcPanel.classList.remove('is-visible');
      return;
    }
    const n = mediaList.length;
    mediaList.forEach((m, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'dv-thumb';
      if (i === 0) thumb.classList.add('is-active');
      thumb.style.transform = calcArcTransform(i, n);

      const tImg = document.createElement('img');
      tImg.src = m.type === 'image' ? m.src : demo.images[0];
      tImg.alt = '';
      tImg.loading = 'lazy';
      thumb.appendChild(tImg);

      if (m.type === 'video') {
        const play = document.createElement('div');
        play.className = 'dv-thumb-play';
        play.innerHTML = '<i class="fas fa-play"></i>';
        thumb.appendChild(play);
      }

      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        showMedia(i);
        scheduleArcHide();
      });

      thumb.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.12) rotate(0deg) translateX(0px)';
        this.style.zIndex = '5';
      });
      thumb.addEventListener('mouseleave', function () {
        const idx = Array.prototype.indexOf.call(arcList.children, this);
        this.style.transform = calcArcTransform(idx, n);
        this.style.zIndex = '';
      });

      thumb.style.opacity = '0';
      thumb.style.transform = `translateX(40px) ${calcArcTransform(i, n)}`;
      arcList.appendChild(thumb);

      const el = thumb;
      const idx = i;
      const count = n;
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = calcArcTransform(idx, count);
      }, 80 + idx * 60);
    });
  }

  function updateArcActive() {
    const thumbs = arcList.querySelectorAll('.dv-thumb');
    const n = thumbs.length;
    for (let i = 0; i < n; i += 1) {
      thumbs[i].classList.toggle('is-active', i === currentIndex);
      thumbs[i].style.transform = calcArcTransform(i, n);
    }
  }

  function showArc() { arcPanel.classList.add('is-visible'); }
  function hideArc() { arcPanel.classList.remove('is-visible'); }
  function clearArcTimer() {
    if (arcTimer) { clearTimeout(arcTimer); arcTimer = null; }
  }
  function scheduleArcHide() {
    clearArcTimer();
    arcTimer = setTimeout(hideArc, ARC_HIDE_DELAY);
  }

  function openViewer(demo) {
    mediaList = buildMediaList(demo);
    currentIndex = 0;

    dvTitle.textContent = demo.title;
    dvDesc.textContent = demo.desc;

    if (demo.url) {
      dvLink.href = demo.url;
      dvLinkSpan.textContent = demo.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      dvLink.classList.remove('is-hidden');
    } else {
      dvLink.classList.add('is-hidden');
    }

    buildArcThumbs(demo);
    showMedia(0);

    viewer.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    if (mediaList.length > 1) {
      showArc();
      scheduleArcHide();
    }
  }

  function closeViewer() {
    viewer.classList.remove('is-open');
    document.body.style.overflow = '';
    dvVideo.pause();
    dvVideo.removeAttribute('src');
    dvImg.removeAttribute('src');
    exitZoom();
    clearArcTimer();
    hideArc();
  }

  function navPrev() {
    if (mediaList.length <= 1) return;
    showMedia((currentIndex - 1 + mediaList.length) % mediaList.length);
  }
  function navNext() {
    if (mediaList.length <= 1) return;
    showMedia((currentIndex + 1) % mediaList.length);
  }

  // Event bindings
  dvClose.addEventListener('click', closeViewer);
  viewer.querySelector('.dv-backdrop').addEventListener('click', closeViewer);
  dvImg.addEventListener('click', (e) => { e.stopPropagation(); toggleZoom(); });
  dvPrev.addEventListener('click', (e) => { e.stopPropagation(); navPrev(); });
  dvNext.addEventListener('click', (e) => { e.stopPropagation(); navNext(); });

  document.addEventListener('keydown', (e) => {
    if (!viewer.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeViewer();
    if (e.key === 'ArrowLeft') navPrev();
    if (e.key === 'ArrowRight') navNext();
  });

  arcTrigger.addEventListener('mouseenter', () => {
    if (mediaList.length > 1) { showArc(); clearArcTimer(); }
  });
  arcPanel.addEventListener('mouseenter', clearArcTimer);
  arcPanel.addEventListener('mouseleave', () => {
    if (viewer.classList.contains('is-open') && mediaList.length > 1) {
      scheduleArcHide();
    }
  });

  renderCards();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderCards, 200);
  });
}
