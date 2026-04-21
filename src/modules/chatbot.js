/**
 * Chatbot：Botpress iframe 懒加载。
 *
 * 只有在 Widget 被点击或浏览器 idle 时才创建 iframe，避免首屏阻塞。
 */

const BOTPRESS_SRC =
  'https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2024/12/18/03/20241218031200-KGZRSIIW.json';

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
    iframe.src = BOTPRESS_SRC;
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

  function scheduleLoad() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(createIframe, { timeout: 3000 });
    } else if (document.readyState === 'complete') {
      setTimeout(createIframe, 0);
    } else {
      window.addEventListener('load', () => setTimeout(createIframe, 0));
    }
  }

  function waitForPageLoad() {
    if (document.readyState === 'complete') {
      setTimeout(showWidget, 500);
    } else {
      window.addEventListener('load', () => setTimeout(showWidget, 500));
    }
  }

  widget.addEventListener('click', () => {
    if (!iframe) createIframe();
    if (!isReady) return;
    isOpen = !isOpen;
    showContainer(isOpen);
  });

  waitForPageLoad();
  scheduleLoad();
}
