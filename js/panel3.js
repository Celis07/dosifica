/* ===================== PANEL DEL FISIO · AJUSTES (oct 2026) =====================
   - Datos con lápiz junto al nombre; Historia y Evaluación van dentro, plegables. Cuadro de Guardar al editar.
   - Historia/Evaluación desde otros accesos abren Datos con esa tarjeta desplegada.
   - Torneos: calendario del mes y "Añadir al calendario" (.ics para el celular).
   - Pesi o Nutria también para el fisio (Inicio y Cuenta). */

/* ---------- Redirección y tarjeta que se abre ---------- */
let fxWantOpen = null;
const _renderP3 = render;
render = function(){
  if(document.body.classList.contains('fx') && (view === 'hist' || view === 'eval')){ fxWantOpen = view === 'hist' ? 'datos:Historia clínica' : 'datos:Evaluación'; view = 'datos'; }
  if(view !== 'datos' && dSave.pend) dGuardar(true);
  const r = _renderP3.apply(this, arguments);
  if(fxWantOpen && view === 'datos'){ FX.open.add(fxWantOpen); const k = fxWantOpen; fxWantOpen = null;
    const b = document.querySelector(`#out [data-fxcc="${CSS.escape(k)}"]`); if(b && b.closest('.fx-closed')) b.click(); b?.scrollIntoView({block: 'start'}); }
  dBar();
  if(view === 'cal') torCal();
  return r;
};

/* ---------- Cuadro de Guardar en Datos ---------- */
const dSave = {pend: false};
function dBar(){
  let bar = $('#fxSaveBar');
  const show = document.body.classList.contains('fx') && view === 'datos' && dSave.pend;
  if(!show){ if(bar) bar.hidden = true; return; }
  if(!bar){ bar = document.createElement('div'); bar.id = 'fxSaveBar'; bar.setAttribute('role', 'status');
    bar.innerHTML = '<span>Cambios sin guardar</span><button type="button" data-dsavebar>Guardar</button>'; document.body.appendChild(bar);
    bar.addEventListener('click', e => { if(e.target.closest('[data-dsavebar]')) dGuardar(false); }); }
  bar.hidden = false;
}
async function dGuardar(quiet){
  const b = document.querySelector('#fxSaveBar [data-dsavebar]'); if(b){ b.disabled = true; b.textContent = 'Guardando…'; }
  clearTimeout(typeof dirtyT !== 'undefined' ? dirtyT : 0);
  try{ await save(quiet); if(typeof histDirty !== 'undefined' && histDirty) await saveHistoria(); }finally{ if(b){ b.disabled = false; b.textContent = 'Guardar'; } }
  if(!/No se pudo/.test($('#saveState')?.textContent || '')){ dSave.pend = false; dBar(); if(!quiet) toast('Datos guardados'); }
}
// En Datos no se guarda solo: aparece el cuadro de Guardar (al salir de Datos se guarda lo pendiente)
const _markDirtyP3 = markDirty;
markDirty = function(){
  if(document.body.classList.contains('fx') && view === 'datos' && curId){ $('#saveState').textContent = 'Cambios sin guardar…'; dSave.pend = true; dBar(); return; }
  return _markDirtyP3.apply(this, arguments);
};
document.addEventListener('input', e => {
  if(view !== 'datos' || !document.body.classList.contains('fx')) return;
  if(e.target.closest('#out [data-h], #form')){ dSave.pend = true; dBar(); }
});

/* ---------- Torneos: calendario y "Añadir al calendario" ---------- */
const icsEsc = s => String(s || '').replace(/[\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
function icsDe(list, quien){
  const d = f => f.replace(/-/g, ''), sig = f => { const x = new Date(f + 'T12:00:00'); x.setDate(x.getDate() + 1); return x.toISOString().slice(0, 10).replace(/-/g, ''); };
  const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Apex//Torneos//ES', 'CALSCALE:GREGORIAN',
    ...list.filter(t => t.f).flatMap((t, i) => ['BEGIN:VEVENT', `UID:apex-${d(t.f)}-${i}-${icsEsc(t.n).replace(/\W/g, '').slice(0, 20)}@apex`, `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${d(t.f)}`, `DTEND;VALUE=DATE:${sig(t.f)}`, `SUMMARY:${icsEsc((t.n || 'Torneo') + (quien ? ' · ' + quien : ''))}`,
      `DESCRIPTION:${icsEsc('Torneo' + (t.p ? ' prioridad ' + t.p : '') + ' · Ápex')}`, 'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc('Mañana: ' + (t.n || 'torneo'))}`, 'END:VALARM', 'END:VEVENT']),
    'END:VCALENDAR'].join('\r\n');
}
function icsBajar(list, quien, nombre){
  const blob = new Blob([icsDe(list, quien)], {type: 'text/calendar;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (nombre || 'torneos') + '.ics';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function calMes(y, m, marcas){
  const p = new Date(y, m, 1), dias = new Date(y, m + 1, 0).getDate(), off = (p.getDay() + 6) % 7, hoy = todayISO();
  const iso = d => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  let c = ''; for(let i = 0; i < off; i++) c += '<span></span>';
  for(let d = 1; d <= dias; d++){ const k = iso(d), t = marcas[k];
    c += `<span class="${k === hoy ? 'hoy ' : ''}${t ? 'tor p' + (t.p || 'C') : ''}"${t ? ` title="${esc(t.n || 'Torneo')}"` : ''}>${d}</span>`; }
  return `<div class="tcal"><b>${esc((t => t[0].toUpperCase() + t.slice(1))(p.toLocaleDateString('es-CO', {month: 'long', year: 'numeric'})))}</b><div class="tcal-g">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => `<i>${x}</i>`).join('')}${c}</div></div>`;
}
function torCalHTML(T, quien){
  const fut = T.filter(t => t.f && t.f >= todayISO()).sort((a, b) => a.f.localeCompare(b.f));
  const marcas = {}; T.forEach(t => { if(t.f) marcas[t.f] = t; });
  const hoy = new Date(), fin = fut.length ? new Date(fut[fut.length - 1].f + 'T12:00:00') : hoy;
  const meses = []; let y = hoy.getFullYear(), m = hoy.getMonth();
  while((y < fin.getFullYear() || (y === fin.getFullYear() && m <= fin.getMonth())) && meses.length < 6){ meses.push(calMes(y, m, marcas)); m++; if(m > 11){ m = 0; y++; } }
  if(!meses.length) meses.push(calMes(y, m, marcas));
  return `<div class="tcal-wrap">${meses.join('')}</div>
    ${fut.length ? `<div class="tcal-list">${fut.map((t, i) => `<div class="tcal-r"><span class="prio ${t.p === 'C' ? '' : esc(t.p || '')}">${esc(t.p || 'C')}</span><span class="tcal-n"><b>${esc(t.n || 'Torneo')}</b><span>${esc(fmtD(t.f))}</span></span><button type="button" class="mini-btn" data-ics="${i}">Añadir al calendario</button></div>`).join('')}</div>
      ${fut.length > 1 ? '<button type="button" class="ghost" data-ics="all">Añadir todos al calendario</button>' : ''}` : '<p class="small">No hay torneos próximos.</p>'}`;
}
function torCal(){
  const out = $('#out'); if(!out || out.querySelector('.tcal-card')) return;
  const T = st.torneos || [];
  const first = [...out.children].find(c => c.tagName === 'SECTION' && /Calendario de torneos/.test(c.textContent));
  const html = `<section class="card tcal-card"><h3 class="sec">Calendario</h3>${torCalHTML(T, st.nombre)}</section>`;
  if(first) first.insertAdjacentHTML('beforebegin', html); else out.insertAdjacentHTML('beforeend', html);
  const card = out.querySelector('.tcal-card');
  if(document.body.classList.contains('fx') && typeof fxFold === 'function'){ /* siempre abierta: es lo primero de Torneos */ }
  card.addEventListener('click', e => {
    const b = e.target.closest('[data-ics]'); if(!b) return;
    const fut = T.filter(t => t.f && t.f >= todayISO()).sort((a, b) => a.f.localeCompare(b.f));
    const list = b.dataset.ics === 'all' ? fut : [fut[+b.dataset.ics]];
    icsBajar(list, st.nombre, list.length === 1 ? (list[0].n || 'torneo') : 'torneos');
  });
}
// Deportista: sus torneos en Mi plan, con el mismo botón
const _renderAthleteP3 = renderAthlete;
renderAthlete = function(){
  _renderAthleteP3.apply(this, arguments);
  if(A.tab !== 'plan') return;
  const c = A.plan?.contenido; if(!c) return;
  const T = (c.semanas || []).flatMap(w => w.t || []).filter((t, i, a) => t.f && a.findIndex(x => x.f === t.f && x.n === t.n) === i);
  const body = document.querySelector('#athleteApp .ap-body'); if(!body || !T.length || body.querySelector('.tcal-card')) return;
  body.insertAdjacentHTML('afterbegin', `<section class="ap-sec tcal-card"><div class="ap-head"><h2>Torneos</h2></div><div class="ap-card">${torCalHTML(T, '')}</div></section>`);
  body.querySelector('.tcal-card').addEventListener('click', e => {
    const b = e.target.closest('[data-ics]'); if(!b) return;
    const fut = T.filter(t => t.f >= todayISO()).sort((a, b) => a.f.localeCompare(b.f));
    const list = b.dataset.ics === 'all' ? fut : [fut[+b.dataset.ics]];
    icsBajar(list, '', list.length === 1 ? (list[0].n || 'torneo') : 'torneos');
  });
};

/* ---------- Pesi o Nutria también para el fisio ---------- */
const mkFisio = () => { const v = LS.get('apex_mascota_fisio'); return MASC[v] ? v : 'pesi'; };
const _renderHomeP3 = renderHome;
renderHome = function(){
  const r = _renderHomeP3.apply(this, arguments);
  const home = $('#home'); if(!home || typeof FX === 'undefined') return r;
  if(FX.tab === 'inicio' && !home.querySelector('.fx-mk')){
    const hd = home.querySelector('.fx-hd'); const infos = typeof fxInfos === 'function' ? fxInfos() : [];
    const cnt = {g: 0, y: 0, r: 0, n: 0}; infos.forEach(i => cnt[i.ds.k]++);
    const resp = cnt.g + cnt.y + cnt.r, mood = cnt.r ? 'serio' : resp ? 'feliz' : 'normal';
    const t = !infos.length ? 'Cuando agregues a tu primera persona, aquí te cuento cómo llega cada día.'
      : `${resp ? `Hoy respondieron ${resp} de ${infos.length}.` : 'Nadie ha respondido el chequeo todavía.'}${cnt.r ? ` ${cnt.r} en rojo: revísalos primero.` : cnt.y ? ` ${cnt.y} en amarillo.` : resp ? ' Todo en orden.' : ''}`;
    hd?.insertAdjacentHTML('afterend', `<div class="fx-mk mk-ask mk-vars">${mkMini(mkFisio(), mood)}<p>${esc(t)}</p></div>`);
  }
  if(FX.tab === 'cuenta' && !home.querySelector('.fx-mksec')){
    const m = mkFisio(), out = home.querySelector('.fx-out')?.closest('.fx-sec');
    const html = `<section class="fx-sec fx-mksec"><h2>Tu compañero</h2><div class="mk-row mk-vars">${Object.entries(MASC).map(([k, v]) => `<button type="button" data-mkf="${k}" aria-pressed="${m === k}"><span class="cel-mini">${v.svg(false)}</span><b>${v.n}</b></button>`).join('')}</div></section>`;
    out ? out.insertAdjacentHTML('beforebegin', html) : home.querySelector('.fx-page')?.insertAdjacentHTML('beforeend', html);
  }
  return r;
};
document.addEventListener('click', e => { const b = e.target.closest('[data-mkf]'); if(b){ LS.set('apex_mascota_fisio', b.dataset.mkf); renderHome(); } });
