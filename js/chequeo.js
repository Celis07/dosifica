/* ===================== CHEQUEO DIARIO Y AJUSTE AUTOMÁTICO =====================
   El deportista responde cada día: sueño, estrés, fatiga, dolor muscular (Hooper 1–7)
   y si le duele algo (zona, lado, 0–10). Con eso sale un semáforo único, que ven el
   deportista y el fisio, y el plan del día se ajusta solo:
   - Verde: plan completo; puede progresar según el RPE.
   - Amarillo: RPE 1 punto menos y sin subir carga; marca lo que carga la zona que duele.
   - Rojo: ~1/3 menos series, RPE 2 puntos menos, sin saltos ni potencia y fuera
     lo que carga la zona dolorosa (si duele ≥ 4/10). Además avisa al fisio. */
const ZONAS = {cuello:'Cuello', hombro:'Hombro', codo:'Codo o muñeca', dorsal:'Espalda alta', lumbar:'Zona lumbar', cadera:'Cadera o ingle', muslo:'Muslo', rodilla:'Rodilla', pierna:'Pierna o pantorrilla', tobillo:'Tobillo o pie', otra:'Otra zona'};
const ZONA_LADO = ['hombro','codo','cadera','muslo','rodilla','pierna','tobillo'];
const ZONA_RX = {
  cuello:/press militar|press de hombro|encogimiento|dominada|jal[oó]n|pinza/i,
  hombro:/press|dominada|jal[oó]n|remo|face pull|lanzamiento|fondos|flexiones|pullover|rotaci[oó]n externa|landmine|turkish/i,
  codo:/curl de b[ií]ceps|tr[ií]ceps|press|flexiones|dominada|pinza|granjero|agarre|fondos/i,
  dorsal:/remo|dominada|jal[oó]n|press militar|pullover|lanzamiento/i,
  lumbar:/peso muerto|rumano|swing|remo con barra|good morning|buenos d[ií]as|extensi[oó]n de espalda|sentadilla|clean|cargada|granjero/i,
  cadera:/sentadilla|zancada|b[uú]lgara|step|hip thrust|aducci[oó]n|copenhague|peso muerto|abducci[oó]n|swing/i,
  muslo:/sentadilla|zancada|b[uú]lgara|n[oó]rdico|curl femoral|peso muerto|rumano|sprint|prensa|extensi[oó]n de rodilla|salto/i,
  rodilla:/sentadilla|zancada|b[uú]lgara|step|prensa|extensi[oó]n de rodilla|salto|pliom|sprint|pistol|lunge|tke|hop|drop|aterriz/i,
  pierna:/talon|tal[oó]n|salto|pogo|carrera|sprint|skipping|step|cuerda/i,
  tobillo:/talon|tal[oó]n|salto|pogo|carrera|sprint|skipping|step|cuerda|zancada|equilibrio|unipodal/i,
  otra:/$^/
};
const POW_RX = /salto|pliom|sprint|swing|lanzamiento|explosiv|clean|cargada|drop|pogo|hop|skipping|m[aá]x\. intenci[oó]n/i;

/* ---------- Semáforo único (reemplaza al anterior) ---------- */
const molMax = e => Math.max(0, ...((e && e.molestias) || []).map(m => +m.i || 0));
const molTxt = e => ((e && e.molestias) || []).filter(m => +m.i > 0).map(m => `${ZONAS[m.z] || m.z}${m.l ? ' ' + ({izq:'izq.', der:'der.', amb:'ambos'}[m.l] || '') : ''} ${m.i}/10`).join(', ');
wellLight = function(list){
  if(!list || !list.length) return null;
  const L = list.slice().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
  const e = L[0], sum = wSum(e), today = e.fecha===todayISO();
  const base = L.slice(1).filter(x=>x.fecha>=daysAgo(28)).map(wSum);
  let z = null, ref = '';
  if(base.length>=7){ const m=base.reduce((a,b)=>a+b,0)/base.length; const sd=Math.max(1.5, Math.sqrt(base.reduce((a,b)=>a+(b-m)**2,0)/base.length)); z=(sum-m)/sd; ref=` · referencia personal ${m.toFixed(1)}`; }
  const maxIt = Math.max(+e.sueno,+e.estres,+e.fatiga,+e.dolor), pm = molMax(e);
  let c='g';
  if(maxIt>=6 || (z!=null ? z>=1.5 : sum>=18) || pm>=6) c='r';
  else if(maxIt>=5 || (z!=null ? z>=1 : sum>=14) || pm>=4) c='y';
  const why = [];
  if(+e.sueno>=5) why.push('sueño malo'); if(+e.estres>=5) why.push('estrés alto'); if(+e.fatiga>=5) why.push('fatiga alta'); if(+e.dolor>=5) why.push('dolor muscular alto');
  const mt = molTxt(e); if(mt) why.push('dolor: ' + mt);
  const T = {g:['Verde · plan completo','Puede progresar según el RPE.'], y:['Amarillo · sin subir carga','RPE 1 punto menos y marca lo que carga la zona que molesta.'], r:['Rojo · plan recortado','≈ 1/3 menos series, RPE 2 puntos menos, sin saltos ni potencia y sin lo que carga la zona que duele. Conviene hablar con el deportista.']}[c];
  return {c, t:T[0]+(today?'':` (último registro: ${e.fecha})`), p:`${T[1]}${why.length?' Motivo: '+why.join(', ')+'.':''} Puntaje ${sum}/28${ref}.`, sum, e, today, pm, why};
};

/* ---------- Formulario con botones (fisio 'fw' y deportista 'aw') ---------- */
const WF = {};
function wfInit(pfx){
  const prev = wellness.find(x=>x.fecha===todayISO());
  WF[pfx] = prev ? {sueno:+prev.sueno, estres:+prev.estres, fatiga:+prev.fatiga, dolor:+prev.dolor, duele:(prev.molestias||[]).length?1:0, mol:JSON.parse(JSON.stringify(prev.molestias||[])), nota:prev.nota||''}
                 : {sueno:null, estres:null, fatiga:null, dolor:null, duele:null, mol:[], nota:''};
}
const WQ = [['sueno','¿Cómo dormiste?','Muy bien','Muy mal'],['estres','Estrés','Muy bajo','Muy alto'],['fatiga','Fatiga','Nada','Mucha'],['dolor','Dolor muscular','Nada','Mucho']];
function wfBody(pfx){
  const S = WF[pfx];
  const q = ([k,l,a,b]) => `<div class="wq"><div class="wql"><b>${l}</b><span>${a} · ${b}</span></div><div class="wch7">${[1,2,3,4,5,6,7].map(v=>`<button type="button" class="wc t${v}${S[k]===v?' on':''}" data-wf="${pfx}|${k}|${v}" aria-pressed="${S[k]===v}" aria-label="${l}: ${v} de 7">${v}</button>`).join('')}</div></div>`;
  const zon = S.duele ? `<div class="wzs">${Object.entries(ZONAS).map(([k,l])=>`<button type="button" class="wz${S.mol.some(m=>m.z===k)?' on':''}" data-wfz="${pfx}|${k}" aria-pressed="${S.mol.some(m=>m.z===k)}">${l}</button>`).join('')}</div>
    ${S.mol.map((m,j)=>`<div class="wmol"><b>${ZONAS[m.z]}</b>
      ${ZONA_LADO.includes(m.z)?`<div class="wlado">${[['izq','Izquierda'],['der','Derecha'],['amb','Ambos']].map(([v,l])=>`<button type="button" class="wc${m.l===v?' on':''}" data-wfl="${pfx}|${j}|${v}">${l}</button>`).join('')}</div>`:''}
      <div class="wint"><span>¿Cuánto? (0–10)</span><div class="wch10">${[1,2,3,4,5,6,7,8,9,10].map(v=>`<button type="button" class="wc i${v}${+m.i===v?' on':''}" data-wfi="${pfx}|${j}|${v}" aria-label="${ZONAS[m.z]}: ${v} de 10">${v}</button>`).join('')}</div></div></div>`).join('')}` : '';
  return `${WQ.map(q).join('')}
    <div class="wq"><div class="wql"><b>¿Te duele algo hoy?</b></div><div class="wyn"><button type="button" class="wc${S.duele===0?' on':''}" data-wfd="${pfx}|0">No</button><button type="button" class="wc${S.duele===1?' on':''}" data-wfd="${pfx}|1">Sí</button></div></div>
    ${zon}
    <label class="f">Comentario (opcional)<input type="text" id="${pfx}-nota" maxlength="500" value="${esc(S.nota||'')}" placeholder="Algo que tu fisioterapeuta deba saber"></label>`;
}
wellForm = function(pfx){
  if(!WF[pfx]) wfInit(pfx);
  return `<div class="logf wform" id="wf-${pfx}">${pfx==='fw'?'<h4>Chequeo de hoy</h4>':''}<div class="wfb">${wfBody(pfx)}</div>
    <div class="actions"><button class="primary" id="${pfx}Save">Guardar chequeo</button>${pfx==='fw'?'<button id="fwCancel">Cancelar</button>':'<button id="awCancel">Cancelar</button>'}</div></div>`;
};
function wfRefresh(pfx){ const el=$('#wf-'+pfx+' .wfb'); if(el){ const nota=$('#'+pfx+'-nota')?.value; if(nota!=null) WF[pfx].nota=nota; el.innerHTML=wfBody(pfx); } }
document.addEventListener('click', e=>{
  let b;
  if((b=e.target.closest('[data-wf]'))){ const [p,k,v]=b.dataset.wf.split('|'); WF[p][k]=+v; return wfRefresh(p); }
  if((b=e.target.closest('[data-wfd]'))){ const [p,v]=b.dataset.wfd.split('|'); WF[p].duele=+v; if(!+v) WF[p].mol=[]; return wfRefresh(p); }
  if((b=e.target.closest('[data-wfz]'))){ const [p,z]=b.dataset.wfz.split('|'); const S=WF[p]; const i=S.mol.findIndex(m=>m.z===z); i>=0 ? S.mol.splice(i,1) : S.mol.push({z, l:'', i:0}); return wfRefresh(p); }
  if((b=e.target.closest('[data-wfl]'))){ const [p,j,v]=b.dataset.wfl.split('|'); WF[p].mol[+j].l=v; return wfRefresh(p); }
  if((b=e.target.closest('[data-wfi]'))){ const [p,j,v]=b.dataset.wfi.split('|'); WF[p].mol[+j].i=+v; return wfRefresh(p); }
}, true);
readWell = function(pfx){
  const S = WF[pfx] || {}; const nota = ($('#'+pfx+'-nota')?.value||S.nota||'').slice(0,500)||null;
  return {fecha:todayISO(), sueno:S.sueno, estres:S.estres, fatiga:S.fatiga, dolor:S.dolor, molestias:(S.mol||[]).filter(m=>+m.i>0).map(m=>({z:m.z, l:m.l||'', i:+m.i})), nota};
};
const _saveWellBase = saveWell;
saveWell = async function(pid, pfx, extra){
  const S = WF[pfx];
  if(!S || WQ.some(([k])=>S[k]==null)){ toast('Responde las 4 preguntas (toca un número en cada una).'); return false; }
  if(S.duele==null){ toast('Cuéntanos si te duele algo hoy (Sí o No).'); return false; }
  if(S.duele && (!S.mol.length || S.mol.some(m=>!(+m.i>0)))){ toast('Elige la zona y cuánto duele (1–10).'); return false; }
  const ok = await _saveWellBase(pid, pfx, extra);
  if(ok) delete WF[pfx];
  return ok;
};
document.addEventListener('click', e=>{ if(e.target.closest('#awCancel')){ A.wOpen=false; A.pendLive=null; delete WF.aw; renderAthlete(); } });

/* ---------- Ajuste automático del día ---------- */
function todayLight(){ const t = wellness.find(x=>x.fecha===todayISO()); return t ? wellLight(wellness) : null; }
function adjustDay(day, wl){
  if(!wl || wl.c==='g') return {day, info:null};
  const pain = ((wl.e && wl.e.molestias) || []).filter(m=>+m.i>=4);
  const hits = row => pain.filter(m=>ZONA_RX[m.z] && ZONA_RX[m.z].test(row.e||''));
  let quit=0, marc=0;
  const segs = day.segs.map(sg=>{
    let rows = sg.rows.map(r=>Object.assign({}, r));
    if(wl.c==='r' && sg.type==='neuro'){ const n0=rows.length; rows = rows.filter(r=>!POW_RX.test((r.e||'')+' '+(r.c||''))); quit += n0-rows.length; }
    rows = rows.flatMap(r=>{
      const h = hits(r);
      if(h.length && wl.c==='r'){ quit++; return []; }
      if(h.length){ marc++; r.n = `Molestia en ${h.map(m=>ZONAS[m.z].toLowerCase()).join(' y ')}: si duele más de 3/10, cámbialo o quítalo hoy.` + (r.n?' '+r.n:''); }
      if(sg.type!=='act'){ r.c = adjRPE(r.c, wl.c==='r'?-2:-1); if(wl.c==='r' && sg.type==='central') r.s = adjSeries(r.s, -0.34, true); }
      return [r];
    });
    if(!rows.length) rows = [{e:'Movilidad suave sin dolor', lado:'', s:'1', r:'5–8 min', c:'', n:'Hoy en lugar de este bloque.'}];
    return Object.assign({}, sg, {rows});
  });
  const info = wl.c==='r'
    ? `Plan de hoy recortado (chequeo en rojo): ≈ 1/3 menos series y RPE 2 puntos menos${quit?`, ${quit} ejercicio${quit>1?'s':''} fuera hoy (potencia o carga sobre la zona que duele)`:''}.`
    : `Hoy sin subir carga (chequeo en amarillo): RPE 1 punto menos${marc?`; ${marc} ejercicio${marc>1?'s':''} marcado${marc>1?'s':''} por molestia`:''}.`;
  return {day:Object.assign({}, day, {segs}), info};
}

/* ---------- Portal del deportista ---------- */
const _renderAthleteBase = renderAthlete;
renderAthlete = function(){
  const c = A.plan?.contenido, wl = todayLight();
  let orig = null, infos = [];
  if(c && c.dias && wl && wl.c!=='g'){ orig = c.dias; c.dias = orig.map(d=>{ const r=adjustDay(d, wl); infos.push(r.info); return r.day; }); }
  try { _renderAthleteBase(); } finally { if(orig) c.dias = orig; }
  // aviso del ajuste en cada día
  document.querySelectorAll('#athleteApp .card.day').forEach((el,i)=>{ if(infos[i]){ const d=document.createElement('div'); d.className=`adjbar ${wl.c}`; d.textContent=infos[i]; el.querySelector('.dayhead')?.after(d); } });
  // chequeo obligatorio antes de entrenar en vivo
  if(A.pendLive!=null && wellness.some(x=>x.fecha===todayISO()) && !A.wOpen){ const di=A.pendLive; A.pendLive=null; setTimeout(()=>startLive(di), 50); }
};
const _startLiveBase = startLive;
startLive = function(di){
  if(!wellness.some(x=>x.fecha===todayISO())){
    A.wOpen=true; A.pendLive=di; renderAthlete();
    setTimeout(()=>$('#wf-aw')?.scrollIntoView({block:'start', behavior:'smooth'}), 60);
    toast('Primero tu chequeo de hoy: 30 segundos.'); return;
  }
  const c=A.plan?.contenido, wl=todayLight();
  if(c && wl && wl.c!=='g'){ const orig=c.dias; c.dias=orig.map(d=>adjustDay(d, wl).day); try{ _startLiveBase(di); } finally { c.dias=orig; } return; }
  _startLiveBase(di);
};
