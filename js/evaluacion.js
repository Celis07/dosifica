/* ===================== PERFIL DE EVALUACIÓN (ficha del fisio) =====================
   Cuando llega la persona, el fisio va marcando lo que tiene y queda guardado su perfil:
   antecedentes y banderas, dolor y zonas, y pruebas físicas con su historial.
   Se guarda en la ficha (st.perfil) junto con el resto del estado del paciente. */

if(typeof MOD_L !== 'undefined') MOD_L.hombro = 'Rehab';
Object.assign(R, {
  e_jones99:{l:'C',c:'Jones CJ, Rikli RE, Beam WC. A 30-s chair-stand test as a measure of lower body strength in community-residing older adults. Res Q Exerc Sport. 1999;70(2):113-119.',k:'Prueba válida y confiable de fuerza de piernas en adultos mayores; compara contra normas por edad y sexo.'},
  e_podsiadlo91:{l:'C',c:'Podsiadlo D, Richardson S. The timed "Up & Go": a test of basic functional mobility for frail elderly persons. J Am Geriatr Soc. 1991;39(2):142-148.',k:'Levantarse de la silla, caminar 3 m, volver y sentarse. La guía STEADI del CDC usa 12 s o más como riesgo de caídas.'},
  e_cruz19:{l:'C',c:'Cruz-Jentoft AJ, Bahat G, Bauer J, et al. Sarcopenia: revised European consensus on definition and diagnosis (EWGSOP2). Age Ageing. 2019;48(1):16-31.',k:'Fuerza baja: prensión < 27 kg en hombres y < 16 kg en mujeres, o 5 repeticiones de silla > 15 s. Rendimiento bajo: marcha ≤ 0,8 m/s.'},
  e_studenski11:{l:'B',c:'Studenski S, Perera S, Patel K, et al. Gait speed and survival in older adults. JAMA. 2011;305(1):50-58.',k:'La velocidad de marcha se asocia con la supervivencia en adultos mayores; cada 0,1 m/s más, menor riesgo.'}
});

const PF_ANT = [['hta','Hipertensión'],['dm','Diabetes'],['cardio','Enfermedad del corazón'],['resp','Asma o EPOC'],['osteo','Osteoporosis'],['artrosis','Artrosis'],['cancer','Cáncer (actual o previo)'],['cirugia','Cirugías previas'],['lesion','Lesiones previas'],['caidas','Caídas en el último año'],['embarazo','Embarazo o posparto'],['fuma','Fuma']];
const PF_RF = [['noche','Dolor nocturno que no cede con nada'],['peso','Pérdida de peso sin explicación'],['fiebre','Fiebre o malestar general'],['cancerAnt','Antecedente de cáncer con dolor nuevo'],['trauma','Trauma importante reciente'],['neuro','Hormigueo, debilidad o cambios en orina o deposición'],['pecho','Dolor en el pecho o falta de aire con el esfuerzo'],['mareo','Mareos o desmayos']];
const PF_YF = [['miedo','Miedo a moverse o a lesionarse'],['dano','Cree que el dolor es daño'],['catastrof','Catastrofiza ("esto no tiene arreglo")'],['estres','Estrés alto o ánimo bajo'],['sueno','Duerme mal'],['pasivo','Espera solo tratamientos pasivos'],['laboral','Problemas laborales o de incapacidad']];
const PF_ACT = [['sed','Sedentario'],['act','Activo'],['rec','Deportista recreativo'],['comp','Competitivo']];
const PF_TIPO = [['mec','Con el movimiento'],['const','Constante'],['noct','Nocturno'],['irr','Se irradia'],['rig','Rigidez matutina > 30 min']];
const PF_TIEMPO = [['ag','< 6 semanas'],['sub','6–12 semanas'],['cr','> 12 semanas']];
const PF_TESTS = [
  {g:'Funcionales y adulto mayor', t:[
    {k:'sts30', n:'Sentarse y pararse en 30 s', u:'reps', up:1, ev:['e_jones99']},
    {k:'sts5', n:'5 repeticiones de silla', u:'s', up:0, fl:v=> v>15 ? 'Más de 15 s: fuerza baja' : '', ev:['e_cruz19']},
    {k:'tug', n:'Timed Up and Go', u:'s', up:0, fl:v=> v>=12 ? '12 s o más: riesgo de caídas' : '', ev:['e_podsiadlo91']},
    {k:'marcha', n:'Velocidad de marcha (4 m)', u:'m/s', up:1, fl:v=> v<=0.8 ? '≤ 0,8 m/s: rendimiento físico bajo' : '', ev:['e_cruz19','e_studenski11']},
    {k:'grip', n:'Fuerza de prensión', u:'kg', up:1, fl:(v,p)=> p.sexo==='m' && v<16 ? '< 16 kg: fuerza baja' : p.sexo==='h' && v<27 ? '< 27 kg: fuerza baja' : '', ev:['e_cruz19']},
    {k:'unipodal', n:'Apoyo unipodal, ojos abiertos', u:'s', up:1}]},
  {g:'Fuerza y rendimiento', t:[
    {k:'flexiones', n:'Flexiones de brazos', u:'reps', up:1},
    {k:'sorensen', n:'Biering-Sørensen (extensores de tronco)', u:'s', up:1, ev:['l_mcgill99']},
    {k:'planchaL', n:'Plancha lateral', u:'s', up:1, ev:['l_mcgill99']},
    {k:'cmj', n:'Salto vertical (CMJ)', u:'cm', up:1},
    {k:'hopLsi', n:'Salto unipodal a distancia (% del lado sano)', u:'%', up:1, fl:v=> v<90 ? '< 90 %: asimetría relevante' : '', ev:['grindem']},
    {k:'sent1rm', n:'Sentadilla, 1RM estimado', u:'kg', up:1}]},
  {g:'Movilidad y hombro', t:[
    {k:'reLsi', n:'Fuerza de rotación externa (% del lado sano)', u:'%', up:1, fl:v=> v<90 ? '< 90 % del lado sano' : ''},
    {k:'flexHom', n:'Flexión de hombro (lado afectado)', u:'°', up:1},
    {k:'ckcuest', n:'CKCUEST (toques en 15 s)', u:'toques', up:1},
    {k:'tobillo', n:'Dorsiflexión en carga (rodilla a la pared)', u:'cm', up:1}]}
];
const PF_ALL = PF_TESTS.flatMap(g => g.t);
let pfZona = null, pfPre = null, pfPreFor = null;

function pfGet(){ if(!st.perfil) st.perfil = {}; const p = st.perfil; ['ant','rf','yf'].forEach(k => { if(!Array.isArray(p[k])) p[k] = []; }); if(!Array.isArray(p.dolor)) p.dolor = []; if(!p.pr) p.pr = {}; if(!Array.isArray(p.otras)) p.otras = []; return p; }
function pfTouch(){ st.perfil.upd = todayISO(); markDirty(); }
const pfChips = (grp, list, sel, cls) => `<div class="pf-chips">${list.map(([k, l]) => `<button type="button" class="pf-chip${sel.includes(k) ? ' on' : ''}${cls ? ' ' + cls : ''}" data-pft="${grp}|${k}" aria-pressed="${sel.includes(k)}">${esc(l)}</button>`).join('')}</div>`;
const pfNum = v => String(v).replace('.', ',');
function pfTestRow(t, p){
  const h = (p.pr[t.k] || []), last = h[h.length - 1], prev = h[h.length - 2];
  const fl = last && t.fl ? t.fl(+last.v, p) : '';
  let dl = '';
  if(last && prev){ const d = +last.v - +prev.v; if(d){ const good = t.up ? d > 0 : d < 0; dl = `<span class="pf-d ${good ? 'up' : 'dn'}">${d > 0 ? '+' : ''}${pfNum(Math.round(d * 100) / 100)}</span>`; } }
  return `<div class="pf-test"><div class="pf-tl"><b>${esc(t.n)}</b>
      <span>${last ? `<strong>${esc(pfNum(last.v))} ${esc(t.u)}</strong> · ${esc(fmtD(last.f))} ${dl}` : 'Sin registrar'}${h.length > 1 ? ` <span class="pf-h">${h.slice(-5, -1).map(x => esc(pfNum(x.v))).join(' → ')} → ${esc(pfNum(last.v))}</span>` : ''}</span>
      ${fl ? `<span class="pf-flag">${esc(fl)}</span>` : ''}</div>
    <div class="pf-in"><input type="number" inputmode="decimal" step="any" data-pfv="${t.k}" aria-label="${esc(t.n)} (${esc(t.u)})" placeholder="${esc(t.u)}"><button type="button" class="mini-btn" data-pfadd="${t.k}">Guardar</button>${h.length ? `<button type="button" class="mini-btn ghost" data-pfundo="${t.k}" title="Quitar el último registro" aria-label="Quitar el último registro de ${esc(t.n)}">↺</button>` : ''}</div></div>`;
}
function pfSummary(p){
  const out = [];
  if(p.rf.length) out.push(`<span class="pf-sum r">${p.rf.length} bandera${p.rf.length > 1 ? 's' : ''} roja${p.rf.length > 1 ? 's' : ''}</span>`);
  if(p.yf.length) out.push(`<span class="pf-sum y">${p.yf.length} bandera${p.yf.length > 1 ? 's' : ''} amarilla${p.yf.length > 1 ? 's' : ''}</span>`);
  p.ant.forEach(k => out.push(`<span class="pf-sum">${esc((PF_ANT.find(a => a[0] === k) || [k, k])[1])}</span>`));
  const d = p.dolor.slice().sort((a, b) => (b.i || 0) - (a.i || 0))[0];
  if(d) out.push(`<span class="pf-sum">Dolor: ${esc((ZONAS[d.z] || d.z).toLowerCase())}${d.l ? ' ' + (d.l === 'izq' ? 'izq.' : d.l === 'der' ? 'der.' : 'ambos') : ''} ${d.i ?? '?'}/10</span>`);
  PF_ALL.forEach(t => { const h = p.pr[t.k]; if(h && h.length && t.fl){ const f = t.fl(+h[h.length - 1].v, p); if(f) out.push(`<span class="pf-sum y">${esc(t.n.split(' (')[0])}: ${esc(f.split(':')[0])}</span>`); } });
  return out.join('') || '<span class="ap-muted small">Aún no hay nada marcado.</span>';
}
function pfLoadPre(){
  if(!curId || typeof sb === 'undefined' || !sb || pfPreFor === curId) return;
  pfPreFor = curId; pfPre = null;
  sb.from('prechequeo').select('id,fecha,nivel,puntaje,resp,created_at').eq('paciente_id', curId).order('created_at', {ascending:false}).limit(8)
    .then(({data}) => { if(pfPreFor !== curId) return; pfPre = data || []; if(view === 'eval') render(); });
}
function evalView(){
  const p = pfGet();
  if(!isExample) pfLoadPre();
  const z = pfZona;
  const zonaForm = z ? `<div class="pf-zform">
      <div class="pf-chips">${Object.entries(ZONAS).map(([k, l]) => `<button type="button" class="pf-chip${z.z === k ? ' on' : ''}" data-pfz="z|${k}">${esc(l)}</button>`).join('')}</div>
      ${z.z && ZONA_LADO.includes(z.z) ? `<div class="pf-chips">${[['izq','Izquierdo'],['der','Derecho'],['amb','Ambos']].map(([k, l]) => `<button type="button" class="pf-chip${z.l === k ? ' on' : ''}" data-pfz="l|${k}">${l}</button>`).join('')}</div>` : ''}
      ${z.z ? `<div class="pf-lbl">Intensidad (0–10)</div><div class="pf-n">${Array.from({length:11}, (_, i) => `<button type="button" class="pf-chip${z.i === i ? ' on' : ''}" data-pfz="i|${i}">${i}</button>`).join('')}</div>
      <div class="pf-lbl">Cómo es</div><div class="pf-chips">${PF_TIPO.map(([k, l]) => `<button type="button" class="pf-chip${(z.tipo || []).includes(k) ? ' on' : ''}" data-pfz="tipo|${k}">${esc(l)}</button>`).join('')}</div>
      <div class="pf-lbl">Desde hace</div><div class="pf-chips">${PF_TIEMPO.map(([k, l]) => `<button type="button" class="pf-chip${z.t === k ? ' on' : ''}" data-pfz="t|${k}">${esc(l)}</button>`).join('')}</div>
      <label class="f">Qué lo empeora y qué lo alivia<input type="text" data-pfzt value="${esc(z.nota || '')}"></label>` : ''}
      <div class="actions"><button type="button" class="primary" data-pfzok ${z.z && z.i != null ? '' : 'disabled'}>${z.idx != null ? 'Guardar cambios' : 'Agregar zona'}</button><button type="button" data-pfzcancel>Cancelar</button></div>
    </div>` : `<button type="button" data-pfznew>+ Agregar zona de dolor</button>`;
  const otras = p.otras.map((o, i) => { const last = o.h[o.h.length - 1]; return `<div class="pf-test"><div class="pf-tl"><b>${esc(o.n)}</b><span>${last ? `<strong>${esc(pfNum(last.v))} ${esc(o.u || '')}</strong> · ${esc(fmtD(last.f))}` : 'Sin registrar'}${o.h.length > 1 ? ` <span class="pf-h">${o.h.slice(-5, -1).map(x => esc(pfNum(x.v))).join(' → ')} → ${esc(pfNum(last.v))}</span>` : ''}</span></div>
    <div class="pf-in"><input type="number" inputmode="decimal" step="any" data-pfov="${i}" aria-label="${esc(o.n)}" placeholder="${esc(o.u || 'valor')}"><button type="button" class="mini-btn" data-pfoadd="${i}">Guardar</button><button type="button" class="mini-btn ghost" data-pfodel="${i}" aria-label="Quitar la prueba ${esc(o.n)}">✕</button></div></div>`; }).join('');
  const pre = pfPre && pfPre.length ? `<section class="card"><h3 class="sec">Bienestar en vivo</h3><p class="small" style="margin:0 0 8px">Chequeos antes de entrenar contigo (desde "Bienestar en vivo").</p>
    <div class="pf-pre">${pfPre.map(x => `<div><span class="rc-dot ${esc(x.nivel)}"></span><b>${esc(fmtD(x.fecha))}</b><span>${esc((RCP_L[x.nivel] || {t:''}).t)}${x.puntaje != null ? ` · ${x.puntaje}/20` : ''}${x.resp?.dolor?.z ? ` · dolor ${esc((ZONAS[x.resp.dolor.z] || '').toLowerCase())} ${x.resp.dolor.i}/10` : ''}</span></div>`).join('')}</div></section>` : '';
  return `
  <section class="card pf-top"><div class="pf-head"><div><h3 class="sec" style="margin:0">Perfil de evaluación</h3><p class="small" style="margin:4px 0 0">${p.upd ? `Actualizado el ${esc(fmtD(p.upd))}` : 'Marca lo que tenga la persona; se guarda solo en su ficha.'}</p></div>
    <button type="button" data-pfsave>Guardar ahora</button></div>
    <div class="pf-sums">${pfSummary(p)}</div></section>

  <section class="card"><h3 class="sec">Persona</h3>
    <div class="row2"><label class="f">Sexo<select data-pfk="sexo"><option value="">Sin dato</option><option value="m"${p.sexo === 'm' ? ' selected' : ''}>Mujer</option><option value="h"${p.sexo === 'h' ? ' selected' : ''}>Hombre</option></select></label>
      <label class="f">Edad<input type="number" min="5" max="110" data-pfk="edad" value="${esc(p.edad ?? '')}"></label></div>
    <label class="f">Motivo de consulta<input type="text" data-pfk="motivo" value="${esc(p.motivo || '')}"></label>
    <label class="f">Objetivo de la persona<input type="text" data-pfk="objetivo" value="${esc(p.objetivo || '')}"></label>
    <div class="pf-lbl">Nivel de actividad</div>${pfChips('act1', PF_ACT, p.act ? [p.act] : [])}
  </section>

  <section class="card"><h3 class="sec">Antecedentes y banderas</h3>
    <div class="pf-lbl">Antecedentes</div>${pfChips('ant', PF_ANT, p.ant)}
    <div class="row2"><label class="f">Medicamentos<input type="text" data-pfk="meds" value="${esc(p.meds || '')}"></label>
      <label class="f">Cirugías y lesiones (detalle)<input type="text" data-pfk="antTxt" value="${esc(p.antTxt || '')}"></label></div>
    <div class="pf-lbl">Banderas rojas</div>${pfChips('rf', PF_RF, p.rf, 'red')}
    ${p.rf.length ? `<div class="mod warnmod" style="margin-top:8px"><b>Banderas rojas marcadas.</b> Antes de cargar, valora si hace falta derivar al médico. Ninguna bandera aislada confirma una patología grave; se interpretan en conjunto. ${refList(['l_finucane20','e_riebe15'])}</div>` : ''}
    <div class="pf-lbl">Banderas amarillas</div>${pfChips('yf', PF_YF, p.yf, 'yel')}
    ${p.yf.length >= 2 ? `<div class="mod" style="margin-top:8px"><b>Varias banderas amarillas.</b> Enfoque psicológicamente informado: educación sobre el dolor, exposición gradual a lo que teme y metas por función, no por dolor. ${refList(['l_hill11','l_kent23'])}</div>` : ''}
  </section>

  <section class="card"><h3 class="sec">Dolor y zonas</h3>
    ${p.dolor.length ? `<div class="pf-zl">${p.dolor.map((d, i) => `<div class="pf-z"><div><b>${esc(ZONAS[d.z] || d.z)}${d.l ? ' · ' + (d.l === 'izq' ? 'izquierdo' : d.l === 'der' ? 'derecho' : 'ambos') : ''}</b>
      <span>${d.i ?? '?'}/10${(d.tipo || []).length ? ' · ' + esc(d.tipo.map(k => (PF_TIPO.find(x => x[0] === k) || [k, k])[1].toLowerCase()).join(', ')) : ''}${d.t ? ' · ' + esc((PF_TIEMPO.find(x => x[0] === d.t) || ['', ''])[1]) : ''}${d.nota ? ' · ' + esc(d.nota) : ''}</span></div>
      <div><button type="button" class="mini-btn" data-pfzedit="${i}">Editar</button><button type="button" class="mini-btn ghost" data-pfzdel="${i}" aria-label="Quitar zona">✕</button></div></div>`).join('')}</div>` : '<p class="small" style="margin:0 0 8px">Sin zonas registradas.</p>'}
    ${zonaForm}
  </section>

  <section class="card"><h3 class="sec">Pruebas físicas</h3><p class="small" style="margin:0 0 6px">Registra solo las que hagas. Cada valor queda con su fecha para ver la evolución.</p>
    ${PF_TESTS.map(g => `<details class="pf-g"${g.t.some(t => (p.pr[t.k] || []).length) || g === PF_TESTS[0] ? ' open' : ''}><summary>${esc(g.g)}</summary>${g.t.map(t => pfTestRow(t, p)).join('')}${g.t.some(t => t.ev) ? refList([...new Set(g.t.flatMap(t => t.ev || []))]) : ''}</details>`).join('')}
    <details class="pf-g"${p.otras.length ? ' open' : ''}><summary>Otras pruebas</summary>${otras}
      <div class="pf-in pf-new"><input type="text" data-pfon placeholder="Nombre de la prueba"><input type="text" data-pfou placeholder="Unidad" style="max-width:90px"><button type="button" class="mini-btn" data-pfonew>Agregar</button></div></details>
  </section>
  ${pre}`;
}

/* ---------- Interacción ---------- */
$('#out').addEventListener('click', e => {
  if(view !== 'eval') return;
  const b = e.target.closest('button'); if(!b) return;
  const p = pfGet(), d = b.dataset;
  if(d.pfsave !== undefined){ if(typeof save === 'function') save(false); return; }
  if(d.pft){
    const [g, k] = d.pft.split('|');
    if(g === 'act1') p.act = p.act === k ? '' : k;
    else { const s = new Set(p[g]); s.has(k) ? s.delete(k) : s.add(k); p[g] = [...s]; }
    pfTouch(); return render();
  }
  if(d.pfadd){
    const inp = $(`#out [data-pfv="${d.pfadd}"]`), v = num(inp?.value);
    if(v == null){ toast('Escribe el valor.'); inp?.focus(); return; }
    (p.pr[d.pfadd] = p.pr[d.pfadd] || []).push({f: todayISO(), v}); pfTouch(); toast('Prueba guardada'); return render();
  }
  if(d.pfundo){ const h = p.pr[d.pfundo] || []; h.pop(); if(!h.length) delete p.pr[d.pfundo]; pfTouch(); return render(); }
  if(d.pfonew !== undefined){
    const n = ($('#out [data-pfon]')?.value || '').trim(), u = ($('#out [data-pfou]')?.value || '').trim();
    if(!n){ toast('Escribe el nombre de la prueba.'); return; }
    p.otras.push({n, u, h: []}); pfTouch(); return render();
  }
  if(d.pfoadd){ const i = +d.pfoadd, v = num($(`#out [data-pfov="${i}"]`)?.value); if(v == null){ toast('Escribe el valor.'); return; } p.otras[i].h.push({f: todayISO(), v}); pfTouch(); return render(); }
  if(d.pfodel){ p.otras.splice(+d.pfodel, 1); pfTouch(); return render(); }
  if(d.pfznew !== undefined){ pfZona = {tipo: []}; return render(); }
  if(d.pfzcancel !== undefined){ pfZona = null; return render(); }
  if(d.pfzedit){ pfZona = Object.assign(clone(p.dolor[+d.pfzedit]), {idx: +d.pfzedit}); return render(); }
  if(d.pfzdel){ p.dolor.splice(+d.pfzdel, 1); pfTouch(); return render(); }
  if(d.pfz && pfZona){
    const [k, v] = d.pfz.split('|');
    if(k === 'z'){ pfZona.z = v; if(!ZONA_LADO.includes(v)) delete pfZona.l; }
    else if(k === 'i') pfZona.i = +v;
    else if(k === 'tipo'){ const s = new Set(pfZona.tipo || []); s.has(v) ? s.delete(v) : s.add(v); pfZona.tipo = [...s]; }
    else pfZona[k] = pfZona[k] === v ? '' : v;
    return render();
  }
  if(d.pfzok !== undefined && pfZona){
    const z = Object.assign({}, pfZona), idx = z.idx; delete z.idx;
    if(idx != null) p.dolor[idx] = z; else p.dolor.push(z);
    pfZona = null; pfTouch(); return render();
  }
});
$('#out').addEventListener('input', e => {
  if(view !== 'eval') return;
  const t = e.target;
  if(t.dataset.pfk){ const p = pfGet(); p[t.dataset.pfk] = t.type === 'number' ? num(t.value) : t.value; pfTouch(); }
  if(t.dataset.pfzt !== undefined && pfZona) pfZona.nota = t.value;
});
$('#out').addEventListener('change', e => {
  if(view !== 'eval' || !e.target.dataset.pfk || e.target.tagName !== 'SELECT') return;
  render();   // el sexo cambia los puntos de corte de prensión
});
$('#out').addEventListener('keydown', e => {
  if(view !== 'eval' || e.key !== 'Enter') return;
  const t = e.target;
  if(t.dataset.pfv){ e.preventDefault(); $(`#out [data-pfadd="${t.dataset.pfv}"]`)?.click(); }
  if(t.dataset.pfov){ e.preventDefault(); $(`#out [data-pfoadd="${t.dataset.pfov}"]`)?.click(); }
});
