/**
 * 轻量分级日志器。
 *
 * 目的：
 *   1. 让模块通过 `logger.warn/error` 写日志而不是直接 `console.*`，
 *      便于未来统一接入 Sentry / 自家遥测；
 *   2. 生产环境默认只保留 warn / error，避免噪音；
 *   3. 支持 tag 前缀，排查问题一眼定位到模块。
 */
import { FLAGS } from '../config/index.js';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const thresholdName = FLAGS.verboseBoot ? 'debug' : 'warn';
const threshold = LEVELS[thresholdName];

function emit(level, tag, args) {
  if (LEVELS[level] < threshold) return;
  const prefix = tag ? `[${tag}]` : '';
  const fn = console[level] || console.log;
  fn(prefix, ...args);
}

export function createLogger(tag) {
  return {
    debug: (...a) => emit('debug', tag, a),
    info: (...a) => emit('info', tag, a),
    warn: (...a) => emit('warn', tag, a),
    error: (...a) => emit('error', tag, a),
  };
}

export const logger = createLogger('boot');
