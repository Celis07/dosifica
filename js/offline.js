/* ===================== SIN INTERNET (portal del deportista) =====================
   - Copia local del plan, sesiones, solicitudes y bienestar para abrir el portal sin red.
   - Lo que se registra sin red (sesiones, respuesta de 24 h, bienestar) queda en una cola
     en el teléfono y se envía solo cuando vuelve la conexión.
   - El panel del fisio necesita internet. */
const OB_KEY = 'apex_outbox';
const isNetErr = err => !navigator.onLine || /fetch|network|load failed|timeout|abort/i.test((err && (err.message || err.details || String(err))) || '');
const obGet = () => { try{ return JSON.parse(LS.get(OB_KEY) || '[]'); }catch(e){ return []; } };
const obSet = a => { LS.set(OB_KEY, a.length ? JSON.stringify(a) : null); netBadge(); };
const localId = () => 'local-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* Escribe en Supabase; si no hay red, encola y responde con la fila local. */
async function sbWrite(op, table, row, opt){
  opt = opt || {};
  // Actualizar una fila que aún está en la cola: se modifica en la cola.
  if(op === 'update' && String(opt.id || '').startsWith('local-')){
    const ob = obGet(), it = ob.find(x => x.row && x.row._lid === opt.id);
    if(it){ Object.assign(it.row, row); obSet(ob); return {data: Object.assign({}, it.row, {id: opt.id, _local: true}), queued: true}; }
  }
  if(navigator.onLine){
    try{
      let q = sb.from(table);
      q = op === 'insert' ? q.insert(row) : op === 'upsert' ? q.upsert(row, {onConflict: opt.onConflict}) : q.update(row).eq('id', opt.id);
      const res = op === 'update' ? await q : await q.select('*').single();
      if(!res.error) return {data: res.data || Object.assign({id: opt.id}, row)};
      if(!isNetErr(res.error)) return {error: res.error};
    }catch(e){ if(!isNetErr(e)) return {error: e}; }
  }
  const lid = op === 'update' ? opt.id : localId();
  const ob = obGet(); ob.push({op, table, row: Object.assign({}, row, op === 'update' ? {} : {_lid: lid}), id: opt.id || null, onConflict: opt.onConflict || null, t: Date.now(), n: 0});
  obSet(ob);
  return {data: Object.assign({}, row, {id: lid, _local: true}), queued: true};
}

let obBusy = false;
async function flushOutbox(){
  if(obBusy || !navigator.onLine) return; const ob = obGet(); if(!ob.length) return;
  obBusy = true; netBadge('sync');
  let sent = 0, left = [];
  for(let i = 0; i < ob.length; i++){
    const it = ob[i], row = Object.assign({}, it.row); const lid = row._lid; delete row._lid;
    try{
      let q = sb.from(it.table);
      q = it.op === 'insert' ? q.insert(row) : it.op === 'upsert' ? q.upsert(row, {onConflict: it.onConflict}) : q.update(row).eq('id', it.id);
      const res = it.op === 'update' ? await q : await q.select('*').single();
      if(res.error){
        if(isNetErr(res.error)){ left = ob.slice(i); break; }
        it.n = (it.n || 0) + 1; if(it.n < 5) left.push(it); else toast('No se pudo enviar un registro guardado sin conexión.');
        continue;
      }
      sent++;
      if(lid && res.data){ // reemplaza la fila local por la del servidor
        if(it.table === 'sesiones') sessions = sessions.map(s => s.id === lid ? res.data : s);
        if(it.table === 'bienestar') wellness = wellness.map(w => w.id === lid ? res.data : w);
      }
    }catch(e){ if(isNetErr(e)){ left = ob.slice(i); break; } left.push(it); }
  }
  obSet(left); obBusy = false; netBadge();
  if(sent){ toast(sent === 1 ? 'Se envió 1 registro guardado sin conexión' : `Se enviaron ${sent} registros guardados sin conexión`); if(me.role === 'deportista'){ cacheAthlete(); renderAthlete(); } }
}

/* Filas pendientes en la cola que deben verse en el portal */
function pendingRows(table){ return obGet().filter(x => x.table === table && x.op !== 'update').map(x => Object.assign({}, x.row, {id: x.row._lid, _local: true})); }

/* Copia local de lo que el deportista ve */
const CA_KEY = () => 'apex_cache_' + (me.uid || '');
function cacheAthlete(){
  if(!A.p) return;
  try{ LS.set(CA_KEY(), JSON.stringify({p: A.p, plan: A.plan, consent: A.consent, sessions: sessions.filter(s => !s._local), solicitudes, wellness: wellness.filter(w => !w._local), t: Date.now()})); }catch(e){}
  LS.set('apex_last', JSON.stringify({uid: me.uid, email: me.email, role: 'deportista'}));
}
function loadAthleteCache(uid){ try{ return JSON.parse(LS.get('apex_cache_' + uid) || 'null'); }catch(e){ return null; } }
function applyAthleteCache(c){
  A.p = c.p; A.plan = c.plan; A.consent = c.consent; solicitudes = c.solicitudes || [];
  sessions = [...pendingRows('sesiones'), ...(c.sessions || [])];
  wellness = [...pendingRows('bienestar'), ...(c.wellness || [])];
}
/* Abre el portal desde la copia local (sin red o sin poder renovar la sesión) */
function startAthleteOffline(uid, email){
  const c = loadAthleteCache(uid); if(!c) return false;
  me.uid = uid; me.email = email || me.email; me.role = 'deportista';
  applyAthleteCache(c); st.dolor = 0;
  $('#login').hidden = true; $('#fisioApp').hidden = true; $('#athleteApp').hidden = false;
  renderAthlete(); netBadge(); return true;
}

/* Indicador de conexión */
function netBadge(mode){
  let el = $('#netState');
  if(!el){ el = document.createElement('div'); el.id = 'netState'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
  const n = obGet().length, off = !navigator.onLine;
  if(!off && !n && mode !== 'sync'){ el.hidden = true; return; }
  el.hidden = false; el.className = off ? 'off' : 'sync';
  el.textContent = off ? (n ? `Sin conexión · ${n} pendiente${n > 1 ? 's' : ''} de enviar` : 'Sin conexión · trabajando con la copia guardada')
    : mode === 'sync' ? 'Enviando registros guardados…' : `${n} pendiente${n > 1 ? 's' : ''} de enviar`;
}
window.addEventListener('online', () => { netBadge(); flushOutbox(); });
window.addEventListener('offline', () => netBadge());
setInterval(() => { if(obGet().length) flushOutbox(); }, 60000);

/* Service worker: la app abre sin internet */
if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')){
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
