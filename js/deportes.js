/* ===================== DEPORTE: UNA SOLA LISTA (oct 2026) =====================
   En la ficha hay un solo campo "Deporte", con una lista de los deportes más comunes y la opción
   de añadir otro. De ahí salen solos:
   - st.deporte: el nombre que se muestra (ficha, portal, PDF).
   - st.deporteP: el perfil con que se planifica en el módulo Deporte (preventivos, potencia, accesorios).
   - st.perfil: el perfil de retorno deportivo de rodilla (si existe para ese deporte).
   Un deporte añadido se entrena "parecido a" uno de los perfiles que existen (por defecto, fuerza general). */
const DEP_PERF = {uwr: 'Rugby subacuático', natacion: 'Natación', futbol: 'Fútbol y campo', carrera: 'Carrera', cancha: 'Baloncesto o voleibol', raqueta: 'Raqueta', gimnasio: 'Fuerza general'};
const DEP_LIST = [
  ['Rugby subacuático', 'uwr', 'uwr'], ['Natación', 'natacion', 'natacion'], ['Fútbol', 'futbol', 'futbol'], ['Fútbol sala', 'futbol', 'futbol'],
  ['Atletismo o carrera', 'carrera', 'carrera'], ['Baloncesto', 'cancha', 'cancha'], ['Voleibol', 'cancha', 'cancha'],
  ['Tenis', 'raqueta', ''], ['Pádel', 'raqueta', ''], ['Squash', 'raqueta', ''], ['Rugby', 'futbol', 'futbol'],
  ['Ciclismo', 'gimnasio', ''], ['Gimnasio o fuerza', 'gimnasio', ''], ['CrossFit', 'gimnasio', ''], ['Artes marciales', 'gimnasio', '']
];
const DEP_NONE = 'No practica deporte';
const depNorm = t => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
function depCustom(){
  let saved = []; try{ saved = JSON.parse(LS.get('apex_deportes') || '[]'); }catch(e){}
  const known = new Set(DEP_LIST.map(d => depNorm(d[0])).concat([depNorm(DEP_NONE)])), out = [];
  const add = (l, p) => { const k = depNorm(l); if(!k || known.has(k)) return; known.add(k); out.push([l.trim(), DEP_PERF[p] ? p : 'gimnasio', ['uwr', 'natacion', 'futbol', 'carrera', 'cancha'].includes(p) ? p : '']); };
  saved.forEach(d => add(d[0], d[1]));
  (typeof patients !== 'undefined' ? patients : []).forEach(p => add(p.st?.deporte, p.st?.deporteP));
  return out.sort((a, b) => a[0].localeCompare(b[0], 'es'));
}
function depAll(){ return DEP_LIST.concat(depCustom()); }
function depFind(t){ const k = depNorm(t); return depAll().find(d => depNorm(d[0]) === k); }
function depPaint(){
  const sel = $('#deporteSel'); if(!sel) return;
  if(!(st.deporte || '').trim()){
    const pr = modOf(st) === 'deporte' && st.deporteP && st.deporteP !== 'gimnasio' ? st.deporteP : st.perfil && typeof st.perfil === 'string' ? st.perfil : '';
    const g = pr && DEP_LIST.find(d => d[1] === pr || d[2] === pr); if(g) st.deporte = g[0];
  }
  const cur = (st.deporte || '').trim(), custom = depCustom();
  const isIn = !cur || depFind(cur) || depNorm(cur) === depNorm(DEP_NONE);
  sel.innerHTML = `<option value="">Elige el deporte…</option>
    <optgroup label="Comunes">${DEP_LIST.map(d => `<option>${esc(d[0])}</option>`).join('')}</optgroup>
    ${custom.length || !isIn ? `<optgroup label="Añadidos por ti">${custom.map(d => `<option>${esc(d[0])}</option>`).join('')}${!isIn ? `<option>${esc(cur)}</option>` : ''}</optgroup>` : ''}
    <option>${DEP_NONE}</option>
    <option value="__add">+ Añadir otro deporte…</option>`;
  const f = depFind(cur);
  sel.value = !cur ? '' : depNorm(cur) === depNorm(DEP_NONE) ? DEP_NONE : f ? f[0] : cur;
  const h = $('#depHint');
  if(h){ const mo = typeof modOf === 'function' ? modOf(st) : ''; h.textContent = mo === 'deporte' && cur ? `Se planifica con el perfil: ${DEP_PERF[st.deporteP] || 'Fuerza general'}.` : ''; }
}
function depSet(label, perfDep, perfRod){
  st.deporte = label; st.deporteP = DEP_PERF[perfDep] ? perfDep : 'gimnasio'; st.perfil = perfRod || '';
  depPaint(); if(typeof syncVisibility === 'function') syncVisibility();
  markDirty(); render();
}
$('#form').addEventListener('change', e => {
  if(e.target.id !== 'deporteSel') return;
  const v = e.target.value;
  if(v === '__add'){
    $('#depAdd').hidden = false;
    $('#depLike').innerHTML = Object.entries(DEP_PERF).map(([k, l]) => `<option value="${k}"${k === 'gimnasio' ? ' selected' : ''}>${esc(l)}</option>`).join('');
    $('#depNew').value = ''; $('#depNew').focus();
    e.target.value = st.deporte ? (depFind(st.deporte)?.[0] || st.deporte) : '';
    return;
  }
  $('#depAdd').hidden = true;
  if(!v) return depSet('', 'gimnasio', '');
  if(v === DEP_NONE) return depSet(DEP_NONE, 'gimnasio', '');
  const d = depFind(v) || [v, 'gimnasio', '']; depSet(d[0], d[1], d[2]);
});
$('#form').addEventListener('click', e => {
  if(e.target.id === 'depNo'){ $('#depAdd').hidden = true; return; }
  if(e.target.id !== 'depOk') return;
  const n = ($('#depNew').value || '').trim().replace(/\s+/g, ' ');
  if(!n){ toast('Escribe el nombre del deporte.'); $('#depNew').focus(); return; }
  const ex = depFind(n);
  if(ex){ $('#depAdd').hidden = true; return depSet(ex[0], ex[1], ex[2]); }
  const p = $('#depLike').value || 'gimnasio';
  let saved = []; try{ saved = JSON.parse(LS.get('apex_deportes') || '[]'); }catch(_){}
  saved.push([n.charAt(0).toUpperCase() + n.slice(1), p]); try{ LS.set('apex_deportes', JSON.stringify(saved)); }catch(_){}
  $('#depAdd').hidden = true;
  depSet(n.charAt(0).toUpperCase() + n.slice(1), p, ['uwr', 'natacion', 'futbol', 'carrera', 'cancha'].includes(p) ? p : '');
});
$('#form').addEventListener('keydown', e => { if(e.target.id === 'depNew' && e.key === 'Enter'){ e.preventDefault(); $('#depOk').click(); } });
const _fillDep = fillForm;
fillForm = function(){ _fillDep.apply(this, arguments); depPaint(); const a = $('#depAdd'); if(a) a.hidden = true; };
depPaint();
