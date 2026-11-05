/* ===================== SEGUIMIENTO DEL PLAN (nov 2026) =====================
   1. Usuarios ordenados por la última vez que el fisio abrió su ficha (tabla aperturas, igual en todos sus dispositivos).
   2. Historial del plan: cada guardado deja una versión (las últimas 10); se restaura con un toque.
      Guardados seguidos en menos de 10 minutos se juntan en una sola versión.
   3. Visto: el usuario marca cuándo vio su plan (marcar_plan_visto); el fisio ve si ya vio la última versión.
   4. Duración del plan: el fisio elige cuántas semanas dura (st.dur = {sem, desde}); la función push le avisa
      un día antes de que termine y el Inicio muestra los planes por actualizar. */

const SG = {aper: {}, vis: {}, hist: {}, histSig: {}, histOpen: false, lastV: {}, vistoT: 0};
const sgAdd = (iso, k) => { const x = new Date(iso + 'T12:00:00'); x.setDate(x.getDate() + k); return x.toISOString().slice(0, 10); };
const sgFecha = iso => { try{ return new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', {weekday: 'short', day: 'numeric', month: 'short'}); }catch(e){ return iso; } };
const sgCorta = iso => { try{ return new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', {day: 'numeric', month: 'short'}).replace('.', ''); }catch(e){ return iso; } };
const sgHora = ts => { try{ const d = new Date(ts), hoy = new Date().toDateString() === d.toDateString(), ay = new Date(Date.now() - 864e5).toDateString() === d.toDateString();
  const h = d.toLocaleTimeString('es-CO', {hour: 'numeric', minute: '2-digit'}); return hoy ? `hoy ${h}` : ay ? `ayer ${h}` : d.toLocaleDateString('es-CO', {day: 'numeric', month: 'short'}) + ' ' + h; }catch(e){ return ''; } };
/* Último día del plan: desde + semanas × 7 − 1. El aviso llega el día anterior a ese. */
function sgFin(s){ const d = s?.dur; if(!d || !(+d.sem > 0) || !d.desde) return null; return sgAdd(d.desde, +d.sem * 7 - 1); }   // último día del plan
function sgDiasA(fin){ return Math.round((new Date(fin + 'T12:00:00') - new Date(todayISO() + 'T12:00:00')) / 864e5); }

/* ---------- 1 · Aperturas ---------- */
async function sgLoadAper(){
  try{ const {data} = await sb.from('aperturas').select('paciente_id,at'); SG.aper = {}; (data || []).forEach(r => { SG.aper[r.paciente_id] = r.at; }); }catch(e){}
}
const _loadPatientsSg = loadPatients;
loadPatients = async function(){
  const r = await _loadPatientsSg.apply(this, arguments);
  await sgLoadAper();
  try{ const {data} = await sb.from('pacientes').select('id,plan_visto_at'); (data || []).forEach(p => { SG.vis[p.id] = Object.assign(SG.vis[p.id] || {}, {visto: p.plan_visto_at}); }); }catch(e){}
  if(typeof renderHome === 'function' && document.body.classList.contains('fx')) try{ renderHome(); }catch(e){}
  return r;
};
const _openPatientSg = openPatient;
openPatient = function(id){
  if(id){ SG.histOpen = false; SG.durOpen = false; }
  const r = _openPatientSg.apply(this, arguments);
  if(id){
    SG.aper[id] = new Date().toISOString();
    sb.from('aperturas').upsert({paciente_id: id, at: SG.aper[id]}, {onConflict: 'fisio_email,paciente_id'}).then(() => {}, () => {});
    sgLoadPaciente(id);
  }
  return r;
};
async function sgLoadPaciente(id){
  try{
    const [{data: pl}, {data: pv}, {data: hv}] = await Promise.all([
      sb.from('planes').select('actualizado_at,publicado_at').eq('paciente_id', id).order('publicado_at', {ascending: false}).limit(1),
      sb.from('pacientes').select('plan_visto_at').eq('id', id).maybeSingle(),
      sb.from('plan_versiones').select('id,created_at,semana,fase,clave,dias').eq('paciente_id', id).order('created_at', {ascending: false}).limit(10)
    ]);
    SG.vis[id] = {act: pl?.[0]?.actualizado_at || pl?.[0]?.publicado_at || null, visto: pv?.plan_visto_at || null, hay: !!pl?.length};
    SG.hist[id] = (hv || []).map(v => ({id: v.id, at: v.created_at, semana: v.semana, fase: v.fase, clave: v.clave, n: Array.isArray(v.dias) ? v.dias.length : 0}));
    SG.histSig[id] = hv?.[0] ? JSON.stringify(hv[0].dias) : null;
    SG.lastV[id] = null;
    if(id === curId) render();
  }catch(e){ console.error('seguimiento', e); }
}

/* ---------- 2 · Historial: una versión por guardado ---------- */
async function sgSnapshot(){
  if(!curId || isExample || editMode || typeof baseWeek !== 'function') return;
  const id = curId; let days;
  try{ days = baseWeek(st).days; }catch(e){ return; }
  const sig = JSON.stringify(days);
  if(SG.histSig[id] === sig) return;
  let fase = ''; try{ fase = planContenido().ph.name; }catch(e){}
  const row = {paciente_id: id, clave: planKey(st), semana: String(st.semPlan || ''), fase, dias: clone(days)};
  const last = SG.lastV[id];
  let res;
  if(last && Date.now() - last.t < 10 * 60e3) res = await sb.from('plan_versiones').update(Object.assign({}, row, {created_at: new Date().toISOString()})).eq('id', last.id).select('id,created_at').single();
  else res = await sb.from('plan_versiones').insert(row).select('id,created_at').single();
  if(res.error){ console.error('historial', res.error); return; }
  SG.histSig[id] = sig; SG.lastV[id] = {id: res.data.id, t: Date.now()};
  const h = (SG.hist[id] || []).filter(v => v.id !== res.data.id);
  SG.hist[id] = [{id: res.data.id, at: res.data.created_at, semana: row.semana, fase, clave: row.clave, n: days.length}, ...h].slice(0, 10);
  if(id === curId && SG.histOpen) render();
}
const _saveSg = save;
save = async function(){
  const r = await _saveSg.apply(this, arguments);
  try{ await sgSnapshot(); }catch(e){}
  if(curId && SG.vis[curId]) SG.vis[curId].act = new Date().toISOString();   // al guardar se actualiza su plan publicado
  return r;
};
async function sgRestaurar(vid){
  const v = (SG.hist[curId] || []).find(x => x.id === vid); if(!v) return;
  const otra = v.clave && v.clave !== planKey(st);
  if(!confirm(`¿Volver al plan guardado ${sgHora(v.at)}?${otra ? ' Era de otra fase o semana; quedará como el plan de la fase actual.' : ''} La versión actual queda en el historial.`)) return;
  const {data, error} = await sb.from('plan_versiones').select('dias').eq('id', vid).maybeSingle();
  if(error || !Array.isArray(data?.dias)){ toast('No se pudo leer esa versión.'); return; }
  st.plans = st.plans || {}; st.plans[planKey(st)] = clone(data.dias);
  SG.lastV[curId] = null;
  await save(true); render(); toast('Plan restaurado. Ya lo ve así en su app.');
}

/* ---------- En la ficha: Visto y Duración como etiquetas de estado; historial al final del plan ---------- */
const SG_SEM = [1, 2, 3, 4, 6, 8];
SG.durOpen = false;
function sgDurTxt(){
  const fin = sgFin(st); if(!fin) return {t: 'Duración', k: 'vacia'};
  const dd = sgDiasA(fin), sem = +st.dur.sem;
  return {t: dd < 0 ? `${sem} sem · terminó` : dd === 0 ? `${sem} sem · termina hoy` : dd === 1 ? `${sem} sem · termina mañana` : `${sem} sem · hasta ${sgCorta(fin)}`, k: dd <= 1 ? 'warn' : ''};
}
function sgTags(){
  const tags = document.querySelector('#out .fx-fhead .fx-tags'); if(!tags || tags.querySelector('.sg-dur')) return;
  const v = SG.vis[curId] || {}, d = sgDurTxt();
  let html = '';
  if(v.hay) html += v.visto && v.act && v.visto >= v.act ? `<span class="fx-tag sg-vis ok" title="Vio la última versión de su plan">Visto ${esc(sgHora(v.visto))}</span>`
    : `<span class="fx-tag sg-vis" title="${v.visto ? 'Lo abrió por última vez ' + esc(sgHora(v.visto)) : 'Todavía no abre su plan'}">Sin ver</span>`;
  html += `<button type="button" class="fx-tag sg-dur ${d.k}" data-sgdur="1" aria-expanded="${SG.durOpen}" aria-controls="sgPan">${d.k === 'vacia' ? '+ ' : ''}${esc(d.t)}</button>`;
  tags.insertAdjacentHTML('beforeend', html);
  if(SG.durOpen){
    const fin = sgFin(st), cur = +(st.dur?.sem || 0);
    tags.insertAdjacentHTML('afterend', `<div class="sg-pan" id="sgPan" role="group" aria-label="Duración del plan">
      <div class="sg-chips">${SG_SEM.map(n => `<button type="button" data-sgsem="${n}" aria-pressed="${fin && cur === n}">${n} ${n === 1 ? 'semana' : 'semanas'}</button>`).join('')}</div>
      <p class="sg-nota">${fin ? `Termina el ${esc(sgFecha(fin))}. Te aviso el día anterior.` : 'Cuenta desde hoy. Te aviso un día antes de que termine.'}</p>
      ${fin ? `<div class="sg-acts"><button type="button" data-sgre="1">Renové el plan hoy</button><button type="button" data-sgsem="0">Quitar fecha</button></div>` : ''}
    </div>`);
  }
}
function sgHist(){
  if(view !== 'plan') return;
  const tpl = $('#bTpl') || $('#bXls'); if(!tpl) return;
  const row = tpl.parentElement;
  if(!row.querySelector('#bHist')) row.insertAdjacentHTML('beforeend', `<button type="button" id="bHist" data-sghist="1" aria-expanded="${SG.histOpen}" aria-controls="sgHist">Historial</button>`);
  if(!SG.histOpen || $('#sgHist')) return;
  const hist = SG.hist[curId] || [];
  row.insertAdjacentHTML('afterend', `<section class="sg-histp fx-w" id="sgHist" aria-label="Historial del plan">
    <div class="sg-hh"><b>Historial del plan</b><button type="button" class="sg-x" data-sghist="1" aria-label="Cerrar historial">Cerrar</button></div>
    <p class="sg-nota">Cada vez que guardas queda una versión. Se conservan las últimas 10.</p>
    ${hist.length ? `<div class="sg-hist">${hist.map((x, i) => `<div class="sg-hr"><div><b>${esc(sgHora(x.at))}</b><span>${i === 0 ? 'Versión actual · ' : ''}Semana ${esc(x.semana || '—')}${x.fase ? ' · ' + esc(x.fase) : ''} · ${x.n} ${x.n === 1 ? 'día' : 'días'}</span></div>${i === 0 ? '' : `<button type="button" data-sgrest="${esc(x.id)}">Restaurar</button>`}</div>`).join('')}</div>`
      : '<p class="sg-nota">Todavía no hay versiones guardadas.</p>'}
  </section>`);
}
function sgInsert(){
  if(!document.body.classList.contains('fx') || !curId || isExample) return;
  sgTags(); sgHist();
}
const _renderSg = render;
render = function(){ const r = _renderSg.apply(this, arguments); try{ sgInsert(); }catch(e){ console.error(e); } return r; };
document.addEventListener('click', async e => {
  let b;
  if((b = e.target.closest('[data-sgdur]'))){ SG.durOpen = !SG.durOpen; render(); if(SG.durOpen) $('#sgPan button')?.focus(); return; }
  if((b = e.target.closest('[data-sgsem]'))){
    const n = +b.dataset.sgsem;
    st.dur = n ? {sem: n, desde: (st.dur?.desde && +st.dur.sem) ? st.dur.desde : todayISO()} : null;
    SG.durOpen = false; await save(true); render();
    toast(n ? `Plan de ${n} ${n === 1 ? 'semana' : 'semanas'}: termina el ${sgFecha(sgFin(st))}.` : 'Plan sin fecha de cambio.'); return;
  }
  if((b = e.target.closest('[data-sgre]'))){ if(st.dur) st.dur.desde = todayISO(); SG.durOpen = false; await save(true); render(); toast(`Cuenta desde hoy: termina el ${sgFecha(sgFin(st))}.`); return; }
  if((b = e.target.closest('[data-sghist]'))){ SG.histOpen = !SG.histOpen; render(); if(SG.histOpen) $('#sgHist')?.scrollIntoView({block: 'start', behavior: 'smooth'}); else $('#bHist')?.focus(); return; }
  if((b = e.target.closest('[data-sgrest]'))){ sgRestaurar(b.dataset.sgrest); return; }
});
document.addEventListener('keydown', e => { if(e.key === 'Escape' && SG.durOpen){ SG.durOpen = false; render(); $('[data-sgdur]')?.focus(); } });

/* ---------- Inicio del fisio: planes por actualizar ---------- */
const _renderHomeSg = renderHome;
renderHome = function(){
  const r = _renderHomeSg.apply(this, arguments);
  try{
    const home = $('#home'); if(!home || typeof FX === 'undefined' || FX.tab !== 'inicio' || home.querySelector('.sg-home')) return r;
    const lst = patients.map(p => ({p, fin: sgFin(p.st)})).filter(x => x.fin && sgDiasA(x.fin) <= 1).sort((a, b) => a.fin.localeCompare(b.fin));
    if(!lst.length) return r;
    const html = `<section class="fx-sec sg-home"><h2 class="sg-h">Planes por actualizar</h2><div class="fx-list">${lst.map(x => { const dd = sgDiasA(x.fin);
      return `<div class="fx-row"><button type="button" class="fx-rb" data-fxopen="${esc(x.p.id)}" data-fxv="plan"><i class="fx-d ${dd < 0 ? 'r' : 'y'}"></i><span class="fx-rt"><b>${esc(x.p.nombre)}</b><span>${dd < 0 ? `Terminó hace ${-dd} ${dd === -1 ? 'día' : 'días'}` : dd === 0 ? 'Termina hoy' : 'Termina mañana'} · ${esc(x.p.st.dur.sem)} ${+x.p.st.dur.sem === 1 ? 'semana' : 'semanas'}</span></span></button></div>`; }).join('')}</div></section>`;
    const anchor = home.querySelector('.fx-mk') || home.querySelector('.fx-hd');
    anchor ? anchor.insertAdjacentHTML('afterend', html) : home.querySelector('.fx-page')?.insertAdjacentHTML('afterbegin', html);
  }catch(e){ console.error(e); }
  return r;
};

/* ---------- App del usuario: marca que vio su plan ---------- */
if(typeof renderAthlete === 'function'){
  const _renderAthleteSg = renderAthlete;
  renderAthlete = function(){
    const r = _renderAthleteSg.apply(this, arguments);
    try{
      const hasW = (wellness || []).some(x => x.fecha === todayISO());   // el plan solo se ve después del chequeo
      if(A?.p?.id && A.plan && hasW && Date.now() - SG.vistoT > 20 * 60e3){ SG.vistoT = Date.now(); sb.rpc('marcar_plan_visto', {pid: A.p.id}).then(() => {}, () => {}); }
    }catch(e){}
    return r;
  };
}
