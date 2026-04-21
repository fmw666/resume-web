/**
 * 通用、与业务无关的 DOM 工具。
 *
 * 目前只装了一件事：把 `data-height` / `data-color` 这类"模板里硬写的
 * 数据属性"应用到对应元素的内联 style。历史上它寄生在 animations.js
 * 里，但它并不属于动画，移到这里以符合 SRP。
 */

export function applyDataAttrs() {
  document.querySelectorAll('.spacer').forEach((el) => {
    const size = el.getAttribute('data-height');
    if (size) el.style.height = `${size}px`;
  });
  document.querySelectorAll('.data-background').forEach((el) => {
    const color = el.getAttribute('data-color');
    if (color) el.style.backgroundColor = color;
  });
}
