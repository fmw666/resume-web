/**
 * Contact 表单提交（Formspree）。
 *
 * 原 validator.js 是 1000hz/bootstrap-validator，仍通过 side-effect 引入。
 * 迁到 fetch + async/await，替代 jQuery ajax，减少依赖表面、支持 abort 和
 * 现代错误处理。
 */
import $ from 'jquery';
import { ENDPOINTS, VENDORS } from '../config/index.js';
import { loadVendorScripts } from '../core/vendor-loader.js';
import { createLogger } from '../core/logger.js';

const log = createLogger('contact');

function renderAlert($form, ok, text) {
  const cls = `alert-${ok ? 'success' : 'danger'}`;
  const html =
    `<div class="alert ${cls} alert-dismissable">` +
    '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
    `${text}</div>`;
  $form.find('.messages').html(html);
}

async function submit(formEl) {
  const body = Object.fromEntries(new FormData(formEl).entries());
  const res = await fetch(ENDPOINTS.formspree, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ ok: res.ok }));
  return { ok: res.ok && data.ok !== false };
}

export async function initContactForm() {
  const $form = $('#contact-form');
  if ($form.length === 0) return;
  await loadVendorScripts(VENDORS.contact);

  $form.on('submit', function (e) {
    if (e.isDefaultPrevented()) return undefined;
    e.preventDefault();

    submit(this)
      .then(({ ok }) => {
        renderAlert(
          $form,
          ok,
          ok
            ? 'Your message has been sent successfully!'
            : 'Sorry, there was an error sending your message. Please try again later.',
        );
        if (ok) this.reset();
      })
      .catch((err) => {
        log.warn('contact submit failed', err);
        renderAlert($form, false, 'Network error. Please try again later.');
      });
    return false;
  });
}
