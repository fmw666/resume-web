/**
 * Contact 表单提交（Formspree）。
 *
 * 原 validator.js 是 1000hz/bootstrap-validator，仍通过 side-effect 引入。
 */
import $ from 'jquery';
import { loadVendorScripts } from './vendor-loader.js';

const FORMSPREE_URL = 'https://formspree.io/f/mldeyawy';

export async function initContactForm() {
  const $form = $('#contact-form');
  if ($form.length === 0) return;
  await loadVendorScripts(['/assets/js/validator.js']);

  $form.on('submit', function (e) {
    if (e.isDefaultPrevented()) return undefined;

    const formData = $(this).serializeArray();
    const messageData = {};
    $.each(formData, (idx, field) => {
      messageData[field.name] = field.value;
    });

    $.ajax({
      type: 'POST',
      url: FORMSPREE_URL,
      contentType: 'application/json',
      data: JSON.stringify(messageData),
      success(data) {
        const messageAlert = `alert-${data.ok ? 'success' : 'danger'}`;
        const messageText = data.ok
          ? 'Your message has been sent successfully!'
          : 'Sorry, there was an error sending your message. Please try again later.';

        const alertBox =
          `<div class="alert ${messageAlert} alert-dismissable">` +
          '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
          `${messageText}</div>`;

        $form.find('.messages').html(alertBox);
        $form[0].reset();
      },
    });
    return false;
  });
}
