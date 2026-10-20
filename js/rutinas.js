/* ===================== DURACIÓN DE LA SESIÓN Y MICRO RUTINAS (oct 2026) =====================
   1) 45–75 min por sesión es un ESTIMADO orientativo. La app calcula el tiempo aproximado
      (series × trabajo + descansos + cambio de ejercicio) y solo avisa al fisio si un día queda
      muy por fuera; nunca quita ejercicios ni series para cuadrarlo. (fitDay queda sin uso.)
   2) Micro rutinas predeterminadas de Activación, Neuro y Fuerza para personas que no
      entrenan nada específico, con el material de Brainbox (barras, discos, mancuernas,
      cajones y bancas). El módulo Salud las usa solas y en "Editar ejercicios" se pueden
      insertar en cualquier bloque de cualquier paciente.
   Base: ACSM 2026 (todos los grandes grupos ≥ 2 días/semana, 2–3 series, cerca del fallo sin
   necesidad de llegar a él; cualquier forma de resistencia sirve) e Iversen et al. 2021
   (multiarticulares, 6–15 reps, series emparejadas para ahorrar tiempo). */

const T_MIN = 45, T_MAX = 75, ACT_MIN = 10, ACT_MAX = 15;

/* ---------- Estimación ---------- */
const tAvg = (a, b) => b ? (+a + +b) / 2 : +a;
function tWork(r){
  let txt = String(r || '').toLowerCase(), sec = 0, hit = false;
  const lado = /por lado|c\/u|cada lado|cada pierna/.test(txt) ? 2 : 1;
  txt.replace(/(\d+)(?:\s*[–-]\s*(\d+))?\s*(min|'|’)/g, (m, a, b) => { sec += tAvg(a, b) * 60; hit = true; return ''; });
  const rest = txt.replace(/(\d+)(?:\s*[–-]\s*(\d+))?\s*(min|'|’)/g, '');
  rest.replace(/(\d+)(?:\s*[–-]\s*(\d+))?\s*(s|seg|")(?![a-z])/g, (m, a, b) => { sec += tAvg(a, b); hit = true; return ''; });
  rest.replace(/(\d+)(?:\s*[–-]\s*(\d+))?\s*m(?![a-z])/g, (m, a, b) => { sec += tAvg(a, b) * 1.2; hit = true; return ''; });
  rest.replace(/(\d+)(?:\s*[–-]\s*(\d+))?\s*contactos/g, (m, a, b) => { sec += tAvg(a, b) * 1.5; hit = true; return ''; });
  if(!hit){ const m = rest.match(/(\d+)(?:\s*[–-]\s*(\d+))?/); sec = m ? tAvg(m[1], m[2]) * 3.5 : 40; }
  else { const m = rest.replace(/(\d+)(?:\s*[–-]\s*(\d+))?\s*(s|seg|"|m|contactos)(?![a-z])/g, '').match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*rep/); if(m) sec += tAvg(m[1], m[2]) * 3.5; }
  return Math.max(10, sec * lado);
}
const tSets = s => { const m = String(s || '').match(/\d+/); return m ? Math.max(1, Math.min(12, +m[0])) : 1; };
function tRest(type, r){
  if(type === 'central'){ const reps = +((String(r.r || '').match(/\d+/) || [])[0] || 10), rpe = +((String(r.c || '').match(/RPE\s*(\d+)/) || [])[1] || 7);
    return reps <= 6 && rpe >= 8 ? 150 : 90; }
  return type === 'neuro' ? 60 : 20;
}
function tBlock(sg){
  const f = sg.fmt || {t: 'series'}, rows = (sg.rows || []).filter(r => r && r.e && !T_WATER.test(r.e));
  if(!rows.length) return 0;
  if(f.t === 'inter') return (+f.c || 3) * rows.length * ((+f.a || 40) + (+f.b || 20)) + 60;
  if(f.t === 'amrap' || f.t === 'emom') return (+f.a || 10) * 60 + 60;
  if(f.t === 'rondas'){ const n = +f.a || 3, rest = tWork(f.b || '90 s'); return n * rows.reduce((a, r) => a + tWork(r.r) + 15, 0) + (n - 1) * rest + 60; }
  return rows.filter(r => !T_WATER.test(r.e)).reduce((a, r) => { const n = tSets(r.s); return a + n * tWork(r.r) + (n - 1) * tRest(sg.type, r) + 45; }, 0);
}
function tDay(day){
  const by = {act: 0, neuro: 0, central: 0};
  (day.segs || []).forEach(sg => { by[sg.type] = (by[sg.type] || 0) + tBlock(sg) / 60; });
  return {act: by.act, neuro: by.neuro, central: by.central, total: by.act + by.neuro + by.central};
}

/* ---------- Ajuste al tiempo ---------- */
const T_UPPER = /press|remo|jal[oó]n|dominad|face pull|b[ií]ceps|tr[ií]ceps|vuelos|elevaciones laterales|landmine|push up|flexiones|pull up/i;
const T_PUSH = /press|push up|flexiones|landmine/i, T_PULL = /remo|jal[oó]n|dominad|pull up|face pull/i;
// Lo que se hace fuera de la sesión de gimnasio (piscina, caminata diaria) no cuenta en el tiempo ni se recorta
const T_WATER = /agua|aletas|apnea|piscina|buceo|^caminata(\s*$|\s+(diaria|r[aá]pida|suave))/i;
const T_CORE = /plancha|pallof|dead bug|bicho muerto|bird ?dog|crunch|navajas|granjero/i;
function fitDay(day, s){
  const d = clone(day), mod = modOf(s), rehab = mod === 'rodilla' || mod === 'lumbar', quit = [];
  const est = () => tDay((applyMeso([d], s) || [d])[0]);
  const seg = t => d.segs.find(g => g.type === t);
  const act = seg('act'), neuro = seg('neuro'), cen = seg('central');
  // 1) Movilidad y activación: 10–15 min
  if(act){
    let guard = 20;
    while(est().act > ACT_MAX && guard--){
      const i = act.rows.map((r, k) => k).reverse().find(k => k > 0 && !act.rows[k].ter && !/isometr/i.test(act.rows[k].e) && !T_WATER.test(act.rows[k].e));
      if(i == null) break; quit.push(act.rows[i].e); act.rows.splice(i, 1);
    }
    act.rows.forEach(r => { if(est().act > ACT_MAX && tSets(r.s) > 2 && !r.ter) r.s = String(r.s).replace(/\d+/, '2'); });
    const mov = act.rows.find(r => /movilidad/i.test(r.e) && /min/.test(r.r || ''));
    if(mov && est().act < ACT_MIN){ const now = tWork(mov.r) / 60, add = Math.ceil(ACT_MIN - est().act); mov.r = `${Math.min(10, Math.round(now + add))} min`; }
  }
  // 2) Neuro: como mucho ~12 min
  if(neuro){ let guard = 10;
    while(est().neuro > 12 && neuro.rows.length > 2 && guard--){ const i = neuro.rows.map((r, k) => k).reverse().find(k => !neuro.rows[k].ter && !T_WATER.test(neuro.rows[k].e)); if(i == null) break; quit.push(neuro.rows[i].e); neuro.rows.splice(i, 1); } }
  // 3) Total ≤ 75 en el bloque central, de lo menos a lo más importante
  if(cen){
    const over = () => est().total > T_MAX;
    const keepN = 4, protect = (r, k) => k < 3 || r._k || r.ter || r.lado === 'Lesionada' || /isometr/i.test(r.e) || T_WATER.test(r.e);
    const drop = k => { quit.push(cen.rows[k].e); cen.rows.splice(k, 1); };
    const sets = (ok, from, to) => { for(let k = cen.rows.length - 1; k >= 0 && over(); k--){ const r = cen.rows[k]; if(!r.ter && ok(r, k) && tSets(r.s) >= from) r.s = String(r.s).replace(/\d+/, String(to)); } };
    const dropWhere = (ok, keepFirst) => { let seen = 0;
      for(let k = 0; k < cen.rows.length && over() && cen.rows.length > keepN; k++){ const r = cen.rows[k];
        if(protect(r, k) || !ok(r)) continue; if(seen++ < keepFirst){ r._k = 1; continue; } drop(k); k--; } };
    sets((r, k) => k >= 3, 4, 3);                                  // a) accesorios a 3 series
    if(rehab){
      dropWhere(r => T_CORE.test(r.e), 0);                         // b) el tronco ya va en la activación
      dropWhere(r => T_PUSH.test(r.e), 1);                         // c) tren superior: deja 1 empuje
      dropWhere(r => T_PULL.test(r.e), 1);                         //    y 1 tracción
      dropWhere(r => T_UPPER.test(r.e), 0);
      dropWhere(r => r.lado === 'Sana', 1);                        // d) educación cruzada: deja 1 del lado sano
    }
    sets((r, k) => k >= 3, 3, 2);                                  // e) accesorios a 2 series
    for(let guard = 20; over() && cen.rows.length > keepN && guard--;){ // f) lo último que queda, desde el final
      const k = cen.rows.map((r, i) => i).reverse().find(i => !protect(cen.rows[i], i)); if(k == null) break; drop(k); }
    sets(() => true, 4, 3);                                        // g) principales a 3 series
    sets((r, k) => k >= 3, 3, 2);
    cen.rows.forEach(r => delete r._k);
  }
  // 4) Si queda por debajo de 45 min, sumar series en fuerza (máx. 3; ACSM: 2–3 series)
  if(cen && !/desc|recup|taper|mini/.test((mesoWeek(s) || {}).k || '')){
    for(let pass = 0; pass < 2 && est().total < T_MIN; pass++)
      cen.rows.forEach(r => { if(est().total < T_MIN && !r.ter && /RPE/.test(r.c || '') && tSets(r.s) < 3) r.s = String(r.s).replace(/\d+/, String(tSets(r.s) + 1)); });
  }
  if(quit.length) d.trim = quit;
  return d;
}

/* ---------- Micro rutinas (material de Brainbox) ---------- */
const MR = (n, d, o) => X(n, d, o || {});
const MICRO = {
  'act-gen': {b: 'act', n: 'Movilidad y activación general', p: 'Cualquier persona, cualquier día.', items: [
    MR('Movilidad dinámica de cadera, tobillo y columna torácica', '1 × 3 min'), MR('Puente de gluteo', '2 × 12', {rpe: '6'}),
    MR('Bird dog (sin extensión cervical)', '2 × 8 por lado', {t: 'Pelvis quieta; alarga, no levantes.'}), MR('Plancha frontal', '2 × 30 s', {rpe: '6'}), MR('Sentadilla libre (sin peso)', '2 × 10', {t: 'Ensaya el patrón antes de cargarlo.'})]},
  'act-inf': {b: 'act', n: 'Activación de tren inferior', p: 'Días de sentadilla, peso muerto o zancadas.', items: [
    MR('Movilidad dinámica de cadera, tobillo y columna torácica', '1 × 4 min'), MR('Puente glúteo a una pierna', '2 × 8 por lado', {rpe: '6'}),
    MR('Sentadilla goblet', '2 × 8', {rpe: '5', t: 'Mancuerna ligera: es para entrar en calor.'}), MR('Step up a cajón', '2 × 6 por lado', {t: 'Cajón bajo, sube controlado.'}), MR('Elevación de talones bipodal', '2 × 12')]},
  'act-sup': {b: 'act', n: 'Activación de hombro y tronco', p: 'Días de empujes y tracciones.', items: [
    MR('Rotación torácica en cuadrupedia', '2 × 8 por lado'), MR('Push up', '2 × 8', {t: 'Manos sobre la banca si cuesta.', rpe: '6'}),
    MR('Remo con mancuerna a una mano', '2 × 10 por lado', {rpe: '5', t: 'Ligero.'}), MR('Plancha lateral', '2 × 20 s por lado', {rpe: '6'}), MR('Bicho muerto', '2 × 8 por lado')]},
  'act-may': {b: 'act', n: 'Activación para adulto mayor o muy desacondicionado', p: 'Empieza sentado o con apoyo cerca.', items: [
    MR('Movilidad dinámica de cadera, tobillo y columna torácica', '1 × 4 min', {t: 'Sentado si hace falta.'}), MR('Levantarse de la banca sin manos', '2 × 8', {rpe: '6'}),
    MR('Elevación de talones bipodal', '2 × 10', {t: 'Con una mano en la pared.'}), MR('Puente de gluteo', '2 × 10', {rpe: '6'}), MR('Marcha en el sitio con rodillas altas', '1 × 1 min')]},
  'neu-eq': {b: 'neuro', n: 'Equilibrio y control', p: 'Principiantes y adultos mayores.', items: [
    MR('Equilibrio unipodal + mancuerna a lado y lado', '3 × 20 s por lado', {t: 'Cerca de un apoyo. Progresión: ojos cerrados.'}),
    MR('Step down controlado', '2 × 6 por lado', {t: 'Cajón bajo; baja en 3 segundos.'}), MR('Cruz con un pie', '2 × 3 vueltas por lado', {t: 'Toca adelante, al lado y atrás sin apoyar.'})]},
  'neu-coord': {b: 'neuro', n: 'Coordinación y aterrizaje', p: 'Quien ya tolera bien la fuerza básica.', items: [
    MR('Skipping alto', '3 × 15 s'), MR('Aterrizaje controlado desde step bajo', '3 × 5', {t: 'Aterrizaje silencioso, rodillas alineadas.'}),
    MR('Saltos solo pantorrilla', '3 × 10', {t: 'Contactos cortos.'})]},
  'neu-pot': {b: 'neuro', n: 'Potencia ligera', p: 'Adultos activos; también mayores ya adaptados.', items: [
    MR('Sentadilla con salto (amortiguada)', '3 × 5', {c: 'Máx. intención', t: 'Sin peso o mancuerna muy ligera.'}),
    MR('Push press mancuernas', '3 × 5', {c: 'Máx. intención', t: 'Mancuernas ligeras; impulso de piernas.'}), MR('Step up a cajón', '3 × 4 por lado', {c: 'Máx. intención', t: 'Subida rápida, bajada controlada.'})]},
  'fz-a': {b: 'central', n: 'Fuerza cuerpo completo A', p: 'Mancuernas. Base para principiantes.', fmt: 'series', items: [
    MR('Sentadilla goblet', '3 × 8–10', {rpe: '7'}), MR('Press banca con mancuernas', '3 × 8–10', {rpe: '7', t: 'Emparéjalo con el remo: alterna series para ahorrar tiempo.'}),
    MR('Remo con mancuerna a una mano', '3 × 10 por lado', {rpe: '7'}), MR('Peso muerto rumano con mancuerna', '3 × 8–10', {rpe: '7', t: 'Espalda neutra; la cadera va atrás.'}), MR('Plancha lateral', '2 × 20–30 s por lado', {rpe: '7'})]},
  'fz-b': {b: 'central', n: 'Fuerza cuerpo completo B', p: 'Mancuernas, cajón y banca.', items: [
    MR('Step up a cajón', '3 × 8 por lado', {rpe: '7'}), MR('Press militar con mancuernas', '3 × 8–10', {rpe: '7', t: 'Emparéjalo con el remo.'}),
    MR('Remo con barra', '3 × 8–10', {rpe: '7'}), MR('Hip thrust', '3 × 10', {rpe: '7'}), MR('Caminata del granjero', '3 × 20–30 m', {rpe: '7'})]},
  'fz-barra': {b: 'central', n: 'Fuerza con barra', p: 'Cuando ya domina la técnica (desde el mes 2–3).', items: [
    MR('Sentadilla', '3 × 6–8', {rpe: '7–8'}), MR('Press banca', '3 × 6–8', {rpe: '7–8', t: 'Emparéjalo con el remo.'}),
    MR('Remo con barra', '3 × 8', {rpe: '7–8'}), MR('Peso muerto rumano', '3 × 8', {rpe: '7'}), MR('Bird dog dinámico', '2 × 8 por lado')]},
  'fz-may': {b: 'central', n: 'Fuerza para adulto mayor', p: 'Banca y mancuernas; sube carga cuando sobren repeticiones.', items: [
    MR('Sentadilla a la banca con mancuerna', '3 × 10', {rpe: '6–7'}), MR('Press banca con mancuernas', '2 × 10', {rpe: '6–7'}),
    MR('Remo con mancuerna a una mano', '2 × 10 por lado', {rpe: '6–7'}), MR('Step up a cajón', '2 × 8 por lado', {rpe: '6', t: 'Cajón bajo y apoyo cerca.'}),
    MR('Elevación de talones bipodal', '2 × 12', {rpe: '7'}), MR('Caminata del granjero', '2 × 20 m', {rpe: '6'})]}
};
const MICRO_BLK = {act: 'Activación', neuro: 'Neuro', central: 'Fuerza'};
function microRows(id){ const m = MICRO[id]; return m ? m.items.map(it => toRow(it, it.c ? {c: it.c} : {})) : []; }

/* ---------- Módulo Salud con micro rutinas ---------- */
genWeekSal = function(s){
  const i = phaseIdx(s), z = P.sal.phases[i].dz, n = nDias(s), pob = s.poblacion || 'sed';
  const may = pob === 'may', act = pob === 'act';
  const order = n === 2 ? ['A', 'B'] : n === 3 ? ['A', 'B', 'A'] : ['A', 'B', 'A', 'B'];
  const c = constraints(s);
  return order.map((T, d) => {
    const aId = may ? 'act-may' : ['act-gen', 'act-inf', 'act-sup'][d % 3];
    const nId = may ? (i >= 1 ? ['neu-eq', 'neu-pot'][d % 2] : 'neu-eq') : act && i >= 1 ? ['neu-pot', 'neu-coord'][d % 2] : ['neu-eq', 'neu-coord'][d % 2];
    const fId = may ? 'fz-may' : T === 'A' ? (act && i >= 2 ? 'fz-barra' : 'fz-a') : 'fz-b';
    const cen = microRows(fId).map((r, k) => {
      if(/\b(s|m)\b|seg/.test(r.r) || may) return r; // sostenidos y caminatas conservan su dosis; mayores, la propia
      const main = k < 3, dz = main ? z.main : z.acc, rpe = main ? (pob === 'sed' && i === 1 ? '7' : z.mR) : z.aR;
      const m = dz.match(/^(\d+(?:–\d+)?)\s*×\s*(.+)$/);
      return Object.assign(r, m ? {s: m[1], r: m[2] + (/por lado/.test(r.r) ? ' por lado' : '')} : {}, {c: 'RPE ' + rpe});
    });
    const B = {act: microRows(aId), neuro: microRows(nId), central: cen};
    const sub = {act: MICRO[aId].n, neuro: MICRO[nId].n, central: MICRO[fId].n};
    const segs = SEG_ORDER.map(t => ({type: t, sub: sub[t], fmt: {t: 'series'}, rows: B[t].map(r => Object.assign(fromBank(r, c), {lado: ''}))}));
    levelAdj(segs[2].rows, s);
    return {name: `Día ${d + 1}`, segs};
  });
};

/* ---------- Todos los planes generados caben en 45–75 min ---------- */
const _genWeekFit = genWeek;
// 45–75 min es un estimado: el plan NUNCA quita ejercicios ni series para cuadrar el tiempo (decisión del fisio, oct 2026).
genWeek = function(s){ return _genWeekFit(s); };

/* ---------- Aviso al fisio (sin mostrar minutos) ---------- */
function timeNotice(){
  if(!st || typeof viewWeek !== 'function') return '';
  let w; try { w = viewWeek(st); } catch(e){ return ''; }
  const desc = /desc|recup|taper|mini/.test((mesoWeek(st) || {}).k || '');
  const msgs = [];
  w.days.forEach(d => {
    const t = tDay(d);
    if(t.total > T_MAX + 10) msgs.push(`<b>${esc(d.name)}</b>: estimado cerca de ${Math.round(t.total / 5) * 5} min, por encima de 45–75. Es orientativo; no se quitó nada.`);
    else if(t.total < T_MIN - 10 && !desc) msgs.push(`<b>${esc(d.name)}</b>: estimado cerca de ${Math.round(t.total / 5) * 5} min, por debajo de 45–75. Es orientativo.`);
    if(!w.custom && d.trim && d.trim.length) msgs.push(`<b>${esc(d.name)}</b>: para que quepa en 45–75 minutos quedaron fuera ${esc(d.trim.slice(0, 4).join(', '))}${d.trim.length > 4 ? ` y ${d.trim.length - 4} más` : ''}. Si alguno es clave, agrégalo en Editar ejercicios y quita otro.`);
  });
  return msgs.length ? `<section class="card"><h3 class="sec">Duración de las sesiones</h3>${msgs.map(m => `<p class="small" style="margin:4px 0">${m}</p>`).join('')}</section>` : '';
}
const _planViewFit = planView;
planView = function(){ return timeNotice() + _planViewFit(); };

/* ---------- Insertar micro rutina en un bloque (modo edición) ---------- */
const _fmtEditorMR = fmtEditor;
fmtEditor = function(f, di, gi){
  const days = viewWeek(st).days, type = days[di]?.segs[gi]?.type;
  const opts = Object.entries(MICRO).filter(([, m]) => m.b === type);
  return _fmtEditorMR(f, di, gi) + (opts.length ? `<div class="fmted"><label>Micro rutina <select data-rut="${di}|${gi}" aria-label="Insertar micro rutina en ${esc(MICRO_BLK[type] || '')}">
    <option value="">Insertar una rutina de ${esc((MICRO_BLK[type] || '').toLowerCase())}…</option>${opts.map(([k, m]) => `<option value="${k}">${esc(m.n)} · ${esc(m.p)}</option>`).join('')}</select></label></div>` : '');
};
$('#out').addEventListener('change', e => {
  const t = e.target; if(!t.dataset || !t.dataset.rut || !t.value) return;
  const [d, g] = t.dataset.rut.split('|').map(Number), m = MICRO[t.value];
  const days = ensureCustom(), sg = days[d].segs[g], c = constraints(st);
  // lo marcado como terapia se queda arriba; la rutina reemplaza el resto del bloque
  sg.rows = [...sg.rows.filter(r => r.ter), ...microRows(t.value).map(r => Object.assign(fromBank(r, c), {lado: sg.type === 'central' && isRod(st) ? 'Ambas' : ''}))];
  sg.fmt = {t: 'series'}; sg.sub = m.n;
  markDirty(); render(); toast(`Rutina insertada: ${m.n}`);
});
