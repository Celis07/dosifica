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
  const r = _openPatientSg.apply(this, arguments);
  if(id){
    SG.aper[id] = new Date().toISOString(); SG.histOpen = false;
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

/* ---------- Tarjeta en la vista Plan: duración, visto e historial ---------- */
const SG_SEM = [1, 2, 3, 4, 6, 8];
function sgCard(){
  const fin = sgFin(st), dd = fin ? sgDiasA(fin) : null, d = st.dur || {};
  const est = !fin ? 'Sin fecha de cambio' : dd < 0 ? `Terminó el ${sgFecha(fin)}` : dd === 0 ? 'Termina hoy' : dd === 1 ? 'Termina mañana' : `Termina el ${sgFecha(fin)} · te aviso el ${sgFecha(sgAdd(fin, -1))}`;
  const k = !fin ? '' : dd <= 1 ? ' warn' : '';
  const v = SG.vis[curId] || {}, hist = SG.hist[curId] || [];
  const visto = !v.hay ? '' : v.visto && v.act && v.visto >= v.act ? `<span class="sg-vis ok">Visto ${esc(sgHora(v.visto))}</span>`
    : `<span class="sg-vis">Aún no ve la última versión${v.visto ? ` · lo abrió ${esc(sgHora(v.visto))}` : ''}</span>`;
  return `<section class="sg-card fx-w" id="sgCard">
    <div class="sg-top"><span class="sg-k">Duración del plan</span>${visto}</div>
    <div class="sg-chips" role="group" aria-label="Semanas que dura el plan">${SG_SEM.map(n => `<button type="button" data-sgsem="${n}" aria-pressed="${+d.sem === n}">${n} sem</button>`).join('')}<button type="button" data-sgsem="0" aria-pressed="${!fin}">Sin fecha</button></div>
    <div class="sg-row"><span class="sg-est${k}">${esc(est)}</span>${fin ? `<button type="button" class="sg-link" data-sgre="1">Renové el plan hoy</button>` : ''}</div>
    <div class="sg-row"><button type="button" class="sg-link" data-sghist="1" aria-expanded="${SG.histOpen}">Historial del plan${hist.length ? ` · ${hist.length}` : ''}</button></div>
    ${SG.histOpen ? `<div class="sg-hist">${hist.length ? hist.map((x, i) => `<div class="sg-hr"><div><b>${esc(sgHora(x.at))}</b><span>${i === 0 ? 'Versión actual · ' : ''}Semana ${esc(x.semana || '—')}${x.fase ? ' · ' + esc(x.fase) : ''} · ${x.n} ${x.n === 1 ? 'día' : 'días'}</span></div>${i === 0 ? '' : `<button type="button" data-sgrest="${esc(x.id)}">Restaurar</button>`}</div>`).join('')
      : '<p class="sg-vacio">Todavía no hay versiones. Cada vez que guardes el plan queda una aquí (las últimas 10).</p>'}</div>` : ''}
  </section>`;
}
function sgInsert(){
  if(!document.body.classList.contains('fx') || !curId || isExample || view !== 'plan') return;
  const out = $('#out'); if(!out || out.querySelector('#sgCard')) return;
  const hd = out.querySelector('.fx-fhead');
  hd ? hd.insertAdjacentHTML('afterend', sgCard()) : out.insertAdjacentHTML('afterbegin', sgCard());
}
const _renderSg = render;
render = function(){ const r = _renderSg.apply(this, arguments); try{ sgInsert(); }catch(e){ console.error(e); } return r; };
document.addEventListener('click', async e => {
  let b;
  if((b = e.target.closest('[data-sgsem]'))){
    const n = +b.dataset.sgsem;
    st.dur = n ? {sem: n, desde: (st.dur?.desde && +st.dur.sem) ? st.dur.desde : todayISO()} : null;
    await save(true); render(); toast(n ? `Plan de ${n} ${n === 1 ? 'semana' : 'semanas'}: termina el ${sgFecha(sgFin(st))}.` : 'Plan sin fecha de cambio.'); return;
  }
  if((b = e.target.closest('[data-sgre]'))){ if(st.dur) st.dur.desde = todayISO(); await save(true); render(); toast('Listo: cuenta desde hoy.'); return; }
  if((b = e.target.closest('[data-sghist]'))){ SG.histOpen = !SG.histOpen; render(); return; }
  if((b = e.target.closest('[data-sgrest]'))){ sgRestaurar(b.dataset.sgrest); return; }
});

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
