/* ===================== PLAN SIEMPRE AL DÍA EN LA APP DEL USUARIO (oct 2026) =====================
   Cada vez que la ficha se guarda (por ejemplo, Guardar en un día editado), el plan que ve el usuario
   se actualiza solo: se reescribe su último plan publicado con lo que tiene el fisio. No crea un plan
   nuevo ni manda notificación (eso sigue siendo "Publicar", que cuenta como nueva semana).
   Si el usuario todavía no tiene ningún plan publicado, no se crea nada: la primera vez se publica. */

const SYNC = {sig: {}, t: null, busy: false, again: false};
const syncSig = c => JSON.stringify([c.dias, c.fase, c.semana, c.objetivo, c.evitar, c.tools, c.meso, c.semanas, c.condicion, c.rehab, c.vivo]);
async function syncPublicado(){
  if(!curId || isExample || editMode || typeof planContenido !== 'function') return;   // a mitad de edición no se manda nada
  if(SYNC.busy){ SYNC.again = true; return; }
  SYNC.busy = true;
  const id = curId;
  try{
    const {contenido, ph} = planContenido(), sig = syncSig(contenido);
    if(SYNC.sig[id] === sig) return;
    const {data: pl, error} = await sb.from('planes').select('id,contenido').eq('paciente_id', id).order('publicado_at', {ascending: false}).limit(1);
    if(error || !pl?.length || id !== curId) return;
    const prev = pl[0].contenido || {};
    if(syncSig(prev) === sig){ SYNC.sig[id] = sig; return; }
    const nuevo = Object.assign({}, contenido);
    if(prev.casa && !nuevo.casa) nuevo.casa = prev.casa;      // el trabajo en casa se conserva
    const {error: e2} = await sb.from('planes').update({contenido: nuevo, semana: nuevo.semana, fase: ph.name, titulo: `Semana ${nuevo.semana}`}).eq('id', pl[0].id);
    if(e2){ $('#saveState').textContent = 'Guardado · no se pudo actualizar en su app'; return; }
    SYNC.sig[id] = sig;
    if(id === curId) $('#saveState').textContent = 'Guardado · actualizado en su app';
  }catch(e){ console.error('sync plan', e); }
  finally{ SYNC.busy = false; if(SYNC.again){ SYNC.again = false; syncPublicado(); } }
}
const _saveSync = save;
save = async function(){
  const r = await _saveSync.apply(this, arguments);
  if(curId && !isExample){ clearTimeout(SYNC.t); SYNC.t = setTimeout(syncPublicado, 400); }
  return r;
};
// Publicar deja la firma al día para no reescribir lo recién publicado
const _publishSync = publishPlan;
publishPlan = async function(){ const r = await _publishSync.apply(this, arguments); try{ if(curId) SYNC.sig[curId] = syncSig(planContenido().contenido); }catch(e){} return r; };
