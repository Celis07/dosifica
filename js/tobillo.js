/* ===================== REHAB · TOBILLO (oct 2026) =====================
   Esguince lateral de tobillo (agudo) e inestabilidad crónica de tobillo. Fases por semanas y
   criterios, igual que hombro y lumbar: plan semanal, sesiones, portal, exportación y trabajo en casa.
   Cada fase trae su programa para la casa (casa) basado en la literatura (Hupperets 2009, Bleakley
   2010, guías de Vuurberg 2018 y Martin 2021). */

/* ---------- Referencias (verificadas oct 2026) ---------- */
Object.assign(R, {
  t_vuurberg18:{l:'A',c:'Vuurberg G, Hoorntje A, Wink LM, et al. Diagnosis, treatment and prevention of ankle sprains: update of an evidence-based clinical guideline. Br J Sports Med. 2018;52(15):956.',k:'Guía clínica: reglas de Ottawa para decidir la radiografía; tratamiento funcional con soporte externo (ortesis semirrígida o vendaje) en vez de inmovilizar; ejercicio desde temprano para recuperar función y prevenir recaídas.'},
  t_martin21:{l:'A',c:'Martin RL, Davenport TE, Fraser JJ, et al. Ankle stability and movement coordination impairments: lateral ankle ligament sprains revision 2021. J Orthop Sports Phys Ther. 2021;51(4):CPG1-CPG80.',k:'Guía de práctica clínica (APTA): carga temprana con soporte externo, ejercicio terapéutico progresivo de equilibrio, fuerza y movilidad, y programas de ejercicio para prevenir recurrencias.'},
  t_doherty17:{l:'A',c:'Doherty C, Bleakley C, Delahunt E, Holden S. Treatment and prevention of acute and recurrent ankle sprain: an overview of systematic reviews with meta-analysis. Br J Sports Med. 2017;51(2):113-125.',k:'Revisión de revisiones: el ejercicio y los soportes externos reducen la recurrencia del esguince; el tratamiento funcional es preferible a la inmovilización.'},
  t_hupperets09:{l:'B',c:'Hupperets MDW, Verhagen EALM, van Mechelen W. Effect of unsupervised home based proprioceptive training on recurrences of ankle sprain: randomised controlled trial. BMJ. 2009;339:b2684.',k:'8 semanas de entrenamiento propioceptivo en casa, 3 veces por semana y hasta 30 min, sin supervisión: 35 % menos recaídas a un año (NNT 9). Solo el 23 % lo hizo completo: la adherencia es el reto.'},
  t_bleakley10:{l:'B',c:'Bleakley CM, O\'Connor SR, Tully MA, et al. Effect of accelerated rehabilitation on function after ankle sprain: randomised controlled trial. BMJ. 2010;340:c1964.',k:'Ejercicio terapéutico desde la primera semana mejoró la función a corto plazo frente al manejo con hielo, compresión y reposo relativo.'},
  t_smith21:{l:'C',c:'Smith MD, Vicenzino B, Bahr R, et al. Return to sport decisions after an acute lateral ankle sprain injury: introducing the PAASS framework—an international multidisciplinary consensus. Br J Sports Med. 2021;55(22):1270-1276.',k:'Consenso PAASS: el retorno al deporte se decide por Dolor, impedimentos del tobillo, percepción del Atleta, control Sensoriomotor y rendimiento deportivo (Sport), no por el tiempo.'},
  t_dubois20:{l:'C',c:'Dubois B, Esculier JF. Soft-tissue injuries simply need PEACE and LOVE. Br J Sports Med. 2020;54(2):72-73.',k:'Primeros días: proteger, elevar, evitar antiinflamatorios, comprimir y educar. Después: carga, optimismo, ejercicio aeróbico y ejercicio.'},
  t_bachmann03:{l:'A',c:'Bachmann LM, Kolb E, Koller MT, Steurer J, ter Riet G. Accuracy of Ottawa ankle rules to exclude fractures of the ankle and mid-foot: systematic review. BMJ. 2003;326(7386):417.',k:'Las reglas de Ottawa tienen una sensibilidad cercana al 100 % para descartar fractura de tobillo y mediopié: si son negativas, no hace falta radiografía.'},
  t_kosik17:{l:'A',c:'Kosik KB, McCann RS, Terada M, Gribble PA. Therapeutic interventions for improving self-reported function in patients with chronic ankle instability: a systematic review. Br J Sports Med. 2017;51(2):105-112.',k:'En la inestabilidad crónica, el entrenamiento de equilibrio y la rehabilitación multimodal mejoran la función que reporta la persona.'},
  t_hertel19:{l:'C',c:'Hertel J, Corbett RO. An updated model of chronic ankle instability. J Athl Train. 2019;54(6):572-588.',k:'La inestabilidad crónica combina déficits mecánicos, sensoriomotores y de percepción (miedo, confianza): la rehabilitación debe atender los tres.'},
  t_gribble14:{l:'C',c:'Gribble PA, Delahunt E, Bleakley CM, et al. Selection criteria for patients with chronic ankle instability in controlled research: a position statement of the International Ankle Consortium. Br J Sports Med. 2014;48(13):1014-1018.',k:'Inestabilidad crónica: antecedente de esguince importante, episodios de "se me va" o esguinces repetidos, y cuestionario de inestabilidad alterado (CAIT por debajo de 24).'}
});

/* ---------- Criterios ---------- */
Object.assign(CR, {
  t_rf:{t:'Fractura y lesión de sindesmosis descartadas (reglas de Ottawa negativas o imagen normal)', f:s=> !!s.tobRF},
  t_marcha:{t:'Camina sin cojear y con dolor ≤ 3/10', m:1},
  t_dol3:{t:'Dolor del tobillo ≤ 3/10 con la actividad y vuelta a basal a las 24 h', f:s=> num(s.tobDolor)==null?null: num(s.tobDolor)<=3 && s.tobResp!=='peor'},
  t_df:{t:'Dorsiflexión en carga (rodilla a la pared) ≥ 90 % del lado sano', m:1},
  t_uni:{t:'Apoyo en un pie 30 s estable, ojos abiertos, sin dolor', m:1},
  t_talon:{t:'Elevaciones de talón en un pie ≥ 90 % de las del lado sano', m:1},
  t_ybal:{t:'Y-balance anterior: diferencia < 4 cm con el lado sano', m:1},
  t_hop:{t:'Saltos en un pie (distancia y lateral) ≥ 90 % del lado sano y sin sensación de inestabilidad', m:1},
  t_cait:{t:'CAIT ≥ 24 (ya no cumple criterio de inestabilidad)', f:s=> num(s.tobCait)==null?null: num(s.tobCait)>=24},
  t_sin:{t:'Sin episodios de "se me va" el tobillo en las últimas 4 semanas', m:1},
  t_paass:{t:'PAASS: completa el entrenamiento de su deporte sin dolor, con confianza y sin inestabilidad', m:1}
});

/* ---------- Ejercicios ---------- */
const TOB_DF = X('Dorsiflexión en carga (rodilla a la pared)','2 × 10 por lado',{t:'Talón apoyado, lleva la rodilla a la pared. Ambas piernas: la sana te da la meta.'});
const TOB_ALF = X('Alfabeto con el tobillo','2 × 1 abecedario',{t:'Dibuja las letras con el pie, despacio y sin dolor > 3/10. Ayuda a bajar la hinchazón.'});
const TOB_BOMBEO = X('Bombeo de tobillo con la pierna elevada','3 × 20',{t:'Acostado, pie por encima del corazón: sube y baja la punta del pie.'});
const TOB_UNI = X('Apoyo en un pie','3 × 30 s por lado',{t:'Ambas piernas. Cerca de una pared. Cuando aguantes 30 s estable, cierra los ojos.'});
const TOB_UNI_OC = X('Apoyo en un pie con ojos cerrados','3 × 30 s por lado',{t:'Ambas piernas, cerca de una pared o mesa.'});
const TOB_UNI_INEST = X('Apoyo en un pie sobre superficie blanda','3 × 30 s por lado',{t:'Cojín o toalla doblada. Ambas piernas. Progresión: ojos cerrados o lanzar y atrapar un balón.'});
const TOB_EVER = X('Eversión con banda elástica','3 × 12–15',{rpe:'6–7',t:'Lleva el borde externo del pie hacia afuera contra la banda, 3 s al volver. Ambos pies.'});
const TOB_TALON2 = X('Elevación de talones con los dos pies','3 × 15',{rpe:'6',t:'Sube y baja despacio, en el rango sin dolor.'});
const TOB_TALON1 = X('Elevación de talón en un pie','3 × 10–15 por lado',{rpe:'7',t:'Ambas piernas; con la lesionada apóyate con las manos si hace falta. 2 s arriba.'});
const TOB_SOLEO = X('Elevación de talón con rodilla flexionada (sóleo)','3 × 12 por lado',{rpe:'7'});
const TOB_POGO = X('Saltos de tobillo con los dos pies (pogo)','3 × 15',{t:'Rígido y reactivo, contacto corto y silencioso.'});
const TOB_LINEA = X('Saltos sobre una línea (adelante-atrás y lateral)','3 × 10 s',{t:'Con los dos pies primero; luego en un pie, ambas piernas.'});
const TOB_ESTRELLA = X('Alcances en estrella en un pie','3 × 5 por dirección',{t:'Apoyado en un pie, toca lejos adelante, al lado y atrás con el otro. Ambas piernas.'});

P['tob-agudo'] = {label:'Esguince lateral de tobillo', weeks:[0,1,3,6], phases:[
  lph('Fase 1 · Proteger y cargar temprano', '0–1 semana', 'Controlar el dolor y la hinchazón sin inmovilizar: apoyar lo que se tolere con soporte externo (ortesis semirrígida o vendaje funcional) y mover el tobillo desde los primeros días.', {
    next:['t_rf','t_marcha','t_dol3'], nextLabel:'Para pasar a movilidad, fuerza y equilibrio',
    avoid:'Inmovilizar con yeso o bota salvo sospecha de fractura o esguince grave, calor y masaje fuerte las primeras 72 h, antiinflamatorios de rutina los primeros días, inversión forzada y saltos.',
    act:[TOB_ALF, TOB_BOMBEO],
    neuro:[X('Transferencia de peso de pie a pie','2 × 20',{t:'De pie, pasa el peso de un pie al otro hasta donde lo tolere el tobillo.'}), X('Equilibrio con los dos pies, ojos cerrados','3 × 30 s')],
    central:[X('Isometría de eversión contra la pared','4 × 30 s',{rpe:'5–6',t:'Sentado, borde externo del pie contra la pared o un mueble. Dolor ≤ 3/10.'}), X('Isometría de flexión plantar','4 × 30 s',{rpe:'5–6',t:'Sentado, empuja el suelo con la punta del pie.'}), TOB_TALON2, X('Bicicleta estática','1 × 10–15 min',{rpe:'5',t:'Sin dolor > 3/10. Mantiene la condición aeróbica.'}), X('Sentadilla goblet','3 × 10',{rpe:'6',t:'El resto del cuerpo se sigue entrenando.'}), X('Puente de glúteo','3 × 12',{rpe:'6'}), X('Remo con banda','3 × 12',{rpe:'7'})],
    casa:[TOB_BOMBEO, TOB_ALF, X('Isometría de eversión contra la pared','3 × 30 s',{t:'Borde externo del pie contra la pared. Dolor ≤ 3/10.'}), X('Transferencia de peso de pie a pie','2 × 20'), X('Elevación de talones sentado','3 × 15',{t:'Si de pie todavía duele.'}), X('Caminar con la ortesis o el vendaje','Varias veces al día',{t:'Lo que tolere, sin cojear de más. El apoyo temprano acelera la recuperación.'})],
    casaFrec:'Todos los días, 1–2 veces', casaEv:['t_bleakley10','t_dubois20','t_vuurberg18'],
    ev:['t_vuurberg18','t_dubois20','t_bleakley10','t_bachmann03','t_martin21'] }),
  lph('Fase 2 · Movilidad, fuerza y equilibrio', '1–3 semanas', 'Recuperar la dorsiflexión, la fuerza de los eversores y del tríceps sural, y el equilibrio en un pie.', {
    next:['t_dol3','t_marcha','t_uni','t_df'], nextLabel:'Para pasar a control dinámico',
    avoid:'Saltos y cambios de dirección. Superficies irregulares sin soporte externo.',
    act:[TOB_DF, X('Movilización de dorsiflexión con banda','2 × 10',{t:'Banda por delante del tobillo tirando hacia atrás mientras llevas la rodilla adelante.'})],
    neuro:[TOB_UNI, TOB_ESTRELLA],
    central:[TOB_EVER, TOB_TALON1, TOB_SOLEO, X('Inversión con banda elástica','2 × 15',{rpe:'6',t:'Rango cómodo, sin forzar al final.'}), X('Sentadilla','3 × 8–10',{rpe:'7'}), X('Peso muerto rumano','3 × 8',{rpe:'7'}), X('Abducción de cadera con banda','3 × 12–15',{rpe:'7'})],
    casa:[TOB_DF, TOB_UNI, TOB_EVER, TOB_TALON1, TOB_SOLEO, X('Abducción de cadera de pie con banda','2 × 15 por lado')],
    casaFrec:'1 vez al día, 15–20 min', casaEv:['t_martin21','t_bleakley10','t_doherty17'],
    ev:['t_martin21','t_vuurberg18','t_doherty17'] }),
  lph('Fase 3 · Control dinámico y fuerza', '3–6 semanas', 'Fuerza con carga, equilibrio con perturbación y superficies inestables, y los primeros saltos y trote.', {
    next:['t_dol3','t_df','t_talon','t_ybal'], nextLabel:'Para pasar a potencia y retorno',
    avoid:'Saltos en un pie y cambios de dirección a máxima velocidad todavía.',
    act:[TOB_DF, X('Caminar en puntas y en talones','2 × 20 m')],
    neuro:[TOB_UNI_INEST, TOB_POGO, TOB_LINEA],
    central:[X('Elevación de talón en un pie con carga','3 × 8–12 por lado',{rpe:'8',t:'Mancuerna o mochila. Ambas piernas.'}), X('Pasos laterales con banda en los tobillos','3 × 10 por lado',{rpe:'7'}), X('Step-down excéntrico','3 × 8 por lado',{rpe:'7',t:'Rodilla alineada con el pie. Ambas piernas.'}), X('Sentadilla búlgara','3 × 8 por lado',{rpe:'8'}), X('Hip thrust','3 × 8–10',{rpe:'8'}), X('Trote progresivo','1 × 10–20 min',{t:'Alterna 1 min trote / 1 min caminata y sube el trote si el tobillo no amanece peor.'})],
    casa:[TOB_UNI_INEST, X('Apoyo en un pie lanzando y atrapando un balón','3 × 30 s por lado',{t:'Contra una pared. Ambas piernas.'}), X('Elevación de talón en un pie con mochila','3 × 10 por lado',{rpe:'8'}), TOB_POGO, TOB_LINEA, TOB_EVER],
    casaFrec:'3–4 días por semana, 20–30 min', casaEv:['t_hupperets09','t_martin21'],
    ev:['t_martin21','t_doherty17','t_hupperets09'] }),
  lph('Fase 4 · Potencia y retorno al deporte', '6 semanas o más', 'Saltos en un pie, cambios de dirección y gestos del deporte. Se vuelve a competir cuando cumple los criterios PAASS, no por la fecha, y se mantiene 8 semanas un programa preventivo en casa.', {
    next:['t_hop','t_ybal','t_talon','t_paass'], nextLabel:'Criterios de retorno al deporte (PAASS)',
    avoid:'Volver a competir solo porque ya no duele: el riesgo de recaída es mayor el primer año.',
    act:[TOB_DF, TOB_POGO],
    neuro:[X('Saltos en un pie en el sitio','3 × 10 por lado',{t:'Ambas piernas. Contacto corto y estable.'}), X('Saltos laterales en un pie con estabilización','3 × 6 por lado',{t:'Aterriza y quédate quieto 2 s.'}), X('Cambios de dirección en zigzag','4 × 1',{t:'Primero planeados y a media velocidad; luego reactivos.'})],
    central:[X('Elevación de talón en un pie pesada','4 × 6–8 por lado',{rpe:'8'}), X('Sentadilla','4 × 5',{rpe:'8'}), X('Peso muerto rumano en un pie','3 × 8 por lado',{rpe:'8'}), X('Step up a cajón','3 × 8 por lado',{rpe:'8'}), X('Pallof press','3 × 10 por lado',{rpe:'7'})],
    casa:[TOB_UNI_OC, X('Apoyo en un pie con el gesto del deporte','3 × 30 s por lado',{t:'Lanzar, patear o recibir mientras estás en un pie. Ambas piernas.'}), TOB_UNI_INEST, X('Sentadilla en un pie a una silla','3 × 8 por lado',{rpe:'7'}), X('Saltos en un pie con estabilización','3 × 6 por lado',{t:'Salta, aterriza y quédate quieto 2 s.'}), TOB_TALON1],
    casaFrec:'3 días por semana durante 8 semanas, hasta 30 min (puede ser tu calentamiento)', casaEv:['t_hupperets09','t_doherty17','t_smith21'],
    ev:['t_smith21','t_hupperets09','t_doherty17','t_martin21'] })
]};
STAGES['tob-agudo'] = ['early','mid','mid','late'];

P['tob-cronica'] = {label:'Inestabilidad crónica de tobillo', weeks:[0,4,8], phases:[
  lph('Fase 1 · Control sensoriomotor y fuerza', '0–4 semanas', 'Atacar los déficits típicos de la inestabilidad crónica: equilibrio, fuerza de eversores y de cadera, y dorsiflexión.', {
    next:['t_dol3','t_uni','t_df','t_talon'], nextLabel:'Para pasar a control dinámico',
    act:[TOB_DF, X('Movilización de dorsiflexión con banda','2 × 10',{t:'Banda por delante del tobillo tirando hacia atrás.'})],
    neuro:[TOB_UNI_OC, TOB_ESTRELLA],
    central:[TOB_EVER, TOB_TALON1, TOB_SOLEO, X('Abducción de cadera con banda','3 × 12–15',{rpe:'7',t:'La cadera débil acompaña a la inestabilidad del tobillo.'}), X('Sentadilla','3 × 8',{rpe:'7'}), X('Peso muerto rumano','3 × 8',{rpe:'7'})],
    casa:[TOB_DF, TOB_UNI_OC, TOB_ESTRELLA, TOB_EVER, TOB_TALON1, X('Abducción de cadera de pie con banda','2 × 15 por lado')],
    casaFrec:'4–5 días por semana, 20 min', casaEv:['t_kosik17','t_hertel19','t_martin21'],
    ev:['t_kosik17','t_hertel19','t_gribble14'] }),
  lph('Fase 2 · Control dinámico y potencia', '4–8 semanas', 'Perturbaciones, superficies inestables y saltos con aterrizaje controlado, con fuerza pesada del tríceps sural.', {
    next:['t_ybal','t_hop','t_talon','t_cait'], nextLabel:'Para pasar a retorno y mantenimiento',
    act:[TOB_DF, TOB_POGO],
    neuro:[TOB_UNI_INEST, TOB_LINEA, X('Saltos laterales en un pie con estabilización','3 × 6 por lado',{t:'Aterriza y quédate quieto 2 s.'})],
    central:[X('Elevación de talón en un pie con carga','4 × 8 por lado',{rpe:'8'}), X('Pasos laterales con banda en los tobillos','3 × 10 por lado',{rpe:'7'}), X('Sentadilla búlgara','3 × 8 por lado',{rpe:'8'}), X('Peso muerto rumano en un pie','3 × 8 por lado',{rpe:'8'}), X('Hip thrust','3 × 8–10',{rpe:'8'})],
    casa:[TOB_UNI_INEST, X('Apoyo en un pie lanzando y atrapando un balón','3 × 30 s por lado'), TOB_POGO, TOB_LINEA, X('Elevación de talón en un pie con mochila','3 × 10 por lado',{rpe:'8'}), TOB_EVER],
    casaFrec:'3–4 días por semana, 20–30 min', casaEv:['t_kosik17','t_hupperets09'],
    ev:['t_kosik17','t_martin21','t_hupperets09'] }),
  lph('Fase 3 · Retorno y mantenimiento', '8 semanas o más', 'Gestos del deporte, cambios de dirección y un programa de mantenimiento que se queda para siempre. Soporte externo en el deporte si sigue habiendo episodios.', {
    next:['t_hop','t_cait','t_sin','t_paass'], nextLabel:'Criterios de alta',
    act:[TOB_DF, TOB_POGO],
    neuro:[X('Saltos en un pie en el sitio','3 × 10 por lado'), X('Cambios de dirección en zigzag','4 × 1',{t:'Planeados primero, luego reactivos.'})],
    central:[X('Elevación de talón en un pie pesada','4 × 6–8 por lado',{rpe:'8'}), X('Sentadilla','4 × 5',{rpe:'8'}), X('Step up a cajón','3 × 8 por lado',{rpe:'8'}), X('Pallof press','3 × 10 por lado',{rpe:'7'})],
    casa:[TOB_UNI_OC, X('Apoyo en un pie con el gesto del deporte','3 × 30 s por lado'), TOB_UNI_INEST, X('Saltos en un pie con estabilización','3 × 6 por lado'), TOB_TALON1],
    casaFrec:'2–3 días por semana como calentamiento (mantenimiento)', casaEv:['t_hupperets09','t_doherty17'],
    ev:['t_smith21','t_doherty17','t_hupperets09'] })
]};
STAGES['tob-cronica'] = ['mid','mid','late'];

/* ---------- Integración ---------- */
MODULOS.tobillo = 'Rehabilitación · Tobillo';
const TOB_C = {agudo:'Esguince lateral de tobillo', cronica:'Inestabilidad crónica de tobillo'};
const tobLadoTxt = s => (s.tobLado || 'der') === 'izq' ? 'izquierdo' : 'derecho';
const TOB_REGLA = 'Dolor del tobillo hasta 3/10 durante el ejercicio y al día siguiente igual o mejor (también la hinchazón): vas bien. Entre 4 y 5: mantén la carga. Más de 5, más hinchado al día siguiente o si el tobillo "se te va": baja la carga y avísale a tu fisioterapeuta.';
const _pkeyTob = pkey;
pkey = function(s){ return modOf(s)==='tobillo' ? 'tob-'+(TOB_C[s.tobCond] ? s.tobCond : 'agudo') : _pkeyTob(s); };
const _suggestedTob = suggested;
suggested = function(s){
  if(modOf(s)!=='tobillo') return _suggestedTob(s);
  const P0=P[pkey(s)]; let w=num(s.tobSem)||0;
  if(s.tobCond!=='cronica' && s.tobGrado==='3') w = w*0.6;   // grado III: tiempos más largos
  let i=0; P0.weeks.forEach((t,k)=>{ if(w>=t) i=k; });
  if(s.tobCond!=='cronica' && !s.tobRF) i=0;                 // sin descartar fractura no se progresa
  return Math.min(i, P0.phases.length-1);
};
const _subLabelTob = subLabel;
subLabel = function(s, P0){ return modOf(s)==='tobillo' ? `${P[pkey(s)].label}${s.tobCond!=='cronica'&&s.tobGrado?` grado ${'I'.repeat(+s.tobGrado)}`:''} (${tobLadoTxt(s)})` : _subLabelTob(s, P0); };
const _planKeyTob = planKey;
planKey = function(s){ const k=_planKeyTob(s); return modOf(s)==='tobillo' ? k+`|tob:${s.tobLado||'der'}` : k; };

function genWeekTob(s){
  const i=phaseIdx(s), ph=P[pkey(s)].phases[i], n=nDias(s);
  return Array.from({length:n}, (_, d)=>{
    const rot = (arr, k) => arr.length<=k ? arr : arr.map((_,j)=>arr[(j+d)%arr.length]).slice(0,k);
    const B = {act:ph.act.map(it=>toRow(it)), neuro:rot(ph.neuro,3).map(it=>toRow(it)), central:rot(ph.central, n>=4?4:5).map(it=>toRow(it))};
    const segs = SEG_ORDER.map(t=>({type:t, sub:'', fmt:{t:'series'}, rows:B[t].map(r=>Object.assign(r,{lado:''}))}));
    levelAdj(segs[2].rows, s);
    return {name:`Día ${d+1}`, segs};
  });
}
const _genWeekTob = genWeek;
genWeek = function(s){ return modOf(s)==='tobillo' ? genWeekTob(s) : _genWeekTob(s); };

function tobLight(s){
  const d=num(s.tobDolor), e=num(s.tobEpis);
  if(d==null && !s.tobResp && e==null) return null;
  if((d!=null && d>5) || s.tobResp==='peor' || (e!=null && e>=2)) return {c:'r', t:'Reducir carga', p:'Dolor > 5/10, más dolor o hinchazón a las 24 h, o el tobillo "se le fue" dos veces o más esta semana: baja 1–2 puntos de RPE o 20–30 % del volumen, quita los saltos y usa soporte externo.'};
  if((d!=null && d>=4) || (e!=null && e>=1)) return {c:'y', t:'Mantener carga', p:'Dolor 4–5/10 o un episodio de inestabilidad: repite la carga y no avances a saltos en un pie esta semana.'};
  return {c:'g', t:'Progresar carga', p:'Dolor ≤ 3/10 y vuelve a basal a las 24 h: sube peso 2,5–5 % o 1–2 repeticiones, y avanza un escalón en el equilibrio (ojos cerrados, superficie blanda, perturbación).'};
}
function tobPlanView(){
  const s=st, P0=P[pkey(s)], i=phaseIdx(s), ph=P0.phases[i];
  const {days, custom} = viewWeek(s), nd=days.length, wl=tobLight(s), cron = s.tobCond==='cronica';
  const mods=[];
  if(!cron && !s.tobRF) mods.push(`<div class="mod warnmod"><b>Fractura sin descartar.</b> Aplica las reglas de Ottawa: dolor en el borde posterior o la punta de cualquiera de los maléolos, en la base del 5.º metatarsiano o en el navicular, o no poder dar 4 pasos al momento y en la consulta, piden radiografía. Descarta también la sindesmosis (esguince alto: dolor por encima del tobillo, prueba de compresión o de rotación externa positiva), que tarda más y se maneja distinto. Mientras no esté descartado, el plan queda en fase 1. ${refList(['t_bachmann03','t_vuurberg18'])}</div>`);
  if(!cron && s.tobGrado==='3') mods.push(`<div class="mod"><b>Grado III.</b> Los tiempos de fase se alargan (las semanas cuentan un 40 % menos). Ortesis semirrígida varias semanas; la cirugía solo se considera si persiste la inestabilidad tras una rehabilitación bien hecha. ${refList(['t_vuurberg18'])}</div>`);
  if(cron) mods.push(`<div class="mod"><b>Inestabilidad crónica.</b> No es solo un ligamento laxo: hay déficits de equilibrio, fuerza, movilidad y de confianza. Mide con CAIT (por debajo de 24 = inestable), Y-balance y saltos contra el lado sano. ${refList(['t_hertel19','t_gribble14','t_kosik17'])}</div>`);
  if(ph.avoid) mods.push(`<div class="mod"><b>Evitar en esta fase.</b> ${esc(ph.avoid)}</div>`);
  mods.push(`<div class="mod"><b>Ambas piernas.</b> Todo lo unilateral se hace con las dos piernas: la sana marca la meta y también se entrena. Si la lesionada molesta, misma técnica con menos carga o menos rango.</div>`);
  const overview = `<div class="tbl"><table class="data"><thead><tr><th>Día</th><th>Activación</th><th>Neuro</th><th>Central</th></tr></thead><tbody>
    ${days.map(d=>{ const g=t=>d.segs.find(x=>x.type===t); return `<tr><td><b>${esc(d.name)}</b></td><td>${g('act')?.rows.length||0}</td><td>${g('neuro')?.rows.length||0}</td><td>${g('central')?.rows.length||0}</td></tr>`; }).join('')}
    </tbody></table></div><p class="small" style="margin:8px 0 0">Reparto sugerido: ${nd===4?'lunes, martes, jueves y viernes':nd===3?'lunes, miércoles y viernes':'lunes y jueves'}. Además: trabajo en casa (${esc(ph.casaFrec||'')}), en la sección En casa.</p>`;
  return `
  <section class="card"><div class="status">
    ${wl?`<div class="light ${wl.c}"><span class="dot"></span><div><b>${esc(wl.t)}</b><p>${esc(wl.p)}</p><p class="small" style="margin:4px 0 0">Según el estado clínico de hoy.</p></div></div>`:'<div class="light y"><span class="dot"></span><div><b>Sin estado clínico</b><p>Registra dolor, respuesta a 24 h y episodios de inestabilidad en la ficha para que el semáforo decida la carga.</p></div></div>'}
    <div><h3 class="sec">${esc(ph.nextLabel)}</h3>${critList(ph.next, s)}
      ${refList(ph.ev)}</div>
  </div></section>
  ${mods.length?`<section class="card"><h3 class="sec">Consideraciones de este caso</h3><div class="mods" style="margin:0">${mods.join('')}</div></section>`:''}
  <section class="card"><h3 class="sec">Semana tipo</h3>${overview}
    <div class="legend" style="margin-top:10px">${[['Activación','var(--c-act)'],['Neuro','var(--c-neuro)'],['Bloque central','var(--c-central)']].map(([l,c])=>`<span><i class="sw" style="background:${c}"></i>${l}</span>`).join('')}</div></section>
  ${custom?`<div class="edited"><span><b>Plan modificado por ti</b> para esta fase y ${nd} días.</span><button id="bReset">Restablecer plan base</button></div>`:''}
  ${days.map((d,di)=>dayHTML(d,di)).join('')}
  <section class="card"><h3 class="sec">Fundamento del plan</h3><div class="mods">
    <div class="mod"><b>Tratamiento funcional, no inmovilización.</b> Apoyo temprano con ortesis semirrígida o vendaje y ejercicio desde la primera semana mejoran la función más rápido que el reposo. ${refList(['t_vuurberg18','t_bleakley10','t_dubois20'])}</div>
    <div class="mod"><b>Equilibrio, fuerza y movilidad.</b> El ejercicio progresivo es la base de las guías y reduce las recaídas. ${refList(['t_martin21','t_doherty17'])}</div>
    <div class="mod"><b>El trabajo en casa funciona.</b> 8 semanas de propiocepción en casa, 3 veces por semana, bajaron un tercio las recaídas; el reto es que lo hagan. ${refList(['t_hupperets09'])}</div>
    <div class="mod"><b>Retorno por criterios.</b> Dolor, tobillo (movilidad y fuerza), confianza del atleta, control sensoriomotor y rendimiento en su deporte. ${refList(['t_smith21'])}</div>
    <div class="mod"><b>Inestabilidad crónica.</b> Déficits mecánicos, sensoriomotores y de percepción; el equilibrio y la rehabilitación multimodal mejoran la función. ${refList(['t_hertel19','t_kosik17','t_gribble14'])}</div>
  </div></section>
  ${allRefs()}`;
}
const _planViewTob = planView;
planView = function(){ return modOf(st)==='tobillo' ? tobPlanView() : _planViewTob(); };

const _rehabInfoTob = rehabInfo;
rehabInfo = function(s){ return modOf(s)==='tobillo' ? {cond:'tob', l:P[pkey(s)].label, zona:'tobillo', lado:tobLadoTxt(s), irr:'mod', regla:TOB_REGLA} : _rehabInfoTob(s); };

const _setModuloTob = setModulo;
setModulo = function(m){
  if(m==='tobillo'){ if(modOf(st)==='tobillo') return; st.modulo='tobillo'; st.fase='auto'; if(!st.tobCond) st.tobCond='agudo'; if(!st.tobLado) st.tobLado='der'; if(!st.tobGrado) st.tobGrado='2'; if(!st.nivel) st.nivel='int'; editMode=false; fillForm(); render(); markDirty(); return; }
  _setModuloTob(m);
};
$('#form').addEventListener('input', e=>{
  const k=e.target.dataset.k;
  if(['tobCond','tobSem','tobGrado','tobRF'].includes(k)) { st.fase='auto'; syncVisibility(); }
});

