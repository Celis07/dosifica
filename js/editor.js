/* ===================== EDITOR DEL PLAN (oct 2026) =====================
   El nombre y la nota de cada ejercicio crecen hacia abajo: nunca se cortan.
   Sugerencias del banco al escribir el nombre (reemplaza la lista del navegador). */
function growTA(t){ t.style.height = 'auto'; if(t.scrollHeight) t.style.height = t.scrollHeight + 'px'; else t.style.height = ''; }
function growAll(root){ (root || document).querySelectorAll('textarea.grow').forEach(growTA); }
const _renderEd = render;
render = function(){ const r = _renderEd.apply(this, arguments); if(editMode) requestAnimationFrame(() => growAll($('#out'))); return r; };
addEventListener('resize', () => { if(editMode) growAll($('#out')); });

const edNorm = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function edSugClose(){ document.querySelectorAll('.exsug').forEach(x => x.remove()); }
function edSug(t){
  edSugClose();
  const q = edNorm(t.value.trim()); if(q.length < 2) return;
  const all = [...new Set([...(typeof myLib !== 'undefined' ? myLib : []), ...BASE])];
  const hit = all.filter(n => edNorm(n).includes(q) && edNorm(n) !== q).sort((a, b) => edNorm(a).indexOf(q) - edNorm(b).indexOf(q) || a.length - b.length).slice(0, 6);
  if(!hit.length) return;
  const box = document.createElement('div'); box.className = 'exsug'; box.setAttribute('role', 'listbox');
  box.innerHTML = hit.map(n => `<button type="button" role="option" data-exs="${esc(n)}">${esc(n)}</button>`).join('');
  t.after(box);
  box.addEventListener('mousedown', e => {
    const b = e.target.closest('[data-exs]'); if(!b) return; e.preventDefault();
    t.value = b.dataset.exs; edSugClose();
    t.dispatchEvent(new Event('input', {bubbles: true})); t.dispatchEvent(new Event('change', {bubbles: true}));
  });
}
$('#out').addEventListener('input', e => { if(e.target.matches('textarea[data-sugx]')) edSug(e.target); });
$('#out').addEventListener('focusout', e => { if(e.target.matches('textarea[data-sugx]')) setTimeout(edSugClose, 120); });
$('#out').addEventListener('keydown', e => {
  const t = e.target; if(!t.matches || !t.matches('textarea.grow')) return;
  if(e.key === 'Escape') edSugClose();
});

/* ---------- Semana: borrador, plantillas y en blanco ---------- */
const semRev = () => !!(st.rev && st.rev[planKey(st)]) || baseWeek(st).custom;
const _renderEd2 = render;
render = function(){
  const r = _renderEd2.apply(this, arguments);
  const out = $('#out'); if(!out || view !== 'plan') return r;
  // Semana tipo: fuera (se conserva el aviso del lado sano si lo hay)
  out.querySelectorAll('section.card').forEach(c => {
    const h = c.querySelector(':scope > h3.sec, :scope .fx-ch h3, h3.sec');
    if(h && /^Semana tipo/.test(h.textContent.trim())){ const w = c.querySelector('.warnbox'); if(w) c.before(w); c.remove(); }
  });
  // Borrador: la semana sugerida no se publica sin revisarla
  const first = out.querySelector(':scope > section.card.day');
  if(first && !isExample && !semRev()) first.insertAdjacentHTML('beforebegin', `<div class="draft"><span><b>Borrador</b> Semana sugerida según fase, deporte y población. Revísala y ajústala antes de publicar.</span><button type="button" data-drok>Lo revisé</button></div>`);
  return r;
};
let blankArm = 0;
$('#out').addEventListener('click', e => {
  const q = s => e.target.closest(s); let b;
  if(q('[data-drok]')){ if(!st.rev) st.rev = {}; st.rev[planKey(st)] = true; markDirty(); render(); toast('Semana marcada como revisada'); return; }
  if(q('[data-tplopen]')){ tplOpen = true; if(typeof FX !== 'undefined') FX.open.add('plan:Plantillas'); render(); document.querySelector('.tplcard')?.scrollIntoView({behavior: 'smooth', block: 'start'}); return; }
  if((b = q('[data-blank]'))){
    if(Date.now() - blankArm > 4000){ blankArm = Date.now(); b.textContent = '¿Borrar la semana? Toca otra vez'; setTimeout(() => { if(b.isConnected) b.textContent = 'Empezar en blanco'; }, 4000); return; }
    blankArm = 0;
    if(!st.plans) st.plans = {};
    st.plans[planKey(st)] = clone(baseWeek(st).days).map(d => { delete d.rpe; d.segs = d.segs.map(sg => Object.assign({}, sg, {rows: []})); return d; });
    if(!st.rev) st.rev = {}; st.rev[planKey(st)] = true;
    editMode = true; editDay = 0; if(typeof FX !== 'undefined') FX.dayOpen.add(0); markDirty(); render();
    document.querySelector('section.day[data-day="0"]')?.scrollIntoView({block: 'start'});
  }
});
if(typeof publishPlan === 'function'){
  const _pubEd = publishPlan;
  publishPlan = async function(){
    if(!isExample && !semRev()){
      // Borrador sin revisar: se pregunta en vez de bloquear en silencio
      if(confirm('Esta semana todavía es el borrador sugerido. ¿Ya la revisaste y quieres publicarla así?')){
        if(!st.rev) st.rev = {}; st.rev[planKey(st)] = true; markDirty();
      } else {
        view = 'plan'; editMode = false; editDay = null; render();
        document.querySelector('#out .draft')?.scrollIntoView({behavior: 'smooth', block: 'center'});
        toast('Revisa la semana: edítala o toca "Lo revisé", y luego publica.'); return;
      }
    }
    return _pubEd.apply(this, arguments);
  };
}

/* ---------- Registrar y editar sesiones: ejercicios editables ----------
   El fisio puede corregir lo que se hizo (cambiar, quitar o añadir ejercicios con series, reps, kg y RPE),
   también en sesiones que ya registró la persona. */
let sesEdit = null;
function lfRows(day, ses){
  if(ses) return (ses.ex || []).map(x => ({e: x.e || '', s: x.s ?? '', reps: x.reps ?? '', kg: x.kg ?? '', rpe: x.rpe ?? ''}));
  const out = [];
  day.segs.forEach(sg => { if(sg.type === 'act') return; sg.rows.forEach(r => { if(r.e) out.push({e: r.e, s: parseInt(r.s) || '', reps: '', kg: '', rpe: '', ph: r.r || ''}); }); });
  return out;
}
const lfRowHTML = x => `<tr data-lrow><td class="e"><textarea rows="1" class="grow" data-sugx data-lf="e" autocomplete="off" aria-label="Ejercicio">${esc(x.e)}</textarea></td>
  <td><input type="number" min="0" data-lf="s" value="${esc(x.s)}" style="width:4.5em" aria-label="Series"></td>
  <td><input type="number" min="0" data-lf="reps" value="${esc(x.reps)}" placeholder="${esc(x.ph || '')}" style="width:5em" aria-label="Reps"></td>
  <td><input type="number" min="0" step="0.5" data-lf="kg" value="${esc(x.kg)}" style="width:5.5em" aria-label="kg"></td>
  <td><input type="number" min="1" max="10" data-lf="rpe" value="${esc(x.rpe)}" style="width:4.5em" aria-label="RPE"></td>
  <td class="x"><button type="button" class="xbtn" data-lxdel aria-label="Quitar ejercicio">×</button></td></tr>`;
logForm = function(day, di, ses){
  const v = (k, d) => ses ? (ses[k] ?? '') : d;
  const title = ses ? `Editar sesión · ${esc(ses.dia || '')} · ${esc(ses.fecha)}${ses.autor === 'deportista' ? ' <span class="small">(la registró la persona)</span>' : ''}` : `Registrar sesión · ${esc(day.name)}`;
  return `<div class="logf" id="logf">
    <h4>${title}</h4>
    <div class="row5">
      <label class="f">Fecha<input type="date" id="lf-fecha" value="${esc(v('fecha', todayISO()))}"></label>
      <label class="f">Duración (min)<input type="number" id="lf-min" min="0" max="300" value="${esc(v('min', 75))}"></label>
      <label class="f">RPE de la sesión (0–10)<input type="number" id="lf-srpe" min="0" max="10" value="${esc(v('srpe', 7))}"></label>
      <label class="f">Dolor durante (0–10)<input type="number" id="lf-dolor" min="0" max="10" value="${esc(v('dolor', st.dolor))}"></label>
      <label class="f">A las 24 h<select id="lf-d24">${[['', 'Aún no'], ['mejor', 'Mejor que basal'], ['igual', 'Vuelve a basal'], ['peor', 'Peor que basal']].map(([k, l]) => `<option value="${k}"${v('d24', 'igual') === k ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
    </div>
    <div class="tbl"><table class="pl lftab"><thead><tr><th>Ejercicio</th><th>Series</th><th>Reps</th><th>kg</th><th>RPE</th><th></th></tr></thead><tbody>
      ${lfRows(day, ses).map(lfRowHTML).join('')}
    </tbody></table></div>
    <div class="addrow"><button type="button" class="ghost" data-lxadd>+ Añadir ejercicio</button></div>
    <label class="f">Comentario<input type="text" id="lf-nota" value="${esc(v('nota', ''))}"></label>
    <div class="actions">${ses ? `<button class="primary" data-sesup="${esc(ses.id)}">Guardar cambios</button>` : `<button class="primary" id="lfSave" data-day="${di}">Guardar sesión</button>`}<button id="lfCancel">Cancelar</button></div>
  </div>`;
};
const _collectLogOld = collectLog;
collectLog = function(day){
  if(!document.querySelector('#logf [data-lrow]') && document.querySelector('#logf [data-lx]')) return _collectLogOld(day);   // formulario del deportista
  const n = x => { const v = num(x); return v == null ? null : v; };
  const ex = [...document.querySelectorAll('#logf [data-lrow]')].map(tr => {
    const g = k => tr.querySelector(`[data-lf="${k}"]`)?.value ?? '';
    const o = {e: g('e').trim()}; ['s', 'reps', 'kg', 'rpe'].forEach(k => { const v = n(g(k)); if(v != null) o[k] = v; }); return o;
  }).filter(x => x.e);
  const clamp = (v, a, b) => v == null ? null : Math.max(a, Math.min(b, Math.round(v)));
  const row = {fecha: $('#lf-fecha').value || todayISO(), min: clamp(num($('#lf-min').value), 0, 600), srpe: clamp(num($('#lf-srpe').value), 0, 10), dolor: clamp(num($('#lf-dolor').value), 0, 10),
    d24: $('#lf-d24').value || '', nota: ($('#lf-nota').value || '').slice(0, 2000), ex};
  if(day) row.dia = day.name;
  return row;
};
async function saveSesUp(id){
  const row = collectLog(null);
  const {data, error} = await sb.from('sesiones').update(row).eq('id', id).select('*').single();
  if(error){ toast('No se pudo guardar la sesión.'); return; }
  sessions = sessions.map(x => x.id === id ? data : x); sesEdit = null; render(); toast('Sesión actualizada');
}
$('#out').addEventListener('click', e => {
  const q = s => e.target.closest(s); let b;
  if(q('[data-lxadd]')){ const tb = document.querySelector('#logf .lftab tbody'); tb.insertAdjacentHTML('beforeend', lfRowHTML({e: '', s: '', reps: '', kg: '', rpe: ''})); tb.lastElementChild.querySelector('textarea').focus(); return; }
  if((b = q('[data-lxdel]'))){ b.closest('tr').remove(); return; }
  if((b = q('[data-editses]'))){ sesEdit = b.dataset.editses; render(); const f = document.querySelector('#logf'); f?.closest('.fx-closed')?.classList.remove('fx-closed'); if(f) growAll(f); f?.scrollIntoView({block: 'start'}); return; }
  if((b = q('[data-sesup]'))) return saveSesUp(b.dataset.sesup);
  if(q('#lfCancel') && sesEdit){ sesEdit = null; render(); }
});
const _renderEd3 = render;
render = function(){ const r = _renderEd3.apply(this, arguments); if($('#logf')) growAll($('#logf')); return r; };
document.addEventListener('click', e => { if(e.target.closest('[data-fxcc],[data-fxday]')) requestAnimationFrame(() => growAll($('#out'))); });

/* Nota bajo demanda y Enter para pasar a la casilla siguiente */
$('#out').addEventListener('click', e => {
  const b = e.target.closest('[data-addnote]'); if(!b) return;
  const [d, g, r] = b.dataset.addnote.split('|');
  b.outerHTML = `<textarea rows="1" class="grow note" data-d="${d}" data-g="${g}" data-r="${r}" data-f="n" aria-label="Nota" placeholder="Nota"></textarea>`;
  document.querySelector(`textarea[data-d="${d}"][data-g="${g}"][data-r="${r}"][data-f="n"]`)?.focus();
});
$('#out').addEventListener('keydown', e => {
  if(e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
  const t = e.target; if(!t.matches) return;
  const sel = 'section.day.editing [data-f]:not(select):not([type=checkbox]), section.day.editing [data-drpe], #logf [data-lf], #logf #lf-fecha, #logf #lf-min, #logf #lf-srpe, #logf #lf-dolor';
  if(!t.matches(sel)) return;
  if(document.querySelector('.exsug button') && t.matches('[data-sugx]')){ edSugClose(); }
  e.preventDefault();
  const scope = t.closest('section.day.editing, #logf');
  const all = [...scope.querySelectorAll(sel.split(', ').map(x => x.replace(/^section\.day\.editing |^#logf /, ':scope ')).join(', '))];
  const nx = all[all.indexOf(t) + 1];
  if(nx){ nx.focus(); if(nx.select && nx.tagName === 'INPUT') nx.select(); } else t.blur();
}, true);
