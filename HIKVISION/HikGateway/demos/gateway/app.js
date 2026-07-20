/* ══════════════════════════════════════════════════════════════
   Hik DeviceGateway — Consola de integración (lógica de la SPA)
   Todo el tráfico ISAPI pasa por POST /proxy, que resuelve el
   handshake HTTP Digest contra el gateway.
   ══════════════════════════════════════════════════════════════ */
'use strict';

const LS_KEY = 'hikgw_conn';
const state = {
  host: '',
  user: '',
  password: '',
  connected: false,
  devices: [],
  selected: null, // objeto Device seleccionado
  section: 'dispositivos',
};

// ── Utilidades ──────────────────────────────────────────────
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const el = (tag, attrs = {}, html) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else n.setAttribute(k, v);
  }
  if (html !== undefined) n.innerHTML = html;
  return n;
};
const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  }).toUpperCase();
}

function toast(msg, kind = 'info', ms = 3600) {
  const t = el('div', { class: `toast ${kind}` }, esc(msg));
  $('#toasts').appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity .3s, transform .3s';
    t.style.opacity = '0';
    t.style.transform = 'translateX(20px)';
    setTimeout(() => t.remove(), 300);
  }, ms);
}

// Resaltado de JSON
function hlJSON(obj) {
  let s = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return s.replace(
    /("(?:\\.|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)/g,
    (m) => {
      let cls = 'n';
      if (/^"/.test(m)) cls = /:\s*$/.test(m) ? 'k' : 's';
      else if (/true|false|null/.test(m)) cls = 'b';
      return `<span class="${cls}">${m}</span>`;
    }
  );
}
const jsonBox = (obj) => `<div class="json">${hlJSON(obj)}</div>`;

// ── Proxy / API ─────────────────────────────────────────────
async function proxy(method, path, body) {
  const base = state.host.replace(/\/+$/, '');
  const url = base + path;
  const payload = { url, method, auth: { user: state.user, password: state.password } };
  if (body !== undefined && body !== null && body !== '') payload.body = body;

  const t0 = performance.now();
  let res;
  try {
    res = await fetch('/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    logHud({ method, path, status: 0, ms: 0, reqBody: body, resData: { message: 'No se pudo contactar el proxy local: ' + e.message } });
    throw new Error('proxy inaccesible');
  }
  const ms = Math.round(performance.now() - t0);
  const ct = res.headers.get('content-type') || '';
  let data;
  if (ct.startsWith('image/')) {
    data = { __image: URL.createObjectURL(await res.blob()) };
  } else {
    const txt = await res.text();
    try { data = JSON.parse(txt); } catch { data = txt; }
  }
  logHud({ method, path, status: res.status, ms, reqBody: body, resData: data });
  return { ok: res.ok, status: res.status, data, ms };
}

// Devuelve el mensaje de error legible de una respuesta ISAPI
function apiError(r) {
  const d = r.data || {};
  if (typeof d === 'string') return d.slice(0, 200);
  return d.errorMsg || d.statusString || d.message || d.subStatusCode || `HTTP ${r.status}`;
}

// ── Code HUD ────────────────────────────────────────────────
const hudEntries = [];
let hudSel = -1;
function logHud({ method, path, status, ms, reqBody, resData }) {
  hudEntries.unshift({ method, path, status, ms, reqBody, resData, time: new Date() });
  if (hudEntries.length > 60) hudEntries.pop();
  const rec = $('#hudRec');
  rec.classList.add('live');
  setTimeout(() => rec.classList.remove('live'), 900);
  renderHud();
}
function statusClass(s) { return s >= 200 && s < 300 ? 's2' : s >= 400 && s < 500 ? 's4' : 's5'; }
function renderHud() {
  const last = hudEntries[0];
  $('#hudCount').textContent = hudEntries.length ? `${hudEntries.length} solicitud${hudEntries.length !== 1 ? 'es' : ''}` : '';
  if (last) {
    $('#hudLast').innerHTML =
      `<span class="method ${last.method}">${last.method}</span><span class="p">${esc(last.path)}</span>` +
      `<span class="status-chip ${statusClass(last.status)}">${last.status || 'ERR'}</span>` +
      `<span style="color:var(--text-faint)">${last.ms} ms</span>`;
  }
  const log = $('#hudLog');
  log.innerHTML = '';
  hudEntries.forEach((e, i) => {
    const row = el('div', { class: 'hud-entry' + (i === hudSel ? ' active' : '') });
    row.innerHTML =
      `<span class="method ${e.method}">${e.method}</span>` +
      `<span class="p">${esc(shortPath(e.path))}</span>` +
      `<span class="status-chip ${statusClass(e.status)}">${e.status || 'ERR'}</span>` +
      `<span class="ms">${e.ms}ms</span>`;
    row.onclick = () => { hudSel = i; renderHud(); renderHudDetail(); openHud(true); };
    log.appendChild(row);
  });
  renderHudDetail();
}
function shortPath(p) { return p.length > 46 ? p.slice(0, 44) + '…' : p; }
function renderHudDetail() {
  const d = $('#hudDetail');
  const e = hudEntries[hudSel];
  if (!e) { d.innerHTML = '<div class="empty" style="padding:30px"><h3>Seleccione una entrada</h3></div>'; return; }
  let html = `<div class="lbl"><span class="method ${e.method}">${e.method}</span> <span class="mono" style="color:var(--text-dim);font-size:11.5px">${esc(e.path)}</span></div>`;
  if (e.reqBody !== undefined && e.reqBody !== null && e.reqBody !== '') {
    html += `<div class="lbl">Solicitud</div>` + jsonBox(e.reqBody);
  }
  html += `<div class="lbl">Respuesta · <span class="status-chip ${statusClass(e.status)}">${e.status || 'ERR'}</span> · ${e.ms} ms</div>`;
  html += e.resData && e.resData.__image ? `<img src="${e.resData.__image}" style="max-width:100%;border-radius:6px;border:1px solid var(--line)"/>` : jsonBox(e.resData);
  d.innerHTML = html;
}
function openHud(open) {
  const hud = $('#hud');
  const on = open === undefined ? !hud.classList.contains('open') : open;
  hud.classList.toggle('open', on);
  $('#hudChevron').style.transform = on ? 'rotate(180deg)' : '';
}

// ── Conexión ────────────────────────────────────────────────
async function connect() {
  const host = $('#inHost').value.trim();
  const user = $('#inUser').value.trim();
  const password = $('#inPass').value;
  if (!host || !user) return toast('Indique host y usuario', 'err');
  state.host = /^https?:\/\//i.test(host) ? host : 'http://' + host;
  state.user = user;
  state.password = password;

  const btn = $('#btnConnect');
  btn.disabled = true;
  $('#connectLbl').innerHTML = '<span class="spinner"></span>';
  try {
    const r = await proxy('GET', '/ISAPI/System/deviceInfo?format=json');
    if (r.ok && r.data && r.data.DeviceInfo) {
      state.connected = true;
      localStorage.setItem(LS_KEY, JSON.stringify({ host: state.host, user, password }));
      $('#inAccessUrl').value = defaultWss();
      toast(`Conectado a ${r.data.DeviceInfo.deviceName || 'gateway'}`, 'ok');
      enterApp();
      loadDevices();
    } else {
      toast('Autenticación fallida: ' + apiError(r), 'err');
    }
  } catch (e) {
    toast('No se pudo conectar. ¿El proxy está activo y el host es alcanzable?', 'err', 5000);
  } finally {
    btn.disabled = false;
    $('#connectLbl').textContent = 'Conectar';
  }
}

function disconnect() {
  state.connected = false;
  state.devices = [];
  state.selected = null;
  stopLive();
  $('#sidebar').style.display = 'none';
  $('#connPill').style.display = 'none';
  showSection('connect');
}

function defaultWss() {
  try {
    const u = new URL(state.host);
    return `wss://${u.hostname}:443`;
  } catch { return 'wss://:443'; }
}

function enterApp() {
  $('#sidebar').style.display = 'flex';
  $('#connPill').style.display = 'flex';
  $('#connDot').className = 'dot on';
  $('#connHost').textContent = state.host.replace(/^https?:\/\//, '');
  showSection('dispositivos');
}

// ── Navegación ──────────────────────────────────────────────
function showSection(sec) {
  state.section = sec;
  $$('.section').forEach((s) => s.classList.remove('active'));
  const map = { connect: 'sec-connect', dispositivos: 'sec-dispositivos', explorador: 'sec-explorador', acceso: 'sec-acceso', video: 'sec-video' };
  $('#' + map[sec]).classList.add('active');
  $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.sec === sec));
  if (sec === 'acceso') renderAcceso();
  if (sec === 'video') syncVideoSection();
}

// ── Sección: Dispositivos ───────────────────────────────────
async function loadDevices() {
  const grid = $('#devGrid');
  grid.innerHTML = '<div class="loading-cell"><span class="spinner"></span> Cargando dispositivos…</div>';
  // Info del gateway
  proxy('GET', '/ISAPI/System/deviceInfo?format=json').then((r) => {
    const gi = r.data && r.data.DeviceInfo;
    $('#gwInfoCard').innerHTML = gi
      ? `<div class="card" style="margin-bottom:16px"><div class="dev-top">
           <div class="dev-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg></div>
           <div><div class="dev-name">${esc(gi.deviceName || 'Gateway')}</div><div class="dev-model">${esc(gi.model || '')} · ${esc(gi.softwareVersion || gi.firmwareVersion || '')}</div></div>
           <div style="margin-left:auto"><span class="badge type">${esc(gi.deviceType || 'Gateway')}</span></div>
         </div><div class="dev-meta"><div class="dev-row"><span class="kk">SO</span><span class="vv">${esc(gi.operationSystem || '—')}</span></div></div></div>`
      : '';
  });
  // Lista de dispositivos
  try {
    const r = await proxy('POST', '/ISAPI/ContentMgmt/DeviceMgmt/deviceList?format=json', {
      SearchDescription: { position: 0, maxResult: 200 },
    });
    const list = (r.data && r.data.SearchResult && r.data.SearchResult.MatchList) || [];
    state.devices = list.map((m) => m.Device).filter(Boolean);
    renderDevices();
  } catch (e) {
    grid.innerHTML = `<div class="empty"><h3>No se pudieron cargar los dispositivos</h3></div>`;
  }
}

function deviceIcon(devType) {
  return devType === 'AccessControl'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>';
}

function renderDevices() {
  const grid = $('#devGrid');
  $('#devCount').textContent = `${state.devices.length} dispositivo${state.devices.length !== 1 ? 's' : ''}`;
  if (!state.devices.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/></svg><h3>Sin dispositivos</h3><p>Agregue uno con el botón de arriba.</p></div>`;
    return;
  }
  grid.innerHTML = '';
  state.devices.forEach((d) => {
    const online = d.devStatus === 'online';
    const isSel = state.selected && state.selected.devIndex === d.devIndex;
    const card = el('div', { class: 'card selectable' + (isSel ? ' sel' : '') });
    card.innerHTML =
      `<div class="dev-top">
         <div class="dev-ic">${deviceIcon(d.devType)}</div>
         <div style="min-width:0"><div class="dev-name">${esc(d.devName || 'Dispositivo')}</div><div class="dev-model">${esc(d.devMode || d.devType || '')}</div></div>
         <div style="margin-left:auto"><span class="badge ${online ? 'online' : 'offline'}"><span class="dot ${online ? 'on' : 'off'}"></span>${online ? 'En línea' : 'Fuera de línea'}</span></div>
       </div>
       <div class="dev-meta">
         <div class="dev-row"><span class="kk">Tipo</span><span class="badge type">${esc(d.devType || '—')}</span></div>
         <div class="dev-row"><span class="kk">Protocolo</span><span class="vv">${esc(d.protocolType || '—')}</span></div>
         <div class="dev-row"><span class="kk">devIndex</span><span class="vv" title="${esc(d.devIndex)}">${esc(d.devIndex || '—')}</span></div>
         ${d.videoChannelNum ? `<div class="dev-row"><span class="kk">Canales</span><span class="vv">${d.videoChannelNum} video</span></div>` : ''}
       </div>
       <div class="dev-actions">
         <button class="btn sm ${isSel ? 'primary' : ''}" data-act="select">${isSel ? 'Seleccionado' : 'Seleccionar'}</button>
         <button class="btn sm danger" data-act="del">Eliminar</button>
       </div>`;
    card.querySelector('[data-act="select"]').onclick = () => selectDevice(d);
    card.querySelector('[data-act="del"]').onclick = () => confirmDelete(d);
    grid.appendChild(card);
  });
}

function selectDevice(d) {
  state.selected = d;
  renderDevices();
  $('#selDevBox').style.display = 'block';
  $('#selDevName').textContent = d.devName || 'Dispositivo';
  $('#selDevIdx').textContent = d.devIndex;
  toast(`Dispositivo activo: ${d.devName}`, 'info', 2200);
}

function confirmDelete(d) {
  openModal(`
    <div class="modal-head"><h2>Eliminar dispositivo</h2><p>Se dará de baja <b>${esc(d.devName)}</b> del gateway. Esta acción no se puede deshacer.</p></div>
    <div class="modal-body"><div class="dev-row"><span class="kk">devIndex</span><span class="vv">${esc(d.devIndex)}</span></div></div>
    <div class="modal-foot"><button class="btn ghost" data-close>Cancelar</button><button class="btn danger" id="mDel">Eliminar</button></div>`);
  $('#mDel').onclick = async () => {
    const r = await proxy('POST', '/ISAPI/ContentMgmt/DeviceMgmt/delDevice?format=json', { DevIndexList: [d.devIndex] });
    closeModal();
    if (r.ok && (!r.data || r.data.statusCode !== 401)) { toast('Dispositivo eliminado', 'ok'); if (state.selected && state.selected.devIndex === d.devIndex) state.selected = null; loadDevices(); }
    else toast('No se pudo eliminar: ' + apiError(r), 'err');
  };
}

function addDeviceModal() {
  openModal(`
    <div class="modal-head"><h2>Agregar dispositivo</h2><p>Registre un dispositivo por ISUP/EHome (registro por EhomeID/EhomeKey).</p></div>
    <div class="modal-body">
      <div class="row2">
        <div class="field"><label>Nombre</label><input class="input" id="aName" placeholder="Cámara recepción"/></div>
        <div class="field"><label>Tipo</label><select class="input" id="aType"><option value="AccessControl">AccessControl</option><option value="encodingDev">encodingDev</option></select></div>
      </div>
      <div class="field"><label>Protocolo</label><select class="input" id="aProto"><option value="ehomeV5">ehomeV5</option><option value="ehome">ehome</option><option value="isapi">isapi</option></select></div>
      <div class="row2">
        <div class="field"><label>EhomeID</label><input class="input mono" id="aEid" placeholder="AX9706605"/></div>
        <div class="field"><label>EhomeKey</label><input class="input mono" id="aEkey" placeholder="clave"/></div>
      </div>
    </div>
    <div class="modal-foot"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="mAdd">Agregar</button></div>`);
  $('#mAdd').onclick = async () => {
    const body = { DeviceInList: [{ Device: {
      protocolType: $('#aProto').value,
      devType: $('#aType').value,
      devName: $('#aName').value || 'Dispositivo',
      EhomeParams: { EhomeID: $('#aEid').value, EhomeKey: $('#aEkey').value },
    } }] };
    const r = await proxy('POST', '/ISAPI/ContentMgmt/DeviceMgmt/addDevice?format=json', body);
    closeModal();
    if (r.ok && r.data && r.data.DeviceOutList) { toast('Dispositivo agregado', 'ok'); loadDevices(); }
    else if (r.ok) { toast('Solicitud enviada', 'ok'); loadDevices(); }
    else toast('No se pudo agregar: ' + apiError(r), 'err');
  };
}

// ── Sección: Explorador de API ──────────────────────────────
let pgCurrent = null;
function renderEndpointList(filter = '') {
  const list = $('#epList');
  list.innerHTML = '';
  const f = filter.toLowerCase();
  const cat = {};
  (window.HIKGW_CATALOG || []).forEach((e) => {
    if (f && !(`${e.name} ${e.path} ${e.method}`.toLowerCase().includes(f))) return;
    (cat[e.cat] = cat[e.cat] || []).push(e);
  });
  let count = 0;
  Object.keys(cat).forEach((c) => {
    list.appendChild(el('div', { class: 'ep-cat' }, esc(c)));
    cat[c].forEach((e) => {
      count++;
      const item = el('button', { class: 'ep-item', 'data-id': e.id });
      item.innerHTML = `<span class="method ${e.method}">${e.method}</span><span class="en">${esc(e.name)}</span>`;
      item.onclick = () => selectEndpoint(e, item);
      list.appendChild(item);
    });
  });
  $('#epCount').textContent = `${count}`;
}

function placeholders(path) {
  return (path.match(/<[^>]+>/g) || []).filter((p) => p !== '<uuid>');
}

function selectEndpoint(e, item) {
  pgCurrent = e;
  $$('.ep-item').forEach((n) => n.classList.remove('active'));
  if (item) item.classList.add('active');
  $('#pgName').textContent = e.name;
  const m = $('#pgMethod');
  m.className = 'method ' + e.method;
  m.textContent = e.method;
  $('#pgPath').textContent = e.path;
  // Parámetros de ruta (placeholders distintos de <uuid>)
  const ph = placeholders(e.path);
  const pdiv = $('#pgParams');
  pdiv.innerHTML = '';
  if (e.path.includes('<uuid>')) {
    const dev = state.selected;
    pdiv.appendChild(el('div', { class: 'hint' + (dev ? '' : ' warn') },
      dev
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span><code>&lt;uuid&gt;</code> → dispositivo activo <b>${esc(dev.devName)}</b> (<span class="mono">${esc(dev.devIndex)}</span>)</span>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg><span>Este endpoint usa <code>&lt;uuid&gt;</code>: seleccione un dispositivo en la sección Dispositivos.</span>`));
  }
  ph.forEach((p) => {
    const name = p.replace(/[<>]/g, '');
    const f = el('div', { class: 'field' });
    f.innerHTML = `<label>Parámetro de ruta <code>${esc(p)}</code></label><input class="input mono" data-ph="${esc(p)}" placeholder="${esc(name)}"/>`;
    pdiv.appendChild(f);
  });
  // Cuerpo
  const bf = $('#pgBodyField');
  if (e.body && e.method !== 'GET') {
    bf.style.display = 'block';
    $('#pgBody').value = e.body;
  } else {
    bf.style.display = 'none';
    $('#pgBody').value = '';
  }
  $('#btnSend').disabled = false;
  $('#pgResult').innerHTML = '';
  $('#pgStatus').innerHTML = '';
}

async function sendPlayground() {
  if (!pgCurrent) return;
  let path = pgCurrent.path;
  if (path.includes('<uuid>')) {
    if (!state.selected) return toast('Seleccione un dispositivo primero', 'err');
    path = path.replace(/<uuid>/g, state.selected.devIndex);
  }
  for (const inp of $$('#pgParams [data-ph]')) {
    if (!inp.value.trim()) return toast(`Complete el parámetro ${inp.dataset.ph}`, 'err');
    path = path.replace(inp.dataset.ph, encodeURIComponent(inp.value.trim()));
  }
  let body;
  if ($('#pgBodyField').style.display !== 'none') {
    const raw = $('#pgBody').value.trim();
    if (raw) {
      try { body = JSON.parse(raw); } catch { body = raw; } // permite texto plano (zona horaria)
    }
  }
  const btn = $('#btnSend');
  btn.disabled = true;
  $('#pgStatus').innerHTML = '<span class="spinner"></span>';
  try {
    const r = await proxy(pgCurrent.method, path, body);
    $('#pgStatus').innerHTML = `<span class="status-chip ${statusClass(r.status)}">${r.status}</span> <span style="color:var(--text-faint);font-size:12px">${r.ms} ms</span>`;
    $('#pgResult').innerHTML = r.data && r.data.__image
      ? `<img src="${r.data.__image}" style="max-width:100%;border-radius:6px;border:1px solid var(--line)"/>`
      : jsonBox(r.data);
  } catch (e) {
    $('#pgStatus').innerHTML = '<span class="status-chip s5">ERR</span>';
  } finally {
    btn.disabled = false;
  }
}

// ── Sección: Control de acceso ──────────────────────────────
let acsTab = 'personas';
function renderAcceso() {
  const dev = state.selected;
  const ok = dev && dev.devType === 'AccessControl';
  $('#acsNoDev').style.display = ok ? 'none' : 'flex';
  $('#acsUI').style.display = ok ? 'block' : 'none';
  if (ok) renderAcsTab();
}
function renderAcsTab() {
  const c = $('#acsContent');
  const tabs = {
    personas: acsPersonas, tarjetas: acsTarjetas, puertas: acsPuertas, eventos: acsEventos, biometria: acsBiometria,
  };
  (tabs[acsTab] || acsPersonas)(c);
}

function acsPersonas(c) {
  c.innerHTML = `
    <div class="toolbar">
      <button class="btn primary" id="pSearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Buscar personas</button>
      <button class="btn" id="pAdd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Agregar persona</button>
    </div>
    <div class="panel"><div id="pTable"><div class="empty" style="padding:34px"><h3>Sin resultados</h3><p style="font-size:12px">Pulse «Buscar personas».</p></div></div></div>`;
  $('#pSearch').onclick = async () => {
    $('#pTable').innerHTML = '<div class="loading-cell"><span class="spinner"></span> Buscando…</div>';
    const r = await proxy('POST', `/ISAPI/AccessControl/UserInfo/Search?format=json&devIndex=${state.selected.devIndex}`,
      { UserInfoSearchCond: { searchID: uuid(), searchResultPosition: 0, maxResults: 30 } });
    const s = r.data && r.data.UserInfoSearch;
    const rows = (s && s.UserInfo) || [];
    if (!rows.length) { $('#pTable').innerHTML = `<div class="empty" style="padding:34px"><h3>Sin personas</h3><p style="font-size:12px">${esc(apiError(r))}</p></div>`; return; }
    $('#pTable').innerHTML =
      `<table class="tbl"><thead><tr><th>N° empleado</th><th>Nombre</th><th>Tipo</th><th>Validez</th></tr></thead><tbody>` +
      rows.map((u) => `<tr><td class="mono">${esc(u.employeeNo)}</td><td>${esc(u.name || '—')}</td><td>${esc(u.userType || '—')}</td><td class="mono">${esc((u.Valid && u.Valid.beginTime || '').slice(0, 10))} → ${esc((u.Valid && u.Valid.endTime || '').slice(0, 10))}</td></tr>`).join('') +
      `</tbody></table>`;
  };
  $('#pAdd').onclick = () => {
    openModal(`
      <div class="modal-head"><h2>Agregar persona</h2></div>
      <div class="modal-body">
        <div class="row2"><div class="field"><label>N° empleado</label><input class="input mono" id="uNo" placeholder="123456"/></div>
        <div class="field"><label>Nombre</label><input class="input" id="uName" placeholder="Juan Pérez"/></div></div>
        <div class="row2"><div class="field"><label>Válido desde</label><input class="input mono" id="uBeg" value="2024-01-01T00:00:00"/></div>
        <div class="field"><label>Válido hasta</label><input class="input mono" id="uEnd" value="2030-12-31T23:59:59"/></div></div>
      </div>
      <div class="modal-foot"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="mU">Agregar</button></div>`);
    $('#mU').onclick = async () => {
      const body = { UserInfo: [{ employeeNo: $('#uNo').value, name: $('#uName').value, Valid: { enable: true, beginTime: $('#uBeg').value, endTime: $('#uEnd').value } }] };
      const r = await proxy('POST', `/ISAPI/AccessControl/UserInfo/Record?format=json&devIndex=${state.selected.devIndex}`, body);
      closeModal();
      okToast(r, 'Persona agregada');
    };
  };
}

function acsTarjetas(c) {
  c.innerHTML = `
    <div class="toolbar">
      <div class="field" style="margin:0"><input class="input mono" id="cEmp" placeholder="N° empleado (opcional)" style="width:200px"/></div>
      <button class="btn primary" id="cSearch">Buscar tarjetas</button>
      <button class="btn" id="cAdd">Agregar tarjeta</button>
    </div>
    <div class="panel"><div id="cTable"><div class="empty" style="padding:34px"><h3>Sin resultados</h3></div></div></div>`;
  $('#cSearch').onclick = async () => {
    $('#cTable').innerHTML = '<div class="loading-cell"><span class="spinner"></span> Buscando…</div>';
    const cond = { searchID: uuid(), searchResultPosition: 0, maxResults: 30 };
    const emp = $('#cEmp').value.trim();
    if (emp) cond.EmployeeNoList = [{ employeeNo: emp }];
    const r = await proxy('POST', `/ISAPI/AccessControl/CardInfo/Search?format=json&devIndex=${state.selected.devIndex}`, { CardInfoSearchCond: cond });
    const s = r.data && r.data.CardInfoSearch;
    const rows = (s && s.CardInfo) || [];
    if (!rows.length) { $('#cTable').innerHTML = `<div class="empty" style="padding:34px"><h3>Sin tarjetas</h3><p style="font-size:12px">${esc(apiError(r))}</p></div>`; return; }
    $('#cTable').innerHTML =
      `<table class="tbl"><thead><tr><th>N° empleado</th><th>N° tarjeta</th><th>Tipo</th></tr></thead><tbody>` +
      rows.map((u) => `<tr><td class="mono">${esc(u.employeeNo)}</td><td class="mono">${esc(u.cardNo)}</td><td>${esc(u.cardType || '—')}</td></tr>`).join('') +
      `</tbody></table>`;
  };
  $('#cAdd').onclick = () => {
    openModal(`
      <div class="modal-head"><h2>Agregar tarjeta</h2></div>
      <div class="modal-body"><div class="row2">
        <div class="field"><label>N° empleado</label><input class="input mono" id="tNo" placeholder="123456"/></div>
        <div class="field"><label>N° tarjeta</label><input class="input mono" id="tCard" placeholder="1234567890"/></div>
      </div></div>
      <div class="modal-foot"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="mC">Agregar</button></div>`);
    $('#mC').onclick = async () => {
      const r = await proxy('POST', `/ISAPI/AccessControl/CardInfo/Record?format=json&devIndex=${state.selected.devIndex}`,
        { CardInfo: { employeeNo: $('#tNo').value, cardNo: $('#tCard').value } });
      closeModal();
      okToast(r, 'Tarjeta agregada');
    };
  };
}

function acsPuertas(c) {
  c.innerHTML = `
    <div class="hint warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>El comando <b>abrir</b> acciona físicamente el relevador de la puerta en el equipo real.</span></div>
    <div class="split">
      <div class="panel"><div class="panel-head"><h3>Control remoto</h3></div><div class="panel-body">
        <div class="field"><label>ID de puerta</label><input class="input mono" id="doorId" value="1"/></div>
        <div style="display:flex;gap:10px">
          <button class="btn primary" data-cmd="open">Abrir</button>
          <button class="btn" data-cmd="close">Cerrar</button>
          <button class="btn" data-cmd="alwaysOpen">Mantener abierta</button>
          <button class="btn" data-cmd="alwaysClose">Mantener cerrada</button>
        </div>
      </div></div>
      <div class="panel"><div class="panel-head"><h3>Parámetros de puerta</h3></div><div class="panel-body">
        <button class="btn" id="doorGet">Obtener parámetros</button>
        <div id="doorParam" style="margin-top:14px"></div>
      </div></div>
    </div>`;
  $$('[data-cmd]', c).forEach((b) => b.onclick = () => {
    const cmd = b.dataset.cmd;
    const id = $('#doorId').value.trim() || '1';
    openModal(`<div class="modal-head"><h2>Confirmar «${esc(cmd)}»</h2><p>Se ejecutará el comando <b>${esc(cmd)}</b> sobre la puerta <b>${esc(id)}</b> del equipo real.</p></div>
      <div class="modal-foot"><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="mDoor">Ejecutar</button></div>`);
    $('#mDoor').onclick = async () => {
      const r = await proxy('PUT', `/ISAPI/AccessControl/RemoteControl/door/${encodeURIComponent(id)}?format=json&devIndex=${state.selected.devIndex}`, { RemoteControlDoor: { cmd } });
      closeModal();
      okToast(r, `Comando «${cmd}» enviado`);
    };
  });
  $('#doorGet').onclick = async () => {
    const id = $('#doorId').value.trim() || '1';
    const r = await proxy('GET', `/ISAPI/AccessControl/Door/param/${encodeURIComponent(id)}?format=json&devIndex=${state.selected.devIndex}`);
    $('#doorParam').innerHTML = jsonBox(r.data);
  };
}

function acsEventos(c) {
  c.innerHTML = `
    <div class="toolbar"><button class="btn primary" id="eSearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Buscar eventos recientes</button></div>
    <div class="panel"><div id="eTable"><div class="empty" style="padding:34px"><h3>Sin resultados</h3></div></div></div>`;
  $('#eSearch').onclick = async () => {
    $('#eTable').innerHTML = '<div class="loading-cell"><span class="spinner"></span> Buscando…</div>';
    const r = await proxy('POST', `/ISAPI/AccessControl/AcsEvent?format=json&devIndex=${state.selected.devIndex}`,
      { AcsEventCond: { searchID: uuid(), searchResultPosition: 0, maxResults: 30, major: 0, minor: 0 } });
    const s = r.data && r.data.AcsEvent;
    const rows = (s && s.InfoList) || [];
    if (!rows.length) { $('#eTable').innerHTML = `<div class="empty" style="padding:34px"><h3>Sin eventos</h3><p style="font-size:12px">${esc(apiError(r))}</p></div>`; return; }
    $('#eTable').innerHTML =
      `<table class="tbl"><thead><tr><th>Hora</th><th>Empleado</th><th>Nombre</th><th>major/minor</th></tr></thead><tbody>` +
      rows.map((e) => `<tr><td class="mono">${esc((e.time || '').replace('T', ' ').slice(0, 19))}</td><td class="mono">${esc(e.employeeNoString || e.employeeNo || '—')}</td><td>${esc(e.name || '—')}</td><td class="mono">${esc(e.major)}/${esc(e.minor)}</td></tr>`).join('') +
      `</tbody></table>`;
  };
}

function acsBiometria(c) {
  c.innerHTML = `
    <div class="hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span>El registro de rostro/huella requiere subir imagen (multipart) o capturar en el equipo. Aquí puede consultar las capacidades y capturar una huella.</span></div>
    <div class="split">
      <div class="panel"><div class="panel-head"><h3>Capacidades</h3></div><div class="panel-body">
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="capAcs">Control de acceso</button><button class="btn" id="capFp">Huella</button></div>
        <div id="capOut" style="margin-top:14px"></div>
      </div></div>
      <div class="panel"><div class="panel-head"><h3>Capturar huella</h3></div><div class="panel-body">
        <div class="field"><label>N° de dedo (1–10)</label><input class="input mono" id="fpNo" value="1" style="width:120px"/></div>
        <button class="btn primary" id="fpCap">Capturar</button>
        <div id="fpOut" style="margin-top:14px"></div>
      </div></div>
    </div>`;
  const di = state.selected.devIndex;
  $('#capAcs').onclick = async () => { const r = await proxy('GET', `/ISAPI/AccessControl/AcsCfg/capabilities?format=json&devIndex=${di}`); $('#capOut').innerHTML = jsonBox(r.data); };
  $('#capFp').onclick = async () => { const r = await proxy('GET', `/ISAPI/AccessControl/FingerPrintCfg/capabilities?format=json&devIndex=${di}`); $('#capOut').innerHTML = jsonBox(r.data); };
  $('#fpCap').onclick = async () => {
    $('#fpOut').innerHTML = '<div class="loading-cell"><span class="spinner"></span> Coloque el dedo en el lector…</div>';
    const r = await proxy('POST', `/ISAPI/AccessControl/CaptureFingerPrint?format=json&devIndex=${di}`, { CaptureFingerPrintCond: { fingerNo: parseInt($('#fpNo').value) || 1 } });
    $('#fpOut').innerHTML = jsonBox(r.data);
  };
}

function okToast(r, msg) {
  const bad = !r.ok || (r.data && (r.data.statusCode === 401 || (r.data.subStatusCode && /error|fail|invalid|bad/i.test(r.data.subStatusCode))));
  if (bad) toast('Error: ' + apiError(r), 'err', 5000);
  else toast(msg, 'ok');
}

// ── Sección: Video ──────────────────────────────────────────
let player = null;
let liveOn = false;
function ensurePlayer() {
  if (player) return player;
  if (typeof JSPlugin === 'undefined') { toast('SDK de video no cargado', 'err'); return null; }
  player = new JSPlugin({
    szId: 'playWind',
    iWidth: $('#playWind').clientWidth || 640,
    iHeight: $('#playWind').clientHeight || 360,
    iMaxSplit: 1,
    iCurrentSplit: 1,
    szBasePath: './vendor/jsplugin',
    oStyle: { border: '#151b23', borderSelect: '#e11d2a', background: '#000' },
    bOnlySupportJSDecoder: true,
  });
  try {
    player.JS_SetWindowControlCallback({
      pluginErrorHandler: (i, code, err) => { $('#videoStatus').innerHTML = `<span class="status-chip s5">error ${code}</span>`; },
    });
  } catch (e) {}
  return player;
}
function syncVideoSection() {
  const dev = state.selected;
  const ok = dev && (dev.videoChannelNum > 0 || dev.devType === 'encodingDev');
  $('#btnLive').disabled = !ok;
  if (!$('#inAccessUrl').value) $('#inAccessUrl').value = defaultWss();
  $('#videoStatus').innerHTML = ok ? '' : '<span style="color:var(--text-faint);font-size:12px">Seleccione un dispositivo con canal de video.</span>';
}
async function startLive() {
  const dev = state.selected;
  if (!dev) return toast('Seleccione un dispositivo', 'err');
  $('#videoStatus').innerHTML = '<span class="spinner"></span>';
  const r = await proxy('POST', `/ISAPI/System/streamMedia?format=json&devIndex=${dev.devIndex}`,
    { StreamInfo: { id: '1', streamType: 'main', method: 'preview' } });
  const rtsp = r.data && r.data.MediaAccessInfo && r.data.MediaAccessInfo.URL;
  if (!rtsp) { $('#videoStatus').innerHTML = '<span class="status-chip s5">sin URL</span>'; return toast('No se obtuvo URL de stream: ' + apiError(r), 'err'); }
  const p = ensurePlayer();
  if (!p) return;
  const accessUrl = $('#inAccessUrl').value.trim() || defaultWss();
  p.JS_Play(accessUrl, { playURL: rtsp, auth: state.user + ':' + state.password }, 0).then(
    () => { liveOn = true; $('#btnStopLive').disabled = false; $('#videoStatus').innerHTML = '<span class="status-chip s2">en vivo</span>'; },
    (err) => { $('#videoStatus').innerHTML = '<span class="status-chip s5">falló</span>'; toast('No se pudo reproducir. Verifique que el gateway exponga WebSocket (wss) y el certificado.', 'err', 6000); }
  );
}
function stopLive() {
  if (player && liveOn) { try { player.JS_Stop(0); } catch (e) {} }
  liveOn = false;
  $('#btnStopLive').disabled = true;
  $('#videoStatus').innerHTML = '';
}
function ptz(pan, tilt, zoom) {
  const dev = state.selected;
  if (!dev) return;
  proxy('PUT', `/ISAPI/PTZCtrl/channels/1/continuous?format=json&devIndex=${dev.devIndex}`, { PTZData: { pan, tilt, zoom } });
}
function bindPtz() {
  const hold = (btn, pan, tilt, zoom) => {
    const start = (e) => { e.preventDefault(); ptz(pan, tilt, zoom); };
    const stop = () => ptz(0, 0, 0);
    btn.addEventListener('mousedown', start);
    btn.addEventListener('touchstart', start, { passive: false });
    ['mouseup', 'mouseleave', 'touchend'].forEach((ev) => btn.addEventListener(ev, stop));
  };
  $$('#ptzPad button[data-pan]').forEach((b) => hold(b, (+b.dataset.pan) * 60, (+b.dataset.tilt) * 60, 0));
  $$('[data-zoom]').forEach((b) => hold(b, 0, 0, (+b.dataset.zoom) * 60));
}

// ── Modal ───────────────────────────────────────────────────
function openModal(html) {
  $('#modalMount').innerHTML = `<div class="modal">${html}</div>`;
  $('#overlay').classList.remove('hidden');
  $$('#modalMount [data-close]').forEach((b) => (b.onclick = closeModal));
}
function closeModal() { $('#overlay').classList.add('hidden'); $('#modalMount').innerHTML = ''; }

// ── Init ────────────────────────────────────────────────────
function init() {
  // Restaurar credenciales
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    if (saved.host) $('#inHost').value = saved.host;
    if (saved.user) $('#inUser').value = saved.user;
    if (saved.password) $('#inPass').value = saved.password;
  } catch (e) {}

  $('#btnConnect').onclick = connect;
  $('#inPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') connect(); });
  $('#btnDisconnect').onclick = disconnect;
  $$('.nav-item').forEach((n) => (n.onclick = () => showSection(n.dataset.sec)));
  $('#btnRefreshDevs').onclick = loadDevices;
  $('#btnAddDev').onclick = addDeviceModal;

  renderEndpointList();
  $('#epFilter').addEventListener('input', (e) => renderEndpointList(e.target.value));
  $('#btnSend').onclick = sendPlayground;

  $('#acsTabs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (!b) return;
    acsTab = b.dataset.tab;
    $$('#acsTabs button').forEach((x) => x.classList.toggle('active', x === b));
    renderAcsTab();
  });

  $('#btnLive').onclick = startLive;
  $('#btnStopLive').onclick = stopLive;
  bindPtz();

  $('#hudBar').onclick = () => openHud();
  $('#hudClear').onclick = () => { hudEntries.length = 0; hudSel = -1; renderHud(); $('#hudLast').innerHTML = '<span style="color:var(--text-faint)">Sin tráfico todavía</span>'; };
  $('#overlay').addEventListener('click', (e) => { if (e.target === $('#overlay')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  renderHud();
}
document.addEventListener('DOMContentLoaded', init);
