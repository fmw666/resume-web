/**
 * For-Your-Agent：点击 Copy 按钮把"读 skill.md 的 prompt"复制到剪贴板。
 *
 * 优先用 async Clipboard API，失败或不支持时降级到
 * `document.execCommand('copy')`。
 *
 * 另外：对带 `data-typewriter` 的 `<pre>`，在进入视口时做一次打字机动画，
 *   - 纯 DOM/rAF 实现，不引库；
 *   - prefers-reduced-motion 下直接显示最终文本；
 *   - 只播一次（IntersectionObserver disconnect）。
 */
import $ from 'jquery';
import { ENDPOINTS, TIMINGS } from '../config/index.js';

const AGENT_PROMPT = `read ${ENDPOINTS.agentSkill} and help me get to know Austin, this independent developer`;

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch (_) {
    // 忽略：已经是最后一道降级，失败也不再继续处理
  }
  document.body.removeChild(ta);
}

function doCopy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  fallbackCopy(text);
  return Promise.resolve();
}

export function initAgentCopy() {
  const $btn = $('#agent-copy-btn');
  const $promptBox = $('#agent-prompt');
  if ($btn.length === 0 && $promptBox.length === 0) return;

  function flashCopied() {
    $btn.addClass('is-copied');
    setTimeout(() => $btn.removeClass('is-copied'), TIMINGS.agentCopyFlashMs);
  }

  $btn.on('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    doCopy(AGENT_PROMPT).then(flashCopied);
  });

  $promptBox.on('click', (e) => {
    if (e.target && e.target.closest && e.target.closest('a')) return;
    e.preventDefault();
    doCopy(AGENT_PROMPT).then(flashCopied);
  });
}

/**
 * 把 `<pre data-typewriter>` 的静态 innerHTML 先保存成 "原始 HTML 片段"，
 * 初始清空内容，等进入视口时按字符流重放。
 *
 * 关键约束：
 *   - SSR/首屏态：完整内容已经在 DOM 里 — SEO、复制（Ctrl+C 纯文本）、
 *     无 JS 环境下都可读；
 *   - 运行时：我们用 textContent 流式追加字符，最后一步再把原始 HTML 贴回去
 *     （恢复 `<span class="agent-prompt-url">` 的链接高亮）；
 *   - `prefers-reduced-motion`：直接跳过动画。
 */
export function initAgentTypewriter() {
  const el = document.querySelector('#agent-prompt-text');
  if (!el) return;
  const container = el.closest('[data-typewriter]');
  if (!container) return;

  const finalHTML = el.innerHTML;
  const finalText = el.textContent || '';

  const reduce =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    container.classList.add('is-typed');
    return;
  }

  el.textContent = '';
  container.classList.add('is-typing');

  let played = false;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || played) return;
        played = true;
        io.disconnect();
        play();
      });
    },
    { threshold: 0.35 },
  );
  io.observe(container);

  function play() {
    const total = finalText.length;
    // 打字节奏：总时长 ~1600ms，字符数归一化后每帧推进若干字符，
    // 尾部留 180ms 把 HTML（含链接高亮）贴回去。
    const durationMs = TIMINGS.agentTypewriterMs || 1600;
    const tailMs = 180;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      // easeOutQuart，开头快、末尾慢，更像真人敲
      const eased = 1 - Math.pow(1 - t, 4);
      const n = Math.floor(eased * total);
      el.textContent = finalText.slice(0, n);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          el.innerHTML = finalHTML;
          container.classList.remove('is-typing');
          container.classList.add('is-typed');
        }, tailMs);
      }
    }
    requestAnimationFrame(tick);
  }
}
