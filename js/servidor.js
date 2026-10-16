/* ===================== ALMACENAMIENTO (SUPABASE) ===================== */
const SB_URL='https://pxttepssphezwptpgdvw.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dHRlcHNzcGhlendwdHBnZHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzOTY2NTUsImV4cCI6MjEwNjk3MjY1NX0.aVcozH1keMxEMdVlpRJ8i1rjVLzqOab-xj0uuSNTkI8';
const sb = supabase.createClient(SB_URL, SB_KEY, {auth:{persistSession:true, detectSessionInUrl:true}});
let me = {email:null, uid:null, role:null}, solicitudes = [], pendingBy = {}, sumBy = {};
function toast(t){ const el=$('#toast'); el.textContent=t; el.hidden=false; clearTimeout(el._t); el._t=setTimeout(()=>el.hidden=true, 2600); }
function saveBlob(blob, fname){ const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=fname; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 4000); }
let dirtyT;
function markDirty(){ if(!curId) return; $('#saveState').textContent='Cambios sin guardar…'; clearTimeout(dirtyT); dirtyT=setTimeout(()=>save(true), 1500); }

function renderSel(){
  const sel=$('#psel');
  const opts = patients.slice().sort((a,b)=> (b.updated||'').localeCompare(a.updated||'')).map(p=>`<option value="${esc(p.id)}">${esc(p.nombre||'Sin nombre')}${pendingBy[p.id]?` (${pendingBy[p.id]} solicitud${pendingBy[p.id]>1?'es':''})`:''}</option>`).join('');
  sel.innerHTML = ((typeof homeVisible==='function' && homeVisible()) ? '<option value="">Abrir paciente…</option>' : isExample ? '<option value="">Ejemplo (sin guardar)</option>' : (curId ? '' : '<option value="">Paciente sin guardar</option>')) + opts;
  sel.value = (typeof homeVisible==='function' && homeVisible()) ? '' : (curId||'');
}
async function loadPatients(){
  const {data, error} = await sb.from('pacientes').select('id,nombre,email,estado,consent,updated_at').order('updated_at',{ascending:false});
  if(error){ toast('No se pudieron cargar los pacientes.'); return; }
  patients = (data||[]).map(p=>({id:p.id, nombre:p.nombre, email:p.email, st:Object.assign({}, p.estado, {nombre:(p.estado&&p.estado.nombre)||p.nombre, email:p.email||'', consent:p.consent}), updated:p.updated_at}));
  const [{data:ses},{data:sol}] = await Promise.all([
    sb.from('sesiones').select('id,paciente_id,fecha,dolor,semana,dia,srpe,autor,created_at').order('fecha',{ascending:false}).limit(2000),
    sb.from('solicitudes').select('paciente_id').eq('estado','pendiente')
  ]);
  allSes=ses||[]; sumBy={}; (ses||[]).forEach(x=>{ const s=sumBy[x.paciente_id]||(sumBy[x.paciente_id]={last:x.fecha, dolor:x.dolor, byWeek:{}}); s.byWeek[x.semana]=(s.byWeek[x.semana]||0)+1; });
  pendingBy={}; (sol||[]).forEach(x=>{ pendingBy[x.paciente_id]=(pendingBy[x.paciente_id]||0)+1; });
  patients.forEach(p=>{ const s=sumBy[p.id]; const w=num(p.st?.semPlan)||1, n=nDias(p.st||{}); p.sum = s ? {last:s.last, dolor:s.dolor, adh:`${s.byWeek[w]||0}/${n}`} : {adh:`0/${n}`}; p.pend = pendingBy[p.id]||0; });
  await loadWellBy();
  renderSel();
}
async function loadLib(){
  const {data} = await sb.from('biblioteca').select('nombre,cue,video,bloque,region,fx,im,tn,kneel,uni,oculto,revisado,eliminado');
  const baseNames = new Set(BANCO_BASE.map(r=>r[0]));
  myLib=(data||[]).filter(r=>!baseNames.has(r.nombre)).map(r=>r.nombre);
  myMeta=Object.fromEntries((data||[]).map(r=>[r.nombre,{cue:r.cue||'',video:r.video||'',bloque:r.bloque,region:r.region,fx:r.fx,im:r.im,tn:r.tn,kneel:r.kneel,uni:r.uni,oculto:r.oculto,revisado:r.revisado,eliminado:r.eliminado}]));
  buildBanco(); renderLib();
}
async function saveLib(only){
  const names=(only?[only]:[...new Set([...myLib, ...Object.keys(myMeta)])]).filter(Boolean);
  const rows=names.map(n=>{ const m=myMeta[n]||{}; return {nombre:n, cue:m.cue||null, video:(m.video||'').trim()||null, bloque:m.bloque||null, region:m.region||null, fx:m.fx??null, im:m.im??null, tn:m.tn??null, kneel:m.kneel??null, uni:m.uni??null, oculto:!!m.oculto, revisado:!!m.revisado, eliminado:!!m.eliminado, updated_at:new Date().toISOString()}; });
  if(!rows.length) return;
  const {error}=await sb.from('biblioteca').upsert(rows,{onConflict:'fisio_email,nombre'});
  if(error) toast(/video/.test(error.message)?'El enlace del video debe empezar por http:// o https://':'No se pudo guardar la biblioteca.');
}
async function save(quiet){
  const name=(st.nombre||'').trim();
  if(!name){ if(!quiet){ toast('Escribe el nombre del deportista antes de guardar'); $('#nombre').focus(); } return; }
  if(isExample && name==='Ejemplo · LCA HTH'){ if(!quiet){ toast('Cambia el nombre del ejemplo antes de guardarlo'); $('#nombre').focus(); } return; }
  const email=(st.email||'').trim().toLowerCase();
  if(email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ if(!quiet) toast('El correo del deportista no es válido.'); return; }
  const estado=clone(st); delete estado.email; delete estado.consent;
  const row={nombre:name, email: email||null, estado, consent:!!st.consent};
  let res;
  if(curId) res = await sb.from('pacientes').update(row).eq('id',curId).select('id,updated_at').single();
  else res = await sb.from('pacientes').insert(row).select('id,updated_at').single();
  if(res.error){ $('#saveState').textContent='No se pudo guardar'; if(!quiet) toast(/pacientes_email_unico|duplicate/.test(res.error.message)?'Ese correo ya está asignado a otro paciente.':'No se pudo guardar. Revisa la conexión e inténtalo de nuevo.'); return; }
  const wasNew=!curId; curId=res.data.id; isExample=false;
  const p={id:curId, nombre:name, email, st:clone(st), updated:res.data.updated_at, sum:(patients.find(x=>x.id===curId)||{}).sum};
  const i=patients.findIndex(x=>x.id===curId); if(i<0) patients.push(p); else patients[i]=p;
  renderSel(); $('#saveState').textContent='Guardado';
  if(wasNew){ sessions=[]; evals=[]; solicitudes=[]; render(); }
  if(!quiet) toast('Guardado');
}
async function loadSubs(){
  if(!curId){ return; }
  const [a,b,c] = await Promise.all([
    sb.from('sesiones').select('*').eq('paciente_id',curId).order('fecha',{ascending:false}),
    sb.from('evaluaciones').select('*').eq('paciente_id',curId).order('fecha'),
    sb.from('solicitudes').select('*').eq('paciente_id',curId).order('created_at',{ascending:false})
  ]);
  sessions = a.data||[];
  evals = (b.data||[]).map(r=>Object.assign({}, r.datos, {id:r.id, fecha:r.fecha}));
  solicitudes = c.data||[];
  render();
}
async function delSub(name, id){
  const {error} = await sb.from(name).delete().eq('id', id);
  if(error){ toast('No se pudo borrar.'); return; }
  if(name==='sesiones') sessions=sessions.filter(x=>x.id!==id); else evals=evals.filter(x=>x.id!==id);
  render(); toast('Borrado');
}
function collectLog(day){
  const ex=[]; day.segs.forEach(sg=>sg.rows.forEach(r=>{ if(isLoggable(sg,r)) ex.push({e:r.e}); }));
  document.querySelectorAll('[data-lx]').forEach(inp=>{ const k=+inp.dataset.lx; const v=num(inp.value); if(v!=null && ex[k]) ex[k][inp.dataset.lf]=v; });
  const clamp=(v,a,b)=> v==null?null:Math.max(a,Math.min(b,Math.round(v)));
  return {fecha:$('#lf-fecha').value||todayISO(), dia:day.name, min:clamp(num($('#lf-min').value),0,600), srpe:clamp(num($('#lf-srpe').value),0,10), dolor:clamp(num($('#lf-dolor').value),0,10),
    d24:$('#lf-d24').value||'', nota:($('#lf-nota').value||'').slice(0,2000), ex:ex.filter(x=>x.kg!=null||x.rpe!=null||x.reps!=null)};
}
async function saveSession(di){
  if(!curId){ toast('Guarda el paciente antes de registrar sesiones.'); return; }
  const day=viewWeek(st).days[di];
  const row=Object.assign(collectLog(day), {paciente_id:curId, semana:num(st.semPlan)||1, fase:P[pkey(st)].phases[phaseIdx(st)].name.split(' · ')[0], autor:'fisio'});
  const {data,error}=await sb.from('sesiones').insert(row).select('*').single();
  if(error){ toast('No se pudo registrar la sesión.'); return; }
  sessions.unshift(data);
  if(data.dolor!=null) st.dolor=data.dolor; if(data.d24) st.resp24=data.d24; fillForm();
  logOpen=null; await save(true); render(); toast('Sesión registrada');
}
async function saveEval(){
  if(!curId){ toast('Guarda el paciente antes de registrar evaluaciones.'); return; }
  const prom={}; promsFor(st).forEach(k=>{ const v=num($('#ev-'+k).value); if(v!=null) prom[k]=Math.max(0,Math.min(100,v)); });
  const datos={semana:num(st.semPlan)||1, fase:P[pkey(st)].phases[phaseIdx(st)].name.split(' · ')[0], dolor:st.dolor, der:st.derrame, flex:num(st.flexL), ext:num(st.extDef), chk:clone(st.chk||{}), prom};
  const {data,error}=await sb.from('evaluaciones').insert({paciente_id:curId, fecha:$('#ev-fecha').value||todayISO(), datos}).select('*').single();
  if(error){ toast('No se pudo guardar la evaluación.'); return; }
  evals.push(Object.assign({}, data.datos, {id:data.id, fecha:data.fecha})); evalOpen=false; render(); toast('Evaluación guardada');
}
async function publishPlan(){
  if(!curId){ await save(false); if(!curId) return; }
  if(!(st.email||'').trim()){ toast('Agrega el correo del deportista para que pueda entrar a ver su plan.'); $('#pemail').focus(); return; }
  await save(true);
  const key=pkey(st), P0=P[key], ph=P0.phases[phaseIdx(st)], m=mesoWeek(st);
  const dias = applyMeso(baseWeek(st).days, st).map(d=>({name:d.name, segs:d.segs.map(sg=>({type:sg.type, sub:sg.sub, fmt:sg.fmt, rows:sg.rows.map(r=>Object.assign({}, r, {cue:cueOf(r.e), video:videoOf(r.e)}))}))}));
  const wk=[]; for(let w=curWeek(st); w<curWeek(st)+6; w++){ const k=weekKind(st,w); wk.push({w, ini:weekStart(st,w), l:k.wt.l, k:k.wt.k, t:k.t.map(t=>({n:t.n,f:t.f,p:t.p}))}); }
  const tools=[]; if(ph.tools.includes('iso')) tools.push('Isometría: 5 × 45 s con la rodilla a 60° (RPE 6–7), antes de entrenar o si duele.'); if(ph.tools.includes('bfr')) tools.push('BFR solo supervisado y con manguito: 30-15-15-15 reps con carga muy ligera.'); if(ph.tools.includes('mi')) tools.push('Imaginería y observación de video: 10–15 min, 3–5 veces por semana.');
  const contenido={nombre:st.nombre, condicion:subLabel(st,P0), modulo:modOf(st), rodilla:st.lado==='der'?'derecha':'izquierda', deporte:st.deporte||'', fase:ph.name, objetivo:ph.goal, evitar:ph.avoid||'', semana:num(st.semPlan)||1, meso:{l:m.l,d:m.d,k:m.k}, semanas:wk, dias, tools, vivo:!st.vivoOff};
  const {error}=await sb.from('planes').insert({paciente_id:curId, semana:contenido.semana, fase:ph.name, titulo:`Semana ${contenido.semana}`, contenido});
  if(error){ toast('No se pudo publicar el plan.'); return; }
  toast(`Plan de la semana ${contenido.semana} publicado: ya lo ve ${st.email}`);
}
async function answerReq(id, estado){
  const resp=(document.querySelector(`[data-resp="${id}"]`)?.value||'').trim().slice(0,2000);
  const {error}=await sb.from('solicitudes').update({estado, respuesta:resp||null, resuelta_at:new Date().toISOString()}).eq('id',id);
  if(error){ toast('No se pudo responder.'); return; }
  const r=solicitudes.find(x=>x.id===id); if(r){ r.estado=estado; r.respuesta=resp; }
  pendingBy[curId]=Math.max(0,(pendingBy[curId]||1)-1); renderSel(); render(); toast(estado==='aprobada'?'Solicitud aprobada':'Solicitud rechazada');
}
function requestsView(){
  const est={pendiente:'<span class="pill y">Pendiente</span>',aprobada:'<span class="pill g">Aprobada</span>',rechazada:'<span class="pill r">Rechazada</span>'};
  if(!curId) return '<section class="card"><p class="small">Guarda el paciente para recibir solicitudes.</p></section>';
  return `<section class="card"><h3 class="sec">Solicitudes de cambio del deportista</h3>
  <p class="small">Si apruebas un cambio, edita el plan y publícalo de nuevo; la respuesta le llega al deportista en su portal.</p>
  ${solicitudes.length? solicitudes.map(r=>`<div class="req"><div class="reqh">${est[r.estado]||''}<span class="small">${esc((r.created_at||'').slice(0,10))}</span></div><p>${esc(r.texto)}</p>
    ${r.estado==='pendiente'?`<label class="f">Respuesta<input type="text" data-resp="${esc(r.id)}" placeholder="Opcional"></label><div class="actions"><button class="primary" data-ans="${esc(r.id)}|aprobada">Aprobar</button><button data-ans="${esc(r.id)}|rechazada">Rechazar</button></div>`:(r.respuesta?`<p class="small"><b>Tu respuesta:</b> ${esc(r.respuesta)}</p>`:'')}</div>`).join('') : '<p class="small">No hay solicitudes.</p>'}
  </section>`;
}
function openPatient(id, toView){
  const p=patients.find(x=>x.id===id); if(!p) return; showWork();
  st = Object.assign(blank(), clone(p.st||{})); curId=id; isExample=false; editMode=false; logOpen=null; evalOpen=false; subOpen=null;
  sessions=[]; evals=[]; solicitudes=[]; if(toView) view=toView;
  wellness=[]; wellOpen=false;
  fillForm(); render(); renderSel(); $('#saveState').textContent=''; loadSubs(); loadHistoria(); loadWellness().then(()=>{ if(curId===id) render(); });
}
$('#psel').addEventListener('change', e=>{ if(e.target.value) openPatient(e.target.value); });
$('#bNew').onclick=()=>{ showWork(); st=blank(); curId=null; isExample=false; editMode=false; sessions=[]; evals=[]; solicitudes=[]; view='plan'; fillForm(); render(); renderSel(); $('#saveState').textContent=''; $('#nombre').focus(); };
$('#bDel').onclick=()=>{ if(!curId){ toast('Este paciente no está guardado'); return; } $('#delTxt').textContent=`¿Eliminar a ${st.nombre||'este paciente'} con sus planes, sesiones y evaluaciones? No se puede deshacer.`; $('#delConfirm').hidden=false; };
$('#bDelNo').onclick=()=>{ $('#delConfirm').hidden=true; };
$('#bDelYes').onclick=async()=>{
  $('#delConfirm').hidden=true;
  const {error}=await sb.from('pacientes').delete().eq('id',curId);
  if(error){ toast('No se pudo eliminar.'); return; }
  patients=patients.filter(p=>p.id!==curId);
  st=clone(EXAMPLE); curId=null; isExample=true; sessions=clone(EX_SESSIONS); evals=clone(EX_EVALS); solicitudes=[]; fillForm(); render(); renderSel(); toast('Paciente eliminado');
};
$('#out').addEventListener('click', e=>{
  const b=e.target.closest('[data-ans]'); if(b){ const [id,estado]=b.dataset.ans.split('|'); answerReq(id, estado); return; }
  if(e.target.closest('#bPub')) publishPlan();
  if(e.target.closest('[data-view="ses"]') || e.target.closest('[data-view="req"]')) loadSubs();
  if(e.target.closest('[data-view="panel"]')) loadPatients().then(()=>{ if(view==='panel') render(); });
});

/* ===================== PORTAL DEL DEPORTISTA ===================== */
let A = {p:null, plan:null, open:null, reqOpen:false};
function aRow(r){
  const sug=suggestion(r);
  const rod = (A.plan?.contenido?.modulo||'rodilla')==='rodilla';
  return `<tr><td class="e">${r.ter?'<span class="ter" title="Terapia">T</span>':''}${r.video?`<a href="${esc(r.video)}" target="_blank" rel="noopener">${esc(r.e)}</a>`:esc(r.e)}${r.cue?`<div class="cue">${esc(r.cue)}</div>`:''}${sug?`<div class="sug">${esc(sug)}</div>`:''}</td>${rod?`<td class="ld">${ladoTag(r.lado)}</td>`:''}<td class="s">${esc(r.s)}</td><td class="r">${esc(r.r)}</td><td class="c">${esc(r.c)}</td><td class="n">${esc(r.n)}</td></tr>`;
}
function renderAthlete(){
  const c=A.plan?.contenido, el=$('#athleteApp');
  const head=`<header class="top"><div class="brand"><img class="mark" src="icons/icon.svg" alt=""><div class="lt"><h1>Ápex</h1></div></div><div class="pbar"><span class="small">${esc(me.email)}</span><button id="aOut">Salir</button></div></header>`;
  if(!A.consent){ el.innerHTML = head + consentGate(); return; }
  if(!c){ el.innerHTML = head+`<section class="card"><h3 class="sec">Hola${A.p?.nombre?', '+esc(A.p.nombre):''}</h3><p>Tu fisioterapeuta aún no ha publicado tu plan. Cuando lo haga, aparecerá aquí.</p></section>`; return; }
  const est={pendiente:'<span class="pill y">Pendiente</span>',aprobada:'<span class="pill g">Aprobada</span>',rechazada:'<span class="pill r">Rechazada</span>'};
  const mine = sessions.slice().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
  const rod = (c.modulo||'rodilla')==='rodilla', wl = wellLight(wellness), hoy = wellness.some(x=>x.fecha===todayISO());
  const wkHTML = (c.semanas||[]).length ? `<div class="tl">${c.semanas.map((x,k)=>`<div class="tw k-${esc(x.k)}${k===0?' now':''}"><b>S${esc(x.w)} · ${esc(x.l)}</b><span>${esc(fmtD(x.ini))}</span>${(x.t||[]).map(t=>`<span class="tn">${esc(t.p)} · ${esc(t.n||'Torneo')} · ${esc(fmtD(t.f))}</span>`).join('')}</div>`).join('')}</div>` : '';
  el.innerHTML = head + `
  <div class="phead"><div class="acc"></div><div><div class="in">
    <div style="min-width:0;flex:1 1 260px"><div class="trainer">Fisioterapeuta Manuel Celis</div><div class="client">${esc(c.nombre)}</div>
      <div class="meta">${esc(c.condicion)}${rod?' · rodilla '+esc(c.rodilla):''}${c.deporte?' · '+esc(c.deporte):''}</div></div>
    <div class="badges"><span class="badge">Semana ${esc(c.semana)}</span><span class="badge lt">${esc(c.meso?.l)}</span></div>
  </div><div class="in" style="padding-top:0;display:block"><div class="phase"><h2>${esc((c.fase||'').split(' · ').slice(1).join(' · ')||c.fase)}</h2><p>${esc(c.objetivo)}</p></div></div></div></div>
  <section class="card wellc"><div class="rowhead"><h3 class="sec" style="margin:0">Chequeo de hoy</h3>${!A.wOpen?`<button id="awOpen" class="${hoy?'':'primary'}">${hoy?'Editar':'Responder'}</button>`:''}</div>
    ${!hoy&&!A.wOpen?'<p class="small" style="margin:6px 0 0">Sueño, estrés, fatiga y dolor: 30 segundos. Tu plan de hoy se ajusta según tus respuestas.</p>':''}
    ${A.wOpen?wellForm('aw'):''}
    ${wl&&hoy&&!A.wOpen?`<div class="light ${wl.c}"><span class="dot"></span><div><b>${esc(wl.t)}</b><p>${esc({g:'Entrena tu plan completo.',y:'Tu plan de hoy viene con RPE 1 punto menos: no subas peso.',r:'Tu plan de hoy viene recortado y sin saltos ni potencia. Tu fisioterapeuta recibe un aviso.'}[wl.c]+(wl.why&&wl.why.length?' ('+wl.why.join(', ')+')':''))}</p></div></div>`:''}
  </section>
  ${d24Card()}
  ${c.dias.map((d,di)=>`<section class="card day" style="padding:12px"><div class="dayhead"><h3>${esc(d.name.toUpperCase())}</h3><div class="dayact">${c.vivo!==false?`<button class="lbtn live" data-live="${di}"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>Entrenar en vivo</button>`:''}<button class="${c.vivo!==false?'':'lbtn'}" data-alog="${di}">${A.open===di?'Cerrar':(c.vivo!==false?'Registro rápido':'Registrar sesión')}</button></div></div>
    ${A.open===di?logForm(d,di).replace('id="lfSave"','id="aSave"').replace('id="lfCancel"','id="aCancel"'):''}
    ${d.segs.map(sg=>`<div class="blk t-${sg.type}"><div class="bh"><b>${esc(SEGS[sg.type]||sg.type)}</b><i>${esc(fmtLabel(sg.fmt))}</i></div>
      <div class="tbl"><table class="pl"><thead><tr><th>Ejercicio</th>${rod?'<th>Lado</th>':''}<th>Series</th><th>Reps</th><th>Carga</th><th>Nota</th></tr></thead><tbody>${sg.rows.map(aRow).join('')}</tbody></table></div></div>`).join('')}
  </section>`).join('')}
  ${pushCard()}
  ${wkHTML?`<details class="card fold-d"><summary><h3 class="sec">Mis próximas semanas</h3></summary>${wkHTML}</details>`:''}
  <details class="card fold-d"><summary><h3 class="sec">${rod||c.modulo==='lumbar'?'Regla de dolor':'Cómo dosificar'}</h3></summary>${c.modulo==='lumbar'?`<p style="margin:0">Dolor de espalda ≤ 3/10 durante el ejercicio y al día siguiente igual o mejor: vas bien. Entre 4 y 5: mantén la carga. Más de 5, peor al día siguiente o si el dolor baja hacia la pierna: baja la carga, cambia ese ejercicio y avísale a tu fisioterapeuta. Moverte y caminar ayuda; el reposo no.</p>`:rod?`<p style="margin:0">Dolor durante el ejercicio ≤ 3/10 y al día siguiente igual o mejor: vas bien. Entre 4 y 5: mantén la carga. Más de 5 o peor al día siguiente: baja la carga y avísale a tu fisioterapeuta.</p>`:`<p style="margin:0">Elige el peso para quedar en el RPE indicado. Si te sobra, sube un poco la próxima vez; si no llegas a las repeticiones, bájalo. "Máx. intención" = cada repetición lo más rápido y explosivo posible, sin llegar a cansarte.</p>`}
    <p class="small">RPE 8 = podrías hacer 2 repeticiones más. RPE 7 = 3 más.</p>${c.evitar?`<p class="small"><b>Evita por ahora:</b> ${esc(c.evitar)}</p>`:''}
    ${c.tools?.length?`<ul class="small" style="margin:6px 0 0;padding-left:18px">${c.tools.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}</details>
  <section class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 class="sec" style="margin:0">Pedir un cambio</h3>${!A.reqOpen?'<button class="dark" id="aReq">Nueva solicitud</button>':''}</div>
    ${A.reqOpen?`<div class="logf"><label class="f">¿Qué necesitas cambiar y por qué?<textarea id="aReqTxt" maxlength="2000" placeholder="Ej.: la sentadilla búlgara me da dolor 6/10 en la rótula"></textarea></label><div class="actions"><button class="primary" id="aReqSend">Enviar</button><button id="aReqCancel">Cancelar</button></div></div>`:''}
    ${solicitudes.length?solicitudes.map(r=>`<div class="req"><div class="reqh">${est[r.estado]||''}<span class="small">${esc((r.created_at||'').slice(0,10))}</span></div><p>${esc(r.texto)}</p>${r.respuesta?`<p class="small"><b>Respuesta:</b> ${esc(r.respuesta)}</p>`:''}</div>`).join(''):'<p class="small">No has enviado solicitudes.</p>'}
  </section>
  <section class="card"><h3 class="sec">Mis sesiones</h3>
    ${mine.length?`<div class="tbl"><table class="data"><thead><tr><th>Fecha</th><th>Día</th><th>Min</th><th>RPE</th><th>Dolor</th><th>24 h</th><th></th></tr></thead><tbody>
    ${mine.map(x=>`<tr><td>${esc(x.fecha)}${x._local?' <span class="pill y">Por enviar</span>':''}</td><td>${esc(x.dia||'')}</td><td>${esc(x.min??'')}</td><td>${esc(x.srpe??'')}</td><td>${x.dolor!=null?esc(x.dolor)+'/10':'—'}</td><td>${esc({mejor:'Mejor',igual:'Basal',peor:'Peor'}[x.d24]||'—')}</td><td>${x.autor==='deportista'?`<button class="xbtn" data-adel="${esc(x.id)}" aria-label="Borrar sesión">×</button>`:''}</td></tr>`).join('')}
    </tbody></table></div>`:'<p class="small">Aún no has registrado sesiones. Usa "Registrar sesión" en el día que entrenaste.</p>'}
  </section>
  <footer class="foot">Tus datos solo los ves tú y tu fisioterapeuta.</footer>`;
}
async function startAthlete(p){
  A.p=p; $('#login').hidden=true; $('#fisioApp').hidden=true; $('#athleteApp').hidden=false;
  try{
    const [pl, se, so, cs, wb] = await Promise.all([
      sb.from('planes').select('*').eq('paciente_id',p.id).order('publicado_at',{ascending:false}).limit(1),
      sb.from('sesiones').select('*').eq('paciente_id',p.id).order('fecha',{ascending:false}),
      sb.from('solicitudes').select('*').eq('paciente_id',p.id).order('created_at',{ascending:false}),
      sb.from('consentimientos').select('id').eq('paciente_id',p.id).limit(1),
      sb.from('bienestar').select('*').eq('paciente_id',p.id).order('fecha',{ascending:false}).limit(60)
    ]);
    if([pl,se,so,cs,wb].some(r=>r.error && isNetErr(r.error))) throw new Error('network');
    A.consent=!!(cs.data&&cs.data.length); A.plan=(pl.data||[])[0]||null; solicitudes=so.data||[];
    sessions=[...pendingRows('sesiones'), ...(se.data||[])]; wellness=[...pendingRows('bienestar'), ...(wb.data||[])];
    cacheAthlete();
  }catch(e){ const c=loadAthleteCache(me.uid); if(c) applyAthleteCache(c); else { A.plan=null; A.consent=true; toast('Sin conexión. Abre la app una vez con internet para guardar tu plan en el teléfono.'); } }
  st.dolor=0; renderAthlete(); netBadge(); flushOutbox();
}
$('#athleteApp').addEventListener('click', async e=>{
  const q=s=>e.target.closest(s); let b;
  if(q('#aOut')){ if(obGet().length){ toast('Tienes registros sin enviar. Conéctate a internet antes de salir.'); return; } LS.set(CA_KEY(),null); LS.set('apex_last',null); await pushOff(); await sb.auth.signOut(); location.reload(); return; }
  if((b=q('[data-alog]'))){ const d=+b.dataset.alog; A.open = A.open===d?null:d; renderAthlete(); return; }
  if(q('#aCancel')){ A.open=null; renderAthlete(); return; }
  if(q('#awOpen')){ A.wOpen=true; renderAthlete(); return; }
  if(q('#awSave')){ if(await saveWell(A.p.id,'aw',{created_by:me.uid})){ A.wOpen=false; cacheAthlete(); renderAthlete(); toast(navigator.onLine?'Bienestar guardado':'Bienestar guardado en el teléfono; se envía al volver la conexión'); } return; }
  if(q('#aSave')){
    const day=A.plan.contenido.dias[A.open];
    const row=Object.assign(collectLog(day), {paciente_id:A.p.id, semana:A.plan.contenido.semana, fase:(A.plan.contenido.fase||'').split(' · ')[0], autor:'deportista', created_by:me.uid});
    const {data,error,queued}=await sbWrite('insert','sesiones',row);
    if(error){ toast('No se pudo guardar la sesión. Inténtalo de nuevo.'); return; }
    sessions.unshift(data); A.open=null; cacheAthlete(); renderAthlete(); toast(queued?'Sesión guardada en el teléfono; se envía al volver la conexión':'Sesión guardada. ¡Buen trabajo!'); return;
  }
  if((b=q('[data-adel]'))&&String(b.dataset.adel).startsWith('local-')){ const id=b.dataset.adel; obSet(obGet().filter(x=>!(x.row&&x.row._lid===id))); sessions=sessions.filter(x=>x.id!==id); renderAthlete(); return; }
  if((b=q('[data-adel]'))){ const id=b.dataset.adel; const {error}=await sb.from('sesiones').delete().eq('id',id); if(error){ toast('No se pudo borrar.'); return; } sessions=sessions.filter(x=>x.id!==id); renderAthlete(); return; }
  if(q('#aReq')){ A.reqOpen=true; renderAthlete(); $('#aReqTxt')?.focus(); return; }
  if(q('#aReqCancel')){ A.reqOpen=false; renderAthlete(); return; }
  if(q('#aReqSend')){
    const t=($('#aReqTxt').value||'').trim(); if(!t){ toast('Escribe qué necesitas cambiar.'); return; }
    const {data,error}=await sb.from('solicitudes').insert({paciente_id:A.p.id, plan_id:A.plan?.id||null, texto:t.slice(0,2000)}).select('*').single();
    if(error){ toast('No se pudo enviar la solicitud.'); return; }
    solicitudes.unshift(data); A.reqOpen=false; renderAthlete(); toast('Solicitud enviada a tu fisioterapeuta'); return;
  }
});

/* ===================== ACCESO ===================== */
/* Acceso: correo + contraseña. El enlace por correo solo se usa la primera vez o si se olvida la contraseña.
   La sesión se guarda en el dispositivo (supabase-js persistSession) y se renueva sola; el correo se recuerda. */
const LS = { get:k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } }, set:(k,v)=>{ try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,v); }catch(e){} } };
let lgMode='pass', lgRole=LS.get('apex_role')==='fisio'?'fisio':'deportista';
const LG_SUB={fisio:{pass:'Accede a tus pacientes y planes.', link:'Te enviamos un enlace para crear o cambiar tu contraseña.'},
  deportista:{pass:'Entra con el correo que registró tu fisioterapeuta.', link:'Te enviamos un enlace para crear o cambiar tu contraseña. Usa el correo que registró tu fisioterapeuta.'}};
function setRole(r){ lgRole=r; LS.set('apex_role', r);
  document.querySelectorAll('.rolesel [data-role]').forEach(b=>b.setAttribute('aria-checked', String(b.dataset.role===r)));
  $('#lgSub').textContent=LG_SUB[r][lgMode==='link'?'link':'pass']; }
document.querySelectorAll('.rolesel [data-role]').forEach(b=>b.onclick=()=>setRole(b.dataset.role));
$('.rolesel').addEventListener('keydown', e=>{ if(['ArrowLeft','ArrowRight'].includes(e.key)){ const r=lgRole==='fisio'?'deportista':'fisio'; setRole(r); $(`.rolesel [data-role="${r}"]`).focus(); e.preventDefault(); } });
function lgMsg(t, kind){ const m=$('#loginMsg'); m.innerHTML=t||''; m.className='lgmsg'+(kind?' '+kind:''); }
function setLgMode(m){
  lgMode=m; const link=m==='link';
  $('#lgTitle').textContent = link ? 'Recibir enlace' : 'Entrar';
  $('#lgSub').textContent = LG_SUB[lgRole][link?'link':'pass'];
  $('#pwWrap').hidden = link;
  $('#loginBtn').textContent = link ? 'Enviarme el enlace' : 'Entrar';
  $('#lgMode').textContent = link ? 'Ya tengo contraseña' : '¿Primera vez u olvidaste tu contraseña?';
  lgMsg('');
  (link || !$('#loginEmail').value ? $('#loginEmail') : $('#loginPass')).focus();
}
function showLogin(msg){
  $('#login').hidden=false; $('#fisioApp').hidden=true; $('#athleteApp').hidden=true;
  $('#loginForm').hidden=false; $('#pwdForm').hidden=true;
  const saved=LS.get('apex_email'); if(saved && !$('#loginEmail').value) $('#loginEmail').value=saved;
  setRole(lgRole); if(msg) lgMsg(msg);
  setTimeout(()=>($('#loginEmail').value?$('#loginPass'):$('#loginEmail')).focus(), 30);
}
function eyeToggle(btn, input){
  btn.onclick=()=>{ const show=input.type==='password'; input.type=show?'text':'password'; btn.setAttribute('aria-pressed', String(show)); btn.setAttribute('aria-label', show?'Ocultar contraseña':'Mostrar contraseña'); input.focus(); };
}
eyeToggle($('#pwEye'), $('#loginPass')); eyeToggle($('#npEye'), $('#newPass'));
$('#lgMode').onclick=()=>setLgMode(lgMode==='link'?'pass':'link');
function shake(el){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
$('#loginForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const email=($('#loginEmail').value||'').trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ lgMsg('Escribe un correo válido.','err'); shake($('#loginEmail')); $('#loginEmail').focus(); return; }
  LS.set('apex_email', email);
  const btn=$('#loginBtn'); btn.disabled=true; btn.classList.add('busy');
  if(lgMode==='link'){
    lgMsg('Enviando…');
    LS.set('apex_setpwd','1');
    const {error}=await sb.auth.signInWithOtp({email, options:{emailRedirectTo: location.origin+location.pathname}});
    btn.disabled=false; btn.classList.remove('busy');
    if(error) lgMsg(/rate/i.test(error.message)?'Se enviaron demasiados correos. Espera unos minutos e inténtalo de nuevo.':'No se pudo enviar el enlace. Inténtalo de nuevo.','err');
    else lgMsg(`Listo. Revisa <b>${esc(email)}</b> y abre el enlace en <b>este mismo navegador</b>. Luego creas tu contraseña.`,'ok');
    return;
  }
  const pass=$('#loginPass').value||'';
  if(!pass){ btn.disabled=false; btn.classList.remove('busy'); lgMsg('Escribe tu contraseña.','err'); shake($('#loginPass')); $('#loginPass').focus(); return; }
  lgMsg('Entrando…');
  const {error}=await sb.auth.signInWithPassword({email, password:pass});
  btn.disabled=false; btn.classList.remove('busy');
  if(error){
    shake($('#loginForm'));
    lgMsg(/invalid|credentials/i.test(error.message)
      ? 'Correo o contraseña incorrectos. Si aún no tienes contraseña, toca <b>¿Primera vez u olvidaste tu contraseña?</b>'
      : /rate|many/i.test(error.message) ? 'Demasiados intentos. Espera un momento.' : 'No se pudo entrar. Revisa tu conexión e inténtalo de nuevo.','err');
    $('#loginPass').select();
  } else { $('#loginPass').value=''; lgMsg('Listo.','ok'); }
});
/* Crear contraseña la primera vez (o tras "olvidé mi contraseña") */
function needsPwd(session){ return LS.get('apex_setpwd')==='1' || !(session.user.user_metadata && session.user.user_metadata.pwd); }
function askPwd(session){
  return new Promise(resolve=>{
    $('#login').hidden=false; $('#fisioApp').hidden=true; $('#athleteApp').hidden=true;
    $('#loginForm').hidden=true; $('#pwdForm').hidden=false; $('#pwdMsg').textContent='';
    setTimeout(()=>$('#newPass').focus(), 30);
    const meter=()=>{ const v=$('#newPass').value; let s=0; if(v.length>=8)s++; if(v.length>=12)s++; if(/[A-Z]/.test(v)&&/[a-z]/.test(v))s++; if(/\d/.test(v))s++; if(/[^A-Za-z0-9]/.test(v))s++;
      const pct=Math.min(100,s*20), lbl=v.length<8?'Mínimo 8 caracteres.':s<=2?'Aceptable.':s<=3?'Buena.':'Muy buena.';
      $('#pwBar').style.width=pct+'%'; $('#pwBar').className=s<=2?'lo':s<=3?'mid':'hi'; $('#pwHint').textContent=lbl; };
    $('#newPass').oninput=meter; meter();
    const done=()=>{ LS.set('apex_setpwd',null); $('#pwdForm').hidden=true; $('#loginForm').hidden=false; resolve(); };
    $('#pwdSkip').onclick=()=>{ LS.set('apex_setpwd',null); done(); };
    $('#pwdForm').onsubmit=async e=>{
      e.preventDefault();
      const a=$('#newPass').value, b=$('#newPass2').value;
      if(a.length<8){ $('#pwdMsg').textContent='Usa al menos 8 caracteres.'; $('#pwdMsg').className='lgmsg err'; shake($('#newPass')); return; }
      if(a!==b){ $('#pwdMsg').textContent='Las dos contraseñas no coinciden.'; $('#pwdMsg').className='lgmsg err'; shake($('#newPass2')); return; }
      const btn=$('#pwdBtn'); btn.disabled=true; btn.classList.add('busy');
      const {error}=await sb.auth.updateUser({password:a, data:{pwd:true}});
      btn.disabled=false; btn.classList.remove('busy');
      if(error){ $('#pwdMsg').textContent=/should be different|same/i.test(error.message)?'Esa ya es tu contraseña actual. Elige otra o toca "Ahora no".':/weak|short|length/i.test(error.message)?'Contraseña muy débil. Prueba una más larga.':'No se pudo guardar. Inténtalo de nuevo.'; $('#pwdMsg').className='lgmsg err'; return; }
      $('#newPass').value=''; $('#newPass2').value=''; toast('Contraseña guardada. La próxima vez entra con ella.'); done();
    };
  });
}
async function route(session){
  me.email=(session.user.email||'').toLowerCase(); me.uid=session.user.id;
  LS.set('apex_email', me.email);
  if(needsPwd(session)) await askPwd(session);
  $('#login').hidden=true;
  const fr=await sb.from('fisios').select('email,nombre').maybeSingle();
  if(fr.error && isNetErr(fr.error)){ if(startAthleteOffline(me.uid, me.email)) return; showLogin('Sin conexión. Conéctate a internet para entrar.'); return; }
  const f=fr.data;
  if(f){ me.role='fisio'; if(lgRole!=='fisio'){ setRole('fisio'); toast('Este correo es de fisioterapeuta: entraste a tu panel.'); } $('#login').hidden=true; $('#athleteApp').hidden=true; $('#fisioApp').hidden=false; $('#who').textContent=me.email;
    await Promise.all([loadPatients(), loadLib(), loadPlantillas(), loadConsents()]); initAlerts(); syncPush('fisio');
    fisioNombre=f.nombre||''; render(); renderSel(); showHome();
    return; }
  const {data:p}=await sb.from('pacientes').select('id,nombre').maybeSingle();
  if(p){ me.role='deportista'; if(lgRole!=='deportista'){ setRole('deportista'); toast('Este correo es de deportista: entraste a tu plan.'); } startAthlete(p); syncPush('deportista'); return; }
  showLogin(`Entraste como <b>${esc(me.email)}</b>, ${lgRole==='fisio'?'pero este correo no está registrado como fisioterapeuta.':'pero este correo no tiene un plan asignado. Pídele a tu fisioterapeuta que te registre con este correo.'} <button id="lgOut" class="mini-btn">Usar otro correo</button>`);
  const lo=$('#lgOut'); if(lo) lo.onclick=async()=>{ await sb.auth.signOut(); location.reload(); };
}
$('#fOut').onclick=async()=>{ await pushOff(); await sb.auth.signOut(); location.reload(); };
let routed=false;
async function boot(){
  sb.auth.onAuthStateChange((ev, session)=>{ if(session && !routed && (ev==='SIGNED_IN'||ev==='INITIAL_SESSION')){ routed=true; route(session); } });
  const {data:{session}} = await sb.auth.getSession();
  if(session && !routed){ routed=true; route(session); }
  else if(!session){ let last=null; try{ last=JSON.parse(LS.get('apex_last')||'null'); }catch(e){}
    if(last && !navigator.onLine && startAthleteOffline(last.uid, last.email)) return; showLogin(); }
}
