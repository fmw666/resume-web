/**
 * For-Your-Agent：点击 Copy 按钮把"读 skill.md 的 prompt"复制到剪贴板。
 *
 * 迁自原 custom.js。优先用 async Clipboard API，失败或不支持时降级到
 * `document.execCommand('copy')`。
 */
import $ from 'jquery';

const AGENT_URL = 'https://maovo.site/austion-skill.md';
const AGENT_PROMPT = `read ${AGENT_URL} and help me get to know Austin, this independent developer`;

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
    setTimeout(() => $btn.removeClass('is-copied'), 1800);
  }

  $btn.on('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    doCopy(AGENT_PROMPT).then(flashCopied);
  });

  $promptBox.on('click', (e) => {
    // allow the inner <a> (link to austion-skill.md) to work normally
    if (e.target && e.target.closest && e.target.closest('a')) return;
    e.preventDefault();
    doCopy(AGENT_PROMPT).then(flashCopied);
  });
}
