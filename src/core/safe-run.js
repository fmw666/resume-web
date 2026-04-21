/**
 * 错误隔离执行器。
 *
 * 启动 pipeline 中的每个模块都包在 `safeRun` 里跑 —— 某个模块
 * 抛错不会把整个应用搞 down，只会在日志里标明是谁挂了。
 *
 * 用法：
 *   await safeRun('theme', () => initTheme());
 */
import { FLAGS } from '../config/index.js';
import { logger } from './logger.js';

export async function safeRun(label, fn) {
  const t0 = performance.now?.() ?? Date.now();
  try {
    const result = await fn();
    const dt = (performance.now?.() ?? Date.now()) - t0;
    logger.debug(`task "${label}" ok (${dt.toFixed(1)}ms)`);
    return result;
  } catch (err) {
    if (FLAGS.errorIsolation) {
      logger.error(`task "${label}" threw; continuing boot`, err);
      return undefined;
    }
    throw err;
  }
}

/**
 * 批量跑一组任务，**并行**执行。任一失败不影响其它任务，
 * 返回值是 `Promise.allSettled` 的结果（调用方不关心时可忽略）。
 */
export function safeRunParallel(tasks) {
  return Promise.allSettled(
    tasks.map(([label, fn]) => safeRun(label, fn)),
  );
}
