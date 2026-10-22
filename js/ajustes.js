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
const _genWeekDias = genWeek;
genWeek = function(s){
  const n = nDias(s), b = diasBase(s, n);
  if(b === n) return _genWeekDias.apply(this, arguments);
  return diasAdaptar(_genWeekDias(Object.assign({}, s, {dias: String(b)})), n);
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
