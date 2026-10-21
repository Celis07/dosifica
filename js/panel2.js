/* ===================== PANEL DEL FISIO v2 (oct 2026) =====================
   Opción 2 (widgets) con cosas de la 1 (barra de pestañas fija) y la 3 (listas agrupadas).
   - Pestañas: Inicio · Pacientes · En vivo · Cuenta (abajo en el celular, a la izquierda en el computador).
   - Inicio: widgets (cómo llegan hoy, mensajes, solicitudes, videos, pacientes, en vivo, intervalos,
     próximo torneo) y lo que requiere atención.
   - Ficha del paciente: cabecera con acciones y secciones en píldoras; "Resumen" son widgets que
     abren cada sección; el formulario vive en su propia sección "Datos".
   - El Banco de ejercicios y la tabla de pacientes quedan dentro de Cuenta.
   - Tema según el celular (claro u oscuro). */

const FX = {tab: 'inicio', from: 'inicio', q: '', f: 'todos', pre: null};
const FX_TABS = [['inicio', 'Inicio'], ['pacientes', 'Usuarios'], ['vivo', 'En vivo'], ['cuenta', 'Cuenta']];
const FX_SECS = [['resumen', 'Resumen'], ['plan', 'Plan'], ['ses', 'Sesiones'], ['cal', 'Torneos']];
// Fuera del menú: Datos (lápiz junto al nombre, con Historia y Evaluación plegables) y Solicitudes (campanita)
const FX_SEC_X = {datos: 'Datos', req: 'Solicitudes'};
const FX_I = {
  inicio: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>',
  pacientes: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17.5 14.5c2.2.3 3.6 1.9 4 4.5"/></svg>',
  vivo: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>',
  cuenta: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.2 4-6.5 8-6.5s7 2.3 8 6.5"/></svg>',
  back: '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2L2 10l8 8"/></svg>',
  chev: '<svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  msg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/></svg>',
  req: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8l4 4v12H4V4h4zM8 12h8M8 16h5"/></svg>',
  vid: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>',
  heart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/></svg>',
  timer: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>',
  play: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>',
  trophy: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 20h8"/></svg>'
};
const fxSum = o => Object.values(o || {}).reduce((a, b) => a + (+b || 0), 0);
const fxIni = n => (n || '?').trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
const fxSpecial = () => view === 'banco' || view === 'panel';

/* ---------- Tema y estructura ---------- */
(function(){
  const app = $('#fisioApp'); if(!app) return;
  const sync = () => document.body.classList.toggle('fx', !app.hidden);
  new MutationObserver(sync).observe(app, {attributes: true, attributeFilter: ['hidden']}); sync();
  const nav = document.createElement('nav'); nav.id = 'fxNav'; nav.setAttribute('aria-label', 'Secciones del panel');
  app.appendChild(nav);
  nav.addEventListener('click', e => { const b = e.target.closest('[data-fxtab]'); if(b) fxGo(b.dataset.fxtab); });
  const ss = $('#saveState');
  if(ss) new MutationObserver(() => { const t = $('#fxSave'); if(t) t.textContent = ss.textContent; }).observe(ss, {childList: true, characterData: true, subtree: true});
  fxNavPaint();
})();
function fxNavPaint(){
  const nav = $('#fxNav'); if(!nav) return;
  const cur = homeVisible() ? FX.tab : (fxSpecial() ? 'cuenta' : FX.from);
  const att = (typeof alertas !== 'undefined' ? alertas.length : 0) + fxSum(pendingBy) + fxSum(typeof unreadBy !== 'undefined' ? unreadBy : {});
  nav.innerHTML = FX_TABS.map(([k, l]) => `<button type="button" data-fxtab="${k}"${k === cur ? ' aria-current="page"' : ''}>${FX_I[k]}<span>${l}</span>${k === 'inicio' && att ? `<i class="fx-dotn" aria-label="${att} pendientes">${att > 9 ? '9+' : att}</i>` : ''}</button>`).join('');
}
function fxGo(tab){
  FX.tab = tab; FX.from = tab;
  if(tab === 'vivo' && typeof rcpLoad === 'function' && FX.pre == null){ FX.pre = []; rcpLoad().then(() => { FX.pre = rcpList; if(homeVisible() && FX.tab === 'vivo') renderHome(); }); }
  if(homeVisible()) renderHome(); else showHome();
  window.scrollTo(0, 0);
}

/* ---------- Pantallas de pestaña (en #home) ---------- */
function fxInfos(){ return patients.map(p => { try{ return patInfo(p); }catch(e){ return null; } }).filter(Boolean); }
function fxInicio(){
  const infos = fxInfos(), hoy = new Date().toLocaleDateString('es-CO', {weekday: 'long', day: 'numeric', month: 'long'});
  const cnt = {g: 0, y: 0, r: 0, n: 0}; infos.forEach(i => cnt[i.ds.k]++);
  const resp = cnt.g + cnt.y + cnt.r, hot = infos.filter(i => i.ds.k === 'r' || i.ds.k === 'y').sort((a, b) => b.score - a.score).slice(0, 3);
  const nMsg = fxSum(unreadBy), nReq = fxSum(pendingBy), nVid = fxSum(tecPendBy), act = infos.filter(i => i.sm.last && i.sm.last >= daysAgo(7)).length;
  const preHoy = (typeof rcpList !== 'undefined' ? rcpList : []).filter(x => x.fecha === todayISO());
  const tor = infos.flatMap(i => { try{ return tourns(i.s).filter(t => t.f >= todayISO()).map(t => ({f: t.f, n: t.n, p: i.p.nombre})); }catch(e){ return []; } }).sort((a, b) => a.f.localeCompare(b.f));
  const tor1 = tor[0], torN = tor1 ? tor.filter(t => t.f === tor1.f).length : 0;
  const att = [];
  alertas.forEach(a => att.push({k: 'r', pid: a.paciente_id, t: alertName(a.paciente_id), d: alertWhy(a) + (a.dia ? ' · ' + a.dia : ''), v: 'ses', ok: a.id}));
  infos.filter(i => i.p.pend).forEach(i => att.push({k: 'y', pid: i.p.id, t: i.p.nombre, d: `${i.p.pend} solicitud${i.p.pend > 1 ? 'es' : ''} de cambio`, v: 'req'}));
  infos.filter(i => unreadBy[i.p.id]).forEach(i => att.push({k: 'b', pid: i.p.id, t: i.p.nombre, d: `${unreadBy[i.p.id]} mensaje${unreadBy[i.p.id] > 1 ? 's' : ''} sin leer`, v: 'chat'}));
  infos.filter(i => tecPendBy[i.p.id]).forEach(i => att.push({k: 'b', pid: i.p.id, t: i.p.nombre, d: 'Video de técnica por revisar', v: 'ses'}));
  infos.filter(i => i.inact).forEach(i => att.push({k: 'n', pid: i.p.id, t: i.p.nombre, d: `Sin registrar sesión desde ${hace(i.sm.last)}`, v: 'ses'}));
  infos.filter(i => !i.consent).forEach(i => att.push({k: 'n', pid: i.p.id, t: i.p.nombre, d: 'Falta consentimiento informado', v: 'hist'}));
  const nom = (fisioNombre || '').split(' ')[0];
  return `<div class="fx-page">
    <header class="fx-hd"><div><span class="fx-eye">${esc(hoy)}</span><h1>${nom ? 'Hola, ' + esc(nom) : 'Inicio'}</h1></div>
      <button type="button" class="fx-avb" data-fxtab2="cuenta" aria-label="Mi cuenta">${esc(fxIni(fisioNombre || (me && me.email) || 'F'))}</button></header>

    <section class="fx-w fx-today">
      <div class="fx-wh"><b>Cómo llegan hoy</b><span>${resp} de ${infos.length} respondieron</span></div>
      <div class="fx-sem">${[['g', 'Verde'], ['y', 'Amarillo'], ['r', 'Rojo'], ['n', 'Sin chequeo']].map(([k, l]) => `<button type="button" class="fx-s ${k}" data-fxf="st-${k}"><b>${cnt[k]}</b><span>${l}</span></button>`).join('')}</div>
      ${hot.map(i => `<button type="button" class="fx-hot" data-fxopen="${esc(i.p.id)}"><i class="fx-d ${i.ds.k}"></i><span><b>${esc(i.p.nombre)}</b> <em>· ${esc(i.ds.t.replace(/^Chequeo en (rojo|amarillo): ?/, '') || ST_L[i.ds.k])}</em></span>${FX_I.chev}</button>`).join('')}
    </section>

    <div class="fx-grid">
      <button type="button" class="fx-w fx-tile" data-fxf="msg"><span class="fx-ic c-msg">${FX_I.msg}</span><b>${nMsg}</b><span>Mensajes sin leer</span></button>
      <button type="button" class="fx-w fx-tile" data-fxf="req"><span class="fx-ic c-req">${FX_I.req}</span><b>${nReq}</b><span>Solicitudes de cambio</span></button>
      <button type="button" class="fx-w fx-tile" data-fxf="vid"><span class="fx-ic c-vid">${FX_I.vid}</span><b>${nVid}</b><span>Videos de técnica</span></button>
      <button type="button" class="fx-w fx-tile" data-fxf="todos"><span class="fx-ic">${FX_I.pacientes}</span><b>${act}<small>/${infos.length}</small></b><span>Activos (7 días)</span></button>
    </div>

    <button type="button" class="fx-w fx-live" data-fx="rcp"><span class="fx-lt"><span class="fx-lk">En vivo</span><b>Bienestar antes de entrenar</b><span>${preHoy.length ? `${preHoy.length} hoy` : 'Para quien entrena contigo hoy'}</span></span><span class="fx-play">${FX_I.play}</span></button>

    <div class="fx-w fx-small"><span class="fx-ic c-tor">${FX_I.trophy}</span><span><b>${tor1 ? 'Próximo torneo · ' + esc(fmtD(tor1.f)) : 'Sin torneos próximos'}</b><span>${tor1 ? `${esc(tor1.n || 'Torneo')}${torN > 1 ? ` · ${torN} deportistas` : ` · ${esc((tor1.p || '').split(' ')[0])}`}` : 'Agrégalos en el Calendario de cada deportista'}</span></span></div>

    <section class="fx-sec"><h2>Requiere atención</h2>
      ${att.length ? `<div class="fx-list">${att.slice(0, 8).map(a => `<div class="fx-row"><button type="button" class="fx-rb" data-fxopen="${esc(a.pid)}" data-fxv="${a.v}"><i class="fx-d ${a.k}"></i><span class="fx-rt"><b>${esc(a.t)}</b><span>${esc(a.d)}</span></span>${a.ok ? '' : FX_I.chev}</button>${a.ok ? `<button type="button" class="fx-ok" data-fxok="${esc(a.ok)}">Revisada</button>` : ''}</div>`).join('')}</div>`
        : '<p class="fx-empty">Nada pendiente. Aquí verás alertas de dolor, solicitudes, mensajes y videos por revisar.</p>'}
    </section>
  </div>`;
}
const FX_F = [['todos', 'Todos'], ['att', 'Atención'], ['msg', 'Mensajes'], ['req', 'Solicitudes'], ['vid', 'Videos'], ['rodilla', 'Rehab'], ['deporte', 'Deporte'], ['salud', 'Salud']];
function fxPass(i, f){
  if(f === 'todos') return true;
  if(f === 'att') return i.ds.k === 'r' || i.ds.k === 'y' || i.al || i.p.pend || unreadBy[i.p.id] || tecPendBy[i.p.id];
  if(f === 'msg') return !!unreadBy[i.p.id];
  if(f === 'req') return !!i.p.pend;
  if(f === 'vid') return !!tecPendBy[i.p.id];
  if(f === 'rodilla') return typeof isRehab === 'function' ? isRehab(i.s) : i.mod === 'rodilla';
  if(/^st-/.test(f)) return i.ds.k === f.slice(3);
  return i.mod === f;
}
function fxCorto(s){
  try{
    const mo = modOf(s);
    if(mo === 'deporte'){ const d = s.deporte || (typeof DEP_PERF !== 'undefined' ? DEP_PERF[s.deporteP] : '') || 'Deporte';
      const r = s.rehab && typeof REHAB_DEP !== 'undefined' && REHAB_DEP[s.rehabCond || 'fp']; return r ? `${d} · rehab ${r.zona || 'lesión'}` : d; }
    if(mo === 'salud') return 'Salud · ' + ((POBL[s.poblacion || 'sed'] || {}).l || '').replace(/ \(.*\)$/, '');
    return P[pkey(s)].label.replace(/ \(.*\)$/, '');
  }catch(e){ return ''; }
}
function fxPacientes(){
  const q = FX.q.trim().toLowerCase();
  const list = fxInfos().filter(i => fxPass(i, FX.f) && (!q || (i.p.nombre || '').toLowerCase().includes(q) || i.cond.toLowerCase().includes(q)))
    .sort((a, b) => b.score - a.score || (b.sm.last || '').localeCompare(a.sm.last || '') || (a.p.nombre || '').localeCompare(b.p.nombre || ''));
  const fl = (FX_F.find(x => x[0] === FX.f) || [FX.f, /^st-/.test(FX.f) ? ST_L[FX.f.slice(3)] : 'Todos'])[1];
  const ICF = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/></svg>';
  return `<div class="fx-page">
    <header class="fx-hd"><div><span class="fx-eye">${patients.length} ${patients.length === 1 ? 'persona' : 'personas'}</span><h1>Usuarios</h1></div>
      <button type="button" class="fx-avb red" data-fx="nuevo" aria-label="Nuevo usuario">${FX_I.plus}</button></header>
    <div class="fx-sbar fx-secsel">
      <label class="fx-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" id="fxQ" placeholder="Buscar" aria-label="Buscar nombre o condición" value="${esc(FX.q)}" autocomplete="off"></label>
      <button type="button" class="fx-fbtn${FX.f !== 'todos' ? ' on' : ''}" data-fxfm aria-haspopup="true" aria-expanded="false" aria-label="Filtrar: ${esc(fl)}">${ICF}</button>
      <div class="fx-menu" role="menu" hidden>${FX_F.map(([k, l]) => `<button type="button" role="menuitem" data-fxf="${k}"${FX.f === k ? ' aria-current="true"' : ''}><span>${esc(l)}</span>${FX.f === k ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : ''}</button>`).join('')}</div>
    </div>
    ${FX.f !== 'todos' ? `<button type="button" class="fx-ftag" data-fxf="todos">${esc(fl)} · ${list.length}<span aria-hidden="true">✕</span><span class="sr">Quitar filtro</span></button>` : ''}
    ${patients.length ? (list.length ? `<div class="fx-list">${list.map(i => { const n = unreadBy[i.p.id] || 0, v = tecPendBy[i.p.id] || 0, pend = i.al + n + (i.p.pend || 0) + v; return `<button type="button" class="fx-rb fx-pat" data-fxopen="${esc(i.p.id)}">
      <i class="fx-d ${i.ds.k}" aria-label="${esc(ST_L[i.ds.k])}"></i>
      <span class="fx-rt"><b>${esc(i.p.nombre || 'Sin nombre')}</b><span>${esc(fxCorto(i.s))}</span></span>
      ${pend ? `<span class="fx-bdg"><em class="${i.al ? 'r' : 'b'}" aria-label="${pend} pendiente${pend > 1 ? 's' : ''}">${pend}</em></span>` : `<span class="fx-when">${esc(i.sm.last ? hace(i.sm.last) : '')}</span>`}${FX_I.chev}</button>`; }).join('')}</div>`
      : '<p class="fx-empty">Nadie coincide.</p>')
      : '<div class="fx-w fx-emptyw"><p>Aún no tienes usuarios ni usuarias.</p><button type="button" class="primary" data-fx="nuevo">Crear el primero</button></div>'}
  </div>`;
}
function fxVivo(){
  const hoy = (FX.pre || []).filter(x => x.fecha === todayISO());
  return `<div class="fx-page">
    <header class="fx-hd"><div><span class="fx-eye">Con la persona</span><h1>En vivo</h1></div></header>
    <button type="button" class="fx-w fx-live" data-fx="rcp"><span class="fx-lt"><span class="fx-lk">Antes de entrenar</span><b>Bienestar en vivo</b><span>Le pasas el celular: 6 preguntas y te dice cuánto exigir</span></span><span class="fx-play">${FX_I.play}</span></button>
    <button type="button" class="fx-w fx-small wide" data-tbopen="libre"><span class="fx-ic">${FX_I.timer}</span><span><b>Intervalos</b><span>Tabata y circuitos con silbato y campana</span></span>${FX_I.chev}</button>
    <section class="fx-sec"><h2>Hoy</h2>
      ${FX.pre == null || (FX.pre.length === 0 && !hoy.length && FX.loading) ? '<p class="fx-empty">Cargando…</p>' : hoy.length ? `<div class="fx-list">${hoy.map(x => { const p = patients.find(y => y.id === x.paciente_id); return `<button type="button" class="fx-rb" data-fxpre="${esc(x.id)}"><i class="fx-d ${x.nivel === 'x' ? 'r' : esc(x.nivel)}"></i><span class="fx-rt"><b>${esc(p ? p.nombre : 'Persona')}</b><span>${esc((RCP_L[x.nivel] || {t: ''}).t)}${x.puntaje != null ? ` · ${x.puntaje}/20` : ''}</span></span>${FX_I.chev}</button>`; }).join('')}</div>` : '<p class="fx-empty">Nadie ha llenado el chequeo hoy.</p>'}
    </section>
  </div>`;
}
function fxCuenta(){
  const pushTxt = FISIO_PUSH === 'on' ? 'Activadas' : FISIO_PUSH === 'unsupported' ? 'No disponibles en este navegador' : FISIO_PUSH === 'install' ? 'En iPhone, instala la app primero' : FISIO_PUSH === 'denied' ? 'Bloqueadas en el navegador' : '';
  return `<div class="fx-page">
    <header class="fx-hd"><div><span class="fx-eye">Fisioterapeuta</span><h1>Cuenta</h1></div></header>
    <div class="fx-w fx-me"><span class="fx-av big">${esc(fxIni(fisioNombre || (me && me.email) || 'F'))}</span><span><b>${esc(fisioNombre || 'Fisioterapeuta')}</b><span>${esc((me && me.email) || '')}</span></span></div>
    <section class="fx-sec"><h2>Herramientas</h2><div class="fx-list">
      <button type="button" class="fx-rb" data-fx="banco"><span class="fx-ic sq">${FX_I.req}</span><span class="fx-rt"><b>Banco de ejercicios</b><span>Tus ejercicios, videos y claves</span></span>${FX_I.chev}</button>
      <button type="button" class="fx-rb" data-fx="tabla"><span class="fx-ic sq">${FX_I.pacientes}</span><span class="fx-rt"><b>Tabla de usuarios</b><span>Fase, adherencia y dolor de todos</span></span>${FX_I.chev}</button>
    </div></section>
    <section class="fx-sec"><h2>Notificaciones</h2><div class="fx-list">
      <div class="fx-rb"><span class="fx-ic sq">${FX_I.msg}</span><span class="fx-rt"><b>Alertas de dolor y mensajes</b><span>${esc(pushTxt || 'Apagadas')}</span></span>${FISIO_PUSH && FISIO_PUSH !== 'on' && FISIO_PUSH !== 'unsupported' && FISIO_PUSH !== 'install' && FISIO_PUSH !== 'denied' ? '<button type="button" class="fx-ok" data-fx="push">Activar</button>' : ''}</div>
    </div></section>
    <section class="fx-sec"><div class="fx-list"><button type="button" class="fx-rb fx-out" data-fx="out"><span class="fx-rt"><b>Cerrar sesión</b></span></button></div></section>
  </div>`;
}
const _renderHomeFx = renderHome;
renderHome = function(){
  const el = $('#home'); if(!el) return;
  el.classList.add('fx-home');
  el.innerHTML = FX.tab === 'pacientes' ? fxPacientes() : FX.tab === 'vivo' ? fxVivo() : FX.tab === 'cuenta' ? fxCuenta() : fxInicio();
  fxNavPaint();
};
const _showHomeFx = showHome;
showHome = function(){ document.body.classList.remove('fx-datos'); _showHomeFx.apply(this, arguments); fxNavPaint(); };

$('#home').addEventListener('click', async e => {
  const q = s => e.target.closest(s); let b;
  if((b = q('[data-fxfm]'))){ const m = b.nextElementSibling; m.hidden = !m.hidden; b.setAttribute('aria-expanded', String(!m.hidden)); return; }
  if((b = q('[data-fxok]'))){ e.stopPropagation(); markReviewed(b.dataset.fxok); return; }
  if((b = q('[data-fxopen]'))){
    const v = b.dataset.fxv || 'resumen'; FX.from = FX.tab;
    if(v === 'chat'){ openPatient(b.dataset.fxopen, 'resumen'); if(typeof pxOpenChat === 'function') pxOpenChat(b.dataset.fxopen); return; }
    openPatient(b.dataset.fxopen, v); return;
  }
  if((b = q('[data-fxtab2]'))) return fxGo(b.dataset.fxtab2);
  if((b = q('[data-fxf]'))){ FX.f = b.dataset.fxf; if(FX.tab !== 'pacientes'){ FX.q = ''; return fxGo('pacientes'); } return renderHome(); }
  if((b = q('[data-fxpre]'))) return fxShowPre(b.dataset.fxpre);
  if((b = q('[data-fx]'))){
    const a = b.dataset.fx;
    if(a === 'rcp' && typeof rcpOpen === 'function') return rcpOpen();
    if(a === 'nuevo'){ FX.from = 'pacientes'; $('#bNew').click(); view = 'datos'; render(); setTimeout(() => $('#nombre')?.focus(), 50); return; }
    if(a === 'banco' || a === 'tabla'){ showWork(); view = a === 'banco' ? 'banco' : 'panel'; editMode = false; if(a === 'tabla') loadPatients().then(() => { if(view === 'panel') render(); }); render(); window.scrollTo(0, 0); return; }
    if(a === 'push'){ if(await enablePush('fisio')) FISIO_PUSH = 'on'; return renderHome(); }
    if(a === 'out') return $('#fOut').click();
  }
});
$('#home').addEventListener('input', e => {
  if(e.target.id !== 'fxQ') return;
  FX.q = e.target.value; const pos = e.target.selectionStart; renderHome();
  const i = $('#fxQ'); if(i){ i.focus(); try{ i.setSelectionRange(pos, pos); }catch(_){} }
});
async function fxShowPre(id){
  const x = (FX.pre || []).find(y => y.id === id); if(!x || typeof rcpOpen !== 'function') return;
  await rcpOpen();
  RC.p = patients.find(p => p.id === x.paciente_id) || {id: x.paciente_id, nombre: 'Persona', st: {}};
  RC.r = x.resp || {}; RC.res = x; RC.screen = 'res'; rcpRender();
}
// Cuando se guarda un chequeo en vivo, la pestaña En vivo se actualiza
if(typeof rcpClose === 'function'){ const _rc = rcpClose; rcpClose = function(){ _rc.apply(this, arguments); if(typeof rcpList !== 'undefined') FX.pre = rcpList; if(homeVisible()) renderHome(); }; }

/* ---------- Ficha del paciente ---------- */
const _openPatientFx = openPatient;
openPatient = function(id, v){ return _openPatientFx(id, v || 'resumen'); };

function fxResumen(){
  const p = patients.find(x => x.id === curId), ds = p && typeof dayState === 'function' ? dayState(p) : {k: 'n', t: 'Sin datos'};
  const nd = nDias(st), w = num(st.semPlan) || 1, done = Math.min((sumBy[curId]?.byWeek?.[w]) || 0, nDias(st)), m = mesoWeek(st);
  const pf = (st.pf && typeof st.pf === 'object' ? st.pf : (typeof st.perfil === 'object' && st.perfil) || {}), rf = (pf.rf || []).length, yf = (pf.yf || []).length;
  const ses = (sessions || []).filter(s => s.dolor != null).slice().sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '')).slice(-8);
  const lastS = (sessions || []).slice().sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0];
  let spark = '';
  if(ses.length >= 2){ const W = 150, H = 44, xs = i => 4 + i * (W - 8) / (ses.length - 1), ys = v => 4 + (1 - v / 10) * (H - 8);
    spark = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Dolor en las últimas ${ses.length} sesiones: de ${ses[0].dolor} a ${ses[ses.length - 1].dolor}"><polyline points="${ses.map((s, i) => `${xs(i).toFixed(1)},${ys(s.dolor).toFixed(1)}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${xs(ses.length - 1).toFixed(1)}" cy="${ys(ses[ses.length - 1].dolor).toFixed(1)}" r="4" fill="currentColor"/></svg>`; }
  const tor = (() => { try{ return tourns(st).find(t => t.f >= todayISO()); }catch(e){ return null; } })();
  const n = unreadBy[curId] || 0, v = tecPendBy[curId] || 0, pend = pendingBy[curId] || 0;
  const consent = !!(consentBy[curId] || st.consent);
  let lastTest = '';
  Object.entries(pf.pr || {}).forEach(([k, h]) => { const l = h[h.length - 1]; if(l && (!lastTest || l.f >= lastTest.f)){ const t = (typeof PF_ALL !== 'undefined' ? PF_ALL : []).find(x => x.k === k); lastTest = {f: l.f, s: `${t ? t.n.split(' (')[0] : k} ${String(l.v).replace('.', ',')}${t ? ' ' + t.u : ''}`}; } });
  return `<section class="fx-w fx-st ${ds.k}"><i class="fx-d ${ds.k}"></i><span><b>${esc(ST_L[ds.k])}</b><span>${esc(ds.t)}</span></span></section>
  <div class="fx-grid fx-rgrid">
    <button type="button" class="fx-w fx-sum" data-view="plan"><span class="fx-k c-plan">Plan semanal</span><b>Semana ${esc(w)}</b>
      <span class="fx-bars" aria-label="${done} de ${nd} sesiones">${Array.from({length: nd}, (_, i) => `<i class="${i < done ? 'on' : ''}"></i>`).join('')}</span><span class="fx-s2">${done} de ${nd} sesiones · ${esc(m.l)}</span></button>
    <button type="button" class="fx-w fx-sum" data-view="eval"><span class="fx-k c-eval">Evaluación</span><b>${rf || yf ? `${rf ? `${rf} bandera${rf > 1 ? 's' : ''} roja${rf > 1 ? 's' : ''}` : ''}${rf && yf ? '<br>' : ''}${yf ? `${yf} amarilla${yf > 1 ? 's' : ''}` : ''}` : pf.upd ? 'Sin banderas' : 'Sin evaluar'}</b><span class="fx-s2">${lastTest ? esc(lastTest.s) + ' · ' + esc(fmtD(lastTest.f)) : 'Antecedentes, dolor y pruebas'}</span></button>
    <button type="button" class="fx-w fx-sum" data-view="ses"><span class="fx-k c-ses">Sesiones</span>${spark ? `<span class="fx-spark">${spark}</span>` : `<b>${(sessions || []).length}</b>`}<span class="fx-s2">${lastS ? `Última ${esc(hace(lastS.fecha))}${lastS.srpe != null ? ` · sRPE ${esc(lastS.srpe)}` : ''}` : 'Sin sesiones registradas'}${v ? ` · ${v} video${v > 1 ? 's' : ''}` : ''}</span></button>
    <button type="button" class="fx-w fx-sum" data-fx="chat"><span class="fx-k c-msg">Mensajes</span><b>${n ? `${n} sin leer` : 'Escribir'}</b><span class="fx-s2">${n ? 'Toca para responder' : 'Ánimo, recordatorio o ajuste'}</span></button>
    <button type="button" class="fx-w fx-sum" data-view="req"><span class="fx-k c-req">Solicitudes</span><b>${pend ? `${pend} pendiente${pend > 1 ? 's' : ''}` : 'Al día'}</b><span class="fx-s2">Cambios que pide el deportista</span></button>
    <button type="button" class="fx-w fx-sum" data-view="cal"><span class="fx-k c-cal">Calendario</span><b>${tor ? esc(fmtD(tor.f)) : 'Sin torneos'}</b><span class="fx-s2">${tor ? esc(tor.n || 'Torneo') : 'Torneos y semanas de descarga'}</span></button>
    <button type="button" class="fx-w fx-sum" data-view="hist"><span class="fx-k">Historia clínica</span><b>${consent ? 'Al día' : 'Pendiente'}</b><span class="fx-s2 ${consent ? 'ok' : 'bad'}">${consent ? 'Consentimiento firmado' : 'Falta el consentimiento'}</span></button>
    <button type="button" class="fx-w fx-sum" data-view="datos"><span class="fx-k">Datos y diagnóstico</span><b>${esc((MOD_L[modOf(st)] || 'Plan'))}</b><span class="fx-s2">${esc(subLabel(st, P[pkey(st)]))}</span></button>
  </div>`;
}
const _renderFx = render;
render = function(){
  const real = view, alt = real === 'resumen' || real === 'datos';
  if(alt) view = 'cal';
  try{ _renderFx.apply(this, arguments); } finally { view = real; }
  try{ fxFicha(); }catch(e){ console.error(e); }
};
function fxFicha(){
  const out = $('#out'); if(!out) return;
  const sp = fxSpecial();
  document.body.classList.toggle('fx-datos', view === 'datos' && !sp);
  if(view === 'datos'){ const f = $('#form'); if(f) f.classList.remove('collapsed'); }
  const ph = out.querySelector(':scope > .phead'), tabs = out.querySelector(':scope > nav.tabs');
  if(!ph || !tabs) return;
  const P0 = P[pkey(st)], phs = P0.phases[phaseIdx(st)], m = mesoWeek(st);
  const p = patients.find(x => x.id === curId), ds = p && !isExample && typeof dayState === 'function' ? dayState(p) : null;
  const consent = !!(consentBy[curId] || st.consent);
  const hdr = document.createElement('header'); hdr.className = 'phead fx-fhead';
  const backL = sp ? 'Cuenta' : (FX_TABS.find(t => t[0] === FX.from) || ['', 'Inicio'])[1];
  if(sp){
    hdr.innerHTML = `<div class="fx-fbar"><button type="button" class="fx-back" data-fxback>${FX_I.back}${esc(backL)}</button></div><h1 class="fx-tt">${view === 'banco' ? 'Banco de ejercicios' : 'Tabla de usuarios'}</h1>`;
  } else {
    hdr.innerHTML = `<div class="fx-fbar"><button type="button" class="fx-back" data-fxback>${FX_I.back}${esc(backL)}</button><span class="fx-save" id="fxSave">${esc($('#saveState')?.textContent || '')}</span></div>
      <div class="fx-who"><span class="fx-av">${esc(fxIni(st.nombre || 'N'))}</span><div class="fx-wn"><div class="client">${esc(st.nombre || 'Usuario nuevo')}${curId && !isExample ? `<button type="button" class="fx-pen${view === 'datos' ? ' on' : ''}" data-view="datos" aria-label="Editar datos" title="Editar datos"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg></button>` : ''}</div><p class="fx-cond">${esc(subLabel(st, P0))}${st.deporte && !depNorm(subLabel(st, P0)).includes(depNorm(st.deporte)) ? ' · ' + esc(st.deporte) : ''}</p></div></div>
      <div class="fx-tags">${ds ? `<span class="fx-tag st-${ds.k}"><i class="fx-d ${ds.k}"></i>${esc(ST_L[ds.k])}</span>` : ''}<span class="fx-tag">Semana ${esc(num(st.semPlan) || 1)} · ${esc(m.l)}</span>${!consent && !isExample ? '<span class="fx-tag bad">Falta consentimiento</span>' : ''}</div>
      <div class="fx-acts"></div>`;
    const acts = hdr.querySelector('.fx-acts');
    const pub = ph.querySelector('#bPub'); if(pub){ pub.textContent = 'Publicar'; acts.appendChild(pub); }
    const msg = ph.querySelector('#bMsg'); if(msg){ msg.className = 'fx-icb'; [...msg.childNodes].forEach(n => { if(n.nodeType === 3) n.remove(); }); msg.title = 'Mensaje'; acts.appendChild(msg); }
    if(curId && !isExample){ const nr = pendingBy[curId] || 0; acts.insertAdjacentHTML('beforeend', `<button type="button" class="fx-icb" data-fx="rcpp" aria-label="Bienestar en vivo" title="Bienestar en vivo">${FX_I.heart}</button><button type="button" class="fx-icb fx-bell${view === 'req' ? ' on' : ''}" data-view="req" aria-label="Solicitudes${nr ? ': ' + nr + ' sin responder' : ''}" title="Solicitudes"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>${nr ? `<i class="fx-bdot">${nr}</i>` : ''}</button>`); }
    const sv = ph.querySelector('#bSave'); if(sv){ sv.className = 'fx-savebtn'; hdr.querySelector('.fx-fbar').appendChild(sv); }
  }
  const ex = ph.querySelector('#bEdit');
  ph.replaceWith(hdr);
  const tail = out.querySelector(':scope > .dlbar');
  if(view !== 'plan' && tail) tail.remove();
  if(sp){ tabs.remove(); return; }
  const badge = k => { const n = k === 'req' ? (pendingBy[curId] || 0) : k === 'ses' ? (tecPendBy[curId] || 0) : 0; return n ? `<span class="fx-pb">${n}</span>` : ''; };
  const cur = FX_SECS.find(x => x[0] === view) || (FX_SEC_X[view] ? [view, FX_SEC_X[view]] : FX_SECS[0]), tot = (tecPendBy[curId] || 0);
  const nav = document.createElement('div'); nav.className = 'fx-secsel';
  nav.innerHTML = `<button type="button" class="fx-secbtn" data-fxmenu aria-haspopup="true" aria-expanded="false"><span>Sección</span><b>${esc(cur[1])}</b>${cur[0] === 'resumen' && tot ? `<span class="fx-pb">${tot}</span>` : ''}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
    <div class="fx-menu" role="menu" hidden>${FX_SECS.map(([k, l]) => `<button type="button" role="menuitem" data-view="${k}"${k === view ? ' aria-current="true"' : ''}><span>${l}</span>${badge(k)}${k === view ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : ''}</button>`).join('')}</div>`;
  tabs.replaceWith(nav);
  // Cuerpo de cada sección
  const keep = el => el.id === 'accCard' || el === hdr || el === nav || el.classList.contains('example') || el.classList.contains('foot');
  if(view === 'resumen' || view === 'datos'){
    [...out.children].forEach(el => { if(!keep(el)) el.remove(); });
    if(view === 'resumen') nav.insertAdjacentHTML('afterend', `<div class="fx-res">${fxResumen()}</div>`);
    else if(curId && !isExample) nav.insertAdjacentHTML('afterend', `${typeof histView === 'function' ? histView() : ''}${typeof evalView === 'function' ? `<section class="card fx-group"><h3 class="sec">Evaluación</h3>${evalView()}</section>` : ''}`);
  } else if(view === 'plan'){
    const card = document.createElement('section'); card.className = 'card fx-phase';
    card.innerHTML = `<div><span class="fx-eye">Fase actual · ${esc(phs.when)}</span><h2>${esc(phs.name)}</h2><p>${esc(phs.goal)}</p></div><div class="actions"><button type="button" data-tplopen>Mis plantillas</button><button type="button" data-blank>Empezar en blanco</button></div>`;
    nav.after(card);
  }
  fxFold(out);
  fxDays(out);
}

/* Todo plegable: cada tarjeta de la sección se abre y se cierra con su título (se recuerda) */
FX.dayOpen = new Set();
try{ FX.open = new Set(JSON.parse(LS.get('apex_fxopen') || '[]')); }catch(e){ FX.open = new Set(); }
const fxT = c => ((c.querySelector('h3.sec, h3, h2') || {}).textContent || '').trim();
function fxFold(out){
  [...out.children].forEach(c => {
    if(c.tagName !== 'SECTION' || c.id === 'accCard' || c.classList.contains('day') || c.classList.contains('dlbar')) return;
    const t = c.querySelector('h3.sec, h3, h2'); if(!t) return;
    const title = (c.classList.contains('fx-phase') ? 'Fase · ' : '') + t.textContent.trim().split(' (')[0];
    const key = view + ':' + title.split(' · ')[0].slice(0, 40), open = FX.open.has(key);
    c.classList.remove('fold', 'open'); c.classList.add('fx-cc'); c.classList.toggle('fx-closed', !open);
    t.classList.add('fx-hidt');
    c.insertAdjacentHTML('afterbegin', `<button type="button" class="fx-ch" data-fxcc="${esc(key)}" aria-expanded="${open}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg><span>${esc(title)}</span></button>`);
  });
}
// Días del plan plegados: se ve el título y los bloques; se abre el que se toque
function fxDays(out){
  if(view !== 'plan') return;
  out.querySelectorAll(':scope > section.card.day').forEach((c, i) => {
    if(c.classList.contains('editing')) return;
    if(typeof logOpen !== 'undefined' && logOpen === i) FX.dayOpen.add(i);
    const open = FX.dayOpen.has(i), h = c.querySelector('.dayhead'); if(!h) return;
    c.classList.add('fx-day'); c.classList.toggle('fx-closed', !open);
    const t = h.querySelector('h3'); if(!t) return;
    const n = [...c.querySelectorAll('.blk')].map(b => (b.querySelector('.bh b') || {}).textContent).filter(Boolean);
    t.innerHTML = `<button type="button" class="fx-dt" data-fxday="${i}" aria-expanded="${open}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>${esc(t.textContent)}${!open && n.length ? `<small>${esc(n.join(' · '))}</small>` : ''}</button>`;
  });
}
document.addEventListener('click', e => {   // cerrar el menú de secciones al tocar afuera
  const m = document.querySelector('#out .fx-menu:not([hidden]), #home .fx-menu:not([hidden])'); if(!m) return;
  if(!e.target.closest('.fx-secsel')){ m.hidden = true; m.previousElementSibling?.setAttribute('aria-expanded', 'false'); }
});
$('#out').addEventListener('click', e => {
  const mb = e.target.closest('[data-fxmenu]'); if(mb){ const m = mb.nextElementSibling; m.hidden = !m.hidden; mb.setAttribute('aria-expanded', String(!m.hidden)); return; }
  const cc = e.target.closest('[data-fxcc]'); if(cc){ const k = cc.dataset.fxcc, card = cc.closest('.fx-cc'); FX.open.has(k) ? FX.open.delete(k) : FX.open.add(k); const o = FX.open.has(k);
    card.classList.toggle('fx-closed', !o); cc.setAttribute('aria-expanded', String(o)); try{ LS.set('apex_fxopen', JSON.stringify([...FX.open])); }catch(_){} return; }
  const dy = e.target.closest('[data-fxday]'); if(dy){ const i = +dy.dataset.fxday; FX.dayOpen.has(i) ? FX.dayOpen.delete(i) : FX.dayOpen.add(i); render(); return; }
  const b = e.target.closest('[data-fxback],[data-fx]'); if(!b) return;
  if(b.hasAttribute('data-fxback')){ e.stopPropagation(); return fxBack(true); }
  const a = b.dataset.fx;
  if(a === 'chat' && curId){ typeof pxOpenChat === 'function' ? pxOpenChat(curId) : adCompose(curId, 'animo'); }
  if(a === 'rcpp' && curId && typeof rcpOpen === 'function'){ rcpOpen().then(() => { RC.p = patients.find(p => p.id === curId); RC.i = 0; RC.r = {}; RC.screen = 'q'; rcpRender(); }); }
});

/* ---------- Atrás (botón de la app y de Android) ---------- */
function fxBack(full){
  if(typeof me === 'undefined' || me.role !== 'fisio') return false;
  if(!homeVisible()){
    if(typeof editMode !== 'undefined' && editMode && !full){ editMode = false; render(); return true; }
    if(!full && !fxSpecial() && view !== 'resumen' && curId){ view = 'resumen'; render(); window.scrollTo(0, 0); return true; }
    FX.tab = fxSpecial() ? 'cuenta' : FX.from; showHome(); return true;
  }
  if(FX.tab !== 'inicio'){ FX.tab = 'inicio'; FX.from = 'inicio'; renderHome(); window.scrollTo(0, 0); return true; }
  return false;
}

/* Publicar abre también el acceso (si el deportista todavía no ha entrado nunca a Ápex) */
if(typeof publishPlan === 'function'){
  const _pubFx = publishPlan;
  publishPlan = async function(){
    await _pubFx.apply(this, arguments);
    if(!curId || isExample || !(st.email || '').trim() || typeof accRender !== 'function') return;
    const yaEntro = (sessions || []).some(x => x.autor === 'deportista') || (typeof wellness !== 'undefined' && wellness.length) || (typeof unreadBy !== 'undefined' && unreadBy[curId]);
    if(yaEntro) return;
    accOpen = true; ACC = {id: curId, link: '', busy: '', msg: 'Plan publicado. Si todavía no ha entrado a Ápex, envíale su acceso:', kind: 'ok'};
    accRender(); $('#accCard')?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  };
}
if(typeof accRender === 'function'){
  const _accFx = accRender;
  accRender = function(){
    _accFx.apply(this, arguments);
    $('#bAcc')?.remove();
    const c = $('#accCard'); if(c && !c.querySelector('[data-fxaccx]')) c.insertAdjacentHTML('afterbegin', '<button type="button" class="fx-accx" data-fxaccx aria-label="Cerrar">✕</button>');
  };
  document.addEventListener('click', e => { if(e.target.closest('[data-fxaccx]')){ accOpen = false; ACC = {id: null, link: '', busy: '', msg: '', kind: ''}; accRender(); } });
}
