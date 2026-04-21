/**
 * Full-screen viewer 里的 Arc-shaped 缩略图面板。
 *
 * 给定一个容器 `.dv-arc-panel` 和触发区 `.dv-arc-trigger`，
 * 返回一个控制器用于：
 *   - 按媒体列表渲染缩略图并弧形排布
 *   - 自动显示 / 闲置后自动隐藏（鼠标悬停会重置计时）
 *   - 高亮当前选中项
 *   - 点击缩略图时调用 `onSelect(i)` 回调
 */

const ARC_HIDE_DELAY = 3000;
const ARC_RADIUS = 420;
const ARC_MAX_ANGLE = 18;

function calcArcTransform(i, total) {
  if (total <= 1) return 'rotate(0deg) translateX(0px)';
  const mid = (total - 1) / 2;
  const t = (i - mid) / Math.max(mid, 1);
  const angle = t * ARC_MAX_ANGLE;
  const rad = (angle * Math.PI) / 180;
  const dx = ARC_RADIUS * (1 - Math.cos(rad));
  return `rotate(${(-angle).toFixed(1)}deg) translateX(${dx.toFixed(0)}px)`;
}

/**
 * @param {object} opts
 * @param {HTMLElement} opts.panel       `.dv-arc-panel`
 * @param {HTMLElement} opts.list        `.dv-arc-list`（缩略图插入此处）
 * @param {HTMLElement} opts.trigger     `.dv-arc-trigger`（hover 区）
 * @param {HTMLElement} opts.viewer      全屏 viewer 根，用来判断 is-open
 * @param {(i: number) => void} opts.onSelect
 */
export function createArcController({ panel, list, trigger, viewer, onSelect }) {
  let timer = null;
  let mediaList = [];
  let currentIndex = 0;

  const show = () => panel.classList.add('is-visible');
  const hide = () => panel.classList.remove('is-visible');

  function clearTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
  }
  function scheduleHide() {
    clearTimer();
    timer = setTimeout(hide, ARC_HIDE_DELAY);
  }

  function render(demo, newMediaList) {
    mediaList = newMediaList;
    list.innerHTML = '';
    if (mediaList.length <= 1) {
      panel.classList.remove('is-visible');
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
        onSelect(i);
        scheduleHide();
      });
      thumb.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.12) rotate(0deg) translateX(0px)';
        this.style.zIndex = '5';
      });
      thumb.addEventListener('mouseleave', function () {
        const idx = Array.prototype.indexOf.call(list.children, this);
        this.style.transform = calcArcTransform(idx, n);
        this.style.zIndex = '';
      });

      thumb.style.opacity = '0';
      thumb.style.transform = `translateX(40px) ${calcArcTransform(i, n)}`;
      list.appendChild(thumb);

      // staggered fly-in
      setTimeout(() => {
        thumb.style.opacity = '1';
        thumb.style.transform = calcArcTransform(i, n);
      }, 80 + i * 60);
    });
  }

  function setActive(index) {
    currentIndex = index;
    const thumbs = list.querySelectorAll('.dv-thumb');
    const n = thumbs.length;
    for (let i = 0; i < n; i += 1) {
      thumbs[i].classList.toggle('is-active', i === currentIndex);
      thumbs[i].style.transform = calcArcTransform(i, n);
    }
  }

  // hover interaction
  trigger.addEventListener('mouseenter', () => {
    if (mediaList.length > 1) { show(); clearTimer(); }
  });
  panel.addEventListener('mouseenter', clearTimer);
  panel.addEventListener('mouseleave', () => {
    if (viewer.classList.contains('is-open') && mediaList.length > 1) {
      scheduleHide();
    }
  });

  return {
    render,
    setActive,
    showWithAutohide() {
      if (mediaList.length > 1) {
        show();
        scheduleHide();
      }
    },
    reset() {
      clearTimer();
      hide();
    },
  };
}
