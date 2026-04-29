// sidepanel/sidepanel.js - Side Panel logic

const STATUS_ICONS = {
  pending: '',
  running: '',
  completed: '\u2713',
  failed: '\u2717',
  stopped: '\u25A0',
};

const logArea = document.getElementById('log-area');
const displayOauthUrl = document.getElementById('display-oauth-url');
const displayLocalhostUrl = document.getElementById('display-localhost-url');
const displayStatus = document.getElementById('display-status');
const statusBar = document.getElementById('status-bar');
const inputEmail = document.getElementById('input-email');
const inputPassword = document.getElementById('input-password');
const inputMailMode = document.getElementById('input-mail-mode');
const inputManualCode = document.getElementById('input-manual-code');
const manualCodeRow = document.getElementById('manual-code-row');
const btnFetchEmail = document.getElementById('btn-fetch-email');
const btnSubmitCode = document.getElementById('btn-submit-code');
const btnTogglePassword = document.getElementById('btn-toggle-password');
const btnToggleVps = document.getElementById('btn-toggle-vps');
const btnLanguage = document.getElementById('btn-language');
const btnStop = document.getElementById('btn-stop');
const btnReset = document.getElementById('btn-reset');
const stepsProgress = document.getElementById('steps-progress');
const btnAutoRun = document.getElementById('btn-auto-run');
const btnWorkflowContinue = document.getElementById('btn-workflow-continue');
const btnAutoContinue = document.getElementById('btn-auto-continue');
const autoContinueBar = document.getElementById('auto-continue-bar');
const autoContinueHint = document.getElementById('auto-continue-hint');
const btnClearLog = document.getElementById('btn-clear-log');
const inputVpsUrl = document.getElementById('input-vps-url');
const inputRunCount = document.getElementById('input-run-count');
const btnTheme = document.getElementById('btn-theme');
const urlBackfillPanel = document.getElementById('url-backfill-panel');
const inputUrlBackfill = document.getElementById('input-url-backfill');
const btnSubmitUrl = document.getElementById('btn-submit-url');

const DEFAULT_VPS_URL = 'http://127.0.0.1:5173/#/oauth';
const TOTAL_STEPS = 6;
const MANUAL_CODE_STEPS = [3];
const LANG_STORAGE_KEY = 'demonrainregflow-language';
const THEME_STORAGE_KEY = 'demonrainregflow-theme';
const PLAY_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
const CLOCK_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';

let autoContinueMode = 'email';
let pendingManualCodeStep = null;
let fetchEmailBusy = false;
let currentLang = 'en';

const I18N = {
  en: {
    auto: 'Auto',
    stop: 'Stop',
    continue: 'Continue',
    clear: 'Clear',
    show: 'Show',
    hide: 'Hide',
    submitCode: 'Submit',
    confirmUrl: 'Confirm',
    waiting: 'Waiting...',
    ready: 'Ready',
    workflow: 'Workflow',
    console: 'Console',
    labelVps: 'VPS',
    labelMail: 'Mail',
    labelEmail: 'Email',
    labelPassword: 'Account PW',
    labelCode: 'Code',
    labelOauth: 'OAuth',
    labelCallback: 'Callback',
    mailModeBurner: 'Burner Mailbox',
    mailModeManual: 'Manual Email',
    emailPlaceholder: 'Paste the registration email',
    passwordPlaceholder: 'Leave blank to auto-generate',
    manualCodePlaceholder: 'Enter verification code',
    urlBackfillTitle: 'Session text copied. Paste the returned URL below.',
    urlBackfillPlaceholder: 'Paste the URL here, then confirm',
    runCountTitle: 'Number of runs',
    autoRunTitle: 'Run all steps automatically',
    stopTitle: 'Stop current flow',
    resetTitle: 'Reset all steps',
    languageTitle: 'Switch language',
    themeTitle: 'Toggle theme',
    mailModeTitle: 'Email source',
    workflowContinueTitle: 'Continue from interrupted step',
    clearLogTitle: 'Clear log',
    showVpsTitle: 'Show VPS URL',
    hideVpsTitle: 'Hide VPS URL',
    step1: 'Open ChatGPT Signup',
    step2: 'Fill Email / Password',
    step3: 'Submit Verification Code',
    step4: 'Fill About You',
    step5: 'Copy Session / Paste URL',
    step6: 'Prefill Billing',
    step7: 'Get Login Code',
    step8: 'OAuth Auto Confirm',
    step9: 'VPS Verify',
    stepRunning: 'Step {step} running...',
    stepFailed: 'Step {step} failed',
    stepStopped: 'Step {step} stopped',
    stepDone: 'Step {step} done',
    allDone: 'All steps completed!',
    running: 'Running',
    paused: 'Paused',
    emailWaitHint: 'Paste the registration email, then continue',
    manualEmailWaitHint: 'Paste the registration email, then continue',
    challengeWaitHint: 'Complete Burner Mailbox security verification on the mailbox tab, then continue',
    manualCodeWaitHint: 'Enter the verification code, then continue',
    checkoutUrlWaitHint: 'Session text was copied. Paste the returned URL below, then confirm',
    needEmail: 'Please paste an email address first',
    needBurnerEmail: 'Please fetch or paste a Burner Mailbox email first',
    needManualCode: 'Please enter a 6-digit verification code',
    needCheckoutUrl: 'Please paste a valid URL',
    manualCodeSaved: 'Verification code submitted',
    checkoutUrlSaved: 'URL submitted',
    sessionTextCopied: 'Session text copied to clipboard',
    stopping: 'Stopping current flow...',
    resetConfirm: 'Reset all steps and data?',
    burnerChallengeConfirm: 'Burner Mailbox needs security verification.\n\nComplete it on the mailbox tab, then click OK to continue fetching the email.',
    burnerEmailLoaded: 'Email ready: {email}',
    burnerEmailFailed: 'Auto email fetch failed: {message}',
  },
  zh: {
    auto: '自动',
    stop: '停止',
    continue: '继续',
    clear: '清空',
    show: '显示',
    hide: '隐藏',
    submitCode: '提交',
    confirmUrl: '确认',
    waiting: '等待中...',
    ready: '就绪',
    workflow: '流程',
    console: '控制台',
    labelVps: 'VPS',
    labelMail: '邮箱',
    labelEmail: '邮箱',
    labelPassword: '账号密码',
    labelCode: '验证码',
    labelOauth: 'OAuth',
    labelCallback: '回调',
    mailModeBurner: 'Burner 邮箱',
    mailModeManual: '手动邮箱',
    emailPlaceholder: '粘贴注册邮箱',
    passwordPlaceholder: '留空则自动生成账号密码',
    manualCodePlaceholder: '输入验证码',
    urlBackfillTitle: 'Session 文本已复制，请在下面回填返回的 URL',
    urlBackfillPlaceholder: '在这里粘贴 URL，然后点击确认',
    runCountTitle: '运行次数',
    autoRunTitle: '自动运行全部步骤',
    stopTitle: '停止当前流程',
    resetTitle: '重置全部步骤',
    languageTitle: '切换语言',
    themeTitle: '切换主题',
    mailModeTitle: '邮箱来源',
    workflowContinueTitle: '从中断步骤继续',
    clearLogTitle: '清空日志',
    showVpsTitle: '显示 VPS 地址',
    hideVpsTitle: '隐藏 VPS 地址',
    step1: '打开 ChatGPT 注册',
    step2: '填写邮箱 / 密码',
    step3: '提交验证码',
    step4: '填写资料',
    step5: '复制 Session / 回填 URL',
    step6: '预填账单信息',
    step7: '获取登录验证码',
    step8: 'OAuth 自动确认',
    step9: 'VPS 验证',
    stepRunning: '步骤 {step} 运行中...',
    stepFailed: '步骤 {step} 失败',
    stepStopped: '步骤 {step} 已停止',
    stepDone: '步骤 {step} 完成',
    allDone: '全部步骤已完成！',
    running: '运行中',
    paused: '已暂停',
    emailWaitHint: '粘贴注册邮箱后继续',
    manualEmailWaitHint: '粘贴注册邮箱后继续',
    challengeWaitHint: '请先在邮箱标签页完成 Burner Mailbox 安全验证，然后继续',
    manualCodeWaitHint: '输入验证码后继续',
    checkoutUrlWaitHint: 'Session 文本已复制，请在下方粘贴返回的 URL 并确认',
    needEmail: '请先粘贴邮箱',
    needBurnerEmail: '请先获取或粘贴 Burner 邮箱',
    needManualCode: '请输入 6 位验证码',
    needCheckoutUrl: '请粘贴有效 URL',
    manualCodeSaved: '验证码已提交',
    checkoutUrlSaved: 'URL 已提交',
    sessionTextCopied: 'Session 文本已复制到剪切板',
    stopping: '正在停止当前流程...',
    resetConfirm: '重置全部步骤和数据？',
    burnerChallengeConfirm: 'Burner Mailbox 需要先完成安全验证。\n\n请切到邮箱页完成验证，完成后点确定，我会继续获取邮箱。',
    burnerEmailLoaded: '邮箱已就绪：{email}',
    burnerEmailFailed: '自动获取邮箱失败：{message}',
  },
};

const TOAST_ICONS = {
  error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  warn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
};

const toastContainer = document.getElementById('toast-container');

function t(key, vars = {}) {
  const template = I18N[currentLang]?.[key] || I18N.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function applyTranslations() {
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    if ((el === displayOauthUrl || el === displayLocalhostUrl) && el.classList.contains('has-value')) return;
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  btnLanguage.textContent = currentLang === 'zh' ? 'EN' : '中文';
  syncPasswordToggleLabel();
  syncVpsToggleLabel();
  updateMailModeUI();
}

function setLanguage(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  applyTranslations();
  chrome.runtime.sendMessage({ type: 'GET_STATE', source: 'sidepanel' }).then(updateStatusDisplay).catch(() => {});
}

function initLanguage() {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  const browserLang = navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  currentLang = saved || browserLang;
  applyTranslations();
}

function showToast(message, type = 'error', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${TOAST_ICONS[type] || ''}<span class="toast-msg">${escapeHtml(message)}</span><button class="toast-close">&times;</button>`;
  toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));
  toastContainer.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }
}

function dismissToast(toast) {
  if (!toast.parentNode) return;
  toast.classList.add('toast-exit');
  toast.addEventListener('animationend', () => toast.remove());
}

function getRunLabel(currentRun, totalRuns) {
  return totalRuns > 1 ? ` (${currentRun}/${totalRuns})` : '';
}

function setAutoButtonIdle() {
  btnAutoRun.innerHTML = `${PLAY_ICON}<span>${escapeHtml(t('auto'))}</span>`;
}

function setAutoButtonBusy(label) {
  btnAutoRun.innerHTML = `${CLOCK_ICON}<span>${escapeHtml(label)}</span>`;
}

function normalizeManualCode(value) {
  return (value || '').replace(/\D/g, '').slice(0, 6);
}

function syncPasswordField(state) {
  inputPassword.value = state.customPassword || state.password || '';
}

function syncPasswordToggleLabel() {
  btnTogglePassword.textContent = inputPassword.type === 'password' ? t('show') : t('hide');
}

function syncVpsToggleLabel() {
  const hidden = inputVpsUrl.type === 'password';
  btnToggleVps.classList.toggle('is-hidden', hidden);
  btnToggleVps.title = hidden ? t('showVpsTitle') : t('hideVpsTitle');
  btnToggleVps.setAttribute('aria-label', hidden ? t('showVpsTitle') : t('hideVpsTitle'));
}

function updateMailModeUI(state = null) {
  const isManual = inputMailMode.value === 'manual';
  const waitingForManualCode = Boolean(state?.pendingManualCodeStep || pendingManualCodeStep || autoContinueMode === 'manual_code');
  manualCodeRow.style.display = isManual || waitingForManualCode ? 'flex' : 'none';
  btnFetchEmail.disabled = fetchEmailBusy || isManual;

  if (autoContinueMode === 'email') {
    autoContinueHint.textContent = isManual ? t('manualEmailWaitHint') : t('emailWaitHint');
  }
}

async function restoreState() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'GET_STATE', source: 'sidepanel' });

    inputMailMode.value = 'manual';
    pendingManualCodeStep = state.pendingManualCodeStep || null;
    if (pendingManualCodeStep) {
      inputManualCode.value = state.manualVerificationCodes?.[pendingManualCodeStep] || '';
      autoContinueMode = 'manual_code';
      autoContinueBar.style.display = 'flex';
      autoContinueHint.textContent = t('manualCodeWaitHint', { step: pendingManualCodeStep });
    }
    if (state.pendingCheckoutUrl) {
      autoContinueMode = 'checkout_url';
      autoContinueBar.style.display = 'flex';
      autoContinueHint.textContent = t('checkoutUrlWaitHint');
      urlBackfillPanel.style.display = 'flex';
      inputUrlBackfill.value = state.checkoutUrl || '';
    }

    if (state.oauthUrl) {
      displayOauthUrl.textContent = state.oauthUrl;
      displayOauthUrl.classList.add('has-value');
    }
    if (state.localhostUrl) {
      displayLocalhostUrl.textContent = state.localhostUrl;
      displayLocalhostUrl.classList.add('has-value');
    }
    if (state.email) {
      inputEmail.value = state.email;
    }
    syncPasswordField(state);
    inputVpsUrl.value = state.vpsUrl || DEFAULT_VPS_URL;

    if (state.stepStatuses) {
      for (const [step, status] of Object.entries(state.stepStatuses)) {
        updateStepUI(Number(step), status);
      }
    }

    if (state.logs) {
      for (const entry of state.logs) {
        appendLog(entry);
      }
    }

    updateMailModeUI(state);
    updateStatusDisplay(state);
    updateProgressCounter();
  } catch (err) {
    console.error('Failed to restore state:', err);
  }
}

function updateStepUI(step, status) {
  const statusEl = document.querySelector(`.step-status[data-step="${step}"]`);
  const row = document.querySelector(`.step-row[data-step="${step}"]`);

  if (statusEl) statusEl.textContent = STATUS_ICONS[status] || '';
  if (row) row.className = `step-row ${status}`;

  updateButtonStates();
  updateProgressCounter();
}

function updateProgressCounter() {
  let completed = 0;
  document.querySelectorAll('.step-row').forEach((row) => {
    if (row.classList.contains('completed')) completed++;
  });
  stepsProgress.textContent = `${completed} / ${TOTAL_STEPS}`;
}

function updateButtonStates() {
  const statuses = {};
  document.querySelectorAll('.step-row').forEach((row) => {
    const step = Number(row.dataset.step);
    if (row.classList.contains('completed')) statuses[step] = 'completed';
    else if (row.classList.contains('running')) statuses[step] = 'running';
    else if (row.classList.contains('failed')) statuses[step] = 'failed';
    else if (row.classList.contains('stopped')) statuses[step] = 'stopped';
    else statuses[step] = 'pending';
  });

  const anyRunning = Object.values(statuses).some((status) => status === 'running');
  for (let step = 1; step <= TOTAL_STEPS; step++) {
    const btn = document.querySelector(`.step-btn[data-step="${step}"]`);
    if (btn) btn.disabled = anyRunning;
  }

  btnWorkflowContinue.disabled = anyRunning || getResumableStepFromStatuses(statuses) === null;
  updateStopButtonState(anyRunning || autoContinueBar.style.display !== 'none');
}

function getResumableStepFromStatuses(statuses, currentStep = null) {
  const normalized = {};
  for (let step = 1; step <= TOTAL_STEPS; step++) {
    normalized[step] = statuses[step] || 'pending';
  }

  const allPending = Object.values(normalized).every((status) => status === 'pending');
  if (allPending) return null;

  const highestCompleted = Object.entries(normalized)
    .filter(([, status]) => status === 'completed')
    .map(([step]) => Number(step))
    .sort((a, b) => b - a)[0] || 0;

  if (highestCompleted >= TOTAL_STEPS) return null;
  if (highestCompleted > 0) return highestCompleted + 1;

  const resolvedCurrentStep = Number(currentStep) || 0;
  if (resolvedCurrentStep && ['failed', 'stopped', 'running'].includes(normalized[resolvedCurrentStep])) {
    return resolvedCurrentStep;
  }

  for (let step = 1; step <= TOTAL_STEPS; step++) {
    if (normalized[step] !== 'completed') return step;
  }

  return null;
}

async function refreshContinueButton() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'GET_STATE', source: 'sidepanel' });
    btnWorkflowContinue.disabled = Boolean(state.autoRunning)
      || getResumableStepFromStatuses(state.stepStatuses || {}, state.currentStep) === null;
  } catch {}
}

function updateStopButtonState(active) {
  btnStop.disabled = false;
}

function updateStatusDisplay(state) {
  if (!state || !state.stepStatuses) return;

  statusBar.className = 'status-bar';

  const running = Object.entries(state.stepStatuses).find(([, status]) => status === 'running');
  if (running) {
    displayStatus.textContent = t('stepRunning', { step: running[0] });
    statusBar.classList.add('running');
    return;
  }

  const failed = Object.entries(state.stepStatuses).find(([, status]) => status === 'failed');
  if (failed) {
    displayStatus.textContent = t('stepFailed', { step: failed[0] });
    statusBar.classList.add('failed');
    return;
  }

  const stopped = Object.entries(state.stepStatuses).find(([, status]) => status === 'stopped');
  if (stopped) {
    displayStatus.textContent = t('stepStopped', { step: stopped[0] });
    statusBar.classList.add('stopped');
    return;
  }

  const lastCompleted = Object.entries(state.stepStatuses)
    .filter(([, status]) => status === 'completed')
    .map(([step]) => Number(step))
    .sort((a, b) => b - a)[0];

  if (lastCompleted === TOTAL_STEPS) {
    displayStatus.textContent = t('allDone');
    statusBar.classList.add('completed');
  } else if (lastCompleted) {
    displayStatus.textContent = t('stepDone', { step: lastCompleted });
  } else {
    displayStatus.textContent = t('ready');
  }
}

function appendLog(entry) {
  const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false });
  const levelLabel = entry.level.toUpperCase();
  const line = document.createElement('div');
  line.className = `log-line log-${entry.level}`;

  const stepMatch = entry.message.match(/Step (\d)/);
  const stepNum = stepMatch ? stepMatch[1] : null;

  let html = `<span class="log-time">${time}</span> `;
  html += `<span class="log-level log-level-${entry.level}">${levelLabel}</span> `;
  if (stepNum) {
    html += `<span class="log-step-tag step-${stepNum}">S${stepNum}</span>`;
  }
  html += `<span class="log-msg">${escapeHtml(entry.message)}</span>`;

  line.innerHTML = html;
  logArea.appendChild(line);
  logArea.scrollTop = logArea.scrollHeight;
}

async function syncPanelInputsToState() {
  const email = inputEmail.value.trim();
  const vpsUrl = inputVpsUrl.value.trim();
  const customPassword = inputPassword.value;
  const mailMode = 'manual';

  if (email) {
    await chrome.runtime.sendMessage({ type: 'SAVE_EMAIL', source: 'sidepanel', payload: { email } });
  }

  await chrome.runtime.sendMessage({
    type: 'SAVE_SETTING',
    source: 'sidepanel',
    payload: { vpsUrl, customPassword, mailMode },
  });
}

async function fetchBurnerEmail() {
  fetchEmailBusy = true;
  inputMailMode.value = 'burner';
  btnFetchEmail.disabled = true;
  btnFetchEmail.textContent = '...';

  try {
    await chrome.runtime.sendMessage({
      type: 'SAVE_SETTING',
      source: 'sidepanel',
      payload: { mailMode: 'burner' },
    });

    let response = await chrome.runtime.sendMessage({
      type: 'FETCH_BURNER_EMAIL',
      source: 'sidepanel',
      payload: { generateNew: true },
    });

    if (response?.error && /security verification required/i.test(response.error)) {
      const confirmed = window.confirm(t('burnerChallengeConfirm'));
      if (!confirmed) throw new Error(response.error);

      response = await chrome.runtime.sendMessage({
        type: 'CONTINUE_BURNER_AFTER_CHALLENGE',
        source: 'sidepanel',
        payload: { generateNew: true },
      });
    }

    if (response?.error) throw new Error(response.error);
    if (!response?.email) throw new Error('Burner Mailbox email was not returned.');

    inputEmail.value = response.email;
    showToast(t('burnerEmailLoaded', { email: response.email }), 'success', 2500);
    return response.email;
  } catch (err) {
    showToast(t('burnerEmailFailed', { message: err.message }), 'error');
    throw err;
  } finally {
    fetchEmailBusy = false;
    btnFetchEmail.textContent = t('auto');
    updateMailModeUI();
  }
}

async function submitManualCode(step = null) {
  const code = normalizeManualCode(inputManualCode.value);
  inputManualCode.value = code;

  if (code.length !== 6) {
    showToast(t('needManualCode'), 'warn');
    return false;
  }

  const state = await chrome.runtime.sendMessage({ type: 'GET_STATE', source: 'sidepanel' }).catch(() => ({}));
  const activeStep = Number(state.pendingManualCodeStep || pendingManualCodeStep || state.currentStep || step || 3);
  const targetStep = MANUAL_CODE_STEPS.includes(activeStep) ? activeStep : 3;

  const response = await chrome.runtime.sendMessage({
    type: 'SUBMIT_MANUAL_CODE',
    source: 'sidepanel',
    payload: { step: targetStep, code },
  });

  if (response?.error) {
    showToast(response.error, 'error');
    return false;
  }

  showToast(t('manualCodeSaved'), 'success', 1800);
  if (autoContinueMode === 'manual_code') {
    autoContinueBar.style.display = 'none';
    autoContinueMode = 'email';
  }
  pendingManualCodeStep = null;
  updateMailModeUI();
  return true;
}

function normalizeUrlInput(value) {
  const raw = (value || '').trim();
  if (!raw) return '';
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
}

async function submitCheckoutUrl() {
  const url = normalizeUrlInput(inputUrlBackfill.value);
  if (!url) {
    showToast(t('needCheckoutUrl'), 'warn');
    return false;
  }

  const response = await chrome.runtime.sendMessage({
    type: 'SUBMIT_CHECKOUT_URL',
    source: 'sidepanel',
    payload: { url },
  });

  if (response?.error) {
    showToast(response.error, 'error');
    return false;
  }

  inputUrlBackfill.value = response.checkoutUrl || url;
  urlBackfillPanel.style.display = 'none';
  autoContinueBar.style.display = 'none';
  autoContinueMode = 'email';
  showToast(t('checkoutUrlSaved'), 'success', 1800);
  updateMailModeUI();
  return true;
}

document.querySelectorAll('.step-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const step = Number(btn.dataset.step);
    await syncPanelInputsToState();

    const payload = { step };
    if (step === 2) {
      const email = inputEmail.value.trim();
      if (!email) {
        showToast(t('needEmail'), 'warn');
        return;
      }
      payload.email = email;
    }

    if (MANUAL_CODE_STEPS.includes(step)) {
      const code = normalizeManualCode(inputManualCode.value);
      if (code.length === 6) {
        payload.manualCode = code;
      }
    }

    await chrome.runtime.sendMessage({ type: 'EXECUTE_STEP', source: 'sidepanel', payload });
  });
});

btnFetchEmail.addEventListener('click', async () => {
  await fetchBurnerEmail().catch(() => {});
});

btnSubmitCode.addEventListener('click', async () => {
  await submitManualCode();
});

btnSubmitUrl.addEventListener('click', async () => {
  await submitCheckoutUrl();
});

btnTogglePassword.addEventListener('click', () => {
  inputPassword.type = inputPassword.type === 'password' ? 'text' : 'password';
  syncPasswordToggleLabel();
});

btnToggleVps.addEventListener('click', () => {
  inputVpsUrl.type = inputVpsUrl.type === 'password' ? 'text' : 'password';
  syncVpsToggleLabel();
});

btnLanguage.addEventListener('click', () => {
  setLanguage(currentLang === 'zh' ? 'en' : 'zh');
});

btnStop.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'STOP_FLOW', source: 'sidepanel', payload: {} });
  showToast(t('stopping'), 'warn', 2000);
});

btnAutoRun.addEventListener('click', async () => {
  const totalRuns = 1;
  await syncPanelInputsToState();
  btnAutoRun.disabled = true;
  btnWorkflowContinue.disabled = true;
  inputRunCount.disabled = true;
  setAutoButtonBusy(`${t('running')}...`);
  await chrome.runtime.sendMessage({ type: 'AUTO_RUN', source: 'sidepanel', payload: { totalRuns } });
});

btnWorkflowContinue.addEventListener('click', async () => {
  await syncPanelInputsToState();
  btnWorkflowContinue.disabled = true;
  btnAutoRun.disabled = true;
  inputRunCount.disabled = true;
  setAutoButtonBusy(`${t('running')}...`);

  const response = await chrome.runtime.sendMessage({ type: 'CONTINUE_AUTO_RUN', source: 'sidepanel', payload: {} });
  if (response?.error) {
    showToast(response.error, 'error');
    btnAutoRun.disabled = false;
    inputRunCount.disabled = false;
    setAutoButtonIdle();
    await refreshContinueButton();
  }
});

btnAutoContinue.addEventListener('click', async () => {
  if (autoContinueMode === 'manual_code') {
    await submitManualCode(pendingManualCodeStep);
    return;
  }

  if (autoContinueMode === 'checkout_url') {
    await submitCheckoutUrl();
    return;
  }

  if (autoContinueMode === 'email') {
    const email = inputEmail.value.trim();
    if (!email) {
      showToast(t('needEmail'), 'warn');
      return;
    }
    await syncPanelInputsToState();
    autoContinueBar.style.display = 'none';
    autoContinueMode = 'email';
    await chrome.runtime.sendMessage({ type: 'RESUME_AUTO_RUN', source: 'sidepanel', payload: { email } });
    return;
  }

  autoContinueBar.style.display = 'none';
  autoContinueMode = 'email';
  await chrome.runtime.sendMessage({ type: 'RESUME_AUTO_RUN', source: 'sidepanel', payload: {} });
});

btnReset.addEventListener('click', async () => {
  if (!confirm(t('resetConfirm'))) return;

  await chrome.runtime.sendMessage({ type: 'RESET', source: 'sidepanel' });
  displayOauthUrl.textContent = t('waiting');
  displayOauthUrl.classList.remove('has-value');
  displayLocalhostUrl.textContent = t('waiting');
  displayLocalhostUrl.classList.remove('has-value');
  inputEmail.value = '';
  inputManualCode.value = '';
  inputUrlBackfill.value = '';
  pendingManualCodeStep = null;
  inputVpsUrl.value = DEFAULT_VPS_URL;
  displayStatus.textContent = t('ready');
  statusBar.className = 'status-bar';
  logArea.innerHTML = '';
  document.querySelectorAll('.step-row').forEach((row) => { row.className = 'step-row'; });
  document.querySelectorAll('.step-status').forEach((el) => { el.textContent = ''; });
  btnAutoRun.disabled = false;
  inputRunCount.disabled = false;
  setAutoButtonIdle();
  autoContinueBar.style.display = 'none';
  urlBackfillPanel.style.display = 'none';
  autoContinueMode = 'email';
  updateMailModeUI();
  updateStopButtonState(false);
  updateButtonStates();
  updateProgressCounter();
  btnWorkflowContinue.disabled = true;
  syncVpsToggleLabel();
});

btnClearLog.addEventListener('click', () => {
  logArea.innerHTML = '';
});

inputEmail.addEventListener('change', async () => {
  const email = inputEmail.value.trim();
  if (!email) return;

  inputMailMode.value = 'manual';
  updateMailModeUI();
  await chrome.runtime.sendMessage({ type: 'SAVE_EMAIL', source: 'sidepanel', payload: { email } });
  await chrome.runtime.sendMessage({
    type: 'SAVE_SETTING',
    source: 'sidepanel',
    payload: { mailMode: 'manual' },
  });
});

inputMailMode.addEventListener('change', async () => {
  updateMailModeUI();
  await chrome.runtime.sendMessage({
    type: 'SAVE_SETTING',
    source: 'sidepanel',
    payload: { mailMode: inputMailMode.value },
  });
});

inputManualCode.addEventListener('input', () => {
  inputManualCode.value = normalizeManualCode(inputManualCode.value);
});

inputVpsUrl.addEventListener('change', async () => {
  const vpsUrl = inputVpsUrl.value.trim();
  if (vpsUrl) {
    await chrome.runtime.sendMessage({ type: 'SAVE_SETTING', source: 'sidepanel', payload: { vpsUrl } });
  }
});

inputPassword.addEventListener('change', async () => {
  await chrome.runtime.sendMessage({
    type: 'SAVE_SETTING',
    source: 'sidepanel',
    payload: { customPassword: inputPassword.value },
  });
});

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'LOG_ENTRY':
      appendLog(message.payload);
      if (message.payload.level === 'error') {
        showToast(message.payload.message, 'error');
      }
      break;

    case 'STEP_STATUS_CHANGED': {
      const { step, status } = message.payload;
      updateStepUI(step, status);
      chrome.runtime.sendMessage({ type: 'GET_STATE', source: 'sidepanel' }).then((state) => {
        updateStatusDisplay(state);
        btnWorkflowContinue.disabled = Boolean(state.autoRunning)
          || getResumableStepFromStatuses(state.stepStatuses || {}, state.currentStep) === null;
      });
      if (status === 'completed') {
        chrome.runtime.sendMessage({ type: 'GET_STATE', source: 'sidepanel' }).then((state) => {
          syncPasswordField(state);
          if (state.oauthUrl) {
            displayOauthUrl.textContent = state.oauthUrl;
            displayOauthUrl.classList.add('has-value');
          }
          if (state.localhostUrl) {
            displayLocalhostUrl.textContent = state.localhostUrl;
            displayLocalhostUrl.classList.add('has-value');
          }
        });
      }
      break;
    }

    case 'AUTO_RUN_RESET':
      displayOauthUrl.textContent = t('waiting');
      displayOauthUrl.classList.remove('has-value');
      displayLocalhostUrl.textContent = t('waiting');
      displayLocalhostUrl.classList.remove('has-value');
      inputManualCode.value = '';
      inputUrlBackfill.value = '';
      pendingManualCodeStep = null;
      displayStatus.textContent = t('ready');
      statusBar.className = 'status-bar';
      logArea.innerHTML = '';
      document.querySelectorAll('.step-row').forEach((row) => { row.className = 'step-row'; });
      document.querySelectorAll('.step-status').forEach((el) => { el.textContent = ''; });
      updateStopButtonState(false);
      autoContinueMode = 'email';
      autoContinueHint.textContent = inputMailMode.value === 'manual' ? t('manualEmailWaitHint') : t('emailWaitHint');
      urlBackfillPanel.style.display = 'none';
      updateMailModeUI();
      updateProgressCounter();
      btnWorkflowContinue.disabled = true;
      break;

    case 'DATA_UPDATED':
      if (message.payload.email) {
        inputEmail.value = message.payload.email;
      }
      if (message.payload.password !== undefined) {
        inputPassword.value = message.payload.password || '';
      }
      if (message.payload.oauthUrl) {
        displayOauthUrl.textContent = message.payload.oauthUrl;
        displayOauthUrl.classList.add('has-value');
      }
      if (message.payload.localhostUrl) {
        displayLocalhostUrl.textContent = message.payload.localhostUrl;
        displayLocalhostUrl.classList.add('has-value');
      }
      break;

    case 'SESSION_TEXT_COPIED':
      showToast(t('sessionTextCopied'), 'success', 2600);
      urlBackfillPanel.style.display = 'flex';
      break;

    case 'AUTO_RUN_STATUS': {
      const { phase, currentRun, totalRuns, step } = message.payload;
      const runLabel = getRunLabel(currentRun, totalRuns);
      switch (phase) {
        case 'waiting_email':
          autoContinueBar.style.display = 'flex';
          autoContinueMode = 'email';
          pendingManualCodeStep = null;
          urlBackfillPanel.style.display = 'none';
          autoContinueHint.textContent = inputMailMode.value === 'manual' ? t('manualEmailWaitHint') : t('emailWaitHint');
          setAutoButtonBusy(`${t('paused')}${runLabel}`);
          btnWorkflowContinue.disabled = true;
          updateStopButtonState(true);
          updateMailModeUI();
          break;
        case 'waiting_challenge':
          autoContinueBar.style.display = 'flex';
          autoContinueMode = 'challenge';
          pendingManualCodeStep = null;
          autoContinueHint.textContent = t('challengeWaitHint');
          setAutoButtonBusy(`${t('paused')}${runLabel}`);
          btnWorkflowContinue.disabled = true;
          updateStopButtonState(true);
          updateMailModeUI();
          break;
        case 'waiting_manual_code':
          autoContinueBar.style.display = 'flex';
          autoContinueMode = 'manual_code';
          pendingManualCodeStep = Number(step) || null;
          urlBackfillPanel.style.display = 'none';
          autoContinueHint.textContent = t('manualCodeWaitHint', { step: pendingManualCodeStep || '' });
          setAutoButtonBusy(`${t('paused')}${runLabel}`);
          btnWorkflowContinue.disabled = true;
          updateStopButtonState(true);
          updateMailModeUI({ pendingManualCodeStep });
          inputManualCode.focus();
          break;
        case 'waiting_checkout_url':
          autoContinueBar.style.display = 'flex';
          autoContinueMode = 'checkout_url';
          pendingManualCodeStep = null;
          autoContinueHint.textContent = t('checkoutUrlWaitHint');
          urlBackfillPanel.style.display = 'flex';
          setAutoButtonBusy(`${t('paused')}${runLabel}`);
          btnWorkflowContinue.disabled = true;
          updateStopButtonState(true);
          inputUrlBackfill.focus();
          break;
        case 'running':
          setAutoButtonBusy(`${t('running')}${runLabel}`);
          btnWorkflowContinue.disabled = true;
          updateStopButtonState(true);
          break;
        case 'complete':
        case 'stopped':
          btnAutoRun.disabled = false;
          inputRunCount.disabled = false;
          setAutoButtonIdle();
          autoContinueBar.style.display = 'none';
          urlBackfillPanel.style.display = 'none';
          autoContinueMode = 'email';
          pendingManualCodeStep = null;
          autoContinueHint.textContent = inputMailMode.value === 'manual' ? t('manualEmailWaitHint') : t('emailWaitHint');
          updateStopButtonState(false);
          updateMailModeUI();
          refreshContinueButton();
          break;
      }
      break;
    }
  }
});

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('multipage-theme');
  if (saved) {
    setTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }
}

btnTheme.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

initLanguage();
initTheme();
restoreState().then(() => {
  syncPasswordToggleLabel();
  syncVpsToggleLabel();
  updateMailModeUI();
  updateButtonStates();
  refreshContinueButton();
});
