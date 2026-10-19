/* ===================== MÓDULOS: REHABILITACIÓN · DEPORTE · SALUD ===================== */
const MODULOS = {rodilla:'Rehabilitación', deporte:'Entrenamiento · Deporte', salud:'Entrenamiento · Salud'};
const modOf = s => (s && MODULOS[s.modulo]) ? s.modulo : 'rodilla';
const isRod = s => modOf(s)==='rodilla';
const nDias = s => { const n=+((s&&s.dias)||3); return isRod(s) ? (n===4?4:3) : Math.max(2,Math.min(4,n||3)); };

/* ---------- Referencias nuevas ---------- */
Object.assign(R, {
  bosquet07:{l:'A',c:'Bosquet L, Montpetit J, Arvisais D, Mujika I. Effects of tapering on performance: a meta-analysis. Med Sci Sports Exerc. 2007;39(8):1358-1365.',k:'Mejor taper: 8–14 días, bajar el volumen 41–60 % manteniendo intensidad y frecuencia.'},
  pritchard15:{l:'C',c:'Pritchard H, Keogh J, Barnes M, McGuigan M. Effects and mechanisms of tapering in maximizing muscular strength. Strength Cond J. 2015;37(2):72-83.',k:'Para fuerza máxima: taper de ~1–2 semanas con volumen reducido y carga alta.'},
  spiering21:{l:'B',c:'Spiering BA, Mujika I, Sharp MA, Foulis SA. Maintaining physical performance: the minimal dose of exercise needed to preserve endurance and strength over time. J Strength Cond Res. 2021;35(5):1449-1458.',k:'La fuerza se mantiene hasta ~32 semanas con 1 sesión y 1 serie por ejercicio por semana si se conserva la intensidad.'},
  currier23:{l:'A',c:'Currier BS, McLeod JC, Banfield L, et al. Resistance training prescription for muscle strength and hypertrophy in healthy adults: a systematic review and Bayesian network meta-analysis. Br J Sports Med. 2023;57(18):1211-1220.',k:'Cualquier prescripción sirve; para fuerza máxima, cargas altas y varias series; para hipertrofia, varias series con cargas variadas.'},
  suchomel16:{l:'C',c:'Suchomel TJ, Nimphius S, Stone MH. The importance of muscular strength in athletic performance. Sports Med. 2016;46(10):1419-1449.',k:'Más fuerza se asocia a mejor salto, sprint y cambio de dirección y a menos lesiones.'},
  lauersen14:{l:'A',c:'Lauersen JB, Bertelsen DM, Andersen LB. The effectiveness of exercise interventions to prevent sports injuries: a systematic review and meta-analysis of randomised controlled trials. Br J Sports Med. 2014;48(11):871-877.',k:'El entrenamiento de fuerza redujo las lesiones deportivas a menos de un tercio.'},
  vandyk19:{l:'A',c:'van Dyk N, Behan FP, Whiteley R. Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries: a systematic review and meta-analysis of 8459 athletes. Br J Sports Med. 2019;53(21):1362-1370.',k:'Incluir el nórdico reduce ~50 % las lesiones de isquiotibiales.'},
  haroy19:{l:'B',c:'Harøy J, Clarsen B, Wiger EG, et al. The Adductor Strengthening Programme prevents groin problems among male football players: a cluster-randomised controlled trial. Br J Sports Med. 2019;53(3):150-157.',k:'Copenhague 3 veces por semana en pretemporada: 41 % menos problemas de ingle.'},
  fragala19:{l:'C',c:'Fragala MS, Cadore EL, Dorgo S, et al. Resistance training for older adults: position statement from the National Strength and Conditioning Association. J Strength Cond Res. 2019;33(8):2019-2052.',k:'2–3 días por semana, 1–3 series de 6–12 reps progresando hasta cargas altas; incluir potencia (subida rápida) y equilibrio.'},
  sherrington19:{l:'A',c:'Sherrington C, Fairhall NJ, Wallbank GK, et al. Exercise for preventing falls in older people living in the community. Cochrane Database Syst Rev. 2019;1:CD012424.',k:'El ejercicio reduce ~23 % la tasa de caídas; los programas de equilibrio y funcionales son los más eficaces.'},
  who20:{l:'C',c:'Bull FC, Al-Ansari SS, Biddle S, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020;54(24):1451-1462.',k:'Fuerza de los grandes grupos musculares ≥ 2 días por semana; en mayores, trabajo multicomponente con equilibrio ≥ 3 días.'},
  acsm09:{l:'C',c:'American College of Sports Medicine. Progression models in resistance training for healthy adults. Med Sci Sports Exerc. 2009;41(3):687-708.',k:'Principiantes: 1–3 series de 8–12 reps; progresar carga 2–10 % cuando se superan las reps objetivo.'},
  foster98:{l:'B',c:'Foster C. Monitoring training in athletes with reference to overtraining syndrome. Med Sci Sports Exerc. 1998;30(7):1164-1168.',k:'Monotonía = carga media diaria / desviación estándar; tensión = carga semanal × monotonía. Picos de tensión precedieron a enfermedades y bajones.'},
  impellizzeri20:{l:'C',c:'Impellizzeri FM, Tenan MS, Kempton T, Novak A, Coutts AJ. Acute:chronic workload ratio: conceptual issues and fundamental pitfalls. Int J Sports Physiol Perform. 2020;15(6):907-913.',k:'El ACWR tiene problemas conceptuales y estadísticos; no usarlo para predecir lesiones.'},
  hooper95:{l:'B',c:'Hooper SL, Mackinnon LT, Howard A, Gordon RD, Bachmann AW. Markers for monitoring overtraining and recovery. Med Sci Sports Exerc. 1995;27(1):106-112.',k:'Sueño, estrés, fatiga y dolor muscular en escala 1–7: marcadores simples de sobreentrenamiento.'},
  saw16:{l:'A',c:'Saw AE, Main LC, Gastin PB. Monitoring the athlete training response: subjective self-reported measures trump commonly used objective measures: a systematic review. Br J Sports Med. 2016;50(5):281-291.',k:'Las medidas subjetivas reflejan la carga aguda y crónica mejor que los marcadores objetivos habituales.'}
});

/* ---------- Niveles y poblaciones ---------- */
const NIVELES = {ini:{l:'Principiante · menos de 1 año entrenando fuerza', dR:-1, dS:-1}, int:{l:'Intermedio · 1–3 años', dR:0, dS:0}, av:{l:'Avanzado · más de 3 años', dR:0, dS:1}};
const POBL = {sed:{l:'Adulto sedentario o que empieza'}, act:{l:'Adulto activo'}, may:{l:'Adulto mayor (65 años o más)'}};

/* ---------- Perfiles por deporte ---------- */
const DEPORTES = {
  uwr:{l:'Rugby subacuático', ev:['exp'],
    prev:[X('Rotación externa de hombro con banda','2 × 12–15',{rpe:'7'}), X('Aducción Copenhague','2 × 6–8 por lado',{rpe:'7–8'}), X('Pinza disco','3 × 20–30 s',{rpe:'8',t:'Agarre para la lucha por el balón.'})],
    neuro:[X('Lanzamiento rotacional de balón medicinal','3 × 5 por lado',{t:'Máxima intención; rotación desde la cadera.'}), X('Salto al cajón','3 × 4',{t:'Despegue explosivo, como al salir del fondo.'}), X('Jalón al pecho explosivo con banda','3 × 6',{t:'Tirón rápido, regreso controlado.'})],
    acc:[X('Hip thrust unilateral','3 × 8–10',{rpe:'8',t:'Extensión de cadera para el aleteo.'}), X('Pallof press + rotación','3 × 8 por lado',{rpe:'8'})],
    nota:'Prioridad: tracción, agarre, potencia rotacional y extensión de cadera para el aleteo. Lo específico en el agua y la apnea los dirige el entrenamiento del club.'},
  natacion:{l:'Natación', ev:['exp'],
    prev:[X('Rotación externa de hombro con banda','2 × 12–15',{rpe:'7'}), X('Face pull','2 × 12–15',{rpe:'7'})],
    neuro:[X('Jalón al pecho explosivo con banda','3 × 6',{t:'Tirón rápido.'}), X('Lanzamiento de balón medicinal hacia abajo','3 × 6',{t:'Extensión de hombro potente.'}), X('Salto al cajón','3 × 4',{t:'Transferencia a salidas y virajes.'})],
    acc:[X('Pullover con mancuerna','3 × 10–12',{rpe:'8'}), X('Dead bug','3 × 8 por lado',{rpe:'7'})],
    nota:'Volumen alto de hombro en el agua: en seco prioriza tracción, rotadores externos y control escapular; limita el press por encima de la cabeza si hay dolor de hombro.'},
  futbol:{l:'Fútbol', ev:['vandyk19','haroy19','lauersen14'],
    prev:[X('Curl nórdico','2–3 × 4–6',{rpe:'8',t:'Excéntrico lento; baja todo lo que puedas controlar.'}), X('Aducción Copenhague','2–3 × 6–10 por lado',{rpe:'8'})],
    neuro:[X('Sprint 10–20 m','5 × 1',{t:'Recuperación completa (≥ 90 s). Máxima velocidad.'}), X('Sprint en zigzag','4 × 1',{t:'Cambio de dirección; primero preplanificado, luego reactivo.'}), X('Saltos laterales unipodales','3 × 5 por lado',{t:'Aterrizaje estable y alineado.'})],
    acc:[X('Elevación de talón unilateral','3 × 10–12',{rpe:'8'}), X('Hip thrust unilateral','3 × 8–10',{rpe:'8'})],
    nota:'Nórdico y Copenhague tienen la mejor evidencia preventiva del fútbol: mantenlos todo el año, también en competencia (bajando volumen).'},
  carrera:{l:'Carrera', ev:['lauersen14','exp'],
    prev:[X('Elevación de talón unilateral con rodilla flexionada','3 × 10–15',{rpe:'8',t:'Sóleo: es el músculo que más carga soporta al correr.'}), X('Elevación de talón unilateral','3 × 10–12',{rpe:'8'})],
    neuro:[X('Saltos de tobillo (pogo)','3 × 15–20',{t:'Rígido y reactivo, contacto corto.'}), X('Skipping','3 × 15 m',{t:'Técnica de carrera.'}), X('Saltos unipodales en el sitio','3 × 8 por lado',{t:'Contacto corto.'})],
    acc:[X('Step up a cajón','3 × 8 por lado',{rpe:'8'}), X('Peso muerto rumano unilateral','3 × 8 por lado',{rpe:'8'})],
    nota:'La fuerza pesada y la pliometría mejoran la economía de carrera sin sumar kilómetros. Evita la sesión pesada de piernas el día antes de la sesión de calidad.'},
  cancha:{l:'Baloncesto o voleibol', ev:['lauersen14','exp'],
    prev:[X('Equilibrio unipodal con perturbación','3 × 30 s',{t:'Tobillo y rodilla: el mayor riesgo es el esguince al aterrizar.'}), X('Curl nórdico','2 × 4–6',{rpe:'8'})],
    neuro:[X('Salto al cajón','3 × 4',{t:'Máxima altura, aterrizaje suave.'}), X('Saltos de profundidad (drop jump)','3 × 4',{t:'Desde 30–40 cm; contacto corto. Solo con buena técnica de aterrizaje.'}), X('Desplazamientos laterales reactivos','4 × 10 s',{t:'A una señal.'})],
    acc:[X('Elevación de talón unilateral','3 × 10–12',{rpe:'8'}), X('Rotación externa de hombro con banda','2 × 12–15',{rpe:'7'})],
    nota:'Saltos y aterrizajes son el día a día del deporte: cuenta los saltos del entrenamiento técnico antes de sumar más pliometría.'},
  raqueta:{l:'Tenis, pádel o squash', ev:['exp'],
    prev:[X('Rotación externa de hombro con banda','2 × 12–15',{rpe:'7'}), X('Excéntrico de extensores de muñeca','2 × 12–15',{rpe:'7',t:'Prevención de epicondilalgia.'})],
    neuro:[X('Lanzamiento lateral de balón medicinal','3 × 5 por lado',{t:'Rotación potente desde la cadera.'}), X('Desplazamientos laterales reactivos','4 × 10 s',{t:'A una señal.'}), X('Saltos laterales','3 × 6',{t:'Rápidos y controlados.'})],
    acc:[X('Pallof press + rotación','3 × 8 por lado',{rpe:'8'}), X('Face pull','3 × 12–15',{rpe:'7'})],
    nota:'Deporte asimétrico: compensa con trabajo unilateral del lado no dominante y rotadores externos del hombro.'},
  gimnasio:{l:'Gimnasio o fuerza general', ev:['currier23'],
    prev:[X('Face pull','2 × 12–15',{rpe:'7'})],
    neuro:[X('Salto al cajón','3 × 4',{t:'Máxima intención.'}), X('Lanzamiento de balón medicinal al pecho (pared)','3 × 6',{t:'Máxima intención.'})],
    acc:[X('Curl de bíceps','3 × 10–12',{rpe:'8'}), X('Extensión de tríceps en polea','3 × 10–12',{rpe:'8'})],
    nota:'Objetivo general de fuerza e hipertrofia: la progresión de carga manda.'}
};

/* ---------- Fases (temporada y salud) ---------- */
const gph = (name, when, goal, extra) => Object.assign({name, when, goal, next:[], nextLabel:'', blocks:[], sano:null, tools:[], avoid:''}, extra);
P.dep = {label:'Entrenamiento deportivo', auto:true, phases:[
  gph('Preparación general · Fuerza base','Lejos del torneo principal (7 semanas o más)','Ganar masa muscular y fuerza base, y preparar tendones y articulaciones para lo que viene.',
    {dz:{main:'4 × 6–8',mR:'7–8',sec:'3 × 8–10',sR:'8',acc:'3 × 10–15',aR:'8',pow:'3 × 5',plyo:'3 × 5',nNeuro:2}}),
  gph('Preparación específica · Fuerza máxima y potencia','2 a 6 semanas antes del torneo principal','Convertir la fuerza en potencia y velocidad específicas del deporte.',
    {dz:{main:'4 × 3–5',mR:'8–9',sec:'3 × 5–6',sR:'8',acc:'2 × 8–12',aR:'8',pow:'4 × 3',plyo:'4 × 5',nNeuro:3}}),
  gph('Competencia · Mantenimiento','Temporada con torneos seguidos','Mantener fuerza y potencia con el mínimo volumen: se recorta el volumen, no la intensidad.',
    {dz:{main:'3 × 3–4',mR:'8',sec:'2 × 5–6',sR:'7–8',acc:'2 × 8–10',aR:'7',pow:'3 × 3',plyo:'3 × 4',nNeuro:2}}),
  gph('Puesta a punto · Taper','La semana del torneo principal y la anterior','Llegar fresco y rápido: 40–60 % menos volumen, misma intensidad y frecuencia.',
    {dz:{main:'2 × 2–3',mR:'7–8',sec:'2 × 4',sR:'7',acc:'1 × 8',aR:'6–7',pow:'3 × 2',plyo:'2 × 4',nNeuro:2}, avoid:'Ejercicios nuevos, fallo muscular y excéntricos pesados que dejen dolor muscular.'}),
  gph('Transición · Descanso activo','1 a 3 semanas después de la temporada o del torneo principal','Recuperar física y mentalmente sin perder del todo la base.',
    {dz:{main:'2 × 8–10',mR:'6',sec:'2 × 10–12',sR:'6',acc:'2 × 12–15',aR:'6',pow:'',plyo:'',nNeuro:1}})
]};
P.sal = {label:'Entrenamiento para la salud', phases:[
  gph('Adaptación · Aprender a moverse','Primeras 4–6 semanas','Aprender los patrones de movimiento y tolerar la carga sin dolor muscular excesivo.',
    {dz:{main:'2 × 10–12',mR:'6',acc:'2 × 12–15',aR:'6'}}),
  gph('Desarrollo · Fuerza y masa muscular','Desde la semana 5–7','Ganar fuerza y masa muscular progresando la carga cuando sobran repeticiones.',
    {dz:{main:'3 × 8–10',mR:'7–8',acc:'3 × 10–12',aR:'8'}}),
  gph('Consolidación · Fuerza y potencia','Cuando ya entrena con constancia','Sostener lo ganado y seguir progresando en fuerza y potencia.',
    {dz:{main:'3 × 5–8',mR:'8',acc:'3 × 8–12',aR:'8'}})
]};
STAGES.dep = ['late','late','late','late','mid'];
STAGES.sal = ['mid','mid','late'];

/* ---------- Calendario y semanas ---------- */
const DAYMS = 86400000;
const isoD = x => new Date(x.getTime()-x.getTimezoneOffset()*60000).toISOString().slice(0,10);
const addDays = (d,n) => { const x=new Date(d+'T12:00:00'); x.setDate(x.getDate()+n); return isoD(x); };
const mondayOf = d => { const x=new Date(d+'T12:00:00'); x.setDate(x.getDate()-((x.getDay()+6)%7)); return isoD(x); };
const fmtD = d => { const x=new Date(d+'T12:00:00'); return x.getDate()+' '+['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][x.getMonth()]; };
const curWeek = s => Math.max(1, num(s.semPlan)||1);
function inicioEff(s){ return s.inicio ? mondayOf(s.inicio) : addDays(mondayOf(todayISO()), -7*(curWeek(s)-1)); }
const weekStart = (s,w) => addDays(inicioEff(s), 7*(w-1));
const weekOfDate = (s,d) => Math.floor((new Date(mondayOf(d)+'T12:00:00') - new Date(inicioEff(s)+'T12:00:00'))/(7*DAYMS)) + 1;
const todayWeek = s => weekOfDate(s, todayISO());
const WT = {
  int:{k:'int',l:'Introducción',d:'RPE un punto por debajo del objetivo: aprender los ejercicios y encontrar las cargas.',rpe:-1,ser:0},
  car:{k:'car',l:'Carga',d:'Dosis objetivo.',rpe:0,ser:0},
  sob:{k:'sob',l:'Sobrecarga',d:'Una serie más en los ejercicios principales, mismo RPE.',rpe:0,ser:1},
  desc:{k:'desc',l:'Descarga',d:'≈ 40–50 % menos series y un punto menos de RPE para consolidar.',rpe:-1,ser:-0.4},
  taper:{k:'taper',l:'Puesta a punto',d:'≈ 40–60 % menos volumen, misma intensidad y frecuencia.',rpe:0,ser:-0.5},
  torneo:{k:'torneo',l:'Semana de torneo',d:'Solo activación corta 1–2 días antes: volumen mínimo, intensidad alta.',rpe:0,ser:-0.6},
  mini:{k:'mini',l:'Mini puesta a punto',d:'Torneo B: ≈ 30 % menos volumen los días previos.',rpe:0,ser:-0.3},
  recup:{k:'recup',l:'Recuperación',d:'Semana después del torneo principal: volumen y RPE bajos.',rpe:-1,ser:-0.5}
};
const PRIO = {A:'A · Principal', B:'B · Importante', C:'C · Preparación'};
function tourns(s){ return (s.torneos||[]).filter(t=>t && t.f).slice().sort((a,b)=>a.f.localeCompare(b.f)).map(t=>Object.assign({}, t, {w:weekOfDate(s,t.f)})); }
function weekKind(s, w){
  const T=tourns(s), here=T.filter(t=>t.w===w), A=T.filter(t=>t.p==='A');
  if(here.some(t=>t.p==='A')) return {wt:WT.torneo, t:here};
  if(A.some(t=>t.w===w+1)) return {wt:WT.taper, t:here};
  if(here.some(t=>t.p==='B')) return {wt:WT.mini, t:here};
  if(A.some(t=>t.w===w-1)) return {wt:WT.recup, t:here};
  const lastA = A.filter(t=>t.w<w).map(t=>t.w).pop();
  const base = lastA!=null ? lastA+2 : 1;
  const pos = ((w-base)%4+4)%4;
  let wt = [lastA==null && w<5 ? WT.int : WT.car, WT.car, WT.sob, WT.desc][pos];
  if(wt===WT.desc && A.some(t=>t.w===w+1 || t.w===w+2)) wt = WT.car;   // no descargar justo antes de la puesta a punto
  return {wt, t:here};
}
function autoPhaseDep(s){
  const w=curWeek(s), T=tourns(s), k=weekKind(s,w).wt.k;
  const nextA = T.find(t=>t.p==='A' && t.w>=w);
  const soon = T.filter(t=>t.w>=w && t.w<=w+6);
  if(k==='recup') return soon.length ? 2 : 4;
  if(nextA && nextA.w-w<=1) return 3;
  if(soon.length>=2) return 2;
  if(nextA && nextA.w-w<=6) return 1;
  return 0;
}

/* ---------- Generadores ---------- */
const POOL = {
  K:[X('Sentadilla','',{}), X('Sentadilla frontal','',{})],
  H:[X('Peso muerto','',{}), X('Hip thrust','',{}), X('Peso muerto rumano','',{})],
  U:[X('Sentadilla búlgara','',{}), X('Step up a cajón','',{}), X('Zancadas','',{})],
  PH:[X('Press banca','',{}), X('Press banca con mancuernas','',{})],
  PV:[X('Press militar','',{}), X('Landmine press unilateral','',{})],
  TH:[X('Remo con barra','',{}), X('Remo con mancuerna','',{})],
  TV:[X('Dominadas en barra','',{t:'Si hace más de 8, lastradas.'}), X('Jalón al pecho','',{})],
  POW:[X('Clean colgante (sin sentadilla)','',{t:'Técnica primero; máxima velocidad de barra.'}), X('Kettlebell swing','',{t:'Cadera explosiva, espalda neutra.'}), X('Sentadilla con salto','',{t:'Carga ligera (≤ 30 % de tu sentadilla) y máxima intención.'})],
  CORE:[X('Plancha frontal','3 × 30–45 s',{rpe:'7'}), X('Pallof press','3 × 10 por lado',{rpe:'8'}), X('Plancha lateral','3 × 20–40 s por lado',{rpe:'7'}), X('Dead bug','3 × 8 por lado',{rpe:'7'})]
};
const MOVI = X('Movilidad dinámica de cadera, tobillo y columna torácica','1 × 5 min');
const dose = (it, d, rpe, extra) => X(it.n, d, Object.assign({rpe}, it.t?{t:it.t}:{}, extra||{}));
function levelAdj(rows, s){
  const L = NIVELES[s.nivel||'int'] || NIVELES.int;
  rows.forEach(r=>{
    if(L.dS<0 && /RPE/.test(r.c)) r.s = adjSeries(r.s, -0.25, true);
    if(L.dS>0 && r===rows[0] && !(modOf(s)==='deporte' && phaseIdx(s)>=2)) r.s = adjSeries(r.s, 1, true);
    if(L.dR) r.c = adjRPE(r.c, L.dR);
    if(s.nivel==='ini') r.c = r.c.replace(/RPE\s*([\d–]+)/, (m,g)=>'RPE '+g.split('–').map(x=>String(Math.min(8,+x))).filter((v,i,a)=>a.indexOf(v)===i).join('–'));
  });
}
function genWeekDep(s){
  const i=phaseIdx(s), ph=P.dep.phases[i], z=ph.dz, n=nDias(s), sp=DEPORTES[s.deporteP]||DEPORTES.gimnasio;
  const types = n===2 ? ['A','B'] : n===3 ? ['A','B','C'] : ['A','B','C','D'];
  const trans = i===4, ini = s.nivel==='ini';
  return types.map((T,d)=>{
    const B={act:[], neuro:[], central:[]};
    B.act.push(toRow(MOVI));
    B.act.push(toRow(POOL.CORE[d%POOL.CORE.length]));
    (sp.prev.length<=2 ? sp.prev : [sp.prev[d%sp.prev.length], sp.prev[(d+1)%sp.prev.length]]).forEach(it=> B.act.push(toRow(it)));
    if(!trans){
      const pow = ini ? POOL.POW[1] : POOL.POW[d%POOL.POW.length];
      B.neuro.push(toRow(X(pow.n, z.pow, {t:pow.t}), {c:'Máx. intención'}));
      sp.neuro.map((x,k)=>sp.neuro[(k+d)%sp.neuro.length]).slice(0, z.nNeuro-1).forEach(it=> B.neuro.push(toRow(it, {c:'Máx. intención'})));
    } else B.neuro.push(toRow(X('Juego de coordinación o deporte alternativo','10–15 min',{t:'Descanso activo, sin cargas altas.'})));
    const mk = (it, kind) => toRow(dose(it, kind==='main'?z.main:kind==='sec'?z.sec:z.acc, kind==='main'?z.mR:kind==='sec'?z.sR:z.aR));
    const v = Math.floor(d/2)%2;
    if(T==='A') B.central.push(mk(POOL.K[v],'main'), mk(POOL.PH[v],'sec'), mk(POOL.TH[v],'sec'), mk(POOL.U[0],'acc'), mk(sp.acc[0],'acc'));
    if(T==='B') B.central.push(mk(POOL.H[v],'main'), mk(POOL.PV[v],'sec'), mk(POOL.TV[v],'sec'), mk(sp.acc[1]||sp.acc[0],'acc'), toRow(dose(X('Caminata del granjero unilateral',''),'3 × 20–30 m','8')));
    if(T==='C') B.central.push(mk(POOL.U[1],'sec'), mk(POOL.H[2],'sec'), mk(POOL.PH[1],'sec'), mk(POOL.TV[1],'sec'), mk(sp.acc[0],'acc'));
    if(T==='D') B.central.push(mk(POOL.U[2],'sec'), mk(POOL.H[1],'sec'), mk(POOL.PV[1],'sec'), mk(POOL.TH[1],'sec'), mk(sp.acc[1]||sp.acc[0],'acc'));
    const c = constraints(s);
    const segs = SEG_ORDER.map(t=>({type:t, sub:'', fmt:{t:'series'}, rows:B[t].map(r=>Object.assign(fromBank(r,c),{lado:''}))}));
    levelAdj(segs[2].rows, s);
    return {name:`Día ${d+1}`, segs};
  });
}
function genWeekSal(s){
  const i=phaseIdx(s), z=P.sal.phases[i].dz, n=nDias(s), pob=s.poblacion||'sed';
  const may = pob==='may', act = pob==='act';
  const mR = pob==='sed' && i===1 ? '7' : z.mR;
  const order = n===2 ? ['A','B'] : n===3 ? ['A','B','A'] : ['A','B','A','B'];
  const c = constraints(s);
  return order.map((T,d)=>{
    const B={act:[], neuro:[], central:[]};
    B.act.push(toRow(X('Movilidad general','1 × 5 min')));
    B.act.push(toRow(POOL.CORE[(d+ (may?3:0))%POOL.CORE.length]));
    if(may || i===0) B.act.push(toRow(X('Puente de glúteo','2 × 12',{rpe:'6'})));
    if(may){
      B.neuro.push(toRow(X(T==='A'?'Equilibrio unipodal con alcance':'Marcha en tándem','3 × 30 s',{t:'Cerca de un apoyo. Progresión: ojos cerrados o superficie blanda.'})));
      if(i>=1) B.neuro.push(toRow(X('Sentadilla a velocidad máxima','3 × 6',{rpe:'6',t:'Carga ligera; subida lo más rápida posible, bajada controlada (entrenamiento de potencia).'})));
      else B.neuro.push(toRow(X('Levantarse de la silla','3 × 8',{rpe:'6',t:'Sin usar las manos si es posible.'})));
    } else if(act && i>=1){
      B.neuro.push(toRow(X('Saltos bilaterales submáximos','3 × 6',{t:'Aterrizaje silencioso y alineado.'}),{c:'Máx. intención'}));
      B.neuro.push(toRow(X('Lanzamiento de balón medicinal al pecho (pared)','3 × 6',{t:'Máxima intención.'}),{c:'Máx. intención'}));
    } else {
      B.neuro.push(toRow(X('Equilibrio unipodal','3 × 30 s por lado',{t:'Progresa a ojos cerrados.'})));
      B.neuro.push(toRow(X('Desplazamientos coordinativos (escalera o conos)','3 × 30 s',{t:'Técnica antes que velocidad.'})));
    }
    const m = (name, kind, t) => toRow(X(name, kind==='main'?z.main:z.acc, Object.assign({rpe: kind==='main'?mR:z.aR}, t?{t}:{})));
    if(T==='A') B.central.push(
      m(may && i===0 ? 'Sentadilla a la silla con mancuerna' : 'Sentadilla goblet','main'),
      m('Press banca con mancuernas','main'), m('Remo con mancuerna','main'),
      m(may ? 'Step up bajo' : 'Zancada alterna','acc'),
      toRow(X('Caminata del granjero','3 × 20–30 m',{rpe:'7'})));
    else B.central.push(
      m('Peso muerto rumano con mancuerna','main','Espalda neutra; la cadera va atrás.'),
      m(may ? 'Press de hombro sentado con mancuernas' : 'Press militar con mancuernas','main'),
      m('Jalón al pecho','main'),
      m(may ? 'Elevación de talones de pie' : 'Step up a cajón','acc'),
      m('Hip thrust','acc'));
    const segs = SEG_ORDER.map(t=>({type:t, sub:'', fmt:{t:'series'}, rows:B[t].map(r=>Object.assign(fromBank(r,c),{lado:''}))}));
    levelAdj(segs[2].rows, s);
    return {name:`Día ${d+1}`, segs};
  });
}

/* ---------- Vistas de los módulos de entrenamiento ---------- */
function timelineHTML(s, from, count){
  const w0=curWeek(s), tw=todayWeek(s);
  const ws=[]; for(let w=Math.max(1,from); ws.length<count; w++) ws.push(w);
  return `<div class="tl">${ws.map(w=>{ const k=weekKind(s,w); const st0=weekStart(s,w);
    return `<div class="tw k-${k.wt.k}${w===w0?' now':''}" title="${esc(k.wt.d)}"><b>S${w} · ${esc(k.wt.l)}</b><span>${esc(fmtD(st0))} – ${esc(fmtD(addDays(st0,6)))}${w===tw?' · hoy':''}</span>${k.t.map(t=>`<span class="tn">${esc(t.p)} · ${esc(t.n||'Torneo')} · ${esc(fmtD(t.f))}</span>`).join('')}</div>`; }).join('')}</div>`;
}
function calendarView(){
  const T=(st.torneos||[]);
  const w=curWeek(st);
  return `<section class="card"><h3 class="sec">Calendario de torneos</h3>
    <p class="small" style="margin-top:0">La app ubica las semanas de puesta a punto, torneo, recuperación y descarga con estas fechas, y en el módulo Deporte elige la fase de la temporada cuando la fase está en automático.</p>
    <div class="row2" style="max-width:520px"><label class="f">Inicio del plan (semana 1)<input type="date" id="calIni" value="${esc(st.inicio||'')}"></label>
      <label class="f">Semana que estás viendo<input type="number" id="calSem" min="1" max="104" value="${esc(w)}"></label></div>
    ${st.inicio?`<p class="small">Hoy corresponde a la semana ${todayWeek(st)}. <button class="mini-btn" id="calHoy">Ir a la semana de hoy</button></p>`:'<p class="small">Sin fecha de inicio, la app asume que la semana que estás viendo es la semana actual.</p>'}
    <h3 class="sec" style="margin-top:14px">Torneos</h3>
    ${T.length?T.map((t,k)=>`<div class="trow" style="margin-bottom:8px">
      <label class="f">Nombre<input type="text" value="${esc(t.n||'')}" data-tor="${k}|n"></label>
      <label class="f">Fecha<input type="date" value="${esc(t.f||'')}" data-tor="${k}|f"></label>
      <label class="f">Prioridad<select data-tor="${k}|p">${Object.entries(PRIO).map(([v,l])=>`<option value="${v}"${t.p===v?' selected':''}>${l}</option>`).join('')}</select></label>
      <button class="xbtn" data-tdel="${k}" aria-label="Quitar torneo">×</button></div>`).join(''):'<p class="small">Aún no hay torneos.</p>'}
    <div class="actions"><button class="dark" id="tAdd">+ Añadir torneo</button></div>
    <ul class="small" style="padding-left:18px;margin:12px 0 0">
      <li><span class="prio A">A</span> Principal: puesta a punto la semana anterior y la del torneo, y recuperación la semana siguiente.</li>
      <li><span class="prio B">B</span> Importante: mini puesta a punto (≈ 30 % menos volumen) esa semana.</li>
      <li><span class="prio">C</span> Preparación: se entrena a través, sin cambios en el plan.</li>
    </ul></section>
  <section class="card"><h3 class="sec">Próximas semanas</h3>${timelineHTML(st, w-1, 16)}
    <p class="small" style="margin:8px 0 0">El ciclo de carga es 3:1 (carga, carga, sobrecarga, descarga; el primer bloque empieza con introducción). En las fases de competencia, puesta a punto y transición la sobrecarga no suma series y se reinicia después de cada torneo A. Si una descarga cae justo antes de la puesta a punto, se convierte en semana de carga para no encadenar dos semanas suaves.</p>
    ${refList(['bosquet07','pritchard15','spiering21','exp'])}</section>`;
}
function genPlanView(){
  const s=st, k=pkey(s), P0=P[k], i=phaseIdx(s), ph=P0.phases[i];
  const {days, custom} = viewWeek(s);
  const dep = modOf(s)==='deporte', sp = DEPORTES[s.deporteP]||DEPORTES.gimnasio;
  const wl = typeof wellLight==='function' ? wellLight(wellness) : null;
  const T = tourns(s), w=curWeek(s), nextT = T.find(t=>t.w>=w);
  const wk = weekKind(s,w).wt;
  const nd=days.length;
  const overview = `<div class="tbl"><table class="data"><thead><tr><th>Día</th><th>Activación</th><th>Neuro</th><th>Central</th><th>Series del central</th></tr></thead><tbody>
    ${days.map(d=>{ const g=t=>d.segs.find(x=>x.type===t); const ser=(g('central')?.rows||[]).reduce((a,r)=>a+(parseInt(r.s)||0),0); return `<tr><td><b>${esc(d.name)}</b></td><td>${g('act')?.rows.length||0}</td><td>${g('neuro')?.rows.length||0}</td><td>${g('central')?.rows.length||0}</td><td>${ser}</td></tr>`; }).join('')}
    </tbody></table></div><p class="small" style="margin:8px 0 0">Reparto sugerido: ${nd===4?'lunes, martes, jueves y viernes':nd===3?'lunes, miércoles y viernes':'lunes y jueves'}, con al menos 48 h entre sesiones que repiten grupos musculares.</p>`;
  const mods=[];
  if(dep) mods.push(`<div class="mod"><b>${esc(sp.l)}.</b> ${esc(sp.nota)} ${refList(sp.ev)}</div>`);
  if(dep && typeof rehabMod==='function' && s.rehab) mods.unshift(rehabMod(s));
  if(!dep && s.poblacion==='may') mods.push(`<div class="mod"><b>Adulto mayor.</b> Equilibrio en todas las sesiones y potencia (subida rápida con carga ligera) desde la fase de desarrollo: la potencia cae antes que la fuerza y se relaciona más con caídas y autonomía. ${refList(['fragala19','sherrington19','who20'])}</div>`);
  if(ph.avoid) mods.push(`<div class="mod"><b>Evitar en esta fase.</b> ${esc(ph.avoid)}</div>`);
  if(s.nivel==='ini') mods.push(`<div class="mod"><b>Principiante.</b> Una serie menos en el bloque central y RPE máximo 8: la técnica y la regularidad progresan más que la intensidad al inicio. ${refList(['acsm09'])}</div>`);
  return `
  <section class="card"><div class="status">
    ${wl?`<div class="light ${wl.c}"><span class="dot"></span><div><b>${esc(wl.t)}</b><p>${esc(wl.p)}</p></div></div>`:''}
    <div><h3 class="sec">Esta semana</h3><p style="margin:0"><b>${esc(wk.l)}.</b> ${esc(wk.d)}</p>
      ${nextT?`<p class="small" style="margin:6px 0 0">Próximo torneo: <span class="prio ${esc(nextT.p)}">${esc(nextT.p)}</span> ${esc(nextT.n||'Torneo')} · ${esc(fmtD(nextT.f))} (${nextT.w-w===0?'esta semana':`en ${nextT.w-w} semana${nextT.w-w>1?'s':''}`})</p>`:`<p class="small" style="margin:6px 0 0">Sin torneos en el calendario. ${dep?'Agrégalos en la pestaña Calendario para que la app ubique la puesta a punto y las descargas.':''}</p>`}</div>
    <div><h3 class="sec">Dosis de la fase</h3><p class="small" style="margin:0">Principal ${esc(ph.dz.main)} a RPE ${esc(ph.dz.mR)}${ph.dz.sec?` · secundarios ${esc(ph.dz.sec)} a RPE ${esc(ph.dz.sR)}`:''} · accesorios ${esc(ph.dz.acc)} a RPE ${esc(ph.dz.aR)}${ph.dz.pow?` · potencia ${esc(ph.dz.pow)} a máxima intención`:''}.</p></div>
  </div></section>
  ${mods.length?`<section class="card"><h3 class="sec">Consideraciones de este caso</h3><div class="mods" style="margin:0">${mods.join('')}</div></section>`:''}
  <section class="card"><h3 class="sec">Semanas</h3>${timelineHTML(s, w-1, 8)}${refList(['bosquet07','helms'])}</section>
  <section class="card"><h3 class="sec">Semana tipo</h3>${overview}
    <div class="legend" style="margin-top:10px">${[['Activación','var(--c-act)'],['Neuro','var(--c-neuro)'],['Bloque central','var(--c-central)']].map(([l,c])=>`<span><i class="sw" style="background:${c}"></i>${l}</span>`).join('')}</div></section>
  ${custom?`<div class="edited"><span><b>Plan modificado por ti</b> para esta fase y ${nd} días.</span><button id="bReset">Restablecer plan base</button></div>`:''}
  ${days.map((d,di)=>dayHTML(d,di)).join('')}
  <section class="card"><h3 class="sec">Fundamento del plan</h3><div class="mods">
    <div class="mod"><b>Carga por RPE.</b> RPE 8 = podría hacer 2 repeticiones más. El peso se ajusta cada sesión para caer en el RPE objetivo y la app sugiere el ajuste según el último registro. ${refList(['helms'])}</div>
    <div class="mod"><b>Estructura.</b> Activación (movilidad, core y prevención), Neuro (potencia, saltos, velocidad o equilibrio, siempre sin fatiga previa) y Bloque central (fuerza: primero el ejercicio principal).</div>
    ${dep?`<div class="mod"><b>Fuerza y rendimiento.</b> Más fuerza se asocia a mejor salto, sprint y cambio de dirección, y el entrenamiento de fuerza reduce las lesiones deportivas. ${refList(['suchomel16','lauersen14','currier23'])}</div>
    <div class="mod"><b>Temporada.</b> Lejos del torneo se construye fuerza; cerca, se convierte en potencia; en competencia se mantiene con poco volumen y la intensidad intacta; antes del torneo principal se reduce el volumen 40–60 %. ${refList(['bosquet07','spiering21','pritchard15'])}</div>`
    :`<div class="mod"><b>Salud.</b> Fuerza de todos los grandes grupos musculares al menos 2 días por semana; en mayores, equilibrio y fuerza al menos 3 días. Progresar la carga cuando sobran repeticiones al RPE objetivo. ${refList(['who20','acsm09','currier23','fragala19'])}</div>`}
  </div></section>
  ${allRefs()}`;
}

/* ---------- Interacción del calendario ---------- */
$('#out').addEventListener('change', e=>{
  const t=e.target;
  if(t.dataset.tor){ const [k,f]=t.dataset.tor.split('|'); st.torneos[+k][f]=t.value; markDirty(); render(); return; }
  if(t.id==='calIni'){ st.inicio=t.value||''; if(st.inicio) st.semPlan=Math.max(1,todayWeek(st)); fillForm(); markDirty(); render(); return; }
  if(t.id==='calSem'){ st.semPlan=Math.max(1,num(t.value)||1); fillForm(); markDirty(); render(); return; }
});
$('#out').addEventListener('click', e=>{
  const q=s=>e.target.closest(s); let b;
  if(q('#tAdd')){ if(!st.torneos) st.torneos=[]; st.torneos.push({n:'',f:addDays(todayISO(),28),p:'A'}); markDirty(); render(); return; }
  if((b=q('[data-tdel]'))){ st.torneos.splice(+b.dataset.tdel,1); markDirty(); render(); return; }
  if(q('#calHoy')){ st.semPlan=Math.max(1,todayWeek(st)); fillForm(); markDirty(); render(); return; }
});
$('#form').addEventListener('click', e=>{ const b=e.target.closest('.modsel [data-mod]'); if(b) setModulo(b.dataset.mod); });
function setModulo(m){
  if(!MODULOS[m] || st.modulo===m) return;
  st.modulo=m; st.fase = m==='salud' ? '0' : 'auto';
  if(m!=='rodilla' && !st.nivel) st.nivel='int';
  if(m==='deporte' && !st.deporteP) st.deporteP='gimnasio';
  if(m==='salud' && !st.poblacion) st.poblacion='sed';
  editMode=false; fillForm(); render(); markDirty();
}
