/* ===================== PIEZAS DE RENDER ===================== */
function refList(keys){
  const ks=[...new Set(keys)].filter(k=>R[k]);
  return `<details class="ev"><summary>Evidencia</summary><ol>${ks.map(k=>`<li><span class="lv ${R[k].l}">${R[k].l}</span>${esc(R[k].c)} <span class="ref-k">— ${esc(R[k].k)}</span></li>`).join('')}</ol></details>`;
}
function critList(ids, s){
  return `<ul class="crit">${ids.map(id=>{
    if(CR[id].m) return `<li><input type="checkbox" data-chk="${id}" ${s.chk?.[id]?'checked':''} aria-label="${esc(CR[id].t)}"><span>${esc(CR[id].t)} <span class="small">(márcalo tras tu evaluación)</span></span></li>`;
    const r=critVal(id,s); const k=r===true?'y':r===false?'n':'u'; const sym=r===true?'✓':r===false?'✗':'·';
    return `<li><span class="ck ${k}">${sym}</span><span>${esc(CR[id].t)}${r==null?' <span class="small">(sin dato)</span>':''}</span></li>`; }).join('')}</ul>`;
}
function painLight(s){
  const effUp = s.derrame>=3;
  if(s.dolor>5 || s.resp24==='peor') return {c:'r', t:'Reducir carga', p:'Dolor > 5/10 o peor que el basal a las 24 h: baja 1–2 puntos de RPE o un 20–30 % del volumen y reevalúa en la próxima sesión.'};
  if(s.dolor>=4 || effUp) return {c:'y', t:'Mantener carga', p: effUp ? 'Derrame 2+ o más: mantén la carga y prioriza controlar el derrame antes de progresar.' : 'Dolor 4–5/10: repite la misma carga y RPE.'};
  return {c:'g', t:'Progresar carga', p:'Dolor ≤ 3/10 y vuelve a basal a las 24 h: si el RPE real quedó por debajo del objetivo, sube peso; si quedó en el objetivo, suma 1–2 repeticiones.'};
}
const isLoggable = (sg,r) => ['neuro','central'].includes(sg.type) && /RPE\s*[6-9]|RPE\s*10/.test(r.c||'') && !r.ter;
const ladoTag = l => l ? `<span class="lado l-${l==='Sana'?'s':l==='Lesionada'?'l':'a'}">${esc(l)}</span>` : '<span class="lado l-n">—</span>';

/* RPE: uno solo por sesión (oct 2026). El dato sigue guardado en cada fila (lo usan los ajustes del
   chequeo y del mesociclo); en pantalla se muestra una vez, arriba de la sesión. */
const RPE_IN = /RPE\s*[\d–-]+/i;
function sinRPE(c){ return String(c||'').replace(/\s*[·,]?\s*RPE\s*[\d–-]+\s*[·,]?\s*/i,' · ').replace(/^\s*·\s*|\s*·\s*$/g,'').trim(); }
function rpeRango(rows){
  const v=[]; rows.forEach(r=>{ const m=String(r.c||'').match(/RPE\s*([\d–-]+)/i); if(m) m[1].split(/[–-]/).forEach(x=>{ if(x!==''&&!isNaN(+x)) v.push(+x); }); });
  if(!v.length) return ''; const lo=Math.min(...v), hi=Math.max(...v); return lo===hi?`${lo}`:`${lo}–${hi}`;
}
function rpeSes(day){
  if(day.rpe) return String(day.rpe).replace(/^RPE\s*/i,'').replace('-','–');
  const main=day.segs.filter(sg=>sg.type!=='act').flatMap(sg=>sg.rows.filter(r=>!r.ter));
  return rpeRango(main.length?main:day.segs.flatMap(sg=>sg.rows));
}
function rowView(r){
  const cue=cueOf(r.e), vid=videoOf(r.e), sug=suggestion(r);
  return `<tr><td class="e">${r.ter?'<span class="ter" title="Terapia">T</span>':''}${vid?`<a href="${esc(vid)}" target="_blank" rel="noopener">${esc(r.e)}</a>`:esc(r.e)}${cue?`<div class="cue">${esc(cue)}</div>`:''}${sug?`<div class="sug">${esc(sug)}</div>`:''}</td>${isRod(st)?`<td class="ld">${ladoTag(r.lado)}</td>`:''}<td class="s">${esc(r.s)}</td><td class="r">${esc(r.r)}</td><td class="c">${esc(sinRPE(r.c))}</td><td class="n">${esc(r.n)}</td></tr>`;
}
function rowEdit(r, di, gi, ri){
  const a=(f,w,v)=>`<input value="${esc(v??r[f])}" data-d="${di}" data-g="${gi}" data-r="${ri}" data-f="${f}"${w?` style="width:${w}"`:''} aria-label="${f}">`;
  const ta=(f,lbl,v)=>`<textarea rows="1" class="grow" data-d="${di}" data-g="${gi}" data-r="${ri}" data-f="${f}" aria-label="${lbl}"${f==='e'?' data-sugx autocomplete="off"':''}>${esc(v??r[f])}</textarea>`;
  let html = `<tr><td class="e">${ta('e','Ejercicio')}</td>
    ${isRod(st)?`<td class="ld"><select data-d="${di}" data-g="${gi}" data-r="${ri}" data-f="lado" aria-label="Lado"><option value="">—</option>${LADOS.map(l=>`<option${r.lado===l?' selected':''}>${l}</option>`).join('')}</select><label class="tchk"><input type="checkbox" data-d="${di}" data-g="${gi}" data-r="${ri}" data-f="ter"${r.ter?' checked':''}> Terapia</label></td>`:''}
    <td class="s">${a('s','4.5em')}</td><td class="r">${a('r','7em')}</td><td class="c">${ta('c','Carga',sinRPE(r.c))}</td><td class="n">${ta('n','Nota')}</td>
    <td class="x"><button class="xbtn" data-del="${di}|${gi}|${ri}" aria-label="Quitar ejercicio">×</button></td></tr>`;
  if(subOpen===`${di}|${gi}|${ri}`){
    const c=candidates(r.e, st);
    html += `<tr class="subrow"><td colspan="8">${c.length?`<span class="small">Alternativas que respetan las restricciones de esta fase:</span><div class="picks">${c.map(x=>`<button class="pick" data-pick="${di}|${gi}|${ri}|${esc(x.n)}">${esc(x.n)}<i>${esc(x.cue)}</i></button>`).join('')}</div>`:'<span class="small">No hay alternativas en la biblioteca que respeten las restricciones de esta fase. Escribe una tú.</span>'}</td></tr>`;
  }
  return html;
}
function logForm(day, di){
  const ex=[]; day.segs.forEach(sg=>sg.rows.forEach(r=>{ if(isLoggable(sg,r)) ex.push(r); }));
  return `<div class="logf" id="logf">
    <h4>Registrar sesión · ${esc(day.name)}</h4>
    <div class="row5">
      <label class="f">Fecha<input type="date" id="lf-fecha" value="${todayISO()}"></label>
      <label class="f">Duración (min)<input type="number" id="lf-min" min="0" max="300" value="75"></label>
      <label class="f">RPE de la sesión (0–10)<input type="number" id="lf-srpe" min="0" max="10" value="7"></label>
      <label class="f">Dolor durante (0–10)<input type="number" id="lf-dolor" min="0" max="10" value="${st.dolor}"></label>
      <label class="f">A las 24 h<select id="lf-d24"><option value="">Aún no</option><option value="mejor">Mejor que basal</option><option value="igual" selected>Vuelve a basal</option><option value="peor">Peor que basal</option></select></label>
    </div>
    ${ex.length?`<div class="tbl"><table class="pl" style="min-width:480px"><thead><tr><th>Ejercicio</th><th>kg</th><th>Reps hechas</th><th>RPE real</th></tr></thead><tbody>
      ${ex.map((r,k)=>`<tr><td class="e">${esc(r.e)}</td><td><input type="number" step="0.5" data-lx="${k}" data-lf="kg" style="width:6em"></td><td><input type="number" data-lx="${k}" data-lf="reps" style="width:5em"></td><td><input type="number" min="1" max="10" data-lx="${k}" data-lf="rpe" style="width:5em"></td></tr>`).join('')}
    </tbody></table></div>`:''}
    <label class="f">Comentario<input type="text" id="lf-nota"></label>
    <div class="actions"><button class="primary" id="lfSave" data-day="${di}">Guardar sesión</button><button id="lfCancel">Cancelar</button></div>
  </div>`;
}
let editDay = null;   // día que se está editando (null = ninguno)
function dayHTML(day, di){
  const ed = editMode && (editDay==null || editDay===di);
  const saveBtn = `<button type="button" class="dsave" data-dsave="${di}">Guardar</button>`;
  const headBtns = ed ? saveBtn
    : `<span class="dbtns"><button type="button" class="lbtn dedit" data-dedit="${di}">Editar</button><button class="lbtn" data-log="${di}">${logOpen===di?'Cerrar registro':'Registrar sesión'}</button></span>`;
  return `<section class="card day${ed?' editing':''}" style="padding:12px" data-day="${di}">
  <div class="dayhead"><h3>${esc(day.name)}</h3>${headBtns}</div>
  ${(()=>{ const auto=(()=>{ const d=clone(day); delete d.rpe; return rpeSes(d); })(), v=rpeSes(day);
    return ed ? `<label class="drpe">RPE de la sesión <input value="${esc(day.rpe||'')}" placeholder="${esc(auto||'7')}" data-drpe="${di}" aria-label="RPE de la sesión" style="width:6em"></label>`
      : v ? `<p class="drpe">RPE de la sesión <b>${esc(v)}</b></p>` : ''; })()}
  ${logOpen===di && !ed ? logForm(day, di) : ''}
  ${day.segs.map((sg,gi)=>`<div class="blk t-${sg.type}">
    <div class="bh"><b>${esc(SEGS[sg.type]||sg.type)}</b><i>${esc([sg.sub, fmtLabel(sg.fmt)].filter(Boolean).join(' · '))}</i></div>
    ${ed?fmtEditor(sg.fmt,di,gi):''}
    ${sg.type==='act'&&gi===0&&!ed?`<div class="bn">${isRod(st)?'Antes de empezar: dolor y derrame de hoy frente a ayer. El semáforo decide si hoy se progresa, se mantiene o se baja.':'Antes de empezar: bienestar del día (sueño, estrés, fatiga y dolor muscular). En rojo, baja 1–2 puntos de RPE o recorta series.'}</div>`:''}
    ${sg.rows.length||ed?`<div class="tbl"><table class="pl"><thead><tr><th>Ejercicio</th>${isRod(st)?'<th>Lado</th>':''}<th>Series</th><th>Reps</th><th>Carga</th><th>Nota</th>${ed?'<th></th>':''}</tr></thead><tbody>
    ${sg.rows.map((r,ri)=> ed ? rowEdit(r,di,gi,ri) : rowView(r)).join('')}
    </tbody></table></div>`:'<p class="small" style="margin:6px 0 0">Sin ejercicios.</p>'}
    ${ed?`<div class="addrow"><button class="ghost" data-add="${di}|${gi}">+ Añadir ejercicio</button></div>`:''}
  </div>`).join('')}
  ${ed?`<div class="dfoot">${saveBtn}</div>`:''}
  </section>`;
}
function fmtEditor(f,di,gi){
  f=f||{t:'series'};
  const inp=(k,ph,w)=>`<input type="number" min="1" max="99" value="${esc(f[k]??'')}" placeholder="${ph}" data-fmt="${di}|${gi}|${k}" style="width:${w||'4.5em'}" aria-label="${ph}">`;
  const extra = f.t==='inter' ? `${inp('a','trabajo s')} : ${inp('b','pausa s')} × ${inp('c','rondas')}` : (f.t==='amrap'||f.t==='emom') ? `${inp('a','minutos')} min` : f.t==='rondas' ? `${inp('a','rondas')} rondas · descanso <input value="${esc(f.b||'')}" data-fmt="${di}|${gi}|b" placeholder="90 s" style="width:5em" aria-label="descanso">` : '';
  return `<div class="fmted"><label>Formato <select data-fmt="${di}|${gi}|t" aria-label="Formato del bloque">${Object.entries(FORMATOS).map(([k,v])=>`<option value="${k}"${f.t===k?' selected':''}>${v}</option>`).join('')}</select></label>${extra}</div>`;
}
function mesoCard(s){
  const m=mesoWeek(s), w=num(s.semPlan)||1, blk=Math.floor((w-1)/4)+1;
  return `<section class="card"><h3 class="sec">Semana ${w} · ${esc(m.l)}</h3><p class="small" style="margin:0 0 8px">${esc(m.d)}</p>
    ${timelineHTML(s, w-1, 8)}
    <p class="small" style="margin:8px 0 0">El plan se ajusta solo según la semana y los torneos del calendario. Al terminar la descarga, reevalúa criterios antes de empezar el siguiente bloque. ${editMode?'Estás editando la semana base; la progresión se aplica encima.':''}</p>
    ${refList(['helms','exp'])}</section>`;
}
function fundamentos(ph, s){
  const kneeEv = [...new Set(ph.blocks.flatMap(b=>b.ev))];
  const four = s.dias==='4';
  return `<section class="card"><h3 class="sec">Fundamento del plan</h3>
  <div class="mods">
    <div class="mod"><b>Carga por RPE.</b> RPE 8 = podría hacer 2 repeticiones más; RPE 7 = 3 más. El peso se ajusta cada sesión para caer en el RPE objetivo; la app compara el RPE real registrado con el objetivo y sugiere el ajuste. ${refList(['helms'])}</div>
    <div class="mod"><b>Estructura.</b> Cada día tiene Activación, Neuro y Bloque central. La terapia va en el bloque que corresponde a su complejidad (marcada con T) y la columna Lado dice si el ejercicio es con ambas piernas, la sana o la lesionada. Dentro del bloque central, la rodilla lesionada va primero, sin fatiga previa (criterio clínico).</div>
    <div class="mod"><b>Reparto de la rodilla afectada.</b> ${four ? 'Con 4 días, la sesión completa va en los días 1 y 3, y los días 2 y 4 son ligeros. En tendinopatía el ensayo de carga pesada lenta usó 3 sesiones por semana: si el tendón lo tolera, añade la prensa también el día 2.' : 'Con 3 días, la fuerza va los tres días y lo que no es fuerza (pliometría, estabilidad, técnica) va los días 1 y 3.'} ${refList(kneeEv)}</div>
    <div class="mod"><b>Miembro sano.</b> ${ph.sano==='cx' ? 'Alta intensidad (RPE 8, sin fallo) con un tope de 15 series duras por semana para los extensores de rodilla del sano. El tope es mi criterio, no un dato de ensayo.' : 'Fase tardía: el sano sigue entrenando fuerte como referencia exigente.'} ${refList(ph.sano==='cx'?['minshull','zhang25','zult']:['wellsandt'])}</div>
    <div class="mod"><b>Retorno específico al deporte.</b> Aparece en las fases tardías según el perfil deportivo. Casi todo es experiencia clínica (nivel E); el marco general viene del retorno en campo. ${refList(['buckthorpe19','exp'])}</div>
    <div class="mod"><b>Superior y core.</b> Básicos a RPE 8, accesorios a 8–15 reps; en fase temprana todo sentado o apoyado y sin arrodillarse. ${refList(['helms','exp'])}</div>
    <div class="mod"><b>Ejercicios de tu banco.</b> El generador reemplaza cada ejercicio del protocolo por el equivalente de tu banco cuando hay coincidencia clara y respeta las restricciones de la fase (flexión, impacto, carga del tendón, apoyo de rodillas). Si no hay equivalente, deja el del protocolo.</div>
  </div></section>`;
}
function toolsBlock(ph){
  const out=[];
  if(ph.tools.includes('iso')) out.push(`<div class="mini"><h4>Isometría analgésica</h4><p><b>Dosis:</b> 5 × 45 s a ~70 % de una contracción máxima (RPE 6–7), rodilla a 60°, 2 min de pausa.</p><p><b>Evidencia:</b> analgesia inmediata en el estudio original (n = 6), sin ventaja frente a la carga isotónica en los metaanálisis. Úsala si le funciona al deportista.</p>${refList(['rio','clifford','challoumas'])}</div>`);
  if(ph.tools.includes('bfr')) out.push(`<div class="mini"><h4>BFR</h4><p>Manguito en la parte alta del muslo; con cargas muy ligeras logra ganancias de fuerza parecidas a las de cargas altas, con menos dolor.</p><p><b>Dosis:</b> 30-15-15-15 reps, 30 s de pausa, 60–80 % de la presión de oclusión. Cribado de riesgo trombótico y manguito que mida la presión.</p>${refList(['hughes19','hughes19p','curran','patterson'])}</div>`);
  if(ph.tools.includes('mi')) out.push(`<div class="mini"><h4>Imaginería y observación</h4><p><b>Dosis:</b> 10–15 min, 3–5 × semana en casa.</p><p><b>Evidencia:</b> mecanismo plausible, sin beneficio añadido claro. Coste cero, riesgo cero.</p>${refList(['pastora','paravlic'])}</div>`);
  if(!out.length) return '';
  return `<section class="card"><h3 class="sec">Herramientas complementarias</h3><div class="cols">${out.join('')}</div></section>`;
}
function allRefs(){
  return `<section class="card"><details id="refs"><summary>Referencias y niveles de evidencia</summary>
  <div class="lvleg">${Object.entries(LV).map(([k,v])=>`<span><span class="lv ${k}">${k}</span>${v}</span>`).join('')}</div>
  <ol>${Object.entries(R).filter(([k])=>k!=='exp').map(([k,r])=>`<li><span class="lv ${r.l}">${r.l}</span>${esc(r.c)}</li>`).join('')}</ol></details></section>`;
}

/* ===================== VISTA: PLAN ===================== */
function planView(){
  if(!isRod(st)) return genPlanView();
  const key=pkey(st), P0=P[key], i=phaseIdx(st), ph=P0.phases[i];
  const {days, custom} = viewWeek(st);
  const light = painLight(st);
  const mods=[];
  if(key==='lca-post'){ const g=GRAFT[st.injerto]; mods.push(`<div class="mod"><b>${g.t}.</b> ${esc(g.m)} ${refList(g.ev)}</div>`);
    if(st.suturaAsoc) mods.push(`<div class="mod"><b>Sutura meniscal asociada.</b> Manda la restricción más conservadora: flexión ≤ 90° y sin curl femoral cargado hasta ~6 semanas, bici bipodal cuando haya 110°, y sin carga en flexión > 90° hasta ~12–16 semanas. ${refList(['mohamadi','ojsm25'])}</div>`); }
  if(key==='men-sut') mods.push(`<div class="mod"><b>Carga ${st.cargaSut==='inmediata'?'inmediata según tolerancia':'restringida 4–6 semanas'}.</b> ${st.cargaSut==='inmediata'?'Las revisiones no muestran más fallos con carga acelerada en roturas estables; aun así, limita la flexión en carga.':'Respeta la descarga indicada; trabaja activación en cadena abierta y el miembro sano duro.'} ${refList(['mohamadi','ojsm25'])}</div>`);
  if(key==='tend' && st.tendSub==='quad') mods.push(`<div class="mod"><b>Tendón cuadricipital.</b> Casi toda la evidencia es de tendinopatía rotuliana; aquí se extrapola (nivel C). Suele irritarse en flexión profunda: empieza con rangos medios.</div>`);
  if(key==='men-cons') mods.push(`<div class="mod"><b>Sin resonancia.</b> Tratar por sospecha clínica es razonable porque el manejo inicial es el mismo: ejercicio. ${refList(['skou','kise'])}</div>`);
  if(key==='pfp') mods.push(`<div class="mod"><b>Dolor patelofemoral.</b> La base es ejercicio combinado de cadera y rodilla; en corredores, reentrenar la carrera. ${refList(['willy19','crossley16'])}</div>`);
  if(ph.avoid) mods.push(`<div class="mod"><b>Evitar en esta fase.</b> ${esc(ph.avoid)}</div>`);
  if(ph.note) mods.push(`<div class="mod">${esc(ph.note)}</div>`);
  const sug = suggested(st);
  const time = P0.weeks ? `Semana postop ${num(st.semanas)||0} · por tiempo correspondería ${esc(P0.phases[sug].name.split(' · ')[0].toLowerCase())}` : 'Fase elegida por criterios';
  const nd = days.length;
  const cnt=(d,f)=>d.segs.reduce((a,g)=>a+g.rows.filter(f).length,0);
  const overview = `<div class="tbl"><table class="data"><thead><tr><th>Día</th><th>Activación</th><th>Neuro</th><th>Central</th><th>Lesionada</th><th>Sana</th><th>Terapia</th></tr></thead><tbody>
    ${days.map(d=>{ const g=t=>d.segs.find(x=>x.type===t); return `<tr><td><b>${esc(d.name)}</b></td><td>${g('act')?.rows.length||0}${fmtLabel(g('act')?.fmt)?' · '+esc(fmtLabel(g('act').fmt)):''}</td><td>${g('neuro')?.rows.length||0}${fmtLabel(g('neuro')?.fmt)?' · '+esc(fmtLabel(g('neuro').fmt)):''}</td><td>${g('central')?.rows.length||0}${fmtLabel(g('central')?.fmt)?' · '+esc(fmtLabel(g('central').fmt)):''}</td><td>${cnt(d,r=>r.lado==='Lesionada')}</td><td>${cnt(d,r=>r.lado==='Sana')}</td><td>${cnt(d,r=>r.ter)}</td></tr>`; }).join('')}
    </tbody></table></div><p class="small" style="margin:8px 0 0">Reparto sugerido: ${nd===4?'lunes, martes, jueves y viernes':'lunes, miércoles y viernes'}. Columnas Lesionada, Sana y Terapia = número de ejercicios.</p>`;
  const sv = sanoVolume(days);
  const sanoWarn = ph.sano==='cx' && sv>15 ? `<div class="warnbox"><b>Lado sano: ${sv} series duras de extensores esta semana.</b> El tope que usamos para la educación cruzada es 15. Más volumen suma fatiga sin evidencia de más transferencia.</div>` : '';
  return `
  <section class="card"><div class="status">
    <div class="light ${light.c}"><span class="dot"></span><div><b>${light.t}</b><p>${esc(light.p)}</p>${sessions.length?`<p class="small">Según la última sesión registrada.</p>`:''}</div></div>
    <div><h3 class="sec">${esc(ph.nextLabel)}</h3>${critList(ph.next, st)}${(i>=P0.phases.length-2)?'<p class="small" style="margin:6px 0 0">La batería de saltos (≥ 90 %) también cuenta; se evalúa en la app de pruebas.</p>':''}</div>
    ${ph.extra?`<div><h3 class="sec">${esc(ph.extra.label)}</h3>${critList(ph.extra.list, st)}${refList(ph.extra.ev)}</div>`:''}
  </div>
  ${refList(['silbernagel','breda','grindem','aspetar','exp'])}</section>
  ${mods.length?`<section class="card"><h3 class="sec">Consideraciones de este caso</h3><div class="mods" style="margin:0">${mods.join('')}</div></section>`:''}
  ${mesoCard(st)}
  <section class="card"><h3 class="sec">Semana tipo</h3>${overview}
    <div class="legend" style="margin-top:10px">${[['Activación','var(--c-act)'],['Neuro','var(--c-neuro)'],['Bloque central','var(--c-central)']].map(([l,c])=>`<span><i class="sw" style="background:${c}"></i>${l}</span>`).join('')}<span><span class="ter">T</span> terapia</span></div>
    ${sanoWarn}
  </section>
  ${custom?`<div class="edited"><span><b>Plan modificado por ti</b> para esta fase y ${nd} días.</span><button id="bReset">Restablecer plan base</button></div>`:''}
  ${days.map((d,di)=>dayHTML(d,di)).join('')}
  ${fundamentos(ph, st)}
  ${toolsBlock(ph)}
  ${allRefs()}`;
}

/* ===================== VISTA: SESIONES Y EVOLUCIÓN ===================== */
const PROMS = {
  aclrsi:{l:'ACL-RSI', ref:'webster08'}, ikdc:{l:'IKDC subjetivo', ref:'irrgang01'}, koos:{l:'KOOS deporte', ref:'roos98'},
  visap:{l:'VISA-P', ref:'visentini98'}, akps:{l:'AKPS (Kujala)', ref:'kujala93'}
};
function promsFor(s){ if(!isRod(s)) return []; if(s.cond==='lca') return ['aclrsi','ikdc','koos']; if(s.cond==='men') return ['koos','ikdc']; if(s.cond==='tend') return ['visap']; return ['akps']; }
function weeklyLoad(){
  const by={}; sessions.forEach(x=>{ const w=num(x.semana)||0; if(!by[w]) by[w]={load:0,n:0,pain:[]}; by[w].load+=(num(x.min)||0)*(num(x.srpe)||0); by[w].n++; if(num(x.dolor)!=null) by[w].pain.push(+x.dolor); });
  return Object.keys(by).map(Number).sort((a,b)=>a-b).slice(-8).map(w=>({w, ...by[w]}));
}
function loadChart(){
  const data=weeklyLoad(); if(!data.length) return '<p class="small">Aún no hay sesiones registradas.</p>';
  const max=Math.max(...data.map(d=>d.load),1), W=560, H=170, pad=34, bw=Math.min(48,(W-pad-10)/data.length-10);
  const step=(W-pad-10)/data.length;
  const ticks=[0,0.5,1].map(f=>Math.round(max*f));
  return `<div class="tbl"><svg viewBox="0 0 ${W} ${H+34}" width="100%" style="max-width:${W}px;min-width:360px" role="img" aria-label="Carga interna semanal">
    ${ticks.map(t=>{ const y=H-(t/max)*(H-20); return `<line x1="${pad}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${pad-6}" y="${y+4}" font-size="10" text-anchor="end" fill="var(--muted)">${t}</text>`; }).join('')}
    ${data.map((d,k)=>{ const h=(d.load/max)*(H-20), x=pad+k*step+(step-bw)/2, y=H-h; const avg=d.pain.length?(d.pain.reduce((a,b)=>a+b,0)/d.pain.length):null;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="3" fill="${k===data.length-1?'var(--coral)':'var(--coral-soft)'}" stroke="var(--coral)"/>
      <text x="${x+bw/2}" y="${y-5}" font-size="10" text-anchor="middle" fill="var(--ink)">${Math.round(d.load)}</text>
      <text x="${x+bw/2}" y="${H+14}" font-size="10" text-anchor="middle" fill="var(--muted)">S${d.w}</text>
      <text x="${x+bw/2}" y="${H+28}" font-size="9" text-anchor="middle" fill="var(--muted)">${d.n} ses · dolor ${avg==null?'—':avg.toFixed(1)}</text>`; }).join('')}
  </svg></div>`;
}
function adherence(){
  const w=num(st.semPlan)||1, n=nDias(st);
  const cur=sessions.filter(x=>num(x.semana)===w).length;
  const last4=[w-3,w-2,w-1,w].filter(x=>x>=1); const done=sessions.filter(x=>last4.includes(num(x.semana))).length;
  return {cur, n, pct4: last4.length? Math.round(done/(last4.length*n)*100) : null};
}
function evalForm(){
  const pf=promsFor(st);
  return `<div class="logf"><h4>Nueva evaluación</h4>
    <p class="small" style="margin:0 0 6px">Guarda dolor, derrame, rango y fase actuales del formulario, más los puntajes de los cuestionarios que apliques en su versión validada.</p>
    <div class="row5"><label class="f">Fecha<input type="date" id="ev-fecha" value="${todayISO()}"></label>
    ${pf.map(k=>`<label class="f">${PROMS[k].l} (0–100)<input type="number" min="0" max="100" id="ev-${k}"></label>`).join('')}</div>
    <div class="actions"><button class="primary" id="evSave">Guardar evaluación</button><button id="evCancel">Cancelar</button></div></div>`;
}
function exFmt(e){
  const d = e.s && e.reps ? e.s+'×'+e.reps : e.reps ? '×'+e.reps : e.s ? e.s+' series' : '';
  return esc([e.e, d, e.kg ? e.kg+' kg' : '', e.rpe ? '@'+e.rpe : ''].filter(Boolean).join(' '));
}
function sessionsView(){
  const ad=adherence(), pf=promsFor(st), der=['Cero','Trazas','1+','2+','3+'];
  const ses = sessions.slice().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
  const evs = evals.slice().sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||''));
  return `
  <section class="card"><div class="kpis">
    <div class="kpi"><span>Semana actual</span><b>${ad.cur}/${ad.n}</b><i>sesiones registradas</i></div>
    <div class="kpi"><span>Adherencia 4 semanas</span><b>${ad.pct4==null?'—':ad.pct4+' %'}</b><i>sesiones hechas / planificadas</i></div>
    <div class="kpi"><span>Último dolor</span><b>${ses[0]?.dolor??'—'}${ses[0]?'/10':''}</b><i>${ses[0]?esc(ses[0].fecha):'sin registros'}</i></div>
  </div></section>
  ${monoCard()}
  <section class="card"><h3 class="sec">Carga interna semanal (minutos × RPE de la sesión)</h3>${loadChart()}
    <p class="small">Úsala para ver tendencias y saltos bruscos de carga entre semanas, no como predictor aislado de lesión. No uso la relación aguda:crónica (ACWR) por sus problemas conceptuales.</p>${refList(['foster01','haddad17','impellizzeri20'])}</section>
  ${wellCard()}
  <section class="card"><h3 class="sec">Sesiones registradas</h3>
    ${typeof sesEdit!=='undefined' && sesEdit && sessions.find(x=>x.id===sesEdit) ? logForm(null, null, sessions.find(x=>x.id===sesEdit)) : ''}
    ${ses.length?`<div class="tbl"><table class="data"><thead><tr><th>Fecha</th><th>Semana</th><th>Día</th><th>Min</th><th>RPE</th><th>Carga</th><th>Dolor</th><th>24 h</th><th>Ejercicios</th><th></th></tr></thead><tbody>
    ${ses.map(x=>`<tr><td>${esc(x.fecha)}</td><td>${esc(x.semana)}</td><td>${esc(x.dia)}</td><td>${esc(x.min)}</td><td>${esc(x.srpe)}</td><td>${Math.round((num(x.min)||0)*(num(x.srpe)||0))}</td><td>${esc(x.dolor)}/10</td><td>${esc({mejor:'Mejor',igual:'Basal',peor:'Peor'}[x.d24]||'—')}</td><td class="wrap">${(x.ex||[]).filter(e=>e.e).map(exFmt).join('<br>')||'—'}</td><td style="white-space:nowrap">${curId?`<button class="mini-btn" data-editses="${esc(x.id)}">Editar</button><button class="xbtn" data-delses="${esc(x.id)}" aria-label="Borrar sesión">×</button>`:''}</td></tr>`).join('')}
    </tbody></table></div>`:'<p class="small">Registra sesiones desde cada día del plan con "Registrar sesión".</p>'}
  </section>
  <section class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 class="sec" style="margin:0">Evaluaciones y cuestionarios</h3>${!evalOpen?'<button class="dark" id="bEval">Nueva evaluación</button>':''}</div>
    ${evalOpen?evalForm():''}
    ${evs.length?`<div class="tbl" style="margin-top:10px"><table class="data"><thead><tr><th>Fecha</th><th>Semana</th><th>Fase</th><th>Dolor</th><th>Derrame</th><th>Flexión</th><th>Déf. ext.</th>${pf.map(k=>`<th>${PROMS[k].l}</th>`).join('')}<th></th></tr></thead><tbody>
    ${evs.map((e,k)=>`<tr><td>${esc(e.fecha)}</td><td>${esc(e.semana??'—')}</td><td>${esc(e.fase)}</td><td>${esc(e.dolor)}/10</td><td>${der[e.der]??'—'}</td><td>${e.flex??'—'}°</td><td>${e.ext??'—'}°</td>${pf.map(p=>{ const v=e.prom?.[p], pv=k>0?evs[k-1].prom?.[p]:null; const dlt=(v!=null&&pv!=null)?v-pv:null; return `<td>${v??'—'}${dlt!=null?` <span class="${dlt>=0?'up':'down'}">${dlt>=0?'+':''}${dlt}</span>`:''}</td>`; }).join('')}<td>${curId?`<button class="xbtn" data-delev="${esc(e.id)}" aria-label="Borrar evaluación">×</button>`:''}</td></tr>`).join('')}
    </tbody></table></div>`:'<p class="small" style="margin-top:8px">Aún no hay evaluaciones.</p>'}
    <p class="small">La app guarda los puntajes; aplica cada cuestionario en su versión validada en español y usa sus propios puntos de corte.</p>
    ${refList(pf.map(k=>PROMS[k].ref))}
  </section>`;
}

/* ===================== VISTA: PANEL ===================== */
function panelView(){
  const rows = patients.slice().sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
  const by={}; rows.forEach(p=>{ const k=P[pkey(Object.assign(blank(),p.st||{}))]?.label||'—'; by[k]=(by[k]||0)+1; });
  return `<section class="card"><div class="kpis">
    <div class="kpi"><span>Pacientes</span><b>${rows.length}</b><i>guardados</i></div>
    <div class="kpi"><span>Con sesión en los últimos 7 días</span><b>${rows.filter(p=>p.sum?.last && p.sum.last>=daysAgo(7)).length}</b><i>activos</i></div>
    <div class="kpi"><span>Solicitudes pendientes</span><b>${Object.values(pendingBy).reduce((a,b)=>a+b,0)}</b><i>por responder</i></div>
    <div class="kpi"><span>Bienestar en rojo</span><b>${rows.filter(p=>{ const wl=wellLight(wellBy[p.id]||[]); return wl && wl.c==='r' && wl.e.fecha>=daysAgo(1); }).length}</b><i>hoy o ayer</i></div>
    <div class="kpi"><span>Sin consentimiento</span><b>${rows.filter(p=>!p.st?.consent && !consentBy[p.id]).length}</b><i>pendientes</i></div>
  </div>
  ${Object.keys(by).length?`<div class="legend" style="margin-top:10px">${Object.entries(by).map(([k,v])=>`<span>${esc(k)}: <b>${v}</b></span>`).join('')}</div>`:''}</section>
  <section class="card"><h3 class="sec">Pacientes</h3>
  ${rows.length?`<div class="tbl"><table class="data"><thead><tr><th>Paciente</th><th>Condición</th><th>Fase</th><th>Semana</th><th>Adherencia semana</th><th>Último dolor</th><th>Bienestar</th><th>Próximo torneo</th><th>Última sesión</th><th>Consentimiento</th></tr></thead><tbody>
  ${rows.map(p=>{ const s=Object.assign(blank(),p.st||{}); const k=pkey(s); const P0=P[k]; const ph=P0.phases[phaseIdx(s)]; const sm=p.sum||{};
    return `<tr class="click st-${typeof dayState==='function'?dayState(p).k:'n'}" data-open="${esc(p.id)}"><td><b>${esc(p.nombre)}</b></td><td>${esc(subLabel(s,P0))}</td><td>${esc(ph.name.split(' · ')[0])}</td><td>${esc(s.semPlan)}</td><td>${sm.adh??'—'}</td><td>${sm.dolor!=null?esc(sm.dolor)+'/10':'—'}</td><td>${(()=>{ const wl=wellLight(wellBy[p.id]||[]); return wl?`<span class="wl ${wl.c}"></span>${wl.sum}/28 · ${esc(wl.e.fecha.slice(5))}`:'—'; })()}</td><td>${(()=>{ const t=tourns(s).find(t=>t.f>=todayISO()); return t?`<span class="prio ${esc(t.p)}">${esc(t.p)}</span> ${esc(fmtD(t.f))}`:'—'; })()}</td><td>${esc(sm.last||'—')}</td><td>${consentBy[p.id]?'<span class="pill g">Firmado</span>':s.consent?'<span class="pill g">En papel</span>':'<span class="pill r">No</span>'}</td></tr>`; }).join('')}
  </tbody></table></div>`:'<p class="small">Cuando guardes pacientes aparecerán aquí con su fase, adherencia y último dolor.</p>'}
  </section>`;
}

/* ===================== RENDER PRINCIPAL ===================== */
function render(){
  const key=pkey(st), P0=P[key], i=phaseIdx(st), ph=P0.phases[i], m=mesoWeek(st);
  const nd = nDias(st);
  const head = `${isExample?'<div class="example">Estás viendo un caso de ejemplo con sesiones de muestra. Crea un paciente nuevo o elige uno guardado; nada se guarda hasta que pulses Guardar.</div>':''}
  <div class="phead"><div class="acc"></div><div>
    <div class="in">
      <div style="min-width:0;flex:1 1 300px">
        <div class="trainer">Fisioterapeuta Manuel Celis</div>
        <div class="client">${esc(st.nombre||'Sin nombre')}</div>
        <div class="meta">${esc(subLabel(st,P0))}${isRod(st)?` · rodilla ${st.lado==='der'?'derecha':'izquierda'}`:` · ${esc((NIVELES[st.nivel]||NIVELES.int).l.split(' · ')[0].toLowerCase())}`}${st.deporte?' · '+esc(st.deporte):''} · ${nd} días por semana</div>
        ${(!st.consent && !consentBy[curId] && !isExample)?'<div class="warnchip">Falta registrar el consentimiento informado para tratar datos de salud</div>':''}
      </div>
      <div class="badges"><span class="badge">Semana ${esc(num(st.semPlan)||1)}</span><span class="badge dk">${esc(ph.name.split(' · ')[0])}</span><span class="badge lt">${esc(m.l)}</span></div>
    </div>
    <div class="in" style="padding-top:0;display:block">
      <div class="phase"><h2>${esc(ph.name.split(' · ').slice(1).join(' · ')||ph.name)}</h2><p>${esc(ph.goal)}</p><p class="small" style="margin-top:4px">${esc(ph.when)}</p></div>
      <div class="actions">
        <button id="bSave">Guardar</button>
        <button class="primary" id="bPub">Publicar al deportista</button>
      </div>
    </div>
  </div></div>
  <nav class="tabs" role="tablist">
    <button role="tab" data-view="plan" aria-selected="${view==='plan'}">Plan semanal</button>
    <button role="tab" data-view="ses" aria-selected="${view==='ses'}">Sesiones y evolución</button>
    <button role="tab" data-view="req" aria-selected="${view==='req'}">Solicitudes${(pendingBy[curId]||0)?` (${pendingBy[curId]})`:''}</button>
    <button role="tab" data-view="cal" aria-selected="${view==='cal'}">Calendario</button>
    <button role="tab" data-view="eval" aria-selected="${view==='eval'}">Evaluación</button>
    <button role="tab" data-view="hist" aria-selected="${view==='hist'}">Historia clínica</button>
    <button role="tab" data-view="panel" aria-selected="${view==='panel'}">Panel de pacientes</button>
    <button role="tab" data-view="banco" aria-selected="${view==='banco'}">Banco</button>
  </nav>`;
  const body = view==='plan' ? planView() : view==='eval' && typeof evalView==='function' ? evalView() : view==='ses' ? sessionsView() : view==='req' ? requestsView() : view==='hist' ? histView() : view==='cal' ? calendarView() : view==='banco' ? bancoView() : panelView();
  // Descargas y plantillas: al final de la ficha
  const tail = `${view==='plan' && tplOpen ? tplCard() : ''}<section class="card dlbar"><h3 class="sec">Descargar y plantillas</h3><div class="actions">
    <button id="bPdf">Descargar PDF</button><button id="bXls">Descargar Excel</button>${view==='plan'?'<button id="bTpl">Plantillas</button>':''}</div></section>`;
  $('#out').innerHTML = head + body + tail + `<footer class="foot">Herramienta de apoyo a la decisión clínica; no reemplaza el juicio del fisioterapeuta. ${esc(VERSION)}.</footer>`;
  $('#pidRow').innerHTML = curId ? `ID del paciente: <code>${esc(curId)}</code> <button class="mini-btn" id="bCopyId">Copiar</button>` : 'ID del paciente: se asigna al guardar';
  const cb=$('#bCopyId'); if(cb) cb.onclick=()=>{ try{ navigator.clipboard.writeText(curId).then(()=>toast('ID copiado'),()=>toast(curId)); }catch(e){ toast(curId); } };
}
/* ===================== INTERACCIÓN ===================== */
function ensureCustom(){ const k=planKey(st); if(!st.plans) st.plans={}; if(!st.plans[k]) st.plans[k]=clone(genWeek(st)); return st.plans[k]; }
$('#out').addEventListener('input', e=>{
  const t=e.target;
  if(t.dataset.f && t.dataset.f!=='lado' && t.dataset.f!=='ter'){ const days=ensureCustom(), row=days[+t.dataset.d].segs[+t.dataset.g].rows[+t.dataset.r];
    if(t.dataset.f==='c'){ const k=(String(row.c||'').match(RPE_IN)||[''])[0]; row.c=[t.value.trim(),k].filter(Boolean).join(' · '); } else row[t.dataset.f]=t.value; markDirty(); }
  if(t.dataset.drpe!==undefined){ const days=ensureCustom(); const v=t.value.trim(); if(v) days[+t.dataset.drpe].rpe=v; else delete days[+t.dataset.drpe].rpe; markDirty(); }
  if(t.classList.contains('grow')) growTA(t);
  if(t.dataset.fmt && t.tagName==='INPUT'){ const [d,g,k]=t.dataset.fmt.split('|'); const days=ensureCustom(); const sg=days[+d].segs[+g]; sg.fmt=Object.assign({t:'series'},sg.fmt); sg.fmt[k]= k==='b'&&sg.fmt.t==='rondas' ? t.value : (num(t.value)??''); markDirty(); }
});
$('#out').addEventListener('change', e=>{
  const t=e.target;
  if(t.dataset.chk){ if(!st.chk) st.chk={}; st.chk[t.dataset.chk]=t.checked; markDirty(); }
  if(t.dataset.vid!==undefined){ const n=t.dataset.vid; myMeta[n]=Object.assign({}, myMeta[n], {video:t.value.trim()}); saveLib(); }
  if(t.dataset.f==='lado' || t.dataset.f==='ter'){ const days=ensureCustom(); days[+t.dataset.d].segs[+t.dataset.g].rows[+t.dataset.r][t.dataset.f]= t.dataset.f==='ter' ? t.checked : t.value; markDirty(); render(); return; }
  if(t.dataset.fmt && t.tagName==='SELECT'){ const [d,g]=t.dataset.fmt.split('|'); const days=ensureCustom(); const sg=days[+d].segs[+g]; sg.fmt={t:t.value, ...({inter:{a:40,b:20,c:3},amrap:{a:12},emom:{a:10},rondas:{a:3,b:'90 s'}}[t.value]||{})}; markDirty(); render(); return; }
  if(t.dataset.fmt){ render(); return; }
  if(t.dataset.f==='e'){ const v=t.value.trim(); if(v && !BASE.has(v) && !myLib.includes(v)){ myLib.push(v); buildBanco(); renderLib(); saveLib(); } if(!editMode) render(); }
  else if(t.dataset.f && !editMode && !document.querySelector('.edited')) render();   // en edición no se repinta: se perdía lo que escribías en el siguiente campo
});
$('#out').addEventListener('click', async e=>{
  const q=s=>e.target.closest(s);
  let b;
  if(q('#bSave')) return save(false);
  if(q('#bPdf')) return pdf();
  if(q('#bXls')) return excel();
  if((b=q('[data-dedit]'))){ const d=+b.dataset.dedit; if(editMode) await save(true); editMode=true; editDay=d; subOpen=null; logOpen=null; if(typeof FX!=='undefined') FX.dayOpen.add(d); render();
    document.querySelector(`section.day[data-day="${d}"]`)?.scrollIntoView({block:'start'}); return; }
  if((b=q('[data-dsave]'))){ const d=+b.dataset.dsave; editMode=false; editDay=null; if(!st.rev) st.rev={}; st.rev[planKey(st)]=true; markDirty(); render();
    document.querySelector(`section.day[data-day="${d}"]`)?.scrollIntoView({block:'nearest'}); return save(false); }
  if(q('#bReset')){ delete st.plans[planKey(st)]; render(); return markDirty(); }
  if((b=q('[data-view]'))){ view=b.dataset.view; editMode=false; editDay=null; logOpen=null; return render(); }
  if((b=q('[data-del]'))){ const [d,g,r]=b.dataset.del.split('|').map(Number); ensureCustom()[d].segs[g].rows.splice(r,1); subOpen=null; render(); return markDirty(); }
  if((b=q('[data-add]'))){ const [d,g]=b.dataset.add.split('|').map(Number); const days=ensureCustom(); days[d].segs[g].rows.push({e:'',lado:days[d].segs[g].type==='central'?'Ambas':'',s:'3',r:'',c:'RPE 8',n:'',ter:false}); render(); markDirty();
    const inp=document.querySelector(`[data-d="${d}"][data-g="${g}"][data-r="${days[d].segs[g].rows.length-1}"][data-f="e"]`); if(inp) inp.focus(); return; }
  if((b=q('[data-sub]'))){ subOpen = subOpen===b.dataset.sub ? null : b.dataset.sub; return render(); }
  if((b=q('[data-pick]'))){ const p=b.dataset.pick.split('|'); const [d,g,r]=p.slice(0,3).map(Number); const name=p.slice(3).join('|'); const row=ensureCustom()[d].segs[g].rows[r]; row.e=name; subOpen=null; render(); return markDirty(); }
  if((b=q('[data-log]'))){ const d=+b.dataset.log; logOpen = logOpen===d ? null : d; return render(); }
  if(q('#lfCancel')){ logOpen=null; return render(); }
  if((b=q('#lfSave'))) return saveSession(+b.dataset.day);
  if(q('#bEval')){ evalOpen=true; return render(); }
  if(q('#evCancel')){ evalOpen=false; return render(); }
  if(q('#evSave')) return saveEval();
  if((b=q('[data-delses]'))) return delSub('sesiones', b.dataset.delses);
  if((b=q('[data-delev]'))) return delSub('evaluaciones', b.dataset.delev);
  if((b=q('[data-open]'))) return openPatient(b.dataset.open, 'plan');
});

/* ===================== FORMULARIO ===================== */
function syncVisibility(){
  const k=pkey(st), mo=modOf(st);
  document.querySelectorAll('[data-modshow]').forEach(el=>{ el.hidden = !el.dataset.modshow.split(' ').includes(mo); if(el.tagName==='OPTION') el.disabled = el.hidden; });
  document.querySelectorAll('.modsel [data-mod]').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.mod===mo)));
  if(!['2','3','4'].includes(String(st.dias)) || (mo==='rodilla' && String(st.dias)==='2')) st.dias='3';
  $('#dias').value=String(st.dias);
  document.querySelectorAll('[data-show]').forEach(el=>{
    const v=el.dataset.show;
    el.hidden = !( (v==='tend'&&st.cond==='tend') || (v==='men'&&st.cond==='men') || (v==='lca'&&st.cond==='lca') || (v==='sut'&&k==='men-sut') || (v==='lcapost'&&k==='lca-post') || (v==='menpost'&&(k==='men-mx'||k==='men-sut')) );
  });
  const ph=P[k].phases, sel=$('#fase');
  sel.innerHTML = (P[k].weeks?`<option value="auto">Automática por semanas (${esc(ph[suggested(st)].name.split(' · ')[0])})</option>`:P[k].auto?`<option value="auto">Automática por calendario (${esc(ph[suggested(st)].name.split(' · ')[0])})</option>`:'') + ph.map((p,i)=>`<option value="${i}">${esc(p.name)}</option>`).join('');
  if(!P[k].weeks && !P[k].auto && st.fase==='auto') st.fase='0';
  sel.value = st.fase; if(sel.value!==String(st.fase)){ st.fase = (P[k].weeks||P[k].auto)?'auto':'0'; sel.value=st.fase; }
}
function fillForm(){
  document.querySelectorAll('[data-k]').forEach(el=>{
    const v=getP(st, el.dataset.k);
    if(el.type==='checkbox') el.checked=!!v; else if(el.id!=='fase') el.value = v==null?'':v;
  });
  $('#dolorOut').textContent = st.dolor+'/10';
  syncVisibility();
}
let tmr;
$('#form').addEventListener('input', e=>{
  const el=e.target, k=el.dataset.k; if(!k) return;
  let v = el.type==='checkbox'? el.checked : el.value;
  if(['dolor','derrame'].includes(k)) v=+v;
  setP(st,k,v);
  if(k==='semanas'){ document.querySelectorAll('[data-k="semanas"]').forEach(x=>{ if(x!==el) x.value=v; }); }
  if(k==='dolor') $('#dolorOut').textContent=v+'/10';
  if(['semPlan','deporteP','poblacion','nivel','dias'].includes(k)) syncVisibility();
  if(['cond','tendSub','menSub','lcaSub','semanas'].includes(k)){ if(k!=='semanas'&&k!=='tendSub') st.fase = P[pkey(st)].weeks?'auto':'0'; syncVisibility(); }
  clearTimeout(tmr); tmr=setTimeout(render, 120); markDirty();
});
$('#form').addEventListener('change', e=>{ if(e.target.dataset.k==='fase'){ st.fase=e.target.value; render(); markDirty(); } });
