/* ===================== ADHERENCIA (oct 2026) =====================
   Paquete de técnicas de cambio de conducta (Ley y Putz 2024: más técnicas, más efecto;
   el refuerzo del fisio es de lo que mejor funciona):
   1) Anillos de la semana: sesiones hechas sobre las planeadas y chequeos respondidos.
   2) Semanas cumplidas en vez de racha diaria: una semana cuenta si hizo todas sus sesiones;
      la semana en curso nunca rompe la cuenta y los días de descanso no castigan.
   3) Refuerzo del fisio: aviso en el panel cuando alguien cumple la semana y mensaje corto
      que le llega al deportista como notificación y en la app. */

/* ---------- Cálculos comunes ---------- */
const adIso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function adMonday(iso){ const d = new Date((iso || todayISO()) + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return adIso(d); }
function adAddDays(iso, n){ const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return adIso(d); }
/* Semanas cumplidas a partir de una lista de sesiones y de cuántas tocan por semana */
function adWeeks(ses, planned, desde){
  const now = adMonday(), by = {};
  (ses || []).forEach(s => { if(s && s.fecha){ const w = adMonday(s.fecha); by[w] = (by[w] || 0) + 1; } });
  const first = [desde ? adMonday(desde) : null, ...Object.keys(by)].filter(Boolean).sort()[0];
  const hist = [];
  if(first) for(let w = first; w <= now; w = adAddDays(w, 7)) hist.push({w, n: by[w] || 0, ok: (by[w] || 0) >= planned, now: w === now});
  let racha = 0;
  for(let i = hist.length - 1; i >= 0; i--){ const h = hist[i]; if(h.now && !h.ok) continue; if(h.ok) racha++; else break; }
  return {hist, racha, total: hist.filter(h => h.ok).length, actual: by[now] || 0, cumple: (by[now] || 0) >= planned};
}

/* ===================== PORTAL DEL DEPORTISTA ===================== */
A.msgs = [];
async function adLoadMsgs(){
  if(!A.p) return;
  try { const {data, error} = await sb.from('mensajes').select('id,texto,motivo,created_at,leido_at').eq('paciente_id', A.p.id).order('created_at', {ascending: false}).limit(20);
    if(!error){ A.msgs = data || []; renderAthlete(); } } catch(e){}
}
const _startAthleteAd = startAthlete;
startAthlete = async function(p){ await _startAthleteAd(p); adLoadMsgs(); };
async function adMarkRead(){
  const pend = (A.msgs || []).filter(m => !m.leido_at); if(!pend.length) return;
  pend.forEach(m => m.leido_at = new Date().toISOString()); renderAthlete();
  try { await sb.rpc('marcar_mensajes_leidos', {pid: A.p.id}); } catch(e){}
}

function adRing(r, pct, cls){ const c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, pct));
  return `<circle class="ad-track" cx="44" cy="44" r="${r}"/><circle class="ad-val ${cls}" cx="44" cy="44" r="${r}" stroke-dasharray="${(c * v).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 44 44)"/>`; }
function adSemana(big){
  const c = A.plan?.contenido; if(!c) return '';
  const planned = Math.max(1, (c.dias || []).length), lun = adMonday();
  const W = adWeeks(sessions, planned, (A.plan.publicado_at || '').slice(0, 10));
  const dias = Math.round((new Date(todayISO() + 'T12:00:00') - new Date(lun + 'T12:00:00')) / 864e5) + 1;
  const chk = new Set(wellness.filter(x => x.fecha >= lun && x.fecha <= todayISO()).map(x => x.fecha)).size;
  const s = Math.min(W.actual, planned);
  const msg = W.cumple ? '¡Semana cumplida! Todo lo que sigue suma.'
    : planned - s === 1 ? 'Te falta 1 sesión para cumplir la semana.' : `Te faltan ${planned - s} sesiones para cumplir la semana.`;
  const racha = W.racha >= 2 ? `${W.racha} semanas seguidas cumpliendo tu plan.` : W.total ? `Llevas ${W.total} semana${W.total > 1 ? 's' : ''} cumplida${W.total > 1 ? 's' : ''}.` : 'Tu primera semana cumplida está cerca.';
  const hist = big && W.hist.length > 1 ? `<div class="ad-hist" aria-label="Últimas semanas">${W.hist.slice(-8).map(h =>
    `<span class="${h.ok ? 'ok' : h.now ? 'now' : ''}" title="Semana del ${esc(fmtD(h.w))}: ${h.n} de ${planned}">${h.ok ? H_ICON.check : h.now ? '' : ''}</span>`).join('')}</div>
    <p class="ad-cap">Últimas ${Math.min(8, W.hist.length)} semanas. Cada marca es una semana con todas sus sesiones.</p>` : '';
  return `<section class="ap-card ad-week${big ? ' big' : ''}">
    <div class="ad-row">
      <svg class="ad-rings" viewBox="0 0 88 88" width="${big ? 104 : 84}" height="${big ? 104 : 84}" role="img" aria-label="Sesiones ${s} de ${planned}; chequeos ${chk} de ${dias}">
        ${adRing(38, s / planned, 'ses')}${adRing(26, chk / dias, 'chk')}</svg>
      <div class="ad-txt">
        <span class="ad-l"><i class="ses"></i>Sesiones <b>${s} de ${planned}</b></span>
        <span class="ad-l"><i class="chk"></i>Chequeos <b>${chk} de ${dias}</b></span>
        <span class="ad-m">${esc(msg)}</span>
      </div>
    </div>
    <p class="ad-racha">${esc(racha)}</p>${hist}
  </section>`;
}
function adMsgCard(){
  const m = (A.msgs || []).find(x => !x.leido_at); if(!m) return '';
  return `<section class="ap-card ad-msg"><span class="ad-from">Mensaje de tu fisioterapeuta · ${esc(fmtD((m.created_at || '').slice(0, 10)))}</span>
    <p>${esc(m.texto)}</p><button type="button" class="ap-btn ap-secondary" id="adRead">Entendido</button></section>`;
}
function adMsgList(){
  const ms = A.msgs || []; if(!ms.length) return '';
  return `<section class="ap-sec"><div class="ap-head"><h2>Mensajes</h2></div><div class="ap-list">${ms.map(m =>
    `<div class="ap-row"><span class="ap-l"><span>${esc(fmtD((m.created_at || '').slice(0, 10)))}</span><b class="ad-mt">${esc(m.texto)}</b></span></div>`).join('')}</div></section>`;
}

/* Inserta las piezas en las pestañas sin tocar el resto del pintado */
const _renderAthleteAd = renderAthlete;
renderAthlete = function(){
  _renderAthleteAd();
  const el = $('#athleteApp'); if(!el || !A.plan?.contenido || !A.consent) return;
  const body = el.querySelector('.ap-body'); if(!body) return;
  if(A.tab === 'hoy'){ body.insertAdjacentHTML('afterbegin', adMsgCard() + adSemana(false)); }
  if(A.tab === 'prog'){ const st = body.querySelector('.ap-stats'); if(st) st.outerHTML = adSemana(true); else body.insertAdjacentHTML('afterbegin', adSemana(true)); }
  if(A.tab === 'fisio'){ const first = body.querySelector('.ap-sec'); const html = adMsgList(); if(html){ first ? first.insertAdjacentHTML('beforebegin', html) : body.insertAdjacentHTML('afterbegin', html); } adMarkRead(); }
};
$('#athleteApp').addEventListener('click', e => { if(e.target.closest('#adRead')) adMarkRead(); });

/* ===================== PANEL DEL FISIO ===================== */
let msgsBy = {};
async function adLoadAllMsgs(){
  try { const desde = new Date(Date.now() - 21 * 864e5).toISOString();
    const {data} = await sb.from('mensajes').select('paciente_id,created_at,motivo').gte('created_at', desde).order('created_at', {ascending: false}).limit(500);
    msgsBy = {}; (data || []).forEach(m => (msgsBy[m.paciente_id] ||= []).push(m)); } catch(e){}
}
const _loadPatientsAd = loadPatients;
loadPatients = async function(){ await Promise.all([_loadPatientsAd(), adLoadAllMsgs()]); if(typeof homeVisible === 'function' && homeVisible()) renderHome(); };
function adPat(p){
  const planned = Math.max(1, nDias(Object.assign(blank(), p.st || {})));
  const W = adWeeks(allSes.filter(s => s.paciente_id === p.id), planned, null);
  const lun = adMonday(), yaEscribi = (msgsBy[p.id] || []).some(m => (m.created_at || '').slice(0, 10) >= lun);
  return {W, planned, yaEscribi};
}
const _renderHomeAd = renderHome;
renderHome = function(){
  _renderHomeAd();
  const home = $('#home'); if(!home) return;
  // Semana cumplida y racha en cada tarjeta
  home.querySelectorAll('.pcard[data-open-h]').forEach(card => {
    const p = patients.find(x => x.id === card.dataset.openH); if(!p) return;
    const a = adPat(p), meta = card.querySelector('.pmeta');
    if(meta) meta.insertAdjacentHTML('afterend', `<span class="ad-pw${a.W.cumple ? ' ok' : ''}">${a.W.cumple ? 'Semana cumplida' : `Semana ${Math.min(a.W.actual, a.planned)} de ${a.planned}`}${a.W.racha >= 2 ? ` · ${a.W.racha} seguidas` : ''}</span>`);
  });
  // Quienes cumplieron y aún no tienen mensaje tuyo esta semana
  const list = patients.filter(p => p.email).map(p => ({p, a: adPat(p)})).filter(x => x.a.W.cumple && !x.a.yaEscribi);
  const att = home.querySelector('.hside .card .hlist, .hside .card p.small');
  if(list.length && att){
    const html = list.map(x => `<li><button data-msg="${esc(x.p.id)}"><span class="dot g" aria-hidden="true"></span><span class="t"><b>${esc(x.p.nombre)}</b><i>Cumplió su semana${x.a.W.racha >= 2 ? `, ${x.a.W.racha} seguidas` : ''}: envíale un mensaje</i></span><span class="go" aria-hidden="true">›</span></button></li>`).join('');
    if(att.tagName === 'UL') att.insertAdjacentHTML('afterbegin', html); else att.outerHTML = `<ul class="hlist">${html}</ul>`;
  }
};
$('#home').addEventListener('click', e => { const b = e.target.closest('[data-msg]'); if(b){ e.stopPropagation(); adCompose(b.dataset.msg, 'semana'); } }, true);

/* Botón en la ficha del paciente */
const _renderAd = render;
render = function(){
  _renderAd.apply(this, arguments);
  const pub = $('#bPub');
  if(pub && curId && !$('#bMsg')) pub.insertAdjacentHTML('beforebegin', '<button id="bMsg" type="button">Enviar mensaje</button>');
};
document.addEventListener('click', e => { if(e.target.closest('#bMsg') && curId) adCompose(curId, 'animo'); });

/* Ventana para escribir el mensaje */
const AD_PRESETS = {
  semana: ['¡Semana cumplida! Así se construye la recuperación. Sigue igual.', 'Cumpliste todas tus sesiones. Esa constancia es lo que más pesa en tu progreso.'],
  animo: ['Vas muy bien. Sigue registrando tus sesiones y tu chequeo diario.', 'Te extrañé esta semana en los registros. ¿Todo bien? Cuéntame si algo no está funcionando.'],
  ajuste: ['Revisé tus registros: esta semana mantén las cargas y prioriza dormir bien.']
};
function adCompose(pid, motivo){
  const p = patients.find(x => x.id === pid); if(!p) return;
  if(!p.email){ toast('Este paciente no tiene acceso al portal: agrégale un correo para poder escribirle.'); return; }
  let d = $('#msgDlg');
  if(!d){ d = document.createElement('div'); d.id = 'msgDlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'msgDlgT'); document.body.appendChild(d); }
  const pre = [...(AD_PRESETS[motivo] || []), ...(motivo === 'semana' ? [] : AD_PRESETS.ajuste)];
  d.innerHTML = `<div class="md-card"><h2 id="msgDlgT">Mensaje para ${esc((p.nombre || '').split(' ')[0])}</h2>
    <p class="small" style="margin:0">Le llega como notificación y lo ve al abrir la app.</p>
    <div class="md-pre">${pre.map((t, i) => `<button type="button" data-pre="${i}">${esc(t)}</button>`).join('')}</div>
    <label class="f">Mensaje<textarea id="mdTxt" maxlength="500" rows="4" placeholder="Escribe algo corto y concreto">${esc(pre[0] || '')}</textarea></label>
    <div class="md-act"><button type="button" id="mdCancel">Cancelar</button><button type="button" class="primary" id="mdSend">Enviar</button></div></div>`;
  d.hidden = false; d.dataset.pid = pid; d.dataset.motivo = motivo; d._pre = pre;
  setTimeout(() => $('#mdTxt')?.focus(), 30);
}
document.addEventListener('click', async e => {
  const d = $('#msgDlg'); if(!d || d.hidden) return;
  let b;
  if((b = e.target.closest('[data-pre]'))){ $('#mdTxt').value = d._pre[+b.dataset.pre]; return; }
  if(e.target === d || e.target.closest('#mdCancel')){ d.hidden = true; return; }
  if(e.target.closest('#mdSend')){
    const t = ($('#mdTxt').value || '').trim(); if(!t){ toast('Escribe el mensaje.'); return; }
    const btn = $('#mdSend'); btn.disabled = true;
    const {error} = await sb.from('mensajes').insert({paciente_id: d.dataset.pid, texto: t.slice(0, 500), motivo: d.dataset.motivo === 'semana' ? 'semana' : 'animo'});
    btn.disabled = false;
    if(error){ toast('No se pudo enviar el mensaje.'); return; }
    (msgsBy[d.dataset.pid] ||= []).unshift({paciente_id: d.dataset.pid, created_at: new Date().toISOString()});
    d.hidden = true; toast('Mensaje enviado'); if(typeof homeVisible === 'function' && homeVisible()) renderHome();
  }
});
document.addEventListener('keydown', e => { const d = $('#msgDlg'); if(e.key === 'Escape' && d && !d.hidden) d.hidden = true; });
