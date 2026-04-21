/**
 * For-Your-Agent：点击 Copy 按钮把"读 skill.md 的 prompt"复制到剪贴板。
 *
 * 优先用 async Clipboard API，失败或不支持时降级到
 * `document.execCommand('copy')`。
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
