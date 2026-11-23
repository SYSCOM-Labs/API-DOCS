const PHASE = { clock: 'Reloj', search: 'Buscando', download: 'Descargando' };

const state = {
  config: null,
  clips: [],
  channels: [],
  lookback: 45,
  courts: [],
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

async function api(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: options.body ? { 'content-type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || 'No se pudo completar.');
    error.status = res.status;
    throw error;
  }
  return data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextCourtId() {
  const used = new Set(state.courts.map((court) => court.id));
  let n = state.courts.length + 1;
  while (used.has(`cancha-${n}`)) n += 1;
  return `cancha-${n}`;
}

async function boot() {
  const session = await api('/api/session');
  if (session.required && !session.ok) {
    $('#gate').hidden = false;
    $('#shell').hidden = true;
    $('#gate-code').focus();
    return;
  }
  $('#gate').hidden = true;
  // El botón de ajustes vive en #shell: no se muestra hasta tener la configuración.
  await refresh();
  $('#shell').hidden = false;
}

async function refresh() {
  state.config = await api('/api/config');
  state.lookback = state.config.lookbackSec;
  state.courts = state.config.courts.map((court) => ({ ...court }));
  const listed = await api('/api/clips');
  state.clips = listed.clips || [];
  $('#setup-hint').hidden = Boolean(state.config.recorder.host);
  $('#restart-hint').hidden = !state.config.restartNeeded;
  renderCourts();
}

function renderCourts() {
  const grid = $('#court-grid');
  grid.replaceChildren();
  for (const court of state.config.courts) {
    const card = $('#court-template').content.firstElementChild.cloneNode(true);
    card.dataset.id = court.id;
    $('.court-name', card).textContent = court.name;
    $('.court-channel span', card).textContent = `Canal ${court.channel}`;
    $('.play', card).addEventListener('click', () => takeClip(court.id, card));
    renderRecents(card, court.id);
    grid.append(card);
  }
}

function renderRecents(card, courtId) {
  const row = $('.recent', card);
  row.replaceChildren();
  for (const clip of state.clips.filter((item) => item.courtId === courtId).slice(0, 8)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = clip.label;
    button.addEventListener('click', () => showClip(card, clip));
    row.append(button);
  }
}

function showClip(card, clip) {
  const wrap = $('.player', card);
  const video = $('video', card);
  const link = $('.save-clip', card);
  const warn = $('.warn', card);
  wrap.hidden = false;
  video.src = clip.url;
  video.play().catch(() => {});
  link.hidden = false;
  link.href = clip.url;
  link.download = clip.id;
  $$('.chip', card).forEach((chip) => {
    chip.setAttribute('aria-current', chip.textContent === clip.label ? 'true' : 'false');
  });
  if (clip.warning) {
    warn.hidden = false;
    warn.textContent = clip.warning;
  } else {
    warn.hidden = true;
  }
}

async function takeClip(id, card) {
  const button = $('.play', card);
  const label = $('.action-label', card);
  const note = $('.note', card);
  if (button.disabled) return;
  button.disabled = true;
  card.dataset.busy = '1';
  note.hidden = true;
  try {
    const { jobId } = await api(`/api/courts/${id}/clip`, { method: 'POST' });
    for (;;) {
      const job = await api(`/api/jobs/${jobId}`);
      if (job.phase === 'ready') {
        showClip(card, job.clip);
        state.clips = (await api('/api/clips')).clips || [];
        renderRecents(card, id);
        break;
      }
      if (job.phase === 'error') {
        note.hidden = false;
        note.textContent = job.message;
        break;
      }
      label.textContent = PHASE[job.phase] || job.message;
      await sleep(400);
    }
  } catch (error) {
    note.hidden = false;
    note.textContent = error.message;
  } finally {
    button.disabled = false;
    delete card.dataset.busy;
    label.textContent = 'Última jugada';
  }
}

function fillSettings() {
  const rec = state.config.recorder;
  $('#rec-host').value = rec.host || '';
  $('#rec-port').value = rec.port || 80;
  $('#rec-user').value = rec.user || '';
  $('#rec-pass').value = '';
  $('#rec-pass').placeholder = rec.hasPassword ? 'Guardada' : '';
  $('#rec-https').checked = Boolean(rec.https);
  $('#panel-port').value = state.config.port;
  $('#listen-lan').checked = state.config.access.required;
  $('#access-code').value = '';
  $('#access-code').placeholder = state.config.access.hasCode ? 'Guardado' : '';
  $('#code-field').hidden = !state.config.access.required;
  state.lookback = state.config.lookbackSec;
  paintLookback();
  state.courts = state.config.courts.map((court) => ({ ...court }));
  renderEditor();
  $('#save-note').textContent = '';
  $('#restart-hint').hidden = !state.config.restartNeeded;
}

const LOOKBACKS = [15, 30, 45, 60];
const LOOKBACK_LABELS = ['15 s', '30 s', '45 s', '1 min'];

function lookbackIndex(sec) {
  const index = LOOKBACKS.indexOf(Number(sec));
  return index < 0 ? LOOKBACKS.indexOf(45) : index;
}

function paintLookback() {
  const index = lookbackIndex(state.lookback);
  state.lookback = LOOKBACKS[index];
  const input = $('#lookback');
  input.value = String(index);
  input.setAttribute('aria-valuetext', LOOKBACK_LABELS[index]);
  $$('#lookback-stops button').forEach((button, i) => {
    if (i === index) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
}

function renderEditor() {
  const editor = $('#court-editor');
  editor.replaceChildren();
  state.courts.forEach((court, index) => {
    const row = document.createElement('div');
    row.className = 'court-row';
    row.dataset.id = court.id;
    const name = document.createElement('input');
    name.className = 'name';
    name.value = court.name;
    name.maxLength = 40;
    name.setAttribute('aria-label', 'Nombre de la cancha');
    name.addEventListener('input', () => { state.courts[index].name = name.value; });
    const channel = channelControl(court, index);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'icon-btn';
    remove.setAttribute('aria-label', 'Quitar cancha');
    remove.innerHTML = '<svg><use href="#i-close"/></svg>';
    remove.disabled = state.courts.length === 1;
    remove.addEventListener('click', () => {
      state.courts.splice(index, 1);
      renderEditor();
    });
    row.append(name, channel, remove);
    editor.append(row);
  });
}

function channelControl(court, index) {
  if (!state.channels.length) {
    const input = document.createElement('input');
    input.className = 'channel';
    input.inputMode = 'numeric';
    input.value = String(court.channel);
    input.setAttribute('aria-label', 'Canal');
    input.addEventListener('input', () => { state.courts[index].channel = Number(input.value); });
    return input;
  }
  const select = document.createElement('select');
  select.className = 'channel';
  select.setAttribute('aria-label', 'Canal');
  const known = new Set(state.channels.map((item) => item.id));
  const options = [...state.channels];
  if (!known.has(Number(court.channel))) options.unshift({ id: Number(court.channel), name: `Canal ${court.channel}` });
  for (const item of options) {
    const option = document.createElement('option');
    option.value = String(item.id);
    option.textContent = item.name && item.name !== `Canal ${item.id}` ? `${item.id} · ${item.name}` : `Canal ${item.id}`;
    if (Number(item.id) === Number(court.channel)) option.selected = true;
    select.append(option);
  }
  select.addEventListener('change', () => { state.courts[index].channel = Number(select.value); });
  return select;
}

function settingsBody() {
  const lan = $('#listen-lan').checked;
  return {
    listen: lan ? '0.0.0.0' : '127.0.0.1',
    port: Number($('#panel-port').value),
    lookbackSec: Number(state.lookback),
    accessCode: $('#access-code').value,
    recorder: {
      host: $('#rec-host').value.trim(),
      port: Number($('#rec-port').value),
      user: $('#rec-user').value.trim(),
      password: $('#rec-pass').value,
      https: $('#rec-https').checked,
    },
    courts: state.courts.map((court) => ({
      id: court.id,
      name: court.name.trim(),
      channel: Number(court.channel),
    })),
  };
}

function openSettings() {
  if (!state.config) return;
  fillSettings();
  $('#drawer').hidden = false;
  $('#rec-host').focus();
}

function closeSettings() {
  $('#drawer').hidden = true;
}

$('#gate-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  $('#gate-error').textContent = '';
  try {
    await api('/api/session', { method: 'POST', body: { code: $('#gate-code').value } });
    await boot();
  } catch (error) {
    $('#gate-error').textContent = error.message;
  }
});

$('#open-settings').addEventListener('click', openSettings);
$('#close-settings').addEventListener('click', closeSettings);
$('#drawer-backdrop').addEventListener('click', closeSettings);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !$('#drawer').hidden) closeSettings();
});

$('#lookback').addEventListener('input', () => {
  state.lookback = LOOKBACKS[Number($('#lookback').value)];
  paintLookback();
});
$$('#lookback-stops button').forEach((button) => {
  button.addEventListener('click', () => {
    state.lookback = Number(button.dataset.sec);
    paintLookback();
  });
});

$('#listen-lan').addEventListener('change', () => {
  $('#code-field').hidden = !$('#listen-lan').checked;
});

$('#add-court').addEventListener('click', () => {
  const n = state.courts.length + 1;
  state.courts.push({ id: nextCourtId(), name: `Cancha ${n}`, channel: n });
  renderEditor();
});

$('#probe').addEventListener('click', async () => {
  const result = $('#probe-result');
  result.textContent = 'Conectando';
  try {
    const body = settingsBody();
    const reply = await api('/api/test', { method: 'POST', body: { recorder: body.recorder } });
    if (!reply.ok) {
      result.textContent = reply.message;
      return;
    }
    state.channels = reply.channels || [];
    const title = [reply.model, reply.name].filter(Boolean).join(' · ');
    result.textContent = title || 'Conectado';
    renderEditor();
  } catch (error) {
    result.textContent = error.message;
  }
});

$('#settings-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const note = $('#save-note');
  note.textContent = '';
  try {
    state.config = await api('/api/config', { method: 'PUT', body: settingsBody() });
    state.lookback = state.config.lookbackSec;
    state.courts = state.config.courts.map((court) => ({ ...court }));
    $('#rec-pass').value = '';
    $('#rec-pass').placeholder = state.config.recorder.hasPassword ? 'Guardada' : '';
    $('#access-code').value = '';
    $('#access-code').placeholder = state.config.access.hasCode ? 'Guardado' : '';
    $('#restart-hint').hidden = !state.config.restartNeeded;
    note.textContent = 'Guardado';
    $('#setup-hint').hidden = Boolean(state.config.recorder.host);
    renderCourts();
  } catch (error) {
    note.textContent = error.message;
  }
});

boot().catch((error) => {
  document.body.textContent = error.message;
});
