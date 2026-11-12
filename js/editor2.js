/* ===================== EDITAR MÁS FÁCIL (nov 2026) =====================
   - Botones − / + en series y reps, "Por lado" con un toque, subir y bajar ejercicios, duplicar día.
   - Quitar un ejercicio muestra "Deshacer" unos segundos (sin preguntar antes).
   - Herramientas de la semana: progresar la semana (series, reps, RPE, isométricos) y, en macrociclos,
     copiar la semana a la siguiente con o sin progresión.
   - Datos: al guardar, cada ejercicio guarda además una versión ordenada de su dosis (r.q) para medir
     volumen y progreso más adelante. El texto que escribe el fisio no se toca. */

/* ---------- Utilidades de dosis ---------- */
const DOSE_T = {test: v => /^\D*?\d+\s*(''|"|s\b|seg|min|')/i.test(String(v || ''))};   // la dosis es tiempo si el primer número va con unidad de tiempo ("30''", "45 s"); "10 + 10''" son reps
function stepNum(v, delta, min){
  v = String(v || '');
  if(!/\d/.test(v)) return delta > 0 ? String(Math.max(min || 1, delta)) : v;
  const f = n => String(Math.max(min || 0, +n + delta));
  if(/^\D*\d+\s*[–-]\s*\d+/.test(v)) return v.replace(/(\d+)(\s*[–-]\s*)(\d+)/, (m, a, sep, b) => f(a) + sep + f(b));   // rango "8–10" → "9–11"
  return v.replace(/\d+/, f);
}
function rowAt(id){ const [d, g, r] = id.split('|').map(Number); const days = ensureCustom(); return {days, d, g, r, sg: days[d].segs[g], row: days[d].segs[g].rows[r]}; }

/* ---------- Clicks del editor ---------- */
let edUndo = null;
document.addEventListener('click', e => {
  // Antes de que vistas.js quite el ejercicio, se guarda para poder deshacer
  const del = e.target.closest('#out [data-del]');
  if(del){ const {d, g, r, row} = rowAt(del.dataset.del); edUndo = {d, g, r, row: clone(row)}; setTimeout(() => edUndoBar(row.e), 0); }
}, true);
document.addEventListener('click', e => {
  let b;
  if((b = e.target.closest('#out [data-step]'))){
    const p = b.dataset.step.split('|'), id = p.slice(0, 3).join('|'), f = p[3], dl = +p[4], x = rowAt(id);
    const step = f === 'r' && DOSE_T.test(x.row.r || '') ? 5 : 1;
    x.row[f] = stepNum(x.row[f], dl * step, f === 's' ? 1 : 0);
    keepDay(x.d, render); markDirty(); return;
  }
  if((b = e.target.closest('#out [data-cu]'))){
    const x = rowAt(b.dataset.cu), r = String(x.row.r || '');
    x.row.r = /c\/u|por lado/i.test(r) ? r.replace(/\s*(c\/u|por lado)\s*/ig, ' ').trim() : (r ? r + ' c/u' : 'c/u');
    keepDay(x.d, render); markDirty(); return;
  }
  if((b = e.target.closest('#out [data-mv]'))){
    const p = b.dataset.mv.split('|'), x = rowAt(p.slice(0, 3).join('|')), to = x.r + (+p[3]);
    if(to < 0 || to >= x.sg.rows.length) return;
    const [it] = x.sg.rows.splice(x.r, 1); x.sg.rows.splice(to, 0, it);
    keepDay(x.d, render); markDirty();
    requestAnimationFrame(() => document.querySelector(`[data-mv="${x.d}|${x.g}|${to}|${p[3]}"]`)?.focus());
    return;
  }
  if((b = e.target.closest('#out [data-ddup]'))){
    const d = +b.dataset.ddup, days = ensureCustom(), cp = clone(days[d]);
    cp.name = String(cp.name || `Día ${d + 1}`).replace(/\s*\(copia\)$/, '') + ' (copia)';
    days.splice(d + 1, 0, cp); editDay = d + 1; render(); markDirty();
    document.querySelector(`section.day[data-day="${d + 1}"]`)?.scrollIntoView({block: 'start', behavior: 'smooth'});
    toast('Día duplicado. Cambia el nombre y lo que necesites.'); return;
  }
  if((b = e.target.closest('#edUndo button'))){
    if(!edUndo) return; const {d, g, r, row} = edUndo; edUndo = null;
    const days = ensureCustom(); days[d].segs[g].rows.splice(r, 0, row);
    keepDay(d, render); markDirty(); $('#edUndo').hidden = true; return;
  }
});
function edUndoBar(name){
  let el = $('#edUndo');
  if(!el){ el = document.createElement('div'); el.id = 'edUndo'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.innerHTML = `<span>Quitaste ${esc(String(name || 'el ejercicio').slice(0, 40))}</span><button type="button">Deshacer</button>`;
  el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => { el.hidden = true; edUndo = null; }, 6000);
}

/* ---------- Herramientas de la semana ---------- */
const PROG = [
  ['series', '+1 serie en el trabajo central'],
  ['reps', '+2 repeticiones en el trabajo central'],
  ['rpe', 'RPE +1 (tope 9)'],
  ['iso', 'Isométricos y tiempos +10 s (tope 60 s)']
];
let wkOpen = false, wkSel = {series: true};
function progresar(days, sel){
  days.forEach(day => {
    if(sel.rpe && day.rpe) day.rpe = String(day.rpe).replace(/\d+/g, n => String(Math.min(9, +n + 1)));
    day.segs.forEach(sg => sg.rows.forEach(r => {
      const timed = DOSE_T.test(r.r || '');
      if(sel.series && sg.type === 'central' && (!sg.fmt || sg.fmt.t === 'series') && /\d/.test(r.s || '')) r.s = String(r.s).replace(/\d+/g, n => String(Math.min(6, +n + 1)));
      if(sel.reps && sg.type === 'central' && !timed && /\d/.test(r.r || '')) r.r = stepNum(r.r, 2);
      if(sel.rpe && /RPE\s*\d/i.test(r.c || '')) r.c = String(r.c).replace(/RPE\s*([\d–-]+)/i, (m, v) => 'RPE ' + v.replace(/\d+/g, n => String(Math.min(9, +n + 1))));
      if(sel.iso && timed && (sg.type !== 'central' || /iso|plancha/i.test(r.e))) r.r = String(r.r).replace(/(\d+)(\s*(''|"|s\b|seg))/i, (m, n, u) => Math.min(60, +n + 10) + u);
    }));
  });
  return days;
}
function wkCard(){
  const sems = typeof mcActiva === 'function' && mcActiva(st) ? mcOrden(st.macro.semanas) : null;
  const cur = sems ? mcVista(st) : null, i = cur ? sems.findIndex(w => w.id === cur.id) : -1, next = i >= 0 ? sems[i + 1] : null;
  return `<section class="card wk-card" id="wkCard">
    <button type="button" class="wk-h" data-wk="toggle" aria-expanded="${wkOpen}"><b>Herramientas de la semana</b><span>Progresar${next ? ' · copiar a la siguiente' : ''}</span></button>
    ${wkOpen ? `<div class="wk-b">
      <fieldset class="wk-opts"><legend>Qué subir</legend>${PROG.map(([k, l]) => `<label><input type="checkbox" data-wksel="${k}"${wkSel[k] ? ' checked' : ''}> ${esc(l)}</label>`).join('')}</fieldset>
      <div class="wk-acts">
        <button type="button" data-wk="aplicar">Progresar esta semana</button>
        ${next ? `<button type="button" class="pri" data-wk="copiar">Copiar a ${esc((next.nombre || 'la siguiente').split(' · ')[0])} con progresión</button><button type="button" data-wk="copiar0">Copiar sin cambios</button>` : ''}
      </div>
      <p class="wk-n">Solo cambia los números; los nombres y las notas quedan iguales. Puedes deshacer desde Historial.</p>
    </div>` : ''}
  </section>`;
}
function wkInsert(){
  if(!document.body.classList.contains('fx') || view !== 'plan' || !curId || isExample) return;
  const out = $('#out'); if(!out || out.querySelector('#wkCard')) return;
  const d = out.querySelector(':scope > section.card.day'); if(!d) return;
  const ed = out.querySelector(':scope > .edited'); (ed && ed.nextElementSibling === d ? ed : d).insertAdjacentHTML('beforebegin', wkCard());
}
const _renderEdFacil = render;
render = function(){ const r = _renderEdFacil.apply(this, arguments); try{ wkInsert(); }catch(e){ console.error(e); } return r; };
document.addEventListener('change', e => { const c = e.target.closest('[data-wksel]'); if(c) wkSel[c.dataset.wksel] = c.checked; });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-wk]'); if(!b) return;
  const a = b.dataset.wk;
  if(a === 'toggle'){ wkOpen = !wkOpen; render(); return; }
  if(!Object.values(wkSel).some(Boolean) && a !== 'copiar0'){ toast('Marca al menos un cambio.'); return; }
  if(a === 'aplicar'){ progresar(ensureCustom(), wkSel); wkOpen = false; render(); markDirty(); toast('Semana progresada. Revisa y ajusta lo que quieras.'); return; }
  if(a === 'copiar' || a === 'copiar0'){
    const sems = mcOrden(st.macro.semanas), cur = mcVista(st), next = sems[sems.findIndex(w => w.id === cur.id) + 1]; if(!next) return;
    const k = 'macro|' + next.id;
    if(st.plans?.[k]?.length && !confirm(`${(next.nombre || 'La siguiente semana').split(' · ')[0]} ya tiene días. ¿Reemplazarlos con esta semana?`)) return;
    const days = clone(ensureCustom()); if(a === 'copiar') progresar(days, wkSel);
    st.plans[k] = days; mcSel[curId] = next.id; wkOpen = false; render(); markDirty();
    toast(`Copiada a ${(next.nombre || 'la siguiente semana').split(' · ')[0]}${a === 'copiar' ? ' con progresión' : ''}. Ya la estás viendo.`);
  }
});

/* ---------- Datos ordenados de cada ejercicio (para medir después) ---------- */
function quant(r, day){
  const s = (String(r.s || '').match(/\d+/) || [])[0], rr = String(r.r || ''), timed = DOSE_T.test(rr);
  const nums = (rr.match(/\d+/g) || []).map(Number);
  const rpe = (String(r.c || '').match(/RPE\s*(\d+)/i) || String(day?.rpe || '').match(/(\d+)/) || [])[1];
  const q = {s: s ? +s : null, lado: /c\/u|por lado/i.test(rr) || r.lado === 'Ambas' && /c\/u/.test(rr)};
  if(timed){ q.seg = nums.length ? (/^\D*\d+\s*(min|'(?!'))/i.test(rr) ? nums[0] * 60 : nums[0]) : null; }
  else {
    // "10 + 10''" = 10 reps + 10 s de isométrico; "10+10+10" = 30 reps; "8-8-8-8" = 32 reps
    const iso = rr.match(/\+\s*(\d+)\s*(''|"|s\b)/); if(iso) q.iso = +iso[1];
    const repNums = rr.replace(/\d+\s*(''|"|s\b|seg)/g, '').match(/\d+/g) || [];
    q.reps = repNums.length ? (/[+-]/.test(rr.replace(/\d+\s*(''|"|s\b|seg)/g, '')) && repNums.length > 1 && !/–/.test(rr) ? repNums.map(Number).reduce((a, b) => a + b, 0) : +repNums[0]) : null;
  }
  if(rpe) q.rpe = +rpe;
  return q;
}
function quantPlans(s){
  Object.values(s.plans || {}).forEach(days => Array.isArray(days) && days.forEach(day => (day.segs || []).forEach(sg => (sg.rows || []).forEach(r => { r.q = quant(r, day); }))));
}
const _saveEdFacil = save;
save = async function(){ try{ if(curId && !isExample) quantPlans(st); }catch(e){ console.error('datos', e); } return _saveEdFacil.apply(this, arguments); };
