/* ===================== PORTAL DEL DEPORTISTA · MÁS CONTENIDO (oct 2026) =====================
   Progreso: hitos de la fase, gráficas (fuerza, dolor, bienestar, carga), récords, rachas y logros.
   Aprende (pestaña nueva): sus ejercicios con video y claves, y lecciones cortas con fuente.
   Mi fisio: chat en ambos sentidos y videos de técnica para que el fisio los revise.
   Panel del fisio: conversación con cada paciente, aviso de mensajes nuevos y revisión de videos. */

/* ---------- Utilidades ---------- */
const PX = {
  fmtN: (v, d=1) => (Math.round(v * 10**d) / 10**d).toString().replace('.', ','),
  day: iso => new Date(iso + 'T12:00:00'),
  addD: (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); },
  mon: iso => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay()+6)%7)); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
};
const P_ICON = {
  play: '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>',
  cam: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 10l5-3v10l-5-3z"/><rect x="3" y="6" width="12" height="12" rx="2"/></svg>',
  ok: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12.5l4 4 8-9"/></svg>',
  no: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  send: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};

/* ===================== HITOS (se publican con el plan) ===================== */
function hitosDe(s){
  try{
    const P0 = P[pkey(s)], i = phaseIdx(s), ph = P0.phases[i];
    const ids = [...(ph.next || []), ...((ph.extra && ph.extra.list) || [])].filter((id, k, a) => CR[id] && a.indexOf(id) === k);
    if(!ids.length) return null;
    const sig = P0.phases[i+1] ? P0.phases[i+1].name.split(' · ').slice(1).join(' · ') || P0.phases[i+1].name : 'el alta';
    return {label: ph.nextLabel || 'Para pasar a la siguiente fase', sig, items: ids.map(id => ({t: CR[id].t, v: critVal(id, s)}))};
  }catch(e){ return null; }
}

/* ===================== GRÁFICAS (SVG, una serie por gráfica) ===================== */
function pxLine(pts, o){
  // pts: [{x:'2026-10-01', y:Number, tip:'texto'}], ordenados por fecha
  if(pts.length < 2) return `<p class="ap-muted px-empty">${esc(o.empty || 'Aún hay pocos datos para una gráfica.')}</p>`;
  const W = 340, H = 168, L = 34, R = 14, T = 14, B = 26;
  const x0 = PX.day(pts[0].x).getTime(), x1 = PX.day(pts[pts.length-1].x).getTime(), dx = Math.max(1, x1 - x0);
  let lo = o.min != null ? o.min : Math.min(...pts.map(p => p.y)), hi = o.max != null ? o.max : Math.max(...pts.map(p => p.y));
  if(o.min == null){ const pad = (hi - lo) * .15 || Math.max(1, hi * .1); lo = Math.max(0, lo - pad); hi = hi + pad; }
  const X = d => L + (PX.day(d).getTime() - x0) / dx * (W - L - R), Y = v => T + (1 - (v - lo) / ((hi - lo) || 1)) * (H - T - B);
  const ticks = [lo, (lo + hi) / 2, hi];
  const path = pts.map((p, k) => `${k ? 'L' : 'M'}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(' ');
  const last = pts[pts.length-1];
  return `<figure class="px-fig"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.aria || '')}">
    ${ticks.map(t => `<line class="px-grid" x1="${L}" x2="${W-R}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}"/><text class="px-tick" x="${L-6}" y="${(Y(t)+4).toFixed(1)}" text-anchor="end">${esc(PX.fmtN(t, o.dec ?? 0))}</text>`).join('')}
    <text class="px-tick" x="${L}" y="${H-6}">${esc(fmtD(pts[0].x))}</text><text class="px-tick" x="${W-R}" y="${H-6}" text-anchor="end">${esc(fmtD(last.x))}</text>
    <path class="px-line" d="${path}"/>
    ${pts.map(p => `<circle class="px-dot" cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="4.5"/><circle class="px-hit" cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="16" data-tip="${esc(p.tip)}" tabindex="0"><title>${esc(p.tip)}</title></circle>`).join('')}
    <text class="px-last" x="${Math.min(W-R, X(last.x)).toFixed(1)}" y="${(Y(last.y)-10).toFixed(1)}" text-anchor="end">${esc(PX.fmtN(last.y, o.dec ?? 1))}${esc(o.unit || '')}</text>
  </svg><figcaption class="px-cap" aria-live="polite">${esc(o.cap || 'Toca un punto para ver el dato.')}</figcaption></figure>`;
}
function pxBars(rows, o){
  // rows: [{lab:'S12', v:Number, tip}]
  if(!rows.some(r => r.v > 0)) return `<p class="ap-muted px-empty">${esc(o.empty || 'Aún no hay datos.')}</p>`;
  const W = 340, H = 168, L = 34, R = 8, T = 16, B = 24, n = rows.length, gap = 6;
  const bw = (W - L - R - gap*(n-1)) / n, hi = Math.max(...rows.map(r => r.v)) * 1.12;
  const Y = v => T + (1 - v / hi) * (H - T - B);
  return `<figure class="px-fig"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.aria || '')}">
    ${[0, hi/2].map(t => `<line class="px-grid" x1="${L}" x2="${W-R}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}"/><text class="px-tick" x="${L-6}" y="${(Y(t)+4).toFixed(1)}" text-anchor="end">${Math.round(t)}</text>`).join('')}
    ${rows.map((r, k) => { const x = L + k*(bw+gap), y = Y(r.v), h = Math.max(0, H - B - y);
      return `<rect class="px-bar${k === n-1 ? ' now' : ''}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="4"/>
        <rect class="px-hit" x="${x.toFixed(1)}" y="${T}" width="${bw.toFixed(1)}" height="${H-T-B}" data-tip="${esc(r.tip)}" tabindex="0"><title>${esc(r.tip)}</title></rect>
        ${(k === n-1 || (n-1-k) % 2 === 0) ? `<text class="px-tick" x="${(x+bw/2).toFixed(1)}" y="${H-7}" text-anchor="middle">${esc(r.lab)}</text>` : ''}`; }).join('')}
  </svg><figcaption class="px-cap" aria-live="polite">${esc(o.cap || 'Toca una barra para ver el dato.')}</figcaption></figure>`;
}

/* ---------- Datos de fuerza ---------- */
function pxLifts(){
  // mejor serie (más kg) por ejercicio y sesión
  const by = {};
  sessions.forEach(s => (s.ex || []).forEach(x => { const kg = num(x.kg); if(kg == null || kg <= 0 || !x.e) return;
    const k = x.e, row = {x: s.fecha, kg, reps: num(x.reps), rpe: num(x.rpe)};
    const arr = by[k] || (by[k] = []); const same = arr.find(p => p.x === s.fecha);
    if(!same) arr.push(row); else if(kg > same.kg || (kg === same.kg && (row.reps || 0) > (same.reps || 0))) Object.assign(same, row); }));
  Object.values(by).forEach(a => a.sort((p, q) => p.x.localeCompare(q.x)));
  return by;
}
function pxRecords(lifts){
  const wk = PX.addD(todayISO(), -7);
  return Object.entries(lifts).map(([e, a]) => {
    const best = a.reduce((m, p) => (!m || p.kg > m.kg || (p.kg === m.kg && (p.reps||0) > (m.reps||0))) ? p : m, null);
    const prevBest = a.filter(p => p.x < best.x).reduce((m, p) => Math.max(m, p.kg), 0);
    return {e, best, n: a.length, nuevo: best.x >= wk && prevBest > 0 && best.kg > prevBest, sube: prevBest ? best.kg - prevBest : 0};
  }).sort((a, b) => b.n - a.n);
}

/* ---------- Rachas y logros ---------- */
function pxStreaks(c){
  const planned = Math.max(1, (c.dias || []).length);
  const W = typeof adWeeks === 'function' ? adWeeks(sessions, planned, (A.plan?.publicado_at || '').slice(0, 10)) : {racha:0, total:0, hist:[]};
  const days = new Set(wellness.map(w => w.fecha)); let chk = 0, d = days.has(todayISO()) ? todayISO() : PX.addD(todayISO(), -1);
  while(days.has(d)){ chk++; d = PX.addD(d, -1); }
  const best = W.hist.reduce((acc, h) => { acc.cur = h.ok ? acc.cur + 1 : (h.now ? acc.cur : 0); acc.max = Math.max(acc.max, acc.cur); return acc; }, {cur:0, max:0}).max;
  return {sem: W.racha, semMax: Math.max(best, W.racha), semTot: W.total, chk, ses: sessions.length};
}
function pxLogros(st, recs){
  const nRec = recs.filter(r => r.n >= 2 && r.sube > 0).length;
  return [
    ['Primera sesión', 'Registraste tu primera sesión.', st.ses >= 1],
    ['10 sesiones', 'Diez sesiones registradas.', st.ses >= 10],
    ['25 sesiones', 'Veinticinco sesiones: ya es un hábito.', st.ses >= 25],
    ['50 sesiones', 'Cincuenta sesiones registradas.', st.ses >= 50],
    ['Semana cumplida', 'Hiciste todas las sesiones de una semana.', st.semTot >= 1],
    ['4 semanas seguidas', 'Un mes completo sin fallar.', st.semMax >= 4],
    ['8 semanas seguidas', 'Dos meses de constancia.', st.semMax >= 8],
    ['7 chequeos seguidos', 'Una semana completa de chequeo diario.', st.chk >= 7],
    ['Primer récord', 'Superaste tu mejor marca en un ejercicio.', nRec >= 1],
    ['5 récords', 'Mejoraste tu marca en cinco ejercicios.', nRec >= 5]
  ];
}

/* ---------- Pestaña Progreso ---------- */
A.pg = A.pg || 'fuerza';
function pxProgreso(c){
  const lifts = pxLifts(), recs = pxRecords(lifts), st = pxStreaks(c), log = pxLogros(st, recs);
  // Hitos
  let hit = '';
  if(c.hitos && c.hitos.items && c.hitos.items.length){
    const ok = c.hitos.items.filter(x => x.v === true).length;
    hit = `<section class="ap-sec"><div class="ap-head"><h2>Hitos de tu fase</h2></div><div class="ap-card px-hitos">
      <p class="px-hl"><b>${ok} de ${c.hitos.items.length}</b> para pasar a ${esc(hLow(c.hitos.sig || 'la siguiente fase'))}</p>
      <div class="px-bar-p" aria-hidden="true"><i style="width:${Math.round(ok / c.hitos.items.length * 100)}%"></i></div>
      <ul class="px-hlist">${c.hitos.items.map(x => `<li class="${x.v === true ? 'ok' : x.v === false ? 'no' : 'nd'}"><span class="px-hic">${x.v === true ? P_ICON.ok : x.v === false ? P_ICON.no : '·'}</span><span>${esc(x.t)}${x.v == null ? ' <i>(lo evalúa tu fisio)</i>' : ''}</span></li>`).join('')}</ul>
      <p class="ap-muted px-small">Estado según la última evaluación de tu fisioterapeuta. Pasar de fase depende de cumplirlos, no solo del tiempo.</p></div></section>`;
  } else {
    const nt = (c.semanas || []).flatMap(w => (w.t || []).map(t => ({...t, w: w.w}))).find(t => t.f >= todayISO());
    if(nt){ const dd = Math.round((PX.day(nt.f) - PX.day(todayISO())) / 864e5);
      hit = `<section class="ap-sec"><div class="ap-head"><h2>Próximo torneo</h2></div><div class="ap-card px-count"><b>${dd}</b><span>${dd === 1 ? 'día' : 'días'} para ${esc(nt.n || 'el torneo')} · ${esc(fmtD(nt.f))}</span></div></section>`; }
  }
  // Gráficas
  const opts = Object.keys(lifts).filter(k => lifts[k].length >= 2).sort((a, b) => lifts[b].length - lifts[a].length);
  if(!A.pgEx || !lifts[A.pgEx]) A.pgEx = opts[0] || null;
  let chart = '';
  if(A.pg === 'fuerza'){
    if(!opts.length) chart = `<p class="ap-muted px-empty">Cuando registres el peso de un ejercicio en dos sesiones o más, aquí ves cómo sube.</p>`;
    else { const a = lifts[A.pgEx], f = a[0], l = a[a.length-1], d = l.kg - f.kg;
      chart = `<label class="px-sel"><span>Ejercicio</span><select data-pgexsel aria-label="Ejercicio">${opts.slice(0, 12).map(k => `<option${k === A.pgEx ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select></label>
        <p class="px-delta">${d > 0 ? `<b>+${esc(PX.fmtN(d))} kg</b> desde ${esc(fmtD(f.x))}${f.kg ? ` (+${Math.round(d / f.kg * 100)} %)` : ''}` : d < 0 ? `${esc(PX.fmtN(d))} kg desde ${esc(fmtD(f.x))}` : `Mismo peso desde ${esc(fmtD(f.x))}`}</p>
        ${pxLine(a.map(p => ({x: p.x, y: p.kg, tip: `${fmtD(p.x)}: ${PX.fmtN(p.kg)} kg${p.reps ? ' × ' + p.reps : ''}${p.rpe ? ' a RPE ' + p.rpe : ''}`})), {unit:' kg', aria:`Peso en ${A.pgEx}`, dec:1})}`; }
  } else if(A.pg === 'dolor'){
    const pts = sessions.filter(s => s.dolor != null && s.fecha).slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(-24)
      .map(s => ({x: s.fecha, y: +s.dolor, tip: `${fmtD(s.fecha)}: dolor ${s.dolor}/10${s.dia ? ' · ' + s.dia : ''}`}));
    chart = `<p class="px-delta">Dolor durante el entrenamiento (0 a 10). Hasta 3 es la zona en la que puedes progresar.</p>${pxLine(pts, {min:0, max:10, unit:'/10', aria:'Dolor por sesión', dec:0, empty:'Registra el dolor en tus sesiones para ver la tendencia.'})}`;
  } else if(A.pg === 'bien'){
    const pts = wellness.filter(w => w.fecha).slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(-30)
      .map(w => { const t = (+w.sueno||0)+(+w.estres||0)+(+w.fatiga||0)+(+w.dolor||0); return {x: w.fecha, y: t, tip: `${fmtD(w.fecha)}: ${t}/28 (sueño ${w.sueno}, estrés ${w.estres}, fatiga ${w.fatiga}, dolor muscular ${w.dolor})`}; });
    chart = `<p class="px-delta">Puntaje del chequeo diario: más bajo es mejor (4 = todo muy bien, 28 = todo muy mal).</p>${pxLine(pts, {min:4, max:28, unit:'', aria:'Bienestar diario', dec:0, empty:'Haz tu chequeo diario unos días para ver la tendencia.'})}`;
  } else {
    const ws = []; for(let k = 7; k >= 0; k--) ws.push(PX.addD(PX.mon(todayISO()), -7*k));
    const rows = ws.map((w, k) => { const ss = sessions.filter(s => s.fecha >= w && s.fecha < PX.addD(w, 7)); const v = ss.reduce((a, s) => a + (num(s.min)||0)*(num(s.srpe)||0), 0);
      return {lab: k === ws.length-1 ? 'Esta' : fmtD(w).split(' ')[0] + ' ' + fmtD(w).split(' ')[1], v, tip: `Semana del ${fmtD(w)}: ${Math.round(v)} (${ss.length} sesiones)`}; });
    chart = `<p class="px-delta">Carga de cada semana: minutos × RPE de la sesión. Sirve para ver que la carga suba de a poco y baje en las descargas.</p>${pxBars(rows, {aria:'Carga semanal', empty:'Registra minutos y RPE de tus sesiones para ver tu carga.'})}`;
  }
  const seg = [['fuerza','Fuerza'],['dolor','Dolor'],['bien','Bienestar'],['carga','Carga']];
  const graf = `<section class="ap-sec"><div class="ap-head"><h2>Mi evolución</h2></div><div class="ap-card px-card">
    <div class="ap-seg" role="group" aria-label="Gráfica">${seg.map(([k, l]) => `<button type="button" data-pg="${k}" aria-pressed="${A.pg === k}">${l}</button>`).join('')}</div>${chart}</div></section>`;
  // Récords
  const rec = recs.length ? `<section class="ap-sec"><div class="ap-head"><h2>Mis mejores marcas</h2></div><div class="ap-list">${recs.slice(0, 10).map(r =>
    `<div class="ap-row"><span class="ap-l"><b>${esc(r.e)}${r.nuevo ? ' <span class="ap-pill g">Nuevo récord</span>' : ''}</b><span>${esc(fmtD(r.best.x))}${r.sube > 0 ? ` · +${esc(PX.fmtN(r.sube))} kg sobre la marca anterior` : ''}</span></span>
      <span class="px-rec">${esc(PX.fmtN(r.best.kg))} kg${r.best.reps ? ` × ${r.best.reps}` : ''}</span></div>`).join('')}</div></section>` : '';
  // Rachas y logros
  const got = log.filter(l => l[2]).length;
  const racha = `<section class="ap-sec"><div class="ap-head"><h2>Rachas</h2></div><div class="ap-stats">
      <div><b>${st.sem}</b><span>semanas seguidas cumplidas</span></div><div><b>${st.chk}</b><span>días seguidos con chequeo</span></div><div><b>${st.ses}</b><span>sesiones en total</span></div></div></section>
    <section class="ap-sec"><div class="ap-head"><h2>Logros</h2><span class="ap-muted">${got} de ${log.length}</span></div><div class="px-logros">${log.map(([t, d, ok]) =>
      `<div class="px-logro${ok ? ' ok' : ''}"><span class="px-lic" aria-hidden="true">${ok ? P_ICON.ok : ''}</span><b>${esc(t)}</b><span>${esc(d)}</span><span class="sr">${ok ? 'Conseguido' : 'Pendiente'}</span></div>`).join('')}</div></section>`;
  return hit + graf + rec + racha;
}

/* ===================== APRENDE ===================== */
const LECC = [
  {id:'rpe', para:()=>true, t:'Cómo elegir el peso: el RPE', min:2, p:[
    'El RPE (de 1 a 10) dice qué tan cerca terminaste del límite: RPE 10 es que no podías hacer ni una repetición más; RPE 9, que te quedaba 1; RPE 8, que te quedaban 2; RPE 7, que te quedaban 3.',
    'Elige el peso para terminar cada serie en el RPE que dice tu plan. Si quedó más fácil, la próxima vez sube un poco (2,5 a 5 %). Si no llegaste a las repeticiones, bájalo.',
    'Al principio es normal equivocarse. En pocas semanas lo calibras y el plan se vuelve más preciso que con pesos fijos, porque se ajusta a cómo llegas cada día.'],
    f:'Helms ER, Cronin J, Storey A, Zourdos MC. Strength Cond J. 2016;38(4):42-49.'},
  {id:'dolor', para:c=>(c.modulo||'rodilla')==='rodilla'||c.modulo==='lumbar'||!!c.rehab, t:'Dolor durante el ejercicio: cuándo seguir', min:3, p:[
    'Sentir algo de dolor mientras entrenas no significa que te estés haciendo daño. En lesiones de tendón y en dolor que lleva tiempo, entrenar con un dolor tolerable funciona igual o algo mejor a corto plazo que evitarlo por completo.',
    'La regla de tu plan: hasta 3 de 10 durante el ejercicio y al día siguiente igual o mejor, vas bien. Entre 4 y 5, mantén la carga. Más de 5, o si amaneces peor, baja la carga y cuéntaselo a tu fisioterapeuta.',
    'Para y avisa si aparece un dolor agudo o punzante, hinchazón nueva, sensación de que la articulación se va, o adormecimiento.'],
    f:'Silbernagel KG, et al. Am J Sports Med. 2007;35(6):897-906 · Smith BE, et al. Br J Sports Med. 2017;51(23):1679-1687.'},
  {id:'sueno', para:()=>true, t:'Dormir también es entrenar', min:2, p:[
    'Los adultos necesitan dormir 7 horas o más; quien entrena fuerte suele necesitar más. En deportistas jóvenes, dormir menos de 8 horas se asoció con 1,7 veces más lesiones.',
    'Lo que más ayuda: la misma hora para acostarte y levantarte, el celular lejos 30 a 60 minutos antes, el cuarto oscuro y fresco, y nada de café en la tarde (la cafeína hasta 6 horas antes de dormir empeora el sueño).',
    'Si dormiste muy mal, tu chequeo del día baja la carga automáticamente. No es perder el día: es entrenar con lo que tienes.'],
    f:'Watson NF, et al. Sleep. 2015;38(6):843-844 · Milewski MD, et al. J Pediatr Orthop. 2014;34(2):129-133 · Drake C, et al. J Clin Sleep Med. 2013;9(11):1195-1200.'},
  {id:'descarga', para:()=>true, t:'Por qué hay semanas suaves', min:2, p:[
    'El cuerpo no se hace más fuerte mientras entrenas, sino mientras se recupera. Cada cierto número de semanas tu plan baja el volumen para que lo ganado se consolide.',
    'Antes de un torneo importante pasa lo mismo, pero más afinado: bajar el volumen entre 40 y 60 % durante 1 a 2 semanas, sin bajar la intensidad, mejora el rendimiento el día que cuenta.',
    'En esas semanas no agregues trabajo por tu cuenta: la semana suave es parte del plan.'],
    f:'Bosquet L, et al. Med Sci Sports Exerc. 2007;39(8):1358-1365.'},
  {id:'constancia', para:()=>true, t:'Lo que más pesa: la constancia', min:1, p:[
    'Rinde más hacer el 80 % del plan todas las semanas que el 100 % una semana y nada la siguiente. La fuerza y los tejidos se adaptan a lo que se repite.',
    'Si fallas una sesión, no la dupliques al día siguiente: sigue con la que toca. Si fallas una semana entera, avísale a tu fisioterapeuta para ajustar.',
    'Registrar tus sesiones y tu chequeo le permite a tu fisioterapeuta ajustar el plan con datos, no con suposiciones.'],
    f:'Criterio clínico.'},
  {id:'tendon', para:c=>/tendin/i.test(c.condicion||''), t:'Tendón: la carga es el tratamiento', min:3, p:[
    'El tendón se adapta a la carga que recibe. El reposo total baja el dolor un tiempo, pero lo deja más débil para cuando vuelves.',
    'Por eso tu plan sube la carga por etapas: primero isometrías para calmar el dolor, luego fuerza pesada y lenta, después saltos (almacenamiento de energía) y al final el deporte.',
    'En tendinopatía rotuliana, un programa de carga progresiva así mejoró dolor y función más que el clásico excéntrico. La recuperación suele tomar 12 semanas o más: la paciencia es parte del tratamiento.'],
    f:'Breda SJ, et al. Br J Sports Med. 2021;55(9):501-509 · Malliaras P, et al. J Orthop Sports Phys Ther. 2015;45(11):887-898.'},
  {id:'lca', para:c=>/cruzado|LCA/i.test(c.condicion||''), t:'LCA: volver por criterios, no por fecha', min:3, p:[
    'Después de una lesión o cirugía de LCA, volver al deporte no depende solo del tiempo que pasó, sino de cumplir criterios: fuerza del cuádriceps parecida entre las dos piernas, saltos simétricos y confianza.',
    'En un estudio con deportistas, cada mes que se retrasó el regreso, hasta los 9 meses, redujo la nueva lesión cerca de 51 %. Quienes cumplieron los criterios antes de volver tuvieron 84 % menos riesgo.',
    'Lo que más pesa es la fuerza del cuádriceps. Por eso tu plan insiste tanto en ella, incluso cuando la rodilla ya se siente bien.'],
    f:'Grindem H, et al. Br J Sports Med. 2016;50(13):804-808.'},
  {id:'menisco', para:c=>/menisc/i.test(c.condicion||''), t:'Menisco: el ejercicio también trata', min:2, p:[
    'En roturas de menisco por desgaste en adultos, 12 semanas de ejercicio supervisado dieron resultados parecidos a la cirugía (meniscectomía) a los 2 años.',
    'Si te operaron con sutura, el menisco necesita tiempo para cicatrizar: respeta los límites de flexión y de carga que te indicaron, aunque no duela.',
    'La fuerza del cuádriceps y de la cadera protege la rodilla y reduce la carga sobre el menisco.'],
    f:'Kise NJ, et al. BMJ. 2016;354:i3740.'},
  {id:'pfp', para:c=>/patelofemoral/i.test(c.condicion||''), t:'Dolor delante de la rodilla', min:2, p:[
    'El tratamiento con mejor evidencia para el dolor patelofemoral es combinar ejercicios de cadera y de rodilla.',
    'Mientras tanto, ajusta lo que más lo provoca: escaleras, sentadilla profunda, estar mucho rato sentado con la rodilla doblada o aumentar de golpe lo que corres.',
    'El dolor suele bajar en semanas, pero la fuerza se construye en meses: no dejes el plan cuando deje de doler.'],
    f:'Willy RW, et al. J Orthop Sports Phys Ther. 2019;49(9):CPG1-CPG95.'},
  {id:'lumbar', para:c=>c.modulo==='lumbar', t:'Dolor lumbar: moverse ayuda', min:2, p:[
    'La gran mayoría de los dolores de espalda baja no vienen de un daño grave. Mantenerte activo y hacer ejercicio es lo que recomiendan las guías como tratamiento principal.',
    'El dolor puede subir y bajar varios días: no es una señal de que algo se dañó. Ajusta la carga, no te quedes quieto.',
    'Consulta de inmediato si pierdes fuerza en las piernas, se te adormece la zona genital o tienes problemas para orinar o controlar el esfínter.'],
    f:'Foster NE, et al. Lancet. 2018;391(10137):2368-2383.'},
  {id:'fuerza', para:c=>c.modulo==='deporte'||!!c.rehab, t:'La fuerza es tu mejor prevención', min:2, p:[
    'En los estudios que compararon formas de prevenir lesiones deportivas, el entrenamiento de fuerza fue el que más funcionó: redujo las lesiones a menos de un tercio.',
    'Además, más fuerza se asocia a mejor salto, sprint y cambios de dirección. No es tiempo que le quitas al deporte: es rendimiento.',
    'La técnica primero; la carga después.'],
    f:'Lauersen JB, et al. Br J Sports Med. 2014;48(11):871-877 · Suchomel TJ, et al. Sports Med. 2016;46(10):1419-1449.'},
  {id:'salud', para:c=>c.modulo==='salud', t:'Fuerza para la salud', min:2, p:[
    'La Organización Mundial de la Salud recomienda fortalecer los grandes grupos musculares al menos 2 días por semana; en mayores de 65, sumar equilibrio al menos 3 días.',
    'Entre 30 y 60 minutos por semana de ejercicios de fuerza se asoció con 10 a 20 % menos mortalidad, independientemente del ejercicio aeróbico.',
    'No hace falta entrenar al fallo: terminar con 2 o 3 repeticiones en reserva es suficiente para progresar.'],
    f:'Bull FC, et al. Br J Sports Med. 2020;54(24):1451-1462 · Momma H, et al. Br J Sports Med. 2022;56(13):755-763.'}
];
A.apr = A.apr || {q:'', open:null};
function pxEjercicios(c){
  const map = new Map();
  (c.dias || []).forEach(d => (d.segs || []).forEach(sg => (sg.rows || []).forEach(r => { if(!r.e) return;
    const m = map.get(r.e) || {e:r.e, cue:r.cue || '', video:r.video || '', dias:new Set(), ter:!!r.ter}; m.dias.add(d.name); if(!m.cue && r.cue) m.cue = r.cue; if(!m.video && r.video) m.video = r.video; map.set(r.e, m); })));
  return [...map.values()];
}
function pxAprende(c){
  const ex = pxEjercicios(c), q = (A.apr.q || '').trim().toLowerCase();
  const list = ex.filter(x => !q || x.e.toLowerCase().includes(q)).sort((a, b) => (b.video ? 1 : 0) - (a.video ? 1 : 0) || a.e.localeCompare(b.e, 'es'));
  const nVid = ex.filter(x => x.video).length;
  const lecc = LECC.filter(l => { try{ return l.para(c); }catch(e){ return false; } });
  return hPage('Aprende', `${ex.length} ejercicios · ${lecc.length} lecciones`) + `<div class="ap-body">
    <section class="ap-sec"><div class="ap-head"><h2>Mis ejercicios</h2><span class="ap-muted">${nVid} con video</span></div>
      <input type="search" class="px-search" id="pxQ" placeholder="Buscar ejercicio" value="${esc(A.apr.q || '')}" aria-label="Buscar ejercicio">
      <div class="ap-list">${list.length ? list.map(x => `<div class="ap-row px-ex"><span class="ap-l"><b>${x.ter ? '<span class="ap-ter">T</span> ' : ''}${esc(x.e)}</b>${x.cue ? `<span>${esc(x.cue)}</span>` : ''}<span class="ap-muted">${esc([...x.dias].join(', '))}</span></span>
        <span class="px-exb">${x.video ? `<a class="px-vid" href="${esc(x.video)}" target="_blank" rel="noopener" aria-label="Ver video de ${esc(x.e)}">${P_ICON.play}<span>Video</span></a>` : ''}<button type="button" class="px-tec" data-tecex="${esc(x.e)}" aria-label="Enviar mi técnica de ${esc(x.e)}">${P_ICON.cam}</button></span></div>`).join('')
        : '<div class="ap-row"><span class="ap-l"><span>No hay ejercicios con ese nombre.</span></span></div>'}</div>
      <p class="ap-note">El ícono de cámara te deja grabarte haciendo el ejercicio para que tu fisioterapeuta revise la técnica.</p></section>
    <section class="ap-sec"><div class="ap-head"><h2>Lecciones</h2></div><div class="ap-list">${lecc.map(l => {
      const op = A.apr.open === l.id;
      return `<div class="px-lec${op ? ' open' : ''}"><button type="button" class="ap-row px-lh" data-lec="${l.id}" aria-expanded="${op}"><span class="ap-l"><b>${esc(l.t)}</b><span>${l.min} min de lectura</span></span>${H_ICON.chev}</button>
        ${op ? `<div class="px-lb">${l.p.map(t => `<p>${esc(t)}</p>`).join('')}<p class="px-src">Fuente: ${esc(l.f)}</p></div>` : ''}</div>`; }).join('')}</div></section>
  </div>`;
}

/* ===================== CHAT Y VIDEOS (deportista) ===================== */
A.tec = []; A.tecOpen = null;
async function adLoadMsgs(){   // reemplaza la de adherencia: trae también el autor
  if(!A.p) return;
  try{ const {data, error} = await sb.from('mensajes').select('id,texto,motivo,autor,created_at,leido_at').eq('paciente_id', A.p.id).order('created_at', {ascending:false}).limit(80);
    if(!error){ A.msgs = data || []; renderAthlete(); } }catch(e){}
}
async function pxLoadTec(){
  if(!A.p) return;
  try{ const {data} = await sb.from('tecnica').select('*').eq('paciente_id', A.p.id).order('created_at', {ascending:false}).limit(30); A.tec = data || []; renderAthlete(); }catch(e){}
}
const _startAthletePx = startAthlete;
startAthlete = async function(p){ await _startAthletePx(p); pxLoadTec(); };
// la tarjeta de "mensaje nuevo" y la marca de leído solo cuentan lo que escribe el fisio
adMsgCard = function(){
  const m = (A.msgs || []).find(x => x.autor !== 'deportista' && !x.leido_at); if(!m) return '';
  return `<section class="ap-card ad-msg"><span class="ad-from">Mensaje de tu fisioterapeuta · ${esc(fmtD((m.created_at || '').slice(0, 10)))}</span>
    <p>${esc(m.texto)}</p><div class="ap-acts"><button type="button" class="ap-btn ap-secondary" id="adRead">Entendido</button><button type="button" class="ap-btn ap-plain" data-htab="fisio">Responder</button></div></section>`;
};
adMarkRead = async function(){
  const pend = (A.msgs || []).filter(m => m.autor !== 'deportista' && !m.leido_at); if(!pend.length) return;
  pend.forEach(m => m.leido_at = new Date().toISOString()); renderAthlete();
  try{ await sb.rpc('marcar_mensajes_leidos', {pid: A.p.id}); }catch(e){}
};
adMsgList = function(){ return ''; };   // la conversación la pinta pxChat
function pxChat(){
  const ms = (A.msgs || []).slice().reverse();
  return `<section class="ap-sec"><div class="ap-head"><h2>Conversación</h2></div><div class="ap-card px-chat">
    <div class="px-thread" id="pxThread">${ms.length ? ms.map(m => `<div class="px-msg ${m.autor === 'deportista' ? 'me' : 'fi'}"><p>${esc(m.texto)}</p><span>${m.autor === 'deportista' ? 'Tú' : 'Tu fisioterapeuta'} · ${esc(fmtD((m.created_at || '').slice(0, 10)))} ${esc((m.created_at || '').slice(11, 16))}</span></div>`).join('')
      : '<p class="ap-muted">Escríbele a tu fisioterapeuta: dudas, cómo te fue, algo que te molesta.</p>'}</div>
    <div class="px-compose"><textarea id="pxTxt" rows="2" maxlength="1000" placeholder="Escribe un mensaje" aria-label="Mensaje para tu fisioterapeuta"></textarea>
      <button type="button" class="px-send" id="pxSend" aria-label="Enviar">${P_ICON.send}</button></div></div></section>`;
}
function pxTecSec(c){
  const ex = pxEjercicios(c).map(x => x.e);
  const est = v => v.comentario ? '<span class="ap-pill g">Revisado</span>' : '<span class="ap-pill y">Por revisar</span>';
  const form = A.tecOpen != null ? `<div class="ap-card px-tecf">
      <label class="f">Ejercicio<select id="tecEx">${ex.map(e => `<option${e === A.tecOpen ? ' selected' : ''}>${esc(e)}</option>`).join('')}</select></label>
      <label class="f">Video (máximo 50 MB, unos 20 a 30 segundos)<input type="file" id="tecFile" accept="video/*"></label>
      <label class="f">¿Qué quieres que revise? (opcional)<input type="text" id="tecNota" maxlength="300" placeholder="Ej.: siento que la rodilla se va hacia adentro"></label>
      <p class="ap-note">Grábate de lado o de frente, con todo el cuerpo en el cuadro, 2 o 3 repeticiones.</p>
      <div class="ap-acts"><button type="button" class="ap-btn ap-primary" id="tecUp">Enviar video</button><button type="button" class="ap-btn ap-plain" id="tecCancel">Cancelar</button></div>
      <p class="lgmsg" id="tecMsg" role="status" aria-live="polite"></p></div>`
    : `<div class="ap-card"><p>Grábate haciendo un ejercicio y tu fisioterapeuta revisa la técnica y te deja comentarios.</p><button type="button" class="ap-btn ap-secondary" id="tecNew">${P_ICON.cam} Enviar un video</button></div>`;
  const list = (A.tec || []).length ? `<div class="ap-list">${A.tec.map(v => `<div class="ap-row ap-req"><span class="ap-l"><span class="ap-reqh">${est(v)}<span class="ap-muted">${esc(fmtD((v.created_at || '').slice(0, 10)))}</span></span>
      <b>${esc(v.ejercicio)}</b>${v.nota ? `<span>Tu nota: ${esc(v.nota)}</span>` : ''}${v.comentario ? `<span class="px-com">Tu fisioterapeuta: ${esc(v.comentario)}</span>` : ''}</span>
      ${!v.comentario ? `<button type="button" class="ap-del" data-tecdel="${esc(v.id)}" aria-label="Borrar video">Borrar</button>` : ''}</div>`).join('')}</div>` : '';
  return `<section class="ap-sec" id="pxTec"><div class="ap-head"><h2>Revisión de técnica</h2></div>${form}${list}</section>`;
}
async function pxUploadTec(){
  const f = $('#tecFile')?.files?.[0], ej = $('#tecEx')?.value, nota = ($('#tecNota')?.value || '').trim();
  const msg = (t, k) => { const m = $('#tecMsg'); if(m){ m.textContent = t; m.className = 'lgmsg' + (k ? ' ' + k : ''); } };
  if(!f){ msg('Elige o graba el video.', 'err'); return; }
  if(f.size > 50 * 1024 * 1024){ msg(`El video pesa ${Math.round(f.size / 1048576)} MB y el máximo es 50 MB. Grábalo más corto (20 a 30 segundos) o en menor calidad.`, 'err'); return; }
  const ext = (f.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
  const path = `${A.p.id}/${Date.now()}.${ext}`;
  const btn = $('#tecUp'); if(btn){ btn.disabled = true; btn.classList.add('busy'); }
  msg('Subiendo… no cierres la app.');
  const up = await sb.storage.from('tecnica').upload(path, f, {contentType: f.type || 'video/mp4', upsert:false});
  if(up.error){ if(btn){ btn.disabled = false; btn.classList.remove('busy'); } msg(/size|large|exceed/i.test(up.error.message) ? 'El video es muy pesado. Grábalo más corto.' : /mime|type/i.test(up.error.message) ? 'Ese formato de video no se puede subir. Usa uno grabado con la cámara del celular.' : 'No se pudo subir. Revisa tu conexión e inténtalo de nuevo.', 'err'); return; }
  const {data, error} = await sb.from('tecnica').insert({paciente_id: A.p.id, ejercicio: ej, path, nota: nota || null, created_by: me.uid}).select('*').single();
  if(error){ await sb.storage.from('tecnica').remove([path]).catch(() => {}); if(btn){ btn.disabled = false; btn.classList.remove('busy'); } msg('No se pudo guardar. Inténtalo de nuevo.', 'err'); return; }
  A.tec.unshift(data); A.tecOpen = null; renderAthlete(); toast('Video enviado. Tu fisioterapeuta te avisará cuando lo revise.');
}

/* ---------- Integración con el portal ---------- */
if(!H_TABS.some(t => t[0] === 'aprende')) H_TABS.splice(3, 0, ['aprende', 'Aprende', '<path d="M4 6.5C4 5.1 5.1 4 6.5 4H20v14H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5V6.5M8 8h8M8 11.5h6"/>']);
const _renderAthletePx = renderAthlete;
renderAthlete = function(){
  const c = A.plan?.contenido;
  if(A.tab === 'aprende' && c && A.consent){
    // la pestaña Aprende no existe en el pintado base: se pinta aquí con la barra de pestañas
    const el = $('#athleteApp'); el.classList.add('ath2'); document.body.classList.add('ath2b');
    el.innerHTML = pxAprende(c) + hTabbar(); el.classList.add('has-tabs');
    document.querySelectorAll('meta[name="theme-color"]').forEach(tc => { const dk = /dark/.test(tc.getAttribute('media') || ''); tc.setAttribute('content', dk ? '#000000' : '#F2F2F7'); });
    return;
  }
  _renderAthletePx();
  const el = $('#athleteApp'); if(!el || !c || !A.consent) return;
  const body = el.querySelector('.ap-body'); if(!body) return;
  if(A.tab === 'prog'){
    const list = [...body.querySelectorAll('.ap-sec')].find(s => /Mis sesiones/.test(s.querySelector('h2')?.textContent || ''));
    const html = pxProgreso(c);
    if(list) list.insertAdjacentHTML('beforebegin', html); else body.insertAdjacentHTML('beforeend', html);
  }
  if(A.tab === 'fisio'){
    const first = body.querySelector('.ap-sec');
    const html = pxChat() + pxTecSec(c);
    if(first) first.insertAdjacentHTML('beforebegin', html); else body.insertAdjacentHTML('afterbegin', html);
    const th = $('#pxThread'); if(th) th.scrollTop = th.scrollHeight;
    if(A.tecFocus){ A.tecFocus = false; $('#pxTec')?.scrollIntoView({block:'start'}); }
  }
};
$('#athleteApp').addEventListener('click', async e => {
  const q = s => e.target.closest(s); let b;
  if((b = q('[data-pg]'))){ A.pg = b.dataset.pg; renderAthlete(); return; }
  if((b = q('[data-pgex]'))){ A.pgEx = b.dataset.pgex; renderAthlete(); return; }
  if((b = q('.px-hit'))){ const cap = b.closest('.px-fig')?.querySelector('.px-cap'); if(cap) cap.textContent = b.dataset.tip; return; }
  if((b = q('[data-lec]'))){ A.apr.open = A.apr.open === b.dataset.lec ? null : b.dataset.lec; renderAthlete(); return; }
  if((b = q('[data-tecex]'))){ A.tab = 'fisio'; A.tecOpen = b.dataset.tecex; A.tecFocus = true; renderAthlete(); return; }
  if(q('#tecNew')){ const ex = pxEjercicios(A.plan?.contenido || {}); A.tecOpen = ex[0]?.e || ''; renderAthlete(); $('#pxTec')?.scrollIntoView({block:'start'}); return; }
  if(q('#tecCancel')){ A.tecOpen = null; renderAthlete(); return; }
  if(q('#tecUp')) return pxUploadTec();
  if((b = q('[data-tecdel]'))){ const v = A.tec.find(x => x.id === b.dataset.tecdel); if(!v) return;
    const {error} = await sb.from('tecnica').delete().eq('id', v.id); if(error){ toast('No se pudo borrar.'); return; }
    sb.storage.from('tecnica').remove([v.path]).catch(() => {}); A.tec = A.tec.filter(x => x.id !== v.id); renderAthlete(); return; }
  if(q('#pxSend')){
    const t = ($('#pxTxt')?.value || '').trim(); if(!t) return;
    const btn = $('#pxSend'); btn.disabled = true;
    const {data, error} = await sb.from('mensajes').insert({paciente_id: A.p.id, texto: t.slice(0, 1000), motivo: 'chat', autor: 'deportista', created_by: me.uid}).select('id,texto,motivo,autor,created_at,leido_at').single();
    btn.disabled = false;
    if(error){ toast('No se pudo enviar. Revisa tu conexión.'); return; }
    A.msgs.unshift(data); renderAthlete(); return;
  }
});
$('#athleteApp').addEventListener('keydown', e => { const h = e.target.closest('.px-hit'); if(h && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); h.dispatchEvent(new MouseEvent('click', {bubbles:true})); } });
$('#athleteApp').addEventListener('input', e => {
  if(e.target.id === 'pxQ'){ A.apr.q = e.target.value; const pos = e.target.selectionStart; renderAthlete(); const i = $('#pxQ'); if(i){ i.focus(); try{ i.setSelectionRange(pos, pos); }catch(_){} } }
});

/* ===================== PANEL DEL FISIO ===================== */
let unreadBy = {}, tecPendBy = {};
async function pxLoadUnread(){
  try{
    const [m, t] = await Promise.all([
      sb.from('mensajes').select('paciente_id').eq('autor', 'deportista').is('leido_at', null).limit(500),
      sb.from('tecnica').select('paciente_id').is('comentario', null).limit(500)
    ]);
    unreadBy = {}; (m.data || []).forEach(x => unreadBy[x.paciente_id] = (unreadBy[x.paciente_id] || 0) + 1);
    tecPendBy = {}; (t.data || []).forEach(x => tecPendBy[x.paciente_id] = (tecPendBy[x.paciente_id] || 0) + 1);
  }catch(e){}
}
const _loadPatientsPx = loadPatients;
loadPatients = async function(){ await Promise.all([_loadPatientsPx(), pxLoadUnread()]); pxBadges(); if(typeof homeVisible === 'function' && homeVisible()) pxHomeMarks(); };
function pxBadges(){
  const b = $('#bMsg'); if(!b) return;
  const n = unreadBy[curId] || 0; let s = b.querySelector('.px-badge');
  if(n){ if(!s){ s = document.createElement('span'); s.className = 'px-badge'; b.append(s); } s.textContent = n; b.setAttribute('aria-label', `Conversación: ${n} mensaje${n > 1 ? 's' : ''} sin leer`); }
  else if(s) s.remove();
}
function pxHomeMarks(){
  const home = $('#home'); if(!home) return;
  home.querySelectorAll('.pcard[data-open-h]').forEach(card => {
    const id = card.dataset.openH, n = unreadBy[id] || 0, v = tecPendBy[id] || 0; card.querySelector('.px-pm')?.remove();
    if(!n && !v) return;
    const meta = card.querySelector('.pmeta') || card;
    meta.insertAdjacentHTML('afterend', `<span class="px-pm">${n ? `${n} mensaje${n > 1 ? 's' : ''} nuevo${n > 1 ? 's' : ''}` : ''}${n && v ? ' · ' : ''}${v ? `${v} video${v > 1 ? 's' : ''} por revisar` : ''}</span>`);
  });
}
if(typeof renderHome === 'function'){ const _rh = renderHome; renderHome = function(){ _rh.apply(this, arguments); pxHomeMarks(); }; }

/* Conversación con el paciente (reemplaza el botón de mensaje suelto) */
const _adComposePx = adCompose;
adCompose = function(pid, motivo){ if(motivo === 'semana') return _adComposePx(pid, motivo); pxOpenChat(pid); };
async function pxOpenChat(pid){
  const p = patients.find(x => x.id === pid); if(!p) return;
  if(!p.email){ toast('Esta persona no tiene acceso al portal: agrégale un correo para poder escribirle.'); return; }
  let d = $('#chatDlg');
  if(!d){ d = document.createElement('div'); d.id = 'chatDlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'chatDlgT'); document.body.append(d); }
  d.dataset.pid = pid; d.hidden = false;
  d.innerHTML = `<div class="md-card px-fchat"><div class="px-fch"><h2 id="chatDlgT">${esc(p.nombre || 'Usuario')}</h2><button type="button" class="xbtn" id="chatX" aria-label="Cerrar">×</button></div>
    <div class="px-thread" id="fThread"><p class="small">Cargando…</p></div>
    <span class="px-qr">Respuestas rápidas</span><div class="md-pre px-pre">${[...AD_PRESETS.animo, ...AD_PRESETS.ajuste].map((t, i) => `<button type="button" data-cpre="${i}">${esc(t)}</button>`).join('')}</div>
    <div class="px-compose"><textarea id="fTxt" rows="3" maxlength="1000" placeholder="Escribe un mensaje" aria-label="Mensaje"></textarea><button type="button" class="primary" id="fSend">Enviar</button></div></div>`;
  const {data} = await sb.from('mensajes').select('id,texto,autor,created_at,leido_at').eq('paciente_id', pid).order('created_at', {ascending:true}).limit(200);
  pxPaintThread(data || []);
  if((data || []).some(m => m.autor === 'deportista' && !m.leido_at)){ sb.rpc('marcar_mensajes_leidos_fisio', {pid}).then(() => {}, () => {}); unreadBy[pid] = 0; pxBadges(); pxHomeMarks(); }
  setTimeout(() => $('#fTxt')?.focus(), 30);
}
function pxPaintThread(ms){
  const th = $('#fThread'); if(!th) return; th._ms = ms;
  th.innerHTML = ms.length ? ms.map(m => `<div class="px-msg ${m.autor === 'deportista' ? 'fi' : 'me'}"><p>${esc(m.texto)}</p><span>${m.autor === 'deportista' ? (p.nombre || 'Usuario').split(' ')[0] : 'Tú'} · ${esc(fmtD((m.created_at || '').slice(0, 10)))} ${esc((m.created_at || '').slice(11, 16))}${m.autor !== 'deportista' && m.leido_at ? ' · leído' : ''}</span></div>`).join('')
    : '<p class="small">Aún no hay mensajes. Escríbele el primero.</p>';
  th.scrollTop = th.scrollHeight;
}
document.addEventListener('click', async e => {
  const d = $('#chatDlg'); if(!d || d.hidden) return;
  let b;
  if(e.target === d || e.target.closest('#chatX')){ d.hidden = true; return; }
  if((b = e.target.closest('[data-cpre]'))){ $('#fTxt').value = [...AD_PRESETS.animo, ...AD_PRESETS.ajuste][+b.dataset.cpre]; $('#fTxt').focus(); return; }
  if(e.target.closest('#fSend')){
    const t = ($('#fTxt').value || '').trim(); if(!t) return;
    const btn = $('#fSend'); btn.disabled = true;
    const {data, error} = await sb.from('mensajes').insert({paciente_id: d.dataset.pid, texto: t.slice(0, 1000), motivo: 'chat', autor: 'fisio'}).select('id,texto,autor,created_at,leido_at').single();
    btn.disabled = false;
    if(error){ toast('No se pudo enviar el mensaje.'); return; }
    $('#fTxt').value = ''; const th = $('#fThread'); pxPaintThread([...(th?._ms || []), data]);
    if(typeof msgsBy !== 'undefined') (msgsBy[d.dataset.pid] ||= []).unshift({paciente_id: d.dataset.pid, created_at: data.created_at});
  }
});
document.addEventListener('keydown', e => { const d = $('#chatDlg'); if(e.key === 'Escape' && d && !d.hidden) d.hidden = true; });

/* Videos de técnica en "Sesiones y evolución" */
let tecFisio = {pid:null, rows:[], urls:{}};
async function pxLoadTecFisio(pid){
  const {data} = await sb.from('tecnica').select('*').eq('paciente_id', pid).order('created_at', {ascending:false}).limit(20);
  const rows = data || [], urls = {};
  await Promise.all(rows.map(async v => { const {data:s} = await sb.storage.from('tecnica').createSignedUrl(v.path, 3600); if(s?.signedUrl) urls[v.id] = s.signedUrl; }));
  tecFisio = {pid, rows, urls}; if(curId === pid && view === 'ses') render();
}
function pxTecFisioCard(){
  if(!curId || tecFisio.pid !== curId) return '';
  const r = tecFisio.rows; if(!r.length) return `<section class="card"><h3 class="sec">Videos de técnica</h3><p class="small" style="margin:0">Cuando el deportista te envíe un video desde su portal (Mi fisio → Revisión de técnica), aparece aquí para que lo comentes.</p></section>`;
  return `<section class="card"><h3 class="sec">Videos de técnica</h3><div class="px-tecg">${r.map(v => `<div class="px-tecv">
    ${tecFisio.urls[v.id] ? `<video src="${esc(tecFisio.urls[v.id])}" controls playsinline preload="metadata"></video>` : '<p class="small">Video no disponible.</p>'}
    <b>${esc(v.ejercicio)}</b><span class="small">${esc(fmtD((v.created_at || '').slice(0, 10)))}${v.nota ? ` · “${esc(v.nota)}”` : ''}</span>
    <label class="f">Tu comentario<textarea data-teccom="${esc(v.id)}" rows="3" maxlength="1000" placeholder="Qué corregir y cómo">${esc(v.comentario || '')}</textarea></label>
    <div class="actions" style="margin:0"><button type="button" class="primary" data-tecsave="${esc(v.id)}">${v.comentario ? 'Actualizar comentario' : 'Enviar comentario'}</button>${v.comentario ? '<span class="pill g">Comentado</span>' : '<span class="pill y">Por revisar</span>'}</div>
  </div>`).join('')}</div></section>`;
}
const _renderPx = render;
render = function(){
  _renderPx.apply(this, arguments);
  pxBadges();
  if(view === 'ses' && curId){
    if(tecFisio.pid !== curId){ tecFisio = {pid:null, rows:[], urls:{}}; pxLoadTecFisio(curId); }
    else { const out = $('#out'), tail = out.querySelector('.dlbar'); const html = pxTecFisioCard(); if(tail) tail.insertAdjacentHTML('beforebegin', html); else out.insertAdjacentHTML('beforeend', html); }
  }
};
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-tecsave]'); if(!b) return;
  const id = b.dataset.tecsave, ta = document.querySelector(`[data-teccom="${id}"]`), t = (ta?.value || '').trim();
  if(!t){ toast('Escribe el comentario.'); return; }
  b.disabled = true;
  const now = new Date().toISOString();
  const {error} = await sb.from('tecnica').update({comentario: t.slice(0, 1000), comentado_at: now, visto_at: now}).eq('id', id);
  b.disabled = false;
  if(error){ toast('No se pudo guardar el comentario.'); return; }
  const v = tecFisio.rows.find(x => x.id === id); if(v){ v.comentario = t; v.comentado_at = now; }
  if(tecPendBy[curId]) tecPendBy[curId] = Math.max(0, tecPendBy[curId] - 1);
  toast('Comentario enviado'); render();
});

/* Al abrir desde una notificación: ?chat=<id> o ?tecnica=<id> */
(function(){
  const m = location.search.match(/[?&](chat|tecnica)=([0-9a-f-]{36})/i); if(!m) return;
  const [, kind, pid] = m;
  const t = setInterval(() => {
    if(me.role !== 'fisio' || !patients.find(p => p.id === pid)) return;
    clearInterval(t); history.replaceState(null, '', location.pathname);
    if(kind === 'chat'){ openPatient(pid); setTimeout(() => pxOpenChat(pid), 300); } else openPatient(pid, 'ses');
  }, 400);
  setTimeout(() => clearInterval(t), 20000);
})();

document.addEventListener('change', e => { if(e.target.matches && e.target.matches('[data-pgexsel]')){ A.pgEx = e.target.value; renderAthlete(); } });
