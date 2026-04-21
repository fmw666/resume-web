/**
 * 顺序加载 vendor <script>（防止并行下载导致依赖顺序错乱）。
 */

const loaded = new Map();

function loadOne(src) {
  if (loaded.has(src)) return loaded.get(src);
  const promise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.defer = false;
    s.dataset.vendor = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
  loaded.set(src, promise);
  return promise;
}

export async function loadVendorScripts(srcs) {
  for (const src of srcs) {
    // eslint-disable-next-line no-await-in-loop
    await loadOne(src);
  }
}
