/* ===================== INICIO (panel del fisio) =====================
   Lo primero que ve el fisio al entrar: resumen, lo que requiere atención,
   actividad reciente y sus pacientes. Al tocar un paciente se abre su plan. */
let allSes = [], homeQ = '', fisioNombre = '';
const MOD_L = {rodilla:'Rehab', lumbar:'Rehab', deporte:'Deporte', salud:'Salud'};
const homeVisible = () => !$('#home').hidden;

function showHome(){
  $('#home').hidden=false; $('#work').hidden=true; $('#delConfirm').hidden=true;
  $('#bHome').setAttribute('aria-current','page'); $('#bDel').hidden=true;
  renderSel(); renderHome(); window.scrollTo(0,0);
}
function showWork(){
  if(!$('#home').hidden){ $('#home').hidden=true; $('#work').hidden=false; window.scrollTo(0,0); }
  $('#bHome').removeAttribute('aria-current'); $('#bDel').hidden=false; renderSel();
}
function hace(f){
  if(!f) return 'sin sesiones';
  const d=Math.round((new Date(todayISO()+'T12:00:00')-new Date(f+'T12:00:00'))/864e5);
  return d<=0?'hoy':d===1?'ayer':`hace ${d} días`;
}
function lunesISO(){ const d=new Date(todayISO()+'T12:00:00'); const w=(d.getDay()+6)%7; return daysAgo(w); }
/* Estado del día por paciente: rojo si hay alerta de dolor sin revisar o chequeo en rojo;
   si no, el color del chequeo de hoy; blanco si no respondió (o no tiene acceso al portal). */
const ST_W = {r:300, y:60, n:20, g:0};
const ST_L = {r:'Rojo', y:'Amarillo', g:'Verde', n:'Sin chequeo hoy'};
function dayState(p, al){
  const list = wellBy[p.id] || [], hoy = list.find(x => x.fecha === todayISO()), wl = hoy ? wellLight(list) : null;
  const myAl = alertas.filter(a => a.paciente_id === p.id);
  if(myAl.length) return {k:'r', t:alertWhy(myAl[0]) || 'Alerta de dolor'};
  if(wl){ const why = (wl.why || []).join(', ');
    return {k:wl.c, t: wl.c === 'g' ? 'Chequeo en verde' : `Chequeo en ${wl.c === 'r' ? 'rojo' : 'amarillo'}${why ? ': ' + why : ''}`}; }
  return {k:'n', t: p.email ? 'No respondió el chequeo de hoy' : 'Sin acceso al portal'};
}
function stDetail(i){
  const d = i.ds;
  if(d.k === 'g') return '';
  if(d.k === 'n') return i.p.email ? '' : ' · sin acceso al portal';
  return ' · ' + esc(d.t.replace(/^Chequeo en (rojo|amarillo): ?/, '').replace(/^Chequeo en (rojo|amarillo)$/, 'bienestar bajo'));
}
function patInfo(p){
  const s=Object.assign(blank(), p.st||{}), k=pkey(s), P0=P[k], ph=P0.phases[phaseIdx(s)], sm=p.sum||{};
  const al=alertas.filter(a=>a.paciente_id===p.id).length, wl=wellLight(wellBy[p.id]||[]);
  const red = wl && wl.c==='r' && wl.e.fecha>=daysAgo(1);
  const inact = sm.last ? sm.last<daysAgo(7) : false;
  const consent = !!(consentBy[p.id] || s.consent);
  const ds = dayState(p, al);
  const score = ST_W[ds.k] + al*100 + (p.pend||0)*50 + (red?30:0) + (inact?10:0) + (!consent?5:0);
  return {p, s, mod:modOf(s), cond:subLabel(s,P0), fase:ph.name.split(' · ')[0], sem:s.semPlan, sm, al, red, inact, consent, score, ds};
}
function renderHome(){
  const el=$('#home'); if(!el) return;
  const infos=patients.map(patInfo);
  const act=infos.filter(i=>i.sm.last && i.sm.last>=daysAgo(7)).length;
  const lun=lunesISO(), sesSem=allSes.filter(x=>x.fecha>=lun).length;
  const pend=Object.values(pendingBy).reduce((a,b)=>a+b,0);
  const hoy=new Date().toLocaleDateString('es-CO',{weekday:'long', day:'numeric', month:'long'});
  const nom=(fisioNombre||'').split(' ')[0];

  // Requiere atención
  const att=[];
  alertas.forEach(a=>att.push({k:'r', pid:a.paciente_id, t:alertName(a.paciente_id), d:alertWhy(a)+(a.dia?' · '+a.dia:''), f:a.fecha, view:'ses'}));
  infos.filter(i=>i.p.pend).forEach(i=>att.push({k:'y', pid:i.p.id, t:i.p.nombre, d:`${i.p.pend} solicitud${i.p.pend>1?'es':''} de cambio`, view:'req'}));
  infos.filter(i=>i.red).forEach(i=>att.push({k:'r', pid:i.p.id, t:i.p.nombre, d:'Bienestar en rojo', view:'plan'}));
  infos.filter(i=>i.inact).forEach(i=>att.push({k:'n', pid:i.p.id, t:i.p.nombre, d:`Sin registrar sesión desde ${hace(i.sm.last).replace('hace ','hace ')}`, view:'ses'}));
  infos.filter(i=>!i.consent).forEach(i=>att.push({k:'n', pid:i.p.id, t:i.p.nombre, d:'Falta consentimiento informado', view:'hist'}));

  // Actividad reciente
  const nameOf=id=>(patients.find(p=>p.id===id)||{}).nombre||'Paciente';
  const recent=allSes.slice().sort((a,b)=>(b.created_at||b.fecha||'').localeCompare(a.created_at||a.fecha||'')).slice(0,8);

  // Pacientes (filtro y orden: primero los que necesitan atención)
  const q=homeQ.trim().toLowerCase();
  const list=infos.filter(i=>!q || (i.p.nombre||'').toLowerCase().includes(q) || i.cond.toLowerCase().includes(q))
    .sort((a,b)=> b.score-a.score || (b.sm.last||'').localeCompare(a.sm.last||'') || (a.p.nombre||'').localeCompare(b.p.nombre||''));

  el.innerHTML = `
  <section class="hhero">
    <div><span class="heye">${esc(hoy)}</span><h1>${nom?'Hola, '+esc(nom):'Inicio'}</h1></div>
    <div class="hact"><button class="primary" data-h="new">+ Nuevo paciente</button><button data-h="banco">Banco de ejercicios</button></div>
  </section>
  <section class="hkpis">
    <div class="kpi"><span>Pacientes activos</span><b>${act}<small>/${patients.length}</small></b><i>con sesión en 7 días</i></div>
    <div class="kpi"><span>Sesiones esta semana</span><b>${sesSem}</b><i>desde el lunes</i></div>
    <button class="kpi kbtn${alertas.length?' hot':''}" data-h="alertas"><span>Alertas de dolor</span><b>${alertas.length}</b><i>${alertas.length?'sin revisar':'todo en orden'}</i></button>
    <div class="kpi${pend?' warm':''}"><span>Solicitudes</span><b>${pend}</b><i>por responder</i></div>
  </section>
  <div class="hgrid2">
    <section class="card hpats">
      <div class="rowhead"><h2 class="hsec">Pacientes</h2>
        <label class="hsearch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" id="hq" placeholder="Buscar paciente o condición" aria-label="Buscar paciente" value="${esc(homeQ)}"></label></div>
      <p class="slegend"><span class="st-r"><i></i>Requiere atención</span><span class="st-y"><i></i>Amarillo</span><span class="st-g"><i></i>Verde</span><span class="st-n"><i></i>No respondió el chequeo</span></p>
      ${patients.length ? (list.length ? `<div class="pcards">${list.map(i=>`
        <button class="pcard st-${i.ds.k}" data-open-h="${esc(i.p.id)}">
          <span class="pstate"><span class="sdot" aria-hidden="true"></span><span><b>${ST_L[i.ds.k]}</b>${stDetail(i)}</span></span>
          <span class="ptop"><span class="mtag m-${i.mod}">${MOD_L[i.mod]}</span>${i.al?`<span class="flag r">${i.al} alerta${i.al>1?'s':''}</span>`:''}${i.p.pend?`<span class="flag y">${i.p.pend} solicitud</span>`:''}</span>
          <b class="pname">${esc(i.p.nombre||'Sin nombre')}</b>
          <span class="pcond">${esc(i.cond)}</span>
          <span class="pmeta"><span>${esc(i.fase)} · S${esc(i.sem)}</span><span>Adh. ${esc(i.sm.adh||'—')}</span><span class="${i.sm.dolor>5?'bad':''}">Dolor ${i.sm.dolor!=null?esc(i.sm.dolor)+'/10':'—'}</span></span>
          <span class="plast ${i.inact?'old':''}">Última sesión: ${esc(hace(i.sm.last))}</span>
        </button>`).join('')}</div>` : '<p class="small">Ningún paciente coincide con la búsqueda.</p>')
      : `<div class="empty"><p>Aún no tienes pacientes guardados.</p><button class="primary" data-h="new">Crear el primero</button></div>`}
    </section>
    <div class="hside">
      <section class="card"><h2 class="hsec">Requiere atención</h2>
        ${att.length?`<ul class="hlist">${att.slice(0,10).map(a=>`<li><button data-open-h="${esc(a.pid)}" data-v="${a.view}"><span class="dot ${a.k}" aria-hidden="true"></span><span class="t"><b>${esc(a.t)}</b><i>${esc(a.d)}</i></span><span class="go" aria-hidden="true">›</span></button></li>`).join('')}</ul>`
          :'<p class="small" style="margin:0">Nada pendiente. Aquí verás alertas de dolor, solicitudes, bienestar en rojo y pacientes sin registrar.</p>'}
      </section>
      <section class="card"><h2 class="hsec">Actividad reciente</h2>
        ${recent.length?`<ul class="hlist">${recent.map(s=>`<li><button data-open-h="${esc(s.paciente_id)}" data-v="ses"><span class="t"><b>${esc(nameOf(s.paciente_id))}</b><i>${esc([s.dia, s.srpe!=null?'RPE '+s.srpe:'', s.dolor!=null?'dolor '+s.dolor+'/10':''].filter(Boolean).join(' · '))}</i></span><span class="when">${esc(hace(s.fecha))}</span></button></li>`).join('')}</ul>`
          :'<p class="small" style="margin:0">Cuando tus deportistas registren sesiones, aparecerán aquí.</p>'}
      </section>
    </div>
  </div>`;
}
$('#home').addEventListener('click', e=>{
  const q=s=>e.target.closest(s); let b;
  if((b=q('[data-open-h]'))){ openPatient(b.dataset.openH, b.dataset.v||'plan'); return; }
  if((b=q('[data-h]'))){ const h=b.dataset.h;
    if(h==='new'){ showWork(); $('#bNew').click(); }
    if(h==='banco'){ showWork(); view='banco'; render(); setTimeout(()=>document.querySelector('.rvban,.rvdone,#bq')?.scrollIntoView({block:'start'}),50); }
    if(h==='alertas'){ $('#bAlert').click(); }
  }
});
$('#home').addEventListener('input', e=>{ if(e.target.id==='hq'){ homeQ=e.target.value; const pos=e.target.selectionStart; renderHome(); const i=$('#hq'); i.focus(); try{ i.setSelectionRange(pos,pos); }catch(err){} } });
$('#bHome').onclick=()=>{ loadPatients().then(()=>{ if(homeVisible()) renderHome(); }); showHome(); };

/* El estado del día se refresca solo mientras el panel está abierto */
setInterval(async () => {
  if(typeof me === 'undefined' || me.role !== 'fisio' || !homeVisible() || document.hidden) return;
  try { await Promise.all([loadWellBy(), typeof loadAlerts === 'function' ? loadAlerts() : null]); renderHome(); } catch(e){}
}, 180000);
document.addEventListener('visibilitychange', async () => {
  if(document.hidden || typeof me === 'undefined' || me.role !== 'fisio' || !homeVisible()) return;
  try { await loadWellBy(); renderHome(); } catch(e){}
});
