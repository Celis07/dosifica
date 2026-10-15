/* ===================== REFERENCIAS ===================== */
const R = {
  aspetar:{l:'A',c:'Kotsifaki R, Korakakis V, King E, et al. Aspetar clinical practice guideline on rehabilitation after anterior cruciate ligament reconstruction. Br J Sports Med. 2023;57(9):500-514. PMID 36731908.',k:'Guía GRADE (140 ECA). La mayoría de recomendaciones tienen certeza baja; propone criterios de retorno a correr y al deporte por consenso.'},
  vanmelick:{l:'C',c:'van Melick N, van Cingel REH, Brooijmans F, et al. Evidence-based clinical practice update: practice guidelines for anterior cruciate ligament rehabilitation. Br J Sports Med. 2016;50(24):1506-1515.',k:'Cadena abierta 90–45° desde la semana 4; rango completo de forma progresiva más adelante.'},
  grindem:{l:'B',c:'Grindem H, Snyder-Mackler L, Moksnes H, Engebretsen L, Risberg MA. Simple decision rules can reduce reinjury risk by 84% after ACL reconstruction: the Delaware-Oslo ACL cohort study. Br J Sports Med. 2016;50(13):804-808. doi:10.1136/bjsports-2016-096031',k:'La tasa de relesión bajó 51 % por cada mes que se retrasó el retorno hasta los 9 meses; mayor simetría de cuádriceps redujo la relesión.'},
  rambaud:{l:'C',c:'Rambaud AJM, Ardern CL, Thoreux P, Regnaux JP, Edouard P. Criteria for return to running after anterior cruciate ligament reconstruction: a scoping review. Br J Sports Med. 2018;52(22):1437-1444.',k:'El criterio más usado es el tiempo (~12 semanas); los criterios clínicos y de fuerza son heterogéneos.'},
  kotsifaki22:{l:'B',c:'Kotsifaki A, Van Rossom S, Whiteley R, et al. Single leg vertical jump performance identifies knee function deficits at return to sport after ACL reconstruction in male athletes. Br J Sports Med. 2022;56(9):490-498.',k:'El salto vertical unipodal detecta déficits de rodilla que el hop horizontal enmascara.'},
  wellsandt:{l:'B',c:'Wellsandt E, Failla MJ, Snyder-Mackler L. Limb symmetry indexes can overestimate knee function after anterior cruciate ligament injury. J Orthop Sports Phys Ther. 2017;47(5):334-338.',k:'El LSI sobreestima la función si el lado sano también se desacondiciona; comparar con valores previos o normativos.'},
  frobell:{l:'A',c:'Frobell RB, Roos EM, Roos HP, Ranstam J, Lohmander LS. A randomized trial of treatment for acute anterior cruciate ligament tears. N Engl J Med. 2010;363(4):331-342. (Seguimiento a 5 años: BMJ 2013;346:f232.)',k:'KANON: rehabilitación + reconstrucción diferida opcional dio resultados similares a la reconstrucción temprana en adultos jóvenes activos.'},
  fitzgerald:{l:'B',c:'Fitzgerald GK, Axe MJ, Snyder-Mackler L. The efficacy of perturbation training in nonoperative anterior cruciate ligament rehabilitation programs for physically active individuals. Phys Ther. 2000;80(2):128-140.',k:'El entrenamiento con perturbaciones mejoró el éxito del retorno en no operados.'},
  failla:{l:'B',c:'Failla MJ, Logerstedt DS, Grindem H, et al. Does extended preoperative rehabilitation influence outcomes 2 years after ACL reconstruction? Am J Sports Med. 2016;44(10):2608-2614.',k:'La rehabilitación preoperatoria extendida se asoció a mejor función a 2 años.'},
  giesche:{l:'B',c:'Giesche F, Niederer D, Banzer W, Vogt L. Evidence for the effects of prehabilitation before ACL-reconstruction on return to sport-related and self-reported knee function: a systematic review. PLoS One. 2020;15(10):e0240192.',k:'La prehabilitación mejora fuerza de cuádriceps y función autorreportada hasta 2 años; evidencia limitada en cantidad.'},
  minshull:{l:'B',c:'Minshull C, Gallacher P, Roberts S, Barnett A, Kuiper JH, Bailey A. Contralateral strength training attenuates muscle performance loss following ACL reconstruction: a randomised-controlled trial. Eur J Appl Physiol. 2021;121(12):3551-3559.',k:'Fuerza de alta intensidad del sano (3×/sem, 8 sem, desde la sem 2): la pérdida de fuerza del cuádriceps operado a las 10 sem fue 16,6 % vs 32,0 % en control; la ventaja no se mantuvo a las 24 sem.'},
  zhang25:{l:'B',c:'The effects of contralateral limb cross-education training on post-surgical rehabilitation outcomes in patients with ACL reconstruction: a randomized controlled trial. J Orthop Surg Res. 2025. doi:10.1186/s13018-024-05430-3',k:'ECA (n = 40, desde sem 5–6): 6 semanas de educación cruzada mejoraron función, cinemática y equilibrio dinámico.'},
  zult:{l:'B',c:'Zult T, Gokeler A, van Raay JJAM, et al. Cross-education does not accelerate the rehabilitation of neuromuscular functions after ACL reconstruction: a randomized controlled clinical trial. Eur J Appl Physiol. 2018;118(8):1609-1623.',k:'Resultado negativo: la educación cruzada no aceleró la recuperación. Por eso el nivel global es B (resultados mixtos).'},
  hughes19:{l:'B',c:'Hughes L, Rosenblatt B, Haddad F, et al. Comparing the effectiveness of blood flow restriction and traditional heavy load resistance training in the post-surgery rehabilitation of ACL reconstruction patients: a UK NHS randomised controlled trial. Sports Med. 2019;49(11):1787-1805.',k:'BFR al 30 % 1RM vs carga pesada al 70 %: ganancias de fuerza e hipertrofia comparables.'},
  hughes19p:{l:'B',c:'Hughes L, Patterson SD, Haddad F, et al. Examination of the comfort and pain experienced with blood flow restriction training during post-surgery rehabilitation of ACL reconstruction patients. Phys Ther Sport. 2019;39:90-98.',k:'Menor dolor de rodilla durante y a las 24 h con BFR; sin eventos adversos.'},
  curran:{l:'B',c:'Curran MT, Bedi A, Mendias CL, Wojtys EM, Kujawa MV, Palmieri-Smith RM. Blood flow restriction training applied with high-intensity exercise does not improve quadriceps muscle function after ACL reconstruction: a randomized controlled trial. Am J Sports Med. 2020;48(4):825-837.',k:'Añadir BFR a cargas altas no aporta: el BFR sirve para cargas bajas cuando la carga alta no es tolerable.'},
  patterson:{l:'C',c:'Patterson SD, Hughes L, Warmington S, et al. Blood flow restriction exercise: considerations of methodology, application, and safety. Front Physiol. 2019;10:533.',k:'Posicionamiento: 20–40 % 1RM, 40–80 % de la presión de oclusión, 30-15-15-15 reps, 30–60 s de pausa, cribado de riesgo trombótico.'},
  breda:{l:'B',c:'Breda SJ, Oei EHG, Zwerver J, et al. Effectiveness of progressive tendon-loading exercise therapy in patients with patellar tendinopathy: a randomised clinical trial. Br J Sports Med. 2021;55(9):501-509.',k:'Carga progresiva por etapas (isométrica → isotónica → pliométrica → deporte) guiada por dolor fue superior a la excéntrica a 24 semanas.'},
  malliaras:{l:'C',c:'Malliaras P, Cook J, Purdam C, Rio E. Patellar tendinopathy: clinical diagnosis, load management, and advice for challenging case presentations. J Orthop Sports Phys Ther. 2015;45(11):887-898.',k:'Modelo de cuatro etapas de carga según tolerancia.'},
  kongsgaard:{l:'B',c:'Kongsgaard M, Kovanen V, Aagaard P, et al. Corticosteroid injections, eccentric decline squat training and heavy slow resistance training in patellar tendinopathy. Scand J Med Sci Sports. 2009;19(6):790-802.',k:'HSR (3×/sem, 15RM → 6RM, 3 s subir/3 s bajar) con buenos resultados clínicos a 6 meses.'},
  silbernagel:{l:'B',c:'Silbernagel KG, Thomeé R, Eriksson BI, Karlsson J. Continued sports activity, using a pain-monitoring model, during rehabilitation in patients with Achilles tendinopathy. Am J Sports Med. 2007;35(6):897-906.',k:'Modelo de monitoreo del dolor: carga permitida si el dolor es tolerable y vuelve a basal al día siguiente. Validado en Aquiles; aquí se extrapola.'},
  rio:{l:'B',c:'Rio E, Kidgell D, Purdam C, et al. Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy. Br J Sports Med. 2015;49(19):1277-1283.',k:'5 × 45 s al 70 % CVM redujeron el dolor de forma inmediata (n = 6).'},
  clifford:{l:'A',c:'Clifford C, Challoumas D, Paul L, Syme G, Millar NL. Effectiveness of isometric exercise in the management of tendinopathy: a systematic review and meta-analysis of randomised trials. BMJ Open Sport Exerc Med. 2020;6(1):e000760.',k:'La isometría no fue superior a la isotónica, ni de forma inmediata ni a ≤ 12 semanas; la respuesta es variable entre personas.'},
  challoumas:{l:'A',c:'Challoumas D, Pedret C, Biddle M, et al. Management of patellar tendinopathy: a systematic review and network meta-analysis of randomised studies. BMJ Open Sport Exerc Med. 2021;7(4):e001110.',k:'Isometría tan eficaz como isotónica para alivio inmediato (sin superioridad).'},
  mohamadi:{l:'C',c:'Mohamadi A, Momenzadeh K, Masoudi A, et al. Rehabilitation following meniscal repair: a systematic review. BMJ Open Sport Exerc Med. 2018;4(1):e000212.',k:'Sin consenso sobre el protocolo óptimo; los protocolos acelerados no se asociaron a más fallos.'},
  ojsm25:{l:'C',c:'Postoperative rehabilitation protocol after isolated meniscal repair: a systematic review. Orthop J Sports Med. 2025. doi:10.1177/23259671251357513',k:'Fallos 24,1 % (carga acelerada) vs 28,3 % (restringida); el tipo de rotura y la técnica condicionan la decisión.'},
  skou:{l:'B',c:'Skou ST, Hölmich P, Lind M, et al. Early surgery or exercise and education for meniscal tears in young adults. NEJM Evid. 2022;1(2). (Ensayo DREAM)',k:'En 18–40 años, la cirugía temprana no fue superior al ejercicio supervisado con opción de cirugía posterior.'},
  kise:{l:'A',c:'Kise NJ, Risberg MA, Stensrud S, et al. Exercise therapy versus arthroscopic partial meniscectomy for degenerative meniscal tear in middle aged patients: randomised controlled trial with two year follow-up. BMJ. 2016;354:i3740.',k:'El ejercicio fue igual de eficaz que la meniscectomía en roturas degenerativas.'},
  pastora:{l:'C',c:'Pastora-Bernal JM, Estebanez-Pérez MJ, Lucena-Anton D, et al. The effectiveness and recommendation of motor imagery techniques for rehabilitation after ACL reconstruction: a systematic review. J Clin Med. 2021;10(3):428.',k:'Seis estudios con resultados desiguales; sin evidencia clara de beneficio añadido, aunque algunos favorecen activación y fuerza.'},
  paravlic:{l:'C',c:'Paravlic AH. Motor imagery and action observation as appropriate strategies for home-based rehabilitation: a mini-review focusing on improving physical function in orthopedic patients. Front Psychol. 2022;13:826476.',k:'Racional neural: la inhibición del cuádriceps explica gran parte de la pérdida temprana de fuerza.'},
  abbiss:{l:'B',c:'Abbiss CR, Karagounis LG, Laursen PB, et al. Single-leg cycle training is superior to double-leg cycling in improving the oxidative potential and metabolic profile of trained skeletal muscle. J Appl Physiol. 2011;110(5):1248-1255.',k:'Ciclismo unipodal mantiene un estímulo aeróbico alto; estudio en sanos entrenados (extrapolado).'},
  fleming:{l:'C',c:'Fleming BC, Beynnon BD, Renstrom PA, et al. The strain behavior of the anterior cruciate ligament during bicycling: an in vivo study. Am J Sports Med. 1998;26(1):109-118.',k:'La bicicleta genera tensión baja sobre el LCA, independiente de la potencia.'},
  weakley:{l:'C',c:'Weakley J, Mann B, Banyard H, et al. Velocity-based training: from theory to application. Strength Cond J. 2021;43(2):31-49.',k:'Zonas de velocidad aproximadas y uso de pérdida de velocidad para regular el volumen.'},
  pareja:{l:'B',c:'Pareja-Blanco F, Rodríguez-Rosell D, Sánchez-Medina L, et al. Effects of velocity loss during resistance training on athletic performance, strength gains and muscle adaptations. Scand J Med Sci Sports. 2017;27(7):724-735.',k:'Pérdida de velocidad del 20 % dio mejores ganancias de salto con menos fatiga que el 40 %.'},
  helms:{l:'C',c:'Helms ER, Cronin J, Storey A, Zourdos MC. Application of the repetitions in reserve-based rating of perceived exertion scale for resistance training. Strength Cond J. 2016;38(4):42-49.',k:'Escala RPE basada en repeticiones en reserva (RPE 8 ≈ 2 RIR).'},
  lesuer:{l:'B',c:'LeSuer DA, McCormick JH, Mayhew JL, Wasserstein RL, Arnold MD. The accuracy of prediction equations for estimating 1-RM performance in the bench press, squat, and deadlift. J Strength Cond Res. 1997;11(4):211-213.',k:'Las ecuaciones (Epley, Brzycki) son razonables con ≤ 10 repeticiones; pierden precisión con más.'},
  sturgill:{l:'B',c:'Sturgill LP, Snyder-Mackler L, Manal TJ, Axe MJ. Interrater reliability of a clinical scale to assess knee joint effusion. J Orthop Sports Phys Ther. 2009;39(12):845-849.',k:'Prueba de barrido (cero, trazas, 1+, 2+, 3+) con buena fiabilidad.'},
  exp:{l:'E',c:'Experiencia clínica y razonamiento fisiológico.',k:'Sin estudio directo para este punto concreto; ajústalo a tu criterio.'}
};
const LV = {A:'Metaanálisis o ECA consistentes',B:'ECA aislados o resultados mixtos',C:'Guías de consenso, revisiones con certeza baja o extrapolación',E:'Experiencia clínica'};


/* ===================== UTILIDADES ===================== */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = v => (v === '' || v === null || v === undefined || isNaN(+v)) ? null : +v;
const clone = o => JSON.parse(JSON.stringify(o));
function getP(o, p){ return p.split('.').reduce((a,k)=> a==null?undefined:a[k], o); }
function setP(o, p, v){ const ks=p.split('.'); let a=o; ks.slice(0,-1).forEach(k=>{ if(a[k]==null||typeof a[k]!=='object') a[k]={}; a=a[k]; }); a[ks[ks.length-1]]=v; }

function blank(){
  return {modulo:'rodilla',deporteP:'gimnasio',nivel:'int',poblacion:'sed',torneos:[],inicio:'',nombre:'',deporte:'',lado:'der',cond:'lca',tendSub:'rot',perfil:'',consent:false,menSub:'cons',cargaSut:'restringida',lcaSub:'post',injerto:'hth',suturaAsoc:false,semanas:0,fase:'auto',dias:'3',semPlan:1,
    dolor:0,resp24:'igual',derrame:0,extDef:'',flexL:'',flexS:'',slr:false,marcha:false,chk:{},plans:{},notas:''};
}
const EXAMPLE = Object.assign(blank(), {nombre:'Ejemplo · LCA HTH',deporte:'Rugby subacuático',perfil:'uwr',cond:'lca',lcaSub:'post',injerto:'hth',semanas:18,semPlan:10,dolor:2,resp24:'igual',derrame:0,extDef:0,flexL:138,flexS:142,slr:true,marcha:true});

/* ===================== CRITERIOS ===================== */
const CR = {
  der0:{t:'Sin derrame (barrido: cero)', f:s=> s.derrame==0},
  derT:{t:'Derrame ≤ trazas', f:s=> s.derrame<=1},
  der1:{t:'Derrame ≤ 1+', f:s=> s.derrame<=2},
  ext:{t:'Extensión completa (déficit 0°)', f:s=> num(s.extDef)==null?null: num(s.extDef)<=0},
  f90:{t:'Flexión ≥ 90°', f:s=> num(s.flexL)==null?null:num(s.flexL)>=90},
  f110:{t:'Flexión ≥ 110°', f:s=> num(s.flexL)==null?null:num(s.flexL)>=110},
  f120:{t:'Flexión ≥ 120°', f:s=> num(s.flexL)==null?null:num(s.flexL)>=120},
  f95:{t:'Flexión ≥ 95 % del lado sano', f:s=> (num(s.flexL)==null||num(s.flexS)==null)?null: num(s.flexL)>=0.95*num(s.flexS)},
  slr:{t:'Elevación de pierna recta sin déficit', f:s=> !!s.slr},
  marcha:{t:'Marcha sin cojera ni ayudas', f:s=> !!s.marcha},
  d3:{t:'Dolor ≤ 3/10 y vuelta a basal a las 24 h', f:s=> s.dolor<=3 && s.resp24!=='peor'},
  d2:{t:'Dolor ≤ 2/10 y vuelta a basal a las 24 h', f:s=> s.dolor<=2 && s.resp24!=='peor'},
  q60:{t:'Fuerza de cuádriceps ≥ 60 % del sano', m:1},
  q70:{t:'Fuerza de cuádriceps ≥ 70 % del sano', m:1},
  q80:{t:'Fuerza de cuádriceps ≥ 80 % del sano', m:1},
  q90:{t:'Fuerza de cuádriceps ≥ 90 % del sano', m:1},
  p80:{t:'Fuerza en prensa unilateral ≥ 80 % del sano', m:1},
  p90:{t:'Fuerza en prensa unilateral ≥ 90 % del sano', m:1},
  w6:{t:'≥ 6 semanas postoperatorias', f:s=> num(s.semanas)>=6},
  w12:{t:'≥ 12 semanas postoperatorias', f:s=> num(s.semanas)>=12},
  w16:{t:'≥ 16 semanas postoperatorias', f:s=> num(s.semanas)>=16},
  w39:{t:'≥ 9 meses (39 semanas) postoperatorios', f:s=> num(s.semanas)>=39}
};
function critVal(id, s){ const c=CR[id]; if(c.m) return s.chk?.[id] ? true : null; return c.f(s); }

/* ===================== DOSIS Y VELOCIDAD ===================== */
const VZ = {fmax:'0,35–0,55 m/s', acel:'0,55–0,75 m/s', fv:'0,75–1,0 m/s', vf:'> 1,0 m/s'};
// item: n nombre, d dosis, p [%min,%max] de 1RM, rpe, v zona, lift, limb, t nota técnica
const X = (n,d,o={}) => Object.assign({n,d},o);

/* ===================== PROTOCOLOS ===================== */
const ISO_TEND = X('Extensión de rodilla isométrica a 60°','5 × 45 s · pausa 2 min',{rpe:'6–7',t:'~70 % de la contracción voluntaria máxima. 1–2 veces al día y antes de entrenar si alivia. Tendinopatía cuadricipital: empieza en 30–45° si 60° irrita.'});
const P = {
 tend:{label:'Tendinopatía', phases:[
  {name:'Fase 1 · Isometría y control del dolor', when:'1–3 semanas aprox.', goal:'Bajar la irritabilidad del tendón sin dejar de cargarlo y mantener la fuerza de todo lo que no lo irrita.',
   next:['d3'], nextLabel:'Para pasar a carga isotónica pesada',
   blocks:[
    {h:'Carga del tendón', ev:['breda','rio','clifford'], items:[ISO_TEND,
      X('Sentadilla isométrica en pared o "Spanish squat"','4–5 × 30–45 s',{rpe:'6–7',t:'Rodilla a 60–70°. Dolor ≤ 3/10 durante.'})]},
    {h:'Lo que no irrita: cadera, isquios, tríceps sural', ev:['exp'], items:[
      X('Hip thrust','4 × 6–8',{rpe:'8',t:'Carga alta; poca demanda del tendón rotuliano.'}),
      X('Curl femoral unilateral','3 × 8–10',{p:[70,80],rpe:'8',lift:'curl',limb:'L'}),
      X('Elevación de talones (rodilla extendida y flexionada)','4 × 8–12',{rpe:'8'}),
      X('Abducción de cadera en polea o banda','3 × 12–15',{rpe:'8'})]}],
   sano:'cx', cx:{bici:'ok',remo:'cond',int:'base'}, tools:['iso','bfr']},
  {name:'Fase 2 · Isotónica pesada (HSR)', when:'4–12 semanas aprox.', goal:'Construir capacidad de carga del tendón y fuerza máxima del cuádriceps con contracciones lentas y pesadas.',
   next:['d3','q90'], nextLabel:'Para pasar a almacenamiento de energía',
   blocks:[
    {h:'Fuerza pesada lenta · 3 × semana', ev:['kongsgaard','breda','malliaras'], items:[
      X('Prensa unilateral 0–90°','4 × 15 → 6 reps en 12 semanas',{p:[65,85],rpe:'7–9',lift:'prensa',limb:'L',v:'acel',t:'Tempo 3 s bajar / 3 s subir. Empieza en 15 reps a RPE 7 y baja a 6 reps a RPE 8–9 en 12 semanas. Sube carga cuando el dolor es ≤ 3/10 y vuelve a basal en 24 h.'}),
      X('Sentadilla (hack o trasera)','4 × 6–8',{p:[70,85],rpe:'8',lift:'sent',v:'acel',t:'Tempo 3-0-3.'}),
      X('Extensión de rodilla unilateral','3 × 8–12',{p:[65,80],rpe:'8',lift:'ext',limb:'L',t:'Tempo 3-0-3.'}),
      X('Sentadilla búlgara','3 × 6–10',{rpe:'8'}),
      X('Peso muerto rumano','3 × 6–8',{rpe:'8'})]},
    {h:'Isometría de apoyo', ev:['rio','clifford'], items:[X('Isometría pre-entreno (opcional)','3–5 × 45 s a 60°',{rpe:'6–7',t:'Solo si al deportista le baja el dolor; no es obligatoria.'})]}],
   sano:'cx', cx:{bici:'ok',remo:'ok',int:'int'}, tools:['iso','bfr']},
  {name:'Fase 3 · Almacenamiento de energía', when:'Desde que tolera fuerza pesada', goal:'Reintroducir el ciclo estiramiento-acortamiento: saltos, aterrizajes y carrera, sin perder la fuerza ganada.',
   next:['d3'], nextLabel:'Para el retorno deportivo',
   blocks:[
    {h:'Pliometría progresiva · cada 2–3 días', ev:['breda','malliaras'], items:[
      X('Progresión de saltos','2–4 × 6–10 contactos · 40–80 por sesión',{rpe:'7–8',t:'Bilateral → unilateral; vertical → horizontal; poca → mucha altura de caída. Sube contactos solo con dolor ≤ 3/10 y respuesta a 24 h estable.'}),
      X('Sentadilla con salto','4 × 4–5',{p:[30,40],lift:'sent',v:'vf',t:'Carga ligera y máxima intención. Corta la serie si el salto pierde altura o se ve más lento.'})]},
    {h:'Mantener fuerza · 2 × semana', ev:['kongsgaard','pareja'], items:[
      X('Sentadilla','3–4 × 3–5',{p:[80,90],rpe:'8',lift:'sent',v:'fmax'}),
      X('Prensa unilateral','3 × 5–6',{p:[80,85],rpe:'8',lift:'prensa',limb:'L'})]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:['iso']},
  {name:'Fase 4 · Retorno deportivo', when:'Variable', goal:'Exponer el tendón a las demandas reales del deporte con volumen creciente.',
   next:['d3','q90'], nextLabel:'Criterios de alta',
   blocks:[
    {h:'Deporte y mantenimiento', ev:['breda','malliaras'], items:[
      X('Tareas específicas del deporte','Volumen creciente semana a semana',{t:'Mismo monitoreo de dolor. Si una sesión dispara el dolor > 5/10 o empeora a las 24 h, baja un escalón.'}),
      X('Fuerza pesada de mantenimiento','1–2 × semana · sentadilla 3 × 3–5',{p:[80,90],rpe:'8',lift:'sent',v:'fmax'}),
      X('Saltos reactivos máximos','2 × semana · 3–4 × 5',{rpe:'8–9'})]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:[]}
 ]},
 'men-cons':{label:'Meniscopatía · conservador', phases:[
  {name:'Fase 1 · Calmar la rodilla', when:'1–3 semanas aprox.', goal:'Controlar derrame, recuperar rango y activar cuádriceps, glúteo medio y estabilidad sin provocar síntomas mecánicos.',
   next:['derT','ext','f95','d3','marcha'], nextLabel:'Para pasar a fuerza',
   blocks:[
    {h:'Activación y control', ev:['skou','exp'], items:[
      X('Extensión terminal de rodilla (TKE) con banda','4 × 15–20',{rpe:'6–7',t:'Sostén 1–2 s en extensión completa.'}),
      X('Isometría de cuádriceps (extensión 60° o pared 45–60°)','5 × 30–45 s',{rpe:'6–7'}),
      X('Elevación de pierna recta','3 × 10–15',{rpe:'6'})]},
    {h:'Glúteo medio y estabilidad', ev:['skou','exp'], items:[
      X('Plancha lateral','3 × 20–40 s',{rpe:'7–8'}),
      X('Abducción con banda / marcha lateral','3 × 12–15',{rpe:'8'}),
      X('Apoyo unipodal con progresión','4 × 30–45 s',{t:'Superficie inestable → ojos cerrados → perturbaciones.'})]},
    {h:'Cadena posterior', ev:['exp'], items:[
      X('Puente / hip thrust','3 × 8–12',{rpe:'7–8'}),
      X('Curl femoral unilateral','3 × 8–10',{p:[65,75],rpe:'7',lift:'curl',limb:'L',t:'Omitir si provoca dolor en la interlínea posterior.'})]}],
   avoid:'Evita sentadilla profunda cargada y pivotes con carga hasta que la rodilla esté calmada.',
   sano:'cx', cx:{bici:'ok',remo:'cond',int:'base'}, tools:['iso','bfr']},
  {name:'Fase 2 · Fuerza', when:'3–8 semanas aprox.', goal:'Fuerza máxima del cuádriceps y de la cadera en rangos que no reproducen síntomas.',
   next:['derT','q80','p80','d3'], nextLabel:'Para pasar a potencia',
   blocks:[
    {h:'Fuerza · 3 × semana', ev:['skou','kise','helms'], items:[
      X('Prensa unilateral 0–70°','4 × 6–8',{p:[75,85],rpe:'8',lift:'prensa',limb:'L',v:'acel'}),
      X('Sentadilla a cajón (≤ 90°)','4 × 5–6',{p:[75,85],rpe:'8',lift:'sent',v:'acel'}),
      X('Extensión de rodilla 90–30°','3 × 8–10',{p:[70,80],rpe:'8',lift:'ext',limb:'L'}),
      X('Peso muerto rumano','3 × 6–8',{rpe:'8'}),
      X('Step-down excéntrico','3 × 8–10',{rpe:'7',t:'Control del valgo dinámico.'}),
      X('Abducción de cadera en polea','3 × 10–12',{rpe:'8'}),
      X('Estabilidad con perturbaciones','3–4 × 30 s',{t:'Plataforma, empujones, balón.'})]}],
   sano:'cx', cx:{bici:'ok',remo:'ok',int:'int'}, tools:['bfr']},
  {name:'Fase 3 · Potencia, pliometría y cambios de dirección', when:'Desde LSI ≥ 80 %', goal:'Convertir fuerza en potencia y tolerancia a fuerzas de rotación.',
   next:['q90','d3'], nextLabel:'Para el retorno deportivo',
   blocks:[
    {h:'Fuerza máxima · 2 × semana', ev:['pareja','weakley'], items:[
      X('Sentadilla','4 × 3–5',{p:[80,90],rpe:'8',lift:'sent',v:'fmax'}),
      X('Prensa unilateral','3 × 4–6',{p:[80,90],rpe:'8',lift:'prensa',limb:'L',v:'fmax'})]},
    {h:'Potencia y pliometría', ev:['exp'], items:[
      X('Sentadilla con salto','4 × 4–5',{p:[30,40],lift:'sent',v:'vf'}),
      X('Saltos bilaterales → unilaterales','2 × semana · 60–100 contactos',{rpe:'7–8'}),
      X('Cambios de dirección','45° → 90° → 180° · preplanificado → reactivo',{t:'Aquí aparecen los síntomas mecánicos si van a aparecer; vigílalos.'})]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:[]},
  {name:'Fase 4 · Retorno al deporte', when:'Variable', goal:'Volumen e intensidad del deporte completos sin derrame ni síntomas mecánicos.',
   next:['der0','q90','d2'], nextLabel:'Criterios de alta',
   blocks:[{h:'Deporte y mantenimiento', ev:['skou'], items:[
      X('Entrenamiento con equipo progresivo','Volumen creciente',{t:'Si reaparece derrame o bloqueo, vuelve a fase 2 y reevalúa.'}),
      X('Fuerza de mantenimiento','2 × semana · sentadilla 3 × 3–5',{p:[80,90],rpe:'8',lift:'sent',v:'fmax'})]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:[]}
 ]},
 'men-mx':{label:'Meniscectomía', weeks:[0,2,6], phases:[
  {name:'Fase 1 · Postoperatorio inmediato', when:'0–2 semanas', goal:'Carga según tolerancia, controlar derrame, extensión completa y activación del cuádriceps.',
   next:['derT','ext','f120','slr','marcha'], nextLabel:'Para pasar a fuerza',
   blocks:[{h:'Activación', ev:['exp','sturgill'], items:[
      X('Isometría de cuádriceps a 0° y 60°','5–10 × 10 s',{rpe:'7–8'}),
      X('Elevación de pierna recta','3 × 10–15'),
      X('TKE con banda','4 × 15–20',{rpe:'6–7'}),
      X('Deslizamiento de talón / flexión asistida','Varias veces al día'),
      X('Glúteo medio en decúbito y puente','3 × 12–15',{rpe:'7'})]}],
   sano:'cx', cx:{bici:'cond',remo:'brazos',int:'base'}, tools:['iso','bfr','mi']},
  {name:'Fase 2 · Fuerza', when:'2–6 semanas', goal:'Recuperar fuerza máxima con progresión rápida si la rodilla no se inflama.',
   next:['derT','q80','p80','d3'], nextLabel:'Para pasar a potencia',
   blocks:[{h:'Fuerza · 3 × semana', ev:['kise','exp'], items:[
      X('Prensa unilateral 0–90°','4 × 6–10',{p:[70,80],rpe:'7–8',lift:'prensa',limb:'L'}),
      X('Sentadilla a cajón','4 × 6–8',{p:[70,80],rpe:'8',lift:'sent',v:'acel'}),
      X('Extensión de rodilla','3 × 8–12',{p:[65,75],rpe:'8',lift:'ext',limb:'L'}),
      X('Peso muerto rumano','3 × 6–8',{rpe:'8'}),
      X('Glúteo medio y estabilidad dinámica','3 × 10–12 / 30 s',{rpe:'8'})]}],
   sano:'cx', cx:{bici:'ok',remo:'ok',int:'int'}, tools:['bfr']},
  {name:'Fase 3 · Potencia y retorno', when:'≥ 6 semanas', goal:'Pliometría, cambios de dirección y vuelta al deporte por criterios.',
   next:['der0','q90','d2'], nextLabel:'Criterios de alta',
   blocks:[{h:'Potencia y deporte', ev:['pareja','exp'], items:[
      X('Sentadilla','4 × 3–5',{p:[80,90],rpe:'8',lift:'sent',v:'fmax'}),
      X('Sentadilla con salto','4 × 4–5',{p:[30,40],lift:'sent',v:'vf'}),
      X('Pliometría bilateral → unilateral','2 × semana · 60–100 contactos'),
      X('Cambios de dirección progresivos','2 × semana')]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:[]}
 ]},
 'men-sut':{label:'Sutura meniscal', weeks:[0,6,12,16], phases:[
  {name:'Fase 1 · Protección de la sutura', when:'0–6 semanas', goal:'Proteger la reparación (flexión ≤ 90°), mantener la extensión completa y activar el cuádriceps.',
   next:['w6','derT','ext','f90'], nextLabel:'Para pasar a carga progresiva',
   blocks:[{h:'Activación en rango protegido', ev:['mohamadi','ojsm25','exp'], items:[
      X('Isometría de cuádriceps a 0–30°','5–10 × 10 s',{rpe:'7–8'}),
      X('Elevación de pierna recta','3 × 10–15'),
      X('TKE con banda','4 × 15–20',{rpe:'6–7'}),
      X('Glúteo medio en decúbito / plancha lateral','3 × 12–15 / 20–30 s',{rpe:'7–8'}),
      X('Puente con rodilla ≤ 90°','3 × 10–12',{rpe:'7'})]}],
   avoid:'Sin curl femoral cargado ni flexión > 90° en este período (cizalla sobre el cuerno posterior). Las roturas radiales o de raíz suelen ser más restrictivas: manda el cirujano.',
   sano:'cx', cx:{bici:'uni',remo:'brazos',int:'base'}, tools:['iso','bfr','mi']},
  {name:'Fase 2 · Carga progresiva', when:'6–12 semanas', goal:'Fuerza en cadena cerrada en rangos 0–60/70° y recuperar la flexión.',
   next:['w12','derT','f120','q70'], nextLabel:'Para pasar a fuerza máxima',
   blocks:[{h:'Fuerza en rango limitado · 3 × semana', ev:['mohamadi','exp'], items:[
      X('Prensa unilateral 0–60°','4 × 8–12',{p:[60,75],rpe:'7',lift:'prensa',limb:'L'}),
      X('Minisentadilla 0–60°','3 × 8–12',{p:[55,70],rpe:'7',lift:'sent'}),
      X('Extensión de rodilla 90–30°','3 × 10–12',{p:[55,70],rpe:'7',lift:'ext',limb:'L'}),
      X('Curl femoral ligero','3 × 12–15',{p:[40,55],rpe:'6',lift:'curl',limb:'L',t:'Desde ~8 semanas si el cirujano lo autoriza.'}),
      X('Estabilidad unipodal','4 × 30–45 s')]}],
   avoid:'Sin carga en flexión > 90° hasta ~12–16 semanas.',
   sano:'cx', cx:{bici:'cond',remo:'brazos',int:'base'}, tools:['bfr','mi']},
  {name:'Fase 3 · Fuerza máxima', when:'12–16 semanas', goal:'Cargar flexión profunda de forma progresiva y empezar a correr si cumple criterios.',
   next:['w16','q80','f95','d3'], nextLabel:'Para pasar a potencia',
   blocks:[{h:'Fuerza · 3 × semana', ev:['mohamadi','rambaud','exp'], items:[
      X('Sentadilla progresando a > 90°','4 × 5–6',{p:[75,85],rpe:'8',lift:'sent',v:'acel'}),
      X('Prensa unilateral 0–90°','4 × 6–8',{p:[75,85],rpe:'8',lift:'prensa',limb:'L'}),
      X('Extensión de rodilla','3 × 8–10',{p:[70,80],rpe:'8',lift:'ext',limb:'L'}),
      X('Curl femoral','3 × 8–10',{p:[65,75],rpe:'7–8',lift:'curl',limb:'L'}),
      X('Carrera intervalada','Caminar-trotar 2–3 × semana',{t:'Solo con LSI ≥ 70 % y sin derrame.'})]}],
   sano:'late', cx:{bici:'ok',remo:'cond',int:'int'}, tools:['bfr']},
  {name:'Fase 4 · Potencia y retorno', when:'≥ 16 semanas (4–6 meses)', goal:'Pliometría, cambios de dirección y retorno por criterios.',
   next:['w16','der0','q90'], nextLabel:'Criterios de alta',
   blocks:[{h:'Potencia y deporte', ev:['pareja','exp'], items:[
      X('Sentadilla','4 × 3–5',{p:[80,90],rpe:'8',lift:'sent',v:'fmax'}),
      X('Sentadilla con salto','4 × 4–5',{p:[30,40],lift:'sent',v:'vf'}),
      X('Pliometría bilateral → unilateral','2 × semana · 60–100 contactos'),
      X('Cambios de dirección','45° → 90° → 180°')]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:[]}
 ]},
 'lca-cons':{label:'LCA · no operado', phases:[
  {name:'Fase 1 · Resolver déficits', when:'0–4 semanas aprox.', goal:'Rodilla sin derrame, extensión completa y cuádriceps activo.',
   next:['derT','ext','f95','slr','marcha'], nextLabel:'Para pasar a fuerza y perturbaciones',
   blocks:[{h:'Activación', ev:['frobell','aspetar'], items:[
      X('Isometría de cuádriceps a 0° y 60°','5–10 × 10 s',{rpe:'8'}),
      X('Elevación de pierna recta','3 × 10–15'),
      X('Prensa bilateral 0–60°','3 × 10–15',{p:[50,60],rpe:'6',lift:'prensa',limb:'L'}),
      X('Glúteo medio y puente','3 × 12–15',{rpe:'7–8'})]}],
   sano:'cx', cx:{bici:'ok',remo:'cond',int:'base'}, tools:['iso','bfr']},
  {name:'Fase 2 · Fuerza y perturbaciones', when:'4–12 semanas aprox.', goal:'Fuerza máxima y control neuromuscular para tolerar perturbaciones sin ceder.',
   next:['q80','p80','derT','d3'], nextLabel:'Para pasar a potencia',
   blocks:[
    {h:'Fuerza · 3 × semana', ev:['frobell','aspetar'], items:[
      X('Prensa unilateral 0–90°','4 × 6–8',{p:[75,85],rpe:'8',lift:'prensa',limb:'L',v:'acel'}),
      X('Sentadilla','4 × 5–6',{p:[75,85],rpe:'8',lift:'sent',v:'acel'}),
      X('Extensión de rodilla 90–45°','3 × 8–10',{p:[65,75],rpe:'8',lift:'ext',limb:'L',t:'Rango 90–45° para limitar la traslación tibial anterior.'}),
      X('Curl femoral / nórdico','3 × 6–8',{p:[75,85],rpe:'8',lift:'curl',limb:'L'}),
      X('Peso muerto rumano','3 × 6–8',{rpe:'8'})]},
    {h:'Perturbaciones · 2–3 × semana', ev:['fitzgerald'], items:[
      X('Plataforma basculante, rollerboard y plataforma deslizante','10 sesiones · 3 × 1 min por tarea',{t:'Protocolo de Fitzgerald: progresar dirección, velocidad y añadir tarea deportiva.'})]}],
   sano:'cx', cx:{bici:'ok',remo:'ok',int:'int'}, tools:['bfr']},
  {name:'Fase 3 · Potencia, carrera y pliometría', when:'Desde LSI ≥ 80 %', goal:'Potencia, carrera y cambios de dirección con rodilla estable.',
   next:['q90','d2'], nextLabel:'Para el retorno deportivo',
   blocks:[{h:'Potencia y pliometría', ev:['pareja','weakley','exp'], items:[
      X('Sentadilla','4 × 3–5',{p:[80,90],rpe:'8',lift:'sent',v:'fmax'}),
      X('Sentadilla con salto','4 × 4–5',{p:[30,40],lift:'sent',v:'vf'}),
      X('Pliometría bilateral → unilateral','2 × semana · 60–100 contactos'),
      X('Carrera y cambios de dirección','Progresión semanal')]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:[]},
  {name:'Fase 4 · Retorno al deporte', when:'Decisión compartida', goal:'Volver al deporte sin episodios de inestabilidad.',
   next:['der0','q90'], nextLabel:'Criterios de alta',
   blocks:[{h:'Deporte', ev:['frobell','grindem'], items:[
      X('Entrenamiento con equipo progresivo','Volumen creciente',{t:'Un episodio de inestabilidad (giving way) cambia la indicación: reevaluar reconstrucción. En deportes con pivote el riesgo es mayor.'}),
      X('Fuerza de mantenimiento','2 × semana',{p:[80,90],rpe:'8',lift:'sent',v:'fmax'})]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:[]}
 ]},
 'lca-pre':{label:'LCA · prehabilitación', phases:[
  {name:'Prehabilitación', when:'Hasta la cirugía (ideal ≥ 4–6 semanas)', goal:'Llegar a quirófano sin derrame, con extensión completa y el cuádriceps lo más fuerte posible: es el mejor predictor del postoperatorio.',
   next:['derT','ext','f95','marcha','slr','q80'], nextLabel:'Listo para cirugía',
   blocks:[
    {h:'Fuerza · 3 × semana', ev:['failla','giesche'], items:[
      X('Prensa unilateral 0–90°','4 × 6–8',{p:[75,85],rpe:'8',lift:'prensa',limb:'L',v:'acel'}),
      X('Extensión de rodilla 90–45°','4 × 6–10',{p:[70,80],rpe:'8',lift:'ext',limb:'L'}),
      X('Sentadilla','4 × 5–6',{p:[70,85],rpe:'8',lift:'sent',v:'acel'}),
      X('Curl femoral','3 × 6–8',{p:[75,85],rpe:'8',lift:'curl',limb:'L'}),
      X('Peso muerto rumano','3 × 6–8',{rpe:'8'})]},
    {h:'Control neuromuscular', ev:['fitzgerald','failla'], items:[
      X('Perturbaciones y equilibrio','2–3 × semana · 3 × 1 min por tarea')]}],
   note:'Meta de LSI de cuádriceps: ≥ 80 % mínimo, ideal ≥ 90 % (consenso).',
   sano:'cx', cx:{bici:'ok',remo:'ok',int:'int'}, tools:['bfr','iso']}
 ]},
 'lca-post':{label:'LCA · postoperatorio', weeks:[0,2,8,16,26], phases:[
  {name:'Fase 1 · Protección y activación', when:'≈ 0–2 semanas', goal:'Controlar el derrame, extensión completa ya, y el cuádriceps encendido desde el día 1.',
   next:['der1','ext','f90','slr','marcha'], nextLabel:'Para pasar a fuerza base',
   blocks:[
    {h:'Activación', ev:['aspetar','vanmelick'], items:[
      X('Isometría de cuádriceps a 0° y 60°','5–10 × 10 s',{rpe:'8',t:'Contracción máxima tolerable; dolor ≤ 3/10.'}),
      X('Electroestimulación del cuádriceps (si dispones)','10–15 contracciones · 1–2 × día',{t:'Aspetar la recomienda en fase temprana.'}),
      X('Elevación de pierna recta','3 × 10–15',{t:'Si hay déficit de extensión activa, no progresar a cargas.'}),
      X('Extensión pasiva: talón elevado / prono','3–5 min · varias veces al día'),
      X('Prensa o minisentadilla 0–45°','3 × 10–15',{p:[30,45],rpe:'5–6',lift:'prensa',limb:'L'})]},
    {h:'Cadera', ev:['exp'], items:[X('Abducción de cadera y puente','3 × 12–15',{rpe:'7'})]}],
   sano:'cx', cx:{bici:'uni',remo:'brazos',int:'base'}, tools:['iso','bfr','mi']},
  {name:'Fase 2 · Fuerza base', when:'≈ 2–8 semanas', goal:'Fuerza en cadena cerrada y abierta, flexión ≥ 120°, sin derrame.',
   next:['derT','ext','f120','d3','q60'], nextLabel:'Para pasar a fuerza máxima',
   blocks:[{h:'Fuerza · 3–4 × semana', ev:['aspetar','vanmelick','helms'], items:[
      X('Prensa unilateral 0–90°','4 × 8–12',{p:[60,75],rpe:'7–8',lift:'prensa',limb:'L'}),
      X('Sentadilla a cajón (90°)','3–4 × 6–10',{p:[60,75],rpe:'7–8',lift:'sent'}),
      X('Extensión de rodilla 90–45°','3 × 10–15',{p:[50,70],rpe:'7',lift:'ext',limb:'L',t:'Desde la semana 4. Rango restringido protege el injerto.'}),
      X('Curl femoral','3 × 10–12',{p:[50,65],rpe:'7',lift:'curl',limb:'L'}),
      X('Peso muerto rumano','3 × 8',{rpe:'7–8'}),
      X('Step-up / step-down','3 × 10',{rpe:'7'}),
      X('Elevación de talones unilateral','4 × 12',{rpe:'8'}),
      X('Apoyo unipodal y perturbaciones suaves','4 × 30–45 s')]}],
   sano:'cx', cx:{bici:'cond',remo:'brazos',int:'base'}, tools:['bfr','mi']},
  {name:'Fase 3 · Fuerza máxima y retorno a correr', when:'≈ 8–16 semanas', goal:'Fuerza máxima, empezar a correr con criterios y pliometría bilateral básica.',
   next:['der0','f95','q80','p80','d3'], nextLabel:'Para pasar a potencia y pliometría',
   extra:{label:'Criterios para empezar a correr', list:['w12','derT','ext','f95','q70','d2'], ev:['rambaud','aspetar']},
   blocks:[
    {h:'Fuerza máxima · 3 × semana', ev:['aspetar','weakley','pareja'], items:[
      X('Sentadilla','4 × 4–6',{p:[75,85],rpe:'8',lift:'sent',v:'acel'}),
      X('Prensa unilateral','4 × 5–8',{p:[75,85],rpe:'8',lift:'prensa',limb:'L'}),
      X('Extensión de rodilla','4 × 6–10',{p:[70,80],rpe:'8',lift:'ext',limb:'L',t:'90–45° hasta ~12 semanas; luego rango completo progresivo.'}),
      X('Curl femoral / nórdico excéntrico','3 × 6–8',{p:[70,80],rpe:'8',lift:'curl',limb:'L'}),
      X('Sentadilla búlgara','3 × 6–8',{rpe:'8'})]},
    {h:'Pliometría y carrera', ev:['aspetar','rambaud'], items:[
      X('Saltos bilaterales submáximos','2–3 × 8–10 contactos',{t:'Aterrizaje silencioso, rodilla alineada.'}),
      X('Carrera intervalada','Caminar-trotar 2–3 × semana',{t:'Solo con los criterios de carrera cumplidos.'})]}],
   sano:'late', cx:{bici:'ok',remo:'cond',int:'int'}, tools:['bfr']},
  {name:'Fase 4 · Potencia, pliometría y cambios de dirección', when:'≈ 4–6 meses', goal:'Convertir la fuerza en potencia, pliometría unilateral y cambios de dirección.',
   next:['q90','d2'], nextLabel:'Para el retorno al deporte',
   blocks:[
    {h:'Fuerza máxima · 2 × semana', ev:['pareja','weakley'], items:[
      X('Sentadilla','4 × 3–5',{p:[85,90],rpe:'8–9',lift:'sent',v:'fmax'}),
      X('Prensa unilateral','4 × 4–6',{p:[80,90],rpe:'8',lift:'prensa',limb:'L',v:'fmax'}),
      X('Extensión de rodilla','4 × 6–8',{p:[75,85],rpe:'8',lift:'ext',limb:'L'})]},
    {h:'Potencia y pliometría · 2 × semana', ev:['aspetar','kotsifaki22'], items:[
      X('Sentadilla con salto / salto con trap bar','4 × 4–5',{p:[30,50],lift:'sent',v:'vf'}),
      X('Pliometría unilateral progresiva','60–100 contactos',{t:'Salto al cajón → hop simple → triple → drop jump bajo.'}),
      X('Aceleración, desaceleración y cambios de dirección','45° → 90° → 180° · preplanificado → reactivo')]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:[]},
  {name:'Fase 5 · Retorno al deporte', when:'≥ 9 meses', goal:'Exposición progresiva al deporte en condiciones reales, incluida la fatiga.',
   next:['w39','der0','q90','d2'], nextLabel:'Criterios de retorno al deporte',
   blocks:[{h:'Deporte y mantenimiento', ev:['grindem','kotsifaki22','aspetar'], items:[
      X('Entrenamiento con equipo progresivo','Sin contacto → contacto → competición'),
      X('Fuerza de mantenimiento','2 × semana',{p:[80,90],rpe:'8',lift:'sent',v:'fmax'}),
      X('Pliometría y agilidad en fatiga','1–2 × semana')]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:[]}
 ]}
};

const GRAFT = {
  hth:{t:'Injerto HTH',m:'Vigila dolor anterior y de la zona donante: aplica el monitoreo de dolor de tendinopatía (≤ 3/10, basal a las 24 h) en la extensión de rodilla y evita arrodillarse los primeros meses.',ev:['silbernagel','exp']},
  isq:{t:'Injerto de isquiotibiales',m:'Protege la zona donante: sin curl femoral pesado aislado ~6–8 semanas. Isometría submáxima primero, luego progresa según dolor. En esta app el curl femoral de las fases 1–2 se lee como submáximo.',ev:['exp']},
  qt:{t:'Injerto cuadricipital',m:'La inhibición del cuádriceps suele ser mayor y la zona donante está en él: prioriza activación temprana (electroestimulación, BFR) y progresa la extensión abierta con más cautela.',ev:['exp']},
  allo:{t:'Aloinjerto',m:'La incorporación biológica es más lenta: progresiones de carga y retorno más conservadores (con frecuencia ≥ 12 meses).',ev:['exp']}
};

/* ===================== REFERENCIAS NUEVAS ===================== */
Object.assign(R, {
  crossley16:{l:'C',c:'Crossley KM, van Middelkoop M, Callaghan MJ, et al. 2016 Patellofemoral pain consensus statement from the 4th International Patellofemoral Pain Research Retreat, Manchester. Part 2: recommended physical interventions. Br J Sports Med. 2016;50(14):844-852.',k:'Ejercicio combinado de cadera y rodilla como base; plantillas a corto plazo.'},
  willy19:{l:'A',c:'Willy RW, Hoglund LT, Barton CJ, et al. Patellofemoral pain: clinical practice guidelines linked to the International Classification of Functioning, Disability and Health from the Academy of Orthopaedic Physical Therapy of the APTA. J Orthop Sports Phys Ther. 2019;49(9):CPG1-CPG95.',k:'Recomendación fuerte para ejercicio de cadera y rodilla; reentrenamiento de la carrera en corredores; ortesis y vendaje solo a corto plazo y combinados con ejercicio.'},
  heiderscheit:{l:'B',c:'Heiderscheit BC, Chumanov ES, Michalski MP, Wille CM, Ryan MB. Effects of step rate manipulation on joint mechanics during running. Med Sci Sports Exerc. 2011;43(2):296-302.',k:'Subir la cadencia 5–10 % redujo la carga sobre la rodilla al correr.'},
  foster01:{l:'B',c:'Foster C, Florhaug JA, Franklin J, et al. A new approach to monitoring exercise training. J Strength Cond Res. 2001;15(1):109-115.',k:'Carga interna = RPE de la sesión (CR-10) × minutos.'},
  haddad17:{l:'B',c:'Haddad M, Stylianides G, Djaoui L, Dellal A, Chamari K. Session-RPE method for training load monitoring: validity, ecological usefulness, and influencing factors. Front Neurosci. 2017;11:612.',k:'El RPE de sesión es válido y práctico para monitorizar la carga interna en distintos deportes.'},
  buckthorpe19:{l:'C',c:'Buckthorpe M, Della Villa F, Della Villa S, Roi GS. On-field rehabilitation part 1: 4 pillars of high-quality on-field rehabilitation are restoring movement quality, physical conditioning, restoring sport-specific skills, and progressively developing chronic training load. J Orthop Sports Phys Ther. 2019;49(8):565-569.',k:'El retorno en campo progresa calidad de movimiento, condición física, habilidades del deporte y carga crónica.'},
  webster08:{l:'B',c:'Webster KE, Feller JA, Lambros C. Development and preliminary validation of a scale to measure the psychological impact of returning to sport following anterior cruciate ligament reconstruction surgery. Phys Ther Sport. 2008;9(1):9-15.',k:'ACL-RSI: emoción, confianza y valoración del riesgo (0–100).'},
  irrgang01:{l:'B',c:'Irrgang JJ, Anderson AF, Boland AL, et al. Development and validation of the International Knee Documentation Committee subjective knee form. Am J Sports Med. 2001;29(5):600-613.',k:'IKDC subjetivo (0–100).'},
  roos98:{l:'B',c:'Roos EM, Roos HP, Lohmander LS, Ekdahl C, Beynnon BD. Knee Injury and Osteoarthritis Outcome Score (KOOS): development of a self-administered outcome measure. J Orthop Sports Phys Ther. 1998;28(2):88-96.',k:'KOOS; la subescala Deporte/Recreación es la más sensible en deportistas.'},
  visentini98:{l:'B',c:'Visentini PJ, Khan KM, Cook JL, et al. The VISA score: an index of severity of symptoms in patients with jumper’s knee (patellar tendinosis). J Sci Med Sport. 1998;1(1):22-28.',k:'VISA-P (0–100) para tendinopatía rotuliana.'},
  kujala93:{l:'B',c:'Kujala UM, Jaakkola LH, Koskinen SK, et al. Scoring of patellofemoral disorders. Arthroscopy. 1993;9(2):159-163.',k:'AKPS / Kujala (0–100) para dolor patelofemoral.'}
});

/* ===================== DOLOR PATELOFEMORAL ===================== */
P.pfp = {label:'Dolor patelofemoral', phases:[
  {name:'Fase 1 · Calmar y cargar en rangos cómodos', when:'2–4 semanas aprox.', goal:'Bajar la irritabilidad reduciendo el estrés patelofemoral (rango y volumen) mientras se fortalecen cadera y cuádriceps.',
   next:['d3','derT'], nextLabel:'Para pasar a fuerza en rango completo',
   blocks:[
    {h:'Cadera', ev:['crossley16','willy19'], items:[
      X('Abducción de cadera en decúbito lateral','3 × 10–15',{rpe:'8'}),
      X('Clamshell con banda','3 × 15',{rpe:'8'}),
      X('Plancha lateral con abducción','3 × 20–30 s',{rpe:'8'}),
      X('Hip thrust','4 × 8–10',{rpe:'8'})]},
    {h:'Rodilla en rangos de bajo estrés patelofemoral', ev:['willy19','exp'], items:[
      X('Prensa 0–45°','4 × 8–12',{rpe:'7–8',lift:'prensa',t:'En cadena cerrada el estrés patelofemoral es menor cerca de la extensión.'}),
      X('Extensión de rodilla 90–45°','3 × 10–12',{rpe:'7–8',lift:'ext',t:'En cadena abierta el estrés es menor en flexión.'}),
      X('Minisentadilla 0–45°','3 × 10–12',{rpe:'7',lift:'sent'})]}],
   note:'Plantillas o vendaje rotuliano: alivio a corto plazo, siempre junto al ejercicio (nivel C).',
   sano:'late', cx:{bici:'ok',remo:'cond',int:'base'}, tools:['iso']},
  {name:'Fase 2 · Fuerza en rango completo', when:'4–8 semanas aprox.', goal:'Ampliar el rango cargado según dolor y llevar cadera y cuádriceps a fuerza máxima.',
   next:['d3','q90'], nextLabel:'Para pasar a potencia y retorno',
   blocks:[{h:'Fuerza · 3 × semana', ev:['crossley16','willy19'], items:[
      X('Sentadilla progresando profundidad','4 × 6–8',{rpe:'8',lift:'sent',t:'Amplía el rango 10–15° cuando el dolor sea ≤ 3/10.'}),
      X('Sentadilla búlgara','3 × 6–8',{rpe:'8',lift:'prensa'}),
      X('Step-down excéntrico','3 × 8–10',{rpe:'7–8',t:'Control del valgo dinámico y de la caída de la pelvis.'}),
      X('Extensión de rodilla rango completo progresivo','3 × 8–10',{rpe:'8',lift:'ext'}),
      X('Peso muerto rumano','3 × 6–8',{rpe:'8'}),
      X('Abducción de cadera en polea','3 × 10–12',{rpe:'8'})]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'int'}, tools:[]},
  {name:'Fase 3 · Potencia y retorno', when:'Desde dolor ≤ 3/10 en sentadilla profunda', goal:'Pliometría, carrera y gesto deportivo sin reaparición del dolor.',
   next:['d2','q90'], nextLabel:'Criterios de alta',
   blocks:[{h:'Potencia y pliometría', ev:['willy19','heiderscheit','exp'], items:[
      X('Sentadilla','4 × 3–5',{rpe:'8',lift:'sent'}),
      X('Sentadilla búlgara','3 × 5–6',{rpe:'8',lift:'prensa'}),
      X('Progresión de saltos','2–4 × 6–10 contactos',{rpe:'7–8',t:'Bilateral → unilateral; dolor ≤ 3/10 y vuelta a basal a las 24 h.'}),
      X('Carrera con cadencia +5–10 %','Progresión semanal',{t:'Subir la cadencia reduce la carga sobre la rodilla al correr.'})]}],
   sano:'late', cx:{bici:'ok',remo:'ok',int:'sprint'}, tools:[]}
]};

/* ===================== RETORNO ESPECÍFICO POR DEPORTE ===================== */
const PERFILES = {
  '':{l:'Sin perfil específico'},
  uwr:{l:'Rugby subacuático', ev:['exp'], items:[
    X('Aleteo técnico con aletas cortas','4–6 × 2 min',{rpe:'5–6',t:'Patada desde la cadera, rodilla con flexión moderada. Empieza en superficie y luego en inmersión.'}),
    X('Sprints con aletas en apnea','6–8 × 15 m',{rpe:'7–8',t:'Recuperación completa en superficie entre series.'}),
    X('Giros, frenadas y cambios de dirección en el agua','4 × 6',{rpe:'7',t:'Primero preplanificados, luego reactivos.'}),
    X('Lucha por el balón con contacto progresivo','4–6 × 30 s',{rpe:'7–8',t:'Oposición pasiva → activa → libre.'}),
    X('Juego reducido en el agua','Progresivo',{t:'Minutos y número de jugadores crecientes antes del partido completo.'})]},
  futbol:{l:'Fútbol', ev:['buckthorpe19','exp'], items:[
    X('Carrera lineal progresiva','Volumen creciente',{rpe:'6–7',t:'Trote → carrera → sprints al 70–90 %.'}),
    X('Curvas y cambios de ritmo','4–6 × 30–40 m',{rpe:'7'}),
    X('Técnica con balón','15–20 min',{t:'Pase corto → largo → conducción → remate.'}),
    X('Cambios de dirección con balón','4–6 × 20 s',{rpe:'7–8',t:'Preplanificado → reactivo.'}),
    X('Juegos reducidos','Progresivo',{t:'Sin contacto → contacto → entrenamiento con el grupo.'})]},
  cancha:{l:'Baloncesto o voleibol', ev:['buckthorpe19','exp'], items:[
    X('Saltos y aterrizajes repetidos','3–4 × 6–8',{rpe:'7–8',t:'Aterrizaje silencioso y alineado; progresar a salto de remate o rebote.'}),
    X('Desplazamientos laterales y defensivos','4–6 × 15 s',{rpe:'7'}),
    X('Cambios de dirección reactivos','4–6 × 15 s',{rpe:'8'}),
    X('Juego reducido con contacto progresivo','Progresivo')]},
  carrera:{l:'Carrera', ev:['heiderscheit','exp'], items:[
    X('Carrera continua progresiva','Volumen creciente',{rpe:'4–6',t:'Sube volumen solo con dolor ≤ 3/10 y vuelta a basal a las 24 h.'}),
    X('Cadencia +5–10 %','En todas las salidas',{t:'Reduce la carga sobre la rodilla.'}),
    X('Intervalos o cuestas','4–6 × 2–3 min',{rpe:'7–8'})]},
  natacion:{l:'Natación', ev:['exp'], items:[
    X('Patada de crol o espalda con tabla','6–8 × 50 m',{rpe:'6–7'}),
    X('Nado completo progresivo','Volumen creciente',{rpe:'6–7'}),
    X('Patada de braza','Al final de la progresión',{t:'Valgo y rotación con carga: la dejo para fases tardías en LCA y menisco.'})]}
};

/* ===================== BIBLIOTECA ESTRUCTURADA ===================== */
// pat: patrón; fx: flexión máxima de rodilla con carga (°); tn: estrés tendón/patelofemoral 0–2; im: impacto 0/1; cue: claves técnicas
const ALT = [
  {n:'Isometría de cuádriceps a 60°',pat:'iso',fx:60,tn:0,im:0,cue:'Empuja contra la resistencia sin moverte; sube la intensidad poco a poco.'},
  {n:'Extensión de rodilla isométrica a 60°',pat:'iso',fx:60,tn:1,im:0,cue:'5 × 45 s; respira, no aguantes el aire.'},
  {n:'Sentadilla isométrica en pared',pat:'iso',fx:70,tn:1,im:0,cue:'Espalda en la pared, rodillas sobre los pies.'},
  {n:'Spanish squat',pat:'iso',fx:70,tn:1,im:0,cue:'Banda detrás de las rodillas; tibias verticales, cadera atrás.'},
  {n:'Isometría de cuádriceps a 30°',pat:'iso',fx:30,tn:0,im:0,cue:'Rango corto, útil con flexión limitada.'},
  {n:'Extensión de rodilla 90–45°',pat:'okc',fx:90,tn:1,im:0,cue:'Sube controlado, sin bloquear la rodilla.'},
  {n:'Extensión de rodilla 90–30°',pat:'okc',fx:90,tn:1,im:0,cue:'Tempo 2 s subir, 3 s bajar.'},
  {n:'Extensión de rodilla unilateral',pat:'okc',fx:90,tn:2,im:0,cue:'Pausa 1 s arriba.'},
  {n:'TKE con banda',pat:'okc',fx:30,tn:0,im:0,cue:'Bloquea la extensión y aprieta el cuádriceps 1–2 s.'},
  {n:'Prensa 0–45°',pat:'domr',fx:45,tn:0,im:0,cue:'Pies a la altura de la cadera, rodillas alineadas.'},
  {n:'Prensa unilateral 0–60°',pat:'uni',fx:60,tn:1,im:0,cue:'Rodilla en línea con el segundo dedo.'},
  {n:'Prensa unilateral 0–90°',pat:'uni',fx:90,tn:2,im:0,cue:'Baja controlado, no despegues la pelvis.'},
  {n:'Minisentadilla 0–60°',pat:'domr',fx:60,tn:1,im:0,cue:'Cadera atrás, peso repartido.'},
  {n:'Sentadilla a cajón (≤ 90°)',pat:'domr',fx:90,tn:1,im:0,cue:'Toca el cajón sin sentarte.'},
  {n:'Sentadilla goblet',pat:'domr',fx:110,tn:2,im:0,cue:'Codos dentro de las rodillas, tronco erguido.'},
  {n:'Sentadilla trasera',pat:'domr',fx:120,tn:2,im:0,cue:'Bracea antes de bajar; rodillas siguen a los pies.'},
  {n:'Sentadilla hack',pat:'domr',fx:120,tn:2,im:0,cue:'Espalda pegada al respaldo.'},
  {n:'Sentadilla búlgara',pat:'uni',fx:110,tn:2,im:0,cue:'Tronco ligeramente inclinado, rodilla adelantada controlada.'},
  {n:'Step-up',pat:'uni',fx:90,tn:1,im:0,cue:'Empuja con la pierna de arriba, no impulses con la de abajo.'},
  {n:'Step-down excéntrico',pat:'uni',fx:60,tn:1,im:0,cue:'Baja en 3 s; pelvis nivelada.'},
  {n:'Split squat estático',pat:'uni',fx:90,tn:1,im:0,cue:'Baja vertical; rodilla de atrás hacia el suelo.'},
  {n:'Peso muerto rumano',pat:'domc',fx:20,tn:0,im:0,cue:'Bisagra de cadera, espalda neutra, rodillas suaves.'},
  {n:'Peso muerto rumano unilateral',pat:'domc',fx:20,tn:0,im:0,cue:'Cadera cuadrada al suelo.'},
  {n:'Hip thrust',pat:'domc',fx:90,tn:0,im:0,cue:'Mentón al pecho, extiende la cadera sin arquear la lumbar.'},
  {n:'Puente de glúteo',pat:'domc',fx:90,tn:0,im:0,cue:'Aprieta glúteos arriba 2 s.'},
  {n:'Curl femoral unilateral',pat:'isq',fx:90,tn:0,im:0,cue:'Baja en 3 s.'},
  {n:'Curl femoral con fitball',pat:'isq',fx:90,tn:0,im:0,cue:'Cadera arriba durante todo el movimiento.'},
  {n:'Nórdico excéntrico asistido',pat:'isq',fx:90,tn:0,im:0,cue:'Baja lo más lento posible.'},
  {n:'Abducción de cadera en decúbito lateral',pat:'glu',fx:0,tn:0,im:0,cue:'Talón hacia atrás, sin rotar la pelvis.'},
  {n:'Clamshell con banda',pat:'glu',fx:45,tn:0,im:0,cue:'Pies juntos, pelvis quieta.'},
  {n:'Abducción de cadera en polea',pat:'glu',fx:0,tn:0,im:0,cue:'Tronco quieto.'},
  {n:'Marcha lateral con banda',pat:'glu',fx:30,tn:0,im:0,cue:'Rodillas semiflexionadas, pasos cortos.'},
  {n:'Plancha lateral con abducción',pat:'glu',fx:0,tn:0,im:0,cue:'Cuerpo en línea recta.'},
  {n:'Elevación de talón unilateral',pat:'pant',fx:0,tn:0,im:0,cue:'Sube completo, baja en 3 s.'},
  {n:'Elevación de talón sentado',pat:'pant',fx:90,tn:0,im:0,cue:'Trabaja el sóleo.'},
  {n:'Apoyo unipodal con perturbación',pat:'est',fx:20,tn:0,im:0,cue:'Rodilla suave, pelvis nivelada.'},
  {n:'Apoyo unipodal en superficie inestable',pat:'est',fx:20,tn:0,im:0,cue:'Mira al frente; luego ojos cerrados.'},
  {n:'Y-balance dinámico',pat:'est',fx:60,tn:1,im:0,cue:'Alcanza lejos sin perder la alineación.'},
  {n:'Saltos de tobillo (pogo)',pat:'plio',fx:20,tn:1,im:1,cue:'Contactos cortos y rígidos.'},
  {n:'Saltos bilaterales al cajón',pat:'plio',fx:90,tn:1,im:1,cue:'Aterriza suave arriba; baja caminando.'},
  {n:'Saltos bilaterales submáximos',pat:'plio',fx:60,tn:2,im:1,cue:'Aterrizaje silencioso.'},
  {n:'Hop unipodal con estabilización',pat:'plio',fx:60,tn:2,im:1,cue:'Mantén el aterrizaje 2 s.'},
  {n:'Drop jump bajo',pat:'plio',fx:60,tn:2,im:1,cue:'Rebota rápido; altura de caja baja.'},
  {n:'Bici',pat:'cardio',fx:110,tn:0,im:0,cue:'Sillín a la altura de la cadera.'},
  {n:'Bici unipodal con el sano',pat:'cardio',fx:0,tn:0,im:0,cue:'Pierna afectada en un taburete.'},
  {n:'Remo',pat:'cardio',fx:125,tn:1,im:0,cue:'Piernas → tronco → brazos.'},
  {n:'Remo solo brazos y tronco',pat:'cardio',fx:0,tn:0,im:0,cue:'Piernas fijas.'},
  {n:'Ergómetro de brazos',pat:'cardio',fx:0,tn:0,im:0,cue:'Intervalos igual que en bici.'},
  {n:'Press banca',pat:'sup-eh',fx:0,tn:0,im:0,cue:'Escápulas atrás y abajo, pies firmes.'},
  {n:'Press con mancuernas en banco',pat:'sup-eh',fx:0,tn:0,im:0,cue:'Codos a 45°.'},
  {n:'Press inclinado con mancuernas',pat:'sup-eh',fx:0,tn:0,im:0,cue:'Banco a 30°.'},
  {n:'Flexiones con lastre',pat:'sup-eh',fx:0,tn:0,im:0,cue:'Cuerpo en bloque.'},
  {n:'Dominadas (lastradas si hace más de 8)',pat:'sup-tv',fx:0,tn:0,im:0,cue:'Pecho a la barra, sin balanceo.'},
  {n:'Jalón al pecho',pat:'sup-tv',fx:90,tn:0,im:0,cue:'Lleva los codos a los bolsillos.'},
  {n:'Press de hombro sentado con respaldo',pat:'sup-ev',fx:90,tn:0,im:0,cue:'Costillas abajo.'},
  {n:'Press de hombro de pie o landmine',pat:'sup-ev',fx:0,tn:0,im:0,cue:'Glúteos apretados, sin arquear.'},
  {n:'Remo con pecho apoyado',pat:'sup-th',fx:0,tn:0,im:0,cue:'Lleva el codo atrás, pausa 1 s.'},
  {n:'Remo con mancuerna a una mano',pat:'sup-th',fx:0,tn:0,im:0,cue:'Apoyo en banco con la mano.'},
  {n:'Face pull',pat:'sup-acc',fx:0,tn:0,im:0,cue:'Tira hacia la frente abriendo codos.'},
  {n:'Press cerrado en banco',pat:'sup-acc',fx:0,tn:0,im:0,cue:'Codos pegados.'},
  {n:'Curl de bíceps + extensión de tríceps en superserie',pat:'sup-acc',fx:0,tn:0,im:0,cue:'Sin balanceo.'},
  {n:'Dead bug',pat:'core',fx:90,tn:0,im:0,cue:'Lumbar pegada al suelo.'},
  {n:'Pallof press sentado',pat:'core',fx:90,tn:0,im:0,cue:'Resiste la rotación.'},
  {n:'Pallof press de pie',pat:'core',fx:0,tn:0,im:0,cue:'Pelvis quieta.'},
  {n:'Pallof press con rotación',pat:'core',fx:0,tn:0,im:0,cue:'Rota desde la cadera.'},
  {n:'Hollow hold',pat:'core',fx:0,tn:0,im:0,cue:'Lumbar al suelo.'},
  {n:'Plancha frontal',pat:'core',fx:0,tn:0,im:0,cue:'Glúteos activos.'},
  {n:'Plancha lateral',pat:'core',fx:0,tn:0,im:0,cue:'Cadera arriba.'},
  {n:'Plancha con arrastre',pat:'core',fx:0,tn:0,im:0,cue:'Sin girar la pelvis.'},
  {n:'Caminata de granjero unilateral',pat:'core',fx:0,tn:0,im:0,cue:'Hombros nivelados.'}
];
const ALTMAP = Object.fromEntries(ALT.map(a=>[a.n,a]));
function classify(name){
  const n=(name||'').toLowerCase();
  if(ALTMAP[name]) return ALTMAP[name].pat;
  if(/isom|spanish/.test(n)) return 'iso';
  if(/salto|pogo|aterrizaj|hop|pliom|drop jump/.test(n)) return 'plio';
  if(/extensión de rodilla|tke|extensión terminal/.test(n)) return 'okc';
  if(/búlgara|step|split|unilateral 0|prensa unilateral/.test(n)) return 'uni';
  if(/sentadilla|prensa/.test(n)) return 'domr';
  if(/peso muerto|hip thrust|puente/.test(n)) return 'domc';
  if(/curl femoral|nórdico/.test(n)) return 'isq';
  if(/abducci|glúteo|marcha lateral|clamshell/.test(n)) return 'glu';
  if(/talón|talones|gemel/.test(n)) return 'pant';
  if(/unipodal|estabilidad|perturbaci|balance/.test(n)) return 'est';
  if(/^bici|^remo(?! con)|ergómetro|carrera/.test(n)) return 'cardio';
  if(/plancha|pallof|dead bug|hollow|granjero/.test(n)) return 'core';
  if(/press banca|mancuernas en banco|flexiones/.test(n)) return 'sup-eh';
  if(/dominada|jalón/.test(n)) return 'sup-tv';
  if(/press de hombro/.test(n)) return 'sup-ev';
  if(/remo con|remo a una/.test(n)) return 'sup-th';
  return null;
}
