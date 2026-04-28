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

const DEFAULT_VPS_URL = 'http://127.0.0.1:5173/#/oauth';
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
    emailPlaceholder: 'Auto fetch from Burner Mailbox or paste manually',
    passwordPlaceholder: 'Leave blank to auto-generate',
    manualCodePlaceholder: 'Enter verification code',
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
    step1: 'Get OAuth Link',
    step2: 'Open Signup',
    step3: 'Fill Email / Password',
    step4: 'Get Signup Code',
    step5: 'Fill Name / Birthday',
    step6: 'Login via OAuth',
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
    emailWaitHint: 'Use Auto to fetch a Burner Mailbox email, or paste manually, then continue',
    manualEmailWaitHint: 'Paste a manual email address, then continue',
    challengeWaitHint: 'Complete Burner Mailbox security verification on the mailbox tab, then continue',
    manualCodeWaitHint: 'Enter the Step {step} verification code, then continue',
    needEmail: 'Please paste an email address or use Auto first',
    needBurnerEmail: 'Please fetch or paste a Burner Mailbox email first',
    needManualCode: 'Please enter a 6-digit verification code',
    manualCodeSaved: 'Verification code submitted',
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
    emailPlaceholder: '自动获取 Burner 邮箱，或手动粘贴邮箱',
    passwordPlaceholder: '留空则自动生成账号密码',
    manualCodePlaceholder: '输入验证码',
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
    step1: '获取 OAuth 链接',
    step2: '打开注册页',
    step3: '填写邮箱 / 密码',
    step4: '获取注册验证码',
    step5: '填写姓名 / 生日',
    step6: 'OAuth 登录',
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
    emailWaitHint: '使用自动获取 Burner 邮箱，或手动粘贴邮箱后继续',
    manualEmailWaitHint: '粘贴手动邮箱后继续',
    challengeWaitHint: '请先在邮箱标签页完成 Burner Mailbox 安全验证，然后继续',
    manualCodeWaitHint: '输入步骤 {step} 的验证码后继续',
    needEmail: '请先粘贴邮箱，或使用自动获取',
    needBurnerEmail: '请先获取或粘贴 Burner 邮箱',
    needManualCode: '请输入 6 位验证码',
    manualCodeSaved: '验证码已提交',
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

    inputMailMode.value = state.mailMode || 'burner';
    pendingManualCodeStep = state.pendingManualCodeStep || null;
    if (pendingManualCodeStep) {
      inputManualCode.value = state.manualVerificationCodes?.[pendingManualCodeStep] || '';
      autoContinueMode = 'manual_code';
      autoContinueBar.style.display = 'flex';
      autoContinueHint.textContent = t('manualCodeWaitHint', { step: pendingManualCodeStep });
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
  stepsProgress.textContent = `${completed} / 9`;
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
  for (let step = 1; step <= 9; step++) {
    const btn = document.querySelector(`.step-btn[data-step="${step}"]`);
    if (btn) btn.disabled = anyRunning;
  }

  btnWorkflowContinue.disabled = anyRunning || getResumableStepFromStatuses(statuses) === null;
  updateStopButtonState(anyRunning || autoContinueBar.style.display !== 'none');
}

function getResumableStepFromStatuses(statuses, currentStep = null) {
  const normalized = {};
  for (let step = 1; step <= 9; step++) {
    normalized[step] = statuses[step] || 'pending';
  }

  const allPending = Object.values(normalized).every((status) => status === 'pending');
  if (allPending) return null;

  const highestCompleted = Object.entries(normalized)
    .filter(([, status]) => status === 'completed')
    .map(([step]) => Number(step))
    .sort((a, b) => b - a)[0] || 0;

  if (highestCompleted >= 9) return null;
  if (highestCompleted > 0) return highestCompleted + 1;

  const resolvedCurrentStep = Number(currentStep) || 0;
  if (resolvedCurrentStep && ['failed', 'stopped', 'running'].includes(normalized[resolvedCurrentStep])) {
    return resolvedCurrentStep;
  }

  for (let step = 1; step <= 9; step++) {
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

  if (lastCompleted === 9) {
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
  const mailMode = inputMailMode.value || 'burner';

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
  const activeStep = Number(state.pendingManualCodeStep || pendingManualCodeStep || state.currentStep || step || 4);
  const targetStep = [4, 7].includes(activeStep) ? activeStep : 4;

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

document.querySelectorAll('.step-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const step = Number(btn.dataset.step);
    await syncPanelInputsToState();

    const payload = { step };
    if (step === 3) {
      const email = inputEmail.value.trim();
      if (!email) {
        showToast(t('needEmail'), 'warn');
        return;
      }
      payload.email = email;
    }

    if ([4, 7].includes(step) && inputMailMode.value === 'manual') {
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
  const totalRuns = parseInt(inputRunCount.value, 10) || 1;
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

  if (autoContinueMode === 'email') {
    const email = inputEmail.value.trim();
    if (!email) {
      showToast(inputMailMode.value === 'manual' ? t('needEmail') : t('needBurnerEmail'), 'warn');
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
      inputEmail.value = '';
      inputManualCode.value = '';
      pendingManualCodeStep = null;
      displayStatus.textContent = t('ready');
      statusBar.className = 'status-bar';
      logArea.innerHTML = '';
      document.querySelectorAll('.step-row').forEach((row) => { row.className = 'step-row'; });
      document.querySelectorAll('.step-status').forEach((el) => { el.textContent = ''; });
      updateStopButtonState(false);
      autoContinueMode = 'email';
      autoContinueHint.textContent = inputMailMode.value === 'manual' ? t('manualEmailWaitHint') : t('emailWaitHint');
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

    case 'AUTO_RUN_STATUS': {
      const { phase, currentRun, totalRuns, step } = message.payload;
      const runLabel = getRunLabel(currentRun, totalRuns);
      switch (phase) {
        case 'waiting_email':
          autoContinueBar.style.display = 'flex';
          autoContinueMode = 'email';
          pendingManualCodeStep = null;
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
          autoContinueHint.textContent = t('manualCodeWaitHint', { step: pendingManualCodeStep || '' });
          setAutoButtonBusy(`${t('paused')}${runLabel}`);
          btnWorkflowContinue.disabled = true;
          updateStopButtonState(true);
          updateMailModeUI({ pendingManualCodeStep });
          inputManualCode.focus();
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
