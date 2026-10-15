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
  if(view==='hist') render();
}
async function saveHistoria(){
  if(!curId){ toast('Guarda el paciente antes de llenar la historia.'); return; }
  const {error} = await sb.from('historias').upsert({paciente_id:curId, datos:historia, updated_at:new Date().toISOString()});
  if(error){ toast('No se pudo guardar la historia.'); return; }
  histDirty=false; toast('Historia clínica guardada'); render();
}
function histView(){
  if(!curId) return `<section class="card"><p class="small" style="margin:0">Guarda el paciente para abrir su historia clínica.</p></section>`;
  return `<section class="card"><div class="rowhead"><h3 class="sec" style="margin:0">Historia clínica y evaluación inicial</h3><button class="primary" id="hSave">${histDirty?'Guardar cambios':'Guardar'}</button></div>
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
    <select id="bs" aria-label="Mostrar"><option value="">Todos</option><option value="rev"${bancoQ.solo==='rev'?' selected':''}>Por revisar</option><option value="prop"${bancoQ.solo==='prop'?' selected':''}>Agregados por mí</option><option value="vid"${bancoQ.solo==='vid'?' selected':''}>Sin video</option><option value="ocu"${bancoQ.solo==='ocu'?' selected':''}>Ocultos</option></select>
  </div>
  <p class="small">${total} resultados · página ${total?pag+1:0} de ${Math.ceil(total/per)}</p>
  <div class="tbl"><table class="data banco"><thead><tr><th>Ejercicio</th><th>Bloque</th><th>Región</th><th title="Flexión máxima de rodilla con carga">Flex. °</th><th>Impacto</th><th title="Estrés de tendón o rótula">Tendón</th><th title="Apoyo de rodillas">Rodillas</th><th>Unilat.</th><th>Video</th><th>Oculto</th></tr></thead><tbody>
  ${pageItems.map(e=>`<tr data-bn="${esc(e.n)}" class="${e.rev?'rev':''}${e.oculto?' ocu':''}"><td class="bn">${esc(e.n)}${e.rev?' <span class="pill y">revisar</span>':''}${e.reps?`<div class="small">${esc(e.reps)}</div>`:''}</td>
    <td>${sel(e.b,SEG_ORDER.map(k=>[k,SEGS[k]]),'bloque')}</td>
    <td>${sel(e.reg,Object.entries(REGIONES),'region')}</td>
    <td><input type="number" min="0" max="150" step="10" value="${e.fx}" data-bk="fx" style="width:4.5em"></td>
    <td>${sel(e.im,[[0,'No'],[1,'Sí']],'im')}</td>
    <td>${sel(e.tn,[[0,'Bajo'],[1,'Medio'],[2,'Alto']],'tn')}</td>
    <td>${sel(e.kn,[[0,'No'],[1,'Sí']],'kneel')}</td>
    <td>${sel(e.uni,[[0,'No'],[1,'Sí']],'uni')}</td>
    <td><input value="${esc(e.video)}" placeholder="https://…" data-bk="video" style="width:11em"></td>
    <td><input type="checkbox" data-bk="oculto"${e.oculto?' checked':''} aria-label="Ocultar"></td></tr>`).join('')}
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
  myMeta[n]=m; buildBanco(); saveLib(n); $('#saveState').textContent='Banco guardado';
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
    </tbody></table></div>`:'<p class="small">Aún no tienes plantillas. Ajusta una semana a tu gusto y guárdala aquí para reutilizarla con otros pacientes.</p>'}
    <p class="small">Al aplicar, la plantilla reemplaza la semana base de la fase y los días actuales de este paciente. La progresión del mesociclo se aplica encima.</p>
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
  st.dias = String(days.length===4?4:3); fillForm();
  st.plans[planKey(st)] = days; tplOpen=false; render(); markDirty(); toast('Plantilla aplicada');
}
async function delTpl(id){
  const {error}=await sb.from('plantillas').delete().eq('id',id);
  if(error){ toast('No se pudo eliminar.'); return; }
  plantillas=plantillas.filter(x=>x.id!==id); render();
}

/* ---------- Consentimiento informado ---------- */
const CONSENT_VERSION = 'v1 · octubre 2026';
const CONSENT_TEXT = [
  ['Tratamiento de datos personales y de salud', 'Autorizo al fisioterapeuta Manuel Celis, como responsable, a recolectar, almacenar y usar mis datos personales y de salud (lesión, evaluación, plan de ejercicios, sesiones registradas, dolor y cuestionarios) con la única finalidad de planear, hacer seguimiento y ajustar mi rehabilitación. Entiendo que son datos sensibles según la Ley 1581 de 2012 y que no estoy obligado a autorizar su tratamiento. Puedo conocer, actualizar, rectificar y pedir la supresión de mis datos, y revocar esta autorización, escribiendo a celisone1@gmail.com. Mis datos se guardan en un servicio en la nube con acceso restringido y no se compartirán con terceros sin mi autorización, salvo obligación legal.'],
  ['Consentimiento para el programa de ejercicio', 'Entiendo que el programa incluye ejercicio terapéutico y de fuerza dosificado por esfuerzo percibido, y que puede producir dolor muscular, molestias o, con baja probabilidad, una lesión. Me comprometo a seguir la regla de dolor, registrar mis sesiones con honestidad y avisar de inmediato si aparece dolor alto, inflamación, bloqueo, inestabilidad o cualquier síntoma nuevo. Puedo suspender el programa en cualquier momento. Esta herramienta no reemplaza la valoración presencial ni las indicaciones de mi médico o cirujano.'],
];
async function loadConsents(){
  const {data} = await sb.from('consentimientos').select('paciente_id,firmado_at,nombre_firma,version').order('firmado_at',{ascending:false});
  consentBy={}; (data||[]).forEach(c=>{ if(!consentBy[c.paciente_id]) consentBy[c.paciente_id]=c; });
}
function consentGate(){
  return `<section class="card consent"><div class="trainer">Antes de ver tu plan</div><h2 class="cg">Consentimiento informado</h2>
  ${CONSENT_TEXT.map(([t,p])=>`<h4>${esc(t)}</h4><p>${esc(p)}</p>`).join('')}
  <p class="small">Versión ${esc(CONSENT_VERSION)}</p>
  <label class="chk"><input type="checkbox" id="cgD"> Autorizo el tratamiento de mis datos personales y de salud.</label>
  <label class="chk"><input type="checkbox" id="cgT"> Acepto participar en el programa de ejercicio en las condiciones descritas.</label>
  <div class="row2"><label class="f">Nombre completo (firma)<input id="cgN" autocomplete="name"></label><label class="f">Documento (opcional)<input id="cgDoc" autocomplete="off"></label></div>
  <div class="actions"><button class="primary" id="cgSign">Firmar y continuar</button></div>
  </section>`;
}
async function signConsent(){
  const n=($('#cgN').value||'').trim(), d=$('#cgD').checked, t=$('#cgT').checked;
  if(!d||!t){ toast('Debes aceptar ambos puntos para continuar.'); return; }
  if(n.length<3){ toast('Escribe tu nombre completo como firma.'); return; }
  const {error}=await sb.from('consentimientos').insert({paciente_id:A.p.id, version:CONSENT_VERSION, nombre_firma:n.slice(0,120), documento:($('#cgDoc').value||'').trim().slice(0,30)||null, acepta_datos:true, acepta_tratamiento:true, user_agent:navigator.userAgent.slice(0,400)});
  if(error){ toast('No se pudo registrar la firma. Inténtalo de nuevo.'); return; }
  A.consent=true; renderAthlete(); toast('Consentimiento firmado. ¡Gracias!');
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
  if(q('#bTpl')){ tplOpen=!tplOpen; return render(); }
  if(q('#tplClose')){ tplOpen=false; return render(); }
  if(q('#tplSave')) return saveTpl();
  if((b=q('[data-tpl-apply]'))) return applyTpl(b.dataset.tplApply);
  if((b=q('[data-tpl-del]'))) return delTpl(b.dataset.tplDel);
  if(q('[data-view="hist"]')) loadHistoria();
});
$('#athleteApp').addEventListener('click', e=>{ if(e.target.closest('#cgSign')) signConsent(); });
