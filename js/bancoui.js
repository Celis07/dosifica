/* ===================== BANCO DE EJERCICIOS: CREAR, EDITAR Y ELIMINAR (oct 2026) =====================
   Reemplaza la tabla de etiquetas y la revisión uno por uno. El banco ya quedó depurado
   (básicos y los que más usa Manuel), así que aquí solo se mantiene:
   - Nuevo ejercicio: nombre, bloque, región, etiquetas para el generador, indicación y video.
   - Editar: lo mismo; si cambia el nombre, se crea con el nombre nuevo y el viejo queda eliminado.
   - Eliminar con deshacer, y restaurar desde "Eliminados". */
let BK = null; // ejercicio abierto en el editor
const BK_OPTS = {
  bloque: [['act', 'Activación'], ['neuro', 'Neuro'], ['central', 'Central']],
  reg: Object.entries(REGIONES),
  fx: [[0, 'Sin carga en flexión'], [30, 'Hasta 30°'], [60, 'Hasta 60°'], [90, 'Hasta 90°'], [120, 'Más de 90°']],
  im: [[0, 'No'], [1, 'Sí']],
  tn: [[0, 'Bajo'], [1, 'Medio'], [2, 'Alto']],
  kn: [[0, 'No'], [1, 'Sí']],
  uni: [[0, 'No'], [1, 'Sí']]
};
const BK_LBL = {bloque: 'Bloque', reg: 'Región', fx: 'Flexión de rodilla con carga', im: 'Impacto (saltos, carrera)', tn: 'Estrés de tendón o rótula', kn: 'Apoyo sobre las rodillas', uni: 'Unilateral'};
const BK_BLQ = {act: 'Activación', neuro: 'Neuro', central: 'Central'};
const bkFx = v => { v = +v || 0; return v === 0 ? 0 : v <= 30 ? 30 : v <= 60 ? 60 : v <= 90 ? 90 : 120; };
const bkBase = () => new Set(BANCO_BASE.map(r => r[0]));
const bkDel = n => !!(myMeta[n] && myMeta[n].eliminado);
function bkAll(){ return [...new Set([...BANCO_BASE.map(r => r[0]), ...myLib])]; }
function bkEntry(n){
  const e = BANCO.find(x => x.n === n), m = myMeta[n] || {}, r = BANCO_BASE.find(x => x[0] === n);
  const blq = m.bloque ? {'Activación': 'act', 'Neuro': 'neuro', 'Central': 'central'}[m.bloque] : null;
  const base = e || (r ? {b: {A: 'act', N: 'neuro', C: 'central'}[r[1]], reg: r[2], fx: r[3], im: r[4], tn: r[5], kn: r[6], uni: r[7]} : {b: 'central', reg: 'gen', fx: 0, im: 0, tn: 0, kn: 0, uni: 0});
  return {n, b: blq || base.b, reg: m.region || base.reg, fx: m.fx ?? base.fx, im: m.im ?? base.im, tn: m.tn ?? base.tn, kn: m.kneel ?? base.kn, uni: m.uni ?? base.uni,
    cue: m.cue || '', video: m.video || '', oculto: !!m.oculto, propio: !bkBase().has(n)};
}
function bkTags(e){
  return [BK_BLQ[e.b], REGIONES[e.reg], e.fx ? `flexión hasta ${e.fx > 90 ? 'más de 90' : e.fx}°` : '', e.im ? 'impacto' : '', e.tn === 2 ? 'tendón alto' : e.tn === 1 ? 'tendón medio' : '',
    e.kn ? 'apoyo de rodillas' : '', e.uni ? 'unilateral' : '', e.oculto ? 'el generador no lo usa' : '', e.video ? 'con video' : ''].filter(Boolean).join(', ');
}

/* ---------- Editor ---------- */
function bkEditor(){
  const ch = k => `<div class="rvf"><span class="rvl">${BK_LBL[k]}</span><div class="rvchips">${BK_OPTS[k].map(([v, l]) =>
    `<button type="button" class="rvc${String(BK[k]) === String(v) ? ' on' : ''}" data-bkx="${k}|${v}" aria-pressed="${String(BK[k]) === String(v)}">${esc(l)}</button>`).join('')}</div></div>`;
  const knee = ['rod', 'cad', 'gen', 'tob'].includes(BK.reg);
  return `<section class="card rvcard bked" id="bkEd">
    <h2 class="rvname">${BK.mode === 'new' ? 'Nuevo ejercicio' : 'Editar ejercicio'}</h2>
    <label class="f">Nombre<input id="bkN" maxlength="120" value="${esc(BK.n)}" placeholder="Ej.: Sentadilla búlgara con mancuernas" autocomplete="off"></label>
    ${ch('bloque')}${ch('reg')}${knee ? ch('fx') + ch('tn') : ''}${ch('im')}${ch('kn')}${ch('uni')}
    <label class="f">Indicación técnica (la ve el deportista)<input id="bkC" maxlength="300" value="${esc(BK.cue)}" placeholder="Ej.: rodilla alineada con el segundo dedo"></label>
    <label class="f">Video<input id="bkV" type="url" value="${esc(BK.video)}" placeholder="https://…"></label>
    <label class="chk"><input type="checkbox" id="bkO"${BK.oculto ? ' checked' : ''}> No ponerlo solo en los planes (queda para elegirlo a mano)</label>
    <div class="rvact">
      ${BK.mode === 'edit' ? '<button type="button" class="ghostb danger" data-bx="del">Eliminar</button>' : ''}
      <button type="button" class="ghostb" data-bx="cancel">Cancelar</button>
      <button type="button" class="primary grow" data-bx="save">${BK.mode === 'new' ? 'Crear ejercicio' : 'Guardar cambios'}</button>
    </div></section>`;
}
function bkSync(){ if(!BK) return; const n = $('#bkN'), c = $('#bkC'), v = $('#bkV'), o = $('#bkO'); if(n) BK.n = n.value; if(c) BK.cue = c.value; if(v) BK.video = v.value; if(o) BK.oculto = o.checked; }
function bkOpen(n){
  if(n){ const e = bkEntry(n); BK = {mode: 'edit', orig: n, n, bloque: e.b, reg: e.reg, fx: bkFx(e.fx), im: +e.im, tn: +e.tn, kn: +e.kn, uni: +e.uni, cue: e.cue, video: e.video, oculto: e.oculto}; }
  else BK = {mode: 'new', orig: null, n: '', bloque: 'central', reg: 'rod', fx: 0, im: 0, tn: 0, kn: 0, uni: 0, cue: '', video: '', oculto: false};
  render(); setTimeout(() => { $('#bkEd')?.scrollIntoView({block: 'start', behavior: 'smooth'}); if(!n) $('#bkN')?.focus(); }, 30);
}
function bkSave(){
  bkSync();
  const n = (BK.n || '').trim().replace(/\s+/g, ' ');
  if(n.length < 3){ toast('Escribe el nombre del ejercicio.'); $('#bkN')?.focus(); return; }
  const dup = bkAll().find(x => x !== BK.orig && !bkDel(x) && _N(x) === _N(n));
  if(dup){ toast(`Ya tienes "${dup}" en el banco.`); $('#bkN')?.focus(); return; }
  const video = (BK.video || '').trim();
  if(video && !/^https?:\/\//i.test(video)){ toast('El video debe ser un enlace que empiece por http:// o https://'); $('#bkV')?.focus(); return; }
  const renamed = BK.mode === 'edit' && n !== BK.orig;
  if(renamed){ myMeta[BK.orig] = Object.assign({}, myMeta[BK.orig], {eliminado: true, revisado: true}); saveLib(BK.orig); }
  if(!bkBase().has(n) && !myLib.includes(n)) myLib.push(n);
  myMeta[n] = Object.assign({}, myMeta[n], {bloque: BK_BLQ[BK.bloque], region: BK.reg, fx: +BK.fx, im: +BK.im, tn: +BK.tn, kneel: +BK.kn, uni: +BK.uni,
    cue: (BK.cue || '').trim(), video, oculto: !!BK.oculto, revisado: true, eliminado: false});
  const mode = BK.mode; BK = null; buildBanco(); renderLib(); saveLib(n);
  $('#saveState').textContent = 'Banco guardado';
  bancoQ.q = ''; bancoQ.solo = ''; render();
  toast(mode === 'new' ? `Creado: ${n}` : renamed ? `Guardado como: ${n}` : 'Cambios guardados');
}

/* ---------- Vista ---------- */
bancoView = function(){
  const q = _N(bancoQ.q), eli = bancoQ.solo === 'eli';
  let list = bkAll().filter(n => eli ? bkDel(n) : !bkDel(n)).map(bkEntry);
  if(q) list = list.filter(e => _N(e.n).includes(q));
  if(bancoQ.b) list = list.filter(e => e.b === bancoQ.b);
  if(bancoQ.reg) list = list.filter(e => e.reg === bancoQ.reg);
  if(bancoQ.solo === 'prop') list = list.filter(e => e.propio);
  if(bancoQ.solo === 'vid') list = list.filter(e => !e.video);
  list.sort((a, b) => a.n.localeCompare(b.n, 'es'));
  const total = list.length, per = 50, pages = Math.max(1, Math.ceil(total / per)), pag = Math.min(bancoQ.pag, pages - 1);
  const act = bkAll().filter(n => !bkDel(n)).length;
  return `${BK ? bkEditor() : ''}
  <section class="card bk">
    <div class="rowhead"><h3 class="sec" style="margin:0">Banco de ejercicios · ${act}</h3><button type="button" class="primary" data-bx="new">Nuevo ejercicio</button></div>
    <p class="small">Los básicos y los que más usas. El generador los toma de aquí según sus etiquetas.</p>
    <div class="bfilters">
      <input type="search" id="bq" placeholder="Buscar ejercicio" value="${esc(bancoQ.q)}" aria-label="Buscar ejercicio">
      <select id="bb" aria-label="Bloque"><option value="">Todos los bloques</option>${SEG_ORDER.map(k => `<option value="${k}"${bancoQ.b === k ? ' selected' : ''}>${BK_BLQ[k]}</option>`).join('')}</select>
      <select id="br" aria-label="Región"><option value="">Todas las regiones</option>${Object.entries(REGIONES).map(([k, v]) => `<option value="${k}"${bancoQ.reg === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
      <select id="bs" aria-label="Mostrar"><option value="">Activos</option><option value="prop"${bancoQ.solo === 'prop' ? ' selected' : ''}>Creados por mí</option><option value="vid"${bancoQ.solo === 'vid' ? ' selected' : ''}>Sin video</option><option value="eli"${eli ? ' selected' : ''}>Eliminados</option></select>
    </div>
    ${total ? `<ul class="bklist">${list.slice(pag * per, pag * per + per).map(e => `<li>
      <div class="bkm"><b>${esc(e.n)}</b><span>${esc(bkTags(e))}</span></div>
      <div class="bka">${eli ? `<button type="button" class="mini-btn" data-brest="${esc(e.n)}">Restaurar</button>`
        : `<button type="button" class="mini-btn" data-bed="${esc(e.n)}">Editar</button><button type="button" class="xbtn" data-bdel="${esc(e.n)}" aria-label="Eliminar ${esc(e.n)}" title="Eliminar">×</button>`}</div></li>`).join('')}</ul>`
      : `<p class="small">${eli ? 'No hay ejercicios eliminados.' : 'No hay ejercicios con ese filtro.'}</p>`}
    ${pages > 1 ? `<div class="actions"><button id="bPrev"${pag === 0 ? ' disabled' : ''}>Anterior</button><span class="small">Página ${pag + 1} de ${pages}</span><button id="bNext"${pag + 1 >= pages ? ' disabled' : ''}>Siguiente</button></div>` : ''}
  </section>`;
};

$('#out').addEventListener('click', e => {
  let b;
  if((b = e.target.closest('[data-bkx]'))){ bkSync(); const [k, v] = b.dataset.bkx.split('|'); BK[k] = k === 'bloque' || k === 'reg' ? v : +v; render(); return; }
  if((b = e.target.closest('[data-bed]'))){ bkOpen(b.dataset.bed); return; }
  if((b = e.target.closest('[data-bx]'))){
    const a = b.dataset.bx;
    if(a === 'new') bkOpen(null);
    if(a === 'cancel'){ BK = null; render(); }
    if(a === 'save') bkSave();
    if(a === 'del'){ const n = BK.orig; BK = null; bancoSetDel(n, true); undoToast(`Eliminado: ${n}`, () => bancoSetDel(n, false)); }
  }
});
$('#out').addEventListener('keydown', e => { if(e.key === 'Enter' && e.target.id === 'bkN'){ e.preventDefault(); bkSave(); } });
