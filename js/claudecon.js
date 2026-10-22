/* ===================== CONECTOR CON CLAUDE (oct 2026) =====================
   Cuenta → Conectar con Claude: cada fisio crea su enlace personal y lo agrega en Claude como conector.
   Claude ve sus usuarios y su último plan, y PROPONE semanas. Las propuestas llegan a la ficha como pendientes:
   el fisio las revisa y las acepta o rechaza. Nada se publica solo. */
const CC_URL = 'https://pxttepssphezwptpgdvw.supabase.co/functions/v1/claude-mcp/';
let ccActiva = null, ccNueva = '', ccProp = {}, ccPendBy = {};
async function ccEstado(){ try{ const {data} = await sb.from('claude_llaves').select('id,created_at,usada_at').eq('revocada', false).limit(1); ccActiva = (data || [])[0] || null; }catch(e){ ccActiva = null; } }
async function ccPendientes(){
  try{ const {data} = await sb.from('plan_propuestas').select('paciente_id').eq('estado', 'pendiente'); ccPendBy = {}; (data || []).forEach(x => { ccPendBy[x.paciente_id] = (ccPendBy[x.paciente_id] || 0) + 1; }); }catch(e){}
}
const _loadPatientsCc = loadPatients;
loadPatients = async function(){ const r = await _loadPatientsCc.apply(this, arguments); await Promise.all([ccEstado(), ccPendientes()]); return r; };

function ccSec(){
  const url = ccNueva ? CC_URL + ccNueva : '';
  return `<section class="fx-sec fx-claude"><h2>Conectar con Claude</h2><div class="fx-w cc-w">
    ${ccNueva ? `<p><b>Tu enlace personal</b> (solo se muestra esta vez; trátalo como una contraseña):</p>
      <div class="cc-url"><code>${esc(url)}</code><button type="button" class="primary" data-cc="copiar">Copiar</button></div>
      <ol class="cc-pasos"><li>En Claude: <b>Configuración → Conectores → Agregar conector personalizado</b>.</li><li>Nombre: <b>Ápex</b>. URL: pega el enlace. Guarda.</li>
      <li>En un chat, actívalo y pídele, por ejemplo: <i>"Con Ápex, mira a Gabriel y proponle la próxima semana como progresión de este PDF"</i>.</li>
      <li>La propuesta te llega a su ficha en <b>Plan</b>: la revisas y la aceptas o la rechazas.</li></ol>
      <button type="button" data-cc="listo">Listo</button>`
    : ccActiva ? `<p>Conectado${ccActiva.usada_at ? ` · último uso ${esc(fmtD(String(ccActiva.usada_at).slice(0, 10)))}` : ' · aún sin usar'}.</p>
      <p class="small">Claude puede ver tus usuarios, su último plan y sus sesiones, y proponer semanas. No puede publicar ni cambiar nada sin que tú lo aceptes. Los datos que lee van a tu cuenta de Claude.</p>
      <div class="actions"><button type="button" data-cc="crear">Crear enlace nuevo</button><button type="button" class="cc-off" data-cc="off">Desconectar</button></div>`
    : `<p>Planifica en Claude y que la propuesta llegue sola a la ficha de la persona, para que la revises.</p>
      <p class="small">Claude podrá ver tus usuarios, su último plan y sus sesiones. Solo propone: tú aceptas o rechazas.</p>
      <div class="actions"><button type="button" class="primary" data-cc="crear">Crear mi enlace</button></div>`}
  </div></section>`;
}
const _renderHomeCc = renderHome;
renderHome = function(){
  const r = _renderHomeCc.apply(this, arguments);
  if(typeof FX !== 'undefined' && FX.tab === 'cuenta' && !document.querySelector('#home .fx-claude')){
    const herr = [...document.querySelectorAll('#home .fx-sec')].find(s => /Herramientas/.test(s.querySelector('h2')?.textContent || ''));
    herr ? herr.insertAdjacentHTML('afterend', ccSec()) : document.querySelector('#home .fx-page')?.insertAdjacentHTML('beforeend', ccSec());
  }
  return r;
};

/* ---------- Propuesta pendiente en la ficha ---------- */
async function ccCargarProp(pid){
  const {data} = await sb.from('plan_propuestas').select('id,dias,resumen,created_at').eq('paciente_id', pid).eq('estado', 'pendiente').order('created_at', {ascending: false}).limit(1);
  ccProp[pid] = (data || [])[0] || null;
}
function ccPropHTML(p){
  return `<section class="card cc-prop"><span class="fx-eye">Propuesta de Claude · ${esc(fmtD(String(p.created_at).slice(0, 10)))}</span><h3 class="sec" style="margin:4px 0 6px">Semana nueva por revisar</h3>
    ${p.resumen ? `<p class="cc-res">${esc(p.resumen)}</p>` : ''}
    ${p.dias.map(d => `<div class="cp-d"><b>${esc(d.name)}${d.rpe ? ` · RPE ${esc(d.rpe)}` : ''}</b>${d.segs.filter(sg => sg.rows.length).map(sg => `<p><i>${CP_SEG[sg.type]}${sg.fmt?.t === 'inter' ? ` (${sg.fmt.a}:${sg.fmt.b} × ${sg.fmt.c})` : ''}:</i> ${sg.rows.map(r => esc(`${r.e}${r.s || r.r ? ` ${r.s}${r.s && r.r ? '×' : ''}${r.r}` : ''}`)).join(' · ')}</p>`).join('')}</div>`).join('')}
    <div class="actions"><button type="button" class="primary" data-ccp="si|${esc(p.id)}">Aceptar y editar</button><button type="button" data-ccp="no|${esc(p.id)}">Rechazar</button></div>
    <p class="small">Al aceptar, reemplaza la semana actual de esta persona. Luego la ajustas y la publicas como siempre.</p></section>`;
}
const _renderCc = render;
render = function(){
  const r = _renderCc.apply(this, arguments);
  if(view === 'plan' && curId && !isExample){
    if(!(curId in ccProp)){ const id = curId; ccProp[id] = null; ccCargarProp(id).then(() => { if(curId === id && ccProp[id]) render(); }); }
    const p = ccProp[curId];
    if(p && !document.querySelector('#out .cc-prop')){ const ph = document.querySelector('#out .fx-phase'); ph ? ph.insertAdjacentHTML('afterend', ccPropHTML(p)) : $('#out').insertAdjacentHTML('afterbegin', ccPropHTML(p)); }
  }
  return r;
};

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-cc],[data-ccp]'); if(!b) return;
  if(b.dataset.cc){
    const k = b.dataset.cc;
    if(k === 'crear'){ b.disabled = true; const {data, error} = await sb.rpc('crear_llave_claude'); b.disabled = false; if(error || !data){ toast('No se pudo crear el enlace.'); return; } ccNueva = data; await ccEstado(); renderHome(); return; }
    if(k === 'copiar'){ try{ await navigator.clipboard.writeText(CC_URL + ccNueva); toast('Enlace copiado'); }catch(x){ toast('Mantén presionado el enlace para copiarlo.'); } return; }
    if(k === 'listo'){ ccNueva = ''; renderHome(); return; }
    if(k === 'off'){ if(!b.dataset.arm){ b.dataset.arm = '1'; b.textContent = '¿Seguro? Toca otra vez'; return; } await sb.rpc('revocar_llave_claude'); ccActiva = null; renderHome(); toast('Claude desconectado. El enlace ya no funciona.'); return; }
  }
  if(b.dataset.ccp){
    const [k, id] = b.dataset.ccp.split('|'), p = ccProp[curId]; if(!p || p.id !== id) return;
    b.disabled = true;
    const {error} = await sb.from('plan_propuestas').update({estado: k === 'si' ? 'aceptada' : 'rechazada', revisada_at: new Date().toISOString()}).eq('id', id);
    b.disabled = false;
    if(error){ toast('No se pudo guardar. Revisa tu conexión.'); return; }
    if(k === 'si'){
      st.dias = String(Math.max(1, Math.min(6, p.dias.length)));
      if(!st.plans) st.plans = {};
      st.plans[planKey(st)] = clone(p.dias);
      if(!st.rev) st.rev = {}; st.rev[planKey(st)] = true;
      fillForm(); markDirty();
    }
    ccProp[curId] = null; ccPendBy[curId] = 0; render();
    toast(k === 'si' ? 'Propuesta aceptada. Revísala día por día y publícala.' : 'Propuesta rechazada.');
  }
});

/* ---------- En "Requiere atención" ---------- */
if(typeof fxAttExtra === 'function'){
  const _attCc = fxAttExtra;
  fxAttExtra = function(infos){
    const out = _attCc.apply(this, arguments);
    infos.forEach(i => { if(ccPendBy[i.p.id]) out.unshift({k: 'b', pid: i.p.id, t: i.p.nombre, d: 'Claude propuso una semana nueva: revísala', v: 'plan'}); });
    return out;
  };
}
