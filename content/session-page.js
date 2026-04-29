// content/session-page.js — copy ChatGPT session API page text

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'COPY_SESSION_TEXT') return;

  resetStopState();
  copySessionText().then((result) => {
    sendResponse({ ok: true, ...result });
  }).catch((err) => {
    log(`Step 5: ${err.message}`, 'error');
    sendResponse({ error: err.message });
  });
  return true;
});

async function copySessionText() {
  log('Step 5: Waiting for session API text...');
  const text = await waitForSessionText();
  const copied = await writeTextToClipboard(text);
  log(`Step 5: Session text ${copied ? 'copied to clipboard' : 'read'} (${text.length} chars)`, copied ? 'ok' : 'warn');
  return { text, copied };
}

async function waitForSessionText(timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    throwIfStopped();
    const text = getPageText();
    if (text) return text;
    await sleep(250);
  }
  throw new Error('Session API page did not return readable text.');
}

function getPageText() {
  const bodyText = document.body?.innerText || document.body?.textContent || '';
  const preText = Array.from(document.querySelectorAll('pre'))
    .map((el) => el.innerText || el.textContent || '')
    .join('\n');
  return (preText || bodyText || '').trim();
}

async function writeTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {}

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.documentElement.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}
