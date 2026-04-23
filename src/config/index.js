/**
 * 站点级配置中心。
 *
 * 把以前散落在各模块里的"魔法常量"（外部服务 URL、秘密访问码、时序参数、
 * 懒加载阈值、vendor 清单等）集中到这里，方便：
 *   1. 一眼看出项目依赖了哪些第三方；
 *   2. 调参/灰度时只改一处；
 *   3. 为未来接入环境变量（`import.meta.env`）预留单一入口。
 *
 * 设计原则：
 *   - 所有值 `Object.freeze`，避免运行时被意外修改；
 *   - 分组语义化（endpoints / vendors / timings / flags）；
 *   - 允许通过 `import.meta.env.VITE_*` 覆盖，便于部署时定制。
 */

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

function fromEnv(key, fallback) {
  const v = env[`VITE_${key}`];
  return v === undefined || v === '' ? fallback : v;
}

export const ENDPOINTS = Object.freeze({
  formspree: fromEnv('FORMSPREE_URL', 'https://formspree.io/f/mldeyawy'),
  botpress: fromEnv(
    'BOTPRESS_SRC',
    'https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2024/12/18/03/20241218031200-KGZRSIIW.json',
  ),
  agentSkill: fromEnv('AGENT_SKILL_URL', 'https://maovo.site/austion-skill.md'),
  selfIntroAudio: '/assets/audios/self-intro.mp3',
});

/**
 * 注意：这些 vendor 依然保留为老 jQuery 插件散文件，通过 vendor-loader
 * 动态注入。分组原因：
 *   - `core` 是首屏交互必需（scrollspy 依赖 bootstrap，动画依赖 waypoints）；
 *   - `portfolio` 是 Works 区块滚到附近才下载；
 *   - `testimonials` / `contact` 同理，延后到真正需要时；
 *   - 每组内 **顺序敏感**（popper -> bootstrap，imagesloaded -> isotope，
 *     isotope -> magnific-popup -> infinite-scroll）。
 */
export const VENDORS = Object.freeze({
  core: Object.freeze([
    '/assets/js/popper.min.js',
    '/assets/js/bootstrap.min.js',
    '/assets/js/jquery.easing.min.js',
    '/assets/js/jquery.waypoints.min.js',
    '/assets/js/jquery.counterup.min.js',
    '/assets/js/morphext.min.js',
    '/assets/js/wow.min.js',
    '/assets/js/parallax.min.js',
  ]),
  portfolio: Object.freeze([
    '/assets/js/imagesloaded.pkgd.min.js',
    '/assets/js/isotope.pkgd.min.js',
    '/assets/js/jquery.magnific-popup.min.js',
    '/assets/js/infinite-scroll.min.js',
  ]),
  testimonials: Object.freeze(['/assets/js/slick.min.js']),
  contact: Object.freeze(['/assets/js/validator.js']),
});

export const TIMINGS = Object.freeze({
  preloaderFadeMs: 450,
  preloaderDelayMs: 350,
  arcHideDelayMs: 3000,
  returnToTopOffsetPx: 350,
  chatbotIdleTimeoutMs: 3000,
  chatbotRevealDelayMs: 500,
  scrollAnimateMs: 800,
  agentCopyFlashMs: 1800,
  agentTypewriterMs: 1600,
});

export const LAZY = Object.freeze({
  portfolioRootMargin: '300px',
  testimonialsRootMargin: '200px',
});

export const ACCESS = Object.freeze({
  privacyCode: fromEnv('PRIVACY_CODE', '990718'),
  privacyParamName: 'code',
});

export const FLAGS = Object.freeze({
  /** 开启后启动阶段任何一个模块抛错都会被捕获并记录，不中断后续启动。 */
  errorIsolation: true,
  /** 开启后在 console 打印启动 pipeline 时序。 */
  verboseBoot: env?.MODE === 'development',
});
