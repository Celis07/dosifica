/* ===================== ESTADO ===================== */
const VERSION = 'Protocolos v1.3 · evidencia revisada en octubre de 2026';
function pkey(s){ const m=modOf(s); if(m==='deporte') return 'dep'; if(m==='salud') return 'sal'; if(s.cond==='tend') return 'tend'; if(s.cond==='pfp') return 'pfp'; if(s.cond==='men') return 'men-'+s.menSub; return 'lca-'+s.lcaSub; }
function suggested(s){ if(modOf(s)==='deporte') return autoPhaseDep(s); const P0=P[pkey(s)]; if(!P0.weeks) return 0; const w=num(s.semanas)||0; let i=0; P0.weeks.forEach((t,k)=>{ if(w>=t) i=k; }); return Math.min(i,P0.phases.length-1); }
function phaseIdx(s){ const n=P[pkey(s)].phases.length; if(s.fase==='auto') return suggested(s); const i=+s.fase; return (i>=0&&i<n)?i:0; }
function planKey(s){ const m=modOf(s); const extra = m==='deporte' ? '|'+(s.deporteP||'')+'|'+(s.nivel||'') : m==='salud' ? '|'+(s.poblacion||'')+'|'+(s.nivel||'') : ''; return pkey(s)+'|'+phaseIdx(s)+'|'+nDias(s)+extra; }
function subLabel(s, P0){ if(modOf(s)==='deporte') return 'Entrenamiento · '+((DEPORTES[s.deporteP]||DEPORTES.gimnasio).l); if(modOf(s)==='salud') return 'Salud · '+((POBL[s.poblacion]||POBL.sed).l); return s.cond==='tend' ? (s.tendSub==='quad'?'Tendinopatía cuadricipital':'Tendinopatía rotuliana') : P0.label; }
const todayISO = () => { const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
const daysAgo = n => { const d=new Date(Date.now()-n*86400000); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); };

let st = clone(EXAMPLE);
let curId = null, isExample = true, editMode = false, view = 'plan', logOpen = null, subOpen = null, evalOpen = false;
let sessions = [], evals = [], patients = [];
const EX_SESSIONS = [
  {id:'e1',fecha:daysAgo(13),semana:9,dia:'Día 1',fase:'Fase 4',min:75,srpe:6,dolor:3,d24:'igual',ex:[{e:'Sentadilla',kg:55,reps:6,rpe:7},{e:'Prensa unilateral',kg:60,reps:8,rpe:8}]},
  {id:'e2',fecha:daysAgo(11),semana:9,dia:'Día 2',fase:'Fase 4',min:70,srpe:6,dolor:2,d24:'igual',ex:[]},
  {id:'e3',fecha:daysAgo(9),semana:9,dia:'Día 3',fase:'Fase 4',min:80,srpe:7,dolor:3,d24:'igual',ex:[{e:'Sentadilla',kg:57.5,reps:6,rpe:7}]},
  {id:'e4',fecha:daysAgo(6),semana:10,dia:'Día 1',fase:'Fase 4',min:80,srpe:7,dolor:2,d24:'mejor',ex:[{e:'Sentadilla',kg:60,reps:5,rpe:7},{e:'Prensa unilateral',kg:65,reps:7,rpe:8}]},
  {id:'e5',fecha:daysAgo(4),semana:10,dia:'Día 2',fase:'Fase 4',min:70,srpe:6,dolor:2,d24:'igual',ex:[]}
];
const EX_EVALS = [
  {id:'v1',fecha:daysAgo(28),fase:'Fase 2',semana:6,dolor:3,der:2,flex:118,ext:2,prom:{aclrsi:48,ikdc:58,koos:45}},
  {id:'v2',fecha:daysAgo(7),fase:'Fase 4',semana:9,dolor:2,der:0,flex:136,ext:0,prom:{aclrsi:56,ikdc:66,koos:55}}
];

/* ===================== CONSTRUCTOR DEL PLAN ===================== */
const STAGES = {tend:['mid','mid','late','late'],pfp:['mid','mid','late'],'men-cons':['early','mid','late','late'],'men-mx':['early','mid','late'],'men-sut':['early','early','mid','late'],'lca-cons':['early','mid','late','late'],'lca-pre':['mid'],'lca-post':['early','early','mid','late','late']};
function constraints(s){
  if(!isRod(s)){ const i=phaseIdx(s); const low = modOf(s)==='salud' && (s.poblacion!=='act' || i===0); return {fx:140, tn:2, im: low?0:1, noKneel:false}; }
  const key=pkey(s), i=phaseIdx(s), stage=STAGES[key][i];
  let fx=140; if(key==='men-sut'&&i===0) fx=90; if(key==='men-sut'&&i===1) fx=70; if(key==='lca-post'&&s.suturaAsoc&&i<=1) fx=90;
  if(key==='lca-post'&&i===0) fx=Math.min(fx,60);
  let tn=2; if(key==='tend'&&i===0) tn=1; if(key==='pfp'&&i===0) tn=1;
  const noKneel = (key==='lca-post' && s.injerto==='hth' && i<=2) || key==='pfp' || (key==='tend' && i<=1);
  return {fx, tn, im: stage==='late' ? 1 : 0, noKneel};
}
function dailyTherapy(key, i, s){
  const stage = STAGES[key][i];
  const flexLim = (key==='men-sut' && i<=1) || (key==='lca-post' && s.suturaAsoc && i<=1);
  let items;
  if(stage==='early') items = [
    s.derrame>=1 ? X('Control del derrame','1 × 10–15 min',{t:'Compresión y elevación después de la sesión o en casa.'}) : null,
    X('Extensión pasiva con talón elevado','3 × 2 min'),
    X('Flexión asistida (deslizamiento de talón)', flexLim ? '2 × 15' : '2 × 15',{t: flexLim ? 'Máximo 90°.' : 'Ganando rango cada día.'}),
    X('Isometría de cuádriceps a 0° y 60°','5 × 10 s',{rpe:'8'}),
    X('Elevación de pierna recta','2 × 15',{rpe:'6'}),
    X('TKE con banda','2 × 20',{rpe:'6'})
  ];
  else if(stage==='mid') items = [
    X('Movilidad de rodilla, cadera y tobillo','1 × 5 min'),
    X('Isometría de cuádriceps a 60°','3 × 30 s',{rpe:'7'}),
    X('TKE con banda','2 × 20',{rpe:'6'}),
    X('Apoyo unipodal con perturbación','3 × 30 s')
  ];
  else items = [
    X('Movilidad dinámica','1 × 5 min'),
    X('Activación: isometría a 60° + TKE','2 × 20 s + 20 reps',{rpe:'6'}),
    X('Saltos de tobillo (pogo)','2 × 15',{rpe:'6'}),
    X('Aterrizajes controlados','2 × 5',{t:'Aterrizaje silencioso, rodilla alineada sobre el pie.'})
  ];
  if(key==='tend' && i<=1) items = [ISO_TEND, ...items.filter(x=>x && !/^Isometría/.test(x.n))];
  if(key==='pfp' && i===0) items = items.filter(x=>x && !/^Saltos|^Aterrizajes/.test(x.n));
  return items.filter(Boolean);
}
function allKnee(ph){ return ph.blocks.flatMap(b=>b.items); }
function liftsOnly(ph){ return allKnee(ph).filter(it=>it.lift); }
function lightKnee(ph){
  const out = allKnee(ph).filter(it=>!it.lift && !/^Isometr/.test(it.n));
  if(ph.tools.includes('bfr')) out.unshift(X('BFR · prensa o extensión unilateral','4 × 30-15-15-15',{rpe:'7–8',t:'Carga muy ligera, 30 s de pausa. 60–80 % de la presión de oclusión, solo con manguito que la mida.'}));
  if(!out.length) out.push(X('Apoyo unipodal con perturbación','4 × 30–45 s'));
  return out;
}
function sanoItems(kind, light){
  if(kind==='cx'){
    if(light) return [X('Isometría máxima de extensión a 60°','4 × 5 s',{rpe:'10',t:'Día corto: estímulo neural con poca fatiga.'})];
    return [
      X('Extensión de rodilla unilateral','3 × 4–6',{rpe:'8',t:'Pausa 2–3 min. Sin llegar al fallo.'}),
      X('Prensa unilateral','2 × 5–6',{rpe:'8'}),
      X('Curl femoral unilateral','3 × 6–8',{rpe:'8'}),
      X('Isometría máxima de extensión a 60°','4 × 5 s',{rpe:'10',t:'Al final del bloque, máxima intención.'}),
      X('Elevación de talón unilateral','3 × 8–10',{rpe:'8'})];
  }
  if(light) return [X('Elevación de talón unilateral','3 × 8–10',{rpe:'8'})];
  return [
    X('Prensa unilateral','3 × 3–5',{rpe:'8–9'}),
    X('Extensión de rodilla unilateral','3 × 6–8',{rpe:'8'}),
    X('Sentadilla búlgara (sano adelante)','3 × 4–6',{rpe:'8',t:'Solo si la rodilla afectada tolera ir atrás con flexión ≥ 100°.'}),
    X('Peso muerto rumano unilateral','3 × 6–8',{rpe:'8'})];
}
function upperItems(type, stage){
  const early = stage==='early';
  if(type==='A') return [
    early ? X('Press con mancuernas en banco','4 × 5–6',{rpe:'8',t:'Pies apoyados en el banco.'}) : X('Press banca','4 × 4–6',{rpe:'8'}),
    early ? X('Jalón al pecho','4 × 6–8',{rpe:'8'}) : X('Dominadas (lastradas si hace más de 8)','4 × 5–8',{rpe:'8'}),
    X('Press inclinado con mancuernas','3 × 8–10',{rpe:'8'}),
    X('Face pull','3 × 12–15',{rpe:'7–8'})];
  return [
    early ? X('Press de hombro sentado con respaldo','4 × 6–8',{rpe:'8'}) : X('Press de hombro de pie o landmine','4 × 6–8',{rpe:'8'}),
    X('Remo con pecho apoyado','4 × 6–8',{rpe:'8'}),
    X('Press cerrado en banco','3 × 8–10',{rpe:'8'}),
    X('Curl de bíceps + extensión de tríceps en superserie','3 × 10–12',{rpe:'8'})];
}
function coreItems(type, stage){
  const L = {
    early:[X('Dead bug','3 × 8 por lado',{rpe:'6–7'}),X('Pallof press sentado','3 × 10 por lado',{rpe:'7'}),X('Hollow hold','3 × 20–30 s',{rpe:'7'})],
    mid:[X('Plancha frontal','3 × 30–45 s',{rpe:'7'}),X('Plancha lateral','3 × 20–40 s por lado',{rpe:'7',t:'Doble función: core y glúteo medio.'}),X('Pallof press de pie','3 × 10 por lado',{rpe:'8'})],
    late:[X('Pallof press con rotación','3 × 8 por lado',{rpe:'8'}),X('Caminata de granjero unilateral','3 × 20–30 m',{rpe:'8'}),X('Plancha con arrastre','3 × 8 por lado',{rpe:'7'})]
  }[stage];
  return type==='A' ? L.slice(0,2) : L.slice(1,3);
}
function toRow(it, extra){
  const m = it.d.match(/^(\d+(?:–\d+)?)\s*×\s*([^·]+?)\s*(?:·\s*(.+))?$/);
  let s='', r=it.d, ex='';
  if(m){ s=m[1]; r=m[2].trim(); ex=m[3]||''; }
  return Object.assign({e:it.n, lado:'', s, r, c: it.rpe ? 'RPE '+it.rpe : '', n:[ex, it.t].filter(Boolean).join('. '), ter:false}, extra||{});
}
/* Bloques del plan: siempre Activación, Neuro y Bloque central */
const SEGS = {act:'Activación', neuro:'Neuro', central:'Bloque central'};
const SEG_ORDER = ['act','neuro','central'];
const LADOS = ['Ambas','Sana','Lesionada'];
const FORMATOS = {series:'Series', inter:'Intermitente', amrap:'AMRAP', emom:'EMOM', rondas:'Rondas'};
function fmtLabel(f){
  if(!f || f.t==='series') return '';
  if(f.t==='inter') return `Intermitente ${f.a||40}:${f.b||20} · ${f.c||3} rondas`;
  if(f.t==='amrap') return `AMRAP ${f.a||12}'`;
  if(f.t==='emom') return `EMOM ${f.a||10}'`;
  if(f.t==='rondas') return `${f.a||3} rondas${f.b?` · ${f.b} de descanso`:''}`;
  return '';
}
const UNI_RX = /unilateral|unipodal|un pie|una pierna|1 pierna|step|búlgara|bulgara|split|zancada|avanzada|hop|apoyo unipodal|estabilidad unipodal|y-balance/i;
function ladoKnee(name){ return UNI_RX.test(name) ? 'Lesionada' : 'Ambas'; }
function segOfKnee(it){
  const n=it.n;
  if(it.lift) return 'central';
  if(/perturb|unipodal|estabil|salt|pliom|aterriz|cambio.? de direcci|carrera|hop|equilibrio|contactos|aceleraci|juego|técnica con balón|pogo/i.test(n)) return 'neuro';
  if(/electroestim|isometr|tke|elevación de pierna|bfr|abducci|clamshell|almeja|plancha lateral|puente|glúteo|movilidad|extensión pasiva|flexión asistida|derrame/i.test(n)) return 'act';
  return 'central';
}
function segOfTherapy(it){ return /perturb|unipodal|pogo|aterriz|estabil/i.test(it.n) ? 'neuro' : 'act'; }

/* Emparejar cada ejercicio del protocolo con el banco de Manuel */
const _N = s => (s||'').normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\(.*?\)/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const STOP = new Set(['de','la','el','con','en','a','y','o','al','del','las','los','por','un','una','para','se']);
const tok = s => _N(s).split(' ').filter(w=>w && !STOP.has(w));
let BANCO = [];   // [{n,b,reg,fx,im,tn,kn,uni,ter,reps,rev,tk}]
function buildBanco(){
  const over = myMeta || {};
  BANCO = BANCO_BASE.map(r=>{ const o={n:r[0],b:{A:'act',N:'neuro',C:'central'}[r[1]],reg:r[2],fx:r[3],im:r[4],tn:r[5],kn:r[6],uni:r[7],ter:r[8],reps:r[9],rev:r[10]};
    const m=over[o.n]; if(m){ ['fx','im','tn','uni'].forEach(k=>{ if(m[k]!=null) o[k]=m[k]; }); if(m.kneel!=null) o.kn=m.kneel; if(m.bloque) o.b={'Activación':'act','Neuro':'neuro','Central':'central'}[m.bloque]||o.b; if(m.region) o.reg=m.region; o.oculto=!!m.oculto||!!m.eliminado; if(m.revisado) o.rev=0; }
    o.tk=tok(o.n); return o; }).filter(o=>!o.oculto);
  // ejercicios propios agregados por Manuel
  (myLib||[]).forEach(n=>{ if(!BANCO.find(x=>x.n===n) && !(over[n]&&over[n].eliminado)){ const m=over[n]||{}; BANCO.push({n,b:{'Activación':'act','Neuro':'neuro','Central':'central'}[m.bloque]||'central',reg:m.region||'gen',fx:m.fx??0,im:m.im??0,tn:m.tn??0,kn:m.kneel??0,uni:m.uni??0,ter:0,reps:'',rev:0,tk:tok(n),propio:1}); } });
}
function okFor(e, c){ return e.fx<=c.fx && e.tn<=c.tn && e.im<=c.im && !(c.noKneel && e.kn); }
function bankMatch(name, c){
  const t = tok(name); if(t.length<1) return null;
  let best=null, bs=0;
  for(const e of BANCO){
    if(!okFor(e,c)) continue;
    let hit=0; for(const w of t) if(e.tk.includes(w)) hit++;
    if(!hit) continue;
    const cov = hit/t.length, prec = hit/e.tk.length;
    if(cov<0.75 || prec<0.7) continue;
    const sc = cov*0.6 + prec*0.4 - (e.rev?0.05:0);
    if(sc>bs){ bs=sc; best=e; }
  }
  return bs>=0.8 ? best : null;
}
function fromBank(row, c){
  const e = bankMatch(row.e, c); if(!e || e.n===row.e) return row;
  const extra = (row.e.match(/\d+\s*[–-]\s*\d+\s*°|\d+\s*°/)||[])[0];
  const par = (row.e.match(/\(([^)]+)\)/)||[])[1];
  const nota = [extra?`Rango ${extra}.`:'', par && !_N(e.n).includes(_N(par)) ? par.charAt(0).toUpperCase()+par.slice(1)+'.' : '', row.n].filter(Boolean).join(' ');
  return Object.assign({}, row, {e:e.n, n:nota, orig:row.e});
}

function genWeek(s){
  if(modOf(s)==='deporte') return genWeekDep(s);
  if(modOf(s)==='salud') return genWeekSal(s);
  const key=pkey(s), i=phaseIdx(s), ph=P[key].phases[i];
  const n = s.dias==='4' ? 4 : 3, stage = STAGES[key][i];
  const c = constraints(s);
  const perfil = PERFILES[s.perfil||''];
  const espDays = stage==='late' && perfil.items ? (n===3 ? [1] : [1,3]) : [];
  const days=[];
  for(let d=0; d<n; d++){
    const heavy = n===3 ? true : (d===0 || d===2);
    let knee;
    if(n===3){ knee = d===1 ? liftsOnly(ph) : allKnee(ph); if(knee.length<3) knee=allKnee(ph); }
    else knee = heavy ? allKnee(ph) : lightKnee(ph);
    const ther = dailyTherapy(key,i,s);
    const tKeys = ther.map(t=>t.n.slice(0,14).toLowerCase());
    knee = knee.filter(it=> it!==ISO_TEND && !tKeys.includes(it.n.slice(0,14).toLowerCase()));
    const sanoLight = n===4 && !heavy;
    const up = n===3 ? (d===1?'B':'A') : (d%2===0?'A':'B');
    const B = {act:[], neuro:[], central:[]};
    ther.forEach(it=> B[segOfTherapy(it)].push(toRow(it,{ter:true, lado:/movilidad/i.test(it.n)?'Ambas':'Lesionada'})));
    coreItems(up, stage).forEach(it=> B.act.push(toRow(it,{lado:''})));
    knee.forEach(it=> B[segOfKnee(it)].push(toRow(it,{lado:ladoKnee(it.n), ter: stage==='early' && !it.lift})));
    if(espDays.includes(d)) perfil.items.forEach(it=> B.neuro.push(toRow(it,{lado:'Ambas'})));
    sanoItems(ph.sano, sanoLight).forEach(it=> B.central.push(toRow(it,{lado:'Sana'})));
    upperItems(up, stage).forEach(it=> B.central.push(toRow(it,{lado:''})));
    const segs = SEG_ORDER.map(t=>({type:t, sub:'', fmt:{t:'series'}, rows:B[t].map(r=>fromBank(r,c))}));
    if(!segs[1].rows.length) segs[1].rows.push(fromBank(toRow(X('Apoyo unipodal con perturbación','3 × 30–45 s'),{lado:'Lesionada',ter:true}),c));
    days.push({name:`Día ${d+1}`, segs});
  }
  return days;
}
const validWeek = days => Array.isArray(days) && days.every(d=>Array.isArray(d.segs) && d.segs.every(g=>SEG_ORDER.includes(g.type)));
function baseWeek(s){ const k=planKey(s); return (s.plans?.[k] && validWeek(s.plans[k])) ? {days:s.plans[k], custom:true} : {days:genWeek(s), custom:false}; }
/* Volumen semanal del lado sano en extensores de rodilla (tope de educación cruzada) */
function sanoVolume(days){
  let n=0; days.forEach(d=>d.segs.forEach(g=>g.rows.forEach(r=>{ if(r.lado==='Sana' && !/isometr/i.test(r.e) && /extensi|prensa|sentadilla|búlgara|bulgara|step|zancada/i.test(r.e)) n += parseInt(r.s)||0; }))); return n;
}

/* ===================== MESOCICLO ===================== */
const MESO = [
  {w:1, l:'Introducción', d:'RPE un punto por debajo del objetivo: aprender los ejercicios y encontrar las cargas.', rpe:-1, ser:0},
  {w:2, l:'Carga', d:'Dosis objetivo.', rpe:0, ser:0},
  {w:3, l:'Sobrecarga', d:'Una serie más en los ejercicios principales, mismo RPE.', rpe:0, ser:1},
  {w:4, l:'Descarga', d:'≈ 40–50 % menos series y un punto menos de RPE para consolidar.', rpe:-1, ser:-0.4}
];
const mesoWeek = s => { const wt=weekKind(s, curWeek(s)).wt; return (wt.k==='sob' && modOf(s)==='deporte' && phaseIdx(s)>=2) ? WT.car : wt; };
function adjSeries(str, ser, main){
  if(!str || !ser) return str;
  return str.replace(/\d+/g, x=>{ const v=+x; if(ser<0) return String(Math.max(1, Math.round(v*(1+ser)))); return main && v>=2 ? String(Math.min(6, v+ser)) : x; });
}
function adjRPE(str, d){
  if(!str || !d) return str;
  return str.replace(/RPE\s*([\d–]+)/, (m,g)=> 'RPE '+g.split('–').map(x=>String(Math.max(5,Math.min(10,+x+d)))).join('–'));
}
function applyMeso(days, s){
  const m = mesoWeek(s);
  if(!m.rpe && !m.ser) return days;
  const taperPh = modOf(s)==='deporte' && phaseIdx(s)===3 && ['taper','torneo'].includes(m.k);
  const out = clone(days);
  out.forEach(d=>d.segs.forEach(sg=>{
    sg.rows.forEach(r=>{
      if(r.ter) return;
      const main = /RPE\s*(8|9|10)/.test(r.c) && sg.type==='central';
      const noAdd = m.ser>0 && modOf(s)==='deporte' && phaseIdx(s)>=2;
      if(!taperPh && !noAdd) r.s = adjSeries(r.s, m.ser, main);
      if(!/RPE 10/.test(r.c)) r.c = adjRPE(r.c, m.rpe);
    });
  }));
  return out;
}
function viewWeek(s){ const b=baseWeek(s); return {days: editMode ? b.days : applyMeso(b.days, s), custom:b.custom}; }

/* ===================== SUGERENCIAS DESDE EL REGISTRO ===================== */
function lastFor(name){
  const sorted = sessions.slice().sort((a,b)=> (b.fecha||'').localeCompare(a.fecha||''));
  for(const ses of sorted){ const e=(ses.ex||[]).find(x=>x.e===name && (x.kg||x.rpe)); if(e) return {...e, fecha:ses.fecha}; }
  return null;
}
function suggestion(row){
  const l = lastFor(row.e); if(!l) return '';
  const tgt = (row.c.match(/RPE\s*(\d+)/)||[])[1]; const real = num(l.rpe);
  let act='';
  if(tgt && real!=null){ const t=+tgt; act = real<=t-1 ? 'sube la carga 2,5–5 %' : real>=t+1 ? 'baja la carga 5–10 %' : 'mantén y suma 1 repetición'; }
  return `Última: ${l.kg?l.kg+' kg':''}${l.reps?' × '+l.reps:''}${real!=null?' a RPE '+real:''}${act?' → '+act:''}`;
}

/* ===================== BIBLIOTECA Y VIDEOS ===================== */
let myLib = [], myMeta = {};
const BASE = new Set();
function collectBase(){
  Object.values(P).forEach(p=>p.phases.forEach(ph=>allKnee(ph).forEach(it=>BASE.add(it.n))));
  ['early','mid','late'].forEach(sg=>{ ['A','B'].forEach(t=>{ upperItems(t,sg).forEach(i=>BASE.add(i.n)); coreItems(t,sg).forEach(i=>BASE.add(i.n)); }); });
  ['cx','late'].forEach(k=>[true,false].forEach(l=>sanoItems(k,l).forEach(i=>BASE.add(i.n))));
  Object.values(PERFILES).forEach(p=>(p.items||[]).forEach(i=>BASE.add(i.n)));
  Object.values(DEPORTES).forEach(p=>[...p.prev,...p.neuro,...p.acc].forEach(i=>BASE.add(i.n)));
  Object.values(POOL).forEach(a=>a.forEach(i=>BASE.add(i.n)));
  BANCO_BASE.forEach(r=>BASE.add(r[0]));
}
function renderLib(){ const all=[...new Set([...myLib, ...BASE])].sort((a,b)=>a.localeCompare(b,'es')); $('#exlib').innerHTML = all.map(n=>`<option value="${esc(n)}"></option>`).join(''); }
const cueOf = n => myMeta[n]?.cue || ALTMAP[n]?.cue || '';
const videoOf = n => { const v=myMeta[n]?.video||''; return /^https?:\/\//i.test(v) ? v : ''; };
const REG_OF_PAT = {iso:'rod',okc:'rod',domr:'rod',uni:'rod',plio:'rod',domc:'cad',isq:'rod',glu:'cad',pant:'tob',est:'rod',core:'tro','sup-eh':'sup','sup-tv':'sup','sup-ev':'sup','sup-th':'sup','sup-acc':'sup',cardio:'gen'};
function candidates(name, s){
  const c = constraints(s);
  const self = BANCO.find(e=>e.n===name);
  const pat = classify(name);
  const reg = self ? self.reg : (pat ? REG_OF_PAT[pat] : null);
  const blk = self ? self.b : null;
  const t = tok(name);
  return BANCO.filter(e=> e.n!==name && okFor(e,c) && (!reg || e.reg===reg) && (!blk || e.b===blk))
    .map(e=>{ let hit=0; for(const w of t) if(e.tk.includes(w)) hit++; return [hit - e.rev*0.5 + (e.uni===(self?.uni??e.uni)?0.2:0), e]; })
    .sort((a,b)=>b[0]-a[0]).slice(0,12).map(x=>({n:x[1].n, cue:cueOf(x[1].n)||(x[1].reps?`Ejemplo: ${x[1].reps}`:'')}));
}
