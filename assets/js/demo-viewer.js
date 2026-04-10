(function () {
  'use strict';

  // ─── DOM refs ──────────────────────────────────────────
  var grid = document.getElementById('project-grid');
  var viewer = document.getElementById('project-viewer');
  if (!grid || !viewer) return;

  var dvMain = viewer.querySelector('.dv-main');
  var dvImg = viewer.querySelector('.dv-img');
  var dvVideo = viewer.querySelector('.dv-video');
  var dvTitle = viewer.querySelector('.dv-info-title');
  var dvDesc = viewer.querySelector('.dv-info-desc');
  var dvLink = viewer.querySelector('.dv-info-link');
  var dvLinkSpan = dvLink.querySelector('span');
  var dvClose = viewer.querySelector('.dv-close');
  var dvPrev = viewer.querySelector('.dv-prev');
  var dvNext = viewer.querySelector('.dv-next');
  var arcPanel = viewer.querySelector('.dv-arc-panel');
  var arcList = viewer.querySelector('.dv-arc-list');
  var arcTrigger = viewer.querySelector('.dv-arc-trigger');

  // ─── State ─────────────────────────────────────────────
  var currentDemo = null;
  var currentIndex = 0;     // index into the combined media array
  var mediaList = [];        // [{type:'image'|'video', src:...}, ...]
  var arcTimer = null;
  var ARC_HIDE_DELAY = 3000;

  // ─── 1. Render masonry cards ───────────────────────────
  function getColCount() {
    var w = window.innerWidth;
    if (w <= 575) return 1;
    if (w <= 991) return 2;
    return 3;
  }

  function buildCard(demo) {
    var item = document.createElement('div');
    item.className = 'demo-masonry-item';

    var card = document.createElement('div');
    card.className = 'demo-card';

    var img = document.createElement('img');
    img.src = demo.images[0];
    img.alt = demo.title;
    card.appendChild(img);

    var total = demo.images.length + demo.videos.length;
    if (total > 1) {
      var mc = document.createElement('span');
      mc.className = 'demo-media-count';
      var parts = [];
      if (demo.images.length > 1) parts.push('<i class="fas fa-image"></i> ' + demo.images.length);
      if (demo.videos.length > 0) parts.push('<i class="fas fa-play-circle"></i> ' + demo.videos.length);
      mc.innerHTML = parts.join('&nbsp;&nbsp;');
      card.appendChild(mc);
    }

    var overlay = document.createElement('div');
    overlay.className = 'demo-card-overlay';
    var content = document.createElement('div');
    content.className = 'demo-card-content';
    var h4 = document.createElement('h4');
    h4.className = 'demo-title';
    h4.textContent = demo.title;
    var p = document.createElement('p');
    p.className = 'demo-desc';
    p.textContent = demo.desc;
    content.appendChild(h4);
    content.appendChild(p);
    overlay.appendChild(content);
    card.appendChild(overlay);

    card.addEventListener('click', function () {
      openViewer(demo);
    });

    item.appendChild(card);
    return item;
  }

  function renderCards() {
    if (typeof DEMOS === 'undefined') return;
    grid.innerHTML = '';

    var colCount = getColCount();
    var cols = [];
    for (var c = 0; c < colCount; c++) {
      var col = document.createElement('div');
      col.className = 'demo-masonry-col';
      cols.push(col);
      grid.appendChild(col);
    }

    DEMOS.forEach(function (demo, i) {
      var item = buildCard(demo);
      cols[i % colCount].appendChild(item);
    });
  }

  // ─── 2. Fullscreen Viewer ──────────────────────────────
  function buildMediaList(demo) {
    var list = [];
    demo.images.forEach(function (src) { list.push({ type: 'image', src: src }); });
    demo.videos.forEach(function (src) { list.push({ type: 'video', src: src }); });
    return list;
  }

  function showMedia(index) {
    currentIndex = index;
    var m = mediaList[index];
    if (!m) return;

    dvVideo.pause();
    dvVideo.removeAttribute('src');
    dvImg.classList.remove('is-active');
    dvVideo.classList.remove('is-active');

    exitZoom();

    if (m.type === 'image') {
      dvImg.removeAttribute('src');
      void dvImg.offsetHeight;
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

  function openViewer(demo) {
    currentDemo = demo;
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

  function toggleZoom() {
    dvMain.classList.toggle('is-zoomed');
  }

  function exitZoom() {
    dvMain.classList.remove('is-zoomed');
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
    currentDemo = null;
  }

  function navPrev() {
    if (mediaList.length <= 1) return;
    var idx = (currentIndex - 1 + mediaList.length) % mediaList.length;
    showMedia(idx);
  }
  function navNext() {
    if (mediaList.length <= 1) return;
    var idx = (currentIndex + 1) % mediaList.length;
    showMedia(idx);
  }

  // ─── 3. Arc Panel ──────────────────────────────────────
  var ARC_RADIUS = 420;
  var ARC_MAX_ANGLE = 18;

  function calcArcTransform(i, total) {
    if (total <= 1) return 'rotate(0deg) translateX(0px)';
    var mid = (total - 1) / 2;
    var t = (i - mid) / Math.max(mid, 1);
    var angle = t * ARC_MAX_ANGLE;
    var rad = angle * Math.PI / 180;
    var dx = ARC_RADIUS * (1 - Math.cos(rad));
    return 'rotate(' + (-angle).toFixed(1) + 'deg) translateX(' + dx.toFixed(0) + 'px)';
  }

  function buildArcThumbs(demo) {
    arcList.innerHTML = '';
    if (mediaList.length <= 1) {
      arcPanel.classList.remove('is-visible');
      return;
    }

    var n = mediaList.length;
    mediaList.forEach(function (m, i) {
      var thumb = document.createElement('div');
      thumb.className = 'dv-thumb';
      if (i === 0) thumb.classList.add('is-active');
      thumb.style.transform = calcArcTransform(i, n);

      var tImg = document.createElement('img');
      tImg.src = m.type === 'image' ? m.src : demo.images[0];
      tImg.alt = '';
      tImg.loading = 'lazy';
      thumb.appendChild(tImg);

      if (m.type === 'video') {
        var play = document.createElement('div');
        play.className = 'dv-thumb-play';
        play.innerHTML = '<i class="fas fa-play"></i>';
        thumb.appendChild(play);
      }

      thumb.addEventListener('click', function (e) {
        e.stopPropagation();
        showMedia(i);
        scheduleArcHide();
      });

      thumb.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.12) rotate(0deg) translateX(0px)';
        this.style.zIndex = '5';
      });
      thumb.addEventListener('mouseleave', function () {
        var idx = Array.prototype.indexOf.call(arcList.children, this);
        this.style.transform = calcArcTransform(idx, n);
        this.style.zIndex = '';
      });

      thumb.style.opacity = '0';
      thumb.style.transform = 'translateX(40px) ' + calcArcTransform(i, n);
      arcList.appendChild(thumb);

      (function (el, idx, count) {
        setTimeout(function () {
          el.style.opacity = '1';
          el.style.transform = calcArcTransform(idx, count);
        }, 80 + idx * 60);
      })(thumb, i, n);
    });
  }

  function updateArcActiveTransforms() {
    var thumbs = arcList.querySelectorAll('.dv-thumb');
    var n = thumbs.length;
    for (var i = 0; i < n; i++) {
      thumbs[i].style.transform = calcArcTransform(i, n);
    }
  }

  function updateArcActive() {
    var thumbs = arcList.querySelectorAll('.dv-thumb');
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].classList.toggle('is-active', i === currentIndex);
    }
    updateArcActiveTransforms();
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

  // ─── 4. Event bindings ─────────────────────────────────
  dvClose.addEventListener('click', closeViewer);
  viewer.querySelector('.dv-backdrop').addEventListener('click', closeViewer);
  dvImg.addEventListener('click', function (e) { e.stopPropagation(); toggleZoom(); });
  dvPrev.addEventListener('click', function (e) { e.stopPropagation(); navPrev(); });
  dvNext.addEventListener('click', function (e) { e.stopPropagation(); navNext(); });

  document.addEventListener('keydown', function (e) {
    if (!viewer.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeViewer();
    if (e.key === 'ArrowLeft') navPrev();
    if (e.key === 'ArrowRight') navNext();
  });

  // arc trigger zone (right 40px edge)
  arcTrigger.addEventListener('mouseenter', function () {
    if (mediaList.length > 1) {
      showArc();
      clearArcTimer();
    }
  });
  arcPanel.addEventListener('mouseenter', function () { clearArcTimer(); });
  arcPanel.addEventListener('mouseleave', function () {
    if (viewer.classList.contains('is-open') && mediaList.length > 1) {
      scheduleArcHide();
    }
  });

  // ─── Init ──────────────────────────────────────────────
  renderCards();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderCards, 200);
  });

})();
