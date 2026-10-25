/* ===================== TRABAJO EN CASA (oct 2026) =====================
   Sección "En casa" en la ficha de cada usuario de rehabilitación (rodilla, lumbar, hombro, tobillo).
   - Se genera según el módulo y la fase actual: el programa de casa de la fase si la literatura lo
     define (tobillo: Hupperets 2009, Bleakley 2010) o, si no, la terapia diaria y los ejercicios de la
     fase que se pueden hacer sin gimnasio.
   - Todo es editable (nombre, series, reps, nota, frecuencia e indicaciones) y se guarda en la ficha.
   - "Enviar a su app" lo pone en su plan publicado; también viaja con cada publicación.
   - PDF con el estilo de la plantilla (pdfapex.js), para el fisio y para el usuario. */

if(typeof MOD_L !== 'undefined') MOD_L.tobillo = 'Rehab';

/* Pruebas del tobillo en la evaluación */
if(typeof PF_TESTS !== 'undefined' && !PF_TESTS.some(g => g.g === 'Tobillo')){
  PF_TESTS.push({g:'Tobillo', t:[
    {k:'cait', n:'CAIT (Cumberland Ankle Instability Tool)', u:'pts', up:1, fl:v=> v<24 ? 'Por debajo de 24: inestabilidad' : '', ev:['t_gribble14']},
    {k:'ybalAnt', n:'Y-balance anterior (diferencia con el lado sano)', u:'cm', up:0, fl:v=> v>=4 ? '4 cm o más: asimetría' : ''},
    {k:'talonLsi', n:'Elevaciones de talón en un pie (% del lado sano)', u:'%', up:1, fl:v=> v<90 ? '< 90 % del lado sano' : ''},
    {k:'sideHop', n:'Side hop test (% del lado sano)', u:'%', up:1, fl:v=> v<90 ? '< 90 % del lado sano' : ''}]});
  if(typeof PF_ALL !== 'undefined') PF_ALL.push(...PF_TESTS[PF_TESTS.length - 1].t);
}
/* Grado del esguince: solo en esguince agudo */
const _syncVisTobG = syncVisibility;
syncVisibility = function(){ _syncVisTobG.apply(this, arguments); const g = document.querySelector('[data-tobag]'); if(g) g.hidden = st.tobCond === 'cronica'; };

/* ---------- Generar ---------- */
const CASA_GYM = /barra|polea|m[aá]quina|prensa|smith|hack|trap bar|landmine|jal[oó]n|isoinercial|bfr|dominadas|press banca|press militar|hip thrust|peso muerto(?! rumano en un pie)|sentadilla (trasera|frontal)|remo con barra|turkish|kettlebell|swing|caj[oó]n alto|bicicleta|trote|zigzag|sprint|dinam[oó]metro|curl femoral|extensi[oó]n de rodilla unilateral|balón medicinal|anillas|trx|banco inclinado/i;
const CASA_MAX = 7;
const casaRegla = s => (typeof rehabInfo === 'function' && rehabInfo(s)?.regla) || (modOf(s) === 'lumbar'
  ? 'Dolor de espalda hasta 3/10 durante el ejercicio y al día siguiente igual o mejor: vas bien. Entre 4 y 5: mantén. Más de 5, peor al día siguiente o si el dolor baja hacia la pierna: baja la carga y avísale a tu fisioterapeuta.'
  : 'Dolor hasta 3/10 durante el ejercicio y al día siguiente igual o mejor: vas bien. Entre 4 y 5: mantén la carga. Más de 5 o peor al día siguiente: baja la carga y avísale a tu fisioterapeuta.');
function casaFuente(s){
  const key = pkey(s), i = phaseIdx(s), ph = P[key].phases[i], mo = modOf(s);
  if(ph.casa) return {ph, items: ph.casa.slice(), frec: ph.casaFrec || '1 vez al día', ev: ph.casaEv || ph.ev || []};
  const items = [], seen = new Set(), add = it => { if(it && !seen.has(it.n) && items.length < CASA_MAX){ seen.add(it.n); items.push(it); } };
  if(mo === 'rodilla' && typeof dailyTherapy === 'function') dailyTherapy(key, i, s).forEach(add);
  if(ph.home) add(ph.home);
  const pool = [].concat(ph.act || [], ph.neuro || [], ph.central || [], (ph.blocks || []).flatMap(b => b.items || []));
  pool.filter(it => !CASA_GYM.test(it.n) && !it.lift).forEach(add);
  const ev = ph.ev?.length ? ph.ev : (ph.blocks || []).flatMap(b => b.ev || []).filter(k => k !== 'exp');
  const frec = mo === 'rodilla' ? 'Todos los días, 1 vez (15–20 min)' : mo === 'lumbar' ? 'Todos los días: ejercicios 15 min + caminar' : '1 vez al día, 15–20 min';
  return {ph, items, frec, ev};
}
function casaGen(s){
  const {ph, items, frec, ev} = casaFuente(s);
  return {fase: ph.name, key: pkey(s) + '|' + phaseIdx(s), fecha: todayISO(), frec, nota: casaRegla(s), ev: [...new Set(ev)],
    rows: items.slice(0, CASA_MAX).map(it => { const r = toRow(it); return {e: r.e, s: r.s, r: r.r, n: r.n}; })};
}
const casaDe = s => (s.casa && Array.isArray(s.casa.rows)) ? s.casa : null;

/* ---------- Vista del fisio ---------- */
function casaView(){
  const c = casaDe(st), ph = P[pkey(st)].phases[phaseIdx(st)], vieja = c && c.key !== pkey(st) + '|' + phaseIdx(st);
  if(!c) return `<div class="cs"><section class="card cs-card"><span class="fx-eye">${esc(ph.name)}</span><h2 class="cs-h">Trabajo en casa</h2>
    <p class="small">Genera el programa para la casa según ${esc(subLabel(st, P[pkey(st)]))} y la fase actual. Después lo editas, lo descargas en PDF y lo envías a su app.</p>
    <div class="actions"><button type="button" class="primary" data-cs="gen">Generar según la fase</button><button type="button" data-cs="blank">Empezar en blanco</button></div></section></div>`;
  const ev = (c.ev || []).filter(k => R[k]);
  return `<div class="cs">
    ${vieja ? `<div class="draft cs-old"><span><b>De otra fase.</b> Se generó para ${esc(String(c.fase || '').split(' · ')[0].toLowerCase())}; ahora va en ${esc(ph.name.split(' · ')[0].toLowerCase())}.</span><button type="button" data-cs="gen">Regenerar</button></div>` : ''}
    <section class="card cs-card">
      <span class="fx-eye">${esc(c.fase || ph.name)}</span><h2 class="cs-h">Trabajo en casa</h2>
      <label class="f">Frecuencia<input type="text" data-csf="frec" value="${esc(c.frec || '')}" maxlength="120"></label>
      <div class="cs-rows">${c.rows.map((r, i) => `<div class="cs-row">
        <div class="cs-top"><textarea rows="1" class="grow cs-e" data-csr="${i}|e" aria-label="Ejercicio" placeholder="Ejercicio">${esc(r.e)}</textarea><button type="button" class="cs-x" data-cs="del|${i}" aria-label="Quitar ${esc(r.e)}">×</button></div>
        <div class="cs-sr"><label>Series<input type="text" data-csr="${i}|s" value="${esc(r.s || '')}" maxlength="20"></label><label>Reps / tiempo<input type="text" data-csr="${i}|r" value="${esc(r.r || '')}" maxlength="40"></label></div>
        ${r.n || r._nota ? `<textarea rows="1" class="grow cs-n" data-csr="${i}|n" aria-label="Nota" placeholder="Nota">${esc(r.n || '')}</textarea>` : `<button type="button" class="addnote" data-cs="nota|${i}">+ Añadir nota</button>`}
      </div>`).join('')}</div>
      <button type="button" class="cs-add" data-cs="add">+ Añadir ejercicio</button>
      <label class="f">Indicaciones<textarea rows="2" class="grow" data-csf="nota" maxlength="800">${esc(c.nota || '')}</textarea></label>
      <div class="actions cs-acts"><button type="button" class="primary" data-cs="pdf">Descargar PDF</button><button type="button" data-cs="send">Enviar a su app</button><button type="button" data-cs="gen">Regenerar</button></div>
      ${c.enviado ? `<p class="small cs-sent">Enviado a su app el ${esc(fmtD(c.enviado))}.${c.editado && c.editado > c.enviado ? ' Tiene cambios sin enviar.' : ''}</p>` : '<p class="small cs-sent">Aún no está en su app.</p>'}
      ${ev.length ? refList(ev) : ''}
    </section></div>`;
}
function casaTouch(){ const c = casaDe(st); if(c) c.editado = new Date().toISOString().slice(0, 16); markDirty(); }
function casaPintar(){
  if(!document.body.classList.contains('fx') || view !== 'casa') return;
  const out = $('#out'), nav = out && out.querySelector(':scope > .fx-secsel'); if(!nav) return;
  [...out.children].forEach(el => { if(!(el.id === 'accCard' || el.classList.contains('fx-fhead') || el === nav || el.classList.contains('example') || el.classList.contains('foot'))) el.remove(); });
  nav.insertAdjacentHTML('afterend', casaView());
  if(typeof growAll === 'function') growAll(out); else out.querySelectorAll('textarea.grow').forEach(t => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; });
}
// La sección aparece solo en rehabilitación (y con un usuario guardado)
const casaOn = () => typeof isRehab === 'function' && isRehab(st) && !isExample;
function casaSecs(){
  const i = FX_SECS.findIndex(x => x[0] === 'casa');
  if(casaOn() && i < 0) FX_SECS.splice(2, 0, ['casa', 'En casa']);
  if(!casaOn() && i >= 0) FX_SECS.splice(i, 1);
  if(!casaOn() && view === 'casa') view = 'plan';
}
const _panelViewCasa = panelView;
panelView = function(){ return view === 'casa' ? '' : _panelViewCasa.apply(this, arguments); };
const _renderCasa = render;
render = function(){ casaSecs(); const r = _renderCasa.apply(this, arguments); try{ casaPintar(); }catch(e){ console.error(e); } return r; };

$('#out').addEventListener('input', e => {
  const t = e.target, c = casaDe(st); if(!c) return;
  if(t.dataset.csr){ const [i, f] = t.dataset.csr.split('|'); if(c.rows[+i]){ c.rows[+i][f] = t.value; casaTouch(); } }
  else if(t.dataset.csf){ c[t.dataset.csf] = t.value; casaTouch(); }
  if(t.matches('textarea.grow')){ t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }
});
$('#out').addEventListener('keydown', e => {
  if(e.key !== 'Enter' || e.shiftKey || e.isComposing || !e.target.closest?.('.cs-card')) return;
  const t = e.target; if(!t.matches('[data-csr], [data-csf="frec"]')) return;
  e.preventDefault();
  const all = [...document.querySelectorAll('.cs-card [data-csf="frec"], .cs-card [data-csr]')], nx = all[all.indexOf(t) + 1];
  if(nx){ nx.focus(); if(nx.tagName === 'INPUT') nx.select(); } else t.blur();
}, true);
$('#out').addEventListener('click', async e => {
  const b = e.target.closest('[data-cs]'); if(!b) return;
  const [a, i] = b.dataset.cs.split('|'); let c = casaDe(st);
  if(a === 'gen'){
    if(c && c.rows.length && !confirm('Se reemplaza el trabajo en casa actual por el de la fase. ¿Seguir?')) return;
    const prev = c; st.casa = casaGen(st); if(prev?.enviado) st.casa.enviado = prev.enviado; casaTouch(); render(); toast('Trabajo en casa generado. Revísalo y ajústalo.'); return;
  }
  if(a === 'blank'){ const ph = P[pkey(st)].phases[phaseIdx(st)]; st.casa = {fase: ph.name, key: pkey(st) + '|' + phaseIdx(st), fecha: todayISO(), frec: '1 vez al día', nota: casaRegla(st), ev: [], rows: [{e: '', s: '', r: '', n: ''}]}; casaTouch(); render(); document.querySelector('.cs-card [data-csr="0|e"]')?.focus(); return; }
  if(!c) return;
  if(a === 'del'){ c.rows.splice(+i, 1); casaTouch(); render(); return; }
  if(a === 'add'){ c.rows.push({e: '', s: '', r: '', n: ''}); casaTouch(); render(); document.querySelector(`.cs-card [data-csr="${c.rows.length - 1}|e"]`)?.focus(); return; }
  if(a === 'nota'){ c.rows[+i]._nota = 1; render(); document.querySelector(`.cs-card [data-csr="${i}|n"]`)?.focus(); delete c.rows[+i]._nota; return; }
  if(a === 'pdf'){ b.disabled = true; try{ await casaPDF(casaData(st)); } finally { b.disabled = false; } return; }
  if(a === 'send'){ b.disabled = true; try{ await casaEnviar(true); } finally { b.disabled = false; } }
});
// Para el usuario y el PDF: solo lo escrito
function casaData(s){
  const c = casaDe(s) || {rows: []};
  return {nombre: s.nombre || '', mujer: !!(s.pf && s.pf.sexo === 'm'), cond: subLabel(s, P[pkey(s)]), zona: (typeof rehabInfo === 'function' && rehabInfo(s)?.zona) || '',
    fase: c.fase || '', frec: c.frec || '', nota: c.nota || '', ev: (c.ev || []).filter(k => R[k]).map(k => R[k].c.split(/[ ,]/)[0] + ' ' + ((R[k].c.match(/\b(?:19|20)\d{2}\b/) || [''])[0])),
    rows: c.rows.filter(r => (r.e || '').trim()).map(r => ({e: r.e.trim(), s: (r.s || '').trim(), r: (r.r || '').trim(), n: (r.n || '').trim()}))};
}
async function casaEnviar(avisar){
  const c = casaDe(st); if(!c || !curId || isExample) return false;
  const data = casaData(st);
  if(!data.rows.length){ if(avisar) toast('Agrega al menos un ejercicio.'); return false; }
  const {data: pl, error} = await sb.from('planes').select('id,contenido').eq('paciente_id', curId).order('publicado_at', {ascending: false}).limit(1);
  if(error){ if(avisar) toast('No se pudo enviar.'); return false; }
  if(!pl?.length){ if(avisar) toast('Publica primero su plan: el trabajo en casa va dentro de él.'); return false; }
  const contenido = Object.assign({}, pl[0].contenido, {casa: data});
  const {error: e2} = await sb.from('planes').update({contenido}).eq('id', pl[0].id);
  if(e2){ if(avisar) toast('No se pudo enviar.'); return false; }
  c.enviado = new Date().toISOString().slice(0, 16); c.editado = c.enviado; markDirty(); if(view === 'casa') render();
  if(avisar) toast(`Trabajo en casa enviado: ya lo ve ${st.nombre ? st.nombre.split(' ')[0] : 'en su app'}.`);
  return true;
}
// Al publicar el plan, el trabajo en casa viaja con él
const _publishCasa = publishPlan;
publishPlan = async function(){ const r = await _publishCasa.apply(this, arguments); if(casaDe(st)?.rows?.length && isRehab(st)) await casaEnviar(false); return r; };

/* ---------- PDF ---------- */
async function casaPDF(d){
  if(!d.rows.length){ toast('Agrega al menos un ejercicio.'); return; }
  try{
    const fase = (d.fase || '').split(' · ')[0], zona = d.zona ? d.zona.toUpperCase() : 'REHAB';
    const bloques = [{titulo: 'Ejercicios', barra: 'Trabajo en casa', rows: d.rows}];
    const ind = [d.frec ? 'Frecuencia: ' + d.frec + '.' : '', d.nota, 'Haz todo lo de un pie o una pierna con los dos lados.', d.ev?.length ? 'Basado en: ' + d.ev.join(' · ') + '.' : ''].filter(Boolean);
    bloques.push({titulo: 'Indicaciones', barra: 'Cómo hacerlo', mid: 'GUÍA', derecha: ' ', texto: ind});
    const doc = await apxPDF({autor: apxAutor(), eyebrow: `TRABAJO EN CASA — ${new Date().getFullYear()}`, titulo: ['TRABAJO', 'EN CASA'],
      intro: `${d.cond}${d.fase ? '. ' + d.fase : ''}.`, fase: fase,
      derecha: `${fase ? fase + ' · ' : ''}${zona}`.toUpperCase(),
      info: [[d.mujer ? 'Usuaria' : 'Usuario', d.nombre || '—'], ['Fase', (fase || '—').toUpperCase(), true], ['Ejercicios', apxPad(d.rows.length)], ['Zona', zona]],
      paginas: [{titulo: 'EN CASA', tags: [d.frec.length > 34 ? d.frec.split(/[,(]/)[0] : d.frec, d.cond.split(' (')[0]].filter(Boolean), bloques}]});
    await apxSave(doc, `En casa - ${(d.nombre || 'usuario').replace(/[^\p{L}\p{N} _-]/gu, '')}.pdf`);
  }catch(e){ console.error(e); toast('No se pudo generar el PDF.'); }
}

/* ---------- Vista del usuario: "En casa" en Mi plan ---------- */
const _hPlanCasa = hPlan;
hPlan = function(c){
  const html = _hPlanCasa.apply(this, arguments), k = c && c.casa;
  if(!k || !k.rows?.length) return html;
  const sec = `<section class="ap-sec"><div class="ap-head"><h2>En casa</h2></div>
    <div class="ap-card"><p><b>${esc(k.frec || '')}</b></p>${k.nota ? `<p class="ap-muted">${esc(k.nota)}</p>` : ''}</div>
    <div class="ap-list">${k.rows.map(r => `<div class="ap-row"><span class="ap-l"><b>${esc(r.e)}</b><span>${esc([r.s && r.r ? `${r.s} × ${r.r}` : r.r || r.s, r.n].filter(Boolean).join('. '))}</span></span></div>`).join('')}</div>
    <div class="ap-acts"><button type="button" class="ap-btn ap-secondary" data-apcasa>Descargar PDF</button></div></section>`;
  const i = html.lastIndexOf('</div>');
  return html.slice(0, i) + sec + html.slice(i);
};
$('#athleteApp').addEventListener('click', async e => {
  const b = e.target.closest('[data-apcasa]'); if(!b) return;
  const k = A.plan?.contenido?.casa; if(!k) return;
  b.disabled = true; try{ await casaPDF(Object.assign({}, k, {nombre: k.nombre || A.p?.nombre || ''})); } finally { b.disabled = false; }
});
