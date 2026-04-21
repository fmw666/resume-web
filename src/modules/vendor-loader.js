/**
 * @deprecated 已迁移到 `src/core/vendor-loader.js`（带缓存/去重/重试）。
 * 这里只是个薄 shim，为老外部调用保留同名 export。新代码请直接从
 * `core/vendor-loader` 引入。
 */
export { loadVendorScripts, loadVendorScript } from '../core/vendor-loader.js';
