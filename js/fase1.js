/* ===================== FASE 1: HISTORIA, BANCO, PLANTILLAS, CONSENTIMIENTO ===================== */
let historia = {}, histDirty = false, plantillas = [], tplOpen = false, consentBy = {};
let bancoQ = {q:'', b:'', reg:'', solo:'', pag:0};

/* ---------- Historia clínica / evaluación inicial ---------- */
const HIST_CAMPOS = [
  ['Motivo y lesión', [
    ['motivo','Motivo de consulta','area'],
    ['mecanismo','Mecanismo de lesión','area'],
    ['fecha_lesion','Fecha de la lesión','date'],
    ['diagnostico','Diagnóstico médico / imagen','area'],
  ]],
  ['Cirugía', [
    ['cirugia_fecha','Fecha de cirugía','date'],
    ['cirugia_tipo','Procedimiento','text'],
    ['cirujano','Cirujano / institución','text'],
    ['restricciones','Restricciones indicadas por el cirujano','area'],
  ]],
  ['Antecedentes', [
    ['lesiones_previas','Lesiones o cirugías previas','area'],
    ['antecedentes','Antecedentes médicos relevantes','area'],
    ['medicamentos','Medicamentos actuales','text'],
    ['riesgo_trombo','Factores de riesgo trombótico (para BFR)','area'],
  ]],
  ['Deporte y objetivos', [
    ['deporte_nivel','Deporte, nivel y posición','text'],
    ['horas_semana','Horas de entrenamiento por semana antes de la lesión','text'],
    ['competencia','Próxima competencia o fecha objetivo','text'],
    ['objetivos','Objetivos del deportista','area'],
  ]],
  ['Examen inicial', [
    ['dolor_reposo','Dolor en reposo (0–10)','text'],
    ['examen','Hallazgos del examen físico','area'],
    ['banderas','Banderas rojas o amarillas','area'],
    ['plan_inicial','Plan inicial e impresión clínica','area'],
  ]],
];
async function loadHistoria(){
  historia = {}; histDirty=false;
  if(!curId) return;
  const {data} = await sb.from('historias').select('datos,updated_at').eq('paciente_id',curId).maybeSingle();
  historia = data?.datos || {};
  if(view==='hist' || view==='datos') render();
}
async function saveHistoria(){
  if(!curId){ toast('Guarda la ficha antes de llenar la historia.'); return; }
  const {error} = await sb.from('historias').upsert({paciente_id:curId, datos:historia, updated_at:new Date().toISOString()});
  if(error){ toast('No se pudo guardar la historia.'); return; }
  histDirty=false; toast('Historia clínica guardada'); render();
}
function histView(){
  if(!curId) return `<section class="card"><p class="small" style="margin:0">Guarda la ficha para abrir su historia clínica.</p></section>`;
  return `<section class="card"><div class="rowhead"><h3 class="sec" style="margin:0">Historia clínica</h3><button class="primary" id="hSave">${histDirty?'Guardar cambios':'Guardar'}</button></div>
  <p class="small">Solo tú la ves. El deportista no tiene acceso a esta información.</p>
  ${HIST_CAMPOS.map(([t,campos])=>`<fieldset class="hist"><legend>${esc(t)}</legend><div class="hgrid">${campos.map(([k,l,tp])=>`<label class="f${tp==='area'?' wide':''}">${esc(l)}${tp==='area'?`<textarea data-h="${k}" rows="2">${esc(historia[k]||'')}</textarea>`:`<input type="${tp}" data-h="${k}" value="${esc(historia[k]||'')}">`}</label>`).join('')}</div></fieldset>`).join('')}
  </section>`;
}

/* ---------- Banco de ejercicios ---------- */
const REGIONES = {rod:'Rodilla',cad:'Cadera',tob:'Tobillo y pie',tro:'Tronco',sup:'Miembro superior',gen:'General'};
const REG_INV = Object.fromEntries(Object.entries(REGIONES).map(([k,v])=>[v,k]));
function bancoView(){
  const q=_N(bancoQ.q);
  let list = BANCO_BASE.map(r=>r[0]).concat(myLib).filter((v,i,a)=>a.indexOf(v)===i).map(n=>{
    const e = BANCO.find(x=>x.n===n) || {n, oculto:true, b:'central', reg:'gen', fx:0, im:0, tn:0, kn:0, uni:0, rev:0};
    const m = myMeta[n]||{}; return Object.assign({}, e, {oculto:!!m.oculto, video:m.video||''});
  });
  list=list.filter(e=> bancoQ.solo==='eli' ? !!(myMeta[e.n]&&myMeta[e.n].eliminado) : !(myMeta[e.n]&&myMeta[e.n].eliminado));
  if(q) list=list.filter(e=>_N(e.n).includes(q));
  if(bancoQ.b) list=list.filter(e=>e.b===bancoQ.b);
  if(bancoQ.reg) list=list.filter(e=>e.reg===bancoQ.reg);
  if(bancoQ.solo==='rev') list=list.filter(e=>e.rev);
  if(bancoQ.solo==='prop') list=list.filter(e=>e.propio || myLib.includes(e.n));
  if(bancoQ.solo==='ocu') list=list.filter(e=>e.oculto);
  if(bancoQ.solo==='vid') list=list.filter(e=>!e.video);
  const total=list.length, per=40, pag=Math.min(bancoQ.pag, Math.max(0,Math.ceil(total/per)-1));
  const pageItems=list.slice(pag*per, pag*per+per);
  const sel=(v,opts,k)=>`<select data-bk="${k}">${opts.map(([a,b])=>`<option value="${a}"${String(v)===String(a)?' selected':''}>${b}</option>`).join('')}</select>`;
  return `<section class="card"><h3 class="sec">Banco de ejercicios · ${BANCO.length} activos</h3>
  <p class="small">Tus ejercicios con las etiquetas que usa el generador. Corrige lo que no esté bien; los cambios se guardan solos y aplican a todos tus planes.</p>
  <div class="bfilters">
    <input type="search" id="bq" placeholder="Buscar ejercicio" value="${esc(bancoQ.q)}" aria-label="Buscar ejercicio">
    <select id="bb" aria-label="Bloque"><option value="">Todos los bloques</option>${SEG_ORDER.map(k=>`<option value="${k}"${bancoQ.b===k?' selected':''}>${SEGS[k]}</option>`).join('')}</select>
    <select id="br" aria-label="Región"><option value="">Todas las regiones</option>${Object.entries(REGIONES).map(([k,v])=>`<option value="${k}"${bancoQ.reg===k?' selected':''}>${v}</option>`).join('')}</select>
    <select id="bs" aria-label="Mostrar"><option value="">Todos</option><option value="rev"${bancoQ.solo==='rev'?' selected':''}>Por revisar</option><option value="prop"${bancoQ.solo==='prop'?' selected':''}>Agregados por mí</option><option value="vid"${bancoQ.solo==='vid'?' selected':''}>Sin video</option><option value="ocu"${bancoQ.solo==='ocu'?' selected':''}>Ocultos</option><option value="eli"${bancoQ.solo==='eli'?' selected':''}>Eliminados</option></select>
  </div>
  <p class="small">${total} resultados · página ${total?pag+1:0} de ${Math.ceil(total/per)}</p>
  <div class="tbl"><table class="data banco"><thead><tr><th>Ejercicio</th><th>Bloque</th><th>Región</th><th title="Flexión máxima de rodilla con carga">Flex. °</th><th>Impacto</th><th title="Estrés de tendón o rótula">Tendón</th><th title="Apoyo de rodillas">Rodillas</th><th>Unilat.</th><th>Video</th><th>Oculto</th><th><span class="sr">Eliminar</span></th></tr></thead><tbody>
  ${pageItems.map(e=>`<tr data-bn="${esc(e.n)}" class="${e.rev?'rev':''}${e.oculto?' ocu':''}"><td class="bn">${esc(e.n)}${e.rev?' <span class="pill y">revisar</span>':''}${e.reps?`<div class="small">${esc(e.reps)}</div>`:''}</td>
    <td>${sel(e.b,SEG_ORDER.map(k=>[k,SEGS[k]]),'bloque')}</td>
    <td>${sel(e.reg,Object.entries(REGIONES),'region')}</td>
    <td><input type="number" min="0" max="150" step="10" value="${e.fx}" data-bk="fx" style="width:4.5em"></td>
    <td>${sel(e.im,[[0,'No'],[1,'Sí']],'im')}</td>
    <td>${sel(e.tn,[[0,'Bajo'],[1,'Medio'],[2,'Alto']],'tn')}</td>
    <td>${sel(e.kn,[[0,'No'],[1,'Sí']],'kneel')}</td>
    <td>${sel(e.uni,[[0,'No'],[1,'Sí']],'uni')}</td>
    <td><input value="${esc(e.video)}" placeholder="https://…" data-bk="video" style="width:11em"></td>
    <td><input type="checkbox" data-bk="oculto"${e.oculto?' checked':''} aria-label="Ocultar"></td>
    <td>${bancoQ.solo==='eli'?`<button class="mini-btn" data-brest="${esc(e.n)}">Restaurar</button>`:`<button class="xbtn" data-bdel="${esc(e.n)}" aria-label="Eliminar ${esc(e.n)}" title="Eliminar">×</button>`}</td></tr>`).join('')}
  </tbody></table></div>
  <div class="actions"><button id="bPrev"${pag===0?' disabled':''}>Anterior</button><button id="bNext"${(pag+1)*per>=total?' disabled':''}>Siguiente</button></div>
  </section>`;
}
function bancoEdit(el){
  const tr=el.closest('[data-bn]'); if(!tr) return;
  const n=tr.dataset.bn, k=el.dataset.bk, m=Object.assign({}, myMeta[n]);
  if(k==='bloque') m.bloque={act:'Activación',neuro:'Neuro',central:'Central'}[el.value];
  else if(k==='region') m.region=el.value;
  else if(k==='video'){ const v=el.value.trim(); if(v && !/^https?:\/\//i.test(v)){ toast('El enlace debe empezar por http:// o https://'); return; } m.video=v; }
  else if(k==='oculto') m.oculto=el.checked;
  else m[k]=num(el.value);
  m.revisado=true; myMeta[n]=m; buildBanco(); saveLib(n); $('#saveState').textContent='Banco guardado';
}

/* ---------- Plantillas ---------- */
async function loadPlantillas(){
  const {data} = await sb.from('plantillas').select('id,nombre,condicion,fase,dias,contenido,created_at').order('created_at',{ascending:false});
  plantillas = data||[];
}
function tplCard(){
  const key=pkey(st), P0=P[key], ph=P0.phases[phaseIdx(st)];
  return `<section class="card tplcard"><div class="rowhead"><h3 class="sec" style="margin:0">Plantillas</h3><button id="tplClose">Cerrar</button></div>
    <div class="tplsave"><input id="tplName" placeholder="Nombre, p. ej. LCA HTH fase 3 · 3 días" value="${esc(`${subLabel(st,P0)} · ${ph.name.split(' · ')[0]} · ${nDias(st)} días`)}"><button class="primary" id="tplSave">Guardar semana actual como plantilla</button></div>
    ${plantillas.length?`<div class="tbl"><table class="data"><thead><tr><th>Plantilla</th><th>Condición</th><th>Fase</th><th>Días</th><th></th></tr></thead><tbody>
    ${plantillas.map(t=>`<tr><td><b>${esc(t.nombre)}</b></td><td>${esc(t.condicion||'')}</td><td>${esc((t.fase||'').split(' · ')[0])}</td><td>${esc(t.dias||'')}</td><td><button class="mini-btn" data-tpl-apply="${esc(t.id)}">Aplicar</button><button class="xbtn" data-tpl-del="${esc(t.id)}" aria-label="Eliminar plantilla">×</button></td></tr>`).join('')}
    </tbody></table></div>`:'<p class="small">Aún no tienes plantillas. Ajusta una semana a tu gusto y guárdala aquí para reutilizarla con otros usuarios y usuarias.</p>'}
    <p class="small">Al aplicar, la plantilla reemplaza la semana base de la fase y los días actuales de esta persona. La progresión del mesociclo se aplica encima.</p>
  </section>`;
}
async function saveTpl(){
  const nombre=($('#tplName').value||'').trim().slice(0,120); if(!nombre){ toast('Ponle un nombre a la plantilla.'); return; }
  const key=pkey(st), P0=P[key], ph=P0.phases[phaseIdx(st)];
  const {data,error}=await sb.from('plantillas').insert({nombre, condicion:subLabel(st,P0), fase:ph.name, dias:nDias(st), contenido:{days:clone(baseWeek(st).days)}}).select('*').single();
  if(error){ toast('No se pudo guardar la plantilla.'); return; }
  plantillas.unshift(data); render(); toast('Plantilla guardada');
}
function applyTpl(id){
  const t=plantillas.find(x=>x.id===id); if(!t) return;
  const days=clone(t.contenido?.days||[]); if(!validWeek(days)){ toast('Esa plantilla tiene un formato antiguo y no se puede aplicar.'); return; }
  if(!st.plans) st.plans={};
  st.dias = String(Math.max(1, Math.min(6, days.length))); fillForm();
  st.plans[planKey(st)] = days; tplOpen=false; render(); markDirty(); toast('Plantilla aplicada');
}
async function delTpl(id){
  const {error}=await sb.from('plantillas').delete().eq('id',id);
  if(error){ toast('No se pudo eliminar.'); return; }
  plantillas=plantillas.filter(x=>x.id!==id); render();
}

/* ---------- Consentimiento informado ---------- */
const CONSENT_VERSION = 'v2 · octubre 2026';
/* v2: consentimiento informado de tratamiento completo (Ley 528 de 1999, arts. 12, 25, 26 y 27; Ley 1751 de 2015;
   Resolución 309 de 2025 para menores) + autorización de datos (Ley 1581 de 2012). Aceptación electrónica válida por
   la Ley 527 de 1999 (arts. 5 a 7). Cada bloque: [título, párrafo] o [título, [viñetas]]. */
const CONSENT_TEXT = [
  ['1. Qué voy a recibir', 'Atención de fisioterapia: valoración, ejercicio terapéutico y de fuerza dosificado, entrenamiento funcional, educación sobre mi condición y, según el caso, terapia manual, vendaje y agentes físicos (frío, calor, electroterapia). Puede ser presencial o con seguimiento a distancia en la app Ápex (plan, chequeo diario, registro de sesiones y mensajes). Si en algún momento se propone una técnica invasiva, como la punción seca, me pedirán un consentimiento aparte.'],
  ['2. Para qué', 'Disminuir el dolor, recuperar la función y la capacidad de carga, prevenir nuevas lesiones y, si aplica, volver a mi deporte o actividad.'],
  ['3. Riesgos previsibles', [
    'Frecuentes y pasajeros: dolor muscular de 24 a 72 horas después de entrenar, aumento temporal del dolor, cansancio y molestias en articulaciones.',
    'Poco frecuentes: mareo, náuseas o baja de presión durante el esfuerzo, calambres, irritación de la piel por vendajes o electrodos, enrojecimiento o quemadura leve por frío o calor, y moretones por terapia manual.',
    'Raros: distensión muscular, esguince, caída o reagudización de la lesión.',
    'Muy raros: eventos graves del corazón durante el ejercicio intenso, más probables si hay una enfermedad cardiaca no diagnosticada.']],
  ['4. Cómo se reducen', 'Con una valoración antes de empezar, una carga que sube de forma progresiva, una regla de dolor clara, el chequeo diario que ajusta el plan del día y la revisión de mi evolución por parte del fisioterapeuta.'],
  ['5. Alternativas', 'Existen otras opciones, como el manejo con medicamentos, la cirugía, otros profesionales o no hacer tratamiento. No tratar la lesión puede hacer que el dolor o la limitación duren más. Puedo preguntar por cualquiera de ellas.'],
  ['6. Mis compromisos', [
    'Dar información completa y verdadera sobre mi salud: enfermedades, cirugías, medicamentos, embarazo y síntomas.',
    'Seguir las indicaciones y la dosis del plan, sin aumentarla por mi cuenta, y registrar con honestidad mis sesiones y mi dolor.',
    'Cuando haga los ejercicios sin supervisión, hacerlos como me fueron enseñados.',
    'Suspender el ejercicio y avisar de inmediato si tengo dolor en el pecho, falta de aire desproporcionada, mareo intenso o desmayo, palpitaciones, fiebre, hinchazón con calor o enrojecimiento, adormecimiento o pérdida de fuerza, o un dolor que no cede. En una urgencia debo ir a urgencias o llamar al 123: la app no es un servicio de urgencias.']],
  ['7. Sin garantía de resultados', 'La fisioterapia es una obligación de medio y no de resultado (Ley 528 de 1999, art. 12): el fisioterapeuta pone todo su conocimiento y cuidado, pero no puede garantizar un resultado.'],
  ['8. Responsabilidad', 'Según el artículo 26 de la Ley 528 de 1999, el fisioterapeuta no responde por reacciones adversas de imposible o difícil previsión, ni por los efectos de los riesgos previstos que acepto en este documento, cuando no se deban a culpa suya. Este consentimiento no limita los derechos que me da la ley.'],
  ['9. Mis derechos', 'Puedo hacer preguntas y recibir respuestas claras, pedir una segunda opinión, rechazar una técnica o suspender el tratamiento en cualquier momento sin que eso afecte la atención que reciba, y revocar este consentimiento avisando por escrito.'],
  ['10. Menores de edad', 'Si soy menor de 18 años, mi padre, madre o representante legal también acepta este documento. Si tengo menos de 14 años, además se me explica en palabras que entienda y se tiene en cuenta mi acuerdo (asentimiento), según la Resolución 309 de 2025.'],
  ['11. Cómo acepto', 'Puedo aceptar en la app (marcando las casillas y escribiendo mi nombre y documento), en persona o respondiendo por WhatsApp desde mi número con la frase de aceptación. Queda registrada la fecha y la hora. Esta aceptación tiene la misma validez que una firma escrita (Ley 527 de 1999, arts. 5 a 7). Rige durante todo el proceso; si el tratamiento cambia de forma importante, me lo informarán de nuevo.'],
  ['12. Datos personales y de salud', 'Autorizo al fisioterapeuta Manuel Celis, como responsable, a recolectar, guardar y usar mis datos personales y de salud (evaluación, plan, sesiones, dolor, chequeos y mensajes) solo para planear, hacer seguimiento y ajustar mi atención. Son datos sensibles según la Ley 1581 de 2012 y no estoy obligado a autorizarlos. Puedo conocerlos, actualizarlos, corregirlos, pedir que se borren y revocar esta autorización escribiendo a celisone1@gmail.com. Se guardan en un servicio en la nube con acceso restringido y no se comparten con terceros sin mi autorización, salvo obligación legal.']
];
const consentBlockHTML = () => CONSENT_TEXT.map(([t, p]) => `<h4>${esc(t)}</h4>${Array.isArray(p) ? `<ul>${p.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(p)}</p>`}`).join('');
async function loadConsents(){
  const {data} = await sb.from('consentimientos').select('paciente_id,firmado_at,nombre_firma,documento,version,medio,menor,representante').order('firmado_at',{ascending:false});
  consentBy={}; consentOld={};
  (data||[]).forEach(c=>{ if(c.version===CONSENT_VERSION){ if(!consentBy[c.paciente_id]) consentBy[c.paciente_id]=c; } else if(!consentOld[c.paciente_id]) consentOld[c.paciente_id]=c; });
}
let consentOld = {};
function consentGate(){
  const old = A.consentOld;
  return `<section class="card consent"><div class="trainer">Antes de ver tu plan</div><h2 class="cg">Consentimiento informado</h2>
  <p class="small">${old ? 'Actualizamos el consentimiento con más información sobre tu tratamiento. Léelo y vuelve a aceptarlo.' : 'Léelo con calma. Si tienes dudas, pregúntale a tu fisioterapeuta antes de aceptar.'}</p>
  <div class="cg-txt">${consentBlockHTML()}</div>
  <label class="chk"><input type="checkbox" id="cgT"> Leí y entendí la información, pude hacer preguntas y acepto el tratamiento de fisioterapia con sus riesgos.</label>
  <label class="chk"><input type="checkbox" id="cgD"> Autorizo el tratamiento de mis datos personales y de salud.</label>
  <label class="chk"><input type="checkbox" id="cgM"> Soy menor de 18 años.</label>
  <div id="cgMen" hidden>
    <div class="row2"><label class="f">Nombre del padre, madre o representante<input id="cgRN" autocomplete="off"></label><label class="f">Documento del representante<input id="cgRD" autocomplete="off"></label></div>
    <label class="f">Parentesco<input id="cgRP" placeholder="Madre, padre, tutor…" autocomplete="off"></label>
    <label class="chk"><input type="checkbox" id="cgRA"> Como representante, acepto este consentimiento y la persona menor está de acuerdo.</label>
  </div>
  <div class="row2"><label class="f">Nombre completo (firma)<input id="cgN" autocomplete="name"></label><label class="f">Documento de identidad<input id="cgDoc" autocomplete="off"></label></div>
  <div class="actions"><button class="primary" id="cgSign">Aceptar y continuar</button></div>
  </section>`;
}
document.addEventListener('change', e => { if(e.target.id === 'cgM'){ const m = $('#cgMen'); if(m) m.hidden = !e.target.checked; } });
async function signConsent(){
  const n=($('#cgN').value||'').trim(), doc=($('#cgDoc').value||'').trim(), d=$('#cgD').checked, t=$('#cgT').checked, menor=$('#cgM').checked;
  if(!d||!t){ toast('Debes marcar las dos casillas de aceptación para continuar.'); return; }
  if(n.length<3){ toast('Escribe tu nombre completo como firma.'); return; }
  if(doc.length<4){ toast('Escribe tu número de documento.'); return; }
  let rep=null;
  if(menor){
    rep={nombre:($('#cgRN').value||'').trim().slice(0,120), documento:($('#cgRD').value||'').trim().slice(0,30), parentesco:($('#cgRP').value||'').trim().slice(0,40)};
    if(rep.nombre.length<3||rep.documento.length<4||!$('#cgRA').checked){ toast('Falta el nombre, el documento y la aceptación del representante.'); return; }
  }
  const {error}=await sb.from('consentimientos').insert({paciente_id:A.p.id, version:CONSENT_VERSION, nombre_firma:n.slice(0,120), documento:doc.slice(0,30), acepta_datos:true, acepta_tratamiento:true, menor, representante:rep, medio:'app', user_agent:navigator.userAgent.slice(0,400)});
  if(error){ toast('No se pudo registrar la aceptación. Inténtalo de nuevo.'); return; }
  A.consent=true; A.consentOld=false; renderAthlete(); toast('Consentimiento aceptado. ¡Gracias!');
}

/* ---------- Eventos ---------- */
$('#out').addEventListener('input', e=>{
  const t=e.target;
  if(t.dataset.h){ historia[t.dataset.h]=t.value; if(!histDirty){ histDirty=true; const b=$('#hSave'); if(b) b.textContent='Guardar cambios'; } }
  if(t.id==='bq'){ bancoQ.q=t.value; bancoQ.pag=0; clearTimeout(t._t); t._t=setTimeout(()=>{ render(); const x=$('#bq'); if(x){ x.focus(); x.setSelectionRange(x.value.length,x.value.length); } },250); }
});
$('#out').addEventListener('change', e=>{
  const t=e.target;
  if(t.dataset.bk) bancoEdit(t);
  if(t.id==='bb'){ bancoQ.b=t.value; bancoQ.pag=0; render(); }
  if(t.id==='br'){ bancoQ.reg=t.value; bancoQ.pag=0; render(); }
  if(t.id==='bs'){ bancoQ.solo=t.value; bancoQ.pag=0; render(); }
});
$('#out').addEventListener('click', e=>{
  const q=s=>e.target.closest(s); let b;
  if(q('#hSave')) return saveHistoria();
  if(q('#bPrev')){ bancoQ.pag=Math.max(0,bancoQ.pag-1); return render(); }
  if(q('#bNext')){ bancoQ.pag++; return render(); }
  if(q('#bTpl')){ tplOpen=!tplOpen; render(); if(tplOpen){ const c=document.querySelector('.tplcard'); if(c) c.scrollIntoView({behavior:'smooth', block:'start'}); } return; }
  if(q('#tplClose')){ tplOpen=false; return render(); }
  if(q('#tplSave')) return saveTpl();
  if((b=q('[data-tpl-apply]'))) return applyTpl(b.dataset.tplApply);
  if((b=q('[data-tpl-del]'))) return delTpl(b.dataset.tplDel);
  if(q('[data-view="hist"]')) loadHistoria();
});
$('#athleteApp').addEventListener('click', e=>{ if(e.target.closest('#cgSign')) signConsent(); });
