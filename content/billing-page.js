// content/billing-page.js — prefill checkout billing details and leave final action to the user

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'EXECUTE_STEP' || message.step !== 6) return;

  resetStopState();
  prefillBillingDetails(message.payload || {}).then((result) => {
    sendResponse({ ok: true, ...result });
  }).catch((err) => {
    if (isStopError(err)) {
      sendResponse({ stopped: true, error: err.message });
      return;
    }
    reportError(6, err.message);
    sendResponse({ error: err.message });
  });
  return true;
});

async function prefillBillingDetails(payload) {
  await waitForCheckoutSurface();

  const result = {
    email: await fillByCandidates({
      value: payload.email,
      selectors: [
        'input[type="email"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
        'input[autocomplete*="email" i]',
      ],
      keywords: ['email', 'e-mail', 'mail', '電郵', '电子邮件', '電子郵件', '邮箱', '郵箱'],
    }),
    name: await fillByCandidates({
      value: payload.name,
      selectors: [
        'input[name="name"]',
        'input[name*="name" i]',
        'input[id*="name" i]',
        'input[autocomplete="name"]',
        'input[autocomplete*="billing name" i]',
      ],
      keywords: ['name', 'full name', 'cardholder', '姓名', '全名', '持卡人'],
    }),
  };

  result.country = await selectCountry(payload.country, payload.countryLabel);
  await sleep(500);

  result.postalCode = await fillByCandidates({
    value: payload.postalCode,
    selectors: [
      'input[autocomplete*="postal-code" i]',
      'input[name*="postal" i]',
      'input[id*="postal" i]',
      'input[name*="zip" i]',
      'input[id*="zip" i]',
    ],
    keywords: ['postal', 'zip', 'postcode', '邮编', '郵遞區號', '郵編'],
  });

  result.county = await fillAreaField({
    value: payload.county,
    selectors: [
      'select[autocomplete*="address-level1" i]',
      'input[autocomplete*="address-level1" i]',
      'select[name*="state" i]',
      'input[name*="state" i]',
      'select[name*="county" i]',
      'input[name*="county" i]',
      'select[id*="state" i]',
      'input[id*="state" i]',
      'select[id*="county" i]',
      'input[id*="county" i]',
    ],
    keywords: ['county', 'state', 'province', 'city', 'administrative', '县', '縣', '市', '州', '省'],
  });

  result.district = await fillAreaField({
    value: payload.district,
    selectors: [
      'input[autocomplete*="address-level2" i]',
      'select[autocomplete*="address-level2" i]',
      'input[name*="district" i]',
      'select[name*="district" i]',
      'input[id*="district" i]',
      'select[id*="district" i]',
      'input[name*="locality" i]',
      'input[id*="locality" i]',
    ],
    keywords: ['district', 'locality', 'area', 'region', '地区', '地區', '区', '區', '乡镇', '鄉鎮'],
  });

  result.addressLine1 = await fillByCandidates({
    value: payload.addressLine1,
    selectors: [
      'input[autocomplete*="address-line1" i]',
      'input[name*="address1" i]',
      'input[id*="address1" i]',
      'input[name*="line1" i]',
      'input[id*="line1" i]',
    ],
    keywords: ['address line 1', 'address 1', 'street', '地址1', '地址 1', '地址一', '街道地址', '地址'],
  });

  log(`Step 6: Billing prefill complete. Filled ${Object.values(result).filter(Boolean).length} fields.`, 'ok');
  reportComplete(6, { filled: result });
  return { filled: result };
}

async function waitForCheckoutSurface(timeout = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    throwIfStopped();
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      const fields = queryEditableFields();
      if (fields.length > 0) return;
    }
    await sleep(300);
  }
  throw new Error('Checkout page did not expose editable billing fields.');
}

function queryEditableFields() {
  return Array.from(document.querySelectorAll('input, textarea, select'))
    .filter((el) => isElementUsable(el) && !isSensitivePaymentField(el));
}

async function fillByCandidates({ value, selectors, keywords }) {
  if (value == null || value === '') return false;
  const field = await findField({ selectors, keywords });
  if (!field) {
    log(`Step 6: Could not find field for ${keywords[0]}`, 'warn');
    return false;
  }
  setFieldValue(field, value);
  await sleep(180);
  return true;
}

async function fillAreaField({ value, selectors, keywords }) {
  if (value == null || value === '') return false;
  const field = await findField({ selectors, keywords });
  if (!field) {
    log(`Step 6: Could not find area field for ${keywords[0]}`, 'warn');
    return false;
  }

  if (field.tagName === 'SELECT') {
    return selectOption(field, [value, 'Taipei', '台北', '臺北']);
  }

  setFieldValue(field, value);
  await sleep(180);
  return true;
}

async function selectCountry(countryCode = 'TW', countryLabel = 'Taiwan') {
  const countryField = await findField({
    selectors: [
      'select[autocomplete*="country" i]',
      'select[name*="country" i]',
      'select[id*="country" i]',
      'input[autocomplete*="country" i]',
      'input[name*="country" i]',
      'input[id*="country" i]',
      '[role="combobox"][aria-label*="country" i]',
      '[role="combobox"][aria-labelledby*="country" i]',
    ],
    keywords: ['country', 'region', '国家', '國家', '地区', '地區'],
  });

  if (!countryField) {
    log('Step 6: Could not find country/region field', 'warn');
    return false;
  }

  if (countryField.tagName === 'SELECT') {
    return selectOption(countryField, [countryCode, countryLabel, 'Taiwan', '台灣', '台湾']);
  }

  simulateClick(countryField);
  if (countryField instanceof HTMLInputElement || countryField instanceof HTMLTextAreaElement) {
    setFieldValue(countryField, countryLabel || countryCode);
  }
  await sleep(350);
  const option = findVisibleOption(/Taiwan|台灣|台湾|TW/i);
  if (option) {
    simulateClick(option);
    await sleep(250);
  }
  return true;
}

async function findField({ selectors, keywords }, timeout = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    throwIfStopped();

    for (const selector of selectors) {
      const direct = Array.from(document.querySelectorAll(selector)).find((el) => isElementUsable(el) && !isSensitivePaymentField(el));
      if (direct) return direct;
    }

    const keywordMatch = queryEditableFields().find((el) => fieldMatchesKeywords(el, keywords));
    if (keywordMatch) return keywordMatch;

    await sleep(250);
  }
  return null;
}

function selectOption(select, candidates) {
  const normalizedCandidates = candidates.map(normalizeText).filter(Boolean);
  const options = Array.from(select.options || []);
  const match = options.find((option) => {
    const value = normalizeText(option.value);
    const text = normalizeText(option.textContent);
    return normalizedCandidates.some((candidate) => value === candidate || text === candidate || text.includes(candidate));
  });

  if (!match) {
    log(`Step 6: No matching option in ${select.name || select.id || 'select'}`, 'warn');
    return false;
  }

  select.value = match.value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
  log(`Step 6: Selected ${match.textContent.trim() || match.value}`);
  return true;
}

function setFieldValue(field, value) {
  throwIfStopped();
  if (field.tagName === 'SELECT') {
    selectOption(field, [value]);
    return;
  }

  const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) {
    setter.call(field, String(value));
  } else {
    field.value = String(value);
  }
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  log(`Step 6: Filled ${field.name || field.id || field.placeholder || field.type || 'field'}`);
}

function fieldMatchesKeywords(field, keywords) {
  const text = getFieldText(field);
  return keywords.some((keyword) => text.includes(normalizeText(keyword)));
}

function getFieldText(field) {
  const parts = [
    field.name,
    field.id,
    field.placeholder,
    field.getAttribute('aria-label'),
    field.getAttribute('autocomplete'),
    field.getAttribute('data-testid'),
    field.getAttribute('title'),
  ];

  const labelledBy = field.getAttribute('aria-labelledby');
  if (labelledBy) {
    parts.push(...labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent || ''));
  }

  if (field.id) {
    parts.push(...Array.from(document.querySelectorAll(`label[for="${CSS.escape(field.id)}"]`)).map((label) => label.textContent || ''));
  }

  const closestLabel = field.closest('label');
  if (closestLabel) parts.push(closestLabel.textContent || '');

  const parentText = field.closest('div, section, form')?.textContent || '';
  if (parentText.length < 240) parts.push(parentText);

  return normalizeText(parts.filter(Boolean).join(' '));
}

function isElementUsable(el) {
  if (!el || el.disabled || el.readOnly || el.getAttribute('aria-disabled') === 'true') return false;
  const type = (el.getAttribute('type') || '').toLowerCase();
  if (['hidden', 'submit', 'button', 'checkbox', 'radio', 'file'].includes(type)) return false;
  return isElementVisible(el);
}

function isElementVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isSensitivePaymentField(el) {
  const text = getFieldText(el);
  return /card|cvc|cvv|security code|expiry|expiration|holder number|卡号|卡號|安全码|安全碼|有效期/.test(text);
}

function findVisibleOption(pattern) {
  return Array.from(document.querySelectorAll('[role="option"], li, div, span, button'))
    .find((el) => isElementVisible(el) && pattern.test(el.textContent || ''));
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}
