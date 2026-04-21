/**
 * 应用启动 pipeline。
 *
 * 之前 `main.js` 是一长串 await，顺序、并行、错误隔离三者混在一起。
 * 这里把启动过程抽象成 **阶段** + **任务** 的两层结构：
 *
 *   - 阶段 (phase) 内部并行跑，阶段之间严格串行；
 *   - 每个任务 (task) 带 label，失败单独记录，不影响其他任务；
 *   - pipeline 可以被"组合"出来 —— 业务方只管 registerTask，
 *     不用关心执行时机和错误处理。
 *
 * 这样加一个新模块只需要在 `main.js` 里 registerTask 一次，不会再
 * 让 boot 函数越写越长。
 */
import { safeRun } from './safe-run.js';
import { logger } from './logger.js';

export const PHASES = Object.freeze({
  /** sections 注入之前（主题初始化这种依赖 DOM 但不依赖 section 的工作）。 */
  PRE_MOUNT: 'pre-mount',
  /** sections 注入（关键，其他所有 DOM 操作依赖这一步）。 */
  MOUNT: 'mount',
  /** DOM 就绪后立即能跑的轻量交互（导航 / 数据属性 / 隐私 …）。 */
  POST_MOUNT: 'post-mount',
  /** 需要核心 vendor 就绪才能跑的（scrollspy / 动画）。 */
  ENHANCE: 'enhance',
  /** 可延后到 idle 的懒加载类（portfolio / testimonials / chatbot）。 */
  DEFER: 'defer',
});

/**
 * Pipeline 只是一个 "phase -> [task]" 的映射。
 * 使用方：
 *   const pipe = createPipeline();
 *   pipe.register(PHASES.PRE_MOUNT, 'theme', initTheme);
 *   await pipe.run();
 */
export function createPipeline() {
  const tasks = new Map();
  for (const p of Object.values(PHASES)) tasks.set(p, []);

  function register(phase, label, fn) {
    if (!tasks.has(phase)) throw new Error(`Unknown phase: ${phase}`);
    tasks.get(phase).push([label, fn]);
  }

  async function runPhase(phase, { parallel = true } = {}) {
    const list = tasks.get(phase) || [];
    if (list.length === 0) return;
    logger.debug(`-> phase ${phase} (${list.length} task${list.length > 1 ? 's' : ''})`);
    if (parallel) {
      await Promise.allSettled(list.map(([label, fn]) => safeRun(label, fn)));
    } else {
      for (const [label, fn] of list) {
        // eslint-disable-next-line no-await-in-loop
        await safeRun(label, fn);
      }
    }
  }

  async function run(order) {
    const phases = order ?? [
      PHASES.PRE_MOUNT,
      PHASES.MOUNT,
      PHASES.POST_MOUNT,
      PHASES.ENHANCE,
      PHASES.DEFER,
    ];
    for (const p of phases) {
      // MOUNT 阶段应该是串行（sections 注入必须在前）
      // eslint-disable-next-line no-await-in-loop
      await runPhase(p, { parallel: p !== PHASES.MOUNT });
    }
  }

  return { register, runPhase, run };
}

/** 等待 DOM 就绪（loading 状态下监听 DOMContentLoaded）。 */
export function onDomReady(cb) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cb, { once: true });
  } else {
    cb();
  }
}

/** 等待 window load（常用于 preloader 淡出、非阻塞资源就绪）。 */
export function onWindowLoad(cb) {
  if (document.readyState === 'complete') {
    cb();
  } else {
    window.addEventListener('load', cb, { once: true });
  }
}
