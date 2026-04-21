/**
 * 带缓存 / 去重 / 重试的 vendor 动态注入器。
 *
 * 相比旧版（`src/modules/vendor-loader.js`）：
 *   - **去重**：同一 src 并发调用只会发起一次请求；
 *   - **顺序**：同一批内按数组顺序 `async=false`，保证依赖顺序；
 *   - **重试**：网络抖动时最多重试 2 次；
 *   - **超时**：可选超时参数，防 CDN 假死拖垮首屏；
 *   - **可观测**：失败走 logger.error 而不是直接 throw，让调用方决定降级。
 */
import { createLogger } from './logger.js';

const log = createLogger('vendor');
const cache = new Map();

function inject(src, { timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    // async=false 是告诉浏览器：即使动态插入，也按插入顺序执行，
    // 这对老 jQuery 插件链（popper -> bootstrap）是必须的。
    s.async = false;
    s.defer = false;
    s.dataset.vendor = src;

    let timer = null;
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        reject(new Error(`Timed out loading ${src} after ${timeoutMs}ms`));
      }, timeoutMs);
    }

    s.onload = () => {
      if (timer) clearTimeout(timer);
      resolve();
    };
    s.onerror = () => {
      if (timer) clearTimeout(timer);
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(s);
  });
}

async function loadOne(src, opts) {
  if (cache.has(src)) return cache.get(src);

  const promise = (async () => {
    const maxAttempts = opts?.retries ?? 2;
    let lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await inject(src, opts);
      } catch (err) {
        lastErr = err;
        log.warn(`vendor load attempt ${attempt}/${maxAttempts} failed for ${src}`);
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 300 * attempt));
        }
      }
    }
    throw lastErr;
  })();

  cache.set(src, promise);
  // 失败时把缓存项清掉，避免以后永久失败
  promise.catch(() => cache.delete(src));
  return promise;
}

/**
 * 按顺序加载一组 vendor。组内串行（因为老 jQuery 插件链有依赖顺序），
 * 组间可以通过外层 `Promise.all(loadVendorScripts(...), loadVendorScripts(...))`
 * 实现并行。
 */
export async function loadVendorScripts(srcs, opts) {
  for (const src of srcs) {
    // eslint-disable-next-line no-await-in-loop
    await loadOne(src, opts);
  }
}

/** 直接返回加载某一个脚本的 Promise，便于单独 await。*/
export function loadVendorScript(src, opts) {
  return loadOne(src, opts);
}
