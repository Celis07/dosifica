/* ===================== AJUSTES DE PLANIFICACIÓN (oct 2026) =====================
   - Días por semana de 1 a 6: los generadores conocen 2-4 (rodilla 3-4). Se genera con el más cercano y se adapta:
     menos días → los bloques centrales de los días sobrantes se reparten en los que quedan;
     más días → se repiten los días base en orden (Día 5 = Día 1…). Es un borrador que el fisio edita.
   - "Semana del plan" deja de escribirse a mano: se calcula con la fecha de inicio. */
function diasBase(s, n){ return isRod(s) ? (n >= 4 ? 4 : 3) : Math.max(2, Math.min(4, n)); }
function diasAdaptar(days, n){
  const out = clone(days);
  if(out.length > n){
    const extra = out.splice(n);
    extra.forEach((d, i) => {
      const dst = out[i % out.length], cen = (d.segs || []).find(sg => sg.type === 'central'), dc = (dst.segs || []).find(sg => sg.type === 'central');
      if(cen && dc){ const have = new Set(dc.rows.map(r => r.e)); cen.rows.filter(r => !have.has(r.e)).slice(0, 2).forEach(r => dc.rows.push(clone(r))); }
    });
  }
  let i = 0; while(out.length < n){ const c = clone(days[i % days.length]); out.push(c); i++; }
  out.forEach((d, k) => { d.name = `Día ${k + 1}`; });
  return out;
}
/* ---------- Reparto por días (ACSM 2009: principiante 2–3 días de cuerpo completo; intermedio 3 cuerpo completo
   o 4 dividido; avanzado 4–6 dividido). Pierna pesada nunca en días seguidos; saltos solo en días de tren inferior. ---------- */
const RX_CORE = /plancha|pallof|dead bug|bird dog|rueda abdominal|hollow|core/i;
const RX_UP = /press(?!a)|remo|dominada|jal[oó]n|landmine|rotaci[oó]n externa|face pull|flexiones|pullover|y-t-w|escápula|escapular|manguito|biceps|bíceps|tr[ií]ceps|pinza/i;
const RX_LOW = /sentadilla|peso muerto|hip thrust|b[uú]lgara|step up|zancada|rumano|talones|n[oó]rdico|copenhague|aducci[oó]n|abducci[oó]n|puente|prensa|curl femoral|extensi[oó]n de rodilla|caminata del granjero|isometr|tke|cajón|salto/i;
const RX_JUMP = /salto|saltos|pliom|bound|drop|skipping|sprint|clean|swing|cajón/i;
const lado = r => RX_CORE.test(r.e) ? 'core' : RX_UP.test(r.e) ? 'up' : RX_LOW.test(r.e) ? 'low' : 'otro';
const segDe = (d, t) => (d.segs || []).find(sg => sg.type === t) || {type: t, sub: '', fmt: {t: 'series'}, rows: []};
const uniqRows = rows => { const v = new Set(); return rows.filter(r => r && r.e && !v.has(r.e) && v.add(r.e)); };
function diaDe(nombre, act, neuro, central, base){
  const mk = (t, rows) => Object.assign(clone(segDe(base, t)), {rows: clone(rows)});
  return {name: nombre, segs: [mk('act', act), mk('neuro', neuro), mk('central', central)]};
}
const MOV = X => X.find(r => /movilidad/i.test(r.e));
function repartoSplit(D, n, s){
  const C = d => segDe(d, 'central').rows, A = d => segDe(d, 'act').rows, N = d => segDe(d, 'neuro').rows;
  const todasC = D.flatMap(C), todasA = D.flatMap(A), todasN = D.flatMap(N);
  const low = d => C(d).filter(r => lado(r) === 'low'), up = d => C(d).filter(r => lado(r) === 'up');
  const mitad = k => D.filter((_, i) => i % 2 === k);   // días pares para la primera pareja, impares para la segunda
  const mov = MOV(todasA), core = uniqRows(todasA.concat(todasC).filter(r => lado(r) === 'core'));
  const actLow = uniqRows([mov, ...todasA.filter(r => r !== mov && lado(r) === 'low')]).slice(0, 4);
  const actUp = uniqRows([mov, ...todasA.filter(r => r !== mov && lado(r) === 'up')]).slice(0, 4);
  const saltos = uniqRows(todasN.filter(r => RX_JUMP.test(r.e)));
  const lanzar = uniqRows(todasN.filter(r => !RX_JUMP.test(r.e)));
  const lanzarUp = lanzar.length ? lanzar : [toRow(X('Lanzamiento de balón medicinal al pecho', '3 × 5', {t: 'Máxima intención.'}), {c: 'Máx. intención'})];
  const L = k => { const a = uniqRows([...mitad(k).flatMap(low), ...D.flatMap(low)]).slice(0, 4); return a; };
  const U = k => { const a = uniqRows([...mitad(k).flatMap(up), ...D.flatMap(up)]).slice(0, 4); return a.concat(core.slice(k, k + 1)); };
  const nInf = (k) => saltos.length ? saltos.slice(k % Math.max(1, saltos.length)).concat(saltos).slice(0, 2) : todasN.slice(0, 2);
  const inf = (k, i) => diaDe(`Día ${i} · Tren inferior`, actLow.length ? actLow : [mov].filter(Boolean), nInf(k), L(k), D[0]);
  const sup = (k, i) => diaDe(`Día ${i} · Tren superior`, actUp.length ? actUp : [mov].filter(Boolean), lanzarUp.slice(0, 2), U(k), D[0]);
  const prev = i => {
    const extra = uniqRows(todasA.filter(r => !/movilidad/i.test(r.e))).map(r => Object.assign(clone(r), {c: adjRPE(r.c, -1)}));
    const dep = modOf(s) === 'deporte';
    return diaDe(`Día ${i} · ${dep ? 'Deporte y prevención' : 'Movilidad y prevención'}`, [mov].filter(Boolean),
      [toRow(dep ? X('Coordinación y técnica del deporte', '10–15 min', {t: 'Sin fatiga: gestos del deporte a velocidad cómoda.'}) : X('Coordinación y equilibrio', '10 min', {t: 'Sin fatiga, cerca de un apoyo si hace falta.'}))],
      uniqRows([...extra, ...core]).slice(0, 5), D[0]);
  };
  const ligero = d => { const c = clone(d); c.segs.forEach(sg => sg.rows.forEach(r => { r.c = adjRPE(r.c, -1); })); c.name = c.name.replace(/(Tren \w+)/, '$1 (variante ligera)'); return c; };
  let out;
  if(n === 4) out = [inf(0, 1), sup(0, 2), inf(1, 3), sup(1, 4)];
  else if(n === 5) out = [inf(0, 1), sup(0, 2), inf(1, 3), sup(1, 4), prev(5)];
  else out = s.nivel === 'av' ? [inf(0, 1), sup(0, 2), inf(1, 3), sup(1, 4), ligero(inf(0, 5)), ligero(sup(1, 6))]
    : [inf(0, 1), sup(0, 2), prev(3), inf(1, 4), sup(1, 5), prev(6)];
  out.forEach((d, k) => { d.name = d.name.replace(/^Día \d+/, `Día ${k + 1}`); });
  return out;
}
function unDia(D){
  const C = d => segDe(d, 'central').rows;
  const all = D.flatMap(C), low = all.filter(r => lado(r) === 'low'), up = all.filter(r => lado(r) === 'up');
  const central = uniqRows([low[0], low.find(r => r !== low[0] && /peso muerto|rumano|hip thrust|puente/i.test(r.e)) || low[1], up[0], up.find(r => r !== up[0]) , ...all.filter(r => lado(r) === 'core')]).slice(0, 5);
  return [diaDe('Día 1 · Cuerpo completo', segDe(D[0], 'act').rows, segDe(D[0], 'neuro').rows.slice(0, 2), central, D[0])];
}
// Rehabilitación: lo terapéutico sí puede ir a diario; los días extra son de prevención y movilidad (sin carga pesada)
function rehabExtra(D, n){
  const out = clone(D), mov = MOV(D.flatMap(d => segDe(d, 'act').rows));
  const ter = uniqRows(D.flatMap(d => d.segs.flatMap(sg => sg.rows)).filter(r => r.ter || /isometr|tke/i.test(r.e)));
  const core = uniqRows(D.flatMap(d => d.segs.flatMap(sg => sg.rows)).filter(r => lado(r) === 'core'));
  while(out.length < n) out.push(diaDe(`Día ${out.length + 1} · Terapia y movilidad`, [mov].filter(Boolean), [], uniqRows([...ter, ...core]).slice(0, 5), D[0]));
  return out;
}
const _genWeekDias = genWeek;
genWeek = function(s){
  const n = nDias(s), m = modOf(s), entreno = (m === 'deporte' && !s.rehab) || m === 'salud';
  if(entreno){
    if(n === 2 || n === 3) return _genWeekDias.apply(this, arguments);
    const base = _genWeekDias(Object.assign({}, s, {dias: m === 'deporte' ? '4' : '2'}));
    return n === 1 ? unDia(base) : repartoSplit(base, n, s);
  }
  const b = diasBase(s, n);
  if(b === n) return _genWeekDias.apply(this, arguments);
  const days = _genWeekDias(Object.assign({}, s, {dias: String(b)}));
  return n > b ? rehabExtra(days, n) : diasAdaptar(days, n);
};

/* ---------- Semana del plan automática ---------- */
function semAuto(){
  if(!st || !st.inicio) return false;
  const w = todayWeek(st); if(w < 1) return false;
  if(+st.semPlan !== w){ st.semPlan = String(w); return true; }
  return false;
}
function semTexto(){
  const el = $('#semTxt'); if(!el) return;
  if(st.inicio){ const w = todayWeek(st);
    el.textContent = w >= 1 ? `Esta es la semana ${w} del plan (${(mesoWeek(st).l || '').toLowerCase()}). Se calcula sola con la fecha de inicio y define si toca introducción, carga o descarga.` : 'El plan empieza más adelante: hasta esa fecha se muestra la semana 1.'; }
  else el.textContent = 'Pon la fecha de inicio y la app calcula sola en qué semana va (introducción, carga o descarga) y los torneos.';
}
const _fillFormSem = fillForm;
fillForm = function(){ semAuto(); _fillFormSem.apply(this, arguments); semTexto(); };
document.addEventListener('change', e => {
  if(e.target.id !== 'inicioF') return;
  st.inicio = e.target.value || ''; if(semAuto()){ $('#semPlan').value = st.semPlan; }
  semTexto(); if(typeof markDirty === 'function') markDirty(); render();
});
