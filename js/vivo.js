/* ===================== MODO EN VIVO (deportista) =====================
   Ejercicio por ejercicio: series con un toque, descanso automático, intermitentes,
   AMRAP y EMOM con reloj, RPE real al final de cada ejercicio y resumen con dolor.
   El fisio lo puede desactivar por paciente (st.vivoOff → contenido.vivo=false).
   El progreso se guarda en el dispositivo por si se cierra la página. */
let L = null, lvTick = null, lvWake = null;
const LV_KEY = 'apex_live';

function lvSets(s){ const m=String(s||'').match(/\d+/); return m ? Math.max(1, Math.min(20, +m[0])) : 1; }
function lvRest(sg){
  if(sg.fmt && sg.fmt.t==='rondas' && sg.fmt.b){
    const t=String(sg.fmt.b), mm=t.match(/(\d+)\s*(?:'|’|min)/), ss=t.match(/(\d+)/);
    if(mm) return +mm[1]*60; if(ss) return +ss[1];
  }
  return sg.type==='central' ? 90 : sg.type==='neuro' ? 45 : 30;
}
function lvSteps(day){
  const steps=[];
  day.segs.forEach(sg=>{
    const rows=(sg.rows||[]).filter(r=>r && r.e); if(!rows.length) return;
    const f=sg.fmt||{t:'series'}, base={seg:SEGS[sg.type]||sg.type, type:sg.type};
    if(f.t==='inter'){ steps.push({...base, k:'inter', rows, on:+f.a||40, off:+f.b||20, rounds:+f.c||3}); return; }
    if(f.t==='amrap'){ steps.push({...base, k:'amrap', rows, min:+f.a||12}); return; }
    if(f.t==='emom'){ steps.push({...base, k:'emom', rows, min:+f.a||10}); return; }
    if(f.t==='rondas'){ const n=+f.a||3; for(let r=1;r<=n;r++) steps.push({...base, k:'circ', rows, round:r, rounds:n, rest:lvRest(sg)}); return; }
    rows.forEach(row=>steps.push({...base, k:'ex', row, sets:lvSets(row.s), rest:lvRest(sg), log:isLoggable(sg,row)}));
  });
  steps.push({k:'end', seg:'Final', type:'end'});
  return steps;
}
function lvSave(){ if(L) LS.set(LV_KEY, JSON.stringify({pid:L.pid, planId:L.planId, di:L.di, i:L.i, done:L.done, log:L.log, rounds:L.rounds, t0:L.t0, sum:L.sum})); }
function lvNow(){ return Date.now(); }
function lvClock(){ return L.clk ? L.clk.acc + (L.clk.run ? lvNow()-L.clk.start : 0) : 0; }
function lvClkReset(run){ L.clk={acc:0, run:!!run, start:lvNow()}; L.phase=''; }
function lvClkToggle(){ if(!L.clk) lvClkReset(false); if(L.clk.run){ L.clk.acc=lvClock(); L.clk.run=false; } else { L.clk.start=lvNow(); L.clk.run=true; } }
function lvBeep(long){
  try{ navigator.vibrate && navigator.vibrate(long?[220,80,220]:120); }catch(e){}
  try{ const C=window.AudioContext||window.webkitAudioContext; if(!C) return; L.ac=L.ac||new C(); const o=L.ac.createOscillator(), g=L.ac.createGain();
    o.frequency.value=long?660:880; g.gain.value=.12; o.connect(g); g.connect(L.ac.destination); o.start(); o.stop(L.ac.currentTime+(long?.45:.15)); }catch(e){}
}
async function lvWakeOn(){ try{ if('wakeLock' in navigator && document.visibilityState==='visible') lvWake=await navigator.wakeLock.request('screen'); }catch(e){} }
document.addEventListener('visibilitychange', ()=>{ if(L && document.visibilityState==='visible') lvWakeOn(); });

function startLive(di){
  const c=A.plan?.contenido; if(!c) return;
  const day=c.dias[di];
  L={pid:A.p.id, planId:A.plan.id, di, day, steps:lvSteps(day), i:0, done:{}, log:{}, rounds:{}, t0:lvNow(), sum:{srpe:null, dolor:null, nota:''}, rest:null, clk:null};
  try{ const s=JSON.parse(LS.get(LV_KEY)||'null');
    if(s && s.pid===L.pid && s.planId===L.planId && s.di===di && lvNow()-s.t0 < 12*3600e3){ Object.assign(L, {i:Math.min(s.i, L.steps.length-1), done:s.done||{}, log:s.log||{}, rounds:s.rounds||{}, t0:s.t0, sum:s.sum||L.sum}); toast('Retomando donde ibas'); }
  }catch(e){}
  let el=$('#live'); if(!el){ el=document.createElement('div'); el.id='live'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-label','Entrenamiento en vivo'); document.body.appendChild(el); el.addEventListener('click', lvClick); el.addEventListener('input', lvInput); }
  el.hidden=false; document.body.classList.add('lvopen');
  lvWakeOn(); clearInterval(lvTick); lvTick=setInterval(lvTickFn, 250);
  renderLive();
}
function closeLive(keep){
  clearInterval(lvTick); lvTick=null; try{ lvWake && lvWake.release(); }catch(e){} lvWake=null;
  const el=$('#live'); if(el){ el.hidden=true; el.innerHTML=''; } document.body.classList.remove('lvopen');
  if(!keep) LS.set(LV_KEY, null); L=null;
}
function lvGo(n){
  L.i=Math.max(0, Math.min(L.steps.length-1, n)); L.rest=null; L.clk=null; L.phase='';
  lvSave(); renderLive(); $('#live .lvmain')?.scrollTo(0,0);
}
function fmtT(s){ s=Math.max(0, Math.ceil(s)); const m=Math.floor(s/60); return m ? `${m}:${String(s%60).padStart(2,'0')}` : String(s); }

/* Estado del reloj para intermitente / AMRAP / EMOM */
function lvTimed(st){
  const p=lvClock()/1000;
  if(st.k==='inter'){
    const cyc=st.on+st.off, n=st.rounds*st.rows.length, total=n*cyc, idx=Math.min(n-1, Math.floor(p/cyc)), w=p-idx*cyc, on=w<st.on;
    return {done:p>=total, label:p>=total?'Terminado':on?'Trabajo':'Pausa', on, left:on?st.on-w:cyc-w, row:st.rows[idx%st.rows.length], next:st.rows[(idx+1)%st.rows.length], round:Math.floor(idx/st.rows.length)+1, of:st.rounds, key:p>=total?'end':idx+(on?'a':'b'), pct:Math.min(100,p/total*100)};
  }
  if(st.k==='amrap'){ const total=st.min*60; return {done:p>=total, label:p>=total?'Terminado':'AMRAP', on:true, left:total-p, key:p>=total?'end':'run', pct:Math.min(100,p/total*100)}; }
  if(st.k==='emom'){ const total=st.min*60, idx=Math.min(st.min-1, Math.floor(p/60)); return {done:p>=total, label:p>=total?'Terminado':`Minuto ${idx+1} de ${st.min}`, on:true, left:60-(p-idx*60), row:st.rows[idx%st.rows.length], next:st.rows[(idx+1)%st.rows.length], key:p>=total?'end':idx, pct:Math.min(100,p/total*100)}; }
  return null;
}
function lvTickFn(){
  if(!L) return;
  if(L.rest){ const left=(L.rest.end-lvNow())/1000;
    if(left<=0){ L.rest=null; lvBeep(true); renderLive(); return; }
    const t=$('#lvRestT'); if(t) t.textContent=fmtT(left); const b=$('#lvRestBar'); if(b) b.style.width=(100-left/L.rest.dur*100)+'%'; return; }
  const st=L.steps[L.i]; if(!L.clk || !['inter','amrap','emom'].includes(st.k)) return;
  const s=lvTimed(st);
  if(s.key!==L.phase){ const first=!L.phase; L.phase=s.key; if(!first) lvBeep(s.done||!s.on); if(s.done){ L.clk.acc=lvClock(); L.clk.run=false; L.done[L.i]=true; lvSave(); } renderLive(); return; }
  const t=$('#lvClk'); if(t) t.textContent=fmtT(s.left); const b=$('#lvClkBar'); if(b) b.style.width=s.pct+'%';
}
function lvStartRest(sec){ if(sec>0){ L.rest={end:lvNow()+sec*1000, dur:sec}; } renderLive(); }

/* ---------- Pantallas ---------- */
const lvSide = l => l ? `<span class="lado l-${l==='Sana'?'s':l==='Lesionada'?'l':'a'}">${esc(l==='Lesionada'?'Pierna lesionada':l==='Sana'?'Pierna sana':'Ambas')}</span>` : '';
function lvVideo(r){ return r.video ? `<a class="lvvid" href="${esc(r.video)}" target="_blank" rel="noopener"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4z" fill="currentColor"/></svg>Ver video</a>` : ''; }
function lvChips(name, val, from, to, label){
  let h=`<div class="lvchips" role="group" aria-label="${esc(label)}">`;
  for(let v=from; v<=to; v++) h+=`<button type="button" class="lvchip${val===v?' on':''}" data-chip="${name}|${v}" aria-pressed="${val===v}">${v}</button>`;
  return h+'</div>';
}
function lvExStep(st){
  const r=st.row, d=L.done[L.i]||[], lg=L.log[r.e]||{};
  let sets=''; for(let s=0;s<st.sets;s++) sets+=`<button type="button" class="lvset${d[s]?' on':''}" data-set="${s}" aria-pressed="${!!d[s]}"><span>Serie ${s+1}</span><b>${esc(r.r||'—')}</b><i>${esc(sinRPE(r.c))}</i></button>`;
  const all=d.filter(Boolean).length>=st.sets;
  return `<div class="lvex"><div class="lvmeta">${lvSide(r.lado)}${r.ter?'<span class="lado l-a">Terapia</span>':''}</div>
    <h1 class="lvname">${esc(r.e)}</h1>${r.cue?`<p class="lvcue">${esc(r.cue)}</p>`:''}${r.n?`<p class="lvnote">${esc(r.n)}</p>`:''}${lvVideo(r)}
    <div class="lvsets">${sets}</div>
    ${st.log&&all?`<div class="lvbox"><b>¿Qué RPE sentiste en la última serie? <span class="lvopt">Opcional</span></b>${lvChips('rpe', lg.rpe??null, 5, 10, 'RPE real')}
      <div class="row2"><label class="f">Peso (kg)<input type="number" inputmode="decimal" step="0.5" data-lg="kg" value="${lg.kg??''}"></label><label class="f">Reps hechas<input type="number" inputmode="numeric" data-lg="reps" value="${lg.reps??''}"></label></div></div>`:''}
  </div>`;
}
function lvCircStep(st){
  const d=L.done[L.i]||[];
  return `<div class="lvex"><div class="lvmeta"><span class="lado l-a">Ronda ${st.round} de ${st.rounds}</span></div><h1 class="lvname">Circuito</h1>
    <div class="lvlist">${st.rows.map((r,k)=>`<button type="button" class="lvrow${d[k]?' on':''}" data-set="${k}" aria-pressed="${!!d[k]}"><span class="ck" aria-hidden="true"></span><span class="t"><b>${esc(r.e)}</b><i>${esc([r.r, sinRPE(r.c), r.lado&&r.lado!=='Ambas'?r.lado:''].filter(Boolean).join(' · '))}</i></span></button>`).join('')}</div>
    <p class="lvnote">Descanso al terminar la ronda: ${fmtT(st.rest)} s</p></div>`;
}
function lvTimedStep(st){
  if(!L.clk) lvClkReset(false);
  const s=lvTimed(st), run=L.clk.run;
  const head = st.k==='inter' ? `Intermitente ${st.on}" / ${st.off}" · ${st.rounds} rondas` : st.k==='amrap' ? `AMRAP ${st.min} min` : `EMOM ${st.min} min`;
  const cur = s.row ? `<div class="lvnow"><span>${s.on===false?'Siguiente':'Ahora'}</span><b>${esc((s.on===false?s.next:s.row).e)}</b><i>${esc([(s.on===false?s.next:s.row).r, lvSideTxt((s.on===false?s.next:s.row).lado)].filter(Boolean).join(' · '))}</i>${lvVideo(s.on===false?s.next:s.row)}</div>` : '';
  const am = st.k==='amrap' ? `<div class="lvbox"><b>Rondas completas</b><div class="lvcount"><button type="button" class="lvround" data-rnd="-1" aria-label="Restar ronda">−</button><output>${L.rounds[L.i]||0}</output><button type="button" class="lvround" data-rnd="1" aria-label="Sumar ronda">+</button></div>
      <div class="lvlist sm">${st.rows.map(r=>`<div class="lvrow ro"><span class="t"><b>${esc(r.e)}</b><i>${esc([r.r, sinRPE(r.c)].filter(Boolean).join(' · '))}</i></span></div>`).join('')}</div></div>` : '';
  return `<div class="lvex"><div class="lvmeta"><span class="lado l-a">${esc(head)}</span>${s.round?`<span class="lado l-a">Ronda ${s.round} de ${s.of}</span>`:''}</div>
    <div class="lvclock ${s.done?'fin':s.on?'on':'off'}"><span class="lbl">${esc(s.label)}</span><span class="big" id="lvClk">${s.done?'✓':fmtT(s.left)}</span><div class="bar"><i id="lvClkBar" style="width:${s.pct}%"></i></div></div>
    ${s.done?'':cur}${am}
    <div class="lvctl"><button type="button" class="lvbtn ghost" data-clk="reset" aria-label="Reiniciar reloj"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></button>
      <button type="button" class="lvbtn primary grow" data-clk="toggle">${s.done?'Repetir':run?'Pausar':lvClock()>0?'Seguir':'Empezar'}</button></div>
    ${st.k==='inter' && typeof TB_REG!=='undefined' ? (()=>{ const id='lv'+L.i; TB_REG[id]={pre:{work:st.on, rest:st.off, srest:st.off, sets:st.rounds, ex:Math.max(1, st.rows.length), names:st.rows.map(r=>r.e)}, src:`${st.seg}: intermitente ${st.on}" / ${st.off}"`}; return `<button type="button" class="lvbtn ghost tb-lv" data-tbopen="${id}">Cronómetro con silbato y campana</button>`; })() : ''}</div>`;
}
const lvSideTxt = l => l==='Lesionada'?'Pierna lesionada':l==='Sana'?'Pierna sana':'';
function lvEndStep(){
  const S=L.sum, mins=Math.max(1, Math.round((lvNow()-L.t0)/60000)), rod=(A.plan?.contenido?.modulo||'rodilla')==='rodilla', lumb=A.plan?.contenido?.modulo==='lumbar', zr=A.plan?.contenido?.rehab;
  const doneEx=L.steps.filter((s,k)=>s.k!=='end' && (L.done[k]===true || (Array.isArray(L.done[k]) && L.done[k].some(Boolean)))).length, totEx=L.steps.length-1;
  return `<div class="lvex"><h1 class="lvname">Sesión terminada</h1><p class="lvcue">${doneEx} de ${totEx} bloques hechos · ${mins} min</p>
    <div class="lvbox"><b>¿Qué tan dura fue la sesión completa? (RPE 1–10)</b>${lvChips('srpe', S.srpe, 1, 10, 'RPE de la sesión')}</div>
    <div class="lvbox"><b>${rod?'Dolor de rodilla durante la sesión (0–10)':lumb?'Dolor de espalda durante la sesión (0–10)':zr?.zona?`Dolor del ${zr.zona} durante la sesión (0–10)`:'Dolor durante la sesión (0–10)'}</b>${lvChips('dolor', S.dolor, 0, 10, 'Dolor')}
      ${S.dolor!=null&&S.dolor>5?'<p class="lvwarn">Dolor alto. Tu fisioterapeuta recibirá un aviso. Mañana baja la carga y cuéntale cómo amaneciste.</p>':S.dolor!=null&&S.dolor>=4?'<p class="lvnote">Dolor moderado: la próxima vez mantén la misma carga.</p>':''}</div>
    <label class="f">Comentario (opcional)<textarea data-sum="nota" maxlength="2000" placeholder="Cómo te sentiste, algo que molestó…">${esc(S.nota||'')}</textarea></label>
    <button type="button" class="lvbtn primary full" data-save="1">Guardar sesión</button></div>`;
}
function renderLive(){
  const el=$('#live'); if(!el || !L) return;
  const st=L.steps[L.i], n=L.steps.length, segs=[...new Set(L.steps.filter(s=>s.k!=='end').map(s=>s.type))];
  const body = st.k==='ex' ? lvExStep(st) : st.k==='circ' ? lvCircStep(st) : st.k==='end' ? lvEndStep() : lvTimedStep(st);
  const isDone = st.k==='ex' ? (L.done[L.i]||[]).filter(Boolean).length>=st.sets : st.k==='circ' ? (L.done[L.i]||[]).filter(Boolean).length>=st.rows.length : !!L.done[L.i];
  el.innerHTML = `<div class="lvtop">
      <button type="button" class="lvx" data-close="1" aria-label="Salir del modo en vivo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <div class="lvtt"><span>${esc(L.day.name)}${A.plan?.contenido?.semana?', semana '+esc(A.plan.contenido.semana):''}</span><b>${st.k==='end'?'Cierre':esc(st.seg)}</b></div>
      ${st.k==='end'?`<span class="lvpos">${Math.min(L.i+1,n-1)}/${n-1}</span>`:`<button type="button" class="lvend" data-go="${n-1-L.i}">Terminar</button>`}</div>
    <div class="lvprog"><i style="width:${(L.i/(n-1))*100}%"></i></div>
    <div class="lvsegs">${segs.map(t=>`<span class="${t===st.type?'on':L.steps.findIndex(s=>s.type===t)<L.i?'ok':''}">${esc(SEGS[t]||t)}</span>`).join('')}</div>
    <div class="lvmain">${body}</div>
    ${L.rest?`<div class="lvrest" role="timer" aria-live="off"><span class="lbl">Descanso</span><span class="big" id="lvRestT">${fmtT((L.rest.end-lvNow())/1000)}</span><div class="bar"><i id="lvRestBar"></i></div>
      <div class="lvctl"><button type="button" class="lvbtn ghost" data-rest="15">+15 s</button><button type="button" class="lvbtn primary grow" data-rest="skip">Saltar descanso</button></div></div>`:''}
    ${st.k==='end'?`<div class="lvbot"><button type="button" class="lvbtn ghost grow" data-go="-1">Volver</button></div>`:
      `<div class="lvbot"><button type="button" class="lvbtn ghost" data-go="-1" ${L.i===0?'disabled':''} aria-label="Anterior">←</button><button type="button" class="lvbtn ${isDone?'primary':'ghost'} grow" data-go="1">${isDone?'Siguiente':'Saltar'}</button></div>`}`;
}
function lvClick(e){
  if(!L) return; const q=s=>e.target.closest(s); let b; const st=L.steps[L.i];
  if(q('[data-close]')){ if(L.i>0 && st.k!=='end'){ closeLive(true); toast('Tu progreso quedó guardado. Toca "Entrenar en vivo" para seguir.'); } else closeLive(false); return; }
  if((b=q('[data-go]'))){ lvGo(L.i + +b.dataset.go); return; }
  if((b=q('[data-rest]'))){ if(b.dataset.rest==='skip'){ L.rest=null; renderLive(); } else if(L.rest){ L.rest.end+=15000; L.rest.dur+=15; } return; }
  if((b=q('[data-set]'))){
    const k=+b.dataset.set, d=L.done[L.i]=(L.done[L.i]||[]).slice(); d[k]=!d[k]; lvSave();
    const tot = st.k==='ex' ? st.sets : st.rows.length, cnt=d.filter(Boolean).length;
    if(d[k] && st.k==='ex' && cnt<tot) return lvStartRest(st.rest);
    if(d[k] && st.k==='circ' && cnt>=tot && st.round<st.rounds) return lvStartRest(st.rest);
    renderLive(); return;
  }
  if((b=q('[data-chip]'))){ const [nm,v]=b.dataset.chip.split('|');
    if(nm==='rpe'){ const r=st.row.e; L.log[r]=Object.assign({}, L.log[r], {rpe:+v}); } else L.sum[nm]=+v;
    lvSave(); renderLive(); return; }
  if((b=q('[data-rnd]'))){ L.rounds[L.i]=Math.max(0,(L.rounds[L.i]||0)+ +b.dataset.rnd); lvSave(); renderLive(); return; }
  if((b=q('[data-clk]'))){ if(b.dataset.clk==='reset') lvClkReset(false); else { const s=lvTimed(st); if(s.done){ lvClkReset(true); L.done[L.i]=false; } else lvClkToggle(); } L.phase=lvTimed(st).key; renderLive(); return; }
  if(q('[data-save]')) lvFinish();
}
function lvInput(e){
  const t=e.target; if(!L) return;
  if(t.dataset.lg){ const r=L.steps[L.i].row.e, v=num(t.value); L.log[r]=Object.assign({}, L.log[r], {[t.dataset.lg]:v}); lvSave(); }
  if(t.dataset.sum){ L.sum[t.dataset.sum]=t.value; lvSave(); }
}
async function lvFinish(){
  const S=L.sum;
  if(S.srpe==null){ toast('Elige el RPE de la sesión.'); return; }
  if(S.dolor==null){ toast('Elige tu nivel de dolor (0 si no hubo).'); return; }
  const c=A.plan.contenido, clamp=(v,a,b)=>v==null?null:Math.max(a,Math.min(b,Math.round(v)));
  const ex=Object.entries(L.log).map(([e,v])=>({e, kg:v.kg??null, reps:v.reps??null, rpe:v.rpe??null})).filter(x=>x.kg!=null||x.rpe!=null||x.reps!=null);
  const amr=L.steps.map((s,k)=>s.k==='amrap'&&L.rounds[k]?`AMRAP ${s.min}': ${L.rounds[k]} rondas`:'').filter(Boolean);
  const row={fecha:todayISO(), dia:L.day.name, min:clamp((lvNow()-L.t0)/60000,1,600), srpe:clamp(S.srpe,0,10), dolor:clamp(S.dolor,0,10), d24:'',
    nota:[(S.nota||'').trim(), ...amr, 'Registrada en modo en vivo'].filter(Boolean).join(' · ').slice(0,2000), ex,
    paciente_id:A.p.id, semana:c.semana, fase:(c.fase||'').split(' · ')[0], autor:'deportista', created_by:me.uid};
  const btn=$('#live [data-save]'); if(btn){ btn.disabled=true; btn.classList.add('busy'); }
  const {data,error,queued}=await sbWrite('insert','sesiones',row);
  if(btn){ btn.disabled=false; btn.classList.remove('busy'); }
  if(error){ toast('No se pudo guardar. Tu progreso sigue aquí; inténtalo de nuevo.'); return; }
  sessions.unshift(data); closeLive(false); cacheAthlete(); renderAthlete(); toast(queued?'Sesión guardada en el teléfono; se envía sola al volver la conexión':'Sesión guardada. ¡Buen trabajo!');
}

/* Pregunta del día siguiente: ¿cómo amaneció la rodilla? (alimenta la alerta "peor a las 24 h") */
function d24Card(){
  const c=A.plan?.contenido; if(!c || !(['rodilla','lumbar'].includes(c.modulo||'rodilla') || c.rehab?.zona)) return '';
  const zona = c.modulo==='lumbar' ? 'espalda' : c.rehab?.zona || 'rodilla';
  const today=todayISO(), lim=new Date(Date.now()-3*864e5).toISOString().slice(0,10);
  const s=sessions.filter(x=>x.autor==='deportista' && !x.d24 && x.fecha<today && x.fecha>=lim).sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];
  if(!s) return '';
  return `<section class="card d24"><h3 class="sec">¿Cómo amaneció tu ${zona}?</h3><p class="small" style="margin:0 0 10px">${zona==='pie'?'Los primeros pasos al levantarte, después':'Después'} de la sesión del ${esc(fmtD?fmtD(s.fecha):s.fecha)} (${esc(s.dia||'')}), comparada con antes de entrenar.</p>
    <div class="lvchips three"><button class="lvchip" data-d24="${esc(s.id)}|mejor">Mejor</button><button class="lvchip" data-d24="${esc(s.id)}|igual">Igual</button><button class="lvchip bad" data-d24="${esc(s.id)}|peor">Peor</button></div></section>`;
}
$('#athleteApp').addEventListener('click', async e=>{
  const lb=e.target.closest('[data-live]'); if(lb){ startLive(+lb.dataset.live); return; }
  const b=e.target.closest('[data-d24]'); if(!b) return;
  const [id,v]=b.dataset.d24.split('|');
  const {error}=await sbWrite('update','sesiones',{d24:v},{id});
  if(error){ toast('No se pudo guardar.'); return; }
  const s=sessions.find(x=>x.id===id); if(s) s.d24=v; cacheAthlete(); renderAthlete();
  toast(v==='peor'?'Anotado. Tu fisioterapeuta recibirá un aviso; hoy baja la carga.':'¡Gracias! Anotado.');
});

/* ===================== ALERTAS DE DOLOR (fisio) ===================== */
let alertas = [], alertChan = null, alertOpen = false, FISIO_PUSH = null;
const isAlerta = s => s && !s.revisada_at && ((s.dolor!=null && s.dolor>5) || s.d24==='peor');
async function loadAlerts(){
  const desde=new Date(Date.now()-30*864e5).toISOString().slice(0,10);
  const {data,error}=await sb.from('sesiones').select('id,paciente_id,fecha,dia,dolor,d24,nota,autor,created_at,revisada_at')
    .or('dolor.gt.5,d24.eq.peor').is('revisada_at',null).gte('fecha',desde).order('fecha',{ascending:false}).limit(50);
  if(error) return; alertas=(data||[]).filter(isAlerta); renderAlerts();
}
function alertName(pid){ return (patients.find(p=>p.id===pid)||{}).nombre || 'Usuario'; }
function alertWhy(s){ return [s.dolor!=null&&s.dolor>5?`Dolor ${s.dolor}/10`:'', s.d24==='peor'?'Peor a las 24 h':''].filter(Boolean).join(' · '); }
function renderAlerts(){
  const b=$('#bAlert'); if(!b) return;
  if(typeof homeVisible==='function' && homeVisible()) renderHome();
  const n=alertas.length; b.classList.toggle('has', n>0);
  $('#alertN').textContent=n>9?'9+':String(n); $('#alertN').hidden=!n;
  b.setAttribute('aria-label', n?`Alertas de dolor: ${n} sin revisar`:'Alertas de dolor: ninguna');
  const p=$('#alertPanel'); if(!p) return; p.hidden=!alertOpen; if(!alertOpen) return;
  const canN = FISIO_PUSH && FISIO_PUSH!=='on' && FISIO_PUSH!=='unsupported';
  p.innerHTML = `<div class="alh"><b>Alertas de dolor</b><span class="small">últimos 30 días</span></div>
    ${n?alertas.map(s=>`<div class="ali"><span class="dot r" aria-hidden="true"></span><div class="alt"><b>${esc(alertName(s.paciente_id))}</b><span>${esc(alertWhy(s))}</span><i>${esc(fmtD?fmtD(s.fecha):s.fecha)}${s.dia?' · '+esc(s.dia):''}${s.nota?' · '+esc(s.nota.slice(0,90)):''}</i></div>
      <div class="ala"><button class="mini-btn" data-aopen="${esc(s.paciente_id)}">Abrir</button><button class="mini-btn" data-aok="${esc(s.id)}">Revisada</button></div></div>`).join('')
      : '<p class="small" style="margin:6px 0">Nada pendiente. Aquí aparece cuando un deportista registra dolor mayor a 5/10 o dice que amaneció peor.</p>'}
    ${canN?`<div class="alpush"><p class="small" style="margin:0">${FISIO_PUSH==='install'?'En iPhone, instala la app (Compartir → Agregar a inicio) para recibir las alertas con el celular bloqueado.':FISIO_PUSH==='denied'?'Las notificaciones están bloqueadas en este navegador; actívalas en sus ajustes.':'Recibe estas alertas aunque tengas el celular bloqueado.'}</p>${FISIO_PUSH==='off'?'<button class="primary" id="aNotif">Activar notificaciones</button>':''}</div>`:''}`;
}
async function markReviewed(id){
  const {error}=await sb.from('sesiones').update({revisada_at:new Date().toISOString()}).eq('id',id);
  if(error){ toast('No se pudo marcar.'); return; }
  alertas=alertas.filter(a=>a.id!==id); renderAlerts();
}
function onSesionChange(pl){
  const s=pl.new; if(!s || !s.id) return;
  const had=alertas.some(a=>a.id===s.id);
  if(isAlerta(s)){
    if(!had){ alertas.unshift(s); const msg=`${alertName(s.paciente_id)}: ${alertWhy(s)}`; toast('Alerta · '+msg);
      try{ if('Notification' in window && Notification.permission==='granted' && document.visibilityState!=='visible') new Notification('Ápex · alerta de dolor', {body:msg, icon:'icons/icon-192.png', tag:s.id}); }catch(e){} }
    else alertas=alertas.map(a=>a.id===s.id?s:a);
  } else if(had) alertas=alertas.filter(a=>a.id!==s.id);
  renderAlerts();
}
function initAlerts(){
  pushState().then(s=>{ FISIO_PUSH=s; renderAlerts(); });
  if(/[?&]alertas=1/.test(location.search)){ alertOpen=true; history.replaceState(null,'',location.pathname); }
  loadAlerts();
  if(!alertChan && sb.channel){ try{ alertChan=sb.channel('alertas-dolor').on('postgres_changes',{event:'*',schema:'public',table:'sesiones'}, onSesionChange).subscribe(); }catch(e){} }
}
$('#bAlert').onclick=()=>{ alertOpen=!alertOpen; $('#bAlert').setAttribute('aria-expanded', String(alertOpen)); renderAlerts(); };
$('#alertPanel').addEventListener('click', async e=>{
  const q=s=>e.target.closest(s); let b;
  if((b=q('[data-aok]'))) return markReviewed(b.dataset.aok);
  if((b=q('[data-aopen]'))){ alertOpen=false; renderAlerts(); openPatient(b.dataset.aopen, 'ses'); return; }
  if(q('#aNotif')){ if(await enablePush('fisio')) FISIO_PUSH='on'; renderAlerts(); }
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && alertOpen){ alertOpen=false; renderAlerts(); $('#bAlert').focus(); } });
