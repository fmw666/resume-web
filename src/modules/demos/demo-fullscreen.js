/**
 * 全屏 media viewer：负责显示当前 media（image / video）、切换/缩放、
 * 打开关闭、键盘和箭头按钮导航。不关心卡片渲染，也不直接操作 Arc 面板
 * —— Arc 的渲染/高亮通过注入的 `arc` 对象暴露。
 */

function buildMediaList(demo) {
  const list = [];
  demo.images.forEach((src) => list.push({ type: 'image', src }));
  demo.videos.forEach((src) => list.push({ type: 'video', src }));
  return list;
}

/**
 * @param {object} opts
 * @param {HTMLElement} opts.viewer   全屏 viewer 根 `#project-viewer`
 * @param {ReturnType<import('./demo-arc.js').createArcController>} opts.arc
 */
export function createFullscreenViewer({ viewer, arc }) {
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

  let currentIndex = 0;
  let mediaList = [];

  const exitZoom = () => dvMain.classList.remove('is-zoomed');
  const toggleZoom = () => dvMain.classList.toggle('is-zoomed');

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
      // force reflow so the transition re-fires
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
    arc.setActive(currentIndex);
  }

  function open(demo) {
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

    arc.render(demo, mediaList);
    showMedia(0);

    viewer.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    arc.showWithAutohide();
  }

  function close() {
    viewer.classList.remove('is-open');
    document.body.style.overflow = '';
    dvVideo.pause();
    dvVideo.removeAttribute('src');
    dvImg.removeAttribute('src');
    exitZoom();
    arc.reset();
  }

  function navPrev() {
    if (mediaList.length <= 1) return;
    showMedia((currentIndex - 1 + mediaList.length) % mediaList.length);
  }
  function navNext() {
    if (mediaList.length <= 1) return;
    showMedia((currentIndex + 1) % mediaList.length);
  }

  dvClose.addEventListener('click', close);
  viewer.querySelector('.dv-backdrop').addEventListener('click', close);
  dvImg.addEventListener('click', (e) => { e.stopPropagation(); toggleZoom(); });
  dvPrev.addEventListener('click', (e) => { e.stopPropagation(); navPrev(); });
  dvNext.addEventListener('click', (e) => { e.stopPropagation(); navNext(); });

  document.addEventListener('keydown', (e) => {
    if (!viewer.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') navPrev();
    if (e.key === 'ArrowRight') navNext();
  });

  return {
    open,
    close,
    showMedia,
  };
}
