/* ===================== ADHERENCIA (oct 2026) =====================
   1) ¿Cuándo y dónde vas a entrenar? (intenciones de implementación; Gollwitzer y Sheeran, 2006):
      la persona elige días, hora y lugar; el recordatorio llega 30 min antes (función push, tipo "agenda").
   3) ¿Por qué no entrenaste? Si pasó un día agendado sin sesión, un toque: sin tiempo, dolor, cansancio, se me olvidó.
   4) Adherencia baja (< 60 % en las últimas 2 semanas) y motivos en "Requiere atención" del fisio.
   5) Resumen semanal al fisio los lunes (función push, tipo "semanal"). */
const AG_D = ['L', 'M', 'X', 'J', 'V', 'S', 'D'], AG_DL = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const OM_M = {tiempo: 'Sin tiempo', dolor: 'Dolor', cansancio: 'Cansancio', olvido: 'Se me olvidó', otro: 'Otra cosa'};
const agHora = h => { h = +h; const hh = h % 12 || 12; return `${hh}:00 ${h < 12 ? 'a. m.' : 'p. m.'}`; };
const agDiaSem = iso => (new Date(iso + 'T12:00:00').getDay() + 6) % 7;
const agAdd = (iso, k) => { const x = new Date(iso + 'T12:00:00'); x.setDate(x.getDate() + k); return x.toISOString().slice(0, 10); };
const agTxt = a => a && a.dias?.length ? `${a.dias.slice().sort().map(d => AG_D[d]).join(', ')} · ${agHora(a.hora)}${a.lugar ? ' · ' + a.lugar : ''}` : '';

/* ---------- Deportista ---------- */
let omis = [], agEdit = null;
const _startAthleteAd2 = startAthlete;
startAthlete = async function(p){
  await _startAthleteAd2.apply(this, arguments);
  try{ const {data} = await sb.from('omisiones').select('fecha,motivo').eq('paciente_id', p.id).gte('fecha', agAdd(todayISO(), -21)); omis = data || []; }catch(e){ omis = []; }
  renderAthlete();
};
function agCard(){
  const c = A.plan?.contenido; if(!c) return '';
  const a = A.p?.agenda, n = (c.dias || []).length || 3;
  if(agEdit){
    const sug = n === 2 ? [0, 3] : n === 4 ? [0, 1, 3, 4] : [0, 2, 4];
    const sel = agEdit.dias || sug;
    return `<section class="po-w ag-card ag-form"><span class="po-l">Tu semana de entrenamiento</span>
      <p class="ag-q">¿Qué días entrenas? Tu plan tiene ${n} sesiones.</p>
      <div class="ag-days" role="group" aria-label="Días">${AG_D.map((d, i) => `<button type="button" data-agd="${i}" aria-pressed="${sel.includes(i)}" aria-label="${AG_DL[i]}">${d}</button>`).join('')}</div>
      <label class="f">¿A qué hora?<select id="agHora">${Array.from({length: 18}, (_, k) => k + 5).map(h => `<option value="${h}"${(agEdit.hora ?? 18) === h ? ' selected' : ''}>${agHora(h)}</option>`).join('')}</select></label>
      <label class="f">¿Dónde?<input type="text" id="agLugar" maxlength="60" placeholder="Ej.: Brainbox, la casa, el gimnasio" value="${esc(agEdit.lugar || '')}"></label>
      <p class="po-note">Te recordamos 30 minutos antes. Decidir de antemano cuándo y dónde ayuda a cumplir.</p>
      <div class="po-acts"><button type="button" class="po-cta" data-ag="save">Guardar</button><button type="button" class="po-plain" data-ag="cancel">${a ? 'Cancelar' : 'Ahora no'}</button></div></section>`;
  }
  if(!a){
    if(LS.get('apex_ag_skip_' + A.p.id) === todayISO()) return '';
    return `<button type="button" class="po-w po-meta po-empty ag-card" data-ag="edit"><span class="po-mi"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg></span><span class="po-ht"><b>¿Cuándo y dónde vas a entrenar?</b><span>Elige tus días y la hora; te recordamos a tiempo.</span></span>${PO_I.chev}</button>`;
  }
  return `<button type="button" class="po-w po-meta ag-card" data-ag="edit" aria-label="Tus días de entrenamiento: ${esc(agTxt(a))}. Toca para cambiar"><span class="po-ht"><span class="po-l">Entrenas</span><b>${esc(agTxt(a))}</b></span>${PO_I.chev}</button>`;
}
/* Día agendado sin sesión ni respuesta (de los últimos 3 días, el más reciente) */
function omPend(){
  const a = A.p?.agenda; if(!a || !a.dias?.length || !A.plan) return null;
  const pub = (A.plan.publicado_at || '').slice(0, 10), agAt = (a.at || '').slice(0, 10);
  for(let k = 1; k <= 3; k++){
    const d = agAdd(todayISO(), -k);
    if(d < pub || (agAt && d < agAt)) break;
    if(!a.dias.includes(agDiaSem(d))) continue;
    if(sessions.some(s => s.fecha === d) || omis.some(o => o.fecha === d)) return null;   // solo el día agendado más reciente
    return d;
  }
  return null;
}
function omCard(){
  const d = omPend(); if(!d) return '';
  const cuando = d === agAdd(todayISO(), -1) ? 'Ayer' : `El ${AG_DL[agDiaSem(d)]}`;
  return `<section class="po-w om-card"><span class="po-l">${cuando} tocaba entrenar</span><b class="om-t">No vemos tu sesión. ¿Qué pasó?</b>
    <div class="om-chips">${Object.entries(OM_M).map(([k, l]) => `<button type="button" data-om="${k}|${d}">${l}</button>`).join('')}</div>
    <button type="button" class="po-plain" data-om="entrene|${d}">Sí entrené: registrarla</button>
    <p class="po-note">Tu fisioterapeuta lo ve y ajusta tu plan si hace falta.</p></section>`;
}
const _renderAthleteAd2 = renderAthlete;
renderAthlete = function(){
  _renderAthleteAd2.apply(this, arguments);
  if(A.tab !== 'inicio') return;
  const hero = document.querySelector('#athleteApp .po-hero'); if(!hero || document.querySelector('#athleteApp .ag-card')) return;
  hero.insertAdjacentHTML('afterend', omCard() + agCard());
};
$('#athleteApp').addEventListener('click', async e => {
  const g = e.target.closest('[data-agd]');
  if(g){ const i = +g.dataset.agd, s = new Set(agEdit.dias || []); if(!agEdit.dias){ const n = (A.plan?.contenido?.dias || []).length || 3; (n === 2 ? [0, 3] : n === 4 ? [0, 1, 3, 4] : [0, 2, 4]).forEach(x => s.add(x)); }
    s.has(i) ? s.delete(i) : s.add(i); agEdit.dias = [...s].sort(); agEdit.hora = +($('#agHora')?.value || agEdit.hora || 18); agEdit.lugar = $('#agLugar')?.value ?? agEdit.lugar; return renderAthlete(); }
  const b = e.target.closest('[data-ag]');
  if(b){
    const k = b.dataset.ag;
    if(k === 'edit'){ agEdit = Object.assign({}, A.p.agenda || {}); return renderAthlete(); }
    if(k === 'cancel'){ if(!A.p.agenda) LS.set('apex_ag_skip_' + A.p.id, todayISO()); agEdit = null; return renderAthlete(); }
    if(k === 'save'){
      const n = (A.plan?.contenido?.dias || []).length || 3;
      const dias = agEdit.dias || (n === 2 ? [0, 3] : n === 4 ? [0, 1, 3, 4] : [0, 2, 4]);
      if(!dias.length){ toast('Elige al menos un día.'); return; }
      b.disabled = true;
      const {data, error} = await sb.rpc('set_agenda', {pid: A.p.id, p_agenda: {dias, hora: +$('#agHora').value, lugar: ($('#agLugar').value || '').trim()}});
      b.disabled = false;
      if(error){ toast('No se pudo guardar. Revisa tu conexión.'); return; }
      A.p.agenda = data; agEdit = null; cacheAthlete(); renderAthlete();
      toast(dias.length < n ? `Guardado. Ojo: tu plan tiene ${n} sesiones y elegiste ${dias.length} días.` : 'Guardado. Te recordamos 30 minutos antes.');
      return;
    }
  }
  const o = e.target.closest('[data-om]');
  if(o){
    const [motivo, fecha] = o.dataset.om.split('|');
    o.closest('.om-card')?.querySelectorAll('button').forEach(x => x.disabled = true);
    const {error} = await sb.from('omisiones').upsert({paciente_id: A.p.id, fecha, motivo}, {onConflict: 'paciente_id,fecha'});
    if(error){ toast('No se pudo guardar. Revisa tu conexión.'); renderAthlete(); return; }
    omis.push({fecha, motivo});
    if(motivo === 'entrene'){ const c = A.plan?.contenido || {}; A.tab = 'hoy'; A.day = hTodayIdx(c); A.open = A.day; renderAthlete(); setTimeout(() => { const f = $('#lf-fecha'); if(f) f.value = fecha; }, 80); toast('Regístrala con la fecha de ese día.'); return; }
    renderAthlete(); toast(motivo === 'dolor' ? 'Gracias. Le avisamos a tu fisioterapeuta.' : motivo === 'olvido' ? 'Gracias. Revisa la hora de tu recordatorio en Inicio.' : 'Gracias por contarnos.');
  }
});
document.addEventListener('change', e => { if(agEdit && e.target.id === 'agHora') agEdit.hora = +e.target.value; });
document.addEventListener('input', e => { if(agEdit && e.target.id === 'agLugar') agEdit.lugar = e.target.value; });

/* ---------- Fisio: adherencia baja y motivos ---------- */
let adAg = {}, adPub = {}, adOm = {};
async function adLoad(){
  try{
    const [a, p, o] = await Promise.all([
      sb.from('pacientes').select('id,agenda'),
      sb.from('planes').select('paciente_id,publicado_at').order('publicado_at', {ascending: true}),
      sb.from('omisiones').select('paciente_id,fecha,motivo').gte('fecha', agAdd(todayISO(), -14))
    ]);
    adAg = {}; (a.data || []).forEach(x => { if(x.agenda) adAg[x.id] = x.agenda; });
    adPub = {}; (p.data || []).forEach(x => { if(!adPub[x.paciente_id]) adPub[x.paciente_id] = (x.publicado_at || '').slice(0, 10); });
    adOm = {}; (o.data || []).forEach(x => { (adOm[x.paciente_id] ||= []).push(x); });
  }catch(e){}
}
const _loadPatientsAd2 = loadPatients;
loadPatients = async function(){ await _loadPatientsAd2.apply(this, arguments); await adLoad(); if(typeof renderHome === 'function' && !$('#home')?.hidden) renderHome(); };
function adPct(p){
  const pub = adPub[p.id]; if(!pub) return null;
  const dias = Math.min(14, Math.round((new Date(todayISO() + 'T12:00:00') - new Date(pub + 'T12:00:00')) / 864e5));
  if(dias < 7) return null;
  const n = nDias(p.st || {}) || 3, desde = agAdd(todayISO(), -dias);
  const hechas = new Set((typeof allSes !== 'undefined' ? allSes : []).filter(s => s.paciente_id === p.id && s.fecha > desde && s.fecha <= todayISO()).map(s => s.fecha)).size;
  const esperadas = Math.max(1, Math.round(n * dias / 7));
  return {pct: Math.min(100, Math.round(100 * hechas / esperadas)), hechas, esperadas, dias};
}
function fxAttExtra(infos){
  const out = [];
  infos.forEach(i => {
    const p = i.p, om = (adOm[p.id] || []).filter(o => o.motivo !== 'entrene');
    const dol = om.filter(o => o.motivo === 'dolor' && o.fecha >= agAdd(todayISO(), -7));
    if(dol.length) out.push({k: 'y', pid: p.id, t: p.nombre, d: `No entrenó por dolor (${dol.map(o => fmtD(o.fecha)).join(', ')})`, v: 'ses'});
    const a = adPct(p);
    if(a && a.pct < 60){
      const cnt = {}; om.forEach(o => { cnt[o.motivo] = (cnt[o.motivo] || 0) + 1; });
      const mot = Object.entries(cnt).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${OM_M[k].toLowerCase()}${v > 1 ? ' ×' + v : ''}`).join(', ');
      out.push({k: 'n', pid: p.id, t: p.nombre, d: `Adherencia ${a.pct} % en ${a.dias} días (${a.hechas} de ${a.esperadas})${mot ? ' · motivos: ' + mot : ''}. Considera simplificar el plan.`, v: 'plan'});
    }
  });
  return out;
}
// En la ficha: cuándo entrena (si lo eligió)
const _renderAd2 = render;
render = function(){
  const r = _renderAd2.apply(this, arguments);
  const tags = document.querySelector('#out .fx-fhead .fx-tags'); const a = curId && adAg[curId];
  if(tags && a && !tags.querySelector('.ag-tag')) tags.insertAdjacentHTML('beforeend', `<span class="fx-tag ag-tag" title="Días, hora y lugar que eligió">${esc(agTxt(a))}</span>`);
  return r;
};
