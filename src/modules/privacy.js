/**
 * 通过 URL 参数 `?code=xxx` 控制敏感信息展示（简历下载、Experience）。
 */

const SECRET = '990718';

function getQueryParam(name) {
  const search = new URLSearchParams(window.location.search);
  return search.get(name) || '';
}

export function enforcePrivacy() {
  const code = getQueryParam('code');
  if (code === SECRET) return;

  const resumeButtons = document.getElementById('resume-buttons');
  if (resumeButtons) resumeButtons.style.display = 'none';

  const experienceSection = document.getElementById('experience');
  if (experienceSection) experienceSection.style.display = 'none';

  const experienceNavLink = document.querySelector('a[href="#experience"]');
  if (experienceNavLink) {
    const navItem = experienceNavLink.closest('li');
    if (navItem) navItem.style.display = 'none';
  }
}
