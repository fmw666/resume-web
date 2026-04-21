#!/usr/bin/env node
/**
 * 一键跑 smoke test：
 *   1. 如果 dist/ 不存在，先 `vite build`
 *   2. 启动 `vite preview` 子进程
 *   3. 轮询 preview 端口可用
 *   4. 跑 scripts/smoke.mjs
 *   5. 无论成功失败，都杀掉 preview，退出码沿用 smoke 结果
 *
 * 这样本地和 CI 都能用同一条命令，避免手动管理后台进程。
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PORT = Number(process.env.SMOKE_PORT || 4173);
const URL = `http://localhost:${PORT}/`;
const ROOT = process.cwd();

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
    child.on('error', reject);
  });
}

async function waitForPort(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
    console.log('> dist not found, running `vite build` first');
    await run('npx', ['vite', 'build']);
  }

  console.log(`> starting preview on port ${PORT}`);
  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // 把 preview 的输出转发出去，便于 CI 排查
  preview.stdout.on('data', (b) => process.stdout.write(`[preview] ${b}`));
  preview.stderr.on('data', (b) => process.stderr.write(`[preview] ${b}`));

  const cleanup = () => {
    if (!preview.killed) preview.kill('SIGTERM');
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(130); });
  process.on('SIGTERM', () => { cleanup(); process.exit(143); });

  try {
    await waitForPort(URL);
    const result = spawnSync('node', ['scripts/smoke.mjs'], {
      stdio: 'inherit',
      env: { ...process.env, SMOKE_URL: URL },
    });
    cleanup();
    process.exit(result.status ?? 1);
  } catch (e) {
    console.error(e);
    cleanup();
    process.exit(1);
  }
}

main();
