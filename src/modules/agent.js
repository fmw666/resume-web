/**
 * For-Your-Agent：点击 URL 或 Copy 按钮把 skill.md 链接复制到剪贴板。
 *
 * 迁自原 custom.js。优先用 async Clipboard API，失败或不支持时降级到
 * `document.execCommand('copy')`。
 */
import $ from 'jquery';

const AGENT_URL = 'https://maovo.site/austion-skill.md';

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
    // ignore
  }
  document.body.removeChild(ta);
}

function doCopy() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(AGENT_URL).catch(() => fallbackCopy(AGENT_URL));
  }
  fallbackCopy(AGENT_URL);
  return Promise.resolve();
}

export function initAgentCopy() {
  const $btn = $('#agent-copy-btn');
  const $urlBox = $('#agent-url');
  if ($btn.length === 0 && $urlBox.length === 0) return;

  function flashCopied() {
    $btn.addClass('is-copied');
    setTimeout(() => $btn.removeClass('is-copied'), 1800);
  }

  $btn.on('click', (e) => {
    e.preventDefault();
    doCopy().then(flashCopied);
  });

  $urlBox.on('click', (e) => {
    e.preventDefault();
    doCopy().then(flashCopied);
  });
}
