/* ===================== REHAB · HOMBRO (oct 2026) =====================
   Dolor de hombro relacionado con el manguito rotador (tendinopatía, "pinzamiento" o dolor
   subacromial). Tres fases por criterios e irritabilidad. Se integra como región dentro de
   Rehab (módulo 'hombro'), igual que lumbar: plan semanal, sesiones, portal y exportación. */

/* ---------- Referencias (verificadas oct 2026) ---------- */
Object.assign(R, {
  h_desmeules25:{l:'A',c:'Desmeules F, Roy JS, Lafrance S, et al. Rotator cuff tendinopathy diagnosis, nonsurgical medical care, and rehabilitation: a clinical practice guideline. J Orthop Sports Phys Ther. 2025;55(4):235-274. doi:10.2519/jospt.2025.13182.',k:'Guía de práctica clínica: un programa de ejercicio activo (control motor y/o fuerza con distintas cargas) como tratamiento inicial (grado A). Educación y terapia manual como complemento; corticoide solo alivio a corto plazo. Arco doloroso para confirmar y Hawkins-Kennedy para descartar, nunca solos.'},
  h_pieters20:{l:'A',c:'Pieters L, Lewis J, Kuppens K, et al. An update of systematic reviews examining the effectiveness of conservative physical therapy interventions for subacromial shoulder pain. J Orthop Sports Phys Ther. 2020;50(3):131-141.',k:'Revisión de revisiones: el ejercicio es el tratamiento de primera elección; la terapia manual puede sumarse; ninguna forma de ejercicio es claramente superior.'},
  h_holmgren12:{l:'B',c:'Holmgren T, Björnsson Hallgren H, Öberg B, Adolfsson L, Johansson K. Effect of specific exercise strategy on need for surgery in patients with subacromial impingement syndrome: randomised controlled study. BMJ. 2012;344:e787.',k:'Excéntricos del manguito y fuerza de estabilizadores escapulares 12 semanas (casa 1–2 veces al día): mejor función y solo 20 % eligió cirugía frente a 63 % con ejercicios inespecíficos.'},
  h_littlewood16:{l:'B',c:'Littlewood C, Bateman M, Brown K, et al. A self-managed single exercise programme versus usual physiotherapy treatment for rotator cuff tendinopathy: a randomised controlled trial (the SELF study). Clin Rehabil. 2016;30(7):686-696.',k:'Un solo ejercicio en casa sobre el movimiento que más molesta, progresado por el fisio, rindió igual que la fisioterapia habitual a 3, 6 y 12 meses.'},
  h_ingwersen17:{l:'B',c:'Ingwersen KG, Jensen SL, Sørensen L, et al. Three months of progressive high-load versus traditional low-load strength training among patients with rotator cuff tendinopathy: primary results from the double-blind randomized controlled RoCTEx trial. Orthop J Sports Med. 2017;5(8):2325967117723292.',k:'Carga alta progresiva y carga baja mejoraron igual (DASH, dolor, fuerza) a 12 semanas: progresa según tolerancia, no hace falta empezar pesado.'},
  h_malliaras20:{l:'A',c:'Malliaras P, Johnston R, Street G, et al. The efficacy of higher versus lower dose exercise in rotator cuff tendinopathy: a systematic review of randomized controlled trials. Arch Phys Med Rehabil. 2020;101(10):1822-1834.',k:'Pocos estudios y certeza baja: no está claro que más dosis sea mejor. La dosis se ajusta a la persona.'},
  h_beard18:{l:'B',c:'Beard DJ, Rees JL, Cook JA, et al. Arthroscopic subacromial decompression for subacromial shoulder pain (CSAW): a multicentre, pragmatic, parallel group, placebo-controlled, three-group, randomised surgical trial. Lancet. 2018;391(10118):329-338.',k:'La descompresión subacromial no superó a la artroscopia diagnóstica (placebo) a 6 y 12 meses: el problema no es "un hueso que roza".'},
  h_lewis16:{l:'C',c:'Lewis J. Rotator cuff related shoulder pain: assessment, management and uncertainties. Man Ther. 2016;23:57-68.',k:'Propone el término dolor de hombro relacionado con el manguito rotador; manejo con educación y ejercicio de carga progresiva, y modificación de síntomas en la evaluación.'},
  h_kulkarni15:{l:'C',c:'Kulkarni R, Gibson J, Brownson P, et al. BESS/BOA patient care pathways: subacromial shoulder pain. Shoulder Elbow. 2015;7(2):135-143.',k:'Banderas rojas que requieren derivación: sospecha de infección, luxación no reducida, rotura aguda del manguito tras trauma y sospecha de tumor. Ejercicio supervisado antes de pensar en cirugía.'},
  h_cools14:{l:'C',c:'Cools AM, Struyf F, De Mey K, Maenhout A, Castelein B, Cagnie B. Rehabilitation of scapular dyskinesis: from the office worker to the elite overhead athlete. Br J Sports Med. 2014;48(8):692-697.',k:'Control y fuerza escapular progresivos, de ejercicios básicos a cadena cinética y gestos por encima de la cabeza en el deportista.'},
  h_roy09:{l:'C',c:'Roy JS, MacDermid JC, Woodhouse LJ. Measuring shoulder function: a systematic review of four questionnaires. Arthritis Rheum. 2009;61(5):623-632.',k:'SPADI es válido y sensible al cambio; diferencia mínima clínicamente importante de ~8–13 puntos.'}
});

/* ---------- Criterios ---------- */
Object.assign(CR, {
  h_rf:{t:'Banderas rojas descartadas', f:s=> !!s.homRF},
  h_irr:{t:'Irritabilidad ya no alta (no despierta de noche ni duele en reposo)', f:s=> s.homIrr ? s.homIrr!=='alta' : null},
  h_dol3:{t:'Dolor de hombro ≤ 3/10 en las actividades del día y vuelta a basal a las 24 h', f:s=> num(s.homDolor)==null?null: num(s.homDolor)<=3 && s.homResp!=='peor'},
  h_noche:{t:'Dolor nocturno ≤ 2/10', f:s=> num(s.homNoche)==null?null: num(s.homNoche)<=2},
  h_spadi30:{t:'SPADI ≤ 30 %', f:s=> num(s.homSpadi)==null?null: num(s.homSpadi)<=30},
  h_spadi15:{t:'SPADI ≤ 15 %', f:s=> num(s.homSpadi)==null?null: num(s.homSpadi)<=15},
  h_elev:{t:'Eleva el brazo completo (flexión y abducción) con dolor ≤ 3/10', m:1},
  h_re80:{t:'Fuerza de rotación externa ≥ 80 % del lado sano (dinamómetro o RM)', m:1},
  h_re90:{t:'Fuerza de rotación externa ≥ 90 % del lado sano', m:1},
  h_oh:{t:'Press por encima de la cabeza con carga moderada y dolor ≤ 3/10', m:1},
  h_sport:{t:'Completa el gesto del deporte (lanzar, nadar, sacar) a volumen completo sin aumento a las 24 h', m:1},
  h_auto:{t:'Sabe manejar un repunte y mantiene su programa de fuerza por su cuenta', m:1}
});

/* ---------- Protocolo ---------- */
const HOM_IRR = {alta:'Alta · duele en reposo o lo despierta de noche; poco movimiento lo dispara y tarda en calmarse', mod:'Moderada · duele con ciertos gestos y se calma en minutos', baja:'Baja · molestia leve solo con cargas altas o gestos por encima de la cabeza'};
const HOM_TOR = X('Movilidad de columna torácica','1 × 5 min',{t:'Extensión sobre rodillo y rotaciones en cuadrupedia. Un tórax que se mueve deja más espacio al brazo arriba.'});
P['hom-manguito'] = {label:'Dolor de hombro del manguito rotador', weeks:[0,3,8], phases:[
  lph('Fase 1 · Calmar y empezar a cargar', '0–3 semanas', 'Bajar la irritabilidad sin dejar de usar el brazo: explicar que no es un daño que empeora al moverse, ajustar el volumen de lo que más duele y empezar a cargar el manguito en un rango tolerable.', {
    next:['h_rf','h_irr','h_noche','h_dol3'], nextLabel:'Para pasar a fuerza progresiva',
    avoid:'Reposo o cabestrillo. Tampoco repetir mucho el gesto que más duele por encima de la cabeza (lanzar, nadar a volumen completo, press pesado) mientras el dolor esté irritable: se baja el volumen, no se elimina todo.',
    act:[HOM_TOR, X('Rotación externa isométrica contra la pared','4–5 × 30–45 s',{rpe:'5–6',t:'Codo pegado al cuerpo a 90°, empuja el dorso de la mano contra el marco de una puerta. Dolor hasta 3/10. La evidencia de que alivie es inconsistente: úsala si a ti te calma.'})],
    neuro:[X('Deslizamiento en la pared (wall slide)','2 × 10',{t:'Antebrazos en la pared; sube despacio dejando que la escápula rote hacia arriba. Solo hasta donde no duela.'}), X('Retracción escapular con banda','2 × 12–15',{rpe:'5',t:'Junta las escápulas sin subir los hombros.'})],
    central:[X('Rotación externa en decúbito lateral con mancuerna','3 × 12–15',{rpe:'5–6',t:'Toalla entre el codo y el cuerpo. Lento, 3 s al bajar.'}), X('Elevación en plano escapular hasta la altura del hombro','3 × 10–15',{rpe:'5–6',t:'Brazos a 30° por delante del cuerpo, pulgares arriba. Rango sin dolor > 3/10.'}), X('Remo con banda de pie','3 × 12–15',{rpe:'6'}), X('Flexiones contra la pared con protracción (plus)','3 × 10–12',{rpe:'5–6',t:'Al final empuja un poco más separando las escápulas (serrato).'}), X('Sentadilla goblet','3 × 10',{rpe:'6',t:'El resto del cuerpo se sigue entrenando normal.'}), X('Puente de glúteo','3 × 12',{rpe:'6'})],
    home:X('Elevación del brazo con carga ligera (ejercicio en casa)','3 × 10–15, 1–2 veces al día',{t:'El movimiento que más molesta, despacio, con una botella o una banda. Es el formato del estudio SELF: un solo ejercicio bien progresado rindió igual que la fisioterapia habitual.'}),
    ev:['h_desmeules25','h_lewis16','h_littlewood16','h_kulkarni15'] }),
  lph('Fase 2 · Fuerza progresiva', '3–8 semanas', 'Construir fuerza del manguito y de los estabilizadores escapulares subiendo la carga semana a semana, y empezar a llevar el brazo por encima de la cabeza con carga.', {
    next:['h_dol3','h_elev','h_re80','h_spadi30'], nextLabel:'Para pasar a fuerza por encima de la cabeza y retorno',
    act:[HOM_TOR, X('Rotación externa con banda a 0° de abducción','2 × 15',{rpe:'6'})],
    neuro:[X('Elevación en Y en banco inclinado','3 × 10',{rpe:'6–7',t:'Pecho apoyado, pulgares arriba; trapecio inferior.'}), X('Rotación externa a 90° de abducción con banda','3 × 12',{rpe:'6–7',t:'Codo a la altura del hombro. Solo si es indolora.'})],
    central:[X('Rotación externa en decúbito lateral con mancuerna','3 × 8–12',{rpe:'7–8',t:'Cuando sobren repeticiones, sube el peso.'}), X('Elevación en plano escapular con mancuerna','3 × 8–12',{rpe:'7–8',t:'Hasta arriba si el dolor es ≤ 3/10.'}), X('Landmine press unilateral','3 × 8–10',{rpe:'7',t:'Empuje en diagonal: el puente hacia el press por encima de la cabeza.'}), X('Remo con mancuerna','3 × 8–10',{rpe:'8'}), X('Jalón al pecho con agarre neutro','3 × 8–10',{rpe:'7–8',t:'Rango sin dolor; no bajes la barra detrás de la nuca.'}), X('Flexiones con protracción (plus)','3 × 8–12',{rpe:'7',t:'En el suelo o inclinadas según la fuerza.'}), X('Peso muerto rumano','3 × 8',{rpe:'7'})],
    home:X('Elevación del brazo con carga (ejercicio en casa)','3 × 10–15, 1 vez al día',{t:'Sube el peso cuando sobren repeticiones con dolor ≤ 3/10.'}),
    ev:['h_holmgren12','h_ingwersen17','h_malliaras20','h_cools14','h_pieters20'] }),
  lph('Fase 3 · Por encima de la cabeza y retorno', '8–12 semanas o más', 'Fuerza pesada por encima de la cabeza, potencia y el gesto del deporte con volumen creciente.', {
    next:['h_re90','h_oh','h_spadi15','h_sport'], nextLabel:'Criterios de alta o retorno deportivo',
    act:[HOM_TOR, X('Rotación externa a 90° de abducción con banda','2 × 15',{rpe:'6'})],
    neuro:[X('Lanzamiento de balón medicinal al pecho (pared)','3 × 6',{t:'Máxima intención.'}), X('Kettlebell swing','3 × 10',{rpe:'7'})],
    central:[X('Press militar con mancuernas','3 × 6–8',{rpe:'8',t:'Progresión semanal. El objetivo es dejar de tratar el hombro como frágil.'}), X('Rotación externa a 90° de abducción en polea','3 × 8–10',{rpe:'8'}), X('Dominadas o jalón al pecho','3 × 6–8',{rpe:'8'}), X('Remo con barra','3 × 6–8',{rpe:'8'}), X('Turkish get-up','3 × 2 por lado',{rpe:'7',t:'Estabilidad del hombro con el brazo arriba y carga.'}), X('Sentadilla','3 × 6',{rpe:'8'})],
    home:X('Rotación externa con banda (mantenimiento)','2 × 15, 3 días por semana'),
    ev:['h_cools14','h_desmeules25','h_beard18'] })
]};
STAGES['hom-manguito'] = ['early','mid','late'];
// Deportistas de gesto por encima de la cabeza: pliometría del hombro y vuelta progresiva al gesto en la fase 3
const HOM_OH_NEURO = [X('Drops de balón en 90/90 (pliometría de rotación externa)','3 × 20–30 s',{t:'Boca abajo o de pie, brazo a 90°: suelta y atrapa una pelota de 0,5–1 kg rápido. Solo con dolor ≤ 3/10.'}), X('Lanzamiento de balón medicinal sobre la cabeza a la pared','3 × 8',{t:'Ligero (1–2 kg), a dos manos; luego a una mano.'})];
const HOM_OH_HOME = X('Vuelta progresiva al gesto del deporte','Volumen creciente semana a semana',{t:'Lanzar, nadar o sacar: empieza con la mitad del volumen y distancias o intensidades cortas; sube si el hombro no amanece peor.'});

/* ---------- Integración ---------- */
MODULOS.hombro = 'Rehabilitación · Hombro';
if(typeof MOD_L !== 'undefined') MOD_L.hombro = 'Rehab';
const homLadoTxt = s => (s.homLado || 'der') === 'izq' ? 'izquierdo' : 'derecho';
const HOM_REGLA = 'Dolor del hombro hasta 3/10 durante el ejercicio y al día siguiente (también en la noche) igual o mejor: vas bien. Entre 4 y 5: mantén la carga. Más de 5, o si te despierta de noche más que antes: baja la carga, cambia ese ejercicio y avísale a tu fisioterapeuta. Usar el brazo ayuda; el reposo no.';
const _pkeyHom = pkey;
pkey = function(s){ return modOf(s)==='hombro' ? 'hom-manguito' : _pkeyHom(s); };
const _suggestedHom = suggested;
suggested = function(s){
  if(modOf(s)!=='hombro') return _suggestedHom(s);
  const w=num(s.homSem)||0; let i=0; P['hom-manguito'].weeks.forEach((t,k)=>{ if(w>=t) i=k; });
  if(s.homIrr==='alta') i=0; else if(s.homIrr==='mod') i=Math.min(i,1);
  return i;
};
const _subLabelHom = subLabel;
subLabel = function(s, P0){ return modOf(s)==='hombro' ? `${P['hom-manguito'].label} (${homLadoTxt(s)})` : _subLabelHom(s, P0); };
const _planKeyHom = planKey;
planKey = function(s){ const k=_planKeyHom(s); return modOf(s)==='hombro' ? k+`|hom:${s.homOH?1:0}:${s.homLado||'der'}` : k; };

function genWeekHom(s){
  const i=phaseIdx(s), ph=P['hom-manguito'].phases[i], n=nDias(s), oh = !!s.homOH && i===2;
  const neuroSrc = oh ? HOM_OH_NEURO : ph.neuro, home = oh ? HOM_OH_HOME : ph.home;
  return Array.from({length:n}, (_, d)=>{
    const rot = (arr, k) => arr.length<=k ? arr : arr.map((_,j)=>arr[(j+d)%arr.length]).slice(0,k);
    const B = {act:ph.act.map(it=>toRow(it)), neuro:rot(neuroSrc,2).map(it=>toRow(it, /lanzamiento|drops|swing/i.test(it.n)&&!it.rpe?{c:'Máx. intención'}:undefined)), central:rot(ph.central, n>=4?4:5).map(it=>toRow(it))};
    // Siempre al menos un ejercicio del manguito en el bloque central
    if(!B.central.some(r=>/rotaci[oó]n externa/i.test(r.e))) B.central[B.central.length-1] = toRow(ph.central[0]);
    if(home && d===0) B.act.push(toRow(home, {n:(home.t?home.t+' ':'')+'Todos los días, también los de descanso.'}));
    const segs = SEG_ORDER.map(t=>({type:t, sub:'', fmt:{t:'series'}, rows:B[t].map(r=>Object.assign(r,{lado:''}))}));
    levelAdj(segs[2].rows, s);
    return {name:`Día ${d+1}`, segs};
  });
}
const _genWeekHom = genWeek;
genWeek = function(s){ return modOf(s)==='hombro' ? genWeekHom(s) : _genWeekHom(s); };

function homLight(s){
  const d=num(s.homDolor), nn=num(s.homNoche);
  if(d==null && nn==null) return null;
  if((d!=null && d>5) || s.homResp==='peor' || (nn!=null && nn>=5)) return {c:'r', t:'Reducir carga', p:'Dolor > 5/10, peor a las 24 h o dolor nocturno fuerte: baja 1–2 puntos de RPE o 20–30 % del volumen, quita lo de por encima de la cabeza esta semana y mantén el manguito con isometría o carga ligera.'};
  if((d!=null && d>=4) || (nn!=null && nn>=3)) return {c:'y', t:'Mantener carga', p:'Dolor 4–5/10 o algo de dolor nocturno: repite la carga; si un ejercicio pasa de 5/10, cámbialo por su versión en rango más bajo.'};
  return {c:'g', t:'Progresar carga', p:'Dolor ≤ 3/10 y vuelve a basal a las 24 h: sube peso 2,5–5 % si el RPE quedó bajo, o suma 1–2 repeticiones.'};
}
function homPlanView(){
  const s=st, P0=P['hom-manguito'], i=phaseIdx(s), ph=P0.phases[i];
  const {days, custom} = viewWeek(s), nd=days.length, wl=homLight(s), oh=!!s.homOH && i===2, home = oh ? HOM_OH_HOME : ph.home;
  const mods=[];
  if(!s.homRF) mods.push(`<div class="mod warnmod"><b>Banderas rojas sin confirmar.</b> Antes de cargar descarta: trauma con pérdida brusca de fuerza para elevar (posible rotura aguda del manguito: derivar pronto al ortopedista), luxación no reducida, fiebre o hombro caliente y rojo (infección), antecedente de cáncer o dolor nocturno que no cede con nada, y dolor que viene del cuello con hormigueo o debilidad en el brazo. Si la rotación externa pasiva está muy limitada, piensa en capsulitis adhesiva: es otro manejo. ${refList(['h_kulkarni15','h_desmeules25'])}</div>`);
  if(s.homIrr) mods.push(`<div class="mod"><b>Irritabilidad ${esc(HOM_IRR[s.homIrr].split(' · ')[0].toLowerCase())}.</b> ${s.homIrr==='alta'?'Fase 1 aunque lleve semanas: cargas bajas, rango sin dolor y menos volumen del gesto que más duele. La fase sube cuando deje de despertarlo de noche.':s.homIrr==='mod'?'Hasta fase 2: carga progresiva con la regla de dolor; lo de por encima de la cabeza entra con landmine antes que con press militar.':'Puede ir a la fase que marquen las semanas y los criterios; la carga pesada es bienvenida.'}</div>`);
  if(s.homOH) mods.push(`<div class="mod"><b>Deporte con gesto por encima de la cabeza.</b> En la fase 3 el Neuro pasa a pliometría del hombro (drops 90/90, lanzamientos sobre la cabeza) y se agrega la vuelta progresiva al gesto. Los lanzamientos se progresan por volumen e intensidad con la regla de dolor de 24 h. ${refList(['h_cools14'])}</div>`);
  if(ph.avoid) mods.push(`<div class="mod"><b>Evitar en esta fase.</b> ${esc(ph.avoid)}</div>`);
  const overview = `<div class="tbl"><table class="data"><thead><tr><th>Día</th><th>Activación</th><th>Neuro</th><th>Central</th></tr></thead><tbody>
    ${days.map(d=>{ const g=t=>d.segs.find(x=>x.type===t); return `<tr><td><b>${esc(d.name)}</b></td><td>${g('act')?.rows.length||0}</td><td>${g('neuro')?.rows.length||0}</td><td>${g('central')?.rows.length||0}</td></tr>`; }).join('')}
    </tbody></table></div><p class="small" style="margin:8px 0 0">Reparto sugerido: ${nd===4?'lunes, martes, jueves y viernes':nd===3?'lunes, miércoles y viernes':'lunes y jueves'}. ${home?`Además: <b>${esc(home.n.toLowerCase())}</b> (${esc(home.d)}).`:''}</p>`;
  return `
  <section class="card"><div class="status">
    ${wl?`<div class="light ${wl.c}"><span class="dot"></span><div><b>${esc(wl.t)}</b><p>${esc(wl.p)}</p><p class="small" style="margin:4px 0 0">Según el estado clínico de hoy.</p></div></div>`:'<div class="light y"><span class="dot"></span><div><b>Sin estado clínico</b><p>Registra dolor con la actividad, dolor nocturno y respuesta a 24 h en la ficha para que el semáforo decida la carga.</p></div></div>'}
    <div><h3 class="sec">${esc(ph.nextLabel)}</h3>${critList(ph.next, s)}
      ${refList(ph.ev)}</div>
  </div></section>
  ${mods.length?`<section class="card"><h3 class="sec">Consideraciones de este caso</h3><div class="mods" style="margin:0">${mods.join('')}</div></section>`:''}
  <section class="card"><h3 class="sec">Semana tipo</h3>${overview}
    <div class="legend" style="margin-top:10px">${[['Activación','var(--c-act)'],['Neuro','var(--c-neuro)'],['Bloque central','var(--c-central)']].map(([l,c])=>`<span><i class="sw" style="background:${c}"></i>${l}</span>`).join('')}</div></section>
  ${custom?`<div class="edited"><span><b>Plan modificado por ti</b> para esta fase y ${nd} días.</span><button id="bReset">Restablecer plan base</button></div>`:''}
  ${days.map((d,di)=>dayHTML(d,di)).join('')}
  <section class="card"><h3 class="sec">Fundamento del plan</h3><div class="mods">
    <div class="mod"><b>El ejercicio es el tratamiento inicial.</b> Un programa activo de control motor y fuerza reduce dolor y discapacidad; la terapia manual y la educación se suman, no lo reemplazan. ${refList(['h_desmeules25','h_pieters20'])}</div>
    <div class="mod"><b>Carga alta o baja: las dos sirven.</b> Progresar según tolerancia rinde igual que empezar pesado; no está claro que más dosis sea mejor. Manda lo que la persona sostenga. ${refList(['h_ingwersen17','h_malliaras20'])}</div>
    <div class="mod"><b>Ejercicio antes que cirugía.</b> Un programa específico de 12 semanas redujo de 63 % a 20 % los que eligieron operarse, y la descompresión subacromial no superó al placebo. ${refList(['h_holmgren12','h_beard18'])}</div>
    <div class="mod"><b>Simple también funciona.</b> Un solo ejercicio en casa, bien progresado, rindió igual que la fisioterapia habitual: por eso hay un ejercicio diario en casa. ${refList(['h_littlewood16'])}</div>
    <div class="mod"><b>Escápula y cadena cinética.</b> Control y fuerza escapular progresivos, de lo básico a gestos por encima de la cabeza en el deportista. ${refList(['h_cools14'])}</div>
    <div class="mod"><b>Medir el progreso.</b> SPADI: un cambio de ~8–13 puntos es clínicamente importante. Fuerza de rotación externa contra el lado sano. ${refList(['h_roy09'])}</div>
  </div></section>
  ${allRefs()}`;
}
const _planViewHom = planView;
planView = function(){ return modOf(st)==='hombro' ? homPlanView() : _planViewHom(); };

/* Plan publicado: el portal usa la zona para la pregunta de la mañana y la regla de dolor */
const _rehabInfoHom = rehabInfo;
rehabInfo = function(s){ return modOf(s)==='hombro' ? {cond:'hom', l:'Dolor de hombro del manguito rotador', zona:'hombro', lado:homLadoTxt(s), irr:s.homIrr||'mod', regla:HOM_REGLA} : _rehabInfoHom(s); };

const _setModuloHom = setModulo;
setModulo = function(m){
  if(m==='hombro'){ if(modOf(st)==='hombro') return; st.modulo='hombro'; st.fase='auto'; if(!st.homIrr) st.homIrr='mod'; if(!st.homLado) st.homLado='der'; if(!st.nivel) st.nivel='int'; editMode=false; fillForm(); render(); markDirty(); return; }
  _setModuloHom(m);
};
$('#form').addEventListener('input', e=>{
  const k=e.target.dataset.k;
  if(k==='homIrr' || k==='homSem') { st.fase='auto'; syncVisibility(); }
});

/* ===================== DEPORTISTA CON DOLOR DE HOMBRO (Deporte + rehabilitación) =====================
   Para el deportista que sigue entrenando con su calendario porque el dolor no es como para solo hacer
   rehabilitación. La terapia del manguito entra en Activación y Neuro (marcada como terapia) y se cambian
   o condicionan los ejercicios que más cargan el hombro según la irritabilidad. Razonamiento clínico
   apoyado en la guía de tendinopatía del manguito (Desmeules 2025) y la monitorización del dolor. */
REHAB_DEP.hom = {l:'Dolor de hombro (manguito rotador)', zona:'hombro', chk:'hombro', ev:['h_desmeules25','h_ingwersen17','h_cools14','silbernagel','exp'], regla:HOM_REGLA};
const HOM_OH_DEP = ['uwr','natacion','raqueta','cancha'];
function homTherapy(s, d){
  const irr = s.rehabIrr || 'mod', lado = rehabLadoTxt(s), k = weekKind(s, curWeek(s)).wt.k, torneo = FP_LIGHT.includes(k);
  const T = (it, seg) => ({seg, row: toRow(it, {ter: true, lado: 'Lesionada'})});
  const out = [];
  if(irr === 'alta') out.push(T(X('Rotación externa isométrica contra la pared', '4 × 30–45 s', {rpe: '5–6', t: `Hombro ${lado}, codo pegado al cuerpo, empuja el dorso de la mano contra el marco de una puerta. Dolor hasta 3/10.`}), 'act'));
  else if(irr === 'mod') out.push(T(d % 2 === 0
    ? X('Rotación externa en decúbito lateral con mancuerna', torneo ? '2 × 12' : '3 × 10–15', {rpe: '6–7', t: `Hombro ${lado}. Toalla entre codo y cuerpo; 3 s al bajar.${torneo ? ' Semana de torneo: sin subir la carga.' : ''}`})
    : X('Elevación en plano escapular hasta la altura del hombro', torneo ? '2 × 12' : '3 × 10–12', {rpe: '6–7', t: 'Brazos a 30° por delante, pulgares arriba. Rango sin dolor > 3/10.'}), 'act'));
  else out.push(T(d % 2 === 0
    ? X('Rotación externa a 90° de abducción con banda o polea', torneo ? '2 × 10' : '3 × 10–12', {rpe: torneo ? '7' : '7–8', t: `Hombro ${lado}, codo a la altura del hombro. Sube la carga cuando sobren repeticiones${torneo ? ' (esta semana no: torneo)' : ''}.`})
    : X('Elevación en plano escapular con mancuerna', torneo ? '2 × 10' : '3 × 8–10', {rpe: torneo ? '7' : '8', t: 'Hasta arriba si el dolor es ≤ 3/10.'}), 'act'));
  if(irr === 'alta') out.push(T(X('Deslizamiento en la pared (wall slide)', '2 × 10', {t: 'Antebrazos en la pared, sube despacio solo hasta donde no duela.'}), 'neuro'));
  else if(irr === 'mod' || !HOM_OH_DEP.includes(s.deporteP)) out.push(T(X('Elevación en Y en banco inclinado', '2 × 10', {rpe: '6', t: 'Pecho apoyado, pulgares arriba (trapecio inferior).'}), 'neuro'));
  else out.push(T(X('Drops de balón en 90/90 (pliometría de rotación externa)', '3 × 20 s', {t: 'Brazo a 90°, suelta y atrapa una pelota de 0,5–1 kg rápido. Solo con el hombro ≤ 3/10 hoy.'}), 'neuro'));
  return out;
}
const HOM_OVER = /press militar|press de hombro|landmine/i, HOM_BENCH = /^press banca/i, HOM_PULLV = /dominadas|jal[oó]n al pecho$/i;
const HOM_SLAM = /hacia abajo|sobre la cabeza|jal[oó]n al pecho explosivo/i;
function homAdjust(row, s, used){
  if(row.ter) return row;
  const irr = s.rehabIrr || 'mod', lado = rehabLadoTxt(s), r = Object.assign({}, row), add = t => { r.n = [r.n, t].filter(Boolean).join(' '); };
  const swap = (e, n) => { r.e = e; r.n = n; };
  if(HOM_OVER.test(r.e)){
    if(irr === 'alta') swap('Press de suelo con mancuernas (agarre neutro)', 'Sin brazo por encima de la cabeza mientras la irritabilidad esté alta.');
    else if(irr === 'mod' && /press militar|press de hombro/i.test(r.e)) swap('Landmine press unilateral', `Empuje en diagonal en vez de vertical hasta que el press por encima de la cabeza no pase de 3/10 en el hombro ${lado}.`);
    else add(`Hombro ${lado}: dolor hasta 3/10; si pasa, cámbialo por landmine press.`);
  } else if(HOM_BENCH.test(r.e)){
    add(irr === 'alta' ? 'Agarre neutro con mancuernas y rango sin dolor; si pasa de 3/10, haz press de suelo.' : `Hombro ${lado}: dolor hasta 3/10; codos a ~45° del cuerpo.`);
  } else if(HOM_PULLV.test(r.e)){
    if(irr === 'alta') swap('Jalón al pecho con agarre neutro', 'Rango sin dolor; no estires del todo arriba si molesta.');
    else add(`Hombro ${lado}: dolor hasta 3/10. Agarre neutro si molesta el prono.`);
  } else if(/pullover/i.test(r.e) && irr !== 'baja'){
    swap('Remo con banda de pie', 'Cambia al pullover mientras el hombro esté irritable (brazo por encima de la cabeza con carga).');
  } else if(HOM_SLAM.test(r.e)){
    if(irr === 'alta'){ const alt = ['Kettlebell swing', 'Salto al cajón', 'Sentadilla con salto'].find(n => !used.has(n)) || 'Kettlebell swing'; swap(alt, 'Potencia sin cargar el hombro mientras la irritabilidad esté alta.'); used.add(alt); }
    else add(`Solo si el hombro ${lado} está en 3/10 o menos; si no, cámbialo por kettlebell swing.`);
  } else if(/lanzamiento (rotacional|lateral)/i.test(r.e) && irr === 'alta'){
    add('Lanza bajo, a la altura de la cadera, sin llevar el brazo arriba.');
  }
  return r;
}
const _genWeekDepHom = genWeekDep;
genWeekDep = function(s){
  const days = _genWeekDepHom(s);
  if(!rehabOn(s) || (s.rehabCond || 'fp') !== 'hom') return days;
  const c = constraints(s);
  return days.map((day, d) => {
    const segs = day.segs.map(sg => Object.assign({}, sg, {rows: sg.rows.slice()}));
    const seg = t => segs.find(g => g.type === t);
    const used = new Set(); segs.forEach(sg => sg.rows.forEach(r => used.add(r.e)));
    segs.forEach(sg => { sg.rows = sg.rows.map(r => { const a = homAdjust(r, s, used); return a === r || a.ter ? a : fromBank(a, c); }); });
    // La terapia reemplaza la rotación externa preventiva del deporte (sin duplicar)
    segs.forEach(sg => { sg.rows = sg.rows.filter(r => r.ter || !/rotaci[oó]n externa de hombro con banda/i.test(r.e)); });
    const act = seg('act'), neuro = seg('neuro'), th = homTherapy(s, d);
    // Activación de 10–15 min: queda un solo preventivo del deporte
    const prev = act.rows.map((r, k) => k).filter(k => k > 1 && !act.rows[k].ter);
    if(prev.length > 1) prev.slice(1).reverse().forEach(k => act.rows.splice(k, 1));
    act.rows.splice(1, 0, ...th.filter(x => x.seg === 'act').map(x => x.row));
    neuro.rows.unshift(...th.filter(x => x.seg === 'neuro').map(x => x.row));
    const powK = neuro.rows.map((r, k) => k).filter(k => !neuro.rows[k].ter);
    if(powK.length > 2) powK.slice(2).reverse().forEach(k => neuro.rows.splice(k, 1));
    return Object.assign({}, day, {segs});
  });
};
const _rehabModHom = rehabMod;
rehabMod = function(s){
  if(!rehabOn(s) || (s.rehabCond || 'fp') !== 'hom') return _rehabModHom(s);
  const irr = s.rehabIrr || 'mod', w = rehabWeek(s), R0 = REHAB_DEP.hom, oh = HOM_OH_DEP.includes(s.deporteP);
  return `<div class="mod"><b>Dolor de hombro ${esc(rehabLadoTxt(s))} · irritabilidad ${esc(HOM_IRR[irr].split(' · ')[0].toLowerCase())} · semana ${w} de rehabilitación.</b>
    Activación: ${irr === 'alta' ? 'rotación externa isométrica todos los días' : irr === 'mod' ? 'rotación externa en decúbito lateral y elevación en plano escapular, alternando días' : 'rotación externa a 90° y elevación en plano escapular con carga, alternando días'}. Neuro: ${irr === 'alta' ? 'deslizamiento en la pared' : irr === 'mod' || !oh ? 'elevación en Y' : 'drops de balón en 90/90 (pliometría del hombro)'}.
    ${irr === 'alta' ? 'Press por encima de la cabeza cambiado por press de suelo, jalón con agarre neutro y lanzamientos por encima de la cabeza cambiados por potencia sin hombro.' : irr === 'mod' ? 'Press militar cambiado por landmine press; el resto de empujes y tirones con regla de dolor.' : 'Todo permitido con la regla de dolor.'}
    En semanas de puesta a punto y torneo la terapia no sube carga.
    <br><b>Regla de dolor.</b> ${esc(R0.regla)}
    <br><b>En el agua o en la cancha.</b> Si el hombro amanece peor después del entrenamiento técnico, baja primero el volumen del gesto (lanzamientos, brazadas, saques) antes que el gimnasio.
    <br><b>Cuándo parar.</b> Pérdida brusca de fuerza tras un golpe o caída, dolor nocturno que no cede, hormigueo en el brazo o que no mejore en 6–12 semanas: revisar el diagnóstico. ${refList(R0.ev)}</div>`;
};
