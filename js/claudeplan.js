/* ===================== PLANIFICAR CON CLAUDE (oct 2026) =====================
   Sin costo ni conexión técnica: el fisio copia unas instrucciones con el caso (sin nombre ni correo) y la semana
   actual, las pega en su Claude junto con lo que quiera (p. ej. el PDF del plan anterior), y pega aquí la respuesta.
   La app la lee, muestra una vista previa y, si el fisio la acepta, la deja como la semana de esa persona. */
let cpOpen = false, cpPrev = null, cpErr = '';
const CP_SEG = {act: 'Activación', neuro: 'Neuro', central: 'Bloque central'};
function cpContexto(){
  const P0 = P[pkey(st)], ph = P0.phases[phaseIdx(st)], m = mesoWeek(st), pf = st.pf || {};
  const semana = viewWeek(st).days.map(d => ({nombre: d.name, rpe: d.rpe || rpeSes(d) || '', bloques: d.segs.map(sg => ({tipo: sg.type, formato: sg.fmt?.t || 'series', ejercicios: sg.rows.map(r => ({nombre: r.e, series: r.s || '', reps: r.r || '', nota: r.n || ''}))}))}));
  return `Eres mi asistente para planificar ejercicio. Soy fisioterapeuta y uso la app Ápex.

CASO (sin datos de identificación)
- Módulo: ${subLabel(st, P0)}${pf.edad ? ` · ${pf.edad} años` : ''}${pf.sexo ? ` · ${pf.sexo === 'm' ? 'mujer' : 'hombre'}` : ''}
- Fase: ${ph.name} (${ph.goal})
- Semana ${num(st.semPlan) || 1} del plan: ${m.l} (${m.d})
- Días por semana: ${nDias(st)} · Nivel: ${({ini: 'principiante', int: 'intermedio', av: 'avanzado'})[st.nivel] || 'intermedio'}
${st.notas ? `- Notas: ${st.notas}\n` : ''}
SEMANA ACTUAL EN LA APP (JSON)
${JSON.stringify({dias: semana})}

LO QUE NECESITO
Arma la próxima semana de esta persona como una progresión. Si te adjunto un plan anterior (PDF o texto), úsalo como base y progrésalo con criterio: carga, volumen y complejidad, sin saltos bruscos. No pongas pierna pesada ni saltos en días seguidos. Explícame primero en 3 o 4 líneas qué cambiaste y por qué, y al final dame el plan SOLO en este formato JSON, dentro de un bloque de código:

{"dias":[{"nombre":"Día 1 · Tren inferior","rpe":"7–8","bloques":[
  {"tipo":"act","formato":"series","ejercicios":[{"nombre":"…","series":"2","reps":"10","nota":""}]},
  {"tipo":"neuro","formato":"series","ejercicios":[…]},
  {"tipo":"central","formato":"series","ejercicios":[…]}
]}]}

Reglas del formato: "tipo" es act (activación), neuro (potencia y coordinación) o central (fuerza). "formato" es series, o intervalos con "trabajo", "descanso" y "rondas" en segundos. "rpe" es uno por día. Las reps pueden ser texto (8–10, 30 s, 5 por lado).`;
}
function cpLeer(txt){
  const t = String(txt || ''), i = t.indexOf('{'), j = t.lastIndexOf('}');
  if(i < 0 || j <= i) throw new Error('No encontré el plan en formato JSON. Copia toda la respuesta de Claude.');
  let o; try{ o = JSON.parse(t.slice(i, j + 1)); }catch(e){ throw new Error('El JSON está incompleto o tiene un error. Pídele a Claude que lo repita completo.'); }
  const dias = Array.isArray(o) ? o : o.dias;
  if(!Array.isArray(dias) || !dias.length) throw new Error('No hay días en el plan.');
  return dias.slice(0, 7).map((d, k) => {
    const segs = SEG_ORDER.map(tipo => {
      const bs = (d.bloques || []).filter(b => (b.tipo || '').toLowerCase().startsWith(tipo.slice(0, 3)));
      const rows = bs.flatMap(b => (b.ejercicios || []).filter(x => x && x.nombre).map(x => ({e: String(x.nombre).slice(0, 120), s: String(x.series ?? '').slice(0, 20), r: String(x.reps ?? '').slice(0, 40), c: '', n: String(x.nota || '').slice(0, 300), lado: '', ter: false})));
      const b0 = bs[0] || {}, inter = /interv/i.test(b0.formato || '');
      return {type: tipo, sub: '', fmt: inter ? {t: 'inter', a: +b0.trabajo || 40, b: +b0.descanso || 20, c: +b0.rondas || 3} : {t: 'series'}, rows};
    });
    const day = {name: String(d.nombre || `Día ${k + 1}`).slice(0, 60), segs};
    if(d.rpe) day.rpe = String(d.rpe).replace(/^RPE\s*/i, '').slice(0, 10);
    return day;
  });
}
function cpCard(){
  const prev = cpPrev ? `<div class="cp-prev"><b>Vista previa · ${cpPrev.length} ${cpPrev.length === 1 ? 'día' : 'días'}</b>${cpPrev.map(d => `<div class="cp-d"><b>${esc(d.name)}${d.rpe ? ` · RPE ${esc(d.rpe)}` : ''}</b>${d.segs.filter(sg => sg.rows.length).map(sg => `<p><i>${CP_SEG[sg.type]}${sg.fmt.t === 'inter' ? ` (${sg.fmt.a}:${sg.fmt.b} × ${sg.fmt.c})` : ''}:</i> ${sg.rows.map(r => esc(`${r.e}${r.s || r.r ? ` ${r.s}${r.s && r.r ? '×' : ''}${r.r}` : ''}`)).join(' · ')}</p>`).join('')}</div>`).join('')}
    <div class="actions"><button type="button" class="primary" data-cp="usar">Usar este plan</button><button type="button" data-cp="otra">Pegar otra respuesta</button></div>
    <p class="small">Reemplaza la semana actual de esta persona. Después la puedes editar día por día y publicarla.</p></div>` : '';
  return `<section class="card cp-card"><div class="rowhead"><h3 class="sec" style="margin:0">Planificar con Claude</h3><button type="button" data-cp="cerrar">Cerrar</button></div>
    <ol class="cp-pasos">
      <li><b>Copia las instrucciones.</b> Llevan el caso (sin nombre ni correo), la fase y la semana actual.<div class="actions"><button type="button" class="primary" data-cp="copiar">Copiar instrucciones</button></div></li>
      <li><b>Pégalas en Claude</b> y adjunta lo que tengas: el PDF del plan anterior, notas o fotos. Claude te explica los cambios y te da el plan en un bloque de código.</li>
      <li><b>Pega aquí la respuesta completa</b> (o solo el bloque de código).<textarea id="cpTxt" rows="5" placeholder="Pega aquí la respuesta de Claude"></textarea>
        <div class="actions"><button type="button" data-cp="leer">Ver vista previa</button></div>${cpErr ? `<p class="cp-err">${esc(cpErr)}</p>` : ''}</li>
    </ol>${prev}</section>`;
}
const _renderCp = render;
render = function(){
  const r = _renderCp.apply(this, arguments);
  if(view === 'plan' && !isExample && curId){
    const ph = document.querySelector('#out .fx-phase .actions');
    if(ph && !ph.querySelector('[data-cp="abrir"]')) ph.insertAdjacentHTML('afterbegin', '<button type="button" data-cp="abrir">Planificar con Claude</button>');
    if(cpOpen && !document.querySelector('#out .cp-card')){ const card = document.querySelector('#out .fx-phase'); card ? card.insertAdjacentHTML('afterend', cpCard()) : $('#out').insertAdjacentHTML('afterbegin', cpCard()); }
  }
  return r;
};
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-cp]'); if(!b) return;
  const k = b.dataset.cp;
  if(k === 'abrir'){ cpOpen = true; cpPrev = null; cpErr = ''; render(); document.querySelector('#out .cp-card')?.scrollIntoView({block: 'start', behavior: 'smooth'}); return; }
  if(k === 'cerrar'){ cpOpen = false; cpPrev = null; cpErr = ''; render(); return; }
  if(k === 'copiar'){
    const t = cpContexto();
    try{ await navigator.clipboard.writeText(t); toast('Instrucciones copiadas. Pégalas en Claude.'); }
    catch(x){ const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); toast('Instrucciones copiadas. Pégalas en Claude.'); }catch(y){ toast('No se pudo copiar.'); } ta.remove(); }
    return;
  }
  if(k === 'leer'){
    const v = $('#cpTxt')?.value || '';
    try{ cpPrev = cpLeer(v); cpErr = ''; }catch(x){ cpPrev = null; cpErr = x.message; }
    render(); const ta = $('#cpTxt'); if(ta) ta.value = v; return;
  }
  if(k === 'otra'){ cpPrev = null; render(); setTimeout(() => $('#cpTxt')?.focus(), 30); return; }
  if(k === 'usar' && cpPrev){
    st.dias = String(Math.max(1, Math.min(6, cpPrev.length)));
    if(!st.plans) st.plans = {};
    st.plans[planKey(st)] = clone(cpPrev);
    if(!st.rev) st.rev = {}; st.rev[planKey(st)] = true;
    const BASEN = typeof BASE !== 'undefined' ? BASE : new Set();
    cpPrev.flatMap(d => d.segs.flatMap(sg => sg.rows.map(r => r.e))).forEach(n => { if(n && !BASEN.has(n) && typeof myLib !== 'undefined' && !myLib.includes(n)) myLib.push(n); });
    cpOpen = false; cpPrev = null; fillForm(); markDirty(); render(); toast('Plan cargado. Revísalo y publícalo cuando esté listo.');
  }
});
