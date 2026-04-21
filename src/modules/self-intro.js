/**
 * About 区块的自我介绍音频播放。
 */
export function initSelfIntroAudio() {
  const playButton = document.getElementById('about-introduce');
  if (!playButton) return;

  const audio = new Audio('/assets/audios/self-intro.mp3');

  playButton.addEventListener('click', () => {
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
    audio.play().catch((error) => {
      // eslint-disable-next-line no-console
      console.log('Error playing audio:', error);
    });
  });
}
