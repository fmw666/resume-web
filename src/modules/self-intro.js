/**
 * About 区块的自我介绍音频播放。
 *
 * 实现细节：
 *   - 懒创建 `Audio` 对象（第一次点击时才实例化），避免未点击就创建
 *     HTMLAudioElement 导致浏览器开始预请求网络资源；
 *   - 再次点击是"停止并重新播放"语义（用户期望能快速重听）。
 */
import { ENDPOINTS } from '../config/index.js';
import { createLogger } from '../core/logger.js';

const log = createLogger('self-intro');

export function initSelfIntroAudio() {
  const playButton = document.getElementById('about-introduce');
  if (!playButton) return;

  let audio = null;

  playButton.addEventListener('click', () => {
    if (!audio) {
      audio = new Audio(ENDPOINTS.selfIntroAudio);
      audio.preload = 'auto';
    }
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
    audio.play().catch((err) => log.warn('audio playback failed', err));
  });
}
