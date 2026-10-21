/* ===================== PORTADA DEL DEPORTISTA · WIDGETS (oct 2026) =====================
   La primera pestaña es "Inicio": widgets de orden fijo al estilo del iPhone, claro u oscuro
   según el celular. Arriba el estado del día con la sesión y el botón para entrenar; luego
   semana, torneo o fase, récord, racha, la meta personal que escribe el deportista, el mensaje
   sin leer y la lección del día; abajo, accesos a Chequeo, Registrar y Mensaje.
   Al tocar la sesión se abre la vista del día (la antigua pestaña Hoy) con todos los ejercicios. */

const PO_SVG = (p, w = 22, sw = 2) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const PO_I = {
  ok: PO_SVG('<path d="M6 12.5l4 4 8-9"/>', 18, 3),
  warn: PO_SVG('<path d="M12 6.5v7M12 17.5h.01"/>', 18, 3),
  ask: PO_SVG('<path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6v.4M12 17.5h.01"/>', 18, 2.6),
  play: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>',
  chk: PO_SVG('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  reg: PO_SVG('<path d="M6 12.5l4 4 8-9"/>'),
  msg: PO_SVG('<path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V16h.5"/>'),
  flag: PO_SVG('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', 18, 2),
  chev: '<svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg>',
  back: '<svg width="10" height="17" viewBox="0 0 10 17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 1.5L1.5 8.5l7 7"/></svg>'
};
const poDays = iso => Math.round((new Date(iso + 'T12:00:00') - new Date(todayISO() + 'T12:00:00')) / 864e5);
const poRing = (r, v) => { const c = 2 * Math.PI * r, x = Math.max(0, Math.min(1, v)); return x <= 0 ? 'stroke-opacity="0"' : `stroke-dasharray="${(c * x).toFixed(1)} ${c.toFixed(1)}"`; };

/* ---------- Widgets ---------- */
function poEstado(c){
  const hasW = wellness.some(x => x.fecha === todayISO()), wl = hasW ? todayLight() : null, k = wl ? wl.c : 'n';
  const n = (c.dias || []).length, di = hTodayIdx(c), d = c.dias[di];
  const nEx = d ? d.segs.reduce((a, sg) => a + sg.rows.length, 0) : 0;
  const hecho = d && sessions.some(s => s.fecha === todayISO() && s.dia === d.name);
  const T = {n:['Haz tu chequeo', 'Sueño, estrés, fatiga y dolor: 30 segundos y tu plan se ajusta.'], g:['Listo para entrenar', 'Chequeo verde: plan completo.'],
    y:['Día amarillo', 'Hoy sin subir peso: 1 punto menos de RPE.'], r:['Día rojo', 'Tu plan de hoy viene recortado.']}[k];
  const ic = {n: PO_I.ask, g: PO_I.ok, y: PO_I.warn, r: PO_I.warn}[k];
  const vivo = c.vivo !== false;
  return `<section class="po-w po-hero s-${k}">
    <div class="po-hs"><span class="po-dot">${ic}</span><span class="po-ht"><b>${T[0]}</b><span>${esc(T[1])}</span></span></div>
    ${k === 'n' ? '<button type="button" class="po-cta" data-po="chk">Responder chequeo</button>' : ''}
    ${d ? `<div class="po-ses"><button type="button" class="po-sesb" data-po="dia" aria-label="Ver la sesión de hoy: ${esc(d.name)}">
        <b>${esc(d.name)}${n > 1 ? ` <span>de ${n}</span>` : ''}</b><span>${hecho ? 'Registrada hoy' : `${nEx} ejercicios · semana ${esc(c.semana)}`}</span></button>
      ${hecho ? `<span class="po-done" aria-label="Sesión hecha">${PO_I.ok}</span>` : vivo ? `<button type="button" class="po-play" data-live="${di}" aria-label="Entrenar en vivo">${PO_I.play}</button>` : `<button type="button" class="po-play" data-po="reg" aria-label="Registrar sesión">${PO_I.reg}</button>`}</div>` : ''}
  </section>`;
}
function poSemana(c){
  const planned = Math.max(1, (c.dias || []).length), lun = adMonday();
  const W = adWeeks(sessions, planned, (A.plan?.publicado_at || '').slice(0, 10)), s = Math.min(W.actual, planned);
  const dias = Math.round((new Date(todayISO() + 'T12:00:00') - new Date(lun + 'T12:00:00')) / 864e5) + 1;
  const chk = Math.min(planned, new Set(wellness.filter(x => x.fecha >= lun && x.fecha <= todayISO()).map(x => x.fecha)).size);   // chequeos contra los días de entrenamiento, como las sesiones
  return {W, html: `<button type="button" class="po-w po-sq" data-po="prog" aria-label="Semana: ${s} de ${planned} sesiones, ${chk} de ${planned} chequeos">
    <span class="po-l">Semana</span>
    <svg class="po-rings" viewBox="0 0 96 96" width="70" height="70" aria-hidden="true">
      <circle class="tr ses" cx="48" cy="48" r="39"/><circle class="v ses" cx="48" cy="48" r="39" ${poRing(39, s / planned)} transform="rotate(-90 48 48)"/>
      <circle class="tr chk" cx="48" cy="48" r="24"/><circle class="v chk" cx="48" cy="48" r="24" ${poRing(24, chk / planned)} transform="rotate(-90 48 48)"/></svg>
    <span class="po-s"><b class="ses">${s}/${planned}</b> sesiones · <b class="chk">${chk}/${planned}</b> chequeos</span></button>`};
}
function poTorneo(c){
  const t = (c.semanas || []).flatMap(w => w.t || []).filter(t => t.f >= todayISO()).sort((a, b) => a.f.localeCompare(b.f))[0];
  if(t){ const d = poDays(t.f);
    return `<button type="button" class="po-w po-sq" data-po="plan"><span class="po-l">${esc(t.n || 'Torneo')}</span><b class="po-big">${d}</b><span class="po-s">${d === 1 ? 'día' : 'días'} · ${esc(fmtD(t.f))}</span></button>`; }
  return `<button type="button" class="po-w po-sq" data-po="plan"><span class="po-l">Tu fase</span><b class="po-mid">${esc(hCap(hPhase(c)) || 'Plan')}</b><span class="po-s">Semana ${esc(c.semana)}${c.meso?.l ? ' · ' + esc(hLow(c.meso.l)) : ''}</span></button>`;
}
function poRecord(){
  const lifts = typeof pxLifts === 'function' ? pxLifts() : {}, recs = typeof pxRecords === 'function' ? pxRecords(lifts) : [];
  const r = recs.slice().sort((a, b) => b.best.x.localeCompare(a.best.x) || b.n - a.n)[0];
  if(!r) return `<button type="button" class="po-w po-sq" data-po="prog"><span class="po-l">Récord</span><b class="po-mid">Aún no</b><span class="po-s">Registra el peso de tus ejercicios para ver tus marcas.</span></button>`;
  const a = lifts[r.e].slice(-8), lo = Math.min(...a.map(p => p.kg)), hi = Math.max(...a.map(p => p.kg));
  const pts = a.map((p, i) => `${(4 + i * (132 / Math.max(1, a.length - 1))).toFixed(1)},${(26 - (hi > lo ? (p.kg - lo) / (hi - lo) : .5) * 22).toFixed(1)}`);
  return `<button type="button" class="po-w po-sq" data-po="prog" aria-label="Récord en ${esc(r.e)}: ${esc(PX.fmtN(r.best.kg))} kg">
    <span class="po-l">Récord${r.nuevo ? ' · nuevo' : ''}</span>
    <span class="po-rv"><b>${esc(PX.fmtN(r.best.kg))} kg</b><span>${esc(r.e)}${r.best.reps ? ' × ' + r.best.reps : ''}</span></span>
    ${a.length > 1 ? `<svg class="po-spark" viewBox="0 0 140 30" width="100%" height="30" aria-hidden="true"><polyline points="${pts.join(' ')}"/><circle cx="${pts[pts.length - 1].split(',')[0]}" cy="${pts[pts.length - 1].split(',')[1]}" r="3.5"/></svg>` : ''}</button>`;
}
function poRacha(W){
  const h = W.hist.slice(-6);
  return `<button type="button" class="po-w po-sq" data-po="prog" aria-label="Racha: ${W.racha} semanas seguidas cumpliendo tu plan">
    <span class="po-l">Racha</span><span class="po-rv"><b>${W.racha} ${W.racha === 1 ? 'semana' : 'semanas'}</b><span>cumpliendo tu plan</span></span>
    <span class="po-weeks" aria-hidden="true">${h.map(x => `<i class="${x.ok ? 'ok' : x.now ? 'now' : ''}"></i>`).join('')}</span></button>`;
}
function poMeta(){
  const m = A.p?.meta;
  if(A.metaOpen) return `<section class="po-w po-meta po-mf"><span class="po-l">Mi meta</span>
    <label class="f">¿Qué quieres lograr?<input type="text" id="poMetaT" maxlength="140" placeholder="Ej.: volver a jugar un partido completo" value="${esc(m?.t || '')}"></label>
    <label class="f">¿Para cuándo?<input type="date" id="poMetaF" value="${esc(m?.f || '')}" min="${todayISO()}"></label>
    <div class="po-acts"><button type="button" class="po-cta" data-po="metasave">Guardar</button><button type="button" class="po-plain" data-po="metacancel">Cancelar</button>${m ? '<button type="button" class="po-plain po-del" data-po="metadel">Quitar</button>' : ''}</div>
    <p class="po-note">Tu fisioterapeuta la ve en tu ficha.</p></section>`;
  if(!m) return `<button type="button" class="po-w po-meta po-empty" data-po="meta"><span class="po-mi">${PO_I.flag}</span><span class="po-ht"><b>Ponte una meta</b><span>Algo concreto y con fecha: tu fisioterapeuta la ve.</span></span>${PO_I.chev}</button>`;
  const d = m.f ? poDays(m.f) : null;
  return `<button type="button" class="po-w po-meta" data-po="meta" aria-label="Mi meta: ${esc(m.t)}. Toca para editar">
    <span class="po-mi">${PO_I.flag}</span><span class="po-ht"><span class="po-l">Mi meta</span><b>${esc(m.t)}</b>${m.f ? `<span>${esc(fmtD(m.f))}</span>` : ''}</span>
    ${d != null ? `<span class="po-cd"><b>${d < 0 ? 0 : d}</b><span>${d === 1 ? 'día' : 'días'}</span></span>` : PO_I.chev}</button>`;
}
function poMensaje(){
  const m = (A.msgs || []).find(x => x.autor !== 'deportista' && !x.leido_at); if(!m) return '';
  return `<button type="button" class="po-w po-msg" data-po="msg"><span class="po-mi">${PO_I.msg}</span><span class="po-ht"><span class="po-l">Tu fisioterapeuta · ${esc(fmtD((m.created_at || '').slice(0, 10)))}</span><b>${esc(m.texto)}</b></span><span class="po-unread" aria-label="Sin leer"></span></button>`;
}
function poLeccion(c){
  if(typeof LECC === 'undefined') return '';
  const L = LECC.filter(l => { try{ return l.para(c); }catch(e){ return false; } }); if(!L.length) return '';
  const doy = Math.floor((new Date(todayISO() + 'T12:00:00') - new Date(todayISO().slice(0, 4) + '-01-01T12:00:00')) / 864e5);
  const l = L[doy % L.length];
  return `<button type="button" class="po-w po-lec" data-po="lec" data-lecid="${esc(l.id)}"><span class="po-ht"><span class="po-l">Lección de hoy · ${l.min} min</span><b>${esc(l.t)}</b></span>${PO_I.chev}</button>`;
}
function poFrase(){
  if(typeof fraseDelDia !== 'function') return '';
  return `<section class="po-w po-frase" aria-label="Frase del día"><span class="po-l">Frase del día</span><p>${esc(fraseDelDia())}</p></section>`;
}
function poInicio(c){
  const nom = (A.p?.nombre || '').split(' ')[0];
  const sem = poSemana(c);
  return `<header class="ap-page po-top"><div><p class="po-date">${esc(hFecha())}</p><h1>${nom ? `Hola, ${esc(nom)}` : 'Inicio'}</h1></div>
      <button type="button" class="ap-avatar" data-htab="fisio" aria-label="Mi cuenta">${esc(hIni(A.p?.nombre))}</button></header>
    <div class="ap-body po-body">
      ${poEstado(c)}
      ${A.wOpen ? `<section class="ap-card ap-form">${wellForm('aw')}</section>` : ''}
      <div class="po-grid">${sem.html}${poTorneo(c)}${poRecord()}${poRacha(sem.W)}</div>
      ${poMeta()}
      ${poMensaje()}
      ${poFrase()}
      <nav class="po-quick" aria-label="Accesos rápidos">
        <button type="button" data-po="chk"><span>${PO_I.chk}</span>Chequeo</button>
        <button type="button" data-po="reg"><span>${PO_I.reg}</span>Registrar</button>
        <button type="button" data-po="msg"><span>${PO_I.msg}${(A.msgs || []).some(x => x.autor !== 'deportista' && !x.leido_at) ? '<i class="po-badge" aria-label="mensaje sin leer"></i>' : ''}</span>Mensaje</button>
      </nav>
      ${typeof pushCard === 'function' ? pushCard() : ''}
    </div>`;
}

/* ---------- Pestañas: "Inicio" reemplaza a "Hoy"; Hoy queda como vista del día ---------- */
{ const i = H_TABS.findIndex(t => t[0] === 'hoy'); const tab = ['inicio', 'Inicio', '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'];
  if(i >= 0) H_TABS.splice(i, 1, tab); else if(!H_TABS.some(t => t[0] === 'inicio')) H_TABS.unshift(tab); }
const _startAthletePo = startAthlete;
startAthlete = async function(p){ A.tab = 'inicio'; await _startAthletePo(p); };
const _renderAthletePo = renderAthlete;
renderAthlete = function(){
  const c = A.plan?.contenido;
  if(!A.tab || A.tab === 'inicio'){
    A.tab = 'inicio';
    if(c && A.consent){
      const el = $('#athleteApp'); el.classList.add('ath2'); document.body.classList.add('ath2b');
      el.innerHTML = poInicio(c) + hTabbar(); el.classList.add('has-tabs');
      document.querySelectorAll('meta[name="theme-color"]').forEach(tc => { const dk = /dark/.test(tc.getAttribute('media') || ''); tc.setAttribute('content', dk ? '#000000' : '#F2F2F7'); });
      if(A.pendLive != null && wellness.some(x => x.fecha === todayISO()) && !A.wOpen){ const di = A.pendLive; A.pendLive = null; setTimeout(() => startLive(di), 50); }
      return;
    }
    A.tab = 'hoy';   // sin plan o sin consentimiento: el pintado base se encarga
  }
  _renderAthletePo();
  if(A.tab === 'hoy' && c && A.consent){
    const top = document.querySelector('#athleteApp .ap-top');
    if(top && !top.querySelector('.po-back')) top.insertAdjacentHTML('afterbegin', `<button type="button" class="po-back" data-htab="inicio">${PO_I.back}Inicio</button>`);
    const t = document.querySelector('#athleteApp .ap-tabs [data-htab="inicio"]'); if(t) t.setAttribute('aria-current', 'page');
    document.querySelectorAll('#athleteApp .ad-msg, #athleteApp .ad-week').forEach(x => x.remove());   // ya están en Inicio
  }
};
$('#athleteApp').addEventListener('click', async e => {
  const b = e.target.closest('[data-po]'); if(!b) return;
  const c = A.plan?.contenido || {}, k = b.dataset.po;
  const go = (tab, fn) => { A.tab = tab; if(fn) fn(); renderAthlete(); window.scrollTo(0, 0); };
  if(k === 'dia') return go('hoy', () => { A.day = hTodayIdx(c); A.open = null; });
  if(k === 'chk') return go('hoy', () => { A.wOpen = true; });
  if(k === 'reg') return go('hoy', () => { A.day = hTodayIdx(c); A.open = A.day; });
  if(k === 'prog') return go('prog');
  if(k === 'plan') return go('plan');
  if(k === 'lec') return go('aprende', () => { A.apr = A.apr || {}; A.apr.open = b.dataset.lecid; });
  if(k === 'msg'){ go('fisio'); setTimeout(() => { const t = $('#pxTxt'); if(t){ t.scrollIntoView({block:'center'}); t.focus({preventScroll:true}); } }, 60); return; }
  if(k === 'meta'){ A.metaOpen = true; renderAthlete(); setTimeout(() => $('#poMetaT')?.focus(), 30); return; }
  if(k === 'metacancel'){ A.metaOpen = false; renderAthlete(); return; }
  if(k === 'metasave' || k === 'metadel'){
    const t = k === 'metadel' ? null : ($('#poMetaT')?.value || '').trim(), f = k === 'metadel' ? null : ($('#poMetaF')?.value || null);
    if(k === 'metasave' && !t){ toast('Escribe tu meta.'); $('#poMetaT')?.focus(); return; }
    b.disabled = true;
    const {data, error} = await sb.rpc('set_meta', {pid: A.p.id, p_texto: t, p_fecha: f || null});
    b.disabled = false;
    if(error){ toast('No se pudo guardar. Revisa tu conexión.'); return; }
    A.p.meta = data || null; A.metaOpen = false; renderAthlete(); toast(k === 'metadel' ? 'Meta quitada' : 'Meta guardada'); return;
  }
});

/* ---------- Ficha del fisio: la meta del deportista bajo su nombre ---------- */
let metaBy = {};
async function poLoadMetas(){ try{ const {data} = await sb.from('pacientes').select('id,meta'); metaBy = {}; (data || []).forEach(p => { if(p.meta) metaBy[p.id] = p.meta; }); }catch(e){} }
const _loadPatientsPo = loadPatients;
loadPatients = async function(){ await Promise.all([_loadPatientsPo(), poLoadMetas()]); };
const _renderPo = render;
render = function(){
  _renderPo.apply(this, arguments);
  const m = curId && metaBy[curId], cl = $('#out .phead .client');
  if(m && cl && !$('#poMetaF2')){
    const d = m.f ? poDays(m.f) : null;
    cl.insertAdjacentHTML('afterend', `<div class="po-fmeta" id="poMetaF2"><span>Meta del deportista</span><b>${esc(m.t)}</b>${m.f ? `<i>${esc(fmtD(m.f))}${d != null && d >= 0 ? ` · faltan ${d} ${d === 1 ? 'día' : 'días'}` : ''}</i>` : ''}</div>`);
  }
};
