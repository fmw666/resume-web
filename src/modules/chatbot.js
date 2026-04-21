/**
 * Chatbot：Botpress iframe 懒加载。
 *
 * 性能要点：
 *   - `whenIdle` 在浏览器空闲时才 attach iframe，不阻塞首屏；
 *   - iframe 的 src 从 `config/endpoints.botpress` 拿，便于灰度/替换；
 *   - 用户点击 widget 时立刻拉起（哪怕还没 idle 到），让"点我就开"这
 *     条最关键的路径不被"等 idle"拖慢。
 */
import { ENDPOINTS, TIMINGS } from '../config/index.js';
import { whenIdle } from '../core/schedule.js';
import { onWindowLoad } from '../core/lifecycle.js';

export function initChatbot() {
  const widget = document.getElementById('chatbot-widget');
  const container = document.getElementById('chatbot-container');
  if (!widget || !container) return;

  let iframe = null;
  let isReady = false;
  let isOpen = false;

  function showWidget() {
    widget.style.opacity = '1';
    widget.style.visibility = 'visible';
    widget.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
  }

  function showContainer(show) {
    container.classList.toggle('visible', show);
    container.classList.toggle('show', show);
  }

  function createIframe() {
    if (iframe) return iframe;
    iframe = document.createElement('iframe');
    iframe.className = 'chatbot-iframe';
    iframe.allow = 'microphone';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.loading = 'lazy';
    iframe.src = ENDPOINTS.botpress;
    iframe.addEventListener('load', () => {
      isReady = true;
      widget.setAttribute('aria-busy', 'false');
      const ph = container.querySelector('.chatbot-placeholder');
      if (ph) ph.remove();
      if (isOpen) showContainer(true);
    });
    container.appendChild(iframe);
    return iframe;
  }

  widget.addEventListener('click', () => {
    if (!iframe) createIframe();
    if (!isReady) return;
    isOpen = !isOpen;
    showContainer(isOpen);
  });

  onWindowLoad(() => setTimeout(showWidget, TIMINGS.chatbotRevealDelayMs));
  whenIdle(createIframe, { timeout: TIMINGS.chatbotIdleTimeoutMs });
}
