/* ===================== PANEL DEL FISIO SIN INTERNET (nov 2026) =====================
   - Con internet: cada vez que se cargan los usuarios queda una copia en el celular (fichas y biblioteca).
   - Sin internet: la app abre el panel con esa copia; se puede abrir fichas y editar planes.
     Guardar deja el cambio en el celular (cola por usuario: solo cuenta el último estado de cada ficha).
   - Al volver la conexión (o al abrir la app con internet) se sube todo: la ficha y el plan que ve el usuario.
   - Sin internet no se puede crear un usuario nuevo ni publicar: se avisa y lo demás queda guardado. */
const FXO = {cache: 'apex_fx_cache', pend: 'apex_fx_pend', busy: false};
const fxoGet = k => { try{ return JSON.parse(LS.get(k) || 'null'); }catch(e){ return null; } };
const fxoSet = (k, v) => { try{ LS.set(k, v == null ? null : JSON.stringify(v)); }catch(e){ console.error('copia local', e); } };
const fxoPend = () => fxoGet(FXO.pend) || {};
const fxoOffline = () => !navigator.onLine;

/* ---------- Copia local ---------- */
function fxoGuardarCopia(){
  if(me.role !== 'fisio' || !patients.length) return;
  fxoSet(FXO.cache, {email: me.email, t: Date.now(), patients: patients.map(p => ({id: p.id, nombre: p.nombre, email: p.email, st: p.st, updated: p.updated, rx: p.rx || []})), lib: myLib, meta: myMeta});
}
function fxoCopia(email){ const c = fxoGet(FXO.cache); return c && (!email || c.email === String(email).toLowerCase()) ? c : null; }
function fxoAplicarCopia(c){
  const pend = fxoPend();
  patients = (c.patients || []).map(p => pend[p.id] ? Object.assign({}, p, {st: pend[p.id].st, nombre: pend[p.id].row.nombre}) : p);
  if(Array.isArray(c.lib)) myLib = c.lib;
  if(c.meta) myMeta = c.meta;
  try{ buildBanco(); renderLib(); }catch(e){}
}

const _loadPatientsFxo = loadPatients;
loadPatients = async function(){
  if(fxoOffline()){ const c = fxoCopia(me.email); if(c) fxoAplicarCopia(c); return; }
  const r = await _loadPatientsFxo.apply(this, arguments);
  if(patients.length) fxoGuardarCopia();
  return r;
};

/* ---------- Abrir el panel sin internet ---------- */
function startFisioOffline(email){
  const c = fxoCopia(email); if(!c) return false;
  me.email = c.email; me.role = 'fisio';
  fxoAplicarCopia(c);
  $('#login').hidden = true; $('#athleteApp').hidden = true; $('#fisioApp').hidden = false;
  try{ $('#who').textContent = me.email; }catch(e){}
  render(); renderSel(); showHome(); fxoBadge();
  toast('Sin conexión: trabajas con la copia del celular. Se sube todo al conectarte.');
  return true;
}
const _routeFxo = route;
route = async function(session){
  const em = (session?.user?.email || '').toLowerCase();
  if(fxoOffline() && fxoCopia(em) && startFisioOffline(em)) return;
  return _routeFxo.apply(this, arguments);
};
const _startAthleteOfflineFxo = startAthleteOffline;
startAthleteOffline = function(uid, email){
  if(fxoCopia(email) && startFisioOffline(email)) return true;
  return _startAthleteOfflineFxo.apply(this, arguments);
};
const _showLoginFxo = showLogin;
showLogin = function(){
  if(fxoOffline() && me.role !== 'deportista' && fxoCopia() && startFisioOffline()) return;
  return _showLoginFxo.apply(this, arguments);
};

/* ---------- Guardar sin internet ---------- */
function fxoGuardarLocal(){
  const name = (st.nombre || '').trim();
  if(!name || !curId || isExample) return false;
  const email = (st.email || '').trim().toLowerCase();
  const estado = clone(st); delete estado.email; delete estado.consent;
  const pend = fxoPend(); pend[curId] = {row: {nombre: name, email: email || null, estado, consent: !!st.consent}, st: clone(st), t: Date.now()};
  fxoSet(FXO.pend, pend);
  const i = patients.findIndex(x => x.id === curId);
  if(i >= 0) patients[i] = Object.assign({}, patients[i], {nombre: name, email, st: clone(st)});
  fxoGuardarCopia();
  $('#saveState').textContent = 'Guardado en el celular · se sube al conectarte';
  fxoBadge(); return true;
}
const _saveFxo = save;
save = async function(quiet){
  if(fxoOffline()){
    if(!curId){ if(!quiet) toast('Para crear un usuario nuevo necesitas internet.'); return; }
    if(fxoGuardarLocal() && !quiet) toast('Guardado en el celular. Se sube al conectarte.');
    return;
  }
  const r = await _saveFxo.apply(this, arguments);
  // se cayó la conexión justo al guardar
  if(/No se pudo guardar/.test($('#saveState')?.textContent || '') && fxoOffline()) fxoGuardarLocal();
  else if(curId){ const pend = fxoPend(); if(pend[curId]){ delete pend[curId]; fxoSet(FXO.pend, pend); fxoBadge(); } fxoGuardarCopia(); }
  return r;
};
const _publishFxo = publishPlan;
publishPlan = async function(){
  if(fxoOffline()){ await save(true); toast('Para publicar necesitas internet. Tus cambios quedaron guardados en el celular.'); return; }
  return _publishFxo.apply(this, arguments);
};

/* ---------- Subir al volver la conexión ---------- */
async function fxoSubir(){
  if(FXO.busy || fxoOffline() || me.role !== 'fisio') return;
  const pend = fxoPend(), ids = Object.keys(pend); if(!ids.length) return;
  FXO.busy = true; let ok = 0;
  try{
    for(const id of ids){
      const it = pend[id];
      const {data, error} = await sb.from('pacientes').update(it.row).eq('id', id).select('id,updated_at').single();
      if(error){ if(typeof isNetErr === 'function' && isNetErr(error)) break; console.error('subir ficha', error); continue; }
      const p = patients.find(x => x.id === id); if(p) p.updated = data.updated_at;
      await fxoSyncPlan(id, it.st);
      const now = fxoPend(); if(now[id] && now[id].t === it.t) delete now[id]; fxoSet(FXO.pend, now);
      ok++;
    }
  }finally{ FXO.busy = false; fxoBadge(); }
  if(ok){ fxoGuardarCopia(); toast(ok === 1 ? 'Se subió el cambio que hiciste sin conexión.' : `Se subieron ${ok} fichas que editaste sin conexión.`); }
}
/* Actualiza el plan que ve el usuario con el estado guardado (igual que sincro.js, para cualquier ficha) */
async function fxoSyncPlan(id, estado){
  let contenido, ph;
  const s0 = st, c0 = curId;
  try{ st = Object.assign(blank(), clone(estado)); curId = id; const r = planContenido(); contenido = r.contenido; ph = r.ph; }
  catch(e){ console.error('plan sin conexión', e); return; }
  finally{ st = s0; curId = c0; }
  const {data: pl} = await sb.from('planes').select('id,contenido').eq('paciente_id', id).order('publicado_at', {ascending: false}).limit(1);
  if(!pl?.length) return;   // nunca publicado: no se crea nada
  const nuevo = Object.assign({}, contenido); if(pl[0].contenido?.casa && !nuevo.casa) nuevo.casa = pl[0].contenido.casa;
  await sb.from('planes').update({contenido: nuevo, semana: nuevo.semana, fase: ph.name, titulo: `Semana ${nuevo.semana}`}).eq('id', pl[0].id);
  try{ SYNC.sig[id] = syncSig(contenido); }catch(e){}
}
window.addEventListener('online', () => { fxoBadge(); setTimeout(fxoSubir, 800); });
window.addEventListener('offline', () => fxoBadge());
document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') fxoSubir(); });
setTimeout(fxoSubir, 4000);

/* ---------- Aviso de conexión en el panel ---------- */
function fxoBadge(){
  if(me.role !== 'fisio') return;
  let el = $('#fxNet');
  if(!el){ el = document.createElement('div'); el.id = 'fxNet'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
  const n = Object.keys(fxoPend()).length, off = fxoOffline();
  el.hidden = !off && !n;
  el.className = off ? 'off' : 'up';
  el.textContent = off ? (n ? `Sin conexión · ${n} ${n === 1 ? 'ficha' : 'fichas'} por subir` : 'Sin conexión · trabajas en el celular') : `Subiendo ${n} ${n === 1 ? 'ficha' : 'fichas'}…`;
}
