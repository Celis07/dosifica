/* ===================== MACROCICLO CON FECHAS (nov 2026) =====================
   El fisio le pasa a Claude un macrociclo de varias semanas (por ejemplo un Excel) y Claude lo carga en la ficha.
   - st.macro = {reglas: [texto…], semanas: [{id, desde 'AAAA-MM-DD', nombre, etapa, objetivo, tipo: 'entreno'|'competencia', nota}]}
   - Los días de cada semana viven en st.plans['macro|' + id]: así el editor, las plantillas, el historial y
     "Restablecer" funcionan igual que con cualquier semana (planKey apunta a la semana que se está viendo).
   - Fisio: en Plan, una línea de tiempo con todas las semanas; la de hoy marcada; toca una para verla o editarla.
   - Usuario: ve solo la semana que le toca según la fecha (la última que ya empezó). Cambia sola, sin publicar.
     Las semanas futuras no se le muestran. Las reglas del plan salen en Mi plan. */
let mcSel = {};   // por usuario: id de la semana que el fisio está viendo en Plan
const mcActiva = s => !!(s && s.macro && Array.isArray(s.macro.semanas) && s.macro.semanas.length);
const mcOrden = sems => sems.slice().sort((a, b) => (a.desde || '').localeCompare(b.desde || ''));
function mcDeHoy(sems, hoy){ const o = mcOrden(sems); let cur = null; o.forEach(w => { if(w.desde <= hoy) cur = w; }); return cur || o[0]; }
function mcFin(sems, w){ const o = mcOrden(sems), i = o.indexOf(w), sig = o[i + 1]; return sig ? addDays(sig.desde, -1) : addDays(w.desde, 6); }
function mcFechas(sems, w){
  const f = d => { const x = new Date(d + 'T12:00:00'); return x.getDate() + ' ' + ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][x.getMonth()]; };
  const fin = mcFin(sems, w); return f(w.desde) + ' – ' + f(fin);
}
function mcVista(s){ if(!mcActiva(s)) return null; const sems = s.macro.semanas, id = s === st ? mcSel[curId] : null; return sems.find(w => w.id === id) || mcDeHoy(sems, todayISO()); }

/* La semana del macrociclo que se está viendo es "la semana del plan" para todo lo demás */
const _planKeyMc = planKey;
planKey = function(s){ if(mcActiva(s)) return 'macro|' + mcVista(s).id; return _planKeyMc.apply(this, arguments); };

/* Lo que se publica: todas las semanas con sus días; la app del usuario escoge la de hoy */
const mcDias = days => (days || []).map(d => ({name: d.name, segs: (d.segs || []).map(sg => ({type: sg.type, sub: sg.sub, fmt: sg.fmt, rows: sg.rows.map(r => Object.assign({}, r, {cue: cueOf(r.e), video: videoOf(r.e)}))}))}));
const _planContenidoMc = planContenido;
planContenido = function(){
  const r = _planContenidoMc.apply(this, arguments);
  if(!mcActiva(st)) return r;
  const sems = mcOrden(st.macro.semanas);
  r.contenido.macro = {reglas: st.macro.reglas || [], semanas: sems.map((w, i) => Object.assign({}, w, {n: i + 1, fechas: mcFechas(sems, w), dias: mcDias(st.plans['macro|' + w.id])}))};
  mcAplicar(r.contenido);
  return r;
};

/* Pone en el contenido la semana que toca hoy (también lo usa la app del usuario al abrir) */
function mcAplicar(c){
  if(!c || !c.macro || !c.macro.semanas?.length) return c;
  const w = mcDeHoy(c.macro.semanas, todayISO());
  if(c._mc === w.id + todayISO()) return c;
  c._mc = w.id + todayISO();
  const ini = mcOrden(c.macro.semanas)[0].desde;
  c.dias = w.dias || []; c.semana = Math.floor((new Date(w.desde + 'T12:00:00') - new Date(ini + 'T12:00:00')) / 6048e5) + 1;
  c.fase = 'Macrociclo · ' + (w.nombre || '').replace(/^M\d+\s*·\s*/, ''); c.objetivo = w.objetivo || ''; c.evitar = '';
  c.meso = {l: w.etapa || '', d: w.objetivo || '', k: w.tipo === 'competencia' ? 'torneo' : 'car'};
  return c;
}
const _renderAthleteMc = renderAthlete;
renderAthlete = function(){
  try{ if(A && A.plan && A.plan.contenido) mcAplicar(A.plan.contenido); }catch(e){ console.error(e); }
  const r = _renderAthleteMc.apply(this, arguments);
  try{ mcReglasUsuario(); }catch(e){ console.error(e); }
  return r;
};
function mcReglasUsuario(){
  const c = A.plan?.contenido; if(A.tab !== 'plan' || !c?.macro || $('#athleteApp .mc-ureg')) return;
  const w = mcDeHoy(c.macro.semanas, todayISO()), reg = c.macro.reglas || [];
  const first = $('#athleteApp .ap-body > .ap-card'); if(!first) return;
  first.insertAdjacentHTML('afterend', `${w.nota ? `<section class="ap-card mc-unota"><h3>Esta semana</h3><p>${esc(w.nota)}</p><p class="ap-muted">${esc(w.fechas || '')}</p></section>` : ''}
    ${reg.length ? `<section class="ap-card mc-ureg"><h3>Reglas de tu plan</h3><ul>${reg.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}`);
}

/* ---------- Ficha del fisio: línea de tiempo del macrociclo en Plan ---------- */
function mcCard(){
  const sems = mcOrden(st.macro.semanas), sel = mcVista(st), hoyW = mcDeHoy(sems, todayISO()), hoy = todayISO();
  const chip = w => { const ya = mcFin(sems, w) < hoy, now = w.id === hoyW.id;
    return `<button type="button" role="tab" class="mc-w${now ? ' now' : ''}${ya ? ' ya' : ''}${w.tipo === 'competencia' ? ' comp' : ''}" data-mcw="${esc(w.id)}" aria-selected="${w.id === sel.id}">
      <b>${esc((w.nombre || '').split(' · ')[0])}</b><span>${esc(mcFechas(sems, w))}</span>${now ? '<i>Hoy</i>' : ''}</button>`; };
  const reg = st.macro.reglas || [];
  return `<section class="card mc-card" aria-label="Macrociclo">
    <div class="mc-h"><span class="mc-eye">Macrociclo · ${sems.length} semanas</span>
      <h3>${esc(sel.nombre)}</h3><p>${esc(mcFechas(sems, sel))}${sel.objetivo ? ' · ' + esc(sel.objetivo) : ''}</p>
      <p class="mc-st">${sel.id === hoyW.id ? 'Es la semana que ve el usuario ahora.' : sel.desde > hoy ? 'El usuario la verá desde el ' + esc(mcFechas(sems, sel).split(' – ')[0]) + '.' : 'Semana pasada: queda como registro.'}</p></div>
    <div class="mc-tl" role="tablist" aria-label="Semanas del macrociclo">${sems.map(chip).join('')}</div>
    ${sel.nota ? `<p class="mc-nota">${esc(sel.nota)}</p>` : ''}
    ${reg.length ? `<details class="mc-reg"><summary>Reglas del plan (${reg.length})</summary><ul>${reg.map(t => `<li>${esc(t)}</li>`).join('')}</ul></details>` : ''}
  </section>`;
}
const _renderMc = render;
render = function(){
  const r = _renderMc.apply(this, arguments);
  try{
    const out = $('#out');
    if(out && view === 'plan' && mcActiva(st) && !out.querySelector('.mc-card')){
      const ctx = out.querySelector(':scope > .f2-ctx');
      if(ctx){ ctx.hidden = true; ctx.insertAdjacentHTML('afterend', mcCard()); }
      else { const d = out.querySelector(':scope > section.card.day'); d ? d.insertAdjacentHTML('beforebegin', mcCard()) : out.insertAdjacentHTML('afterbegin', mcCard()); }
      requestAnimationFrame(() => { const tl = out.querySelector('.mc-tl'), on = tl && tl.querySelector('[aria-selected="true"]'); if(on) tl.scrollLeft = Math.max(0, on.offsetLeft - tl.offsetLeft - 16); });
    }
  }catch(e){ console.error(e); }
  return r;
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-mcw]'); if(!b || !curId) return;
  mcSel[curId] = b.dataset.mcw; render();
});
