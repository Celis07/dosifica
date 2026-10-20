/* ===================== BIENESTAR EN VIVO (modo recepción) =====================
   Para las personas que el fisio entrena en persona (por ejemplo adultos mayores): antes de
   empezar, la persona llena en el celular o la tablet del fisio un chequeo corto, sin cuenta.
   Al terminar, el fisio ve un semáforo con cuánto exigir hoy. Se guarda en 'prechequeo'.

   Fundamento:
   - Bienestar autorreportado (sueño, energía, dolor muscular, ánimo) responde a la carga mejor que
     muchas medidas objetivas, y se interpreta contra el promedio de la propia persona (Saw 2016; Hooper 1995).
   - Síntomas que sugieren enfermedad cardiovascular (dolor en el pecho, desmayo, falta de aire o
     palpitaciones inusuales) → no hacer ejercicio y valoración médica (ACSM, Riebe 2015).
   - Adultos mayores: el ejercicio de fuerza se autorregula con el esfuerzo percibido y se ajusta al
     estado del día; equilibrio siempre con apoyo cerca (Fragala 2019; Izquierdo 2021).
   - Una caída reciente es motivo para revisar el riesgo de caídas antes de exigir (Izquierdo 2021). */

Object.assign(R, {
  e_riebe15:{l:'C',c:'Riebe D, Franklin BA, Thompson PD, et al. Updating ACSM\'s recommendations for exercise preparticipation health screening. Med Sci Sports Exerc. 2015;47(11):2473-2479.',k:'Ante signos o síntomas que sugieren enfermedad cardiovascular, metabólica o renal (dolor en el pecho, desmayo, falta de aire o palpitaciones inusuales) se suspende el ejercicio y se pide valoración médica.'},
  e_izq21:{l:'C',c:'Izquierdo M, Merchant RA, Morley JE, et al. International exercise recommendations in older adults (ICFSR): expert consensus guidelines. J Nutr Health Aging. 2021;25(7):824-853.',k:'Fuerza, potencia, equilibrio y resistencia en adultos mayores, ajustados por esfuerzo percibido; detección y prevención de caídas como parte del programa.'}
});

const RCP_Q = [
  {k:'sueno', t:'¿Cómo dormiste anoche?', o:['Muy mal','Mal','Regular','Bien','Muy bien']},
  {k:'energia', t:'¿Cómo está tu energía hoy?', o:['Agotado','Cansado','Normal','Bien','Con mucha energía']},
  {k:'cuerpo', t:'¿Tienes el cuerpo adolorido del último entrenamiento?', o:['Mucho','Bastante','Algo','Poco','Nada']},
  {k:'animo', t:'¿Cómo está tu ánimo hoy?', o:['Muy mal','Estresado o triste','Normal','Bien','Muy bien']},
  {k:'dolor', t:'¿Te duele algo hoy?', type:'dolor'},
  {k:'seg', t:'Desde la última sesión o ahora mismo, ¿has tenido algo de esto?', type:'seg'}
];
const RCP_SEG = [
  ['pecho','Dolor o presión en el pecho', 'x'], ['aire','Falta de aire fuera de lo normal', 'x'], ['palp','Palpitaciones o el corazón acelerado sin razón', 'x'],
  ['desmayo','Desmayo', 'x'], ['mareo','Mareo', 'r'], ['fiebre','Fiebre, gripa o malestar general', 'x'],
  ['caida','Una caída', 'r'], ['meds','Cambios en tus medicamentos o en tu salud', 'y']
];
let RC = null, rcpList = [];

function rcpEl(){
  let el = $('#rcp'); if(el) return el;
  el = document.createElement('div'); el.id = 'rcp'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Bienestar en vivo');
  document.body.appendChild(el);
  el.addEventListener('click', rcpClick); el.addEventListener('input', rcpInput);
  return el;
}
async function rcpOpen(){
  RC = {screen:'pick', q:'', p:null, i:0, r:{}, nuevo:false};
  const el = rcpEl(); el.hidden = false; document.body.classList.add('rcpopen'); rcpRender();
  await rcpLoad(); if(RC && RC.screen === 'pick') rcpRender();
}
function rcpClose(){ RC = null; const el = $('#rcp'); if(el){ el.hidden = true; el.innerHTML = ''; } document.body.classList.remove('rcpopen'); }
async function rcpLoad(){
  if(typeof sb === 'undefined' || !sb) return;
  const {data} = await sb.from('prechequeo').select('id,paciente_id,fecha,nivel,puntaje,resp,created_at').order('created_at', {ascending:false}).limit(600);
  rcpList = data || [];
}
const rcpOf = pid => rcpList.filter(x => x.paciente_id === pid);
const rcpMay = p => { const s = p?.st || {}; return s.poblacion === 'may'; };

/* ---------- Resultado ---------- */
function rcpEval(r, prev){
  const items = ['sueno','energia','cuerpo','animo'].map(k => r[k]).filter(v => v != null);
  const sum = items.reduce((a, b) => a + b, 0), full = items.length === 4;
  const seg = r.seg || [], why = [];
  let lvl = 'g';
  const up = l => { if('gyrx'.indexOf(l) > 'gyrx'.indexOf(lvl)) lvl = l; };
  RCP_SEG.forEach(([k, l, g]) => { if(seg.includes(k)){ up(g); why.push(l); } });
  if(full && sum <= 9){ up('r'); why.push('bienestar muy bajo'); }
  else if(full && sum <= 13){ up('y'); why.push('bienestar bajo'); }
  if(items.filter(v => v === 1).length >= 2){ up('r'); }
  const pi = r.dolor?.i ?? 0;
  if(pi >= 6){ up('r'); why.push(`dolor ${pi}/10`); } else if(pi >= 4){ up('y'); why.push(`dolor ${pi}/10`); }
  // Contra su propio promedio (desde 3 chequeos previos)
  const ps = prev.map(x => x.puntaje).filter(v => v != null);
  let base = null;
  if(ps.length >= 3 && full){
    base = ps.slice(0, 10).reduce((a, b) => a + b, 0) / Math.min(ps.length, 10);
    if(sum <= base - 3 && lvl !== 'x'){ const nx = lvl === 'g' ? 'y' : 'r'; if(nx !== lvl){ lvl = nx; why.push('por debajo de su promedio'); } }
  }
  return {lvl, sum: full ? sum : null, base, why};
}
const RCP_L = {
  g:{t:'Verde · entrena normal', p:'Lo planeado. Puede progresar si en la sesión anterior el esfuerzo quedó bajo.'},
  y:{t:'Amarillo · mantener', p:'Esfuerzo 1 punto menos de lo planeado (deja 1 repetición más en reserva), no subas peso hoy y da pausas más largas.'},
  r:{t:'Rojo · sesión suave', p:'Esfuerzo máximo 5–6 de 10, cerca de un tercio menos de series, sin potencia ni series al fallo. Prioriza movilidad, técnica y caminata.'},
  x:{t:'No entrenar hoy', p:'Evalúa a la persona antes de hacer cualquier ejercicio. Con síntomas que pueden ser del corazón, valoración médica antes de volver. Con fiebre o malestar general, descanso hasta que pase.'}
};
function rcpAdvice(r, ev, p){
  const out = [], seg = r.seg || [], may = rcpMay(p);
  if(['pecho','aire','palp','desmayo'].some(k => seg.includes(k))) out.push('Síntomas que pueden ser cardiovasculares: no entrena hoy. Si el dolor en el pecho está pasando ahora, es una urgencia.');
  if(seg.includes('fiebre')) out.push('Fiebre o malestar general: hoy descanso.');
  if(seg.includes('mareo')) out.push('Mareo: pregunta cuándo y cómo (al pararse, con el esfuerzo, con un medicamento nuevo). Nada de equilibrio sin apoyo ni cambios bruscos de posición hoy.');
  if(seg.includes('caida')) out.push('Caída reciente: pregunta cómo fue y si se golpeó la cabeza. Revisa el riesgo de caídas (Timed Up and Go, apoyo unipodal) y, si fue la segunda en el año o hubo golpe en la cabeza, que lo sepa su médico.');
  if(seg.includes('meds')) out.push('Cambio en medicamentos o salud: pregunta cuál. Algunos (para la presión, el azúcar o el corazón) cambian la respuesta al ejercicio.');
  if(r.dolor?.z){ const z = (typeof ZONAS !== 'undefined' && ZONAS[r.dolor.z]) || r.dolor.z; out.push(`Duele ${z.toLowerCase()}${r.dolor.l ? ' ' + (r.dolor.l === 'izq' ? 'izquierdo' : 'derecho') : ''} (${r.dolor.i}/10): lo que cargue esa zona, con dolor máximo 3/10 durante y que no empeore al día siguiente.`); }
  if(may && ev.lvl !== 'x') out.push('Adulto mayor: equilibrio siempre con un apoyo cerca; si hoy está en amarillo o rojo, potencia y velocidad quedan para otro día.');
  return out;
}

/* ---------- Pantallas ---------- */
const RCP_X = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const RCP_BACK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
function rcpHace(iso){ const t = new Date(iso), d = Math.round((Date.now() - t) / 864e5); return d <= 0 ? 'hoy ' + t.toLocaleTimeString('es-CO', {hour:'numeric', minute:'2-digit'}) : d === 1 ? 'ayer' : `hace ${d} días`; }
function rcpPick(){
  const q = (RC.q || '').trim().toLowerCase();
  const hoy = rcpList.filter(x => x.fecha === todayISO());
  const ps = patients.slice().filter(p => !q || (p.nombre || '').toLowerCase().includes(q))
    .sort((a, b) => { const la = rcpOf(a.id)[0]?.created_at || '', lb = rcpOf(b.id)[0]?.created_at || ''; return lb.localeCompare(la) || (a.nombre || '').localeCompare(b.nombre || ''); });
  return `<div class="rc-page">
    <div class="rc-bar"><span></span><h1>Bienestar en vivo</h1><button type="button" class="rc-ic" data-rc="close" aria-label="Cerrar">${RCP_X}</button></div>
    <p class="rc-sub">Elige a la persona y entrégale el celular. Son 6 preguntas, menos de un minuto.</p>
    ${hoy.length ? `<section class="rc-sec"><h2>Hoy</h2><div class="rc-list">${hoy.map(x => { const p = patients.find(y => y.id === x.paciente_id); return p ? `<button type="button" class="rc-row" data-rcres="${esc(x.id)}"><span class="rc-dot ${x.nivel}"></span><span class="rc-l"><b>${esc(p.nombre)}</b><span>${esc(RCP_L[x.nivel].t)} · ${esc(rcpHace(x.created_at))}</span></span><span class="rc-chev">›</span></button>` : ''; }).join('')}</div></section>` : ''}
    <section class="rc-sec"><h2>¿Quién va a entrenar?</h2>
      <input type="search" class="rc-search" data-rcq placeholder="Buscar por nombre" value="${esc(RC.q || '')}" autocomplete="off">
      <div class="rc-list">${ps.map(p => { const l = rcpOf(p.id)[0]; return `<button type="button" class="rc-row" data-rcp="${esc(p.id)}"><span class="rc-av">${esc((p.nombre || '?').trim().charAt(0).toUpperCase())}</span><span class="rc-l"><b>${esc(p.nombre || 'Sin nombre')}</b><span>${l ? `Último: ${esc(RCP_L[l.nivel].t.split(' · ')[0].toLowerCase())}, ${esc(rcpHace(l.created_at))}` : 'Sin chequeos en vivo'}${rcpMay(p) ? ' · adulto mayor' : ''}</span></span><span class="rc-chev">›</span></button>`; }).join('') || '<p class="rc-sub">No hay personas con ese nombre.</p>'}</div>
      ${RC.nuevo ? `<div class="rc-new"><label>Nombre<input type="text" data-rcnn autocomplete="off" placeholder="Nombre y apellido"></label>
        <label>Tipo<select data-rcnp><option value="may">Adulto mayor (65 años o más)</option><option value="sed">Adulto que empieza</option><option value="act">Adulto activo</option></select></label>
        <button type="button" class="rc-btn" data-rc="crear">Crear y empezar</button></div>`
        : `<button type="button" class="rc-link" data-rc="nuevo">+ Persona nueva</button>`}
    </section></div>`;
}
function rcpQ(){
  const Q = RCP_Q[RC.i], n = RCP_Q.length, r = RC.r, nom = (RC.p.nombre || '').split(' ')[0];
  let body = '';
  if(!Q.type) body = `<div class="rc-opts">${Q.o.map((o, k) => `<button type="button" class="rc-opt${r[Q.k] === k + 1 ? ' on' : ''}" data-rcv="${k + 1}" aria-pressed="${r[Q.k] === k + 1}"><span class="rc-sc s${k + 1}"></span>${esc(o)}</button>`).join('')}</div>`;
  else if(Q.type === 'dolor'){
    const d = r.dolor || {};
    body = `<div class="rc-opts two"><button type="button" class="rc-opt${d.no ? ' on' : ''}" data-rcd="no">No, nada</button><button type="button" class="rc-opt${d.si ? ' on' : ''}" data-rcd="si">Sí</button></div>
    ${d.si ? `<p class="rc-q2">¿Dónde?</p><div class="rc-zonas">${Object.entries(ZONAS).map(([k, l]) => `<button type="button" class="rc-chip${d.z === k ? ' on' : ''}" data-rcz="${k}">${esc(l)}</button>`).join('')}</div>
      ${d.z && ZONA_LADO.includes(d.z) ? `<div class="rc-opts two sm"><button type="button" class="rc-opt${d.l === 'izq' ? ' on' : ''}" data-rcl="izq">Izquierdo</button><button type="button" class="rc-opt${d.l === 'der' ? ' on' : ''}" data-rcl="der">Derecho</button></div>` : ''}
      ${d.z ? `<p class="rc-q2">¿Cuánto duele? (0 nada, 10 el peor dolor)</p><div class="rc-num">${Array.from({length:10}, (_, k) => k + 1).map(v => `<button type="button" class="rc-n${d.i === v ? ' on' : ''}${v >= 6 ? ' hi' : v >= 4 ? ' md' : ''}" data-rci="${v}">${v}</button>`).join('')}</div>` : ''}` : ''}`;
  } else {
    const s = r.seg || [];
    body = `<div class="rc-opts">${RCP_SEG.map(([k, l]) => `<button type="button" class="rc-opt chk${s.includes(k) ? ' on' : ''}" data-rcs="${k}" aria-pressed="${s.includes(k)}"><span class="rc-box"></span>${esc(l)}</button>`).join('')}
      <button type="button" class="rc-opt chk${r.segNada ? ' on' : ''}" data-rcs="nada" aria-pressed="${!!r.segNada}"><span class="rc-box"></span>Nada de esto</button></div>`;
  }
  const ok = Q.type === 'dolor' ? !!(r.dolor && (r.dolor.no || (r.dolor.z && r.dolor.i && (!ZONA_LADO.includes(r.dolor.z) || r.dolor.l)))) : Q.type === 'seg' ? !!(r.segNada || (r.seg || []).length) : r[Q.k] != null;
  const last = RC.i === n - 1;
  return `<div class="rc-page rc-big">
    <div class="rc-bar"><button type="button" class="rc-ic" data-rc="${RC.i ? 'prev' : 'pick'}" aria-label="Atrás">${RCP_BACK}</button><div class="rc-dots" aria-label="Pregunta ${RC.i + 1} de ${n}">${RCP_Q.map((_, k) => `<i class="${k < RC.i ? 'd' : k === RC.i ? 'c' : ''}"></i>`).join('')}</div><button type="button" class="rc-ic" data-rc="close" aria-label="Cerrar">${RCP_X}</button></div>
    ${RC.i === 0 ? `<p class="rc-hola">Hola, ${esc(nom)}</p>` : ''}
    <h2 class="rc-title">${esc(Q.t)}</h2>
    ${body}
    ${(Q.type || last) ? `<div class="rc-go"><button type="button" class="rc-btn" data-rc="${last ? 'fin' : 'next'}" ${ok ? '' : 'disabled'}>${last ? 'Terminar' : 'Siguiente'}</button></div>` : ''}
  </div>`;
}
function rcpThanks(){
  return `<div class="rc-page rc-big rc-center">
    <div class="rc-check"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
    <h2 class="rc-title">¡Gracias, ${esc((RC.p.nombre || '').split(' ')[0])}!</h2>
    <p class="rc-sub">Entrégale el celular a tu fisioterapeuta.</p>
    ${RC.saveErr ? '<p class="rc-err">No se pudo guardar (sin conexión). El resultado igual se muestra.</p>' : ''}
    <div class="rc-go"><button type="button" class="rc-btn" data-rc="res">Ver resultado · fisioterapeuta</button></div></div>`;
}
function rcpRes(){
  const x = RC.res, r = x.resp || RC.r, p = RC.p, prev = rcpOf(p.id).filter(y => y.id !== x.id);
  const ev = rcpEval(r, prev), L = RCP_L[x.nivel || ev.lvl], adv = rcpAdvice(r, ev, p);
  const lab = (k, v) => { const Q = RCP_Q.find(q => q.k === k); return v ? Q.o[v - 1] : '—'; };
  return `<div class="rc-page">
    <div class="rc-bar"><button type="button" class="rc-ic" data-rc="pick" aria-label="Volver a la lista">${RCP_BACK}</button><h1>${esc(p.nombre || '')}</h1><button type="button" class="rc-ic" data-rc="close" aria-label="Cerrar">${RCP_X}</button></div>
    <div class="rc-light ${x.nivel || ev.lvl}"><span class="rc-dot ${x.nivel || ev.lvl}"></span><div><b>${esc(L.t)}</b><p>${esc(L.p)}</p>${ev.why.length ? `<p class="rc-why">Por: ${esc(ev.why.join(', '))}.</p>` : ''}</div></div>
    ${adv.length ? `<section class="rc-sec"><h2>Antes de empezar</h2><div class="rc-card">${adv.map(a => `<p>${esc(a)}</p>`).join('')}</div></section>` : ''}
    <section class="rc-sec"><h2>Respuestas</h2><div class="rc-card rc-kv">
      <div><span>Sueño</span><b>${esc(lab('sueno', r.sueno))}</b></div><div><span>Energía</span><b>${esc(lab('energia', r.energia))}</b></div>
      <div><span>Cuerpo adolorido</span><b>${esc(lab('cuerpo', r.cuerpo))}</b></div><div><span>Ánimo</span><b>${esc(lab('animo', r.animo))}</b></div>
      <div><span>Dolor</span><b>${r.dolor?.z ? esc(`${ZONAS[r.dolor.z] || r.dolor.z}${r.dolor.l ? ' ' + (r.dolor.l === 'izq' ? 'izq.' : 'der.') : ''} · ${r.dolor.i}/10`) : 'No'}</b></div>
      <div><span>Bienestar</span><b>${ev.sum != null ? `${ev.sum}/20${ev.base != null ? ` · su promedio ${ev.base.toFixed(1)}` : ''}` : '—'}</b></div>
      <div><span>Síntomas</span><b>${(r.seg || []).length ? esc(r.seg.map(k => (RCP_SEG.find(s => s[0] === k) || [k, k])[1]).join(', ')) : 'Ninguno'}</b></div>
    </div></section>
    ${prev.length ? `<section class="rc-sec"><h2>Anteriores</h2><div class="rc-hist">${prev.slice(0, 8).map(y => `<span title="${esc(RCP_L[y.nivel].t)}"><i class="rc-dot ${y.nivel}"></i>${esc(fmtD ? fmtD(y.fecha) : y.fecha)}</span>`).join('')}</div></section>` : ''}
    <div class="rc-ref">Basado en bienestar autorreportado contra su propio promedio, tamizaje de síntomas antes del ejercicio y recomendaciones para adultos mayores. ${typeof refList === 'function' ? refList(['saw16','hooper95','e_riebe15','fragala19','e_izq21']) : ''}</div>
    <div class="rc-go"><button type="button" class="rc-btn" data-rc="pick">Siguiente persona</button></div>
  </div>`;
}
function rcpRender(){
  const el = rcpEl(); if(!RC) return;
  el.innerHTML = RC.screen === 'pick' ? rcpPick() : RC.screen === 'q' ? rcpQ() : RC.screen === 'gracias' ? rcpThanks() : rcpRes();
  el.scrollTop = 0; el.querySelector('.rc-page')?.scrollTo?.(0, 0);
}

/* ---------- Acciones ---------- */
async function rcpFinish(){
  const prev = rcpOf(RC.p.id), ev = rcpEval(RC.r, prev);
  const resp = clone(RC.r); delete resp.segNada; if(resp.dolor){ delete resp.dolor.si; if(resp.dolor.no) resp.dolor = null; }
  const row = {paciente_id: RC.p.id, fecha: todayISO(), resp, nivel: ev.lvl, puntaje: ev.sum};
  RC.saveErr = false;
  try{
    const {data, error} = await sb.from('prechequeo').insert(row).select('*').single();
    if(error) throw error;
    rcpList.unshift(data); RC.res = data; if(typeof pfPreFor !== 'undefined') pfPreFor = null;
  }catch(e){ RC.saveErr = true; RC.res = Object.assign({id: 'local', created_at: new Date().toISOString()}, row); }
  RC.screen = 'gracias'; rcpRender();
}
async function rcpCreate(){
  const nom = ($('#rcp [data-rcnn]')?.value || '').trim(), pob = $('#rcp [data-rcnp]')?.value || 'may';
  if(!nom){ toast('Escribe el nombre.'); return; }
  const estado = Object.assign(blank(), {nombre: nom, modulo: 'salud', poblacion: pob, nivel: 'ini', fase: 'auto'}); delete estado.email; delete estado.consent;
  const {data, error} = await sb.from('pacientes').insert({nombre: nom, email: null, estado, consent: false}).select('id,updated_at').single();
  if(error){ toast('No se pudo crear. Revisa la conexión.'); return; }
  const p = {id: data.id, nombre: nom, email: '', st: Object.assign({}, estado, {email: '', consent: false}), updated: data.updated_at, sum: {adh: '0/' + nDias(estado)}};
  patients.push(p); if(typeof renderSel === 'function') renderSel();
  RC.nuevo = false; RC.p = p; RC.i = 0; RC.r = {}; RC.screen = 'q'; rcpRender();
}
function rcpClick(e){
  const b = e.target.closest('button'); if(!b || !RC) return;
  const Q = RCP_Q[RC.i], r = RC.r, d = b.dataset;
  if(d.rc){
    const a = d.rc;
    if(a === 'close') return rcpClose();
    if(a === 'pick'){ RC.screen = 'pick'; RC.p = null; return rcpRender(); }
    if(a === 'nuevo'){ RC.nuevo = true; rcpRender(); $('#rcp [data-rcnn]')?.focus(); return; }
    if(a === 'crear') return rcpCreate();
    if(a === 'prev'){ RC.i = Math.max(0, RC.i - 1); return rcpRender(); }
    if(a === 'next'){ RC.i++; return rcpRender(); }
    if(a === 'fin'){ b.disabled = true; return rcpFinish(); }
    if(a === 'res'){ RC.screen = 'res'; return rcpRender(); }
  }
  if(d.rcp){ RC.p = patients.find(p => p.id === d.rcp); RC.i = 0; RC.r = {}; RC.screen = 'q'; return rcpRender(); }
  if(d.rcres){ const x = rcpList.find(y => y.id === d.rcres); if(!x) return; RC.p = patients.find(p => p.id === x.paciente_id); RC.r = x.resp || {}; RC.res = x; RC.screen = 'res'; return rcpRender(); }
  if(d.rcv){ r[Q.k] = +d.rcv; rcpRender(); setTimeout(() => { if(RC && RC.screen === 'q' && RCP_Q[RC.i] === Q){ RC.i++; rcpRender(); } }, 260); return; }
  if(d.rcd){ r.dolor = d.rcd === 'no' ? {no: true} : Object.assign({}, r.dolor && !r.dolor.no ? r.dolor : {}, {si: true}); return rcpRender(); }
  if(d.rcz){ r.dolor = Object.assign({}, r.dolor, {z: d.rcz}); if(!ZONA_LADO.includes(d.rcz)) delete r.dolor.l; return rcpRender(); }
  if(d.rcl){ r.dolor.l = d.rcl; return rcpRender(); }
  if(d.rci){ r.dolor.i = +d.rci; return rcpRender(); }
  if(d.rcs){
    if(d.rcs === 'nada'){ r.segNada = !r.segNada; if(r.segNada) r.seg = []; }
    else { const s = new Set(r.seg || []); s.has(d.rcs) ? s.delete(d.rcs) : s.add(d.rcs); r.seg = [...s]; if(s.size) r.segNada = false; }
    return rcpRender();
  }
}
function rcpInput(e){
  if(e.target.matches('[data-rcq]')){ RC.q = e.target.value; const pos = e.target.selectionStart; rcpRender(); const i = $('#rcp [data-rcq]'); if(i){ i.focus(); try{ i.setSelectionRange(pos, pos); }catch(_){} } }
}
function rcpBack(){
  if(!RC) return false;
  if(RC.screen === 'q'){ if(RC.i) RC.i--; else { RC.screen = 'pick'; RC.p = null; } rcpRender(); return true; }
  if(RC.screen === 'res' || RC.screen === 'gracias'){ RC.screen = 'pick'; RC.p = null; rcpRender(); return true; }
  rcpClose(); return true;
}

/* Botón en la barra del fisio */
(function(){
  const bar = document.querySelector('#fisioApp .pbar'); if(!bar || $('#bRcp')) return;
  const b = document.createElement('button'); b.id = 'bRcp'; b.type = 'button'; b.className = 'tbbtn';
  b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/><path d="M3.5 12h4l2-3 3 6 2-3h6"/></svg>Bienestar en vivo';
  b.onclick = rcpOpen;
  const ref = $('#bTabata') || $('#bAlert'); ref ? ref.before(b) : bar.prepend(b);
})();
