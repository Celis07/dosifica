/* ===================== BIENESTAR DIARIO (HOOPER) Y MONOTONÍA ===================== */
let wellness = [], wellBy = {}, wellOpen = false;
const W_ITEMS = [
  ['sueno','Calidad del sueño','1 = muy buena · 7 = muy mala'],
  ['estres','Estrés','1 = muy bajo · 7 = muy alto'],
  ['fatiga','Fatiga','1 = nada · 7 = muy alta'],
  ['dolor','Dolor muscular','1 = nada · 7 = mucho']
];
const wSum = e => (+e.sueno||0)+(+e.estres||0)+(+e.fatiga||0)+(+e.dolor||0);
function wellLight(list){
  if(!list || !list.length) return null;
  const L = list.slice().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
  const e = L[0], sum = wSum(e), today = e.fecha===todayISO();
  const base = L.slice(1).filter(x=>x.fecha>=daysAgo(28)).map(wSum);
  let z = null, ref = '';
  if(base.length>=7){ const m=base.reduce((a,b)=>a+b,0)/base.length; const sd=Math.max(1.5, Math.sqrt(base.reduce((a,b)=>a+(b-m)**2,0)/base.length)); z=(sum-m)/sd; ref=` · su referencia personal es ${m.toFixed(1)}`; }
  const maxIt = Math.max(+e.sueno,+e.estres,+e.fatiga,+e.dolor);
  let c='g';
  if(maxIt>=6 || (z!=null ? z>=1.5 : sum>=18)) c='r';
  else if(maxIt>=5 || (z!=null ? z>=1 : sum>=14)) c='y';
  const T = {g:['Bienestar en verde','Puede progresar según el RPE.'], y:['Bienestar en amarillo','Entrena lo planificado, pero sin subir carga hoy.'], r:['Bienestar en rojo','Baja 1–2 puntos de RPE o recorta 30–50 % de las series hoy, y pregunta qué pasó: sueño, estrés o carga previa.']}[c];
  return {c, t:T[0]+(today?'':` (último registro: ${e.fecha})`), p:`${T[1]} Puntaje ${sum}/28${ref}.`, sum, e};
}
async function loadWellness(){
  if(!curId){ wellness=[]; return; }
  const {data} = await sb.from('bienestar').select('*').eq('paciente_id',curId).order('fecha',{ascending:false}).limit(60);
  wellness = data||[];
}
async function loadWellBy(){
  const {data} = await sb.from('bienestar').select('paciente_id,fecha,sueno,estres,fatiga,dolor,molestias').gte('fecha', daysAgo(29)).order('fecha',{ascending:false}).limit(3000);
  wellBy = {}; (data||[]).forEach(x=>{ (wellBy[x.paciente_id] ||= []).push(x); });
}
function wellForm(pfx){
  const prev = wellness.find(x=>x.fecha===todayISO());
  return `<div class="logf"><h4>¿Cómo amaneces hoy?</h4>
    <div class="well">${W_ITEMS.map(([k,l,h])=>`<label>${l}<input type="range" min="1" max="7" step="1" value="${prev?prev[k]:3}" id="${pfx}-${k}" oninput="this.nextElementSibling.textContent=this.value"><output>${prev?prev[k]:3}</output><span class="small">${h}</span></label>`).join('')}</div>
    <label class="f">Comentario (opcional)<input type="text" id="${pfx}-nota" maxlength="500" value="${esc(prev?.nota||'')}"></label>
    <div class="actions"><button class="primary" id="${pfx}Save">Guardar</button>${pfx==='fw'?'<button id="fwCancel">Cancelar</button>':''}</div></div>`;
}
function readWell(pfx){
  const r={fecha:todayISO(), nota:($('#'+pfx+'-nota')?.value||'').slice(0,500)||null};
  W_ITEMS.forEach(([k])=>{ r[k]=Math.max(1,Math.min(7,+$('#'+pfx+'-'+k).value||3)); });
  return r;
}
async function saveWell(pid, pfx, extra){
  const row = Object.assign(readWell(pfx), {paciente_id:pid}, extra||{});
  const {data,error} = await sbWrite('upsert','bienestar',row,{onConflict:'paciente_id,fecha'});
  if(error){ toast('No se pudo guardar el bienestar.'); return false; }
  wellness = [data, ...wellness.filter(x=>x.fecha!==data.fecha)];
  return true;
}
function wellCard(){
  const wl = wellLight(wellness);
  const L = wellness.slice().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||'')).slice(0,14);
  return `<section class="card"><div class="rowhead"><h3 class="sec" style="margin:0">Chequeo diario (Hooper + dolor por zona)</h3>${curId&&!wellOpen?'<button class="dark" id="fwOpen">Registrar hoy</button>':''}</div>
    ${wellOpen?wellForm('fw'):''}
    ${wl?`<div class="light ${wl.c}" style="margin-top:8px"><span class="dot"></span><div><b>${esc(wl.t)}</b><p>${esc(wl.p)}</p></div></div>`:''}
    ${L.length?`<div class="tbl" style="margin-top:10px"><table class="data"><thead><tr><th>Fecha</th><th>Sueño</th><th>Estrés</th><th>Fatiga</th><th>Dolor muscular</th><th>Total</th><th>Dolor por zona</th><th>Comentario</th></tr></thead><tbody>
      ${L.map(x=>`<tr><td>${esc(x.fecha)}</td><td>${x.sueno}</td><td>${x.estres}</td><td>${x.fatiga}</td><td>${x.dolor}</td><td><b>${wSum(x)}</b>/28</td><td class="wrap">${esc(typeof molTxt==='function'?molTxt(x):'')||'—'}</td><td class="wrap">${esc(x.nota||'')}</td></tr>`).join('')}</tbody></table></div>`
      :'<p class="small">El deportista lo llena desde su portal antes de entrenar (1 = muy bien, 7 = muy mal). Con 7 registros o más, el semáforo compara contra su propia referencia de las últimas 4 semanas.</p>'}
    <p class="small">Semáforo: rojo si algún ítem es 6–7, si el total sube ≥ 1,5 desviaciones sobre su referencia (sin referencia: total ≥ 18) o si alguna zona duele ≥ 6/10; amarillo si algún ítem es 5, si sube ≥ 1 desviación (sin referencia: ≥ 14) o si alguna zona duele 4–5/10. El plan del día se ajusta solo en el portal: amarillo = RPE −1; rojo = ≈ 1/3 menos series, RPE −2, sin potencia y sin lo que carga la zona dolorosa. Los umbrales son criterio clínico, no puntos de corte validados.</p>
    ${refList(['hooper95','saw16','exp'])}</section>`;
}
function monoStats(list, endISO){
  const days=[]; for(let k=6;k>=0;k--) days.push(addDays(endISO,-k));
  const load = days.map(d=>list.filter(x=>x.fecha===d).reduce((a,x)=>a+(num(x.min)||0)*(num(x.srpe)||0),0));
  const tot = load.reduce((a,b)=>a+b,0), m = tot/7, sd = Math.sqrt(load.reduce((a,b)=>a+(b-m)**2,0)/7);
  const mono = sd>0 ? m/sd : null;
  return {tot, mono, strain: mono!=null ? tot*mono : null, n: list.filter(x=>days.includes(x.fecha)).length};
}
function monoCard(){
  if(!sessions.length) return '';
  const now = monoStats(sessions, todayISO()), prev = monoStats(sessions, addDays(todayISO(),-7));
  const d = prev.tot ? Math.round((now.tot-prev.tot)/prev.tot*100) : null;
  return `<section class="card"><div class="kpis">
    <div class="kpi"><span>Carga 7 días</span><b>${Math.round(now.tot)}</b><i>${now.n} sesiones${d!=null?` · ${d>=0?'+':''}${d} % vs. 7 días previos`:''}</i></div>
    <div class="kpi"><span>Monotonía</span><b>${now.mono!=null?now.mono.toFixed(2):'—'}</b><i>${now.mono!=null&&now.mono>2?'Alta (> 2): varía la carga entre días':'media diaria / desviación'}</i></div>
    <div class="kpi"><span>Tensión</span><b>${now.strain!=null?Math.round(now.strain):'—'}</b><i>carga × monotonía</i></div>
  </div><p class="small" style="margin:8px 0 0">Monotonía alta = todos los días parecidos y sin días suaves. Subidas de carga semanal mayores a ~30–50 % merecen revisarse (criterio práctico).</p>${refList(['foster98','foster01'])}</section>`;
}
$('#out').addEventListener('click', async e=>{
  if(e.target.closest('#fwOpen')){ wellOpen=true; render(); return; }
  if(e.target.closest('#fwCancel')){ wellOpen=false; render(); return; }
  if(e.target.closest('#fwSave')){ if(!curId) return; if(await saveWell(curId,'fw')){ wellOpen=false; render(); toast('Bienestar guardado'); } }
});
