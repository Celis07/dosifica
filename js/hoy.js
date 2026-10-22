/* ===================== PORTAL DEL DEPORTISTA · DISEÑO SEMÁFORO (oct 2026) =====================
   Estilo limpio tipo iOS. La pantalla Hoy abre con una franja del color del chequeo del día
   (verde, amarillo o rojo) que explica qué cambió en el plan; debajo va la sesión de hoy con
   un solo botón para entrenar. Lo demás vive en pestañas: Hoy, Mi plan, Progreso y Mi fisio.
   Reemplaza el renderAthlete de servidor.js y el envoltorio de chequeo.js. Los id y data-*
   de los botones son los mismos, así que los manejadores de eventos existentes siguen sirviendo. */

const H_SVG = (p, w=24, sw=1.8) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const H_ICON = {
  g: H_SVG('<path d="M6 12.5l4 4 8-9"/>', 22, 2.6),
  y: H_SVG('<path d="M12 6.5v7M12 17.5h.01"/>', 22, 2.6),
  r: H_SVG('<path d="M12 6.5v7M12 17.5h.01"/>', 22, 2.6),
  n: H_SVG('<path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6v.4M12 17.5h.01"/>', 22, 2.4),
  play: '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>',
  chev: '<svg class="chev" width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg>',
  check: H_SVG('<path d="M6 12.5l4 4 8-9"/>', 14, 3)
};
const H_TABS = [
  ['hoy', 'Hoy', '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'],
  ['plan', 'Mi plan', '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/>'],
  ['prog', 'Progreso', '<path d="M5 19V11M12 19V5M19 19v-6"/>'],
  ['fisio', 'Mi fisio', '<path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V16h.5"/>']
];
const H_TINT = {g:'#E1F5E6', y:'#FFF1C2', r:'#FFE4E1', n:'#E8E8ED'};
const H_TINT_DK = {g:'#0F2A17', y:'#2E2406', r:'#33100D', n:'#1C1C1E'};

/* ---------- Utilidades ---------- */
const hCap = s => s ? s[0].toUpperCase() + s.slice(1) : '';
const hLow = s => s ? s[0].toLowerCase() + s.slice(1) : '';
const hJoin = a => a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1];
const hISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function hFecha(){
  const d = new Date();
  return `${hCap(['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][d.getDay()])} ${d.getDate()} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][d.getMonth()]}`;
}
function hIni(n){ return (n || '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'Yo'; }
function hWeekStart(){ const d = new Date(todayISO() + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return hISO(d); }
function hDoneWeek(){ const ws = hWeekStart(), t = todayISO(); return new Set(sessions.filter(s => s.fecha >= ws && s.fecha <= t).map(s => s.dia)); }
function hPhase(c){ return (c.fase || '').split(' · ').slice(1).join(' · ') || c.fase || ''; }
function hDark(){ try { return matchMedia('(prefers-color-scheme: dark)').matches; } catch(e){ return false; } }
function hRPE(rows){
  const v = [];
  rows.forEach(r => { const m = String(r.c || '').match(/RPE\s*([\d–-]+)/); if(m) m[1].split(/[–-]/).forEach(x => { if(x !== '' && !isNaN(+x)) v.push(+x); }); });
  if(!v.length) return '';
  const lo = Math.min(...v), hi = Math.max(...v);
  return lo === hi ? `RPE ${lo}` : `RPE ${lo}–${hi}`;
}
/* Día que toca hoy: el que se registró hoy; si no, el primero sin registrar esta semana. */
function hTodayIdx(c){
  const n = (c.dias || []).length; if(!n) return 0;
  const hoy = sessions.find(s => s.fecha === todayISO());
  if(hoy){ const i = c.dias.findIndex(d => d.name === hoy.dia); if(i >= 0) return i; }
  const done = hDoneWeek(), i = c.dias.findIndex(d => !done.has(d.name));
  return i < 0 ? 0 : i;
}
/* Lo que se quitó hoy: hasta dos nombres y el resto contado */
function hQuit(q){
  if(q.length <= 2) return `Hoy quitamos ${esc(hJoin(q.map(hLow)))}`;
  return `Hoy quitamos ${q.length} ejercicios, entre ellos ${esc(hJoin(q.slice(0, 2).map(hLow)))}`;
}
/* Motivos del chequeo, en palabras del deportista */
function hWhy(wl){
  const e = (wl && wl.e) || {}, a = [];
  if(+e.sueno >= 5) a.push('sueño malo');
  if(+e.estres >= 5) a.push('estrés alto');
  if(+e.fatiga >= 5) a.push('fatiga alta');
  if(+e.dolor >= 5) a.push('dolor muscular alto');
  (e.molestias || []).filter(m => +m.i >= 4).forEach(m => {
    const lado = ZONA_LADO.includes(m.z) ? ({izq:' izquierda', der:' derecha', amb:''}[m.l] || '') : '';
    a.push(`dolor en ${hLow(ZONAS[m.z] || m.z)}${lado} (${m.i}/10)`);
  });
  return a;
}

/* ---------- Piezas ---------- */
function hRow(r, rod){
  const name = r.video ? `<a href="${esc(r.video)}" target="_blank" rel="noopener">${esc(r.e)}</a>` : esc(r.e);
  const dose = r.s && r.r ? `${r.s} × ${r.r}` : (r.s || r.r || '');
  const lado = rod && r.lado && r.lado !== 'Ambas' ? `Pierna ${String(r.lado).toLowerCase()}` : '';
  const sug = suggestion(r);
  const warn = /^Molestia/.test(r.n || '');
  return `<div class="ap-x">
    <div class="ap-xm"><span class="ap-xn">${r.ter ? '<span class="ap-ter">Terapia</span>' : ''}${name}</span>
      ${lado ? `<span class="ap-xs">${esc(lado)}</span>` : ''}
      ${r.cue ? `<span class="ap-xs">${esc(r.cue)}</span>` : ''}
      ${r.n ? `<span class="ap-xs${warn ? ' ap-warn' : ''}">${esc(r.n)}</span>` : ''}
      ${sug ? `<span class="ap-xs ap-sug">${esc(hCap(sug))}</span>` : ''}</div>
    <div class="ap-xd">${dose ? `<b>${esc(dose)}</b>` : ''}</div></div>`;
}
function hBlocks(day, k){
  const rod = (A.plan?.contenido?.modulo || 'rodilla') === 'rodilla';
  const adj = k === 'y' || k === 'r';
  const ses = day.rpe ? adjRPE('RPE ' + String(day.rpe).replace(/^RPE\s*/i, '').replace('-', '–'), k === 'r' ? -2 : k === 'y' ? -1 : 0).replace(/^RPE\s*/, '') : rpeSes(day);
  const rpeLine = ses ? `<p class="ap-rpes${adj ? ' k-' + k : ''}">Esfuerzo de la sesión <b>RPE ${esc(ses)}${adj ? ' hoy' : ''}</b></p>` : '';
  return rpeLine + `<div class="ap-list">${day.segs.filter(sg => sg.rows.length).map(sg => {
    const n = sg.rows.length, rpe = '', mark = false;
    const sub = [sg.sub, fmtLabel(sg.fmt), blkInt(sg) ? 'máxima intención' : '', `${n} ejercicio${n === 1 ? '' : 's'}`].filter(Boolean).join(', ');
    return `<details class="ap-blk"><summary>
      <span class="ap-l"><b>${esc(SEGS[sg.type] || sg.type)}</b><span>${esc(sub)}</span></span>
      <span class="ap-r">${rpe ? `<span class="ap-rpe${mark ? ' k-' + k : ''}">${esc(rpe)}${mark ? ' hoy' : ''}</span>` : ''}${H_ICON.chev}</span>
    </summary><div class="ap-ex">${sg.rows.map(r => hRow(r, rod)).join('')}</div></details>`;
  }).join('')}</div>`;
}
function hTabbar(){
  return `<nav class="ap-tabs" aria-label="Secciones">${H_TABS.map(([k, l, p]) =>
    `<button type="button" data-htab="${k}"${A.tab === k ? ' aria-current="page"' : ''}>${H_SVG(p, 24, A.tab === k ? 2 : 1.8)}<span>${l}</span></button>`).join('')}</nav>`;
}
function hPage(title, sub){ return `<header class="ap-page"><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</header>`; }

/* ---------- Marcar la sesión como hecha ----------
   Lo único obligatorio es qué tan dura fue la sesión completa (RPE 1–10). El tiempo no se pide
   (se guarda el estimado del plan) y los pesos por ejercicio son opcionales. */
const HL = {};
function hChips(k, from, to, label){
  return `<div class="wq"><div class="wql"><b>${label}</b></div><div class="${to - from > 6 ? 'wch10' : 'wch7'} ap-chips">${Array.from({length: to - from + 1}, (_, i) => i + from).map(v =>
    `<button type="button" class="wc${HL[k] === v ? ' on' : ''}" data-hl="${k}|${v}" aria-pressed="${HL[k] === v}">${v}</button>`).join('')}</div></div>`;
}
function hLog(day, di){
  const c = A.plan?.contenido || {}, rod = (c.modulo || 'rodilla') === 'rodilla', lum = c.modulo === 'lumbar', zr = c.rehab?.zona;
  const ex = []; day.segs.forEach(sg => sg.rows.forEach(r => { if(isLoggable(sg, r)) ex.push(r); }));
  const est = typeof tDay === 'function' ? Math.round(tDay(day).total) : '';
  return `<div class="ap-logq" id="logf">
    <h3>¿Hiciste la sesión?</h3>
    <p class="ap-muted">Márcala aunque te hayas demorado o no alcanzaras a hacer todo.</p>
    <input type="hidden" id="lf-fecha" value="${todayISO()}"><input type="hidden" id="lf-min" value="${est}"><input type="hidden" id="lf-d24" value="">
    <input type="hidden" id="lf-srpe" value="${HL.srpe ?? ''}"><input type="hidden" id="lf-dolor" value="${HL.dolor ?? ''}">
    ${hChips('srpe', 1, 10, '¿Qué tan dura fue la sesión completa? (1–10)')}
    ${rod || lum || c.rehab ? hChips('dolor', 0, 10, `Dolor ${lum ? 'de espalda' : rod ? 'de rodilla' : zr ? 'del ' + zr : 'de la lesión'} durante la sesión (opcional)`) : ''}
    ${ex.length ? `<details class="ap-more"><summary>Agregar pesos por ejercicio (opcional)</summary><div class="ap-exl">${ex.map((r, k) => `<div class="ap-exr"><b>${esc(r.e)}</b>
      <label class="f">kg<input type="number" inputmode="decimal" step="0.5" data-lx="${k}" data-lf="kg"></label>
      <label class="f">Reps<input type="number" inputmode="numeric" data-lx="${k}" data-lf="reps"></label>
      <label class="f">RPE<input type="number" inputmode="numeric" min="1" max="10" data-lx="${k}" data-lf="rpe"></label></div>`).join('')}</div></details>` : ''}
    <label class="f">Comentario (opcional)<input type="text" id="lf-nota" maxlength="300" placeholder="Algo que tu fisioterapeuta deba saber"></label>
    <div class="actions"><button class="primary" id="aSave">Marcar como hecha</button><button id="aCancel">Cancelar</button></div>
  </div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-hl]');
  if(b){ const [k, v] = b.dataset.hl.split('|'); HL[k] = +v; const inp = $('#lf-' + k); if(inp) inp.value = v;
    b.parentElement.querySelectorAll('.wc').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); return; }
  if(e.target.closest('#athleteApp #aSave') && !($('#lf-srpe')?.value)){ e.stopImmediatePropagation(); e.preventDefault(); toast('Elige qué tan dura fue la sesión (1–10).'); }
}, true);
document.addEventListener('click', e => { if(e.target.closest('#athleteApp [data-alog]')) Object.keys(HL).forEach(k => delete HL[k]); }, true);

/* ---------- Pestaña Hoy ---------- */
function hHoy(c){
  const hasW = wellness.some(x => x.fecha === todayISO());
  const wl = hasW ? todayLight() : null, k = wl ? wl.c : 'n';
  const why = wl ? hWhy(wl) : [], whyTxt = why.length ? `Hoy reportas ${hJoin(why)}. ` : (k === 'y' || k === 'r' ? 'Hoy llegas más cargado de lo normal para ti. ' : '');
  const H = {
    n: ['Tu chequeo de hoy', 'Sueño, estrés, fatiga y dolor: 30 segundos. Con eso ajustamos tu plan de hoy.'],
    g: ['Día verde', 'Llegas bien. Entrena tu plan completo.'],
    y: ['Día amarillo', whyTxt + 'Bajamos 1 punto de RPE: hoy no subas peso.'],
    r: ['Día rojo', whyTxt + 'Tu plan de hoy viene recortado y sin saltos. Tu fisioterapeuta recibe un aviso.']
  }[k];
  const hero = `<header class="ap-hero s-${k}">
    <div class="ap-top"><span class="ap-date">${esc(hFecha())}</span><button type="button" class="ap-avatar" data-htab="fisio" aria-label="Mi cuenta">${esc(hIni(A.p?.nombre))}</button></div>
    <div class="ap-state"><span class="ap-dot" aria-hidden="true">${H_ICON[k]}</span><h1>${H[0]}</h1><p>${esc(H[1])}</p>
      ${A.wOpen ? '' : k === 'n' ? '<button type="button" class="ap-btn ap-primary" id="awOpen">Responder chequeo</button>' : '<button type="button" class="ap-link" id="awOpen">Editar chequeo</button>'}</div>
  </header>`;
  const form = A.wOpen ? `<section class="ap-card ap-form">${wellForm('aw')}</section>` : '';

  const n = (c.dias || []).length;
  if(A.day == null || A.day >= n) A.day = hTodayIdx(c);
  const di = A.day, orig = c.dias[di];
  if(!orig) return hero + `<div class="ap-body">${form}<section class="ap-card"><p>Tu plan no tiene sesiones esta semana.</p></section></div>`;
  const res = (k === 'y' || k === 'r') ? adjustDay(orig, wl) : {day: orig, info: null};
  const day = res.day, done = hDoneWeek();
  const quit = [];
  orig.segs.forEach((sg, gi) => { const keep = new Set(((day.segs[gi] || {}).rows || []).map(r => r.e)); sg.rows.forEach(r => { if(!keep.has(r.e)) quit.push(r.e); }); });
  const marc = day.segs.reduce((a, sg) => a + sg.rows.filter(r => /^Molestia/.test(r.n || '')).length, 0);
  const vivo = c.vivo !== false, hoyHecho = sessions.some(s => s.fecha === todayISO() && s.dia === orig.name);
  const seg = n > 1 ? `<div class="ap-seg" role="group" aria-label="Elegir sesión">${c.dias.map((d, i) =>
    `<button type="button" data-hday="${i}" aria-pressed="${i === di}">${done.has(d.name) ? `<span class="ap-ok" aria-label="hecha">${H_ICON.check}</span>` : ''}${esc(d.name)}</button>`).join('')}</div>` : '';
  const nota = k === 'r' && quit.length
    ? `<p class="ap-note">${hQuit([...new Set(quit)])}: son de potencia o cargan la zona que te duele. En Mi plan ves la sesión completa.</p>`
    : k === 'y' && marc ? `<p class="ap-note">Marcamos ${marc} ejercicio${marc > 1 ? 's' : ''} por tu molestia. Si duele más de 3/10, cámbialo o sáltalo hoy.</p>` : '';
  const log = A.open === di ? `<section class="ap-card ap-log">${hLog(orig, di)}</section>` : '';
  const session = `<section class="ap-sec">
    ${seg}
    <div class="ap-head"><h2>${esc(orig.name)}</h2><span>Semana ${esc(c.semana)}, ${esc(hLow(hPhase(c)))}</span></div>
    ${hoyHecho ? `<p class="ap-done">${H_ICON.check} Ya registraste esta sesión hoy.</p>` : ''}
    ${vivo ? `<button type="button" class="ap-btn ap-primary" data-live="${di}">${H_ICON.play}Entrenar en vivo</button>`
           : `<button type="button" class="ap-btn ap-primary" data-alog="${di}">${A.open === di ? 'Cerrar' : 'Marcar sesión como hecha'}</button>`}
    ${log}
    ${hBlocks(day, k)}
    ${nota}
    ${vivo ? `<button type="button" class="ap-btn ap-plain" data-alog="${di}">${A.open === di ? 'Cerrar' : 'Ya la hice: marcarla como hecha'}</button>` : ''}
  </section>`;
  const d24 = d24Card();
  return hero + `<div class="ap-body">${form}${session}${d24}${pushCard()}</div>`;
}

/* ---------- Pestaña Mi plan ---------- */
function hPlan(c){
  const rod = (c.modulo || 'rodilla') === 'rodilla', done = hDoneWeek();
  const regla = c.rehab?.regla ? c.rehab.regla : c.modulo === 'lumbar'
    ? 'Dolor de espalda hasta 3/10 durante el ejercicio y al día siguiente igual o mejor: vas bien. Entre 4 y 5: mantén la carga. Más de 5, peor al día siguiente o si el dolor baja hacia la pierna: baja la carga, cambia ese ejercicio y avísale a tu fisioterapeuta. Moverte y caminar ayuda; el reposo no.'
    : rod ? 'Dolor hasta 3/10 durante el ejercicio y al día siguiente igual o mejor: vas bien. Entre 4 y 5: mantén la carga. Más de 5 o peor al día siguiente: baja la carga y avísale a tu fisioterapeuta.'
    : 'Elige el peso para quedar en el RPE indicado. Si te sobra, sube un poco la próxima vez; si no llegas a las repeticiones, bájalo. "Máx. intención" es cada repetición lo más rápido y explosivo posible, sin llegar a cansarte.';
  const weeks = (c.semanas || []).length ? `<section class="ap-sec"><div class="ap-head"><h2>Próximas semanas</h2></div><div class="ap-list">${c.semanas.map((x, i) =>
    `<div class="ap-row"><span class="ap-l"><b>Semana ${esc(x.w)}${i === 0 ? ' (esta)' : ''}</b><span>${esc(hCap(x.l || ''))}${(x.t || []).map(t => `, ${esc(t.n || 'torneo')} el ${esc(fmtD(t.f))}`).join('')}</span></span><span class="ap-muted">${esc(fmtD(x.ini))}</span></div>`).join('')}</div></section>` : '';
  return hPage('Mi plan', `Semana ${c.semana}${c.meso?.l ? ', ' + hLow(c.meso.l) : ''}`) + `<div class="ap-body">
    <section class="ap-card"><h3>${esc(hCap(hPhase(c)))}</h3>${c.objetivo ? `<p>${esc(c.objetivo)}</p>` : ''}${c.evitar ? `<p class="ap-muted"><b>Evita por ahora:</b> ${esc(c.evitar)}</p>` : ''}</section>
    ${(c.dias || []).map(d => `<section class="ap-sec"><div class="ap-head"><h2>${esc(d.name)}</h2>${done.has(d.name) ? `<span class="ap-done">${H_ICON.check} Hecha esta semana</span>` : ''}</div>${hBlocks(d, 'n')}</section>`).join('')}
    ${weeks}
    <section class="ap-sec"><div class="ap-head"><h2>${rod || c.modulo === 'lumbar' || c.rehab ? 'Regla de dolor' : 'Cómo dosificar'}</h2></div>
      <div class="ap-card"><p>${esc(regla)}</p>${c.rehab ? `<p>Elige el peso para quedar en el RPE indicado. "Máx. intención" es cada repetición lo más rápido posible, sin llegar a cansarte. Los ejercicios marcados como terapia no se saltan.</p>` : ''}<p class="ap-muted">RPE 8 es que podrías hacer 2 repeticiones más. RPE 7, que podrías hacer 3 más.</p>
      ${c.tools?.length ? `<ul>${c.tools.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div></section>
  </div>`;
}

/* ---------- Pestaña Progreso ---------- */
function hProg(c){
  const mine = sessions.slice().sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  const d28 = hISO(new Date(Date.now() - 27 * 864e5)), last = mine.filter(s => s.fecha >= d28);
  const pains = last.filter(s => s.dolor != null).map(s => +s.dolor);
  const avg = pains.length ? (pains.reduce((a, b) => a + b, 0) / pains.length).toFixed(1).replace('.', ',') : '—';
  const nWeek = hDoneWeek().size, nPlan = (c.dias || []).length;
  const D24 = {mejor:'mejor al día siguiente', igual:'igual al día siguiente', peor:'peor al día siguiente'};
  const list = mine.length ? `<div class="ap-list">${mine.map(x => `<div class="ap-row">
      <span class="ap-l"><b>${esc(fmtD(x.fecha))}${x.dia ? ', ' + esc(hLow(x.dia)) : ''}${x._local ? ' <span class="ap-pill y">Por enviar</span>' : ''}</b>
      <span>${esc([x.min != null ? x.min + ' min' : '', x.srpe != null ? 'RPE ' + x.srpe : '', x.dolor != null ? 'dolor ' + x.dolor + '/10' : '', D24[x.d24] || ''].filter(Boolean).join(', '))}</span></span>
      ${x.autor === 'deportista' ? `<button type="button" class="ap-del" data-adel="${esc(x.id)}" aria-label="Borrar la sesión del ${esc(fmtD(x.fecha))}">Borrar</button>` : ''}</div>`).join('')}</div>`
    : '<div class="ap-card"><p class="ap-muted">Aún no registras sesiones. Cuando entrenes, aparecen aquí.</p></div>';
  return hPage('Progreso', nPlan ? `${nWeek} de ${nPlan} sesiones esta semana` : '') + `<div class="ap-body">
    <div class="ap-stats"><div><b>${nWeek}/${nPlan}</b><span>esta semana</span></div><div><b>${last.length}</b><span>en 4 semanas</span></div><div><b>${avg}</b><span>dolor promedio</span></div></div>
    <section class="ap-sec"><div class="ap-head"><h2>Mis sesiones</h2></div>${list}</section></div>`;
}

/* ---------- Pestaña Mi fisio ---------- */
function hFisio(){
  const est = {pendiente:'<span class="ap-pill y">Pendiente</span>', aprobada:'<span class="ap-pill g">Aprobada</span>', rechazada:'<span class="ap-pill r">Rechazada</span>'};
  const req = A.reqOpen
    ? `<div class="ap-card"><label class="f">¿Qué necesitas cambiar y por qué?<textarea id="aReqTxt" maxlength="2000" placeholder="Ej.: la sentadilla búlgara me da dolor 6/10 en la rótula"></textarea></label>
       <div class="ap-acts"><button type="button" class="ap-btn ap-primary" id="aReqSend">Enviar</button><button type="button" class="ap-btn ap-plain" id="aReqCancel">Cancelar</button></div></div>`
    : `<div class="ap-card"><p>¿Un ejercicio te duele o no tienes el material? Cuéntale a tu fisioterapeuta y te responde aquí.</p><button type="button" class="ap-btn ap-secondary" id="aReq">Pedir un cambio</button></div>`;
  const reqs = solicitudes.length ? `<div class="ap-list">${solicitudes.map(r => `<div class="ap-row ap-req"><span class="ap-l">
      <span class="ap-reqh">${est[r.estado] || ''}<span class="ap-muted">${esc(fmtD((r.created_at || '').slice(0, 10)))}</span></span>
      <b class="ap-reqt">${esc(r.texto)}</b>${r.respuesta ? `<span>Respuesta: ${esc(r.respuesta)}</span>` : ''}</span></div>`).join('')}</div>` : '';
  return hPage('Mi fisio', 'Fisioterapeuta Manuel Celis') + `<div class="ap-body">
    <section class="ap-sec"><div class="ap-head"><h2>Cambios en tu plan</h2></div>${req}${reqs}</section>
    ${avisosSec()}
    <section class="ap-sec"><div class="ap-head"><h2>Cuenta</h2></div><div class="ap-list">
      <div class="ap-row"><span class="ap-l"><b>${esc(A.p?.nombre || 'Deportista')}</b><span>${esc(me.email || '')}</span></span></div>
      <button type="button" class="ap-row ap-out" id="aOut">Cerrar sesión</button></div></section>
    <p class="ap-foot">Tus datos solo los ves tú y tu fisioterapeuta.</p></div>`;
}

/* ---------- Pintado ---------- */
renderAthlete = function(){
  const el = $('#athleteApp'), c = A.plan?.contenido;
  el.classList.add('ath2'); document.body.classList.add('ath2b');
  A.tab = A.tab || 'hoy';
  let html, k = 'n';
  if(!A.consent){
    html = hPage(`Hola${A.p?.nombre ? ', ' + A.p.nombre.split(' ')[0] : ''}`, '') + `<div class="ap-body">${consentGate()}</div>`;
  } else if(!c){
    html = hPage(`Hola${A.p?.nombre ? ', ' + A.p.nombre.split(' ')[0] : ''}`, '') + `<div class="ap-body"><div class="ap-card"><p>Tu fisioterapeuta aún no publica tu plan. Cuando lo haga, aparece aquí.</p></div>
      <div class="ap-list"><button type="button" class="ap-row ap-out" id="aOut">Cerrar sesión</button></div></div>`;
  } else {
    const body = {hoy: hHoy, plan: hPlan, prog: hProg, fisio: hFisio}[A.tab] || hHoy;
    html = body(c) + hTabbar();
    if(A.tab === 'hoy'){ const hasW = wellness.some(x => x.fecha === todayISO()); const wl = hasW ? todayLight() : null; k = wl ? wl.c : 'n'; }
    else k = 'page';
  }
  el.innerHTML = html;
  el.classList.toggle('has-tabs', !!(A.consent && c));
  document.querySelectorAll('meta[name="theme-color"]').forEach(tc => { const dk = /dark/.test(tc.getAttribute('media') || '');
    tc.setAttribute('content', k === 'page' ? (dk ? '#000000' : '#F2F2F7') : (dk ? H_TINT_DK : H_TINT)[k]); });
  // Chequeo obligatorio antes de entrenar en vivo: al guardarlo, arranca la sesión que se pidió.
  if(A.pendLive != null && wellness.some(x => x.fecha === todayISO()) && !A.wOpen){ const di = A.pendLive; A.pendLive = null; setTimeout(() => startLive(di), 50); }
};

$('#athleteApp').addEventListener('click', e => {
  let b;
  if((b = e.target.closest('[data-htab]'))){ const t = b.dataset.htab; if(t !== A.tab){ A.tab = t; A.open = null; A.reqOpen = false; renderAthlete(); window.scrollTo(0, 0); } return; }
  if((b = e.target.closest('[data-hday]'))){ A.day = +b.dataset.hday; A.open = null; renderAthlete(); }
});
/* El chequeo pide primero el formulario: llevarlo a la vista en la pestaña Hoy. */
const _startLiveH = startLive;
startLive = function(di){
  if(!wellness.some(x => x.fecha === todayISO()) && A.tab !== 'hoy'){ A.tab = 'hoy'; }
  _startLiveH(di);
};
