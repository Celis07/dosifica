/* ===================== REVISIÓN DEL BANCO, UNO POR UNO =====================
   Tarjeta por ejercicio con las etiquetas que usa el generador como botones.
   "Correcto, siguiente" guarda y lo marca revisado; "Ocultar" lo saca de los planes.
   Cualquier corrección en la tabla también cuenta como revisada. */
let RV = null, rvSkip = new Set();
const RV_OPTS = {
  bloque: [['act','Activación'],['neuro','Neuro'],['central','Central']],
  reg: Object.entries(REGIONES),
  fx: [[0,'No carga'],[30,'0–30°'],[60,'≤ 60°'],[90,'≤ 90°'],[120,'> 90°']],
  im: [[0,'No'],[1,'Sí']],
  tn: [[0,'Bajo'],[1,'Medio'],[2,'Alto']],
  kn: [[0,'No'],[1,'Sí']],
  uni: [[0,'No'],[1,'Sí']],
};
const RV_LBL = {bloque:'Bloque', reg:'Región', fx:'Flexión de rodilla con carga', im:'Impacto (saltos, carrera)', tn:'Estrés de tendón o rótula', kn:'Apoyo de rodillas', uni:'Unilateral'};
const RV_HELP = {fx:'Hasta cuántos grados se flexiona la rodilla bajo carga. Sirve para no pasarse en sutura de menisco o fases tempranas.', tn:'Para tendinopatía y dolor patelofemoral.', kn:'Importa en injerto hueso-tendón-hueso y dolor anterior.'};

function rvPending(){
  return BANCO_BASE.filter(r => r[10] && !(myMeta[r[0]] && (myMeta[r[0]].revisado || myMeta[r[0]].oculto || myMeta[r[0]].eliminado)));
}
function rvTotal(){ return BANCO_BASE.filter(r => r[10]).length; }
function rvLoad(){
  const pend = rvPending().filter(r => !rvSkip.has(r[0]));
  if(!pend.length){ RV = null; return; }
  const r = pend[0], m = myMeta[r[0]] || {};
  const e = BANCO.find(x => x.n === r[0]) || {};
  RV = {n:r[0], reps:r[9], ter:r[8], bloque:e.b || {A:'act',N:'neuro',C:'central'}[r[1]], reg:e.reg ?? r[2], fx:e.fx ?? r[3], im:e.im ?? r[4], tn:e.tn ?? r[5], kn:e.kn ?? r[6], uni:e.uni ?? r[7]};
  const fx = +RV.fx; RV.fx = fx === 0 ? 0 : fx <= 30 ? 30 : fx <= 60 ? 60 : fx <= 90 ? 90 : 120;
}
function revBanner(){
  const left = rvPending().length, tot = rvTotal();
  if(!tot) return '';
  if(!left) return `<section class="card rvdone"><b>Banco revisado</b><p class="small" style="margin:4px 0 0">Revisaste los ${tot} ejercicios que estaban marcados. El generador ya los usa con tus etiquetas.</p></section>`;
  const pct = Math.round((tot - left) / tot * 100);
  return `<section class="card rvban"><div class="rvbh"><div><b>${left} ejercicios por revisar</b><span class="small">${pct}% hecho · se guardan solos</span></div>
    <button class="primary" data-rv="start">Revisar uno por uno</button></div><div class="rvbar"><i style="width:${pct}%"></i></div></section>`;
}
function revCard(){
  if(!RV) rvLoad();
  const left = rvPending().length, tot = rvTotal();
  if(!RV){ bancoQ.modo = ''; return revBanner() + '<section class="card"><p class="small" style="margin:0">No quedan ejercicios por revisar en esta tanda.' + (rvSkip.size ? ` Saltaste ${rvSkip.size}; <button class="linkbtn" data-rv="reskip" style="min-height:0;padding:0">volver a verlos</button>.` : '') + '</p></section>'; }
  const chips = k => `<div class="rvf"><span class="rvl">${RV_LBL[k]}</span>${RV_HELP[k] ? `<span class="rvh">${RV_HELP[k]}</span>` : ''}
    <div class="rvchips">${RV_OPTS[k].map(([v, l]) => `<button type="button" class="rvc${String(RV[k]) === String(v) ? ' on' : ''}" data-rvk="${k}|${v}" aria-pressed="${String(RV[k]) === String(v)}">${esc(l)}</button>`).join('')}</div></div>`;
  const kneeRelevant = ['rod','cad','gen','tob'].includes(RV.reg);
  return `<section class="card rvcard">
    <div class="rvtop"><button class="linkbtn" data-rv="exit" style="min-height:0;padding:0">← Volver al banco</button><span class="rvn">${tot - left + 1} de ${tot} · quedan ${left}</span></div>
    <div class="rvbar"><i style="width:${Math.round((tot - left) / tot * 100)}%"></i></div>
    <h2 class="rvname">${esc(RV.n)}</h2>
    ${RV.reps ? `<p class="small" style="margin:0">En tus planes: ${esc(RV.reps)}${RV.ter ? ' · venía de un bloque de terapia' : ''}</p>` : ''}
    ${chips('bloque')}${chips('reg')}
    ${kneeRelevant ? chips('fx') + chips('im') + chips('tn') : chips('im')}
    ${chips('kn')}${chips('uni')}
    <div class="rvact">
      <button class="ghostb" data-rv="skip">Saltar</button>
      <button class="ghostb danger" data-rv="del">Eliminar</button>
      <button class="ghostb" data-rv="hide">Ocultar</button>
      <button class="primary grow" data-rv="ok">Correcto, siguiente →</button>
    </div>
    <p class="small" style="margin:0"><b>Eliminar</b>: no es un ejercicio o está repetido. <b>Ocultar</b>: es válido pero no lo quieres en los planes. Ambos se recuperan desde la tabla (filtros "Eliminados" y "Ocultos").</p>
  </section>`;
}
function rvSave(hide, del){
  const m = Object.assign({}, myMeta[RV.n]);
  m.bloque = {act:'Activación', neuro:'Neuro', central:'Central'}[RV.bloque];
  m.region = RV.reg; m.fx = +RV.fx; m.im = +RV.im; m.tn = +RV.tn; m.kneel = +RV.kn; m.uni = +RV.uni;
  m.revisado = true; if(hide) m.oculto = true; if(del) m.eliminado = true;
  myMeta[RV.n] = m; buildBanco(); saveLib(RV.n);
  $('#saveState').textContent = 'Banco guardado';
  RV = null; render(); $('.rvcard')?.scrollIntoView({block:'start'});
}
const _bancoViewBase = bancoView;
bancoView = function(){ return bancoQ.modo === 'uno' ? revCard() : revBanner() + _bancoViewBase(); };
$('#out').addEventListener('click', e => {
  const b = e.target.closest('[data-rv],[data-rvk]'); if(!b) return;
  if(b.dataset.rvk){ const [k, v] = b.dataset.rvk.split('|'); RV[k] = k === 'bloque' || k === 'reg' ? v : +v; render(); return; }
  const a = b.dataset.rv;
  if(a === 'start'){ bancoQ.modo = 'uno'; RV = null; render(); $('.rvcard')?.scrollIntoView({block:'start'}); }
  if(a === 'exit'){ bancoQ.modo = ''; RV = null; render(); }
  if(a === 'skip'){ rvSkip.add(RV.n); RV = null; render(); }
  if(a === 'reskip'){ rvSkip.clear(); bancoQ.modo = 'uno'; RV = null; render(); }
  if(a === 'ok') rvSave(false);
  if(a === 'hide') rvSave(true);
  if(a === 'del'){ const n = RV.n; rvSave(false, true); undoToast(`Eliminado: ${n}`, () => bancoSetDel(n, false)); }
});

/* Eliminar y restaurar desde la tabla, con deshacer */
function bancoSetDel(n, del){
  const m = Object.assign({}, myMeta[n]); m.eliminado = del; if(del) m.revisado = true;
  myMeta[n] = m; buildBanco(); saveLib(n); render();
}
function undoToast(msg, undo){
  const el = $('#toast'); el.innerHTML = `${esc(msg)} <button class="tundo">Deshacer</button>`; el.hidden = false;
  el.querySelector('.tundo').onclick = () => { undo(); el.hidden = true; };
  clearTimeout(el._t); el._t = setTimeout(() => el.hidden = true, 5000);
}
$('#out').addEventListener('click', e => {
  let b;
  if((b = e.target.closest('[data-bdel]'))){ const n = b.dataset.bdel; bancoSetDel(n, true); undoToast(`Eliminado: ${n}`, () => bancoSetDel(n, false)); }
  if((b = e.target.closest('[data-brest]'))){ bancoSetDel(b.dataset.brest, false); toast('Ejercicio restaurado'); }
});
