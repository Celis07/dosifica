/* ===================== REHAB · LUMBAR =====================
   Cinco condiciones con fases por criterios, ejercicios por fase y evidencia.
   Se integra como región dentro de Rehab (módulo 'lumbar'): mismo plan semanal,
   registro de sesiones, modo en vivo, portal y exportación que el resto. */

/* ---------- Referencias (verificadas oct 2026) ---------- */
Object.assign(R, {
  l_george21:{l:'A',c:'George SZ, Fritz JM, Silfies SP, et al. Interventions for the management of acute and chronic low back pain: revision 2021. J Orthop Sports Phys Ther. 2021;51(11):CPG1-CPG60. doi:10.2519/jospt.2021.0304.',k:'Guía de práctica clínica de fisioterapia: el ejercicio (fuerza, resistencia, control motor, Pilates, yoga) y la educación son los pilares en dolor agudo y crónico; la terapia manual es un complemento, no el tratamiento principal.'},
  l_who23:{l:'A',c:'World Health Organization. WHO guideline for non-surgical management of chronic primary low back pain in adults in primary and community care settings. Geneva: WHO; 2023.',k:'Recomienda programas de ejercicio, educación para el autocuidado, terapia manual, masaje y terapias psicológicas. Desaconseja fajas o soportes lumbares, tracción y opioides para la mayoría de las personas.'},
  l_hayden21:{l:'A',c:'Hayden JA, Ellis J, Ogilvie R, Malmivaara A, van Tulder MW. Exercise therapy for chronic low back pain. Cochrane Database Syst Rev. 2021;9:CD009790. doi:10.1002/14651858.CD009790.pub2.',k:'El ejercicio reduce el dolor ~15/100 y mejora la función ~7/100 frente a no tratar o tratamiento habitual (certeza moderada), también frente a placebo.'},
  l_owen20:{l:'A',c:'Owen PJ, Miller CT, Mundell NL, et al. Which specific modes of exercise training are most effective for treating low back pain? Network meta-analysis. Br J Sports Med. 2020;54(21):1279-1287.',k:'Pilates fue el mejor para el dolor; fuerza y control motor, para la función; fuerza y aeróbico, para la salud mental. Estiramientos y McKenzie no superaron al control. Calidad de evidencia baja.'},
  l_fernandez22:{l:'A',c:'Fernández-Rodríguez R, Álvarez-Bueno C, Cavero-Redondo I, et al. Best exercise options for reducing pain and disability in adults with chronic low back pain: Pilates, strength, core-based, and mind-body. A network meta-analysis. J Orthop Sports Phys Ther. 2022;52(8):505-521.',k:'Pilates, fuerza y ejercicio de core fueron los más eficaces para la discapacidad; estirar solo no redujo el dolor.'},
  l_kent23:{l:'B',c:'Kent P, Haines T, O\'Sullivan P, et al. Cognitive functional therapy with or without movement sensor biofeedback versus usual care for chronic, disabling low back pain (RESTORE): a randomised, controlled, three-arm, parallel group, phase 3, clinical trial. Lancet. 2023;401(10391):1866-1877.',k:'Terapia funcional cognitiva: hasta 7 sesiones en 12 semanas y un refuerzo a las 26. Redujo la discapacidad 4,6 puntos (Roland-Morris) frente a la atención habitual, con efecto sostenido al año.'},
  l_pocovi24:{l:'B',c:'Pocovi NC, Lin CWC, French SD, et al. Effectiveness and cost-effectiveness of an individualised, progressive walking and education intervention for the prevention of low back pain recurrence in Australia (WalkBack): a randomised controlled trial. Lancet. 2024;404(10448):134-144.',k:'Caminata progresiva individualizada + educación (6 sesiones en 6 meses): mediana sin recaída de 208 días frente a 112 (HR 0,72).'},
  l_hill11:{l:'B',c:'Hill JC, Whitehurst DGT, Lewis M, et al. Comparison of stratified primary care management for low back pain with current best practice (STarT Back): a randomised controlled trial. Lancet. 2011;378(9802):1560-1571.',k:'Estratificar por riesgo (STarT Back) y ajustar la intensidad del tratamiento mejora la discapacidad y reduce costos: bajo riesgo = poco tratamiento; alto riesgo = enfoque psicológicamente informado.'},
  l_lam18:{l:'A',c:'Lam OT, Strenger DM, Chan-Fee M, Pham PT, Preuss RA, Robbins SM. Effectiveness of the McKenzie method of mechanical diagnosis and therapy for treating low back pain: literature review with meta-analysis. J Orthop Sports Phys Ther. 2018;48(6):476-490.',k:'En dolor agudo no supera a otras intervenciones; en crónico mejora la discapacidad más que el ejercicio genérico.'},
  l_long04:{l:'B',c:'Long A, Donelson R, Fung T. Does it matter which exercise? A randomized control trial of exercise for low back pain. Spine. 2004;29(23):2593-2602.',k:'Con preferencia direccional, los ejercicios en esa dirección superaron a los ejercicios en la dirección opuesta y a los genéricos.'},
  l_finucane20:{l:'C',c:'Finucane LM, Downie A, Mercer C, et al. International framework for red flags for potential serious spinal pathologies. J Orthop Sports Phys Ther. 2020;50(7):350-372. doi:10.2519/jospt.2020.9971.',k:'Marco internacional para sospechar patología grave: cauda equina, fractura, cáncer, infección. Ninguna bandera aislada confirma; se interpretan en conjunto.'},
  l_oosterhuis14:{l:'A',c:'Oosterhuis T, Costa LOP, Maher CG, de Vet HCW, van Tulder MW, Ostelo RWJG. Rehabilitation after lumbar disc surgery. Cochrane Database Syst Rev. 2014;(3):CD003007.',k:'Ejercicio desde las 4–6 semanas tras la discectomía: menos dolor y discapacidad a corto plazo; el de mayor intensidad rinde algo más. No aumentó las reintervenciones.'},
  l_carragee99:{l:'C',c:'Carragee EJ, Han MY, Yang B, Kim DH, Kraemer H, Billys J. Activity restrictions after posterior lumbar discectomy: a prospective study of outcomes in 152 cases with no postoperative restrictions. Spine. 1999;24(22):2346-2351.',k:'Sin restricciones de actividad tras la discectomía: retorno al trabajo rápido y tasa de recidiva baja.'},
  l_panteliadis16:{l:'C',c:'Panteliadis P, Nagra NS, Edwards KL, Behrbalk E, Boszczyk B. Athletic population with spondylolysis: review of outcomes following surgical repair or conservative management. Global Spine J. 2016;6(6):615-625.',k:'Manejo conservador (pausa del deporte, fisioterapia, con o sin corsé): retorno medio ~3,7 meses; parar ≥ 3 meses dio los mejores resultados. Evidencia de baja calidad.'},
  l_dove22:{l:'B',c:'Dove L, Jones G, Kelsey LA, Cairns MC, Schmid AB. How effective are physiotherapy interventions in treating people with sciatica? A systematic review and meta-analysis. Eur Spine J. 2022. doi:10.1007/s00586-022-07356-y.',k:'En ciática la fisioterapia (casi siempre con ejercicio) mostró un beneficio pequeño en dolor a largo plazo frente a intervención mínima; la evidencia es inconsistente y de bajo nivel.'},
  l_aasa15:{l:'B',c:'Aasa B, Berglund L, Michaelson P, Aasa U. Individualized low-load motor control exercises and education versus a high-load lifting exercise and education to improve activity, pain intensity, and physical performance in patients with low back pain: a randomized controlled trial. J Orthop Sports Phys Ther. 2015;45(2):77-85.',k:'El peso muerto progresivo y el control motor de baja carga redujeron el dolor por igual; el control motor mejoró más la actividad. Ambos son opciones válidas.'},
  l_wood19:{l:'A',c:'Wood L, Hendrick PA. A systematic review and meta-analysis of pain neuroscience education for chronic low back pain: short- and long-term outcomes of pain and disability. Eur J Pain. 2019;23(2):234-249.',k:'La educación en neurociencia del dolor rinde más combinada con ejercicio que sola.'},
  l_foster18:{l:'C',c:'Foster NE, Anema JR, Cherkin D, et al. Prevention and treatment of low back pain: evidence, challenges, and promising directions. Lancet. 2018;391(10137):2368-2383.',k:'Primera línea: educación, tranquilizar, mantenerse activo y ejercicio. Evitar imágenes, reposo y opioides de rutina.'},
  l_lin20:{l:'C',c:'Lin I, Wiles L, Waller R, et al. What does best practice care for musculoskeletal pain look like? Eleven consistent recommendations from high-quality clinical practice guidelines: systematic review. Br J Sports Med. 2020;54(2):79-86.',k:'Atención centrada en la persona, descartar patología grave, educar, actividad física y ejercicio, y terapia manual solo como complemento.'},
  l_mcgill99:{l:'C',c:'McGill SM, Childs A, Liebenson C. Endurance times for low back stabilization exercises: clinical targets for testing and training from a normal database. Arch Phys Med Rehabil. 1999;80(8):941-944.',k:'Valores de referencia de resistencia del tronco (extensores, flexores, puentes laterales) y razones entre ellos como metas clínicas.'},
  l_ostelo08:{l:'C',c:'Ostelo RWJG, Deyo RA, Stratford P, et al. Interpreting change scores for pain and functional status in low back pain: towards international consensus regarding minimal important change. Spine. 2008;33(1):90-94.',k:'Cambio mínimo importante: ~30 % de mejora en dolor y en función (Oswestry, Roland-Morris).'}
});

/* ---------- Criterios ---------- */
Object.assign(CR, {
  l_rf:{t:'Banderas rojas descartadas', f:s=> !!s.lumRF},
  l_dol3:{t:'Dolor lumbar ≤ 3/10 en las actividades del día y vuelta a basal a las 24 h', f:s=> num(s.lumDolor)==null?null: num(s.lumDolor)<=3 && s.lumResp!=='peor'},
  l_dol2:{t:'Dolor lumbar ≤ 2/10 y vuelta a basal a las 24 h', f:s=> num(s.lumDolor)==null?null: num(s.lumDolor)<=2 && s.lumResp!=='peor'},
  l_pierna:{t:'Dolor en la pierna ≤ 2/10 o centralizado', f:s=> num(s.lumPierna)==null?null: num(s.lumPierna)<=2},
  l_pierna0:{t:'Sin dolor en la pierna', f:s=> num(s.lumPierna)==null?null: num(s.lumPierna)===0},
  l_odi30:{t:'Oswestry (ODI) ≤ 30 %', f:s=> num(s.lumOdi)==null?null: num(s.lumOdi)<=30},
  l_odi20:{t:'Oswestry (ODI) ≤ 20 %', f:s=> num(s.lumOdi)==null?null: num(s.lumOdi)<=20},
  l_odi10:{t:'Oswestry (ODI) ≤ 10 %', f:s=> num(s.lumOdi)==null?null: num(s.lumOdi)<=10},
  l_neuro:{t:'Sin déficit neurológico progresivo (fuerza, sensibilidad, reflejos estables o mejorando)', m:1},
  l_slr:{t:'Elevación de pierna recta negativa o claramente mejor que al inicio', m:1},
  l_walk:{t:'Camina 30 min seguidos sin aumento de síntomas', m:1},
  l_hinge:{t:'Bisagra de cadera con carga ligera (≈ 25 % del peso corporal) con dolor ≤ 3/10', m:1},
  l_fear:{t:'Sin miedo limitante a moverse o a cargar (lo refiere o TSK-11 bajo)', m:1},
  l_sor:{t:'Resistencia de extensores (Biering-Sørensen) ≥ 120 s', m:1},
  l_side:{t:'Puentes laterales simétricos (diferencia ≤ 10 %)', m:1},
  l_stork:{t:'Extensión unipodal (prueba de la cigüeña) sin dolor en ambos lados', m:1},
  l_surg:{t:'Visto bueno del cirujano para cargar y hacer impacto', m:1},
  l_sport:{t:'Tolera el entrenamiento técnico completo sin aumento de síntomas a las 24 h', m:1},
  l_auto:{t:'Sabe qué hacer ante una recaída y mantiene su programa por su cuenta', m:1}
});

/* ---------- Protocolos ---------- */
const LW = (d, t) => X('Caminata', d, {t: t||'Ritmo en que puedas hablar. Sube 5–10 min por semana si los síntomas no empeoran a las 24 h.'});
const LUM_C = {agudo:'Dolor lumbar agudo o subagudo (< 12 semanas)', cronico:'Dolor lumbar crónico (> 12 semanas)', radic:'Dolor lumbar con radiculopatía (ciática)', postop:'Postoperatorio de discectomía', espond:'Espondilólisis en deportista'};
const lph = (name, when, goal, o) => Object.assign({name, when, goal, next:[], nextLabel:'', avoid:'', act:[], neuro:[], central:[], home:null, ev:[], dz:{}, sano:null, tools:[], blocks:[]}, o);

P['lum-agudo'] = {label:LUM_C.agudo, weeks:[0,2,6], phases:[
  lph('Fase 1 · Calmar y moverse', '0–2 semanas', 'Tranquilizar, explicar que el dolor no es daño y seguir activo. Moverse en el rango que no empeore los síntomas.', {
    next:['l_rf','l_dol3','l_walk'], nextLabel:'Para pasar a recuperar capacidad',
    avoid:'Reposo en cama, faja lumbar y cargas pesadas con la columna flexionada mientras el dolor esté irritable.',
    act:[X('Respiración diafragmática en supino con rodillas flexionadas','2 × 6–8 respiraciones',{t:'Exhala largo. Baja la tensión antes de moverte.'}),
         X('Ejercicio de preferencia direccional','10 reps cada 2–3 h',{t:'Si un movimiento centraliza o alivia (extensión en prono o flexión en supino), ese es el ejercicio. Si el dolor baja a la pierna, detente.'}),
         X('Gato-camello','2 × 10',{t:'Rango sin dolor; despacio.'})],
    neuro:[X('Bird dog','2 × 6 por lado · 5 s',{rpe:'5',t:'Columna quieta; alarga, no levantes alto.'}), X('Dead bug','2 × 6 por lado',{rpe:'5',t:'Lumbar apoyada; exhala al extender.'})],
    central:[X('Puente de glúteo','3 × 10',{rpe:'5–6'}), X('Sentadilla a la silla','3 × 8–10',{rpe:'5–6',t:'Sin dolor > 3/10.'}), X('Remo con banda de pie','3 × 12',{rpe:'6'}), X('Plancha lateral con rodillas apoyadas','3 × 15–20 s por lado',{rpe:'6'})],
    home:LW('10–20 min al día, en 1–3 tramos'), ev:['l_foster18','l_george21','l_lin20','l_long04'] }),
  lph('Fase 2 · Recuperar capacidad', '2–6 semanas', 'Volver a cargar la espalda y la cadera de forma progresiva y recuperar la confianza para agacharse y levantar.', {
    next:['l_dol2','l_hinge','l_fear'], nextLabel:'Para pasar a carga completa y prevención',
    act:[X('Movilidad de cadera y columna torácica','1 × 5 min'), X('Bird dog','2 × 8 por lado · 5 s',{rpe:'6'})],
    neuro:[X('Plancha lateral','3 × 20–30 s por lado',{rpe:'7'}), X('Pallof press','3 × 10 por lado',{rpe:'7'})],
    central:[X('Peso muerto rumano con kettlebell','3 × 8–10',{rpe:'6–7',t:'Bisagra de cadera; espalda neutra pero sin rigidez. Progresa la carga cada semana si el dolor ≤ 3/10.'}), X('Sentadilla goblet','3 × 8–10',{rpe:'7'}), X('Hip thrust','3 × 10',{rpe:'7'}), X('Remo con mancuerna','3 × 10',{rpe:'7'}), X('Caminata del granjero','3 × 20–30 m',{rpe:'7'})],
    home:LW('20–30 min, 5 días por semana'), ev:['l_hayden21','l_owen20','l_george21'] }),
  lph('Fase 3 · Carga completa y prevenir recaídas', '6–12 semanas', 'Fuerza pesada como cualquier persona sana y un hábito de caminata para reducir las recaídas.', {
    next:['l_dol2','l_odi10','l_auto'], nextLabel:'Criterios de alta',
    act:[X('Movilidad general','1 × 5 min'), X('Plancha lateral','2 × 30–45 s por lado',{rpe:'7'})],
    neuro:[X('Kettlebell swing','3 × 10',{rpe:'7',t:'Cadera explosiva; solo si la bisagra es sólida.'}), X('Lanzamiento de balón medicinal rotacional','3 × 5 por lado',{t:'Rotación desde la cadera.'})],
    central:[X('Peso muerto con barra hexagonal','4 × 5–6',{rpe:'7–8',t:'Progresión de carga semanal. El objetivo es dejar de tratar la espalda como frágil.'}), X('Sentadilla','3 × 6–8',{rpe:'7–8'}), X('Zancada atrás','3 × 8 por lado',{rpe:'7'}), X('Press militar con mancuernas','3 × 8',{rpe:'7'}), X('Jalón al pecho','3 × 8–10',{rpe:'7'})],
    home:LW('30 min, 5 días por semana','Hábito para prevenir recaídas (WalkBack).'), ev:['l_pocovi24','l_aasa15','l_owen20'] })
]};

P['lum-cronico'] = {label:LUM_C.cronico, phases:[
  lph('Fase 1 · Entender y exponerse', '1–4 semanas', 'Cambiar la idea de que la espalda está dañada, reducir la protección (rigidez, evitar flexionar) y exponerse de forma gradual a los movimientos que asustan.', {
    next:['l_rf','l_fear','l_walk'], nextLabel:'Para pasar a fuerza progresiva',
    avoid:'Mensajes de fragilidad ("disco gastado", "postura mala"), dependencia de pasivos y evitar flexionar la espalda.',
    act:[X('Respiración y relajación de la musculatura del tronco','2 × 6–8 respiraciones',{t:'Suelta el abdomen y los glúteos; la rigidez protectora mantiene el dolor.'}), X('Flexión de columna sentado, relajada','2 × 10',{t:'Exposición gradual: inclinarse hacia adelante sin bracear el tronco.'}), X('Gato-camello','2 × 10')],
    neuro:[X('Dead bug','3 × 8 por lado',{rpe:'6'}), X('Bird dog','3 × 8 por lado',{rpe:'6'})],
    central:[X('Peso muerto rumano con kettlebell ligera','3 × 10',{rpe:'6',t:'Exposición a levantar: espalda relajada, no rígida.'}), X('Sentadilla goblet','3 × 10',{rpe:'6'}), X('Hip thrust','3 × 10–12',{rpe:'6–7'}), X('Remo con banda o polea','3 × 12',{rpe:'6–7'})],
    home:LW('15–30 min al día o bicicleta','El aeróbico mejora dolor y ánimo; elige lo que disfrutes.'), ev:['l_kent23','l_wood19','l_who23'] }),
  lph('Fase 2 · Fuerza progresiva', '4–12 semanas', 'Construir fuerza y resistencia de todo el cuerpo con progresión semanal. La carga es la medicina.', {
    next:['l_dol3','l_odi20','l_sor'], nextLabel:'Para pasar a autonomía',
    act:[X('Movilidad de cadera y columna torácica','1 × 5 min'), X('Plancha lateral','3 × 20–40 s por lado',{rpe:'7'})],
    neuro:[X('Pallof press','3 × 10 por lado',{rpe:'7'}), X('Bird dog con resistencia','3 × 8 por lado',{rpe:'7'})],
    central:[X('Peso muerto con barra hexagonal','4 × 6–8',{rpe:'7–8',t:'Sube la carga 2,5–5 % cuando el dolor sea ≤ 3/10 y vuelva a basal en 24 h.'}), X('Sentadilla goblet o frontal','3 × 8',{rpe:'7–8'}), X('Hip thrust','3 × 8–10',{rpe:'8'}), X('Remo con mancuerna','3 × 8–10',{rpe:'8'}), X('Extensión de espalda en banco romano','3 × 10–12',{rpe:'7',t:'Rango completo, controlado.'})],
    home:LW('30 min, 5 días por semana'), ev:['l_owen20','l_fernandez22','l_hayden21','l_aasa15'] }),
  lph('Fase 3 · Autonomía', 'Desde las 12 semanas', 'Que la persona maneje sola su espalda: programa propio, plan para las recaídas y una sesión de refuerzo.', {
    next:['l_dol2','l_odi10','l_auto'], nextLabel:'Criterios de alta',
    act:[X('Movilidad general','1 × 5 min')],
    neuro:[X('Kettlebell swing','3 × 10',{rpe:'7'}), X('Lanzamiento de balón medicinal rotacional','3 × 5 por lado')],
    central:[X('Peso muerto con barra hexagonal','3 × 5',{rpe:'8'}), X('Sentadilla','3 × 6',{rpe:'8'}), X('Press banca con mancuernas','3 × 8',{rpe:'8'}), X('Dominadas o jalón','3 × 6–8',{rpe:'8'}), X('Caminata del granjero','3 × 30 m',{rpe:'8'})],
    home:LW('150 min por semana','Mínimo para la salud y para mantener la espalda.'), ev:['l_kent23','l_pocovi24','l_who23'] })
]};

P['lum-radic'] = {label:LUM_C.radic, weeks:[0,4,8], phases:[
  lph('Fase 1 · Proteger y centralizar', '0–4 semanas', 'Bajar el dolor de pierna: buscar la dirección que centraliza, mover el nervio sin tensarlo y seguir caminando.', {
    next:['l_rf','l_neuro','l_pierna'], nextLabel:'Para pasar a recuperar movimiento y fuerza',
    avoid:'Lo que haga bajar el dolor más a la pierna (periferalizar): sentarse mucho tiempo, flexión con carga, estiramientos de isquios a tensión.',
    act:[X('Ejercicio de preferencia direccional','10 reps cada 2–3 h',{t:'Casi siempre extensión en prono o de pie. Bueno si el dolor sube hacia la espalda (centraliza); detente si baja a la pierna.'}), X('Deslizamiento neural en sedestación (slider)','2 × 10',{t:'Extiende la rodilla mientras miras arriba y flexiona mientras miras abajo. Sin tensión ni dolor nuevo.'})],
    neuro:[X('Bird dog','2 × 6 por lado · 5 s',{rpe:'5'})],
    central:[X('Puente de glúteo','3 × 10',{rpe:'5–6'}), X('Sentadilla a la silla','3 × 8',{rpe:'5–6'}), X('Remo con banda de pie','3 × 12',{rpe:'6'})],
    home:LW('10–20 min, varias veces al día','Caminar suele aliviar; para si aumenta el dolor de pierna.'), ev:['l_long04','l_lam18','l_finucane20','l_george21'] }),
  lph('Fase 2 · Recuperar movimiento y fuerza', '4–8 semanas', 'Recuperar la flexión y la carga sin que el dolor vuelva a la pierna, y fortalecer cadera y tronco.', {
    next:['l_neuro','l_pierna0','l_slr','l_hinge'], nextLabel:'Para pasar a retorno a la actividad',
    act:[X('Ejercicio de preferencia direccional','2 × 10',{t:'Mantén 1–2 veces al día mientras ayude.'}), X('Deslizamiento neural en sedestación (slider)','2 × 10',{t:'Progresa a tensores suaves solo si no reproduce el dolor.'})],
    neuro:[X('Plancha lateral','3 × 20–30 s por lado',{rpe:'7'}), X('Pallof press','3 × 10 por lado',{rpe:'7'})],
    central:[X('Peso muerto rumano con kettlebell','3 × 8–10',{rpe:'6–7',t:'Detén la serie si aparece dolor en la pierna.'}), X('Sentadilla goblet','3 × 8–10',{rpe:'7'}), X('Hip thrust','3 × 10',{rpe:'7'}), X('Remo con mancuerna','3 × 10',{rpe:'7'})],
    home:LW('20–30 min, 5 días por semana'), ev:['l_dove22','l_george21','l_hayden21'] }),
  lph('Fase 3 · Retorno a la actividad', '8–12 semanas o más', 'Carga pesada y tareas del deporte o del trabajo sin síntomas en la pierna.', {
    next:['l_pierna0','l_dol2','l_sport'], nextLabel:'Criterios de alta o retorno deportivo',
    act:[X('Movilidad general','1 × 5 min')],
    neuro:[X('Kettlebell swing','3 × 10',{rpe:'7'}), X('Saltos bilaterales submáximos','3 × 6',{t:'Aterrizaje suave.'})],
    central:[X('Peso muerto con barra hexagonal','4 × 5–6',{rpe:'7–8'}), X('Sentadilla','3 × 6–8',{rpe:'7–8'}), X('Zancada atrás','3 × 8 por lado',{rpe:'7'}), X('Remo con barra','3 × 8',{rpe:'7–8'})],
    home:LW('30 min, 5 días por semana'), ev:['l_hayden21','l_aasa15'] })
]};

P['lum-postop'] = {label:LUM_C.postop, weeks:[0,4,12], phases:[
  lph('Fase 1 · Protección relativa', '0–4 semanas', 'Caminar desde el primer día, moverse sin miedo y cuidar la herida. Sin cargas pesadas mientras cicatriza.', {
    next:['l_rf','l_neuro','l_walk'], nextLabel:'Para pasar a rehabilitación activa',
    avoid:'Cargas pesadas y flexión repetida con carga hasta las 4–6 semanas, según indique el cirujano. El reposo prolongado no ayuda.',
    act:[X('Respiración diafragmática','2 × 8 respiraciones'), X('Deslizamiento neural en sedestación (slider)','2 × 10',{t:'Suave; ayuda a la movilidad del nervio tras la cirugía.'})],
    neuro:[X('Activación de transverso abdominal en supino','3 × 10 · 5 s',{rpe:'4'})],
    central:[X('Puente de glúteo','2 × 10',{rpe:'5'}), X('Sentadilla a la silla','2 × 8–10',{rpe:'5'}), X('Remo con banda sentado','2 × 12',{rpe:'5'})],
    home:LW('Desde el día 1: 5–10 min varias veces al día, hasta 30 min'), ev:['l_carragee99','l_oosterhuis14'] }),
  lph('Fase 2 · Rehabilitación activa', '4–12 semanas', 'Ejercicio de intensidad moderada a alta: es cuando la evidencia muestra más beneficio.', {
    next:['l_pierna','l_dol3','l_hinge'], nextLabel:'Para pasar a retorno deportivo',
    act:[X('Movilidad de cadera y columna torácica','1 × 5 min'), X('Bird dog','2 × 8 por lado',{rpe:'6'})],
    neuro:[X('Plancha lateral','3 × 20–30 s por lado',{rpe:'7'}), X('Pallof press','3 × 10 por lado',{rpe:'7'})],
    central:[X('Peso muerto rumano con kettlebell','3 × 8–10',{rpe:'7'}), X('Sentadilla goblet','3 × 8–10',{rpe:'7'}), X('Hip thrust','3 × 10',{rpe:'7'}), X('Remo con mancuerna','3 × 10',{rpe:'7'}), X('Caminata del granjero','3 × 20–30 m',{rpe:'7'})],
    home:LW('30 min, 5 días por semana'), ev:['l_oosterhuis14'] }),
  lph('Fase 3 · Retorno deportivo', 'Desde las 12 semanas (habitualmente 3–6 meses)', 'Fuerza pesada, potencia y gestos del deporte con progresión de volumen.', {
    next:['l_surg','l_sor','l_sport'], nextLabel:'Criterios de retorno deportivo',
    act:[X('Movilidad general','1 × 5 min')],
    neuro:[X('Kettlebell swing','3 × 10',{rpe:'7'}), X('Lanzamiento de balón medicinal rotacional','3 × 5 por lado'), X('Saltos bilaterales submáximos','3 × 6')],
    central:[X('Peso muerto con barra hexagonal','4 × 5',{rpe:'7–8'}), X('Sentadilla','3 × 6',{rpe:'7–8'}), X('Zancada atrás','3 × 8 por lado',{rpe:'7'}), X('Remo con barra','3 × 8',{rpe:'8'})],
    home:LW('30 min o su aeróbico habitual'), ev:['l_oosterhuis14','exp'] })
]};

P['lum-espond'] = {label:LUM_C.espond, weeks:[0,6,12], phases:[
  lph('Fase 1 · Pausa del deporte y control', '0–6 semanas', 'Quitar la extensión y el impacto que cargan la pars, mantener la condición física y entrenar el tronco en posición neutra.', {
    next:['l_rf','l_dol2'], nextLabel:'Para pasar a fuerza y control',
    avoid:'Extensión y rotación con carga, saltos, carrera y el deporte (incluida la extensión del aleteo en el agua). El corsé es opcional; no hay evidencia de que acelere la consolidación.',
    act:[X('Movilidad de cadera e isquiotibiales','1 × 5 min',{t:'La rigidez de isquios se asoció a peores resultados.'}), X('Respiración diafragmática','2 × 6–8 respiraciones')],
    neuro:[X('Dead bug','3 × 8 por lado',{rpe:'6'}), X('Bird dog','3 × 6 por lado · 5 s',{rpe:'6',t:'Sin arquear la zona lumbar.'})],
    central:[X('Puente de glúteo','3 × 12',{rpe:'6',t:'Sin hiperextender al final.'}), X('Plancha frontal','3 × 20–30 s',{rpe:'6'}), X('Plancha lateral','3 × 20 s por lado',{rpe:'6'}), X('Remo con banda de pie','3 × 12',{rpe:'6'}), X('Sentadilla goblet','3 × 10',{rpe:'6'})],
    home:X('Bicicleta estática','20–30 min, 3–5 días por semana',{t:'Aeróbico sin impacto ni extensión.'}), ev:['l_panteliadis16','exp'] }),
  lph('Fase 2 · Fuerza y control', '6–12 semanas', 'Progresar la carga en neutro y reintroducir la extensión de forma controlada cuando sea indolora.', {
    next:['l_dol2','l_stork','l_side'], nextLabel:'Para pasar al retorno deportivo',
    act:[X('Movilidad de cadera e isquiotibiales','1 × 5 min'), X('Extensión en prono controlada','2 × 10',{t:'Solo si es indolora; amplitud creciente.'})],
    neuro:[X('Pallof press','3 × 10 por lado',{rpe:'7'}), X('Plancha lateral','3 × 30 s por lado',{rpe:'7'})],
    central:[X('Peso muerto rumano con mancuernas','3 × 8–10',{rpe:'7'}), X('Sentadilla goblet','3 × 8–10',{rpe:'7'}), X('Zancada atrás','3 × 8 por lado',{rpe:'7'}), X('Remo con mancuerna','3 × 10',{rpe:'7'}), X('Hip thrust','3 × 10',{rpe:'7',t:'Ya con extensión de cadera completa, sin arquear la lumbar.'})],
    home:X('Bicicleta o trote suave','20–30 min',{t:'Trote solo si la cigüeña es indolora.'}), ev:['l_panteliadis16','l_mcgill99'] }),
  lph('Fase 3 · Retorno deportivo progresivo', 'Desde los ~3 meses', 'Extensión y rotación del deporte, pliometría y volumen creciente hasta el entrenamiento completo.', {
    next:['l_stork','l_sor','l_sport'], nextLabel:'Criterios de retorno deportivo',
    act:[X('Movilidad general','1 × 5 min')],
    neuro:[X('Lanzamiento de balón medicinal rotacional','3 × 5 por lado'), X('Saltos bilaterales submáximos','3 × 6'), X('Kettlebell swing','3 × 10',{rpe:'7'})],
    central:[X('Peso muerto con barra hexagonal','4 × 5–6',{rpe:'7–8'}), X('Sentadilla','3 × 6–8',{rpe:'7–8'}), X('Extensión de espalda en banco romano','3 × 10',{rpe:'7'}), X('Remo con barra','3 × 8',{rpe:'8'})],
    home:X('Gestos específicos del deporte','Volumen creciente semana a semana',{t:'Si la extensión vuelve a doler, baja un escalón.'}), ev:['l_panteliadis16','exp'] })
]};
Object.keys(LUM_C).forEach(k=>{ STAGES['lum-'+k] = P['lum-'+k].phases.map((_,i)=>['early','mid','late'][Math.min(i,2)]); });

/* ---------- Integración con el resto de la app ---------- */
MODULOS.lumbar = 'Rehabilitación · Lumbar';
const isRehab = s => ['rodilla','lumbar','hombro','tobillo'].includes(modOf(s));
const _pkeyBase = pkey;
pkey = function(s){ return modOf(s)==='lumbar' ? 'lum-'+(LUM_C[s.lumCond] ? s.lumCond : 'agudo') : _pkeyBase(s); };
const _suggestedBase = suggested;
suggested = function(s){
  if(modOf(s)!=='lumbar') return _suggestedBase(s);
  const P0=P[pkey(s)]; if(!P0.weeks) return 0;
  const w=num(s.lumSem)||0; let i=0; P0.weeks.forEach((t,k)=>{ if(w>=t) i=k; }); return Math.min(i, P0.phases.length-1);
};
const _subLabelBase = subLabel;
subLabel = function(s, P0){ return modOf(s)==='lumbar' ? P[pkey(s)].label : _subLabelBase(s, P0); };

function genWeekLum(s){
  const i=phaseIdx(s), ph=P[pkey(s)].phases[i], n=nDias(s);
  const dp = s.lumDP;
  return Array.from({length:n}, (_, d)=>{
    const act = ph.act.map(it=>{
      if(/preferencia direccional/i.test(it.n) && dp) return X(dp==='ext'?'Extensión en prono (press-up)':dp==='flex'?'Flexión de rodillas al pecho en supino':'Deslizamiento lateral de cadera contra la pared', it.d, {t:it.t});
      return it; });
    const rot = (arr, k) => arr.length<=k ? arr : arr.map((_,j)=>arr[(j+d)%arr.length]).slice(0,k);
    const B = {act:act.map(it=>toRow(it)), neuro:rot(ph.neuro,2).map(it=>toRow(it)), central:rot(ph.central, n>=4?4:5).map(it=>toRow(it))};
    if(ph.home && d===0) B.act.push(toRow(ph.home, {n:(ph.home.t?ph.home.t+' ':'')+'Todos los días, también los de descanso.'}));
    const segs = SEG_ORDER.map(t=>({type:t, sub:'', fmt:{t:'series'}, rows:B[t].map(r=>Object.assign(r,{lado:''}))}));
    levelAdj(segs[2].rows, s);
    return {name:`Día ${d+1}`, segs};
  });
}
const _genWeekBase = genWeek;
genWeek = function(s){ return modOf(s)==='lumbar' ? genWeekLum(s) : _genWeekBase(s); };

function lumLight(s){
  const d=num(s.lumDolor), p=num(s.lumPierna);
  if(d==null && p==null) return null;
  if((d!=null && d>5) || s.lumResp==='peor' || (p!=null && p>5)) return {c:'r', t:'Reducir carga', p:'Dolor > 5/10 o peor a las 24 h: baja 1–2 puntos de RPE o 20–30 % del volumen y quita lo que lleve el dolor a la pierna.'};
  if((d!=null && d>=4) || (p!=null && p>=3)) return {c:'y', t:'Mantener carga', p:'Dolor 4–5/10 o síntomas en la pierna: repite la carga; si el dolor baja más a la pierna en un ejercicio, cámbialo.'};
  return {c:'g', t:'Progresar carga', p:'Dolor ≤ 3/10 y vuelve a basal a las 24 h: sube peso 2,5–5 % si el RPE quedó bajo, o suma 1–2 repeticiones.'};
}
function lumPlanView(){
  const s=st, k=pkey(s), P0=P[k], i=phaseIdx(s), ph=P0.phases[i];
  const {days, custom} = viewWeek(s), nd=days.length, wl=lumLight(s);
  const mods=[];
  if(!s.lumRF) mods.push(`<div class="mod warnmod"><b>Banderas rojas sin confirmar.</b> Antes de cargar, descarta signos de cauda equina (anestesia en silla de montar, retención o incontinencia), déficit neurológico progresivo, fiebre, antecedente de cáncer, trauma importante o dolor nocturno que no cede con nada. Si aparecen, derivación médica. ${refList(['l_finucane20'])}</div>`);
  if(s.lumDP) mods.push(`<div class="mod"><b>Preferencia direccional: ${{ext:'extensión',flex:'flexión',lat:'desplazamiento lateral'}[s.lumDP]}.</b> Los ejercicios en la dirección que centraliza superan a los genéricos. Mantén esa dirección mientras centralice y deja de usarla cuando ya no haga falta. ${refList(['l_long04','l_lam18'])}</div>`);
  if(s.lumStart) mods.push(`<div class="mod"><b>STarT Back: riesgo ${{bajo:'bajo',medio:'medio',alto:'alto'}[s.lumStart]}.</b> ${s.lumStart==='bajo'?'Poca intervención: educación, tranquilizar y actividad; pocas sesiones.':s.lumStart==='medio'?'Fisioterapia con ejercicio y educación; seguimiento cercano.':'Enfoque psicológicamente informado (miedo, catastrofismo, ánimo): educación, exposición gradual y, si hace falta, apoyo psicológico.'} ${refList(['l_hill11'])}</div>`);
  if(ph.avoid) mods.push(`<div class="mod"><b>Evitar en esta fase.</b> ${esc(ph.avoid)}</div>`);
  const overview = `<div class="tbl"><table class="data"><thead><tr><th>Día</th><th>Activación</th><th>Neuro</th><th>Central</th></tr></thead><tbody>
    ${days.map(d=>{ const g=t=>d.segs.find(x=>x.type===t); return `<tr><td><b>${esc(d.name)}</b></td><td>${g('act')?.rows.length||0}</td><td>${g('neuro')?.rows.length||0}</td><td>${g('central')?.rows.length||0}</td></tr>`; }).join('')}
    </tbody></table></div><p class="small" style="margin:8px 0 0">Reparto sugerido: ${nd===4?'lunes, martes, jueves y viernes':nd===3?'lunes, miércoles y viernes':'lunes y jueves'}. ${ph.home?`Además, todos los días: <b>${esc(ph.home.n.toLowerCase())}</b> (${esc(ph.home.d)}).`:''}</p>`;
  return `
  <section class="card"><div class="status">
    ${wl?`<div class="light ${wl.c}"><span class="dot"></span><div><b>${esc(wl.t)}</b><p>${esc(wl.p)}</p><p class="small" style="margin:4px 0 0">Según el estado clínico de hoy.</p></div></div>`:'<div class="light y"><span class="dot"></span><div><b>Sin estado clínico</b><p>Registra dolor lumbar, dolor en la pierna y respuesta a 24 h en la ficha para que el semáforo decida la carga.</p></div></div>'}
    <div><h3 class="sec">${esc(ph.nextLabel)}</h3>${critList(ph.next, s)}
      ${refList(ph.ev)}</div>
  </div></section>
  ${mods.length?`<section class="card"><h3 class="sec">Consideraciones de este caso</h3><div class="mods" style="margin:0">${mods.join('')}</div></section>`:''}
  <section class="card"><h3 class="sec">Semana tipo</h3>${overview}
    <div class="legend" style="margin-top:10px">${[['Activación','var(--c-act)'],['Neuro','var(--c-neuro)'],['Bloque central','var(--c-central)']].map(([l,c])=>`<span><i class="sw" style="background:${c}"></i>${l}</span>`).join('')}</div></section>
  ${custom?`<div class="edited"><span><b>Plan modificado por ti</b> para esta fase y ${nd} días.</span><button id="bReset">Restablecer plan base</button></div>`:''}
  ${days.map((d,di)=>dayHTML(d,di)).join('')}
  <section class="card"><h3 class="sec">Fundamento del plan</h3><div class="mods">
    <div class="mod"><b>El ejercicio es el tratamiento principal.</b> Reduce dolor y discapacidad en dolor lumbar agudo y crónico; ningún tipo es claramente superior, así que manda lo que la persona hará con constancia. ${refList(['l_george21','l_who23','l_hayden21'])}</div>
    <div class="mod"><b>Qué ejercicio.</b> Pilates, fuerza y control motor tienen los mejores resultados en dolor y función; estirar solo no basta. El peso muerto progresivo es una opción tan válida como el control motor de baja carga. ${refList(['l_owen20','l_fernandez22','l_aasa15'])}</div>
    <div class="mod"><b>Educación y miedo.</b> Explicar que el dolor no es daño, exponer a los movimientos temidos y quitar la rigidez protectora cambia la discapacidad a largo plazo. ${refList(['l_kent23','l_wood19','l_foster18'])}</div>
    <div class="mod"><b>Caminar previene recaídas.</b> Un programa de caminata progresiva casi duplicó el tiempo sin recaída. ${refList(['l_pocovi24'])}</div>
    <div class="mod"><b>Lo que no recomiendan las guías.</b> Reposo, fajas o soportes lumbares, tracción e imágenes de rutina sin banderas rojas. ${refList(['l_who23','l_lin20'])}</div>
    <div class="mod"><b>Medir el progreso.</b> Oswestry (ODI) y dolor: una mejora ≥ 30 % es clínicamente importante. Resistencia del tronco con valores de referencia como meta. ${refList(['l_ostelo08','l_mcgill99'])}</div>
  </div></section>
  ${allRefs()}`;
}
const _planViewBase = planView;
planView = function(){ return modOf(st)==='lumbar' ? lumPlanView() : _planViewBase(); };

/* Región dentro de Rehab: el botón Rehab queda marcado para rodilla y lumbar */
const _syncVisBase = syncVisibility;
syncVisibility = function(){
  _syncVisBase();
  const mo=modOf(st);
  document.querySelectorAll('.modsel [data-mod]').forEach(b=>{ if(b.dataset.mod==='rodilla') b.setAttribute('aria-pressed', String(isRehab(st))); });
  document.querySelectorAll('.regsel [data-reg]').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.reg===mo)));
};
const _setModuloBase = setModulo;
setModulo = function(m){
  if(m==='rodilla' && isRehab(st) && modOf(st)!=='rodilla') return;     // tocar "Rehab" no cambia la región elegida
  if(m==='lumbar'){ if(modOf(st)==='lumbar') return; st.modulo='lumbar'; st.fase='auto'; if(!st.lumCond) st.lumCond='agudo'; if(!st.nivel) st.nivel='int'; editMode=false; fillForm(); render(); markDirty(); return; }
  _setModuloBase(m);
};
$('#form').addEventListener('click', e=>{ const b=e.target.closest('.regsel [data-reg]'); if(b) setModulo(b.dataset.reg); });
$('#form').addEventListener('input', e=>{
  const k=e.target.dataset.k;
  if(k==='lumCond'){ st.fase = P[pkey(st)].weeks ? 'auto' : '0'; syncVisibility(); }
  if(k==='lumSem') syncVisibility();
});
